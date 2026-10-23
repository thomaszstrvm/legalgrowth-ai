> Registro histórico: esta direção foi substituída pela rodada folio. Consulte [BRAND-FOLIO-REVIEW.md](BRAND-FOLIO-REVIEW.md) e [DESIGN.md](../DESIGN.md). Notas, capturas e testes abaixo pertencem à versão anterior.

> Registro histórico da rodada anterior. Direção e validação atuais: [PORTFOLIO-VISUAL-REVIEW.md](PORTFOLIO-VISUAL-REVIEW.md).

# Comparação de direção de arte

> Registro histórico da crítica durante a rodada. A implementação final reduziu títulos para56px, usa sans nos nomes das campanhas e tem sete referências no comparador. O fechamento e os resultados atuais estão em [EDITORIAL-REDESIGN-REVIEW.md](EDITORIAL-REDESIGN-REVIEW.md).

22/10/2026. Parecer do subagente designer. Esta é crítica visual, não medição de usabilidade nem aprovação estética do usuário.

## Direção atual e comparação com Nova/Arc

Depois da rejeição da versão de cabeçalho azul, foram examinadas as capturas reais `references/arc-live.png` e `references/nova-live.png`, obtidas pela revisão principal. O Resumo atualizado, `after/overview-light-1366.png`, foi aberto após sua atualização de22/10/2026 às19:57:52. CSS atual também foi lido para separar implementação de proposta.

| Região | Referência observada | Implementação atual | Diferença que permanece |
| --- | --- | --- | --- |
| Tipografia | [Nova Dental](https://nova-dental-dev.webflow.io/) combina sans grande e serif em itálico sobre fotografia. | Newsreader em títulos e nomes de campanha, Source Sans3 em números e controles. | Não há fotografia nem composição sobre imagem; usa serif normal, sem copiar a frase ou a ênfase em itálico da referência. |
| Entrada | Nova ancora uma frase à esquerda, com espaço e assimetria em relação à fotografia. | Título à esquerda e resultados reais à direita na mesma abertura; contexto vem abaixo. | Os dados são o conteúdo visual, não uma peça publicitária. O título atual é grande e ocupa espaço considerável. |
| Atenção | [Arc](https://www.arcmarumo.com/) tem capas como foco, controles periféricos e cena CRT. | Navegação clara periférica, gráfico aberto e nota lateral de revisão. | Sem experiência tridimensional, carrossel, textura ou dramatização cinematográfica. Não equivale ao impacto visual de Arc. |
| Superfícies | Ambas usam composição completa em vez de grades repetidas de cartões. | Removidos cabeçalho navy, cartão azul de revisão e cartão branco em torno do gráfico; branco frio/lilás e filetes estruturais. | Orçamento e áreas de configuração mantêm superfícies próprias porque agrupam tarefas. |

### Crítica da captura atual

- **Entrada:** a combinação título/valores agora caracteriza a abertura; já não parece uma barra administrativa azul sobre abas. O título tem peso elevado, coerente com a direção editorial, mas não demonstra sozinho qualidade de usabilidade.
- **Fluxo:** resultados → período → gráfico/revisão → campanhas está legível. Em notebook768px de altura, campanhas continuam abaixo da primeira dobra; há custo real de densidade.
- **Peso:** gráfico e nota lateral se integram melhor que os cartões isolados anteriores. A série fictícia é quase plana; o preenchimento abaixo dela ainda ocupa bastante espaço e não deve ser confundido com informação adicional.
- **Ênfase:** não há colisão visual observável na captura1366px. A serif nos nomes de campanha traz personalidade, mas precisa permanecer legível com nomes extensos. Não foi feita nova inspeção móvel por este subagente nesta etapa.

O comparador local contém cinco referências × três telas × duas versões. As notas explicam adaptações e limites; não atribuem prêmio a Arc ou Nova. A execução do script de30combinações cabe à revisão principal, após terminar a matriz de capturas. Este subagente não executou o navegador de teste nesta atualização.

## Histórico: proposta anterior, substituída

O restante registra a direção anterior à rejeição do cabeçalho azul; não descreve a versão atual. Naquela etapa, capturas de Resumo, Configurações e Relatórios foram abertas; Legency e Signal-A foram revisitados no Chrome.

| Região | Referência observada | LegalGrowth atual | Mudança proposta |
| --- | --- | --- | --- |
| Identidade | [Legency](https://legencymedia.com/) tem símbolo geométrico, sans de formas redondas, contraste preto/azul e arte granular; são escolhas reconhecíveis em conjunto. | Palavra LegalGrowth e praticamente a mesma fonte usada em todo texto. | Títulos e números em uma sans de desenho mais geométrico, como Instrument Sans; manter Source Sans 3 no corpo. Marca simples LG pode funcionar se o traço também organizar pequenos detalhes da interface. Não copiar símbolo alheio. |
| Navegação | [Signal-A](https://signal-a.studio/) coloca destinos num trilho horizontal de largura total, com ponto de seleção. | Coluna permanente consome 224 px mesmo onde o conteúdo precisa de largura. | Navegação superior compacta em dois níveis: gestão e análises, mantendo todos destinos descobríveis; configurações e tema na área utilitária. Tablet/celular recolhem sem rolagem horizontal obrigatória. |
| Primeiro olhar | Legency combina título forte com uma peça visual; Signal-A faz da tipografia a própria peça visual. | Um retângulo escuro domina por preenchimento, sem imagem informativa; números ficam isolados do comportamento no tempo. | Usar o gráfico temporal real já existente como peça focal. Faixa de três métricas acima, gráfico em dois terços da largura e revisão no terço restante. A forma dos dados fornece identidade útil, sem decoração inventada. |
| Ritmo | Signal-A alterna áreas amplas e listas compactas; não enquadra todas as seções do mesmo modo. | Uma grande prancha cercada de borda repete peso em todas as regiões e mantém aspecto administrativo genérico. | Áreas abertas para leitura e dados, superfície preenchida somente para uma função prioritária. Cortar a moldura externa da tela; linhas apenas para comparação e separação. |
| Configurações | Legency separa grupos pelo papel na narrativa e usa contraste para o bloco de ação. | A estrutura em duas colunas ficou melhor, mas ambas continuam parecendo células de uma tabela ampliada. | Coluna de estado com identidade de cor contida, formulário em área clara aberta e largura legível. Campos, segurança e funcionamento atuais permanecem. |
| Relatórios | Signal-A usa títulos como âncora lateral e listas com informação secundária alinhada. | Formulário e histórico são funcionais, porém a caixa externa domina mais que a tarefa. | Retirar moldura geral; composição em faixas: criação compacta, histórico com linhas de arquivo e opções abaixo. Títulos da mesma nova família, ações com posição consistente. |

## Direção implementável

Uma interface analítica com identidade de publicação profissional. Fundo branco/neutro, azul profundo em região funcional limitada, tipografia com diferença real entre display e leitura, gráfico temporal factual como foco. Título de página entre 48 e 56 px no desktop, 36 px no celular; métricas até 44 px; seções 24 px; corpo 16 px. São escalas iniciais para testar, não números absolutos de qualidade.

```text
LG LegalGrowth      Resumo Campanhas Gastos Contratos Relatórios       Tema
Análises            Insights Recomendações Notícias Oportunidades      Config.

Resumo                                              Dados / período
Descrição curta                                     aviso demo

Gasto                  Contatos                 Contratações
R$ ...                 ...                      ...

Gasto ao longo do período               Pontos para revisar
[gráfico real, datas, escala]            recomendação e ação

Campanhas                              Orçamento do mês
linhas comparáveis                     usado / disponível
```

A nova navegação não deve acrescentar uma etapa para tarefas frequentes. A faixa de análise não deve conter abreviações que o usuário não entende. O gráfico precisa de alternativa tabular e não pode usar dados fictícios fora do modo demo. Em período vazio, apresentar vazio claro; não desenhar uma curva de exemplo.

## Autocrítica

As iterações anteriores melhoraram alinhamento, mas confundiram rigor de componente com direção de arte. A prancha contínua por si só não tornou o produto reconhecível. A recomendação anterior de ampliar números também gerou aparência promocional. Nesta proposta o título tem personalidade, porém o conteúdo principal é uma visualização factual e o controle de densidade vem da composição completa.

Não recomendo copiar imagens, animação de letras, cursores especiais, inicialização demorada ou scroll dirigido. Isso não é uma recusa à referência: a transferência concreta está no sistema tipográfico, na composição sem moldura geral, no trilho de navegação e no foco visual próprio do produto. A referência formal precisa sobreviver em telas secundárias, sem transformar todo formulário numa peça de marketing.
