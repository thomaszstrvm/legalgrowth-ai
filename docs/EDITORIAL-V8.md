# Coleção editorial — v42

Data: 23/10/2026. Continuação da v41, sem novas funcionalidades.

## O que foi feito

As cinco capas passaram de 228×250 para 228×304 px no desktop e de
184×204 para 184×244 px no celular. A lombada passou de 12 para 6 px;
o vinco frontal, de 6 para 2 px. Títulos, gravuras e subtítulos ocupam
zonas comuns, mesmo quando o título tem duas linhas. Campanhas e Insights
receberam ajustes ópticos de escala. Os desenhos SVG existentes foram preservados.

A navegação agora usa setas circulares e rótulos sem caixas exteriores.
A área clicável continua com pelo menos 44 px de altura. A seta de abertura
é horizontal, coerente com a navegação interna. A transição por ponteiro dura
280 ms; foco visível e movimento reduzido não animam a posição das capas.

Também foi corrigido o alinhamento dos dois indicadores inferiores de Campanhas
em telas estreitas, apontado na primeira revisão desta rodada.

## Referências e comparação

- [Arc](https://www.arcmarumo.com/): revisitada no navegador neste ciclo.
  Aplicação: objeto vertical central, perspectiva das peças vizinhas e integração
  dos comandos à coleção. Não foram incorporados o CRT nem a baixa luminosidade.
- [System Process Form — Unit Editions](https://uniteditions.com/products/system-process-form):
  página visitada neste ciclo. Aplicação: proporção de livro, margem reservada,
  separação entre identificação e desenho geométrico, sombra discreta.
- [Boc](https://boc.studio/work) e [Attio](https://attio.com/): capturas do ciclo v7,
  reutilizadas com essa proveniência explícita. Contribuem com agrupamento e contenção
  da interface; não foram revisitadas neste ciclo.

As referências não são um gabarito de pixels. O produto continua sendo um painel
de trabalho, com resultados antes da navegação ilustrada. Comparador e detalhes:
`output/design-review/editorial-v8/comparison.html` e `EDITORIAL-V8-COMPARISON.md`.

## Decisões técnicas

| Antes | Depois | Por quê |
|---|---|---|
| Capas quase quadradas | Proporção próxima de 3:4 | Aproximar a coleção de objetos editoriais |
| Altura do título dependente do texto | Zona comum para títulos | Impedir que duas linhas desloquem a gravura |
| Faixa escura larga na lombada | Lombada derivada da própria capa | Manter materialidade sem dividir o campo de cor |
| Retângulos nos comandos | Círculo apenas na seta | Integrar a navegação ao acabamento editorial |
| Transição de 650 ms | 280 ms, teclado imediato | Reduzir espera e manter percepção de posição |

Escolhi CSS sobre o DOM existente, em vez de reconstruir o carrossel ou adicionar
bibliotecas. Isso preserva links nativos, foco, atalhos e handlers. Não há custo
de API, novos recursos de rede ou mudança de segurança. A manutenção permanece
concentrada em `app/static/arc.css`. O template principal apenas atualiza a versão
do CSS; `_workspace_scene.html` muda um glifo decorativo.

O custo de espaço é explícito: a galeria cresce 54 px no desktop e 40 px no celular.
Ela continua depois de todo o conteúdo operacional. A paleta de papel e tinta de
cada tema foi mantida; bordas e lombadas usam `color-mix` com as mesmas cores.
Uma grade fixa é adequada aos cinco títulos atuais, mas traduções ou títulos novos
exigem repetir a verificação de encaixe. Não foi criado ADR: não houve alteração
duradoura de arquitetura ou contrato.

## Como funciona e entendendo o código

O JavaScript existente escolhe o dossiê e define `--offset` e `--distance`.
O CSS continua convertendo esses valores em posição e perspectiva. Apenas as
dimensões, a composição interna e a duração visual mudaram.

Trecho central da grade, abreviado sem modificar seu significado:

```css
.dossier-face {
  display: grid;
  grid-template-rows: 17px 78px minmax(0, 1fr) 36px;
  gap: 10px;
}
.scene-ready:has(:focus-visible) .dossier {
  transition: none;
}
```

1. `.dossier-face` seleciona a face de cada capa, sem afetar formulários.
2. `display: grid` organiza seus quatro filhos em linhas.
3. `17px` reserva o selo; `78px`, o título; `minmax(0, 1fr)`, o espaço restante
   da gravura; `36px`, o subtítulo. A gravura não empurra texto para fora.
4. `gap` separa essas zonas. A versão móvel usa medidas próprias, menores.
5. `:has(:focus-visible)` identifica o estado de foco visível dentro da cena.
6. `transition: none` reposiciona imediatamente as capas nesse estado. Sem essa
   regra, a seleção por teclado continuaria esperando a animação de ponteiro.

CSS não recebe parâmetros nem lança exceções como uma função Python; recebe
estado do DOM e propriedades computadas. O risco equivalente é uma regra não casar
ou a cascata sobrescrevê-la. Por isso o teste consulta a duração computada no navegador.

## Testes e validação

- `pytest -q`: **113 passaram**, dois avisos já existentes de depreciação
  (Starlette/httpx e pypdf.add_js).
- `browser-scene.cjs`: **10 combinações** de largura/tema, entre 320 e 1920 px;
  **30 capturas** com cada uma das cinco capas selecionadas em 1366, 390 e 320 px.
- **14 pares de contraste ≥ 4,5:1**; coerência tonal entre galeria e canvas;
  nenhum texto cortado na grade nas amostras testadas.
- Navegação anterior/próxima, setas, Home/End, Enter, foco visível, movimento
  reduzido, duração de 280 ms e seleção central verificadas.
- Links sem JavaScript; atualização, erro sintético e tentativa novamente;
  seleção preservada; nenhuma requisição de mutação realizada.
- `browser-redesign.cjs`: Resumo e Campanhas em quatro larguras, ambos temas
  (**16 telas**), mais Campanhas em 320 px (**2 telas**); sem overflow ou erro de console.
- SHA-256: **35 arquivos de lógica Python/JavaScript idênticos** à base histórica.
  Manifesto da apresentação v42 em `editorial-v8/final/manifest.json`.

Os testes usam dados demonstrativos; não enviam dados a provedores de IA.
Não houve benchmark pago. O comparador HTML tem caminhos locais verificados;
não foi aberto automaticamente no navegador, devido à restrição desse mecanismo.

## Revisão independente

Primeira rodada: THE CRITIC revisou a v41 e apontou peso óptico das gravuras,
controles e indicadores de Campanhas. A nota 8,3 refere-se àquele escopo de
identidade, não comprova regressão funcional em relação ao parecer anterior 8,9.
Parecer: `THE-CRITIC-EDITORIAL-V8-ROUND1.md`.

Segunda rodada: o agente permanente `visual_critic` inspecionou 54 novas capturas,
quatro históricas e quatro referências. **V42: 8,7/10, aprovada com ressalvas**.
Confirmou proporção, peso das gravuras, controles e coerência dos temas. Ainda
considera as gravuras familiares e o título Oportunidades menos presente; essas
são ressalvas estéticas, não falhas de legibilidade. Parecer integral em
`THE-CRITIC-EDITORIAL-V8-FINAL.md`. Ambas as convocações registram efetivamente
`agent_type=visual_critic` e `fork_turns=none` nos arquivos critic-invocation.

### Correção posterior v43

O único defeito objetivo restante era o alinhamento de Campanhas em 768 px.
A v43 estende a altura comum dos rótulos à faixa601–1180px. Foram verificadas
**26 telas**: 320,390,600,601,767,768,769,900,901,1180,1181,1366,1920px nos dois temas.
O teste compara a posição real dos valores e dos textos de apoio; todos alinhados,
sem overflow ou erros de console. Capturas e manifesto em `editorial-v8/post-review`.
As capas não mudaram após o parecer. A v42 permanece congelada em `final`;
**não atribuí nota nova à v43 nem fiz terceira rodada**. O teste funcional113pass
é anterior a essa correção exclusiva de CSS; a verificação focal foi executada depois.

## Conceitos para estudar

CSS Grid, cascata, unidades `lh`, alinhamento óptico versus geométrico,
variáveis de tema, contraste e `prefers-reduced-motion`.

## Meu desafio

Explique por que dois SVGs com a mesma largura podem parecer de tamanhos diferentes.
Em uma cópia de estudo, varie apenas a largura da gravura de Campanhas e compare
com Insights nos dois temas. Preserve as dimensões da capa e justifique qual
relação oferece maior equilíbrio, sem usar apenas a caixa geométrica como critério.
