# ADR 011 — Contexto temporal explícito e apresentação operacional

Data: 2026-10-23. Status: aceito.

## Contexto

A revisão externa encontrou perda do período ao navegar, um controle de intervalo
que consultava apenas um mês financeiro e prioridade visual da galeria sobre os
resultados. A aplicação já tem APIs, cálculos e isolamento de escopos; criar novos
endpoints ou redefinir números não resolveria esses problemas de apresentação.

## Decisão

Preservar o período aplicado em parâmetros de URL nas quatro páginas analíticas:
Resumo, Campanhas, Recomendações e Insights. `scope` viaja explicitamente; `area`
pertence apenas a Campanhas. Uma memória de sessão por escopo recupera o período
ao voltar de páginas que não usam intervalos. URL válida tem precedência.

Separar rascunho de formulário e contexto aplicado: uma resposta assíncrona não
pode transformar campos editados durante a consulta em filtros confirmados.
Validar antes de consultar, manter campos inválidos disponíveis para correção e
retirar resultados que poderiam ser associados ao contexto incorreto. A validação
do servidor permanece obrigatória e inalterada.

Finanças usa `month`; ao entrar pela análise, começa no mês da data final.
Relatórios usa sua própria segunda-feira, com intervalo completo até domingo.
Não existe um filtro temporal universal fictício. Não alterar fórmulas, reservas
de IA ou alcance da lista das 100 despesas mais recentes.

No Resumo, priorizar contexto, indicadores, atenção e análise. Preservar a galeria
e sua interação como navegação complementar. Exemplos editoriais são estáticos,
explicitamente fictícios e exclusivos de `demo`; nunca substituem falhas reais.

## Justificativa e alternativas

- URL torna navegação, recarga e histórico verificáveis e compartilháveis. Usar
  apenas armazenamento local esconderia o contexto e dificultaria reproduzir erros.
- `sessionStorage` por escopo auxilia o retorno sem misturar períodos real/demo;
  não é usado como controle de autorização. O servidor continua responsável por isso.
- Um estado global reativo ou biblioteca de roteamento adicionaria dependência e
  migração desnecessárias para páginas Jinja existentes. Um módulo pequeno de
  calendário e um snapshot aplicado bastam para este escopo.
- Remover alocação legada de infraestrutura alteraria contratos financeiros.
  Nesta etapa, explicar a diferença entre planejamento e gasto é mais seguro.
- Exemplos estáticos evitam custos e promessas de execução. Resultados realmente
  salvos e ações pagas existentes continuam separados e disponíveis.

## Consequências

Positivas: contexto previsível, links reproduzíveis, erros corrigíveis, nenhuma
dependência nova, nenhuma alteração do banco ou dos contratos HTTP. Menos consultas
inválidas e zero chamada a provedor para abrir exemplos estáticos.

Negativas: URLs incluem datas e escopo; não incluir nomes, documentos ou segredos
nelas. Há dois estados a manter (rascunho/aplicado), exigindo teste de concorrência.
Mudanças em outra aba não são sincronizadas automaticamente. Sessões com storage
bloqueado usam a URL e os padrões locais. A organização editorial não substitui
teste com pessoas, leitor de tela ou dispositivos físicos.

## Verificação e manutenção

Ver `scripts/test-period-context.cjs`, `scripts/test-demo-examples.cjs` e
`scripts/browser-validator-review.cjs`. A revisão visual e a reconciliação da
especificação estão em [VALIDATOR-REVIEW.md](../VALIDATOR-REVIEW.md).
O contrato opcional de OCR tem decisão separada: [ADR 010](010-optional-local-ocr.md).
