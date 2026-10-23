> Registro histórico: esta direção foi substituída pela rodada folio. Consulte [BRAND-FOLIO-REVIEW.md](BRAND-FOLIO-REVIEW.md) e [DESIGN.md](../DESIGN.md). Notas, capturas e testes abaixo pertencem à versão anterior.

> Registro histórico da rodada anterior. Direção e validação atuais: [PORTFOLIO-VISUAL-REVIEW.md](PORTFOLIO-VISUAL-REVIEW.md).

# Revisão final do redesenho — 22/10/2026

## Diagnóstico e resultado

A versão anterior dependia de molduras, painéis repetidos e uma abertura grande. Isso fazia a interface parecer administrativa mesmo quando alinhamento e bordas estavam corretos. A rodada atual muda composição, tipografia e apresentação do conteúdo, preservando FastAPI, APIs, autenticação, persistência e regras de negócio.

A navegação ocupa o topo; o Resumo reúne título e três resultados, depois gráfico temporal e revisão lateral. Campanhas aparecem em tabela aberta; orçamento em uma faixa tonal. Títulos usam Newsreader; dados, controles e nomes de campanha usam Source Sans3. Títulos de página foram reduzidos de88px para até56px e o afastamento superior de48px para24px. No celular, os indicadores são três linhas de rótulo/valor. Claro e escuro compartilham estrutura e tokens.

Oportunidades agora reúne fonte, publicação e data do acontecimento, duas avaliações independentes, leitura social/financeira, incerteza, conflito, revisão humana e próximo passo. Critérios, pesos, justificativas, identificadores de evidência, lacunas e método permanecem em detalhes expansíveis. Nota zero não vira ausência de dados; conflito ausente não vira “sem conflito”. O frontend não calcula notas novas.

## Referências e transferência concreta

- [Nova Dental](https://nova-dental-dev.webflow.io/): contraste de tipografia e composição assimétrica. Adaptação aos títulos e às proporções, sem fotografia comercial no dashboard.
- [Signal-A](https://signal-a.studio/about): navegação horizontal, listas e ritmo entre áreas abertas.
- [Linear](https://linear.app/) e [documentação](https://linear.app/docs/display-options): controles próximos ao conteúdo, hierarquia compacta e organização operacional.
- [Attio](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views): tabelas alinhadas, contexto associado ao registro e formatação legível.
- [Legency](https://legencymedia.com/), [FORMAT](https://format.obys.agency/) e [Arc](https://www.arcmarumo.com/): pesquisa de identidade e atenção. Não se alega reprodução da arte granular, animação, experiência CRT ou impacto visual desses sites.
- Stripe: [documentação pública](https://docs.stripe.com/dashboard/basics) sobre organização e contexto de relatórios. A revisão automática bloqueou o dashboard privado por possível acesso financeiro; nenhuma sessão financeira foi inspecionada nem o bloqueio contornado.

As capturas de terceiros são próprias, feitas no navegador para comparação, e não são assets distribuídos na aplicação. Não se atribui premiação não verificada a Arc/Nova. Pesquisa detalhada: [PRODUCT-REFERENCE-RESEARCH.md](PRODUCT-REFERENCE-RESEARCH.md). Pesquisas anteriores de Awwwards e empresas permanecem como histórico, sem substituir a inspeção dos sites reais.

## Arquivos e decisões técnicas

- `app/templates/dashboard.html`: navegação, abertura e região de indicadores.
- `app/static/style.css`: sistema visual, composições, temas e adaptações móveis.
- `app/static/app.js`: apresentação de dados, oportunidades, estados e ações existentes.
- `app/static/theme.js`: escolha de tema, preferência do sistema e cor do navegador.
- `DESIGN.md`: autoridade atual dos tokens; `.impeccable/design.json`: metadados complementares.

Mantivemos JavaScript/CSS nativos: reescrever em React não resolveria o problema visual e ampliaria dependências, migração e regressões. O custo é manter funções de renderização em HTML textual; conteúdo externo continua passando por escape e links de fonte são limitados a HTTP(S). Fontes locais evitam chamadas tipográficas a terceiros, mas somam1,10MB brutos; o `no-store` atual permite repetição desse custo. Subconjunto/WOFF2 é otimização futura, não medição concluída.

Carregamento agora limpa os dados da seleção anterior, captura os filtros de uma consulta e só publica o resultado se ele ainda pertence à versão corrente. Falhas oferecem botão de nova tentativa. Isso evita exibir dados demonstrativos com rótulo de dados reais. Uma resposta lenta antiga é ignorada. Não há cancelamento de requisição em trânsito; o custo de leitura já iniciado permanece.

## Testes executados

| Verificação | Resultado |
|---|---|
| `.venv/Scripts/python.exe -m pytest -q` |113 aprovados;2 avisos de depreciação de bibliotecas. A sandbox impediu o TestClient inicialmente; execução com permissão ampliada concluiu. |
| `browser-redesign.cjs after` |88 capturas:11 páginas ×1920/1366/768/390 ×claro/escuro. Sem overflow global, erros JS ou mutações. |
| `browser-design-interactions.cjs` |Teclado, menu/Escape, disclosure, tabela, formulário com erro/repetição, gráfico e reflow320px aprovados.24 pares de contraste com razão mínima4,5. Duas mutações simuladas; nenhuma real. |
| `browser-design-states.cjs` |Vazio sintético, ciclo de vida dos indicadores, rótulos móveis do gráfico, nome longo e galeria aprovados. |
| `browser-insights.cjs` |24 capturas375/768/1440 nos dois temas, persistência, menu, papéis analista/revisor e falha de revisão aprovados; provedores simulados. |
| `browser-product-review.cjs` |18 capturas de estratégia/notícias em1440/768/390 nos dois temas. Zero versus null, escape de títulos, conflito, cobertura incompleta, falha de escopo, botão de recuperação e resposta fora de ordem aprovados. Viewer verificado na interface; não é teste de autorização da API. |
| `browser-reference-comparison.cjs` |7 referências ×3 telas ×2 versões=42 combinações. Todas imagens carregaram; nenhuma requisição externa. |

Inspeção visual feita nas capturas de Resumo desktop/móvel, oportunidades, notícias e comparativos. Testes automatizados não equivalem a aprovação estética ou certificação WCAG. Dados são demonstrativos/sintéticos; nenhuma chamada paga de IA foi realizada.

Revisão independente final: subagente conferiu `render()`, os resultados do teste de produto, este documento e a captura móvel escura de oportunidades. Não encontrou bloqueador concreto nem corte/colisão naquela captura. Confirmou execução do teste de produto com saída0, sem alterar a aplicação na revisão final.

## Comparação e limites

- [Comparador com referências e versão anterior](../output/design-review/reference-comparison.html).
- [Galeria de telas](../output/design-review/index.html).
- [Resumo atual](../output/design-review/after/overview-light-1366.png).
- [Comparação com Nova](../output/design-review/reference-side-by-side-nova.png).
- [Resultados de cenários completos](../output/design-review/strategy-fixtures/results.json).

O resultado é deliberadamente mais sóbrio que os sites promocionais. Não replica fotografia, WebGL ou rolagem dirigida. Campanhas ficam após o gráfico em notebooks; no celular, análises extensas exigem rolagem. Período/área ainda reiniciam ao mudar de página. Desconectar uma chave continua sendo uma ação imediata existente. Não houve teste de custo/latência de provedores reais, teste com clientes reais ou validação de usabilidade com participantes.

## Entendendo o código

Função real em `app/static/app.js`:

```js
function updateOverviewSummary(summary){
  const target=$('overview-summary');
  const visible=page==='overview'&&summary.rows>0;
  target.hidden=!visible;
  target.innerHTML=visible?metrics(summary):'';
  target.closest('.page-header').classList.toggle('has-results',visible);
}
```

1. A declaração recebe `summary`, o objeto agregado retornado pela API; a função não retorna valor (`undefined`).
2. `$` é o atalho local para `document.getElementById`: encontra a região dos indicadores.
3. `&&` exige duas condições: estar no Resumo e haver registros. Zero contratações é um resultado válido; ausência de linhas é outra situação.
4. `hidden` remove visualmente e da navegação acessível a região que não se aplica.
5. O operador ternário monta os indicadores com `metrics` ou limpa o HTML anterior. Apenas esconder preservaria valores antigos no DOM.
6. `closest` encontra o cabeçalho e `toggle` aplica sua composição em duas colunas somente quando há resultados.
7. A chave encerra a função. Não há exceção deliberada; se o template remover o elemento ou seu cabeçalho, o acesso produzirá `TypeError`. O contrato entre template e script precisa ser preservado.

`render()` chama essa função com `{rows:0}` ao carregar e com o resumo confirmado ao concluir. Remover a limpeza pode manter números antigos durante a troca de contexto. Retirar a condição de página coloca indicadores em telas onde não pertencem. Separar montagem e publicação do resultado torna o fluxo previsível sem framework novo.

Conceitos para estudar: DOM, operadores booleanos/ternários, CSS Grid, estado assíncrono, respostas fora de ordem, escape de HTML e divulgação progressiva de detalhes.

**Desafio:** acrescente ao teste de estados um resumo com `rows:1` e `hires:0`. Verifique que “Contratações” mostra0 e que a região continua visível. Explique por que usar `summary.hires>0` na condição seria incorreto. Não altere os dados reais para fazer o exercício.
