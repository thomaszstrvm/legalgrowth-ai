# Referências visuais — 22/10/2026

Registro de uma etapa anterior. Para a composição atual, pesquisa complementar e verificações finais, consulte [DESIGN-FINAL-REVIEW.md](DESIGN-FINAL-REVIEW.md).

Este documento registra a primeira pesquisa. A implementação foi aprofundada em [DESIGN-COMPOSITION-REVIEW.md](DESIGN-COMPOSITION-REVIEW.md), com comparação crítica, nova composição e revisão independente. Legency é uma referência entre várias, não um modelo obrigatório.

Pesquisa solicitada pelo usuário para evoluir o dashboard existente. Foram consultadas as fichas do Awwwards e abertas as páginas ao vivo em navegador, com inspeção de capturas. Os sites ao vivo podem ter evoluído desde a premiação. A avaliação abaixo é uma interpretação de design, não um teste de usabilidade com usuários.

| Referência e reconhecimento verificado | Observação visual | Aplicação ao LegalGrowth |
|---|---|---|
| [Legency Media](https://legencymedia.com/) — [Honorable Mention, 27/09/2026](https://www.awwwards.com/sites/legencymedia-com) | Fundo cinza claro, texto preto, azul intenso pontual, título dominante e composição assimétrica. O bloco de resultados usa linhas e descrições curtas. | Base neutra, navegação grafite, azul apenas para ações e foco; títulos com escala mais expressiva. Mantida a leitura tabular dos resultados. |
| [MyHealthPrac](https://www.myhealthprac.com/) — [Site of the Day, 11/07/2025](https://www.awwwards.com/sites/myhealthprac) | Título grande alinhado à esquerda, hierarquia evidente e ação principal isolada. A abertura usa fotografia em tela cheia. | Hierarquia entre título, explicação e controles. Fotografia e rolagem coreografada não são adequadas à consulta frequente de dados. A análise é visual; não endossa alegações médicas do site. |
| [Seasoned / Koto](https://seasoned.koto.studio/) — [Site of the Day, 21/03/2025](https://www.awwwards.com/sites/seasoned) | Identidade editorial própria, tipografia protagonista e linguagem visual coerente com a metáfora de cozinha. | Consistência de voz e tipografia: uma família local, escala clara, espaçamentos compartilhados. O estilo retrô e as mídias não foram transplantados para o produto jurídico. |

## Decisão aplicada

Refinar a identidade já implementada: grafite, branco suave e azul de ação. Em `app/static/style.css`, os tokens semânticos propagam a paleta a tabelas, formulários, botões e estados. O título usa `clamp(32px, 3vw, 42px)`: mínimo legível, crescimento com a janela e teto que preserva espaço para dados. A fonte local Source Sans 3 permanece; nenhum asset, marca ou código de terceiros foi copiado.

Alternativa: reproduzir o azul elétrico, os padrões de dithering, vídeos e transições das referências. Foi descartada para evitar distração, custo de carregamento e perda de previsibilidade em uma ferramenta de trabalho. Não foram adicionadas dependências ou requisições externas ao aplicativo.

O azul escuro do modo claro muda para um azul claro no tema escuro para preservar contraste. Vinte pares de tokens passaram no teste de contraste >= 4,5:1. Isso não certifica acessibilidade integral. A comparação visual está em `output/design-review/index.html`.

## Exercício

Localize `--accent` nos dois temas e explique por que usar exatamente o mesmo azul nos dois pode prejudicar a leitura. Depois calcule o contraste de uma alternativa antes de alterar o código. A solução não está incluída.
