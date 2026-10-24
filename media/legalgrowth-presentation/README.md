# LegalGrowth AI - filme de 20 segundos

Duas composições do mesmo filme, com interfaces reais e dados fictícios:

| Composição | Tema | Duração | Formato |
|---|---|---|---|
| `LegalGrowth20s` | Claro | 600 frames / 20 s | 1920 x 1080, 30 fps |
| `LegalGrowth20sDark` | Escuro | 600 frames / 20 s | 1920 x 1080, 30 fps |

## Abrir e editar

Requer Node 20.19+, 22.13+ ou 24+. Dentro desta pasta:

```powershell
npm ci
npm run dev
```

Abra http://localhost:3000/LegalGrowth20s ou http://localhost:3000/LegalGrowth20sDark.
Não depende do servidor FastAPI, de senha, banco de dados ou chave de IA.
O botão Render do Studio permite exportar a composição selecionada.

## Estrutura e personalização

- `src/Root.tsx`: registra as duas versões. A versão clara mantém o URL anterior.
- `src/Composition.tsx`: roteiro nos segundos 0, 3, 7, 11 e 16; sobreposição de 12 frames nas máscaras. O último frame é 599.
- `src/Cinematic.tsx`: cenas, cores por tema, movimentos de câmera, máscaras e textos. `theme` escolhe as telas e capas correspondentes; não usa inversão artificial de cores.
- `src/visuals.tsx`: arquivos locais de fontes, marca, capas e recortes de capturas.
- `public/screens`: telas reais com fixtures sintéticas. Não troque por capturas de clientes.
- `public/covers`: arte original extraída dos templates e CSS do produto.
- `scripts/compose-audio.py`: trilha e efeitos originais, gerados localmente; Python + NumPy.
- Cenas antigas em `src/scenes` e `src/illustrations.tsx` são histórico da proposta v4; não estão registradas nem são usadas no filme atual.

Newsreader nos títulos e Manrope no texto seguem DESIGN.md. Instrument Sans permanece no histórico da v4, sem substituir a identidade atual.
Mantenha a mesma história nos dois temas: altere o componente compartilhado, não copie a composição.
O estágio lógico e a separação por cena facilitam outra proporção; **1080 x 1920 ainda exige reenquadramento próprio**. A escala atual preserva proporções, mas não é uma versão vertical pronta.

## Assets, licenças e regeneração

Os PNGs são locais e estão incluídos no projeto, portanto `npm ci` basta para a prévia.
`public/asset-provenance.json` contém origem e hashes das capturas históricas.
Na raiz do repositório, `node scripts/prepare-remotion-assets.cjs` regenera capas com Playwright e copia capturas de `output/closure-v60/presentation` (pasta local ignorada pelo Git; só necessária para regenerar essas capturas).
`node scripts/prepare-remotion-insight.cjs` renderiza o componente `insightFindings` original e CSS atuais, com um exemplo curto fictício. Não usa servidor, banco, credenciais ou IA. Seu manifesto separado registra o hash do renderer e a fixture.
A extração delimitada do renderer falha se os nomes mudarem; mantenha o script junto às mudanças do produto.

A música não contém samples nem downloads: cinco acordes, plucks e efeitos de ar sintetizados com semente fixa. Execute `python scripts/compose-audio.py` nesta pasta para regenerar. WAV estéreo 48 kHz, duração exata de 20 s; procedência em `public/audio/provenance.json`.
Código e áudio original seguem a licença MIT do repositório. Fontes possuem SIL OFL nos arquivos em `public/fonts`. Remotion e outras dependências mantêm suas licenças próprias. Referências externas não foram incorporadas como assets.

## Verificação e limitações

`npm run lint` executa ESLint + TypeScript. A entrega teve 54 quadros finais gerados (27 por tema), incluindo cortes, e reprodução de ambas as versões no Studio com inspeção de amostras em movimento.
Composições confirmadas por CLI: 600 frames, 30 fps, 1920 x 1080.
`npm audit`: zero vulnerabilidades reportadas na verificação de 23/10/2026.
**Aviso preservado:** Remotion pede Zod 4.5.4, mas o override 4.6.7 corrige o alerta de segurança encontrado na instalação. Lint, listagem e capturas passaram; isso não prova compatibilidade com recursos de schemas não usados. Reavaliar o override quando o upstream atualizar.

Não houve exportação de MP4. A entrega é o projeto editável e suas duas prévias.
A avaliação do áudio foi técnica (duração, sinal, pico e pontos de sincronização), não uma auditoria de escuta humana. Não há validação final de mixagem em fones/alto-falantes ou vídeo codificado.
Leia `../../docs/REMOTION-PRESENTATION.md` e o parecer em `../../docs/THE-CRITIC-REMOTION.md`.

## Atualização da trilha - revisão 2

Motivo mais espaçado, pulso restrito às cenas do produto, dinâmica suave inspirada no ritmo observado em The Sea We Breathe e efeitos pontuais. Música e efeitos estão separados em `public/audio/music-stem.wav` e `effects-stem.wav`; o filme usa a soma em `legalgrowth-original.wav`. Detalhes, decisões, exercício e verificação: [AUDIO-SCORE.md](../../docs/AUDIO-SCORE.md).

## Textos finais — 23/10/2026

Revisão pontual em `src/Cinematic.tsx`: removidos os rodapés adicionais, os pequenos rótulos de contexto e os slogans. Títulos diretos apresentam campanhas, visão geral, investimento e análise de IA; a marca encerra o filme. As capturas reais mantêm seus próprios avisos de exemplo fictício. Os dois temas compartilham o mesmo texto; fontes, assets, áudio e duração não foram alterados.

Validação desta revisão: ESLint + TypeScript passaram; gerados dez quadros (60, 150, 270, 420 e 570 em cada tema), confirmando 600 frames a 30 fps. Evidências locais em `output/film-final-copy/`, a partir da raiz. THE CRITIC aprovou o ajuste pontual sem cortes ou colisões observáveis; sua revisão foi estática e não certifica áudio ou movimento. Não foi exportado novo MP4 nesta revisão.
