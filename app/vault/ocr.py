"""Optional OCR contract only: no parser, model, worker or API integration.

Image decoding, timeouts, process isolation and network denial are NOT implemented
here. Payloads are untrusted data. See docs/UNLIMITED-OCR.md before adding engines.
"""
from dataclasses import dataclass, field
import re
from typing import Literal, Protocol

MAX_PAGE_BYTES = 10_000_000
MAX_TEXT_CHARS = 100_000


def _validate_origin(document_sha256: str, page_number: int) -> None:
    if not isinstance(document_sha256, str) or not re.fullmatch(r'[0-9a-f]{64}', document_sha256):
        raise ValueError('Invalid document digest.')
    if type(page_number) is not int or page_number < 1:
        raise ValueError('Page number must be a positive integer.')


@dataclass(frozen=True, slots=True)
class OcrPage:
    """One rendered page. MIME is a declaration, not a validated image decode."""
    document_sha256: str
    page_number: int
    image_bytes: bytes = field(repr=False)
    media_type: Literal['image/png', 'image/jpeg'] = 'image/png'

    def __post_init__(self) -> None:
        _validate_origin(self.document_sha256, self.page_number)
        if not isinstance(self.image_bytes, bytes) or not 0 < len(self.image_bytes) <= MAX_PAGE_BYTES:
            raise ValueError('Page image must be bounded, nonempty bytes.')
        if self.media_type not in ('image/png', 'image/jpeg'):
            raise ValueError('Unsupported image media type.')


@dataclass(frozen=True, slots=True)
class OcrResult:
    """Recognition is transcription, never validation of identity or truth.

No confidence or coordinates are fabricated. A blank successful transcription
is allowed; unavailable/failed/timeout must never carry apparently useful text.
"""
    document_sha256: str
    page_number: int
    status: Literal['recognized', 'unavailable', 'timeout', 'failed']
    engine: str
    revision: str
    text: str = field(default='', repr=False)
    human_confirmation_required: Literal[True] = field(default=True, init=False)

    def __post_init__(self) -> None:
        _validate_origin(self.document_sha256, self.page_number)
        if self.status not in ('recognized', 'unavailable', 'timeout', 'failed'):
            raise ValueError('Invalid OCR status.')
        if any(not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9._/-]{1,128}', value)
               for value in (self.engine, self.revision)):
            raise ValueError('Engine and revision must be bounded identifiers.')
        if not isinstance(self.text, str) or len(self.text) > MAX_TEXT_CHARS:
            raise ValueError('OCR text exceeds the contract limit.')
        if self.status != 'recognized' and self.text:
            raise ValueError('Unsuccessful OCR cannot provide recognized text.')


class OcrProvider(Protocol):
    """A future adapter implements this interface inside an isolated worker.

Expected engine failures use explicit result statuses. The supervisor must enforce
deadlines and map unexpected exceptions without logging document contents.
"""
    def recognize(self, page: OcrPage) -> OcrResult: ...


class DisabledOcrProvider:
    """Safe explicit default for future callers; does not inspect image bytes."""
    def recognize(self, page: OcrPage) -> OcrResult:
        return OcrResult(page.document_sha256, page.page_number, 'unavailable', 'disabled', 'none')


def validate_ocr_result(page: OcrPage, result: OcrResult) -> OcrResult:
    """Reject a result attached to another document/page; no I/O or OCR occurs."""
    if not isinstance(result, OcrResult):
        raise ValueError('Invalid OCR result type.')
    if (result.document_sha256, result.page_number) != (page.document_sha256, page.page_number):
        raise ValueError('OCR result does not match the requested document and page.')
    return result
