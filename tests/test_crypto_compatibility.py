"""Old ciphertext must remain readable after security dependency upgrades.

The checked-in vector is deliberately public and contains only synthetic data.
"""
import json
from pathlib import Path

import pytest
from cryptography.fernet import Fernet, InvalidToken
from pydantic import SecretStr

from app.config import settings
from app.services import ai, privacy


@pytest.mark.parametrize("key_source", ["environment", "file"])
def test_v47_ciphertext_remains_readable(key_source, tmp_path, monkeypatch):
    vector = json.loads((Path(__file__).parent / "fixtures/fernet_v47.json").read_text(encoding="utf-8"))
    for prefix in ("ai", "data"):
        key_path = tmp_path / (prefix + ".key")
        if key_source == "file":
            key_path.write_text(vector["key"], encoding="ascii")
        monkeypatch.setattr(settings, prefix + "_key_file", str(key_path))
        monkeypatch.setattr(settings, prefix + "_encryption_key",
                            SecretStr(vector["key"] if key_source == "environment" else ""))

    assert privacy.open_labels(vector["labels_token"]) == vector["labels"]
    assert ai.cipher().decrypt(vector["api_token"].encode()).decode() == vector["api_key"]
    assert privacy.open_labels(privacy.seal_labels(vector["labels"])) == vector["labels"]
    with pytest.raises(InvalidToken):
        Fernet(Fernet.generate_key()).decrypt(vector["api_token"].encode())
    for prefix in ("ai", "data"):
        key_path = tmp_path / (prefix + ".key")
        if key_source == "file":
            assert key_path.read_text(encoding="ascii") == vector["key"]
        else:
            assert not key_path.exists()
