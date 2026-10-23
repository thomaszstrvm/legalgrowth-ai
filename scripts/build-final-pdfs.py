"""Two separate final deliverables: technical closure and client presentation.

Uses local product fonts and actual synthetic browser captures. No external assets.
Run with reportlab/Pillow runtime, then render and inspect every PDF page.
"""
from pathlib import Path
import json
import sys
from PIL import Image as PILImage
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
QA = ROOT / 'output/closure-v60'
SHOTS = QA / 'presentation'
PAPER, INK, MUTED, GREEN, LINE = '#f7f8f5', '#292a29', '#535c50', '#315747', '#d8d9d4'


class Document:
    def __init__(self, path, size, title, client=False):
        self.w, self.h = size
        self.c = canvas.Canvas(str(path), pagesize=size)
        self.c.setTitle(title); self.c.setAuthor('LegalGrowth')
        self.client = client; self.page = 0

    def rect(self, x, y, w, h, color):
        self.c.setFillColor(colors.HexColor(color))
        self.c.rect(x, self.h-y-h, w, h, stroke=0, fill=1)

    def line(self, x, y, x2, y2, color=LINE):
        self.c.setStrokeColor(colors.HexColor(color)); self.c.setLineWidth(1)
        self.c.line(x, self.h-y, x2, self.h-y2)

    def text(self, text, x, y, width, size=22, font='Manrope', color=INK, leading=None):
        style = ParagraphStyle('copy', fontName=font, fontSize=size, leading=leading or size*1.35, textColor=colors.HexColor(color))
        p = Paragraph(text, style)
        _, height = p.wrap(width, self.h)
        assert y+height <= self.h-12, (self.page, text[:70], y+height)
        p.drawOn(self.c, x, self.h-y-height)
        return height

    def image(self, path, x, y, w, h, crop=None):
        im = PILImage.open(path).convert('RGB')
        if crop:
            im = im.crop(crop)
        scale = min(w/im.width, h/im.height)
        iw, ih = im.width*scale, im.height*scale
        self.c.drawImage(ImageReader(im),x+(w-iw)/2,self.h-y-ih,width=iw,height=ih)
        return ih

    def new(self, title=None, subtitle=None):
        if self.page: self.c.showPage()
        self.page += 1
        self.rect(0,0,self.w,self.h,PAPER)
        if self.client:
            self.text('LegalGrowth',48,25,230,18,'Newsreader',GREEN)
            self.text('Demonstração · dados fictícios',890,29,340,12,color=MUTED)
            self.line(48,58,self.w-48,58)
            self.text(str(self.page).zfill(2),self.w-74,self.h-30,30,12,color=MUTED)
            if title:self.text(title,48,80,self.w-96,44,'Newsreader',leading=49)
            if subtitle:self.text(subtitle,50,142,self.w-100,19,color=MUTED)
        else:
            self.text('LegalGrowth · encerramento técnico · v0.1.7 / v60',40,24,self.w-80,9,color=MUTED)
            self.line(40,45,self.w-40,45)
            self.text(str(self.page),self.w-60,self.h-29,20,9,color=MUTED)
            if title:self.text(title,40,65,self.w-80,27,'Newsreader',leading=31)
            if subtitle:self.text(subtitle,40,107,self.w-80,10,color=MUTED)

    def save(self): self.c.save()


def client_pdf():
    path = OUT / 'LegalGrowth_Apresentacao_Cliente.pdf'
    d = Document(path,(1280,720),'LegalGrowth — apresentação do produto',True)

    d.new()
    d.text('Seus resultados de marketing,<br/>em contexto.',48,91,1130,57,'Newsreader',leading=62)
    d.text('Um painel para acompanhar campanhas, organizar gastos e revisar próximos passos do escritório.',50,234,1120,24)
    d.image(SHOTS/'overview-detail-light.png',48,326,1184,316)
    d.text('Conheça o produto com exemplos fictícios. Nenhum resultado apresentado é de um escritório real.',50,656,1140,14,color=MUTED)

    d.new('O que precisa ficar claro','Informações reunidas para apoiar a leitura do que já aconteceu.')
    for y,title,copy in [(213,'Quanto foi investido?','Acompanhe gastos com anúncios e o orçamento escolhido para o mês.'),(355,'Quais contatos avançaram?','Leia contatos qualificados e contratações conforme os registros do escritório.'),(497,'O que merece revisão?','Compare campanhas, organize evidências e registre decisões antes de agir.')]:
        d.line(50,y-16,1230,y-16)
        d.text(title,50,y,490,34,'Newsreader')
        d.text(copy,600,y+4,600,23)

    d.new('Dos registros à decisão','Uma rotina de leitura, conferência e acompanhamento.')
    items=[('Organizar','Importe os resultados agrupados das campanhas.'),('Selecionar','Escolha o período e o ambiente de dados.'),('Conferir','Leia indicadores, campanhas e pontos para revisar.'),('Decidir','Avalie as evidências e faça os ajustes necessários.')]
    for i,(title,copy) in enumerate(items):
        x=50+i*300
        d.text(title,x,230,265,31,'Newsreader',GREEN)
        d.text(copy,x,293,260,21)
        if i<3:d.line(x+260,251,x+285,251,GREEN)
    d.rect(48,460,1184,164,'#eef1eb')
    d.text('O controle continua com você.',76,480,1080,34,'Newsreader')
    d.text('O painel não altera anúncios nem publica conteúdo automaticamente. As decisões exigem conferência humana.',76,537,1080,23)

    d.new('Três números para começar','O Resumo mantém o período visível antes da coleção de dossiês.')
    d.image(SHOTS/'metrics-light.png',48,202,1184,266)
    for i,(title,copy) in enumerate([('Gasto em anúncios','Quanto foi registrado em mídia no período selecionado.'),('Contatos qualificados','Pessoas classificadas pelo atendimento como compatíveis com o perfil esperado.'),('Contratações','Contratações registradas pelo escritório. Cliques e conversões não são contratações.')]):
        x=50+i*400;d.text(title,x,503,365,25,'Newsreader');d.text(copy,x,551,365,19)

    d.new('Dossiês do escritório','Cinco capas para abrir as áreas do sistema, logo depois dos indicadores.')
    d.image(SHOTS/'overview-detail-light.png',48,198,1184,445)
    d.text('Navegação visual por Campanhas, Orçamento, Relatórios, Insights e Oportunidades. Não é gestão de processos jurídicos.',50,657,1170,15,color=MUTED)

    d.new('Campanhas e orçamento','Compare resultados e acompanhe o limite mensal escolhido pelo escritório.')
    d.image(SHOTS/'campaigns-detail-light.png',48,194,1184,290)
    d.image(SHOTS/'finance-detail-light.png',48,494,1184,132)
    d.text('Mês do orçamento e período das campanhas são independentes. Ferramentas e IA aparecem separadas dos gastos de mídia.',50,645,1160,17,color=MUTED)

    d.new('Relatórios para ler e compartilhar','Um retrato da semana, preservado no momento da criação.')
    d.image(SHOTS/'reports-detail-light.png',60,204,1160,420)
    d.text('PDF para leitura. Exportação estruturada para outra ferramenta ou IA. Novos registros não alteram automaticamente um relatório salvo.',50,646,1160,17,color=MUTED)

    d.new('IA como apoio. Revisão humana como etapa.','Conclusões acompanhadas de evidências para você conferir.')
    d.text('Uma IA analisa.<br/>Outra confere.',50,219,450,37,'Newsreader',GREEN)
    d.text('Insights reais dependem das conexões OpenAI e Claude. A segunda revisão ajuda a conferir conclusões, mas também pode errar.',50,343,425,23)
    d.text('As telas desta apresentação usam exemplos estáticos. Nenhuma IA foi executada para produzi-los.',50,528,425,19,color=MUTED)
    # Remove only the empty right side of the actual captured article.
    d.image(SHOTS/'insight-example-light.png',523,236,705,300,crop=(0,0,1900,540))
    d.line(523,574,1230,574)
    d.text('A leitura final e qualquer mudança nos anúncios continuam sob responsabilidade do escritório.',523,595,700,20)

    d.new('Notícias e oportunidades, com contexto','Observe assuntos públicos e avalie possibilidades de conteúdo educativo.')
    for y,title,copy in [(222,'Região escolhida','Selecione as cidades atendidas. A cobertura depende das fontes disponíveis; não é garantida para toda localidade.'),(358,'Fontes antes de conclusões','Consulte notícias e limites de cobertura. Os cenários são hipóteses para acompanhar, não previsões garantidas.'),(503,'Relevância antes de ação','Avalie utilidade para o público e capacidade do escritório. Uma notícia não mede procura por serviços jurídicos.')]:
        d.line(50,y-18,1230,y-18);d.text(title,50,y,400,30,'Newsreader');d.text(copy,495,y,720,22)
    d.text('A demonstração usa notícias inventadas. Coleta, revisão por IA e agendamento dependem de configuração.',50,651,1170,16,color=MUTED)

    d.new('Uma rotina prática de acompanhamento','Um exemplo de uso — a frequência pode acompanhar a rotina do escritório.')
    steps=[('Preparar','Atualize os resultados agrupados e confira o período.'),('Ler','Comece pelos três indicadores e abra o dossiê necessário.'),('Conferir','Compare campanhas, orçamento e evidências das recomendações.'),('Registrar','Guarde o relatório da semana e decida os próximos passos.')]
    for i,(title,copy) in enumerate(steps):
        y=212+i*108;d.text(title,50,y,260,32,'Newsreader',GREEN);d.text(copy,365,y+5,820,23)
        if i<3:d.line(365,y+80,1230,y+80)

    d.new('O que está disponível e o que exige preparo','Uma avaliação transparente das capacidades atuais.')
    columns=[('Disponível para conhecer',['Resumo, campanhas e orçamento.','Dossiês e temas claro/escuro.','Relatórios em PDF e dados estruturados.']),('Depende de configuração',['Resultados agrupados do escritório.','Conexões de IA, que podem gerar cobrança externa.','Fontes regionais e agendamento.']),('Fora do uso operacional',['Leitura automática de contratos por OCR.','Envio de contratos reais e cadastro operacional de clientes.','Decisões jurídicas ou conformidade automática.'])]
    for i,(title,items) in enumerate(columns):
        x=50+i*400;d.text(title,x,220,360,29,'Newsreader',GREEN)
        for j,item in enumerate(items):
            y=306+j*100;d.line(x,y-14,x+350,y-14);d.text(item,x,y,350,21)
    d.text('As funções de IA não garantem conclusões corretas. O produto não promete captação de clientes nem retorno financeiro.',50,647,1170,17,color=MUTED)

    d.new('Conheça. Confira. Avalie.','Uma demonstração guiada é o próximo passo.')
    d.text('Comece pelos dossiês.<br/>Escolha uma pergunta real<br/>do seu dia a dia.',50,220,630,47,'Newsreader',leading=55)
    d.text('Explore com dados fictícios.',790,229,420,26,'Newsreader',GREEN)
    d.text('Confira como as informações são organizadas antes de configurar seu ambiente.',790,283,420,22)
    d.line(790,394,1228,394)
    d.text('Defina os cuidados de uso.',790,425,420,26,'Newsreader',GREEN)
    d.text('Alinhe fontes, acesso, custos externos e responsabilidade pela revisão.',790,479,420,22)
    d.rect(48,611,1184,52,'#eef1eb')
    d.text('Mais clareza para acompanhar resultados. Decisões permanecem com o escritório.',68,622,1130,21)
    d.save();return path


def technical_pdf():
    path=OUT/'LegalGrowth_Encerramento_Tecnico_v0.1.7.pdf'
    d=Document(path,(595.28,841.89),'LegalGrowth — encerramento técnico v0.1.7')
    d.new('Fechamento com escopo definido','23/10/2026 · base aprovada v0.1.6/v59 preservada')
    y=153
    sections=[('Correção implementada','O rodapé dinâmico dos dossiês começa oculto no HTML. scene.js só revela controles, legenda e apresentação 3D depois de configurar os eventos e concluir a seleção inicial. Sem JavaScript ou com bloqueio do script, ficam as cinco capas como links nativos, sem a ação ambígua “Abrir Campanhas”.'),('O que permaneceu igual','Posição após indicadores, capas, ilustrações, cores, Newsreader/Manrope, controles com JavaScript ativo, APIs e regras de negócio. Não foi criado um painel completo sem JavaScript. A versão de cache de scene.js mudou para evitar uso da revisão anterior.'),('Decisão técnica','O atributo hidden é o estado seguro inicial. Uma classe “ready” é compromisso de inicialização concluída, não apenas de início do script. Ocultar só quando uma falha acontece deixaria o controle enganoso visível se o script nem carregasse.'),('Limite do fallback','Sem qualquer JavaScript, os destinos nativos anteriores continuam funcionando, mas tema interativo e propagação de período/escopo dependem de app.js. Com falha apenas de scene.js, app.js mantém o contexto aplicado. O tema escuro sem JS foi imposto pelo teste para verificar CSS, não pelo controle do produto.'),('Parecer independente','THE CRITIC aceitou a correção pontual após oito capturas. Encerrou o achado da legenda sem JS e não identificou regressão visual no modo ativo. A revisão não certifica leitor de tela, dispositivo físico ou animação integral.')]
    for title,copy in sections:
        y+=d.text(title,40,y,515,16,'Newsreader',GREEN)+6
        y+=d.text(copy,40,y,515,11)+19

    d.new('Evidência: fallback sem ambiguidade','Capturas reais com dados sintéticos; sem montagem de componentes.')
    d.text('Antes · sem JS · 320 px',40,151,245,13,'Newsreader')
    d.text('Depois · script bloqueado · 320 px',310,151,245,13,'Newsreader')
    d.image(ROOT/'output/dossier-position-v59/after/no-js-320.png',40,183,245,453)
    d.image(QA/'fallback/scene-blocked-320-dark.png',310,183,245,453)
    d.text('A imagem anterior contém o CTA fixo, mesmo quando a primeira capa é Orçamento. A atual preserva os links e remove o rodapé que exige seleção dinâmica. Os temas diferem nesta comparação; ela demonstra o estado do controle, não paridade de cores.',40,657,515,11)
    d.text('As capturas com JavaScript ativo continuam disponíveis em output/closure-v60/collection. A comparação com v59 usa a mesma fixture e não novos dados de cliente.',40,738,515,10,color=MUTED)

    d.new('Validação executada neste ciclo','Dados sintéticos · nenhum benchmark pago ou chamada real de IA')
    y=153
    items=[('Coleção ativa','119 verificações sem falhas de asserção: 1440, 768, 390 e 320 px, dois temas e escopos Demo/Real. Um aborto nativo de ViewTransition registrado; saída 1 preservada.'),('Fallback','16 grupos sem falhas de asserção: JS desativado e scene.js bloqueado, quatro larguras, dois temas. Cinco links, foco, Enter e ausência de overflow verificados. Dois abortos nativos ao navegar com app.js ativo; saída 1 preservada. Mensagens ERR_FAILED do bloqueio intencional registradas separadamente.'),('Regressão','179 testes Python aprovados; seis avisos de depreciação. Regras de período, exemplos estáticos e corrida de respostas aprovados: respostas atrasadas não reaparecem sob filtros novos; escopo isolado e mês financeiro independente.'),('Capturas para o cliente','16 verificações/capturas de páginas nos dois temas, com recortes adicionais de componentes. Sem erros de página ou requisições inesperadas. Relatórios, campanhas, orçamento, recomendações e exemplos estáticos foram renderizados da versão final.'),('Resultados anteriores','Os testes v59 não foram reclassificados como executados agora. Capturas v59 servem apenas de comparação. Logs antigos e desta rodada ficam preservados. Código da transição de documento não foi alterado.')]
    for title,copy in items:
        y+=d.text(title,40,y,515,16,'Newsreader',GREEN)+6
        y+=d.text(copy,40,y,515,11)+18

    d.new('ViewTransition: investigação encerrada','Causa residual não demonstrada; nenhuma correção especulativa aplicada.')
    y=153
    for title,copy in [('Experimento delimitado','Uma matriz fixa de oito casos no Chrome: instrumentação on/off × cache HTTP on/off × movimento normal/reduzido. Servidor fixture em loopback, sem .env, banco ou interceptação Playwright; CSS e JavaScript atuais. Enter abriu Insights com Demo e 01–30/09/2026 em 8/8 casos.'),('Saída e chegada separadas','Nas quatro variantes instrumentadas, pageswap recebeu objeto de transição, mas não se observou a conclusão das promessas antes da destruição da página. Em pagereveal, ready e finished resolveram. Opt-in navigation:auto estava presente na CSSOM. Normal: 0,16 s; movimento reduzido: animação none.'),('Cache realmente observado','Com cache, os CSS da chegada tiveram transferSize zero; sem cache, transferência positiva. A matriz terminou sem erros. Isso não resolve os abortos do servidor autenticado, onde ocorreram novamente nesta rodada. Há diferenças de ambiente e timing; não se demonstrou causa única.'),('Interpretação e encerramento','Cancelamento esperado de saída não é equivalente a InvalidStateError na chegada. Não houve skip artificial no experimento final; o skip controlado da v58 é histórico. Nenhum catch global, asserção removida ou repetição até obter verde foi usado.'),('Limitações remanescentes','Transições podem ser omitidas embora a navegação chegue corretamente. Não há certificação integral de produção, Safari, dispositivos físicos ou fluidez. OCR continua uma interface técnica opcional: engine, isolamento e validação de produção pendentes; contratos reais continuam bloqueados.')]:
        y+=d.text(title,40,y,515,16,'Newsreader',GREEN)+6
        y+=d.text(copy,40,y,515,11)+16

    d.new('Manutenção e autonomia técnica','O fechamento não inicia outro redesenho ou ciclo geral de auditoria.')
    y=153
    for title,copy in [('Arquivos de produto','app/templates/_workspace_scene.html: rodapé hidden. app/static/scene.js: sinalização de prontidão no final. app/templates/dashboard.html: cache do script. Testes e documentação adicionais não mudam regras de negócio.'),('Trecho central','selectCover(current);<br/>scene.querySelectorAll(\'.scene-control\').forEach(button =&gt; { button.hidden = false; });<br/>scene.querySelector(\'.scene-footer\').hidden = false;<br/>scene.classList.add(\'scene-ready\');'),('Linha por linha','1. Calcula a seleção inicial e sincroniza título, descrição e link.<br/>2. Disponibiliza os controles já configurados.<br/>3. Revela a legenda que agora corresponde à seleção.<br/>4. Ativa o layout aprimorado. Se a inicialização falhar antes, o estado nativo permanece. Não há retorno novo; exceções não são ocultadas.'),('Material de estudo','Conceitos: progressive enhancement, estado inicial seguro, atributos HTML, ciclo de vida do DOM e observabilidade. Desafio: explique por que esconder o rodapé apenas dentro de um catch não cobre falha no download de scene.js. Não há solução pronta nesta entrega.'),('Documentos e evidências','docs/CLOSURE-V60.md; docs/VIEW-TRANSITION-FINAL.md; docs/THE-CRITIC-CLOSURE-V60.md. Evidências locais: output/closure-v60. Fontes primárias de ViewTransition e comandos reproduzíveis constam na investigação. O segundo PDF, LegalGrowth_Apresentacao_Cliente.pdf, é independente e omite detalhes internos.')]:
        y+=d.text(title,40,y,515,16,'Newsreader',GREEN)+6
        y+=d.text(copy,40,y,515,11)+18
    d.save();return path


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    # ReportLab does not apply variable-font axes. Instantiate the local fonts
    # for PDF embedding only; application fonts and dependencies stay untouched.
    sys.path.insert(0,str(ROOT/'output/pdf-tooling'))
    from fontTools.ttLib import TTFont as VariableFont
    from fontTools.varLib.instancer import instantiateVariableFont
    font_dir=QA/'pdf-fonts';font_dir.mkdir(parents=True,exist_ok=True)
    for name,file in [('Manrope','manrope.ttf'),('Newsreader','newsreader.ttf')]:
        source=VariableFont(ROOT/'app/static/fonts'/file)
        axes={axis.axisTag:axis.defaultValue for axis in source['fvar'].axes}
        axes['wght']=400
        static=instantiateVariableFont(source,axes,inplace=False)
        target=font_dir/file;static.save(target)
        pdfmetrics.registerFont(TTFont(name,str(target)))
        pdfmetrics.registerFontFamily(name,normal=name,bold=name,italic=name,boldItalic=name)
    for path in [technical_pdf(),client_pdf()]:print(path)


if __name__=='__main__':main()
