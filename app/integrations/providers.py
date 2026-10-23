"""Contratos de extensão. Nenhum método de publicação, pagamento ou mutação externa."""
from typing import Protocol
from datetime import date
from pydantic import BaseModel, Field, ConfigDict
from app.schemas import MetricRow


class GoogleAdsReader(Protocol):
    def read_metrics(self, start: date, end: date) -> list[MetricRow]: ...


class UnconfiguredGoogleAds:
    def read_metrics(self, start, end):
        raise RuntimeError('Google Ads API não configurada. Use CSV; OAuth e developer token necessários.')


class Enrichment(BaseModel):
    model_config = ConfigDict(extra='forbid')
    recommendation_id: int
    explanation: str = Field(max_length=1500)
    evidence_ids: list[int]


class AIProvider(Protocol):
    def enrich(self, aggregate_evidence: dict, *, max_tokens: int, timeout_seconds: float) -> Enrichment: ...


class DisabledAI:
    def enrich(self, aggregate_evidence, *, max_tokens=500, timeout_seconds=10):
        return None


def get_provider(name='none'):
    if name != 'none':
        raise ValueError('Provedor ainda não implementado: nenhuma chamada paga será realizada')
    return DisabledAI()
