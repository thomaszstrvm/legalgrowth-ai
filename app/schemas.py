import re
from datetime import date
from decimal import Decimal
from typing import Annotated, Literal
from pydantic import AfterValidator, BaseModel, Field, ConfigDict, SecretStr, field_validator, model_validator
import hashlib
import json
import unicodedata

Scope = Literal['demo', 'real']
Area = Literal['trabalhista', 'previdenciario']
AIProvider = Literal['openai', 'claude']
STATES = frozenset('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split())


def normalize_locality(value: str) -> str:
    """Validate spelling shape and UF; this does not verify a municipality in IBGE."""
    value = unicodedata.normalize('NFC', value).strip()
    name, separator, state = value.rpartition('-')
    name, state = ' '.join(name.split()), state.strip().upper()
    if not separator or state not in STATES or not 2 <= len(name) <= 76:
        raise ValueError('Informe a cidade e uma UF válida, no formato Cidade-UF.')
    if not all(c.isalpha() or c in " '-" for c in name) or not name[0].isalpha() or not name[-1].isalpha():
        raise ValueError('O nome da cidade deve conter apenas letras, espaços, apóstrofos ou hífens.')
    result = f'{name}-{state}'
    if len(result) > 80:
        raise ValueError('Cidade-UF deve ter até 80 caracteres.')
    return result


Locality = Annotated[str, Field(min_length=4, max_length=100), AfterValidator(normalize_locality)]


def geography_key(cities: list[str]) -> str:
    """Order/case independent identity; accents remain significant without a catalog."""
    canonical = sorted({normalize_locality(city).casefold() for city in cities})
    return hashlib.sha256(json.dumps(canonical, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


class AIConnectInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    provider: AIProvider = 'openai'
    api_key: SecretStr = Field(min_length=20, max_length=512)
    monthly_limit: Decimal = Field(default=60, ge=1, le=200, decimal_places=2)

    @field_validator('api_key')
    @classmethod
    def key_format(cls, value):
        key = value.get_secret_value()
        if not key.isascii() or any(c.isspace() for c in key):
            raise ValueError('Cole a chave sem espaços')
        return value


def aggregate_label(value: str):
    if re.search(r'@|\d{7,}|\d{3}\.\d{3}\.\d{3}|https?://', value):
        raise ValueError('Rótulo inválido: use apenas identificação agregada, sem dados pessoais')
    return value


class MetricRow(BaseModel):
    model_config = ConfigDict(extra='forbid')
    scope: Scope
    date: date
    campaign_id: str = Field(min_length=1, max_length=80, pattern=r'^[\w-]+$')
    campaign: str = Field(min_length=1, max_length=120)
    area: Area
    locality: str = Field(min_length=1, max_length=80)
    keyword: str = Field(min_length=1, max_length=120)
    impressions: int = Field(ge=0, le=1_000_000_000)
    clicks: int = Field(ge=0, le=1_000_000_000)
    cost: Decimal = Field(ge=0, le=1_000_000, max_digits=12, decimal_places=2)
    conversions: int = Field(ge=0)
    contacts: int = Field(ge=0)
    qualified: int = Field(ge=0)
    appointments: int = Field(ge=0)
    hires: int = Field(ge=0)

    _labels = field_validator('campaign', 'keyword', 'locality')(aggregate_label)

    @model_validator(mode='after')
    def valid_counts(self):
        if self.clicks > self.impressions:
            raise ValueError('Cliques excedem impressões')
        if not self.contacts >= self.qualified >= self.appointments >= self.hires:
            raise ValueError('Funil deve respeitar contatos >= qualificados >= atendimentos >= contratações')
        return self


class BudgetInput(BaseModel):
    scope: Scope
    month: str = Field(pattern=r'^\d{4}-(0[1-9]|1[0-2])$')
    total: Decimal = Field(gt=0, le=1_000_000, decimal_places=2)
    trabalhista: Decimal = Field(ge=0, decimal_places=2)
    previdenciario: Decimal = Field(ge=0, decimal_places=2)
    infraestrutura: Decimal = Field(ge=0, decimal_places=2)
    reserva: Decimal = Field(ge=0, decimal_places=2)

    @model_validator(mode='after')
    def allocation_total(self):
        if sum(getattr(self, k) for k in ('trabalhista', 'previdenciario', 'infraestrutura', 'reserva')) != self.total:
            raise ValueError('Alocações devem somar o limite mensal')
        return self


class ExpenseInput(BaseModel):
    scope: Scope
    day: date
    category: Literal['infraestrutura', 'reserva', 'anuncios_nao_importados']
    amount: Decimal = Field(gt=0, le=1_000_000, decimal_places=2)
    reference: str = Field(min_length=1, max_length=100)
    _label = field_validator('reference')(aggregate_label)


class ApprovalInput(BaseModel):
    scope: Scope
    decision: Literal['approved', 'rejected']


class ComplianceInput(BaseModel):
    scope: Scope
    text: str = Field(min_length=1, max_length=5000)


class RegionsInput(BaseModel):
    scope: Scope
    localities: list[Locality] = Field(min_length=1, max_length=20)

    @field_validator('localities')
    @classmethod
    def unique_localities(cls, value):
        return sorted({city.casefold(): city for city in value}.values())


class MarketRow(BaseModel):
    model_config = ConfigDict(extra='forbid')
    scope: Scope
    date: date
    source: str = Field(min_length=1, max_length=120)
    source_url: str = Field(max_length=500)
    accessed: date
    topic: str = Field(min_length=1, max_length=120)
    area: Area
    locality: str = Field(max_length=80)
    value: Decimal = Field(ge=0, le=1_000_000_000_000)
    unit: str = Field(min_length=1, max_length=60)
    _labels = field_validator('source', 'topic', 'unit', 'locality')(aggregate_label)

    @model_validator(mode='after')
    def public_source(self):
        from urllib.parse import urlparse
        host = urlparse(self.source_url).hostname or ''
        if self.scope == 'real' and (not self.source_url.startswith('https://') or not (host.endswith('.gov.br') or host.endswith('.ibge.gov.br') or host == 'ibge.gov.br')):
            raise ValueError('Indicadores reais exigem URL HTTPS oficial gov.br')
        if self.date > self.accessed:
            raise ValueError('Data do indicador posterior à consulta')
        return self
