# Fluxo mínimo de engenharia

Alternativa B: paralelismo seletivo. O Codex nativo executa; um registro Markdown
explicita dependências. Não há framework, fila, banco de grafos ou agente permanente
novo. O `visual_critic` existente permanece intacto.

## Próxima tarefa

1. Ler estado atual, HEAD/status/diff e documentos do escopo. Registrar objetivo e sucesso.
2. Criar somente tarefas úteis no formato abaixo. Independentes podem ser paralelas;
   arquivos compartilhados têm um único autor por vez. Worktree só quando houver necessidade real.
3. Implementar por contrato; para bug, guardar reprodução antes/depois. Não executar
   um dependente sem a entrada necessária. Falha bloqueia apenas seus dependentes.
4. Integrar e executar checks de CONTRIBUTING. Revisão técnica de alto risco usa
   subagente somente leitura diferente do autor. Mudança visual relevante usa THE CRITIC
   com capturas atuais; não convocá-lo para mudanças puramente documentais/backend.
5. Corrigir achados comprovados, revalidar e entregar pacote ao Validador. No máximo
   duas rodadas ordinárias; pendências de baixo impacto ficam registradas.

Estados: PENDING → READY → RUNNING → VALIDATING → DONE; alternativas BLOCKED,
FAILED ou NEEDS_REVIEW. DONE exige critério verificado, não apenas mensagem do agente.
Limitações de ambiente devem permanecer visíveis. Máximo três subagentes simultâneos;
reusar o contexto quando adequado, sem invocar todos para tarefas pequenas.

## Registro por tarefa

| Campo | Conteúdo mínimo |
|---|---|
| ID, descrição, responsável | Objetivo concreto e dono dos arquivos |
| Entradas / dependências | Contratos e IDs predecessores necessários |
| Arquivos | Escopo exclusivo ou integração coordenada |
| Saída / aceitação | Resultado verificável e comportamento preservado |
| Evidências | Comandos, resultados e caminhos; dados sintéticos |
| Estado | Situação atual, falha ou limitação sem inferência |

A demonstração desta metodologia é a [rodada de consolidação](CONSOLIDATION-2026-10-25.md):
correções de dados e telemetria em paralelo; insights aguardam contrato de observação;
integração seguida de revisor independente. O revisor reproduziu um erro de cache,
e a regressão adicionada verificou a correção. Isso demonstra benefício concreto,
sem afirmar redução de tokens, custo ou prazo que não foi medida.

## Transferência ao Validador externo

Copiar o [relatório desta rodada](VALIDATOR-HANDOFF-2026-10-25.md), patch, arquivos
novos e manifesto de hashes. Não enviar `.env`, bancos, chaves, dados reais ou
dependências. Conversas não compartilham automaticamente arquivos. A entrega não
envia mensagem ao outro projeto e não representa aprovação externa.

Modelo reutilizável:

```text
Base/HEAD e versão local:
Working tree e arquivos preservados fora do escopo:
Objetivo e contratos alterados/preservados:
Tarefas, dependências e estado:
Comandos executados, resultados, evidências e hashes:
Revisão interna, achados e correções:
Falhas preexistentes, limites e riscos:
Pendências priorizadas:
Ciclo externo: rodada 1/2, aguardando / recebido / encerrado:
Classificação solicitada por item: resolvido, parcial, não resolvido,
regressão ou não verificável. Exigir evidência independente.
```

Referência conceitual indicada pelo usuário: postagem de 0xCodila em
https://x.com/0xCodila/status/2079597821511020996. A consulta retornou 403 nesta
rodada; não alegamos leitura do artigo. O procedimento deriva do briefing fornecido
e dos contratos/testes locais, não de conteúdo remoto presumido.
