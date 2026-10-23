# ADR006 — Publicação coerente do contexto visual

Data: 22/10/2026. Status: adotado.

## Contexto

Uma troca de escopo ou período pode falhar ou terminar depois de outra consulta. Manter conteúdo antigo enquanto o controle já mostra a nova seleção permite interpretar valores demonstrativos como dados reais. O problema é de integridade da apresentação, sem alteração no banco.

## Decisão

Cada `render()` captura seus filtros e recebe uma versão crescente. Ao iniciar, limpa conteúdo e indicadores, mostra carregamento e define `aria-busy`. Publica o resultado apenas se a versão continua atual. Falhas da versão corrente deixam estado explícito com nova tentativa; respostas antigas não atualizam a tela. O último conjunto confirmado alimenta as ações existentes.

## Justificativa e alternativas

Um contador local funciona com a arquitetura de JavaScript atual e cobre respostas fora de ordem. Manter dados antigos com um indicador de atualização exige mostrar também o contexto antigo e aumenta o risco de ambiguidade. `AbortController` reduziria parte do trabalho em trânsito, mas cancelamento sozinho não substitui a verificação de versão e exigiria propagação pelas consultas auxiliares. Um gerenciador de estado externo seria uma dependência desproporcional.

## Consequências positivas

- Contexto, números e conteúdo são publicados juntos.
- Erros deixam de sugerir sucesso na troca de escopo.
- O usuário pode repetir a consulta sem recarregar a página.
- Testes sintéticos reproduzem falha e inversão da ordem das respostas.

## Consequências negativas

- A tela não preserva números anteriores durante a espera; há uma breve região de carregamento.
- Consultas antigas continuam consumindo recursos até terminar, embora suas respostas sejam descartadas.
- Cada nova consulta auxiliar precisa respeitar a mesma versão antes de publicar efeitos visuais.

## Segurança e manutenção

Nenhuma permissão ou autenticação mudou. O controle evita apresentação enganosa, não substitui a separação de escopos no servidor. Não há novas chamadas de IA nem mudança de custo por provedor. Verificação: `scripts/browser-product-review.cjs`, cenários `scopeFailureClearsOldData`, `retryButtonRecovery` e `outOfOrderIgnored`.
