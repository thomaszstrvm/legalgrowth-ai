# LegalGrowth — identidade aplicada às telas de trabalho

22/10/2026. Escopo: apresentação existente, sem novos fluxos ou regras de negócio.

## Diagnóstico e direção

O THE CRITIC identificou uma diferença entre a elaboração das capas e a das
telas operacionais. A correção não é aumentar efeitos: é organizar contextos,
dados, edição e navegação segundo regras compartilhadas. O diagnóstico completo
está em THE-CRITIC-EXCEPTIONAL-DIAGNOSIS.md. A avaliação ampliou o recorte e marcou
8/10; não foi uma medição de regressão em relação ao parecer anterior.

A direção escolhida é a de um arquivo editorial de trabalho. Duas famílias
locais: Newsreader para títulos de página e sínteses; Manrope para seções,
controles e números. Base clara #f7f8f5, papel #ffffff, tinta #292a29, apoio
#60625e, ação verde #315747. As cinco cores das capas reaparecem como abas de
identificação, não como indicadores de qualidade ou sucesso.

Composição planejada:

    marca / navegação existente
    título de página                    descrição
    período / aviso de exemplo / escopo
    indicadores quando disponíveis
    consulta e ações em colunas adequadas ao conteúdo
    navegação complementar por dossiês no Resumo

Esse esquema evita copiar a estrutura de uma landing page. O conteúdo é sempre
o do escritório ou o exemplo explícito; não há depoimentos, estatísticas de
marketing, gráficos ilustrativos misturados aos resultados ou nova funcionalidade.

## Pesquisa além das referências anteriores

Fontes consultadas em 22/10/2026:

| Fonte | Evidência observada | Aplicação / limite |
|---|---|---|
| [HOVERSTAT.ES](https://www.hoverstat.es/) | Curadoria de interfaces experimentais; descoberta do arquivo de Elisa Breyer | Ampliou a pesquisa para composição de arquivos, além de SaaS e premiações |
| [Elisa Breyer Archive](https://www.elisabreyerarchive.com/) | Grade de obras e página de detalhe com metadados separados | Aproximar informação relacionada e dar proporções próprias a cada região; não reproduzir seu cursor ou navegação artística |
| [Order / Standards](https://order.design/project/standards) | Estudo de identidade que relaciona manuais gráficos, marca e produto | Repetir poucos elementos de identidade nos destinos, com papéis definidos |
| [Standards](https://standards.site/) | Navegação discreta, contraste de escala e demonstração do produto | Preservar controles funcionais mais discretos que o conteúdo; sem copiar chamadas promocionais |
| [GSA / Pentagram](https://www.pentagram.com/work/gsa) | Identidade financeira com geometria, tipografia e paleta articuladas | Tornar o vocabulário visual consistente; não importar o significado financeiro das cores da referência |
| [Fonts In Use](https://fontsinuse.com/) | Arquivo tipográfico pesquisado | Contexto de pesquisa; não justificou uma troca de fontes ou instalação |
| Imagem Nexora enviada pelo usuário | Composição clara, planos brancos e profundidade suave | Superfícies de trabalho elevadas discretamente e contraste hierárquico; não é evidência de um produto publicado |

Arc, Nova Dental, Attio e Linear continuam como referências locais anteriores.
Nesta rodada, as páginas Order, Standards, GSA e Elisa foram abertas no navegador;
Elisa também foi inspecionado no detalhe de uma obra. Capturas estão em
output/design-review/references. Vídeos de Standards não ficaram todos disponíveis;
não foram avaliados como se tivessem sido vistos. Nenhum asset dessas marcas foi
incorporado à interface do LegalGrowth.

## Implementação

- Contexto antes dos indicadores no Resumo e em Campanhas. O aviso de exemplo é
  explícito e mais curto, sem ocupar sozinho uma faixa inteira no desktop.
- Títulos de página usam uma aba da cor do dossiê correspondente. Os destinos
  continuam nomeados: a cor é redundante, não indispensável para navegar.
- Resultados agrupados em uma superfície clara; em celular o gasto ocupa a
  primeira linha e os dois indicadores seguintes compartilham a linha inferior.
- Orçamento dispõe totais acima de duas regiões: tipos de gasto e despesas.
  Relatórios aproxima criação e arquivos salvos em colunas. As duas telas voltam
  ao fluxo vertical abaixo de 900px, preservando a ordem do DOM.
- Os títulos de tarefas passam a uma mesma escala sans. A fonte serifada fica
  reservada para orientação editorial. Formulários distinguem-se das consultas
  por superfícies e espaçamento, não pela adição de passos.
- O gráfico ficou mais baixo, com preenchimento mais leve, valor intermediário
  no eixo vertical e data intermediária calculada pelo tempo transcorrido.
- A galeria perdeu a moldura espessa. Capas e rotações ficaram mais contidas;
  orçamento usa um livro de contas, oportunidades um mapa, evitando ilustrações
  com aparência de métricas. Links, foco e seleção continuam existentes.

## Decisões técnicas e trade-offs

O contexto foi movido para dentro do header existente e antes do resumo. O
elemento #overview-summary continua dentro de .page-header, preservando o contrato
de updateOverviewSummary. A galeria permanece fora do contêiner substituído pelo
renderizador. Não há observadores, dependências ou listeners novos para layout.

As alterações foram feitas no arc.css existente, sem uma terceira camada de CSS.
A cascata de style.css + arc.css continua sendo uma dívida conhecida. Consolidar
todo o CSS exigiria um trabalho separado, com risco maior de regressões.

Os novos rótulos do eixo são apresentação dos mesmos dados. Cálculo de custos,
escala começando em zero, pontos, tabelas e consultas permanecem iguais. A data
intermediária respeita dias sem registro: não usa o índice da observação como tempo.

Uma primeira tentativa de posição via atributo style foi bloqueada pela CSP
existente durante a verificação. Foi substituída por data-attribute numérico e
CSSOM em bind(). A política de segurança não foi modificada. A regra vale para
texto de eixo interno, gerado de datas; não recebe CSS arbitrário do usuário.

## Entendendo o código

Trecho de chart(rows), em app/static/app.js:

```js
const middleDate = new Date(first + duration / 2).toISOString().slice(0, 10);
const middlePosition = (Date.parse(middleDate + 'T00:00:00Z') - first) / duration;
const middleLabel = middlePosition > 0 && middlePosition < 1
  ? `<span class="chart-date-mid" data-chart-date-position="${middlePosition}">${dt(middleDate)}</span>`
  : '';
```

1. first é o instante UTC do primeiro dia; duration é a distância até o último.
   A primeira linha encontra o meio do intervalo e retém a data ISO.
2. A segunda calcula a posição dessa meia-noite dentro do intervalo. Ela não é
   necessariamente 0,5: um intervalo de três dias tem seu meio ao meio-dia.
3. A condição exige uma posição estritamente interna. Evita repetir um extremo
   quando existe somente um dia ou não cabe uma data intermediária.
4. O span guarda um número calculado e o texto formatado em português. bind()
   transfere o número para a variável CSS --date-position usando style.setProperty.
5. A alternativa vazia deixa os extremos existentes como únicas marcas.

chart recebe registros com date, cost e clicks, retorna HTML e já retorna string
vazia se não há registros. As datas vêm validadas pelo backend. Datas inválidas
poderiam provocar RangeError na conversão ISO; isso não é um mecanismo de
validação de entrada. Os testes cobrem vazio, um dia, zero e dias ausentes.
Remover a condição duplicaria marcas em intervalos curtos; usar o índice da linha
no lugar do tempo distorceria a distância entre dias quando há lacunas.

## Verificação

- Matriz completa: 88 capturas, 11 telas, quatro larguras, dois temas; sem
  transbordamento horizontal ou erros de console.
- Cena: dez combinações, 320px inclusive; teclado, movimento reduzido, links,
  ausência de JavaScript, atualização, falha sintética e recuperação passaram.
- Interações: formulários/retry, foco, menu, downloads e 320px passaram; 32 pares
  de tokens com contraste >=4,5:1. Não é uma auditoria completa de acessibilidade.
- Gráfico: pontos idênticos no caso com dias ausentes, zero na base, data interna
  na posição 1/3 para o intervalo testado, escala intermediária e CSP verificadas.
- Insights: 24 capturas com provedores simulados; produto: 18 capturas de
  oportunidades/notícias e verificações de falha, recuperação e escape.
- Pytest: 113 passaram, com duas advertências existentes de depreciação.

Todos os testes usaram dados sintéticos; nenhuma chamada paga ou alteração real
nos serviços foi realizada. A revisão independente da implementação é registrada
separadamente; passar nos testes não demonstra excelência estética.

## Estudo e exercício

Estude hierarquia tipográfica, CSS Grid, escala temporal, DOM e Content Security
Policy. Exercício: com registros nos dias 1, 2 e 10, calcule à mão onde o dia 2
deve aparecer no eixo. Explique por que colocá-lo exatamente no meio estaria
errado. Depois crie um teste com essa distribuição, sem usar dados reais.
