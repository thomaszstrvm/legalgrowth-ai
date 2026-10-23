# A referência como abertura do produto

23/10/2026 — apresentação v44, corrigida na v45. Esta direção substitui a decisão anterior de manter
a galeria depois dos dados: o usuário pediu expressamente que a referência apareça.

## O que foi feito

O Resumo abre com os dossiês. As capas aumentaram de228×304 para276×368px no desktop
e de184×244 para208×278px no celular. O espaçamento, a perspectiva e a inclinação
dos volumes laterais tornam o objeto central mais dominante. As extremidades da
coleção ficam parcialmente enquadradas, preservando a possibilidade de selecionar
todos os destinos pelos controles e teclado.

Um campo tonal com moldura e textura discreta integra a composição. Claro e escuro
mantêm suas próprias cores de papel e tinta; não existe um bloco escuro transplantado
para o tema claro. Os títulos e as gravuras aumentaram junto com os volumes.

O link nativo **Ver resultados** leva diretamente ao cabeçalho dos dados. Todos os
indicadores, filtros, tabelas, formulários e rotas existentes foram preservados.

## Referência e comparação

A [Arc](https://www.arcmarumo.com/) foi examinada novamente no navegador. A captura
do usuário foi preservada em `references/arc-user.png`; a nova observação, em
`references/arc-live.png`, dentro de `output/design-review/opening-v1/`.

Aplicações verificáveis: composição espacial na abertura; objeto central vertical;
vizinhos inclinados e parcialmente cortados; título, objeto e comandos no mesmo
campo visual. O LegalGrowth conserva sua marca, conteúdos, fontes e gravuras.
O efeito de tela foi interpretado com contraste moderado e texto legível, nos dois temas.

## Decisões técnicas

Mover o include Jinja no HTML foi preferível a reordenar com CSS: a ordem visual
agora acompanha a ordem de leitura e de foco. A cena continua fora de `#content`,
que é atualizado pelo JavaScript. Assim, atualização e erros dos dados não recriam
o carrossel nem apagam sua seleção. Nenhum JavaScript de produção foi alterado.

O custo é explícito: os resultados deixam de ocupar a primeira tela. Isso atende
à prioridade visual expressa pelo usuário. O atalho nativo evita exigir rolagem
manual para o uso diário. A alteração é de apresentação; não exige biblioteca,
serviço externo ou alteração de autenticação. Não há mudança de arquitetura que
justifique um ADR.

## Como funciona e entendendo o código

Trecho central de `app/templates/dashboard.html`:

```jinja2
<main id="main" tabindex="-1">
  {% if page == 'overview' %}{% include '_workspace_scene.html' %}{% endif %}
  <!-- O cabeçalho de resultados vem depois da cena. -->
  <header class="page-header" id="results" tabindex="-1">
```

1. `main` identifica o conteúdo principal. `tabindex="-1"` permite que o link de
   salto existente transfira foco para ele sem adicionar uma parada de Tab.
2. O `if` recebe o valor `page` da rota e inclui a cena apenas no Resumo. O include
   renderiza os cinco links existentes. Retirar a condição duplicaria a galeria
   em todos os destinos; movê-la para `#content` a tornaria sujeita às atualizações.
3. O comentário descreve a ordem, sem gerar comportamento.
4. `id="results"` é o destino do link `href="#results"`; `tabindex="-1"` torna o
   destino focável. Remover o id quebra o salto. `scroll-margin-top:20px` evita
   que o cabeçalho encoste na borda superior após a navegação.

Não há retorno de função ou exceção nova: o Jinja produz HTML. Os limites são
visuais: títulos maiores, zoom ou textos novos devem ser testados novamente.

## Testes e validação

- Pytest:113 testes passaram; dois avisos preexistentes de depreciação.
- Cena:10 combinações de largura/tema, de320 a1920px. A capa central e a ação de
  abertura ficam dentro da primeira viewport nas amostras.
-30 capturas das cinco capas selecionadas em1366,390,320px, nos dois temas.
-14 pares de contraste da paleta acima de4,5:1; nenhuma rolagem horizontal da página.
- Link Ver resultados, teclado, Enter, Home/End, foco, movimento reduzido,
  animação de ponteiro, ausência de JavaScript, atualização, erro e recuperação.
- Testes de navegador bloqueiam chamadas externas e mutações; dados demonstrativos.

Matriz geral:88 telas (11páginas,4larguras,2temas) na v44, sem overflow ou erros.
Na v45, a descrição desktop e os nomes de navegação móvel reservam duas linhas.
O teste de cena foi executado novamente e verifica altura estável entre as cinco
seleções.35arquivos Python/JavaScript de produção permanecem idênticos à base.

Capturas e manifesto da primeira rodada em `opening-v1/round1/`; v45 em `final/`.
O comparador HTML tem caminhos locais verificados; não foi aberto automaticamente.
THE CRITIC aprovou a v45,8,4/10 no escopo da abertura. Parecer e limites em
[THE-CRITIC-OPENING-V1.md](THE-CRITIC-OPENING-V1.md).

## Preparação open source

Licença MIT escolhida pelo usuário; LICENSE, CONTRIBUTING.md, SECURITY.md,
THIRD_PARTY_NOTICES.md e docs/README.md criados. README usa prévias sintéticas
locais em docs/images. Fontes mantêm seus avisos OFL. Referências externas de
comparação e instalações locais de skills ficam fora do Git.

Verificados links da documentação principal e exclusões de arquivos sensíveis.
A busca exata pelas credenciais locais configuradas não encontrou correspondência
nos179arquivos candidatos naquele momento. Isso não é auditoria completa de
segredos, histórico ou licenças. Nenhum repositório remoto, commit ou publicação
foi criado. Uma instalação limpa em outro computador ainda não foi validada.

## Conceitos para estudar

Ordem do DOM, foco programático, âncoras, perspectiva CSS, hierarquia visual,
progressive enhancement e testes de geometria no navegador.

## Meu desafio

Compare o efeito de `translateZ` e `rotateY` nas capas vizinhas, alterando apenas
uma propriedade por vez numa cópia de estudo. Explique qual delas muda o tamanho
aparente e qual muda a orientação. Confira depois se o foco continua visível.
