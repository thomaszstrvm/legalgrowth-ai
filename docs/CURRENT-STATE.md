# Current state and reading map

Updated **2026-10-28**. Reviewed public `main` at
[`7b9b90d8934bbc666e192acc24a41550af25eada`](https://github.com/thomaszstrvm/legalgrowth-ai/commit/7b9b90d8934bbc666e192acc24a41550af25eada).
This is a portfolio project with fictional examples, not a production-readiness claim.

## Verified repository state

- The repository is public. Earlier references to a private repository describe historical delivery conditions.
- [Synthetic checks 40225403720](https://github.com/thomaszstrvm/legalgrowth-ai/actions/runs/40225403720) completed successfully on **2026-10-25** for the exact commit above. The successful job includes pytest, disposable SQLite migrations, three native JavaScript contracts and JavaScript syntax checks.
- The workflow is triggered by pull requests or manual dispatch, not every push. A successful run on one SHA does not validate later commits.
- CI does **not** cover a running PostgreSQL instance, Docker startup, interactive browser flows, paid provider calls, video rendering or audiovisual playback.
- The [25 October consolidation](CONSOLIDATION-2026-10-25.md) preserves local results, excluded tests, environment restrictions and review limits. Its earlier statements about pending publication/remote CI are historical. Do not combine those counts into a new test run.
- The [published film files](../media/legalgrowth-presentation/releases/2026-10-25/README.md) contain the product film and preserved historical R7, both in development. The product film is an editorial representation, not live navigation. Backend CI does not validate it.

The 28 October documentation review inspected source/configuration and existing CI evidence; it did not rerun application tests, Docker, PostgreSQL or audiovisual checks.

## Start here

- Product and setup: [English README](../README.md), [Portuguese README](../README.pt-BR.md), [detailed operations guide in Portuguese](USAGE.pt-BR.md).
- Product boundaries: [PRODUCT](../PRODUCT.md), [AI](AI.md), [SECURITY](../SECURITY.md).
- Design: root [DESIGN.md](../DESIGN.md); v59/v60 close the documented design cycle. EDITORIAL/OPENING studies and critic notes are historical evidence, not new redesign requests.
- Engineering: [AGENTS](../AGENTS.md), [CONTRIBUTING](../CONTRIBUTING.md), [workflow](ENGINEERING-WORKFLOW.md).
- Historical milestones: [preserved README history](PROJECT-HISTORY.pt-BR.md), [CHANGELOG](../CHANGELOG.md).
- Optional media project: [Remotion instructions](../media/legalgrowth-presentation/README.md). It is independent of the application.
- Tooling research: [dated inventory](skill-inventory-2026-10-25.json) and [plugin evaluation](PLUGIN-SELECTION-2026-10-25.md), not a claim about every machine's installed tools.

## Flows and contracts

All paths below are relative to the repository root.

| Flow | Main files | Contract / evidence |
|---|---|---|
| Authenticated API | `app/api.py`, `app/security.py` | Roles and scope; `tests/test_api.py` |
| CSV imports | `app/schemas.py`, `app/services/imports.py` | Full validation before writing; data-integrity/core tests |
| Dashboard metrics | `app/services/metrics.py`, `app/static/app.js` | Campaigns keyed by ID, labels separate and escaped; `scripts/test-campaign-labels.cjs` |
| Recommendations | `app/agents/analysis.py`, `app/services/reports.py` | Identity-based comparisons and human review; core/insight tests |
| Insights | `app/services/insights.py`, `app/services/ai.py` | Cache/claim, reservation, analysis and review; concurrency tests |
| Privacy gateway | `app/services/gateway.py`, `app/integrations/` | Approved fields and fixed endpoints; security/AI tests |
| Operational metadata | `app/services/ai_observability.py`, `app/models.py` | No prompt content; NULL is not zero; observability tests |
| News | `app/services/news.py`, `app/integrations/news.py` | Separate collection/uniqueness; news/locality tests |
| Migrations | `migrations/versions/`, `scripts/verify-migrations.py` | Disposable SQLite checked; PostgreSQL limits remain |
| OCR / contracts | `app/vault/`, `docs/UNLIMITED-OCR.md` | Partial technical interface; real uploads blocked; engine/production not validated |

## Open items and limits

1. Validate PostgreSQL in a disposable live instance. The historical offline check cannot compile data migration `9b27d3e1a102`; this failure is documented, not silently waived. Docker runtime remains unverified.
2. Back up an existing installation before applying migrations. Tests on disposable databases do not update or validate the user's database.
3. Preserve both encryption keys. Compose requires `AI_ENCRYPTION_KEY` and a separate persistent `DATA_ENCRYPTION_KEY`, plus database/admin credentials. See the [setup contract](USAGE.pt-BR.md#docker-e-postgresql); replacing keys without migration can make encrypted data unreadable.
4. Keep audiovisual review separate. The film release documents sampled-frame and technical audio checks, not certified human listening, continuous playback or production use.
5. OCR, a live Google Ads adapter, new models and broader marketing features remain outside the current implementation scope. One installation serves one office; `demo/real` is not tenant isolation.

The original consolidation-era map remains available in [Git history](https://github.com/thomaszstrvm/legalgrowth-ai/blob/7b9b90d8934bbc666e192acc24a41550af25eada/docs/CURRENT-STATE.md). Historical reviews are not retroactively described as new independent validation.
