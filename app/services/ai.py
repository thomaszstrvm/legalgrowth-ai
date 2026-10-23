import os
from pathlib import Path
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from app.config import settings
from app.models import AIConnection, ClaudeConnection, AIUsage, AIReview, AgentExecution, Recommendation, now
from app.repositories import audit
from app.integrations import openai, claude

PROVIDERS = {'openai': openai, 'claude': claude}
CONNECTIONS = {'openai': AIConnection, 'claude': ClaudeConnection}
NAMES = {'openai': 'OpenAI', 'claude': 'Claude'}

# Conservative local allowance, not a provider invoice. Retained even after failures.
# This is a fixed local quota, NOT a measured cost or exchange-rate conversion.
# Price-based upper bounds and provider usage accounting are not implemented yet.
ALLOWANCE_PER_CALL = Decimal('1.00')


def cipher(create=False):
    key = settings.ai_encryption_key.get_secret_value()
    if key:
        try:
            return Fernet(key.encode())
        except ValueError:
            raise openai.AIError('A proteção das chaves precisa ser configurada no servidor.') from None
    path = Path(settings.ai_key_file)
    if not path.exists() and create:
        path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'wb') as stream:
                stream.write(Fernet.generate_key())
        except FileExistsError:
            pass
    try:
        return Fernet(path.read_bytes())
    except (OSError, ValueError):
        raise openai.AIError('Não foi possível abrir a chave salva. Conecte a IA novamente.') from None


def month():
    return datetime.now(ZoneInfo(settings.timezone)).strftime('%Y-%m')


def connection_status(db):
    records = {p: db.get(model, 1) for p, model in CONNECTIONS.items()}
    active = [r for r in records.values() if r]
    record = active[0] if active else None
    usage = db.get(AIUsage, month())
    return {'connected': bool(record), 'provider': NAMES[record.provider] if record else 'OpenAI', 'model': record.model if record else openai.MODEL,
            'connections': {p: {'connected': bool(r), 'name': NAMES[p], 'model': PROVIDERS[p].MODEL} for p, r in records.items()},
            'insights_ready': len(active) == 2,
            'monthly_limit': float(min(r.monthly_limit for r in active)) if active else 60,
            'reserved_brl': float(usage.reserved_brl) if usage else 0,
            'calls': usage.calls if usage else 0,
            'allowance_per_call': float(ALLOWANCE_PER_CALL)}


def connect(db, body, actor):
    key = body.api_key.get_secret_value()
    # Verify before replacing the existing connection. Neither request nor response is logged.
    provider = PROVIDERS[body.provider]
    provider.verify_key(key)
    encrypted = cipher(create=True).encrypt(key.encode()).decode()
    record = db.get(CONNECTIONS[body.provider], 1)
    if record:
        record.encrypted_key, record.monthly_limit, record.connected_at = encrypted, body.monthly_limit, now()
    else:
        db.add(CONNECTIONS[body.provider](id=1, provider=body.provider, model=provider.MODEL, encrypted_key=encrypted, monthly_limit=body.monthly_limit))
    # A single shared cap: saving the limit applies to both connections, never usage.
    for other in CONNECTIONS.values():
        saved = db.get(other, 1)
        if saved:
            saved.monthly_limit = body.monthly_limit
    audit(db, 'real', actor, 'ai_connected', NAMES[body.provider] + '; chave protegida; nenhuma chave no histórico')
    db.commit()
    return connection_status(db)


def disconnect(db, actor, provider='openai'):
    record = db.get(CONNECTIONS[provider], 1)
    if record:
        db.delete(record)
    # Keep monthly usage; disconnect/reconnect must not reset the local limit.
    audit(db, 'real', actor, 'ai_disconnected', 'Chave removida da conexão ativa')
    db.commit()
    return connection_status(db)


def reserve(db, limit, calls=1):
    current_month = month()
    if not db.get(AIUsage, current_month):
        try:
            with db.begin_nested():
                db.add(AIUsage(month=current_month, reserved_brl=0, calls=0))
                db.flush()
        except IntegrityError:
            pass
    allowance = ALLOWANCE_PER_CALL * calls
    result = db.execute(update(AIUsage).where(AIUsage.month == current_month, AIUsage.reserved_brl + allowance <= limit).values(reserved_brl=AIUsage.reserved_brl + allowance, calls=AIUsage.calls + calls))
    if result.rowcount != 1:
        db.rollback()
        raise openai.AIError('O limite mensal de análises foi atingido. Você pode continuar usando as recomendações sem IA.', 409)
    db.commit()


def safe_metrics(value):
    allowed = {'cost', 'clicks', 'impressions', 'conversions', 'contacts', 'qualified', 'appointments', 'hires', 'cpc', 'cpq', 'cph', 'ctr', 'days', 'rows'}
    return {k: v for k, v in value.items() if k in allowed and (v is None or type(v) in (int, float))} if isinstance(value, dict) else {}


def prioritize(db, scope, start, end, actor):
    connection = db.get(AIConnection, 1) or db.get(ClaudeConnection, 1)
    if not connection:
        raise openai.AIError('Conecte uma IA em Configurações para usar esta opção.', 409)
    rows = list(db.scalars(select(Recommendation).where(Recommendation.scope == scope, Recommendation.status == 'pending').order_by(Recommendation.id.desc())))
    candidates = []
    for row in rows:
        evidence = row.evidence
        if evidence.get('start') != start.isoformat() or evidence.get('end') != end.isoformat():
            continue
        if row.category not in ('campanhas', 'qualidade', 'palavras-chave', 'geografia', 'orcamento'):
            continue
        candidates.append({'id': row.id, 'category': row.category,
            'current': safe_metrics(evidence.get('current', evidence.get('metrics', {}))),
            'previous': safe_metrics(evidence.get('previous', {})),
            'areas': {area: safe_metrics(evidence.get('areas', {}).get(area, {})) for area in ('trabalhista', 'previdenciario')}})
        if len(candidates) == 20:
            break
    if not candidates:
        return {'used': False, 'message': 'Não há recomendações pendentes neste período. Nenhuma consulta foi enviada à IA.'}
    try:
        key = cipher().decrypt(connection.encrypted_key.encode()).decode()
    except InvalidToken:
        raise openai.AIError('A chave salva não pôde ser aberta. Conecte novamente.') from None
    reserve(db, connection.monthly_limit)
    try:
        selected = PROVIDERS[connection.provider].prioritize(key, candidates)
        db.add(AIReview(scope=scope, start=start, end=end, recommendation_ids=selected))
        db.add(AgentExecution(scope=scope, agent=connection.provider, status='success', detail=f'{len(selected)} prioridades; sem publicação'))
        audit(db, scope, actor, 'ai_analysis', f'{start} a {end}; apenas contagens e métricas')
        db.commit()
        return {'used': True, 'message': 'Análise concluída. As prioridades estão no início da lista.', 'priority_ids': selected}
    except Exception as exc:
        db.rollback()
        db.add(AgentExecution(scope=scope, agent=connection.provider, status='error', detail='Consulta não concluída; recomendações locais preservadas'))
        db.commit()
        if isinstance(exc, openai.AIError):
            raise
        raise openai.AIError('Não foi possível concluir a análise com IA. As recomendações locais continuam disponíveis.') from None
