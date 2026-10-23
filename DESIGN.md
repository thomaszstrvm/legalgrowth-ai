---
name: LegalGrowth
description: Interface editorial operacional para inteligência de marketing jurídico.
colors:
  ink: "#292a29"
  muted: "#60625e"
  line: "#d8d9d4"
  accent: "#315747"
  on-accent: "#fff"
  accent-hover: "#234334"
  bg: "#fff"
  canvas: "#f7f8f5"
  soft: "#eef1eb"
  control: "#81877e"
  selected: "#dce8df"
  notice-bg: "#faf1df"
  notice-ink: "#775019"
  warning: "#a03627"
  error-bg: "#fff1ed"
  nav-bg: "#f7f8f5"
  nav-ink: "#292a29"
  nav-muted: "#60625e"
  nav-selected: "#e2e6dd"
  ledger-bg: "#ecede8"
  ledger-ink: "#292a29"
  ledger-muted: "#60625e"
  ledger-line: "#b4b9b0"
  feature-bg: "#e9ede5"
  feature-ink: "#292a29"
  feature-muted: "#535c50"
  feature-action: "#315747"
  on-feature-action: "#fff"
  nav-rule: "#d8d9d4"
  nav-focus: "#315747"
  dark-ink: "#eeeee7"
  dark-muted: "#b8bcb2"
  dark-line: "#3d423b"
  dark-accent: "#b8d4bc"
  dark-on-accent: "#203628"
  dark-accent-hover: "#d5e8d7"
  dark-bg: "#242824"
  dark-canvas: "#181c19"
  dark-soft: "#2e342e"
  dark-control: "#7e8b7e"
  dark-selected: "#3b5040"
  dark-notice-bg: "#403b2d"
  dark-notice-ink: "#f0d7a8"
  dark-warning: "#ffb8a7"
  dark-error-bg: "#402d2a"
  dark-nav-bg: "#181c19"
  dark-nav-ink: "#eeeee7"
  dark-nav-muted: "#b8bcb2"
  dark-nav-selected: "#2e392f"
  dark-nav-rule: "#3d423b"
  dark-nav-focus: "#b8d4bc"
  dark-ledger-bg: "#2e342e"
  dark-ledger-ink: "#eeeee7"
  dark-ledger-muted: "#b8bcb2"
  dark-ledger-line: "#6c7c6b"
  dark-feature-bg: "#303a30"
  dark-feature-ink: "#eeeee7"
  dark-feature-muted: "#c2cbbd"
  dark-feature-action: "#b8d4bc"
  dark-on-feature-action: "#203628"
  scene-bg: "#eef1eb"
  scene-ink: "#292a29"
  scene-muted: "#60625e"
  dark-scene-bg: "#242b25"
  dark-scene-ink: "#eeeee7"
  dark-scene-muted: "#b8bcb2"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.08
  title:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.2
  body:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.55
rounded:
  control: "6px"
  panel: "4px"
  cover: "4px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-7: "28px"
  space-8: "32px"
  space-12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "7px"
    padding: "9px 12px"
  navigation-link:
    textColor: "{colors.nav-muted}"
    padding: "10px 12px"
  disclosure:
    textColor: "{colors.ink}"
    padding: "16px"
---

# Design System: LegalGrowth

Direção atual, 23/10/2026, v59: **editorial operacional**. O Resumo apresenta
contexto e indicadores, depois a coleção de dossiês, antes das análises detalhadas.
O link **Ver indicadores** retorna ao cabeçalho acima. Esta prioridade solicitada
pelo usuário substitui a ordem da v57, preservando seus demais contratos.
Tipografia editorial, lombadas,
composição em arco transferem princípios observados ao vivo no
[Arc Marumo](https://www.arcmarumo.com/). Cada capa abre uma área já existente.
Não foram copiados imagens, logos ou código da referência. As capas usam composições
individuais de tinta e retícula, com arte original em `_dossier_art.html`. Os cabeçalhos amplos reusam a mesma macro; `_chapter_art.html` fornece variantes
ópticas simplificadas para o celular.

Refinamento atual: campos curvo e angular em sangria em Campanhas e Oportunidades,
faixa dobrada sobre prancha de tinta em Relatórios e lente óptica em IA.
O palco tem contorno único, com raio de 4px. As publicações usam vinco, lombada
e aresta contínua; não simular páginas com linhas de um pixel. A ação Abrir
é editorial e maior; não repetir a instrução abaixo dos controles.
A implementação atual está em docs/VALIDATOR-REVIEW.md; a v56 está em docs/DESIGN-ENGINEERING.md e o estudo de interação
e código público em docs/ARC-INTERACTION-STUDY.md. OPENING-V4.md registra a v53. `--cutout` permite inverter a impressão sem
alterar a paleta. A leitura das skills do tweet orienta o acabamento, sem importar
seu preset completo: docs/DESIGN-TWEET-REVIEW.md.

Os fundamentos vêm de `app/static/tokens.css`, seguidos por `style.css` e
`arc.css`. A abertura está na partial `app/templates/_workspace_scene.html`. `scene.js` controla a seleção visual e a resposta limitada da capa ao ponteiro. `identity.css` e `brand-folio.png` são históricos e não são
carregados por esse dashboard. Documentação anterior não valida esta versão.

## Identidade e composição

Superfícies de trabalho neutras, tinta grafite e verde discreto nas ações.
A galeria acompanha a luminosidade do tema: clara no modo claro, escura no
modo escuro. As cinco capas mantêm seus matizes, com papel escuro e tinta clara
no modo escuro; os dados ficam fora da galeria.
Newsreader nos títulos e capas; Manrope em controles, valores e texto. Fontes
locais preservadas. As ilustrações são SVG originais de linhas e formas, com
cores próprias por destino, sem dados fictícios desenhados como resultados.

A navegação principal é horizontal em telas largas e usa o menu existente
até 1180px. Mantém todos os destinos; a galeria é um acesso complementar a cinco
áreas, não substitui a navegação completa. Formulários, relatórios e tabelas
mantêm seus componentes e fluxos. Não usar a cena artística sobre informações
operacionais nem diminuir contraste para imitar a textura CRT da referência.

## Movimento e acessibilidade

Sem reprodução automática. Botões anterior/próximo mudam a seleção; foco em
uma capa a centraliza. Setas, Home e End funcionam somente dentro da cena.
Enter usa o link nativo. A descrição da seleção é anunciada por região viva. Controles identificam os
destinos adjacentes e um link externo à capa explicita a abertura.
Sem JavaScript, as capas continuam links em uma faixa rolável. A preferência
`prefers-reduced-motion` elimina a transição. O tema continua salvo em
`lg-theme`; cor não é o único indicador de estado. Mouse com ponteiro fino inclina
a face ativa em até 3°/2°, com retorno ao sair. Teclado, toque e movimento reduzido
mantêm a face estável. A navegação pode usar transição nativa de 160ms em navegadores
compatíveis; fallback por links normais. Não bloquear a navegação para exibir efeitos.

## Implementação e manutenção

A galeria usa transformações CSS e SVG inline, sem WebGL ou dependência nova.
Isso reduz complexidade e evita carregar a imagem PNG de 1,7 MB da direção
anterior. Não foi medido ganho de tempo de carregamento; fontes e política de
cache continuam existentes. A cascata carrega `tokens.css`, `style.css` e `arc.css`; não adicionar outra camada de overrides sem revisar as anteriores.

Os tokens acima registram a base e as sobreposições atuais. As ilustrações de
capa usam cores locais próprias. O sidecar `.impeccable/design.json` documenta
componentes, mas não executa a aplicação.

## Revisão e evidências

O fluxo está no `AGENTS.md`; THE CRITIC é definido em
`.codex/agents/visual_critic.toml`. O revisor não implementa. Capture desktop e
celular nos dois temas após cada correção substancial. Registre evidências e
limites em `docs/ARC-IMPLEMENTATION.md`. Nota estética não certifica usabilidade,
acessibilidade ou qualidade equivalente à referência.

## Refinamento de portfólio

A decisão histórica abaixo foi substituída na v44: a galeria agora precede
o cabeçalho `#results`, fora de `#content`, sem observador ou evento de renderização. Seções
informativas são abertas; fundos suaves distinguem ações. Não envolver uma
superfície em outra caixa externa sem função. Relatórios usam rótulos de download
com verbo e objeto, com dimensões equivalentes. Detalhes e mentoria em
`docs/PORTFOLIO-REFINEMENT.md`.

## Sistema editorial aplicado às tarefas

A rodada seguinte está em `docs/DESIGN-EXCEPTIONAL-REFINEMENT.md`. O contexto
fica dentro do header, antes dos indicadores. Títulos de página recebem uma linha
de cor correspondente à capa; as mesmas cores identificam os grupos principais
de resultados ou edição. Não significam sucesso, erro ou tendência.

Newsreader fica nos títulos de página e sínteses; Manrope em títulos operacionais,
formulários, números e navegação. A largura máxima do ambiente é 1480px. Finanças
e Relatórios têm grids próprios para aproximar dados relacionados, retornando
ao fluxo vertical abaixo de 900px. Superfícies do tema e sombra discreta destacam
tarefas e sínteses; consultas continuam abertas. O palco dos dossiês tem moldura
fina, menor rotação e símbolos editoriais de livro de contas e mapa.

Referências ampliadas: Order/Standards, Elisa Breyer Archive, GSA/Pentagram e a
imagem Nexora fornecida pelo usuário. A pesquisa partiu também de HOVERSTAT.ES
e Fonts In Use. As fontes, aplicações e limitações estão documentadas no estudo.

## Coerência dos temas e despesas móveis

Versão de CSS v22: as cores da cena, controles, foco e sombras acompanham o
tema existente, sem outra preferência ou JavaScript. O intervalo entre orçamento
e galeria é 32px nos dois temas e nas larguras verificadas.
As capas laterais não recebem filtro de escurecimento. Perspectiva e sombra
estabelecem profundidade; o subtítulo central usa 13px no desktop e 12px no celular.

Até 600px, a tabela de despesas apresenta cada registro com descrição em largura
completa, data abaixo à esquerda e valor à direita. A mesma tabela e os cabeçalhos
continuam na árvore de acessibilidade do Edge; nenhum dado é truncado. Não aplicar
essa regra a outras tabelas sem verificar seu conteúdo. Detalhes e limitações em
`docs/THEME-COHERENCE.md`.

## Gravuras e composição editorial v25

23/10/2026: `_chapter_art.html` fornece as gravuras SVG originais tanto para
cabeçalhos quanto para dossiês. Elas são decorativas e usam a tinta do tema.
Cabeçalhos pedem a variante óptica simplificada, com menos linhas e traços mais
espessos. Capas usam a variante detalhada. A linha indica a cor do capítulo;
a gravura usa a tinta da marca. Esses papéis são distintos nos dois temas.
Nenhum gráfico de dados é substituído por essas gravuras. A lombada contém
apenas a marca redundante; os títulos e links preservam a identificação.

Resumo e Campanhas apresentam indicadores em composição aberta. O valor
monetário usa uma escala relativa à largura da coluna, com `cqi`; a variante
móvel reserva uma linha inteira ao valor. Cores e contrastes da v22 continuam.
Implementação, referências reabertas, verificações e mentoria em
`docs/EDITORIAL-V2.md`.

Quando houver recomendação, abrir seu conteúdo é a ação visual primária;
atualizar é secundária. Sem conteúdo, atualizar permanece primária. A apresentação
condicional usa CSS, preservando todos os handlers e estados de negócio.
Na galeria móvel, os dois controles ocupam a altura da mesma linha de grid;
rótulos que quebram não produzem botões com alturas diferentes.

## Abertura editorial v26 — 23/10/2026

A composição do Resumo agora abre em duas colunas: identificação e gravura à
esquerda, resultados à direita, contexto e filtros na base. Até 600 px volta à
ordem natural do HTML. O campo usa --soft nos dois temas; não há cores novas.
Títulos de página variam de 36 a 76 px; títulos editoriais usam Newsreader 30 px
(27 px móveis), controles e valores seguem Manrope. A escala móvel considera
palavras longas em português. Gravuras ficam junto à descrição no celular.

A galeria preserva a interação e passa a uma superfície sem moldura nem sombra.
O objetivo é identidade reconhecível na abertura, sem apresentar a navegação
como conteúdo prioritário. Detalhes e trade-offs em docs/EDITORIAL-V3.md.

### Correções v27 após THE CRITIC

A abertura móvel foi compactada, preservando controles. O identificador de seção
Pontos para revisar usa Manrope 14 px; o conteúdo usa Newsreader 30/25 px.
As sínteses financeiras usam campo plano --soft; contorno indica edição.
Títulos de páginas secundárias têm teto de 62 px no desktop. Nomes de campanhas
usam Newsreader 22 px. As cores e os estados de interação permanecem os mesmos.

## Dossiê aberto v28/v29 — 23/10/2026

No Resumo a partir de 1181 px, contexto e resultados ocupam uma margem de 300 px;
a análise começa ao lado, alinhada no topo. O cabeçalho continua sendo o ancestral
de overview-summary. Na v29, a síntese precede os filtros também no HTML. Contatos
e contratações usam linhas completas na margem. Até 1180 px, mantém-se o fluxo
vertical de leitura; o cabeçalho intermediário conserva sua grade interna.

O estado sem recomendações é secundário em todos os tamanhos: ação contornada,
linha divisória e intervalos compactos. Isso substitui a orientação histórica de
manter a atualização como primária quando vazia. Com conteúdo, abrir recomendação
continua sendo a ação primária. Nenhuma regra de negócio mudou.

Nomes de campanha recebem tratamento editorial no Resumo e sans-serif na tabela
operacional mais densa. A identidade e os tokens são compartilhados. A composição
foi comparada com Arc, Standards e a seção de grade da Herman Miller; Nova e Nexora
permanecem referências complementares. Evidências e mentoria em docs/EDITORIAL-V4.md.

### Acabamento v30

Entre 1181 e 1320 px, o link de exploração do gráfico fica abaixo do título,
alinhado à esquerda. Evita que ambos quebrem como colunas estreitas na entrada da
composição lateral. Correção do último achado baixo da revisão v29, sem mudança
de comportamento nem nova nota de THE CRITIC.

## Caderno de resultados v31–v33 — 23/10/2026

A partir de 901 px, a abertura do Resumo reúne identificação e três resultados
em uma faixa horizontal. A margem de 300 px da v28 foi substituída. Sem recomendação,
o gráfico recebe largura completa e a revisão vazia vira uma faixa de situação.
Com recomendação, mantém-se a composição lateral. Nada é removido ou recalculado.

Campanhas e orçamento compartilham a linha a partir de 1181 px; abaixo disso,
a tabela recebe a largura disponível. Título de 44 px em 901–1180 não fragmenta
palavras. O orçamento intermediário tem título e ação acima dos valores.
O gráfico amplo vazio usa 148 px de altura (152 px no celular), preservando zero,
datas e acesso à tabela. A galeria de dossiês e sua interação foram preservadas.

Mesmos tokens de tema e fontes; números em peso 500. Referências novas: Boc Studio
(Work, visitado após sua ficha Awwwards) e Nova Dental; referências históricas
identificadas no comparador. O primeiro parecer v31 identificou regressões corrigidas
na v32/v33. Evidências, limites, mentoria e pareceres: docs/EDITORIAL-V5.md.

### Reparos v34 após a segunda revisão

Em 601–900 px, saldo ganha mínimo de 190 px e medidor ocupa a linha abaixo.
Rótulos dos indicadores reservam altura equivalente em 901–1180; os valores
se alinham. A mensagem sem recomendações perde padding redundante. Evidências
em editorial-v5/post-review; a v33 revisada permanece congelada em final/.
A v34 foi verificada tecnicamente, mas não recebeu nova nota independente.

## Dupla página v35/v36 — 23/10/2026

No Resumo ≥1280px, análise/revisão e campanhas/orçamento formam duas colunas.
Mínimos de 500 e 620px preservam conteúdo; vão40px. Campanhas iniciam junto do
gráfico e orçamento segue a tabela. Linhas min-content/1fr evitam que uma
recomendação longa afaste orçamento de campanhas. Abaixo de1280 a leitura é sequencial.

Papéis tipográficos: abertura64px e campanhas32px em Newsreader, gráfico18px e
orçamento15px em Manrope. Os tokens claros/escuros e dossiês permanecem. Menu
compacto existente até1180px elimina a antiga navegação quebrada em duas linhas.
A v36 ajusta fatores fr para preencher o bordo direito em1280px. Comparação real
com Arc e seção de composição Herman Miller; evidências em editorial-v6 e mentoria
em docs/EDITORIAL-V6.md. Fluxos, DOM, JavaScript e regras de negócio preservados.

### Refinamento v37 após THE CRITIC

Campanhas mantêm os registros móveis até767px, testando a transição767/768/769.
A recomendação simples sem metadados compartilha a linha de ações por subgrid no
desktop; artigos, ordemDOM e teclado permanecem. Múltiplas recomendações/metadados
usam o fluxo vertical anterior. @supports preserva o fallback. O apoio de configuração
fica junto da frase. Papéis tipográficos do gráfico e orçamento são constantes
entre larguras. Capturas finais e comparação em editorial-v6/final e comparison.html.

### Acabamento v38

Separadores dos indicadores ocupam a altura comum da linha no desktop. Ajuste
visual verificado por geometria. Capturas de estados separam foco real e enquadramento
neutro para evitar o artefato do link de salto na imagem de página inteira.
O parecer8,8 é da v37; v38 sem nova nota. Evidências pós-revisão em editorial-v6/post-review.

### Continuidade v40 — áreas internas

V38 revisada independentemente nesta rodada: 8,8, com reparos localizados em
601px e orçamento móvel. V40 alinha os indicadores intermediários, concentra o
resumo financeiro móvel e leva cores/gravuras das capas às áreas de trabalho.
Cabeçalhos internos compactos, variante óptica móvel, edição em superfície tonal,
arquivo de relatórios com datas destacadas e ações agrupadas. Resumo desktop e
lógica preservados. Referências Arc, Boc e Attio visitadas novamente; fontes e
trade-offs em docs/EDITORIAL-V7.md. Evidências em editorial-v7/final.

THE CRITIC avaliou a v40 em 8,9 (docs/THE-CRITIC-EDITORIAL-V7-FINAL.md).
Acabamento v41: Mostrar abaixo do campo em até380px, importação alinhada à linguagem
de edição principal e evidências vazias com tema confirmado. Capturas/testes em
editorial-v7/post-review; v40 preservada em final. Nenhuma nota atribuída à v41.

### Continuidade v42 — coleção editorial

Capas com proporção de livro (228×304 e184×244), lombada6px e vinco2px.
Grade comum reserva título e rodapé; a arte recebe ajuste óptico de escala.
Paletas de papel/tinta dos dois temas preservadas. Controles com setas circulares
e rótulos mantidos; movimento280ms por ponteiro, imediato com foco visível.
Indicadores móveis de Campanhas alinhados pela altura dos rótulos.

Arc e Unit Editions/System Process Form visitadas neste ciclo; Boc/Attio
reutilizadas como referências históricas. Dados precedem a galeria, que cresce
54px desktop e40px móvel. Nenhuma nova funcionalidade;35arquivos de lógica
inalterados. Documentação e explicação em docs/EDITORIAL-V8.md; comparação em
output/design-review/editorial-v8/comparison.html. V42 congelada em final/.
THE CRITIC v41:8,3 no escopo aprofundado de identidade, sem evidência de regressão
funcional. Reavaliação v42:8,7, aprovada com ressalvas sobre autoria gráfica e
título Oportunidades. V43 corrige o desalinhamento de Campanhas na faixa601–1180px;
26verificações em13larguras2temas passaram. Capas permanecem as revisadasv42.
Parecer integral em docs/THE-CRITIC-EDITORIAL-V8-FINAL.md; pós-revisão sem nota nova.

### Abertura v44–v45 — referência com protagonismo

Pedido explícito do usuário substitui a ordem anterior: galeria antes dos dados.
Capas276×368desktop e208×278mobile, vizinhos recortados, perspectiva mais marcada,
campo tonal e moldura nos dois temas. Ver resultados leva ao cabeçalho dos dados.
Na v45, descrições e nomes dos controles reservam duas linhas para impedir saltos.
Testes:113pass; matriz88telasv44; cena finalv45com10combinações e30seleções.
THE CRITIC aprovou a abertura v45 em8,4; sem bloqueio visual relevante identificado.
Documentação atual em docs/OPENING-V1.md e docs/THE-CRITIC-OPENING-V1.md.

### Capas v46–v47 — identidade gráfica

Arte exclusiva em `_dossier_art.html`, com sólidos e retículas derivados do L.
Composições individuais, escala de cartaz e tipografia dimensionada pelo formato
da capa; cabeçalhos internos permanecem iguais. Na v47, IA ganha separação entre
letra e gravura, Orçamento ganha respiro no rodapé e o palco perde as scanlines.
As paletas, os destinos e o comportamento da cena são preservados.
Documentação atual: docs/OPENING-V2.md e docs/THE-CRITIC-OPENING-V2.md.
Comparação v45/v47/Arc: output/design-review/opening-v2/comparison.html.
THE CRITIC: v46 em8,7 com ressalvas; v47 em8,8 aprovada no escopo da abertura,
32capturas examinadas e achados anteriores encerrados. Nota não certifica
usabilidade, animação ou áreas internas não inspecionadas pelo crítico.

### Capas v48–v49 — contraste de impressão

Campanhas ganha recorte circular e retícula; Relatórios, uma faixa dobrada em
prancha de tinta; Insights, uma lente cortada. Paletas e destinos preservados.
V49 corrige o intervalo entre arte e título de Campanhas. THE CRITIC: 8,8 na
primeira rodada; 8,9 na revisão de 22 capturas corrigidas. A meta solicitada
de 9,9 permanece não atingida. Evidências em docs/OPENING-V3.md e
docs/THE-CRITIC-OPENING-V3.md. Skills estudadas em docs/DESIGN-TWEET-REVIEW.md.

### Localidades v50 — preferências do escritório

A versão do CSS passa a 50 para o formulário de cidades. As capas permanecem
visualmente na v49. Configurações apresenta cidade/UF e ações de adicionar,
remover e salvar, usando as mesmas cores nos dois temas. Notícias sem região
apresenta uma ação direta para escolher cidades. Evidências sintéticas em
output/design-review/locations-v1/final; funcionamento em docs/localidades.md.

### v55 — design engineering e estudo interativo da Arc

Capas recompostas, arte compartilhada nos capítulos, fundamentos centralizados,
região organizada em duas colunas, confirmação de gravação separada da leitura,
foco e fragmentos recuperados. APIs e regras de negócio preservadas. Pesquisa
pública dos sete livros e interação/código da Arc documentadas. Testes, limites,
explicação e parecer em docs/DESIGN-ENGINEERING.md.

### v56 — fechamento da revisão

Dicas de rolagem aparecem somente quando a tabela excede sua região, com
associação acessível e atualização ao abrir detalhes/redimensionar. Avisos de
análise não verificada recuperam seu padding. Notícias identifica cobertura
parcial usando a paleta de avisos existente. Cartier foi comparada ao vivo como
referência de escala, cor e continuidade; nenhuma camada adicional de efeitos.
O ciclo por nota foi encerrado por decisão do proprietário. Próximas melhorias
devem responder a problemas de uso observados, com escopo e verificação definidos.


### v57 — revisão externa e contexto operacional

A ordem atual substitui a prioridade da galeria descrita nos marcos históricos.
Datas aplicadas viajam na URL nas quatro páginas analíticas; finanças usa mês e
relatórios usa semana completa. Rascunho não altera contexto de resposta pendente.
Indicadores e atenção entram no primeiro viewport desktop. A comparação de seis
indicadores ocupa largura completa; no celular, pares preservam rótulo/valor.
Relatórios usam lista semântica com período e ações separados, PDF principal.

Cabeçalho e indicadores do Resumo e downloads têm regras consolidadas; seletores
supersedidos foram retirados de style.css/arc.css antes da implementação. Este é
um refactor delimitado, não eliminação de toda sobreposição histórica. Cores e
arte continuam compartilhadas pelos temas. Exemplos estáticos nunca são fallback
para falha real. Ver docs/VALIDATOR-REVIEW.md e docs/THE-CRITIC-VALIDATOR-REVIEW.md.


### Continuidade v59 — prioridade dos dossiês

A coleção é irmã do cabeçalho e vem antes de #content. Galeria 424 px no desktop
e 312 px no celular; capas mantêm suas dimensões. Ver indicadores aponta para
#results. Critérios, comparação sintética e ressalvas em docs/DOSSIER-POSITION-V59.md.
Ferrari contribui com presença e proximidade da ação, sem transferência de estilo.
