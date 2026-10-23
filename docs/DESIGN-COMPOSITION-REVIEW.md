# Revisão de composição — 22/10/2026

Registro de uma etapa anterior. Para a composição atual, pesquisa complementar e verificações finais, consulte [DESIGN-FINAL-REVIEW.md](DESIGN-FINAL-REVIEW.md).

## Diagnóstico

A primeira adaptação foi insuficiente: trocou cores e títulos, mas conservou caixas equivalentes e uma tabela comprimida por um orçamento lateral. A Legency é um exemplo dentro da pesquisa, conforme esclarecido pelo usuário; não é um modelo obrigatório nem uma proposta de cópia.

Referências anteriores: [Legency](https://www.awwwards.com/sites/legencymedia-com), [MyHealthPrac](https://www.awwwards.com/sites/myhealthprac), [Seasoned](https://www.awwwards.com/sites/seasoned). Nesta etapa, foi consultada também a ficha de [Runway Financial — Site of the Day de 10/07/2023](https://www.awwwards.com/sites/runway-financial), nota 7,37, e sua [captura histórica](https://assets.awwwards.com/awards/sites_of_the_day/2023/07/runway-financial-1.jpg), aberta visualmente no navegador.

O domínio indicado pela ficha agora abre outro produto (Runway AI); a avaliação foi feita sobre a captura arquivada. A ficha registra peso de 40% para design, 30% para usabilidade, 20% para criatividade e 10% para conteúdo. Um prêmio não equivale a comprovação de eficiência de um dashboard.

## Da referência ao código

| Evidência observada | Vantagem esperada | Implementação concreta | Custo ou limite |
|---|---|---|---|
| Legency: área de resultados escura, linhas e contraste com áreas abertas | Distinguir resultados de recomendações | `result-ledger` agrupa os mesmos três indicadores em linhas; valores à direita | Área escura precisa de contraste próprio, testado separadamente |
| Runway histórico: hierarquia assimétrica, bloco dominante e ação isolada | Uma entrada visual clara | `overview-lead` combina resultados e revisão; menu claro recua visualmente | Composição ocupa mais altura que uma tabela densa |
| MyHealthPrac: título dominante e explicações subordinadas | Separar orientação de tarefas | Título fluido, descrição curta e recomendação com subtítulo legível | Não importar imagens em tela cheia ou alegações comerciais |
| Seasoned: linguagem própria consistente | Coerência entre componentes | Uma família local e tokens comuns; cores com função | Não copiar a linguagem retrô para o trabalho jurídico |

## Estrutura entregue

```
Menu neutro     Resumo                             Escopo
                Período                           Aviso demo
                Resultados escuros | Revisão aberta + ação
                Campanhas em toda a largura
                Orçamento mensal em faixa horizontal
```

No celular: resultados, revisão, campanhas, orçamento. A ordem do DOM é a ordem visual e de teclado. No tema escuro, o bloco usa um tom mais claro que o fundo e mantém título próprio, agrupamento e separadores; a identificação não depende somente de cor.

Backend, endpoints, autenticação e cálculos não foram alterados. O renderer continua usando `metrics`, `recsWithData`, `overviewCampaigns` e `budgetLine`; mudou a composição das seções. Não há requisições externas ou dependências novas no produto.

## Decisões e alternativas

Manter as caixas anteriores seria uma alteração barata, mas não resolveria a hierarquia. Copiar uma landing page com vídeos e rolagem animada elevaria custo de carregamento e tempo até acessar os dados. Foi escolhida uma alteração de HTML/CSS sobre os componentes existentes: baixo custo operacional, pequena superfície de regressão e manutenção pelo mesmo sistema de tokens.

O orçamento abaixo da tabela libera espaço para comparar campanhas, mas sai da primeira tela em notebook. Esse custo foi identificado pelo revisor e mantido explicitamente: a página de orçamento continua acessível pelo menu. Não foi criado indicador duplicado ou resumo financeiro inventado.

## Revisão independente e evidência

- Subagente de referências: avaliou a versão anterior e apontou pesos equivalentes, tabela comprimida e revisão distante.
- Subagente final: inspecionou código, capturas atuais em 1366 claro, 768 claro e 390 escuro e comparação anterior. Sem bloqueador observado; ressalva sobre rolagem até orçamento.
- Matriz executada: 11 páginas × 4 resoluções × 2 temas = 88 capturas; sem overflow da página, erros de console ou mutações.
- Interações executadas: teclado, menu/Esc, tabela rolável, preservação de formulário, recuperação de falha, rótulos e reflow 320px passaram.
- Contraste ampliado executado: 24 pares >=4,5:1. Cálculo independente do bloco: principal 15,39:1/12,20:1; secundário 9,36:1/7,42:1 em claro/escuro.
- Estados vazios, nome sintético longo e comparador passaram. Dados de teste fictícios; nenhuma chamada paga.

Capturas anteriores desta etapa: `output/design-review/previous-iteration/`. Atuais: `output/design-review/after/`. Os 113 testes de backend foram executados na revisão anterior, não novamente nesta alteração de composição.

Os benefícios são hipóteses fundamentadas de design. Não houve estudo com advogados nem medição de tempo de tarefa. Testes comprovam comportamento nos cenários descritos, não preferência estética universal ou certificação WCAG.

## Entendendo o CSS

Trecho central real de `.overview-lead`:

```css
display: grid;
grid-template-columns: minmax(0,.95fr) minmax(0,1.05fr);
gap: var(--space-12);
align-items: start;
margin-bottom: var(--space-12);
```

1. `display: grid` cria uma grade para as duas seções irmãs.
2. As colunas repartem o espaço em 47,5% e 52,5% após descontar o intervalo; `minmax(0,…)` permite encolher quando o conteúdo é longo.
3. `gap` reutiliza o token de 48px e separa grupos com funções distintas.
4. `align-items: start` evita esticar a área de revisão até a altura dos resultados.
5. A margem separa a leitura de resultados da tabela detalhada.

Até 700px, a grade passa para uma coluna. Sem essa regra, o celular teria duas colunas estreitas. Remover `minmax(0,…)` pode fazer conteúdo longo impor uma largura mínima indesejada. CSS não retorna valores nem lança exceções de aplicação; declarações inválidas são ignoradas pelo navegador.

Conceitos: CSS Grid, tamanho intrínseco, cascata, tokens e ordem semântica do DOM.

Exercício: explique por que `order: -1` poderia fazer a ordem de teclado divergir da ordem visual. Proponha uma maneira de mudar a ordem sem introduzir essa divergência. Sem solução incluída.
