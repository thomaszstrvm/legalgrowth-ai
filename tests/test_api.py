from datetime import date
from sqlalchemy import select
from app.models import Recommendation
from app.agents.analysis import analyze
from app.config import settings
from test_core import load, sample, csv_bytes


def test_auth_required(client):
    client.auth=None
    assert client.get('/').status_code==401
    assert client.get('/api/dashboard').status_code==401
    assert client.get('/api/templates/campaigns').status_code==401


def test_csv_templates_are_empty_and_compatible(client):
    import csv
    import io
    from app.schemas import MetricRow, MarketRow
    for kind, schema in [('campaigns',MetricRow),('market',MarketRow)]:
        response=client.get('/api/templates/'+kind)
        assert response.status_code==200
        reader=csv.DictReader(io.StringIO(response.content.decode('utf-8-sig')))
        assert set(reader.fieldnames)==set(schema.model_fields)
        assert list(reader)==[]
        assert 'attachment' in response.headers['content-disposition']
    assert client.get('/api/templates/unknown').status_code==404


def test_all_pages_and_empty_state(client):
    for page in ('overview','campaigns','market','agents','finance','reports','settings'):
        response=client.get('/painel/'+page)
        assert response.status_code==200
        assert 'pt-BR' in response.text
    result=client.get('/api/dashboard?scope=real').json()
    assert result['summary']['cost']==0
    assert client.get('/api/dashboard?scope=other').status_code==422
    assert client.get('/api/dashboard?start=2026-10-20&end=2026-10-01').status_code==422


def test_end_to_end(client):
    response=client.post('/api/import/campaigns?scope=demo',files={'file':('test.csv',csv_bytes(sample()),'text/csv')})
    assert response.status_code==200
    result=client.get('/api/dashboard?scope=demo&start=2026-10-01&end=2026-10-31').json()
    assert result['summary']['cost']==100
    assert client.post('/api/analyze?scope=demo&start=2026-10-12&end=2026-10-18').status_code==200
    result=client.get('/api/dashboard?scope=demo').json()
    rid=result['recommendations'][0]['id']
    assert client.post(f'/api/recommendations/{rid}/decision',json={'scope':'demo','decision':'rejected'}).status_code==200
    report=client.post('/api/reports?scope=demo&week_start=2026-10-12').json()
    pdf=client.get(f"/api/reports/{report['id']}/pdf?scope=demo")
    assert pdf.status_code==200 and pdf.content.startswith(b'%PDF')
    assert client.get(f"/api/reports/{report['id']}/json?scope=real").status_code==404


def test_viewer_cannot_write(client):
    client.auth=('viewer',settings.viewer_password.get_secret_value())
    assert client.get('/api/dashboard').status_code==200
    assert client.post('/api/analyze?scope=demo').status_code==403


def test_csrf_protection(client):
    del client.headers['X-Requested-With']
    assert client.post('/api/analyze?scope=demo').status_code==403
    client.headers['X-Requested-With']='LegalGrowth'
    client.headers['Origin']='https://untrusted.invalid'
    assert client.post('/api/analyze?scope=demo').status_code==403


def test_budget_and_expense_api(client):
    body={'scope':'real','month':'2026-10','total':2000,'trabalhista':1100,'previdenciario':600,'infraestrutura':200,'reserva':100}
    assert client.post('/api/budget',json=body).status_code==200
    assert client.post('/api/expenses',json={'scope':'real','day':'2026-10-01','category':'infraestrutura','amount':'150.50','reference':'Hospedagem'}).status_code==200
    finance=client.get('/api/finance?scope=real&month=2026-10').json()
    assert finance['current']['balance']==2000
    assert finance['current']['software_expenses']==150.5


def test_regions_require_approval(client):
    content=csv_bytes(sample(locality='Lavrinhas-SP'))
    assert client.post('/api/import/campaigns?scope=demo',files={'file':('test.csv',content)}).status_code==422
    assert client.post('/api/regions',json={'scope':'demo','localities':['Cruzeiro-SP','Lavrinhas-SP']}).status_code==200
    assert client.post('/api/import/campaigns?scope=demo',files={'file':('test.csv',content)}).status_code==200


def test_compliance_does_not_store_text(client,db):
    from app.models import AgentExecution
    result=client.post('/api/compliance',json={'scope':'demo','text':'Resultado garantido para todos'}).json()
    assert result['human_review_required']
    assert 'Resultado garantido' not in db.scalar(select(AgentExecution)).detail
