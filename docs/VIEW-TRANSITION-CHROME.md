# ViewTransition no Chrome: investigação v58

Data: 23/10/2026. Escopo: instrumentação de QA, sem alteração de produção.

## Conclusão

O Chrome **155.0.8059.86**, em modo headless no Windows, reproduziu abortos nativos
`InvalidStateError: Transition was aborted because of invalid state. ViewTransition opt-in disabled`.
As navegações verificadas chegaram a Campanhas com o período e o escopo demo
preservados. Isso demonstra uma animação que pode ser omitida neste ambiente;
**não demonstra, por si só, regressão do produto nem defeito confirmado do Chrome**.

O script agora registra o erro integral, sem a antiga exceção que o retirava de
`pageerror`. As duas execuções terminaram com **código 1 por esses eventos nativos**.
Não houve falha de asserção funcional, outro tipo de erro JavaScript, acesso
externo, API não simulada ou mutação real. Portanto, não são execuções globais
“verdes”, mesmo com os destinos e controles funcionais preservados.

## O que mudou no teste

Arquivo: `scripts/browser-scene-motion.cjs`.

- `MOTION_CHANNEL=chrome` seleciona Chrome; o padrão permanece `msedge`.
- Registra versão do navegador, modo headless, `pageswap`, `pagereveal`, promessas
  `ready`/`finished`, nome e mensagem reais de rejeição, visibilidade, folhas CSS
  presentes e duração/nome de animação quando `ready` resolve.
- O link esperado é lido do DOM e validado por origem, caminho e query. Não exige
  mais um href antigo sem o contexto de período. O teste de toque também aceita
  a URL com query, sem confundir atualização de contexto com navegação.
- Mantém cada `pageerror` no JSON e retorna código 1 quando há algum deles.
  Mesmo uma falha de asserção preserva os diagnósticos coletados até aquele ponto.
- `MOTION_NAVIGATION_ONLY=1` executa a matriz curta: normal, movimento reduzido
  e interrupção controlada. O teste completo mantém ponteiro, teclado, toque,
  estabilidade dos dados/links e ausência de loop RAF ocioso.
- Manifesto guarda hashes antes/depois. Nenhum arquivo monitorado mudou durante
  cada execução. As duas execuções usam revisões de instrumentação ligeiramente
  diferentes: a segunda acrescenta a fase do teste aos eventos.

Só HTML e arquivos estáticos locais são lidos do servidor. Todas as APIs usadas
recebem fixtures sintéticas; método diferente de GET, outra origem e API sem mock
são bloqueados. O teste restringe a origem a loopback. A senha local é lida apenas
para autenticação, não é impressa nem incluída nas evidências.

## Resultados observados

Evidências: `output/maintenance-v58/motion/` e subpasta `full/`.

| Execução | Amostra | Resultado |
|---|---|---|
| Navegação dirigida | 1366/390 px, claro/escuro; 12 navegações + fallback sem JS | 5 abortos nativos; 24 GETs de API simulados; 4 capturas |
| Matriz completa | 4 combinações com mouse e 4 com toque emulado; 8 navegações + fallback sem JS | 3 abortos nativos; 20 GETs simulados; 28 capturas |

Na matriz dirigida:

- Normal: `ready` e `finished` resolveram em 2 de 4 casos; duração CSS de 0,16 s.
- Movimento reduzido: `ready` e `finished` resolveram em 2 de 4; animação `none`,
  duração 0 s. Nos demais, `pagereveal` não forneceu uma transição.
- Interrupção controlada: em 3 de 4 casos, havia uma transição para chamar
  `skipTransition()`. `ready` rejeitou com `AbortError` e mensagem
  `Transition was skipped. skipTransition() called`; `finished` resolveu.
  No quarto caso o navegador já não forneceu uma transição, portanto não foi
  possível executar o skip instrumental. Não se conta esse caso como skip testado.

Na matriz completa, **3 de 4 transições normais** chegaram a `ready` e `finished`
com duração CSS de 0,16 s. **2 de 4 reduzidas** chegaram às mesmas promessas, com
`none`/0 s. Os outros três casos corresponderam aos abortos nativos registrados.
Ponteiro, retorno ao sair/focar, movimento reduzido, toque sem tilt, dados/links
preservados e contadores RAF ociosos passaram nos oito grupos aplicáveis.
O link nativo sem JavaScript chegou a Campanhas nas duas execuções.

Essas contagens são observações desta amostra pequena, não taxas de confiabilidade.
O padrão variou entre execuções: por exemplo, normal escuro/390 não recebeu uma
transição na primeira e completou na segunda. Isso impede atribuir o resultado
apenas ao tema ou à largura. As três folhas CSS do produto estavam presentes em
`document.styleSheets` nos eventos de chegada registrados, inclusive nos fallbacks;
isso **não prova** o valor do opt-in no instante interno em que o navegador decidiu
abortar. Não foi capturado trace interno que determine a causa desse instante.

## Como interpretar as promessas

Há objetos diferentes na página de saída (`pageswap`) e na de chegada
(`pagereveal`). A documentação do Chrome descreve a rejeição de `ready` na saída
quando o documento fica oculto, com `finished` resolvido. Isso não deve ser
confundido automaticamente com um problema na página de chegada.
[Fonte primária: Chrome Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).

`ready` resolvido informa que os elementos da transição foram preparados;
`finished` pode resolver mesmo quando a transição foi omitida. Assim, o teste
registra ambos separadamente. Mesmo `ready` não certifica fluidez percebida nem
animação visível: em movimento reduzido, o CSS define `animation:none`.
[Fonte primária: CSS View Transitions Level 1](https://www.w3.org/TR/css-view-transitions-1/).

O modelo entre documentos exige mesma origem e opt-in nas duas páginas, e depende
do momento de renderização. A especificação define caminhos de omissão quando o
novo documento não opta por participar. Sua semântica ajuda a interpretar a
mensagem, mas não identifica a causa concreta nesta aplicação. A versão consultada
é um Working Draft, não uma garantia sobre todos os detalhes de implementação.
[Fonte primária: CSS View Transitions Level 2](https://www.w3.org/TR/css-view-transitions-2/).

O código atual tem `@view-transition { navigation:auto; }` em `arc.css`, duração
160 ms e `animation:none` sob movimento reduzido. Esta investigação não adicionou
listeners, captura de erros, chamadas de skip ou alterações CSS ao produto.

## Reprodução e limites

Servidor local ativo e ambiente de teste com Playwright/Chrome instalados:

```powershell
$env:NODE_PATH='C:/Users/KABUM/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:MOTION_CHANNEL='chrome'
$env:MOTION_NAVIGATION_ONLY='1'
$env:MOTION_OUTPUT='output/maintenance-v58/motion'
node scripts/browser-scene-motion.cjs
```

Use `MOTION_NAVIGATION_ONLY=0` para a matriz completa, com outra pasta de saída.
`node --check scripts/browser-scene-motion.cjs` e `git diff --check` passaram.
O sandbox bloqueou loopback com `ERR_NETWORK_ACCESS_DENIED`; a execução local
autorizada fora desse bloqueio permitiu reproduzir os casos. Isso não é um erro
da aplicação nem foi misturado às contagens acima.

Limites:

- Headless com toque emulado, não aparelho físico nem sessão manual no Chrome.
- Interceptação Playwright desativa cache HTTP; isso pode alterar timing.
- Listeners e handlers de promessa são instrumentação. Observar a rejeição muda
  seu tratamento como rejeição não capturada; não equivale a uma correção real.
- Eventos/promessas do documento destruído podem não chegar ao gravador Node.
- Skip explícito é interrupção provocada pelo teste, não duplo clique real nem
  cancelamento espontâneo. Seus `AbortError` são separados dos `InvalidStateError`.
- Capturas são estados pontuais. O teste não mede frames do compositor, FPS,
  fluidez percebida, todos os navegadores ou desempenho de clientes reais.

Não há recomendação de remover a transição ou ocultar o erro com um catch global.
Se a investigação continuar, a próxima evidência útil é um trace/reprodutor mínimo
que compare carregamento de CSS com e sem interceptação, preservando mocks de API.
Isso deve ser uma investigação delimitada; repetir indefinidamente esta matriz não
estabelece causalidade.
