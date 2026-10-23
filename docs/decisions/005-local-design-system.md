# ADR 005 — Sistema visual local com frontend existente

Data: 22/10/2026. Estado: adotado.

## Contexto

O produto já possui APIs, autenticação e proteção de dados em Python. O usuário solicita um redesign corporativo, auditável e sem recriar o sistema. A aplicação não depende de Node para servir suas páginas.

## Decisão

Manter Jinja/HTML, CSS e JavaScript; estabelecer DESIGN.md na raiz como autoridade e docs/DESIGN.md como apontador; usar tokens semânticos nos temas; hospedar Newsreader e Source Sans 3 sob OFL junto aos arquivos estáticos. Skills ficam em .agents/skills como ferramentas de desenvolvimento, com referência e hash, sem execução automática pelo site. Artefatos de testes ficam em output e não entram na distribuição.

## Justificativa

Separar apresentação de regras de negócio reduz risco de regressão e custo operacional. Fonte local evita variação tipográfica e requisições de terceiros. Skills fixadas e verificáveis ajudam a reproduzir decisões sem incorporar ferramentas de agente ao runtime.

## Alternativas

React/Next: componentes com ecossistema maior, mas exigiria migração e build sem necessidade demonstrada. Fonte de sistema: menor download, aparência variável. CDN de fontes: distribuição eficiente, porém acrescenta dependência externa durante o uso. Instalação global das novas skills: menos cópias, mas altera outros projetos e contraria o escopo solicitado.

## Consequências positivas

Backend preservado; nenhum novo serviço pago; regras visuais documentadas; referência de antes/depois; testes reproduzíveis; arquivos estáticos servidos no mesmo domínio.

## Consequências negativas

As duas fontes somam 1.098.004 bytes brutos. O middleware atual envia no-store inclusive nos estáticos, portanto não se deve prometer cache duradouro; compactação/subconjuntos e política de cache exigem trabalho separado. Componentes de string HTML exigem disciplina de escaping nos chamadores. Skills locais aumentam o tamanho do repositório e precisam de atualização deliberada. Auditoria estática e testes automatizados não substituem pesquisa de usabilidade ou testes assistivos reais.


## Atualização — 22/10/2026, rodada de portfólio

A arquitetura permanece. A fonte operacional mudou de Source Sans 3 para Manrope, já disponível localmente, após revisão de legibilidade e identidade. Newsreader permanece editorial. O total bruto carregado passa para 616.364 bytes (redução de 43,86%); o custo de cache descrito acima continua válido. A alternativa era manter Source Sans 3 e ajustar apenas pesos, mas a segunda rodada visual favoreceu Manrope. Nenhuma dependência de frontend foi adicionada.

Por pedido explícito de buscar e usar novas skills, `emil-design-eng` foi instalado globalmente com o instalador oficial e lido durante esta rodada. Isso atualiza o escopo de instalação da decisão original; a skill não integra o runtime. Aplicaram-se acabamento de controles, pressão discreta e movimento reduzido. Referências e limitações estão em [PORTFOLIO-VISUAL-REVIEW.md](../PORTFOLIO-VISUAL-REVIEW.md).
