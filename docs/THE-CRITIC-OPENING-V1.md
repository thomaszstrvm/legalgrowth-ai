# THE CRITIC — abertura v45

23/10/2026. Parecer do agente permanente `visual_critic`, somente leitura.

## Veredito

**8,4/10 — APROVADO, no escopo visual desta abertura.**

A v45 corrige o deslocamento identificado e preserva a presença da referência Arc
na primeira tela. A composição possui identidade, escala e coerência cromática
defensáveis. Não identifiquei pendência visual relevante que exija outra rodada neste ciclo.

## Versão, evidências e limites

Versão congelada em `output/design-review/opening-v1/final/`. Os hashes atuais dos
três arquivos registrados coincidem com o manifesto.

Examinei novas capturas de abertura em1366×768,390×844 e320×844, nos temas claro e
escuro; seleções desktop de Orçamento, Relatórios, Insights de IA e Oportunidades;
seleções adicionais em320; e foco desktop escuro. Conferi as regras CSS corrigidas
e a atualização de DESIGN.md. A comparação com Arc usa as referências examinadas
na primeira rodada. Não atribuo à v45 evidências antigas do produto.

Não executei a aplicação ou os testes. Os resultados funcionais e de contraste
foram informados pelo implementador; li `final/results.json`. Esta revisão não
certifica animação em execução, acessibilidade completa, zoom ou eficiência em uso recorrente.

## Correções verificadas

| Achado anterior | Resultado |
|---|---|
| Altura variável entre descrições desktop | Corrigido nos estados examinados. A reserva de2lh estabiliza palco, controles e instrução. |
| Ritmo irregular dos controles em320px | Correção adequada. O nome de duas linhas ocupa área prevista e alinhada ao controle oposto. |
| Documentação descrevia galeria após os dados | Corrigido em DESIGN.md: abertura antes dos dados e acesso Ver resultados. |

Evidências: `cover-Orçamento-1366-light.png`, `cover-Insights de IA-1366-light.png`,
`cover-Oportunidades-1366-light.png`, `opening-320-light.png`, `opening-320-dark.png`,
`cover-Oportunidades-320-dark.png` e as regras de `.scene-caption p` e controles.
O teste de estabilidade das cinco seleções foi reportado pelo implementador;
minha confirmação independente abrange as capturas e regras citadas.

## Problemas e escolhas

Nenhum problema crítico ou alto identificado. O achado médio da primeira rodada
foi resolvido. Não identifiquei novo defeito que exija correção obrigatória.
A reserva de duas linhas deixa espaço quando a descrição é curta: consequência
apropriada da estabilidade, mantendo flexibilidade sem altura fixa que corte texto.

“Selecione a capa para abrir” permanece redundante com “Abrir…”. É questão de
concisão e descoberta que merece observação, sem evidência para exigir remoção.
A abertura ocupa quase toda a viewport desktop: atende ao briefing e mantém
Ver resultados visível. Seu custo para usuários recorrentes exige teste de uso.

## Qualidades reais

- Referência presente: capas grandes, recorte, perspectiva e palco tonal.
- Capa central vertical e ação de abertura formam conjunto claro.
- Tipografia, ilustrações lineares e paletas compõem identidade própria.
- Temas preservam diferenças entre destinos e legibilidade nas capturas.
- Foco visível inequívoco em `focus-1366-dark.png`.

**APROVADO — qualidade visual consistente e defensável nesta abertura.**
As observações restantes são hipóteses e escolhas editoriais, não bloqueios
demonstrados. Não recomendo outro ciclo apenas para elevar a nota. A avaliação
é qualitativa, limitada às evidências; não certifica funções nem todas as telas.

## Registro do implementador

Primeira rodada v44:8,2, aprovada com ressalvas. O crítico apontou altura variável
de18px entre descrições, controles móveis e texto de DESIGN.md desatualizado.
Esses pontos foram corrigidos na v45. Duas rodadas, sem forçar nota.
