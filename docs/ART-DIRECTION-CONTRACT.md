> Registro histórico: esta direção foi substituída pela rodada folio. Consulte [BRAND-FOLIO-REVIEW.md](BRAND-FOLIO-REVIEW.md) e [DESIGN.md](../DESIGN.md). Notas, capturas e testes abaixo pertencem à versão anterior.

> Registro histórico da rodada anterior. Direção e validação atuais: [PORTFOLIO-VISUAL-REVIEW.md](PORTFOLIO-VISUAL-REVIEW.md).

# Direção da rodada de comparação direta

Data: 22/10/2026. Escopo: redesenho do sistema existente, modo Operate. A autorização do usuário para implementar uma mudança abrangente e usar as referências prevalece sobre uma nova entrevista de aprovação da skill. Fatos do produto registrados em PRODUCT.md a partir das instruções já fornecidas.

## Direction contract

**THESIS:** uma interface analítica com leitura editorial. Título e resultados reais formam a abertura; gráfico temporal e revisão são áreas abertas. Cabeçalho azul e cartão azul de recomendação da rodada rejeitada foram removidos.

**OWN-WORLD:** fundo frio `#faf9fc`, superfícies `#fff` e `#eeebf2`, tinta `#222326`, ação `#5c427b`. Newsreader em títulos; Source Sans 3 em marca, corpo, nomes de campanha, números e controles. Navegação clara com estado ativo por peso e sublinhado; símbolo geométrico existente preservado. Tema escuro usa tokens próprios.

**STORY:** localizar a tarefa, ler gasto/contatos/contratações, observar a distribuição temporal do gasto, revisar a recomendação e conferir as campanhas. Não adicionar funcionalidades, métricas ou alegações comerciais.

**FIRST VIEWPORT:** masthead claro e destinos no topo; abertura assimétrica em proporção .8/1.2 entre título e resultados. `h1` usa `clamp(42px,4vw,56px)` no estilo base e `clamp(38px,10vw,48px)` até600px. Abaixo, contexto/período e gráfico aberto com revisão lateral. Até1100px a abertura empilha; até800px gráfico/revisão empilham. Gráfico mantém zero, datas e tabela alternativa.

**FORM:** direção orientada às referências explicitamente escolhidas pelo usuário, com crítica independente em ART-DIRECTION-COMPARISON.md. `seed:989d9d972d563e60` foi executado sem catálogo remoto; não determinou preferências nem substituiu o brief. Build em código, sem comp aprovado e sem alegação de equivalência visual literal a um site promocional.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Evidência e procedência

Capturas próprias via navegador, sites reais: output/design-review/references/legency-live.png (https://legencymedia.com/), signal-live.png (https://signal-a.studio/about), format-live.png (https://format.obys.agency/). Uso somente no comparador de desenvolvimento; não são assets da aplicação. Data22/10/2026. Nenhuma edição das imagens originais.

Referências adicionais: `arc-live.png` (https://www.arcmarumo.com/,1280×720), `nova-live.png` e `nova-detail.png` (https://nova-dental-dev.webflow.io/, abertura1265×712). Capturas fornecidas pela revisão principal e examinadas pelo designer. Não se afirma premiação desses dois sites. Nova inspira contraste tipográfico e abertura assimétrica; Arc, foco principal com controles periféricos. As imagens não são assets da aplicação.

Newsreader: https://github.com/google/fonts/tree/main/ofl/newsreader, fonte local451664bytes e licença SIL OFL em `app/static/fonts/OFL-Newsreader.txt`. Source Sans3 permanece. Manrope da rodada anterior continua no disco, mas não está declarada no CSS atual. As duas fontes ativas somam1.098.004bytes brutos. O middleware aplica no-store aos estáticos; a transferência pode se repetir entre visitas. Não há requisição tipográfica externa durante o uso.

## Critério de término

Comparador com sete referências, três telas e duas versões; inclui demonstração pública do Linear e tabela da documentação pública do Attio. Conferir desktop e móvel em claro/escuro, todos destinos preservados, gráfico ligado ao mesmo snapshot de dados e custos sem alteração. Respostas dos testes não são aprovação estética do usuário. Resultado final em EDITORIAL-REDESIGN-REVIEW.md.
