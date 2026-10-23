# Dupla página de resultados — v35 a v37

23/10/2026. Evolução de apresentação, sem novas funcionalidades.

## Direção e comparação

A v34 distribuía gráfico, apoio e campanhas numa sequência longa. A v35 aproxima
as campanhas da série temporal em uma dupla página a partir de 1280 px. A largura
mínima vem do conteúdo: 500 px para análise, 620 px para a tabela e 40 px entre elas.
Até 1279 px, a tabela continua com a largura total. Não há truncamento de nomes.

```text
identificação | gasto | contatos | contratações
período e origem
análise temporal           campanhas
revisão e ações            orçamento
                  dossiês
```

A tipografia expressa prioridade: Newsreader 64 px identifica o Resumo e 32 px
abre as campanhas; Manrope 18 px identifica o gráfico e 15 px o orçamento, cujo
saldo recebe destaque. A paleta permanece: canvas #f7f8f5, tinta #292a29,
apoio #60625e, campo #eef1eb, ação #315747. No escuro, canvas #181c19,
tinta #eeeee7, apoio #b8bcb2, campo #2e342e e ação #b8d4bc.

A proposta foi confrontada com o risco de um painel genérico: não foram adicionados
cards, dados promocionais, indicadores fictícios nem imagens decorativas. A decisão
expressiva é a composição de dupla página, ligada aos dossiês existentes.

Referências examinadas nesta rodada:
- Arc Marumo, https://www.arcmarumo.com/: objeto, identificação e controles pertencem
  à mesma composição. A galeria existente foi preservada; não copiamos o efeito CRT.
- Herman Miller, https://brandstandards.hermanmiller.com/composition: a grade é
  definida por conteúdo, relações e intenção. A seção Using the grid foi aberta e
  capturada. Aplicação: campanhas e análise começam juntas, orçamento segue campanhas.
- Boc Work e Nova Dental: capturas da rodada anterior, identificadas como históricas.
  Papéis claros entre elemento dominante e apoio, sem equivalência funcional alegada.

## Implementação e trade-offs

Somente arc.css e a versão do CSS no template mudaram no produto. A navegação
compacta já existente passa a atender também 901–1180 px; os mesmos links, botão,
handlers e Escape continuam disponíveis. Isso evita duas linhas de destinos,
ao custo de uma ação para abrir o menu nessas larguras.

A dupla página troca largura do gráfico por proximidade entre série, campanhas
e orçamento. Com recomendações longas, a coluna esquerda cresce naturalmente.
O orçamento não deve acompanhar artificialmente essa altura. O fluxo no DOM
permanece análise, revisão, campanhas, orçamento, galeria; a ordem de teclado não
foi modificada. Em CSS Grid, proximidade visual não implica mudança de dados.

## Entendendo o código

```css
grid-template-columns:minmax(500px,1fr) minmax(620px,1.1fr);
grid-template-rows:min-content 1fr;
gap:28px 40px;
align-items:start;
```

1. A primeira linha reserva os mínimos necessários ao gráfico e à tabela e divide
   o espaço restante. `fr` é uma fração do espaço disponível, não uma porcentagem fixa.
2. `min-content` mantém a primeira linha da grade tão alta quanto as campanhas
   precisam. A segunda linha absorve a altura restante. Sem isso, uma recomendação
   longa que atravessa duas linhas pode afastar o orçamento da tabela.
3. `gap` reserva 28 px entre linhas e 40 px entre colunas.
4. `align-items:start` impede que o orçamento seja esticado para preencher espaço.

A regra só se aplica a partir de 1280 px. A alternativa seria duplicar blocos ou
mover elementos com JavaScript; isso acrescentaria sincronização e risco de perder
estado de controles. Aqui não há biblioteca, chamada externa ou custo novo.

## Verificação e limites

113 testes Python passaram, com dois avisos de depreciação existentes. As capturas
usam dados sintéticos, Edge/Chromium e tráfego local. Testes de composição cobrem
16 larguras nos dois temas, inclusive 1279/1280/1281. Estados adicionais cobrem
recomendação e valor principal longo em cinco larguras. Teclado, formulários,
contraste e galeria são verificados pelos scripts existentes.

A nota do crítico é julgamento visual, não benchmark nem prova de usabilidade.
Pareceres e pendências desta rodada serão anexados ao final.

## Estudo e exercício

Estude tamanho intrínseco, Grid, breakpoints definidos pelo conteúdo e ordem de
leitura. Exercício: explique por que `min-content 1fr` evita um espaço vazio na
coluna do orçamento quando a recomendação da outra coluna aumenta.

### Acabamento v36

Na primeira captura de 1280 px havia 40 px não preenchidos no bordo direito.
Uma faixa com fator fr menor que 1 pode deixar espaço sem distribuição quando
outra faixa atinge seu mínimo. Os fatores passaram a 1 e 1.1, mantendo praticamente
a proporção e preenchendo a largura. O teste agora compara o bordo da tabela com
o da grade, com tolerância de 1 px. Não foram reduzidos os mínimos de conteúdo.

A matriz de 11 telas, cinco larguras e dois temas passou (110 capturas), sem
overflow nem erros de JavaScript. Os 35 arquivos de lógica monitorados permaneceram
iguais. Foram verificadas 32 combinações de layout e 20 estados preenchidos.

## Correções da primeira revisão — v37

THE CRITIC atribuiu 8,4/10 à v35: avanço estrutural, sem defeitos altos, com
ressalvas de acabamento. Parecer preservado em THE-CRITIC-EDITORIAL-V6-ROUND1.md.
A v37 conserva os registros móveis das campanhas até767px. A tabela volta em768px;
foram capturadas as duas bordas e769px. Os nomes, rótulos e valores são os mesmos.

A recomendação simples usa subgrid no desktop: o artigo mantém sua semântica,
mas compartilha linhas/colunas com o contêiner. O link primário e o botão de
atualização ocupam a mesma linha. A ordem DOM continua primário → atualização →
configuração e foi verificada com Tab. A regra exige uma única recomendação sem
metadados adicionais. Nos demais casos e em navegadores sem subgrid, mantém-se
a disposição vertical existente. Isso evita transformar texto adicional em uma
posição fixa inadequada. Nenhum controle foi duplicado, removido ou desativado.

O apoio de configuração deixou de consumir espaço flexível arbitrário: frase e
link formam um grupo contínuo. Papéis tipográficos de gráfico e orçamento foram
estendidos às demais larguras para manter a mesma identidade funcional.

Verificação final dos reparos: 36 combinações de layout, 24 estados adicionais
(incluindo múltiplas recomendações e metadados), 16 combinações do comparador.
Sem erros, tráfego externo ou operações reais de escrita nesses testes.
A matriz global de110 capturas é v35; as regras de telas auxiliares não mudaram
na v36/v37. As capturas do Resumo e dos estados foram regeneradas na v37.
O manifesto final registra essa distinção e os hashes dos arquivos.

### Conceito adicional: aprimoramento progressivo

`@supports(grid-template-rows:subgrid)` só ativa o agrupamento de ações quando o
navegador suporta o recurso. O fallback conserva todas as funções em uma pilha.
A vantagem é não depender de JavaScript para medir a altura do texto. O custo é
manter duas apresentações aceitáveis e testar também estados que usam a pilha.
Não há mudança no processamento, armazenamento ou envio de informações.

## Segunda revisão e acabamento v38

THE CRITIC atribuiu 8,8/10 à v37, aprovada com ressalvas. Confirmou os quatro
reparos anteriores e não encontrou defeito crítico ou alto. Parecer integral em
THE-CRITIC-EDITORIAL-V6-FINAL.md. A nota pertence à v37 preservada em final/.

Na v38, align-items:stretch iguala a altura dos separadores sem mover textos ou
valores. O teste confere a linha inferior dos dois divisores com tolerância de1px.

A sobreposição de “Pular para conteúdo” foi investigada separando evidência de
interação e de apresentação. Na sequência de foco verificada, o link desfocado
ficou fora do viewport; as duas capturas focus-viewport mostram o botão de
atualização focado sem a sobreposição. A captura inteira é agora feita após
remover foco e retornar ao topo. A imagem neutra foi inspecionada sem o artefato.
Isso não estabelece a causa interna do mecanismo de captura, nem uma garantia
para todos os navegadores. Nenhum CSS ou comportamento do link de salto foi alterado.

36 combinações de layout e24 estados passaram novamente, mais duas capturas reais
do viewport com foco. A v38 está em post-review/ e no comparador; não recebeu
nova nota independente. O comparador foi testado em16 combinações na v37; após
a troca de diretório para v38, os caminhos foram conferidos no sistema de arquivos.
Sua abertura automática foi bloqueada pela política de URLs locais do navegador.

A ambição de excelência integral permanece sem comprovação independente: o parecer
avalia capturas, não uma pesquisa de usabilidade ou toda a experiência interativa.
O menu compacto até1180 é um compromisso documentado: uma única transição para
a navegação com ícones, ao custo de abrir o menu em larguras onde os rótulos menores
anteriores poderiam caber. Não foi tratado como erro comprovado pelo crítico.
