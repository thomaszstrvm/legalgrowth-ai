# Validação executada em 21/10/2026

## Revisão do painel e conexão OpenAI

- Interface reduzida a Resumo, Campanhas, Recomendações, Gastos e Relatórios, com Configurações separada. Detalhes e histórico recolhidos; não exibe JSON ao usuário.
- 53 testes passaram após a implementação do adaptador OpenAI, da chave criptografada e do download de modelos CSV.
- Formulário de conexão/desconexão verificado no Edge com respostas simuladas; campo limpo depois de salvar e nenhuma chave no armazenamento do navegador.
- Adaptador HTTP testado com respostas simuladas para sucesso, chave inválida, limite, erro remoto, timeout e retorno inválido. Não houve chamada autenticada à OpenAI com chave real.
- Migração adicional `dfec56ad9a5c` aplicada ao banco local preservando campanhas, decisões e relatórios existentes.
- Painel desktop, móvel e tela de conexão inspecionados após a revisão; zero erros JavaScript no fluxo verificado.

Os itens abaixo registram a validação inicial; as referências a IA apenas como contrato foram superadas pela revisão acima.

Ambiente: Windows, Python 3.12.0, SQLite local. Não foram usadas credenciais externas nem dados de pessoas reais.

## Resultado automatizado

- 38 testes Pytest passaram: orçamento e limites 80/90/100%, importação transacional e idempotente, validação de CSV e campos extras, divisão por zero, métricas ponderadas, recomendações, decisões humanas e auditoria, relatórios PDF/JSON e duplicidade, erros registrados, busca por padrões de credenciais embutidas, modo sem IA e isolamento demo/real.
- API testada: autenticação, bloqueio do perfil viewer para escrita, proteção CSRF, importação, análise, aprovação/rejeição, exportação e tentativa de acesso a relatório por outro ambiente.
- Sete rotas de página responderam corretamente.
- `alembic check`: sem divergência entre modelos e migração.
- Banco SQLite descartável: upgrade, downgrade até base, novo upgrade e nova comparação passaram. DDL PostgreSQL compilado em modo offline, sem conexão a servidor PostgreSQL.
- `pip check`: nenhuma dependência quebrada no ambiente validado.
- Migração SQLite aplicada no banco local; 180 linhas de campanhas em 90 dias e três indicadores fictícios importados.
- JavaScript verificado com `node --check`.

## Verificação no navegador e PDF

- Servidor Uvicorn real iniciado em `127.0.0.1:8000`.
- Edge headless: sete páginas carregadas, execução de análise e triagem de anúncio pelo formulário; zero erros de JavaScript.
- Layout desktop 1440 × 1000 e móvel 390 × 844: capturados e inspecionados. Sem overflow horizontal no documento móvel.
- Troca para dados reais confirmou investimento zero, sem herdar demonstração.
- Relatório demo da semana 12/10/2026 a 18/10/2026 gerado em PDF e JSON. Duas páginas renderizadas com Poppler e inspecionadas; texto extraído verificado nos testes.

## Limites da validação

- Docker CLI não estava disponível; não foi executado Compose nem PostgreSQL real. A configuração está entregue, mas precisa validação no host de implantação. Compilação de DDL PostgreSQL não equivale a teste de integração com o banco.
- Não foi aguardado o horário real de segunda-feira às 9h. Foram verificados configuração de fuso/trigger e serviço de geração idempotente. O processo deve permanecer em execução.
- Não há conectores ativos de Google Ads API ou IA generativa. Seus contratos não equivalem a integrações homologadas.
- A busca de padrões de credenciais é uma verificação básica, não uma auditoria completa de segurança.
- Os testes HTTP inicialmente ficaram bloqueados no `socketpair` do asyncio pelo sandbox do Windows. Passaram quando executados com a permissão de execução local ampliada; não foi necessário alterar a lógica para contornar a aplicação.
- Uma advertência de depreciação de Starlette sobre uso de httpx no TestClient permaneceu; não causou falha. Atualizar o cliente de testes em manutenção futura.

## Reprodução

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m alembic check
.\.venv\Scripts\python.exe scripts\verify-migrations.py
.\.venv\Scripts\python.exe -m app.cli report --scope demo
```

O teste opcional `scripts/browser-smoke.cjs` exige Node, Playwright e Edge, aplicação ligada e credenciais geradas em `.env`. Ele lê as credenciais sem imprimi-las, cria recomendações e registros de triagem no ambiente demo e salva screenshots em `tmp/`.


## Evolução verificada em 22/10/2026

- `python -m pytest -q`: **108 testes passaram**. Dois avisos de depreciação (TestClient/httpx e `pypdf.add_js` na fixture maliciosa), sem falhas. Adaptadores de geração simulados, somente dados fictícios.
- `scripts/verify-migrations.py`: SQLite temporário upgrade/check/downgrade/upgrade/check aprovado. DDL PostgreSQL compilado; não equivale a testar servidor PostgreSQL.
- `scripts/browser-evolution.cjs`: cinco páginas, dois temas, larguras 375/768/1440, 30 screenshots, zero erros JS e nenhum overflow da página. Mutações e chamadas pagas bloqueadas pelo teste; botão de teste adversarial exibiu 6/6.
- Inspeção visual de estratégia desktop, relatórios tablet e contratos mobile. A tabela dos contratos foi substituída por campos empilhados para evitar rolagem horizontal; teste visual repetido após a correção.
- PDF demonstrativo `output/pdf/relatorio-demo-legivel.pdf`: quatro páginas renderizadas e inspecionadas, sem JSON bruto e sem título de recomendação órfão. Exportação JSON correspondente regenerada. O relatório persistido original não foi modificado.
- `python -m compileall -q app`: aprovado. `git diff --check` sem saída, porém o projeto ainda está integralmente não rastreado; esse comando não substitui revisão dos novos arquivos.
- O servidor local foi reiniciado em 127.0.0.1:8000. Nenhuma verificação com chave de IA real ou benchmark pago foi executada nesta etapa.

Limitações funcionais e requisitos ainda não concluídos estão em `EVOLUTION-2026-10-22.md`.
