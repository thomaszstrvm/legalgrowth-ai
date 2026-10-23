"""Build the v59 PDF from synthetic before/after screenshots; render before delivery."""
from pathlib import Path
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'output/dossier-position-v59'
OUT = ROOT / 'docs/releases/LegalGrowth_Dossies_v0.1.6.pdf'


def build():
    result = json.loads((QA / 'after/results.json').read_text(encoding='utf-8'))
    assert len(result['checks']) == 119 and not result['failures']
    for name, file in [('Body', 'segoeui.ttf'), ('Bold', 'segoeuib.ttf'), ('Display', 'georgia.ttf')]:
        pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/' + file))
    pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')
    ink, green = colors.HexColor('#292a29'), colors.HexColor('#315747')
    styles = {
        'body': ParagraphStyle('body', fontName='Body', fontSize=10, leading=15, spaceAfter=10, textColor=ink),
        'small': ParagraphStyle('small', fontName='Body', fontSize=8.5, leading=12, spaceAfter=8, textColor=ink),
        'title': ParagraphStyle('title', fontName='Display', fontSize=27, leading=32, spaceAfter=16, textColor=green),
        'h2': ParagraphStyle('h2', fontName='Bold', fontSize=12, leading=17, spaceBefore=10, spaceAfter=8, textColor=green),
    }
    story = []
    def p(text, kind='body'):
        story.append(Paragraph(text, styles[kind]))
    def page(title):
        if story:
            story.append(PageBreak())
        p(title, 'title')
    def picture(path, width, height):
        return Image(str(QA / path), width=width, height=height, kind='proportional')

    page('Dossiês em primeiro plano')
    p('LEGALGROWTH / v0.1.6 · visual v59 / 23.10.2026', 'small')
    p('A coleção real agora vem imediatamente após o contexto e os indicadores, antes das recomendações, gráficos, tabelas e orçamento. O ajuste preserva a identidade e a interação 3D já existentes.')
    p('O que mudou', 'h2')
    p('O include Jinja foi movido no DOM. O palco perdeu apenas respiros excedentes: galeria desktop de 444 para 424 px e celular de 330 para 312 px. A ação “Ver indicadores” conserva o destino nativo anterior. Capas, ilustrações, Newsreader/Manrope, temas, JavaScript, APIs e regras de negócio permanecem iguais.')
    rows = [['Largura', 'Coleção antes', 'Coleção depois'], ['1440 px', '1535 px', '447 px'], ['768 px', '2290 px', '540 px'], ['390 px', '2665 px', '679 px'], ['320 px', '2844 px', '722 px']]
    table = Table(rows, colWidths=[155, 155, 155])
    table.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'Body'),('FONTNAME',(0,0),(-1,0),'Bold'),('FONTSIZE',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('LINEBELOW',(0,0),(-1,0),1,green),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#d8d9d4'))]))
    story.append(table)
    story.append(Spacer(1,12))
    p('Mesmos dados sintéticos e período 01–30/09/2026. Valores arredondados no tema claro/Demo. Não são medições de campanhas reais.', 'small')
    p('Referências e compromisso', 'h2')
    p('A Ferrari foi observada ao vivo: imagem dominante, seleção manual e ação associada ao item. O princípio aplicado é o protagonismo da coleção. Arc continua a referência espacial das capas. Não foram copiados assets, código, vídeo, paleta ou autoplay.')
    p('Dar prioridade aos dossiês desloca as análises para baixo. Em 1440×900, vê-se o início e grande parte das capas; o CTA inferior requer pequena rolagem. No celular, a coleção vem imediatamente após os indicadores, sem prometer que tudo caiba na primeira tela.')

    page('Antes e depois · mesmo contexto')
    p('1440×900, tema claro. Capturas do navegador, sem montagem dos componentes.', 'small')
    p('ANTES · análises antecediam a coleção', 'h2')
    story.append(picture('before/opening-demo-1440-light.png', 497, 275))
    p('DEPOIS · dossiês logo após os indicadores', 'h2')
    story.append(picture('after/opening-demo-1440-light.png', 497, 275))

    page('Dois temas, mesma coleção')
    p('Detalhes da cena no celular: 390 px claro e 320 px escuro. As capturas incluem a capa ativa, ação de abertura e controles adjacentes.', 'small')
    story.append(Table([[picture('after/scene-demo-390-light.png', 242, 355), picture('after/scene-real-320-dark.png', 242, 430)]], colWidths=[249,249], style=[('VALIGN',(0,0),(-1,-1),'TOP')]))
    p('Parecer independente', 'h2')
    p('THE CRITIC aprovou o reposicionamento, após 14 capturas iniciais e seis finais. Não apontou regressão visual que exigisse nova correção. Nota contextual 9,0/10, sem alegação de perfeição ou certificação geral do produto.')
    p('Ressalva preexistente: sem JavaScript, a faixa começa por Orçamento e o CTA estático continua “Abrir Campanhas”. Os links funcionam, mas a associação pode ser ambígua. Registrada para manutenção separada; não foi alterada nesta solicitação.')

    page('Testes, limites e aprendizado')
    for title, text in [
        ('Matriz final', '119 verificações aprovadas em 16 combinações: quatro larguras, dois temas e dois escopos. Mais fallback sem JavaScript. 50 PNGs finais; zero erros de página, console ou requisições inesperadas nessa execução.'),
        ('Interações e regressão', '179 testes Python aprovados, com seis avisos de depreciação. Regras de período, exemplos estáticos e corrida de respostas aprovados. Suíte final da cena: 14 grupos aprovados, incluindo foco, teclas, transição, erro/repetição, fallback e 14 pares de contraste de pelo menos 4,5:1.'),
        ('ViewTransition', 'A execução inicial da matriz registrou um aborto; uma execução complementar registrou dois. A repetição final não reproduziu erros. Logs foram mantidos e as asserções continuam falhando se houver abortos. Isso não demonstra resolução da causa raiz.'),
        ('Segurança e limites', 'APIs interceptadas por fixtures sintéticas; nenhuma chamada paga ou dado real. Não houve nova auditoria funcional completa das demais páginas nem certificação em Safari/dispositivo físico. OCR continua separado e não validado em produção.'),
        ('Por que mover o include?', 'A ordem do HTML determina a sequência de leitura e foco. Reordenar só com CSS poderia divergir da navegação assistiva. A cena permanece fora de #content para não ser destruída a cada renderização dos dados.'),
        ('Desafio de estudo', 'Explique por que order: -1 no CSS não garante a mesma sequência para um leitor de tela. Proponha uma asserção de teste que detecte a divergência.'),
    ]:
        p(title, 'h2'); p(text)
    p('Documentação: DESIGN.md; docs/DOSSIER-POSITION-V59.md; docs/THE-CRITIC-DOSSIER-V59.md. Referências: ferrari.com/en-BR e arcmarumo.com. Comparação local: output/dossier-position-v59/comparison.html. A pasta output é ignorada no Git; PDF e evidências resumidas são versionados.', 'small')
    def footer(canvas, doc):
        canvas.setFont('Body',8); canvas.setFillColor(green)
        canvas.drawString(46,24,'LegalGrowth · v0.1.6 · dados sintéticos')
        canvas.drawRightString(A4[0]-46,24,str(doc.page))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=46, rightMargin=46, topMargin=38, bottomMargin=42, title='LegalGrowth — Dossiês em evidência v0.1.6', author='LegalGrowth').build(story,onFirstPage=footer,onLaterPages=footer)
    print(OUT)


if __name__ == '__main__':
    build()
