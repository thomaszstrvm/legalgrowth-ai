# Abertura editorial — v27

23/10/2026. Evolução visual da v25. Sem novas funcionalidades.

A primeira proposta desta rodada foi v26; a entrega v27 incorpora as correções
da revisão independente em `THE-CRITIC-EDITORIAL-V3-ROUND1.md`.

## Alteração e intenção

O primeiro contato com o produto passa a usar a linguagem editorial dos dossiês.
A abertura do Resumo combina título, explicação e gravura à esquerda com os
resultados à direita. Os filtros ficam na base dessa composição no desktop.
No celular, a leitura mantém a ordem do documento: título, filtros e resultados.
As outras áreas recebem a mesma abertura, com sua gravura própria.

Newsreader agora também identifica as seções e os nomes de campanhas na tabela
desktop. Valores, rótulos e controles permanecem em Manrope. A galeria usa uma
superfície contínua, sem a combinação anterior de borda, sombra e cantos arredondados.
Nenhuma fotografia, afirmação comercial ou métrica decorativa foi acrescentada.

## Comparação com referências

[Arc Marumo](https://www.arcmarumo.com/) e
[Nova Dental](https://nova-dental-dev.webflow.io/) foram reabertas no navegador
nesta rodada; suas capturas estão em `output/design-review/editorial-v3/references`.

| Referência | Princípio observado | Aplicação e limite |
|---|---|---|
| Arc | Uma linguagem de objetos governa todo o ambiente | A linguagem dos dossiês chega à abertura e às seções. Não reproduzimos o CRT, imagens ou marcas. |
| Nova | Escala, contraste tipográfico e composição assimétrica | O título ganha presença e divide a abertura com informação real, mantendo os controles acessíveis. |
| Standards | Hierarquia e disciplina editorial | Mantemos alinhamentos e superfícies contidas; captura anterior identificada como tal. |
| Nexora enviada pelo usuário | Coerência das superfícies | Claro usa a família verde muito suave; escuro usa a família verde profunda, inclusive na galeria. |

`comparison.html` contém as referências e antes/depois nos dois temas. São produtos
com finalidades diferentes; a comparação não demonstra equivalência de UX.

## Decisões técnicas e trade-offs

A implementação fica em `app/static/arc.css`, com atualização de cache no template.
CSS Grid organiza o conteúdo existente, sem mover controles por JavaScript ou
duplicar valores. Isso reduz o risco de perder estado, listeners ou acessibilidade.
Os tokens de cor existentes governam os dois temas; nenhuma dependência nova.

Alternativas consideradas: um hero fotográfico ocuparia espaço sem explicar os
resultados; levar o carrossel ao topo atrasaria o acesso aos dados. A composição
escolhida ainda ocupa mais altura que a v25. Essa é uma troca estética explícita,
não uma melhoria de produtividade comprovada por pesquisa com usuários.

O investimento permanece primeiro porque já era o indicador inicial e acompanha
o gráfico de gastos. Isso preserva a organização do produto; não prova que seja
a prioridade ideal para todo escritório. Nenhum cálculo foi modificado.

Após a crítica, o nome das páginas secundárias foi limitado a 62 px no desktop,
e os nomes de campanhas passaram de 25 a 22 px. Sínteses financeiras compartilham
campo plano `--soft`; contorno permanece nos espaços de edição. A categoria
“Pontos para revisar” usa Manrope 14 px, deixando a recomendação concreta em
Newsreader 30/25 px. O teste mede essa diferença em cada breakpoint, evitando
que uma regra móvel mais específica desfaça a hierarquia.

A abertura móvel tem intervalos menores, sem ocultar informação nem diminuir
controles. A captura completa do Resumo escuro a 390 px passou de 2733 para
2658 px entre v26 e v27. Isso é uma medida de composição, não um teste de
produtividade. A abertura desktop foi preservada.

## Entendendo o código

Este trabalho não criou funções. O trecho central é a regra de layout:

```css
.page-header.has-results {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 0 48px;
}
```

1. O seletor usa a classe que o código existente já ativa quando há resultados.
2. `display: grid` permite posicionar os blocos sem recriar seus elementos.
3. As duas colunas dividem o espaço na proporção 1:1,15. O mínimo zero permite
   que o conteúdo encolha em vez de forçar a tela a transbordar.
4. `gap` não cria espaço vertical e separa horizontalmente as duas colunas.

As regras seguintes colocam o resumo na segunda coluna e os filtros na segunda
linha. Abaixo de 600 px, `display: block` recupera a sequência natural do HTML.
Sem essa adaptação, as duas colunas ficariam estreitas demais no celular.
Os atributos, IDs e handlers de filtros e botões permanecem os mesmos.

## Verificação

- 113 testes Python passaram, com dois avisos de depreciação já existentes.
- 11 páginas em 1920, 1366, 768 e 390 px, nos dois temas: 88 capturas sem
  transbordamento de documento ou erros de console.
- As mesmas 11 páginas a 320 px: mais 22 capturas nos dois temas.
- 16 estados com recomendação sintética e valor de R$ 1.234.567,89: leitura e
  ação principal preservadas, sem corte do valor. A categoria mede no máximo
  75% do tamanho do título da recomendação nos quatro tamanhos e dois temas.
- 12 estados de Finanças com despesas sintéticas: cabeçalhos acessíveis,
  descrições móveis em largura completa e validações de formulário preservadas.
- Teclado, menu, tabela, repetição de formulário simulado e 32 pares de contraste:
  aprovados. Nenhuma gravação real.
- Carrossel: teclado, movimento reduzido, ausência de JS, atualização/erro/retry,
  14 pares de contraste e altura móvel máxima de 430 px aprovados.
- Hashes dos 35 arquivos Python/JS da aplicação: nenhuma mudança.

A inspeção visual encontrou uma quebra ruim de palavra em Configurações a 320 px,
embora não houvesse transbordamento. A gravura foi alinhada à descrição, liberando
a largura do título. A galeria excedeu seu limite de altura e foi corrigida.
Isso mostra por que testes de medidas não substituem olhar os pixels.

O detector Impeccable foi executado uma vez. Reportou escalas não registradas no
sidecar antigo e bordas de capítulo em componentes preexistentes; não é uma
certificação de acessibilidade. O sidecar não foi regenerado automaticamente.

## Estudo e exercício

Estude CSS Grid, cascata/especificidade, unidades `cqi`, hierarquia tipográfica
e diferença entre ordem visual e ordem do documento.

Desafio: explique por que os filtros continuam antes dos resultados na navegação
por teclado mesmo aparecendo abaixo deles no desktop. Em uma cópia de estudo,
experimente a proporção `1fr 1fr` e compare a leitura a 768 px, sem mudar o HTML.

## Parecer independente final

THE CRITIC / visual_critic, agente permanente convocado explicitamente em duas
rodadas de leitura: v26 8,7; v27 8,8, aprovado com ressalvas. O crítico examinou
nove capturas finais, nove anteriores e quatro referências. Confirmou as
correções da abertura móvel, hierarquia, superfícies e escala; não apontou
regressão visual relevante. Não executou nossos testes: sua revisão é estática.

Permanece uma ressalva baixa: Atualizar recomendações recebe destaque alto no
estado sem pendências. Sua adequação depende da prioridade operacional; não foi
alterada por mera busca de pontuação. A nota não comprova excelência nem usabilidade.
Parecer integral em `THE-CRITIC-EDITORIAL-V3-FINAL.md`. Não houve terceira rodada.

A v27 está registrada por hashes em
`output/design-review/editorial-v3/final/manifest.json`. A comparação usa capturas
congeladas em `final/`, sem depender das pastas reutilizadas pelos testes.
