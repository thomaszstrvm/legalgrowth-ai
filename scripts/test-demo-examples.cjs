'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// No document, fetch, timers, storage, credentials or database are exposed.
const sandbox = {window: {}};
vm.createContext(sandbox, {codeGeneration: {strings: false, wasm: false}});
vm.runInContext(fs.readFileSync('app/static/demo-examples.js', 'utf8'), sandbox);
const demo = sandbox.window.LegalGrowthDemo;
assert.ok(Object.isFrozen(demo));
assert.deepEqual(Object.keys(sandbox.window), ['LegalGrowthDemo']);
let checks = 0;
for (const name of ['insight', 'news', 'strategy']) {
  for (const options of [undefined, {}, {scope: 'real'}, {scope: 'unknown'}]) {
    assert.throws(() => demo[name](options), /exigem scope: demo/);
  }
  const fixture = demo[name]({scope: 'demo'});
  const baseline = JSON.stringify(fixture);
  assert.equal(fixture.status, 'demonstration');
  assert.equal(fixture.scope, 'demo');
  assert.equal(fixture.demonstration, true);
  assert.match(fixture.notice, /fictícios.*Nenhuma IA foi executada/);
  assert.match(fixture.period_note, /não usa os filtros/);
  assert.doesNotMatch(baseline, /https?:\/\/|api_key|human_confirmed.*true/);
  fixture.notice = 'changed';
  if (name === 'insight') fixture.findings[0].evidence[0].value = -1;
  if (name === 'news') fixture.latest.articles[0].title = 'changed';
  if (name === 'strategy') fixture.opportunities[0].social.weights.access = -1;
  assert.equal(JSON.stringify(demo[name]({scope: 'demo'})), baseline);
  checks++;
}
const insight = demo.insight({scope: 'demo'});
assert.equal(insight.created_at, null);
assert.equal(insight.reviewer, 'Não executada');
assert.equal(Object.keys(insight.models).length, 0);
const values = Object.fromEntries(insight.findings.flatMap(f => f.evidence).map(e => [e.metric, e.value]));
assert.equal(values.cost / values.qualified, values.cpq);
assert.equal(values.cost / values.hires, values.cph);
const news = demo.news({scope: 'demo'});
assert.equal(news.latest.created_at, null);
assert.equal(news.latest.status, 'demonstration');
const articleIds = new Set(news.latest.articles.map(a => a.id));
for (const article of news.latest.articles) assert.equal(article.url, null);
for (const scenario of news.latest.scenarios) {
  assert.ok(scenario.article_ids.every(id => articleIds.has(id)));
  assert.match(scenario.scenario, /^Se .*poderia/);
}
for (const source of news.latest.sources) assert.equal(source.status, 'demonstration');
for (const item of demo.strategy({scope: 'demo'}).opportunities) {
  assert.equal(item.source_url, null);
  assert.ok(articleIds.has(item.source_article_id));
  assert.equal(item.human_review_required, true);
  for (const dimension of [item.social, item.financial]) {
    assert.equal(dimension.score, null);
    assert.equal(Object.keys(dimension.criteria).length, 0);
    assert.equal(dimension.missing.length, Object.keys(dimension.weights).length);
    assert.equal(Object.values(dimension.weights).reduce((sum, value) => sum + value, 0), 100);
  }
}
console.log(JSON.stringify({factories: checks,scopeGuards:12,independentClones:true,networkOrStorageAccess:false,syntheticSourceReferences:true,consistentArithmetic:true,realExecutions:0}));
