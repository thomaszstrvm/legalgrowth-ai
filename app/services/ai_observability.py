"""Bounded operational metadata only; never retain request/response bodies or keys."""
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
import logging
from time import perf_counter

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import AICall


_active = ContextVar('ai_call_observation', default=None)
_logger = logging.getLogger(__name__)
TOKEN_FIELDS = ('input_tokens', 'output_tokens', 'total_tokens', 'cache_read_tokens', 'cache_creation_tokens')
OPERATIONS = frozenset({'connection_check', 'priorities', 'insights_analysis', 'insights_review', 'news_analysis', 'news_review'})


@dataclass
class Observation:
    attempted: bool = False
    tokens: dict = field(default_factory=lambda: dict.fromkeys(TOKEN_FIELDS))


def mark_request():
    """Called immediately before HTTP, after the privacy gateway has accepted input."""
    active = _active.get()
    if active is not None:
        active.attempted = True


def _count(value):
    # bool is an int subclass; explicitly reject it and values outside SQL BIGINT.
    return value if type(value) is int and 0 <= value <= 2**63 - 1 else None


def capture_usage(result, provider):
    """Copy only documented numeric usage fields. Missing is unknown, never zero."""
    active = _active.get()
    if active is None or not isinstance(result, dict) or not isinstance(result.get('usage'), dict):
        return
    usage = result['usage']
    for name in ('input_tokens', 'output_tokens', 'total_tokens'):
        active.tokens[name] = _count(usage.get(name))
    if provider == 'openai':
        details = usage.get('input_tokens_details')
        active.tokens['cache_read_tokens'] = _count(details.get('cached_tokens')) if isinstance(details, dict) else None
        active.tokens['cache_creation_tokens'] = _count(details.get('cache_write_tokens')) if isinstance(details, dict) else None
    else:
        active.tokens['cache_read_tokens'] = _count(usage.get('cache_read_input_tokens'))
        active.tokens['cache_creation_tokens'] = _count(usage.get('cache_creation_input_tokens'))


@contextmanager
def observe_call(db, provider, operation, scope=None):
    """One observation per logical provider call; callers keep their existing quota."""
    from app.services.ai import PROVIDERS
    if provider not in PROVIDERS or operation not in OPERATIONS or scope not in (None, 'demo', 'real'):
        raise ValueError('Invalid observation dimensions')
    observation = Observation()
    token = _active.set(observation)
    started = perf_counter()
    status = 'success'
    try:
        yield
    except Exception as exc:
        status = 'timeout' if getattr(exc, 'status', None) == 504 else 'error'
        raise
    finally:
        elapsed_ms = max(0, round((perf_counter() - started) * 1000))
        _active.reset(token)
        # Independent transaction: domain rollback must not erase a paid attempt,
        # and recording telemetry must not commit pending domain changes.
        try:
            with Session(bind=db.get_bind()) as telemetry:
                telemetry.add(AICall(provider=provider, model=PROVIDERS[provider].MODEL,
                    operation=operation, scope=scope, status=status, latency_ms=elapsed_ms,
                    attempted=observation.attempted, **observation.tokens))
                telemetry.commit()
        except SQLAlchemyError:
            # Never retry a paid request, mask its outcome, or log exception bodies.
            _logger.warning('AI call metadata could not be persisted')
