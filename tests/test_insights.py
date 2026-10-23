import io
import json
import secrets
from datetime import date
import httpx
import pytest
from pypdf import PdfReader
from sqlalchemy import select
from app.integrations import openai, claude
from app.models import AIConnection, ClaudeConnection, AIUsage, CampaignInsight
from app.schemas import AIConnectInput
from app.services import ai, insights
from app.services.reports import generate_report, report_pdf, report_data
from app.config import settings
from test_ai import vault
from test_core import load

START, END = date(2026, 10, 12), date(2026, 10, 18)


@pytest.fixture
def two_connections(db, vault, monkeypatch):
    keys = {}
    for p, provider in ai.PROVIDERS.items():
        monkeypatch.setattr(provider, 'verify_key', lambda key: None)
        keys[p] = secrets.token_urlsafe(36)
        ai.connect(db, AIConnectInput(provider=p, api_key=keys[p]), 'admin')
    return keys


def draft(content):
    facts = json.loads(content)['facts']
    fid = next(k for k, v in facts.items() if v['metric'] == 'cost' and v['period'] == 'current')
    return {'findings': [{'id': 'finding', 'kind': 'weakness', 'title': 'Conferir os resultados',
        'explanation': 'O investimento precisa ser acompanhado junto com os resultados registrados.',
        'action': 'Confira a qualidade dos registros antes de decidir.', 'evidence_ids': [fid]}]}


def reviewer(content, verdict='supported'):
    return {'verdicts': [{'finding_id': f['id'], 'verdict': verdict, 'reason': 'Compatível com os dados apresentados.'} for f in json.loads(content)['analysis']['findings']]}


@pytest.mark.parametrize('analyst', ['openai', 'claude'])
def test_two_independent_calls_and_snapshot(db, two_connections, monkeypatch, analyst):
    load(db)
    calls = []
    for p, provider in ai.PROVIDERS.items():
        def answer(key, instructions, content, schema, p=p):
            assert key == two_connections[p]
            assert 'Campanha Fictícia' not in content and 'Cruzeiro' not in content
            calls.append(p)
            return draft(content) if p == analyst else reviewer(content)
        monkeypatch.setattr(provider, 'structured', answer)
    result = insights.generate(db, 'demo', START, END, analyst, 'admin')
    assert calls == [analyst, 'claude' if analyst == 'openai' else 'openai']
    assert result['status'] == 'reviewed' and len(result['findings']) == 1
    assert result['findings'][0]['evidence'][0]['value'] == 100
    assert db.get(AIUsage, ai.month()).calls == 2
    assert 'snapshot' not in result and 'draft' not in result
    saved = db.scalar(select(CampaignInsight))
    assert 'Campanha Fictícia' not in json.dumps(saved.payload, ensure_ascii=False)
    assert 'encrypted_labels' in saved.payload and 'labels' not in saved.payload
    assert not any(key in json.dumps(result, default=str) for key in two_connections.values())
    assert insights.latest(db, 'real', START, END) is None
    assert insights.latest(db, 'demo', date(2026, 10, 1), END) is None


@pytest.mark.parametrize('verdict', ['unsupported', 'uncertain'])
def test_unconfirmed_findings_never_shown(db, two_connections, monkeypatch, verdict):
    load(db)
    monkeypatch.setattr(openai, 'structured', lambda k, i, c, s: draft(c))
    monkeypatch.setattr(claude, 'structured', lambda k, i, c, s: reviewer(c, verdict))
    result = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert result['status'] == 'partial' and result['excluded'] == 1
    assert not result['findings']


@pytest.mark.parametrize('failure', ['timeout', 'missing_verdict', 'duplicate_verdict', 'invented_id'])
def test_incomplete_review_fails_closed(db, two_connections, monkeypatch, failure):
    load(db)
    monkeypatch.setattr(openai, 'structured', lambda k, i, c, s: draft(c))
    def bad(key, instructions, content, schema):
        if failure == 'timeout':
            raise openai.AIError('sensitive provider body')
        value = reviewer(content)
        if failure == 'missing_verdict': value['verdicts'] = []
        if failure == 'duplicate_verdict': value['verdicts'] *= 2
        if failure == 'invented_id': value['verdicts'][0]['finding_id'] = 'invented'
        return value
    monkeypatch.setattr(claude, 'structured', bad)
    result = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert result['status'] == 'unverified' and not result['findings']
    assert 'sensitive' not in str(result)
    assert db.get(AIUsage, ai.month()).reserved_brl == 2


@pytest.mark.parametrize('mutation', ['numeric_claim', 'invented_evidence', 'duplicate_id'])
def test_invalid_draft_does_not_reach_reviewer(db, two_connections, monkeypatch, mutation):
    load(db)
    def bad(k, i, content, s):
        value = draft(content)
        if mutation == 'numeric_claim': value['findings'][0]['explanation'] = 'O lucro cresceu 200%.'
        if mutation == 'invented_evidence': value['findings'][0]['evidence_ids'] = ['not-real']
        if mutation == 'duplicate_id': value['findings'] *= 2
        return value
    monkeypatch.setattr(openai, 'structured', bad)
    monkeypatch.setattr(claude, 'structured', lambda *args: pytest.fail('Reviewer should not be called'))
    result = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert result['status'] == 'failed' and not result['findings']


def test_missing_connection_empty_scope_and_insufficient_budget_make_no_calls(db, two_connections, monkeypatch):
    for provider in ai.PROVIDERS.values():
        monkeypatch.setattr(provider, 'structured', lambda *args: pytest.fail('Unexpected paid call'))
    with pytest.raises(openai.AIError, match='Importe'):
        insights.generate(db, 'real', START, END, 'openai', 'admin')
    assert db.get(AIUsage, ai.month()) is None
    load(db)
    db.get(AIConnection, 1).monthly_limit = 1
    db.commit()
    with pytest.raises(openai.AIError, match='limite'):
        insights.generate(db, 'demo', START, END, 'openai', 'admin')
    usage = db.get(AIUsage, ai.month())
    assert not usage or usage.calls == 0
    ai.disconnect(db, 'admin', 'claude')
    assert db.get(AIConnection, 1) is not None
    with pytest.raises(openai.AIError, match='Conecte'):
        insights.generate(db, 'demo', START, END, 'openai', 'admin')


def test_viewer_cannot_generate_insights(client, two_connections):
    client.auth = ('viewer', settings.viewer_password.get_secret_value())
    assert client.post('/api/insights?scope=demo').status_code == 403
    assert client.post('/api/ai/disconnect?provider=claude').status_code == 403
    assert client.get('/api/insights?scope=demo').json() == {'latest': None}


def test_claude_adapter_and_encrypted_connection(db, vault, monkeypatch):
    requests = []
    original = httpx.Client
    def respond(request):
        requests.append(request)
        if request.method == 'GET': return httpx.Response(200, json={'id': claude.MODEL})
        return httpx.Response(200, json={'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': '{"ok":true}'}]})
    monkeypatch.setattr(claude.httpx, 'Client', lambda **kw: original(**kw, transport=httpx.MockTransport(respond)))
    key = secrets.token_urlsafe(36)
    status = ai.connect(db, AIConnectInput(provider='claude', api_key=key), 'admin')
    assert status['connected'] and status['provider'] == 'Claude'
    assert key not in db.get(ClaudeConnection, 1).encrypted_key
    content = json.dumps({'articles': [], 'signals': [], 'source_checks': [], 'truncated': False})
    assert claude.structured(key, 'system', content, {'type': 'object'}) == {'ok': True}
    assert requests[1].headers['x-api-key'] == key
    body = json.loads(requests[1].content)
    assert body['model'] == claude.MODEL and body['output_config']['format']['type'] == 'json_schema'
    assert 'tools' not in body


@pytest.mark.parametrize('code', [401, 403, 429, 500])
def test_claude_errors_are_sanitized(monkeypatch, code):
    original = httpx.Client
    seen = []
    def respond(request):
        seen.append(request)
        return httpx.Response(code, json={'secret': 'raw-provider-error'})
    monkeypatch.setattr(claude.httpx, 'Client', lambda **kw: original(**kw, transport=httpx.MockTransport(respond)))
    with pytest.raises(openai.AIError) as error: claude.verify_key('fake-key')
    assert 'raw-provider-error' not in str(error.value) and len(seen) == 1


def test_report_evidence_is_readable_not_json(db):
    load(db)
    report = generate_report(db, 'demo', START)
    before = json.dumps(report.payload)
    reader = PdfReader(io.BytesIO(report_pdf(report.payload)))
    text = '\n'.join(p.extract_text() for p in reader.pages)
    assert 'Período analisado' in text and 'R$ 100,00' in text
    assert '"current"' not in text and '"impressions"' not in text and '{' not in text
    assert json.dumps(report.payload) == before
    assert not any(word in text for word in ['CPQ', 'CPC', 'CTR', 'snapshot', 'inferência causal', 'Suficiência'])
    exported = report_data(report.payload)
    assert exported['schema_version'] == '1.0'
    assert exported['observed_data']['current']['cost'] == report.payload['current']['cost']
    assert 'Campanha Fictícia' not in json.dumps(exported, ensure_ascii=False)
    assert exported['privacy']['identity_mapping_included'] is False


def test_identical_reviewed_snapshot_is_reused_without_new_calls(db, two_connections, monkeypatch):
    load(db)
    calls = []
    def analyst(k, i, content, schema):
        calls.append('analyst')
        return draft(content)
    def review(k, i, content, schema):
        calls.append('reviewer')
        return reviewer(content)
    monkeypatch.setattr(openai, 'structured', analyst)
    monkeypatch.setattr(claude, 'structured', review)
    first = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    second = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert second['id'] == first['id'] and second['reused'] is True
    assert calls == ['analyst', 'reviewer']
    assert db.get(AIUsage, ai.month()).calls == 2
    from app.models import CampaignMetric
    from decimal import Decimal
    metric = db.scalar(select(CampaignMetric))
    metric.cost += Decimal('1')
    db.commit()
    third = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert third['id'] != first['id']
    assert len(calls) == 4


@pytest.mark.parametrize('change', ['prompt', 'model', 'schema'])
def test_reviewed_snapshot_invalidated_when_analysis_contract_changes(db, two_connections, monkeypatch, change):
    load(db)
    monkeypatch.setattr(openai, 'structured', lambda k, i, c, s: draft(c))
    monkeypatch.setattr(claude, 'structured', lambda k, i, c, s: reviewer(c))
    first = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    if change == 'prompt':
        monkeypatch.setattr(insights, 'REVIEWER', insights.REVIEWER + ' Confira novamente a cobertura.')
    elif change == 'model':
        monkeypatch.setattr(claude, 'MODEL', 'synthetic-replacement-model')
    else:
        original = insights.api_schema
        monkeypatch.setattr(insights, 'api_schema', lambda model: {**original(model), 'description': 'synthetic schema revision'})
    second = insights.generate(db, 'demo', START, END, 'openai', 'admin')
    assert second['id'] != first['id']
    assert db.get(AIUsage, ai.month()).calls == 4
