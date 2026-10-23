/* Presentation-only examples. Never submit these fixtures to an API or persist them. */
(function (root) {
  'use strict';

  const notice = 'Exemplo demonstrativo estático. Nomes, notícias e números são fictícios. Nenhuma IA foi executada, nenhuma fonte foi consultada e nenhum dado foi salvo.';
  const period = { start: '2026-09-07', end: '2026-09-13' };
  const periodNote = 'Período ilustrativo fixo: 7 a 13 de setembro de 2026. Este exemplo não usa os filtros nem os resultados do escritório.';
  const marker = { scope: 'demo', status: 'demonstration', demonstration: true, notice, period_note: periodNote };
  const city = 'Cidade Exemplo (fictícia)';
  const articles = [
    {
      id: 'demo-article-orientation', title: 'Exemplo fictício: encontro sobre organização de documentos',
      source: 'Fonte ilustrativa A — publicação inexistente', url: null, published: '2026-09-08',
      cities: [city], topics: ['previdencia'], demonstration: true,
      summary: 'Situação inventada para demonstrar a leitura: um encontro educativo reúne dúvidas gerais sobre organização de documentos.'
    },
    {
      id: 'demo-article-work', title: 'Exemplo fictício: roda de conversa sobre registros de trabalho',
      source: 'Fonte ilustrativa B — publicação inexistente', url: null, published: '2026-09-10',
      cities: [city], topics: ['trabalho'], demonstration: true,
      summary: 'Situação inventada para demonstrar a leitura: uma roda de conversa aborda como organizar registros de trabalho.'
    }
  ];

  const insight = {
    ...marker, ...period, id: 'demo-insight-static', created_at: null,
    analyst: 'Exemplo estático', reviewer: 'Não executada', models: {}, excluded: 0,
    message: notice, coverage: { campaigns: 1 },
    findings: [
      {
        id: 'demo-finding-strength', kind: 'strength', title: 'Exemplo: contatos qualificados registrados',
        explanation: 'Os números inventados abaixo mostram como uma conclusão pode vir acompanhada de evidências. Eles não descrevem uma campanha do escritório nem comprovam a qualidade do atendimento.',
        action: 'Em uma análise real, confira os registros e a definição de contato qualificado antes de interpretar o resultado.',
        evidence: [
          { id: 'demo-evidence-cost', subject_name: 'Campanha Exemplo — fictícia', metric: 'cost', label: 'Gasto fictício', period: 'current', value: 240 },
          { id: 'demo-evidence-qualified', subject_name: 'Campanha Exemplo — fictícia', metric: 'qualified', label: 'Contatos qualificados fictícios', period: 'current', value: 12 },
          { id: 'demo-evidence-cpq', subject_name: 'Campanha Exemplo — fictícia', metric: 'cpq', label: 'Custo fictício por qualificado', period: 'current', value: 20 }
        ]
      },
      {
        id: 'demo-finding-weakness', kind: 'weakness', title: 'Exemplo: pouco volume para tirar conclusões',
        explanation: 'A pequena quantidade ilustrativa de contratações mostra por que volume e custo devem ser lidos com cautela. Conversões de anúncios não são contratações; este exemplo não estima lucro ou tendência.',
        action: 'Em uma análise real, compare períodos equivalentes e confira as evidências antes de alterar o planejamento.',
        evidence: [
          { id: 'demo-evidence-hires', subject_name: 'Campanha Exemplo — fictícia', metric: 'hires', label: 'Contratações fictícias', period: 'current', value: 2 },
          { id: 'demo-evidence-cph', subject_name: 'Campanha Exemplo — fictícia', metric: 'cph', label: 'Custo fictício por contratação', period: 'current', value: 120 }
        ]
      }
    ]
  };

  const news = {
    ...marker, localities: [city], coverage_note: notice + ' ' + periodNote,
    latest: {
      ...marker, ...period, id: 'demo-news-static', week_start: period.start, created_at: null,
      cities: [city], message: 'Conteúdo fictício para conhecer a tela; não representa coleta, revisão por IA ou agendamento ativo.',
      articles, signals: [
        { label: 'Organização de documentos — exemplo', count: 1, source_count: 1 },
        { label: 'Registros de trabalho — exemplo', count: 1, source_count: 1 }
      ],
      scenarios: [{
        id: 'demo-scenario-documents', title: 'Exemplo: uma pauta educativa para avaliar',
        observation: 'A publicação inventada descreve dúvidas sobre organização de documentos; nenhum acontecimento real foi verificado.',
        scenario: 'Se dúvidas semelhantes fossem confirmadas por fontes reais, poderia ser útil avaliar um conteúdo educativo geral, sem presumir procura por serviços jurídicos.',
        watch_next: 'Em uso real, confira a fonte, o contexto e os limites do tema com revisão humana antes de produzir conteúdo.',
        article_ids: ['demo-article-orientation']
      }],
      sources: articles.map(article => ({ name: article.source, status: 'demonstration', complete_window: false, demonstration: true })),
      truncated: false, excluded: 0, models: {}
    }
  };

  const socialWeights = { access: 25, relevance: 20, information_gap: 15, benefit: 15, prevention: 15, community: 10 };
  const financialWeights = { demand: 20, area_fit: 10, capacity: 20, cost_time: 20, history: 15, sustainability: 15 };
  const unassessedDimension = weights => ({
    score: null, status: 'Exemplo de critérios; avaliação humana não executada',
    weights, criteria: {}, missing: Object.keys(weights)
  });
  const strategy = {
    ...marker, schema_version: '1.0', method: 'demonstration',
    notice: notice + ' Benefício social e potencial financeiro são independentes. Notas ausentes não equivalem a zero.',
    opportunities: [{
      id: 'demo-opportunity-documents', title: 'Exemplo fictício: avaliar uma pauta sobre documentos',
      source_url: null, source_name: articles[0].source, source_article_id: articles[0].id,
      published: articles[0].published, event_date: null, cities: [city], areas: ['previdenciario'],
      source_reliability: 'Fonte inventada para demonstração; não há publicação real nem verificação jornalística.',
      social: unassessedDimension(socialWeights), financial: unassessedDimension(financialWeights),
      social_view: 'Uma pauta educativa poderia ajudar a organizar dúvidas gerais. Neste exemplo fictício, a relevância para a comunidade ainda não foi avaliada.',
      economic_view: 'Não há dados de procura, capacidade, custo ou histórico. Uma notícia não permite estimar honorários, clientes ou retorno financeiro.',
      uncertainty: 'high', conflict: 'Não avaliado no exemplo', human_review_required: true, method: 'demonstration', demonstration: true,
      next_step: 'Em uso real, confirme fontes e contexto, depois avalie separadamente a utilidade social e a capacidade do escritório.',
      devils_advocate: 'Uma pauta pode parecer relevante e ainda assim não ajudar a comunidade. Uma publicação isolada também pode omitir contexto importante.',
      question: 'Esse conteúdo seria útil mesmo se não gerasse nenhuma contratação?'
    }]
  };

  function deepFreeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  const fixtures = deepFreeze({ insight, news, strategy });

  // Requiring the explicit scope prevents an accidental real-scope fallback.
  function copyForDemo(name, options) {
    if (!options || options.scope !== 'demo') {
      throw new TypeError('Exemplos estáticos exigem scope: demo; nunca substituem dados reais.');
    }
    return JSON.parse(JSON.stringify(fixtures[name]));
  }

  root.LegalGrowthDemo = Object.freeze({
    version: 1,
    insight: options => copyForDemo('insight', options),
    news: options => copyForDemo('news', options),
    strategy: options => copyForDemo('strategy', options)
  });
})(window);
