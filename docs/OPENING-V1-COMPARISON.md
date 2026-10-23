# Comparação da abertura — v44, primeira rodada

Data: 23/10/2026. Escopo: consultoria visual e comparador estático, sem edição da aplicação. Este documento não é o parecer independente de THE CRITIC e não atribui nota.

## Evidências examinadas

- `output/design-review/opening-v1/references/arc-user.png` e `arc-live.png`.
- `round1/opening-1366-light.png` e `opening-1366-dark.png`.
- `round1/opening-390-light.png` e `opening-390-dark.png`.
- Complementos: `opening-320-light.png`, `opening-768-dark.png` e `cover-Oportunidades-390-light.png`.
- Histórico: `before/overview-390-dark.png` e a abertura desktop clara registrada na rodada editorial-v8, também preservada em `before/overview-1366-light.png`.

Os caminhos abreviados são relativos a `output/design-review/opening-v1/`. O manifesto da primeira rodada identifica a versão v44 e dados sintéticos. A inspeção foi realizada pelas imagens locais, sem abrir o comparador em navegador.

## Mudanças visíveis

A galeria agora ocupa a primeira tela após a navegação. Na versão histórica, os resultados, gráfico, campanhas e orçamento antecediam os dossiês; a relação com Arc só aparecia ao final da página. Na nova composição, essa relação é imediatamente reconhecível: capa central vertical, vizinhas inclinadas, extremos recortados, legenda central e palco com moldura curva e textura discreta.

O aumento das capas, títulos e gravuras dá presença ao conteúdo original do LegalGrowth. A capa Campanhas está integralmente visível e o link Abrir Campanhas permanece abaixo, nos quatro enquadramentos principais inspecionados. O título Oportunidades cabe na capa central móvel examinada.

Os temas compartilham geometria e composição. O tema claro mantém papéis coloridos e tinta escura; o escuro utiliza papéis mais escuros e tinta clara. A referência Arc é mais escura e possui tratamento de imagem e tipografia diferentes; a implementação transfere o arranjo espacial, sem equivalência literal de arte ou textura.

## Trade-off da prioridade

Em 1366×768, a galeria ocupa a região aproximada de y=131 até y=735. Os resultados começam abaixo da primeira viewport: a medição registrada em `round1/results.json` indica início próximo de y=775. Isso torna o acesso Ver resultados importante para quem chega ao painel para consultar indicadores.

Em 390×844, o título Resumo e sua descrição aparecem no fim da primeira tela, mas os valores continuam abaixo. Na captura histórica móvel, os indicadores e o início do gráfico apareciam antes da galeria. A mudança satisfaz o protagonismo visual solicitado e aumenta a distância inicial até os dados. O atalho oferece um caminho direto, mas a captura estática não comprova seu comportamento.

## Observações objetivas e limites

Não observei título central ou ação principal cortados nas imagens examinadas. Os títulos das capas laterais ficam parcialmente recortados: esse recorte pertence à composição e não permite identificar todos os destinos pelas capas simultaneamente. Os controles anterior/próximo apresentam nomes dos destinos adjacentes; a navegação completa permanece no cabeçalho desktop e no menu móvel.

Em 320 px, Insights de IA quebra em duas linhas no controle inferior; as setas e o link central continuam visíveis. A instrução Selecione a capa para abrir ocupa uma linha adicional após os controles. Essa informação é redundante com o link Abrir Campanhas, mas não apresenta corte na evidência examinada.

Não executei testes de teclado, movimento, âncora, contraste ou sem JavaScript nesta consultoria. Não extrapolo o resultado visual para larguras, temas ou estados de seleção não examinados. Os testes funcionais e o parecer permanente devem ser apresentados separadamente.

## Comparador

Arquivo: `output/design-review/opening-v1/comparison.html`. Oferece seleção de largura 1366/390 px, tema claro/escuro e referência enviada/captura pública. Após esta inspeção da primeira rodada, o implementador atualizou `const versionFolder = 'final';` para apresentar a v45 corrigida. As observações históricas acima continuam identificadas como v44. A revisão final está em [THE-CRITIC-OPENING-V1.md](THE-CRITIC-OPENING-V1.md).

O antes só existe em 1366 claro e 390 escuro. As combinações ausentes mostram uma mensagem em vez de reutilizar uma captura incompatível. As imagens históricas de página inteira recebem recorte visual superior equivalente à viewport atual; links abrem os arquivos completos. A referência é mostrada integralmente, preservando sua proporção.

Os 12 caminhos de imagens usados pelo comparador foram conferidos, sem ausências; o link relativo para este documento também foi resolvido. O JavaScript embutido passou em `node --check`. O HTML não foi aberto por `file://`, nem foi utilizado método alternativo para contornar essa restrição. Portanto, a existência dos arquivos e a sintaxe foram validadas, mas a apresentação e os controles do próprio comparador não foram verificados em navegador.
