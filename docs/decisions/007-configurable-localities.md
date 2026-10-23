# ADR 007 — Localidades configuráveis e histórico geográfico

Data: 2026-10-23. Estado: implementado; migração validada em banco sintético antes de aplicação local.

## Contexto

A interface e os esquemas aceitavam somente três cidades. A coleta acrescentava essas cidades independentemente da seleção. O resumo de notícias era único por semana: trocar a região poderia mostrar notícias antigas como atuais ou sobrescrever o histórico de outra seleção. Relatórios também consultavam notícias apenas por semana.

## Decisão

Manter `Configuration.localities` por ambiente como única configuração de cidades atendidas. Aceitar de uma a vinte localidades no formato `Nome-UF`, com UF brasileira válida, normalização de espaços e limites de tamanho. Essa validação é sintática: não confirma existência ou grafia do município no IBGE. Sem configuração, o ambiente real começa vazio; demonstração mantém sua cidade sintética original.

Notícias passam a ter unicidade por `(week_start, geography_key)`. A chave SHA-256 representa a lista ordenada de cidades, sem depender da ordem ou de maiúsculas. Ela não protege informação nem substitui autorização. A migração calcula a chave a partir de `payload.cities` e preserva IDs, conteúdo e datas. `latest`, comparação semanal e inclusão em novos relatórios usam a geografia atual. Exportação por ID preserva acesso ao histórico identificado; relatórios já gerados continuam snapshots imutáveis.

O catálogo permanece limitado a fontes regionais do Vale do Paraíba/SP. O coletor não atribui a cidades de outra UF notícias dessas fontes apenas pela coincidência de nome. A configuração nacional não implica cobertura nacional. Não há consulta IBGE, geolocalização automática ou nova fonte remota.

## Justificativa e alternativas

Uma segunda configuração de cidade principal duplicaria a informação usada para autorizar CSVs. Um catálogo municipal completo seria mais preciso, mas exigiria origem, atualização e operação adicionais; não é necessário para permitir escolha explícita. Texto totalmente livre sem UF prejudicaria identificação e validação.

Somente invalidar o cache resolveria a exibição, mas a restrição antiga impediria salvar duas regiões na mesma semana. Sobrescrever o resumo apagaria histórico. A migração mínima adiciona uma coluna e altera a chave única, sem reescrever conteúdo nem tabelas de clientes ou campanhas. No SQLite, Alembic recria a tabela com cópia dos registros. O downgrade recusa semanas com múltiplas geografias, evitando perda silenciosa.

## Consequências positivas

- Uma única configuração usada por interface, importações e notícias.
- Notícias e oportunidades não reaproveitam seleção geográfica diferente.
- Comparações semanais não misturam cidades diferentes.
- Histórico preservado em mudança de região; demonstração continua separada.
- Validação compartilhada com o gateway de IA sem liberar payloads arbitrários.

## Consequências negativas e limites

- É necessário executar a migração antes de iniciar a nova versão contra um banco existente.
- Grafias distintas e diferenças de acentuação continuam localidades distintas; não há catálogo oficial para resolvê-las.
- Dados CSV históricos permanecem vinculados às cidades originais. Alterar cidades atendidas não apaga, renomeia ou filtra automaticamente análises de campanhas já importadas.
- Refresh da mesma semana e mesma geografia continua atualizando esse resumo, como antes; não há versionamento de cada tentativa.
- Os nomes nos feeds são correspondências textuais, não geocodificação: homônimos, menções secundárias e localidades fora do Vale podem não ter cobertura confiável. O estado cadastrado limita a fonte, mas não certifica a localização de cada acontecimento.
- Não há suporte multiempresa: a configuração é por ambiente `real/demo` da instalação.

## Verificação e operação

`tests/test_localities.py` cobre validação, isolamento, mudança de região, histórico, comparações, gateway, cobertura e migração sintética. A migração é `9b27d3e1a102`; o comando operacional é `.\.venv\Scripts\python.exe -m alembic upgrade head`, executado apenas após backup e validação do banco pretendido. Esta implementação não executa esse comando contra dados reais automaticamente.
