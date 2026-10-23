# THE CRITIC — seleção de localização

23/10/2026. Revisão independente pelo agente permanente `visual_critic`.
Escopo: Configurações e orientação inicial de Notícias, desktop e celular,
claro/escuro. Esta avaliação não altera a nota 8,9 das capas v49.

## Primeira rodada — 8,4/10, aprovado com ressalvas

Dois achados médios: a limitação das fontes aparecia depois de Salvar região;
Notícias sem cidades priorizava o agendamento, com a ação de escolher cidades
pouco evidente. Não identificou colisões ou overflow nas doze capturas.

Correções: aviso antes dos campos; título e botão Escolher cidades no estado
vazio, antes do agendamento. Não foram adicionadas novas regras de negócio.

## Segunda rodada — 8,7/10, aprovado com ressalvas

Ambos os achados foram encerrados. O crítico confirmou confirmação de salvamento,
foco por teclado, limite com contexto e mensagem de erro legível em 1366, 390 e
320 px nos dois temas. Conferiu cinco hashes do manifesto de evidências.

Na preparação das evidências, o mock de erro inicialmente usava um texto interno
do esquema que a API não devolve ao navegador; foi corrigido para a resposta
real de validação. A captura de foco programático foi substituída por foco via
Tab. Um artefato do link de salto em captura de página rolada foi eliminado com
recorte visual fora do foco, mantendo acesso por teclado.

**Pendência baixa:** o erro genérico não identifica qual linha/campo precisa de
correção. Futuramente, associar erros estruturados às linhas pode melhorar a
recuperação. Não há bloqueio visual confirmado nas evidências finais.

O crítico considera os rótulos, prioridade de salvar, integridade em 320 px e
distinção entre real/demo consistentes. A largura do campo desktop é uma escolha
de acabamento, sem defeito funcional comprovado.

**Meta 9,9 não atingida.** As duas rodadas previstas em AGENTS.md foram concluídas;
não se atribuiu uma nota artificial. O crítico não executou testes nem usou
leitor de tela. Persistência e isolamento foram verificados pelo implementador.
Evidências locais: `output/design-review/locations-v1/final/`.
