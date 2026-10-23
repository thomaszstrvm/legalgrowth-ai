"""Audit synthetic CSS without importing project configuration."""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('audit_design_tokens', Path(__file__).parents[1] / 'scripts/audit-design-tokens.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def test_active_styles_mixed_literals_and_font_shorthand():
    sources = {'tokens.css': ':root { --space: 8px; --ink: #222; --ui: "Example"; }',
               'style.css': '.a { color:var(--ink); padding:var(--space) 4px; border-radius:0; font:16px/1.5 var(--ui); }',
               'arc.css': '.a { padding:12px; color:#fff; }'}
    result = audit.inventory(sources, list(sources))
    assert result['total']['spacing']['declarations'] == 2
    assert result['total']['spacing']['with_token'] == 1
    assert result['total']['spacing']['mixed_token_and_literal'] == 1
    assert result['total']['font_size']['with_token'] == 0
    assert result['total']['font_family']['with_token'] == 1
    assert result['files']['tokens.css']['color']['declarations'] == 0
    assert result['total']['color']['declarations'] == 2
    assert not result['tokens']['undefined_without_fallback']


def test_runtime_template_and_fallback_exceptions():
    sources = {'style.css': '.a { left:var(--offset); color:var(--missing); width:var(--optional,10px); padding:var(--template-size); }',
               'app.js': "element.style.setProperty('--offset', number);",
               'view.html': '<div style="--template-size: 2px"><svg fill="var(--svg-ink)"></svg></div>'}
    result = audit.inventory(sources, ['style.css'])['tokens']
    assert set(result['undefined_without_fallback']) == {'--missing', '--svg-ink'}
    assert set(result['undefined_with_fallback_only']) == {'--optional'}
    assert result['runtime_assignment_exceptions']['--offset'][0]['file'] == 'app.js'
    assert result['template_definition_exceptions']['--template-size'][0]['file'] == 'view.html'


def test_comments_font_faces_quoted_semicolons_and_line_numbers():
    css = '/* color:red; */\n@font-face { font-family:"Registered"; src:url("data:a;b"); }\n.a { font-family:"Visible; Family"; font-size:var(--size); }'
    result = audit.inventory({'style.css': css}, ['style.css'])
    assert result['total']['color']['declarations'] == 0
    assert result['total']['font_family']['declarations'] == 1
    assert result['total']['font_family']['literal_declarations'][0]['line'] == 3
    assert result['total']['font_family']['literal_declarations'][0]['component_value'] == '"Visible; Family"'
