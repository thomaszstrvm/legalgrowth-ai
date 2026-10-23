# ADR 010 — Contrato opcional de OCR local, sem ingestão

Data: 2026-10-23. Estado: contrato aceito; engine e integração adiadas.

## Contexto

A avaliação externa solicita investigar Unlimited-OCR. O extrator demonstrativo já usa texto digital/AcroForm e mantém confirmação humana, mas o sinal de necessidade de OCR é global. A API bloqueia contratos reais. Não há worker isolado, egress negado ou qualidade demonstrada em contratos brasileiros. A documentação de suporte AMD não comprova que este modelo execute na máquina. Evidências e fontes primárias estão em [UNLIMITED-OCR.md](../UNLIMITED-OCR.md).

## Decisão e justificativa

Adicionar módulo independente `app/vault/ocr.py`, com `OcrProvider`, dados imutáveis por página, estados explícitos e provider desativado. Não importar o módulo nas APIs/extrator, adicionar dependências, instalar pesos ou executar código remoto. Digest/documento e página devem coincidir antes de aceitar uma resposta; reconhecimento nunca equivale a validação de identidade.

Manter `ContractPreview` 1.0 e `Origin` intactos. O método futuro `ocr` exige decisão de extensão/versionamento: não falsificar origem `digital_text`. A classificação por página, renderização, extração e OCR precisam futuramente ocorrer no worker sem rede, sob limites de recursos e autorização por documento, aproveitando texto digital quando adequado. O contrato não é uma sandbox nem um serviço pronto.

## Alternativas consideradas

- Chamar Transformers/vLLM no FastAPI: menor esforço inicial, mas acopla dependências pesadas, documentos e credenciais; rejeitado.
- Instalar imediatamente a adaptação ROCm: não resolve licenças, isolamento ou adequação e foge da autorização; adiado.
- OCR externo automático: contraria a fronteira de sigilo, portanto não será fallback.
- Apenas documentação: menor superfície, mas não exercita associação de origem e estados; adotado contrato mínimo testável sem engine.
- Processamento multipágina desde o início: pode aproveitar melhor o modelo, mas dificulta associação dos trechos; a primeira interface prioriza página verificável. Batching pode ser acrescentado após evidência e testes.

## Consequências positivas

Não modifica fluxos existentes, não cria cobrança nem dependência de GPU. Permite comparar engines atrás de uma interface pequena, exercitar falhas com fixtures e evitar tratar indisponibilidade como transcrição vazia válida. Nenhum cadastro real é desbloqueado. Conteúdo não aparece no `repr` padrão dos objetos.

## Consequências negativas e limites

Não há OCR executável, estimativa comprovada de latência/VRAM ou precisão jurídica. Limites de bytes/caracteres não limitam custo de decodificação, tokens ou memória já alocada. O digest é declarado pelo chamador; sua associação ao PDF original cabe ao futuro worker. Não há confiança/calibração ou coordenadas. O retorno `timeout` não encerra processos: supervisor e kill continuam pendentes. Classificação de PDFs mistos, renderer/licença, transporte privado, egress, retenção e revisão humana persistente precisam de outra implementação/verificação antes de reconsiderar o bloqueio de ingestão.

## Validação

Testes sintéticos do contrato, provider desativado sem I/O, rejeição de origem trocada, estados de erro sem texto, limites e imutabilidade. Regressão confirma esquema 1.0 e HTTP 409. Não confundir testes unitários com validação de modelo, isolamento do sistema operacional ou prontidão para produção.
