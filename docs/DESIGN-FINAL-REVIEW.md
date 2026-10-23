# Revisão final de design — 22/10/2026

> Registro histórico de uma versão anterior. As afirmações abaixo sobre composição, tipografia, escalas e validação referem-se àquela versão. A autoridade visual atual é [DESIGN.md](../DESIGN.md); a revisão posterior está em [EDITORIAL-REDESIGN-REVIEW.md](EDITORIAL-REDESIGN-REVIEW.md).

Este registro descreve a implementação final e substitui as propostas de escala/composição dos estudos anteriores. A proposta inicial com gasto de 64px e recomendação de 36px foi rejeitada: ocupava espaço demais para uma ferramenta de trabalho. Foi corrigida para gasto até 44px, títulos de seção de 20px e recomendação de 24px.

## Pesquisa solicitada

A seleção corporativa segue os dez primeiros lugares exibidos por [CompaniesMarketCap](https://companiesmarketcap.com/) na consulta desta sessão: NVIDIA, Apple, Alphabet, Microsoft, Amazon, TSMC, SpaceX, Meta, Saudi Aramco e Broadcom. É um recorte do ranking consultado, sujeito a atualização e atrasos; não um cálculo independente de valor de mercado. A página oficial de investidores da SpaceX corroborou NASDAQ: SPCX.

Todos os dez sites oficiais foram abertos e examinados visualmente pelos dois agentes. Evidências e limites de cada visita estão em [grupo A](CORPORATE-REFERENCES-A.md) e [grupo B](CORPORATE-REFERENCES-B.md). Algumas capturas tiveram sobreposição parcial de consentimento; NVIDIA também apresentou timeout posterior. Não afirmamos auditoria integral dos dez sites.

Também foram visitados sites da [galeria Awwwards](https://www.awwwards.com/websites/), incluindo FORMAT, Signal-A e Heron AI. A pesquisa anterior de Legency, MyHealthPrac, Seasoned e Runway Financial permanece documentada; Legency é somente um exemplo, não a direção obrigatória.

A galeria foi usada para descoberta, não como substituto dos sites. Na rodada de abrangência, reabrimos os sites reais: o designer percorreu Industry Recognitions e Services em Signal-A/about e Circle/Usage/Horizontal em FORMAT. A revisão principal abriu também [Heron Dashboard](https://heronaiapp.com/heron-dashboard), página interna do produto, e inspecionou sua composição renderizada. Algumas seções da Heron têm animação de entrada e apareceram parcialmente durante a rolagem; não foram copiadas. Os detalhes desta pesquisa adicional estão em [GRAPHIC-DIRECTION.md](GRAPHIC-DIRECTION.md).

## Referência → implementação verificável

| Referência | Adaptação realizada | Onde verificar |
|---|---|---|
| [FORMAT / Obys](https://format.obys.agency/) | Módulos com bordas compartilhadas e proporções distintas: gasto, dois indicadores auxiliares, revisão, tabela e orçamento conectados | Resumo: `.overview-board`, `.overview-lead`, `.result-ledger` |
| [Signal-A](https://signal-a.studio/about) | Linhas expansíveis amplas com controle +/−; navegação marcada por ponto e peso de fonte | Campanhas: “Ver mais indicadores”; recomendações: “Ver dados”; `.disclosure` e `nav a[aria-current]` |
| [Heron AI](https://heronaiapp.com/) | Área de ação integrada à composição, seta discreta e feedback ao foco/hover | Botão de revisão no resumo: `.review-action` |
| [Apple](https://www.apple.com/), [Microsoft](https://www.microsoft.com/), [NVIDIA](https://www.nvidia.com/) | Uma ação preenchida por grupo; secundárias em contorno/texto, altura mínima44px; foco com tratamento equivalente ao hover | Formulários, conexão de IA, botão de revisão |
| [Amazon News](https://www.aboutamazon.com/) | Cabeçalhos de seção uniformes: título20px, link lateral14px, informação auxiliar subordinada | Campanhas, revisão e orçamento |
| [SpaceX IR](https://ir.spacex.com/stock-information/default.aspx) | Valor acompanhado de contexto; tabela sem cartões individuais; números alinhados | Resumo e campanhas |
| Alphabet, TSMC, Meta, Aramco, Broadcom | Contenção de texto, agrupamento por finalidade, contexto separado e rótulos específicos | Menu Gestão/Análises, faixa de período, avisos e descrições existentes preservados |

Não foi copiado código, marca, imagens ou cores proprietárias. Os padrões foram reconstruídos em HTML/CSS. Não foram adicionados carrosséis, fontes remotas, bibliotecas de animação ou novas funcionalidades.

## Aplicação em todo o sistema

A revisão seguinte corrigiu a diferença entre o Resumo e as telas internas. Dez telas secundárias agora usam `.task-board`: Campanhas, Insights, Notícias, Oportunidades, Recomendações, Contratos, Orçamento, Relatórios, Configurações e Ideias de conteúdo. O Resumo mantém sua composição própria.

- **Relatórios:** cabeçalho lateral, data e ação na mesma faixa; arquivos salvos imediatamente abaixo; diagnóstico depois do histórico. No celular os links de PDF e arquivo para IA quebram/empilham, sem exigir rolagem horizontal para descobri-los.
- **Configurações:** estado das conexões em uma coluna e formulário ativo na outra, em uma superfície contínua. Até 1100px empilham. Conexão, limite e cidades compartilham o marcador +/−; o link ativo de Configurações usa o mesmo ponto da navegação principal.
- **Insights:** descrição no cabeçalho, orientação e ação num mesmo quadro, mensagem vazia integrada. Análise e evidências permanecem disponíveis nos estados simulados.
- **Demais telas:** indicadores, tabelas e detalhes compartilham bordas e alinhamentos. As descrições de Notícias, Oportunidades e Contratos foram movidas para o cabeçalho, sem duplicação.

Decisão: reutilizar os renderizadores existentes e envolver as telas secundárias com um contêiner de apresentação. Isso mantém IDs, submissões, validações, APIs e controles de segurança. Alternativa descartada: reconstruir o frontend em outro framework, o que aumentaria risco e manutenção sem ser necessário para este redesign. O custo da escolha atual é manter a disciplina dos seletores CSS e testar as composições quando surgirem novos tipos de conteúdo.

## Vantagens e custos

- Resultados, recomendações e registros passam a pertencer à mesma composição; removidas caixas externas redundantes e a coluna de orçamento que comprimiam a tabela.
- A compactação reduz a altura da abertura anterior. Os indicadores auxiliares agora compartilham a mesma linha e, em celular, a mesma altura de rótulo.
- Acordeões têm área de toque de pelo menos64px e mantêm controles nativos de teclado. A seta acompanha o foco e o hover; movimento reduzido é respeitado.
- O orçamento permanece abaixo da tabela e pode exigir rolagem. É uma escolha de prioridade, não um ganho de usabilidade comprovado.
- Não há pesquisa com usuários, teste de leitor de tela ou garantia de resultado estético universal. Prêmios e capitalização de mercado não validam o nosso produto automaticamente.

## Verificação

- 113 testes Python aprovados na rodada final (2,41s); dois avisos de depreciação existentes em Starlette/httpx e pypdf. A tentativa inicial no sandbox ficou sem saída e foi interrompida; a execução autorizada fora dele passou.
- Matriz de11páginas ×4resoluções ×2temas:88capturas, sem overflow da página ou erros de console. Resultados em `output/design-review/after/results.json`.
- Testes de teclado, abertura/fechamento de acordeão por Enter, menu/Esc, tabela rolável, preservação/reenvio de formulário, gráfico e reflow320px aprovados.
- 24pares de contraste aprovados >=4,5:1, incluindo bloco de resultados.
- Insights:24capturas adicionais, papéis de IA alternados, tema persistente e falha fechada; provedores simulados.
- Estados vazios, nomes longos sintéticos e comparador aprovados. Nenhuma API paga ou dado real de cliente.
- Revisão de direção de arte e revisão técnica independentes. Ajustes encontrados: rótulos auxiliares móveis desalinhados, captura após rolagem e link de exportação parcialmente oculto em tabela móvel; corrigidos.
- Após a última correção, a tela de Relatórios foi novamente capturada nas quatro resoluções e dois temas. Teste adicional confirma que ambos os links de exportação cabem também em320px; `reportExportsVisible: true` em `output/design-review/interaction-results.json`. A tabela extensa de indicadores continua com rolagem local deliberada.
- A inspeção da aba local do navegador integrado foi bloqueada por política de URL. Não foi contornada. A validação de desenvolvimento utilizou a suíte isolada em Edge, com dados fictícios, já em execução. As visitas aos sites públicos funcionaram.

## Entendendo o componente

Função central em `app/static/app.js`:

```js
const disclosureSummary=label=>`<summary><span>${esc(label)}</span><i class="disclosure-mark" aria-hidden="true"></i></summary>`;
const details=(label,body)=>`<details class="disclosure">${disclosureSummary(label)}<div>${body}</div></details>`;
```

`label` é o texto do controle; `body` é HTML produzido por renderizadores internos. `esc(label)` impede que o rótulo seja interpretado como HTML. `<details>` fornece o estado aberto/fechado; `<summary>` recebe foco e responde a Enter sem eventos adicionais. O marcador é oculto de leitores de tela porque o navegador já anuncia o estado. O conteúdo permanece dentro do mesmo elemento. O retorno é uma string usada na montagem da tela.

Na primeira linha, `disclosureSummary` recebe um rótulo e devolve somente o cabeçalho acessível. Esse mesmo cabeçalho agora atende tanto às tabelas de evidências quanto ao formulário de conexão, sem duplicar a marcação. Na segunda linha, `details` recebe rótulo e conteúdo, chama o primeiro helper e inclui ambos no elemento nativo que controla a abertura. Nenhum helper faz requisição ou grava dados; os formulários continuam vinculados por `bind()` depois da renderização.

Não passar texto externo cru como `body`: ele deve ser escapado nos renderizadores antes desta função. Remover `esc` abriria uma possibilidade de injeção de HTML no rótulo. Trocar `<summary>` por uma `div` exigiria implementar foco, teclado e semântica manualmente. A função não faz I/O; recebe strings e depende da função `esc` existente.

Conceitos: HTML semântico, escape de saída, CSS Grid, cascata e testes de interação.

Exercício: acrescente um teste que abre “Gastos por dia” com teclado e confirma que o gráfico está visível. Não altere o comportamento da aplicação para fazer o teste passar.

