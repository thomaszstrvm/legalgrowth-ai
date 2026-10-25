# Filme 1.1.1 - correção da cena de orçamento

23/10/2026. Substitui a cena financeira da 1.1.0 após rejeição explícita do usuário. A revisão anterior melhorou reprodução e transições, mas manteve conteúdo técnico inadequado à propaganda.

## Correção

Removidos o gráfico recortado do painel, datas, valores, eixos, link de exploração, aviso sobre dias sem registro e o subtítulo "Acompanhe os gastos". A cena de 7 a 11 s apresenta apenas "Orçamento" e a capa financeira original. O aplicativo continua intacto; a remoção acontece somente no filme.

A capa entra com deslocamento lateral, perspectiva e desaceleração, chegando a uma posição estável para leitura. Tipografia Instrument Sans Medium, sem caixa e sem subtítulo. A composição alterna o peso visual para a esquerda antes da análise de IA, cuja capa está à direita. Não foram acrescentados interfaces fictícias, brilho neon, partículas ou alegações financeiras.

Alternativa descartada: ampliar ou animar o gráfico. Isso preservaria exatamente a carga técnica que foi rejeitada. A cena comunica a existência da área de orçamento; não tenta explicar sua operação em quatro segundos. O dashboard real continua na cena anterior.

## Implementação

`ResultsScene` em `media/legalgrowth-presentation/src/Cinematic.tsx`: `enter` controla entrada/opacidade, `settle` reduz perspectiva até a pose de leitura e `leave` retira a palavra antes da transição. Todos usam `motionProgress`, explicado linha por linha em [FILM-PLAYBACK-V6.md](FILM-PLAYBACK-V6.md). A mesma função atende ambos os temas; o arquivo de capa é selecionado por `theme`.

Sem novas dependências. Duração de 600 quadros, 30 fps e trilha original inalteradas. Versão 1.1.0 e suas evidências permanecem históricas; os resultados desta revisão são identificados como 1.1.1 e não substituem medições antigas.

## Aprendizado

Uma captura fiel ao aplicativo não é automaticamente adequada a um anúncio. Integridade de produto e seleção editorial são responsabilidades diferentes. O filme precisa comunicar uma capacidade legível no tempo disponível, sem transformar a publicidade em relatório técnico.

Desafio: compare os quadros 225 e 270 e explique por que `enter` e `settle` têm tempos diferentes. O que aconteceria se ambos terminassem somente no último quadro da cena? Não mude as evidências para responder.

## Revisão independente

THE CRITIC examinou 16 PNGs da nova cena nos dois temas. Encontrou um caractere corrompido no título, corrigido antes da entrega por edição UTF-8. Os 16 quadros foram regenerados; seis foram reinspecionados pelo crítico (225, 270 e 300 em ambos os temas). Falha encerrada e aprovação estática com ressalvas sobre o movimento/áudio, que não foram certificados pelo crítico. A revisão confirmou remoção do conteúdo técnico, capa inteira, margens e ausência de resíduos na entrada da IA.

Verificação adicional de fonte: nenhum caractere U+FFFD nos TSX; título contém ç; `ResultsScene` não usa `Detail`, recorte do gráfico ou os textos rejeitados. Lint/TypeScript e reprodução final são registrados separadamente abaixo. A revisão estática não equivale a uma nota de excelência nem a teste de desempenho.

## Incremento de portfólio escuro - 25/10/2026

Escopo aprovado: somente `LegalGrowth20sDark`, para recrutadores e clientes de
 desenvolvimento. Um responsável pela edição; revisão independente posterior,
 ainda pendente. A aprovação histórica acima não cobre este incremento.

Roteiro (600 frames, 30 fps, 1920x1080):
- 0-3 s: "Onde investir nas campanhas?"; problema apresentado com capas existentes.
- 3-7 s: "Contatos em contexto."; recorte do indicador real "Contatos qualificados",
  valor fictício 12, com "Exemplo fictício · mesmo período". Não promete retorno.
- 7-11 s: Orçamento V7 preservado.
- 11-13,25 s: Análise de IA; 13,25-16 s: "Revisão por outra IA".
- 16-20 s: LegalGrowth AI; "Projeto demonstrativo de Thomas Marques";
  "Conheça o projeto", sem URL ou promessa de lançamento.

Implementação: somente `src/Cinematic.tsx` nesta rodada. Condições explícitas
`theme === "dark"` isolam textos e assinatura. O painel escuro retorna um recorte
ampliado da captura existente (1030,585,850,220); o ramo claro conserva seu layout
 e sua sombra anterior. A tentativa inicial com três indicadores foi reduzida a
 um após inspeção estreita: o conteúdo pequeno não sustentava leitura em telefone.
 Movimento mantém máscara, aproximação breve e repouso para leitura, calculados
 por frame. Não foram acrescentados números, interfaces ou capacidades fictícias.

Referências: identidade DESIGN.md v59/v60; skills Remotion markup e Emil Design
Engineering (foco, hierarquia, movimento com propósito). Vídeo Apple indicado pelo
usuário: https://youtu.be/FUfGcZ092b0 . Seus quadros não foram observados nesta
rodada; não se atribuem movimentos específicos a ele. Princípios gerais são
orientação, não alegação de reprodução da referência ou certificação WCAG.

Checagens novas: TypeScript `node node_modules/typescript/bin/tsc --noEmit` e
ESLint `node node_modules/eslint/bin/eslint.js src`, ambos concluídos com código 0.
Primeira execução TypeScript encontrou TS2367 após estreitamento do tema;
condição redundante corrigida e checagens repetidas. Não houve instalação.
Studio confirmou 600 frames/30 fps/1920x1080 e erro atual null. Quadros escuros
60,150,435,570 inspecionados na aba estreita (428 px), com títulos inteiros e
indicador ampliado. Isto não equivale a teste em telefone físico. Duração e trilha
mantidas: Root.tsx e Composition.tsx conservam os hashes anteriores.

Checagem final do navegador: estilos Dark Reader passaram a zero e atributo de
modo ausente, sem intervenção deste agente em extensão/configurações. Restaram
19 atributos em elementos; isso não prova aplicação ativa. No palco escuro,
cores computadas #181c19/#eeeee7 coincidem com a fonte. Tema claro conferido no
frame 435, com texto original "Segunda revisão". Não se determinou quem ou qual
evento mudou o estado do navegador; não se afirma desinstalação comprovada.
Limites: nenhum CSS foi adulterado para compensar. Sem certificação de contraste,
áudio ou fluidez contínua. Zod 4.6.7 versus recomendação 4.5.4 permanece pendente.
Sem render final, commit, push, deploy ou mudanças no sistema web. O diff contra
HEAD inclui a correção V7 anterior; não atribuir todo esse diff a esta rodada.
Critérios para revisão posterior: clareza sem áudio, hierarquia em reprodução
estreita, leitura da revisão por IA e assinatura, transições e paleta sem
interferência. Nenhuma revisão externa nova foi executada nesta etapa.

## Gancho final e fechamento do lote - 25/10/2026

O roteiro escuro descrito acima é histórico do primeiro incremento. O gancho
vigente é "Como acompanhar suas campanhas?", aprovado e conferido no frame 60.
README atualizado para explicitar o portfólio escuro. Revisão técnica, delta,
checagens e limites finais: [parecer local](reviews/film-dark-portfolio-2026-10-25/review.md).
Sem MP4 final, certificação de áudio/fluidez contínua ou telefone físico. Recorte
no frame 212 foi comunicado, sem comprovação de impacto em movimento; máscara
preservada. MotionVideo e adaptações futuras permanecem pendentes.
