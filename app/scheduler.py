import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import settings
from app.db import SessionLocal
from app.services.reports import generate_report


def scheduled_reports():
    for scope in ('demo', 'real'):
        try:
            with SessionLocal() as db:
                generate_report(db, scope)
        except Exception:
            logging.getLogger('legalgrowth').error('{"event":"scheduled_report_failed","scope":"%s"}', scope)


def make_scheduler():
    scheduler = BackgroundScheduler(timezone=settings.timezone)
    scheduler.add_job(scheduled_reports, 'cron', day_of_week=settings.report_day, hour=settings.report_hour, minute=settings.report_minute, id='weekly', replace_existing=True, max_instances=1, coalesce=True, misfire_grace_time=3600)
    return scheduler
