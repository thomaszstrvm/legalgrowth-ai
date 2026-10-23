# LegalGrowth — arquivo espacial inspirado no Arc

Data: 22/10/2026. Escopo: apresentação e navegação para áreas existentes.

Registro da implementação inicial. O refinamento posterior está documentado em
[PORTFOLIO-REFINEMENT.md](PORTFOLIO-REFINEMENT.md): a galeria passou para depois
de todo o conteúdo analítico, com nova escala tipográfica e controles móveis.
As medidas e notas de revisão abaixo pertencem à versão inicial.

## O que foi feito

A capa azul anterior foi substituída por uma galeria de cinco dossiês com
lombadas, ilustrações originais, perspectiva e seleção central. Cada dossiê
abre uma rota existente: campanhas, relatórios, orçamento, insights e
oportunidades. A navegação completa continua disponível no topo; no celular,
usa o menu já existente. Dados, relatórios e formulários ficam fora da cena.
Após a primeira crítica, indicadores e contexto do período passaram a aparecer
antes da galeria. O palco foi reduzido, a moldura ficou mais leve e os controles
passaram a nomear os destinos adjacentes. A orientação de abertura permanece
visível no celular, com um link explícito fora da ilustração.

O Arc foi inspecionado ao vivo nesta rodada: objeto central, disposição em arco,
moldura escura, controles periféricos e deslocamento acionado pelo usuário.
`output/design-review/references/arc-current.png` registra a referência estável.
O resultado pode ser comparado em `output/design-review/reference-comparison.html`
e `reference-side-by-side-arc.png`; a versão anterior está em `round4-before`.

## Decisões técnicas

- CSS 3D e SVG inline, sem biblioteca nova ou WebGL. São cinco objetos simples;
  um motor 3D aumentaria dependências e manutenção sem necessidade funcional.
  A simulação não oferece a materialidade e iluminação de objetos renderizados.
- Links HTML nativos continuam responsáveis pela navegação. O JavaScript apenas
  centraliza a seleção e atualiza a legenda; não conhece APIs, chaves ou clientes.
- `arc.css` substitui `identity.css` na página, em vez de adicionar uma terceira
  camada visual. A base `style.css` continua ativa para preservar componentes.
- Sem autoplay. Movimento responde à ação; preferência por movimento reduzido
  elimina transições. Teclas ficam restritas à cena para não afetar formulários.
- Imagens da referência não entram no produto. As capas são construídas em HTML
  e SVG. A imagem folio de 1,7 MB não é mais solicitada pelo dashboard. Não foi
  executado benchmark de desempenho nem medido tempo de carregamento.

Segurança e escalabilidade: não há alteração em backend, autenticação, banco,
integrações ou tratamento de dados. As legendas usam `textContent`; a cena não
injeta HTML recebido de serviços. O trabalho por seleção é proporcional a cinco
capas fixas. A separação de arquivos facilita revisão, mas exige manter a ordem
da cascata CSS documentada em `DESIGN.md`.

## Como funciona

`dashboard.html` inclui `_workspace_scene.html` somente no Resumo. O servidor
produz os links. `scene.js` encontra a cena, registra eventos de foco, botões e
teclado. `selectCover` calcula posições; `arc.css` converte essas posições em
transformações. `app.js` mantém seus fluxos e preenche indicadores e tabelas.

## Entendendo o código

Função central em `app/static/scene.js`:

```javascript
function selectCover(index) {
  current = (index + covers.length) % covers.length;
  covers.forEach((cover, position) => {
    let offset = position - current;
    if (offset > covers.length / 2) offset -= covers.length;
    if (offset < -covers.length / 2) offset += covers.length;
    cover.style.setProperty('--offset', offset);
    cover.style.setProperty('--distance', Math.abs(offset));
    cover.style.zIndex = covers.length - Math.abs(offset);
    cover.dataset.active = String(position === current);
  });
  scene.querySelector('[data-scene-title]').textContent = covers[current].dataset.title;
  scene.querySelector('[data-scene-description]').textContent = covers[current].dataset.description;
  scene.querySelector('[data-scene-open]').href = covers[current].href;
  const previousTitle = covers[(current - 1 + covers.length) % covers.length].dataset.title;
  const nextTitle = covers[(current + 1) % covers.length].dataset.title;
  scene.querySelector('[data-scene-prev-title]').textContent = previousTitle;
  scene.querySelector('[data-scene-next-title]').textContent = nextTitle;
  scene.querySelector('[data-scene-prev]').setAttribute('aria-label', `Dossiê anterior: ${previousTitle}`);
  scene.querySelector('[data-scene-next]').setAttribute('aria-label', `Próximo dossiê: ${nextTitle}`);
}
```

1. Declara a função; `index` é a posição solicitada pelos eventos da cena.
2. O resto da divisão faz o último item retornar ao primeiro e permite voltar
   uma posição a partir do primeiro. É suficiente para os deslocamentos atuais.
3. Percorre os elementos capturados do HTML; `position` é o índice de cada um.
4. Calcula a distância com sinal entre a capa e a seleção central.
5. Move índices distantes do lado direito para o lado esquerdo do arco circular.
6. Faz o ajuste correspondente no sentido contrário.
7. Envia a posição com sinal ao CSS, que define deslocamento e rotação.
8. Envia a distância absoluta para profundidade e tratamento visual lateral.
9. Coloca capas próximas do centro na frente das mais distantes.
10. Marca qual capa está ativa; o CSS a apresenta sem escurecimento lateral.
11. Fecha a iteração; todas as capas agora têm posições coerentes.
12. Atualiza o título da legenda usando texto, sem interpretar HTML.
13. Atualiza a descrição, na região que anuncia a seleção a leitores de tela.
14. Faz o link externo à capa abrir o mesmo destino que ela, já definido no HTML.
15. Obtém o nome anterior usando a mesma normalização circular.
16. Obtém o próximo nome, retornando ao início quando necessário.
17. Mostra o nome do destino anterior no controle correspondente.
18. Mostra o nome do próximo destino no outro controle.
19. Atualiza o nome acessível do botão anterior para leitores de tela.
20. Atualiza o nome acessível do botão seguinte.
21. Encerra a função. Não há retorno explícito: o resultado é a atualização DOM.

A função captura `covers`, `scene` e `current` do escopo externo: isso é uma
closure. Não faz rede e não possui exceção deliberada. Depende das legendas,
links e controles existirem na partial e de receber índices gerados pelos eventos. Remover a
normalização circular faria as setas ultrapassarem a coleção; remover os ajustes
de distância quebraria a disposição circular; substituir `textContent` por
`innerHTML` seria desnecessário e ampliaria o risco de injeção.

Limitação: para aceitar índices arbitrariamente negativos em uma API pública,
a normalização precisaria tratar múltiplas voltas negativas. Essa não é uma API
pública e seus eventos só geram a posição atual ±1 ou os extremos válidos.

## Testes e validação

- `pytest -q`: 113 passaram; duas advertências de depreciação existentes
  (Starlette/httpx e pypdf `add_js`).
- Matriz visual: 88 capturas, 11 telas × quatro larguras × dois temas; sem
  transbordamento da página, erros JS ou mutações.
- Cena: dez combinações de largura/tema, botões, foco, setas locais, Home/End,
  ciclo, Enter, redução de movimento e links sem JavaScript. Também foi verificado
  que a animação normal termina com a seleção centralizada e que sete pares da
  paleta de cena/capas atingem 4,5:1 antes do escurecimento das capas laterais.
- Interações: menu/Escape, foco, rolagem tabular, retenção e nova tentativa de
  formulário, troca de provedor, downloads visíveis e reflow de 320px. 32 pares
  de tokens de texto com contraste ≥4,5:1. Isso não é auditoria WCAG completa.
- Estados: vazio sintético, ciclo do resumo, gráfico móvel e nomes longos.
- Insights: 24 capturas, troca de papéis, revisão com falha fechada, provedores
  simulados, persistência de tema e menu móvel.
- Oportunidades/notícias: 18 capturas, zero versus ausente, conteúdo escapado,
  falha e recuperação de escopo, respostas fora de ordem; sem chamadas pagas.
- Comparador: 54 combinações, nove referências, três telas, duas versões;
  imagens carregadas e nenhuma requisição externa.

Somente dados sintéticos nos testes. A revisão visual independente deve ser
lida com o parecer do THE CRITIC, sem transferir notas de versões anteriores.

## Resultado da revisão independente

O agente personalizado foi convocado com o tipo real `visual_critic`, em duas
rodadas de inspeção de imagens. A primeira deu **7/10 — revisão necessária**
([parecer](THE-CRITIC-ARC-ROUND1.md)); indicadores depois da galeria eram o
principal impedimento. As correções levaram a **8/10 — aprovado com ressalvas**
([segunda revisão](THE-CRITIC-ARC-FINAL.md)), sem achados críticos ou altos.

Depois desse parecer, os rótulos móveis foram aumentados para 12px. A primeira
verificação detectou 360px de palco em 320px de largura; foi reduzido o padding,
e o teste passou novamente com altura máxima de 355px. Essa última alteração
pontual teve inspeção visual do implementador, dez combinações da cena e matriz
rápida de 12 capturas. A matriz completa de 88 e os testes de interação tinham
sido repetidos após a correção estrutural, antes desse ajuste tipográfico.

A ressalva restante é uma hipótese de uso: a galeria ainda separa indicadores e
gráfico. Validar com pessoas se isso dificulta acompanhar resultados; não há
evidência nesta rodada para afirmar prejuízo ou benefício no tempo de tarefa.
O crítico avaliou imagens, não certificou interação, acessibilidade ou desempenho.
Não houve uma terceira nota nem aprovação artificial para atingir 9.

## Conceitos para estudar e desafio

Closure, eventos DOM, melhoria progressiva, propriedades CSS customizadas,
transformações e testes de interação. Exercício: explique por que o evento de
teclado foi registrado em `scene` e acrescente um teste para comprovar que
Shift + seta para a direita não muda o dossiê selecionado.
