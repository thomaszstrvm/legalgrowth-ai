# LegalGrowth — filmes em desenvolvimento

**25/10/2026 · Portfólio · Dados fictícios · Repositório privado**

Apresento duas versões de trabalho. A publicação registra o desenvolvimento;
não representa lançamento comercial, prontidão para produção ou aceite estético final.

| Versão | Arquivo | Formato |
|---|---|---|
| Produto v1 — Em desenvolvimento | [MP4 de produto](LegalGrowth-product60-v1-reviewed-in-development.mp4) | 20 s, 1920 × 1080, 60 fps, 1.200 frames, áudio AAC estéreo |
| R7 histórica — Em desenvolvimento | [MP4 R7 exato](LegalGrowth20sDark-1.1.1-contour-r7-reviewed.mp4) | 20 s, 1920 × 1080, 30 fps, 600 frames, áudio AAC estéreo |

Os arquivos podem exigir download para reprodução. O [manifesto](manifest.json)
registra tamanho, SHA-256 e fontes. Preservei os bytes da R7 selecionada, sem
reencodificar ou inserir marcas. Sua identificação de desenvolvimento está nesta
documentação; não afirmo que as fontes atuais reproduzem seu build histórico.

## O que demonstro na versão de produto

Reúno investimento, resultados e análises para apoiar o escritório na escolha do
que revisar. Uso uma única campanha fictícia, no período de 12 a 18/10/2026:
R$ 240 de gasto, 120 cliques e nenhuma conversão registrada. A recomendação é
conferir a mensuração, sem concluir ineficácia nem recomendar verba por desempenho.
A mesma evidência segue para o relatório; a decisão permanece humana.

| Tempo | Foco |
|---|---|
| 0–3 s | Resumo de investimento e campanhas |
| 3–6 s | Contexto da mesma campanha |
| 6–8 s | Ponto para revisar: mensuração |
| 8–12 s | Evidência e responsabilidade humana |
| 12–16 s | Registro no relatório semanal |
| 16–20 s | Acompanhamento e próximo passo |

O fluxo é uma representação editorial identificada, não uma gravação de navegação
ao vivo. A fixture foi produzida com serviços do projeto e SQLite sintético em
memória, sem APIs de IA pagas ou banco real. Ela inclui campos adicionais de
orçamento padrão que não uso como prova de orçamento informado pelo usuário.
Não demonstro ROI, avaliação jurídica, automação de anúncios ou IA infalível.

Adotei a identidade do dashboard: verde escuro, Newsreader/Manrope, respiro e um
foco por vez. Uma superfície e o valor de gasto persistem entre os estados.
Adaptei continuidade, gesto causal e tempos separados de contorno/conteúdo dos
exemplos [Beyond Media 2103273003555402193](https://beyond-media.ai/motion-library#2103273003555402193)
e [2107217691505516612](https://beyond-media.ai/motion-library#2107217691505516612).
A referência [de ação, detalhe e conjunto](https://x.com/mynameisyahia/status/2113734310473966001)
orientou o foco. Não copiei ativos, marcas ou supostas funções de geradores.
O som é síntese original local, com grade de 120 BPM; não contém faixa comercial.

## Fontes e reprodução

A entrada independente é [product-launch60.tsx](../../src/experiments/product-launch60.tsx),
com [fixture JSON](../../src/experiments/product-case.json) e sua exportação TypeScript.
Não substitui as composições clara/escura principais. O áudio está em
`../../public/audio/product-launch60-v1.wav`; seu manifesto e o gerador
`../../scripts/product-launch60-audio.py` documentam a origem. As fontes tipográficas
e respectivas licenças OFL já pertencem ao projeto.

Com as dependências e um navegador compatível já disponíveis, a entrada pode ser
renderizada a partir da pasta `media/legalgrowth-presentation` usando o CLI local:

```text
node node_modules/@remotion/cli/remotion-cli.js render src/experiments/product-launch60.tsx LegalGrowthProduct60 CAMINHO_NOVO.mp4 --codec=h264 --audio-codec=aac --crf=16 --browser-executable=CAMINHO_DO_NAVEGADOR
```

O comando é uma referência de reprodução, não uma execução nova desta publicação.
A exportação entregue usou o renderer Remotion 4.0.538 instalado, navegador local,
concorrência 2 e porta de render 3127. Dependências, versões e ambiente podem
afetar os bytes; o SHA identifica o arquivo entregue, não garante bit-identidade
de um render futuro. O gerador de áudio recusa sobrescrever a versão existente.
Os hashes de fontes do recibo descrevem os arquivos locais usados no render;
o manifesto distingue os blobs Git normalizados, pois finais de linha podem mudar.

## Verificação e revisão

Usei revisão interna e um Validador independente em projeto separado. Antes desta
publicação, TypeScript, ESLint e diff-check passaram; o MP4 decodificou integralmente
com 1.200 frames. Foram produzidos 40 quadros por batida e 83 amostras finais.
O registro de integridade conferiu 47 arquivos anteriores preservados.

O Validador conferiu os hashes dos dois MP4s e oito fontes/assets, inspecionou dez
folhas de contato e seis frames diretos, incluindo a correção de proximidade entre
data e valor. Concluiu **apto para publicação privada WIP**, sem bloqueador visual
ou factual nas amostras. Não reexecutou os testes do implementador. Textos principais
e dados foram legíveis nas amostras a 390 px; notas menores exigem atenção.

A avaliação técnica independente do áudio mediu −26,16 LUFS e −15,12 dBTP, sem
clipping ou intervalo interno de silêncio de pelo menos 50 ms, com cauda até
19,674 s. O nível conservador não foi considerado bloqueador; não foi normalizado
para −14 LUFS. Medidas não certificam musicalidade ou sincronismo percebido.

Não certifico escuta humana, playback contínuo, compreensão em uma passagem,
telefone físico ou uso em produção. A revisão externa original, logs e capturas
permanecem localmente nos projetos separados; publico somente esta síntese e
identidades sanitizadas. A CI do commit desta publicação deve ser conferida pelo
SHA no GitHub Actions; uma execução antiga não valida este commit. O workflow
existente verifica backend/contratos de frontend e não renderiza o filme.
