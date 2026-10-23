from datetime import date
from sqlalchemy import select
from app.models import Campaign, CampaignMetric, Configuration, AuditLog


def metrics(db, scope, start: date, end: date, area=None):
    stmt = select(CampaignMetric).join(Campaign).where(Campaign.scope == scope, CampaignMetric.day >= start, CampaignMetric.day <= end)
    if area:
        stmt = stmt.where(Campaign.area == area)
    return list(db.scalars(stmt).all())


def regions(db, scope):
    config = db.scalar(select(Configuration).where(Configuration.scope == scope))
    return config.localities if config else (['Cruzeiro-SP'] if scope == 'demo' else [])


def audit(db, scope, actor, action, detail):
    db.add(AuditLog(scope=scope, actor=actor, action=action, detail=detail))
