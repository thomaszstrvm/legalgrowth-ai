"""Anthropic Messages API, fixed model/endpoint; no tools, retries or response logs."""
import json
import httpx
from app.integrations.openai import AIError, PrioritySelection

MODEL = 'claude-haiku-4-5-20251001'
BASE_URL = 'https://api.anthropic.com/v1'


def request(method, path, key, payload=None):
    if method != 'GET':
        from app.services.gateway import prepare, identifier_check
        payload = dict(payload)
        messages = payload.get('messages', [])
        if len(messages) != 1 or messages[0].get('role') != 'user':
            raise AIError('Formato de envio não permitido.', 422)
        payload['messages'] = [{'role': 'user', 'content': prepare(messages[0]['content'])}]
        identifier_check(payload.get('system', ''))
    try:
        with httpx.Client(timeout=httpx.Timeout(40, connect=8), follow_redirects=False, trust_env=False) as client:
            response = client.request(method, BASE_URL + path, headers={
                'x-api-key': key, 'anthropic-version': '2023-06-01'}, json=payload)
    except httpx.TimeoutException:
        raise AIError('O Claude demorou para responder. Tente novamente mais tarde.', 504) from None
    except httpx.HTTPError:
        raise AIError('Não foi possível acessar o Claude. Verifique a conexão com a internet.') from None
    if response.status_code in (401, 403):
        raise AIError('A chave não foi aceita. Confira as permissões na Anthropic.', 422)
    if response.status_code == 429:
        raise AIError('O Claude informou um limite de uso. Confira os créditos e tente mais tarde.', 429)
    if response.status_code == 404:
        raise AIError('O modelo Claude não está disponível para esta conta.', 422)
    if response.status_code >= 300:
        raise AIError('O Claude não concluiu a solicitação. Tente novamente mais tarde.')
    try:
        return response.json()
    except ValueError:
        raise AIError('A resposta do Claude não pôde ser lida.') from None


def verify_key(key):
    result = request('GET', '/models/' + MODEL, key)
    if not isinstance(result, dict) or result.get('id') != MODEL:
        raise AIError('Não foi possível confirmar o acesso ao Claude.')


def structured(key, instructions, content, schema, max_tokens=2000):
    result = request('POST', '/messages', key, {
        'model': MODEL, 'max_tokens': max_tokens, 'system': instructions,
        'messages': [{'role': 'user', 'content': content}],
        'output_config': {'format': {'type': 'json_schema', 'schema': schema}},
    })
    try:
        if result['stop_reason'] != 'end_turn':
            raise ValueError()
        return json.loads(''.join(p['text'] for p in result['content'] if p['type'] == 'text'))
    except (KeyError, ValueError, TypeError):
        raise AIError('A resposta do Claude está incompleta ou não pôde ser conferida.') from None


def prioritize(key, candidates):
    content = json.dumps(candidates, ensure_ascii=True, separators=(',', ':'))
    if len(content.encode()) > 12000:
        raise AIError('Escolha um período menor para esta análise.', 422)
    schema = {'type': 'object', 'properties': {'priority_ids': {'type': 'array', 'items': {'type': 'integer'}}}, 'required': ['priority_ids'], 'additionalProperties': False}
    result = structured(key, 'Priorize até cinco IDs fornecidos. Considere gasto sem resultado e dados insuficientes. Conversões não são contratações. Retorne apenas IDs existentes e únicos.', content, schema, 500)
    try:
        selected = PrioritySelection.model_validate(result).priority_ids
        if not set(selected) <= {c['id'] for c in candidates} or len(selected) != len(set(selected)):
            raise ValueError()
        return selected
    except ValueError:
        raise AIError('A resposta do Claude não passou na conferência.') from None
