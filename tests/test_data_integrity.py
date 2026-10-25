"""Synthetic regressions for campaign identity and exact imported indicators."""
from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import func, select

from app.agents.analysis import analyze
from app.models import Campaign, Configuration, DataSource, LegalTopic, MarketIndicator, Recommendation
from app.repositories import metrics
from app.schemas import MarketRow
from app.services.imports import import_campaigns, import_market
from app.services.metrics import groups
from app.services.reports import generate_report, report_data
from tests.test_core import csv_bytes, sample


def market_sample(**changes):
    return dict(scope='demo', date='2026-10-12', source='Synthetic source',
                source_url='https://example.invalid/indicator', accessed='2026-10-20',
                topic='Synthetic topic', area='trabalhista', locality='Cruzeiro-SP',
                value='123.4567', unit='synthetic index') | changes


def test_campaign_identity_survives_duplicate_labels_scope_period_and_area(db):
    db.add(Configuration(scope='real', localities=['Cruzeiro-SP']))
    db.commit()
    import_campaigns(db, csv_bytes(sample(campaign_id='a', cost='10'),
                                  sample(campaign_id='b', cost='20', area='previdenciario'),
                                  sample(campaign_id='a', date='2026-10-05', cost='30')), 'demo')
    import_campaigns(db, csv_bytes(sample(scope='real', campaign_id='a', cost='40')), 'real')
    start, end = date(2026, 10, 12), date(2026, 10, 18)
    result = groups(metrics(db, 'demo', start, end), 'campaign')
    assert len(result) == 2
    campaigns = db.scalars(select(Campaign).where(Campaign.scope == 'demo')).all()
    assert set(result) == {str(c.id) for c in campaigns}
    assert {v['label'] for v in result.values()} == {'Campanha Fictícia'}
    assert sorted(v['cost'] for v in result.values()) == [10, 20]
    assert len(groups(metrics(db, 'demo', start, end, 'trabalhista'), 'campaign')) == 1
    real = groups(metrics(db, 'real', start, end), 'campaign')
    assert len(real) == 1 and not set(real).intersection(result)
    assert next(iter(real.values()))['cost'] == 40
    previous = groups(metrics(db, 'demo', date(2026, 10, 5), date(2026, 10, 11)), 'campaign')
    a = next(c for c in campaigns if c.external_id == 'a')
    assert previous[str(a.id)]['cost'] == 30


def test_recommendations_and_export_do_not_merge_identical_campaigns(db):
    import_campaigns(db, csv_bytes(sample(campaign_id='a'), sample(campaign_id='b')), 'demo')
    analyze(db, 'demo', date(2026, 10, 12), date(2026, 10, 18))
    recs = db.scalars(select(Recommendation).where(Recommendation.category == 'campanhas')).all()
    assert len(recs) == 2
    assert len({r.evidence['campaign_id'] for r in recs}) == 2
    assert all(r.evidence['campaign'] == 'Campanha Fictícia' for r in recs)
    report = generate_report(db, 'demo', date(2026, 10, 12))
    assert len(report.payload['campaigns']) == 2
    exported = report_data(report.payload)['observed_data']['campaigns']
    assert len(exported) == 2
    assert all('label' not in values for values in exported.values())


@pytest.mark.parametrize('value', ['0', '0.0001', '123.4567', '999999999999.9999', '1.23000', '1e3'])
def test_market_numeric_exact_representable_schema(value):
    assert MarketRow.model_validate(market_sample(value=value)).value == Decimal(value)


@pytest.mark.parametrize('value', ['1.23456', '0.00001', '1000000000000', '9999999999999.1',
                                  '-0.0001', 'NaN', 'sNaN', 'Infinity', '-Infinity'])
def test_market_numeric_rejects_incompatible_schema(value):
    with pytest.raises(ValueError):
        MarketRow.model_validate(market_sample(value=value))


@pytest.mark.parametrize('bad', ['1.23456', '1000000000000', 'NaN'])
def test_invalid_market_row_prevents_all_writes(db, bad):
    with pytest.raises(ValueError):
        import_market(db, csv_bytes(market_sample(), market_sample(date='2026-10-13', value=bad)), 'demo')
    for model in (MarketIndicator, DataSource, LegalTopic):
        assert db.scalar(select(func.count()).select_from(model)) == 0


@pytest.mark.parametrize('value', ['123.4567', '0.0001', '999999999999.9999'])
def test_market_reimport_is_identical_after_database_reload(db, value):
    content = csv_bytes(market_sample(value=value))
    assert import_market(db, content, 'demo') == {'added': 1}
    db.expire_all()
    assert db.scalar(select(MarketIndicator)).value == Decimal(value)
    assert import_market(db, content, 'demo') == {'added': 0}
    assert db.scalar(select(func.count()).select_from(MarketIndicator)) == 1


def test_sqlite_unrepresentable_decimal_rejected_before_writes(db):
    # SQLite stores Numeric as a binary float: this valid Numeric(16,4) value
    # would reload as 999999999999.9998 instead of the supplied .9997.
    with pytest.raises(ValueError, match='precis'):
        import_market(db, csv_bytes(market_sample(), market_sample(date='2026-10-13', value='999999999999.9997')), 'demo')
    for model in (MarketIndicator, DataSource, LegalTopic):
        assert db.scalar(select(func.count()).select_from(model)) == 0


def test_market_conflict_rolls_back_earlier_valid_row(db):
    import_market(db, csv_bytes(market_sample()), 'demo')
    with pytest.raises(ValueError, match='conflitante'):
        import_market(db, csv_bytes(market_sample(date='2026-10-13'), market_sample(value='200')), 'demo')
    db.expire_all()
    assert db.scalar(select(func.count()).select_from(MarketIndicator)) == 1
    assert db.scalar(select(MarketIndicator)).value == Decimal('123.4567')
