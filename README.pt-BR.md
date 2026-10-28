# LegalGrowth AI

[English](README.md) · **Português (Brasil)**

Um painel local que reúne investimento, resultados de campanhas e recomendações para que um escritório de advocacia decida o que revisar.

**O problema:** gastos, métricas de campanhas e relatórios semanais podem ficar desconectados, dificultando entender o significado dos resultados e quais ações precisam de revisão humana.

**A proposta:** importar dados agregados, calcular métricas rastreáveis e revisar recomendações antes de fazer mudanças fora do aplicativo. Desenvolvido com Python, FastAPI, SQLAlchemy, Jinja2 e JavaScript nativo.

> **Projeto de portfólio · Em desenvolvimento.** A interface está em português brasileiro. As capturas e os exemplos usam dados fictícios. Este é um MVP local, não um serviço pronto para produção nem uma comprovação de resultados de clientes.

## Três capacidades principais

1. **Análise de campanhas e orçamento:** importação validada de CSV, filtros de período, métricas agregadas do funil e visão de gastos mensais.
2. **Recomendações explicáveis:** análise por regras com dados de apoio e aprovação humana; integrações opcionais com OpenAI/Claude para priorização e insights.
3. **Relatórios semanais:** retratos salvos de cada semana, com exportação PDF/JSON e separação entre exemplos fictícios e dados do usuário.

Sem publicação automática de anúncios ou alteração de verbas. O painel funciona sem conexão com IA paga.

## Capturas e filme do produto

Captura existente do aplicativo, no tema claro, com dados explicitamente fictícios:

![Painel LegalGrowth no tema claro, com métricas fictícias e capas de navegação](docs/images/opening-light.png)

<details>
<summary>Ver o tema escuro</summary>

![Painel LegalGrowth no tema escuro, com os mesmos dados fictícios](docs/images/opening-dark.png)

</details>

O [filme de produto de 20 segundos e a R7 histórica](media/legalgrowth-presentation/releases/2026-10-25/README.md) estão em desenvolvimento. O filme de produto é uma **representação editorial**, não uma gravação de navegação ao vivo. O cenário fictício, as fontes e os limites da revisão estão documentados junto aos arquivos.

## Minha participação e desenvolvimento assistido por IA

Defino os objetivos, os limites e a direção visual do produto e reviso o trabalho conforme ele evolui. O desenvolvimento é assistido por IA, com Codex e agentes separados de implementação e revisão. O processo de implementação e revisão inclui verificações e limitações documentadas.

O [briefing do produto](PRODUCT.md) registra minhas decisões; o [fluxo de engenharia](docs/ENGINEERING-WORKFLOW.md), o [registro de consolidação](docs/CONSOLIDATION-2026-10-25.md) e as [decisões arquiteturais](docs/decisions/) documentam implementação, revisão, correções e limitações. Esses registros distinguem resultados medidos de alegações não verificadas.

## Arquitetura

```text
Navegador: templates Jinja2 + CSS + JavaScript nativo
    |
Rotas FastAPI + autenticação HTTP Basic
    |
Importação validada -> métricas / recomendações / relatórios
    |                               |
SQLAlchemy + Alembic          gateway de privacidade -> IA opcional
    |
SQLite local / PostgreSQL no Docker Compose
```

| Área | Pontos de entrada |
|---|---|
| API, controle de acesso e validação | `app/api.py`, `app/security.py`, `app/schemas.py` |
| Dados e migrações | `app/models.py`, `app/repositories.py`, `migrations/` |
| Análise e relatórios | `app/agents/`, `app/services/` |
| Integrações | `app/integrations/`, `app/services/gateway.py` |
| Interface | `app/templates/`, `app/static/` |
| Testes sintéticos e CI | `tests/`, `scripts/`, `.github/workflows/checks.yml` |

Uma instalação atende um escritório. `scope=demo/real` separa conjuntos de dados, **não organizações**. O APScheduler roda no processo da aplicação, portanto use um worker. O projeto opcional de filme em Remotion é separado do aplicativo.

## Início rápido

Requer **Python 3.12+**. Em um clone local deste repositório:

```sh
python -m venv .venv
# Windows PowerShell: use .\.venv\Scripts\python.exe abaixo
# macOS/Linux: use .venv/bin/python abaixo
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

Abra **http://127.0.0.1:8000**. Entre como `admin` usando `ADMIN_PASSWORD` do `.env` local. `init` cria credenciais aleatórias apenas quando `.env` não existe e depois aplica as migrações. Se copiar `.env.example` manualmente, preencha as senhas antes de iniciar. Nunca versione `.env`, `.secrets/` ou bancos.

Escolha **Exemplo fictício** para visualizar os 90 dias de demonstração. O padrão **Meus dados** começa vazio. Mantenha o terminal aberto; nas próximas inicializações, execute apenas `uvicorn`. A demonstração não exige conexão com IA paga. Não use dados confidenciais de clientes.

### Docker e PostgreSQL

Antes de `docker compose up --build -d`, defina no `.env` local protegido:

| Variável | Requisito |
|---|---|
| `POSTGRES_PASSWORD` | Senha forte e URL-safe para o banco. |
| `ADMIN_PASSWORD` | Preserve a credencial local criada por `init`; o Compose usa modo de produção, que exige pelo menos 20 caracteres. |
| `AI_ENCRYPTION_KEY` | Chave Fernet persistente para as credenciais de IA salvas. |
| `DATA_ENCRYPTION_KEY` | Chave Fernet **diferente e persistente** para nomes locais. Obrigatória no Compose, mesmo sem conectar IA. |

Preserve `VIEWER_PASSWORD` se precisar de acesso somente leitura. **Apenas para uma instalação nova**, gere cada chave Fernet de forma independente em seu ambiente seguro; o [guia de operação](docs/USAGE.pt-BR.md#docker-e-postgresql) inclui o comando. Não substitua chaves existentes sem um plano de recuperação/migração: dados cifrados podem ficar ilegíveis. Faça backup protegido das chaves junto à política de recuperação do banco.

O Compose vincula o aplicativo a `127.0.0.1:8000`, não publica porta do banco e persiste o PostgreSQL em `pgdata`. O contrato exato está em [compose.yaml](compose.yaml). **A validação de execução em Docker/PostgreSQL continua pendente**; estas instruções não afirmam que esse caminho foi testado. Hospedagem pública exige trabalho separado de TLS, controle de acesso, limitação de tentativas e backup/restauração.

## Verificação e limites

- A [execução Synthetic checks 40225403720](https://github.com/thomaszstrvm/legalgrowth-ai/actions/runs/40225403720) passou em **25/10/2026** para o commit [`7b9b90d`](https://github.com/thomaszstrvm/legalgrowth-ai/commit/7b9b90d8934bbc666e192acc24a41550af25eada): pytest, migrações SQLite descartáveis, contratos JavaScript nativos e checagens de sintaxe JavaScript.
- O resultado se aplica àquele commit exato. Ele **não** valida PostgreSQL, Docker, interação no navegador, chamadas pagas de IA ou reprodução audiovisual. Contagens de testes locais históricos ficam em registros separados, sem serem apresentadas como uma execução nova.
- Google Ads possui importador CSV e contrato de leitura, não um adaptador OAuth/API ao vivo. OCR é uma interface técnica opcional; uploads de contratos reais continuam bloqueados.
- A triagem de conformidade usa heurísticas preliminares, não é parecer jurídico. Chamadas de IA podem gerar cobranças no provedor; o limite de reserva do aplicativo não é uma fatura. Consulte [limites da IA](docs/AI.md) e [segurança](SECURITY.md).

Veja [CONTRIBUTING](CONTRIBUTING.md) para comandos reproduzíveis e [estado atual](docs/CURRENT-STATE.md) para o mapa de evidências e pendências.

## Documentação

- [Índice da documentação](docs/README.md) · [Guia detalhado de operação](docs/USAGE.pt-BR.md)
- [Marcos e histórico preservado](docs/PROJECT-HISTORY.pt-BR.md) · [Changelog](CHANGELOG.md)
- [Objetivos do produto](PRODUCT.md) · [Sistema de design](DESIGN.md) · [Decisões arquiteturais](docs/decisions/)
- [Licença MIT](LICENSE) · [Avisos de terceiros](THIRD_PARTY_NOTICES.md)

O repositório é público. A disponibilidade pública do código não significa que exista uma implantação hospedada ou prontidão para produção.
