# Coerência dos temas e leitura de despesas

22/10/2026. Escopo: corrigir cores e os achados concretos de
`THE-CRITIC-EXCEPTIONAL-FINAL.md`, preservando funcionalidades.

## Alterações

- Galeria clara no tema claro, substituindo o fundo quase preto.
- Galeria e capas em tons escuros compatíveis com os demais painéis no tema
  escuro. As cores de cada destino continuam reconhecíveis.
- Bordas, hover e foco usam os tokens do tema. Sombras das capas menos pesadas.
- Após a primeira revisão: subtítulo central ampliado para 13px no desktop e
  12px no celular; tinta de Insights mais escura no modo claro. Removido o filtro
  de escurecimento lateral para preservar a leitura; a profundidade continua
  representada pela perspectiva e pelas sombras.
- Intervalo explícito de 32px entre orçamento e galeria, inclusive no celular.
- Despesas móveis usam descrição em largura completa e uma linha com data e
  valor, evitando a fragmentação de palavras em uma coluna estreita.
- Cache do CSS atualizado no template. Nenhuma alteração de Python ou JavaScript
  da aplicação: 35 arquivos conferidos por SHA-256 antes/depois.

## Decisões e limites

O trabalho está em `app/static/arc.css`, que já concentra a identidade visual.
Variáveis CSS permitem que o seletor de tema existente atualize também a galeria.
Criar outro mecanismo de tema duplicaria estado e manutenção sem benefício.

Mantivemos a tabela de despesas existente e mudamos sua apresentação até 600px.
A alternativa de gerar uma segunda lista no JavaScript duplicaria marcação e
exigiria sincronizar dados. CSS Grid reorganiza apenas as células visuais, sem
alterar cálculos, rotas, formulários ou regras de acesso.

Há um trade-off: o leitor de tela continua recebendo a ordem tabular original
(data, descrição, valor), enquanto a ordem visual móvel começa pela descrição.
Os três cabeçalhos e o papel de tabela permaneceram expostos no Edge testado.
Isso não comprova comportamento em todos os leitores de tela ou navegadores.

## Entendendo a regra central

Dentro de `@media(max-width:600px)`, a regra da descrição é:

```css
.finance-expenses td:nth-child(2) {
  grid-column: 1 / -1;
  grid-row: 1;
  min-width: 0;
  line-height: 1.5;
}
```

1. O seletor alcança a segunda célula, que corresponde à descrição, apenas no
   grupo de despesas. Não modifica a tabela de campanhas.
2. `grid-column: 1 / -1` faz a descrição atravessar as duas colunas da linha.
3. `grid-row: 1` a coloca visualmente acima da data e do valor.
4. `min-width: 0` permite encolher a célula dentro da largura disponível. A
   quebra de texto existente pode atender entradas longas sem expandir a página.
5. `line-height: 1.5` dá espaço para leitura quando a descrição ocupa mais de
   uma linha. Não altera seu conteúdo.

Essa regra não é uma função: não recebe parâmetros, retorna valores ou lança
exceções. Ela depende da estrutura atual de três colunas. Se a ordem das colunas
mudar, será necessário atualizar o seletor e o teste correspondente. Remover a
primeira declaração devolveria a descrição a uma coluna estreita.

## Validação executada

- `browser-redesign.cjs`, v21: 88 capturas, 11 páginas, quatro larguras e dois temas;
  sem overflow horizontal, erros de console ou mutações.
- `browser-scene.cjs`, repetido após o ajuste final v22: dez combinações até
  320px; espaço real de 32px; teclado,
  links, seleção, atualização, falha/recuperação e funcionamento sem JavaScript.
  Os 14 pares de cores-base da cena/capas passaram em 4,5:1. Essa medição não
  constitui auditoria completa de acessibilidade nem mede todos os pixels de
  gradientes e sombras. Verificados também foco visível, hover com superfície do
  tema e encaixe do conteúdo das cinco capas. O filtro lateral foi removido.
- `browser-finance-layout.cjs`: 12 capturas de vazio e três despesas sintéticas,
  1366/390/320px e ambos os temas; descrição com largura completa no celular,
  campos sem overflow, cabeçalhos acessíveis e limites do formulário preservados.
- `browser-design-interactions.cjs`: foco, menu, formulários, tentativa após erro,
  downloads, gráfico, 320px e 32 pares de contraste; zero mutações reais.
- Python e JavaScript da aplicação comparados por hash, sem alterações. A suíte
  Python não foi repetida nesta rodada exclusivamente visual; os 113 testes da
  rodada anterior não são apresentados como uma execução nova.
- Comparador com referências locais: 16 combinações verificadas, imagens
  carregadas, sem transbordamento no celular ou requisições externas.

Todas as capturas usam dados de demonstração ou fixtures sintéticas, sem chamadas
de IA pagas. A primeira tentativa de lançar Edge dentro do sandbox falhou; os
testes acima foram executados com autorização de elevação, em perfil isolado.

Evidências v21: `output/design-review/theme-coherence/`; refinamento v22:
subpasta `final/`. As demais telas não mudaram entre v21 e v22.

A primeira revisão independente está em `THE-CRITIC-THEME-ROUND1.md`: 8,7/10,
aprovado no escopo inspecionado, com os achados anteriores resolvidos e ressalva
secundária de microtipografia. A segunda está em `THE-CRITIC-THEME-FINAL.md`:
8,8/10, aprovado, sem achados críticos, altos ou médios nas evidências.

O crítico confirmou a melhora dos subtítulos, capas laterais e tinta de Insights,
a continuidade cromática e a aparência do foco. Ressalvou que as lombadas seguem
pequenas: são assinaturas redundantes da marca, sem informação essencial exclusiva.
Não recomendou outro aumento de escala. Nas capturas de hover, a capa conserva
foco enquanto o ponteiro está no botão; os dois estados coexistem, e o contorno
da capa não deve ser atribuído ao hover. A revisão visual não substitui os testes
de interação executados separadamente. Ciclo encerrado após duas revisões, sem
forçar uma nota nem atribuir excelência não demonstrada.

## Conceitos para estudar e exercício

Estude variáveis CSS, cascata, CSS Grid, media queries e árvore de acessibilidade.
Exercício: explique por que esconder o cabeçalho com `display:none` seria diferente
de mantê-lo recortado visualmente. Depois proponha um teste para uma descrição de
100 caracteres, sem alterar o limite do formulário e sem usar dados reais.
