# Trilha original do LegalGrowth - revisão 2

Data: 23/10/2026. Alteração apenas de áudio; imagens, duração, temas e funcionalidades preservados.

## Direção

Trilha instrumental original de 20 segundos, sintetizada localmente sem samples, música baixada ou serviços de IA. A mesma mixagem acompanha os temas claro e escuro.

A base anterior tinha notas a cada meio segundo. Esta revisão usa motivo mais espaçado, acordes suaves, pulso somente durante produto/resultados e resolução no logotipo. Evita um efeito em cada movimento.

| Tempo | Arranjo |
|---|---|
| 0-3 s | Entrada suave, três notas, sem percussão |
| 3-7 s | Primeiro gesto de ar, entrada do pulso, crescimento do painel |
| 7-11 s | Segundo gesto de ar e progressão musical sobre o gráfico |
| 11-16 s | Retirada do pulso para dar espaço à leitura; contato sutil na capa |
| 16-20 s | Acorde de resolução, nota grave discreta e cauda com saída gradual |

## Inspiração adicional: The Sea We Breathe

Referência visitada: https://www.bluemarinefoundation.com/the-sea-we-breathe/ e /journeys/.
Foi observada a abertura sobre ondas, a indicação de inspirar/expirar, a troca espaçada de mensagens e a passagem para a seleção de jornadas em profundidade. O próprio site informa que usa áudio para ampliar a experiência.
A adaptação é de ritmo: os pads têm um ciclo suave de amplitude de seis segundos, entre 82% e 100%, além de entradas e saídas longas. Não foram copiados água, partículas, identidade, gravações ou música. O áudio da referência não foi analisado auditivamente nesta sessão; não alegamos semelhança musical.

## Como editar

Em `media/legalgrowth-presentation/scripts/compose-audio.py`:
- `harmony`: acordes e pontos de mudança em segundos.
- `melody`: momento, nota MIDI e intensidade de cada nota.
- `breath`: ciclo de amplitude aplicado aos acordes.
- `place`: mistura um evento mono em uma faixa estéreo.
- `compose`: devolve as faixas separadas de música e efeitos.

Execute `python scripts/compose-audio.py` na pasta da mídia, com NumPy instalado. Os três WAVs em public/audio têm 48 kHz, estéreo e 20 s. Os stems usam o mesmo ganho do master: somados, reconstituem a mixagem com diferença máxima de uma unidade PCM por arredondamento. Isso permite ajustar efeitos sem recompor a música.
A composição compartilha um único Audio e inclui `?score=2` no endereço para invalidar o cache anterior. Não muda o roteiro. Código e áudio seguem a MIT do projeto; não há material externo incorporado.

## Entendendo a função central

Trecho de `place`, após validar a entrada e calcular o ponto de corte:

```python
count = min(len(signal) - source_start, len(track) - destination_start)
if count <= 0:
    return
gains = np.sqrt(np.array([1 - pan, 1 + pan]) / 2)
track[destination_start:destination_start + count] += (
    signal[source_start:source_start + count, None] * gains
)
```

1. `min` limita o evento ao espaço restante; impede extrapolar os 20 segundos.
2. Se não há amostras para inserir, retorna sem alterar a faixa.
3. A raiz quadrada distribui a energia entre os canais. `pan=0` divide igualmente; -1 e +1 levam o evento aos lados.
4. O intervalo seleciona somente o trecho de destino.
5. `None` transforma o vetor mono em uma coluna; o broadcasting do NumPy aplica dois ganhos e produz estéreo.
6. `+=` soma o som ao que já existe, em vez de apagar o acorde anterior.

`track` é alterado no lugar e a função não retorna áudio. Valores não finitos e panorama fora de [-1,1] geram ValueError. Remover o limite pode causar incompatibilidade de dimensões; trocar += por = apaga sons sobrepostos. O limitador de pico é aplicado depois da soma, nunca em cada evento isolado.

Desafio: reduza somente os efeitos de ar pela metade, regenere os WAVs e execute os testes. Explique por que o ganho final do master pode mudar mesmo com a música inalterada. Não altere os 20 segundos.

## Verificações

- ESLint e TypeScript passaram.
- Exportações somente de áudio via Remotion: LegalGrowth20s e LegalGrowth20sDark, 600 frames cada, WAV de 20 s.
- PCM idêntico entre os temas e fiel ao master com tolerância de uma unidade de quantização.
- Sem saturação de amostras; amostras inicial/final zeradas; soma dos stems e determinismo verificados.
- Limites temporais, eventos fora da faixa, NaN e panorama inválido testados.
- Pico de amostras -4,01 dBFS; RMS -19,70 dBFS. RMS não equivale a LUFS.
- A tentativa de medir LUFS/pico verdadeiro com FFmpeg falhou porque a distribuição embarcada não inclui ebur128. Não apresentamos medição inexistente.
- Sem escuta humana ou certificação de mixagem em fones/caixas. O aviso conhecido de Zod permanece; não foi escondido.

Rodar testes: `python scripts/test-audio.py` dentro de media/legalgrowth-presentation.

Para repetir as exportações de QA, nessa pasta:

```powershell
npx remotion render src/index.ts LegalGrowth20s ../../output/remotion-audio-v2/light.wav --codec=wav --port=3005
npx remotion render src/index.ts LegalGrowth20sDark ../../output/remotion-audio-v2/dark.wav --codec=wav --port=3005
```

Os valores e a trilha descritos no relatório visual v8 são históricos; esta revisão substitui somente o áudio daquela entrega. Evidências: output/remotion-audio-v2/validation.json e logs dos renders.
