"""Build the reviewed v0.1.4 delivery PDF; no API, secrets or customer data.

Bundled Python has reportlab/pypdf/Pillow. Use --draft while evidence is pending.
Final output requires completed browser evidence and the independent review file.
Render all seven pages with Poppler and inspect before sharing any generated PDF.
"""
from argparse import ArgumentParser
from pathlib import Path
from xml.sax.saxutils import escape
import json

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
W, H = A4
M = 40
CW = W - M * 2
INK = colors.HexColor('#24372e')
MUTED = colors.HexColor('#54625a')
GREEN = colors.HexColor('#315747')
LINE = colors.HexColor('#d7ded7')
PAPER = colors.HexColor('#f7f8f3')
SOFT = colors.HexColor('#e8eee6')


def register_fonts():
    fonts = Path('C:/Windows/Fonts')
    for name, filename in [('Body', 'segoeui.ttf'), ('Bold', 'segoeuib.ttf'),
                           ('Display', 'georgia.ttf'), ('Code', 'consola.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(fonts / filename)))
    pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')


class Report:
    def __init__(self, output, draft):
        self.c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
        self.c.setTitle('LegalGrowth - Revisão implementada v0.1.4')
        self.c.setAuthor('LegalGrowth | Relatório técnico de entrega')
        self.draft = draft
        self.n = 0

    def text(self, text, x, y, width=CW, size=10.5, leading=15.5, font='Body', color=INK):
        style = ParagraphStyle('text', fontName=font, fontSize=size, leading=leading,
                               textColor=color, spaceAfter=0, allowWidows=0, allowOrphans=0)
        p = Paragraph(text, style)
        _, height = p.wrap(width, H)
        if y - height < 45:
            raise ValueError(f'Content overflow on page {self.n}: {text[:70]}')
        p.drawOn(self.c, x, y - height)
        return y - height

    def page(self, section, title, subtitle):
        if self.n:
            self.c.showPage()
        self.n += 1
        self.c.setFillColor(PAPER)
        self.c.rect(0, 0, W, H, fill=1, stroke=0)
        self.text('LEGALGROWTH  /  ENTREGA v0.1.4', M, H - 27, size=8, leading=10, font='Bold', color=GREEN)
        self.c.setStrokeColor(LINE)
        self.c.line(M, 39, W-M, 39)
        self.c.setFont('Body', 7.5)
        self.c.setFillColor(MUTED)
        label = 'RASCUNHO - evidência final pendente' if self.draft else '23/10/2026  |  Dados sintéticos  |  Limites documentados'
        self.c.drawString(M, 26, label)
        self.c.drawRightString(W-M, 26, f'{self.n:02d} / 07')
        self.text(section.upper(), M, H-63, size=8.5, leading=11, font='Bold', color=GREEN)
        y = self.text(title, M, H-84, size=27, leading=31, font='Display')
        y = self.text(subtitle, M, y-14, size=10.5, color=MUTED)
        return y-24

    def heading(self, text, y):
        return self.text(text, M, y, size=14, leading=19, font='Bold')-9

    def paragraph(self, text, y, gap=13):
        return self.text(text, M, y)-gap

    def rows(self, rows, y, label_width=142):
        for label, body in rows:
            self.c.setStrokeColor(LINE)
            self.c.line(M, y, W-M, y)
            left = self.text(escape(label), M, y-11, label_width-12, size=10, leading=14, font='Bold')
            right = self.text(body, M+label_width, y-11, CW-label_width, size=10, leading=14)
            y = min(left, right)-13
        return y-8

    def screenshot(self, path, y, title, crop_height=650):
        """Place an unmodified screenshot clipped to its original upper viewport."""
        path = Path(path)
        if not path.exists():
            if not self.draft:
                raise FileNotFoundError(path)
            return self.paragraph('Captura final ainda indisponível: '+escape(path.name), y)
        iw, ih = Image.open(path).size
        visible = min(crop_height, ih)
        scale = CW/iw
        height = visible*scale
        self.text(title, M, y, size=9, leading=12, font='Bold')
        y -= 19
        c=self.c
        c.saveState()
        clip=c.beginPath();clip.rect(M,y-height,CW,height)
        c.clipPath(clip,stroke=0,fill=0)
        c.drawImage(str(path),M,y-ih*scale,width=CW,height=ih*scale)
        c.restoreState()
        c.setStrokeColor(LINE);c.rect(M,y-height,CW,height,fill=0,stroke=1)
        return y-height-17

    def save(self):
        if self.n != 7:
            raise ValueError('Expected exactly seven designed pages.')
        self.c.save()


def build(draft=False, critic_summary=''):
    final_dir=ROOT/'output/validator-review/final'
    evidence_path=final_dir/'results.json'
    critic_path=ROOT/'docs/THE-CRITIC-VALIDATOR-REVIEW.md'
    evidence=json.loads(evidence_path.read_text(encoding='utf-8')) if evidence_path.exists() else None
    if not draft:
        if not evidence or not critic_path.exists() or not critic_summary.strip():
            raise ValueError('Final browser evidence, critic document and confirmed summary are required.')
        if any(evidence.get(key) for key in ('failures','errors','unexpected','changedDuringRun')):
            raise ValueError('Final browser evidence has failures, unexpected requests or changing sources.')
    target=ROOT/('tmp/pdfs/validator-delivery/draft.pdf' if draft else 'output/pdf/LegalGrowth_Revisao_Implementada_v0.1.4.pdf')
    target.parent.mkdir(parents=True,exist_ok=True)
    register_fonts();r=Report(target,draft)

    y=r.page('01 / Resultado da entrega','Mais clareza para decidir.','Uma revisão operacional do LegalGrowth, preservando a identidade editorial, os cálculos e os limites de segurança.')
    y=r.paragraph('O ponto de partida foi uma auditoria externa de <b>17 páginas</b>. Seus achados foram comparados com o código atual antes de alterar a aplicação: correções posteriores foram preservadas e capacidades já existentes não foram apresentadas como novidades.',y)
    y=r.rows([
      ('CONTEXTO', 'O período acompanha a navegação. Orçamento usa mês; relatórios usam semana. Datas ainda em edição não mudam uma consulta já aplicada.'),
      ('LEITURA', 'Indicadores e pontos de atenção chegam antes da galeria. A comparação de campanhas mostra eficiência junto aos valores principais.'),
      ('TRANSPARÊNCIA', 'Conexões de IA são compartilhadas. Exemplos fictícios não acionam provedores; ações de análise podem ter cobrança, mesmo em demo.'),
      ('FRONTEIRA DE SEGURANÇA', 'Contratos reais continuam bloqueados. Unlimited-OCR recebeu avaliação e contrato opcional desativado, sem instalação ou inferência.'),
    ],y)
    y=r.heading('O que permanece reconhecível',y)
    y=r.paragraph('Newsreader e Manrope, verdes e neutros, gravuras dos dossiês, dois temas e navegação por teclado. Evidências nas recomendações e distinção entre conversões e contratações continuam centrais.',y)
    y=r.paragraph('<b>Resultado de engenharia, não promessa de produção.</b> Testes sintéticos e inspeção visual sustentam esta entrega. Não substituem avaliação com usuários, leitor de tela, dispositivos físicos ou documentos reais.',y)
    r.paragraph('O AGENTS.md agora registra a entrega de PDF para trabalhos substanciais. O projeto permanece privado no GitHub; este documento não confirma o envio desta revisão ao repositório remoto.',y)

    y=r.page('02 / Antes e depois - P2-01','A tarefa vem primeiro.','A galeria foi preservada como navegação complementar. O Resumo agora apresenta contexto, resultados e atenção antes da coleção de dossiês.')
    before=ROOT/'output/design-review/design-engineering-v1/round2-pages/overview-light-1366.png'
    after=final_dir/'overview-light-1440.png'
    y=r.screenshot(before,y,'ANTES | v56 - desktop de 1366 px',crop_height=650)
    y=r.screenshot(after,y,'DEPOIS | v57 - desktop de 1440 px',crop_height=650)
    r.paragraph('Capturas reais da aplicação com dados sintéticos. Recortes dos primeiros 650 px, ajustados à mesma largura editorial; as resoluções e fixtures diferem. A comparação mostra prioridade de conteúdo, não desempenho nem igualdade de números.',y,gap=0)

    y=r.page('03 / Contexto - P1-01, P1-02, P1-06 e P2-02','Cada calendário tem um papel.','A URL registra o contexto aplicado; a memória da sessão é separada entre dados do escritório e demonstração.')
    y=r.rows([
      ('INTERVALO', '<b>Resumo, Campanhas, Recomendações e Insights.</b> Início e fim seguem nos links, na recarga e no histórico. Área pertence apenas a Campanhas.'),
      ('MÊS', '<b>Orçamento.</b> Um seletor mensal corresponde à API existente. Ao vir da análise, usa o mês da data final; não altera o intervalo analítico salvo.'),
      ('SEMANA', '<b>Relatórios.</b> Segunda-feira a domingo, com as duas datas visíveis. Cada arquivo retrata o momento em que foi criado e não se atualiza sozinho.'),
    ],y)
    y=r.heading('Um erro discreto que precisava de teste',y)
    y=r.paragraph('Antes da correção, uma consulta de setembro podia terminar enquanto o usuário editava agosto. A resposta era de setembro, mas os campos ainda não aplicados podiam entrar na URL. Agora existe um <b>estado aplicado separado do rascunho</b>. Consultas, links e análises usam o mesmo contexto confirmado.',y)
    y=r.heading('Prevenção e recuperação',y)
    y=r.paragraph('Datas vazias, inexistentes, invertidas ou além do limite de 366 dias recebem mensagem específica junto ao campo. O filtro permanece aberto, o foco ajuda a corrigir e resultados antigos são retirados. “Tentar novamente” é reservado a falhas transitórias; repetir uma leitura não repete uma gravação confirmada.',y)
    y=r.heading('Comparação que ajuda a investigar',y)
    r.paragraph('Custo por contato qualificado e por contratação aparecem na comparação principal, inclusive no celular. Os valores vêm do backend. Zero é diferente de ausência; divisão por zero não vira eficiência fictícia. Menor custo, sozinho, não comprova qualidade ou retorno financeiro.',y)

    y=r.page('04 / Clareza operacional','Promessas do tamanho da capacidade.','Melhorias de apresentação explicam o comportamento existente, sem reescrever regras financeiras nem tornar configurações compartilhadas em simulação.')
    y=r.rows([
      ('ORÇAMENTO E GASTOS', '<b>P1-03/04.</b> A lista informa até 100 despesas recentes de todos os meses. Saldo de mídia, software e alocação legada são diferenciados; valores e fórmulas foram preservados.'),
      ('IA E CUSTOS', '<b>P1-05.</b> Conexões e limite pertencem à instalação. A reserva interna não é a fatura do fornecedor. Dados fictícios não tornam uma análise externa gratuita.'),
      ('RECOMENDAÇÕES', '<b>P2-03.</b> Revisar evidências recebe prioridade. Cabeçalhos identificam área, cidade ou período corretamente. Aprovar registra uma decisão; não altera anúncios.'),
      ('RELATÓRIOS', '<b>P2-04.</b> PDF é o formato principal para leitura; JSON tem uma única ação identificada por arquivo. A lista mostra semana completa e ações empilhadas no celular.'),
      ('EXEMPLOS', '<b>P2-05.</b> Notícias, Oportunidades e Insights oferecem conteúdo fixo claramente fictício. Não há jornal real inventado, execução fictícia registrada como IA real ou demo usada para esconder falha.'),
      ('CONTRATOS', '<b>P2-06.</b> A interface diz demonstração e “Formato conferido”. Mantém página de origem, justificativa e alternativas; não afirma identidade ou validade jurídica.'),
    ],y)
    y=r.paragraph('<b>P2-07 / manutenção:</b> regras substituídas do Resumo e downloads foram removidas e tokens de escala reutilizados. CSS legado fora desse escopo permanece.',y)
    r.paragraph('<b>Preservado:</b> autenticação, autorização, escape de texto, CSP, proteção de credenciais, separação de escopos e bloqueio de ingestão real. A revisão não autoriza anunciar conformidade integral de acessibilidade ou segurança.',y)

    y=r.page('05 / Unlimited-OCR','Contrato preparado. Motor desativado.','Viável como adaptador futuro; compatibilidade local e qualidade em contratos brasileiros continuam condicionadas a uma prova de conceito separada.')
    y=r.paragraph('A documentação Baidu apresenta imagens e múltiplas páginas. A receita específica do vLLM exige configuração e código próprios. O nome “Unlimited” não elimina limites de tokens, páginas, pixels, memória ou tempo. Não foi instalado modelo nem alterado driver.',y)
    y=r.rows([
      ('ENTREGUE AGORA', '<b>OcrProvider</b>, página e resultado imutáveis, estados explícitos e verificação de documento/página. A única implementação entregue retorna indisponibilidade.'),
      ('AINDA NÃO ENTREGUE', 'Worker isolado, proibição efetiva de saída para internet, cancelamento e timeout forçado, limites de CPU/RAM/VRAM, limpeza, retenção e autorização por documento.'),
      ('COMPATIBILIDADE', 'O registro do Windows contém uma RX 9070 XT e outros adaptadores; isso não confirma a GPU ativa nem inferência. Suporte AMD do runtime não comprova suporte de todos os kernels do modelo.'),
      ('LICENÇAS', 'Código e modelo publicam MIT. Dependências precisam de avaliação própria: PyMuPDF informa AGPL ou licença comercial. Nenhum componente pesado foi adicionado.'),
    ],y)
    y=r.heading('Fluxo futuro proposto',y)
    y=r.paragraph('<b>Classificar cada página → aproveitar texto digital → OCR só onde necessário → preservar origem → conferir formatos e divergências → revisão humana.</b> O PDF misto precisa de classificação por página; o sinal atual é global e continua limitado.',y)
    r.paragraph('A futura prova usa documentos sintéticos: texto digital, scan, rotação, baixa qualidade, tabelas, campos ausentes e valores conflitantes. Deve medir acerto exato, omissões, invenções, origem, tempo e memória. Confiança de OCR nunca comprova identidade ou validade jurídica.',y)

    y=r.page('06 / Evidências e ressalvas','Verificado, com limites explícitos.','Os números abaixo distinguem execução automatizada, capturas e opinião independente. Uma nota visual não substitui teste funcional.')
    final_text=(f"<b>{evidence.get('passed')} grupos aprovados e {evidence.get('captures')} capturas.</b> {len(evidence.get('requests', []))} GET simulados; nenhum erro, mutação real ou acesso externo. Arquivos monitorados permaneceram estáveis durante a execução." if evidence and not draft else 'Matriz final em andamento. Contagem e fechamento aguardam confirmação; não usar este rascunho como evidência final.')
    y=r.rows([
      ('PYTHON', '<b>179 testes aprovados.</b> Seis avisos de depreciação existentes: Starlette/httpx, Alembic e pypdf. Leitura do .env desativada; banco de teste.'),
      ('MATRIZ INICIAL', '<b>172 grupos aprovados, 160 capturas.</b> Onze páginas, cinco larguras (320/390/768/1024/1440), dois temas e estados sintéticos. Dados de uma etapa anterior às correções finais.'),
      ('MATRIZ FINAL', final_text),
      ('GALERIA', '<b>14 grupos e 68 capturas.</b> Foco por teclado, movimento reduzido, 14 pares de contraste e links sem JavaScript. Evidência separada da matriz de páginas.'),
      ('REGRESSÕES DIRETAS', 'Calendário e exemplos sem rede; consulta atrasada e contexto aplicado; dois POSTs de análise simulados; recuperação de gravação e foco em quatro combinações de tela/tema.'),
    ],y)
    y=r.heading('Parecer independente',y)
    y=r.paragraph(escape(critic_summary) if critic_summary else 'A revisão final do visual_critic ainda não foi incorporada. Esta seção será fechada apenas após confirmação do parecer e das correções.',y)
    r.paragraph('<b>O que estes testes não certificam:</b> usabilidade com pessoas, leitor de tela, navegador/hardware móvel real, todos os navegadores, precisão OCR ou operação com clientes reais. O teste de 200% emula reflow em viewport 720 × 450 com DPR 2; não é zoom real do navegador. Nenhuma chamada paga ou inferência OCR foi realizada.',y)

    y=r.page('07 / Aprendizado e continuidade','Entender para manter.','Uma função pequena protege a coerência do filtro antes de consultar. O backend continua validando: JavaScript pode ser ignorado pelo cliente.')
    code=[
      'function validate(start, end) {',
      "  if (!validDate(start)) return {field:'start', message:'...'};",
      "  if (!validDate(end)) return {field:'end', message:'...'};",
      "  if (start > end) return {field:'end', message:'...'};",
      "  if ((Date.parse(end)-Date.parse(start))/86400000 > 366)",
      "    return {field:'end', message:'...'};",
      '  return null;',
      '}',
    ]
    y=r.text('<br/>'.join(escape(line).replace(' ', '&#160;') for line in code),M,y,size=8.2,leading=12,font='Code')-12
    y=r.paragraph('Trecho didático de period-context.js; mensagens abreviadas apenas nesta página.',y,gap=14)
    y=r.rows([
      ('LINHAS 1-3', 'Recebem início/fim e recusam datas inválidas. O retorno indica o campo; não existe consulta, gravação ou chamada de IA.'),
      ('LINHA 4', 'Após validar AAAA-MM-DD, a comparação textual segue a ordem temporal. Sem ela, um intervalo negativo poderia passar pelo limite seguinte.'),
      ('LINHAS 5-6', 'Convertem a diferença UTC de milissegundos em dias e comparam com 366. Sem validar antes, valores inválidos poderiam produzir NaN.'),
      ('LINHAS 7-8', 'null indica ausência de erro. O chamador pode aplicar o estado; caso contrário mantém o formulário e associa foco e mensagem ao campo.'),
    ],y,label_width=105)
    y=r.heading('Seu desafio',y)
    y=r.paragraph('Crie um teste com intervalo que atravesse fevereiro de um ano bissexto. Explique por que o cálculo não deve depender do fuso do navegador. Depois identifique o teste que protege um rascunho editado enquanto uma consulta está lenta. Não altere a API.',y)
    y=r.heading('Fontes e reprodução',y)
    r.text('Registro: docs/VALIDATOR-REVIEW.md. Decisões: ADR 010 e ADR 011. OCR: docs/UNLIMITED-OCR.md. Parecer: docs/THE-CRITIC-VALIDATOR-REVIEW.md. Evidência: output/validator-review/final/results.json.<br/><br/>Fontes primárias: <link href="https://github.com/baidu/Unlimited-OCR" color="#315747">Baidu / Unlimited-OCR</link>, <link href="https://recipes.vllm.ai/baidu/Unlimited-OCR" color="#315747">receita vLLM</link>, <link href="https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright" color="#315747">licenciamento PyMuPDF</link>. Consulte o documento OCR para AMD, modelo e fontes completas.<br/><br/>Gerador reproduzível: scripts/build-validator-delivery.py. Testes de navegador exigem servidor local, mocks e autenticação local; credenciais nunca fazem parte deste PDF.',M,y,size=8.2,leading=11.5,color=MUTED)
    r.save()
    from pypdf import PdfReader
    reader=PdfReader(target)
    if len(reader.pages)!=7 or any(not (page.extract_text() or '').strip() for page in reader.pages):
        raise ValueError('Missing page content in generated PDF.')
    print(json.dumps({'pdf':str(target),'pages':len(reader.pages),'draft':draft},ensure_ascii=False))
    return target


if __name__=='__main__':
    parser=ArgumentParser(description=__doc__)
    parser.add_argument('--draft',action='store_true',help='Generate only a draft under tmp/pdfs.')
    parser.add_argument('--critic-summary',default='',help='Confirmed concise verdict, without inventing a score.')
    args=parser.parse_args()
    build(args.draft,args.critic_summary)
