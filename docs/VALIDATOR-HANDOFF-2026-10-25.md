# Transferência ao Validador - consolidação local de 25/10/2026

**Estado:** revisão final estática recebida em 25/10 às 07:15 UTC; incremento de
assinatura liberado para preparação de commit, sem nova execução independente.
Ver conferências e ressalvas no registro de consolidação. A entrega anterior
não foi aprovada integralmente: houve um defeito de cache reproduzido. Projeto de portfólio.

Base `main` / `036ba1f26d08011729e15727eda2641d2c9ce4d4`. Mudanças locais sem commit
ou push. O pacote está em `output/consolidation-2026-10-25/validator-package.zip`;
contém fontes alteradas, patch dos arquivos rastreados, manifesto SHA-256, JUnit e
documentos. Aplicar somente em cópia descartável da base, não sobre trabalho em curso.
O filme 1.1.1 pré-existente fica fora do patch/pacote desta consolidação.

O ZIP/manifesto acima identifica a entrega anterior à correção do contrato local;
não deve ser usado como se contivesse o incremento atual. Este está no diff local
de `insights.py`, `test_insights.py` e nos documentos atualizados, sem commit/push.

## Itens para inspeção independente

| ID | Verificar | Evidência esperada |
|---|---|---|
| D1 | IDs diferentes com mesmo nome não se fundem; rótulos continuam legíveis e escapados | tests/test_data_integrity.py, scripts/test-campaign-labels.cjs; contrato campaigns por ID + label |
| D2 | Numeric(16,4), finitos, reimportação idêntica, nenhuma gravação parcial | Casos de limite, escala, SQLite e conflito no fim do CSV |
| A1 | Metadados sem prompts/chaves/respostas, desconhecidos como NULL | test_ai_observability.py, adapters, migração AICall |
| A2 | Iguais simultâneas: uma execução e uma reserva; diferentes independentes | test_insight_concurrency.py; banco em arquivo e sessões independentes |
| A3 | Cache invalida em identidade/prompt/modelo/schema/dados; falha permite retry explícito | test_insights.py e regressão troca de campanha |
| S1 | Gateway/demo-real/revisão humana/cotas/notícias/OCR preservados | Suíte existente e diff; nenhum contrato real desbloqueado |
| P1 | Processo leve, nenhum plugin global/hook/proxy instalado | AGENTS, workflow, inventário e triagem por página |

Execução final: **236 pytest aprovados**, 6 avisos; três checks JS e sintaxe aprovados;
SQLite upgrade/check/downgrade/upgrade/check aprovado. Ver comandos e evidências em
[CONSOLIDATION-2026-10-25.md](CONSOLIDATION-2026-10-25.md).

Revisão interna somente leitura encontrou P2 de cache; corrigido e revalidado
independentemente em 54 testes. Não tomar isso como substituto da própria investigação.

## Limites obrigatórios no parecer

- PostgreSQL real não executado. Script completo ainda falha no offline de migração
  histórica 9b27d3e1a102; `--sqlite-only` seleciona explicitamente cobertura limitada.
- Migrações não aplicadas no banco do usuário; duas tabelas novas são pré-requisito
  para execução em banco existente. Usar apenas cópia/ambiente descartável na auditoria.
- Claim órfão após crash não expira automaticamente; recuperação conforme ADR 013.
- Telemetria best-effort pode faltar se o banco falhar; reserva continua valendo.
- Testes multiprocessos SQLite foram registrados pelo Validador em três cenários;
  não foram repetidos no incremento. Sem UI atual capturada, MP4 ou sincronização
  de áudio nesta rodada.
- CI remota não executada; sem push/deploy/alteração de visibilidade.

Retornar para cada item: resolvido, parcial, não resolvido, regressão ou não verificável;
incluir arquivo/linha, reprodução sintética, ambiente e impacto. Não usar nota visual
como aprovação funcional. Uma rodada excepcional exige falha crítica ou regressão grave.
