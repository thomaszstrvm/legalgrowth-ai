from decimal import Decimal
import pandas as pd


def ratio(numerator, denominator):
    return round(float(numerator / denominator), 4) if denominator else None


def summarize(rows):
    fields = ['impressions', 'clicks', 'conversions', 'contacts', 'qualified', 'appointments', 'hires']
    result = {key: sum(getattr(row, key) for row in rows) for key in fields}
    cost = sum((row.cost for row in rows), Decimal('0'))
    result.update(cost=float(cost), ctr=ratio(result['clicks'] * 100, result['impressions']), cpc=ratio(cost, result['clicks']), cpq=ratio(cost, result['qualified']), cph=ratio(cost, result['hires']), rows=len(rows), days=len({r.day for r in rows}))
    return result


def groups(rows, dimension):
    grouped = {}
    for row in rows:
        key = row.campaign.name if dimension == 'campaign' else row.campaign.area if dimension == 'area' else getattr(row, dimension)
        grouped.setdefault(str(key), []).append(row)
    return {key: summarize(value) for key, value in grouped.items()}


def evolution(rows):
    if not rows:
        return []
    frame = pd.DataFrame([{'date': r.day.isoformat(), 'cost': float(r.cost), 'clicks': r.clicks} for r in rows])
    return frame.groupby('date', as_index=False).sum().to_dict('records')
