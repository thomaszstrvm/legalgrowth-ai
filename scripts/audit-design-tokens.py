"""Inventory token references in CSS declarations (not a visual/a11y certificate)."""
from pathlib import Path
import json
import re

css = Path('app/static/style.css').read_text(encoding='utf-8-sig')
groups = {
    'spacing': r'(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block))?|(?:row-|column-)?gap',
    'font_size': r'font-size',
    'color': r'color|background(?:-color)?|border-color|outline-color|stroke|fill',
}
result = {}
for name, properties in groups.items():
    declarations = re.findall(r'(?:^|[;{}])\s*(' + properties + r')\s*:\s*([^;{}]+)', css, flags=re.M)
    tokenized = [(prop, value) for prop, value in declarations if 'var(--' in value]
    result[name] = {
        'declarations': len(declarations),
        'with_token': len(tokenized),
        'percent': round(100 * len(tokenized) / len(declarations), 1) if declarations else None,
        'without_token': sorted({f'{prop}: {value.strip()}' for prop, value in declarations if 'var(--' not in value}),
    }
target = Path('output/design-review/token-inventory.json')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
