# Auditoria e evolução incremental — 22/10/2026

Especificação lida integralmente: `LegalGrowth_AI_Prompt_Unificado_Codex (1).md`, fornecida pelo usuário. Este registro distingue implementação de protótipo e pendência; não declara o projeto pronto para produção.

## Inventário anterior às alterações

| Fluxo | Implementação encontrada | Dados enviados | Cobrança/limites |
|---|---|---|---|
| Regras de campanha/financeiro/conformidade | Python determinístico | Nada externo | Sem API |
| Prioridades | OpenAI ou Claude | Até 20 candidatos, IDs e números | Uma reserva local de R$ 1; até 500 tokens de saída |
| Insights | OpenAI e Claude, ordem escolhida | Agregados com aliases + texto da primeira análise ao revisor | Duas reservas; até 2.000 tokens por saída |
| Cenários regionais | OpenAI e Claude | Títulos/trechos RSS e referências públicas | Duas reservas; coleta funciona sem IA |
| Relatório semanal | ReportLab + JSON | Nada externo ao gerar arquivo | Fotografia persistida por semana/ambiente |
| Adaptadores antigos | `integrations/providers.py` | Stubs sem geração | Não são caminho de produção |

Havia limite fixo de entrada, endpoints fixos e ausência de retries automáticos. Não havia gateway obrigatório. Os adaptadores descartam metadados de tokens do provedor. A reserva local não é custo real, nem limite calculado de custo máximo. Preços, câmbio versionado, cache geral, roteador configurável e observabilidade por chamada não existem nesta etapa. Não foi criado histórico retroativo fictício.

## Entregue nesta etapa

- Gateway obrigatório com esquemas estritos e campos permitidos nos dois adaptadores; chave de dados por segredo de ambiente no Compose.
- Reutilização de insights já revisados quando versão, período, ambiente, analista, dados e nomes locais permanecem iguais. É deduplicação sequencial; não oferece exclusão mútua para cliques concorrentes.
- Padrão de novas conexões R$ 60, sem elevar limites já configurados. Ferramentas/IA fora do consumo de mídia; planos antigos não são reescritos silenciosamente.
- Análise estratégica inicial a partir da coleta existente, com dimensões separadas, falta de evidência explícita e crítica determinística. Novos relatórios semanais incorporam a seção. Relatórios já salvos permanecem imutáveis.
- Extrator genérico de contratos e demonstração fictícia com origem dos campos; recebimento de documentos reais bloqueado.
- Teste adversarial gratuito no painel de relatórios, seis erros conhecidos em cópias fictícias; controle limpo e restauração da referência.
- Registros ADR e explicação de uma função central para estudo.

## Pendências da especificação — não confundir com funcionalidades prontas

1. Cofre de clientes em serviço/credenciais separados, worker sem rede verificado, ACL por documento, retenção, backups cifrados, cadastro com aprovação humana e revisão visual editável. Upload real permanece bloqueado até resolver esses requisitos.
2. OCR local e revisor local efetivo: o Ollama possui um modelo instalado, porém não foi homologado nem isolado para documentos confidenciais. Não houve download ou teste de contrato no modelo.
3. Estratégia completa: critérios sociais/econômicos aprováveis, integração de receita/capacidade/custos, crítica por IA e revisão seletiva baseada em risco; ordenação por notas/conflitos quando houver avaliações fundamentadas.
4. AIRequestOptimizer/AIModelRouter completos, cache persistente versionado com TTL e isolamento, exclusão mútua/idempotência de chamadas, invalidação por modelo/parâmetros e recuperação de concorrência. A reutilização atual não substitui esse sistema.
5. Ledger de consumo por chamada, tokens medidos, tarifas/câmbio datados, reserva atômica do custo máximo calculado, alertas 50/80/95%, painel administrativo e custo por resposta válida. A reserva atual de R$ 1 não é estimativa de fatura.
6. Exportação integral por modelos Pydantic versionados e benchmark offline dos formatos PT/EN/JSON/CSV. O JSON atual é explicitamente selecionado, mas não tem ainda um modelo completo de relatório.
7. Homologação de provedores/termos pelo escritório, avisos de transparência aprovados pelo jurídico e verificação contínua de normas. Triagem lexical não equivale a parecer jurídico.

## Agendamento preservado

Automação Codex `not-cias-de-cruzeiro-e-regi-o`, segunda-feira às 08:00 em Brasília. Executa a coleta e o relatório reais. Nenhum segundo agendamento foi criado. A nova seção estratégica entra no comando de relatório existente. O agendador opcional APScheduler segue desativado por padrão. Computador e execução disponíveis são necessários; não houve observação de uma execução futura.

## Segurança e custos dos testes

Documentos produzidos em memória, dados demo e HTTP simulado. Nenhum benchmark pago, chamada de geração real ou cliente real nos testes. A consulta a `ollama list` iniciou automaticamente o aplicativo local e identificou um modelo; isso foi inventário, não processamento de documentos. Não se afirma isolamento operacional do Ollama.
