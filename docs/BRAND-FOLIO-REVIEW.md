# LegalGrowth — identidade folio

Data: 22/10/2026. Escopo: identidade e apresentação do produto existente, sem novas funcionalidades ou alterações no backend.

## O que mudou

A composição anterior, com navegação horizontal e revisão em petróleo, foi substituída por uma **navegação lateral, capa navy com arte original em L e indicadores integrados à capa**. A marca usa três traços em L. Newsreader dá expressão à abertura; Manrope mantém controles e dados legíveis. A identidade atravessa Resumo, relatórios, configurações e análises nos dois temas.

O conteúdo permanece operacional: filtros, dados, gráfico, tabela, revisão, downloads e formulários existentes. Não foram adicionadas métricas, funções ou integrações para preencher o novo layout. APIs, autenticação, persistência, proteção de dados e regras de negócio não foram alteradas nesta rodada.

## Referências examinadas

O Behance foi usado como ponto de descoberta; foram examinados projetos concretos, em vez de usar apenas sua página inicial:

| Projeto | Evidência local | Aplicação | Diferença preservada |
|---|---|---|---|
| [Unic](https://www.behance.net/gallery/244848067/Unic) | `output/design-review/references/unic-live.png` | Família navy/cobalto, símbolo reconhecível e uma abertura com presença de marca. | A captura é uma apresentação de identidade, não uma interface operacional. O símbolo e a arte do LegalGrowth são próprios. |
| [Payrix — FMS SaaS UX UI Dashboard Design](https://www.behance.net/gallery/238265899/Payrix-FMS-SaaS-UX-UI-Dashboard-Design) | `output/design-review/references/payrix-live.png` | Arte tridimensional relacionada à superfície do produto, composição lateral e contraste entre capa e dados. | A referência é um mockup inclinado. O LegalGrowth preserva leitura frontal, indicadores opacos e controles existentes. |

As referências anteriores — Nova Dental, Linear, Attio, Legency, Signal-A, FORMAT e Arc — continuam no [comparador](../output/design-review/reference-comparison.html). O [antes/depois desta rodada](../output/design-review/before-after.html) separa a comparação de evolução da comparação com referências externas.

Semelhança de princípios visuais não significa equivalência de qualidade, prêmio recebido ou aprovação de uma empresa. Capturas de referências não são provas de usabilidade. Nenhum asset desses projetos foi incorporado ao aplicativo.

## Skills e arte

- `frontend-design`: direção distintiva, composição e hierarquia.
- [Emil Kowalski — design engineering](https://github.com/emilkowalski/skills): precisão de controles, estados de foco, feedback discreto e movimento reduzido.
- `imagegen`: geração da arte decorativa original [brand-folio.png](../app/static/brand-folio.png).

Descrição fiel da arte, sem pretender transcrever o prompt: **lâminas translúcidas azuis em L, com volume e iluminação sobre fundo navy, destinadas à área direita da capa**. A associação a páginas de um dossiê e à inicial da marca é uma interpretação de design. A arte não representa dados nem recebe informações de clientes.

## Decisões e trade-offs

| Antes | Depois | Por quê |
|---|---|---|
| Navegação horizontal competia com a abertura. | Lateral fixa de 224px no desktop,200px intermediário e menu no mobile. | Criar um eixo estável e dar espaço à composição principal. Custa largura útil no desktop. |
| Identidade dependia sobretudo de serifada e cor petróleo. | Símbolo com três Ls, arte própria e família navy/cobalto. | Adicionar elementos reconhecíveis além de componentes comuns de dashboard. |
| Resultados separados da identidade. | Faixa de resultados integrada à capa, com fundo opaco. | Aproximar marca e informação sem sacrificar o contraste dos números. |
| A revisão era o painel escuro dominante. | Abertura escura; revisão azul suave junto do gráfico. | Definir uma sequência: contexto e resultados, análise, depois ação. |
| Regras da rodada misturadas à base. | Nova direção concentrada em `identity.css`, carregada depois da base. | Limitar alcance da alteração e facilitar revisão/reversão. A cascata fica mais complexa e merece consolidação futura. |

Mantiveram-se Jinja, CSS e JavaScript existentes. Uma migração de framework não resolveria identidade por si só e ampliaria o risco de regressão. As fontes continuam locais: Manrope e Newsreader somam 616.364 bytes brutos. A arte PNG acrescenta **1.701.765 bytes** e ainda não está otimizada. O middleware mantém `no-store` nos estáticos; portanto a transferência pode se repetir. Não houve benchmark de carregamento, e o peso da imagem é um custo real desta direção. Otimização futura deve comparar qualidade visual, tamanho e cache separadamente.

## Como funciona

1. [dashboard.html](../app/templates/dashboard.html) renderiza os mesmos destinos e identificadores de controles, agora agrupados em uma navegação lateral. O símbolo SVG é decorativo.
2. [style.css](../app/static/style.css) fornece tipografia, controles, acessibilidade e componentes de base.
3. [identity.css](../app/static/identity.css), carregado depois, redefine tokens e composição. A ordem importa: regras com a mesma especificidade são resolvidas pela que aparece por último.
4. O JavaScript existente continua controlando menu, dados, filtros, tema e ações. A classe `menu-open` liga o estado do botão à apresentação do menu; `aria-expanded` continua comunicando o estado à tecnologia assistiva.
5. [DESIGN.md](../DESIGN.md) registra o contrato vigente; [.impeccable/design.json](../.impeccable/design.json) contém exemplos documentais, não componentes executados pelo aplicativo.

## Entendendo o código

Este recorte de `identity.css` mostra apenas as declarações centrais da navegação, formatadas para estudo. As demais regras de espaçamento e acabamento continuam no arquivo:

```css
.app-navigation {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--rail-width);
  overflow-y: auto;
}
main { margin: 0 0 0 var(--rail-width); }
@media (max-width: 900px) {
  .app-navigation { position: relative; inset: auto; width: auto; overflow: visible; }
  nav { display: none; }
  .menu-open nav { display: grid; grid-template-columns: 1fr 1fr; }
  main { margin: 0; }
}
```

1. `.app-navigation` seleciona o contêiner da navegação, sem criar outro menu.
2. `position: fixed` prende esse contêiner à janela no desktop. Ele deixa de reservar espaço no fluxo normal.
3. `inset: 0 auto 0 0` define topo 0, direita automática, base 0 e esquerda 0: o painel ocupa a altura disponível à esquerda.
4. `width: var(--rail-width)` usa a largura compartilhada: 224px, reduzida a 200px até 1180px. Uma variável evita duplicar valores independentes.
5. `overflow-y: auto` permite rolar o painel quando a altura disponível não comporta seus itens.
6. O primeiro `}` encerra o conjunto de regras do contêiner.
7. A margem esquerda de `main` reserva a largura retirada do fluxo pelo posicionamento fixo. Sem ela, navegação e conteúdo podem se sobrepor.
8. `@media` aplica as regras seguintes somente quando a janela tem até 900px.
9. `position: relative` devolve a navegação ao fluxo; `inset: auto` desfaz as âncoras; `width: auto` deixa sua largura acompanhar o contêiner; `overflow: visible` evita restringir o menu aberto ao painel anterior.
10. `nav { display: none; }` recolhe os links. O botão Menu existente continua visível pela base CSS.
11. `.menu-open nav` mostra os links quando o JavaScript existente adiciona a classe de estado. Duas colunas acomodam os grupos; outra regra reduz a uma coluna até 600px.
12. `main { margin: 0; }` remove o espaço reservado para a lateral que já não é fixa.
13. O último `}` encerra a condição de largura.

CSS não recebe parâmetros nem retorna valores como uma função Python. Aqui, as entradas são a largura da janela, os elementos e suas classes; o resultado é a composição renderizada. Uma declaração inválida normalmente é ignorada pelo navegador, em vez de lançar uma exceção de aplicação. Remover o estado `.menu-open` deixaria o menu oculto no mobile; mudar somente a largura da lateral sem a margem correspondente causaria desalinhamento. Essa regra depende do HTML e do JavaScript existentes, por isso testes de clique e teclado acompanham as capturas.

## Testes e limites desta rodada

| Verificação | Resultado confirmado |
|---|---|
| Testes Python existentes | **113 passaram.** |
| Matriz completa de apresentação | **88 capturas**: 11 páginas × 4 larguras × 2 temas; sem transbordamento horizontal, erros ou mutações. Resultado em `output/design-review/after/results.json`. |
| Interações e contraste | Teclado, menu, rótulos, formulários e demais interações do roteiro passaram; **32 pares de contraste** verificados. |
| Fixtures de produto | **18 capturas** de estados simulados de notícias e oportunidades; roteiro passou. |
| Comparador com nove referências | **54 combinações** (9 referências × 3 telas × 2 versões) passaram; sem requisições externas. |
| Antes/depois | **12 combinações** passaram; captura `output/design-review/identity-before-after.png`. |
| Insights | **24 capturas**, provedores simulados e zero erros de JavaScript; roteiro passou. |
| Estados de apresentação | Roteiro de estados vazios, preenchidos e transições passou. |

Os testes usam dados fictícios e simulações; não foram usados dados reais de clientes ou chamadas pagas de provedores. A geração da arte é uma operação separada dos testes de produto. A matriz automática não equivale à inspeção visual individual de cada captura. Contraste calculado não é auditoria integral de acessibilidade.

A crítica atual é [IDENTITY-CRITIQUE.md](IDENTITY-CRITIQUE.md). A nota 9,10 da rodada anterior é histórica e não deve ser apresentada como avaliação desta direção. O crítico final não identificou bloqueador visual na amostra examinada, mas observou que os componentes abaixo da capa continuam convencionais e que a identidade depende bastante da arte. Esse limite permanece registrado; não foi criada uma nota artificial para validar a entrega.

## Prompt da arte e origem

Ferramenta: `image_gen` integrada, sem CLI ou uso de chave da aplicação. Arquivo final: [brand-folio.png](../app/static/brand-folio.png). Prompt enviado:

```text
Use case: stylized-concept. Create an original premium brand artwork background for LegalGrowth, a legal-marketing analytics software portfolio. Landscape 1536x1024. A sculptural arrangement of three substantial translucent smoked cobalt acrylic sheets folded into architectural L-shapes, like a precision crafted abstract dossier / open folio. The layers are offset upward and backwards, creating a beautiful curved upward opening and sophisticated refracted edge light. Not a literal chart, no arrow, no scale of justice, no gavel, no robot. Physical studio photography / high-end 3D product render with credible thickness, refraction, bevels, subtle satin surfaces. Deep ultramarine navy background #121d59, beautiful icy blue highlights and a very small muted champagne edge reflection. Sculpture occupies RIGHT HALF ONLY, mostly x65%-95%, leaving entire left 55% quiet uniform dark navy negative space for live HTML title and metrics. Wide calm horizontal composition, object dramatically cropped at right edge, no text, no letters, no UI, no charts, no logos. Grounded studio light, not neon, not space, not glassmorphism UI, no random blobs or particles. High-end contemporary corporate visual identity, memorable material and silhouette. Generate only the artwork.
```

## Conceitos para estudar e exercício

Estude fluxo normal, posicionamento fixo, cascata, especificidade, variáveis CSS, media queries e estados acessíveis.

**Exercício:** em uma cópia local, altere apenas `--rail-width` de 224px para 240px e verifique 900px, 1180px e 1366px. Explique por que a margem do conteúdo acompanha a mudança em uma faixa, mas não em todas. Depois, teste o menu por teclado e descreva o que depende de CSS e o que depende de JavaScript. Não altere as rotas nem a lógica de dados.
