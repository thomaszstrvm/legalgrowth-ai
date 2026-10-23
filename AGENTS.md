# LegalGrowth — revisão visual

Estas regras complementam as instruções globais de engenharia e mentoria do usuário.

## Relatório de entregas substanciais

Por pedido do proprietário, toda tarefa deste porte deve incluir um PDF em
`output/pdf/` explicando o que foi analisado, o que mudou, decisões e alternativas,
testes efetivamente executados, parecer de revisão quando aplicável e limitações
ou itens pendentes. Use linguagem acessível e evidências sintéticas, sem credenciais
ou dados reais de clientes. Renderize e inspecione todas as páginas antes de entregar.
Mantenha também o registro técnico em `docs/`; o PDF não substitui README, ADRs ou
testes. Alterações triviais não exigem um relatório extenso.

## THE CRITIC

O agente permanente de revisão é `visual_critic`, definido em
`.codex/agents/visual_critic.toml`. As instruções da persona ficam nesse arquivo.
Não substitua esse agente por uma persona resumida nem altere o modelo principal
para convocá-lo.

Ao implementar mudanças visuais relevantes:

1. Preserve fluxos, APIs e regras de negócio. Leia `DESIGN.md` e o código atual.
2. Execute a aplicação e capture a versão modificada com dados sintéticos:
   desktop e celular, temas claro e escuro. Registre limites da inspeção.
3. Convoque explicitamente `visual_critic` para inspecionar essas capturas e as
   referências públicas. Passe os caminhos, a versão e o escopo alterado.
4. O crítico apenas revisa; o implementador decide e executa as correções.
   Priorize regressões, clareza, acessibilidade e identidade visual.
5. Após corrigir, gere novas evidências e peça uma reavaliação. Limite o ciclo
   ordinário a duas rodadas; registre pendências em vez de forçar uma nota.
6. Entregue resultados dos testes e o parecer independente com suas ressalvas.
   Uma nota não substitui evidências nem garante qualidade de portfólio.

Se a sessão não reconhecer agentes personalizados recém-instalados, informe
essa limitação. É permitido convocar um subagente temporário que leia o arquivo
integral, mas identifique-o como teste comportamental, não como prova de
descoberta automática do agente permanente.

O crítico nunca deve receber credenciais ou dados reais de clientes. Não use
benchmarks pagos. Não navegue em painéis privados de serviços de referência.

## Convocação manual

"Convoque visual_critic (THE CRITIC) para revisar as capturas atuais em
output/design-review/after, comparando-as com as referências em
output/design-review/references. Não edite arquivos. Apresente evidências,
gravidade, correções específicas e limitações."
