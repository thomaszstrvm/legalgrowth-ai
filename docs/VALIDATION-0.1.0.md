# Validação do marco 0.1.0

23/10/2026. Windows, Python local do projeto, Edge headless.

- Suíte completa: **158 testes passaram, seis avisos**, em 2,60 s na execução
  final. Leitura de dotenv desativada para testes; bancos e serviços sintéticos.
  Avisos: depreciação Starlette/httpx, configuração de separador Alembic e pypdf.
- Migração sintética: IDs e payloads preservados; duas geografias na mesma
  semana; `alembic check` sem divergência; downgrade destrutivo bloqueado.
- Banco da instalação: backup SQLite local antes da migração; migração aplicada,
  `integrity_check` e `alembic check` aprovados. Dados não enviados externamente.
- Navegador: Configurações e Notícias em 1366, 390 e 320 px, claro/escuro.
  Adicionar, salvar, recarregar, remover sem salvar, limites, campos obrigatórios
  e separação real/demo verificados com respostas sintéticas. Seis salvamentos
  simulados; zero gravações reais e zero chamadas externas. Foco por Tab
  confirmado em `Adicionar cidade`, incluindo `:focus-visible`.
- Capturas de sucesso, erro equivalente ao 422 da API, foco e limite com contexto.
  Evidências e manifesto de cinco fontes: `output/design-review/locations-v1/final/`.
- Após migração/reinício: Resumo, Configurações, Notícias e Relatórios em
  1366/390 e dois temas: 16 capturas, sem overflow, erros JS ou gravações.
- Cinco documentos de entrada tiveram seus links locais conferidos, sem ausências.
- Pré-envio: arquivos do índice comparados com segredos locais e padrões comuns
  de tokens. Nenhum achado. Bancos, `.env`, chaves, backups, logs e referências
  visuais externas excluídos pelo Git. Essa checagem não equivale a uma auditoria
  de segurança completa nem prova ausência de todo dado sensível possível.

O teste inicial de navegador redefinia demo em toda navegação e falhou ao abrir
Notícias após trocar para real. O próprio teste foi corrigido para preservar a
seleção; a execução final passou. A captura inicial de foco usava foco programático
após clique; foi substituída por Tab real e verificação de `:focus-visible`.

`git diff --cached --check` indicou espaços finais em documentos históricos,
licenças de fontes e linhas vazias finais preexistentes. Não foram removidas
quebras Markdown ou alterados avisos de terceiros apenas para silenciar o comando.

Limites: nenhum benchmark pago; fontes nacionais não foram coletadas; cobertura
inicial permanece regional. Não foi validado PostgreSQL/Docker nesta entrega,
nem feita auditoria integral de acessibilidade. Revisões das capas estão em
[THE-CRITIC-OPENING-V3.md](THE-CRITIC-OPENING-V3.md); notas de escopos diferentes
não constituem uma série comparável de desempenho.
