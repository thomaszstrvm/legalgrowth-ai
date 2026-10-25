"""Real independent sessions against disposable SQLite; no provider network."""
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from threading import Event

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.integrations import openai, claude
from app.models import AIUsage, InsightClaim, Campaign, CampaignMetric
from app.services import ai, insights
from test_ai import vault
from test_core import load
from test_insights import START, END, two_connections, draft, reviewer


@pytest.fixture
def file_sessions(tmp_path, db, two_connections):
    engine = create_engine('sqlite:///' + (tmp_path / 'concurrency.db').as_posix(),
                           connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)
    sessions = sessionmaker(engine, expire_on_commit=False)
    with sessions() as setup:
        for model in ai.CONNECTIONS.values():
            record = db.get(model, 1)
            setup.add(model(id=1, provider=record.provider, model=record.model,
                            encrypted_key=record.encrypted_key, monthly_limit=60))
        setup.commit()
        load(setup)
        load(setup, date='2026-10-05')
    yield sessions
    engine.dispose()


@pytest.mark.parametrize('failure', [False, True])
def test_identical_inflight_request_makes_no_calls_or_reservations(file_sessions, monkeypatch, failure):
    started, release = Event(), Event()
    calls = []

    def analyze(k, i, c, s):
        calls.append('analysis')
        started.set()
        assert release.wait(10)
        if failure:
            raise openai.AIError('synthetic timeout', 504)
        return draft(c)

    def review(k, i, c, s):
        calls.append('review')
        return reviewer(c)

    monkeypatch.setattr(openai, 'structured', analyze)
    monkeypatch.setattr(claude, 'structured', review)

    def generate():
        with file_sessions() as session:
            return insights.generate(session, 'demo', START, END, 'openai', 'admin')

    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(generate)
        assert started.wait(5)
        try:
            with pytest.raises(openai.AIError, match='andamento') as error:
                generate()
            assert error.value.status == 409
            with file_sessions() as session:
                assert session.get(AIUsage, ai.month()).calls == 2
            assert calls == ['analysis']
        finally:
            release.set()
        result = first.result(timeout=10)
    if failure:
        assert result['status'] == 'failed'
        monkeypatch.setattr(openai, 'structured', lambda k, i, c, s: draft(c))
        retry = generate()
        assert retry['status'] == 'reviewed'
    else:
        assert generate()['reused'] is True
    with file_sessions() as session:
        assert session.get(AIUsage, ai.month()).calls == (4 if failure else 2)


def test_different_periods_do_not_block_each_other(file_sessions, monkeypatch):
    first_started, second_started, release = Event(), Event(), Event()

    def analyze(k, i, c, s):
        (first_started if '2026-10-12' in c else second_started).set()
        assert release.wait(10)
        return draft(c)

    monkeypatch.setattr(openai, 'structured', analyze)
    monkeypatch.setattr(claude, 'structured', lambda k, i, c, s: reviewer(c))

    def generate(start, end):
        with file_sessions() as session:
            return insights.generate(session, 'demo', start, end, 'openai', 'admin')

    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(generate, START, END)
        assert first_started.wait(5)
        second = pool.submit(generate, date(2026, 10, 5), date(2026, 10, 11))
        try:
            assert second_started.wait(5)
        finally:
            release.set()
        assert first.result(timeout=10)['status'] == 'reviewed'
        assert second.result(timeout=10)['status'] == 'reviewed'
    with file_sessions() as session:
        assert session.get(AIUsage, ai.month()).calls == 4


def test_orphan_claim_is_not_silently_expired(file_sessions, monkeypatch):
    for provider in ai.PROVIDERS.values():
        monkeypatch.setattr(provider, 'structured', lambda *a: pytest.fail('No provider call'))
    with file_sessions() as session:
        evidence, labels = insights.snapshot(session, 'demo', START, END)
        key = insights.request_fingerprint(session, 'demo', START, END,
            insights.analysis_signature('openai', 'claude'), evidence, labels)
        session.add(InsightClaim(fingerprint=key, owner='synthetic',
                                created_at=datetime(2020, 1, 1, tzinfo=timezone.utc)))
        session.commit()
        with pytest.raises(openai.AIError) as error:
            insights.generate(session, 'demo', START, END, 'openai', 'admin')
        assert error.value.status == 409
        assert session.get(AIUsage, ai.month()) is None


def test_replaced_identity_with_same_name_and_facts_invalidates_cache(file_sessions, monkeypatch):
    monkeypatch.setattr(openai, 'structured', lambda k, i, c, s: draft(c))
    monkeypatch.setattr(claude, 'structured', lambda k, i, c, s: reviewer(c))
    with file_sessions() as session:
        first = insights.generate(session, 'demo', START, END, 'openai', 'admin')
        campaign = session.scalar(select(Campaign))
        replacement = Campaign(scope='demo', external_id='replacement', name=campaign.name, area=campaign.area)
        session.add(replacement)
        session.flush()
        for metric in session.scalars(select(CampaignMetric)):
            metric.campaign = replacement
        session.commit()
        second = insights.generate(session, 'demo', START, END, 'openai', 'admin')
        assert second['id'] != first['id']
        assert session.get(AIUsage, ai.month()).calls == 4


def test_budget_error_releases_claim(file_sessions):
    with file_sessions() as session:
        session.get(ai.CONNECTIONS['openai'], 1).monthly_limit = 1
        session.commit()
        with pytest.raises(openai.AIError, match='limite'):
            insights.generate(session, 'demo', START, END, 'openai', 'admin')
        assert session.scalar(select(InsightClaim)) is None
        usage = session.get(AIUsage, ai.month())
        assert usage is None or usage.calls == 0
