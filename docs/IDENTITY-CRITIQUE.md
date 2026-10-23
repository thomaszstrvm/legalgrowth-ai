# Crítica independente de identidade visual

Data: 22/10/2026. Escopo: aparência do produto existente; nenhuma mudança de comportamento solicitada. Esta revisão não usa 9/10 como meta artificial nem considera a nota anterior como aprovação do usuário.

## Material inspecionado

- `output/design-review/after/overview-light-1366.png`, `overview-dark-1366.png` e `overview-light-390.png`.
- Capturas locais de Nova Dental, Arc Marumo, Legency, Format, Signal, Linear e Attio em `output/design-review/references/`.
- `DESIGN.md`, skills `frontend-design` e `critique-visual-hierarchy`.

As capturas públicas são evidência visual de estados específicos; não demonstram todos os comportamentos desses sites.

Na segunda leitura foram inspecionados `references/unic-live.png` e `references/payrix-live.png`, capturados pelo agente principal após visitar os projetos [Unic](https://www.behance.net/gallery/244848067/Unic) e [Payrix](https://www.behance.net/gallery/238265899/Payrix-FMS-SaaS-UX-UI-Dashboard-Design). Unic apresenta marca em azul profundo com símbolo dominante; Payrix combina superfície de produto com arte tridimensional e módulos claros. O estado capturado de Unic mostra sua abertura de identidade, não uma interface operacional. O estado de Payrix é um mockup inclinado, não uma sessão utilizável do produto.

A arte original proposta em `app/static/brand-folio.png` foi também inspecionada: lâminas translúcidas azuis em L. A ligação a dossiês e à inicial da marca é uma interpretação de design, não um significado universal. O motivo fornece uma assinatura mais identificável que a serifada e o cartão petróleo anteriores.

## Diagnóstico

A versão atual tem legibilidade e acabamento consistentes, mas a identidade continua intercambiável. Trocar LegalGrowth por outro nome preservaria praticamente toda a aparência. A composição é uma folha arredondada com seções horizontais, indicadores alinhados, gráfico e um cartão destacado. A serifada e o petróleo são escolhas estéticas; ainda não constituem um sistema visual reconhecível.

### Ponto de entrada — problema importante

**Observação:** o título “Resumo”, as três métricas e o bloco escuro atraem atenção separadamente. A marca fica pequena e distante deles.

**Problema:** não há uma ideia visual dominante que a pessoa recorde depois de fechar a tela. Em Nova, o retrato e o título formam uma única composição; em Format, a própria palavra é arquitetura; em Arc, os objetos e a moldura CRT contam uma história visual.

**Correção:** formar um masthead assimétrico único com título de página, contexto do período e indicadores existentes. Uma zona claramente maior deve ditar o ritmo. O título não precisa ficar gigantesco se o elemento dominante for uma composição original do gráfico real.

### Fluxo do olhar — problema menor

**Observação:** a navegação ocupa quase toda a largura; uma segunda linha de filtros atravessa o conteúdo antes do gráfico. No celular, métricas e controles atrasam a chegada à área principal.

**Problema:** a sequência é compreensível, porém tem o ritmo de uma tela administrativa longa. Todas as regiões começam e terminam no mesmo eixo.

**Correção:** separar a navegação em um trilho persistente no desktop e organizar contexto/filtros como utilidade compacta. Conservar os destinos, a ordem lógica de foco e o comportamento de menu móvel.

### Distribuição de peso — problema importante para o objetivo de portfólio

**Observação:** a superfície branca gigante ocupa quase toda a imagem; o bloco de revisão é a única mudança forte de cor. O modo escuro usa vários tons próximos de petróleo.

**Problema:** a unidade visual vem de um recipiente, não de uma composição. O contraste isolado de um cartão é um padrão comum de dashboard. A versão escura reduz ainda mais a distinção entre regiões.

**Correção:** construir duas ou três zonas arquitetônicas com papéis claros — navegação, resumo analítico, revisão — sem envolver tudo em uma folha. A revisão pode ocupar uma coluna ou faixa contínua, não aparentar um cartão opcional.

### Ênfase — problema menor funcional; importante de identidade

**Observação:** o gráfico tem a maior área, mas traço, preenchimento e escala são visualmente discretos. Os detalhes de marca quase não aparecem além do monograma.

**Problema:** muito espaço não produz personalidade quando o desenho continua padrão. Ícones adicionais, bordas e raios não resolvem isso.

**Correção:** transformar o gráfico existente no elemento gráfico principal, sem inventar flutuações ou dados. Dar-lhe eixo, legenda e traço com acabamento preciso; relacionar sua geometria a uma marca própria, repetida apenas em locais funcionais.

## Três mudanças estruturais recomendadas

1. **Masthead próprio e assimétrico.** Título/contexto e indicadores integrados em uma composição com proporção marcante, inspirada na diferença de escala de Signal e na unidade entre conteúdo e imagem de Nova. Não copiar retrato, slogan ou estilo de agência. Evitar números decorativos e indicadores inventados.
2. **Arquitetura de produto com trilho e zonas.** Remover o recipiente arredondado que envolve a página inteira. Navegação lateral compacta no desktop, conteúdo com largura controlada e revisão editorial como área contínua. Linear fornece uma referência útil para separação entre navegação e trabalho, sem transformar o produto em clone.
3. **Sistema gráfico autoral coerente.** Um motivo reconhecível derivado de direção, evidência e crescimento pode orientar marca, gráfico e separadores. Usar cor com contraste claro entre superfícies e tipografia com diferença real de escala. Legency/Arc mostram a força de repetir uma ideia formal; não justificam importar seus assets ou efeitos visuais sem função.

## Critério da próxima comparação

Colocar a captura nova ao lado da anterior e de pelo menos dois projetos específicos efetivamente inspecionados. Registrar em cada par o que é perceptivelmente semelhante (proporção, hierarquia, arquitetura, ritmo) e o que continua distante. Se a mudança puder ser descrita apenas por cor, fonte, ícone ou borda, o trabalho ainda não atende ao pedido.

A revisão final deve inspecionar desktop claro/escuro, celular e pelo menos uma tela interna rica. A mesma identidade precisa continuar reconhecível fora do Resumo. A semelhança com referências não exige cópia literal; exige decisões visuais transferidas e visíveis, sem perder a operação existente.

## Revisão final

### Primeira implementação da nova identidade

Inspecionadas novamente as capturas de Resumo claro/escuro em 1366px, Resumo claro em 390px, Configurações claro em 1366px e Relatórios escuro em 390px.

| Referência e aspecto observado | Transferência visível no LegalGrowth | Limite |
|---|---|---|
| Payrix: arte tridimensional faz parte da superfície do produto e dos indicadores. | Capa navy contém arte de lâminas e uma faixa contínua de métricas; os números não estão em cartões separados. | Payrix tem maior variedade compositiva e materiais translúcidos; aqui a leitura dos números permanece deliberadamente opaca. |
| Unic: assinatura em azul profundo e símbolo dominante. | Capa e acento formam uma família navy/cobalto; a arte fornece um motivo que pode se relacionar à inicial L. | A captura de Unic é identidade de marca, não dashboard. A semelhança não comprova igualdade de qualidade. |
| Linear: trilho lateral separa navegação e trabalho. | Os mesmos destinos agora vivem em um trilho com agrupamentos e estado ativo; o conteúdo tem sua própria área. | Não se copiou a densidade extrema nem o conteúdo de gestão de tarefas. |
| Nova: composição assimétrica com conteúdo legível e elemento visual dominante. | O título está à esquerda e a arte à direita, com faixa de indicadores na base. | Não há fotografia nem a escala de uma landing page; o gráfico precisa continuar próximo à primeira dobra. |

**Conclusão parcial:** a mudança ultrapassa bordas e cores. A assinatura é mais perceptível e aparece também nas telas internas. A superfície única foi substituída por arquitetura de navegação/conteúdo e por uma abertura com imagem integrada a dados existentes. O salto é real; não se atribui uma nota conveniente para encerrar a tarefa.

**Correções solicitadas nesta leitura:**

1. O recorte da arte no desktop esconde a base horizontal das lâminas, enfraquecendo a leitura em L. Mostrar ao menos uma base e fazer a marca vetorial partilhar essa geometria.
2. Reduzir a capa do Resumo: na captura inicial o gráfico começa em aproximadamente 532px e os dados perto de 650px. A abertura não deve atrasar a tarefa principal.
3. Alinhar o estado ativo de Configurações aos demais itens da navegação. Na captura inicial o texto encosta na borda esquerda de seu fundo.
4. Verificar área de toque dos downloads em Relatórios no celular: visualmente parecem chips pequenos frente aos controles da tela.

### Conferência após os ajustes

As mesmas cinco capturas foram abertas novamente após a atualização final. A base horizontal das lâminas está visível no Resumo desktop e o monograma agora repete os três Ls. A capa termina em aproximadamente 351px (começa em 28px); o gráfico passa a começar perto de 491px. Configurações ganhou respiro lateral no estado ativo. Os downloads de Relatórios passaram a ter contorno e altura visual compatível com controles, em vez de etiquetas.

| Dimensão | Resultado final nesta amostra |
|---|---|
| Ponto de entrada | **Passa.** Capa e faixa numérica formam uma única região dominante; a arte e a marca compartilham geometria. |
| Fluxo do olhar | **Passa.** Trilho → abertura → contexto → análise é uma sequência legível. No celular a sequência se mantém sem depender do trilho. |
| Distribuição de peso | **Passa, com limite.** A capa sustenta a assinatura, a análise fica em segundo plano e os dados permanecem sóbrios. A parte abaixo da abertura ainda usa padrões familiares de produto; isso não deve ser vendido como experimentação visual em toda a tela. |
| Ênfase | **Passa.** Há uma zona principal clara e o botão de revisão tem contraste suficiente na inspeção visual. Contraste calculado e comportamento são responsabilidade dos testes, não desta leitura de imagens. |
| Relação com referências | **Observável.** Payrix se manifesta na integração arte/interface/métricas; Unic na assinatura navy e símbolo; Nova na composição assimétrica; Linear na separação de navegação e trabalho. |
| Consistência | **Passa na amostra.** Configurações e Relatórios mantêm a assinatura e a estrutura mesmo sem as métricas do Resumo. |

**Parecer:** esta versão apresenta uma identidade mais marcante e uma mudança de composição comprovável em relação à anterior. Não é apenas troca de bordas nem um banner adicionado sobre a mesma folha. A linguagem do produto e a linguagem visual das referências agora têm relações identificáveis. Não encontrei bloqueador visual que justifique reconstruir tudo novamente nas capturas inspecionadas. A aprovação estética final continua sendo do usuário; não há certificação de prêmio, nota objetiva ou previsão de reação de recrutadores.

O maior limite residual é que a arte domina a identificação: sem a capa, os componentes operacionais continuam convencionais. O monograma coerente, o trilho e a paleta reduzem essa dependência, mas não a eliminam. Isso é um trade-off explícito para manter legibilidade e não inventar interações ou funcionalidades.

### Comparação lado a lado conferida

Foram abertos `output/design-review/reference-side-by-side-payrix.png` e `reference-side-by-side-unic.png`. Ambos apresentam a referência real com a interface do Behance preservada e a captura atual do LegalGrowth ao lado. As legendas distinguem corretamente mockup de produto (Payrix) e identidade de marca (Unic), explicitam a transferência de princípios e não afirmam equivalência funcional, aprovação externa ou premiação do LegalGrowth. A comparação é honesta quanto ao que as imagens comprovam. O recorte inicial do produto mostra a abertura e o começo do gráfico; o comparador informa que cada quadro permite rolagem e oferece ampliação da captura para ver o restante.
