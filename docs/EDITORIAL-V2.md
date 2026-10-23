# Identidade editorial aplicada ao produto

23/10/2026. Versão final v25, continuação da v22, sem novos fluxos, cálculos ou integrações.

## O que mudou

A identidade deixou de aparecer apenas na galeria: cada área usa no cabeçalho
uma gravura também presente em seu dossiê. As gravuras são SVG originais,
gerados no template, sem imagens de terceiros, WebGL ou bibliotecas adicionais.

- Resumo/Campanhas: variação do monograma existente com linhas de impressão.
- Orçamento: folha de livro-caixa, sem números ou resultados ilustrativos.
- Relatórios/Contratos: folhas curvas sobrepostas.
- Insights/Recomendações: duas estruturas sobrepostas, representando revisão.
- Oportunidades/Notícias/Indicadores: percurso e linhas topográficas abstratas.
- Configurações: estrutura geométrica concêntrica.

Títulos e descrições agora formam um grupo. Os indicadores do Resumo e de
Campanhas usam uma composição aberta, com escala tipográfica diferente para o
valor monetário. A fonte do valor responde à largura da própria coluna, inclusive
nos testes de valor longo. No celular, a primeira métrica ocupa toda a linha.
As demais informações e sua ordem funcional foram mantidas.

As capas ganharam as mesmas gravuras e uma assinatura mais discreta. Os cabeçalhos
usam variantes ópticas: menos linhas e traços mais espessos para sobreviver à
redução, preservando a silhueta. A lombada
mantém apenas a marca redundante. Títulos frontais e rótulos acessíveis identificam
os destinos; nenhuma informação essencial depende da lombada.

Quando há recomendação, o link "Ver recomendação" recebe o destaque principal.
O botão "Atualizar recomendações" fica secundário. Quando não há recomendação,
atualizar continua sendo a ação principal. Isso é feito com CSS `:has(.rec)`,
sem mudar condições, handlers, rotas, permissões ou chamadas de API.

## Referências e comparação

As páginas abaixo foram reabertas no navegador nesta rodada. As capturas estão
em `output/design-review/editorial-v2/references/`.

| Referência | Observação | Decisão aplicada |
|---|---|---|
| [Arc Marumo](https://www.arcmarumo.com/) | Objetos, identidade e ambiente seguem uma linguagem compartilhada | Reutilizar gravuras entre capítulos e dossiês; manter perspectiva e interação já existentes |
| [Standards](https://standards.site/) | Composição contida, grade clara, marca presente sem excesso de efeitos | Remover a caixa de indicadores e trabalhar com escala e alinhamento |
| [Nova Dental](https://nova-dental-dev.webflow.io/) | Forte diferença de escala entre mensagem principal e apoio | Diferenciar os valores e as legendas; não transplantar fotografia ou hero promocional para uma ferramenta de trabalho |
| Nexora, imagem do usuário | Planos claros e organização legível | Preservar superfícies coerentes em cada tema |

Essas observações não significam equivalência estética ou funcional com as
referências. Alguns recursos de mídia de Standards não carregaram. Não foi
copiado código, fotografia, texto promocional ou marca das referências.

O comparador local `output/design-review/editorial-v2/comparison.html` reúne as
referências, antes e depois. Os conjuntos demonstrativos de 22 e 23/10 diferem em
recomendações; a diferença de conteúdo não deve ser atribuída à composição.

## Decisão técnica

`app/templates/_chapter_art.html` concentra a macro Jinja `chapter_art`. Tanto
`dashboard.html` quanto `_workspace_scene.html` a importam. O primeiro pede
`compact=true`; a capa usa a variante detalhada padrão. Isso evita duplicar
os desenhos e permite corrigir uma gravura nos dois lugares simultaneamente.

Alternativas: copiar SVG em cada template facilitaria a primeira edição, mas
criaria divergência; gerar os desenhos por JavaScript acrescentaria trabalho no
cliente e dependeria de execução para conteúdo estático. A macro usa apenas o
identificador de página já existente e nomes de classes constantes.

Os SVG são decorativos, com `aria-hidden="true"` e `focusable="false"`. Não
alteram a árvore de tarefas nem acrescentam paradas de teclado. Os dados continuam
no HTML funcional existente. As cores usam `currentColor`, portanto o mesmo desenho
acompanha os tokens de cada tema. Não há nova preferência de tema ou pedido externo.

O custo é um pouco mais de marcação SVG no HTML e a necessidade de verificar
as formas em tamanhos pequenos. Não foi medido ganho ou perda de desempenho real.
O CSS continua usando a cascata existente de `style.css` seguido de `arc.css`.

## Entendendo o código

Trecho central da macro, simplificado à ramificação de folhas:

```jinja2
{% macro chapter_art(chapter, class_name, compact=false) -%}
<svg class="{{ class_name }}" viewBox="0 0 200 160"
     fill="none" aria-hidden="true" focusable="false">
  {% if chapter in ['reports','contracts'] %}
    {% for i in range(10) %}
      {# cada caminho desloca uma folha dentro do mesmo espaço de desenho #}
    {% endfor %}
  {% endif %}
</svg>
{%- endmacro %}
```

1. `macro` define uma função de template; `chapter` seleciona a gravura,
   `class_name` define seu contexto visual, como `chapter-art` ou `dossier-art`,
   e `compact` seleciona a versão simplificada (omitida do trecho acima).
2. `viewBox` cria coordenadas internas independentes do tamanho em pixels. O CSS
   pode mostrar o mesmo desenho em 42px ou no espaço maior da capa.
3. `fill="none"` deixa as formas sem preenchimento por padrão. Os caminhos
   usam `stroke="currentColor"` para herdar a tinta apropriada ao tema.
4. Os atributos de acessibilidade evitam anunciar uma ilustração redundante
   como conteúdo ou controle. O título de página e o link da capa permanecem.
5. A condição seleciona o mesmo desenho para as duas áreas relacionadas.
6. O laço gera dez caminhos com deslocamentos calculados. No arquivo real, `i`
   altera coordenadas; não usa métricas nem dados financeiros.
7. A macro devolve marcação HTML/SVG ao template chamador. Não há requisições
   de rede ou acesso ao banco. Um erro de sintaxe interromperia a renderização;
   por isso os templates foram renderizados localmente e as onze telas testadas.

A primeira verificação detectou um literal `.8` inválido em uma expressão Jinja.
Foi corrigido para `0.8` antes das capturas aprovadas. Não se modificou o servidor
ou a política de segurança para contornar o erro.

O primeiro parecer está em `THE-CRITIC-EDITORIAL-V2-ROUND1.md`: 8,4/10,
aprovado com ressalvas. Confirmou evolução além da ornamentação, mas apontou
traços móveis fracos e prioridade visual invertida nas ações da recomendação.
Ambos foram corrigidos na v24; o tracking do valor principal também foi aliviado.
A nota não é comparável a um benchmark e não será elevada por solicitação.

O parecer final `THE-CRITIC-EDITORIAL-V2-FINAL.md` avaliou a v24: 8,7/10,
aprovado com ressalvas. Confirmou as duas correções, o tracking e a consistência
do escuro. Não classificou o produto como excepcional. Identificou uma diferença
de altura entre os dois controles da galeria em 320px. A v25 corrige apenas isso
com `align-self:stretch`; o teste da cena foi repetido e agora verifica alturas
iguais nos dois temas. Essa pequena correção posterior não recebeu uma terceira
revisão independente. As capturas v24 revisadas permanecem preservadas em `final/`;
as v25 ficam em `post-review/`.

Sobre a primazia do investimento: o Resumo existente se apresenta como acompanhamento
do investimento e dos resultados e começa pelo gasto. Foi mantida essa ordem; o
campo monetário recebe mais largura por conter moeda e casas decimais. A escala
maior é uma decisão visual atual, não evidência de que gasto importe mais que
contatos ou contratações. Essa prioridade de produto não foi validada em pesquisa
com usuários e não é tratada como conclusão de desempenho da campanha.

## Testes e limites

- 113 testes Python passaram; duas advertências de depreciação existentes.
- Matriz v24: 88 capturas, 11 telas, quatro larguras, ambos os temas, sem
  transbordamento horizontal ou erros de console.
- Galeria, repetida após o ajuste v25: teclado, seleção, links sem JS, movimento
  reduzido, foco, hover, atualização e recuperação; dez combinações, incluindo
  320px, com igualdade de altura dos controles quando o rótulo quebra.
- Interações: formulários, manutenção dos campos após erro, downloads, gráfico,
  menu e 32 pares de contraste. Nenhuma mutação real.
- Despesas: 12 capturas, estados vazio e três registros, temas claro/escuro;
  descrição inteira no celular e semântica de tabela preservadas no Edge.
- Estados adicionais: 16 capturas com recomendação sintética e valor de
  R$ 1.234.567,89; quatro larguras e dois temas, sem transbordamento da métrica.
  Na v24, também verificam a diferença visual entre ler e atualizar recomendação.
- Estado vazio, ciclo de atualização dos indicadores e nome extenso de campanha
  também passaram nas verificações existentes.
- 35 arquivos Python/JavaScript da aplicação comparados por SHA-256: inalterados.

Não foram usados dados reais de clientes nem chamadas pagas de IA. Esses testes
não provam excelência estética, usabilidade em campo ou acessibilidade completa.
A avaliação do THE CRITIC fica em parecer separado, com suas evidências e limites.

## Conceitos para estudar e desafio

Estude macros Jinja, reutilização de componentes, coordenadas SVG, `currentColor`
e unidades de consulta de contêiner (`cqi`). Exercício: explique por que usar
`vw` no tamanho de uma métrica pode falhar quando a janela é larga, mas a coluna
é estreita. Depois proponha um caso de teste que diferencie `vw` de `cqi`.
