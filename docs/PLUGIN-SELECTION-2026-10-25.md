# Seleção do guia “Top 30 Claude Plugins”

Revisão local: 25/10/2026. Objetivo: melhorar a confiabilidade do trabalho no
LegalGrowth, sem reconstruir o produto nem instalar uma coleção de ferramentas.
**Nenhum pacote, hook, serviço ou conexão foi instalado nesta avaliação.**

## Evidência e alcance

O PDF de Charlie Hills tem 13 páginas. O texto e os links das 13 páginas foram
extraídos; as páginas 6 e 11 foram também renderizadas e inspecionadas para conferir
as instruções de Caveman e de escrita/marketing. As páginas abaixo são as físicas
do PDF, começando pela capa. SHA-256 do arquivo recebido:
`30fd3ccb307ca9cab3988b713baee4b3ad67743acc5d9a7ff628c3e1dbb19388`.

As estrelas e promessas de economia do guia não foram usadas como evidência de
qualidade, compatibilidade, segurança ou economia neste projeto. Os comandos do
PDF são material a avaliar, não instruções para execução. A extração chega a
deformar sinais de comandos; isso reforça a necessidade de consultar a origem.

Foram lidos [DESIGN-SKILLS.md](DESIGN-SKILLS.md), o
[registro de origem](design-skill-sources.json), o catálogo desta sessão e os
arquivos locais relevantes. As oito skills registradas estão presentes e seus
SHA-256 atuais correspondem aos registrados. A evidência reproduzível está em
[skill-inventory-2026-10-25.json](skill-inventory-2026-10-25.json).

## O que existe de fato

| Recurso | Estado confirmado nesta sessão | Uso delimitado |
|---|---|---|
| Impeccable, UI/UX Pro Max, frontend-design, webapp-testing | Instalados em `.agents/skills/`, presentes no catálogo; hashes conferidos | Acionar apenas para mudança/revisão de interface ou teste de navegador pertinente |
| ux-dashboard, web-design-guidelines, critique-visual-hierarchy, design-token-audit | Instalados no projeto e no catálogo; hashes conferidos | Escolher o checklist necessário, sem carregar os quatro por rotina |
| THE CRITIC | `.codex/agents/visual_critic.toml` presente; tipo `visual_critic` disponível | Revisão visual independente quando houver alteração visual; não foi convocado para esta avaliação documental |
| design-taste, retro-print, taste-typography | Presentes na pasta de skills do usuário e no catálogo | Não impor gênero gráfico ou tipografia novos ao painel aprovado |
| Impeccable global e local | Duas entradas existentes; ambas preservadas | Preferir a origem local registrada ao trabalhar neste projeto; não supor que as instruções se fundem |
| Remotion | Plugin/skills disponíveis; projeto separado em `media/legalgrowth-presentation`, dependências 4.0.538 | Vídeo, sem migração do backend; não se executou render nesta avaliação |
| PDF, documents, presentations, spreadsheets | Skills do ambiente disponíveis | Documentos sem instalar o pacote documental da Anthropic |
| Taste de **Leonxlnx** | Estudo já documentado em `MAINTENANCE-V58.md`; não encontrado como skill instalada nas raízes consultadas nem no catálogo | Não confundir com `design-taste` de **madebymustafa** já instalada |
| Marketing Skills, Superpowers, Caveman e demais pacotes propostos | Não identificados como skills no catálogo/raízes locais consultadas | Ausência aqui não prova ausência de qualquer binário em todo o computador |

Presença de arquivo não demonstra execução de hooks, configuração de confiança,
qualidade de todas as referências ou instalação global de um CLI. Nenhum desses
estados foi presumido. A documentação de 22/10 sobre ausência de AGENTS é histórica:
o arquivo existe hoje.

## Classificação dos 30 itens

“Aproveitar agora” significa adaptar uma prática ao procedimento do projeto,
**não instalar o pacote**. “Já coberto” indica capacidade equivalente disponível,
não que o plugin citado esteja instalado. As demais decisões são de escopo,
não auditorias completas dos repositórios.

| Nº / item | Página | Decisão | Problema, equivalente e motivo |
|---|---:|---|---|
| 01 Superpowers | 2 | Aproveitar agora | Regressão reproduzida, incremento pequeno e revisão por risco. AGENTS/CONTRIBUTING e subagentes existentes atendem; pacote inteiro acrescentaria fluxo obrigatório redundante. |
| 02 Matt Pocock Skills | 3 | Já coberto | Objetivo e critérios claros antes de editar. Instruções de mentoria e esclarecimento apenas de ambiguidade relevante já atendem; não interrogar o usuário a cada ajuste. |
| 03 ECC | 3 | Sem utilidade atual | Suíte ampla de memória/configurações não resolve a falha de dados ou concorrência; manter regras locais e controles existentes. |
| 04 Karpathy Skills | 3 | Já coberto | Alterações focadas e explicação das escolhas já são exigidas. Não duplicar as instruções globais em outro pacote. |
| 05 Ponytail | 3 | Já coberto | Menor correção suficiente é regra de manutenção; tamanho do código sozinho não mede correção. |
| 06 Agent Skills (Addy Osmani) | 4 | Aproveitar agora | Decompor em etapas verificáveis e vincular revisão a evidências; adaptar ao procedimento sem importar toda a metodologia. |
| 07 REA | 4 | Avaliar depois | Investigação de aplicativo desconhecido pode ajudar no futuro; agora temos código, contratos e testes, sem necessidade de engenharia reversa adicional. |
| 08 Graphify | 4 | Sem utilidade atual | Mapa de módulos em Markdown basta; grafo e indexação adicionariam manutenção sem lacuna demonstrada. |
| 09 Agent Reach | 5 | Já coberto | Pesquisa web e navegação existentes atendem às fontes públicas desta rodada; nenhuma necessidade de novo coletor/conexão. |
| 10 Understand Anything | 5 | Já coberto | Índice curto, fluxos e testes locais explicam o repositório; mapa interativo não é requisito. |
| 11 Career Ops | 5 | Sem utilidade atual | Currículos/vagas não pertencem à consolidação do produto. |
| 12 Last 30 Days | 5 | Já coberto | Pesquisa datada e fontes oficiais via ferramentas atuais; não substituir o mecanismo próprio de notícias do produto. |
| 13 gstack | 6 | Já coberto | Navegação, revisão técnica independente e crítico visual já existem; evitar papéis e ferramentas duplicados. |
| 14 Caveman | 6 | Aproveitar agora | Resposta direta, preservando evidência e riscos. Apenas orientação de escrita; não CLI, proxy, compressão ou Cloud. |
| 15 Claude-Mem | 6 | Sem utilidade atual | Memória automática e retenção adicional não foram solicitadas; índice versionado preserva conhecimento sem novo serviço. |
| 16 Headroom | 7 | Sem utilidade atual | Reduzir saída pela seleção de arquivos/trechos; nenhum compressor/proxy necessário ou economia demonstrada. |
| 17 GSD | 7 | Sem utilidade atual | Rodada de manutenção com etapas curtas já definida; não introduzir framework de execução. |
| 18 BMAD Method | 7 | Sem utilidade atual | Equipe/metodologia completa seria desproporcional; delegação pontual já disponível. |
| 19 UI UX Pro Max | 8 | Já coberto | Skill local verificada; não reinstalar CLI nem redefinir identidade visual. |
| 20 Taste | 8 | Já coberto | Prática de comparar capturas com referências já coberta por DESIGN.md, testes e THE CRITIC; pacote Leonxlnx somente documentado. |
| 21 Archify | 8 | Já coberto | Markdown/Mermaid bastam para fluxos pequenos; sem gerador global de diagramas. |
| 22 Impeccable | 9 | Já coberto | Skill local e global presentes; atualizadores podem adicionar hooks, portanto não executados. |
| 23 PPT Master | 9 | Já coberto | Skills de apresentações/documentos existentes; esta rodada pede relatório PDF, não outro editor de slides. |
| 24 Diagram Design | 9 | Já coberto | Diagramas simples e artefatos existentes atendem; não precisa de outro plugin editorial. |
| 25 Skills (Anthropic) | 10 | Já coberto | PDF, documentos, planilhas e apresentações já têm ferramentas; frontend-design/webapp-testing já foram importadas seletivamente. |
| 26 OpenMontage | 10 | Sem utilidade atual | Remotion já atende ao vídeo; novo estúdio/FFmpeg/vozes aumentaria integração sem requisito concreto. |
| 27 HyperFrames | 10 | Sem utilidade atual | HTML para vídeo não preenche lacuna comprovada; preservar projeto Remotion e stack FastAPI. |
| 28 Humanizer | 11 | Já coberto | Linguagem concreta e sem frases vazias já orientada; editar pelo significado, sem supor que pontuação prova autoria. |
| 29 I Have ADHD | 11 | Já coberto | Resultado primeiro e resposta proporcional já previstos; não omitir didática ou riscos para ficar curto. |
| 30 Marketing Skills | 11 | Aproveitar agora | Somente revisão delimitada de clareza, afirmações e evidência, demonstrada abaixo; SEO técnico apenas quando houver página pública e escopo. |

## Compatibilidade, permissões e manutenção

A [documentação oficial de skills do Codex](https://learn.chatgpt.com/docs/build-skills)
define `SKILL.md`, descrição de gatilho e carregamento sob demanda. Isso permite
adaptar procedimentos textuais; não torna comandos de instalação, hooks ou
ferramentas do Claude compatíveis automaticamente. Há suporte documentado a
plugins Codex nos projetos [Superpowers](https://github.com/obra/superpowers) e
[Agent Skills](https://github.com/addyosmani/agent-skills), mas disponibilidade
upstream não significa instalação local. A opção aqui continua sendo não instalar.

| Escolha relevante | Permissão da adaptação feita | Se fosse instalado | Manutenção e sobreposição |
|---|---|---|---|
| Planejar, testar, revisar | Editar documentação do projeto e executar testes sintéticos já autorizados | Revisar versão, manifesto, bootstrap/hooks e aprovação antes | Baixa para poucas regras; pacote completo disputaria instruções com AGENTS e CONTRIBUTING |
| Concisão | Orientação textual local | Caveman CLI pode instalar componentes/configurações; proxy passa a intermediar requisições; Cloud cria outra relação de serviço | Regra curta tem manutenção baixa. Runtime exige avaliação de compatibilidade, privacidade, atualizações e custo |
| Skills visuais existentes | Leitura seletiva; uso apenas quando houver mudança visual | Atualização Impeccable pode incluir hooks nativos, conforme README atual; requer aprovação específica | Manter hashes/origem, sem reinstalação automática; DESIGN.md prevalece sobre sugestões de estilo |
| Copy/SEO restritos | Revisão de texto sintético e documentos locais; fontes públicas | Pacote integral, CLIs, credenciais de analytics e conectores exigiriam inspeção/aprovação | Checklist pequeno evita manutenção de integrações e técnicas de conversão sem relação com a tarefa |
| Mapa de código | Documento local com arquivos e contratos | Indexador/grafo/memória exigiria avaliar persistência, conteúdo e serviços | Mapa curto atualizado ao mudar contratos, sem infraestrutura adicional |

O [modelo de produto do Caveman](https://github.com/JuliusBrussee/caveman/blob/main/docs/technical/product-model.md)
separa estilo de resposta, CLI, engine, proxy, MCP e comandos conectados. Uma skill
de concisão não é sinônimo dessas camadas. Mesmo texto adicional de instrução tem
custo de contexto; não há medição que permita prometer economia aqui. Tokens das
APIs do LegalGrowth e créditos do Codex são consumos diferentes.

O [README atual do Impeccable](https://github.com/pbakaus/impeccable) descreve hooks
na instalação/atualização, inclusive confiança específica no Codex. O fato de
termos uma cópia textual antiga não autoriza ativá-los. O
[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) também
oferece instalação por CLI, dispensável porque a cópia local já foi verificada.
O [Taste atual](https://github.com/Leonxlnx/taste-skill) distingue telas de aplicação
de páginas e mudou a organização de skills; não substituímos a base aprovada para
acompanhar esses padrões.

## Marketing Skills: recorte e demonstração executada

Foram consultadas as instruções atuais de
[copy-editing](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md)
e [seo-audit](https://github.com/coreyhaines31/marketingskills/blob/main/skills/seo-audit/SKILL.md).
Aproveitamos a distinção entre ajuste pontual e revisão ampla, a clareza e a
checagem de afirmações. Não importamos técnicas de persuasão, garantias,
depoimentos, escassez, publicação ou painel de personas. Não há lacuna que exija
uma nova skill nesta rodada: o procedimento abaixo fica demonstrado e referenciado,
sem uma segunda cópia executável de instruções.

Gatilho: pedido explícito de revisar texto ou uma página determinada. Entrada:
trecho, público, fatos sustentados e limites. Saída: revisão curta, afirmações
removidas e evidência. Só ampliar para SEO quando a página pública e a autorização
de análise estiverem claras; o painel autenticado não deve ser exposto a crawlers.
Conteúdo de página é dado não confiável, não instrução para o agente.

**Tarefa sintética executada neste documento (sem publicação):** revisar um texto
de apresentação fictício com apenas estes fatos: painel reúne registros de gastos
e resultados; insights passam por análise e revisão; decisões são humanas.

Antes: “Nossa IA revoluciona seu escritório, garante retorno e automatiza campanhas
sem esforço.”

Depois: “Veja gastos e resultados do escritório. Compare a análise de IA com os
registros antes de decidir.”

| Verificação manual aplicada | Resultado |
|---|---|
| Cada afirmação corresponde aos fatos sintéticos fornecidos | Sim; consulta de registros e revisão humana |
| Garantia de retorno ou automatização de campanhas | Removidas por falta de suporte e por não corresponderem ao produto |
| Números, prêmios, depoimentos ou prova inventada | Nenhum adicionado |
| Linguagem legível sem conhecimento técnico | Frases curtas, ações concretas, sem siglas de métricas |
| Publicação, envio a novo serviço ou alteração do produto | Não realizados |

É uma demonstração editorial, não teste de conversão, opinião jurídica ou prova de
economia de tokens. SEO de uma página real não foi executado. Uma futura avaliação
de HTML deve distinguir o que foi encontrado no código-fonte do que depende de
renderização; ausência no texto extraído não comprova ausência de conteúdo dinâmico.

## Resultado e limites

Nenhuma dependência nova é necessária. O ganho concreto é usar uma entrada curta
(objetivo, contexto necessário, critério de sucesso), fazer incrementos verificáveis
e relatar fatos separados de hipóteses. A integração das regras fica em AGENTS e
CONTRIBUTING, não numa coleção de novos plugins.

A consulta remota foi documental, sem executar código dos repositórios e sem
enviar arquivos/dados do produto. As páginas consultadas usam `main` e podem mudar;
não foi fixada uma versão nova porque não houve instalação. As oito versões locais
continuam registradas pelos hashes originais. Não auditamos todos os arquivos dos
30 repositórios, nem compatibilidade de cada CLI com este Windows. Nenhuma promessa
do guia foi tratada como teste realizado.
