> Parecer histórico da primeira implementação. As capturas citadas como `arc-scene/` foram preservadas em `output/design-review/arc-scene-round1/` antes das correções. O diretório `arc-scene/` agora contém a segunda versão.

# Relatório independente — THE CRITIC

## Veredito

**7/10 — REVISÃO NECESSÁRIA.**

A implementação transfere princípios visíveis da referência Arc: composição em leque, perspectiva, objeto central destacado, palco escuro e tratamento dos destinos como peças editoriais. Existe uma decisão de direção de arte reconhecível.

O problema está na relação dessa cena com o produto. O LegalGrowth apresenta um painel para acompanhar investimento e resultados, mas entrega a maior prioridade visual a uma vitrine de navegação. A cena tem mais presença que a informação que justifica a existência da página.

A execução é cuidada. A hierarquia funcional ainda não está suficientemente resolvida.

A nota é um julgamento qualitativo das capturas observadas. Não representa benchmark, certificação de acessibilidade ou avaliação de dimensões que exigiriam interação.

## Evidências e limites da inspeção

Li integralmente `.codex/agents/visual_critic.toml` e inspecionei as imagens com ferramenta visual. As capturas de 1366 px e 390 px também foram abertas em resolução original para conferir proporção e legibilidade sem depender apenas da redução automática da imagem.

**Versão avaliada:** conjunto apresentado como nova implementação Arc em `output/design-review/arc-scene/`. Não foi verificada a correspondência desse conjunto com um commit ou com uma aplicação atualmente executada.

| Conjunto inspecionado | Resolução dos arquivos | Temas |
|---|---:|---|
| `arc-scene/overview-1920-*.png` | 1920 × 2066 | Claro e escuro |
| `arc-scene/overview-1366-*.png` | 1366 × 2012 | Claro e escuro |
| `arc-scene/overview-768-*.png` | 768 × 2426 | Claro e escuro |
| `arc-scene/overview-390-*.png` | 390 × 2742 | Claro e escuro |
| `arc-scene/overview-320-*.png` | 320 × 2912 | Claro e escuro |
| `after/reports-light-1366.png` | 1366 × 1005 | Claro |
| `references/arc-current.png` | 1280 × 720 | Aparência escura da referência fornecida |

As dimensões são dos arquivos completos; não informam, por si mesmas, a altura original do viewport.

Esta foi uma revisão de imagens estáticas com dados apresentados como sintéticos. Não houve edição, leitura de `.env`, acesso à rede ou execução do produto.

Não foram observados diretamente:

- Animação, transições e comportamento durante o movimento.
- Hover, foco de teclado e estados pressionados.
- Navegação por toque, clique ou teclado.
- Leitura por tecnologia assistiva.
- Desempenho e comportamento com dados reais.
- Contraste calculado segundo critérios de acessibilidade.

O arquivo `arc-scene/results.json` registra verificações de overflow, teclado, movimento reduzido e funcionamento sem JavaScript, sem erros registrados. **Li esse registro; não reproduzi esses testes.** Ele não substitui a observação das interações.

Não há captura anterior da mesma página Resumo neste escopo. Portanto, consigo identificar custos introduzidos pela presença da cena, mas não atribuir todo problema do restante do painel à implementação Arc. A captura de Relatórios serve como comparação da linguagem interna, não como um antes equivalente.

## Transferência concreta de princípios Arc

### O que foi efetivamente transferido

| Princípio observado na referência | Manifestação no LegalGrowth | Avaliação |
|---|---|---|
| Objetos distribuídos em leque | Cinco dossiês inclinados, com perspectiva e sobreposição | Transferência concreta e imediatamente reconhecível |
| Objeto central como ponto de entrada | Campanhas aparece frontal, central e mais luminosa | Hierarquia focal bem executada dentro da cena |
| Palco escuro delimitado | Moldura espessa, cantos arredondados e escurecimento periférico | Reinterpretação visual clara do enquadramento da referência |
| Conteúdo tratado como objeto editorial | Capas com títulos, ilustrações, lombadas e pequenos textos | Adaptação coerente ao conceito de dossiês |
| Legenda subordinada à peça central | Nome e descrição de Campanhas abaixo dos objetos | Mantém a separação entre exposição e identificação |

Não seria defensável dizer que houve apenas aplicação de cores ou uma referência vaga. A construção espacial foi transferida.

### Onde a adaptação muda de qualidade

Na captura Arc, o objeto central é o assunto da apresentação. A cena organiza a exposição de trabalhos. No LegalGrowth, os dossiês representam destinos que já pertencem à navegação de uma ferramenta operacional.

Essa diferença altera o critério de sucesso. Uma apresentação de portfólio pode dedicar quase toda a composição ao objeto. Um resumo de resultados precisa justificar quanto espaço entrega a atalhos antes de apresentar os resultados.

A adaptação editorial também foi mais consistente que uma reprodução literal das capas da referência: o LegalGrowth mantém família tipográfica, regras gráficas e ilustrações relacionadas aos módulos. Isso merece ser preservado.

Por outro lado, a função de “vitrine de objetos” foi transferida com mais força que a disciplina de prioridade necessária ao painel. **A referência foi compreendida visualmente; sua aplicação ao contexto funcional ainda precisa de edição.**

Não considero necessário reproduzir desgaste, VHS, ruído ou outras características da referência. A ausência desses efeitos não é um defeito.

## Problemas críticos

Não encontrei evidência de problema de gravidade **crítica**, como conteúdo essencial sobreposto ou página visualmente inutilizável. Os problemas relevantes estão abaixo.

### 1. A cena ocupa a posição e a escala do conteúdo principal do resumo

**Localização:** página Resumo, imediatamente depois do título, em todas as capturas `arc-scene/overview-*`.

**Evidência visual:** em `overview-1366-light.png`, o palco vai aproximadamente de y=223 a y=725: cerca de **500 px de altura**. Os indicadores aparecem depois. O título do gráfico começa perto de y=1010.

Em `overview-390-light.png`, o palco ocupa aproximadamente y=222 a y=669: cerca de **447 px**. Os indicadores começam por volta de y=700 e o gráfico perto de y=1080. A mesma organização permanece no tema escuro.

**Gravidade:** **alta**.

**Justificativa:** o título e a descrição prometem acompanhamento do investimento e dos resultados. A maior massa visual anterior a esses resultados é um conjunto de atalhos. A área mais contrastante, colorida e volumosa da página responde a “qual módulo abrir?”, enquanto os dados respondem ao propósito declarado de “Resumo”.

Isso reduz a densidade útil da primeira parte da página. O problema não é ausência de espaço em branco; é a quantidade de espaço comprometida com uma função secundária repetida.

**Correção específica recomendada:** colocar indicadores e contexto do período antes da cena. Reduzir também a altura do palco, sobretudo no celular, preservando os dossiês e a composição central. Não é necessário descartar a direção de arte.

**Impacto esperado:** antecipar a leitura dos resultados e recuperar área de trabalho sem eliminar a assinatura visual.

### 2. No celular, a composição comunica um objeto melhor que o conjunto de destinos

**Localização:** palco em `overview-320-light.png`, `overview-320-dark.png`, `overview-390-light.png` e `overview-390-dark.png`.

**Evidência visual:** Campanhas permanece identificável e frontal. Relatórios e Insights de IA aparecem parcialmente cortados nas laterais; Orçamento e Oportunidades não são identificáveis no enquadramento inicial. A instrução “Escolha um dossiê para abrir”, presente no desktop, não aparece nessas capturas estreitas. Permanecem as setas e a descrição da campanha.

**Gravidade:** **média**.

**Justificativa:** o corte lateral funciona como sinal de continuidade e não deve ser confundido com overflow acidental da página. Entretanto, os fragmentos de títulos são insuficientes para identificar todos os destinos disponíveis.

A composição oferece uma pista espacial, mas pouca informação textual sobre o que está imediatamente antes e depois. Em uma ferramenta de trabalho, isso pode aumentar o esforço de descoberta.

A captura não comprova que a navegação seja difícil durante o uso. O custo de identificação no estado inicial é observável; o efeito sobre tempo de tarefa exige teste.

**Correção específica recomendada:** manter uma orientação curta de abertura também no celular e dar nomes acessíveis visualmente aos controles anterior/próximo, por exemplo identificando os destinos adjacentes. Preservar o título do destino central fora da ilustração.

**Impacto esperado:** tornar a metáfora mais compreensível sem aumentar significativamente a altura nem transformar o palco em uma lista convencional.

### 3. A capa contém textos que aparentam ser instruções, mas têm escala de detalhe ornamental

**Localização:** rodapés e lombadas dos dossiês, especialmente no celular; exemplo mais claro no dossiê central de `overview-390-light.png`.

**Evidência visual:** “Marketing jurídico” e “Abrir dossiê” são muito menores que a legenda externa e que os controles circulares. O comando de abertura ocupa apenas um pequeno trecho do rodapé da capa. Nos objetos inclinados, escala e perspectiva tornam esses detalhes ainda menos legíveis.

**Gravidade:** **baixa**, porque os títulos principais continuam legíveis e existe identificação externa do item central.

**Justificativa:** é aceitável que uma ilustração editorial contenha pequenos detalhes. A dificuldade surge quando esse detalhe assume a forma de instrução funcional. “Abrir dossiê” parece explicar a ação, mas sua apresentação visual não lhe dá condições de cumprir bem esse papel.

A distinção entre detalhe gráfico e comando precisa ser mais deliberada.

**Correção específica recomendada:** concentrar a orientação funcional em texto externo com escala semelhante à descrição abaixo do dossiê. Deixar os pequenos textos da capa como detalhes opcionais, sem depender deles para explicar a ação.

**Impacto esperado:** melhorar a descoberta da abertura e reduzir a ambiguidade sem redesenhar as capas.

## Problemas sutis

### A hierarquia interna da capa é melhor resolvida que sua microtipografia

**Evidência:** dossiês em `overview-1366-light.png` e `overview-390-light.png`.

Título, ilustração e cor produzem identificação rápida. Já marca, lombada, subtítulo e rodapé concentram vários níveis minúsculos de informação. O efeito editorial existe, mas parte dele é percebida como textura.

**Gravidade:** baixa.

**Ajuste mínimo:** simplificar os textos secundários das capas menores e preservar apenas os detalhes que contribuam para a metáfora. Mais inscrições não tornam o objeto automaticamente mais sofisticado.

### O acabamento mais pesado está concentrado no elemento menos operacional

**Evidência:** moldura, profundidade das lombadas, perspectiva e escurecimento do palco em todas as capturas, comparados às linhas simples da tabela e do gráfico abaixo.

Há uma diferença grande de intensidade entre a cena e o restante da página. A cena recebe a maior elaboração material; os dados recebem uma apresentação bastante sóbria.

**Gravidade:** baixa como acabamento; o efeito sobre prioridade já está contemplado no problema de gravidade alta.

**Ajuste mínimo:** reduzir a espessura percebida da moldura e o peso do escurecimento periférico antes de acrescentar novos efeitos ao restante do painel.

### A repetição de Campanhas acrescenta pouca informação

**Evidência:** na captura desktop, Campanhas aparece na navegação superior, no título da capa central e novamente na legenda imediatamente abaixo.

Não considero essa repetição um erro: a legenda externa é especialmente útil no celular. Entretanto, a repetição evidencia que o palco ocupa muito espaço para reapresentar um destino já conhecido.

**Gravidade:** baixa.

**Ajuste mínimo:** preservar a legenda externa e evitar acrescentar outros rótulos redundantes. O ganho principal virá da escala e posição do palco.

### O tema claro sofre uma interrupção visual maior

**Evidência:** comparação direta entre os pares claro/escuro em 1366 e 390 px.

As capas e o fundo da cena mantêm aparência praticamente igual nos dois temas. No escuro, o palco se aproxima do ambiente; no claro, torna-se uma grande superfície escura entre regiões claras.

**Gravidade:** baixa; trata-se de equilíbrio compositivo, não de uma falha automática de tema.

**Ajuste mínimo:** priorizar a redução de área e moldura. Não é necessário clarear as capas ou criar duas identidades editoriais diferentes.

Não observei, nessas imagens, perda equivalente de legibilidade dos títulos principais no tema escuro.

## Decisões questionáveis

### Campanhas como destaque inicial dentro de Resumo

**Evidência:** Resumo está marcado na navegação, enquanto Campanhas é o foco central da cena.

Existe uma explicação plausível: Campanhas pode ser o destino mais importante. Essa prioridade, porém, não é demonstrada pelas capturas.

O foco central pode representar seleção do carrossel, não página atual. Não classifico isso como estado incorreto. É uma **hipótese de ambiguidade** que merece verificação em uso.

**Recomendação mínima:** manter visualmente clara a diferença entre página atual e dossiê em destaque. Não aumentar ainda mais o peso do estado central.

### “Seu espaço de trabalho” para uma área de atalhos

**Evidência:** rótulo no canto superior esquerdo do palco em todas as resoluções.

O que a captura mostra é um seletor de destinos. Não mostra manipulação de dados ou execução de tarefas dentro desse espaço.

O nome não é necessariamente errado, mas dá ao componente uma importância operacional maior que aquela demonstrada pela imagem.

**Recomendação mínima:** usar uma descrição mais direta do conteúdo, como dossiês do escritório, caso isso corresponda ao vocabulário do produto. É um ajuste de linguagem, não uma exigência de funcionalidade nova.

### Cinco cores editoriais sem continuidade demonstrada

**Evidência:** capas em ocre, lilás, verde-amarelado, terracota e verde azulado; página Relatórios em `after/reports-light-1366.png` permanece na linguagem clara com verde institucional.

As cores diferenciam os objetos dentro da cena. Isso já lhes dá uma função legítima.

O que não está demonstrado é se representam categorias persistentes do produto ou apenas identificação local. A captura de Relatórios não apresenta continuidade evidente do lilás.

**Classificação:** decisão de identidade a esclarecer, não inconsistência comprovada.

**Recomendação mínima:** tratar a paleta como recurso editorial local se ela não tiver função fora do palco. Não espalhar cinco cores pelo produto apenas para justificar as capas.

### Ilustrações com aparência de gráficos

**Evidência:** barras em Campanhas e diagrama circular em Orçamento, sem valores ou eixos.

Funcionam como símbolos dos módulos. Contudo, dentro de um painel de resultados, gráficos decorativos podem ser confundidos com representações de dados por uma leitura rápida.

**Classificação:** hipótese perceptiva; não observei alguém interpretar essas formas como dados reais.

**Recomendação mínima:** manter o caráter claramente ilustrativo e evitar aproximar essas formas da linguagem dos gráficos operacionais.

## Comparação com a página Relatórios

A captura `after/reports-light-1366.png` apresenta uma linguagem interna reconhecível: títulos serifados, textos de interface sem serifa, fundo claro levemente quente, verde contido, divisórias e controles diretos.

Essa base também aparece no Resumo. A nova cena não apagou integralmente a identidade anterior.

A diferença está na intensidade. Em Relatórios, o espaço principal é dedicado à criação e à recuperação de relatórios. No Resumo, o espaço principal anterior aos dados é dedicado à representação visual dos módulos.

Não é necessário que páginas com funções diferentes tenham a mesma composição. A comparação mostra, porém, que o produto já dispõe de uma linguagem capaz de relacionar área ocupada e tarefa principal de forma mais direta.

Também não há base para afirmar que a página Relatórios inteira é superior em todos os aspectos. Só foi fornecida uma captura clara de desktop, e não observei sua interação.

## Qualidades reais

### A referência foi traduzida em um sistema de capas

Os dossiês compartilham proporção, tipografia editorial, linhas de organização e famílias de ilustrações. Não parecem cinco peças sem relação entre si.

**Evidência:** conjunto completo em 1366 e 1920 px.

### O ponto focal da cena é inequívoco

Campanhas tem posição, orientação e luminosidade suficientes para ser percebido primeiro. Dentro do palco, a hierarquia funciona.

**Evidência:** todas as resoluções e temas.

### A tipografia principal tem continuidade com o produto

Os títulos serifados das capas dialogam com Resumo, Relatórios e o título da recomendação. Essa continuidade ajuda a integrar a experimentação ao LegalGrowth.

**Evidência:** capturas de Resumo e Relatórios.

### O restante da página mantém sobriedade

Indicadores, tabela de campanhas e orçamento não receberam efeitos equivalentes aos do palco. Os valores principais continuam visualmente identificáveis.

**Evidência:** capturas completas em ambos os temas.

### Há adaptação estrutural observável no celular

Os indicadores passam a linhas; os dados das campanhas são apresentados em blocos verticais; recomendação e orçamento ocupam a largura disponível. Não se trata simplesmente de encolher a tabela desktop.

**Evidência:** capturas de 320 e 390 px.

### A presença visual é consistente entre os temas

O tema escuro conserva hierarquia, cores editoriais e reconhecimento dos componentes. Não observei títulos principais desaparecendo, sobreposição de controles ou alteração estrutural entre os pares.

Isso é uma qualidade visual observada, sem equivaler a aprovação de contraste calculado.

## Correções mínimas prioritárias

1. **Antecipar indicadores e contexto do período.** É a alteração com maior efeito sobre a utilidade da página.
2. **Reduzir a altura do palco, especialmente no celular.** Preservar os objetos e retirar o excesso de área comprometida com navegação.
3. **Explicar abertura e destinos adjacentes com texto legível fora das capas.** Não depender de microtexto ou fragmentos laterais.
4. **Aliviar moldura e escurecimento periférico se a cena continuar dominando a página após os ajustes anteriores.**

Não vejo justificativa, com essas evidências, para refazer a identidade, trocar toda a tipografia, acrescentar texturas, introduzir efeitos ou redesenhar os componentes de dados.

## Veredito final

**REVISÃO NECESSÁRIA — boa base visual, com prioridade funcional insuficientemente resolvida.**

A transferência Arc é concreta e a família de dossiês tem coerência. A implementação já possui elementos próprios, especialmente na tradução editorial dos módulos.

O ponto que impede aprovação é a distribuição de importância: a vitrine recebe a primeira e maior área de atenção de uma página que promete resumir resultados. No celular, essa escolha também reduz a identificação imediata do conjunto de destinos.

As correções necessárias são de edição e hierarquia. O trabalho precisa demonstrar que a cena ajuda a usar o LegalGrowth, além de conferir presença à interface.

Este parecer se limita às capturas inspecionadas. Não há fundamento para aprovar ou reprovar animação, navegação por teclado, acessibilidade completa ou desempenho a partir delas.