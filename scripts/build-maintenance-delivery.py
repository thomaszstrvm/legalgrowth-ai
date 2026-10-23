"""Create the v0.1.5 maintenance report from local, synthetic QA evidence.

Requires the bundled reportlab/Pillow runtime. Run from the project root.
Render every PDF page with Poppler and inspect before delivery.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as PDFImage,
    Table, TableStyle, Preformatted,
)

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'output/maintenance-v58'
OUT = ROOT / 'output/pdf/LegalGrowth_Manutencao_v0.1.5.pdf'
INK, GREEN = colors.HexColor('#292a29'), colors.HexColor('#315747')
MUTED, LINE = colors.HexColor('#60625e'), colors.HexColor('#d8d9d4')


def build():
    summary = json.loads((QA / 'summary.json').read_text(encoding='utf-8'))
    assert summary['final_interactions'] == 21
    assert not summary['css_parity']['differences']
    review = ROOT / 'docs/THE-CRITIC-MAINTENANCE-V58.md'
    if not review.exists():
        raise RuntimeError('Independent review must be recorded before final delivery.')
    for name, filename in [('Body', 'segoeui.ttf'), ('Bold', 'segoeuib.ttf'),
                           ('Display', 'georgia.ttf'), ('Code', 'consola.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / filename)))
    pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')
    styles = {
        'body': ParagraphStyle('body', fontName='Body', fontSize=10.3, leading=15, textColor=INK, spaceAfter=10),
        'small': ParagraphStyle('small', fontName='Body', fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=8),
        'h1': ParagraphStyle('h1', fontName='Display', fontSize=27, leading=32, textColor=GREEN, spaceAfter=18),
        'h2': ParagraphStyle('h2', fontName='Bold', fontSize=13, leading=18, textColor=INK, spaceBefore=10, spaceAfter=8),
        'code': ParagraphStyle('code', fontName='Code', fontSize=8, leading=12, textColor=INK),
    }
    story = []
    def p(text, kind='body'):
        story.append(Paragraph(text, styles[kind]))
    def page(title):
        if story:
            story.append(PageBreak())
        p(title, 'h1')

    page('Clareza sem redesenhar')
    p('LEGALGROWTH / v0.1.5 / manutenção visual v58 / 23.10.2026', 'small')
    p('A manutenção preserva a base v0.1.4/v57. Concentra-se em datas visíveis, avisos menos repetitivos, consolidação gradual do CSS e sincronização do Impeccable.')
    p('O que foi analisado', 'h2')
    p('Antes de editar, foram identificados: metadados antigos do Impeccable; data de indicador disponível na API, mas recolhida nas evidências; avisos duplicados nas demonstrações; regras sobrepostas do bloco de conexão; e abortos de transição ainda sem causa determinada.')
    p('O que mudou', 'h2')
    p('<b>Ideias de conteúdo:</b> cada cartão identifica a data do indicador. Data ausente ou inválida recebe texto explícito, sem usar o período das campanhas como substituto.')
    p('<b>Demonstrações:</b> aviso central informa ficção, período fixo e ausência de execução. Notícias perde parágrafos duplicados; os avisos reais de cobertura, cobrança e agendamento permanecem.')
    p('<b>CSS:</b> o bloco de conexão de IAs agora tem um único proprietário em arc.css. A comparação de estilos calculados encontrou zero diferenças em 50 elementos, dez combinações de largura e tema.')
    p('O que permanece', 'h2')
    p('Período persistente; mês financeiro independente; despesas identificadas; avisos de cobrança e configuração compartilhada; CPQ/CPH; resultados antes dos dossiês; demonstrações isoladas. DESIGN.md, Newsreader/Manrope, cores, arte e tecnologia foram preservados.')
    p('Nenhuma chamada paga, benchmark ou dado real de cliente foi usado. APIs, banco e regras de negócio não foram modificados.', 'small')

    page('Antes e depois: avisos')
    p('Notícias, tema claro, 390 px. Recortes equivalentes do topo de capturas reais, com os mesmos dados sintéticos. O conteúdo completo continua disponível nas evidências locais.', 'small')
    temp = ROOT / 'tmp/pdfs/maintenance-v58'
    temp.mkdir(parents=True, exist_ok=True)
    images = []
    for label in ('before', 'after'):
        src = QA / label / 'news-light-390.png'
        target = temp / f'{label}.png'
        with Image.open(src) as im:
            im.crop((0, 0, im.width, min(1000, im.height))).save(target)
        images.append(PDFImage(str(target), width=240, height=240 * 1000 / 390))
    table = Table([[Paragraph('v57 / antes', styles['small']), Paragraph('v58 / depois', styles['small'])], images], colWidths=[251, 251])
    table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 11)]))
    story.append(table)

    page('Verificação e limites')
    rows = [
        ['Verificação', 'Resultado observado'],
        ['Python', '179 passaram; 6 avisos existentes'],
        ['Navegador: telas e estados', '156 grupos; ambos os temas; 11 páginas'],
        ['Interações finais', '21 passaram; nenhum erro JS inesperado'],
        ['Estilos do bloco consolidado', '50 elementos / 10 combinações idênticos'],
        ['Contexto temporal', 'Corridas, rascunho e escopo preservados'],
        ['Impeccable doctor', 'Nenhuma pendência; DESIGN.md intacto'],
    ]
    table = Table([[Paragraph(escape(cell), styles['small']) for cell in row] for row in rows], colWidths=[190, 312])
    table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, 0), 1, LINE), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
    story.append(table)
    p('A primeira matriz teve três falhas de expectativa literal: os testes procuravam a frase anterior do aviso. Ajustadas as expectativas, todas as 21 interações passaram. Os arquivos do produto não mudaram entre essas execuções.', 'small')
    p('Chrome: alerta mantido', 'h2')
    p('Chrome 155.0.8059.86 headless reproduziu 5 abortos nativos em 12 navegações dirigidas e 3 em 8 navegações da matriz completa. Destino, datas e escopo chegaram corretamente. Os testes mantêm saída 1: não são execuções globais verdes.')
    p('A causa raiz não foi determinada. A promessa finished pode resolver mesmo quando a animação foi omitida. Não foi aplicada supressão de erro nem mudança na transição de produção.')
    p('Revisão independente e detector', 'h2')
    # The independent review is authored by the coordinator from the critic's actual response.
    review_summary = (QA / 'critic-summary.txt').read_text(encoding='utf-8')
    p(escape(review_summary))
    p('Detector estático: 136 achados consultivos e quatro avisos sobre decoração/bordas existentes. Não foram tratados como defeitos funcionais ou apagados por troca de identidade. A matriz não certifica WCAG, leitor de tela ou aparelho físico.', 'small')
    p('<b>OCR:</b> interface técnica opcional apenas. Engine, isolamento, classificação por página e avaliação continuam pendentes; não integrado ou validado em produção.')

    page('Critérios e aprendizado')
    p('Taste Skill: apoio seletivo', 'h2')
    p('Foi lido o fluxo references/app-screens.md. Os critérios úteis foram contexto temporal perto da evidência, ausência distinta de zero, estados honestos, revisão móvel e avisos concisos. Não foram adotados sorteio de estilo, nova paleta, outras fontes ou regras de landing page.')
    p('A sugestão genérica de manter valores antigos no carregamento foi rejeitada: resultados de outro período não podem aparecer sob filtros novos. O projeto mantém o contexto aplicado separado dos campos em edição.')
    p('Uma função central', 'h2')
    code = '''function recommendationDate(r){
  if(r.category!=='mercado')return '';
  const date=r.evidence?.date;
  if(typeof date!=='string'||
     !window.LegalGrowthPeriod.validDate(date))
    return '<p class="rec-meta">Data do indicador não informada.</p>';
  return `<p class="rec-meta">Data do indicador:
    <time datetime="${esc(date)}">${dt(date)}</time></p>`;
}'''
    story.append(Preformatted(code, styles['code']))
    story.append(Spacer(1, 12))
    p('A saída antecipada restringe a categoria. O encadeamento opcional lê a evidência. O validador existente rejeita datas impossíveis. time mantém a data ISO legível por ferramentas; dt apresenta dia/mês/ano e esc protege o atributo. Não há consulta ou gravação adicional.')
    p('<b>Desafio:</b> teste 29/02/2024 e 29/02/2025; explique por que apenas uma data deve aparecer como time. A explicação linha por linha e os trade-offs estão em docs/MAINTENANCE-V58.md.')
    p('Fontes e evidências', 'h2')
    for text in [
        'Taste: github.com/Leonxlnx/taste-skill (skills/taste-skill/references/app-screens.md)',
        'Semântica: w3.org/TR/css-view-transitions-1/; fontes adicionais em docs/VIEW-TRANSITION-CHROME.md.',
        'Projeto: DESIGN.md; docs/MAINTENANCE-V58.md; docs/THE-CRITIC-MAINTENANCE-V58.md.',
        'Evidências locais: output/maintenance-v58/comparison.html, summary.json e manifestos. Fixtures sintéticas; output/ não é versionado.',
        'Auxiliar reproduzível: docs/design/impeccable-sidecar.json. Não integra a aplicação em produção.',
    ]:
        p(escape(text), 'small')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    def footer(c, doc):
        c.setStrokeColor(LINE); c.line(42, 35, A4[0]-42, 35)
        c.setFont('Body', 8); c.setFillColor(MUTED)
        c.drawString(42, 22, 'LegalGrowth | Manutenção verificada | v0.1.5')
        c.drawRightString(A4[0]-42, 22, str(doc.page))
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=46, leftMargin=46,
                            topMargin=40, bottomMargin=48, title='LegalGrowth - Manutenção v0.1.5', author='LegalGrowth')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT)


if __name__ == '__main__':
    build()
