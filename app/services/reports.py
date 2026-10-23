from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from io import BytesIO
from xml.sax.saxutils import escape
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from app.config import settings
from app.models import WeeklyReport, Recommendation, AgentExecution, NewsDigest
from app.repositories import metrics, audit
from app.services.metrics import summarize, groups
from app.services.finance import budget_summary
from app.agents.analysis import analyze


def last_week():
    today = datetime.now(ZoneInfo(settings.timezone)).date()
    return today - timedelta(days=today.weekday() + 7)


def generate_report(db, scope, week_start=None, actor='scheduler'):
    start = week_start or last_week()
    if start.weekday() != 0:
        raise ValueError('Informe uma segunda-feira como início da semana')
    existing = db.scalar(select(WeeklyReport).where(WeeklyReport.scope == scope, WeeklyReport.week_start == start))
    if existing:
        db.add(AgentExecution(scope=scope, agent='relatorio', status='skipped', detail=f'Semana {start} já registrada'))
        db.commit()
        return existing
    try:
        end = start + timedelta(days=6)
        analysis = analyze(db, scope, start, end, actor)
        rows = metrics(db, scope, start, end)
        previous = metrics(db, scope, start - timedelta(days=7), start - timedelta(days=1))
        current, prior = summarize(rows), summarize(previous)
        recs = list(db.scalars(select(Recommendation).where(Recommendation.scope == scope, Recommendation.status == 'pending', Recommendation.id.in_(analysis['recommendation_ids'])).order_by(Recommendation.id)))
        payload = {'scope': scope, 'demonstration': scope == 'demo', 'start': start.isoformat(), 'end': end.isoformat(), 'executive_summary': 'Análise descritiva de dados agregados. Conversões não equivalem a contratações. Dados ausentes não indicam ausência de atividade.', 'current': current, 'previous': prior, 'cost_delta': round(current['cost'] - prior['cost'], 2), 'areas': groups(rows, 'area'), 'campaigns': groups(rows, 'campaign'), 'localities': groups(rows, 'locality'), 'coverage': {'current_days': current['days'], 'previous_days': prior['days'], 'expected_days': 7}, 'financial': [budget_summary(db, scope, month) for month in sorted({start.strftime('%Y-%m'), end.strftime('%Y-%m')})], 'recommendations': [{'id': r.id, 'title': r.title, 'category': r.category, 'rationale': r.rationale, 'evidence': r.evidence, 'sufficiency': r.sufficiency, 'priority': r.priority, 'status': r.status, 'impact': r.impact} for r in recs], 'pending_approvals': len(recs), 'limitations': 'Sem inferência causal ou significância estatística; dados parciais e defasagens podem afetar comparações. Orçamento é saldo estimado, não controle de gastos do Google Ads. Relatório é snapshot imutável; pendências refletem o momento de geração.'}
        from app.services.news import for_week
        regional = for_week(db, start) if scope == 'real' else None
        if regional:
            payload['regional_news'] = regional.payload
            from app.services.strategy import opportunities
            payload['strategic_analysis'] = opportunities(regional.payload)
        report = WeeklyReport(scope=scope, week_start=start, payload=payload)
        db.add(report)
        db.add(AgentExecution(scope=scope, agent='relatorio', status='success', detail=f'Semana {start}'))
        audit(db, scope, actor, 'weekly_report', start.isoformat())
        db.commit()
        return report
    except IntegrityError:
        db.rollback()
        existing = db.scalar(select(WeeklyReport).where(WeeklyReport.scope == scope, WeeklyReport.week_start == start))
        if existing:
            return existing
        raise
    except Exception:
        db.rollback()
        db.add(AgentExecution(scope=scope, agent='relatorio', status='error', detail='Falha ao gerar relatório; nenhum conteúdo sensível registrado'))
        db.commit()
        raise


def money(value):
    return ('R$ {:,.2f}'.format(value)).replace(',', '_').replace('.', ',').replace('_', '.')


METRIC_LABELS = {
    'cost': 'Gasto com anúncios', 'impressions': 'Vezes que os anúncios apareceram',
    'clicks': 'Cliques nos anúncios', 'conversions': 'Ações marcadas no anúncio',
    'contacts': 'Contatos recebidos', 'qualified': 'Contatos com perfil para atendimento',
    'appointments': 'Atendimentos registrados', 'hires': 'Contratações registradas',
    'ctr': 'Cliques a cada cem exibições', 'cpc': 'Gasto médio por clique',
    'cpq': 'Gasto por contato com perfil adequado', 'cph': 'Gasto por contratação',
    'days': 'Dias com informações', 'rows': 'Registros recebidos',
}


def simple_recommendation(r):
    title, category = r['title'].lower(), r['category']
    if 'mensuração' in title:
        return ('Confira se os resultados estão sendo registrados', 'Houve gasto com anúncios, mas algumas ações esperadas não apareceram nos registros. Isso pode ser uma falha no acompanhamento; não significa, por si só, que ninguém se interessou.', 'Peça a quem cuida dos anúncios para conferir o registro dos resultados.')
    if 'cpc' in title:
        return ('Confira por que os cliques ficaram mais caros', 'O gasto médio para receber um clique aumentou em relação ao período anterior. Os dados não mostram a causa desse aumento.', 'Revise as buscas e os anúncios antes de aumentar o gasto.')
    if 'custo por contato' in title:
        return ('Confira o gasto para conseguir bons contatos', 'O gasto para receber contatos com perfil adequado aumentou. Ainda é preciso entender o motivo.', 'Confira as buscas que levam ao anúncio e se a página explica bem o serviço.')
    if category == 'qualidade':
        return ('Aguarde mais resultados antes de ampliar o gasto', 'Ainda há poucos resultados registrados para uma comparação segura.', 'Continue acompanhando os contatos até o atendimento e a contratação.')
    if category == 'palavras-chave':
        return ('Revise uma das buscas que levam ao anúncio', 'Uma busca teve gasto, mas nenhum contato com perfil adequado foi registrado.', 'Confira se essa busca tem relação com o serviço que o escritório oferece.')
    if category == 'orcamento':
        return ('Compare as áreas antes de dividir o dinheiro', 'As áreas podem trazer resultados diferentes. O escritório também precisa ter condições de atender os novos contatos.', 'Compare o gasto por contato e a disponibilidade da equipe antes de mudar o orçamento.')
    if category == 'geografia':
        return ('Compare os resultados das cidades', 'Vale conferir onde o dinheiro foi gasto e de onde vieram os contatos.', 'Mude os locais dos anúncios somente depois de revisar esses números.')
    if category == 'mercado':
        return ('Considere explicar um tema ao público', 'Há uma informação pública que pode ajudar a escolher um assunto para explicar. Ela não prova que haverá novos clientes.', 'Peça a um advogado para revisar o conteúdo antes de publicar.')
    return ('Revise esta sugestão com o responsável', 'Os dados levantaram um ponto que merece atenção. O resultado de qualquer mudança ainda precisa ser acompanhado.', 'Confira os números e decida com quem cuida das campanhas.')


def report_data(payload):
    """AI-ready export: allowlisted numbers, stable aliases, no original identity labels."""
    from app.services.ai import safe_metrics
    aliases = lambda field, prefix: {f'{prefix}{i:02}': safe_metrics(values) for i, (_, values) in enumerate(sorted(payload.get(field, {}).items()), 1)}
    suggestions = []
    for r in payload['recommendations']:
        title, why, action = simple_recommendation(r)
        e = r['evidence']
        suggestions.append({'id': r['id'], 'type': 'suggestion_not_prediction', 'title': title, 'explanation': why,
            'next_step': action, 'priority': r['priority'], 'start': e.get('start'), 'end': e.get('end'),
            'current': safe_metrics(e.get('current', e.get('metrics', {}))), 'previous': safe_metrics(e.get('previous', {})),
            'source': 'Resultados importados pelo responsável' if r['category'] != 'mercado' else 'Indicador público; consultar fonte no PDF local'})
    return {'schema_version': '1.0', 'document_type': 'weekly_campaign_report', 'language': 'pt-BR',
        'scope': payload['scope'], 'demonstration': payload['demonstration'],
        'period': {'start': payload['start'], 'end': payload['end'], 'previous_start': (datetime.fromisoformat(payload['start']) - timedelta(days=7)).date().isoformat(), 'previous_end': (datetime.fromisoformat(payload['start']) - timedelta(days=1)).date().isoformat()},
        'observed_data': {'current': safe_metrics(payload['current']), 'previous': safe_metrics(payload['previous']),
            'areas': {k: safe_metrics(v) for k, v in payload['areas'].items() if k in ('trabalhista', 'previdenciario')},
            'campaigns': aliases('campaigns', 'C'), 'cities': aliases('localities', 'L'), 'coverage': payload['coverage']},
        'financial': payload['financial'], 'suggestions': suggestions, 'projections': payload.get('regional_news', {}).get('scenarios', []),
        'regional_news': payload.get('regional_news'),
        'strategic_analysis': payload.get('strategic_analysis'),
        'metric_dictionary': {k: {'label': v, 'unit': 'BRL' if k in ('cost', 'cpc', 'cpq', 'cph') else 'percent' if k == 'ctr' else 'count'} for k, v in METRIC_LABELS.items()},
        'reading_rules': ['null significa que não é possível calcular ou não há informação.', 'Zero significa nenhum registro; não prova ausência de atividade.', 'Ações marcadas no anúncio não equivalem a contratações.', 'Sem receita e custos completos, não calcule lucro nem retorno financeiro.', 'Sugestões não são fatos nem previsões. Dados parciais limitam comparações.'],
        'privacy': {'campaign_and_city_names': 'replaced_with_report_local_aliases', 'identity_mapping_included': False, 'personal_records_included': False, 'note': 'Contém números reais agrupados; não é criptografia dos números nem garantia de anonimato absoluto.'}}


def report_pdf(payload):
    output = BytesIO()
    document = SimpleDocTemplate(output, title='LegalGrowth - Resultados da semana', rightMargin=42, leftMargin=42, topMargin=40, bottomMargin=42)
    styles = getSampleStyleSheet()
    styles['BodyText'].fontSize, styles['BodyText'].leading = 11, 16
    styles['Heading2'].fontSize, styles['Heading2'].leading = 16, 21
    styles['Heading3'].fontSize, styles['Heading3'].leading = 12, 17
    styles['Heading3'].fontName = 'Helvetica-Bold'
    story = []
    def para(text, style='BodyText'):
        paragraph = Paragraph(escape(str(text)), styles[style])
        paragraph.keepWithNext = style.startswith('Heading') or style == 'Title'
        story.append(paragraph)
        spacer = Spacer(1, 8)
        spacer.keepWithNext = style.startswith('Heading') or style == 'Title'
        story.append(spacer)
    def grid(headers, rows, widths):
        cells = [[Paragraph(escape(str(v)), styles['BodyText']) for v in row] for row in [headers] + rows]
        table = Table(cells, colWidths=widths, repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#edf1ec')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -1), .4, colors.HexColor('#d9dfd7')),
            ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
        story.extend([table, Spacer(1, 16)])
    def value(key, v):
        if v is None: return 'Sem informação'
        if key in ('cost', 'cpc', 'cpq', 'cph'): return money(v)
        return f'{v:,.2f}'.replace(',', '_').replace('.', ',').replace('_', '.') if isinstance(v, float) else str(v)
    def date_text(v):
        return datetime.fromisoformat(v).strftime('%d/%m/%Y')
    para('Como foi a semana', 'Title')
    para(f"{date_text(payload['start'])} a {date_text(payload['end'])}")
    if payload['demonstration']: para('EXEMPLO COM DADOS FICTÍCIOS. Estes não são os resultados do seu escritório.')
    current, previous = payload['current'], payload['previous']
    para('O que aconteceu', 'Heading2')
    if current.get('rows'):
        para(f"Foram gastos {money(current['cost'])} em anúncios. O escritório registrou {current['contacts']} contatos, {current['qualified']} com perfil para atendimento e {current['hires']} contratações.")
        para('Esses números mostram o que foi registrado. Eles não mostram, sozinhos, se houve lucro.')
    else:
        para('Não há resultados registrados nesta semana. Adicione as informações das campanhas para saber como foi o período.')
    if current.get('days', 0) < 7 or previous.get('days', 0) < 7:
        para(f"Atenção: temos informações de {current.get('days', 0)} dias desta semana e de {previous.get('days', 0)} dias da anterior. Por isso, a comparação pode estar incompleta.")
    grid(['Resultado', 'Nesta semana', 'Semana anterior'], [[METRIC_LABELS[k], value(k, current.get(k)), value(k, previous.get(k)) if previous.get('rows') else 'Sem informação'] for k in ('cost', 'contacts', 'qualified', 'hires')], [220, 130, 130])
    para('O que fazer agora', 'Heading2')
    if not payload['recommendations']:
        para('Nenhum novo ponto para revisar foi encontrado nos dados disponíveis. Continue acompanhando os resultados.')
    for index, r in enumerate(payload['recommendations'], 1):
        block_start = len(story)
        title, why, action = simple_recommendation(r)
        para(f'{index}. {title}', 'Heading3')
        para(why)
        para('Próximo passo: ' + action)
        story[block_start:] = [KeepTogether(story[block_start:])]
    para('Financeiro: quanto ainda pode ser gasto', 'Heading2')
    for f in payload['financial']:
        para(f"No mês {f['month'][5:]}/{f['month'][:4]}, o orçamento previsto é de {money(f['planned'])}. Os anúncios importados somam {money(f['imported_ads'])}, e as outras despesas registradas somam {money(f['manual_expenses'])}.")
        para(f"Com esses registros, o saldo estimado é de {money(f['balance'])}. Confira se todas as despesas foram adicionadas.")
        if f.get('software_expenses'): para(f"Ferramentas e IA: {money(f['software_expenses'])}, fora da verba de mídia.")
        if f['alerts']: para('Atenção ao orçamento: o gasto já se aproxima ou ultrapassou o valor previsto.')
    para('Antes de mudar alguma coisa', 'Heading2')
    para('Confira os registros com quem cuida dos anúncios. Nenhuma sugestão deste relatório altera campanhas ou promete novos clientes. Este painel também não interrompe gastos no Google Ads.')
    regional = payload.get('regional_news')
    if regional:
        para('O que apareceu nas notícias da região', 'Heading2')
        para(regional.get('message', 'Confira as fontes antes de decidir.'))
        for scenario in regional.get('scenarios', []):
            para(scenario['title'], 'Heading3')
            para('O que foi noticiado: ' + scenario['observation'])
            para('Uma possibilidade para acompanhar: ' + scenario['scenario'])
            para('O que observar: ' + scenario['watch_next'])
            for article in regional.get('articles', []):
                if article['id'] in scenario['article_ids']:
                    para(f"Fonte: {article['source']} - {date_text(article['published'])}. {article['url']}")
        if not regional.get('scenarios'):
            para('Ainda não há cenários revisados para apresentar. Notícias isoladas não permitem prever quantos clientes procurarão o escritório.')
    strategic = payload.get('strategic_analysis')
    if strategic:
        para('Oportunidades, Impacto Social e Potencial Financeiro', 'Heading2')
        for item in strategic['opportunities']:
            para(item['title'], 'Heading3')
            para('Benefício social: dados insuficientes. Potencial financeiro: dados insuficientes.')
            para(item['devils_advocate'])
            para(item['question'])
        para(strategic['notice'])
    para('A seguir estão os números usados nas sugestões. Consulte essa parte quando quiser conferir uma informação.')
    from reportlab.platypus import PageBreak
    story.append(PageBreak())
    para('Os números, em detalhe', 'Title')
    para('Um clique é quando alguém clica no anúncio. Um contato com perfil adequado é alguém que o escritório considera apto para atendimento. Uma ação marcada no anúncio depende da configuração do acompanhamento e não significa uma contratação.')
    grid(['O que foi contado', 'Nesta semana', 'Semana anterior'], [[label, value(k, current.get(k)), value(k, previous.get(k)) if previous.get('rows') else 'Sem informação'] for k, label in METRIC_LABELS.items() if k not in ('days', 'rows')], [220, 130, 130])
    for index, r in enumerate(payload['recommendations'], 1):
        e = r['evidence']
        para(f"Dados da sugestão {index}", 'Heading2')
        for k, label in [('campaign', 'Campanha'), ('keyword', 'Busca relacionada'), ('source', 'De onde veio a informação')]:
            if e.get(k):
                text = e[k]
                if k == 'source' and payload['demonstration']: text = 'Exemplo fictício fornecido com o painel'
                elif k == 'source' and str(text).startswith('CSV'): text = 'Arquivo de resultados enviado ao painel'
                para(f'{label}: {text}')
        if e.get('start') and e.get('end'): para(f"Período analisado: {date_text(e['start'])} a {date_text(e['end'])}.")
        values, prior = e.get('current', e.get('metrics')), e.get('previous') or {}
        if isinstance(values, dict):
            grid(['O que foi contado', 'Período analisado', 'Período anterior'], [[METRIC_LABELS[k], value(k, values.get(k)), value(k, prior.get(k))] for k in ('cost', 'clicks', 'conversions', 'qualified', 'hires', 'cpc', 'cpq') if k in values], [220, 130, 130])
        for field, label in [('areas', 'Área'), ('localities', 'Cidade')]:
            if isinstance(e.get(field), dict):
                for name, vals in e[field].items():
                    shown = {'trabalhista': 'Trabalhista', 'previdenciario': 'Previdenciária'}.get(name, name)
                    para(f"{label}: {shown}. Gasto: {money(vals.get('cost', 0))}. Contatos com perfil adequado: {vals.get('qualified', 0)}. Contratações: {vals.get('hires', 0)}.")
        if e.get('unit'):
            unit = 'exemplo fictício, sem representar a realidade' if payload['demonstration'] else e['unit']
            para(f"O indicador da fonte passou de {value('value', prior.get('value'))} para {value('value', e.get('value'))} ({unit}). Isso é apenas uma pista para escolher assuntos; não é uma previsão de clientes.")
    para('Sobre este relatório', 'Heading2')
    para('Os números ficam como estavam quando o relatório foi criado. Informações adicionadas depois não mudam este arquivo. Falta de registro não significa falta de atividade. Uma mudança nos números não explica, por si só, o motivo da mudança.')
    def footer(canvas, doc):
        canvas.setFont('Helvetica', 9)
        canvas.drawString(42, 24, 'LegalGrowth | Resultados da semana')
        canvas.drawRightString(550, 24, str(doc.page))
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()
