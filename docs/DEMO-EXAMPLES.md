# Exemplos estáticos dos módulos editoriais

Implementação do contrato de dados de P2-05, em `app/static/demo-examples.js`.

## Interface e isolamento

Carregar o script antes de `app.js`. Ele expõe somente `window.LegalGrowthDemo`:

```js
const insight = window.LegalGrowthDemo.insight({scope: 'demo'});
const news = window.LegalGrowthDemo.news({scope: 'demo'});
const strategy = window.LegalGrowthDemo.strategy({scope: 'demo'});
```

Cada chamada retorna um objeto JSON independente. Alterar um retorno não modifica os demais. As bases internas e o objeto público são congelados. Omissão do argumento, `scope: 'real'` e qualquer outro escopo geram `TypeError`; não há fallback para demonstração em caso de falha real.

O módulo não consulta DOM, API, armazenamento, banco, relógio, credenciais ou provedores. Não cria execução de IA, cobrança, reserva, coleta ou agendamento. Ele apenas publica funções que copiam dados estáticos. Essa separação permite inspecionar o resultado esperado sem configurar serviços. A validação de escopo é uma proteção contra erro de integração, não uma fronteira de autorização do servidor.

## Formatos

| Factory | Retorno | Uso na apresentação |
|---|---|---|
| `insight({scope:'demo'})` | Objeto direto com `findings`, `coverage`, `analyst`, `reviewer` e evidências | Argumento `result` de `insightPanel`; não é o envelope `{latest}` da API. |
| `news({scope:'demo'})` | Envelope com `latest`, `localities`, `coverage_note` | Argumento `data` de `newsPanel`. |
| `strategy({scope:'demo'})` | Objeto com `opportunities` e `notice` | Argumento de `strategyPanel`. |

Os objetos principais usam `scope:'demo'`, `status:'demonstration'` e `demonstration:true`. `news.latest` também contém esses marcadores. O estado `demonstration` é próprio da apresentação: não equivale a sucesso, falha, resultado vazio, análise não verificada ou execução pendente.

Nenhuma fixture tem timestamp de execução: `created_at:null`. Os IDs são strings com prefixo `demo-`, sem correspondência com registros persistidos. `models` é vazio; `analyst` é “Exemplo estático” e `reviewer` é “Não executada”. Nenhum fornecedor aparece como autor ou revisor do exemplo.

## Conteúdo das fixtures

- **Insights:** uma campanha inventada, gasto de R$ 240, 12 contatos qualificados e duas contratações. Os custos correspondentes são R$ 20 e R$ 120. Duas conclusões ilustram evidências e baixo volume, sem afirmar causalidade, tendência ou retorno financeiro. Os números não vêm do dashboard nem descrevem seus resultados de demonstração.
- **Notícias:** duas publicações inexistentes, fontes identificadas como ilustrativas e uma cidade fictícia. As URLs são `null`; não há jornal real, URL externa ou link de download. Um cenário condicional aponta para revisão humana, sem prever demanda jurídica.
- **Oportunidades:** uma pauta derivada da primeira notícia fictícia. As duas dimensões mantêm `score:null`, critérios vazios e listas de critérios ausentes. Os pesos seguem a estrutura atual de `app/services/strategy.py`; não se simula confirmação humana para preencher uma nota. A apresentação explica as leituras social e financeira independentemente.

O período ilustrativo é fixo: **7 a 13 de setembro de 2026**. `period_note` informa que os filtros e dados do escritório não são utilizados. Datas das publicações são parte da ficção, não prova de coleta. Não ajustar as datas silenciosamente ao filtro: isso sugeriria uma análise real do intervalo selecionado.

## Integração exigida no renderizador

Este módulo fornece dados. A integração em `app.js` reconhece o estado demonstrativo antes de mostrar o resultado:

1. Selecionar as factories exclusivamente quando o escopo atual for `demo`. Dados reais continuam seguindo seus endpoints; falha real nunca deve revelar uma fixture como se fosse um resultado.
2. Exibir `notice` e `period_note` perto do conteúdo. Distinguir o período ilustrativo do filtro geral, inclusive nos rótulos das evidências que atualmente dizem “Selecionado”.
3. Dentro do exemplo de Insights, omitir controles de execução e frases de revisão efetivamente realizada. Fora dele, preservar os controles existentes de conexão e análise paga, com aviso explícito de cobrança inclusive no escopo demo. Não inventar `insights_ready:true` para fazer o exemplo aparecer. Omitir timestamp de execução e usar o rótulo “Exemplo demonstrativo”.
4. Em Notícias, não exigir mudar para “Meus dados”; apresentar fontes fictícias como texto, sem `<a href="null">`. Mapear o estado da fonte `demonstration` para “Exemplo — não consultada”, nunca “Lida” ou “Indisponível”. Omitir buscar/atualizar, exportação por ID e promessa de agendamento.
5. Em Oportunidades, usar “Fonte fictícia — exemplo” em vez de “Fonte indisponível” e mapear `method:'demonstration'` para “Exemplo estático, sem avaliação executada”. Preservar a diferença entre nota ausente e zero.
6. Nunca enviar as fixtures a endpoints de gravação, histórico de execução ou relatórios persistidos. Exportação local de demonstração, se futuramente desejada, requer um caminho separado e identificação explícita.

Um guard no módulo não impede que um renderizador crie um botão ou faça outra chamada. Por isso o teste isolado é complementado por teste de navegador da integração, com rede interceptada, incluindo mudança de demo para real. Uma screenshot não comprova isolamento de chamadas.

## Verificação

Executar `node scripts/test-demo-examples.cjs`. O teste usa somente os módulos nativos do Node, em contexto sem DOM, rede, armazenamento ou banco. Confere guard de escopo, clones independentes, marcadores, ausência de timestamp/modelos/URLs externas, referências entre notícias e cenários, coerência aritmética e ausência de notas/confirmadores inventados.

Esse teste não valida renderização, acessibilidade, alternância visual de escopo ou event handlers de `app.js`; essas verificações pertencem à integração.
