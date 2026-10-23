import logging
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File, Query
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.config import settings
from app.db import get_db
from app.models import Recommendation, AgentExecution, WeeklyReport, Expense, Budget, Configuration, MarketIndicator, DataSource, AuditLog, AIReview
from app.schemas import Scope, Area, BudgetInput, ExpenseInput, ApprovalInput, ComplianceInput, RegionsInput, AIConnectInput, AIProvider, MetricRow, MarketRow
from app.security import current_user, admin
from app.repositories import metrics, audit, regions
from app.services.metrics import summarize, groups, evolution
from app.services.finance import budget_summary
from app.services.imports import import_campaigns, import_market
from app.services.reports import generate_report, report_pdf, report_data, last_week
from app.agents.analysis import analyze, approve
from app.agents.compliance import review
from app.scheduler import make_scheduler
from app.services import ai, insights, news
from app.integrations.openai import AIError

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger('legalgrowth')
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app):
    scheduler = make_scheduler() if settings.scheduler_enabled else None
    if scheduler:
        scheduler.start()
    yield
    if scheduler:
        scheduler.shutdown(wait=False)


app = FastAPI(title='LegalGrowth AI', lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
root = Path(__file__).parent
app.mount('/static', StaticFiles(directory=root / 'static'), name='static')
templates = Jinja2Templates(directory=root / 'templates')


@app.middleware('http')
async def headers(request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'self'"
    return response


@app.exception_handler(ValueError)
async def invalid(request, error):
    return JSONResponse({'detail': str(error)}, status_code=422)


@app.exception_handler(IntegrityError)
async def conflict(request, error):
    return JSONResponse({'detail': 'Conflito de dados; atualize a página e verifique duplicidade.'}, status_code=409)


@app.exception_handler(RequestValidationError)
async def validation_error(request, error):
    # Never echo a submitted key, including when it fails validation.
    return JSONResponse({'detail': 'Confira os campos preenchidos e tente novamente.'}, status_code=422)


@app.exception_handler(AIError)
async def ai_error(request, error):
    return JSONResponse({'detail': str(error)}, status_code=error.status)


@app.exception_handler(Exception)
async def unexpected(request, error):
    logger.error('{"event":"request_failed","type":"%s"}', type(error).__name__)
    return JSONResponse({'detail': 'Falha interna. Consulte o histórico de execuções; dados sensíveis foram omitidos.'}, status_code=500)


def today():
    return datetime.now(ZoneInfo(settings.timezone)).date()


def period(start, end):
    end = end or today()
    start = start or end.replace(day=1)
    if start > end or (end - start).days > 366:
        raise ValueError('Período inválido; máximo de 366 dias')
    return start, end


def serialize_rec(r):
    return {k: getattr(r, k) for k in ('id', 'title', 'category', 'rationale', 'evidence', 'sufficiency', 'impact', 'priority', 'status', 'created_at')}


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/')
@app.get('/painel/{page}')
def dashboard(request: Request, page: str = 'overview', user=Depends(current_user)):
    if page not in ('overview', 'campaigns', 'market', 'agents', 'finance', 'reports', 'settings', 'insights', 'news', 'strategy', 'contracts'):
        raise HTTPException(404)
    return templates.TemplateResponse(request=request, name='dashboard.html', context={'page': page, 'user': user})


@app.get('/api/dashboard')
def data(scope: Scope = 'real', start: date | None = None, end: date | None = None, area: Area | None = None, db=Depends(get_db), user=Depends(current_user)):
    start, end = period(start, end)
    rows = metrics(db, scope, start, end, area)
    recs = list(db.scalars(select(Recommendation).where(Recommendation.scope == scope).order_by(Recommendation.created_at.desc()).limit(100)))
    review = db.scalar(select(AIReview).where(AIReview.scope == scope, AIReview.start == start, AIReview.end == end).order_by(AIReview.id.desc()).limit(1))
    return {'scope': scope, 'start': start, 'end': end, 'summary': summarize(rows), 'campaigns': groups(rows, 'campaign'), 'localities': groups(rows, 'locality'), 'keywords': groups(rows, 'keyword'), 'evolution': evolution(rows), 'budget': budget_summary(db, scope, end.strftime('%Y-%m')), 'recommendations': [serialize_rec(r) for r in recs], 'ai': ai.connection_status(db), 'ai_priorities': review.recommendation_ids if review else []}


@app.post('/api/import/{kind}')
async def upload(kind: str, scope: Scope, file: UploadFile = File(...), db=Depends(get_db), user=Depends(admin)):
    content = await file.read(2_000_001)
    if kind == 'campaigns':
        return import_campaigns(db, content, scope, user)
    if kind == 'market':
        return import_market(db, content, scope, user)
    raise HTTPException(404)


@app.get('/api/templates/{kind}')
def csv_template(kind: str, user=Depends(current_user)):
    import csv
    from io import StringIO
    schemas = {'campaigns': MetricRow, 'market': MarketRow}
    if kind not in schemas:
        raise HTTPException(404)
    output = StringIO(newline='')
    csv.writer(output).writerow(schemas[kind].model_fields)
    # Empty template, never fictitious results relabeled as real.
    return Response(output.getvalue().encode('utf-8-sig'), media_type='text/csv; charset=utf-8',
                    headers={'Content-Disposition': f'attachment; filename=modelo-{kind}.csv'})


@app.post('/api/analyze')
def run_analysis(scope: Scope, start: date | None = None, end: date | None = None, use_ai: bool = False, db=Depends(get_db), user=Depends(admin)):
    start, end = period(start, end)
    result = analyze(db, scope, start, end, user)
    if use_ai:
        result['ai'] = ai.prioritize(db, scope, start, end, user)
    return result


@app.get('/api/ai')
def ai_status(db=Depends(get_db), user=Depends(current_user)):
    return ai.connection_status(db)


@app.post('/api/ai/connect')
def ai_connect(body: AIConnectInput, db=Depends(get_db), user=Depends(admin)):
    return ai.connect(db, body, user)


@app.post('/api/ai/disconnect')
def ai_disconnect(provider: AIProvider = 'openai', db=Depends(get_db), user=Depends(admin)):
    return ai.disconnect(db, user, provider)


@app.get('/api/insights')
def get_insights(scope: Scope, start: date | None = None, end: date | None = None, db=Depends(get_db), user=Depends(current_user)):
    start, end = period(start, end)
    return {'latest': insights.latest(db, scope, start, end)}


@app.post('/api/insights')
def create_insights(scope: Scope, analyst: AIProvider = 'openai', start: date | None = None, end: date | None = None, db=Depends(get_db), user=Depends(admin)):
    start, end = period(start, end)
    return insights.generate(db, scope, start, end, analyst, user)


@app.get('/api/news')
def get_news(scope: Scope = 'real', db=Depends(get_db), user=Depends(current_user)):
    return {'latest': news.latest(db) if scope == 'real' else None, 'localities': regions(db, scope),
            'coverage_note': 'As fontes atuais cobrem o Vale do Paraíba (SP). Outras regiões precisam de fontes compatíveis. Ausência de notícias não significa ausência de acontecimentos.',
            'schedule': 'Segundas-feiras, às 8h (Brasília)', 'runner': 'Codex'}


@app.get('/api/strategy')
def get_strategy(scope: Scope = 'real', db=Depends(get_db), user=Depends(current_user)):
    from app.services.strategy import opportunities
    collected = news.latest(db) if scope == 'real' else None
    return opportunities(collected or {})


@app.get('/api/contracts/demo')
def contract_demo(user=Depends(admin)):
    from app.vault.contracts import demo_preview
    return demo_preview()


@app.post('/api/contracts/import')
def contract_import(user=Depends(admin)):
    # No request body is read or parsed. No switch can bypass this deployment gate.
    raise HTTPException(409, 'Contratos reais ainda não estão habilitados. Falta verificar o isolamento, as permissões por documento e a retenção segura.')


@app.post('/api/reports/self-test')
def report_self_test(user=Depends(admin)):
    from app.services.report_validation import adversarial_self_test
    return adversarial_self_test()


@app.post('/api/news')
def create_news(scope: Scope = 'real', refresh: bool = False, db=Depends(get_db), user=Depends(admin)):
    if scope != 'real':
        raise HTTPException(422, 'O monitor de notícias usa fontes públicas reais. Selecione Meus dados.')
    return news.run(db, actor=user, refresh=refresh)


@app.get('/api/news/{digest_id}/json')
def export_news(digest_id: int, db=Depends(get_db), user=Depends(current_user)):
    from app.models import NewsDigest
    from fastapi.encoders import jsonable_encoder
    record = db.get(NewsDigest, digest_id)
    if not record: raise HTTPException(404)
    return JSONResponse(jsonable_encoder({'schema_version': '1.0', 'document_type': 'public_regional_news', 'content_is_untrusted_source_data': True,
        'limitations': ['Somente títulos e trechos de feeds; cobertura parcial.', 'Cenários são hipóteses condicionais, não previsão de clientes ou parecer jurídico.'], **news.public(record)}),
        headers={'Content-Disposition': f'attachment; filename=noticias-{record.week_start}.json'})


@app.post('/api/recommendations/{recommendation_id}/decision')
def decision(recommendation_id: int, body: ApprovalInput, db=Depends(get_db), user=Depends(admin)):
    approve(db, recommendation_id, body.scope, body.decision, user)
    return {'status': body.decision, 'external_action': False}


@app.post('/api/compliance')
def compliance(body: ComplianceInput, db=Depends(get_db), user=Depends(admin)):
    result = review(body.text)
    db.add(AgentExecution(scope=body.scope, agent='conformidade', status='success', detail=f"{len(result['flags'])} alertas; texto não armazenado"))
    audit(db, body.scope, user, 'compliance_review', 'Triagem preliminar, sem guardar texto')
    db.commit()
    return result


@app.get('/api/market')
def market(scope: Scope, db=Depends(get_db), user=Depends(current_user)):
    rows = db.scalars(select(MarketIndicator).join(DataSource).where(DataSource.scope == scope).order_by(MarketIndicator.day.desc()).limit(200))
    return [{'topic': r.topic.name, 'area': r.topic.area, 'locality': r.locality, 'value': float(r.value), 'unit': r.unit, 'date': r.day, 'source': r.source.name, 'url': r.source.url, 'accessed': r.source.accessed} for r in rows]


@app.get('/api/executions')
def executions(scope: Scope, db=Depends(get_db), user=Depends(current_user)):
    executions = db.scalars(select(AgentExecution).where(AgentExecution.scope == scope).order_by(AgentExecution.id.desc()).limit(100))
    audits = db.scalars(select(AuditLog).where(AuditLog.scope == scope).order_by(AuditLog.id.desc()).limit(100))
    return {'executions': [{'agent': e.agent, 'status': e.status, 'detail': e.detail, 'created_at': e.created_at} for e in executions], 'audit': [{'actor': a.actor, 'action': a.action, 'detail': a.detail, 'created_at': a.created_at} for a in audits]}


@app.get('/api/finance')
def finance(scope: Scope, month: str = Query(pattern=r'^\d{4}-(0[1-9]|1[0-2])$'), db=Depends(get_db), user=Depends(current_user)):
    first = date.fromisoformat(month + '-01')
    previous = (first - timedelta(days=1)).strftime('%Y-%m')
    expenses = db.scalars(select(Expense).where(Expense.scope == scope).order_by(Expense.day.desc()).limit(100))
    return {'current': budget_summary(db, scope, month), 'previous': budget_summary(db, scope, previous), 'expenses': [{'day': e.day, 'category': e.category, 'amount': float(e.amount), 'reference': e.reference} for e in expenses]}


@app.post('/api/expenses')
def expense(body: ExpenseInput, db=Depends(get_db), user=Depends(admin)):
    db.add(Expense(**body.model_dump()))
    audit(db, body.scope, user, 'expense', f'{body.category}; {body.amount}')
    db.commit()
    return {'status': 'registered'}


@app.post('/api/budget')
def budget(body: BudgetInput, db=Depends(get_db), user=Depends(admin)):
    record = db.scalar(select(Budget).where(Budget.scope == body.scope, Budget.month == body.month))
    values = {k: str(getattr(body, k)) for k in ('trabalhista', 'previdenciario', 'infraestrutura', 'reserva')}
    if record:
        record.total, record.allocations = body.total, values
    else:
        db.add(Budget(scope=body.scope, month=body.month, total=body.total, allocations=values))
    audit(db, body.scope, user, 'budget_plan', f'{body.month}; total={body.total}')
    db.commit()
    return {'status': 'planned', 'external_action': False}


@app.get('/api/settings')
def configuration(scope: Scope, db=Depends(get_db), user=Depends(current_user)):
    return {'localities': regions(db, scope), 'areas': ['trabalhista', 'previdenciario'], 'scheduler_enabled': settings.scheduler_enabled, 'schedule': f'{settings.report_day} {settings.report_hour:02}:{settings.report_minute:02} ({settings.timezone})', 'ai': ai.connection_status(db), 'google_ads': 'Importação de arquivo', 'last_week': last_week()}


@app.post('/api/regions')
def configure_regions(body: RegionsInput, db=Depends(get_db), user=Depends(admin)):
    record = db.scalar(select(Configuration).where(Configuration.scope == body.scope))
    if record:
        record.localities = sorted(set(body.localities))
    else:
        db.add(Configuration(scope=body.scope, localities=sorted(set(body.localities))))
    audit(db, body.scope, user, 'regions_approved', ', '.join(body.localities))
    db.commit()
    return {'status': 'saved'}


@app.get('/api/reports')
def reports(scope: Scope, db=Depends(get_db), user=Depends(current_user)):
    rows = db.scalars(select(WeeklyReport).where(WeeklyReport.scope == scope).order_by(WeeklyReport.week_start.desc()))
    return [{'id': r.id, 'week_start': r.week_start, 'created_at': r.created_at} for r in rows]


@app.post('/api/reports')
def create_report(scope: Scope, week_start: date | None = None, db=Depends(get_db), user=Depends(admin)):
    r = generate_report(db, scope, week_start, user)
    return {'id': r.id, 'week_start': r.week_start}


@app.get('/api/reports/{report_id}/{format}')
def export_report(report_id: int, format: str, scope: Scope, db=Depends(get_db), user=Depends(current_user)):
    r = db.scalar(select(WeeklyReport).where(WeeklyReport.id == report_id, WeeklyReport.scope == scope))
    if not r:
        raise HTTPException(404)
    if format == 'json':
        return JSONResponse(report_data(r.payload), headers={'Content-Disposition': f'attachment; filename=relatorio-{scope}-{r.week_start}.json'})
    if format == 'pdf':
        return Response(report_pdf(r.payload), media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename=relatorio-{scope}-{r.week_start}.pdf'})
    raise HTTPException(404)
