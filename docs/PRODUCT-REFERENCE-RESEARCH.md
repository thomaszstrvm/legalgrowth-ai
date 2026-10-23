# Referências de produto e direção visual

Data: 22/10/2026. Escopo: pesquisa do subagente B para o briefing de redesign do produto existente. Este documento registra observações e recomendações; não certifica a implementação ou a aprovação estética.

## O que foi efetivamente observado

O briefing completo foi lido. A pesquisa abaixo usa documentação oficial pública de interfaces operacionais, além das referências de direção de arte já examinadas. Não usa uma landing page comercial como prova de funcionamento do software.

| Referência | Evidência e limite | Aplicação concreta ao LegalGrowth | Não transportar |
| --- | --- | --- | --- |
| [Linear — Display options](https://linear.app/docs/display-options) | Página lida e captura de interface inspecionada no navegador: menu compacto de opções sobre a área de trabalho, seletores e grupos de propriedades claramente separados. A documentação distingue layout, agrupamento, ordenação e propriedades visíveis. Não houve acesso a um workspace privado. | Separar a navegação global dos controles da tela; agrupar filtros já existentes numa barra curta; usar hierarquia de texto e alinhamento para organizar conteúdo técnico. | Kanban, atalhos globais, menus de personalização ou novas opções apenas para imitar o Linear. A moldura promocional da captura não é a superfície do produto. |
| [Attio — Table views](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views) | Captura oficial ampliada e inspecionada: tabela contínua, cabeçalho discreto, ações acima, dados organizados por coluna e cor localizada nos estados. A página explica formatação de datas/moeda e prévia contextual do registro. Não foi testado o aplicativo autenticado. | Tabelas reais para relatórios, campanhas e critérios; rótulos compreensíveis sem renomear atributos da API; alinhamento numérico; detalhes associados ao mesmo item. | Avatares e etiquetas multicoloridas decorativas, edição de célula, construtor de tabelas e configuração de colunas que não existem no escopo atual. |
| [Attio — Records](https://attio.com/help/reference/managing-your-data/records/create-and-view-records) | Documentação pública consultada sobre reunir contexto relacionado a um registro. | Uma oportunidade deve manter acontecimento, fonte, datas, justificativas e limites juntos; detalhes não devem exigir relembrar a qual oportunidade pertencem. | Criar CRM, atividade social, comentários ou registro de pessoas. |
| [Stripe — Dashboard basics](https://docs.stripe.com/dashboard/basics) | Documentação pública lida. A tentativa de acessar o dashboard privado foi bloqueada no fluxo do agente principal; não houve tentativa de contornar esse bloqueio. Nenhuma conta financeira foi inspecionada. | Distinguir tarefas e configurações; tornar valores, relatórios e ações existentes imediatamente identificáveis. | Copiar uma interface privada não observada ou afirmar que login/transações foram testados. |
| [Stripe — Report filters](https://docs.stripe.com/reports/options) e [Reports](https://docs.stripe.com/stripe-reports) | Conteúdo público consultado: período, moeda, escopo e disponibilidade afetam a interpretação de um relatório. | Exibir o período e a unidade junto dos valores e downloads; distinguir falta de dados de valor zero; não insinuar tempo real quando a informação é histórica. | Modificar a semântica de períodos, criar conciliação financeira, atribuir retorno calculado que o backend não fornece. |
| [Arc Marumo](https://www.arcmarumo.com/) | Inspeção anterior real e captura local `output/design-review/references/arc-live.png`: um foco central intencional com controles periféricos. | Uma tarefa dominante por região e identidade deliberada; retirar decoração que compete com a informação. | Televisão retro, VHS, WebGL, navegação experimental ou interação obrigatória para ler dados. |
| [Nova Dental](https://nova-dental-dev.webflow.io/) | Inspeção anterior real, capturas `nova-live.png` e `nova-detail.png`: contraste entre tipografia expressiva e suporte discreto, composição assimétrica. Não se atribui prêmio não verificado a esta referência. | Serif editorial apenas nos pontos de entrada; alternância entre leitura narrativa e dados; proporções consistentes. | Fotografia odontológica, hero comercial dentro do app, áreas vazias de altura promocional. |

As capturas públicas de Linear e Attio foram observadas no navegador nesta pesquisa. A revisão principal salvou posteriormente `references/linear-live.png` (demonstração pública) e `references/attio-live.png` (tabela ampliada da documentação oficial) no comparador local. Os documentos Stripe foram verificados textualmente; não se deve chamar essa etapa de inspeção visual do dashboard autenticado.

## Três direções comparadas

| Direção | Tipografia e cor | Densidade e composição | Benefício | Custo ou risco |
| --- | --- | --- | --- | --- |
| Console analítico compacto | Sans em todos os níveis; neutros, cor de ação pontual; números tabulares. | Listas e tabelas muito presentes, títulos pequenos, navegação utilitária. | Alta eficiência e leitura comparativa. | Repete a aparência administrativa já rejeitada se a composição depender apenas de divisórias e campos. |
| **Workspace analítico editorial — escolhida** | Newsreader nos títulos de página e poucos títulos narrativos; sans existente nos controles, texto e números; paleta neutra atual com acento controlado. | Abertura curta, conteúdo denso em regiões de funções diferentes: indicadores, tabela, narrativa e evidência. Assimetria nasce do conteúdo. | Personalidade institucional sem perder precisão; preserva tipografia já instalada e arquitetura atual. | Exige disciplina: serif em todas as tabelas ou títulos gigantes desfazem a hierarquia; mistura precisa ser consistente em todas as telas. |
| Experiência narrativa imersiva | Títulos muito grandes, imagens, contraste dramático e transições expressivas. | Primeira dobra dominada por apresentação da marca. | Forte impressão inicial para divulgação. | Inadequada ao trabalho recorrente: empurra dados para baixo, piora a comparação e repete a crítica de landing page dentro do dashboard. |

Escolha fundamentada: a segunda direção combina a identidade observada em Nova/Arc com a disciplina operacional de Linear/Attio. Não depende de mudar outra vez toda a paleta, introduzir uma biblioteca ou reconstruir a navegação. A referência orienta a estrutura, não uma cópia de marca.

## Aplicação imediata ao sistema existente

### Abertura e navegação

- Reduzir o título desktop de 88 para aproximadamente 56 px; no celular, cerca de 36–40 px. Estes valores são propostas de projeto, não medidas extraídas dos sites.
- Reservar no máximo uma frase curta de apoio. Período, escopo e estado dos dados vêm na mesma abertura, sem uma segunda apresentação institucional.
- Nas telas analíticas, começar conteúdo útil antes de consumir a primeira dobra com título e navegação. Não usar altura mínima de hero.
- O título pode ser serif; controles, rótulos e cabeçalhos tabulares precisam da precisão da sans. Indicadores financeiros usam algarismos tabulares, unidade e alinhamento consistente.
- Preservar distinção advogado/admin e permissões atuais. A composição deve orientar cada papel sem promover ações administrativas para todos.

### Oportunidade estratégica: hierarquia sem omitir informação

Base inspecionada: `app/static/app.js`, função `strategyPanel`, e `app/services/strategy.py`, funções `opportunities` e `dimension`. A apresentação anterior usava dois blocos grandes de métrica e parágrafos pouco diferenciados; nem todos os campos retornados eram exibidos.

Composição recomendada para cada oportunidade, usando os campos existentes:

1. **Acontecimento:** título com fonte e data de publicação próximos; data do fato separada quando conhecida. Cidades e áreas como metadados de texto, sem uma coleção de badges decorativos.
2. **Duas avaliações independentes:** benefício social e potencial financeiro lado a lado no desktop, cada qual com nota/status próprios. O rótulo permanece visível e inequívoco. Não somar nem fazer média.
3. **Leitura de contexto:** dois blocos narrativos identificados, “Relevância para a comunidade” e “Viabilidade para o escritório”, ligados respectivamente a `social_view` e `economic_view`. No celular, empilhar na mesma ordem.
4. **Limites da conclusão:** confiabilidade da fonte, incerteza, conflito, necessidade de revisão humana e objeção (`devils_advocate`) claramente identificados. Não esconder um conflito conhecido apenas num detalhe fechado.
5. **Próxima ação:** `next_step` como instrução textual distinta; o link para a fonte deve continuar próximo. Não converter recomendação em automação de publicação.
6. **Como a avaliação foi feita:** `details` nativo já existente para método e tabela dos critérios, pesos, valores, justificativas e referências de evidência quando presentes; listar critérios faltantes. O título do detalhe deve dizer o que será encontrado, não “Ver mais”.

Isso produz uma ficha analítica contínua, com um cabeçalho compacto e conteúdo editorial, em vez de vários cartões repetidos. Não é necessário criar drawer, estado de seleção global ou nova rota para conseguir contexto local.

### Estado real dos dados: não maquiar insuficiência

Na versão de `strategy.py` inspecionada, `opportunities()` gera `event_date=None`, `uncertainty='high'`, `conflict=None`, `method='deterministic'`, revisão humana obrigatória e dimensões com critérios vazios. A interface precisa funcionar bem nesse estado predominante.

- Nota `null` significa **Dados insuficientes**, nunca zero. Não desenhar barra vazia que sugere desempenho ruim.
- `conflict=None` não demonstra ausência de conflito: usar **Conflito não informado** ou equivalente, não “Sem conflitos”.
- Data de publicação não é data do acontecimento. Se a segunda não existe, comunicar que não foi informada.
- “Método baseado em regras” comunica `deterministic` de forma compreensível. Não chamar o resultado de revisão por IA ou validação independente.
- A pontuação completa depende das evidências confirmadas e dos pesos já definidos; frontend não altera esse cálculo.
- Critérios faltantes são conteúdo útil: explicam por que a plataforma ainda não apresenta uma nota e o que falta para avaliar. Devem ter rótulos em português e preservar as chaves internas.

### Relatórios e configurações

Relatórios: uma faixa de contexto, tabela de itens com tipo/período/estado e ações atuais por linha. Texto explicativo fica em região de leitura; download não precisa de cartão promocional. Configurações: seções por tarefa, rótulos persistentes e estado de conexão junto do provedor; título expressivo moderado e formulários densos. Não ocultar instruções essenciais da chave ou elevar detalhes de implementação ao cabeçalho.

## Microinterações e limites de manutenção

Reutilizar hover, foco, carregamento e `details` atuais. Fazer a interação esclarecer seleção, expansão ou indisponibilidade. Não adicionar transições de página, cursor especial, espera artificial ou efeitos de abertura. Com preferência por movimento reduzido, qualquer transição decorativa deve desaparecer.

O ganho está em hierarquia e semântica: campos continuam vindo das mesmas APIs, permissões não mudam e a complexidade de estado permanece pequena. Componentes distintos para tabela, narrativa e avaliação evitam forçar todos os conteúdos na mesma caixa. O custo é revisar mais de um padrão visual; tokens e regras compartilhadas reduzem deriva.

## Verificação a executar pelo agente principal

Pesquisa e inspeção de código não substituem validação do frontend. Após implementação: conferir estratégia com dados sintéticos completos e insuficientes; testar abertura dos detalhes por teclado; comparar 1440/768/390, claro/escuro; verificar que nenhum campo desapareceu, dados nulos não viraram zero e origem/data continuam associadas ao item. Avaliar densidade pela quantidade de conteúdo útil visível, sem sacrificar legibilidade para caber tudo numa única dobra.
