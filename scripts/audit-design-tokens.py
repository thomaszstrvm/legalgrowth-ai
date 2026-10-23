"""Static inventory of active CSS tokens; not a visual or accessibility certificate."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
GROUPS = {
    'color': r'color|background(?:-color)?|(?:border(?:-(?:top|right|bottom|left|inline|block))?|outline)(?:-color)?|fill|stroke|accent-color|caret-color|text-decoration-color|(?:box|text)-shadow|scrollbar-color',
    'spacing': r'(?:margin|padding)(?:-[a-z-]+)?|(?:row-|column-)?gap',
    'font_family': r'font-family', 'font_size': r'font-size', 'radius': r'border(?:-[a-z-]+)?-radius',
}
REFS = re.compile(r'var\(\s*(--[\w-]+)\s*([,)])')
GLOBALS = {'inherit', 'initial', 'unset', 'revert', 'revert-layer'}


def uncomment(source):
    return re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m[0]), source, flags=re.S)


def declarations(source):
    """Respect strings/functions when locating declaration delimiters."""
    source = uncomment(source)
    stack, quote, depth, start, escaped = [], None, 0, 0, False
    for index, char in enumerate(source):
        if quote:
            if escaped: escaped = False
            elif char == '\\': escaped = True
            elif char == quote: quote = None
            continue
        if char in "\"'": quote = char; continue
        if char == '(': depth += 1
        elif char == ')': depth = max(0, depth - 1)
        if depth: continue
        if char == '{':
            stack.append(source[start:index].strip()); start = index + 1
        elif char in ';}':
            match = re.fullmatch(r'\s*(--[\w-]+|[a-z-]+)\s*:\s*(.*?)\s*', source[start:index], re.S)
            if stack and match:
                yield {'property': match[1], 'value': match[2], 'line': source.count('\n', 0, start + match.start(1)) + 1,
                       'selector': stack[-1], 'font_face': any(item.startswith('@font-face') for item in stack)}
            if char == '}' and stack: stack.pop()
            start = index + 1


def font_components(value):
    parts = re.findall(r'(?:var|clamp|min|max|calc)\([^)]*\)(?:/[^\s]+)?|(?:"[^"]*"|\'[^\']*\')|[^\s]+', value)
    if len(parts) == 1 and parts[0] in GLOBALS: return value, value
    for index, item in enumerate(parts):
        if re.match(r'(?:\d*\.)?\d+(?:px|rem|em|%|vw|vh|pt)(?:/|$)|(?:var|clamp|min|max|calc)\(|(?:xx?-small|small|medium|large|x{1,2}-large)(?:/|$)', item):
            return item.split('/')[0], ' '.join(parts[index + 1:]) or '(unresolved font shorthand)'
    return '(unresolved font shorthand)', '(unresolved font shorthand)'


def outside_vars(value):
    result, index = '', 0
    while index < len(value):
        if value.startswith('var(', index):
            depth, index = 1, index + 4
            while index < len(value) and depth:
                if value[index] == '(': depth += 1
                elif value[index] == ')': depth -= 1
                index += 1
        else: result += value[index]; index += 1
    result = re.sub(r'\s*!important\s*$', '', result).strip(' ,')
    return '' if result in GLOBALS else result


def summarize(items):
    count = sum(bool(REFS.search(item['component_value'])) for item in items)
    literals = [dict(item, outside_token_value=outside_vars(item['component_value'])) for item in items if outside_vars(item['component_value'])]
    return {'declarations': len(items), 'with_token': count, 'without_token': len(items) - count,
            'token_reference_share_percent': round(100 * count / len(items), 1) if items else None,
            'mixed_token_and_literal': sum(bool(REFS.search(item['component_value'])) for item in literals),
            'literal_declarations': literals}


def inventory(sources, active_styles):
    definitions, references, runtime, template_definitions = {}, {}, {}, {}
    grouped, files = {category: [] for category in GROUPS}, {}
    for path in active_styles:
        local = {category: [] for category in GROUPS}
        for declaration in declarations(sources[path]):
            prop, value = declaration['property'], declaration['value']
            evidence = {'file': path, **declaration}
            if prop.startswith('--'):
                definitions.setdefault(prop, []).append(evidence); continue
            if declaration['font_face']: continue
            components = {key: value for key, pattern in GROUPS.items() if re.fullmatch(pattern, prop)}
            if prop == 'font':
                size, family = font_components(value); components.update(font_size=size, font_family=family)
            for category, component in components.items():
                item = {key: val for key, val in evidence.items() if key != 'font_face'}
                item['component_value'] = component
                local[category].append(item); grouped[category].append(item)
        files[path] = {category: summarize(items) for category, items in local.items()}
    for path, source in sources.items():
        if path not in active_styles and not path.endswith(('.js', '.html')): continue
        clean = uncomment(source)
        for match in REFS.finditer(clean):
            references.setdefault(match[1], []).append({'file': path, 'line': clean.count('\n', 0, match.start()) + 1, 'has_fallback': match[2] == ','})
        if path.endswith('.js'):
            for match in re.finditer(r'\.setProperty\(\s*["\'](--[\w-]+)["\']\s*,', clean):
                runtime.setdefault(match[1], []).append({'file': path, 'line': clean.count('\n', 0, match.start()) + 1})
        if path.endswith('.html'):
            for match in re.finditer(r'(--[\w-]+)\s*:', clean):
                template_definitions.setdefault(match[1], []).append({'file': path, 'line': clean.count('\n', 0, match.start()) + 1})
    missing = {name: uses for name, uses in references.items() if name not in definitions and name not in runtime and name not in template_definitions}
    return {'generated_at': datetime.now(timezone.utc).isoformat(),
            'method': 'Declaration references, not computed CSS, semantic token correctness, visual quality or WCAG compliance.',
            'active_styles': active_styles, 'source_hashes': {path: hashlib.sha256(source.encode()).hexdigest() for path, source in sources.items()},
            'custom_property_definitions_by_file': {path: sum(item['file'] == path for values in definitions.values() for item in values) for path in active_styles},
            'files': files, 'total': {category: summarize(items) for category, items in grouped.items()},
            'tokens': {'css_definitions': definitions, 'references': references, 'runtime_assignment_exceptions': runtime, 'template_definition_exceptions': template_definitions,
                       'undefined_without_fallback': {name: uses for name, uses in missing.items() if any(not use['has_fallback'] for use in uses)},
                       'undefined_with_fallback_only': {name: uses for name, uses in missing.items() if all(use['has_fallback'] for use in uses)}},
            'limitations': [
                'Ratios count categorized declarations with any var() reference; mixed literals are separately listed. This is not a conformity score.',
                'Overridden declarations and media rules count. Cascade, selector/theme reachability and computed styles are not evaluated.',
                'Custom-property definitions and @font-face registrations are excluded from adoption denominators.',
                'A definition may be unavailable under another selector; global detection does not prove inheritance or a valid computed value.',
                'Literal-name JS setProperty and template declarations are documented exceptions, not proof that assignments execute for each affected element.',
                'Literal lists include structural values such as 0, auto, transparent and currentColor; these are not necessarily errors. var() fallbacks are omitted from outside-token values.',
                'Common font shorthands are split into size/family; exotic/all-in-one token forms may be unresolved. CSS nesting and custom-property block values are not fully parsed.',
                'JS/template/SVG references participate in undefined detection; inline-style adoption is outside the CSS denominator.',
                'Working-tree files are read independently, not as an atomic filesystem snapshot; source hashes identify exactly what was read.',
            ]}


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8').stdout


def load_sources(ref=None):
    if ref:
        revision = git('rev-parse', '--verify', '--end-of-options', ref + '^{commit}').strip()
        paths = git('ls-tree', '-r', '--name-only', revision, '--', 'app/static', 'app/templates').splitlines()
        read = lambda path: git('show', f'{revision}:{path}')
    else:
        revision = 'working-tree'
        paths = [path.relative_to(ROOT).as_posix() for folder in ('app/static', 'app/templates') for path in (ROOT / folder).rglob('*') if path.is_file()]
        read = lambda path: (ROOT / path).read_text(encoding='utf-8-sig')
    template = read('app/templates/dashboard.html')
    active = list(dict.fromkeys('app' + match for match in re.findall(r'href=["\'](/static/[^"\'?]+\.css)(?:\?[^"\']*)?["\']', template)))
    sources = {path: read(path) for path in sorted(paths) if path in active or path.endswith(('.js', '.html'))}
    absent = set(active) - sources.keys()
    if absent: raise ValueError('Active stylesheet missing: ' + ', '.join(sorted(absent)))
    return revision, inventory(sources, active)


def compact(result):
    return {category: {key: value for key, value in counts.items() if key != 'literal_declarations'} for category, counts in result.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', help='Compare working tree with a Git commit/ref, read-only.')
    parser.add_argument('--output', default='output/design-review/token-inventory.json')
    args = parser.parse_args()
    _, result = load_sources()
    if args.ref:
        revision, baseline = load_sources(args.ref)
        result['comparison'] = {'requested_ref': args.ref, 'resolved_commit': revision, 'baseline_active_styles': baseline['active_styles'],
                                'baseline_files': {path: compact(counts) for path, counts in baseline['files'].items()}, 'baseline_total': compact(baseline['total']),
                                'delta': {category: {key: result['total'][category][key] - baseline['total'][category][key] for key in ('declarations', 'with_token', 'without_token')} for category in GROUPS},
                                'note': 'Source snapshots and active styles, not matched visual elements or browser outcomes.'}
    target = ROOT / args.output
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'output': str(target), 'files': {path: compact(counts) for path, counts in result['files'].items()}, 'total': compact(result['total']),
                      'undefined_without_fallback': result['tokens']['undefined_without_fallback'], 'runtime_assignment_exceptions': result['tokens']['runtime_assignment_exceptions'],
                      'comparison': result.get('comparison')}, ensure_ascii=False))


if __name__ == '__main__': main()
