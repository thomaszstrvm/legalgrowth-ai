# Arc Marumo — estudo de interação e código público

Consulta: 23/10/2026. Referência principal solicitada pelo usuário: [Arc](https://www.arcmarumo.com/).

## O que foi examinado

Interação real no Chrome: setas entre projetos, arraste da coleção, alternância B&W, entrada e saída de Profile, controle de retirada da fita no perfil e abertura do projeto Pollen. Foram vistas capturas durante o deslocamento e durante o ruído de troca de página. O checkbox da fita mudou seu estado acessível; as capturas pontuais não permitem avaliar toda a trajetória da fita. Não houve envio de formulários, contato ou acesso privado.

A leitura de código limitou-se ao HTML, CSS e bundles JavaScript públicos entregues pelo site. Não é acesso ao repositório original, aos arquivos de autoria nem uma auditoria integral. Arquivos de terceiros foram guardados somente em `output/design-review/design-engineering-v1/arc-source`, ignorado pelo Git; não são incorporados ao produto ou redistribuídos na release.

## Como a referência foi construída

| Observação | Evidência técnica pública | Interpretação |
|---|---|---|
| Capas são objetos com espessura e iluminação | Módulo `1gh2i6gkorm5q.js`: materiais MeshStandardMaterial para capa, verso e aresta, textura de canvas e rugosidades diferentes | O volume participa da composição; não é somente sombra de um card. |
| Coleção percorre um arco e acomoda após o arraste | Módulo acima: cálculo de arco, velocidade, amortecimento e springTo | Movimento preserva continuidade espacial e desacelera até o projeto selecionado. |
| Ponteiro inclina o objeto central | Rotação dos grupos recebe a posição amortecida do ponteiro, ponderada pela proximidade do centro | A resposta ajuda a perceber o objeto selecionado. |
| A velocidade muda a postura da coleção | Termo de squash e rotação em função da velocidade, com limites | A distorção faz parte da física visual, não do conteúdo do projeto. |
| Cena parece uma tela curva | Fragment shader remapeia coordenadas com curvatura e descarta áreas externas | É uma deformação de renderização, não uma simples borda arredondada. |
| Desgaste varia nas capas | `drawWear` produz manchas, riscos e pequenas marcas com gerador determinístico | A textura ajuda a contar a história de uma coleção VHS. |
| TV analógica e ruído de troca | CSS `.vhs-crt`, bandas RGB, vinheta e animação; ruído foi visto na navegação Home/Profile/projeto | Linguagem narrativa coerente com vídeo, mas deliberadamente invasiva para leitura prolongada. |
| Links têm distorção breve | Keyframes de recorte, deslocamento, skew e sombras cromáticas | Pequena assinatura de interação da marca, independente da navegação. |
| Movimento reduzido é considerado | Media queries e leitura de prefers-reduced-motion no código | Existência de condições não certifica conformidade de todos os efeitos; não foi feita auditoria assistiva da Arc. |

Fontes primárias: [módulo da coleção](https://www.arcmarumo.com/_next/static/immutable/chunks/1gh2i6gkorm5q.js), [funções de movimento](https://www.arcmarumo.com/_next/static/immutable/chunks/1gvz9m-n0qmop.js), [CSS público](https://www.arcmarumo.com/_next/static/immutable/chunks/24l721ux8dkx7.css). Nomes dos bundles são temporários e podem mudar numa publicação futura.

A busca por palavras isoladas não foi usada como prova: por exemplo, ocorrências de scanline em outro bundle pertencem a um decodificador de imagem, não ao efeito CRT.

## Adaptação no LegalGrowth

- Capas próprias em SVG com campo gráfico amplo; Orçamento ganha planos que chegam à borda, Relatórios amplia a dobra e Insights integra a lente à composição de IA.
- O mesmo desenho identifica o capítulo interno. Uma versão óptica simplifica detalhes em telas pequenas. Isso liga abertura e operação sem transformar os dados em decoração.
- Inclinação pequena da face ativa com ponteiro de mouse, limitada a 3°/2°, com retorno ao sair. Usa CSS e requestAnimationFrame sob demanda; não adiciona Three.js nem um render loop contínuo.
- Teclado, toque e preferência por movimento reduzido mantêm a face estável. Links e controles existentes continuam sendo o caminho principal.
- Navegação entre documentos recebe transição nativa curta nos navegadores compatíveis. Links normais são o fallback; não há interceptação de rotas nem atraso artificial.
- Mantidas cores próprias de papel/tinta em cada tema. Sem logotipo, fotografia, textura proprietária ou código copiado da Arc.

Não foram transferidos: filtro CRT sobre números, ruído intermitente, bloqueio do scroll da página, carregador de abertura, monocromia como nova configuração ou arraste obrigatório. A função diária do LegalGrowth pede leitura estável e acesso imediato. Essa escolha segue o briefing de preservar usabilidade e funcionalidades.

## Limites

Capturas são amostras, não medições de duração ou taxa de quadros da referência. Não foi executado benchmark de GPU nem feito teste em hardware móvel físico. O código público é minificado e pode conter caminhos não executados. O estudo descreve mecanismos observados, sem afirmar que todo o site foi auditado.

Evidências locais: `output/design-review/design-engineering-v1/references/`; comparação de composições em `comparison.png`. Não confundir essas capturas da referência com imagens distribuídas pelo LegalGrowth.
