# Revisão da arquitetura frontend — 22/10/2026

Escopo: leitura de `app/api.py`, `app/security.py`, `app/db.py`, `app/services/strategy.py`, `app/services/news.py`, `app/integrations/news.py`, `app/static/app.js`, template e CSS. Não foram executados testes de integração nesta revisão, nem lidas credenciais. Este registro descreve contratos observados, não uma autorização para novos recursos.

## Stack e fronteiras

FastAPI serve o template Jinja2 e arquivos estáticos; JavaScript nativo busca JSON e gera fragmentos HTML; CSS define temas e responsividade. SQLAlchemy mantém sessões por requisição. SQLite recebe `foreign_keys=ON`; a camada de configuração permite outros bancos. O scheduler é condicional no ciclo de vida da API. Nenhum framework ou etapa de build frontend é necessário para o redesign.

`render()` consulta `/api/dashboard`, seleciona a página e carrega dados adicionais. `renderVersion` impede respostas antigas de substituir a renderização atual. `action()` concentra ações e atualização; `api()` preserva o cabeçalho `X-Requested-With: LegalGrowth`, diferencia FormData de JSON e traduz falhas em mensagens. Reorganizar apresentação sem perder IDs, handlers, nomes de campos, escopo real/demo e parâmetros de período.

Os helpers `panel`, `table`, `details` e `metrics` são a base compartilhada. Isso reduz dependências, mas HTML em strings exige escapar cada texto externo com `esc()`. Não inserir dados de API como HTML confiável. Links de notícias são normalizados no coletor para HTTPS e hosts previstos; preservar `noopener noreferrer` ao abrir outra aba.

## Autenticação e permissões

| Camada | Contrato a preservar |
|---|---|
| Autenticação | HTTP Basic, usuários admin/viewer; senha comparada com `secrets.compare_digest`; ausência ou erro gera 401. |
| Leitura | Páginas e APIs de leitura normalmente dependem de `current_user`. |
| Mutação | `admin` exige usuário admin, cabeçalho específico e origem igual à aplicação quando Origin está presente; falha gera 403. |
| Interface | `isAdmin` mostra ações autorizadas; não substitui a verificação do servidor. |
| Exceção importante | GET `/api/contracts/demo` também usa `admin`; continuar chamando pelo helper de API com cabeçalho. |
| Contratos reais | POST `/api/contracts/import` retorna 409 antes de ler/parsing do corpo. Nenhum novo upload deve contornar esse bloqueio. |
| Recomendação | Aprovar persiste decisão e retorna `external_action: false`; não publica nem altera anúncios. |

A CSP aceita scripts, estilos e demais recursos do próprio domínio, com imagens data quando aplicável. Manter scripts externos e handlers inline fora do runtime. O middleware aplica `Cache-Control: no-store` a todas as respostas, inclusive arquivos estáticos: as fontes locais são um custo de transferência potencialmente recorrente, não uma promessa de cache duradouro. Revisar cache seria uma mudança separada de infraestrutura e segurança.

## Contrato de Oportunidades

GET `/api/strategy?scope=real` usa o último digest público de notícias. O escopo demo passa uma coleção vazia; não há notas fictícias embutidas nesse endpoint. A resposta declara `schema_version: 1.0`, `method: deterministic`, oportunidades e aviso. Não há endpoint de gravação de avaliações estratégicas.

Cada oportunidade já contém título, URL, data de publicação, data do evento, cidades, áreas, confiabilidade da fonte, dimensões social e financeira, interpretações, contraponto, pergunta, próximo passo, exigência de revisão humana, método, incerteza e conflito. Exibir esses campos aproveita capacidade existente; não requer nova chamada a IA ou cálculo no navegador.

`dimension()` exige todos os critérios para emitir uma nota. Critérios usam inteiros entre 0 e 100, referências de evidência existentes, justificativa e `human_confirmed: true`. Se faltar qualquer critério, retorna `score: null`, status de dados insuficientes, lista de ausências, pesos e critérios já confirmados. O denominador não é renormalizado para esconder lacunas. A geração atual passa critérios vazios às duas dimensões, portanto as notas atuais são desconhecidas, não zero.

| Campo | Apresentação compatível |
|---|---|
| social / financial | Duas dimensões independentes; não somar em nota geral. |
| score null | “Dados insuficientes”; não barra de zero, posição em ranking ou estimativa. |
| criteria / weights / missing | Detalhes de metodologia, pesos e lacunas; sem formular edição ou recalcular notas. |
| uncertainty / conflict | Explicitar valor recebido; null em conflito não comprova ausência de conflito. |
| event_date / published | Separar data do evento e publicação; null significa não informado. |
| method / source_reliability | Identificar processo determinístico e limitação da verificação jornalística. |
| human_review_required | Tornar a necessidade de avaliação visível, sem criar ação de aprovação inexistente. |

A leitura anterior de `strategyPanel()` mostrava os dois scores, textos explicativos, contraponto, próximo passo, fonte/publicação e aviso; deixava os demais campos fora da interface. A correção deve apenas expor evidências e limitações recebidas. A inspeção não confirma a execução da correção posterior.

## Decisão e consequências

Preservar frontend nativo e backend estável, conforme [ADR 005](decisions/005-local-design-system.md). React/Next ou biblioteca de componentes exigiriam migração de handlers, autenticação, CSP e testes sem benefício demonstrado para esta alteração. O custo da opção atual é manter disciplina de escaping e helpers pequenos, com testes de DOM/fluxo nos caminhos relevantes.

Verificações a executar após alterações: páginas admin/viewer, escopo real/demo, teclado e menu, mensagens de erro, tema persistido, submissões existentes, 403/409 nas fronteiras e Oportunidades com payloads completo/incompleto. São recomendações de validação, não resultados executados neste documento.
