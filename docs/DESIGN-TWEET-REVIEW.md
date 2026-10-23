# Avaliação das ferramentas citadas no tweet

23/10/2026. Fonte: [post de RoundtableSpace](https://x.com/RoundtableSpace/status/2110255627704455591).
O acesso direto retornou 403; o texto e seus dez links foram lidos na aba do Chrome
indicada pelo usuário. A avaliação abaixo consulta os repositórios públicos, não
trata a promessa promocional de qualidade como resultado demonstrado.

## Triagem

| Repositório | O que foi observado | Decisão para este projeto |
|---|---|---|
| [Superdesign](https://github.com/superdesigndev/superdesign) | README informa que a extensão original é histórica e aponta produto/skill separados | Não instalar a extensão histórica; sem necessidade de outro serviço de design |
| [Better Design](https://github.com/marvkr/better-design) | MCP, sistemas de design e registro shadcn/ui | Não adicionar infraestrutura MCP/componentes para refinar cinco capas existentes |
| [Design Taste](https://github.com/madebymustafa/design-taste) | Skills textuais de direção, tipografia e composição | Selecionadas três orientações, descritas abaixo |
| [Canvas UI](https://github.com/DavidHDev/canvas-ui) | Componentes gráficos sobre HTML com WebGL/WebGPU | Não acrescentar renderizador GPU para arte estática |
| [Paper Shaders](https://github.com/paper-design/shaders) | Shaders canvas, incluindo suporte vanilla | Não necessário: a retícula estática pode ser produzida em SVG |
| [UI Layouts](https://github.com/ui-layouts/uilayouts) | Biblioteca de componentes com Tailwind e motion | Evitar introduzir outra arquitetura de frontend nesta alteração |
| [Hyperiux](https://github.com/Hyperiux-Immersive/Hyperiux) | Página não recuperada pela ferramenta web | Não avaliado nem instalado; não inferir qualidade ou disponibilidade |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Componentes com Motion e Tailwind | A navegação atual já tem transição e redução de movimento; manter comportamento |
| [Cursify](https://github.com/ui-layouts/cursify) | Biblioteca de animações de cursor para React/Next | Cursor decorativo não melhora a composição ou a leitura das capas |
| [Trickle](https://github.com/akaieuan/trickle) | A URL indicada retornou 404 | Não avaliado nem instalado; não substituir por projeto de nome parecido |

Essas conclusões são escolhas locais de adequação, não uma comparação de qualidade
entre bibliotecas. Não houve benchmark, execução de demonstrações baixadas ou
avaliação completa de segurança das bases externas.

## Skills selecionadas e instalação

- [design-taste](https://github.com/madebymustafa/design-taste/blob/main/skills/design-taste/SKILL.md): direção explícita a partir da marca e do público.
- [retro-print](https://github.com/madebymustafa/design-taste/blob/main/skills/retro-print/SKILL.md): relação entre sólidos, negativos e retícula de impressão.
- [taste-typography](https://github.com/madebymustafa/design-taste/blob/main/skills/taste-typography/SKILL.md): hierarquia, escala e legibilidade tipográfica.

A instalação persistente foi inicialmente bloqueada pela revisão automática.
Após autorização explícita do usuário, o instalador oficial do Codex copiou apenas
as três pastas para a instalação local de skills. Cada uma contém um `SKILL.md`;
nenhum script do repositório externo foi executado. Elas ficam disponíveis nas
próximas mensagens. Seus hashes estão no registro local
`output/design-review/opening-v3/skill-hashes.json`.

As skills não são dependências do LegalGrowth e não acompanham o clone. As fontes
públicas estão ligadas acima; o aplicativo continua executando sem esses arquivos.

## Aplicação contextual

A direção escolhida é **coleção de impressos para um produto analítico**, com
composições distintas dentro da identidade LegalGrowth. Newsreader e Manrope,
paletas dos dois temas e links existentes são preservados.

Não foram adotadas regras do preset retrô que conflitam com o briefing: trocar a
paleta inteira por vermelho/azul, impor caixa alta ou monospace, inserir selos e
numeração fictícia, modificar o movimento da galeria. O uso é contextual e fica
restrito à arte das capas e ao seu acabamento tipográfico. Não há promessa de que
instalar uma skill produza automaticamente design excepcional.

Implementação, comparação e verificações: [OPENING-V3.md](OPENING-V3.md).
