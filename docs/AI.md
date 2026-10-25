# Conexões de IA e limites atuais

Configurações → Conectar suas IAs. OpenAI usa `gpt-4.1-mini`; Claude usa `claude-haiku-4-5-20251001`. A verificação GET confirma acesso ao modelo, não saldo para geração. Chaves são cifradas no banco; nunca retornam ao navegador.

Prioridades usam uma IA. Insights solicitados pelo responsável usam as duas: a primeira analisa agregados, a segunda confere. Notícias públicas podem usar as duas após a coleta. Relatórios PDF/JSON e regras determinísticas são locais. Não há publicação automática.

## Saída e privacidade

`services/gateway.py` é chamado nos adaptadores antes do HTTP de geração. Aceita apenas esquemas aprovados, recusa campos extras e identificadores nos casos cobertos pelos testes. Notícias são texto público de fontes fixas; continuam não confiáveis. Prompts instruem os modelos a tratar conteúdo como dados.

Nos insights, números são exibidos da evidência local. Conclusões sem veredito completo não aparecem como revisadas. A revisão de outro modelo reduz alguns erros, mas não verifica a verdade de uma notícia e não elimina alucinações. O teste adversarial do painel é determinístico e fictício, não um benchmark dos provedores.

## Reservas e limites

Novas conexões têm padrão R$ 60/mês, configurável entre R$ 1 e R$ 200. Limites existentes são preservados. `AIUsage` faz reserva SQL atômica de R$ 1 por chamada planejada, ou R$ 2 antes de uma análise com revisão. Falhas mantêm a reserva; desconectar não zera consumo.

Esta quantia é uma cota interna fixa. **Não é fatura, preço confirmado, câmbio ou limite matemático do custo máximo.** A tabela `ai_calls` registra separadamente provedor, modelo, operação, escopo, status, tentativa HTTP, latência e tokens informados pelo provedor. Não existe painel completo de consumo por agente/modelo, nem precificação versionada. Confira o provedor. Ferramentas são contabilizadas separadamente da mídia.

### Metadados por chamada

`services/ai_observability.py` delimita cada chamada por um contexto isolado; os adaptadores copiam somente contagens permitidas de `usage`. Campos ausentes ou inválidos ficam `NULL` (desconhecidos), enquanto um zero realmente informado permanece zero. O total do Claude não é inventado somando campos: entrada comum, criação de cache e leitura de cache têm semânticas próprias. OpenAI e Claude mantêm suas contagens originais; não há conversão para reais, preço ou câmbio implícito.

As operações são conexão, prioridades, análise/revisão de insights e análise/revisão de notícias. `attempted=false` distingue uma rejeição local antes do HTTP. `success`, `error` e `timeout` descrevem o resultado da chamada delimitada, não a veracidade da conclusão da IA. A latência cobre a execução delimitada (incluindo gateway, HTTP e validação incluída no bloco), em milissegundos; não mede apenas rede.

A gravação usa uma transação curta independente, para não confirmar alterações do domínio nem apagar um consumo após rollback. Não inclui prompts, respostas, nomes, chaves, corpos de erro ou identificadores de clientes. Se o banco não aceitar o registro, há apenas um aviso fixo no log; a chamada paga não é repetida nem seu resultado substituído. Portanto, uma indisponibilidade pode deixar lacunas na telemetria: ausência de registro não prova consumo zero. Reservas mensais continuam sendo o controle conservador existente. Notícias preservam seus próprios controles de coleta e unicidade.

Contratos consultados em 25/10/2026: [OpenAI Responses usage](https://github.com/openai/openai-python/blob/main/src/openai/types/responses/response_usage.py) e [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Valores foram testados com respostas sintéticas, sem benchmark ou chamada paga.

Entrada: prioridades até 12 KB, demais fluxos até 40 KB. Saída: 500 tokens nas prioridades, até 2.000 nas análises. Sem ferramentas externas, URLs customizadas, redirects ou retries automáticos.

### Cache de insights e concorrência

O cache versionado existente permanece: snapshot, nomes locais protegidos, modelos,
instruções e schemas precisam corresponder, incluindo os contratos locais completos
de análise/revisão. Os schemas reduzidos enviados aos provedores permanecem separados;
um limite local removido dessa redução ainda altera a assinatura. A reutilização exige um
fingerprint local com identidades estáveis, escopo e período. Registros antigos sem
esse campo não são apagados; deixam de ser reutilizados uma vez. Não há geração
automática: uma nova consulta continua dependendo da ação humana e da reserva.

`insight_claims` possui uma chave primária por fingerprint. Só quem insere o registro
pode reservar e gerar; uma chamada igual concorrente recebe HTTP 409, sem chamada
nem reserva adicional. Após adquirir, o cache é conferido novamente para cobrir
uma conclusão ocorrida entre a primeira leitura e a aquisição. Períodos e dados
distintos não compartilham o bloqueio. Notícias mantêm seu mecanismo próprio.

Erro ou timeout tratado libera o claim; a reserva já realizada permanece. Nova
tentativa explícita pode cobrar novamente. Uma queda abrupta pode deixar um claim
órfão: não há expiração/tomada automática, pois o provedor pode ainda estar
processando. Recuperação operacional e alternativas: [ADR 013](decisions/013-insight-coordination-and-observability.md).

## Chaves e retenção

Credenciais: `AI_ENCRYPTION_KEY` ou `.secrets/encryption.key`. Correspondência dos nomes locais: outra chave, `DATA_ENCRYPTION_KEY` ou `.secrets/client-data.key`. Faça backup protegido e separado do banco. Não substitua uma chave de dados existentes sem migração. Modo 0600 no Linux não equivale a configurar ACL do Windows.

Consulta documental em 22/10/2026: [OpenAI — controles de dados](https://developers.openai.com/api/docs/guides/your-data) informa ausência de treinamento por padrão na API, salvo adesão, e mecanismos de retenção distintos. `store=false` não equivale a retenção zero. [Anthropic — retenção comercial](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) descreve exclusão usual em até 30 dias com exceções; [treinamento comercial](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training) descreve a política aplicável. Contratos específicos e configurações da conta precisam de revisão do escritório. Nenhuma aprovação de retenção zero foi presumida.

O banco inteiro não está cifrado. O projeto ainda não é um cofre de clientes pronto para produção. Contratos reais permanecem bloqueados.
