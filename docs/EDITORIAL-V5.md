# Caderno de resultados — v31 a v34

23/10/2026. Evolução visual do LegalGrowth, sem novos recursos.

## Direção de arte

A margem alta da v30 formava um bloco isolado: ocupava 300 px de largura,
reduzia o espaço do gráfico e deixava uma área vazia abaixo. Na v31, título e
resultados formam uma abertura horizontal compacta. A expressão vem da escala
numérica e do ritmo editorial. A galeria permanece depois da análise.

Paleta preservada: canvas #f7f8f5, tinta #292a29, apoio #60625e, campo #eef1eb,
ação #315747; no escuro, canvas #181c19, tinta #eeeee7 e campo #2e342e.
Newsreader identifica títulos e capítulos; Manrope apresenta controles e números.
Valores passaram a peso 500, com numerais tabulares e tamanho limitado pelo espaço.

```text
desktop amplo
identificação | investimento       contatos | contratações
período e origem dos dados
evolução dos gastos em largura completa, se não há recomendação
situação das recomendações + ações existentes
campanhas                                 | orçamento
dossiês
```

Com recomendação, gráfico e conteúdo revisável continuam em duas colunas. Isso
estabelece uma hierarquia diferente entre informação disponível e ausência dela.
No celular, permanece a sequência natural, com os mesmos controles e conteúdo.

## Referências efetivamente examinadas

- [Nova Dental](https://nova-dental-dev.webflow.io/): site reaberto e capturado.
  Contraste de escala e relação entre elemento principal e apoio; aplicado à
  síntese numérica e aos controles subordinados.
- [Boc Studio no Awwwards](https://www.awwwards.com/sites/boc-studio): ficha SOTD
  examinada e link para o site seguido. Foram visitadas a [abertura](https://boc.studio/)
  e a [página Work](https://boc.studio/work). A abertura usa material audiovisual;
  Work usa grade compacta dominada por projetos, com controles discretos.
  Aplicação: conteúdo real ocupa a área principal e a interface de apoio ocupa
  menos espaço. As imagens, marca e cor laranja não foram incorporadas ao app.
- Arc e Herman Miller: capturas da rodada anterior, identificadas como históricas.
  Arc sustenta a linguagem material dos dossiês; Herman Miller, relações pela grade.
- Standards e imagem Nexora do usuário permanecem no comparador como referências
  complementares, sem alegar uma visita nova nesta rodada.

Capturas novas estão em `output/design-review/editorial-v5/references/`. A comparação
usa `before/` (v30), `round1/` (v31) e `final/` (versão após correções), com manifestos.

## Decisões técnicas e trade-offs

O bloco de CSS da margem foi substituído, em vez de manter outra camada inteira
de regras anulando aquela composição. Não foram alterados JavaScript, Python,
rotas, valores, IDs ou a ordem dos elementos no template. O template mudou apenas
a versão da folha de estilos para invalidar o cache.

A abertura usa Grid e a ausência de recomendações é identificada com `:has()`.
Essa condição consulta conteúdo já renderizado; não dispara análise nem modifica
estado. A alternativa seria adicionar uma classe em JavaScript, criando um novo
ponto de sincronização para um efeito exclusivamente visual. `:has()` exige
navegador moderno; o ambiente verificado é Edge/Chromium.

O ganho de largura do gráfico tem custo vertical: na v31 as campanhas ficaram
mais abaixo do que na v30. Não alegamos que todos os dados aparecem antes. Na v32,
foram reduzidos intervalos do cabeçalho do gráfico, detalhes diários e revisão
vazia. A fonte e os controles não foram reduzidos para recuperar esse espaço.

Entre 901 e 1180 px, campanhas e orçamento ficam em sequência para não comprimir
a tabela. Acima disso, aparecem lado a lado. A abertura horizontal começa em
901 px, com título de 44 px nessa faixa. Teste específico impede quebra ou corte
da palavra Resumo. Até 900 px mantém-se a composição móvel/intermediária existente.

Sem bibliotecas, fontes, chamadas de rede ou custos de IA novos. Tokens escuros
continuam os mesmos. A limitação visual da série demonstrativa quase constante
é preservada: não foram fabricadas variações para tornar o gráfico mais vistoso.

## Entendendo o CSS

```css
body[data-page=overview] .overview-lead:not(:has(.rec)) {
  grid-template-columns:minmax(0,1fr);
  gap:0;
  padding-bottom:16px;
  margin-bottom:24px;
}
```

1. `body[data-page=overview]` restringe a regra ao Resumo.
2. `.overview-lead` seleciona a região de gráfico e recomendações.
3. `:has(.rec)` pergunta se existe recomendação renderizada; `:not(...)` inverte
   essa condição. Nenhuma informação nova é calculada.
4. `minmax(0,1fr)` cria uma coluna que pode encolher e usa toda a largura disponível.
5. `gap:0` elimina a distância de duas colunas que já não existem nesse estado.
6. `padding-bottom` controla espaço dentro da região; `margin-bottom`, a separação
   até campanhas/orçamento. São relações distintas, não dois nomes para o mesmo espaço.

Sem a condição, recomendações preenchidas perderiam a composição lateral. Sem
o limite ao Resumo, a regra poderia atingir regiões homônimas de outras telas.
CSS não tem parâmetros, retorno ou exceções nesse trecho; o navegador resolve
seletores, cascata e geometria. Não há função de negócio nova a explicar.

## Verificação

Foram executados 113 testes Python, todos aprovados, com dois avisos de depreciação
existentes. Matriz de 110 capturas em 11 telas, cinco larguras e dois temas;
verificações de teclado, menu, tabela, retenção de formulário, retry simulado,
exportações, contraste, movimento reduzido, galeria sem JavaScript e valores longos.
As capturas finais do Resumo são regeneradas após correções, em treze larguras;
as demais telas não recebem regras novas nesta rodada.

As 26 combinações específicas de layout verificam abertura compacta, título sem
quebra, gráfico integral quando vazio, orçamento adjacente quando cabível, filtros
dentro da tela, datas retidas e estados vazios. São dados sintéticos e requisições
locais; nenhuma operação real de escrita nem benchmark pago.

## Estudo e exercício

Estude Grid, seletores relacionais, largura intrínseca, tipografia tabular e
testes de geometria. Exercício: explique por que `:has(.rec)` é uma condição de
apresentação, e onde a condição equivalente deveria ficar caso decidisse se uma
análise de IA pode ou não ser executada. Não altere o fluxo real para esse exercício.

## Revisão independente

O consultor de direção de arte é separado do agente permanente THE CRITIC.
O consultor apontou o custo vertical; o crítico recebe capturas congeladas e
atribui seu próprio julgamento. Pareceres serão anexados sem modificar suas notas.

### Correções finais v33

O gráfico sem recomendação usa 148 px de altura no desktop, com eixo zero,
datas e tabela diária preservados. No celular permanece em 152 px. O ganho é
economia vertical; a limitação é a menor área para inspecionar pequenas variações,
que continuam disponíveis na tabela. Em 1366 px, o título de campanhas passa de
aproximadamente y=1010 na v31 para y=855 na v33. Ainda aparece depois da v30:
o ganho principal desta direção é comparação horizontal dos indicadores e largura
do gráfico, não antecipação de todos os conteúdos.

Entre 601 e 900 px, o orçamento coloca título/ação na primeira faixa e valores
abaixo. Evita a coluna estreita do título vista em 900 px. O título do Resumo
em 901 px foi verificado por geometria: uma linha e largura suficiente, sem corte.
A navegação mantém seu breakpoint existente; os ícones voltam acima de 1180 px.
Isso conserva legibilidade da navegação densa sem alterar controles ou seu fluxo.

A primeira revisão independente da v31 atribuiu 7,7/10 e exigiu correções.
O parecer integral está em THE-CRITIC-EDITORIAL-V5-ROUND1.md. A versão v33 foi
submetida à segunda revisão depois dessas correções; a nota anterior não é
apresentada como avaliação da versão atual.

### Parecer final e reparo posterior v34

O parecer integral THE-CRITIC-EDITORIAL-V5-FINAL.md atribuiu 7,9/10 à v33,
reprovada por fragmentar o saldo de R$ 886,00 em 768 px. Também apontou espaço
excessivo no estado vazio e desalinhamento dos indicadores em 901 px.

A v34 corrige esses pontos: entre 601–900 px, o saldo recebe coluna mínima de
190 px e o medidor passa à linha seguinte; os rótulos dos indicadores reservam
44 px em 901–1180 e seus valores recebem caixas de altura equivalente; a
mensagem vazia perde padding redundante, preservando texto e ações.

O teste de layout passou a conferir que o saldo ocupa uma única linha e que
os indicadores partem da mesma altura. Foram adicionadas as larguras 600, 601,
800 e 801: 26 combinações nos dois temas, todas aprovadas. Os 16 estados com
recomendação/valor longo também foram regenerados após os reparos.

A pasta final/ preserva a v33 realmente avaliada. A pasta post-review/ contém
a v34 publicada no app; o comparador usa essa versão. A v34 não recebeu uma
nova nota independente. O ciclo encerra suas duas revisões conforme AGENTS.md;
não se atribui aprovação ou excelência à correção sem esse julgamento.

Pendências de direção de arte: o ritmo ainda se apoia bastante em divisórias;
a navegação de duas linhas em 901 px continua sendo um compromisso; a assinatura
visual é mais forte nos dossiês do que nos blocos analíticos. Essas observações
não foram transformadas em promessa de resultado ou nota estimada.
