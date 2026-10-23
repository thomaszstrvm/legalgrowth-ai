# Cidades atendidas: funcionamento e estudo

Em Configurações, informe cidade e UF. A aplicação salva até vinte cidades no ambiente selecionado. O mesmo cadastro autoriza localidades dos CSVs e define a seleção das notícias reais. A aplicação verifica formato e UF, mas não consulta um cadastro oficial de municípios. Digite a grafia que será usada nos CSVs, incluindo acentos.

O ambiente real começa sem cidade presumida. O ambiente de demonstração mantém seus exemplos. Trocar cidades atendidas não muda dados importados anteriormente: análises de campanhas mostram as cidades dos registros daquele período.

As fontes de notícias atuais são regionais do Vale do Paraíba/SP. Cadastrar uma cidade em outra região não cria cobertura jornalística. Uma coleta sem artigos não significa ausência de acontecimentos, problemas sociais ou demanda. Relatórios já salvos e exportações de notícias por ID continuam representando a região original.

## Fluxo

1. `POST /api/regions` valida `RegionsInput` e persiste `Configuration.localities` por ambiente.
2. `regions(db, scope)` fornece a seleção ao restante da aplicação.
3. `news.run()` exige seleção real e calcula uma chave para a lista de cidades.
4. A consulta/reutilização considera semana e chave geográfica. Uma seleção diferente gera outro registro sem apagar o anterior.
5. O coletor filtra as fontes e os artigos; a revisão por IA continua sujeita às conexões existentes e ao gateway.
6. `news.latest()` e as oportunidades exibem somente a seleção atual. Novos relatórios também usam essa seleção para notícias.

## Entendendo uma função central

```python
def geography_key(cities: list[str]) -> str:
    canonical = sorted({normalize_locality(city).casefold() for city in cities})
    return hashlib.sha256(json.dumps(canonical, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
```

- A primeira linha recebe uma lista de cidades e declara que o retorno é texto. Os tipos ajudam ferramentas; quem verifica o conteúdo é `normalize_locality`.
- A segunda linha valida cada `Nome-UF`, normaliza a comparação de maiúsculas com `casefold`, remove duplicatas pelo conjunto `{...}` e ordena o resultado. Sem ordenar, selecionar as mesmas cidades em ordem diferente criaria históricos desnecessariamente separados. Formato ou UF inválidos levantam `ValueError`.
- A terceira linha serializa a lista de forma estável, converte em bytes e calcula SHA-256. `hexdigest()` fornece os 64 caracteres gravados no banco. `ensure_ascii=False` preserva caracteres acentuados na serialização; `separators` evita espaços variáveis. A chave identifica a seleção, não criptografa nomes nem garante anonimato.

Essa chave participa da restrição única do banco. Mesmo que duas solicitações tentem criar o mesmo resumo simultaneamente, o banco permite somente uma linha para aquela semana e seleção. O serviço trata o conflito recuperando o registro existente. Como melhoria futura, um catálogo oficial poderia identificar municípios por código estável e evitar divergências de grafia.

## Conceitos para estudar

Validação de entrada; tipos anotados; normalização Unicode; conjuntos e ordenação; hash determinístico; chave composta; migração de esquema; isolamento entre ambientes; testes com SQLite sintético e serviços simulados.

## Para quem mantém o catálogo de notícias

As fontes ficam em `app/integrations/news.py`, na constante `SOURCES`. O campo chama-se **`states`**, com siglas de UF, por exemplo `('SP',)`. Ele limita quais cidades podem ser associadas aos artigos dessa fonte. Não basta adicionar UFs para ampliar cobertura: confira a abrangência real da publicação e o conteúdo do RSS público. A ausência de `states` permite todas as UFs e deve ficar restrita a fixtures ou fontes cuja abrangência nacional foi verificada; declare a restrição explicitamente em fontes regionais.

Para cadastrar uma fonte nova, verifique endereço HTTPS, host, caminho RSS, `robots.txt`, condições de uso e número limitado de páginas. Mantenha os limites de tamanho, tempo e redirecionamento do coletor. Atualize também os IDs aceitos em `Article.source_id` e `Source.id` no gateway, o máximo de fontes/contagens e os testes, sem permitir URLs arbitrárias recebidas pela interface. Isso evita transformar o coletor em um cliente HTTP irrestrito.

Crie testes com feeds sintéticos e `httpx.MockTransport` para confirmar a cidade/UF correta, exclusão de homônimos de outra UF, datas, tópicos e links. Atualize o aviso da interface quando a cobertura efetivamente mudar. Correspondência de nome no título ou trecho continua insuficiente para certificar a geografia do acontecimento; nenhuma lista de `states` substitui revisão das fontes.

## Meu desafio

Adicione um teste que salve duas cidades, inverta a ordem e confirme que a aplicação reutiliza o mesmo resumo semanal sem chamar o coletor novamente. Explique por que comparar listas diretamente seria insuficiente.
