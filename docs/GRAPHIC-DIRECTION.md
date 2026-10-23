# Direção gráfica — pesquisa aplicada

A proposta de escala abaixo foi corrigida após revisão: gasto até 44px, recomendação24px e indicadores auxiliares lado a lado. Estado final em [DESIGN-FINAL-REVIEW.md](DESIGN-FINAL-REVIEW.md).

22/10/2026. Pesquisa do subagente de direção de arte. Este documento registra propostas; a validação da implementação fica com a revisão final.

## Evidência

As referências foram abertas em navegador e observadas renderizadas, incluindo rolagem. Legency é somente um exemplo histórico. A seleção atual parte da [galeria Awwwards](https://www.awwwards.com/websites/).

| Referência | Reconhecimento confirmado na ficha | Observação direta | Adaptação proposta |
| --- | --- | --- | --- |
| [FORMAT, Obys](https://www.awwwards.com/sites/format), [site](https://format.obys.agency/) | SOTD 19/10/2026, 7,59; Developer 7,54 | Tipografia ocupa o formato, módulos verticais e horizontais justapostos; o scroll transforma a composição e as proporções. | Uma prancha analítica contínua, com dimensões distintas segundo a função: número principal de 56–64 px, dados auxiliares em duas células, revisão ao lado, campanhas encaixadas na base. |
| [Signal-A Studio](https://www.awwwards.com/sites/signal-a-studio), [site](https://signal-a.studio/about) | SOTD 18/10/2026, 7,22; Developer 7,31 | Navegação em trilhos com ponto de seleção; processo em duas colunas de linhas com título ancorado à direita; contraste tipográfico forte na página inicial. A ficha destaca o [Minimal Grid Accordeon](https://www.awwwards.com/inspiration/minimal-grid-accordeon-signal-a). | Disclosures já existentes em forma de linhas amplas, summary em grid, sinal +/− e corpo expandido integrado à mesma moldura. Navegação com marcador pequeno, sem cápsulas decorativas. |

As notas não provam adequação para um software jurídico. FORMAT recebeu 6,20 em responsividade na ficha, exemplo concreto de por que não copiar experiências premiadas integralmente. A observação do acordeão se apoia também no destaque editorial da ficha; não foi realizado teste exaustivo de todos os estados do site original.

## Crítica da versão anterior

Captura analisada: `output/design-review/after/overview-light-1366.png`, antes da implementação desta rodada.

| Dimensão | Diagnóstico | Correção |
| --- | --- | --- |
| Entrada — problema importante | O bloco preto captura atenção pela superfície, mas os números de 32 px continuam tímidos. Parece um cartão SaaS aumentado. | O próprio dado passa a formar a composição: investimento grande, unidade menor e legenda próxima. |
| Fluxo — problema importante | Grande vazio sob a recomendação e separação extensa até as campanhas. A composição se quebra em peças isoladas. | Prancha com bordas compartilhadas; ação ancorada à base da revisão; campanhas em continuidade abaixo. |
| Peso — problema menor | Resumo grande e card escuro disputam entrada, enquanto ação parece botão avulso. | Título contido e ação como célula integrante do painel. |
| Ênfase — problema importante | Cor nova e assimetria não demonstram a linguagem das referências. | Construir componentes identificáveis: prancha modular, acordeão de trilhos e célula de ação com indicador de direção. |

## Composição proposta

```text
nav        Resumo                         contexto / período
           ┌───────────────────┬──────────────────────────┐
           │ Gasto             │ Pontos para revisar      │
           │ R$ 1.114,00       │                          │
           │ número principal  │ Recomendação existente   │
           ├─────────┬─────────┤                          │
           │ 70      │ 8       ├──────────────────────────┤
           │ contatos│contratos│ Revisar resultados    ↗  │
           ├─────────┴─────────┴──────────────────────────┤
           │ Campanhas: linhas existentes                 │
           ├──────────────────────────────────────────────┤
           │ Orçamento: usado / saldo / período explícito  │
           └──────────────────────────────────────────────┘
```

Não é necessário acrescentar métricas ou inventar ilustrações para mostrar trabalho gráfico. Os dados existentes são a matéria visual. Valores longos precisam diminuir de escala ou quebrar sem sair da célula. No celular, a ordem de leitura continua gasto, contatos, contratos, revisão, campanhas.

## Tokens e movimento

Manter Source Sans 3 local para textos, controles e números. O caráter virá da proporção e composição, não de uma segunda descarga de fonte. Paleta de trabalho: papel branco `#FFFFFF`, fundo `#F3F3F2`, tinta `#222326`, linha `#DEDEE2`, ação `#3346C8`; escuro usa tokens existentes. Cor de ação não indica desempenho positivo.

Nos controles acionados pelo usuário, a seta pode deslocar poucos pixels e o + mudar para −; hover e foco devem receber a mesma confirmação. Respeitar movimento reduzido. Não embaralhar letras, substituir o cursor, prender o scroll, apresentar loader prolongado ou esconder ações até o hover. Esses recursos observados nas experiências promocionais prejudicariam a leitura frequente deste produto.

## Critério para aprovar

1. A primeira dobra mostra um conjunto contínuo reconhecível, não uma coleção de cartões soltos.
2. Uma comparação visual aponta para componentes específicos das referências, não só uma paleta parecida.
3. Os valores continuam verdadeiros, com unidade e período; formas proporcionais só representam proporções calculadas.
4. Acordeões respondem a teclado e toque, preservam semântica e não escondem o resultado principal.
5. Legibilidade em 390 px, modo escuro e nomes extensos é inspecionada após a mudança.

Vantagem: linguagem gráfica mais intencional com componentes baratos em HTML/CSS. Custo: uma prancha contínua exige cuidar de bordas e ordem de empilhamento; a escala tipográfica precisa de limites para dados maiores. Não há necessidade de novo framework, GSAP ou imagens remotas.

## Revisão: aplicação nas telas secundárias

Nova observação direta em 22/10/2026, em Chrome: [Signal-A/about](https://signal-a.studio/about) foi percorrido até Industry Recognitions e Services; [FORMAT](https://format.obys.agency/) foi percorrido até Circle, Usage e os módulos Horizontal/Horizontal Rounded. Foram examinadas capturas locais de Insights, Relatórios e Configurações em 1366 px.

Signal-A organiza reconhecimentos em título lateral e lista compacta à direita, com metadado no extremo oposto de cada linha. Services apresenta três grupos alinhados, sem cartões isolados. FORMAT mostra unidades de explicação compostas por título e descrição dentro de uma forma, cuja proporção é parte do assunto. Em ambos, o sistema de alinhamento atravessa seções internas; não se resume à primeira dobra. Não copiar cursor gráfico, texto rotacionado ou movimento dirigido pelo scroll.

| Tela existente | Problema observado | Adaptação concreta proposta |
| --- | --- | --- |
| Configurações | O bloco de conexão e formulário ultrapassa 900 px de altura, mas deixa uma coluna lateral sem uso. | Aproveitar a classificação lado a lado de Services: status das conexões à esquerda, formulário ativo à direita, numa superfície comum. Abaixo de tablet, manter ordem status → formulário. Não criar novos controles. |
| Relatórios | Um campo de data ocupa um cartão de aproximadamente 280 px de altura. Histórico aparece como outro cartão arredondado. | Adaptar título lateral + linhas de Signal-A: título/explicação curta à esquerda, data e ação na mesma linha à direita; histórico em continuidade abaixo, preservando o acordeão de teste. |
| Insights de IA | Vazio aparece em faixa cinza solta e texto separado abaixo. | Integrar orientação, ação e lugar de resultado numa unidade de conteúdo. Estado carregado usa sumário visível e evidências em linhas expansíveis. A proporção segue o conteúdo, como nos módulos de FORMAT; não preencher vazio com indicadores fictícios. |

Correção da proposta inicial: a escala de 56–64 px para números no Resumo ficou excessiva no produto. Usar até 44 px, auxiliares lado a lado e texto de recomendação 22–24 px é mais apropriado ao painel operacional. O princípio aproveitável é o alinhamento contínuo; reproduzir a escala promocional foi uma escolha inadequada.

Limites: observação desktop e estados capturados, não teste exaustivo dos sites originais. As três adaptações acima são propostas; somente revisão de código/capturas posterior pode confirmar implementação. O estado de Insights inspecionado estava sem IAs conectadas e não permite afirmar a qualidade visual de um relatório carregado.
