import re
import unicodedata

SOURCES = [
    'https://www.oab.org.br/noticia/62711/confira-versao-final-da-recomendacao-do-cfoab-sobre-o-uso-de-ia-na-pratica-juridica',
    'https://www.oab.org.br/leisnormas/legislacao/resolucoes/02-2015',
    'https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021',
    'https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes',
    'https://support.google.com/adspolicy/answer/143465',
]
RULES = [
    ('Promessa de resultado', r'garantid|100\s*%|causa ganha|voce vai ganhar|resultado certo'),
    ('Sensacionalismo ou mercantilização', r'imperdivel|melhor advogado|promocao|desconto|consulta gratis|so hoje'),
    ('Estímulo ao litígio', r'processe|entre com (uma )?acao agora|ganhe (dinheiro|indenizacao)'),
    ('Exploração de vulnerabilidade', r'endividad|desesperad|recem.demitid|idoso vulneravel|precisa de dinheiro'),
    ('Possíveis dados pessoais', r'@|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{10,11}\b'),
]


def review(text):
    normalized = ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')
    flags = [name for name, pattern in RULES if re.search(pattern, normalized)]
    blocked = any(f in flags for f in ('Promessa de resultado', 'Estímulo ao litígio', 'Possíveis dados pessoais'))
    status = 'Bloqueado por regra preventiva' if blocked else 'Requer revisão de advogado' if flags else 'Sem impedimento preliminar identificado'
    return {'flags': flags, 'human_review_required': True, 'status': status, 'publication_allowed': False, 'limitation': 'Triagem lexical pode produzir falsos positivos e negativos. Ausência de alertas não é aprovação jurídica. Revalidar vigência das normas antes de publicar.', 'sources': SOURCES, 'rules_checked_on': '2026-10-22'}
