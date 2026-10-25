# Revisão técnica independente - portfólio escuro

25/10/2026. Base: `c072cbc45fb77f9cadf2147ecbde5371b34625fb`.
Recorte: incremento local de `LegalGrowth20sDark`, versão 1.1.1 ainda local.
Revisor único: `film_technical_review`, convocado com `gpt-6-astra`, esforço
`high`. A ferramenta aceitou essa configuração; não é atestado independente
do modelo em runtime. O revisor não implementou nem editou arquivos.

## Parecer

**Sem bloqueador técnico encontrado no incremento escuro**, em revisão de código
somente leitura. Há um achado documental menor, não corrigido nesta etapa.

1. **Isolamento:** `Cinematic.tsx:131-132`, `207-226`, `356` e `424-430`
   condicionam as mudanças a `dark`. A sombra constante em `251` equivale ao
   resultado anterior de `light`. Nenhuma regressão de código no claro foi
   identificada como consequência deste incremento.
2. **Duração e contratos:** `Root.tsx:9-20` mantém 600 frames, 30 fps,
   1920 x 1080. `Composition.tsx:24-69` conserva entradas 0/90/210/330/480,
   término em 600 e sobreposições de 12 frames; trilha mantida em `:21`.
   Root, Composition e visuals não têm diff contra HEAD.
3. **Asset:** `Cinematic.tsx:217-218` recorta `[1030,585,850,220]` de um PNG
   2880 x 4332; o limite (1880,805) permanece dentro da imagem. `visuals.tsx:140-179`
   amplia pixels, sem reconstruir números; largura 1400 produz altura 362,35.
   SHA-256 do asset coincide com `public/asset-provenance.json`:
   `8175e04d394445402bbb3d0006129eafb9e77393c152d2adfaa779659108a81c`.
4. **Conteúdo:** exemplo fictício em `:222`, outra IA em `:356`, coerente com
   `docs/AI.md:5`, e projeto demonstrativo em `:427`. Sem nova promessa de retorno,
   precisão garantida ou prontidão para produção.
5. **Escopo histórico:** a alteração V7 de ResultsScene afeta ambos os temas e
   precede este incremento. O patch preservado contra HEAD inclui V7; não é um
   patch exclusivo das mudanças escuras.

## Achado menor mantido para decisão posterior

`media/legalgrowth-presentation/README.md:35` orienta manter a mesma história nos
temas, mas o escuro agora tem roteiro próprio. A menção a textos iguais em `:66`
é histórica, porém falta indicação atual inequívoca da divergência.

Impacto: uma manutenção futura pode desfazer a diferenciação intencional.
Menor correção proposta: nota atual explicando tempos compartilhados e textos/
enquadramento próprios no escuro, com link para o registro V7. **Não executada.**

## Evidências e limites

- [Recibo](receipt.json): hashes de 12 arquivos, caminhos relativos à raiz.
- [Patch completo de Cinematic contra HEAD](Cinematic-vs-HEAD.patch).
- [Página inspecionada do relatório anterior](report-page-1.png): imagem de PDF,
  não captura de frame do filme.
- [Gerador anterior preservado](report-generator.py): cópia literal, não executada
  nesta revisão; contém caminhos locais da geração original.
- [PDF já existente](../../../output/pdf/film-dark-portfolio-2026-10-25.pdf) e
  [registro técnico V7](../../FILM-CORRECTION-V7.md) permanecem no PC.

Não foram executados novos testes, navegador ou render. TypeScript e ESLint com
código 0 são evidências anteriores comunicadas pelo implementador, não testes
independentes desta revisão. Seus logs originais não estavam salvos como arquivos;
nenhum log foi reconstruído ou apresentado como original.

O revisor não certificou leitura dos pixels/valor 12, contexto de mesmo período,
contraste, transições, áudio ou fluidez. O painel escuro permanece visível até
ser coberto pela máscara seguinte; aceitação estética cabe à revisão visual
separada. Parecer interno não substitui o Validador externo.

O integrador mantém o achado documental e essas ressalvas. Nenhuma correção foi
aplicada. Sem commit/push, instalação, mudança de extensão ou servidor. Nenhuma
ação foi negada; fontes confirmadas estáveis ao término da revisão independente.

## Encerramento pontual aprovado - 25/10/2026, pedido 08:36 UTC

O gancho escuro agora é "Como acompanhar suas campanhas?", exibido em três
linhas no layout existente: Como / acompanhar / suas campanhas?. No frame 60,
fonte 104 px, largura útil e scrollWidth de 880 px; alturas 243 e 127 px nos
contêineres. Screenshot inspecionado na ferramenta, sem captura persistida.
A medição e hashes estão em `hook-delta-0836.json`; o delta isolado desta rodada
está em `hook-delta-0836.patch`. O parecer anterior permanece histórico.

Comparação automática com a cópia anterior confirmou somente duas strings
condicionais dark alteradas no TSX. Texto claro, tempos, fontes, animações,
transições e enquadramento permaneceram iguais. README agora explica a narrativa
de portfólio exclusiva do escuro, atendendo ao achado documental menor.

TypeScript --noEmit e ESLint de Cinematic.tsx executados novamente, ambos código 0;
git diff --check passou. Não foram reconstruídos logs originais. Sem reprodução
contínua, correção de máscara, nova revisão independente, render ou publicação.

## Fechamento autorizado para publicação privada - 25/10/2026

Gancho final: "Como acompanhar suas campanhas?". O parecer técnico independente
anterior não encontrou bloqueador no incremento escuro; seu achado de README foi
resolvido no delta das 08:36, junto à troca de frase aprovada. Os hashes de TSX e
README foram comparados ao recibo desse delta antes da publicação; evidências de
TypeScript/ESLint aprovadas foram reutilizadas, sem repetir testes nem navegador.

Limites mantidos: não há MP4 final exportado, certificação de áudio/fluidez contínua
ou teste em telefone físico. Foi comunicado recorte de letras no frame 212 da
transição; impacto em velocidade normal não comprovado. Máscara não alterada por
hipótese. MotionVideo e possíveis adaptações não foram inspecionados/implementados
neste fechamento. A referência Oyin possui relatório local informado pelo usuário;
nenhum ativo ou implementação dessa referência foi incorporado aqui.

Publicação inclui fontes/manifests/lock e registros textuais. PNG da página do PDF,
gerador com caminhos locais e PDF permanecem somente no PC; links desses itens
neste parecer são locais e não prometem disponibilidade no GitHub. Recibos e
patches anteriores são históricos (seus hashes não descrevem alterações posteriores).
A mudança V7 de Orçamento anterior ao incremento escuro também integra o pacote;
a preservação do claro neste incremento não significa ausência dessa mudança V7
compartilhada em relação ao commit base. Sem novos logs inventados ou dados reais.

Nota de conferência do índice: `git diff --cached --check` sinalizou três linhas
com espaço final nos arquivos `.patch`; são linhas vazias de contexto do formato
unified diff, preservadas para não adulterar as evidências históricas. A checagem
excluindo somente esses dois snapshots passou; não há alerta nas fontes/docs.
Varredura direcionada da allowlist não encontrou padrões de tokens, chaves privadas,
URLs com credenciais ou caminhos pessoais absolutos. Não é garantia universal de
secret scanning; os arquivos também foram conferidos quanto ao conteúdo do escopo.
