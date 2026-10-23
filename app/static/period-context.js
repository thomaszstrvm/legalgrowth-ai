/* Calendar-only rules, shared by URL navigation and form validation. No storage or requests. */
(() => {
  const analytical = new Set(['overview', 'campaigns', 'agents', 'insights']);
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || value.slice(0,4) < '1000') return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function validate(start, end) {
    if (!validDate(start)) return {field:'start', message:'Informe uma data inicial válida.'};
    if (!validDate(end)) return {field:'end', message:'Informe uma data final válida.'};
    if (start > end) return {field:'end', message:'A data final deve ser igual ou posterior à data inicial.'};
    if ((Date.parse(end) - Date.parse(start)) / 86400000 > 366) return {field:'end', message:'Escolha um intervalo de até 366 dias entre as datas.'};
    return null;
  }
  const validMonth = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '') && value.slice(0,4) >= '1000';
  const addDays = (value, days) => {
    if (!validDate(value)) return '';
    const date = new Date(value + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0,10);
  };
  window.LegalGrowthPeriod = Object.freeze({analytical, validDate, validMonth, validate, addDays});
})();
