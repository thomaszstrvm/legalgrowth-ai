# Revisão dos alertas de dependências - 23/10/2026

## Achados e escopo

A API autenticada do GitHub confirmou quatro alertas abertos, todos em `cryptography==47.0.0`, no arquivo `requirements-lock.txt`: três altos e um moderado. A auditoria npm da apresentação não cobre dependências Python. Os alertas indicam versões vulneráveis; não demonstram que houve exploração ou vazamento.

| Alerta | Gravidade | Problema | Primeira versão corrigida |
|---|---|---|---|
| GHSA-m2h6-j472-rp4c | Moderada | Restrições de nomes DNS na validação de certificados | 49.0.0 |
| GHSA-jwv3-5hgf-82ww | Alta | Custo exponencial na construção de cadeias de certificados | 49.0.0 |
| GHSA-g6cj-pr64-35w5 | Alta | Erros e tempo de execução distinguíveis ao decifrar PKCS#7 | 50.0.0 |
| GHSA-537c-gmf6-5ccf | Alta | OpenSSL vulnerável distribuído nos pacotes binários | 48.0.1 |

A busca no código encontrou Fernet em `app/services/ai.py` e `app/services/privacy.py`, para chaves de provedores e identificação local. Não encontrou chamadas diretas às APIs X.509 ou PKCS#7 afetadas. Isso limita a exposição direta identificada, mas não substitui atualizar o pacote nem constitui uma análise completa de exploração transitiva.

## Correção e decisão

- `requirements.txt`: `cryptography>=50.0.2,<51`.
- `requirements-lock.txt`: `cryptography==50.0.2`.
- Ambiente local atualizado para 50.0.2, pacote binário oficial com OpenSSL 4.0.3.
- Teste permanente `tests/test_crypto_compatibility.py` e vetor público sintético `tests/fixtures/fernet_v47.json`.
- Commit da correção: `33eaa43`.

A versão 50.0.2 foi confirmada no índice oficial e inclui as correções dos quatro intervalos vulneráveis. A faixa permite patches da série 50, mas impede entrada automática da próxima versão principal; o lock fixa a instalação reproduzível. Atualizar só até 49 deixaria o alerta PKCS#7 aberto. Atualizar todas as dependências ampliaria desnecessariamente o risco de regressão.

O ambiente testado é Windows 64 bits / Python 3.12.0. A biblioteca removeu suporte a Windows 32 bits e wheels de macOS Intel na versão 49; Python 3.8 deixou de ser suportado na 48. Outros sistemas não foram executados nesta revisão. Não houve alteração de arquitetura, algoritmos da aplicação ou interfaces. Não foi necessário criar ADR.

## Validação executada

1. Antes de atualizar, a versão 47.0.0 gerou uma chave e dois tokens exclusivamente sintéticos. Nenhum segredo existente foi lido para esse teste.
2. A versão 50.0.2 abriu os tokens pelos serviços reais da aplicação usando chaves por variável de ambiente e por arquivo temporário.
3. O teste confirmou nova cifragem/decifragem, rejeição de chave incorreta e preservação dos arquivos de chave.
4. `python -m pip check`: nenhuma incompatibilidade declarada.
5. `python -m pytest -q --junitxml=output/security-dependabot/pytest.xml`: **181 testes aprovados**, seis avisos de depreciação, em 2,68 segundos.
6. `git diff --cached --check`: aprovado antes do commit da correção.
7. Consulta GitHub após o push: repositório continua privado. Estado final dos alertas registrado abaixo.

Os seis avisos referem-se a TestClient/httpx, configuração de caminhos do Alembic e `add_js` usado em PDF sintético adversarial. Não foram ocultados ou corrigidos fora deste escopo. Testes usam banco em memória, diretórios temporários e provedores simulados. Não houve benchmark pago nem envio de dados de clientes.

## Entendendo o teste

`test_v47_ciphertext_remains_readable` executa duas vezes graças a `pytest.mark.parametrize`: uma com configuração por ambiente e outra por arquivo. Primeiro lê o vetor público gerado pela biblioteca antiga; depois `monkeypatch` substitui somente a configuração usada durante o teste. `tmp_path` fornece uma pasta temporária. As asserções chamam os serviços de produção, conferem o conteúdo recuperado e impedem que uma atualização troque silenciosamente as chaves. O bloco `pytest.raises(InvalidToken)` verifica que uma chave diferente continua sendo rejeitada. A fixture guarda dados cifrados antigos, pois gerar e abrir tudo apenas com a versão nova não testaria compatibilidade histórica.

Exercício: acrescente ao teste uma tentativa de abrir um token antigo com um byte alterado e verifique o erro esperado, sem modificar o vetor original.

## Limites e implantação

Esta revisão corrige os quatro alertas identificados. Não equivale a um pentest, auditoria completa de todas as dependências ou certificação de segurança. Não altera a chave existente; não há evidência nesta revisão que justifique rotação. Instalações em outros ambientes precisam instalar o lock atualizado e reiniciar seus processos para carregar a biblioteca nova. Nenhum listener foi encontrado na porta local 8000 no momento da checagem.

Evidências locais: `output/security-dependabot/alerts-before.json`, `alerts-after.json` e `pytest.xml`. O vetor de teste é intencionalmente público e nunca deve proteger dados reais.

## Fontes oficiais

- https://cryptography.io/en/latest/changelog/
- https://github.com/advisories/GHSA-m2h6-j472-rp4c
- https://github.com/advisories/GHSA-jwv3-5hgf-82ww
- https://github.com/advisories/GHSA-g6cj-pr64-35w5
- https://github.com/advisories/GHSA-537c-gmf6-5ccf

## Estado final no GitHub

Aguardando reprocessamento automático após o push; nenhum alerta foi dispensado manualmente.
