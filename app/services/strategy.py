"""Independent, evidence-dependent dimensions; never infer demand from headlines."""
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

SOCIAL_WEIGHTS = {'access': 25, 'relevance': 20, 'information_gap': 15,
                  'benefit': 15, 'prevention': 15, 'community': 10}
FINANCIAL_WEIGHTS = {'demand': 20, 'area_fit': 10, 'capacity': 20,
                     'cost_time': 20, 'history': 15, 'sustainability': 15}


class Criterion(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    value: int = Field(ge=0, le=100)
    evidence_ids: list[str] = Field(min_length=1, max_length=10)
    rationale: str = Field(min_length=10, max_length=500)
    human_confirmed: Literal[True]


def dimension(weights, criteria, evidence_ids):
    """No denominator renormalization: missing evidence means no total score."""
    missing = sorted(set(weights) - set(criteria))
    checked = {}
    for name, item in criteria.items():
        if name not in weights: raise ValueError('Critério não reconhecido.')
        criterion = Criterion.model_validate(item)
        if not set(criterion.evidence_ids) <= set(evidence_ids):
            raise ValueError('Evidência não encontrada.')
        checked[name] = criterion.model_dump()
    if missing:
        return {'score': None, 'status': 'Dados insuficientes', 'missing': missing, 'criteria': checked, 'weights': weights}
    score = round(sum(checked[name]['value'] * weight for name, weight in weights.items()) / 100, 1)
    return {'score': score, 'status': 'Avaliação humana ponderada', 'missing': [], 'criteria': checked, 'weights': weights}


def opportunities(news_payload):
    items = []
    for article in news_payload.get('articles', []):
        items.append({'id': article['id'], 'title': article['title'], 'source_url': article['url'],
            'published': article['published'], 'event_date': None, 'cities': article['cities'],
            'areas': ['trabalhista' if t == 'trabalho' else 'previdenciario' for t in article['topics']],
            'source_reliability': 'Feed identificado; fato jornalístico não confirmado de forma independente.',
            'social': dimension(SOCIAL_WEIGHTS, {}, []), 'financial': dimension(FINANCIAL_WEIGHTS, {}, []),
            'economic_view': 'Não há base suficiente para estimar procura, honorários ou retorno financeiro.',
            'social_view': 'O tema pode orientar uma pauta informativa. É necessário confirmar sua relevância para a comunidade.',
            'devils_advocate': 'Uma notícia não prova que as pessoas precisam dos serviços do escritório. O trecho pode omitir contexto importante.',
            'question': 'Este conteúdo ajudaria a comunidade mesmo que não gerasse nenhuma contratação?',
            'next_step': 'Leia a fonte, confirme o contexto e peça a um advogado para avaliar uma possível pauta educativa.',
            'human_review_required': True, 'method': 'deterministic', 'uncertainty': 'high', 'conflict': None})
    return {'schema_version': '1.0', 'method': 'deterministic', 'opportunities': items,
            'notice': 'As duas avaliações são independentes. Ausência de nota não significa impacto zero. Nenhuma publicação ou contato com pessoas é realizado.'}
