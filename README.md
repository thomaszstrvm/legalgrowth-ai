# LegalGrowth AI

**English** · [Português (Brasil)](README.pt-BR.md)

A local dashboard that brings campaign spending, results and recommendations together so a law firm can decide what to review next.

**The problem:** spending, campaign metrics and weekly reporting can be disconnected, making it difficult to understand what a result means and which action needs human review.

**The approach:** import aggregate data, calculate traceable metrics and review recommendations before making changes outside the app. Built with Python, FastAPI, SQLAlchemy, Jinja2 and vanilla JavaScript.

> **Portfolio project · In development.** The interface is in Brazilian Portuguese. Screenshots and examples use fictional data. This is a local MVP, not a production-ready service or evidence of client results.

## Three core capabilities

1. **Campaign and budget analysis:** validated CSV imports, date filters, aggregate funnel metrics and monthly spending views.
2. **Explainable recommendations:** rule-based analysis with supporting data and human approval; optional OpenAI/Claude integrations for prioritization and insights.
3. **Weekly reporting:** saved weekly snapshots with PDF/JSON exports, keeping fictional examples separate from the user's data.

No automatic ad publishing or budget changes. The dashboard works without a paid AI connection.

## Screenshots and product film

Existing application screenshot, light theme, with explicitly fictional data:

![LegalGrowth dashboard in the light theme, showing fictional campaign metrics and navigation cards](docs/images/opening-light.png)

<details>
<summary>View the dark theme</summary>

![LegalGrowth dashboard in the dark theme, using the same fictional data](docs/images/opening-dark.png)

</details>

The [20-second product film and historical R7](media/legalgrowth-presentation/releases/2026-10-25/README.md) are work in progress. The product film is an **editorial representation**, not a recording of live navigation. Its fictional scenario, sources and review limits are documented with the files.

## My role and AI-assisted development

I define the product goals, constraints and visual direction, and review the work as it evolves. Development is AI-assisted, using Codex and separate implementation/review agents. The implementation and review process includes documented checks and limitations.

The [product brief](PRODUCT.md) records my decisions; the [engineering workflow](docs/ENGINEERING-WORKFLOW.md), [consolidation record](docs/CONSOLIDATION-2026-10-25.md) and [architecture decisions](docs/decisions/) document implementation, review, corrections and limitations. These records distinguish measured results from claims that have not been verified.

## Architecture

```text
Browser: Jinja2 templates + CSS + vanilla JavaScript
    |
FastAPI routes + HTTP Basic authentication
    |
Validated imports -> metrics / recommendations / reports
    |                               |
SQLAlchemy + Alembic          privacy gateway -> optional AI providers
    |
SQLite locally / PostgreSQL in Docker Compose
```

| Area | Entry points |
|---|---|
| API, access control and input validation | `app/api.py`, `app/security.py`, `app/schemas.py` |
| Data and migrations | `app/models.py`, `app/repositories.py`, `migrations/` |
| Analysis and reporting | `app/agents/`, `app/services/` |
| Integrations | `app/integrations/`, `app/services/gateway.py` |
| Interface | `app/templates/`, `app/static/` |
| Synthetic tests and CI | `tests/`, `scripts/`, `.github/workflows/checks.yml` |

One installation serves one office. `scope=demo/real` separates datasets, **not organizations**. APScheduler runs in the application process, so use one worker. The optional Remotion film project is separate from the app.

## Quick start

Requires **Python 3.12+**. From a local clone of this repository:

```sh
python -m venv .venv
# Windows PowerShell: use .\.venv\Scripts\python.exe below
# macOS/Linux: use .venv/bin/python below
```

Windows / PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m app.cli init
.\.venv\Scripts\python.exe -m app.cli seed
.\.venv\Scripts\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000 --workers 1
```

macOS / Linux:

```sh
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m app.cli init
.venv/bin/python -m app.cli seed
.venv/bin/python -m uvicorn app.api:app --host 127.0.0.1 --port 8000 --workers 1
```

Open **http://127.0.0.1:8000**. Sign in as `admin` using `ADMIN_PASSWORD` from your local `.env`. `init` creates random credentials only when `.env` does not exist, then applies migrations. If you copy `.env.example` manually, fill in the passwords before starting. Never commit `.env`, `.secrets/` or databases.

Choose **Exemplo fictício** (fictional example) to view the seeded 90-day dataset. The default **Meus dados** (my data) starts empty. Keep the terminal running; on later starts, run only the `uvicorn` command. No paid AI connection is needed for this demo. Do not use confidential client data.

### Docker and PostgreSQL

Before `docker compose up --build -d`, set the following in your protected local `.env`:

| Variable | Requirement |
|---|---|
| `POSTGRES_PASSWORD` | A strong URL-safe database password. |
| `ADMIN_PASSWORD` | Keep the local credential created by `init`; Compose runs in production mode, which requires at least 20 characters. |
| `AI_ENCRYPTION_KEY` | A persistent Fernet key for stored AI credentials. |
| `DATA_ENCRYPTION_KEY` | A **different, persistent Fernet key** for local identity labels. Mandatory in Compose, even if AI is not connected. |

Keep `VIEWER_PASSWORD` if you need read-only access. For a **new installation only**, generate each Fernet key independently in your own secure environment; the [Portuguese operations guide](docs/USAGE.pt-BR.md#docker-e-postgresql) includes the command. Do not replace existing keys without a recovery/migration plan: encrypted data may become unreadable. Back up the keys securely alongside your database recovery plan.

Compose binds the app to `127.0.0.1:8000`, does not publish a database port and persists PostgreSQL in `pgdata`. See [compose.yaml](compose.yaml) for the exact contract. **Docker/PostgreSQL runtime validation remains outstanding**; these setup instructions are not a claim that this path has been tested. Public hosting requires separate TLS, access controls, rate limiting and backup/restore work.

## Verification and limits

- [Synthetic checks run 40225403720](https://github.com/thomaszstrvm/legalgrowth-ai/actions/runs/40225403720) succeeded on **2026-10-25** for commit [`7b9b90d`](https://github.com/thomaszstrvm/legalgrowth-ai/commit/7b9b90d8934bbc666e192acc24a41550af25eada): pytest, disposable SQLite migrations, native JavaScript contracts and JavaScript syntax checks.
- That result applies to that exact commit. It does **not** validate PostgreSQL, Docker, browser interaction, paid AI calls or audiovisual playback. Historical local test counts are recorded separately, not presented as a new run.
- Google Ads has a CSV importer and read-only interface contract, not a live OAuth/API adapter. OCR is an optional technical interface; real contract uploads remain blocked.
- Compliance checks are preliminary heuristics, not legal advice. AI calls can incur provider charges; the app's reservation limit is not a billing statement. See [AI boundaries](docs/AI.md) and [security](SECURITY.md).

See [CONTRIBUTING](CONTRIBUTING.md) for reproducible check commands and [current state](docs/CURRENT-STATE.md) for the evidence map and open items.

## Documentation

- [Documentation index](docs/README.md) · [Detailed operations guide (Portuguese)](docs/USAGE.pt-BR.md)
- [Project milestones and preserved history (Portuguese)](docs/PROJECT-HISTORY.pt-BR.md) · [Changelog](CHANGELOG.md)
- [Product goals](PRODUCT.md) · [Design system](DESIGN.md) · [Architecture decisions](docs/decisions/)
- [MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

The repository is public. Public source availability does not imply a hosted deployment or production readiness.
