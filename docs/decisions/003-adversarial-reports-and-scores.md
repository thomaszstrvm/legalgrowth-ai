# ADR 003 — Teste adversarial separado do relatório e notas independentes

Data: 2026-10-22. Estado: base determinística implementada.

## Contexto
O usuário pediu inserir informações confusas e removê-las para testar a revisão. Também pediu avaliar benefício social e potencial financeiro sem confundi-los.

## Decisão e justificativa
O teste adversarial modifica cópias de uma referência fictícia em memória. Seis mutações conhecidas alteram valores, fontes, métricas ou introduzem promessas/referência jurídica sem verificação. Um validador compara números e referências estruturadas com o original confiável. A recuperação restaura a cópia original; não tenta adivinhar valores. Um controle sem mutação também precisa passar, para evitar um teste que simplesmente rejeite tudo.

Não há chamadas pagas nem alteração dos relatórios reais. O painel mostra explicitamente o alcance do teste. Testar modelos reais exige avaliação separada e autorização para benchmark pago; concordância de duas IAs não prova verdade.

As notas estratégicas usam pesos diferentes por dimensão, exigem todos os critérios e referências existentes confirmadas por humano. Critério ausente produz `score=null`, nunca zero nem média recalculada com dados parciais. Não há nota global combinando dimensões.

## Alternativas
Injetar erros em relatórios reais arriscaria entrega acidental e contaminação do histórico. A mesma IA gerar e corrigir erros pode compartilhar o mesmo viés. Preencher notas com base na contagem de notícias criaria falsa precisão.

## Consequências positivas
Teste repetível, gratuito e com resultado conhecido. As avaliações não fingem certeza quando faltam receita, capacidade, custos e evidência social.

## Consequências negativas
O teste não compreende prosa arbitrária e não mede a taxa de alucinação dos provedores. As notas não são probabilidades. A interface estratégica inicial mostra dados insuficientes; edição/aprovação de critérios e integração econômica aprofundada ainda não foram implementadas.
