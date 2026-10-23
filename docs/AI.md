# Conexões de IA e limites atuais

Configurações → Conectar suas IAs. OpenAI usa `gpt-4.1-mini`; Claude usa `claude-haiku-4-5-20251001`. A verificação GET confirma acesso ao modelo, não saldo para geração. Chaves são cifradas no banco; nunca retornam ao navegador.

Prioridades usam uma IA. Insights solicitados pelo responsável usam as duas: a primeira analisa agregados, a segunda confere. Notícias públicas podem usar as duas após a coleta. Relatórios PDF/JSON e regras determinísticas são locais. Não há publicação automática.

## Saída e privacidade

`services/gateway.py` é chamado nos adaptadores antes do HTTP de geração. Aceita apenas esquemas aprovados, recusa campos extras e identificadores nos casos cobertos pelos testes. Notícias são texto público de fontes fixas; continuam não confiáveis. Prompts instruem os modelos a tratar conteúdo como dados.

Nos insights, números são exibidos da evidência local. Conclusões sem veredito completo não aparecem como revisadas. A revisão de outro modelo reduz alguns erros, mas não verifica a verdade de uma notícia e não elimina alucinações. O teste adversarial do painel é determinístico e fictício, não um benchmark dos provedores.

## Reservas e limites

Novas conexões têm padrão R$ 60/mês, configurável entre R$ 1 e R$ 200. Limites existentes são preservados. `AIUsage` faz reserva SQL atômica de R$ 1 por chamada planejada, ou R$ 2 antes de uma análise com revisão. Falhas mantêm a reserva; desconectar não zera consumo.

Esta quantia é uma cota interna fixa. **Não é fatura, preço confirmado, câmbio ou limite matemático do custo máximo.** Tokens retornados pelos provedores ainda não são persistidos. Não existe painel completo de consumo por agente/modelo, nem precificação versionada. Confira o provedor. Ferramentas são contabilizadas separadamente da mídia.

Entrada: prioridades até 12 KB, demais fluxos até 40 KB. Saída: 500 tokens nas prioridades, até 2.000 nas análises. Sem ferramentas externas, URLs customizadas, redirects ou retries automáticos. Insights idênticos já revisados são reutilizados sequencialmente; o cache geral e a proteção contra chamadas concorrentes ainda estão pendentes.

## Chaves e retenção

Credenciais: `AI_ENCRYPTION_KEY` ou `.secrets/encryption.key`. Correspondência dos nomes locais: outra chave, `DATA_ENCRYPTION_KEY` ou `.secrets/client-data.key`. Faça backup protegido e separado do banco. Não substitua uma chave de dados existentes sem migração. Modo 0600 no Linux não equivale a configurar ACL do Windows.

Consulta documental em 22/10/2026: [OpenAI — controles de dados](https://developers.openai.com/api/docs/guides/your-data) informa ausência de treinamento por padrão na API, salvo adesão, e mecanismos de retenção distintos. `store=false` não equivale a retenção zero. [Anthropic — retenção comercial](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) descreve exclusão usual em até 30 dias com exceções; [treinamento comercial](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training) descreve a política aplicável. Contratos específicos e configurações da conta precisam de revisão do escritório. Nenhuma aprovação de retenção zero foi presumida.

O banco inteiro não está cifrado. O projeto ainda não é um cofre de clientes pronto para produção. Contratos reais permanecem bloqueados.
