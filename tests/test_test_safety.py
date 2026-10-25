import httpx
import pytest


def test_real_http_transport_is_disabled():
    with pytest.raises(AssertionError, match='Real HTTP forbidden'):
        with httpx.Client(trust_env=False) as client:
            client.get('https://example.invalid/synthetic')
