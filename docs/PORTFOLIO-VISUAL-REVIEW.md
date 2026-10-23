> Registro histórico: esta direção foi substituída pela rodada folio. Consulte [BRAND-FOLIO-REVIEW.md](BRAND-FOLIO-REVIEW.md) e [DESIGN.md](../DESIGN.md). Notas, capturas e testes abaixo pertencem à versão anterior.

# LegalGrowth — revisão visual para portfólio

Data: 22/10/2026. Escopo: melhorar a apresentação do produto existente, sem adicionar funcionalidades ou modificar regras de negócio.

## O que foi feito

A direção atual é um **caderno de inteligência**: superfície de trabalho sobre fundo mineral, navegação com ícones discretos, Manrope para operação, Newsreader para leitura editorial e revisão em petróleo como foco de decisão. Resumo, Configurações, Relatórios e análises compartilham essa linguagem. Cabeçalhos secundários aproximam filtros do título; o mobile reduz intervalos improdutivos sem esconder informações.

O [comparador local](../output/design-review/reference-comparison.html) reúne sete referências reais, três telas do produto e versões anterior/atual. `round2-before` é a versão rejeitada no início desta rodada; `after` é a implementação final. As capturas usam dados fictícios. Os artefatos em `output` são locais e não entram na distribuição do aplicativo.

## Pesquisa e skills

- [Emil Kowalski — skills](https://github.com/emilkowalski/skills): `emil-design-eng` instalado com o instalador oficial e lido nesta rodada. Aplicação: acabamento de controles, feedback discreto de pressão, foco previsível, movimento reduzido e avaliação por evidências visuais. A skill fica em `C:/Users/KABUM/.codex/skills/emil-design-eng`; não executa no site.
- [Discussão no Reddit sobre UI/UX com IA](https://www.reddit.com/r/claudeskills/comments/1vhz1ol/web_uiux_design_with_ai_what_skills_prompts_or/): relatos reforçam usar referências concretas e revisão, em vez de depender de um pedido genérico. São experiências pessoais, não prova de eficácia.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill): avaliada, sem instalação adicional. Seu foco em páginas públicas não justificou adicionar outro conjunto de regras ao produto operacional.
- Skills existentes `frontend-design` e `critique-visual-hierarchy` orientaram direção e crítica. A pesquisa também consultou Impeccable e UI UX Pro Max. Instalar uma skill, isoladamente, não garante qualidade.

## Referências e aplicação

| Referência observada | Aplicação no produto | Limite deliberado |
|---|---|---|
| [Nova Dental](https://nova-dental-dev.webflow.io/) | Contraste serif/sans, abertura assimétrica e hierarquia de escala. | Não incorporar fotografia decorativa no painel. |
| [Linear](https://linear.app/) | Superfície operacional distinta do ambiente, controles compactos e acabamento de estados. | Não copiar atalhos, densidade extrema ou funções de gestão de tarefas. |
| [Attio — tabelas](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views) | Alinhamento dos dados e controles próximos ao contexto. | Não adicionar edição de células ou agrupamentos inexistentes. |
| [Legency](https://legencymedia.com/) | Marca reconhecível e concentração de atenção. | Não copiar arte granular, globo ou identidade. |
| [Signal-A](https://signal-a.studio/about) | Trilhos horizontais, alinhamento e contraste tipográfico. | Não transformar o dashboard em pôster de agência. |
| [FORMAT / Obys](https://format.obys.agency/) | Contraste de proporções entre gráfico, revisão e tabela. | Não introduzir animação contínua ou física. |
| [Arc](https://www.arcmarumo.com/) | Foco da cena e controles periféricos. | Não reproduzir CRT ou cena 3D em uma ferramenta de trabalho. |

As referências foram visitadas e têm capturas reais locais; Nova e Linear foram revisitados nesta rodada. A comparação não afirma que todos esses sites receberam prêmios ou que o produto se equipara a eles. Nenhum asset visual de terceiros foi incorporado ao aplicativo.

## Decisões técnicas

| Antes | Depois | Por quê |
|---|---|---|
| Fundo lilás contínuo, seções com peso semelhante. | Canvas mineral, superfície de trabalho e revisão em petróleo. | Distinguir contexto, análise e próxima ação. |
| Source Sans 3 operacional. | Manrope local; Newsreader continua editorial. | Mais presença nos controles e consistência com a marca. |
| Cabeçalhos secundários em várias faixas. | Título e contexto lado a lado no desktop. | Reduzir espaço improdutivo e aproximar controles dos dados. |
| Marcadores SVG deformados pelo redimensionamento. | Traços mínimos com ponta redonda e espessura constante. | Manter pontos circulares em qualquer proporção. |
| Links de arquivo sem desenho reconhecível. | Ícone autoral de documento e texto preservado. | Melhorar reconhecimento sem depender do ícone. |
| Intervalos acumulados no mobile. | Ritmo mais compacto entre campanhas, orçamento e conexão. | Melhor continuidade de leitura. |

Mantive Jinja, CSS e JavaScript: migrar para React ou um framework de componentes aumentaria o risco e a manutenção sem resolver, por si só, composição ou tipografia. O backend, autenticação, persistência e integrações não foram editados nesta rodada. A única mudança em `app.js` é a representação dos marcadores do gráfico.

Fontes locais evitam requisições a terceiros. O total bruto das fontes ativas caiu de 1.098.004 para **616.364 bytes**, redução de **43,86%**. Isso é comparação de arquivos, não benchmark de carregamento. `no-store` continua aplicado pelo middleware, portanto o custo de transferência pode se repetir. A [ADR 005](decisions/005-local-design-system.md) registra a atualização.

Trade-offs: a direção é mais sóbria que um site de agência; isso favorece uso recorrente. Fontes locais ainda têm custo de transferência. CSS existente foi preservado e refinado para reduzir regressões, mas há regras em cascata que podem ser consolidadas em uma manutenção futura, com nova comparação visual.

## Como funciona

- [dashboard.html](../app/templates/dashboard.html): mantém destinos e contratos do HTML; acrescenta ícones decorativos e carrega as fontes locais.
- [style.css](../app/static/style.css): tokens claro/escuro, composição, componentes, responsividade e movimento reduzido.
- [theme.js](../app/static/theme.js): conserva o mecanismo de preferência; atualiza a cor do navegador para o novo canvas.
- [app.js](../app/static/app.js), `chart(rows)`: conserva cálculos, série, escala e tabela alternativa; ajusta apenas o desenho dos pontos.
- [document.svg](../app/static/document.svg): ícone local dos downloads.
- [DESIGN.md](../DESIGN.md): contrato atual; `.impeccable/design.json` demonstra componentes.

## Entendendo o código

Esta é a função anônima passada a `rows.map` dentro de `chart(rows)`, apenas formatada em várias linhas para estudo:

```js
r => `
  <path class="chart-point"
    d="M ${x(r)} ${y(r)} l .001 0"
    vector-effect="non-scaling-stroke">
    <title>${dt(r.date)}: ${brl(r.cost)}</title>
  </path>`
```

1. `r =>` recebe um registro diário. O retorno é uma string com um elemento SVG; `map` produz uma string por registro, e `join('')` reúne todas no gráfico.
2. `<path class="chart-point"` associa o desenho à regra CSS de cor, espessura e ponta redonda.
3. `M` posiciona o desenho nas coordenadas calculadas por `x(r)` e `y(r)`. `l .001 0` desenha um segmento quase sem comprimento. Com `stroke-linecap: round` e espessura 4, ele aparece como um ponto circular.
4. `non-scaling-stroke` mantém a espessura visual quando o SVG muda de largura ou altura. Sem isso, o ponto pode ficar oval ou pontudo, como na segunda revisão.
5. `<title>` preserva a informação de data e valor usando os formatadores existentes `dt` e `brl`. A tabela abaixo do gráfico continua sendo a alternativa textual completa.
6. `</path>` fecha o elemento. Sem o fechamento, a estrutura SVG ficaria incorreta.

O callback depende de `x`, `y`, `dt` e `brl`, definidos no fluxo existente. Não grava dados nem chama a API. Não acrescenta tratamento de exceções: registros inválidos podem gerar coordenadas inválidas ou falhas nos formatadores; a mudança visual não pretende substituir validação de dados. `chart` retorna string vazia quando não há registros e usa escala mínima 1 para evitar divisão por zero. O pequeno segmento é uma técnica de renderização, não altera a medida representada.

## Crítica independente

O subagente `art_critic` não editou a aplicação. Aplicou a mesma rubrica, com cinco dimensões de peso igual, em todas as rodadas:

**6,70 → 7,98 → 8,66 → 9,10.**

Foram corrigidos problemas apontados de tipografia operacional, cabeçalhos, brilho excessivo no escuro, marcadores deformados, ícones de arquivo e espaçamento móvel. A [avaliação completa](ART-CRITIC-ROUND2.md) registra notas e imagens observadas. A meta maior que 9 foi atingida nessa avaliação subjetiva; ela não é certificação, prêmio, validação de usuários nem garantia de contratação.

## Testes e validação

Executados localmente nesta rodada:

| Verificação | Resultado |
|---|---|
| `.venv/Scripts/python.exe -m pytest -q` | **113 passaram**, dois avisos de depreciação existentes (Starlette/httpx e pypdf). |
| `scripts/browser-redesign.cjs after` | **88 capturas**: 11 páginas × 4 larguras (1920, 1366, 768, 390) × 2 temas; zero overflow horizontal, erros de console ou mutações. |
| `scripts/browser-design-interactions.cjs` | Teclado, menu/Escape, rolagem da tabela, rótulos, formulário/retry, gráfico, exports e reflow 320px passaram; **32 pares de contraste ≥ 4,5**; duas mutações simuladas, zero reais. |
| `scripts/browser-design-states.cjs` | Vazio sintético, ciclo do resumo, gráfico móvel, nomes longos e galeria passaram. |
| `scripts/browser-insights.cjs` | **24 capturas**, três larguras, dois temas; persistência do tema, menu, papéis analista/revisor e falha da revisão passaram, com provedores simulados. |
| `scripts/browser-product-review.cjs` | **18 capturas** de notícias/oportunidades; estados preenchidos, zero vs. nulo, títulos não confiáveis escapados, erro/retry e respostas fora de ordem passaram. |
| `scripts/browser-reference-comparison.cjs` | **42 combinações**: sete referências × três telas × duas versões; imagens carregadas, sem overflow e sem requisições externas. |
| `node --check app/static/app.js` e `theme.js` | Sintaxe válida. |

As capturas foram geradas automaticamente; inspeção visual humana simulada pelo agente foi amostral, incluindo desktop/mobile e ambos os temas. Não se afirma que cada uma das 88 imagens recebeu revisão visual individual. O teste de perfil viewer verifica a interface, não é uma auditoria de autorização da API. Não houve benchmark pago, chamada paga de IA ou uso de dados reais de clientes nos testes.

## Conceitos para estudar

Tokens semânticos de cor; hierarquia tipográfica; CSS Grid responsivo; cascata CSS; coordenadas e strokes SVG; contraste; foco por teclado; testes de regressão com fixtures.

## Meu desafio

Em uma cópia local, explique por que `scale = maximum || 1` evita um erro quando todos os gastos são zero. Depois, crie uma fixture com um único dia e compare o ponto em 390px e 1366px. Registre o que deve permanecer igual e o que pode mudar, sem alterar o valor financeiro.
