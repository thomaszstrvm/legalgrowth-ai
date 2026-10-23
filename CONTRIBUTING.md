# Como contribuir

Comece pelo [README](README.md) e pelo [guia da documentação](docs/README.md).
O código original usa a [licença MIT](LICENSE).

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

Skills instaladas localmente e o agente em `.codex/agents/visual_critic.toml` são
opcionais; não são necessários para executar o produto.

## Segurança e autoria

Consulte [SECURITY.md](SECURITY.md). Não publique senhas, chaves, bancos, relatórios
reais ou imagens identificáveis. Preserve os avisos de licença das fontes e de
outros componentes de terceiros. Referências de design não autorizam copiar marcas
e imagens para os assets do produto.
