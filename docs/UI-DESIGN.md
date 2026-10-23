> Histórico: o sistema visual vigente está em [DESIGN.md](DESIGN.md). As composições abaixo foram substituídas pelo redesign profissional de 22/10/2026.

# Revisão aplicada em 22/10/2026 — Impeccable

Esta seção substitui as decisões de composição anteriores abaixo. O conteúdo e os fluxos existentes foram preservados.

- Navegação lateral de 208px no desktop, 184px em larguras intermediárias, menu recolhível até 720px. Rolagem própria em janelas baixas.
- Área principal aberta; as métricas usam tipografia e separação, sem um cartão externo. Tabelas e recomendações deixam de disputar atenção como caixas iguais.
- Orçamento permanece uma superfície secundária tonalizada. Abaixo de 1150px fica após o conteúdo principal, acompanhando a ordem do DOM.
- Título de 32px, valores de 34px no desktop; valores ajustados no celular. Tokens de contraste mantidos nos dois temas.
- Seleção de texto, cursor de edição e barras de rolagem seguem os tokens. Mensagens continuam distinguíveis por texto e borda completa, sem depender apenas de uma faixa colorida.
- CSS existente e template, sem framework, fonte remota ou nova dependência do aplicativo. A skill é ferramenta de desenvolvimento e não é carregada pelo site.

## Entendendo a composição

```css
.overview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 256px;
  gap: 40px;
  align-items: start;
}
```

1. `display: grid` organiza os dois filhos: conteúdo principal e orçamento.
2. `minmax(0, 1fr)` entrega o espaço disponível ao conteúdo e permite que ele encolha; retirar o zero pode fazer uma tabela larga empurrar a coluna para fora da tela. `256px` reserva a largura do orçamento.
3. `gap` separa os grupos sem acrescentar caixas.
4. `align-items: start` evita esticar o orçamento até a altura das recomendações.

A media query de 1150px troca para uma coluna. A escolha reduz a comparação lado a lado no tablet, mas preserva uma largura legível para tabelas e controles. A ordem de leitura e teclado permanece a ordem do HTML. Não há parâmetros, retorno ou exceções: este trecho é uma regra CSS, não uma função JavaScript.

## Validação desta revisão

- pytest: 113 aprovados; dois avisos de depreciação já existentes.
- browser-insights: 24 capturas, temas persistentes, menu móvel, revisão de IA simulada e falha fechada; zero erros JavaScript.
- browser-evolution: 30 capturas, três larguras (375, 768, 1440), dois temas, sem overflow; autoteste sintético 6/6.
- Inspeção visual das capturas do resumo em desktop claro e celular escuro.
- Nenhuma chamada paga ou dado real de cliente usado nos testes.

## Para estudar e praticar

Estude CSS Grid, media queries, cascata e propriedades customizadas. Desafio: explique por que a coluna do orçamento muda de lugar sem alterar o JavaScript. Depois experimente `gap: 24px` no DevTools e compare o agrupamento, sem salvar a mudança.

---

## Histórico anterior (composição substituída)

# Direção de interface — 22/10/2026

Público: escritório de advocacia com pouca familiaridade técnica. Tarefa principal: entender gasto, contatos e contratações e decidir o que revisar. Estilo: ferramenta administrativa sóbria, sem recursos gráficos decorativos ou mensagens promocionais.

## Referências pesquisadas

- UI Design Brain, já instalada: padrões de navegação, formulários e tabelas.
- [Frontend Design, Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design): lida e aplicada nesta revisão. Não instalada globalmente; utilizada como referência nesta conversa.
- [Impeccable](https://github.com/pbakaus/impeccable): encontrado como alternativa para crítica e refinamento. Não instalado nem executado.

## Escolhas antes de implementar

Paleta clara: superfície #FFFFFF, fundo #F3F5F8, texto #202B38, secundário #596777, ação #244F80, linha #DCE2E9. Tema escuro com os mesmos papéis e contraste próprio. Segoe UI para controles e leitura em Windows; Bahnschrift apenas na marca. Fontes locais evitam downloads e chamadas a terceiros.

Layout considerado: manter sidebar e reduzir espaçamento, ou liberar largura com navegação superior. Escolhido o segundo, porque sete destinos cabem no desktop e o usuário quer menos estrutura competindo com os dados. No tablet a navegação ocupa uma segunda linha; no celular há menu acionado pelo usuário.

```text
marca | navegação                       | configurações/tema
Resumo                                        dados/exemplo
período
resultados do período
campanhas e pontos a revisar             orçamento mensal
```

A revisão do plano removeu frases de apresentação e contadores zerados da tela sem dados. O resumo vazio passou a explicar preparação/importação. Com dados, o centro mostra campanhas; a coluna lateral mantém o orçamento mensal separado do filtro de resultados. Não foram adicionados gráficos decorativos, imagens ou ícones sem função.

## Implementação e trade-offs

`style.css` foi consolidado: substitui as regras sobrepostas por tokens e breakpoints coerentes. O HTML mantém IDs dos controles e o JavaScript mantém os endpoints. As páginas existentes, o tema persistente e as restrições de acesso continuam funcionando. A navegação horizontal tem menos espaço para novos módulos; novos destinos devem ser agrupados em vez de aumentar indefinidamente a barra.

`overviewCampaigns` usa uma tabela no desktop e lista de campos no celular. Isso duplica apenas a marcação de apresentação, nunca os dados ou as chamadas HTTP. A lista pequena do resumo fica legível sem arrastar a tabela; tabelas detalhadas continuam roláveis nas páginas próprias.

## Entendendo a função

```javascript
function overviewCampaigns(campaigns){
  const rows=Object.entries(campaigns);
  if(!rows.length)return empty('Nenhuma campanha neste período.');
  const mobile=rows.map(([name,values])=>`<article><h3>${esc(name)}</h3><dl><div><dt>Gasto</dt><dd>${brl(values.cost)}</dd></div><div><dt>Qualificados</dt><dd>${num(values.qualified)}</dd></div><div><dt>Contratações</dt><dd>${num(values.hires)}</dd></div></dl></article>`).join('');
  return `<div class="campaign-desktop">${metricTable(campaigns)}</div><div class="campaign-mobile">${mobile}</div>`;
}
```

1. Recebe o objeto de métricas agrupado por campanha, já calculado no servidor.
2. Converte o objeto em pares de nome e valores para percorrer como uma lista.
3. Trata ausência de registros antes de construir elementos vazios.
4. Gera cada linha móvel: `esc` impede interpretar nomes como HTML; `brl`/`num` formatam os números; `join` une as strings. Remover `esc` pode introduzir XSS. Dados não são recalculados aqui.
5. Retorna as duas apresentações. CSS mostra somente uma conforme a largura; não há listeners de resize nem nova requisição ao servidor.
6. Fecha a função. O retorno é HTML, inserido pelo renderizador existente. O parâmetro precisa ser um objeto válido; `null` causaria TypeError e não é aceito pelo contrato atual da API.

Limitação: para milhares de campanhas, ambas as apresentações gerariam elementos demais; paginação no servidor seria mais apropriada. Para o resumo atual, manter uma função pura e sem eventos extras simplifica a manutenção.

## Exercício

Acrescente “Atendimentos” à versão móvel usando o campo `appointments`. Preserve o escape dos nomes e a formatação numérica. Confira a página em 375 px e explique por que não é necessário fazer outra chamada à API.

## Validação
108 testes pytest passaram (dois avisos de depreciação existentes). browser-insights: quatro páginas em três larguras e dois temas, persistência do tema/menu móvel e análise simulada aprovados; browser-evolution: cinco páginas, mesmos temas/larguras, sem overflow ou erros JS. Estado vazio conferido em 375/1440 px sem blocos de métricas zeradas. Nenhuma chamada paga de IA. Capturas inspecionadas antes e depois do ajuste móvel.
