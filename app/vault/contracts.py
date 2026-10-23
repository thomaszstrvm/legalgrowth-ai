"""Generic local extraction prototype. Real-document ingestion is not enabled.

The web application can only exercise this module with a server-generated fixture.
Parsing arbitrary PDFs requires an isolated, network-disabled worker first.
"""
from datetime import datetime
from hashlib import sha256
from io import BytesIO
import re
import unicodedata
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from pypdf import PdfReader

LABELS = {
    'name': ('nome', 'nome completo', 'contratante'), 'cpf': ('cpf',), 'rg': ('rg',),
    'birth_date': ('data de nascimento', 'nascimento'), 'phone': ('telefone', 'celular'),
    'email': ('email', 'e-mail'), 'address': ('endereco',), 'city': ('cidade',),
    'state': ('uf', 'estado'), 'postal_code': ('cep',), 'legal_area': ('area juridica',),
    'service': ('servico', 'objeto'), 'contract_date': ('data do contrato',),
    'benefit_number': ('numero do beneficio', 'nb'),
}


class Origin(BaseModel):
    page: int
    method: Literal['acroform', 'digital_text']
    label: str
    position: list[float] | None = None


class ExtractedField(BaseModel):
    value: str | None = None
    status: Literal['validado', 'revisão necessária', 'ausente', 'não aplicável'] = 'ausente'
    reason: str = 'Campo não encontrado; preencha ou marque como não aplicável após conferir.'
    origins: list[Origin] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)


class ContractPreview(BaseModel):
    model_config = ConfigDict(extra='forbid')
    schema_version: Literal['1.0'] = '1.0'
    document_hash: str
    template_version: str = 'generic-1'
    fields: dict[str, ExtractedField]
    needs_local_ocr: bool
    human_confirmation_required: Literal[True] = True
    real_ingestion_enabled: Literal[False] = False


def normalized(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.lower()) if not unicodedata.combining(c)).strip()


def valid_cpf(value):
    digits = re.sub(r'[.\-\s]', '', value)
    if not re.fullmatch(r'[0-9]{11}', digits) or len(set(digits)) == 1:
        return False
    for size in (9, 10):
        total = sum(int(digits[index]) * (size + 1 - index) for index in range(size))
        check = (total * 10 % 11) % 10
        if check != int(digits[size]):
            return False
    return True


def check_value(field, value):
    if not value or len(value) > 300 or value.endswith(('...', '…')):
        return 'revisão necessária', 'Valor vazio, muito longo ou aparentemente cortado.'
    if field == 'cpf':
        ok = valid_cpf(value)
    elif field in ('birth_date', 'contract_date'):
        try:
            datetime.strptime(value, '%d/%m/%Y')
            ok = True
        except ValueError: ok = False
    elif field == 'email': ok = bool(re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value))
    elif field == 'postal_code': ok = bool(re.fullmatch(r'\d{5}-?\d{3}', value))
    elif field == 'state': ok = value.upper() in 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split()
    elif field == 'phone': ok = bool(re.fullmatch(r'(?:55)?\d{10,11}', re.sub(r'[+()\s-]', '', value)))
    else:
        return 'revisão necessária', 'Confira o conteúdo no contrato. Não existe validação automática suficiente.'
    return ('validado', 'Formato conferido; isso não comprova identidade nem veracidade.') if ok else ('revisão necessária', 'O formato não passou na conferência automática.')


def extract_synthetic_pdf(content: bytes, labels=None):
    """Development-only parser; never expose this function as an upload endpoint."""
    if len(content) > 5_000_000 or not content.startswith(b'%PDF-'):
        raise ValueError('Arquivo PDF inválido ou maior que 5 MB.')
    try:
        reader = PdfReader(BytesIO(content), strict=True)
        if reader.is_encrypted or not 1 <= len(reader.pages) <= 30:
            raise ValueError('PDF protegido ou número de páginas não permitido.')
        # Inspect parsed dictionaries too: a raw-byte search misses escaped names.
        forbidden = {'/JS', '/JavaScript', '/OpenAction', '/AA', '/Launch', '/EmbeddedFiles', '/RichMedia', '/XFA'}
        visited = set()
        def inspect(obj, depth=0):
            if depth > 40: raise ValueError('Estrutura PDF excessivamente complexa.')
            if hasattr(obj, 'get_object'): obj = obj.get_object()
            if id(obj) in visited: return
            visited.add(id(obj))
            if isinstance(obj, dict):
                if forbidden.intersection(str(k) for k in obj): raise ValueError('PDF com conteúdo ativo não permitido.')
                for k, v in obj.items():
                    if str(k) not in ('/Parent', '/P'): inspect(v, depth + 1)
            elif isinstance(obj, list):
                for item in obj: inspect(item, depth + 1)
        inspect(reader.trailer)
        aliases = {normalized(label): field for field, names in (labels or LABELS).items() for label in names}
        values = {field: [] for field in LABELS}
        text_present = False
        for number, page in enumerate(reader.pages, 1):
            for ref in page.get('/Annots', []):
                widget = ref.get_object()
                parent = widget.get('/Parent')
                owner = parent.get_object() if parent else widget
                label = str(widget.get('/T', owner.get('/T', '')))
                field = aliases.get(normalized(label))
                value = str(widget.get('/V', owner.get('/V', ''))).strip()
                if field and value:
                    rect = widget.get('/Rect')
                    values[field].append((value, Origin(page=number, method='acroform', label=label,
                        position=[float(x) for x in rect] if rect else None)))
            text = page.extract_text() or ''
            if len(text) > 100_000: raise ValueError('Página excede o limite de texto.')
            text_present |= bool(text.strip())
            # Only explicit one-line labels. No random number/paragraph inference.
            for line in text.splitlines():
                if ':' not in line: continue
                label, value = line.split(':', 1)
                field = aliases.get(normalized(label))
                if field and value.strip():
                    values[field].append((value.strip(), Origin(page=number, method='digital_text', label=label)))
        fields = {}
        for field, candidates in values.items():
            if not candidates:
                fields[field] = ExtractedField()
                continue
            unique = list(dict.fromkeys(v for v, _ in candidates))
            status, reason = check_value(field, unique[0])
            if len(unique) > 1: status, reason = 'revisão necessária', 'Há valores diferentes para este campo. Confira as páginas indicadas.'
            fields[field] = ExtractedField(value=unique[0], status=status, reason=reason,
                origins=[o for _, o in candidates], alternatives=unique[1:])
        return ContractPreview(document_hash=sha256(content).hexdigest(), fields=fields,
            needs_local_ocr=not text_present and not any(values.values()))
    except Exception:
        # Do not include parser fragments, filenames or document content in errors.
        raise ValueError('Não foi possível conferir este PDF com segurança. Use revisão local manual.') from None


class LocalDocumentReviewer:
    """No installed/verified local model: manual review, never cloud fallback."""
    def review(self, field: ExtractedField):
        return {'status': 'manual_required', 'suggestion': None,
                'reason': 'Revisor local não configurado. Nenhum trecho foi enviado a serviços externos.'}


def demo_preview():
    from reportlab.pdfgen.canvas import Canvas
    stream = BytesIO()
    canvas = Canvas(stream)
    canvas.drawString(50, 800, 'DOCUMENTO FICTICIO - EXEMPLO DE EXTRACAO')
    canvas.drawString(50, 770, 'Nome completo: Pessoa de Exemplo')
    canvas.drawString(50, 750, 'CPF: 000.000.000-00')
    canvas.drawString(50, 730, 'Cidade: Cidade Ficticia')
    canvas.drawString(50, 710, 'Data do contrato: 22/10/2026')
    canvas.save()
    return extract_synthetic_pdf(stream.getvalue())
