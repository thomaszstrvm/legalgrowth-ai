# Auditoria e validação do redesign

Registro de uma etapa anterior. Para a composição atual, pesquisa complementar e verificações finais, consulte [DESIGN-FINAL-REVIEW.md](DESIGN-FINAL-REVIEW.md).

Data: 22/10/2026. Navegador real: Microsoft Edge/Chromium, Playwright Node, modo headless.

## Diagnóstico anterior

Capturas de referência em `output/design-review/before/` (88 arquivos PNG).

- Destinos como oportunidades e contratos estavam escondidos em links secundários.
- Título, escopo, intervalo e aviso de demonstração ocupavam faixas separadas, atrasando a leitura dos resultados.
- Alinhamento de todas as colunas após a primeira à direita prejudicava descrições e links.
- Gráfico existente não mostrava uma escala visível; o espaçamento de datas ignorava intervalos entre registros.
- A falha de uma operação reconstruía a tela e podia apagar dados do formulário.
- CSS compacto misturava valores repetidos com poucos tokens. Fonte dependia do sistema operacional.

## Verificações executadas

| Verificação | Resultado |
|---|---|
| `python -m pytest -q` | 113 aprovados; dois avisos anteriores (Starlette/httpx e pypdf.add_js) |
| `node --check app/static/app.js` e `theme.js` | Sintaxe válida |
| `browser-redesign.cjs before` | 11 páginas × 4 resoluções × 2 temas = 88 capturas |
| `browser-redesign.cjs after` | Mesma matriz: 88 capturas, sem overflow da página e sem erros de console |
| `browser-design-interactions.cjs` | Skip link, foco, rolagem de tabela por teclado, menu/Esc, reenvio de formulário, retenção de campos, gráfico, rótulos e reflow a 320px aprovados |
| Contraste de tokens | 20 pares texto/fundo, todos >=4,5:1 nos dois temas; detalhes em interaction-results.json |
| `browser-insights.cjs` | 24 capturas adicionais; tema persistente, menu móvel, papéis de IA alternados e falha fechada aprovados |
| `browser-resilience.cjs` | Rede, HTML de erro, armazenamento bloqueado e recuperação aprovados |
| `browser-smoke.cjs` | Oito páginas, revisão local demonstrativa, conferência de texto e conexão/desconexão simuladas aprovadas; chave fictícia ausente do armazenamento do navegador |
| Impeccable `detect --json` | Lista vazia de achados no CSS, template e scripts avaliados |
| `audit-design-tokens.py` | Inventário salvo em output/design-review/token-inventory.json |
| `browser-design-states.cjs` | Estado vazio sintético, nome longo em celular e comparador antes/depois aprovados |

Após a pesquisa de referências Awwwards, os tokens de cor e a escala do título foram refinados. Interações e 20 pares de contraste foram executados novamente e aprovados. A primeira tentativa de abrir Edge no sandbox falhou na inicialização; a execução autorizada fora dele passou. Os testes de backend acima pertencem à implementação anterior desta mesma revisão; a mudança visual não alterou o backend.

Resoluções da matriz: 1920×1080, 1366×768, 768×1024 e 390×844. Páginas: resumo, campanhas, insights, notícias, oportunidades, recomendações, contratos, orçamento, relatórios, configurações e ideias de conteúdo. Ambas as matrizes aguardam rede ociosa e renderização; não fazem POST. O smoke legado executa somente análises locais no escopo demonstrativo e simula provedores. Nenhum teste utilizou dados reais de clientes ou API paga.

## Inspeção visual

Capturas abertas e inspecionadas: resumo claro em 1920 e 1366; resumo escuro em 390; configurações escuras em 1920; campanhas claras em 768; relatórios claros em 1366; contratos escuros em 390; oportunidades vazias em 768. A matriz abre todas as páginas em navegador real; isso não significa inspeção humana individual de todos os 176 arquivos.

Comparador local: `output/design-review/index.html`. Resultados de cada execução: `before/results.json`, `after/results.json` e `interaction-results.json`. Captura adicional do gráfico expandido em `after/campaigns-expanded-1366.png`.

## Owl-Listener: crítica de hierarquia

| Dimensão | Observação e problema | Ajuste aplicado | Estado final |
|---|---|---|---|
| Entry Point | Contexto e aviso antecediam os resultados em faixas distintas | Período e aviso compartilham faixa compacta; três resultados permanecem como conjunto principal | pass |
| Eye Flow | Oportunidades e contratos exigiam procurar links em outras páginas | Destinos agrupados por Gestão e Análises, com estado atual visível | pass |
| Weight | Cabeçalhos e números dependiam de fontes instaladas; caixas sem papel claro | Fonte local, escala, superfície de tarefa, coluna de orçamento e controles com pesos distintos | pass |
| Emphasis | Vários elementos de contexto competiam no alto | Uma ação principal por conjunto; aviso de demonstração menor e contextual | minor issue: no celular o orçamento ainda exige rolagem após campanhas e recomendações |

Essas avaliações são julgamento de design, não resultado de pesquisa com usuários. Não foi inventada nota de satisfação ou ganho de produtividade.

## Owl-Listener: auditoria de tokens

Inventário por declarações, não por pixels: espaçamento 139/171 (81,3%); font-size 26/38 (68,4%); propriedades de cor selecionadas 80/85 (94,1%). O título fluido usa clamp diretamente. A expressão de inventário conta somente as categorias descritas em audit-design-tokens.py; não inclui todas as propriedades CSS nem mede conformidade completa.

- Cores restantes são `transparent` e `none`, não cores avulsas; manter.
- Espaçamentos restantes incluem `0`, `auto`, ajustes ópticos de 2/6/9/10/18px; não criar tokens sem significado só para aumentar a porcentagem.
- Tamanhos específicos de marca, tabela e breakpoints continuam locais. Próxima oportunidade de manutenção: promover um tamanho repetido a token quando outro componente passar a compartilhar o mesmo papel.
- Alteração já aplicada: migração dos espaçamentos recorrentes, raios e tamanhos principais; tokens de foco e linha da navegação.

## Auditoria Vercel: achados e limites

Regras consultadas: https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md

- `app/templates/dashboard.html:30` — corrigido: h1, descrição, seletor rotulado e nomeado, skip link e destino focável.
- `app/static/app.js:42` — corrigido: cabeçalhos com scope, região de tabela nomeada, teclado e alinhamento por significado.
- `app/static/app.js:183` — corrigido: erro próximo ao formulário, retenção dos campos e foco recuperável.
- `app/static/theme.js:7` — corrigido: cor da interface do navegador acompanha o tema.
- `app/static/theme.js:21` — corrigido: menu expõe estado e responde a Escape.
- `app/static/style.css:1` — verificados: foco visível, cores por tema, controles nativos, quebra de conteúdo, reduced-motion e fonte local.
- `app/static/app.js:21` — limitação mantida: filtros não são serializados na URL. Recarregar reinicia datas; escopo permanece em armazenamento local quando permitido.
- `app/static/app.js:183` — limitação mantida: preservação de campos cobre falha da operação, não navegação voluntária para outra página.

Não houve teste com leitor de tela real, Safari/Firefox, hardware móvel, latência de produção ou grandes bases reais. Reflow de 320px simula largura reduzida, não substitui todos os testes de zoom do navegador. Não declarar certificação WCAG. As páginas de notícias/oportunidades foram capturadas no estado sem coleta no escopo demo; análise real e importação de contratos reais não foram habilitadas.

## Arquivos de produto alterados

`app/templates/dashboard.html`, `app/static/style.css`, `app/static/app.js`, `app/static/theme.js`, `app/static/fonts/source-sans-3.ttf`, `app/static/fonts/OFL-SourceSans3.txt`. Configuração de distribuição: `.dockerignore` exclui ferramentas locais do contexto. Documentação, scripts de verificação e skills locais completam o trabalho. Backend, modelos, banco e APIs não foram modificados pelo redesign.
