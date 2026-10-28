# Guia detalhado de operação

[English overview](../README.md) · [Resumo em português](../README.pt-BR.md)

Conteúdo operacional preservado do [README anterior](https://github.com/thomaszstrvm/legalgrowth-ai/blob/7b9b90d8934bbc666e192acc24a41550af25eada/README.md), com correções
de visibilidade, referências e requisitos de criptografia do Docker em 28/10/2026.
O aplicativo continua em português; este guia não declara uma nova validação de runtime.
Os [marcos históricos](PROJECT-HISTORY.pt-BR.md) foram separados das instruções de uso.

## Início rápido no Windows / PowerShell

Redesign e manutenção visual: [sistema de design atual](../DESIGN.md),
[implementação atual](VALIDATOR-REVIEW.md) e [skills e origens](DESIGN-SKILLS.md).
Capturas completas ficam em `output/design-review/` na máquina de desenvolvimento;
essa pasta é ignorada pelo Git. As prévias nos READMEs principais acompanham o repositório.

Requisito: Python 3.12+. Na pasta do projeto:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m app.cli init
.\.venv\Scripts\python.exe -m app.cli seed
.\.venv\Scripts\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000 --workers 1
```

Mantenha esse terminal aberto enquanto usa o painel. Após reiniciar o computador,
execute novamente apenas o comando `uvicorn` acima, na pasta do projeto. Não é
necessário recriar o ambiente, apagar o banco ou gerar outra senha.

Abra http://127.0.0.1:8000. Usuário `admin`, senha no campo `ADMIN_PASSWORD` do arquivo local `.env`. O comando `init` gera senhas aleatórias se o arquivo ainda não existir. Não imprime nem versiona as senhas. Usuário `viewer`, com `VIEWER_PASSWORD`, pode consultar, mas não importar, aprovar ou modificar configurações. Se copiar `.env.example` manualmente, preencha as senhas antes de iniciar.

O navegador usa autenticação HTTP Basic. Apenas loopback em desenvolvimento; ao hospedar, HTTPS e limitação de tentativas no proxy são obrigatórios. Fechar todas as janelas do navegador encerra o cache usual de credenciais Basic; não há gestão de contas ou logout de sessão no MVP.

Selecione **Exemplo fictício** no topo para visualizar 90 dias fictícios. O padrão é **Meus dados**, inicialmente vazio. A marcação `scope` é obrigatória em cada linha e validada contra o ambiente escolhido. Nomes, fontes e indicadores demonstrativos são inventados e rotulados. Nunca remova o rótulo para apresentar esses resultados como reais.

## Período, orçamento e relatórios

- Em Resumo, Campanhas, Recomendações e Insights, escolha datas e clique em **Aplicar**.
  O intervalo aplicado acompanha os links, a recarga e o histórico. Editar um campo
  sem aplicar não muda a análise. Cada ambiente mantém seu próprio último período
  na sessão; URLs explícitas têm precedência.
- **Orçamento e gastos** consulta um mês. Ao vir da análise, começa pelo mês da
  data final. A lista de despesas mostra até 100 registros recentes de todos os
  meses; os totais acima são mensais. Ferramentas e IA ficam fora do saldo de mídia.
- **Relatórios** usa uma segunda-feira e cobre até domingo. O arquivo salvo é um
  retrato daquele momento, não se atualiza sozinho. Baixe PDF para ler ou JSON para
  analisar em outra ferramenta. Revise o conteúdo antes de compartilhá-lo.
- Conexões e limite de IA são compartilhados por toda a instalação. Uma análise
  solicitada com dados fictícios pode ter cobrança; abrir um exemplo estático não.

## Personalizar sua instalação

Uma instalação corresponde a um escritório. Não é necessário usar Cruzeiro:
essa cidade permanece apenas nos exemplos fictícios e em configurações antigas
que você já tenha salvo.

| O que personalizar | Onde | Efeito |
|---|---|---|
| Cidades atendidas | **Configurações → Sua região de atuação** | Novas importações e coletas usam a seleção salva no ambiente atual. |
| Claro ou escuro | Botão de tema no painel | Preferência salva neste navegador; as duas paletas são mantidas. |
| Provedor e limite de IA | **Configurações → Conectar IA** | OpenAI ou Claude; chaves guardadas cifradas, sem editar código. |
| Orçamento | **Gastos → Ajustar orçamento** | Limites e distribuição mensal do próprio escritório. |
| Período de análise | Filtros do painel | Consulta dados existentes, sem reescrever o histórico. |
| Horário dos relatórios | `.env`: `REPORT_DAY`, `REPORT_HOUR`, `REPORT_MINUTE`, `TIMEZONE` | Requer reiniciar o servidor; veja Agendamento. |
| Fontes jornalísticas | Catálogo `SOURCES` em `app/integrations/news.py` | Personalização pelo mantenedor, com revisão e testes; veja abaixo. |
| Identidade visual | `DESIGN.md`, fundações em `app/static/tokens.css`; componentes em `style.css` e `arc.css` | Altere os pares claro/escuro e confira contraste e celular. |

### Escolher sua região, passo a passo

1. No topo, escolha **Meus dados**. **Exemplo fictício** tem configuração separada.
2. Em **Configurações**, preencha uma cidade e selecione sua UF.
3. Use **Adicionar cidade** para incluir outros municípios; **Remover** tira uma
   linha da seleção. A alteração só é persistida ao clicar em **Salvar região**.
4. No CSV, use exatamente a grafia salva seguida de hífen e UF: `Curitiba-PR`.
   A validação aceita as 27 unidades federativas e limita a lista a 20 cidades, mas não consulta
   o IBGE nem comprova que um município existe. Confira a grafia.
5. Em **Notícias regionais**, confira a região mostrada antes da coleta.

Mudar a seleção não apaga campanhas, não muda cidades de registros antigos e
não refaz relatórios existentes. Uma coleta antiga continua associada à seleção
original. Uma nova região começa sem notícias salvas daquela combinação.

### Fontes de notícias e cobertura

Os jornais incluídos inicialmente cobrem o Vale do Paraíba, em SP. Escolher outra
cidade não acrescenta um jornal automaticamente. O sistema não substitui a região
escolhida por Cruzeiro quando não encontra notícias.

Para adaptar a instalação a outro local, um mantenedor deve revisar o catálogo
`SOURCES` em `app/integrations/news.py`: identificador, nome, domínio HTTPS,
caminho do RSS, limite de páginas e estados cobertos. Use apenas fontes públicas
conhecidas, com permissão de leitura, e teste com RSS fictício antes de coletar.
Não coloque URLs de usuários diretamente nesse catálogo, nem habilite redirects
ou leitura de endereços internos. Esses limites reduzem o risco de SSRF, quando
uma URL induz o servidor a acessar serviços privados da rede.

O gateway também mantém uma lista dos identificadores permitidos das fontes;
atualize-a junto do catálogo. O roteiro técnico completo está em
[Cidades e cobertura](localidades.md), com a função central explicada linha
por linha e um exercício sobre isolamento do histórico.

A coleta lê títulos e trechos, não todo o site. Município e estado devem ser
compatíveis com a fonte; mesmo assim, a identificação por texto pode ser ambígua.
Ausência de notícia não prova ausência de acontecimentos. O agendamento de
notícias no Codex é separado do agendamento de relatórios em `.env`; quem clonar
o projeto precisa configurar sua própria execução de `python -m app.cli news`.

### Atualizar e aprender com as versões

O repositório de desenvolvimento é [thomaszstrvm/legalgrowth-ai](https://github.com/thomaszstrvm/legalgrowth-ai),
**público** em 28/10/2026. Commits registram entregas; tags identificam marcos.
O número da versão identifica uma entrega, não uma nota de design.
Consulte [CHANGELOG.md](../CHANGELOG.md) e [guia de versionamento](VERSIONING.md).

Para estudar as decisões de interface, veja também a
[avaliação das skills de front-end](LLM-SKILLS-REVIEW.md), incluindo o
tratamento acessível de erros e a proteção dos valores digitados.

Antes de atualizar, preserve `.env`, `.secrets/` e o banco em um backup local
protegido. Com o servidor parado, atualize o código e execute:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m pytest -q
```

Migrações evoluem a estrutura do banco sem recriá-lo. O cadastro de cidades usa
uma configuração existente; a chave geográfica separa históricos de notícias.
**Exercício:** em Exemplo fictício, cadastre uma segunda cidade, volte a Meus
dados e explique por que a seleção não deveria mudar. Não use dados de clientes.

## Conectar uma IA pelo painel

1. Abra **Configurações → Conectar IA**.
2. Escolha OpenAI ou Claude, cole sua chave e clique em **Testar e conectar**. Há um link na própria tela para criar a chave.
3. Volte ao **Resumo** ou às **Recomendações** e clique em **Analisar com IA**.

O botão de conexão testa a chave antes de salvá-la. Não precisa editar `.env` nem reiniciar para conectar. A chave fica criptografada no banco e nunca é devolvida ao navegador. Para remover a conexão, clique em **Desconectar**.

A IA seleciona até cinco prioridades entre recomendações fundamentadas nos dados; não cria métricas, fontes, anúncios ou decisões financeiras. O painel permanece utilizável sem IA. Apenas totais numéricos, categorias predefinidas e IDs internos são enviados. Nomes de campanhas, palavras-chave e textos de clientes não são enviados.

As consultas podem ser cobradas pelas contas OpenAI e Anthropic. O painel reserva R$ 1 por tentativa, com limite mensal inicial de R$ 60 para novas conexões, ajustável em **Limite de uso**. Essa reserva conservadora bloqueia chamadas adicionais, mas não é a fatura nem uma cotação em tempo real. Confira o consumo no provedor e registre a despesa efetiva em **Gastos**, sem somar a reserva como despesa paga. Detalhes e limites: [AI.md](AI.md).

## Fluxo de utilização

1. **Configurações → Sua região de atuação:** escolha de uma a vinte cidades, informando nome e UF, e clique em **Salvar região**. Instalações novas não presumem uma cidade para os dados reais. Configurações já salvas são preservadas. O plano mensal fica em **Gastos → Ajustar orçamento**.
2. **Campanhas:** importe CSV UTF-8 no formato de `examples/campaigns_demo.csv`. Os filtros de período e área afetam as métricas e gráficos de campanhas. O financeiro sempre considera todas as áreas no mês da data final.
3. **Recomendações → Ver ideias de conteúdo:** importe indicadores agregados com origem, data, unidade e URL oficial. O CSV de exemplo contém somente indicadores sintéticos.
4. **Recomendações:** clique em **Revisar resultados** (sem IA) ou **Analisar com IA** (quando conectada), abra **Ver dados** e aprove/descarte recomendações. O motor analisa todas as áreas; o filtro de área só aparece em Campanhas. Aprovar registra a decisão, sem executar mudanças externas.
5. **Gastos:** registre despesas de ferramentas e anúncios não incluídos em importações. Não registre manualmente anúncios já importados. Compare com o mês anterior e acompanhe alertas de 80%, 90% e 100%.
6. **Relatórios:** escolha uma segunda-feira e gere o relatório; exporte PDF ou JSON. Uma semana corresponde a segunda a domingo, inclusivos. Relatórios são snapshots imutáveis por ambiente e semana. Importar dados atrasados não atualiza automaticamente um relatório já gerado.

Também é possível gerar a última semana completa pela linha de comando:

```powershell
.\.venv\Scripts\python.exe -m app.cli report --scope demo
```

Os arquivos ficam em `output/pdf/`. Para gerar com dados reais, use `--scope real`.

## CSV de campanhas

Separador: vírgula; codificação UTF-8 (BOM aceito); decimal com ponto; datas ISO `AAAA-MM-DD`. Arquivo até 2 MB e 10.000 linhas. Todos os campos são obrigatórios; colunas extras são rejeitadas. Não importar linhas de totais nem diferentes níveis de agregação juntos.

| Coluna | Contrato |
|---|---|
| scope | `demo` ou `real` |
| date | Dia do registro |
| campaign_id | ID agregado estável; letras, números, hífen ou sublinhado |
| campaign | Nome agregado, até 120 caracteres |
| area | `trabalhista` ou `previdenciario` |
| locality | Cidade habilitada em Configurações, no formato `Nome-UF`, por exemplo `Curitiba-PR` |
| keyword | Palavra-chave agregada; não incluir termos de pesquisa com dados pessoais |
| impressions, clicks | Inteiros não negativos; cliques <= impressões |
| cost | Reais, não micros; até duas casas decimais |
| conversions | Contagem inteira de conversões configuradas no anúncio |
| contacts, qualified, appointments, hires | Contagens agregadas do funil; decrescentes nessa ordem |

**Grão:** campanha × dia × localidade × palavra-chave. Contatos e contratações precisam estar atribuídos exatamente a esse grão, sem repetir totais em cada palavra-chave. Defina um modelo de atribuição antes de juntar Google Ads e controles internos. Este esquema assume um funil da mesma coorte; outros modelos exigem adaptação. Conversões fracionárias do Google Ads não são aceitas nesta versão; não arredonde silenciosamente.

O CSV é um formato normalizado, não uma aceitação universal de exportações brutas do Google. Renomeie e transforme as colunas conforme o contrato. Nome e área da campanha são estáveis por ID. Uma reimportação idêntica é ignorada; valores diferentes para a mesma chave são rejeitados em transação integral. Não há atualização silenciosa. A origem `real` é declaração do responsável, não certificação automática de veracidade.

**Métricas:** CTR = cliques/impressões × 100; CPC = gasto/cliques; CPQ = gasto/qualificados; custo por contratação = gasto/contratações. São razões de totais, não médias de razões. Denominador zero produz `N/D`, nunca infinito. Conversão não é contrato. Zero importado é zero informado; ausência de dias é cobertura incompleta. O relatório informa dias presentes, mas não conhece campanhas que deixaram de ser exportadas.

## CSV de mercado

Campos: `scope,date,source,source_url,accessed,topic,area,locality,value,unit`. Mesmos formatos básicos. Dados reais exigem URL HTTPS em domínio oficial `gov.br`; a URL é armazenada como proveniência e não é acessada pelo servidor. A fonte deve permitir o uso e os valores devem ser verificados pelo responsável. Não presumimos API universal ou estabilidade de scraping.

Evolução compara as duas observações mais recentes da mesma fonte, tema, localidade e unidade, até o fim do período. Contexto demográfico não é volume de buscas, propensão individual nem prova de demanda comercial. Nenhum dado público foi fabricado para preencher o ambiente real. O exemplo sintético usa `example.invalid`.

## Arquitetura

```text
app/api.py                 rotas, autenticação e páginas
app/models.py              entidades e restrições SQL
app/repositories.py        consultas com isolamento explícito de scope
app/schemas.py             validação Pydantic
app/services/              importação, métricas, financeiro e relatórios
app/agents/                regras de análise e triagem de conformidade
app/integrations/          contratos de Google Ads e provedor generativo
app/scheduler.py           agendamento no fuso de Brasília
app/templates/, static/    Jinja2, CSS e JavaScript sem framework
migrations/                migração Alembic versionada
tests/                     regras, importação, API, aprovação e relatórios
```

O ambiente local usa SQLite; o Compose usa PostgreSQL. Valores monetários persistem como Numeric/Decimal. Não há multitenancy de escritórios: `scope` separa real/demo, não organizações. Uma instalação atende um escritório; futuro SaaS precisa tenant_id, permissões e isolamento de ponta a ponta.

## Agendamento

No `.env`, configure `SCHEDULER_ENABLED=true`, `REPORT_DAY=mon`, `REPORT_HOUR=9`, `REPORT_MINUTE=0`, `TIMEZONE=America/Sao_Paulo` e reinicie. Use **um worker**. APScheduler roda no processo, exige aplicação ligada e não repõe execuções perdidas enquanto a aplicação esteve desligada; gere manualmente nesse caso. Jobs simultâneos são limitados e há unicidade SQL de semana/ambiente. Erros são registrados sem prompts ou chaves. Não há envio por e-mail nesta versão.

## Docker e PostgreSQL

O contrato de [compose.yaml](../compose.yaml) exige quatro valores no `.env` local protegido:

- `POSTGRES_PASSWORD`: senha forte e URL-safe para o banco.
- `ADMIN_PASSWORD`: preserve a credencial criada por `init`; o modo de produção exige pelo menos 20 caracteres.
- `AI_ENCRYPTION_KEY`: chave Fernet persistente para as credenciais de IA.
- `DATA_ENCRYPTION_KEY`: **outra chave Fernet, diferente e persistente**, para os nomes locais. É obrigatória no Compose, mesmo sem conectar IA.

Preserve `VIEWER_PASSWORD` se precisar do perfil somente leitura. Para uma **instalação nova**, execute o comando abaixo duas vezes em seu ambiente seguro, usando um resultado diferente para cada variável de criptografia:

```sh
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

O comando acima é uma instrução para o responsável, não foi executado nesta revisão documental. Não publique seus resultados, não os inclua em logs compartilhados e proteja `.env`. **Não gere novas chaves para substituir as de uma instalação existente:** sem recifrar os dados, a troca pode impedir sua recuperação. Preserve também as chaves locais existentes em `.secrets/` ao planejar uma migração e faça backups protegidos conforme a política de recuperação.

A validação de execução em Docker/PostgreSQL continua pendente. Conferir o contrato do Compose não equivale a testar sua execução. Com a configuração concluída pelo responsável, o comando de inicialização é:

```powershell
docker compose up --build -d
```

O banco não expõe porta; a aplicação fica em `127.0.0.1:8000`. Migrações são aplicadas na inicialização. O volume `pgdata` persiste o banco. Para dados demo use `docker compose exec app python -m app.cli seed`. Faça backups antes de alterações de schema. Para hospedagem externa, configure TLS, firewall, rate limit, backup/restauração e gestão de segredos; o Compose local não resolve esses itens.

## Integrações e limitações deliberadas

- Google Ads: importador funcional e contrato `GoogleAdsReader` somente leitura. Adaptador OAuth/API real ainda não implementado; exige conta autorizada, developer token e definição do relatório. Não existem métodos de alteração de verba ou publicação.
- IA: OpenAI e Claude conectados pelo painel; prioridades, insights e cenários públicos. Gateway obrigatório antes da geração. Detalhes de privacidade, reservas e limitações em [docs/AI.md](AI.md). Testes usam respostas simuladas; não foram executados benchmarks pagos.
- Conformidade: triagem lexical preliminar, sem parecer jurídico. Não armazena o texto avaliado. Pode falhar para paráfrases e gerar falsos positivos. Toda publicação exige revisão de advogado; a aprovação de recomendação não aprova automaticamente qualquer anúncio.
- Privacidade: somente esquema agregado; regex de rótulos bloqueia alguns padrões evidentes, mas não é DLP completo. Não inserir dados pessoais em campos de texto. Sem scraping de processos, pessoas, idosos vulneráveis ou listas de prospecção.
- Orçamento: mídia padrão de R$ 2.000, distribuída inicialmente em R$ 1.400 trabalhista e R$ 600 previdenciário. Ferramentas e IA têm consumo separado. Planos já salvos são preservados e a interface avisa sobre alocações antigas. Alertas não bloqueiam gastos no Google Ads.
- Análises: limiares de 20% para aumento de CPC/CPQ, R$ 50 sem qualificado e 100 cliques/10 qualificados são heurísticas operacionais, não significância estatística. Não geramos estimativas de ROI.

## Testes e verificação

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m alembic check
```

Consulte [estado atual](CURRENT-STATE.md) para a CI identificada por commit e [VALIDATION.md](VALIDATION.md) para resultados locais históricos, incluindo limitações de PostgreSQL/Docker. Esta revisão documental não reexecutou a aplicação nem esses testes. `requirements-lock.txt` registra as versões usadas na validação. Não execute seed em dados reais; o comando só grava `demo`.

## Normas e fontes

Revisão documental histórica em 21/10/2026: ver [COMPLIANCE.md](COMPLIANCE.md). Fontes oficiais foram consultadas, mas propostas de atualização não foram consolidadas como regras vigentes. Revalidação jurídica antes do uso externo é necessária.

## Novas áreas

- **Notícias da região → Análise estratégica:** impacto social e potencial financeiro independentes. Sem base suficiente, nenhuma nota é inventada.
- **Configurações → Contratos e clientes:** demonstração fictícia do extrator; upload real bloqueado até verificar os controles de segurança.
- **Relatórios → Testar a conferência de erros:** seis mutações conhecidas em cópias fictícias, sem alterar relatórios ou usar APIs pagas.
- **Relatórios → Arquivo para outra IA:** exportação estruturada com dados selecionados e nomes de grupos substituídos por códigos.

Decisões arquiteturais em `docs/decisions/`; estudo guiado em [docs/MENTORIA-2026-10-22.md](MENTORIA-2026-10-22.md). O projeto permanece um MVP local, não um sistema liberado para documentos confidenciais.
