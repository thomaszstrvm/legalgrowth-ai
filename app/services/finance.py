from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import select
from app.models import Budget, Expense
from app.repositories import metrics

DEFAULT_ALLOCATIONS = {'trabalhista': 1400, 'previdenciario': 600, 'infraestrutura': 0, 'reserva': 0}


def month_bounds(month):
    start = date.fromisoformat(month + '-01')
    following = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
    return start, following - timedelta(days=1)


def budget_summary(db, scope, month):
    start, end = month_bounds(month)
    budget = db.scalar(select(Budget).where(Budget.scope == scope, Budget.month == month))
    total = budget.total if budget else Decimal('2000')
    allocations = budget.allocations if budget else DEFAULT_ALLOCATIONS
    rows = metrics(db, scope, start, end)
    ads = sum((r.cost for r in rows), Decimal('0'))
    expenses = list(db.scalars(select(Expense).where(Expense.scope == scope, Expense.day >= start, Expense.day <= end)))
    software = sum((e.amount for e in expenses if e.category == 'infraestrutura'), Decimal('0'))
    manual = sum((e.amount for e in expenses if e.category != 'infraestrutura'), Decimal('0'))
    spent = ads + manual
    percent = float(spent / total * 100)
    return {'month': month, 'planned': float(total), 'allocations': allocations, 'imported_ads': float(ads), 'manual_expenses': float(manual), 'software_expenses': float(software), 'software_in_media_budget': False, 'legacy_software_allocation': float(allocations.get('infraestrutura', 0)), 'spent': float(spent), 'balance': float(total - spent), 'consumed_percent': round(percent, 2), 'alerts': [n for n in (80, 90, 100) if percent >= n], 'by_area': {area: float(sum((r.cost for r in rows if r.campaign.area == area), Decimal('0'))) for area in ('trabalhista', 'previdenciario')}, 'estimated': True}
