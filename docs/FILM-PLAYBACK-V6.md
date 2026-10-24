# Filme 1.1.0 - ritmo e reprodução

23/10/2026. Duas composições, 600 frames a 30 fps, 1920 x 1080. Aplicativo, dados e regras de negócio não foram alterados.

## O que mudou

- Imagens estáticas usam `Img`, com `pauseWhenLoading` e premount; evita a necessidade dos canvas intermediários de `CanvasImage` para assets sem efeitos de pixel. Fontes, crops e arte permanecem locais. Não foi medida a memória total de GPU; não atribuímos a queda antiga de FPS a uma causa isolada.
- Capas laterais abrem sucessivamente, em vez de surgirem como um bloco. Câmera do dashboard chega antes, reservando leitura. Mensagens de IA continuam separadas e a segunda começa 0,1 s antes.
- A máscara acompanha a base opaca da cena nova. Após revisão independente, títulos e capturas com dados saem antes de a borda cortá-los. Capas mantêm a continuidade visual. Essa escolha evita fragmentos tipográficos e não adiciona efeitos ou dependências.
- Diagnóstico optativo `?playbackQA=1` registra quadros efetivamente entregues pela composição e buffers do Web Audio. Sem esse parâmetro, o observador de áudio não é instalado. A sobreposição diagnóstica fica fora do vídeo.
- Música e efeitos originais preservados integralmente. Os marcos principais seguem 3, 7, 11 e 16 s.

## Decisão técnica e alternativas

Um contador instantâneo do Studio não é evidência suficiente de travamento. Registramos uma passagem inteira, sem seek, loop ou perda de foco. A linha de base com CanvasImage já entregou 30,007 FPS; portanto a queda anterior de 1-2 FPS não foi reproduzida continuamente nem teve causa comprovada. A troca para Img é uma simplificação preventiva, não uma explicação retrospectiva demonstrada.

Usar apenas duração do WAV também não prova sincronismo. O player usa Web Audio, não um elemento HTML audio. O observador acompanha `AudioBufferSourceNode.start` sem mudar seus argumentos. Cada buffer é identificado por 24 amostras PCM comparadas ao WAV original. O validador calcula a posição sonora a partir do relógio de saída do navegador, independentemente do número do frame.

Alternativas: um segundo player ou um relógio simulado produziriam números sem validar o som real e foram descartados. Gravar microfone/loopback físico seria necessário para testar alto-falantes e Bluetooth; isso não foi realizado. A instrumentação optativa exige recarregar antes de cada medição e não é telemetria de usuários, não transmite dados nem persiste informações fora dos arquivos locais de teste.

## Reprodução dos testes

1. Inicie `npm run dev` em `media/legalgrowth-presentation`.
2. Abra cada composição com `?playbackQA=1`, recarregando a página antes de cada passagem. Volte ao frame zero, velocidade 1x, volume 1, sem mute e sem loop.
3. Mantenha a aba em primeiro plano. Clique Play e deixe terminar sem renderizações concorrentes ou busca na timeline.
4. Copie o JSON do elemento visível `output[data-playback-audit]` para um arquivo. O relatório precisa chegar ao frame 599.
5. Na raiz, com Python + NumPy:

```powershell
python media/legalgrowth-presentation/scripts/analyze-playback.py output/film-motion-v6/chrome-light.json output/film-motion-v6/chrome-dark.json output/film-motion-v6/iab-light.json output/film-motion-v6/iab-dark.json --output output/film-motion-v6/validation.json
```

As evidências anteriores ficam em `output/film-playback-v5`; a revisão final fica em `output/film-motion-v6`. O resumo final é versionado em `docs/validation/film-1.1.0.json`. Dados sintéticos exclusivamente. Não executar o validador com Python `-O`, que desativa seus asserts de integridade.

## Critérios e limites

Critérios locais: pelo menos 99% dos frames observáveis, 29,5-30,5 FPS, p95 de intervalo até 50 ms, nenhuma pausa acima de 100 ms; áudio com p95 do desvio até um frame e máximo de 50 ms. Nenhuma passagem em background é aceita. Buffers precisam cobrir os 20 s sem lacunas e corresponder ao PCM original.

Esses limites são critérios deste projeto, não uma norma científica de percepção. Commits React não equivalem à medição óptica do monitor. `getOutputTimestamp` estima o relógio de saída do dispositivo, não mede o som no ouvido. Reprodução sem erros não certifica mixagem artística, dispositivos móveis ou todas as máquinas. Não houve exportação MP4 nesta revisão.

## Entendendo o código

Função central em `src/Cinematic.tsx`:

```ts
export function motionProgress(frame: number, start: number, length: number) {
  return interpolate(frame, [start, start + length], [0, 1], smooth);
}
```

- A primeira linha declara três números: quadro atual, início e duração do movimento. O retorno é um número.
- `interpolate` transforma o intervalo de quadros em progresso de 0 a 1. `smooth` aplica easing cúbico e limita valores fora do intervalo.
- A última linha encerra a função. Não há relógio externo, efeitos colaterais nem aleatoriedade; seek, playback e renderer calculam a mesma pose.
- O chamador converte o progresso em rotação, deslocamento, opacidade ou máscara. Duração inválida pode causar erro da biblioteca; os chamadores usam constantes positivas.
- Sem clamp, valores poderiam exceder os limites; mudar o easing altera aceleração e percepção de peso. Encurtar a duração exige revisar legibilidade e som, não só compilar.

Conceitos para estudar: interpolação, easing, relógios independentes, percentis e amostragem. Desafio: crie uma cópia de um relatório, introduza um atraso de áudio conhecido e demonstre que o validador o rejeita; não modifique os registros originais.

## Parecer independente

THE CRITIC revisou 36 PNGs inicialmente e encontrou fragmentos tipográficos nas transições. A correção antecipou a saída dos títulos e das capturas com dados. Reinspeção de 20 PNGs finais: aprovado com ressalvas, 8,4/10, sem bloqueios visuais estáticos. O crítico não certificou reprodução, som ou celular. A pausa curta entre mensagens de IA continua uma decisão de ritmo, a ser observada em movimento. Não foi alterada a nota para cumprir uma meta.

## Pesquisa

Referências recentes da Anthropic, OpenAI e BUCK, literatura e limites de observação estão em [FILM-RESEARCH-MOTION-SOUND.md](FILM-RESEARCH-MOTION-SOUND.md). Elas orientam foco e continuidade; assets e música de terceiros não foram incorporados.

## Resultados finais executados

| Ambiente | FPS | Quadros observados | Maior intervalo | Desvio m�ximo do �udio |
|---|---:|---:|---:|---:|
| Chrome claro | 30.000 | 599/599 | 48.0 ms | 23.83 ms |
| Chrome escuro | 30.008 | 599/599 | 48.2 ms | 25.78 ms |
| Codex claro | 29.954 | 598/599 | 68.7 ms | 25.66 ms |
| Codex escuro | 30.003 | 599/599 | 62.6 ms | 24.16 ms |

Quatro passagens finais completas passaram nos crit�rios. No tema claro do Codex houve um quadro n�o observado; n�o afirmamos zero omiss�es em todos os testes. Nenhum intervalo excedeu 100 ms. Os 469 buffers por passagem cobriram 20 s e todos tiveram correspond�ncia PCM. ESLint + TypeScript passaram. Tr�s casos negativos foram rejeitados: atraso artificial de 100 ms, pausa reportada de 250 ms e remo��o de um buffer. Os registros originais foram preservados.

Registros completos das quatro passagens: `docs/validation/film-1.1.0-observations.zip`. Implementa��o: commit `178caaa`. Manifesto com SHA-256 dos arquivos centrais e do WAV acompanha o resumo. O diagn�stico existe s� no projeto audiovisual; nenhuma coleta foi adicionada ao aplicativo FastAPI.
