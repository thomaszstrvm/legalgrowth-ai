# Filme LegalGrowth — composição v4

Data: 23/10/2026. Escopo: propaganda Remotion horizontal, temas claro e escuro.

## Resultado e motivo

O cartão de análise recortado do sistema criava um retângulo atrás do texto e uma hierarquia inadequada ao filme. A primeira correção removeu a caixa, mas o usuário também rejeitou a pilha de título, subtítulo e exemplo. A v4 substitui essa pilha por duas mensagens sucessivas: “Análise de IA” e “Segunda revisão”. Não há frase técnica, caixa ou subtítulo nessa cena. A capa permanece como contraponto visual.

Instrument Sans Medium (500) passa a conduzir os títulos do filme. A fonte já estava no repositório, com arquivos estáticos e licença SIL OFL; não houve download, dependência nova ou negrito artificial. Newsreader permanece na marca e nas capas. O painel e DESIGN.md não foram modificados. Essa é uma adaptação audiovisual solicitada pelo usuário, não uma alteração do sistema visual do aplicativo.

## Referências pesquisadas e aplicação

- [Microsoft Loop / NotReal](https://www.motiondesignawards.com/project/882/microsoft-loop): a página registra Video of the Year 2022. O player e quadros foram examinados. Aplicação: objeto dominante, profundidade discreta e atenção sequencial. Cores, objetos e áudio não foram copiados.
- [Dropbox Design Sizzle / BIEN](https://www.thisisbien.com/portfolio/sizzle): o estúdio [registra prata no Collision Awards 2025, Craft–Motion Design](https://www.thisisbien.com/news-post/bien-wins-at-collision-awards). Player examinado em amostras. Aplicação: redução da leitura simultânea e alternância de foco entre mensagem e material de marca. Não é uma demonstração comercial idêntica ao nosso formato.
- [Squarespace / DIA](https://dia.tv/project/squarespace/) e [registro One Show 2019](https://www.oneclub.org/awards/theoneshow/-credit/16295/2019/): Gold Pencil em Typography / Dynamic / In Motion aparece no índice pesquisado. Sua disciplina tipográfica foi referência documental. A mídia antiga retornou erro/404; não alegamos ter assistido ao filme completo.
- [Instrument Sans, fonte original](https://github.com/Instrument/instrument-sans/blob/master/README.md): neo-grotesca com pesos próprios. A escolha de Medium privilegia contornos claros e uma leitura rápida. Alternativas avaliadas: Manrope, que o usuário rejeitou nesta apresentação, e Newsreader, preservada apenas nos elementos de identidade. Nenhuma família externa foi adicionada.

## Implementação

`media/legalgrowth-presentation/src/Cinematic.tsx` concentra a escala, a composição e a animação. `Composition.tsx` fornece o tema à máscara de entrada. `Root.tsx`, interfaces reais, dados sintéticos, assets das capas, APIs e áudio permanecem sem alterações.

A cena de gastos agora diz “Investimento” e “Acompanhe os gastos”, correspondendo ao recorte exibido. A máscara ganhou uma base opaca da mesma cor do tema, impedindo que restos do título anterior apareçam junto do novo. A assinatura teve seu alinhamento óptico ajustado.

### Entendendo a troca de mensagens

```tsx
const firstOut = motionProgress(f, 2.05 * fps, 0.25 * fps);
const secondIn = motionProgress(f, 2.35 * fps, 0.65 * fps);
```

`f` é o quadro local da cena; `fps` transforma segundos em quadros. A primeira linha inicia a saída após 2,05 s e termina após 2,30 s. A segunda inicia a mensagem seguinte após 2,35 s, levando 0,65 s para chegar à posição e opacidade finais. São valores normalizados entre zero e um, usados em `opacity` e `translate`.

As janelas separadas evitam letras superpostas. Se a segunda entrada começasse antes da primeira saída, a transição poderia parecer texto duplicado. Como os valores dependem do quadro, procurar um instante no Studio e capturá-lo produz o mesmo estado; não há temporizadores nem animação CSS dependente do relógio. A limitação é que uma tradução longa exigiria outro enquadramento.

Desafio de estudo: numa cópia da composição, aumente em 0,2 s a duração da segunda entrada sem alterar os 600 quadros totais. Confira se as duas mensagens ainda têm tempo de leitura suficiente.

## Verificação e limites

- `npm run lint`: ESLint e TypeScript passaram após as alterações.
- 44 PNGs finais, 22 por tema, em 1920×1080, incluindo entradas, cortes e a troca de texto. Saída local: `output/film-composition-v4/`.
- Composições conferidas pelo renderer: 600 quadros, 30 fps, 20 segundos.
- Áudio original preservado: 960.000 amostras por canal, 48 kHz, estéreo, 20 s. Pico de -4,01 dBFS e sinal em cada janela de um segundo. Isso não substitui uma escuta humana da mixagem.
- O filme contém a mesma faixa de música e efeitos nas duas composições, sem mute na composição. Não foi adicionada narração.
- Reprodução iniciada no Chrome nos dois temas, com controles de áudio habilitados e avanço de quadros observado. A prévia oscilou de 29 FPS a aproximadamente 1–2 FPS durante a inspeção. A causa não foi isolada; não há certificação de fluidez nem de sincronização audiovisual em tempo real. A consulta de avisos/erros do console da aba retornou lista vazia. Capturas `playback-dark.png` e `playback-light.png` registram a inspeção.
- As verificações visuais são amostrais. Não foi produzido MP4 nesta revisão; a entrega continua sendo o projeto e o Studio. Não há versão vertical pronta nem certificação de reprodução em celular.
- O aviso de versão Zod já documentado permanece. Nenhuma dependência foi alterada para suprimi-lo.

## Revisão independente

THE CRITIC examinou a composição v3, identificou sobreposição de títulos durante uma máscara e incompatibilidade entre a chamada e o gráfico. Ambas foram corrigidas e reavaliadas. Após a nova solicitação do usuário, a v4 passou a usar mensagens sucessivas e Instrument Sans.

Na revisão final da v4, o agente permanente `visual_critic` examinou a prancha e 14 PNGs dos dois temas. Parecer: aprovação com ressalvas, 8,4/10, exclusivamente sobre evidências estáticas. Não encontrou cortes, colisões, caixa atrás dos textos ou sobreposição das duas mensagens. Considerou equilibrados texto/capa e o alinhamento final de AI. A nota não certifica qualidade de portfólio.

Ressalvas: há uma breve pausa sem texto por volta do quadro 399; com a prévia instável, seu ritmo ainda requer avaliação em reprodução fluida. Retirar o exemplo reduz a demonstração da análise, em troca de leitura mais direta. A cena agora anuncia a capacidade; não apresenta uma análise real. O crítico não certificou som, reprodução contínua ou celular. Nenhuma dessas limitações foi escondida por alteração de testes.
