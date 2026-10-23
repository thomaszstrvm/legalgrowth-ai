# Capas como peças gráficas

23/10/2026 — v46, corrigida na v47. Evolução da abertura v45; funcionalidades preservadas.

## O que mudou

As cinco capas deixaram a estrutura repetida de título, ícone central e legenda.
Campanhas usa uma gravura de L acima do título; Orçamento combina planos opostos;
Relatórios trabalha uma dobra diagonal; Insights de IA usa composição tipográfica
assimétrica; Oportunidades emprega uma sequência de caminhos angulares. São formas
abstratas de identidade, não gráficos de dados nem indicadores de desempenho.

Uma linha de impressão, o logotipo, as fontes e as paletas conectam as peças.
O tamanho dos dossiês, a posição da galeria na abertura, a navegação por teclado,
os destinos, a alternância de temas e o acesso **Ver resultados** permanecem iguais.

## Comparação com a referência

A [Arc Marumo](https://www.arcmarumo.com/) foi aberta novamente no navegador nesta
rodada. Na captura atual, cada caixa apresenta um cartaz com escala tipográfica e
imagem dominantes. A v45 já reproduzia o princípio espacial, mas suas ilustrações
pequenas e repetidas tinham menos presença que os cartazes da referência.

A interpretação atual aumenta o peso gráfico e diferencia as composições dentro
de uma coleção. Não reproduz a arte, marca, fotografias ou desgaste de VHS da Arc.
O LegalGrowth conserva superfícies legíveis e paletas próprias nos dois temas.
Isso estabelece uma direção distinta; não constitui equivalência artística com
a referência nem garantia de resultado em seleção de portfólio.

Comparação local: `output/design-review/opening-v2/comparison.html`.
Ela permite escolher primeira tela ou cada capa, tema claro/escuro e largura
1366/390. `before/` conserva a v45; `round1/` registra a v46 e `final/` a v47.
`references/arc-current.png` é a observação atual; `arc-user.png` é a imagem enviada
pelo usuário. Referências externas ficam em `output/`, ignorado pelo Git; as prévias
próprias em `docs/images/` podem acompanhar o repositório MIT.

## Decisões técnicas

**Arte das capas separada dos cabeçalhos.** A nova macro
`app/templates/_dossier_art.html` serve apenas à coleção. Alterar a macro de capítulos
existente também mudaria outras telas. A separação custa um arquivo pequeno e evita
esse acoplamento. Não há nova biblioteca, imagem remota ou requisição de rede.

**SVG em vez de imagens rasterizadas.** Contornos e sólidos permanecem nítidos em
tamanhos diferentes. `currentColor` herda a tinta do tema; `var(--paper)` recorta
partes usando a cor do papel. A limitação é uma linguagem geométrica, sem a
materialidade fotográfica das caixas de referência. Poucos caminhos e repetições
curtas evitam filtros e animações de arte desnecessárias.

**Composição relativa à capa.** Percentuais posicionam os elementos dentro de um
formato fixo; `cqi` dimensiona a tipografia pela largura desse formato. É adequado
à arte decorativa controlada, mas não deve ser aplicado aos relatórios, que precisam
de fluxo livre para conteúdo variável. Títulos novos ou traduzidos exigem revisão
de encaixe. A renderização foi verificada no Edge; outros motores não foram testados.

**Segurança e manutenção.** A capa é decorativa (`aria-hidden`) dentro de um link
nativo com nome acessível. Nenhum dado de cliente foi acrescentado à arte. Backend,
rotas, JavaScript funcional, autenticação e integrações não foram alterados.

## Entendendo o código

O início da macro em `_dossier_art.html` contém este trecho real:

```jinja
{% macro dossier_art(chapter, class_name='dossier-art') -%}
<svg class="{{ class_name }}" viewBox="0 0 240 240" fill="none" aria-hidden="true" focusable="false">
  {% if chapter in ['overview', 'campaigns'] %}
  <path d="M26 14H94V150H222V218H26Z" fill="currentColor"/>
  <path d="M111 14V132H222" stroke="currentColor" stroke-width="5"/>
  {% for i in range(8) %}
  <path d="M{{ 124+i*9 }} 14V{{ 118-i*9 }}H222" stroke="currentColor" stroke-width="2"/>
  {% endfor %}
```

1. `macro` define uma função de template que produz HTML. Recebe o capítulo e uma
   classe opcional; não busca dados nem modifica o banco.
2. `viewBox` define a área de desenho de 240×240 unidades. O CSS escolhe o tamanho
   visível. Os atributos finais mantêm a arte fora do foco e da leitura assistiva.
3. `if` escolhe a composição de Campanhas; as demais ramificações ficam no arquivo.
4. `path` desenha o L sólido. `M` move o ponto, `H` e `V` traçam linhas horizontais
   e verticais, `Z` fecha o contorno. A tinta vem de `currentColor`.
5. O segundo caminho cria o primeiro eco, com traço mais espesso.
6. `range(8)` repete os próximos comandos oito vezes, com índices de 0 a 7.
7. A cada índice, a coluna avança nove unidades e a altura do canto diminui nove.
   Isso produz um ritmo geométrico sem oito linhas de código duplicadas.
8. `endfor` encerra a repetição. Remover o fechamento causaria erro de template;
   alterar o passo muda a retícula e pode fazê-la ultrapassar a área de desenho.

O restante da macro fecha as condições e o SVG. Um capítulo desconhecido usa a
composição de fallback. Não há exceção de domínio: erros de sintaxe são detectados
ao compilar/renderizar o template. `_workspace_scene.html` chama a macro uma vez
por destino; `arc.css` define as composições e `scene.js` mantém a seleção existente.

## Verificação

Primeira rodada v46: 113 testes Python passaram, com dois avisos de descontinuação
preexistentes (Starlette/httpx e pypdf). `browser-scene.cjs` passou por dez combinações
de largura/tema (1920, 1366, 768, 390 e 320), trinta seleções de capa, foco, teclado,
movimento reduzido, navegação sem JavaScript, falha/recuperação e atualização de dados.
Quatorze pares de cores alcançaram 4,5:1 no cálculo do teste. Não houve erro JavaScript
nem escrita de dados no teste da galeria; requisições externas foram bloqueadas.

Na matriz geral da v46, 88 capturas cobriram 11 páginas, quatro larguras e os dois
temas, sem overflow, erros JavaScript ou escritas de dados. Os 35 arquivos Python/JS
da linha de base continuaram com os mesmos hashes; a mudança permanece visual.

O THE CRITIC avaliou a v46 em **8,7/10, aprovado com ressalvas**. Identificou a
tangência entre A e gravura em IA (média) e pouco espaço acima da legenda de Orçamento
(baixa). A v47 reduziu e reposicionou a gravura de IA, reservou margem direita e
ajustou a escala das iniciais. Em Orçamento, a arte foi reduzida e elevada.

A textura horizontal do palco também foi removida: a referência foi aproveitada
na composição e na presença das capas, enquanto o acabamento agora acompanha a
metáfora de impressão. Essa remoção é uma escolha do implementador; o crítico a
apresentou como opção estética, não como defeito obrigatório.

A reavaliação final é registrada em [THE-CRITIC-OPENING-V2.md](THE-CRITIC-OPENING-V2.md).
O parecer final foi **8,8/10, aprovado no escopo da abertura**: os dois achados
foram encerrados, sem nova correção visual obrigatória nas 32 imagens examinadas.
O crítico não testou animação em movimento nem validou usabilidade com pessoas.
Na v47, o teste completo da cena foi repetido com as novas capturas e passou.
Foram adicionadas verificações de texto dentro da capa e separação entre título
e legenda nas trinta seleções. As prévias do README foram substituídas pela v47.
O comparador teve sintaxe, combinações e caminhos de imagens verificados; seu
layout próprio não foi renderizado no navegador nesta rodada.
Não houve benchmark pago ou teste com dados reais. Capturas não comprovam usabilidade
com usuários, acessibilidade integral ou desempenho em outros dispositivos.

## Para estudar e praticar

Estude macros Jinja, coordenadas SVG, herança CSS, unidades relativas a containers
e diferença entre arte decorativa e nome acessível de um link.

**Desafio:** em uma cópia de estudo da macro, reduza a retícula de Campanhas de oito
para seis linhas, preservando sua extensão total. Explique quais valores precisaram
mudar e confira se a arte continua legível na capa de 208 pixels. Não altere os
nomes acessíveis, destinos ou cores para resolver o exercício.
