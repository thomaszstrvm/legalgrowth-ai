# Continuidade entre os dossiês e as áreas de trabalho

Data: 23/10/2026. Base: v38. Revisão independente: v40. Acabamento atual: v41. Somente apresentação.

## Problema e decisão

A v38 já tinha uma composição consistente no Resumo. Recomeçar essa página
apenas para aumentar uma nota arriscaria perder os avanços anteriores. O desnível
mais visível estava nas páginas internas: cabeçalhos grandes e formulários com
tratamento genérico, desconectados das capas da galeria.

A direção adotada conserva a dupla página do Resumo e leva a identidade dos
dossiês aos destinos. O cabeçalho interno fica mais compacto, com título,
descrição e gravura; as áreas de edição recebem uma superfície discreta e a cor
do capítulo. Relatórios usa uma coluna de criação menor e um arquivo com datas
mais legíveis e downloads próximos. Nenhum texto de produto, cálculo, campo,
handler ou endpoint foi acrescentado ou removido.

## Referências efetivamente examinadas

- [Arc Marumo](https://www.arcmarumo.com/): objeto editorial, identificação e
  controle pertencem à mesma linguagem. Visitada novamente; captura atual em
  `editorial-v7/references/arc.png`. Aplicação: a gravura e a cor da capa continuam
  presentes ao abrir seu destino. Não copiamos o CRT, imagens nem marcas.
- [Boc Studio — Work](https://boc.studio/work): projetos agrupados como unidades
  identificáveis, com metadados e ações próximos. Visitado novamente; captura
  `boc-work.png`. Aplicação: datas com presença tipográfica e downloads agrupados
  no arquivo de relatórios. Não transplantamos sua cor laranja ou fotografias.
- [Attio](https://attio.com/): visitado na abertura e na demonstração pública de
  produto. Captura `attio-product.png`. Referência de separação entre conteúdo,
  controles e contexto. A demonstração é promocional, não uma sessão privada do
  CRM nem evidência de equivalência funcional com o LegalGrowth.
- Herman Miller, Nova Dental, Standards e Nexora permanecem no comparador como
  referências históricas, identificadas dessa forma. Não foram revisitadas neste
  ciclo.

## Alterações

1. `app/static/arc.css`: cabeçalhos internos compactos, cores de capítulo
   derivadas dos tokens de tema, formulários sem sombras ou moldura de cartão,
   hierarquia do arquivo de relatórios e resumos financeiros móveis mais unidos.
2. `app/templates/dashboard.html`: versões completa e óptica da gravura
   decorativa nas páginas internas. A versão pequena é exibida até 900 px; o
   Resumo mantém sua arte anterior. Cache do CSS atualizado para v40.
3. O achado do THE CRITIC em 601 px foi corrigido reservando duas linhas aos
   rótulos dos indicadores e alinhando os itens pelo início da linha.
4. O orçamento móvel mantém todos os números, com intervalos de 12 px e medidor
   que ocupa a largura útil. Não houve redução da fonte do saldo.

## Trade-offs e manutenção

Mantivemos CSS e Jinja, sem biblioteca ou nova chamada de rede. Reutilizar a macro
SVG existente evita assets externos e mantém a identidade editável. Renderizar
as duas variantes decorativas adiciona um pequeno volume de markup; permite
troca óptica por CSS sem JavaScript, leitura de viewport no servidor ou mudança
de comportamento. Ambas ficam fora da árvore de acessibilidade.

`color-mix()` deriva 90% da superfície do fundo do tema e 10% da cor da capa.
Assim o tema escuro não recebe um cartão claro. Os textos continuam usando os
tokens de texto do tema; a cor de capítulo identifica um destino, não sucesso,
erro, prioridade ou uma categoria de dado. As combinações são medidas no
navegador. O alvo validado é o Edge instalado; navegadores antigos sem
`color-mix()`/`lh` não foram certificados nesta rodada.

Não foi criado um ADR: não houve mudança arquitetural. Este registro documenta
uma decisão de apresentação e seus testes.

## Revisão de hierarquia pelo implementador

Aplicação da skill `critique-visual-hierarchy`; não substitui o parecer independente.

| Dimensão | Observação nas capturas finais | Problema / ação | Resultado |
|---|---|---|---|
| Entrada | O título identifica o destino; a gravura é menor e secundária. | O cabeçalho anterior consumia mais altura que sua informação. Reduzido nas áreas internas. | Passa nas amostras. |
| Fluxo | Criar relatório e arquivo ocupam colunas relacionadas; no celular, ficam em sequência. | Datas pequenas e ações indiferenciadas dificultavam identificar cada registro. Datas ampliadas e links agrupados. | Passa nas amostras. |
| Peso | Newsreader identifica documentos; Manrope permanece nos controles e números operacionais. | Evitar que a gravura tenha a mesma força do título. Variante óptica pequena em telas estreitas. | Passa nas amostras. |
| Ênfase | Criar/conectar mantém ação preenchida; downloads e navegação são secundários. | Nenhuma nova chamada para ação foi acrescentada. Preservar foco visível e área de toque. | Passa nas amostras. |

Esses julgamentos são visuais e contextuais. Não constituem pesquisa com usuários,
medida de produtividade ou equivalência a um site premiado.

## Entendendo o CSS

```css
@media(min-width:601px) and (max-width:900px) {
  body[data-page=overview] #overview-summary .metrics { align-items:start; }
  body[data-page=overview] #overview-summary .metric:not(:first-child) small:first-child {
    min-height:2lh;
  }
}
```

- A primeira linha limita a regra à composição intermediária. O celular e o
  desktop usam organizações diferentes, que já estavam corretas.
- `body[data-page=overview]` evita afetar indicadores de outras páginas.
- `align-items:start` ancora os itens na mesma borda da linha da grade. Centralizar
  itens de alturas distintas pode deslocar seus números.
- `:not(:first-child)` seleciona os dois resultados; o gasto ocupa sua própria
  faixa nessa composição.
- `small:first-child` seleciona o rótulo, sem alterar o texto de apoio.
- `min-height:2lh` reserva duas alturas de linha, calculadas pela tipografia real.
  É um mínimo: o conteúdo pode crescer, sem ser cortado. Remover a regra permite
  que um rótulo com duas linhas empurre somente seu número para baixo.

Não há função nova de negócio a explicar: a mudança central é uma relação de
layout. Estude CSS Grid, cascata/especificidade, unidades relativas e tokens.

**Exercício:** em uma cópia local de teste, troque um dos rótulos por um texto de
três linhas. Observe 601, 768 e 900 px. Explique por que `min-height` não corta o
texto e proponha uma forma de compartilhar a altura real entre os rótulos sem
usar uma altura fixa. Não altere os dados reais para esse experimento.

## Evidências e revisão

O parecer inicial está em `THE-CRITIC-EDITORIAL-V7-ROUND1.md`: 8,8 para o Resumo
v38. Ele confirmou os reparos anteriores e indicou o alinhamento em 601 px e a
concentração do orçamento móvel. A consultoria de direção de arte apontou a
continuidade das páginas internas; não atribuiu nota.

As capturas usam apenas dados sintéticos. `before/` conserva a v38 do Resumo e
as auxiliares históricas v35, conforme manifesto original. A pasta `final/`
identifica a versão final por hashes. A matriz final regenera todas as 11 telas;
`chapters/` usa três relatórios fictícios apenas para testar uma lista preenchida.
Esses relatórios não foram criados no banco nem possuem PDFs gerados.

O comparador HTML é local; suas imagens e controles não dependem da internet.
As referências têm finalidade e enquadramento diferentes do produto. A
comparação demonstra decisões visuais, não reproduz funcionalidade dos sites.

## Verificações executadas na v40

- Pytest: 113 aprovados; dois avisos de depreciação preexistentes (Starlette/httpx e pypdf).
- Matriz completa: 88 capturas das 11 telas, quatro larguras e dois temas; mais 22 em 320 px. Sem overflow ou erros de console.
- Resumo: 36 combinações de largura/tema, mais dois estados vazios. Alinhamento intermediário, largura do medidor móvel, filtros e menu verificados.
- Recomendações: 24 estados, incluindo valores longos, metadados e múltiplas recomendações; dois viewports de foco. Sem mutações ou erros.
- Áreas internas: 40 combinações e um arquivo vazio; datas, seis links de exportação, alvos de 44 px, arte óptica e 80 medições de contraste, todas >= 4,5:1.
- Interações: salto de conteúdo, tabela por teclado, menu/Escape, formulário com erro e nova tentativa, seleção Claude, ocultação de chave, rótulos, downloads e 32 pares de contraste. Duas escritas simuladas; nenhuma escrita real.
- SHA-256: os 35 arquivos de lógica da base permanecem iguais. As mudanças do template se limitam ao cache CSS e variantes de SVG decorativo.

O primeiro teste de alinhamento intermediário falhou em 601 px por aproximadamente 1,3 px. A regra inicial usava em; foi substituída por duas alturas de linha (lh) e alinhamento pelo início. A matriz completa de transições foi executada novamente e passou.

## Parecer final e acabamento v41

THE CRITIC: **8,9/10 — aprovado com ressalvas para a v40**. Parecer integral em
`THE-CRITIC-EDITORIAL-V7-FINAL.md`. Inspecionou 48 capturas principais, oito estados,
cinco capítulos, seis imagens anteriores e três referências. Confirmou os dois
reparos e a continuidade das áreas internas; não encontrou problema crítico/alto.
Não operou a aplicação: seu julgamento é visual, não uma certificação funcional.

Após esse parecer, três ajustes localizados:

- Em até 380 px, Mostrar fica abaixo do campo de chave. A orientação completa
  cabe sem reduzir a fonte nem alterar o texto, o campo ou o handler. Custo:
  mais uma linha no formulário nessa largura. O texto de orientação integral é
  verificado pela largura medida da fonte no navegador.
- Importar resultados recebe o mesmo tratamento das outras tarefas de edição
  principais: superfície tonal, marca lateral e título editorial. Opções
  ocasionais recolhidas continuam disclosures; é uma distinção de função.
- O teste do arquivo vazio agora seleciona e confirma o tema antes de cada
  captura, produzindo claro e escuro. A imagem v40 com nome escuro e pixels claros
  foi preservada na evidência revisada; não é apresentada como prova do escuro.

`final/` permanece a versão v40 examinada. `post-review/` registra a v41 atual,
com capturas renovadas das telas modificadas e estados auxiliares. O restante
mantém as capturas v40 de regras visuais idênticas. O comparador mostra a v41.
**Não foi atribuída uma nova nota à v41.** As duas rodadas ordinárias foram
concluídas; não será fabricada uma aprovação por repetição de avaliações.

Limite remanescente: a avaliação visual não demonstra, sozinha, excelência de
experiência ou qualidade equivalente aos sites de referência. Os testes de
interação ajudam a verificar preservação dos fluxos, mas não substituem pesquisa
com usuários ou auditoria integral de acessibilidade.

Validação dos ajustes v41: 20 capturas de Campanhas/Configurações nos dois temas e
cinco larguras, 40 estados auxiliares e os dois arquivos vazios, teste geométrico
do placeholder em 320 px e repetição da suíte de interações. Tudo aprovado, sem
overflow, erros JavaScript ou escritas reais. Pytest113 corresponde à v40; nenhuma
lógica foi alterada depois. Os 35 hashes de lógica continuam iguais.
