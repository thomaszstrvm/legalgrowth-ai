# ADR 009 — Separar gravação confirmada de falha de atualização

Data: 23/10/2026. Estado: adotado.

## Contexto

O frontend aguardava a operação e o recarregamento na mesma captura de erro. Um POST concluído seguido de GET indisponível era apresentado como falha da operação. O usuário poderia repetir uma despesa já salva. A troca de HTML também removia o foco e fechava o formulário.

## Decisão e justificativa

Separar a confirmação da operação da atualização visual. Após POST confirmado, falha de GET mantém a confirmação e oferece somente recarregar dados. Restaurar contexto por identificadores do formulário, reabrir seu disclosure e focar uma confirmação local. Não copiar campos, chaves ou rascunhos. Resolver fragmentos conhecidos depois que o HTML assíncrono existe. Páginas independentes deixam de carregar o dashboard sem necessidade; Relatórios faz suas duas consultas independentes em paralelo.

## Alternativas

Repetir o POST para recuperar a tela pode duplicar operações. Guardar o formulário inteiro manteria chaves/valores sensíveis desnecessariamente. Otimismo local exigiria reproduzir regras de negócio no cliente. Nova SPA não é necessária para corrigir feedback e foco.

## Consequências positivas

Mensagem corresponde ao resultado confirmado; recuperação é idempotente porque apenas lê. Navegação por links profundos e teclado preserva contexto. Menos acoplamento a um endpoint de métricas; APIs e backend mantidos.

## Consequências negativas e limites

Há duas fases explícitas de tratamento de erro. O registro pode estar salvo mesmo sem ser visível até a leitura voltar. Perda da resposta do próprio POST continua sendo resultado incerto; este ADR não implementa chave de idempotência de backend. Testes de navegador precisam simular as duas fases independentemente.
