# Manutenção v58 — contexto, clareza e CSS

Data: 23/10/2026. Marco: v0.1.5, sobre v0.1.4/v57.

## Achados apresentados antes de editar

O doctor do Impeccable encontrou somente `design-sidecar-stale`: o auxiliar
`.impeccable/design.json` ainda descrevia capa navy e navegação lateral, embora
`DESIGN.md` já estabelecesse a direção editorial operacional e navegação horizontal.
O problema era documental, não prova de falha na aplicação.

Em Ideias de conteúdo, `app/agents/analysis.py` já fornece `evidence.date`.
A data ficava nas evidências recolhidas, não no cartão. Notícias repetia avisos
de demonstração no cabeçalho, cobertura e mensagem, além de repetir fonte/data
no mesmo artigo. O bloco `.insight-start` tinha regras sobrescritas em dois CSS.
Os abortos de ViewTransition ainda exigiam reprodução; não foram assumidos como
regressão. Esses achados e o recorte foram comunicados antes das alterações.

## Taste Skill: aplicação seletiva

Fonte pública: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill),
com leitura do [fluxo de aplicações](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/references/app-screens.md).
Não foi instalada uma nova dependência ou substituído o CSS pelo kit da skill.

| Critério | Decisão no LegalGrowth |
|---|---|
| Contexto temporal e evidência perto da conclusão | Data do indicador visível, sem confundir com data de acesso ou filtro de campanhas. |
| Zero, ausência e erro têm sentidos diferentes | Preservados CPQ/CPH e valores ausentes. Data inválida não vira uma data inventada. |
| Avisos concisos e conteúdo estático identificado | Aviso central com período fixo; marcadores de fonte fictícia e limites das análises continuam. |
| Conferir telas e estados em várias larguras | Capturas sintéticas, dois temas, teclado, falhas e reflow equivalente a 200%. |
| Manter valores antigos durante atualização | Não aplicado. Novos filtros não podem mostrar resultados de outro período. |
| Paleta, tipografia, títulos pequenos e sorteio de estilo | Preferências estéticas, não defeitos funcionais. DESIGN.md, Newsreader/Manrope e capas prevalecem. |
| Regras de landing page e bibliotecas sugeridas | Não aplicadas ao painel existente. Nenhuma troca de tecnologia. |

A própria referência distingue observações de uma amostra de telas desktop de
regras do autor; as orientações móveis não resultam de uma amostra móvel.
Esses critérios são apoio, não certificação de usabilidade ou qualidade.

## Alterações e preservações

- `app/static/app.js`: `recommendationDate()` apresenta a data fornecida pelo
  indicador em um elemento `time`; ausência ou data impossível recebe texto
  explícito. Não altera ordenação, aprovação, cálculo, APIs ou persistência.
- O aviso de demonstração informa período fixo, dados fictícios e ausência de
  execução. Em Notícias, foram retirados parágrafos repetidos da demonstração.
  Fonte/data duplicadas dentro do mesmo artigo foram unificadas. Nos dados reais,
  cobertura parcial, custos, agendamento e limites continuam disponíveis.
- `app/static/arc.css` passa a ser o único proprietário das regras específicas
  de `.insight-start`; as regras antigas em `style.css` foram removidas. As
  propriedades finais e os dois breakpoints foram preservados, não redesenhados.
- Assets receberam versões de cache: style 21, arc 58, app 27.
- `DESIGN.md`, tokens, fontes, arte, contratos, cálculo, banco e carregamento de
  períodos não foram alterados. O refactor é delimitado: outros trechos de CSS
  histórico ainda precisam de consolidação gradual.

Período persistente, mês financeiro independente, identificação de despesas,
avisos de cobrança/globalidade, CPQ/CPH, resultados antes dos dossiês e isolamento
das demonstrações permanecem critérios obrigatórios.

## Impeccable sincronizado

`doctor --json`: nenhuma pendência após a sincronização. A narrativa antiga foi
corrigida, a amostra de navegação atualizada e os breakpoints extraídos do CSS.
As rampas de cor são metadados de prévia, não novas cores usadas pelo produto.

SHA-256 de DESIGN.md antes/depois:
`83a3d7a84cfa9290d1d2ed813a7e9de4cbf529677184e83df6a68297c102c04e`.

O diretório `.impeccable/` continua local e ignorado. A cópia revisada e sem
segredos está em [design/impeccable-sidecar.json](design/impeccable-sidecar.json).
Para restaurar esse auxiliar nesta revisão, na raiz do projeto:

```powershell
New-Item -ItemType Directory -Force .impeccable | Out-Null
Copy-Item docs/design/impeccable-sidecar.json .impeccable/design.json
```

Se DESIGN.md mudar depois, reextraia os metadados; não altere somente a data para
esconder divergência. O hash em `extensions.source` permite conferir a origem.
Esse auxiliar não é carregado pelo sistema em produção.

## Verificações executadas

- Linha de base v57: 175 grupos, 162 capturas; sem falhas.
- Matriz pós-alteração: 156 grupos de telas/estados aprovados, 162 capturas no
  total incluindo capturas de interação. Larguras 320/390/768/1024/1440, ambos
  os temas, 11 páginas; reflow de 200% emulado, não zoom físico certificado.
- Primeira execução também tinha 21 grupos de interação: três falharam porque
  procuravam a frase anterior do aviso. Atualizadas apenas as expectativas,
  os **21 grupos finais passaram**, com seis capturas e nenhum erro JS ou acesso
  inesperado. Os arquivos do produto não mudaram entre essas duas execuções.
- CSS: todas as propriedades calculadas de 50 elementos em dez combinações
  permaneceram idênticas. Resultado em `output/maintenance-v58/css-parity.json`.
- 179 testes Python passaram; seis avisos de depreciação existentes.
- `test-period-context.cjs`, `test-demo-examples.cjs` e `browser-period-race.cjs`
  passaram. Resposta atrasada, rascunho, escopo, mês independente e envio com
  contexto aplicado foram exercitados; dois POSTs simulados, nenhum POST real.
- Detector estático do Impeccable: 140 achados, sendo 136 consultivos e quatro
  avisos. Os avisos tratam de bordas de capítulo/feedback e decoração de bloco;
  já pertencem à identidade existente. Os consultivos apontam principalmente
  tamanhos e raios fora da escala resumida no frontmatter. Não foram ocultados
  nem tratados como 140 defeitos funcionais. Não houve auditoria WCAG completa.

Evidências locais em `output/maintenance-v58/`: `before/`, `after/`,
`interactions-final/`, `css-parity.json`, `impeccable-detect.json` e `comparison.html`.
Os manifestos distinguem a revisão dos scripts da revisão dos arquivos do produto.

## ViewTransition e OCR: limites explícitos

[Investigação no Chrome](VIEW-TRANSITION-CHROME.md): foram reproduzidos abortos
nativos em Chrome 155.0.8059.86 headless, com navegação e contexto preservados.
As execuções mantêm código 1 pelos eventos registrados. Não foi determinada
causa raiz, nem aplicada supressão de erros ou alteração de produção.
`finished` resolver não prova que a animação foi exibida.

[Unlimited-OCR](UNLIMITED-OCR.md) continua uma frente separada: há interface
técnica opcional, mas engine, isolamento de execução, classificação por página
e avaliação seguem pendentes. Não está integrado ou validado em produção.
Nenhum cliente real, provedor pago ou benchmark foi usado nesta manutenção.

## Entendendo o código

```javascript
function recommendationDate(r){
  if(r.category!=='mercado')return '';
  const date=r.evidence?.date;
  if(typeof date!=='string'||!window.LegalGrowthPeriod.validDate(date))return '<p class="rec-meta">Data do indicador não informada.</p>';
  return `<p class="rec-meta">Data do indicador: <time datetime="${esc(date)}">${dt(date)}</time></p>`;
}
```

1. A função recebe uma recomendação já usada pelo renderizador e retorna HTML.
2. A saída antecipada restringe o acréscimo à categoria mercado. Sem ela,
   recomendações de orçamento passariam a mostrar uma data que não lhes pertence.
3. O encadeamento opcional lê a evidência sem falhar quando ela está ausente.
4. A validação compartilhada aceita apenas data de calendário real. Sem essa
   linha, JavaScript pode normalizar 30 de fevereiro para março e induzir erro.
5. `time` fornece a data ISO para ferramentas; `dt` apresenta dia/mês/ano e
   `esc` protege o atributo HTML. Usar a data atual aqui seria inventar evidência.
6. A chave final encerra a função. `recs()` a chama no cartão, antes do texto.

Não há I/O, gravação ou exceção deliberadamente lançada. O contrato espera um
objeto de recomendação; a função não substitui a validação da resposta da API.
Reusar o validador evita duas regras de calendário diferentes, ao custo de uma
dependência já existente em `period-context.js`. Uma biblioteca nova seria
desproporcional. O custo é constante por cartão e não exige nova requisição.

**Conceitos para estudar:** cascata CSS, testes de regressão, HTML semântico,
validação de calendário e separação entre estado aplicado e rascunho.

**Desafio:** acrescente ao teste sintético um indicador de 29/02/2024 e outro de
29/02/2025. Explique por que apenas um deve aparecer como `time`, sem usar a data
de acesso como substituta. Não há solução pronta nesta documentação.
