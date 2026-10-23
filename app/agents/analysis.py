import hashlib
import json
from datetime import timedelta
from sqlalchemy import select, update
from app.models import Recommendation, RecommendationApproval, AgentExecution, MarketIndicator, DataSource
from app.repositories import metrics, audit
from app.services.metrics import summarize, groups


def suggest(db, scope, title, category, rationale, evidence, priority='media'):
    fingerprint = hashlib.sha256(json.dumps([title, category, evidence], sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    if db.scalar(select(Recommendation).where(Recommendation.scope == scope, Recommendation.fingerprint == fingerprint)):
        return fingerprint
    db.add(Recommendation(scope=scope, fingerprint=fingerprint, title=title, category=category, rationale=rationale, evidence=evidence, sufficiency='Descritiva; sem inferência causal ou significância estatística', priority=priority))
    return fingerprint


def analyze(db, scope, start, end, actor='admin'):
    try:
        fingerprints = []
        def recommend(*args):
            fingerprints.append(suggest(db, scope, *args))
        rows = metrics(db, scope, start, end)
        length = (end - start).days + 1
        previous = metrics(db, scope, start - timedelta(days=length), start - timedelta(days=1))
        current_groups, previous_groups = groups(rows, 'campaign'), groups(previous, 'campaign')
        period = {'start': start.isoformat(), 'end': end.isoformat(), 'source': 'CSV autorizado de campanhas' if scope == 'real' else 'CSV sintético de demonstração'}
        for name, current in current_groups.items():
            old = previous_groups.get(name)
            evidence = {**period, 'campaign': name, 'current': current, 'previous': old}
            if current['cost'] and not current['conversions']:
                recommend(f'Revisar mensuração: {name}', 'campanhas', 'Há gasto sem conversões registradas. Conferir rastreamento e termos de pesquisa antes de concluir ineficácia.', evidence, 'alta')
            if old and old['cpc'] and current['cpc'] and current['cpc'] > old['cpc'] * 1.2:
                recommend(f'Revisar CPC crescente: {name}', 'campanhas', 'CPC aumentou mais de 20% entre períodos de igual duração. Limiar operacional, não teste estatístico; revisar relevância e leilão.', evidence)
            if old and old['cpq'] and current['cpq'] and current['cpq'] > old['cpq'] * 1.2:
                recommend(f'Revisar custo por contato qualificado: {name}', 'campanhas', 'CPQ cresceu mais de 20%. Revisar termos e página; verificar defasagem no registro dos contatos.', evidence)
            if current['clicks'] < 100 or current['qualified'] < 10:
                recommend(f'Coletar mais evidências: {name}', 'qualidade', 'Volume abaixo do limiar operacional (100 cliques e 10 contatos qualificados). Dados insuficientes para recomendar aumento de verba por desempenho.', evidence, 'baixa')
        for keyword, summary in groups(rows, 'keyword').items():
            if summary['cost'] >= 50 and summary['qualified'] == 0:
                recommend(f'Revisar palavra-chave: {keyword}', 'palavras-chave', 'Gasto de pelo menos R$ 50 sem contato qualificado. Conferir mensuração e relevância; não pausar automaticamente.', {**period, 'keyword': keyword, 'metrics': summary})
        localities = groups(rows, 'locality')
        if len(localities) > 1:
            recommend('Comparar localidades antes de realocar verba', 'geografia', 'Comparação descritiva; diferenças de volume, cobertura e atraso de registro podem explicar variações.', {**period, 'localities': localities})
        areas = groups(rows, 'area')
        if len(areas) > 1:
            recommend('Revisar distribuição planejada do orçamento', 'orcamento', 'Comparar CPQ por área com capacidade de atendimento. Qualquer teste de redistribuição depende de aprovação; não há estimativa de retorno.', {**period, 'areas': areas})
        indicators = list(db.scalars(select(MarketIndicator).join(DataSource).where(DataSource.scope == scope, MarketIndicator.day <= end).order_by(MarketIndicator.day)))
        series = {}
        for item in indicators:
            series.setdefault((item.source_id, item.topic_id, item.locality, item.unit), []).append(item)
        for items in series.values():
            latest = items[-1]
            prior = items[-2] if len(items) > 1 else None
            recommend(f'Conteúdo educativo: {latest.topic.name}', 'mercado', 'Indicador agregado serve como contexto editorial, não como volume de buscas nem prova de demanda por contratação. Explicar o tema com revisão jurídica.', {'source': latest.source.url, 'accessed': latest.source.accessed.isoformat(), 'date': latest.day.isoformat(), 'value': float(latest.value), 'unit': latest.unit, 'locality': latest.locality, 'previous': {'date': prior.day.isoformat(), 'value': float(prior.value)} if prior else None, 'delta': float(latest.value - prior.value) if prior else None}, 'baixa')
        db.add(AgentExecution(scope=scope, agent='analise_deterministica', status='success', detail=f'{len(rows)} linhas; {len(indicators)} indicadores'))
        audit(db, scope, actor, 'analyze', f'{start} a {end}')
        db.commit()
        return {'recommendation_ids': list(db.scalars(select(Recommendation.id).where(Recommendation.scope == scope, Recommendation.fingerprint.in_(fingerprints)))), 'rows': len(rows), 'indicators': len(indicators), 'limitation': 'Resultados descritivos, sem significância estatística demonstrada'}
    except Exception:
        db.rollback()
        db.add(AgentExecution(scope=scope, agent='analise_deterministica', status='error', detail='Falha na análise; detalhes sensíveis omitidos'))
        db.commit()
        raise


def approve(db, recommendation_id, scope, decision, actor):
    if actor != 'admin':
        raise PermissionError('Apenas responsável pode decidir')
    result = db.execute(update(Recommendation).where(Recommendation.id == recommendation_id, Recommendation.scope == scope, Recommendation.status == 'pending').values(status=decision))
    if result.rowcount != 1:
        db.rollback()
        raise ValueError('Recomendação não encontrada neste ambiente ou já decidida')
    db.add(RecommendationApproval(recommendation_id=recommendation_id, actor=actor, decision=decision))
    audit(db, scope, actor, 'recommendation_decision', f'id={recommendation_id}; {decision}; nenhuma ação externa executada')
    db.commit()
