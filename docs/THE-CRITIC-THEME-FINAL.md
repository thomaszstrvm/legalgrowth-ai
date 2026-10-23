### Veredito

**8,8/10 — APROVADO no escopo visual inspecionado.**

A v22 melhora o acabamento da galeria sem romper a coerência dos temas. O subtítulo central ganhou legibilidade real; as capas laterais perderam o aspecto artificialmente apagado. Não encontrei regressão visual que justifique nova rodada de correções.

A nota representa julgamento qualitativo das evidências, sem certificar funcionamento.

### Evidências e limites

Versão informada pelo coordenador: **`arc.css?v=22`, de 22/10/2026**.

Examinei efetivamente os pixels em `output/design-review/theme-coherence/final/`:

- Quatro `overview-*`: **1366 × 1868** e **390 × 2666**, temas claro e escuro.
- Quatro `focus-*`: recortes de **1286 × 431** e **358 × 421**, nos dois temas.
- Dois `hover-1366-*`: recortes de **1286 × 431**, nos dois temas.

Comparei os quatro overviews com a v21 na pasta superior. Reexaminei as despesas móveis em `finance-states/populated-{light,dark}-390.png`, evidências anteriores cuja continuidade foi informada pelo coordenador.

Visualizei também `nexora-user.png`, `standards-live.png`, `elisa-detail.png` e `arc-current.png`. Li integralmente a persona e o parecer da primeira rodada.

Não editei arquivos, executei a aplicação ou fiz chamadas externas. As imagens demonstram **aparência dos estados**, não acionamento, ordem de foco, navegação por teclado, movimento ou resposta ao toque. Os resultados registrados em `scene-results.json` são evidência complementar do executor; não são testes reproduzidos por mim.

### Problemas críticos

**Nenhum achado crítico, alto ou médio comprovado neste escopo.**

As alterações solicitadas produziram melhorias verificáveis:

- **Subtítulo central — resolvido.** Em `final/focus-390-light.png` e `focus-390-dark.png`, “Da primeira visita ao contato” ocupa duas linhas legíveis, com afastamento suficiente da ilustração. Na v21, a inscrição permanecia comprimida em uma linha. No desktop, o aumento é discreto e preserva a hierarquia entre título, símbolo e informação complementar.
- **Capas laterais — melhoradas.** Nos dois `final/overview-1366-*`, Orçamento, Relatórios e Oportunidades apresentam texto e desenho mais presentes que na v21. Perspectiva, posição central e sombras continuam estabelecendo profundidade; o escurecimento adicional era dispensável.
- **Insights no tema claro — melhorado.** Em `final/focus-1366-light.png`, título, marca e desenho possuem tinta visualmente mais firme sobre o terracota. Não observo competição indevida com Campanhas.
- **Coerência tonal — preservada.** Os quatro overviews finais mantêm a continuidade entre página, orçamento e galeria. No tema escuro, as capas continuam profundas, sem se converterem em placas luminosas.

### Problemas sutis

**Inscrições nas lombadas — gravidade baixa, acabamento preexistente.**

**Localização/evidência:** laterais inclinadas em `final/focus-1366-light.png` e `focus-1366-dark.png`.

A combinação de rotação, perspectiva e escala torna essas inscrições pouco úteis para leitura. Os títulos frontais e controles externos sustentam a identificação, portanto o problema não bloqueia a navegação demonstrada.

**Correção recomendada:** tratá-las como assinatura gráfica redundante, sem acrescentar informação essencial nessa posição.  
**Impacto esperado:** preservar a metáfora editorial sem exigir esforço de leitura improdutivo. Não recomendo outra alteração de escala nesta rodada.

### Decisões questionáveis

**Hover e foco aparecem simultaneamente nas capturas de hover.** O contorno da capa central permanece, enquanto o botão “Insights de IA” recebe preenchimento mais evidente, sobretudo no tema escuro. Ambos são visíveis e coerentes; porém, essa composição não permite atribuir ao hover o contorno central. Não há fundamento para reprovar o estado, nem para declarar que toda a interação foi validada.

**A galeria continua sendo uma escolha expressiva.** Arc aplica a metáfora espacial à experiência inteira; LegalGrowth a concentra num módulo. Isso constitui adaptação, mas sua contribuição à velocidade de navegação permanece hipótese de uso, não conclusão extraída das imagens.

### Qualidades reais

Preservar a associação entre títulos editoriais e dados funcionais, a diferenciação cromática dos dossiês e o contorno de foco claramente visível nos dois temas e tamanhos.

Standards e Elisa demonstram contenção compositiva; essa disciplina também aparece na ausência de efeitos adicionais na v22. A referência Nexora não justifica acrescentar gradientes ou elementos promocionais ao painel.

As despesas móveis reexaminadas continuam apresentando descrições inteiras e valores separados com clareza.

### Veredito final

**APROVADO — qualidade visual consistente e defensável nas evidências fornecidas.**

A pendência de microtipografia central foi atendida. Permanecem apenas a limitação secundária das lombadas e dimensões interativas não verificadas. Não recomendo prolongar o ciclo para perseguir uma nota maior.