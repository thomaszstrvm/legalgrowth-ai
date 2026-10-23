"""Bounded public RSS collector. No arbitrary hosts, redirects, article scraping or paywalls."""
import hashlib
import re
import unicodedata
from datetime import datetime
from zoneinfo import ZoneInfo
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from urllib.parse import urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree as ET
import httpx

SOURCES = (
    {'id': 'atos', 'name': 'Jornal Atos', 'base': 'https://jornalatos.com.br', 'feed': '/feed/', 'pages': 6, 'states': ('SP',)},
    {'id': '012news', 'name': '012 News', 'base': 'https://www.012news.com.br', 'feed': '/feed/', 'pages': 6, 'states': ('SP',)},
    {'id': 'classelider', 'name': 'Jornal Classe Líder', 'base': 'https://classelider.com', 'feed': '/feed/', 'pages': 1, 'states': ('SP',)},
)
USER_AGENT = 'LegalGrowthNews/1.0 (public RSS reader; weekly)'
TOPICS = {'trabalho': ('Emprego e trabalho', ('demiss', 'empreg', 'salari', 'trabalh', 'greve', 'ferias coletivas', 'sindicat', 'vagas', 'industria', 'fabrica')),
          'previdencia': ('Aposentadoria e benefícios', ('aposent', 'previden', 'inss', 'beneficio', 'bpc', 'pensao', 'loas'))}


def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text.lower()) if not unicodedata.combining(c))


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.skip = [], 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)


def plain(value):
    parser = PlainText()
    parser.feed(value or '')
    return ' '.join(' '.join(parser.parts).split())


def bounded_get(client, url, limit=2_000_000):
    # Callers construct URLs only from the fixed catalog. Links inside feeds are never fetched.
    with client.stream('GET', url) as response:
        if response.status_code != 200:
            raise ValueError('HTTP ' + str(response.status_code))
        data = bytearray()
        for chunk in response.iter_bytes():
            data.extend(chunk)
            if len(data) > limit: raise ValueError('Feed maior que o limite de leitura')
        return bytes(data)


def parse_feed(content, source, start, end, cities):
    cities = [city for city in cities if not source.get('states') or city.rsplit('-', 1)[-1] in source['states']]
    if b'<!DOCTYPE' in content.upper() or b'<!ENTITY' in content.upper():
        raise ValueError('Estrutura XML não permitida')
    root = ET.fromstring(content)
    if root.tag != 'rss': raise ValueError('Formato de fonte não reconhecido')
    articles, dated, skipped = [], [], 0
    allowed_host = urlsplit(source['base']).hostname.removeprefix('www.')
    for item in root.findall('./channel/item'):
        try:
            published = parsedate_to_datetime(item.findtext('pubDate', ''))
            if published.tzinfo is None: raise ValueError()
            day = published.astimezone(ZoneInfo('America/Sao_Paulo')).date()
            dated.append(day)
        except (ValueError, TypeError, OverflowError):
            skipped += 1
            continue
        if not start <= day <= end: continue
        title = plain(item.findtext('title', ''))[:220]
        description = plain(item.findtext('description', ''))[:1500]
        categories = ' '.join(item.itertext())[:10000] if not title else ' '.join(item.findtext('category', '').split())
        text = normalized(title + ' ' + description + ' ' + categories)
        matched_cities = [city for city in cities if re.search(r'\b' + re.escape(normalized(city.rsplit('-', 1)[0])) + r'\b', text)]
        if not matched_cities or any(x in text for x in ('brasileirao', 'mineirao', 'libertadores', 'cruzeiro esporte clube')): continue
        topics = [key for key, (_, words) in TOPICS.items() if any(word in text for word in words)]
        if not topics: continue
        url = urlsplit(item.findtext('link', '').strip())
        if url.scheme != 'https' or not url.hostname or url.hostname.removeprefix('www.') != allowed_host or url.username or url.password: continue
        canonical = urlunsplit((url.scheme, url.netloc, url.path, '', ''))
        if not title: continue
        articles.append({'id': hashlib.sha256(canonical.encode()).hexdigest()[:16], 'title': title,
            'url': canonical, 'source': source['name'], 'source_id': source['id'], 'published': day.isoformat(),
            'excerpt': ' '.join(description.split()[:20]), 'cities': matched_cities, 'topics': topics,
            'basis': 'Título e breve trecho do feed público; reportagem completa não coletada'})
    return articles, dated, skipped


def collect(start, end, cities):
    articles, checks = {}, []
    for source in SOURCES:
        check = {'id': source['id'], 'name': source['name'], 'url': source['base'], 'status': 'unavailable', 'complete_window': False, 'items_found': 0, 'undated_skipped': 0}
        source_cities = [city for city in cities if not source.get('states') or city.rsplit('-', 1)[-1] in source['states']]
        if not source_cities:
            check['note'] = 'O catálogo atual acompanha fontes do Vale do Paraíba, em SP; não cobre as UFs selecionadas.'
            checks.append(check)
            continue
        try:
            with httpx.Client(timeout=httpx.Timeout(12, connect=6), follow_redirects=False, trust_env=False, headers={'User-Agent': USER_AGENT}) as client:
                robots = bounded_get(client, source['base'] + '/robots.txt', 128000).decode('utf-8', errors='replace')
                rules = RobotFileParser(); rules.parse(robots.splitlines())
                for page in range(1, source['pages'] + 1):
                    url = source['base'] + source['feed'] + (f'?paged={page}' if page > 1 else '')
                    if not rules.can_fetch(USER_AGENT, url): raise ValueError('Leitura não permitida pela fonte')
                    found, dates, skipped = parse_feed(bounded_get(client, url), source, start, end, source_cities)
                    check['undated_skipped'] += skipped
                    for article in found: articles.setdefault(article['id'], article)
                    check['items_found'] += len(found)
                    check['status'] = 'read'
                    if dates and min(dates) <= start:
                        check['complete_window'] = True
                        break
                    if not dates: break
        except (httpx.HTTPError, ValueError, ET.ParseError):
            check['status'] = 'partial' if check['status'] == 'read' else 'unavailable'
            check['note'] = 'A fonte não respondeu ou não permitiu a leitura. Nenhum bloqueio foi contornado.'
        checks.append(check)
    # Also remove exact headline copies; counts represent publications, not independent events.
    seen, selected = set(), []
    for article in sorted(articles.values(), key=lambda a: (a['published'], a['id']), reverse=True):
        fingerprint = normalized(article['title'])
        if fingerprint in seen: continue
        seen.add(fingerprint); selected.append(article)
    return selected[:40], checks, len(selected) > 40
