# ADR 002 — Extrator de contratos sem liberar documentos reais

Data: 2026-10-22. Estado: protótipo local com bloqueio de uso real.

## Contexto
Não há contrato de referência. O servidor de marketing possui credenciais de serviços externos. Não foram verificados isolamento de rede, armazenamento documental segregado, autorização por documento, retenção nem backups cifrados.

## Decisão e justificativa
Criar `app/vault` separado conceitualmente, com extração determinística de AcroForm e linhas com rótulos explícitos. Cada resultado mantém página, método e coordenadas quando presentes no formulário. CPF, datas e formatos são conferidos localmente; divergências exigem revisão. O endpoint de demonstração gera seu próprio PDF fictício. O endpoint de importação real responde 409 sem ler nem interpretar o documento.

`LocalDocumentReviewer` oferece somente encaminhamento manual nesta etapa. O executável Ollama e o modelo `qwen2.5-coder:14b` foram encontrados, mas isso não comprova isolamento ou adequação para contratos. Nenhum documento foi enviado ao modelo. Tesseract e Docker não foram encontrados no PATH.

## Alternativas
Aceitar PDFs reais no processo FastAPI seria mais rápido, porém contrariaria o requisito de isolamento. OCR externo violaria o sigilo pretendido. Apenas ocultar o botão seria insuficiente; o bloqueio existe no backend, sem variável que o desative.

## Consequências positivas
Permite testar o extrator sem dados reais nem chamadas pagas. Nenhum cadastro automático ou substituição silenciosa. Conteúdo ativo e PDFs malformados são recusados nos casos testados.

## Consequências negativas e próximos requisitos
O protótipo não é sandbox contra PDFs maliciosos. Parsing deve migrar para worker sem rede, com limites de CPU, memória e tempo. Faltam OCR local, revisão visual com correção e confirmação persistente, cofre autenticado com permissões por documento, original cifrado, retenção e backup/restauração verificados. Nenhum desses controles é representado como concluído pela demonstração. O módulo não recebe texto livre via API.
