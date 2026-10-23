# LegalGrowth — pesquisa aplicada de design engineering

Data da consulta: 23/10/2026. Responsabilidade: Design Researcher. Este documento apoia a implementação e a crítica; não constitui uma declaração de que as melhorias foram implementadas ou validadas.

## Decisão orientadora

Manter uma identidade editorial reconhecível e tornar o trabalho cotidiano previsível. Capas e cabeçalhos podem variar em composição; campos, tabelas, navegação, ações e mensagens devem compartilhar uma linguagem estável. O ganho prioritário vem de tornar evidente **onde estou, quais dados estou vendo, o que posso fazer e o que aconteceu**, não de aumentar a quantidade de efeitos.

Essa é uma síntese para este produto, derivada das fontes abaixo. Os autores não prescrevem uma solução específica para o LegalGrowth.

## Evidência local e implicações para a stack

Inspeção de código, sem acesso a credenciais ou dados de clientes:

- `app/api.py` instancia FastAPI e configura `Jinja2Templates`.
- `app/templates/dashboard.html` fornece navegação, cabeçalho, período, escopo real/demonstrativo, região de mensagens e `#content`. Carrega `style.css` antes de `arc.css`.
- `app/static/app.js` gera grande parte da interface operacional. Há helpers `panel`, `details`, `table`, `input` e `metrics`; somente criar macros Jinja não padronizaria esses componentes.
- O helper de tabela já fornece cabeçalhos com `scope="col"`, região identificada, rolagem e classes numéricas. Carregamento, mensagem de erro, tentativa novamente e feedback em formulários já têm implementação. Devem ser preservados e verificados, não apresentados como funcionalidades novas.
- Os dados real e demonstrativo têm controle explícito; a marcação desse contexto é informação funcional, não ruído a eliminar.

**Recomendação de engenharia:** manter FastAPI/Jinja e JavaScript existente. Consolidar papéis visuais em propriedades CSS, aplicar classes consistentes aos helpers que geram HTML e extrair templates apenas onde há repetição real. Antes de trocar um elemento ou wrapper, conferir seletores, IDs, eventos, foco e estados. Uma nova biblioteca de componentes ou SPA não é necessária para executar essa direção.

Não foi feito neste trabalho um inventário completo de rotas, uma auditoria de todos os handlers ou um teste funcional do aplicativo. A inspeção serve para tornar as recomendações compatíveis com a implementação observada.

## Sete fundamentos obrigatórios, com aplicação e limites

### 1. Refactoring UI — Adam Wathan e Steve Schoger

**Fonte primária consultada:** [site oficial e sumário público](https://refactoringui.com/). A página apresenta táticas de hierarquia, espaçamento, escala tipográfica, cor e profundidade, além de exemplos públicos. Não foi obtido o livro completo nem feita inscrição para receber capítulos.

**Aplicar:** definir o que lidera cada região antes de ajustar tamanhos; diferenciar título, valor e contexto; substituir contêineres redundantes por proximidade ou superfície tonal quando a relação continuar clara. Limitar escolhas de espaçamento e texto.

**No produto:** um valor financeiro precisa de unidade e período próximos, mas esses textos não precisam competir com ele. Uma seção de edição pode ter superfície própria; uma lista de resultados não precisa de caixa adicional por linha.

**Limite:** títulos de capítulos do sumário são evidência de temas, não autorização para extrapolar o conteúdo inteiro. A sugestão de reduzir bordas não significa retirar contornos necessários de inputs ou foco.

### 2. Practical UI — Adham Dannaway

**Fontes primárias consultadas:** [página oficial](https://www.practical-ui.com/) e [artigo do autor com 16 ajustes de UI](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips). O link público de prévia retornou à própria página; foram usados seus exemplos e o artigo, sem cadastro.

**Aplicar:** proximidade para agrupar, alinhamentos consistentes, componentes semelhantes com comportamento semelhante, cor com função e rótulos descritivos. A página do livro também recomenda controlar comprimento das linhas e organizar conteúdo por títulos úteis.

**No produto:** alinhar rótulo, campo, ajuda e erro numa mesma coluna; distinguir a ação que conclui a tarefa das ações auxiliares; evitar que ícones substituam nomes de destinos.

**Limite:** a recomendação de uma única sans-serif no artigo não precisa apagar a identidade existente. A adaptação proposta é reservar a serif editorial aos títulos e usar a sans já disponível na informação operacional. Não adotar automaticamente todas as preferências estéticas do exemplo.

### 3. Art Direction for the Web — Andy Clarke

**Fonte primária consultada:** [página oficial da editora](https://www.smashingmagazine.com/printed-books/art-direction-for-the-web/). Há apresentação do método e link de amostra oficial; a tentativa de abrir o PDF da amostra falhou nesta ferramenta. Não foi acessado o livro completo.

**Aplicar:** escolher composição pela intenção comunicativa; usar grid e ritmo para relacionar conteúdo à marca, sem apenas imitar arte impressa. A apresentação da editora enfatiza quando e por que usar as técnicas, além de como implementá-las.

**No produto:** a coleção de dossiês e o cabeçalho são lugares adequados para expressão. Formulários recorrentes, tabelas e mensagens precisam priorizar leitura, orientação e previsibilidade.

**Limite:** assimetria não é uma obrigação em cada tela. Não deslocar ações, diminuir contraste ou alterar ordem de leitura para aproximar um formulário de uma capa editorial.

### 4. Designing Interfaces, 3ª edição — Jenifer Tidwell, Charles Brewer e Aynne Valencia

**Fonte primária consultada:** [O'Reilly, apresentação e sumário públicos](https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/). O acesso completo é oferecido à parte; não foi utilizado.

**Aplicar:** selecionar padrões pelo tipo de tarefa. O sumário diferencia telas de visão geral, foco num item, criação e execução; inclui navegação, exposição progressiva, listas, ações, dados complexos, mensagens de erro e sistemas de componentes.

**No produto:** Campanhas é comparação; Orçamento mistura leitura e edição; Contratos exige conferência; Relatórios é preparação e saída de documentos. Essas funções justificam composições diferentes, com controles comuns.

**Limite:** citar um padrão do sumário não comprova que ele seja adequado sem observar o fluxo. Não criar wizard, modal ou painel lateral apenas para modernizar a aparência; usar o fluxo existente quando ele já atende à tarefa.

### 5. Laws of UX — Jon Yablonski

**Fontes primárias consultadas:** [coleção do autor](https://lawsofux.com/), [Hick](https://lawsofux.com/hicks-law/), [Fitts](https://lawsofux.com/fittss-law/) e [Jakob](https://lawsofux.com/jakobs-law/).

**Aplicar:** organizar decisões complexas em grupos compreensíveis; oferecer alvos fáceis de alcançar; manter comportamentos reconhecíveis; usar proximidade e região comum para comunicar relações.

**No produto:** aproximar filtros dos dados afetados, manter indicação de página atual, tornar ações móveis fáceis de acionar e deixar visível o caminho de recuperação de erro.

**Limite:** essas sínteses são heurísticas, não medidas de usabilidade deste produto. Hick não determina uma quantidade máxima universal de itens de menu. Redução de opções não deve esconder tarefas frequentes. Fitts não substitui os critérios normativos de acessibilidade.

### 6. Thinking with Type, 3ª edição — Ellen Lupton

**Fontes primárias consultadas:** a [URL indicada da autora](https://ellenlupton.com/Thinking-with-Type) redirecionou para `elupton.com` sem texto recuperável. Foi consultada a [página da terceira edição na Chronicle Books](https://www.chroniclebooks.com/products/thinking-with-type-1), que descreve famílias, espaçamento, alinhamento, grids, agrupamento, responsividade e legibilidade.

**Aplicar:** dar papéis claros às famílias existentes, controlar largura dos textos longos e manter ritmo entre título, explicação, dados e controles. Testar palavras reais em português e números longos, não apenas títulos curtos de demonstração.

**No produto:** serif para identidade editorial; sans para formulários, metadados e leitura de registros. Valores alinhados e, quando o arquivo de fonte suportar, algarismos tabulares podem ajudar comparação.

**Limite:** as fontes públicas consultadas não impõem uma escala numérica universal. Valores de tamanho, peso e altura de linha são decisões locais a verificar nas capturas, não prescrições atribuídas à autora.

### 7. Design Systems — Alla Kholmatova

**Fonte primária consultada:** [página oficial da Smashing](https://www.smashingmagazine.com/design-systems-book/), incluindo fundamentos, padrões funcionais/perceptuais e práticas compartilhadas. A amostra PDF oficial não abriu na ferramenta.

**Aplicar:** inventariar padrões reais, nomear sua função, documentar quando usar e manter uma linguagem comum. O sistema deve evoluir junto com o produto.

**No produto:** tokens como superfície de edição, texto secundário, borda de controle e estado de foco são mais úteis que nomes de uma cor solta. Macros/helpers precisam preservar diferenças entre consulta, edição e alerta.

**Limite:** o livro não é uma justificativa para adicionar tooling. Uma tabela de tokens, helpers existentes e documentação curta podem ser suficientes. A mesma aparência para todos os componentes elimina distinções úteis e não equivale a consistência.

## Referências contemporâneas: descoberta e aplicação

### Fontes de descoberta solicitadas

| Fonte pública | O que foi acessado | Uso e limite |
|---|---|---|
| [Awwwards](https://www.awwwards.com/) | Página pública do diretório | Descoberta de direção de arte e composição. Reconhecimento visual de um site não comprova qualidade de formulários ou uso diário. |
| [Godly](https://godly.website/) | A ferramenta observou redirecionamento para [recent.design](https://recent.design/?ref=godly), inacessível nesta consulta | Não se atribuiu nenhuma observação visual ao catálogo. Falha da ferramenta não prova indisponibilidade geral do serviço. |
| [Mobbin](https://mobbin.com/) e [Explore web](https://mobbin.com/explore/web) | Página pública e índice de web apps, com categorias de telas, elementos e fluxos; continuação pede login | O índice diferencia tabelas, toolbars, filtros, estados vazios e carregamento. Não foram examinados fluxos privados completos, nem feita conta ou compra. |

Arc e referências editoriais anteriores servem à área expressiva. Para os componentes operacionais, a evidência mais útil deste ciclo vem da documentação dos próprios produtos abaixo.

### Linear — contexto, filtros e apresentação

**Fonte:** [Display options](https://linear.app/docs/display-options) e [Filters](https://linear.app/docs/filters), documentação pública primária consultada. Ela separa critérios que escolhem os dados das opções que organizam sua apresentação; também documenta que diferentes telas oferecem opções diferentes.

**Transferência recomendada:** agrupar período, área e escopo numa barra reconhecível junto à região que controlam. Mostrar o contexto aplicado, manter a ação de aplicar e a possibilidade de corrigir a seleção. O usuário não deve inferir por cor quais registros estão vendo.

**Não transferir nesta rodada:** persistência de views compartilhadas, novo construtor de filtros, kanban, atalhos ou menu de comandos. Exigem contratos e testes próprios. A referência apoia organização visual, não adição de funcionalidades.

### Attio — registro, lista e detalhe

**Fonte:** [Understanding records](https://attio.com/help/reference/attio-101/attios-data-model/understanding-records) e [Create and view records](https://attio.com/help/reference/managing-your-data/records/create-and-view-records), documentação pública primária consultada. O mesmo registro pode aparecer em tabela, prévia e página; a documentação torna explícitas as operações de filtrar, ordenar, escolher atributos e abrir detalhes.

**Transferência recomendada:** preservar a tabela como espaço de comparação, dar peso ao identificador da linha, alinhar números e deixar claras ações e detalhes existentes. Nas telas de edição, separar a informação principal da ajuda e de metadados secundários.

**Não transferir nesta rodada:** CRM flexível, seleção em lote, edição inline, novos previews ou personalização de colunas. Não foram testados painéis privados do Attio; documentação não equivale a uso interativo completo.

## Recomendações priorizadas para implementação

As medidas abaixo são propostas locais, não transcrições dos livros. A aceitação depende de inspeção do resultado e testes.

| Prioridade | Alteração recomendada | Ganho esperado | Como verificar |
|---|---|---|---|
| P0 | Inventariar tarefas, estados e seletores antes de mudar wrappers | Preservar comportamento e evitar regressão silenciosa | Comparar IDs/eventos e executar fluxos representativos antes/depois. |
| P1 | Organizar contexto e ação principal de cada página numa estrutura estável | Menos procura e ambiguidade sobre período/escopo | Identificar página, período, dados reais/exemplo e próxima ação sem depender da gravura. |
| P1 | Consolidar estados normal, foco, hover, erro, indisponível e em andamento | Previsibilidade e acessibilidade | Operar teclado, provocar erro de rede/validação e conferir recuperação. |
| P1 | Padronizar grupos de campos, ajuda e erro, mantendo rótulos visíveis | Melhor leitura e correção de dados | Formulários reais com textos longos, validação inválida e viewport estreita. |
| P1 | Tratar tabela como comparação, com nomes legíveis e números alinhados | Mais informação útil por área sem perder contexto | Registros longos e valores grandes; conferir cabeçalhos e dados no celular. |
| P2 | Definir escala curta e papéis de texto/espaçamento/superfícies | Consistência sem tornar todas as telas iguais | Revisar amostra de Campanhas, Orçamento, Contratos, Relatórios e Configurações. |
| P2 | Concentrar expressão editorial em lugares que não interrompem a tarefa | Identidade sem ornamentar cada controle | Comparar abertura, telas densas e estados vazios nos dois temas. |

Sequência sugerida: fundamentos compartilhados → uma tela de consulta e uma de edição → validação → expansão para demais páginas. Evitar somar uma nova camada extensa de overrides sem resolver o papel das existentes. Alteração de fluxo ou persistência deve ser registrada separadamente da alteração visual.

## Acessibilidade como critério verificável

A referência normativa é o [guia oficial WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/), e não uma nota estética. Para este ciclo, conferir contraste textual e dos controles, navegação por teclado, foco visível e não totalmente encoberto, nomes acessíveis, ordem de leitura, mensagens de estado e identificação de erros.

O critério AA 2.5.8 estabelece alvo de 24×24 CSS px, com exceções descritas na norma. Preferir áreas maiores para toque pode ser uma escolha de conforto, mas 44 px não deve ser apresentado como o mínimo AA universal. Cor isolada não deve comunicar seleção ou erro. Não declarar conformidade integral com base em screenshots ou numa ferramenta automatizada única.

## Trade-offs e limites desta pesquisa

- **Personalidade versus reconhecimento:** variar a composição por função; manter a interação dos controles. Uma tabela pode ser mais sóbria que a capa sem perder identidade.
- **Densidade versus leitura:** reduzir wrappers e espaçamento redundante pode melhorar foco; reduzir fonte, alvo ou contexto pode piorar o uso. Medir no estado real renderizado.
- **Reuso versus manutenção:** classes e helpers coerentes reduzem divergência; um componente genérico com muitas exceções pode aumentar complexidade. Extrair o padrão depois de observar pelo menos seus usos concretos.
- **Segurança:** preservar escape de texto, fronteira entre dados reais e exemplo, validação e contratos de API. Nenhuma proposta exige enviar dados a serviço externo.
- **Desempenho:** CSS e HTML existentes bastam para as propostas; isso evita dependência nova, mas não constitui medição de ganho de desempenho. Não foi executado benchmark.
- Foram pesquisadas fontes públicas legítimas e conteúdos editoriais autorizados. Nenhum livro completo foi obtido, nenhuma biblioteca paga foi acessada e nenhuma conta, skill, fonte ou dependência foi instalada.
- Pesquisa web foi textual; as páginas públicas dos produtos não foram operadas em contas privadas. Não houve nesta subatividade novo teste de aplicativo, captura renderizada ou auditoria completa de acessibilidade.
- O trabalho de implementação, a crítica independente e a validação funcional pertencem às etapas seguintes. Esta pesquisa fornece critérios e limites para elas, sem antecipar aprovação.
