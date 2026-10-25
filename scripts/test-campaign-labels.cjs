'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('app/static/app.js', 'utf8');
const lines = source.split(/\r?\n/);
const context = {};
vm.createContext(context, {codeGeneration: {strings: false, wasm: false}});
// Evaluate the actual pure renderers without bootstrapping the application,
// network, DOM, storage or credentials.
const helpers = ['const esc =', 'const brl =', 'const num =', 'const empty='];
const code = helpers.map(prefix => lines.find(line => line.startsWith(prefix))).join('\n')
  + '\nlet tableSequence = 0;\n'
  + source.slice(source.indexOf('function table('), source.indexOf('function bindTableOverflow('))
  + '\n' + lines.find(line => line.startsWith('function metricTable('))
  + '\n' + source.slice(source.indexOf('function overviewCampaigns('));
vm.runInContext(code, context);
const values = {cost: 10, qualified: 2, hires: 1, cpq: 5, cph: 10};
const data = {'10001': {...values, label: '<Synthetic & campaign>'},
  '10002': {...values, cost: 20, label: '<Synthetic & campaign>'}};
for (const html of [context.overviewCampaigns(data), context.metricTable(data), context.metricTable(data, true)]) {
  assert.doesNotMatch(html, /10001|10002|<Synthetic & campaign>/);
  assert.ok((html.match(/&lt;Synthetic &amp; campaign&gt;/g) || []).length >= 2);
  assert.equal((html.match(/<tbody>[\s\S]*?<\/tbody>/g) || []).length, 1);
  const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  assert.equal((body.match(/<tr>/g) || []).length, 2);
}
assert.match(context.overviewCampaigns({'Legacy synthetic label': values}), /Legacy synthetic label/);
assert.match(context.metricTable({'Synthetic city': values}, false, 'Cidade'), /Synthetic city/);
console.log('Campaign renderers: duplicate labels retain two rows, IDs hidden, labels escaped, legacy/other dimensions supported.');
