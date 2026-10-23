import json
from datetime import date
from xml.sax.saxutils import escape
import httpx
import pytest
from app.integrations import news as feeds, openai, claude
from app.models import Configuration, NewsDigest
from app.services import news
from test_ai import vault
from test_insights import two_connections

START, END = date(2026, 10, 12), date(2026, 10, 18)
SOURCE = {'id':'atos','name':'Jornal Atos','base':'https://jornalatos.com.br','feed':'/feed/','pages':1}


def rss(title='Cruzeiro anuncia vagas de emprego', link='https://jornalatos.com.br/vagas/', published='Tue, 13 Oct 2026 12:00:00 +0000'):
    return f'<rss><channel><item><title>{escape(title)}</title><link>{escape(link)}</link><pubDate>{published}</pubDate><description>Oportunidades de emprego em Cruzeiro. Mais informações no portal.</description></item></channel></rss>'.encode()


def article():
    return feeds.parse_feed(rss(),SOURCE,START,END,['Cruzeiro-SP'])[0][0]


@pytest.fixture
def collected(monkeypatch, db):
    db.add(Configuration(scope='real', localities=['Cruzeiro-SP']))
    db.commit()
    calls=[]
    def collect(start,end,cities):
        calls.append((start,end,cities))
        return [article()], [{'id':'atos','name':'Jornal Atos','url':SOURCE['base'],'status':'read','complete_window':True}], False
    monkeypatch.setattr(feeds,'collect',collect)
    return calls


def test_rss_filters_date_city_topic_and_links():
    records,dates,skipped=feeds.parse_feed(rss(),SOURCE,START,END,['Cruzeiro-SP'])
    assert len(records)==1 and records[0]['topics']==['trabalho'] and skipped==0
    assert len(records[0]['excerpt'].split())<=20
    for url in ['http://localhost/private','https://evil.invalid/','javascript:alert(1)','https://x:y@jornalatos.com.br/vagas']:
        assert not feeds.parse_feed(rss(link=url),SOURCE,START,END,['Cruzeiro-SP'])[0]
    assert not feeds.parse_feed(rss(),SOURCE,START,END,['Lavrinhas-SP'])[0]
    assert not feeds.parse_feed(rss(published='Fri, 23 Oct 2026 12:00:00 +0000'),SOURCE,START,END,['Cruzeiro-SP'])[0]
    assert feeds.parse_feed(rss(published='bad'),SOURCE,START,END,['Cruzeiro-SP'])[2]==1


def test_news_dates_follow_brasilia_and_html_is_stripped():
    records,_,_=feeds.parse_feed(rss(title='<script>bad()</script>Cruzeiro abre vagas',published='Mon, 19 Oct 2026 01:00:00 +0000'),SOURCE,START,END,['Cruzeiro-SP'])
    assert records[0]['published']=='2026-10-18'
    assert 'bad()' not in records[0]['title']
    with pytest.raises(ValueError): feeds.parse_feed(b'<!DOCTYPE rss><rss/>',SOURCE,START,END,['Cruzeiro-SP'])


def test_robots_block_stops_feed_request(monkeypatch):
    original=httpx.Client;calls=[]
    def respond(request):
        calls.append(str(request.url))
        return httpx.Response(200,text='User-agent: *\nDisallow: /')
    monkeypatch.setattr(feeds,'SOURCES',(SOURCE,))
    monkeypatch.setattr(feeds.httpx,'Client',lambda **kw: original(**kw,transport=httpx.MockTransport(respond)))
    articles,checks,_=feeds.collect(START,END,['Cruzeiro-SP'])
    assert not articles and checks[0]['status']=='unavailable'
    assert calls==[SOURCE['base']+'/robots.txt']


def test_collector_uses_only_catalog_and_deduplicates(monkeypatch):
    original=httpx.Client;calls=[]
    def respond(request):
        calls.append(str(request.url))
        return httpx.Response(200,text='User-agent: *\nDisallow:' if request.url.path=='/robots.txt' else rss().decode())
    monkeypatch.setattr(feeds,'SOURCES',({**SOURCE,'pages':2},))
    monkeypatch.setattr(feeds.httpx,'Client',lambda **kw: original(**kw,transport=httpx.MockTransport(respond)))
    articles,checks,truncated=feeds.collect(START,END,['Cruzeiro-SP'])
    assert len(articles)==1 and checks[0]['status']=='read' and not truncated
    assert len(calls)==3 and all('jornalatos.com.br' in url for url in calls)
    assert not any('/vagas/' in url for url in calls)


def test_weekly_digest_is_idempotent_without_ai(db,collected):
    first=news.run(db,week_start=START,use_ai=False)
    second=news.run(db,week_start=START,use_ai=False)
    assert first['id']==second['id'] and len(collected)==1
    assert first['status']=='collected' and first['signals'][0]['previous_count'] is None
    assert not first['scenarios']


@pytest.mark.parametrize('verdict',['supported','unsupported','uncertain'])
def test_scenarios_require_second_review(db,collected,two_connections,monkeypatch,verdict):
    a=article();calls=[]
    def analyst(key,instructions,content,schema):
        calls.append('openai')
        assert a['id'] in content
        return {'scenarios':[{'id':'one','title':'Acompanhar mudanças no emprego','observation':'O jornal divulgou oportunidades de emprego na cidade.','scenario':'Se novas vagas continuarem aparecendo, pode haver mais dúvidas sobre direitos no trabalho.','watch_next':'Acompanhe novas publicações e confira as fontes oficiais.','article_ids':[a['id']]}]}
    def review(key,instructions,content,schema):
        calls.append('claude')
        return {'verdicts':[{'finding_id':'one','verdict':verdict,'reason':'Conferência dos trechos fornecidos.'}]}
    monkeypatch.setattr(openai,'structured',analyst);monkeypatch.setattr(claude,'structured',review)
    result=news.run(db,week_start=START)
    assert calls==['openai','claude'] and result['status']=='reviewed'
    assert len(result['scenarios'])==(1 if verdict=='supported' else 0)


def test_review_failure_preserves_articles_without_projection(db,collected,two_connections,monkeypatch):
    monkeypatch.setattr(openai,'structured',lambda *args: {'scenarios':[]})
    monkeypatch.setattr(claude,'structured',lambda *args: (_ for _ in ()).throw(openai.AIError('private raw error')))
    result=news.run(db,week_start=START)
    assert result['status']=='unverified' and len(result['articles'])==1 and not result['scenarios']
    assert 'private raw error' not in str(result)


def test_news_api_scope_and_json(client,db,collected):
    result=news.run(db,week_start=START,use_ai=False)
    assert client.get('/api/news?scope=demo').json()['latest'] is None
    assert client.post('/api/news?scope=demo').status_code==422
    response=client.get(f"/api/news/{result['id']}/json")
    assert response.status_code==200 and response.json()['document_type']=='public_regional_news'
