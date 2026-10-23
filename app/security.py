import secrets
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from app.config import settings

basic = HTTPBasic()


def current_user(credentials: HTTPBasicCredentials = Depends(basic)):
    accounts = {'admin': settings.admin_password.get_secret_value(), 'viewer': settings.viewer_password.get_secret_value()}
    expected = accounts.get(credentials.username, '')
    if not expected or not secrets.compare_digest(credentials.password.encode(), expected.encode()):
        raise HTTPException(401, 'Credenciais inválidas', headers={'WWW-Authenticate': 'Basic'})
    return credentials.username


def admin(request: Request, user=Depends(current_user)):
    if user != 'admin':
        raise HTTPException(403, 'Apenas responsável pode executar esta ação')
    # Browser writes use a custom header; no CORS is enabled. Reject cross-site origins.
    if request.headers.get('x-requested-with') != 'LegalGrowth':
        raise HTTPException(403, 'Cabeçalho de proteção CSRF ausente')
    origin = request.headers.get('origin')
    if origin and origin.rstrip('/') != str(request.base_url).rstrip('/'):
        raise HTTPException(403, 'Origem não autorizada')
    return user
