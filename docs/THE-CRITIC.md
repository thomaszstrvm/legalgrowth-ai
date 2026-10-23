# THE CRITIC — agente permanente do projeto

Configuração: `.codex/agents/visual_critic.toml`.
Nome de convocação: `visual_critic`. Modelo: `gpt-6.1-sol`, raciocínio `high`.

O arquivo contém as seções 1 a 8 do briefing do usuário e um protocolo de
evidências, segurança e revisão finita. O modelo principal não foi alterado;
nenhum `config.toml` existente foi sobrescrito.

## Como convocar

No Codex, dentro deste projeto:

> Convoque visual_critic para revisar a interface atual. Use as capturas em
> output/design-review/after e as referências em output/design-review/references.
> Não edite arquivos. Informe problemas com evidências e limitações.

O `AGENTS.md` local integra essa convocação às mudanças visuais relevantes.
Permanente significa que a definição fica salva no projeto; não é um agente
sempre executando, uma automação semanal ou um serviço incluído no aplicativo.

## Teste de descoberta e invocação — 22/10/2026

- TOML interpretado com `tomllib`, com os campos obrigatórios.
- Cliente local: `codex-cli 0.163.0-alpha.11.2`, modo `--strict-config`.
- A primeira tentativa usou `--ephemeral`; o cliente encontrou o tipo, mas o
  spawn falhou por ausência de rollout no thread store. Nenhuma revisão ocorreu.
- A repetição sem `--ephemeral`, com sandbox `read-only`, convocou efetivamente
  `agent_type: visual_critic`, task `teste_visual_critic`. O registro da chamada
  `spawn_agent` foi conferido no rollout da sessão.
- O crítico abriu as capturas `round4-before/overview-light-1366.png` e
  `references/arc-live.png` com ferramenta visual e retornou revisão.
- Veredito da **versão anterior**: **7,5/10 — REVISÃO NECESSÁRIA**. Cabeçalho
  dominante, textos auxiliares pequenos e competição entre ações foram os
  principais pontos. A nota não avalia a implementação posterior.

Evidências locais do teste: `output/critic-setup/invocation-result.md` e
`invocation-events.jsonl`. Não contém credenciais de clientes. A sessão de teste
foi somente leitura e não executou benchmark pago.

Depois do teste, o agente foi convocado para duas revisões reais da implementação
Arc: [primeira rodada](THE-CRITIC-ARC-ROUND1.md) e
[segunda rodada](THE-CRITIC-ARC-FINAL.md). A primeira apontou problemas de
hierarquia; o implementador corrigiu e o agente reavaliou. As notas foram 7 e 8,
respectivamente, com ressalvas explicitadas. A avaliação não foi manipulada para
alcançar a antiga meta de nota 9.

## Entendendo a configuração

```toml
name = "visual_critic"
description = "THE CRITIC: diretor de arte adversarial..."
model = "gpt-6.1-sol"
model_reasoning_effort = "high"
developer_instructions = '''...'''
```

1. `name` identifica o tipo que o coordenador deve convocar. Mudar apenas o nome
   da tarefa de um agente genérico não seleciona esse tipo.
2. `description` informa ao coordenador em que situações usá-lo.
3. `model` escolhe o modelo deste revisor, sem trocar o modelo principal.
4. `model_reasoning_effort` ajusta o esforço de raciocínio. Maior esforço pode
   aumentar custo e latência; não garante qualidade estética.
5. `developer_instructions` contém o briefing permanente em uma string literal
   TOML multilinha. Não é uma função Python: não tem parâmetros nem retorno.
   Sintaxe inválida ou modelo indisponível impedem a inicialização.

Remover as instruções elimina os critérios específicos. Remover as opções de
modelo faz o cliente resolver esses valores a partir da configuração herdada.
O agente herda permissões da sessão: a instrução "não editar" não cria um
sandbox próprio.

## Conceitos e exercício

Estude TOML, escopo de configuração, separação de responsabilidades e revisão
baseada em evidências. Exercício: escolha uma crítica do relatório, localize o
componente correspondente e proponha um critério observável para comprovar que
a correção resolveu o problema, sem usar uma nota como único critério.

Fonte: [formato oficial de agentes personalizados](https://learn.chatgpt.com/docs/agent-configuration/subagents).
