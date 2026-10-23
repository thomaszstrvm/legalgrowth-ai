# Coleção editorial: campo gráfico, encadernação e ação

23/10/2026. Evolução da abertura v49. Escopo: apresentação das cinco entradas
existentes. Não há novas funcionalidades, endpoints, dados ou bibliotecas.

## Direção escolhida

Uma coleção de publicações do mesmo editor, apresentada num arquivo digital.
Marca, fontes, cores e rodapé unem a coleção; ocupação, eixo e proporção distinguem
as capas. A arte não representa resultados nem previsões.

O diagnóstico preliminar do THE CRITIC identificou quatro oportunidades:
palco menos parecido com um cartão de dashboard, relação mais deliberada entre
figura e título, materialidade concentrada nas bordas e rodapé menos disperso.
Essas oportunidades eram de direção de arte, não regressões funcionais da v49.

## Referências efetivamente consultadas

| Fonte | Observação e aplicação no projeto |
| --- | --- |
| [Arc Marumo](https://www.arcmarumo.com/) | Visitada no Chrome após carregar. Objetos em perspectiva e variedade gráfica dentro de uma coleção. Aqui: campos mais amplos e acabamento de encadernação, sem copiar textura VHS ou reduzir contraste. |
| [Arquivo Hans Sleutelaar](https://sleutelaar.xyz/) | Visitado individualmente a partir do [Awwwards](https://www.awwwards.com/sites/archive-for-hans-sleutelaar), que o identifica como Honorable Mention em 30/09/2026. Tipografia ocupa o campo gráfico. Aplicação: maior hierarquia para a ação editorial, sem repetir a animação de letras da referência. |
| [Letra Muerta — Contemporáneos](https://letramuerta.nyc/project/contemporaneos-series/) | Estudo de família editorial: elementos estáveis permitem diferentes escalas e ocupações nas capas. |
| [Unit Editions — System Process Form](https://uniteditions.com/products/system-process-form) | Relações modulares produzem variedade dentro do mesmo sistema. Aplicação: campos curvo e angular que alcançam as bordas. |
| [Studio Feixen — Workflow](https://www.studiofeixen.ch/workflow/) | A estrutura física participa da composição. Preservada a dobra de Relatórios como motivo específico dessa capa. |

As interpretações e aplicações são decisões do projeto, não recomendações
expressas pelos autores. Capturas de terceiros ficam em `output/`, ignorado pelo
Git; não são assets do produto nem acompanham o repositório.

## Pesquisa sobre IA e skills

O [artigo LLM Skills indicado pelo usuário](https://llm-skills.com/en/blog/best-ai-skills-front-end-development)
foi relido. A aplicação anterior em validação de campos está em
[LLM-SKILLS-REVIEW.md](LLM-SKILLS-REVIEW.md).

A fonte original [Frontend UI Engineering, de Addy Osmani](https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md)
recomenda estudar referências, registrar um contrato visual, preservar o sistema
do produto e verificar estados reais. Esse processo foi aplicado; seus exemplos
React não justificam substituir FastAPI/Jinja.

[Agents with Taste, de Emil Kowalski](https://emilkowal.ski/ui/agents-with-taste),
defende explicitar o motivo das decisões para orientar agentes. Aqui, o critério
é verificável: volume nas bordas, impressão limpa, ação associada à seleção e
navegação imediata por teclado. A skill local `emil-design-eng` foi estudada como
referência; não foi adicionada uma biblioteca de animação nem instalado um pacote.

A discussão [Website was called generic. How to improve?](https://www.reddit.com/r/webdesign/comments/1twmqmn/website_was_called_generic_how_to_improve/)
foi consultada como opinião de comunidade. Seus comentários sobre repetição de
layouts e falta de imagens específicas motivam examinar a composição, mas não
são evidência objetiva de qualidade nem critério de aprovação.

`design-taste` e `taste-typography`, já instaladas com autorização, orientam a
preservação de uma direção coerente. Nenhuma nova skill foi instalada
persistentemente nesta rodada. O repositório de Leonxlnx foi encontrado na busca;
isso não significa que tenha sido instalado ou integralmente aplicado.

## Antes e depois

| Antes | Depois | Motivo |
| --- | --- | --- |
| Cinco figuras contidas em áreas aproximadamente quadradas | Campanhas e Oportunidades chegam às bordas; Relatórios mantém sua prancha | Criar ritmos diferentes dentro da mesma coleção. |
| Moldura arredondada e contorno interno | Palco com delimitação simples | Dar protagonismo aos objetos sem outra camada de caixa. |
| Volume comunicado principalmente por sombra difusa | Vinco, lombada e pequena aresta lateral | Identificar a publicação com detalhes localizados. |
| Ação pequena e instrução repetida abaixo dos controles | Ação editorial maior e rodapé compacto | Aproximar seleção e abertura sem remover destinos. |

## Decisão técnica e funcionamento

O SVG continua inline e usa `currentColor`. O CSS controla papel e tinta por tema.
Campanhas e Oportunidades têm um campo de 320 × 200; as outras artes mantêm
240 × 240. Assim a variação vem da composição, não de distorcer um desenho
quadrado com `scaleX`. A alternativa seria exportar imagens separadas por tema,
com mais arquivos e risco de divergência.

A macro `dossier_art` é chamada apenas pela galeria. `_chapter_art.html` continua
responsável pelas páginas internas. `scene.js` e o JavaScript de negócio não
mudaram. As capas continuam links HTML; os controles apenas selecionam o destino.

Trecho central da macro, explicado linha por linha:

```jinja2
{% for i in range(6) %}
<path d="M{{ 103+i*26 }} 174C{{ 103+i*26 }} {{ 104+i*10 }} {{ 190+i*16 }} {{ 42+i*21 }} 320 {{ 42+i*21 }}" stroke="currentColor" stroke-width="3"/>
{% endfor %}
```

1. O laço Jinja gera seis curvas no servidor; `i` vai de zero a cinco.
2. Cada `path` começa em `M` e segue uma curva Bézier cúbica `C`: dois pontos de
   controle e um destino. As expressões deslocam esses pontos para formar ecos.
   `currentColor` herda a tinta da capa; a espessura usa unidades do `viewBox`.
3. `endfor` encerra a geração. O navegador recebe SVG pronto, sem cálculos de
   desenho a cada frame ou chamadas externas.

O parâmetro `chapter` seleciona a arte; `class_name` permite aplicar a classe CSS.
A macro devolve marcação HTML/SVG, sem consultar banco ou tratar dados de usuário.
Alterar a quantidade de curvas muda densidade e legibilidade, não uma métrica.
Retirar `currentColor` quebra a adaptação cromática. O limite dessa solução é
exigir inspeção visual quando os pontos, proporções ou tipografia mudarem.

Não houve migração, nova dependência, benchmark pago ou ganho de desempenho
declarado. APIs e dados permanecem fora do escopo visual.

## Evidências

Capturas, fontes congeladas, manifesto e resultados estão em
`output/design-review/opening-v4/`. O comparador reúne antes, depois e referências.
As imagens do README mostram somente dados sintéticos do produto.

O parecer final e os resultados desta rodada são registrados separadamente em
[THE-CRITIC-OPENING-V4.md](THE-CRITIC-OPENING-V4.md). Uma nota não certifica
acessibilidade ou equivalência a um projeto premiado.

## Exercício

Em uma branch local, altere a distância entre os seis ecos de Campanhas sem
mudar a quantidade. Compare 1366 e 320 px nos dois temas e explique por que uma
versão parece mais densa. Preserve a separação entre arte e título. Não altere
os testes para esconder uma colisão.
