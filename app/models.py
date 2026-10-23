from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Date, DateTime, Numeric, ForeignKey, UniqueConstraint, CheckConstraint, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


def now():
    return datetime.now(timezone.utc)


class Scoped:
    scope: Mapped[str] = mapped_column(String(4), index=True)


class Campaign(Scoped, Base):
    __tablename__ = 'campaigns'
    __table_args__ = (UniqueConstraint('scope', 'external_id'), CheckConstraint("scope IN ('demo','real')"))
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(80))
    name: Mapped[str] = mapped_column(String(120))
    area: Mapped[str] = mapped_column(String(30))
    metrics: Mapped[list['CampaignMetric']] = relationship(back_populates='campaign')


class CampaignMetric(Base):
    __tablename__ = 'campaign_metrics'
    __table_args__ = (UniqueConstraint('campaign_id', 'day', 'locality', 'keyword'), CheckConstraint('cost >= 0 AND impressions >= 0 AND clicks >= 0 AND conversions >= 0 AND contacts >= 0 AND qualified >= 0 AND appointments >= 0 AND hires >= 0'))
    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey('campaigns.id'), index=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    locality: Mapped[str] = mapped_column(String(80))
    keyword: Mapped[str] = mapped_column(String(120))
    impressions: Mapped[int]
    clicks: Mapped[int]
    cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    conversions: Mapped[int]
    contacts: Mapped[int]
    qualified: Mapped[int]
    appointments: Mapped[int]
    hires: Mapped[int]
    campaign: Mapped[Campaign] = relationship(back_populates='metrics')


class Budget(Scoped, Base):
    __tablename__ = 'budgets'
    __table_args__ = (UniqueConstraint('scope', 'month'), CheckConstraint('total > 0'))
    id: Mapped[int] = mapped_column(primary_key=True)
    month: Mapped[str] = mapped_column(String(7))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    allocations: Mapped[dict] = mapped_column(JSON)


class Expense(Scoped, Base):
    __tablename__ = 'expenses'
    __table_args__ = (CheckConstraint('amount > 0'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    category: Mapped[str] = mapped_column(String(30))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    reference: Mapped[str] = mapped_column(String(100))


class DataSource(Scoped, Base):
    __tablename__ = 'data_sources'
    __table_args__ = (UniqueConstraint('scope', 'url'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    url: Mapped[str] = mapped_column(String(500))
    accessed: Mapped[date] = mapped_column(Date)


class LegalTopic(Base):
    __tablename__ = 'legal_topics'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    area: Mapped[str] = mapped_column(String(30))


class MarketIndicator(Base):
    __tablename__ = 'market_indicators'
    __table_args__ = (UniqueConstraint('source_id', 'topic_id', 'day', 'locality', 'unit'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey('data_sources.id'), index=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey('legal_topics.id'))
    day: Mapped[date] = mapped_column(Date, index=True)
    locality: Mapped[str] = mapped_column(String(80))
    value: Mapped[Decimal] = mapped_column(Numeric(16, 4))
    unit: Mapped[str] = mapped_column(String(60))
    source: Mapped[DataSource] = relationship()
    topic: Mapped[LegalTopic] = relationship()


class Recommendation(Scoped, Base):
    __tablename__ = 'recommendations'
    __table_args__ = (UniqueConstraint('scope', 'fingerprint'), CheckConstraint("status IN ('pending','approved','rejected')"))
    id: Mapped[int] = mapped_column(primary_key=True)
    fingerprint: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    rationale: Mapped[str] = mapped_column(Text)
    evidence: Mapped[dict] = mapped_column(JSON)
    sufficiency: Mapped[str] = mapped_column(String(80))
    impact: Mapped[str] = mapped_column(String(200), default='Não quantificado; hipótese a validar.')
    priority: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default='pending')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class RecommendationApproval(Base):
    __tablename__ = 'recommendation_approvals'
    id: Mapped[int] = mapped_column(primary_key=True)
    recommendation_id: Mapped[int] = mapped_column(ForeignKey('recommendations.id'), unique=True)
    actor: Mapped[str] = mapped_column(String(40))
    decision: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class AgentExecution(Scoped, Base):
    __tablename__ = 'agent_executions'
    id: Mapped[int] = mapped_column(primary_key=True)
    agent: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(20))
    detail: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class WeeklyReport(Scoped, Base):
    __tablename__ = 'weekly_reports'
    __table_args__ = (UniqueConstraint('scope', 'week_start'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    week_start: Mapped[date] = mapped_column(Date)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class AuditLog(Scoped, Base):
    __tablename__ = 'audit_logs'
    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str] = mapped_column(String(40))
    action: Mapped[str] = mapped_column(String(80))
    detail: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Configuration(Scoped, Base):
    __tablename__ = 'configurations'
    id: Mapped[int] = mapped_column(primary_key=True)
    __table_args__ = (UniqueConstraint('scope'),)
    localities: Mapped[list] = mapped_column(JSON, default=lambda context: ['Cruzeiro-SP'] if context.get_current_parameters().get('scope') == 'demo' else [])


class AIConnection(Base):
    __tablename__ = 'ai_connections'
    __table_args__ = (CheckConstraint('id = 1'), CheckConstraint('monthly_limit >= 1 AND monthly_limit <= 200'))
    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[str] = mapped_column(String(30))
    model: Mapped[str] = mapped_column(String(80))
    encrypted_key: Mapped[str] = mapped_column(Text)
    monthly_limit: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=60)
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class AIUsage(Base):
    __tablename__ = 'ai_usage'
    month: Mapped[str] = mapped_column(String(7), primary_key=True)
    reserved_brl: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    calls: Mapped[int] = mapped_column(default=0)


class AIReview(Scoped, Base):
    __tablename__ = 'ai_reviews'
    id: Mapped[int] = mapped_column(primary_key=True)
    start: Mapped[date] = mapped_column(Date)
    end: Mapped[date] = mapped_column(Date)
    recommendation_ids: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class ClaudeConnection(Base):
    __tablename__ = 'claude_connections'
    __table_args__ = (CheckConstraint('id = 1'), CheckConstraint('monthly_limit >= 1 AND monthly_limit <= 200'))
    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[str] = mapped_column(String(30), default='claude')
    model: Mapped[str] = mapped_column(String(80))
    encrypted_key: Mapped[str] = mapped_column(Text)
    monthly_limit: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=60)
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class CampaignInsight(Scoped, Base):
    __tablename__ = 'campaign_insights'
    id: Mapped[int] = mapped_column(primary_key=True)
    start: Mapped[date] = mapped_column(Date)
    end: Mapped[date] = mapped_column(Date)
    analyst: Mapped[str] = mapped_column(String(30))
    reviewer: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class NewsDigest(Base):
    __tablename__ = 'news_digests'
    __table_args__ = (UniqueConstraint('week_start', 'geography_key', name='uq_news_week_geography'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    week_start: Mapped[date] = mapped_column(Date)
    geography_key: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(30))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
