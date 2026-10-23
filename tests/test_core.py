import csv
import io
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path
import pytest
from sqlalchemy import select, func
from pypdf import PdfReader
from app.schemas import MetricRow, BudgetInput
from app.services.imports import import_campaigns, import_market
from app.services.metrics import summarize, ratio
from app.services.finance import budget_summary
from app.services.reports import generate_report, report_pdf
from app.agents.analysis import analyze, approve
from app.agents.compliance import review
from app.models import Campaign, CampaignMetric, Recommendation, RecommendationApproval, Expense, WeeklyReport, AuditLog, AgentExecution
from app.repositories import metrics
from app.integrations.providers import get_provider, Enrichment, UnconfiguredGoogleAds


def sample(**changes):
    row={'scope':'demo','date':'2026-10-12','campaign_id':'test','campaign':'Campanha Fictícia','area':'trabalhista','locality':'Cruzeiro-SP','keyword':'FGTS','impressions':100,'clicks':10,'cost':'100.00','conversions':0,'contacts':3,'qualified':2,'appointments':1,'hires':0}
    return row|changes


def csv_bytes(*rows):
    output=io.StringIO()
    writer=csv.DictWriter(output,fieldnames=rows[0].keys())
    writer.writeheader();writer.writerows(rows)
    return output.getvalue().encode()


def load(db, **changes):
    return import_campaigns(db,csv_bytes(sample(**changes)),'demo')


def test_metrics_and_zero():
    assert ratio(1,0) is None
    assert summarize([])['cpq'] is None
    assert summarize([])['cost']==0


def test_weighted_metrics(db):
    load(db)
    load(db,date='2026-10-13',cost='50.00',clicks=20,qualified=1)
    result=summarize(metrics(db,'demo',date(2026,10,1),date(2026,10,31)))
    assert result['cost']==150
    assert result['cpc']==5
    assert result['ctr']==15
    assert result['cpq']==50
    assert result['cph'] is None


@pytest.mark.parametrize('cost,thresholds',[('1599.00',[]),('1600.00',[80]),('1800.00',[80,90]),('2000.00',[80,90,100]),('2100.00',[80,90,100])])
def test_budget_thresholds(db,cost,thresholds):
    load(db,cost=cost)
    result=budget_summary(db,'demo','2026-10')
    assert result['alerts']==thresholds
    assert result['balance']==float(Decimal('2000')-Decimal(cost))


def test_expenses_and_month_scope(db):
    load(db)
    db.add(Expense(scope='demo',day=date(2026,10,10),amount=Decimal('200'),category='infraestrutura',reference='hospedagem'))
    db.commit()
    assert budget_summary(db,'demo','2026-10')['spent']==100
    assert budget_summary(db,'demo','2026-10')['software_expenses']==200
    assert budget_summary(db,'real','2026-10')['spent']==0
    assert budget_summary(db,'demo','2026-09')['spent']==0


def test_budget_allocations():
    with pytest.raises(ValueError):
        BudgetInput(scope='real',month='2026-10',total=2000,trabalhista=1000,previdenciario=600,infraestrutura=200,reserva=100)


def test_idempotent_import(db):
    assert load(db)['added']==1
    assert load(db)['unchanged']==1
    assert db.scalar(select(func.count()).select_from(CampaignMetric))==1


@pytest.mark.parametrize('changes',[{'cost':'-1'},{'clicks':101},{'contacts':0},{'scope':'real'},{'locality':'Lavrinhas-SP'},{'email':'x@example.invalid'},{'keyword':'123.456.789-10'},{'cost':'NaN'}])
def test_invalid_csv_rejected(db,changes):
    with pytest.raises(ValueError):
        load(db,**changes)
    assert db.scalar(select(func.count()).select_from(CampaignMetric))==0


def test_transaction_rollback_on_conflict(db):
    load(db)
    with pytest.raises(ValueError):
        import_campaigns(db,csv_bytes(sample(campaign_id='new'),sample(cost='101.00')),'demo')
    assert db.scalar(select(func.count()).select_from(Campaign))==1


def test_duplicate_within_file(db):
    with pytest.raises(ValueError):
        import_campaigns(db,csv_bytes(sample(),sample()),'demo')


def test_analysis_and_human_approval(db):
    load(db)
    analyze(db,'demo',date(2026,10,12),date(2026,10,18))
    rec=db.scalar(select(Recommendation).where(Recommendation.category=='campanhas'))
    assert rec.status=='pending'
    assert rec.evidence['current']['conversions']==0
    with pytest.raises(PermissionError):
        approve(db,rec.id,'demo','approved','viewer')
    with pytest.raises(ValueError):
        approve(db,rec.id,'real','approved','admin')
    approve(db,rec.id,'demo','approved','admin')
    assert db.scalar(select(RecommendationApproval)).decision=='approved'
    with pytest.raises(ValueError):
        approve(db,rec.id,'demo','rejected','admin')
    assert db.scalar(select(func.count()).select_from(AuditLog))>=3


def test_analysis_deduplication_and_isolation(db):
    load(db)
    for _ in range(2):
        analyze(db,'demo',date(2026,10,12),date(2026,10,18))
    count=db.scalar(select(func.count()).select_from(Recommendation))
    analyze(db,'real',date(2026,10,12),date(2026,10,18))
    assert db.scalar(select(func.count()).select_from(Recommendation))==count
    assert metrics(db,'real',date(2026,1,1),date(2026,12,31))==[]


def test_reports_idempotent_and_pdf(db):
    load(db)
    report=generate_report(db,'demo',date(2026,10,12))
    same=generate_report(db,'demo',date(2026,10,12))
    assert report.id==same.id
    assert db.scalar(select(func.count()).select_from(WeeklyReport))==1
    assert report.payload['demonstration'] is True
    assert report.payload['coverage']['current_days']==1
    reader=PdfReader(io.BytesIO(report_pdf(report.payload)))
    text=' '.join(p.extract_text() for p in reader.pages)
    assert 'FICTÍCIOS' in text
    assert 'Contratações' in text
    assert 'Financeiro' in text
    real=generate_report(db,'real',date(2026,10,12))
    assert real.payload['current']['cost']==0
    assert real.payload['recommendations']==[]


def test_report_requires_monday(db):
    with pytest.raises(ValueError):
        generate_report(db,'real',date(2026,10,13))


def test_report_uses_only_recommendations_from_current_analysis(db):
    load(db)
    earlier = analyze(db, 'demo', date(2026, 10, 1), date(2026, 10, 18))
    report = generate_report(db, 'demo', date(2026, 10, 12))
    ids = {r['id'] for r in report.payload['recommendations']}
    assert ids and ids.isdisjoint(earlier['recommendation_ids'])
    assert report.payload['pending_approvals'] == len(ids)
    assert all(r['evidence']['start'] == '2026-10-12' for r in report.payload['recommendations'])
    # Historical suggestions remain available; filtering must not delete history.
    assert db.get(Recommendation, earlier['recommendation_ids'][0]) is not None


def test_report_excludes_resolved_issue_even_with_same_period(db):
    load(db)
    analyze(db, 'demo', date(2026, 10, 12), date(2026, 10, 18))
    stale = db.scalar(select(Recommendation).where(Recommendation.category == 'campanhas'))
    db.scalar(select(CampaignMetric)).conversions = 1
    db.commit()
    report = generate_report(db, 'demo', date(2026, 10, 12))
    assert stale.id not in {r['id'] for r in report.payload['recommendations']}
    assert stale.status == 'pending'


def test_report_error_logged(db,monkeypatch):
    def fail(*args,**kwargs):
        raise RuntimeError('sensitive content')
    monkeypatch.setattr('app.services.reports.analyze',fail)
    with pytest.raises(RuntimeError):
        generate_report(db,'demo',date(2026,10,12))
    execution=db.scalar(select(AgentExecution))
    assert execution.status=='error'
    assert 'sensitive content' not in execution.detail


def test_compliance_is_not_approval():
    assert review('Causa ganha, resultado garantido!')['flags']
    assert review('Informações sobre aposentadoria')['human_review_required'] is True
    assert review('Processe agora, você vai ganhar')['flags']


def test_without_ai_and_structured_contract():
    assert get_provider().enrich({}) is None
    with pytest.raises(ValueError):
        get_provider('unconfigured')
    with pytest.raises(ValueError):
        Enrichment(recommendation_id=1,explanation='ok',evidence_ids=[],metrics={'invented':1})
    with pytest.raises(RuntimeError):
        UnconfiguredGoogleAds().read_metrics(date.today(),date.today())


def test_market_csv_sources_and_trends(db):
    from app.models import Configuration
    db.add(Configuration(scope='real', localities=['Cruzeiro-SP']))
    db.commit()
    rows=[]
    for day,value in [('2026-09-01',100),('2026-10-01',110)]:
        rows.append({'scope':'real','date':day,'source':'IBGE','source_url':'https://www.ibge.gov.br/indicador','accessed':'2026-10-20','topic':'FGTS','area':'trabalhista','locality':'Cruzeiro-SP','value':value,'unit':'índice de teste'})
    assert import_market(db,csv_bytes(*rows),'real')['added']==2
    analyze(db,'real',date(2026,10,1),date(2026,10,20))
    rec=db.scalar(select(Recommendation))
    assert rec.evidence['delta']==10
    assert rec.evidence['source'].startswith('https://www.ibge.gov.br')
    rows[0]['source_url']='https://ibge.gov.br.evil.invalid/'
    with pytest.raises(ValueError):
        import_market(db,csv_bytes(rows[0]),'real')


def test_no_embedded_secrets():
    import re
    paths=list(Path('app').rglob('*.py'))+[Path('.env.example'),Path('compose.yaml')]
    for path in paths:
        text=path.read_text(encoding='utf-8')
        assert not re.search(r'sk-[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{30,}|-----BEGIN (RSA |EC )?PRIVATE KEY',text),path
    assert '.env' in Path('.gitignore').read_text()


def test_scheduler_configuration():
    from app.scheduler import make_scheduler
    scheduler=make_scheduler()
    job=scheduler.get_jobs()[0]
    assert job.max_instances==1
    assert str(scheduler.timezone)=='America/Sao_Paulo'
    assert "day_of_week='mon'" in str(job.trigger)
