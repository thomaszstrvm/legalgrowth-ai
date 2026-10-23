# Encerramento v60 / v0.1.7

23/10/2026. Escopo do PDF de encerramento fornecido pelo usuário: corrigir a
legenda sem JavaScript, investigar ViewTransition de forma delimitada e entregar
dois PDFs distintos. A base v0.1.6/v59 e o reposicionamento aprovado foram preservados.

## Correção pequena, estado inicial seguro

`_workspace_scene.html` entrega `.scene-footer` com `hidden`. Os cinco links das
capas continuam presentes. `scene.js` configura eventos e seleção antes de revelar
rodapé, controles e classe `scene-ready`. O cache do script passou de 19 para 20.
Não houve mudança de CSS, fontes, cores, arte, APIs, modelos ou regras de negócio.

Alternativa rejeitada: mudar “Abrir Campanhas” por outro título fixo manteria a
ambiguidade quando a faixa fosse rolada. Ocultar a ação somente em um `catch`
também não cobre falha no download do script. O estado seguro precisa vir do HTML.

Não se reconstruiu o painel inteiro sem JS. Com JS integralmente desativado,
os links mantêm seus destinos nativos anteriores, sem o contexto acrescentado por
`app.js`; seleção de tema também requer JS. Na falha apenas de `scene.js`, `app.js`
continua propagando escopo e período. Esses limites foram registrados, não ocultados.

## Testes executados nesta rodada

| Verificação | Resultado atual | Evidência local |
|---|---|---|
| Coleção: 1440/768/390/320 × claro/escuro × Demo/Real | 119 asserções passaram; 1 aborto nativo; saída 1 | `output/closure-v60/collection/results.json` |
| JS desativado e scene.js bloqueado, quatro larguras/dois temas | 16 grupos passaram; 2 abortos nativos; saída 1 | `output/closure-v60/fallback/results.json` |
| ViewTransition: matriz fixa Chrome, cache/instrumentação/movimento | 8 casos funcionais, 0 erros; saída 0 | `output/closure-v60/view-transition/results.json` |
| Páginas da apresentação nos dois temas | 16 verificações, 0 falhas/erros | `output/closure-v60/presentation/results.json` |
| Python, sem carregar .env | 179 aprovados, 6 avisos de depreciação | execução pytest nesta rodada |
| Regras de período, exemplos estáticos, corrida de respostas | aprovados; escopo/mês preservados, zero API real | scripts `test-period-context`, `test-demo-examples`, `browser-period-race` |

As verificações da coleção incluem ordem, ausência de overflow, dimensões dos
controles, cinco destinos, escopo/período, Enter, setas, Home/End, foco, movimento
reduzido e animação normal. Os fallbacks verificam cinco links, ausência da ação
dinâmica, foco/Enter e ausência de overflow. Mensagens `ERR_FAILED` do bloqueio
intencional são guardadas como diagnóstico esperado; outros erros continuam
fazendo a suíte falhar. `ViewTransition` não é filtrado.

O tema escuro sem JS é imposto por estado DOM apenas no teste para conferir o CSS.
Isso não significa que o botão de tema funcione sem JavaScript. Dados de ambos os
escopos são interceptados por fixtures; nenhum registro real de cliente é lido.

Os resultados v59 foram preservados, não contados como executados nesta rodada.
A comparação pixel a pixel de aberturas encontrou 15/16 idênticas. A diferença
restante ficou na região da capa ativa, 3281 pixels; não se atribuiu causa por
suposição nem se declarou paridade absoluta. O crítico não observou regressão
visual. Geometria e identidade continuam preservadas pelos testes e inspeção.

## ViewTransition: decisão de encerramento

A investigação fez uma única matriz de oito casos fixos em servidor fixture
próprio, sem .env/banco/roteamento Playwright, comparando cache real e listeners.
Enter abriu Insights preservando Demo e 01–30/09/2026. Opt-in CSSOM estava
presente; as quatro chegadas instrumentadas resolveram ready e finished.
As promessas da saída não foram observadas antes da destruição do documento.

O experimento não reproduziu o erro, mas as outras duas matrizes desta mesma
rodada registraram três abortos. Portanto, a causa continua não demonstrada.
Não há alteração especulativa, catch global, remoção de asserção ou repetição
até obter verde. [Investigação detalhada](VIEW-TRANSITION-FINAL.md), incluindo
fontes primárias, reprodução, impacto, hipóteses e limitações.

## PDFs efetivamente produzidos

- `output/pdf/LegalGrowth_Encerramento_Tecnico_v0.1.7.pdf`: cinco páginas A4,
  decisões, correção, evidências, testes atuais, ressalvas e mentoria.
- `output/pdf/LegalGrowth_Apresentacao_Cliente.pdf`: doze páginas 16:9,
  português simples, dossiês destacados, capturas finais e limites comerciais.

Cópias versionadas em `docs/releases/`. Texto autoral selecionável; capturas são
imagens de telas reais renderizadas com dados fictícios. Não são demonstrações
de execução paga. Exemplos estáticos de IA, notícias e oportunidades são explícitos.
Nenhum preço, cliente, depoimento, ganho medido, certificação ou garantia foi criado.
OCR e contratos reais continuam fora do uso operacional.

As fontes locais Newsreader e Manrope foram incorporadas aos PDFs. Como ReportLab
não aplica eixos variáveis, foram instanciadas em peso 400 exclusivamente para
exportação. A ferramenta fontTools está em `output/pdf-tooling`, ignorado pelo Git;
não entrou nas dependências da aplicação. Não houve alteração dos arquivos de fontes.

Reprodução dos PDFs requer ReportLab/Pillow e fontTools 4.60.1 para a ferramenta
de exportação. O script `scripts/build-final-pdfs.py` lê as capturas de QA locais.
Todas as 17 páginas foram renderizadas com Poppler e inspecionadas visualmente;
texto/paginação também são conferidos com pypdf. O gerador usa limites de página
para detectar extrapolação de texto, mas isso não substitui a revisão visual.

## Entendendo o código

```javascript
selectCover(current);
scene.querySelectorAll('.scene-control').forEach(button => { button.hidden = false; });
scene.querySelector('.scene-footer').hidden = false;
scene.classList.add('scene-ready');
```

1. `selectCover` recebe o índice atual e sincroniza capa, título, descrição e
   destino. Seu retorno não é usado. Removê-la poderia revelar uma legenda antiga.
2. `querySelectorAll` encontra os controles já configurados; `forEach` os revela.
3. O rodapé é revelado somente depois de existir uma seleção coerente.
4. A classe ativa o layout 3D. Se a inicialização anterior falhar, esse marcador
   não é atingido e os links continuam na faixa nativa. Não há exceção silenciada.

Essa sequência síncrona não adiciona chamadas de rede nem armazenamento. A vantagem
é reduzir estados intermediários enganosos; a limitação é que ela não oferece um
painel operacional sem JS nem recupera automaticamente uma falha de download.

**Conceitos:** progressive enhancement, estado inicial seguro, ciclo de vida do
DOM, atributos HTML, cache de assets e observabilidade.

**Desafio:** explique por que esconder o rodapé apenas dentro de um `catch` não
cobre falha no carregamento do arquivo `scene.js`. Não há solução pronta.
