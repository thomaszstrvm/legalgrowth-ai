# Dossiês em evidência — v59 / v0.1.6

23/10/2026. Melhoria pontual solicitada pelo usuário sobre a base v0.1.5/v58.

## Decisão e implementação

A coleção real foi movida no template Jinja para imediatamente depois do
cabeçalho com contexto e indicadores, antes de `#message` e `#content`.
Ordem do DOM, leitura por teclado e composição visual concordam. Usar apenas
`order` no CSS alteraria a imagem sem corrigir a sequência de leitura.

O palco foi compactado: galeria desktop 444→424 px, celular 330→312 px;
respiro superior e margem após indicadores menores. As dimensões das capas,
ilustrações, paleta, Newsreader/Manrope e animações não foram alteradas.
O link passou de “Voltar aos resultados” a “Ver indicadores”, mantendo o
destino nativo `#results`. O alvo de toque mantém pelo menos 44 px.

Uma tentativa intermediária de apontar para `#content` revelou que o tratamento
existente de `popstate` re-renderiza o bloco e prejudica a rolagem da âncora.
Essa tentativa foi retirada: o destino anterior foi preservado, sem modificar
`app.js` ou `scene.js`. Não se ampliou o escopo para reformar a navegação.

O custo da prioridade pedida é explícito: recomendações e gráficos ficam depois
da coleção. Nenhum deles foi removido; os indicadores continuam antes dela.
Não há novas requisições, dependências, autoplay, regras de negócio ou migrações.

## Referências e critérios úteis

[Ferrari](https://www.ferrari.com/en-BR), inspecionada ao vivo: imagem dominante,
seleção manual do carrossel e ação relacionada ao item selecionado. Esses
princípios apoiam a presença antecipada da coleção e seu CTA próximo às capas.
Vídeo, tela inteira, autoplay, cores, fontes e imagens da Ferrari não foram
transferidos. A [Arc](https://www.arcmarumo.com/) continua a referência espacial
das publicações, já estudada em [ARC-INTERACTION-STUDY.md](ARC-INTERACTION-STUDY.md).

Impeccable layout e critérios seletivos de telas de aplicação: prioridade
conforme a tarefa, DOM coerente, densidade controlada, foco e alvos de toque.
Não foram usadas regras de landing page para transformar o painel.
`DESIGN.md` prevalece; apenas sua ordem vigente foi atualizada e sincronizada.

## Comparação reproduzível

Antes/depois usam exatamente a mesma fixture sintética, período 01–30/09/2026,
hash SHA-256 `8db8ba21d7aae627d4e5ee424f9ae1cdb760b720acb55f48ac075da374bd07b7`.
Em ambos os escopos, os dados são interceptados; “Real” significa testar a UI
desse escopo com fixture, nunca consultar registros de clientes.

| Largura | Início anterior da coleção | Início final |
| --- | ---: | ---: |
| 1440 | 1535 px | 447 px |
| 768 | 2290 px | 540 px |
| 390 | 2665 px | 679 px |
| 320 | 2844 px | 722 px |

Valores arredondados, escopo Demo, tema claro. Desktop 1440×900 mostra o início
e grande parte das capas; o rodapé da coleção exige pequena rolagem. No celular
a coleção começa depois dos indicadores, antes de todos os blocos analíticos.
Não foi prometida coleção completa na primeira tela do celular.

Evidências locais em `output/dossier-position-v59/`: `before/`, `after/`,
`scene-final/`, `comparison.html`. A pasta output é ignorada no Git; a entrega
versionada inclui PDF, capturas selecionadas e resumo das evidências.

## Validação e limites

- Matriz final: 119 verificações aprovadas; 16 combinações de 1440, 768, 390 e
  320 px × claro/escuro × Demo/Real, mais fallback sem JavaScript. 50 PNGs finais.
- Sem rolagem horizontal da página ou cortes nos controles; alvos mínimos 44 px.
  Ordem visual/DOM, cinco destinos, período/escopo, Enter, setas, Home/End,
  foco visível, redução de movimento e transição de 280 ms verificados.
- Matriz final sem erros de página/console/requisições inesperadas. Um aborto
  nativo foi registrado na execução inicial e preservado em `results-initial.json`.
- Suíte ampliada da cena: verificações de composição, teclado, erro/repetição e
  fallback; abortos nativos de ViewTransition permanecem registrados, com saída
  de falha quando presentes. Não há supressão nem alegação de causa resolvida.
  A execução complementar registrou dois abortos; a repetição final passou em
  14 grupos sem erros. Manifesto é salvo antes da asserção de erros para evitar
  perder evidências quando a suíte falha. Os registros anteriores foram mantidos.
- Python: 179 testes aprovados, seis avisos de depreciação preexistentes.
- Regras de períodos e exemplos estáticos aprovadas. Teste de concorrência
  confirmou descarte de respostas atrasadas, escopo isolado e mês independente.
- Dados sintéticos, sem benchmarks pagos, chamadas de IA ou mutações reais.
- Não houve nova auditoria completa das outras páginas nem validação em Safari.
  O OCR permanece uma interface técnica separada; engine e produção não validadas.

## Arquivos e manutenção

Produto: `app/templates/dashboard.html` (ordem e cache do CSS),
`app/templates/_workspace_scene.html` (texto do link), `app/static/arc.css`
(respiros e altura do palco). Arte, JavaScript e APIs permanecem iguais.
Testes: `scripts/browser-dossier-position.cjs`, `scripts/browser-scene.cjs`,
`scripts/browser-validator-review.cjs` (expectativa de prioridade atualizada).

## Entendendo o código

```jinja2
</header>
{% if page == 'overview' %}{% include '_workspace_scene.html' %}{% endif %}
<div id="message" role="status" aria-live="polite" tabindex="-1"></div>
<div id="content" aria-busy="true">Carregando…</div>
```

1. `</header>` fecha o contexto e os indicadores, que vêm primeiro na leitura.
2. O `if` limita a coleção ao Resumo; `include` reutiliza o componente existente.
   Remover o `if` faria a coleção aparecer nas outras páginas. Não há função
   nova, retorno ou exceção nova: Jinja continua renderizando o template no servidor.
3. `message` recebe avisos acessíveis sem reconstruir a cena.
4. `content` continua recebendo os resultados dinâmicos. Colocar a cena dentro
   desse nó faria o renderizador substituí-la ao atualizar resultados, perdendo
   seleção e eventos. Mantê-la como irmã preserva sua duração de vida no DOM.

**Conceitos:** ordem do DOM, progressive enhancement, foco, fragmentos de URL,
testes de regressão e separação entre apresentação e regras de negócio.

**Desafio:** explique por que mover a coleção com `order: -1` no CSS não garante
que um leitor de tela siga a mesma sequência visual. Proponha uma asserção que
detecte essa divergência, sem alterar o produto.
