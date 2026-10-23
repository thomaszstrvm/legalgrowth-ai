import json
import secrets
from datetime import date
from decimal import Decimal
import httpx
import pytest
from sqlalchemy import select
from app.config import settings
from app.integrations import openai
from app.models import AIConnection, AIUsage, AIReview, AgentExecution, AuditLog
from app.schemas import AIConnectInput
from app.services import ai
from app.agents.analysis import analyze
from test_core import load


@pytest.fixture
def vault(tmp_path, monkeypatch):
    from pydantic import SecretStr
    monkeypatch.setattr(settings, 'ai_encryption_key', SecretStr(''))
    monkeypatch.setattr(settings, 'data_encryption_key', SecretStr(''))
    monkeypatch.setattr(settings, 'ai_key_file', str(tmp_path / 'vault' / 'key'))
    monkeypatch.setattr(settings, 'data_key_file', str(tmp_path / 'vault' / 'data-key'))


@pytest.fixture
def provider(monkeypatch):
    requests = []
    original = httpx.Client
    def respond(request):
        requests.append(request)
        if request.method == 'GET':
            return httpx.Response(200, json={'id': openai.MODEL})
        payload = json.loads(request.content)
        candidates = json.loads(payload['input'])
        return httpx.Response(200, json={'status':'completed', 'output':[{'type':'message','content':[{'type':'output_text','text':json.dumps({'priority_ids':[candidates[0]['id']]})}]}]})
    monkeypatch.setattr(openai.httpx, 'Client', lambda **kwargs: original(**kwargs, transport=httpx.MockTransport(respond)))
    return requests


def connect(db, limit=20):
    key = secrets.token_urlsafe(36)
    ai.connect(db, AIConnectInput(api_key=key, monthly_limit=limit), 'admin')
    return key


def test_connection_encrypts_key_and_does_not_return_it(client,db,vault,provider):
    key=secrets.token_urlsafe(36)
    response=client.post('/api/ai/connect',json={'api_key':key,'monthly_limit':20})
    assert response.status_code==200
    assert response.json()['connected'] is True
    assert key not in response.text
    record=db.get(AIConnection,1)
    assert key not in record.encrypted_key
    assert ai.cipher().decrypt(record.encrypted_key.encode()).decode()==key
    assert len(provider)==1 and provider[0].method=='GET'
    assert str(provider[0].url)==openai.BASE_URL+'/models/'+openai.MODEL
    assert key not in client.get('/api/ai').text
    assert key not in client.get('/api/dashboard').text
    assert key not in client.get('/api/settings?scope=real').text
    assert all(key not in row.detail for row in db.scalars(select(AuditLog)))


def test_invalid_input_never_echoes_key(client,vault):
    invalid='invalid secret with whitespace'
    response=client.post('/api/ai/connect',json={'api_key':invalid})
    assert response.status_code==422
    assert invalid not in response.text


def test_viewer_cannot_connect_or_disconnect(client,provider):
    client.auth=('viewer',settings.viewer_password.get_secret_value())
    assert client.post('/api/ai/connect',json={'api_key':secrets.token_urlsafe(36)}).status_code==403
    assert client.post('/api/ai/disconnect').status_code==403
    assert not provider


def test_failed_replacement_preserves_existing_key(db,vault,provider,monkeypatch):
    key=connect(db)
    def denied(*args):
        raise openai.AIError('A chave não foi aceita.',422)
    monkeypatch.setattr(openai,'verify_key',denied)
    with pytest.raises(openai.AIError):
        connect(db)
    assert ai.cipher().decrypt(db.get(AIConnection,1).encrypted_key.encode()).decode()==key


def test_live_adapter_contract_and_aggregate_only_input(db,vault,provider):
    connect(db)
    load(db,campaign='Nome interno reservado',keyword='Palavra reservada')
    analyze(db,'demo',date(2026,10,12),date(2026,10,18))
    result=ai.prioritize(db,'demo',date(2026,10,12),date(2026,10,18),'admin')
    assert result['used']
    payload=json.loads(provider[-1].content)
    assert payload['store'] is False
    assert payload['max_output_tokens']==500
    assert payload['text']['format']['strict'] is True
    assert 'Nome interno reservado' not in payload['input']
    assert 'Palavra reservada' not in payload['input']
    assert db.get(AIUsage,ai.month()).reserved_brl==Decimal('1')
    assert db.scalar(select(AIReview)).scope=='demo'


def test_no_paid_call_without_candidates(db,vault,provider):
    connect(db)
    result=ai.prioritize(db,'real',date(2026,10,12),date(2026,10,18),'admin')
    assert result['used'] is False
    assert len(provider)==1
    assert db.get(AIUsage,ai.month()) is None


def test_monthly_limit_survives_disconnect_and_reconnect(db,vault,provider):
    connect(db,1)
    load(db);analyze(db,'demo',date(2026,10,12),date(2026,10,18))
    ai.prioritize(db,'demo',date(2026,10,12),date(2026,10,18),'admin')
    ai.disconnect(db,'admin');connect(db,1)
    calls=len(provider)
    with pytest.raises(openai.AIError,match='limite mensal'):
        ai.prioritize(db,'demo',date(2026,10,12),date(2026,10,18),'admin')
    assert len(provider)==calls


def test_rejects_unknown_priority_and_retains_allowance(db,vault,provider,monkeypatch):
    connect(db);load(db);analyze(db,'demo',date(2026,10,12),date(2026,10,18))
    monkeypatch.setattr(openai,'request',lambda *args:{'status':'completed','output':[{'type':'message','content':[{'type':'output_text','text':'{"priority_ids":[999999]}'}]}]})
    with pytest.raises(openai.AIError,match='conferência'):
        ai.prioritize(db,'demo',date(2026,10,12),date(2026,10,18),'admin')
    assert db.scalar(select(AIReview)) is None
    assert db.get(AIUsage,ai.month()).reserved_brl==1
    assert db.scalar(select(AgentExecution).where(AgentExecution.agent=='openai')).status=='error'


@pytest.mark.parametrize('status',[401,403,429,500])
def test_provider_errors_are_sanitized(monkeypatch,status):
    original=httpx.Client
    secret=secrets.token_urlsafe(36)
    transport=httpx.MockTransport(lambda _:httpx.Response(status,json={'error':secret}))
    monkeypatch.setattr(openai.httpx,'Client',lambda **kwargs:original(**kwargs,transport=transport))
    with pytest.raises(openai.AIError) as exc:
        openai.verify_key(secret)
    assert secret not in str(exc.value)


def test_timeout_is_readable_and_does_not_retry(monkeypatch):
    original=httpx.Client;calls=[]
    def timeout(request):
        calls.append(request)
        raise httpx.ReadTimeout('private provider detail')
    monkeypatch.setattr(openai.httpx,'Client',lambda **kwargs:original(**kwargs,transport=httpx.MockTransport(timeout)))
    with pytest.raises(openai.AIError,match='demorou'):
        openai.verify_key(secrets.token_urlsafe(36))
    assert len(calls)==1


def test_normal_analysis_does_not_call_external_provider(client,db,vault,provider):
    connect(db);load(db)
    count=len(provider)
    assert client.post('/api/analyze?scope=demo&start=2026-10-12&end=2026-10-18').status_code==200
    assert len(provider)==count
    response=client.post('/api/analyze?scope=demo&start=2026-10-12&end=2026-10-18&use_ai=true')
    assert response.status_code==200 and response.json()['ai']['used']
    assert len(provider)==count+1
    dashboard=client.get('/api/dashboard?scope=demo&start=2026-10-12&end=2026-10-18').json()
    assert dashboard['ai_priorities']
    assert client.get('/api/dashboard?scope=real&start=2026-10-12&end=2026-10-18').json()['ai_priorities']==[]
