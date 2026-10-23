# ADR 001 — Barreira obrigatória antes da IA externa

Data: 2026-10-22. Estado: implementado para os adaptadores atuais.

## Contexto
Os serviços já montavam agregados sem nomes de campanha, mas cada chamada fazia sua própria seleção de campos. Um novo caminho poderia esquecer a filtragem. Também era necessário diferenciar proteção dos nomes locais de um cofre completo de documentos.

## Decisão e justificativa
`services/gateway.py` valida esquemas Pydantic estritos no ponto de saída dos adaptadores OpenAI e Claude, antes de abrir o cliente HTTP. Há três famílias aprovadas: prioridades numéricas, fotografia agregada de campanhas e metadados de notícias do catálogo público. A revisão recebe uma dessas evidências e a saída tipada da primeira análise. Campos extras, tipos incompatíveis, valores não finitos, URLs fora do catálogo e alguns padrões de identificadores são rejeitados. Contratos não têm esquema externo aprovado.

Nomes locais continuam associados a códigos; somente a tabela de correspondência é cifrada com Fernet. `DATA_ENCRYPTION_KEY` permite fornecer uma chave persistente separada das credenciais de API. Sem a variável, permanece o arquivo local existente. Não rotacionar automaticamente chaves de registros existentes.

## Alternativas
Filtrar apenas com expressões regulares não impede vazamento de nomes e texto livre. Enviar texto cifrado à IA inviabilizaria sua compreensão. Um serviço separado com firewall seria uma barreira operacional mais forte; permanece necessário para documentos confidenciais.

## Consequências positivas
Validação central, recusa por padrão, pequenos custos locais e manutenção auditável. Logs não recebem corpos recusados. Os adaptadores existentes e o contrato da interface foram preservados.

## Consequências negativas e limites
Mudanças de esquema precisam de atualização explícita. Regex é defesa suplementar, não anonimização infalível. Notícias continuam sendo texto público não confiável, não prova dos fatos. Números de grupos pequenos podem permitir inferências. O banco de marketing não foi integralmente cifrado. Código futuro que crie seu próprio cliente de rede pode contornar a convenção: revisão e isolamento de infraestrutura continuam necessários.
