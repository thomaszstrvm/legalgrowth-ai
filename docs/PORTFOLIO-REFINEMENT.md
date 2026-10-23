# LegalGrowth — refinamento de portfólio

Data: 22/10/2026.

## O que foi feito

A leitura agora segue indicadores → período → gráfico e revisão → campanhas →
orçamento. A galeria de dossiês aparece após todo o conteúdo de trabalho; nenhum
atalho interrompe mais a sequência dos resultados. Rotas e ações foram mantidas.

As capas usam uma grade com quatro linhas: assinatura, título, arte e legenda.
A arte encolhe antes do texto. O monograma do LegalGrowth substitui barras
ilustrativas em Campanhas, evitando aparência de dados reais. Insights usa dois
campos sobrepostos para representar análise e revisão. As cores das capas têm
função editorial local; não são códigos de estado nem métricas.

Os controles móveis têm fonte maior: abertura numa linha, anterior/próximo na
seguinte. A altura da galeria aumentou frente à versão de rótulos comprimidos,
mas ela já não está no caminho de leitura dos resultados. No desktop, ambos os
controles laterais possuem a mesma largura, acomodando os nomes dos destinos.

## Coerência entre telas

Regra de superfícies: seções informativas ficam no fundo da página; superfícies
preenchidas identificam grupos de ação ou conteúdo que mereçam distinção. Uma
moldura externa não deve envolver outra moldura sem função adicional.

A caixa branca externa de Configurações e Relatórios foi removida. Configurações
mantém os provedores à esquerda em seção aberta e o formulário à direita numa
superfície suave. Relatórios mantém a criação agrupada e a lista aberta. Painéis
operacionais usam raio de 4px; os campos preservam sua linguagem de controle.
A moldura da galeria continua distinta por representar um objeto de navegação.
O cabeçalho do formulário respeita o mesmo limite de 560px dos campos. A
orientação de conexão no Resumo mantém texto e ação juntos e uma separação
explícita antes da galeria, inclusive no celular.

O endpoint de relatórios já respondia com Content-Disposition: attachment.
Os rótulos foram corrigidos para “Baixar PDF” e “Baixar para IA”. Não houve
mudança nos arquivos, URLs, métodos HTTP ou comportamento de download. O termo
“Contatos qualificados” passou a ser usado também na lista móvel de campanhas.

## Decisões técnicas

A galeria é renderizada no template após #content. Esse contêiner é substituído
pelo carregamento de dados; a galeria fica fora dele e preserva naturalmente os
listeners e a seleção. Não precisa de observador DOM, polling ou evento novo no
renderizador. A tentativa intermediária de posicioná-la depois do primeiro
bloco analítico foi descartada após revisão: ainda interrompia a sequência e
acrescentava acoplamento desnecessário ao seletor desse bloco.

CSS Grid organiza as capas. Transformações CSS mantêm a composição espacial;
links HTML continuam responsáveis pela abertura. Nenhuma dependência, chamada
externa, regra de negócio ou migração foi acrescentada. Uma verificação por
hashes registra 34 arquivos de referência; o único arquivo funcional com bytes
alterados foi app.js, conferido como exatamente quatro substituições de rótulos.

## Entendendo o código visual

O trecho central em app/static/arc.css é:

```css
.dossier-face {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 10px;
  padding: 14px 16px 14px 23px;
}
.dossier-art {
  height: 100%;
  min-height: 0;
  max-height: 120px;
}
```

1. `.dossier-face` seleciona a face de cada capa, sem alterar a área clicável.
2. `display: grid` organiza seus quatro filhos numa grade.
3. As duas primeiras linhas e a última usam o tamanho necessário para os textos.
   A terceira recebe o espaço restante; seu mínimo zero permite reduzir a arte
   quando o título ocupa duas linhas. Um mínimo automático poderia causar corte.
4. `gap` mantém separação consistente entre os elementos.
5. `padding` reserva margem interna; a esquerda maior compensa a lombada.
6. A chave fecha as regras da face.
7. `.dossier-art` seleciona somente o SVG ilustrativo.
8. `height: 100%` faz a arte ocupar a linha disponível.
9. `min-height: 0` permite encolher dentro da grade, sem forçar seu tamanho natural.
10. `max-height` impede arte desproporcional nas capas com títulos curtos.
11. A chave encerra o bloco. Media queries ajustam margens e escala no celular.

Não há parâmetros, retorno ou exceções JavaScript nesse trecho: ele define
restrições de layout. A função selectCover, documentada em ARC-IMPLEMENTATION.md,
continua calculando a posição espacial das capas sem alteração nesta rodada.

## Verificação e evidências

- Baseline: output/design-review/portfolio-refinement/before e scene-before.
- Iteração intermediária: iteration-1-pages e iteration-1-scene na mesma pasta.
- Hashes: preservation-result.json; backend e tema preservados; app.js contém
  apenas as quatro alterações de texto verificadas.
- Teste da cena: dez combinações de largura/tema; movimento normal e reduzido,
  teclado, links nativos, atualização, falha sintética e nova tentativa.
- Interações: formulário/retry, menu, foco, downloads e 320px; 32 pares de tokens
  com contraste mínimo de 4,5:1, mais sete pares da paleta da cena antes do filtro
  lateral. Isso não é auditoria completa de acessibilidade.
- Pytest: 113 passaram; duas advertências existentes de depreciação.
- Matriz completa: 88 capturas, 11 telas, quatro larguras, dois temas; sem
  transbordamento horizontal, erros de console ou mutações reais.
- Insights: 24 capturas com provedores simulados; persistência de tema, menu,
  inversão de papéis e falha de revisão verificados; zero erros JavaScript.
- Produto: 18 capturas de oportunidades/notícias; falha de escopo, recuperação,
  respostas fora de ordem, zero versus ausente e escape de títulos verificados.
- Estados: vazio, nome longo, ciclo de indicadores e gráfico móvel passaram.
- Comparação local: 12 combinações de antes/depois carregadas, reflow do
  visualizador a 390px e zero solicitações externas.

O primeiro parecer desta rodada manteve 8/10, apontando continuidade analítica,
contêineres e downloads. A segunda revisão confirmou essas correções e atribuiu
8,5/10, com ressalvas pequenas sobre alinhamento do formulário e a orientação de
IA. Ambos foram corrigidos. A conferência final específica confirmou a resolução
dos dois achados, sem regressão visual evidente nas quatro imagens inspecionadas.
O crítico manteve o julgamento geral anterior, sem atribuir nota nova ao escopo
limitado. Isso não comprova o patamar excepcional exigido pelo usuário.
Nenhuma nota foi solicitada como condição de aprovação. Os testes usam dados
sintéticos, sem benchmarks pagos.

Pareceres: THE-CRITIC-PORTFOLIO-ROUND1.md, THE-CRITIC-PORTFOLIO-ROUND2.md e
THE-CRITIC-PORTFOLIO-FINAL-CHECK.md.
Comparação: output/design-review/portfolio-refinement/comparison.html. A primeira
linha contrapõe a referência Arc a um recorte real da galeria; a segunda permite
comparar telas completas equivalentes antes/depois. Os enquadramentos distintos
da referência e do componente estão declarados, para não simular equivalência.

## Conceitos para estudar e desafio

CSS Grid, tamanho intrínseco, minmax, identidade de elementos DOM, separação de
apresentação e negócio, testes de regressão. Desafio: em uma cópia local, troque
minmax(0, 1fr) por auto e compare uma capa de título curto com uma de duas linhas.
Explique qual elemento passa a disputar espaço e por quê.
