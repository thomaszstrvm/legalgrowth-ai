# Design engineering — coleção e áreas de trabalho

Versão visual: v56. Data: 23/10/2026. Base recuperável: v0.1.2 (`df405cb`).

Esta rodada encerra a busca aberta por uma nota 9,9, conforme decisão do proprietário. O critério de entrega é a implementação verificada, com parecer independente e limitações explícitas. A avaliação adicional da Cartier está em [CARTIER-REFERENCE.md](CARTIER-REFERENCE.md).

## Problemas tratados

- As capas tinham composição mais expressiva que os capítulos internos; desenhos diferentes interrompiam a identidade.
- A arte de Insights e as letras pareciam elementos separados; Orçamento e Relatórios ainda lembravam emblemas isolados.
- Paletas globais repetidas em duas folhas de estilo tornavam mudanças difíceis de acompanhar. A auditoria olhava só uma delas.
- Configurações reunia orientações e edição numa pilha longa, sem o mesmo grid usado nas conexões de IA.
- Uma gravação concluída podia ser apresentada como falha quando a leitura seguinte falhava; re-render removia foco e links para regiões assíncronas nem sempre chegavam ao destino.
- Primeiros passos não explicitavam a escolha de cidades antes da importação.
- Tabelas estreitas não explicavam como ver as colunas restantes; erros e cobertura parcial tinham hierarquia insuficiente.

## Direção e escopo

A Arc é a referência principal de objeto, composição e interação; o [estudo de código e navegação](ARC-INTERACTION-STUDY.md) separa observação de interpretação. A [pesquisa dos sete livros e produtos](DESIGN-ENGINEERING-RESEARCH.md) fundamenta hierarquia, proximidade, padrões reconhecíveis e linguagem comum. Nenhum layout ou asset proprietário foi copiado.

| Área | Alteração |
|---|---|
| Resumo | Capas recompostas; primeiras instruções incluem região; links existentes mantidos. |
| Campanhas | Cabeçalho repete a capa; importação explica a região configurada. |
| Orçamento | Gravura de planos amplos, repetida no capítulo; feedback e recuperação de gravações corrigidos. |
| Relatórios | Dobra ocupa a capa; capítulo correspondente e consultas independentes em paralelo. |
| Insights | Lente e IA compõem a mesma figura; aviso de ausência de dados antes de nova análise. |
| Notícias | Estado demonstrativo explica a próxima ação; identidade visual coerente com Oportunidades. |
| Configurações | Orientação e formulário em colunas no desktop, sequência linear no celular; links profundos e foco restaurados. |
| Contratos, Recomendações, Oportunidades, Mercado | Fundamentos e cabeçalhos compartilhados; funcionalidades próprias preservadas e capturas verificadas. |

## Arquitetura e manutenção

Mantidos FastAPI, Jinja, CSS e JavaScript nativos. Nenhuma migração, serviço, fonte, biblioteca ou funcionalidade de negócio nova. As [decisões de fundamentos](decisions/008-shared-visual-foundations.md) e [feedback confirmado](decisions/009-confirmed-actions-and-read-errors.md) registram alternativas e consequências.

`tokens.css` define os papéis comuns dos dois temas. `style.css` contém componentes gerais; `arc.css`, composição editorial e adaptações. A paleta de uma capa é local ao componente. Não se deve transformar todo ajuste óptico em token global. A auditoria estática ainda encontra literais e sobrescritas históricas: ela torna essa dívida visível, não a declara resolvida.

Para personalizar:

1. Altere o par claro/escuro do papel desejado em `app/static/tokens.css`.
2. Para tintas específicas das capas, use `--paper`/`--print` em `arc.css`.
3. Confira texto principal/secundário, foco e controles sobre suas superfícies; não confunda cor de capítulo com alerta.
4. Execute `python scripts/audit-design-tokens.py --ref HEAD`. O relatório é inventário, não nota de qualidade.
5. Abra desktop e celular em ambos os temas e execute os scripts de navegador disponíveis com dados sintéticos.

Não inserir credenciais nos scripts ou na documentação. Os testes locais de navegador leem apenas a senha de autenticação do `.env` sem imprimi-la; cenários de escrita e IA são interceptados e usam fixtures.

## Entendendo o código: restaurar o contexto

Trecho central de `app/static/app.js`:

```javascript
function focusContext(target) {
  if (!target) return;
  for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
  }
  if (!target.matches('button,a[href],input,select,textarea,[tabindex]')) target.tabIndex = -1;
  target.focus({preventScroll: true});
  target.scrollIntoView({block: 'nearest', behavior: 'instant'});
}
```

1. A função recebe um elemento DOM; não retorna um valor útil nem consulta APIs.
2. Sem elemento, termina. Esse guarda evita acessar propriedades de `null`.
3. Percorre os pais do elemento até chegar ao topo. É a mesma ideia de percorrer uma estrutura encadeada usando a referência ao próximo nó.
4. Abre os `details` ancestrais. Focar um elemento dentro de um disclosure fechado não o tornaria visível.
5. Se não for focável, adiciona `tabIndex=-1`: permite foco programático sem colocá-lo na sequência normal de Tab.
6. Move o foco sem deixar o navegador decidir primeiro um scroll automático.
7. Desloca apenas o necessário para tornar o destino visível, sem movimento animado obrigatório.

É usada após carregamento de fragmentos conhecidos e para feedback de operações. O contexto salvo contém apenas identificadores de formulário e tipo de importação; nenhuma chave, senha ou rascunho é copiado. Uma falha de renderização continua tratada pelos chamadores. Não recebe seletores arbitrários do servidor nem usa `innerHTML` para mensagens de erro.

Remover a abertura dos pais pode esconder a confirmação. Usar `tabIndex=0` em toda mensagem aumenta a quantidade de paradas de teclado. Remover `preventScroll` pode produzir dois deslocamentos seguidos. A função não é um gerenciador geral de foco de modais; seu escopo são os fluxos existentes de formulário e fragmentos.

## Verificação

Evidências em `output/design-review/design-engineering-v1/` e matriz das onze páginas em `output/design-review/after/`.

- Suíte Python: **162 passaram**, seis avisos de depreciação existentes (Starlette/httpx, Alembic e pypdf). `.env` desativado durante os testes.
- Onze páginas × 1366/390/320 × claro/escuro: **66 capturas**, sem overflow do documento ou erros de console.
- Sete estados preenchidos/vazios/parciais/não-verificados × três larguras × dois temas: **42 capturas**, 60 APIs simuladas, nenhum request real de IA ou gravação.
- Galeria: dez combinações de largura/tema, contraste de 14 pares de paleta >=4,5:1, teclado, links sem JS, recuperação de erros, legenda, abertura e movimento reduzido.
- Interações gerais: teclado, rolagem de tabela, Escape do menu, recuperação de formulário, rótulos, reflow320, exportações e 32 pares de contraste >=4,5:1 passaram.
- Telas auxiliares: 40 combinações em cinco larguras, incluindo 768/901 px, mais dois vazios de Relatórios; alvos de exportação, contraste das superfícies e campos estreitos passaram.
- Feedback: POST confirmado/GET falho, recuperação só por GET, foco, disclosures, fragmentos atrasados e páginas independentes passaram em quatro combinações.
- Ajustes do crítico: seis combinações 1366/390/320 × claro/escuro, com 18 capturas. Dica condicionada ao overflow, disclosure por Enter, setas de rolagem, redimensionamento sem roubar foco, reconexão após render, ausência de aviso indevido e padding de erro de 16 px passaram.
- Movimento: oito combinações de mouse/toque emulado, dois temas e duas larguras. Tilt mudou o transform, retornou ao sair, desligou com foco/reduce e não criou loop RAF ocioso nos intervalos observados. Não é um benchmark de desempenho.

O parecer independente é registrado em [THE-CRITIC-DESIGN-ENGINEERING.md](THE-CRITIC-DESIGN-ENGINEERING.md). Capturas não certificam WCAG integral, leitor de tela, Safari/Firefox ou hardware móvel real. Tabelas densas conservam rolagem horizontal própria. O teste adicional de navegação chegou ao destino nas oito combinações: seis observaram `pagereveal`, `ready` e `finished` (animação configurada em 0,16 s, ou 0 s com movimento reduzido); duas usaram navegação nativa sem efeito, com o aviso Chromium `ViewTransition opt-in disabled` preservado no resultado. Eventos e duração configurada não comprovam fluidez perceptiva. O link sem JavaScript também passou.

## Estudar e praticar

Conceitos: cascata e custom properties CSS; composição SVG; melhoria progressiva; DOM/foco; eventos de ponteiro; requestAnimationFrame; distinção entre mutação e consulta; testes com falhas simuladas.

Desafio: no teste sintético de recuperação, faça a primeira e a segunda leitura falharem após uma despesa confirmada. Escreva uma asserção que prove que três cliques de recuperação não criam um segundo POST. Explique por que testar apenas a mensagem seria insuficiente. Não altere o banco real nem use uma chave de IA.
