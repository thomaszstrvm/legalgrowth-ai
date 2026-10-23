import csv
import io
from sqlalchemy import select
from pydantic import ValidationError
from app.schemas import MetricRow, MarketRow
from app.models import Campaign, CampaignMetric, DataSource, LegalTopic, MarketIndicator
from app.repositories import regions, audit


def parse_csv(content: bytes, schema):
    if len(content) > 2_000_000:
        raise ValueError('Arquivo excede 2 MB')
    try:
        text = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        raise ValueError('Use UTF-8') from None
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)) or set(reader.fieldnames) != set(schema.model_fields):
        raise ValueError('Cabeçalho incompatível: consulte o CSV de exemplo')
    result = []
    for line, row in enumerate(reader, 2):
        if line > 10001:
            raise ValueError('Máximo de 10.000 registros')
        try:
            result.append(schema.model_validate(row))
        except ValidationError as exc:
            fields = ', '.join(str(e['loc'][0]) if e['loc'] else 'consistência' for e in exc.errors())
            raise ValueError(f'Linha {line}: campos inválidos ({fields}); valores não foram registrados') from None
    if not result:
        raise ValueError('CSV vazio')
    return result


def import_campaigns(db, content, scope, actor='admin'):
    rows = parse_csv(content, MetricRow)
    allowed = regions(db, scope)
    keys = set()
    for row in rows:
        if row.scope != scope:
            raise ValueError('Origem demo/real incompatível com o ambiente selecionado')
        if row.locality not in allowed:
            raise ValueError('Localidade não habilitada pelo responsável')
        key = (row.campaign_id, row.date, row.locality, row.keyword)
        if key in keys:
            raise ValueError('Chave duplicada dentro do arquivo')
        keys.add(key)
    added = unchanged = 0
    try:
        for row in rows:
            campaign = db.scalar(select(Campaign).where(Campaign.scope == scope, Campaign.external_id == row.campaign_id))
            if campaign is None:
                campaign = Campaign(scope=scope, external_id=row.campaign_id, name=row.campaign, area=row.area)
                db.add(campaign)
                db.flush()
            elif campaign.name != row.campaign or campaign.area != row.area:
                raise ValueError('Metadados conflitantes para a mesma campanha')
            existing = db.scalar(select(CampaignMetric).where(CampaignMetric.campaign_id == campaign.id, CampaignMetric.day == row.date, CampaignMetric.locality == row.locality, CampaignMetric.keyword == row.keyword))
            values = row.model_dump(exclude={'scope', 'date', 'campaign_id', 'campaign', 'area'})
            if existing:
                if any(getattr(existing, k) != v for k, v in values.items()):
                    raise ValueError('Registro já importado com valores diferentes; reconciliação manual necessária')
                unchanged += 1
            else:
                db.add(CampaignMetric(campaign_id=campaign.id, day=row.date, **values))
                added += 1
        audit(db, scope, actor, 'import_campaigns', f'{added} novos; {unchanged} já existentes')
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {'added': added, 'unchanged': unchanged}


def import_market(db, content, scope, actor='admin'):
    rows = parse_csv(content, MarketRow)
    allowed = regions(db, scope)
    if any(r.scope != scope or r.locality not in allowed for r in rows):
        raise ValueError('Ambiente ou localidade incompatível')
    count = 0
    try:
        for r in rows:
            source = db.scalar(select(DataSource).where(DataSource.scope == scope, DataSource.url == r.source_url))
            if not source:
                source = DataSource(scope=scope, name=r.source, url=r.source_url, accessed=r.accessed)
                db.add(source)
                db.flush()
            source.accessed = max(source.accessed, r.accessed)
            topic = db.scalar(select(LegalTopic).where(LegalTopic.name == r.topic))
            if not topic:
                topic = LegalTopic(name=r.topic, area=r.area)
                db.add(topic)
                db.flush()
            elif topic.area != r.area:
                raise ValueError('Área conflitante para o tema')
            existing = db.scalar(select(MarketIndicator).where(MarketIndicator.source_id == source.id, MarketIndicator.topic_id == topic.id, MarketIndicator.day == r.date, MarketIndicator.locality == r.locality, MarketIndicator.unit == r.unit))
            if existing and existing.value != r.value:
                raise ValueError('Indicador conflitante; reconciliação necessária')
            if not existing:
                db.add(MarketIndicator(source_id=source.id, topic_id=topic.id, day=r.date, locality=r.locality, value=r.value, unit=r.unit))
                db.flush()
                count += 1
        audit(db, scope, actor, 'import_market', f'{count} indicadores')
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {'added': count}
