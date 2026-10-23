# Filme LegalGrowth AI - direção, implementação e evidências

Data: 23/10/2026. Revisão final v8 do filme; a versão do aplicativo continua v0.1.7/v60.

## O que mudou

Duas versões de 20 segundos, clara e escura, compartilham o mesmo roteiro. Cada uma mantém suas cores do início ao fim, incluindo UI e capas. O briefing mais recente pediu interfaces reais, gráficos e respeito a DESIGN.md; por isso substitui a abordagem ilustrada da v4. A exigência de linguagem simples permanece.

| Tempo | Cena | Recurso |
|---|---|---|
| 0-3 s | Seu marketing, mais claro | Capas existentes em profundidade e texto por máscara |
| 3-7 s | Uma visão do escritório | Aproximação sobre a captura real do Resumo |
| 7-11 s | Investimentos e resultados | Revelação do gráfico real, sem repetir os KPIs |
| 11-16 s | Análise e segunda revisão | Componente real com exemplo sintético curto; decisão humana explícita |
| 16-20 s | LegalGrowth AI | Marca, assinatura e resolução musical |

Não há promessa de operação automática de anúncios nem retorno garantido. A cena de IA é um exemplo: nenhum provedor executou uma análise nesta produção.

## Referências e o que foi observado

Análise visual em páginas públicas e trechos dos vídeos, não reprodução das peças nem avaliação auditiva:

- [Linear Agent](https://www.youtube.com/watch?v=mRql2VJ99gM): interface em perspectiva, aproximações e foco. Adaptado como câmera contida sobre o Resumo; não copiamos a interface nem o desfoque pesado.
- [Linear Reviews](https://www.youtube.com/watch?v=4r8YmQ6lfLo): contraste entre interface detalhada e tipografia ampla. Adaptado no ritmo entre produto e assinatura.
- [Raycast Focus](https://www.youtube.com/watch?v=ykaj0pS4A1A): nos trechos vistos, mãos, rosto e ambiente; alternância de detalhe e plano aberto. Referência de enquadramento, não evidência de animação de UI.
- [Notion Calendar](https://www.youtube.com/watch?v=C4Q2ezioTUM): UI real com recortes funcionais. Adaptado em enquadramentos que dirigem a atenção sem redesenhar a ferramenta.
- [Atlas](https://www.behance.net/gallery/240993011/Atlas-SaaS-Motion-Explainer), vídeo Vimeo 1149076405: camadas espaciais e entradas escalonadas. Adaptamos profundidade nas capas; não incorporamos neon, logos externos ou integrações fictícias. O case se descreve como conceitual.
- [Práticas oficiais Remotion](https://www.remotion.dev/docs/ai/skills): animação dirigida por frames, assets locais, carregamento de fontes e premount.

Pesquisas anteriores de texto e tipografia consultaram descrições públicas de livros, não a íntegra: StoryBrand 2.0 (2025), Digital Marketing Strategy, 4a ed. (2025), e Digital Marketing in Practice, 2a ed. (2026). A contribuição foi clareza da oferta, organização e medição; não receitas de frases de impacto.
Fontes: https://storybrand.com/building-a-storybrand-book-new/ ; https://www.koganpage.com/marketing-communications/digital-marketing-strategy-9781398622067 ; https://www.koganpage.com/marketing-communications/digital-marketing-in-practice-9781398624726 .

## Decisões e alternativas

O projeto Node fica isolado do FastAPI. A mídia não precisa de login ou APIs; não alteramos código em app/. Capturas e renderer originais evitam manter uma cópia fictícia do painel em React. O custo é perder interação ao vivo e precisar regenerar assets quando a UI mudar.
Um componente compartilhado recebe `theme`, troca paleta e arquivos reais. Isso evita que o roteiro ou tempo de uma versão fique diferente da outra. Alternativa rejeitada: duplicar os arquivos ou aplicar filter: invert, que altera cores sem respeitar o produto.
Newsreader e Manrope seguem DESIGN.md. As escalas de texto são próprias do filme; não foram aplicadas ao dashboard.
Sobreposições de 12 frames mantêm a cena anterior visível enquanto a máscara revela a próxima. Os inícios absolutos (0/90/210/330/480) mantêm o total de 600 frames. Não usamos timers nem animações CSS.
A trilha é sintetizada offline com semente fixa. Evita dúvidas de licença e envio a serviços; o trade-off é timbre sintético e necessidade de escuta humana para avaliar a qualidade musical.

## Entendendo o código

Em `media/legalgrowth-presentation/src/Cinematic.tsx`:

```ts
export function motionProgress(frame: number, start: number, length: number) {
  return interpolate(frame, [start, start + length], [0, 1], smooth);
}
```

1. `export function` disponibiliza a função para outras cenas e testes. Os três parâmetros são números, medidos em frames.
2. `interpolate` transforma a posição entre `start` e `start + length` em um progresso entre zero e um. `smooth` aplica uma curva cúbica e limita as extremidades. O retorno é um número usado por máscaras, escala e deslocamento.
3. A chave final encerra a função. Nenhum estado ou relógio externo é consultado: o mesmo frame produz o mesmo resultado.

Sem o clamp, a animação continuaria além do limite; sem easing, a velocidade seria linear, com início e fim mais abruptos. `length` precisa ser positivo: os valores atuais são constantes válidas; uma futura configuração externa precisaria de validação. A função não acessa rede ou disco. A limitação é uma única curva para movimentos de caráter diferente; outras curvas podem ser escolhidas por cena, se houver motivo.

Conceitos para estudar: função pura, interpolação, curvas de Bézier, composição temporal, recorte em coordenadas de origem, amostragem de áudio.
Desafio: altere a duração da máscara de 12 para 18 frames, ajustando a sobreposição sem alterar os 600 frames totais. Explique por que apenas aumentar a duração de uma cena causaria uma lacuna ou sobreposição incorreta. Não mude as APIs do produto.

## Verificações efetivas

- ESLint e TypeScript passaram na revisão final.
- CLI listou as duas composições em 1920 x 1080, 30 fps, 600 frames/20 s.
- 54 PNGs finais: 27 por tema, incluindo entradas, cortes e encerramento. Dimensões e cor de margem verificadas em todos.
- Hashes dos assets importados conferiram com o manifesto; TSX verificados contra mojibake detectado e caracteres substitutos.
- Reprodução dos dois temas no Studio iniciada do começo, com amostras visuais durante as cenas e encerramento; observação em torno de 30 fps. Isso não equivale a uma captura contínua inspecionada quadro a quadro.
- WAV: 48 kHz, estéreo, 960000 amostras por canal/20 s, pico -3,48 dBFS; RMS -16,86 dBFS (não é LUFS). Cues nos segundos 0/3/7/11/16. Sem avaliação auditiva humana nesta sessão.
- npm audit: zero vulnerabilidades reportadas. Aviso de versão Zod permanece documentado no README da mídia.
- Nenhuma alteração em app/, nenhuma chamada a provedor e nenhum dado real usado.

Evidências locais: `output/remotion-20s/final-light`, `final-dark`, `comparison.png`, `validation.json`, `npm-audit-final.json`. Esses arquivos de QA ficam fora do Git. O projeto e seus assets editáveis ficam versionados.

## Limitações

Não foi exportado MP4; entregar a prévia editável é o fluxo padrão da skill Remotion. A exportação pode ser feita no botão Render do Studio. Sem validação de codec ou mixagem final, sem versão vertical pronta, sem equivalência estética garantida às referências. Capturas congeladas demonstram a interface, não validam o backend. Leia o parecer independente em THE-CRITIC-REMOTION.md.
