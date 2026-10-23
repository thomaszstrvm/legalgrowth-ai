"""Local identity vault. Only aliases and aggregate numbers may enter AI payloads."""
import json
import os
from pathlib import Path
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings
from app.integrations.openai import AIError


def data_cipher(create=False):
    key = settings.data_encryption_key.get_secret_value()
    if key:
        try:
            return Fernet(key.encode())
        except ValueError:
            raise AIError('A chave de proteção dos dados locais é inválida.', 503) from None
    path = Path(settings.data_key_file)
    if create and not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'wb') as stream:
                stream.write(Fernet.generate_key())
        except FileExistsError:
            pass
    try:
        return Fernet(path.read_bytes())
    except (OSError, ValueError):
        raise AIError('Não foi possível abrir a proteção dos nomes locais. Restaure a chave de dados do servidor; ela não deve ser substituída.', 503) from None


def seal_labels(labels):
    return data_cipher(create=True).encrypt(json.dumps(labels, ensure_ascii=False).encode()).decode()


def open_labels(token):
    try:
        return json.loads(data_cipher().decrypt(token.encode()))
    except (InvalidToken, ValueError):
        raise AIError('A identificação local não pôde ser recuperada. Confira a chave de dados do servidor.', 503) from None
