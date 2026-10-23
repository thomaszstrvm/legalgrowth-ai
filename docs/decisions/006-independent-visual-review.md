# ADR 006 — Revisão visual independente

Data: 2026-10-22

## Contexto

As iterações visuais do LegalGrowth foram consideradas genéricas pelo usuário.
Revisão pelo próprio implementador não fornece uma perspectiva independente.
O usuário solicitou um agente permanente, THE CRITIC.

## Decisão

Definir `visual_critic` em `.codex/agents/visual_critic.toml`, usando o esquema
oficial de agentes personalizados, com GPT-6.1 Sol e raciocínio `high`.
Manter a persona e seus critérios nesse único arquivo. O `AGENTS.md` do projeto
define quando convocá-lo, sem duplicar as instruções da persona.

O crítico recebe capturas reais de dados sintéticos e referências públicas;
não implementa mudanças. Uma rodada inicial e uma reavaliação são o ciclo
ordinário. Problemas restantes são reportados, sem manipular a nota.

## Justificativa

A especialização permite crítica consistente sem alterar o modelo principal.
O raciocínio alto favorece análise cuidadosa, com consumo limitado por escopo e
rodadas. A configuração é persistente e versionável; não representa um processo
sempre executando nem um monitor agendado.

## Alternativas consideradas

- Persona apenas no prompt: simples, mas não persistente nem fácil de reutilizar.
- Configuração global: afetaria outros projetos sem necessidade.
- Crítico que também implementa: reduz independência e confunde responsabilidades.
- Loop até nota 9: induz aprovação artificial e custo imprevisível.

## Consequências positivas

Critérios explícitos, evidências reproduzíveis, separação entre implementação e
revisão, e nenhuma dependência adicional no produto em execução.

## Consequências negativas e limites

Há consumo adicional de tokens ao convocar o revisor. Julgamentos estéticos
continuam contextuais; a nota não é benchmark. A regra de não editar é uma
instrução, não um sandbox independente: agentes herdam as permissões da sessão.
Clientes que já estavam abertos podem exigir nova sessão para descobrir o tipo.

## Fonte

[Documentação oficial de subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents)
