# ADR 004 — Consistência entre análise, relatório e reutilização

Data: 2026-10-22. Estado: implementado.

## Contexto
O relatório consultava todas as recomendações pendentes do ambiente, inclusive sugestões de períodos anteriores ou problemas resolvidos após corrigir os dados. A reutilização de insights comparava dados e versão manual, mas ignorava mudanças de prompt, esquema e modelo.

## Decisão
A análise determinística retorna os IDs das recomendações que as regras confirmaram nesta execução. O relatório seleciona apenas os IDs retornados ainda pendentes. Histórico e relatórios persistidos não são reescritos.

A reutilização de insights exige uma assinatura SHA-256 da especificação da análise: versão, papéis, modelos efetivamente usados pelos adaptadores, prompts, esquemas e limite de saída. A comparação dos dados e dos nomes locais continua obrigatória. Registros antigos sem assinatura são recalculados quando solicitados.

## Justificativa e alternativas
Filtrar apenas as datas não resolveria sugestões antigas do mesmo período após uma correção de dados. Apagar essas sugestões destruiria histórico. Usar IDs confirmados pela execução reaproveita as regras existentes e evita duplicá-las no relatório.

Incrementar uma versão manual a cada alteração de prompt é fácil de esquecer. Uma representação JSON canônica permite comparar o conteúdo automaticamente, com custo local pequeno. A alternativa de um sistema geral de cache seria mais complexa e não é necessária para esta correção.

## Consequências
- Positivas: relatório coerente com os dados recalculados; preservação do histórico; invalidação automática das análises quando o contrato externo muda; nenhum dado pessoal na assinatura.
- Negativas: uma mudança nas instruções pode exigir nova consulta paga quando o usuário solicitar a análise, respeitando o limite existente. A assinatura não detecta mudança silenciosa de um modelo remoto que mantenha o mesmo identificador.
- Limites: não resolve concorrência entre duas solicitações simultâneas nem substitui TTL. Hash não é criptografia e não serve como chave de proteção de dados. Essa correção não altera regras de negócio ou adiciona funcionalidades.
