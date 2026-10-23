"""Synthetic location, cache isolation and migration checks; no external calls."""
import json
from datetime import date, timedelta
from pathlib import Path
import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine, select, text
from app.config import settings
from app.models import Configuration, NewsDigest
from app.repositories import regions
from app.schemas import RegionsInput, STATES, geography_key
from app.services import news, gateway
from app.integrations import news as feeds

START = date(2026, 10, 12)


def configure(db, cities):
    config = db.scalar(select(Configuration).where(Configuration.scope == 'real'))
    if config: config.localities = cities
    else: db.add(Configuration(scope='real', localities=cities))
    db.commit()


def test_regions_defaults_are_scope_specific(db):
    assert regions(db, 'real') == []
    assert regions(db, 'demo') == ['Cruzeiro-SP']
    db.add_all([Configuration(scope='real'), Configuration(scope='demo')])
    db.commit()
    assert regions(db, 'real') == []
    assert regions(db, 'demo') == ['Cruzeiro-SP']


@pytest.mark.parametrize('state', sorted(STATES))
def test_all_brazilian_states_and_normalization(state):
    value = RegionsInput(scope='real', localities=[f'  Cidade   Sintética - {state.lower()} '])
    assert value.localities == [f'Cidade Sintética-{state}']


@pytest.mark.parametrize('cities', [[], ['Cidade-XX'], ['Cidade'], ['<script>-SP'], ['abc@example-SP'], ['123-SP'], ['A-SP'], ['Cidade-SP'] * 21])
def test_invalid_regions_fail_validation(cities):
    with pytest.raises(ValidationError): RegionsInput(scope='real', localities=cities)


def test_regions_deduplicate_and_geography_is_order_independent():
    assert len(RegionsInput(scope='real', localities=['Natal-RN', 'natal-rn']).localities) == 1
    assert geography_key(['Natal-RN', 'Rio de Janeiro-RJ']) == geography_key(['rio de janeiro-rj', 'NATAL-RN'])


def test_regions_api_preserves_scope_and_accepts_new_city(client):
    assert client.get('/api/settings?scope=real').json()['localities'] == []
    assert client.post('/api/regions', json={'scope': 'real', 'localities': ['Belo Horizonte-MG']}).status_code == 200
    assert client.get('/api/settings?scope=real').json()['localities'] == ['Belo Horizonte-MG']
    assert client.get('/api/settings?scope=demo').json()['localities'] == ['Cruzeiro-SP']
    assert client.post('/api/regions', json={'scope': 'real', 'localities': ['Cidade-XX']}).status_code == 422


def test_empty_region_blocks_collection_before_network(client, monkeypatch):
    monkeypatch.setattr(feeds, 'collect', lambda *args: pytest.fail('No source request without configuration'))
    response = client.post('/api/news?scope=real')
    assert response.status_code == 422 and 'Configurações' in response.json()['detail']
    assert client.get('/api/news?scope=real').json()['latest'] is None


@pytest.fixture
def synthetic_collection(monkeypatch):
    calls = []
    def collect(start, end, cities):
        calls.append(cities)
        article = {'id': 'a' * 16, 'title': 'Vagas de emprego na cidade', 'source': 'Jornal Atos', 'source_id': 'atos',
                   'url': 'https://jornalatos.com.br/synthetic/', 'published': str(start), 'excerpt': 'Trecho sintético.',
                   'cities': cities, 'topics': ['trabalho'], 'basis': 'Feed sintético para teste'}
        return [article], [{'status': 'read'}], False
    monkeypatch.setattr(feeds, 'collect', collect)
    return calls


def test_geography_change_preserves_history_and_isolates_strategy(client, db, synthetic_collection):
    configure(db, ['Cruzeiro-SP'])
    old = news.run(db, week_start=START, use_ai=False)
    configure(db, ['Taubaté-SP'])
    assert news.latest(db) is None
    assert client.get('/api/strategy?scope=real').json()['opportunities'] == []
    new = news.run(db, week_start=START, use_ai=False)
    assert new['id'] != old['id']
    assert synthetic_collection == [['Cruzeiro-SP'], ['Taubaté-SP']]
    assert db.get(NewsDigest, old['id']).payload['cities'] == ['Cruzeiro-SP']
    assert news.latest(db)['id'] == new['id']
    assert client.get('/api/strategy?scope=real').json()['opportunities'][0]['cities'] == ['Taubaté-SP']
    assert client.get('/api/strategy?scope=demo').json()['opportunities'] == []
    assert client.get(f"/api/news/{old['id']}/json").json()['cities'] == ['Cruzeiro-SP']
    configure(db, ['Cruzeiro-SP'])
    assert news.run(db, week_start=START, use_ai=False)['id'] == old['id']
    assert len(synthetic_collection) == 2


def test_previous_comparison_requires_same_geography(db, synthetic_collection):
    configure(db, ['Cruzeiro-SP'])
    news.run(db, week_start=START - timedelta(days=7), use_ai=False)
    configure(db, ['Taubaté-SP'])
    result = news.run(db, week_start=START, use_ai=False)
    assert result['signals'][0]['previous_count'] is None
    news.run(db, week_start=START - timedelta(days=7), use_ai=False)
    refreshed = news.run(db, week_start=START, use_ai=False, refresh=True)
    assert refreshed['signals'][0]['previous_count'] == 1


def test_reports_do_not_embed_another_geography(db, synthetic_collection):
    from app.services.reports import generate_report
    configure(db, ['Cruzeiro-SP'])
    news.run(db, week_start=START, use_ai=False)
    configure(db, ['Taubaté-SP'])
    report = generate_report(db, 'real', START)
    assert 'regional_news' not in report.payload
    assert 'strategic_analysis' not in report.payload


def test_other_state_has_no_silent_sp_fallback(monkeypatch):
    monkeypatch.setattr(feeds.httpx, 'Client', lambda **kwargs: pytest.fail('No network for uncovered UF'))
    articles, checks, truncated = feeds.collect(START, START + timedelta(days=6), ['Cruzeiro-MG'])
    assert not articles and not truncated
    assert all(check['status'] == 'unavailable' and 'não cobre' in check['note'] for check in checks)


def test_non_sp_feed_matching_and_gateway_validation():
    from test_news import rss, SOURCE
    source = {**SOURCE, 'states': ('MG',)}
    article = feeds.parse_feed(rss(title='Belo Horizonte anuncia vagas de emprego'), source, START, START + timedelta(days=6), ['Belo Horizonte-MG'])[0][0]
    assert article['cities'] == ['Belo Horizonte-MG']
    evidence = {'articles': [article], 'signals': [], 'source_checks': [], 'truncated': False}
    assert json.loads(gateway.prepare(json.dumps(evidence)))['articles'][0]['cities'] == ['Belo Horizonte-MG']
    article['cities'] = ['example.invalid-XX']
    with pytest.raises(Exception, match='bloqueado'): gateway.prepare(json.dumps(evidence))


def test_migration_preserves_ids_payload_and_geographies(tmp_path, monkeypatch):
    from alembic import command
    from alembic.config import Config
    url = 'sqlite:///' + (tmp_path / 'synthetic-migration.db').as_posix()
    monkeypatch.setattr(settings, 'database_url', url)
    config = Config(str(Path(__file__).parents[1] / 'alembic.ini'))
    config.set_main_option('script_location', str(Path(__file__).parents[1] / 'migrations'))
    command.upgrade(config, '73b7e91c89f9')
    payload = {'cities': ['Cruzeiro-SP'], 'articles': [{'title': 'Sintético'}]}
    engine = create_engine(url)
    with engine.begin() as connection:
        connection.execute(text('INSERT INTO news_digests (id, week_start, status, payload, created_at) VALUES (1, :week, :status, :payload, :created)'),
                           {'week': str(START), 'status': 'collected', 'payload': json.dumps(payload), 'created': '2026-10-20 08:00:00'})
    command.upgrade(config, 'head')
    command.check(config)
    with engine.begin() as connection:
        row = connection.execute(text('SELECT * FROM news_digests WHERE id=1')).mappings().one()
        assert json.loads(row['payload']) == payload
        assert row['geography_key'] == geography_key(['Cruzeiro-SP'])
        connection.execute(text('INSERT INTO news_digests (id, week_start, geography_key, status, payload, created_at) VALUES (2, :week, :key, :status, :payload, :created)'),
                           {'week': str(START), 'key': geography_key(['Taubaté-SP']), 'status': 'collected', 'payload': '{}', 'created': '2026-10-20 08:00:00'})
    with pytest.raises(RuntimeError, match='Downgrade bloqueado'):
        command.downgrade(config, '73b7e91c89f9')
    with engine.connect() as connection:
        assert connection.execute(text('SELECT COUNT(*) FROM news_digests')).scalar() == 2
    engine.dispose()
