"""Deterministic checks plus an offline, synthetic adversarial self-test.

Never mutate a stored report. This does not verify free prose or legal citations.
"""
from copy import deepcopy
import math


def validate_report(report, reference):
    issues = []
    observed = report.get('observed_data', {})
    if observed != reference.get('observed_data', {}):
        issues.append('observed_data_changed')
    if report.get('source_ids') != reference.get('source_ids'):
        issues.append('source_changed')
    facts = reference.get('observed_data', {}).get('current', {})
    for claim in report.get('claims', []):
        if set(claim) != {'metric', 'value', 'source_id'}:
            issues.append('unknown_claim_format')
            continue
        if claim['source_id'] not in reference.get('source_ids', []):
            issues.append('unsupported_source')
        metric, value = claim['metric'], claim['value']
        if metric not in facts or type(value) not in (int, float) or not math.isfinite(value) or value != facts[metric]:
            issues.append('unsupported_numeric_claim')
    if report.get('legal_claims'):
        issues.append('legal_claim_requires_official_verification')
    if report.get('guaranteed_outcome'):
        issues.append('guaranteed_outcome')
    return {'status': 'blocked' if issues else 'passed_numeric_checks', 'issues': sorted(set(issues)),
            'limitation': 'Confere números e referências estruturadas; não comprova todo o texto nem substitui revisão humana.'}


def adversarial_self_test():
    reference = {'observed_data': {'current': {'cost': 100.0, 'hires': 2}}, 'source_ids': ['synthetic-1']}
    clean = {**deepcopy(reference), 'claims': [{'metric': 'cost', 'value': 100.0, 'source_id': 'synthetic-1'}]}
    cases = []
    mutations = (
        ('Número trocado', lambda r: r['observed_data']['current'].update(cost=900.0)),
        ('Conclusão numérica contraditória', lambda r: r['claims'][0].update(value=500.0)),
        ('Fonte inventada', lambda r: r['claims'][0].update(source_id='invented')),
        ('Lucro sem dados de receita', lambda r: r['claims'][0].update(metric='profit', value=1000.0)),
        ('Promessa de resultado', lambda r: r.update(guaranteed_outcome=True)),
        ('Referência jurídica não conferida', lambda r: r.update(legal_claims=['Referência fictícia para teste'])),
    )
    for name, mutate in mutations:
        candidate = deepcopy(clean)
        mutate(candidate)
        checked = validate_report(candidate, reference)
        # Restore trusted structured data, not a model's invented replacement.
        restored = deepcopy(clean)
        repair_check = validate_report(restored, reference)
        cases.append({'name': name, 'detected': checked['status'] == 'blocked',
                      'restored_passed': repair_check['status'] == 'passed_numeric_checks'})
    return {'schema_version': '1.0', 'synthetic_only': True, 'external_ai_calls': 0,
            'clean_control_passed': validate_report(clean, reference)['status'] == 'passed_numeric_checks',
            'cases': cases, 'detected': sum(c['detected'] for c in cases), 'total': len(cases),
            'message': 'Erros inseridos somente em cópias fictícias. O teste não altera relatórios e não garante ausência de outros erros.'}
