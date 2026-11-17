"""Regressões da auditoria defensiva; somente dados sintéticos."""
from datetime import date

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.integrations import news

FEED = ('<?xml version="1.0"{enc}?>{dtd}<rss><channel><item><title>{title}</title>'
        '<link>https://jornalatos.com.br/a</link><pubDate>Tue, 03 Nov 2026 10:00:00 -0300</pubDate>'
        '<description>d</description></item></channel></rss>')
DTD = '<!DOCTYPE rss [<!ENTITY x "greve trabalhadores Cruzeiro">]>'
ARGS = (news.SOURCES[0], date(2026, 11, 2), date(2026, 11, 8), ['Cruzeiro-SP'])


def test_plain_utf8_feed_is_still_accepted():
    body = FEED.format(enc='', dtd='', title='Greve de trabalhadores em Cruzeiro').encode()
    assert len(news.parse_feed(body, *ARGS)[0]) == 1


@pytest.mark.parametrize('codec', ['utf-16', 'utf-16-le', 'utf-16-be', 'utf-32'])
def test_non_ascii_compatible_feed_cannot_hide_a_doctype(codec):
    body = FEED.format(enc=' encoding="utf-16"', dtd=DTD, title='&x;').encode(codec)
    with pytest.raises(ValueError):
        news.parse_feed(body, *ARGS)


def test_production_rejects_short_viewer_password_but_allows_disabled_viewer():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, app_env='production', admin_password='a' * 24, viewer_password='1')
    Settings(_env_file=None, app_env='production', admin_password='a' * 24, viewer_password='')
    Settings(_env_file=None, app_env='production', admin_password='a' * 24, viewer_password='b' * 24)
