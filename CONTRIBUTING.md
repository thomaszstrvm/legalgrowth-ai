# Como contribuir

Comece pelo [README](README.md) e pelo [guia da documentação](docs/README.md).
O código original usa a [licença MIT](LICENSE).

## Escopo e evidências

O [estado atual](docs/CURRENT-STATE.md) aponta os contratos vigentes; não é necessário
reler os estudos históricos. Para tarefas com dependências, siga o
[fluxo mínimo](docs/ENGINEERING-WORKFLOW.md): objetivo, responsável, dependências,
teste e evidência. O [ciclo de consolidação](docs/CONSOLIDATION-2026-10-25.md) demonstra
o processo. Preserve sempre o diff existente; a revisão independente não implementa
a própria correção nem substitui o Validador externo.

Novas regressões devem falhar antes da correção quando viável. A fixture de testes
bloqueia transportes HTTP reais do httpx; use `MockTransport` e dados sintéticos.
Isso não é um firewall para outras bibliotecas ou para scripts fora do pytest.

CI preparada em `.github/workflows/checks.yml`: pytest, migrações SQLite descartáveis
e contratos JavaScript nativos. Não foi executada remotamente nesta rodada.
Não há chaves, serviços pagos ou publicação. O disparo por PR/manual depende da
publicação autorizada do workflow e pode consumir a franquia de Actions do proprietário.

Comandos adicionais de consolidação:

- `python scripts/verify-migrations.py --sqlite-only`: upgrade/check/downgrade/upgrade/check.
- `node scripts/test-campaign-labels.cjs`: IDs distintos, rótulos e escape HTML.
- `python scripts/verify-migrations.py` mantém o check histórico completo: atualmente
  falha em PostgreSQL offline na migração de dados `9b27d3e1a102`; não ignore a falha.
  PostgreSQL real continua exigindo ambiente descartável e validação própria.

No sandbox Windows desta rodada, `TestClient` travou em `socketpair()` antes do app.
O diagnóstico foi obtido com `-o faulthandler_timeout=15`; execução autorizada fora
dessa restrição passou. Não remova asserções nem dependências para contornar o sintoma.

## Ambiente e mudanças

Use Python 3.12 ou superior, ambiente virtual e `requirements-dev.txt`.
`python -m app.cli init` cria credenciais locais e aplica migrações;
`python -m app.cli seed` importa somente exemplos fictícios.

1. Descreva o problema e como reproduzi-lo com dados sintéticos.
2. Trabalhe em uma branch e mantenha a alteração focada.
3. Preserve autenticação, proteção das chaves e isolamento entre `demo` e `real`.
4. Adicione testes quando houver comportamento novo ou regressão corrigida.
5. Execute `.venv/Scripts/python.exe -m pytest -q` no Windows, ou
   `.venv/bin/python -m pytest -q` em ambientes Unix.
6. Na pull request, explique resultado, validações executadas e limitações.

Não é necessário configurar uma IA paga para executar os testes. Use mocks para
integrações; nunca use dados de clientes ou execute benchmarks pagos nos testes.

## Revisões visuais

Consulte [DESIGN.md](DESIGN.md). Preserve os dois temas, foco visível e movimento
reduzido. Capture desktop e celular com **Exemplo fictício**, incluindo estados
vazios e erros. A aplicação usa Jinja, CSS e JavaScript nativo.

Os scripts `scripts/browser-*.cjs` são ferramentas opcionais: exigem Node,
Playwright e Microsoft Edge, além do servidor local e `.env` criados pelo init.
Playwright não faz parte das dependências Python da aplicação. Para instalá-lo
localmente para revisão, use `npm install --no-save playwright`; depois execute
`node scripts/browser-scene.cjs`. Não publique `.env` nem as saídas em `output/`.
Os scripts não substituem testes em dispositivos físicos e leitores de tela.

Para os comportamentos desta versão, execute:

- `node scripts/test-period-context.cjs` e `node scripts/test-demo-examples.cjs`:
  regras puras, sem navegador ou rede.
- `node scripts/browser-validator-review.cjs`: 11 páginas, cinco larguras,
  dois temas e estados sintéticos. APIs integralmente simuladas.
- `node scripts/browser-period-race.cjs`: consulta lenta, rascunho, URL, histórico
  e ações com período aplicado, sem chamadas reais.
- `node scripts/browser-action-feedback.cjs`: gravação confirmada e falha da
  leitura seguinte, com respostas simuladas.
- `node scripts/browser-scene.cjs`: navegação, foco e capas após os resultados.

Os scripts bloqueiam chamadas externas e gravações reais. Veja os limites e
as pastas de evidência em [VALIDATOR-REVIEW.md](docs/VALIDATOR-REVIEW.md).
Scripts de ciclos antigos registram expectativas históricas; não substituem a
matriz atual. O inventário de tokens pode ser gerado por
`python scripts/audit-design-tokens.py --ref HEAD`; métricas estáticas não
substituem inspeção visual.

Skills instaladas localmente e o agente em `.codex/agents/visual_critic.toml` são
opcionais; não são necessários para executar o produto.

## Segurança e autoria

Consulte [SECURITY.md](SECURITY.md). Não publique senhas, chaves, bancos, relatórios
reais ou imagens identificáveis. Preserve os avisos de licença das fontes e de
outros componentes de terceiros. Referências de design não autorizam copiar marcas
e imagens para os assets do produto.
