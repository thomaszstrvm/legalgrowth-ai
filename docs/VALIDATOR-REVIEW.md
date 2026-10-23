# Revisão externa: implementação operacional v57

Data: 23/10/2026. Base: v0.1.3 / visual v56. Marco: v0.1.4.

O proprietário forneceu o PDF **LegalGrowth_Prompt_Design_Review_e_Unlimited_OCR.pdf**,
com 17 páginas. O documento foi lido integralmente e reconciliado com o código.
A extração e as evidências locais ficam em `output/validator-review/`; o PDF externo
não é incorporado ao repositório. Este registro permite entender a implementação
sem depender daquele arquivo ou de uma conversa privada.

## O que mudou

| Pedido | Resultado e limite |
|---|---|
| P1-01: período entre páginas | URL e sessão por escopo; navegação, recarga, histórico e separação de rascunho/aplicado. Área permanece exclusiva de Campanhas. |
| P1-02: mês financeiro | Controle mensal explícito, iniciado pelo mês final da análise; não converte a API mensal em consulta por intervalo. |
| P1-03: despesas | Identificação de até 100 registros recentes, de todos os meses. Nenhum filtro artificial só nos registros recebidos. |
| P1-04: verba e ferramentas | Explicação do saldo de mídia, despesas de software e alocação legada. Fórmulas e persistência preservadas. |
| P1-05: IA compartilhada | Conexões e limite identificados como compartilhados pela instalação; aviso de cobrança inclusive em demo e distinção entre reserva e fatura. |
| P1-06: eficiência | Custo por qualificado e por contratação na comparação principal, inclusive pares no celular; valores vêm da API. Zero difere de ausência; divisor zero não vira custo gratuito. |
| P2-01: abertura | Indicadores e atenção antes da galeria. Capas, arte, tipografia, navegação e dois temas preservados. |
| P2-02: datas e erros | Datas ausentes/inválidas/invertidas/intervalo excessivo mantêm formulário aberto, erro associado e foco; sem resultados antigos. Repetição de leitura apenas para falhas transitórias. |
| P2-03: recomendações | Revisar evidências é o caminho explícito; regeneração secundária; tabelas identificam Área/Período/Cidade/Palavra-chave; aprovação registra decisão, não altera anúncio. |
| P2-04: relatórios | PDF prioritário e um JSON por relatório, semana completa, snapshot explicado, autoteste em opções avançadas. Arquivos em lista semântica, com período e ações empilhados no celular. |
| P2-05: demonstração | Notícias, Oportunidades e Insights têm exemplos fixos, sem execução ou chamada de IA. Nenhuma notícia fictícia é atribuída a jornal real; falha real não recebe demo como fallback. |
| P2-06: contratos | Subtítulo e status dizem demonstração/Formato conferido; proveniência e alternativas preservadas; API de ingestão real continua bloqueada. |
| P2-07: CSS | Regras substituídas de cabeçalho/indicadores do Resumo e downloads foram removidas antes da nova organização; tokens de escala reutilizados. CSS legado fora desse escopo continua existente. |
| P3-01: óptica | Corrigidos alinhamento dos indicadores, largura da comparação, direção do retorno à análise e sobreposição de período/ações após inspeção das capturas. Sem novos efeitos. |
| Unlimited-OCR | Pesquisa e contrato opcional desativado, sem modelos, inferência ou integração com ingestão. Ver avaliação separada. |

O projeto já tinha modo escuro, máscara de credenciais, escaping de textos, bloqueio
de contratos reais, revisão humana e APIs de relatórios/IA. Esses mecanismos foram
preservados, não reimplementados nem apresentados como novidade.

## Decisões e referências

O [ADR 011](decisions/011-operational-context.md) explica URL, estado aplicado e
calendários distintos. O [ADR 010](decisions/010-optional-local-ocr.md) separa a
pesquisa de OCR da execução. A revisão não transforma este MVP em produto pronto
para dados pessoais ou produção.

Foram consultadas as orientações primárias de
[filtros do Metabase](https://www.metabase.com/docs/latest/dashboards/filters) e
[erros do GOV.UK](https://design-system.service.gov.uk/components/error-summary/).
Aplicamos contexto explícito, mensagens ligadas a campos e recuperação previsível;
não afirmamos conformidade integral com esses sistemas. A arte permanece derivada
do estudo documentado da [Arc](ARC-INTERACTION-STUDY.md) e da
[Cartier](CARTIER-REFERENCE.md), sem copiar ativos ou transformar referências de
portfólio em justificativa para esconder números operacionais.

## Como funciona

`period-context.js` reúne regras puras de calendário. `app.js` coordena URL,
rascunho, contexto aplicado, consultas e mensagens. `dashboard.html` posiciona
controles específicos por página e mantém a galeria após o conteúdo. O servidor
continua recebendo os mesmos parâmetros e validando escopo/períodos.

`demo-examples.js` só retorna cópias de objetos fictícios; não tem rede ou banco.
Leia [DEMO-EXAMPLES.md](DEMO-EXAMPLES.md). Uma análise paga iniciada explicitamente
no modo demo continua possível e identificada como tal; abrir o exemplo não a inicia.

`app/vault/ocr.py` é uma interface futura, sem importação pela API ou pelo extrator.
Leia [UNLIMITED-OCR.md](UNLIMITED-OCR.md) para requisitos ainda não implementados,
licenças, fontes e limites do hardware observado.

## Entendendo uma função

Trecho de `app/static/period-context.js`:

```js
function validate(start, end) {
  if (!validDate(start)) return {field:'start', message:'Informe uma data inicial válida.'};
  if (!validDate(end)) return {field:'end', message:'Informe uma data final válida.'};
  if (start > end) return {field:'end', message:'A data final deve ser igual ou posterior à data inicial.'};
  if ((Date.parse(end) - Date.parse(start)) / 86400000 > 366) return {field:'end', message:'Escolha um intervalo de até 366 dias entre as datas.'};
  return null;
}
```

1. A função recebe duas strings de calendário, sem consultar DOM, relógio ou rede.
2. A primeira guarda valida formato e existência da data inicial; retorna o campo
   e a mensagem em vez de lançar uma exceção por um erro esperado de preenchimento.
3. A segunda guarda faz o mesmo com o fim. Sem essas guardas, diferenças de datas
   inválidas poderiam produzir `NaN` e passar silenciosamente pela comparação.
4. Como o formato já é `AAAA-MM-DD`, a comparação lexicográfica também é temporal.
   Removê-la permitiria uma diferença negativa passar pelo limite seguinte.
5. A diferença em milissegundos UTC dividida por 86.400.000 dá dias entre as datas;
   o limite espelha o servidor. Não é a contagem inclusiva de dias do relatório.
6. `null` significa ausência de erro. O chamador então pode aplicar o contexto e
   consultar; caso contrário, mantém o formulário e associa mensagem/foco ao campo.

O módulo não substitui validação no backend: um cliente pode ignorar JavaScript.
O custo é constante e não exige biblioteca. Limitação: aceita anos de quatro
dígitos a partir de 1000, não é um parser de datas em linguagem natural.

## Verificação

- Suíte Python: **179 testes passaram**, com seis avisos de depreciação existentes
  (Starlette/httpx, Alembic e pypdf). `.env` desativado nos testes; banco de teste.
- Regras de calendário e exemplos: scripts Node sem rede, dependências novas ou IA.
- `browser-period-race.cjs`: consulta atrasada, área e links usam contexto aplicado;
  dois POSTs simulados de análise também o preservam. Escopos, mês independente,
  datas inválidas e recuperação pelo histórico passaram, sem API real.
- `browser-action-feedback.cjs`: quatro combinações 1366/390 × claro/escuro
  passaram; uma gravação confirmada não é repetida após falha de leitura.
- Detector mecânico Impeccable executado uma vez nos arquivos visuais alterados.
  Retornou avisos de bordas/escala/raios no CSS e nos templates isolados, incluindo
  legado e divergências do sidecar local desatualizado. Não é um teste aprovado
  nem prova de acessibilidade. Não foi usado para remover a identidade existente
  ou expandir esta revisão para todo o CSS.
- Primeira matriz de navegador: **172 grupos passaram, 160 capturas**; 11 páginas,
  cinco larguras (320/390/768/1024/1440), dois temas, erros e estados sintéticos.
  Manifesto confirmou fontes estáveis durante a execução. APIs integralmente
  simuladas; nenhuma requisição externa ou gravação real.
- Capturas adicionais com dados seed: 44, sem overflow da página ou erro JS.
  A ausência de overflow global não detectou a sobreposição interna dos relatórios;
  por isso houve inspeção visual e correções específicas.
- Matriz final: **175 grupos passaram, 162 capturas**, com 228 GETs de API
  simulados, zero erros ou requisições inesperadas e fontes estáveis. Inclui
  ausência de sobreposição período/ações, seis colunas visíveis em 1440 px,
  HTTP 400/422 sem repetição e recuperação de rede/503.
- Galeria: **14 grupos passaram, 68 capturas**, APIs simuladas e fontes estáveis.
  Navegação por teclado, foco, movimento reduzido, transição de ponteiro, 14 pares
  de contraste amostrados e links sem JavaScript preservados. Isso não é uma
  auditoria integral de contraste ou acessibilidade.
- Evidências finais e duas rodadas do crítico: [parecer independente](THE-CRITIC-VALIDATOR-REVIEW.md).

Capturas finais: `output/validator-review/final/`; galeria: `output/validator-review/scene/`.
O comparador local `output/validator-review/comparison.html` mostra abertura antes/depois,
a correção dos relatórios e a referência Arc arquivada. Dimensões distintas e
fixtures diferentes estão rotuladas; não comparar seus números como desempenho.

Por orientação do proprietário, entregas substanciais agora incluem PDF com análise,
mudanças, decisões, testes e limites. A regra está no `AGENTS.md`. O relatório desta
entrega é gerado por `scripts/build-validator-delivery.py`; a versão para download
acompanha `docs/releases/`, sem incluir o PDF de origem de terceiro. As sete páginas
foram renderizadas e inspecionadas; texto e quantidade de páginas conferidos com
pypdf, sem JavaScript ou formulário no PDF. Para regenerar, são necessárias as
evidências locais referenciadas pelo script; capturas antigas não acompanham o clone.

THE CRITIC aprovou a revisão final em **9,0/10**, após verificar os cinco achados
corrigidos e 32 imagens finais. Resta uma oportunidade de baixa prioridade para
reduzir avisos repetidos nos exemplos. A nota é contextual, não certificação.

Os testes não comprovam usabilidade com pessoas, leitor de tela, dispositivos
físicos ou todos os navegadores. Zoom de 200% é emulação de reflow em viewport
720×450 com DPR2, não zoom real da interface do navegador. Não foram usados dados
reais de clientes, chamadas pagas, benchmark ou inferência OCR.

Para reproduzir, use o ambiente de desenvolvimento descrito no README e execute
`node scripts/test-period-context.cjs`, `node scripts/test-demo-examples.cjs` e
`node scripts/browser-validator-review.cjs`. O último exige servidor local ativo,
Playwright com Edge e autenticação local; lê a senha de `.env` sem imprimi-la.
`VALIDATOR_OUTPUT` muda a pasta de evidências e `VALIDATOR_INTERACTIONS_ONLY=1`
executa somente os casos funcionais. Não utilizar contra serviço público.

## Conceitos para estudar e exercício

Estude funções puras, snapshot de estado, condições de corrida, History API,
validação em camadas, separação entre dado ausente e zero, e contratos com `Protocol`.

**Desafio:** acrescente ao teste de calendário um intervalo que atravesse fevereiro
de um ano bissexto. Explique por que o cálculo não deve depender do fuso horário do
navegador. Depois identifique qual teste protege um rascunho editado durante uma
consulta lenta, sem mudar a API.
