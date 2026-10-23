# ViewTransition: fechamento da investigação v60

Data: 23/10/2026. Escopo encerrado após uma matriz fixa de oito casos, executada
uma única vez. Nenhum arquivo de produção, identidade visual ou funcionalidade
foi alterado por esta investigação.

## Resultado e decisão

**O aborto nativo registrado na v58 não foi reproduzido neste experimento. Sua
causa permanece não demonstrada.** Não se declara que foi corrigido, que o cache
era o responsável ou que existia uma regressão do produto.

Chrome **155.0.8059.86**, headless, viewport 1366 × 900, tema claro:

- **8/8 casos funcionais passaram**, com zero `pageerror`, falha de asserção ou
  violação de rede; código de saída 0.
- **24 GETs de API sintéticos**, zero mutação e zero chamada a provedor externo.
- **16 capturas**, duas por caso; hashes dos arquivos monitorados estáveis.
- Enter no dossiê Insights abriu `/painel/insights` nos oito casos, preservando
  `scope=demo`, `start=2026-09-01`, `end=2026-09-30`, campos e rótulo
  `01/09/2026 a 30/09/2026`.
- Nas quatro variantes instrumentadas, a chegada teve objeto ViewTransition e
  `ready`/`finished` resolvidos. Normal: animação CSS de 0,16 s. Movimento reduzido:
  `animation:none`, duração 0 s.

Recomendação sustentada: **preservar a implementação e o fallback nativo**.
Não adicionar catch global, remover a transição, atrasar a página artificialmente
ou modificar a identidade com base em causalidade não provada. O erro histórico
continua documentado em [VIEW-TRANSITION-CHROME.md](VIEW-TRANSITION-CHROME.md);
se voltar a ocorrer em uso real, tratar como nova evidência com cenário concreto.
Este ciclo está encerrado, sem repetição até obter um resultado desejado.

As outras matrizes executadas nesta mesma rodada v60 registraram três abortos
nativos: um na coleção e dois nos fallbacks, em Edge 155. Esses resultados foram
mantidos com saída 1 e estão consolidados em [CLOSURE-V60.md](CLOSURE-V60.md).
Portanto, a ausência de erro neste experimento Chrome não encerra o defeito nem
substitui os resultados das outras matrizes.

## Experimento delimitado

Gerador/teste: `scripts/browser-view-transition-final.cjs`.

Foi usado um **servidor fixture Node em loopback**, sem conexão com o servidor da
aplicação. O template atual foi renderizado com Jinja2 em processo Python isolado,
passando apenas página e usuário sintético `admin`. Não há importação de `app`,
configuração, `.env`, banco ou cliente de IA. JavaScript, fontes e CSS são os
arquivos locais atuais, sem reescrita. `/api/dashboard` e `/api/insights` existem
somente como respostas sintéticas no servidor do teste.

Não se usou `page.route` ou `context.route`. Isso evita desativar o cache HTTP
como efeito da interceptação Playwright. O cache foi controlado explicitamente
com `Network.setCacheDisabled` via CDP; estáticos recebiam `max-age=3600` e
HTML/APIs `no-store`. O CSP do fixture restringe conexões/recursos à própria
origem, e requests diferentes de GET ou APIs desconhecidas são registrados como
violações. Nenhuma credencial foi necessária.

Fatores fixados antes da execução:

| Instrumentação do documento | Cache HTTP | Movimento | Navegação e contexto | Eventos de chegada |
|---|---|---|---|---|
| Sem listeners | Habilitado | Normal | Passou | Não observados por desenho |
| Sem listeners | Habilitado | Reduzido | Passou | Não observados por desenho |
| Sem listeners | Desabilitado | Normal | Passou | Não observados por desenho |
| Sem listeners | Desabilitado | Reduzido | Passou | Não observados por desenho |
| Com listeners | Habilitado | Normal | Passou | ready + finished; 0,16 s |
| Com listeners | Habilitado | Reduzido | Passou | ready + finished; none/0 s |
| Com listeners | Desabilitado | Normal | Passou | ready + finished; 0,16 s |
| Com listeners | Desabilitado | Reduzido | Passou | ready + finished; none/0 s |

Cada caso usa contexto novo. A abertura do Resumo carrega os estáticos; a navegação
para Insights permite observar seu reuso. O dossiê foi focado pelo localizador e
ativado por `keyboard.press('Enter')`, não por clique JavaScript. Isso testa a
ativação por Enter, **não** o percurso completo por Tab desde a barra do navegador.
Após a chegada, a janela de observação é fixa, 700 ms, igual nos dois grupos.

O grupo sem instrumentação tem observação externa de `pageerror` e CDP/rede, mas
nenhum listener `pageswap`/`pagereveal` nem acesso a suas promessas. Ambos recebem
a mesma inicialização de tema/escopo. Ausência de eventos no grupo sem listeners
significa **não medido**, não ausência de animação.

## Saída, chegada, CSS e cache

Os eventos instrumentados incluem identificador próprio de documento, caminho,
relógio relativo `performance.now()`, visibilidade e estado de carregamento.
Relógios de documentos diferentes não são subtraídos como se tivessem a mesma
origem temporal.

- **Saída:** os quatro `pageswap` do Resumo receberam objeto ViewTransition.
  Não se capturou resolução/rejeição das promessas do documento de saída antes
  de sua destruição. Essa ausência não foi convertida em sucesso ou erro.
- **Chegada:** os quatro `pagereveal` de Insights receberam objeto; `ready` e
  `finished` resolveram. Os documentos estavam visíveis e `readyState=complete`.
- **Opt-in:** em todos esses eventos de saída/chegada, `arc.css` estava habilitado
  e a leitura CSSOM retornou `@view-transition { navigation: auto; }`. Tokens e
  style também estavam carregados. Não houve erro de leitura CSSOM.
- **Cache efetivo:** nas quatro variantes com cache, os três CSS na chegada
  tinham `transferSize=0` e corpo conhecido, com eventos de cache no CDP. Nas
  quatro sem cache, os três CSS tinham transferência positiva e corpo recebido.
  Isso confirma a diferença relevante de carregamento nesta matriz. Alguns
  recursos não CSS ainda aparecem em cache interno; não se afirma que todo
  mecanismo interno do navegador foi desativado.

O Chrome documenta objetos distintos em saída e chegada. A omissão da transição
no documento de saída pode rejeitar seu `ready` enquanto `finished` resolve.
Portanto, essas promessas não devem ser misturadas com as do destino.
[Fonte primária: Chrome Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).

`finished` pode resolver mesmo quando uma transição é omitida; `ready` confirma
a preparação dos pseudoelementos, mas não certifica fluidez ou uma animação visível
sob `animation:none`. Nesta matriz os dois foram registrados separadamente.
[Fonte primária: CSS View Transitions Level 1](https://www.w3.org/TR/css-view-transitions-1/).

O opt-in nas duas páginas e a estabilização de recursos que bloqueiam renderização
participam do mecanismo entre documentos. O registro CSSOM aqui confirma o estado
nos eventos observados, não revela cada decisão interna do compositor.
[Fonte primária: CSS View Transitions Level 2](https://www.w3.org/TR/css-view-transitions-2/).

## Por que isso não resolve a causa histórica

Na v58 ocorreram `InvalidStateError` com mensagem de opt-in desabilitado. O cenário
anterior tinha servidor autenticado, interceptação de rede, navegação para
Campanhas e outra revisão do produto. Este usa fixture local, Enter para Insights,
recursos atuais e resposta rápida. Há vários fatores diferentes entre as rodadas;
compará-las não isola uma única causa.

Dentro da nova matriz, não apareceu diferença de falha ao ligar/desligar cache ou
instrumentação. Isso não elimina intermitência nem prova equivalência entre os
ambientes. É uma amostra pequena, sem estatística de confiabilidade. Também não se
provocou skip: não há `skipTransition()` ou rejeição artificial neste experimento.

Ler CSSOM e gravar eventos síncronos em sessionStorage pode afetar timing. Capturar
promessas muda seu tratamento como rejeição não capturada. O braço sem listeners
serve como comparação limitada; não remove toda interferência de automação.
Não foram avaliados dispositivos físicos, todos os tamanhos/temas, perfil real,
extensões, headers de autenticação, latência de produção ou fluidez percebida.

## Evidências e reprodução

Pasta: `output/closure-v60/view-transition/`.

- `results.json`: casos, erros, asserções, eventos separados por documento,
  recursos/cache, requests do servidor e limites.
- `manifest.json`: hashes antes/depois e data de geração.
- `*-before-enter.png` / `*-destination.png`: foco e destino por caso.

Foram inspecionadas visualmente duas capturas representativas do caso instrumentado
sem cache/normal: foco no dossiê Insights e destino com período e demo corretos.
Isso não representa uma nova revisão visual de todas as telas.

```powershell
$env:NODE_PATH='C:/Users/KABUM/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node scripts/browser-view-transition-final.cjs
```

Requer Chrome, Playwright e `.venv/Scripts/python.exe` com Jinja2. O script sobe e
encerra seu próprio servidor; não exige a aplicação rodando. A execução ocorreu
com acesso autorizado a loopback fora do bloqueio do sandbox. `node --check` e
`git diff --check` também passaram. Um erro nativo, falha de asserção, acesso
inesperado ou mudança nos arquivos monitorados produz saída 1 e mantém evidências.

**Aprendizado:** teste funcional e observação de animação são coisas diferentes.
Um destino correto não prova que houve animação; uma animação omitida não prova
que a navegação falhou. Como exercício, explique por que o braço sem listeners
deve dizer “não observado” em vez de “nenhuma transição”.
