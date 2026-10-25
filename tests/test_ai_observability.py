"""Synthetic provider replies only. No credentials or paid network calls."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import json

import httpx
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db import Base
from app.integrations import openai, claude
from app.models import AICall, AIUsage, Configuration
from app.services.ai_observability import observe_call, capture_usage, mark_request, TOKEN_FIELDS


@pytest.mark.parametrize('provider,usage,expected', [
    ('openai', {'input_tokens': 101, 'output_tokens': 23, 'total_tokens': 124,
        'input_tokens_details': {'cached_tokens': 9, 'cache_write_tokens': 3}}, (101, 23, 124, 9, 3)),
    ('claude', {'input_tokens': 31, 'output_tokens': 7, 'cache_read_input_tokens': 13,
        'cache_creation_input_tokens': 19}, (31, 7, None, 13, 19)),
    ('openai', {}, (None, None, None, None, None)),
    ('claude', {'input_tokens': 0, 'output_tokens': 0}, (0, 0, None, None, None)),
])
def test_usage_is_only_reported_metadata(db, provider, usage, expected):
    with observe_call(db, provider, 'insights_analysis', 'demo'):
        mark_request()
        capture_usage({'usage': usage, 'secret': 'NEVER_STORE_THIS'}, provider)
    record = db.scalar(select(AICall))
    assert tuple(getattr(record, name) for name in TOKEN_FIELDS) == expected
    assert record.provider == provider and record.status == 'success'
    assert record.model == (openai.MODEL if provider == 'openai' else claude.MODEL)
    assert record.operation == 'insights_analysis' and record.scope == 'demo'
    assert record.attempted and record.latency_ms >= 0
    assert 'NEVER_STORE_THIS' not in str(record.__dict__)
    assert db.scalar(select(AIUsage)) is None  # Observation never reserves quota.


@pytest.mark.parametrize('bad', [None, -1, 1.5, '42', True, 2**63, {}, []])
def test_malformed_counts_remain_unknown(db, bad):
    with observe_call(db, 'openai', 'priorities', 'real'):
        capture_usage({'usage': dict.fromkeys(TOKEN_FIELDS, bad)}, 'openai')
    record = db.scalar(select(AICall))
    assert all(getattr(record, field) is None for field in TOKEN_FIELDS)


@pytest.mark.parametrize('provider', [openai, claude])
def test_adapter_captures_real_response_envelope_without_body(db, monkeypatch, provider):
    original = httpx.Client
    def respond(request):
        assert request.method == 'GET'
        return httpx.Response(200, json={'id': provider.MODEL,
            'usage': {'input_tokens': 12, 'output_tokens': 4}, 'private': 'DO_NOT_KEEP'})
    monkeypatch.setattr(provider.httpx, 'Client', lambda **kw: original(**kw, transport=httpx.MockTransport(respond)))
    name = 'openai' if provider is openai else 'claude'
    with observe_call(db, name, 'connection_check'):
        provider.verify_key('synthetic-key')
    record = db.scalar(select(AICall))
    assert record.input_tokens == 12 and record.output_tokens == 4
    assert record.attempted and record.scope is None
    assert not {'prompt', 'response', 'key', 'payload', 'error'} & set(record.__table__.columns.keys())
    assert 'DO_NOT_KEEP' not in str(record.__dict__)


@pytest.mark.parametrize('kind,status', [('timeout', 'timeout'), ('denied', 'error'), ('invalid_json', 'error')])
def test_failure_metadata_is_sanitized_and_no_retry(db, monkeypatch, kind, status):
    original = httpx.Client
    calls = []
    def respond(request):
        calls.append(request)
        if kind == 'timeout':
            raise httpx.ReadTimeout('SENSITIVE_ERROR_BODY')
        return httpx.Response(401 if kind == 'denied' else 200, content=b'SENSITIVE_ERROR_BODY')
    monkeypatch.setattr(openai.httpx, 'Client', lambda **kw: original(**kw, transport=httpx.MockTransport(respond)))
    with pytest.raises(openai.AIError):
        with observe_call(db, 'openai', 'connection_check'):
            openai.verify_key('synthetic-secret')
    db.rollback()
    record = db.scalar(select(AICall))
    assert record.status == status and record.attempted
    assert record.input_tokens is None and record.output_tokens is None
    assert len(calls) == 1
    assert 'SENSITIVE_ERROR_BODY' not in str(record.__dict__)


def test_gateway_rejection_records_no_http_attempt(db, monkeypatch):
    def forbidden(**kwargs):
        pytest.fail('Privacy rejection must precede client creation')
    monkeypatch.setattr(openai.httpx, 'Client', forbidden)
    with pytest.raises(openai.AIError):
        with observe_call(db, 'openai', 'priorities', 'demo'):
            openai.request('POST', '/responses', 'synthetic', {'input': '{"unapproved":"private"}'})
    record = db.scalar(select(AICall))
    assert record.status == 'error' and record.attempted is False


def test_contexts_do_not_mix_between_threads_or_commit_domain_data(tmp_path):
    engine = create_engine('sqlite:///' + (tmp_path / 'observations.db').as_posix())
    Base.metadata.create_all(engine)
    gate = Barrier(2)
    def work(provider, count):
        with Session(engine) as db:
            # A reader transaction and an unflushed domain mutation remain owned by caller.
            db.scalar(select(Configuration))
            db.add(Configuration(scope='demo' if provider == 'openai' else 'real', localities=[]))
            with observe_call(db, provider, 'insights_analysis', 'demo'):
                gate.wait(timeout=5)
                mark_request()
                capture_usage({'usage': {'input_tokens': count}}, provider)
                gate.wait(timeout=5)
            db.rollback()
    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(work, 'openai', 11)
            second = pool.submit(work, 'claude', 29)
            first.result(timeout=10)
            second.result(timeout=10)
        with Session(engine) as db:
            records = list(db.scalars(select(AICall)))
            assert {(r.provider, r.input_tokens) for r in records} == {('openai', 11), ('claude', 29)}
            assert db.scalar(select(Configuration)) is None
    finally:
        engine.dispose()


def test_context_is_reset_after_error(db):
    with pytest.raises(ValueError):
        with observe_call(db, 'openai', 'priorities', 'demo'):
            capture_usage({'usage': {'input_tokens': 19}}, 'openai')
            raise ValueError('not stored')
    capture_usage({'usage': {'input_tokens': 999}}, 'openai')
    with observe_call(db, 'claude', 'priorities', 'real'):
        pass
    records = list(db.scalars(select(AICall).order_by(AICall.id)))
    assert records[0].input_tokens == 19 and records[0].status == 'error'
    assert records[1].input_tokens is None and records[1].status == 'success'


@pytest.mark.parametrize('provider', [openai, claude])
def test_generation_envelope_records_tokens_and_rejects_invalid_model_output(db, monkeypatch, provider):
    original = httpx.Client
    seen = []
    def respond(request):
        seen.append(request)
        assert request.method == 'POST'
        usage = {'input_tokens': 44, 'output_tokens': 6}
        if provider is openai:
            payload = {'status': 'completed', 'usage': usage,
                'output': [{'type': 'message', 'content': [{'type': 'output_text', 'text': 'invalid json'}]}]}
        else:
            payload = {'stop_reason': 'end_turn', 'usage': usage, 'content': [{'type': 'text', 'text': 'invalid json'}]}
        return httpx.Response(200, json=payload)
    monkeypatch.setattr(provider.httpx, 'Client', lambda **kw: original(**kw, transport=httpx.MockTransport(respond)))
    content = json.dumps([{'id': 1, 'category': 'campanhas', 'current': {'cost': 1}, 'previous': {}, 'areas': {}}])
    name = 'openai' if provider is openai else 'claude'
    with pytest.raises(openai.AIError):
        with observe_call(db, name, 'priorities', 'demo'):
            provider.prioritize('synthetic-key', json.loads(content))
    record = db.scalar(select(AICall))
    assert record.input_tokens == 44 and record.output_tokens == 6
    assert record.status == 'error' and record.attempted
    assert len(seen) == 1  # Invalid content is not retried; its usage is retained.


def test_telemetry_outage_does_not_retry_or_replace_original_result(db, monkeypatch, caplog):
    from app.services import ai_observability
    def unavailable(**kwargs):
        raise SQLAlchemyError('SENSITIVE_DATABASE_DETAILS')
    monkeypatch.setattr(ai_observability, 'Session', unavailable)
    calls = []
    with observe_call(db, 'openai', 'priorities', 'demo'):
        calls.append('one attempt')
    with pytest.raises(openai.AIError, match='original failure'):
        with observe_call(db, 'openai', 'priorities', 'demo'):
            raise openai.AIError('original failure')
    assert calls == ['one attempt']
    assert 'could not be persisted' in caplog.text
    assert 'SENSITIVE_DATABASE_DETAILS' not in caplog.text
