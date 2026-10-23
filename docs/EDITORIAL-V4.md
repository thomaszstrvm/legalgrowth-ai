# LegalGrowth — dossiê aberto (v28 → v30)

23/10/2026. Refinamento visual do produto existente; dados sintéticos nas verificações.

## O que mudou

O Resumo desktop deixou de ter uma abertura alta antes dos dados. A identificação,
o período, a origem dos dados e os três indicadores existentes formam uma margem
de leitura. Gráfico, recomendações, campanhas e orçamento começam ao lado.
Na largura de 1366 px, o conteúdo começa a 131 px do topo na nova captura.
O celular mantém a sequência vertical. A galeria de dossiês continua depois da análise.

O estado sem recomendações usa uma linha discreta e ação secundária. Quando há
recomendação, seu conteúdo e o link para leitura continuam em destaque. Nenhuma
ação ou informação foi removida. O orçamento ganhou alinhamento explícito entre
uso, saldo e medidor, dentro da largura disponível.

## Referências comparadas

- [Arc Marumo](https://www.arcmarumo.com/): revisitado e capturado nesta rodada.
  A lição aplicada é uma identidade material contínua. Não reproduzimos CRT, VHS
  ou os assets do site; a metáfora do projeto continua sendo o dossiê.
- [Standards](https://standards.site/): revisitado; a composição tipográfica e
  seus casos levaram à consulta direta da marca Herman Miller.
- [Herman Miller — Composition](https://brandstandards.hermanmiller.com/composition):
  visitados o site público, a seção Composition e Using the grid. A grade relaciona
  informação principal e apoio. Isso orientou contexto lateral e análise no topo.
- [Nova Dental](https://nova-dental-dev.webflow.io/): captura conservada da rodada
  anterior, identificada como tal no comparador. Referência de escala e hierarquia.
- Nexora: imagem enviada pelo usuário. Referência de coerência entre superfícies.

O comparador local está em `output/design-review/editorial-v4/comparison.html`.
Ele oferece antes/depois em quatro telas, dois temas e duas larguras. Capturas
originais de v27 estão em `before/`; v28 de primeira revisão em `round1/`.
Referências são material comparativo, não assets servidos pela aplicação.

## Decisão e trade-offs

Mantivemos os elementos e IDs do cabeçalho e usamos CSS Grid para a composição. Isso preserva
os seletores e a relação usada pelo JavaScript entre `#overview-summary` e seu
`.page-header`. A alternativa de mover elementos via JavaScript aumentaria o
risco de duplicação, foco perdido e diferenças durante carregamento.

A margem ocupa 300 px apenas a partir de 1181 px. Abaixo disso, voltar ao fluxo
vertical preserva espaço para tabelas e gráficos. Há uma mudança deliberada de
composição nesse limite, coberta por teste de 1180 e 1181 px. A opção não tenta
encaixar três colunas estreitas num tablet. `display:contents` é aplicado somente
ao wrapper sem semântica do título; o h1 e a descrição continuam no documento.

As cores vêm dos tokens existentes (`--soft`, `--line`, `--accent`, `--control`).
Por isso cada tema continua no seu campo cromático. Não há biblioteca nova,
chamada externa, alteração de segurança, cálculo ou armazenamento. O custo de
manutenção é mais um bloco de CSS específico do Resumo; não criamos outro sistema
de componentes ou tema paralelo. Não é uma decisão arquitetural que exija ADR.

## Entendendo o código

O trecho central em `app/static/arc.css` é uma regra de layout, não uma função:

```css
body[data-page=overview] main {
  display:grid;
  grid-template-columns:300px minmax(0,1fr);
  column-gap:40px;
  align-items:start;
}
```

1. O seletor limita a composição ao Resumo. Sem ele, formulários de outras telas
   receberiam uma grade que não foi projetada para seu conteúdo.
2. `display:grid` permite posicionar os filhos sem alterar o HTML nem o JavaScript.
3. `300px` reserva a margem; `minmax(0,1fr)` deixa a análise ocupar o restante,
   permitindo que ela encolha sem a largura intrínseca de tabelas ampliar a página.
4. `column-gap:40px` separa contexto e análise com espaço, sem uma caixa extra.
5. `align-items:start` impede que a margem estique até a altura de todo o conteúdo.

As regras seguintes posicionam cabeçalho na primeira coluna e conteúdo na segunda;
galeria e rodapé ocupam ambas. A media query aplica tudo somente no desktop amplo.
CSS não possui parâmetros, retornos ou exceções nesse trecho: o navegador calcula
a geometria conforme o viewport e a cascata. Remover o limite de largura prejudicaria
o celular. Remover `minmax(0,1fr)` pode permitir que conteúdo largo expanda a grade.

## Testes executados

- Python: 113 testes passaram; dois avisos de depreciação existentes (Starlette/httpx
  e pypdf). Nenhum benchmark pago.
- Matriz visual: 88 capturas, 11 telas × 4 larguras × 2 temas; mais 22 capturas em
  320 px. Sem overflow de documento ou erros de console nessa execução.
- Estados sintéticos: 16 capturas, incluindo recomendação preenchida e valor
  monetário de R$ 1.234.567,89; leitura e ações verificadas.
- Galeria: teclado, movimento reduzido, ausência de JavaScript, retry, cinco
  destinos e coerência cromática nos dois temas; 14 pares de contraste ≥ 4,5:1.
- Interações: menu/Escape, skip link, tabela por teclado, retenção de formulário,
  retry simulado, datas, eixo zero e exportações; 32 pares de contraste ≥ 4,5:1.
- Grade e filtros: 14 combinações em 1180, 1181, 1366, 1920, 768, 390 e 320 px,
  dois temas, datas aplicadas/retidas e estado vazio desktop. O filtro Área é
  intencionalmente exclusivo de Campanhas; o teste respeita essa regra.
  Também verifica altura do apoio de configuração e do estado vazio para detectar
  espaço vertical excessivo, além de simples overflow horizontal.
- Comparador: 16 combinações, imagens carregadas, reflow móvel e zero requisições
  externas. As referências aparecem em capturas locais.
- Preservação: hashes dos 35 arquivos de lógica Python/JS iguais à base registrada.
  Os IDs do template também foram comparados: todos preservados, sem duplicações,
  e a relação entre cabeçalho e indicadores foi mantida.

Essas verificações cobrem os estados descritos, não todas as combinações possíveis
de dados. Capturas estáticas não demonstram motion; a verificação de interação é
separada. A nota do crítico é julgamento qualitativo, não certificação de portfólio.

## Conceitos para estudar e exercício

Estude CSS Grid, largura intrínseca, media queries, tokens de tema e diferença
entre ordem visual e ordem do documento. Exercício: em uma cópia de estudo,
troque `minmax(0,1fr)` por `1fr`, insira um texto sem espaços numa coluna e explique
por que o comportamento pode mudar. Não aplique o experimento ao produto entregue.

## Revisão independente e correções v29

Primeira rodada: agente permanente `visual_critic`, contexto independente,
**8,0/10 — APROVADO COM RESSALVAS**. O parecer reconhece avanço de composição,
mas critica a síntese subordinada aos filtros e o espaço do estado vazio móvel.
O número não é normalizado contra as notas anteriores; o argumento orientou as correções.

Na v29, `#overview-summary` foi colocado antes de `.page-context` no HTML, ainda
dentro do mesmo cabeçalho. Assim, a ordem de leitura dos resultados acompanha
a apresentação sem mover elementos por JavaScript. No desktop, contatos e
contratações usam linhas completas com número à direita, em vez de duas células
estreitas. Os rótulos deixaram de quebrar artificialmente. Os filtros permanecem
imediatamente abaixo e o aviso de dados demonstrativos continua visível.

O estado vazio tem menos espaço interno em telas menores; entre 601 e 900 px,
mensagem e atualização compartilham a faixa. A configuração de IA usa flex wrap,
sem recuo isolado do link. Conteúdo preenchido mantém espaço de leitura.

Foi mantida a distinção tipográfica entre síntese e operação: nomes de campanha
no Resumo são títulos editoriais; na tela operacional são itens de uma tabela
com mais colunas. Isso é uma decisão de densidade, não uma família diferente de marca.

O crítico identificou uma falha no primeiro pacote de evidências: capturas gerais
de 320 px eram antigas. Não foram usadas como prova da v28. O limite foi registrado
em `round1/evidence-limit.json`. O pacote `final/` foi regenerado em todas as cinco
larguras após as correções. Não se atribui à v29 nenhum screenshot antigo.

Parecer integral da primeira rodada: `docs/THE-CRITIC-EDITORIAL-V4-ROUND1.md`.
A reavaliação considera novas evidências congeladas da v29.

Antes do parecer final, a inspeção visual identificou uma regra móvel herdada
de `flex-direction:column`. Com o novo `flex-basis` do texto, ela reservava altura
em vez de largura. A tentativa de segunda revisão foi interrompida sem parecer;
explicitamos `flex-direction:row`, adicionamos a verificação de altura e geramos
novamente todas as capturas do Resumo e os estados sintéticos. O manifesto final
registra essa sequência; a revisão final foi reiniciada sobre o pacote corrigido.

### Parecer final e ajuste localizado v30

THE CRITIC reavaliou a v29: **8,5/10 — APROVADO COM RESSALVAS**. Confirmou a
resolução dos seis pontos anteriores e não encontrou falha crítica, alta ou média
restante. Identificou uma pendência baixa: título do gráfico e link de exploração
quebravam simultaneamente em 1181 px. Parecer integral preservado, sem editar nota:
`docs/THE-CRITIC-EDITORIAL-V4-FINAL.md`.

A v30 corrige esse ponto com uma regra entre 1181 e 1320 px: link abaixo do título,
alinhado ao mesmo eixo, sem diminuir a fonte. O teste de layout foi reexecutado nas
14 combinações e verifica explicitamente a posição do link. Capturas corrigidas:
`output/design-review/editorial-v4/edge-corrected-light-1181.png` e a variante dark.
Esse ajuste foi inspecionado pelo implementador; **não recebeu nova nota do crítico**.
O pacote `final/` continua congelado na v29 efetivamente revisada, e o manifesto
`delivered-manifest.json` identifica a v30 entregue. Nos tamanhos 1366 e 390 do
comparador, a regra localizada não altera a composição mostrada.

Permanecem como trade-offs, não falhas comprovadas, a mudança de composição no
breakpoint e o espaço da galeria de navegação complementar. A utilidade desse
acesso adicional exige observação de usuários. A nota final continua abaixo da
expectativa de excepcionalidade pedida; os testes não substituem essa avaliação.
