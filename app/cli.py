import argparse
import csv
import io
import secrets
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path


def init():
    path = Path('.env')
    if not path.exists():
        path.write_text('APP_ENV=development\nDATABASE_URL=sqlite:///./legalgrowth.db\nADMIN_PASSWORD='+secrets.token_urlsafe(24)+'\nVIEWER_PASSWORD='+secrets.token_urlsafe(24)+'\nSCHEDULER_ENABLED=false\n', encoding='utf-8')
        print('Credenciais locais criadas em .env; consulte o arquivo, não o publique.')
    from alembic.config import Config
    from alembic import command
    command.upgrade(Config('alembic.ini'), 'head')
    print('Banco atualizado por Alembic.')


def seed():
    from app.schemas import MetricRow, MarketRow
    from app.services.imports import import_campaigns, import_market
    from app.db import SessionLocal
    examples = Path('examples')
    examples.mkdir(exist_ok=True)
    today = datetime.now(ZoneInfo('America/Sao_Paulo')).date()
    output = io.StringIO(newline='')
    writer = csv.DictWriter(output, fieldnames=MetricRow.model_fields)
    writer.writeheader()
    for n in range(90):
        day = today - timedelta(days=89-n)
        for area, name, keyword, cost in [('trabalhista','Horizonte Laboral DEMO','verbas rescisórias',34),('previdenciario','Aurora Previdência DEMO','aposentadoria por idade',18)]:
            clicks=12+n%9
            writer.writerow({'scope':'demo','date':day.isoformat(),'campaign_id':'demo-'+area,'campaign':name,'area':area,'locality':'Cruzeiro-SP','keyword':keyword,'impressions':300+n%100,'clicks':clicks,'cost':cost+(n%5)*.25,'conversions':0 if area=='trabalhista' and n>75 else 2,'contacts':3,'qualified':2 if n%3 else 1,'appointments':1,'hires':1 if n%5==0 else 0})
    content=output.getvalue().encode('utf-8')
    (examples/'campaigns_demo.csv').write_bytes(content)
    market=io.StringIO(newline='')
    writer=csv.DictWriter(market, fieldnames=MarketRow.model_fields)
    writer.writeheader()
    for days,value in [(60,100),(30,105),(0,110)]:
        writer.writerow({'scope':'demo','date':(today-timedelta(days=days)).isoformat(),'source':'Fonte sintética DEMO','source_url':'https://example.invalid/demo','accessed':today.isoformat(),'topic':'Aposentadoria por idade','area':'previdenciario','locality':'Cruzeiro-SP','value':value,'unit':'índice sintético sem valor empírico'})
    content_market=market.getvalue().encode('utf-8')
    (examples/'market_demo.csv').write_bytes(content_market)
    with SessionLocal() as db:
        print(import_campaigns(db,content,'demo','cli'))
        print(import_market(db,content_market,'demo','cli'))
    print('90 dias fictícios importados exclusivamente em demo.')


def main():
    parser=argparse.ArgumentParser(description='LegalGrowth AI')
    parser.add_argument('command',choices=['init','seed','report','news'])
    parser.add_argument('--scope',choices=['demo','real'],default='real')
    parser.add_argument('--collect-only',action='store_true',help='Coletar notícias sem chamadas pagas de IA')
    parser.add_argument('--refresh',action='store_true',help='Refazer a coleta da semana; pode consumir nova consulta de IA')
    args=parser.parse_args()
    if args.command=='init':
        init()
    elif args.command=='seed':
        seed()
    elif args.command=='news':
        if args.scope != 'real':
            parser.error('Notícias públicas são registradas somente no ambiente real.')
        from app.db import SessionLocal
        from app.services.news import run
        import json
        with SessionLocal() as db:
            result=run(db,actor='weekly_news',refresh=args.refresh,use_ai=not args.collect_only)
            print(json.dumps({'id':result['id'],'week_start':str(result['week_start']),'status':result['status'],'articles':len(result['articles'] or []),'scenarios':len(result['scenarios'] or []),'message':result['message']},ensure_ascii=False))
    else:
        from app.db import SessionLocal
        from app.services.reports import generate_report, report_pdf, report_data
        import json
        with SessionLocal() as db:
            report=generate_report(db,args.scope,actor='cli')
            path=Path('output/pdf');path.mkdir(parents=True,exist_ok=True)
            stem=path/f'relatorio-{args.scope}-{report.week_start}'
            stem.with_suffix('.pdf').write_bytes(report_pdf(report.payload))
            stem.with_suffix('.json').write_text(json.dumps(report_data(report.payload),ensure_ascii=False,indent=2),encoding='utf-8')
            print(f'Relatório {report.id}: {stem}')


if __name__=='__main__':
    main()
