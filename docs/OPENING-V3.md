# Gravuras e impressão nas capas

23/10/2026 — v48, corrigida na v49. Continuidade da v47, sem novas funcionalidades.

## Direção e comparação

O objetivo é uma coleção gráfica reconhecível no portfólio, dentro de um produto
analítico que continua legível. A Arc foi reaberta no Chrome, e sua composição foi
registrada após o carregamento. A v47 já tinha palco espacial e capas grandes;
faltava maior variedade na linguagem das figuras.

Na v48, Campanhas utiliza um quarto de círculo escavado em uma matriz de tinta,
com ecos curvos e pontos locais. Relatórios mostra uma faixa dobrada sobre uma
prancha de tinta invertida. Insights troca a forma em H por uma lente oblíqua
interrompida por um corte. Orçamento e Oportunidades conservam suas figuras.

O princípio tomado da [Arc](https://www.arcmarumo.com/) é a autonomia gráfica de
cada capa dentro de uma coleção. Não foram copiados fotografia, textura de VHS,
logo ou código da referência. A aplicação continua usando arte SVG original.

Newsreader e Manrope permanecem. Os títulos usam peso 400; a assinatura pequena
ganhou 11 px, peso 600 e espaçamento entre letras. Tinta, papel e superfícies
continuam ligados aos dois temas existentes. Não foi aplicado um preset de
landing page sobre tabelas, relatórios ou configurações.

O estudo do tweet e das três skills instaladas está em
[DESIGN-TWEET-REVIEW.md](DESIGN-TWEET-REVIEW.md). As skills orientam o trabalho;
não são dependências de execução do aplicativo.

## Decisão técnica: separar tinta e recorte

A prancha de Relatórios precisa inverter figura e fundo sem reescrever a arte.
O SVG herda a tinta com `currentColor`, enquanto os recortes usam uma variável
opcional `--cutout`. Essa abordagem mantém uma única versão do desenho e evita
duplicar assets claro/escuro. A alternativa seria manter dois SVGs, que poderiam
divergir quando editados.

Trecho real do desenho de Relatórios:

```html
<path d="M72 120L216 66M28 212L172 158"
      stroke="var(--cutout,var(--paper))" stroke-width="3"/>
```

- `path` define dois segmentos no sistema de coordenadas do SVG.
- `M72 120` posiciona o primeiro ponto; `L216 66` traça uma linha até o segundo.
- O segundo `M` começa outro segmento, sem ligar os dois por acidente.
- `stroke` define a cor da linha. Se `--cutout` existir, ela será usada; caso
  contrário, o fallback é a cor de papel da própria capa.
- `stroke-width="3"` define a espessura nas coordenadas do desenho, que escala
  junto com a capa.

No CSS da prancha, `background:var(--print)` põe a tinta no fundo,
`color:var(--paper)` faz a figura usar papel, e `--cutout:var(--print)` recorta
linhas com a mesma tinta do fundo. Sem a última declaração, os cortes teriam a
cor da figura e perderiam sua função. Nas demais capas, o fallback mantém o
comportamento anterior. Não existem novas entradas de usuário ou chamadas de API.

## Arquivos e manutenção

- `app/templates/_dossier_art.html`: composições SVG das capas.
- `app/static/arc.css`: prancha invertida e acabamento tipográfico.
- `app/templates/dashboard.html`: versão do CSS para renovação de cache.
- `_chapter_art.html` e o JavaScript funcional permanecem separados e preservados.

Gravuras não representam dados, previsões ou resultados. O conteúdo operacional
continua fora da arte. O custo é uma pequena quantidade de caminhos SVG adicionais;
nenhum canvas, shader, React ou runtime externo foi acrescentado. Não foi medido
ganho de desempenho ou Core Web Vitals.

## Evidências e validação

Comparador local: `output/design-review/opening-v3/comparison.html`, com v47 em
`before/`, v48 em `round1/`, v49 em `final/` e referência atual em `references/arc-current.png`.
Seletores permitem comparar abertura e cinco capas, temas e larguras 1366/390.
As imagens da referência ficam na pasta local ignorada pelo Git.

A v48 passou em 113 testes Python, com dois avisos preexistentes de descontinuação
(Starlette/httpx e pypdf). O teste visual da cena passou em dez combinações de
largura/tema, trinta seleções de capa, limites de texto, teclado, foco, redução de
movimento, atualização/falha/recuperação e navegação sem JavaScript. Quatorze pares
de contraste atingiram 4,5:1. Sem erro JavaScript ou escrita de dados nesse teste;
requisições externas foram bloqueadas. Os desenhos passaram em renderização Jinja
e parse XML.

O servidor local estava desligado no primeiro teste de navegador. Foi reiniciado
em `127.0.0.1:8000`, e a execução subsequente passou. Não houve recriação do banco,
semente de dados nova ou alteração de credenciais.

A inspeção independente está registrada em [THE-CRITIC-OPENING-V3.md](THE-CRITIC-OPENING-V3.md).
A primeira rodada recebeu 8,8/10, aprovada com ressalvas. O crítico confirmou maior
variedade de composição, mas apontou a proximidade entre gravura e título em
Campanhas. A v49 reduz a largura da arte de 79% para 75% e desloca sua origem de
10% para 12%, mantendo seu centro horizontal em 49,5% da capa. O título e a legenda
permanecem nas mesmas posições. O teste da cena passou a medir também o intervalo
entre a caixa de tinta do SVG e a caixa do título, para detectar essa regressão.

Uma verificação adicional da v49 cobriu Resumo, Configurações e Relatórios em
1366/390, claro/escuro: 12 capturas, sem overflow, erro JavaScript ou escrita.
Os 35 arquivos Python/JavaScript de lógica da linha de base permanecem idênticos.
O teste completo da cena v49 também passou. O intervalo registrado entre a tinta
e a caixa de título de Campanhas foi 11,93 px em 1366 e 9,77 px em 390/320, nos
dois temas. Essas medidas verificam separação geométrica; o julgamento óptico
permanece parte da revisão das capturas.

Prévia clara e escura do README atualizadas para v49. O comparador foi validado
quanto a JavaScript, caminhos e combinações, mas sua própria renderização em
navegador não foi inspecionada nesta rodada.
Capturas e cálculos não substituem teste com usuários, auditoria completa de
acessibilidade ou avaliação em outros motores de navegador.

## Meu desafio

A reavaliação da v49 recebeu **8,9/10**, aprovada no escopo de abertura e capas.
O crítico examinou 22 novas capturas, encerrou o achado de Campanhas e não
identificou nova regressão. A meta posterior do usuário de 9,9 não foi atingida.
Não se deve tratar essa avaliação como garantia de qualidade de portfólio.

Em uma cópia para estudo, remova apenas `--cutout` da regra CSS de Relatórios.
Antes de abrir o navegador, explique qual cor as linhas passarão a usar e por quê.
Depois confira nos dois temas e restaure a declaração. Estude herança de custom
properties, fallback de `var()` e diferença entre `color`, `fill` e `stroke`.
