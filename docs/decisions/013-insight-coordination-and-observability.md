# ADR 013 - Coordenação de insights e metadados operacionais

Data: 25/10/2026. Estado: implementado localmente; revisão final estática recebida
às 07:15 UTC, sem bloqueador concreto no recorte cache/docs para preparação de commit.
Não houve nova execução independente. Ressalvas no registro de consolidação. Escopo: portfólio.

## Contexto

O cache versionado reutilizava análises sequenciais, mas duas requisições iguais
podiam ler cache vazio e reservar/gerar duas vezes. A cota fixa já existia e não
media tokens. Stack: FastAPI síncrono, SQLAlchemy, SQLite local e PostgreSQL previsto.

## Decisão

Estender o cache existente com fingerprint de escopo, período, dados, identidades
de campanhas, labels locais e assinatura de prompts/modelos/schemas. O fingerprint
fica no payload local; não acrescenta IDs ou nomes ao envio para provedores.

A revisão externa demonstrou que limites locais removidos por `api_schema` não
alteravam a assinatura. Ela agora inclui também `Analysis.model_json_schema()` e
`Review.model_json_schema()`, com os modelos aninhados e suas restrições. O schema
reduzido permanece separado e inalterado para os provedores. Mudanças no contrato
local invalidam o cache pela assinatura/fingerprint existentes; registros antigos
não são apagados. Alternativa descartada: reescrever o cache ou enviar restrições
extras ao provedor. A regressão muda somente o limite de explicação de 500 para 40,
confirma schema externo idêntico e impede reutilizar a resposta incompatível.
Fonte: recibo independente identificado no registro de consolidação; não é um novo
teste de produção nem garantia de cobertura de validadores que não aparecem no schema.

Uma tabela de claims com PK única e token de proprietário arbitra a execução.
Aquisição e liberação usam transações curtas, sem manter lock SQL durante HTTP.
Conflito retorna 409 antes da reserva. O dono relê o cache após adquirir, reserva
as duas chamadas e segue o fluxo existente. `finally` libera em sucesso/falha tratada.

Tabela separada `ai_calls` guarda apenas dimensões permitidas, latência, status,
tentativa HTTP e tokens informados. ContextVar isola chamadas concorrentes; uma
transação independente evita confirmar ou desfazer alterações do domínio. Falha
de persistência emite mensagem fixa e não repete a chamada. Não há cálculo de preço.

## Alternativas e consequências

- Lock Python seria menor, mas não coordenaria workers diferentes compartilhando banco.
- Fila/Redis/proxy exigiriam infraestrutura e operação sem necessidade comprovada.
- Lease com expiração recuperaria quedas automaticamente, porém um worker lento
  poderia continuar gerando enquanto outro inicia nova cobrança. Timeout de leitura
  HTTP não prova término da execução remota. Preferimos bloquear e recuperar conscientemente.
- Ganhos: unicidade no banco, nenhuma dependência nova, cotas e privacidade preservadas.
- Custos: duas tabelas/migrações, escritas adicionais, telemetria best-effort e
  recuperação manual de órfãos. Cache legado sem fingerprint invalida uma vez.
- Limites: concorrência verificada originalmente em threads/sessões SQLite; o
  Validador depois registrou três cenários SQLite entre processos aprovados.
  PostgreSQL vivo não foi validado. Não garante exactly-once no provedor
  após falha de rede, crash ou tentativa humana posterior.

## Recuperação de claim órfão

Não apagar por idade enquanto workers estiverem ativos. Em manutenção:

1. Interromper todos os processos que atendem geração de insights; confirmar que
   nenhuma execução local pode prosseguir. Uma cobrança remota incerta não é estornada.
2. Fazer backup local protegido do banco; listar somente `fingerprint`, `owner`,
   `created_at` de `insight_claims`, sem exportar conteúdo sensível.
3. Confirmar o registro específico bloqueado e remover apenas esse par
   `fingerprint`/`owner` em transação administrativa. Não remover reservas mensais,
   históricos ou todos os claims indiscriminadamente.
4. Reiniciar e solicitar nova geração explicitamente. Se o resultado completo
   já existir, o cache poderá reutilizá-lo; caso contrário, há nova reserva/cobrança possível.

Não foi executada recuperação em banco real nesta rodada. Não existe endpoint
público para limpar claims. Aplicar `alembic upgrade head` após backup antes de usar
o código novo em um banco existente; nesta rodada só bancos descartáveis foram migrados.

## Código central para estudo

Trecho real simplificado somente pela retirada da mensagem longa do erro:

```python
@contextmanager
def claim(db, fingerprint):
    owner = uuid.uuid4().hex
    db.add(InsightClaim(fingerprint=fingerprint, owner=owner))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AIError('Já existe uma análise igual em andamento.', 409) from None
    try:
        yield
    finally:
        db.rollback()
        db.execute(delete(InsightClaim).where(InsightClaim.fingerprint == fingerprint,
                                              InsightClaim.owner == owner))
        db.commit()
```

1. `@contextmanager` transforma o gerador em bloco `with`, delimitando posse e limpeza.
2. `db` é a sessão SQLAlchemy; `fingerprint` identifica uma entrada/versionamento iguais.
3. UUID identifica o proprietário, separadamente da chave de conteúdo.
4. `add` prepara o claim; sozinho ainda não arbitra concorrência.
5. `try` delimita a tentativa de aquisição.
6. `commit` efetiva a PK única antes de qualquer chamada paga.
7. `except IntegrityError` identifica conflito da inserção.
8. `rollback` recupera a sessão para uso após o erro SQL.
9. O erro de domínio vira HTTP 409; não vaza o erro SQL ao cliente.
10. O segundo `try` protege a execução do dono.
11. `yield` executa o corpo do `with` em `generate`, inclusive a segunda leitura do cache.
12. `finally` roda também em erro tratado ou exceção; não roda após encerramento abrupto do processo.
13. `rollback` descarta transação incompleta antes da limpeza; a geração já confirmou o histórico válido.
14. `delete` seleciona a chave e o dono: tirar o filtro de dono tornaria a limpeza menos segura.
15. `commit` libera o claim para uma tentativa explícita futura.

Sem o commit inicial, dois workers poderiam prosseguir sem posse confirmada. Sem
`finally`, um timeout normal deixaria o sistema bloqueado. Sem a segunda leitura
do cache, uma conclusão entre leitura e aquisição ainda poderia ser repetida.
O retorno público vem de `generate`; o context manager não retorna uma análise.

Conceitos: atomicidade, restrição de unicidade, cache versionado, idempotência versus
exclusão concorrente, transações e isolamento de contexto. Exercício: acrescente um
teste que altera apenas o nome de uma campanha entre gerações e explique por que
a correspondência local precisa invalidar a reutilização. Não altere o gateway.
