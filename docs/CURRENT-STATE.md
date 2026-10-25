# Estado atual e mapa de leitura

Atualizado em 25/10/2026. Base `main` / `036ba1f26d08011729e15727eda2641d2c9ce4d4`.
Consolidação local ainda sem commit/push; resultados no [registro da rodada](CONSOLIDATION-2026-10-25.md).

Projeto de **portfólio**, com dados fictícios e engenharia cuidadosa; não é uma
declaração de prontidão para produção. Revisão externa recebida em 25/10: limite
local ausente da assinatura do cache reproduzido e corrigido no incremento local;
resultados e limites no registro da rodada. O pacote/manifesto anterior é histórico
e não representa os arquivos posteriores à correção.

## Vigente

- Produto e limites: [PRODUCT.md](../PRODUCT.md), [AI.md](AI.md), [SECURITY.md](../SECURITY.md).
- Identidade visual: [DESIGN.md da raiz](../DESIGN.md); v59/v60 encerram o ciclo de design.
  Estudos EDITORIAL/OPENING e notas do crítico são históricos, não novos pedidos de redesenho.
- Trabalho: [AGENTS](../AGENTS.md), [CONTRIBUTING](../CONTRIBUTING.md), [fluxo mínimo](ENGINEERING-WORKFLOW.md).
- Backend: IDs estáveis no agrupamento; Decimal validado antes da importação;
  cache de insights estendido com exclusão concorrente; metadados de chamadas sem conteúdo.
- Vídeo independente: [Remotion](../media/legalgrowth-presentation/README.md).
  Filme 1.1.0 publicado na base; alterações locais 1.1.1 e FILM-CORRECTION-V7
  precedem esta rodada e foram preservadas. Não declarar a validação audiovisual
  pendente como concluída pela consolidação do backend.
- Ferramentas: [inventário verificado](skill-inventory-2026-10-25.json) e
  [triagem do PDF](PLUGIN-SELECTION-2026-10-25.md). Nenhum novo pacote necessário.

## Mapa de fluxos e contratos

| Fluxo | Arquivos centrais | Contrato / verificação |
|---|---|---|
| API autenticada | `app/api.py`, `app/security.py` | Perfil e escopo; `tests/test_api.py` |
| CSV → indicadores/campanhas | `schemas.py`, `services/imports.py` | Validação integral antes de gravar; `test_data_integrity.py`, `test_core.py` |
| Resumo → UI | `services/metrics.py`, `static/app.js` | campaigns indexado por ID, label separado e escapado; `test-campaign-labels.cjs` |
| Recomendações | `agents/analysis.py`, `services/reports.py` | Comparações por identidade, revisão humana; `test_core.py`, `test_insights.py` |
| Insights | `services/insights.py`, `services/ai.py` | Cache/claim → reserva → análise → revisão; `test_insight_concurrency.py` |
| Gateway → provedores | `services/gateway.py`, `integrations/openai.py`, `integrations/claude.py` | Campos aprovados e endpoints fixos; `test_security_evolution.py`, `test_ai.py` |
| Observações operacionais | `services/ai_observability.py`, `models.py` | Sem conteúdo, NULL não significa zero; `test_ai_observability.py` |
| Notícias | `services/news.py`, `integrations/news.py` | Coleta e unicidade próprias; `test_news.py`, `test_localities.py` |
| Migrações | `migrations/versions`, `scripts/verify-migrations.py` | SQLite descartável; PostgreSQL com limitação documentada |
| OCR / contratos | `app/vault`, `docs/UNLIMITED-OCR.md` | Contrato técnico parcial; engine e produção não validados, dados reais bloqueados |

## Pendências delimitadas

1. Validar PostgreSQL real; compilação offline histórica não suporta migração de dados 9b27d3e1a102.
2. Executar CI remota somente após autorização de publicação; nenhum resultado remoto presumido.
3. Revisão final estática recebida em 25/10 às 07:15 UTC: recorte cache/docs liberado
   para preparação de commit, sem novo teste independente; ressalvas no registro.
4. Retomar vídeo 1.1.1 no seu escopo: movimento, áudio e entrega audiovisual não são cobertos por pytest.
5. OCR, novos modelos, proxies, marketing ampliado e novas funcionalidades seguem no backlog.
