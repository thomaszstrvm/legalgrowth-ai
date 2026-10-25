"""Fixed endpoint, no custom URL, tools, retries, external publication or raw response logging."""
import json
import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError

MODEL = 'gpt-4.1-mini'
BASE_URL = 'https://api.openai.com/v1'


class AIError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


class PrioritySelection(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    priority_ids: list[int] = Field(min_length=1, max_length=5)


def request(method, path, key, payload=None):
    if method != 'GET':
        from app.services.gateway import prepare, identifier_check
        payload = dict(payload)
        payload['input'] = prepare(payload['input'])
        identifier_check(payload.get('instructions', ''))
    try:
        # Explicitly no retries: uncertain requests must not cause duplicate billing.
        from app.services.ai_observability import mark_request, capture_usage
        mark_request()
        with httpx.Client(timeout=httpx.Timeout(25, connect=8), follow_redirects=False, trust_env=False) as client:
            response = client.request(method, BASE_URL + path, headers={'Authorization': 'Bearer ' + key}, json=payload)
    except httpx.TimeoutException:
        raise AIError('A IA demorou para responder. Tente novamente mais tarde.', 504) from None
    except httpx.HTTPError:
        raise AIError('Não foi possível acessar a OpenAI. Verifique a conexão com a internet.') from None
    if response.status_code in (401, 403):
        raise AIError('A chave não foi aceita. Confira a chave e suas permissões na OpenAI.', 422)
    if response.status_code == 429:
        raise AIError('A OpenAI informou um limite de uso. Confira os créditos e tente mais tarde.', 429)
    if response.status_code == 404:
        raise AIError('O modelo configurado não está disponível para esta conta.', 422)
    if response.status_code >= 300:
        raise AIError('A OpenAI não concluiu a solicitação. Tente novamente mais tarde.')
    try:
        result = response.json()
        capture_usage(result, 'openai')
        return result
    except ValueError:
        raise AIError('A resposta da IA não pôde ser lida.') from None


def verify_key(key):
    response = request('GET', '/models/' + MODEL, key)
    if not isinstance(response, dict) or response.get('id') != MODEL:
        raise AIError('Não foi possível confirmar o acesso ao modelo.')


def structured(key, instructions, content, schema, max_tokens=2000):
    result = request('POST', '/responses', key, {
        'model': MODEL, 'store': False, 'max_output_tokens': max_tokens,
        'instructions': instructions, 'input': content,
        'text': {'format': {'type': 'json_schema', 'name': 'campaign_insights', 'strict': True, 'schema': schema}},
    })
    try:
        if result.get('status') != 'completed':
            raise ValueError()
        return json.loads(''.join(p['text'] for item in result['output'] if item.get('type') == 'message' for p in item.get('content', []) if p.get('type') == 'output_text'))
    except (ValueError, KeyError, TypeError, AttributeError):
        raise AIError('A resposta da OpenAI está incompleta ou não pôde ser conferida.') from None


def prioritize(key, candidates):
    # Only server-calculated numbers, predefined categories and internal ids are sent.
    content = json.dumps(candidates, ensure_ascii=True, separators=(',', ':'))
    if len(content.encode()) > 12000:
        raise AIError('Há muitas informações para esta análise. Escolha um período menor.', 422)
    schema = PrioritySelection.model_json_schema()
    payload = {
        'model': MODEL, 'store': False, 'max_output_tokens': 500,
        'instructions': 'Priorize até cinco recomendações para um escritório brasileiro com orçamento pequeno. Use somente os IDs fornecidos, em ordem de importância. Prefira problemas de mensuração e gasto sem retorno registrado; considere insuficiência de dados. Conversões não são contratações. Não acrescente texto, números ou fontes. Não publique nem altere campanhas.',
        'input': content,
        'text': {'format': {'type': 'json_schema', 'name': 'priorities', 'strict': True, 'schema': schema}},
    }
    result = request('POST', '/responses', key, payload)
    try:
        if result.get('status') != 'completed':
            raise ValueError()
        text = ''.join(part['text'] for item in result['output'] if item.get('type') == 'message' for part in item.get('content', []) if part.get('type') == 'output_text')
        selected = PrioritySelection.model_validate_json(text)
        valid = {c['id'] for c in candidates}
        if not set(selected.priority_ids) <= valid or len(set(selected.priority_ids)) != len(selected.priority_ids):
            raise ValueError()
        return selected.priority_ids
    except (ValidationError, ValueError, KeyError, TypeError, AttributeError):
        raise AIError('A resposta da IA não passou na conferência. As recomendações locais foram mantidas.') from None
