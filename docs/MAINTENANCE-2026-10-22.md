# Aprimoramento da base existente

## Alterações
1. `app/agents/analysis.py` passa a devolver as recomendações confirmadas na execução; `services/reports.py` usa esse conjunto ao produzir um novo relatório. Pendências antigas não entram só por continuarem abertas.
2. `services/insights.py` invalida a reutilização quando modelo, prompt ou esquema mudam. Os nomes exibidos dos modelos correspondem aos adaptadores efetivos.
3. `static/app.js` trata falhas de rede e respostas não JSON sem exibir o corpo bruto; encerra o texto de carregamento em falha inicial; limpa o erro ao tentar novamente. Bloqueio de localStorage não impede abrir o painel, trocar ambiente ou tema.

Nenhuma tela, integração ou funcionalidade nova. Sem alteração de senhas, chaves ou dados reais. Arquitetura e alternativas: ADR 004.

## Entendendo o código

Função de `services/insights.py`:

```python
def analysis_signature(analyst, reviewer):
    specification = {'version': '1.2', 'analyst': analyst, 'reviewer': reviewer,
        'models': {p: ai.PROVIDERS[p].MODEL for p in (analyst, reviewer)},
        'instructions': [ANALYST, REVIEWER], 'schemas': [api_schema(Analysis), api_schema(Review)],
        'max_output_tokens': 2000}
    canonical = json.dumps(specification, sort_keys=True, ensure_ascii=True, separators=(',', ':'))
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()
```

- Linha 1: recebe os identificadores dos dois provedores. O endpoint valida esses valores; identificador desconhecido produziria KeyError ao consultar o catálogo.
- Linha 2: registra versão e papéis. Trocar quem analisa muda a assinatura.
- Linha 3: lê os nomes dos modelos utilizados pelos adaptadores; evita reutilizar resultado de outro modelo por engano.
- Linha 4: inclui as instruções e os esquemas enviados às APIs. Uma revisão do formato ou do prompt invalida o resultado anterior.
- Linha 5: inclui o teto de saída e fecha o dicionário. Retirá-lo permitiria reutilização entre configurações de saída diferentes.
- Linha 6: serializa em JSON com ordenação e separadores estáveis. Sem ordenação, a ordem das chaves poderia causar diferenças sem mudança de significado. Valores não serializáveis causariam TypeError; os esquemas atuais são JSON.
- Linha 7: converte texto em bytes UTF-8 e retorna uma impressão digital hexadecimal de 64 caracteres. Não cifra informações nem as envia pela rede.

`generate` compara essa assinatura com a salva antes de reaproveitar o resultado; também exige igualdade dos dados, período, ambiente, analista e nomes locais. A assinatura não comprova a qualidade da conclusão. Mudanças silenciosas no provedor e solicitações simultâneas permanecem limitações.

## Verificação

`python -m pytest -q`: 113 testes passaram. Dois avisos de depreciação já existentes. Novos testes cobrem recomendações de outro período, problema resolvido no mesmo período e invalidação por prompt/modelo/esquema.

`scripts/browser-resilience.cjs`: resposta HTML 503, falha de rede, armazenamento bloqueado, recuperação via filtro e troca para demonstração/tema passaram; nenhum erro JavaScript não tratado ou chamada paga. Testes usam dados fictícios e adaptadores de IA simulados.

## Conceitos e exercício

Estude invalidação de cache, serialização canônica, funções hash e teste de regressão. Como exercício, acrescente um teste que comprove que trocar apenas a ordem das chaves de um esquema não muda a assinatura. Não use uma API real para esse teste.
