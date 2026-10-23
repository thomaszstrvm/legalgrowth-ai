# Revisão de skills de design — 22/10/2026

Pedido: avaliar as recomendações do artigo da Composio para melhorar o visual existente, preservando conteúdo e funcionalidades.

Fonte: https://composio.dev/content/top-design-skills

## Seleção

1. **Impeccable** — instalada em `C:/Users/KABUM/.codex/skills/impeccable`, versão declarada 4.7.0. Melhor ajuste para composição, tipografia, hierarquia e crítica de uma interface existente. Para este painel, o modo pertinente é Operate; relatórios seguem Read. Fonte: https://github.com/pbakaus/impeccable
2. **AccessLint** — avaliada, não instalada. Complemento para contraste, foco, teclado, zoom e regressões de acessibilidade. O repositório mudou para https://github.com/AccessLint/skills. A versão atual separa scan, inspect, audit, fix e diff; algumas funções dependem de CLI/MCP e navegador. Não define identidade visual nem prova acessibilidade completa automaticamente.
3. **Frontend Design** — orientação já consultada na revisão anterior. Útil como base, mas sobrepõe parte do Impeccable; não priorizar mais uma instalação com a mesma função. Fonte: https://github.com/anthropics/skills/tree/main/skills/frontend-design
4. **Theme Factory** — avaliada, não instalada. Fornece dez combinações de cores e fontes; seu fluxo é centrado em temas de artefatos/apresentações. Pode ajudar a manter relatórios consistentes, mas trocar paleta não resolve a composição do painel. Fonte: https://github.com/composio-community/awesome-codex-skills/tree/master/theme-factory

## Evidência e diagnóstico

- Inspeção do template, CSS e captura existente `tmp/overview-light-1440.png`.
- A captura apresenta métricas, campanhas, revisão e orçamento em contêineres com tratamento muito semelhante. É uma observação visual, não um erro funcional.
- Hierarquia pouco diferenciada e ritmo repetitivo: a mesma distância e superfície aparecem em regiões com objetivos distintos.
- A navegação distribui muitas opções horizontalmente e o cabeçalho consome uma faixa extensa antes do conteúdo principal.
- Executado `impeccable context --target app/templates/dashboard.html`: contexto carregado; PRODUCT.md e DESIGN.md ausentes. O launcher emitiu também uma mensagem de rótulo de lote ausente; retornou contexto com código 0, portanto não registrar execução totalmente limpa.
- Executado `impeccable detect --json app/static/style.css app/templates/dashboard.html`: código 1, dois avisos de bordas laterais de 3px em mensagens/erros. São heurísticas estéticas, não falhas de segurança ou prova de que toda a interface é ruim. Não remover estados de erro para satisfazer um detector.

## Direção da próxima revisão

Priorizar composição e leitura: diferenciar resultado, detalhe e ação; reduzir contêineres redundantes; ajustar escala tipográfica, densidade e alinhamentos. Preservar textos, IDs de controles, rotas e estados existentes. Validar a tela renderizada nos dois temas e nas larguras já cobertas pelos testes. Uma auditoria mecânica sem avisos não substitui julgamento visual nem aprovação do usuário.

Esta etapa instalou e avaliou ferramentas; não alterou a interface nem executou testes funcionais novamente. Nenhuma API de IA paga foi chamada.
