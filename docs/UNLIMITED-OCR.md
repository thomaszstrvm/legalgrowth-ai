# Unlimited-OCR: avaliação e contrato opcional

Data da consulta: 23/10/2026. **Decisão: viável como adaptador futuro; execução local condicionada; ingestão real continua bloqueada.** Nenhum modelo, driver, renderer ou dependência pesada foi instalado. Não houve inferência, envio de documento nem benchmark. Este documento complementa os ADRs [002](decisions/002-confidential-documents.md) e [010](decisions/010-optional-local-ocr.md).

## Reconciliação com o código atual

O briefing em `output/validator-review/brief.txt` foi lido integralmente. Na frente OCR, os achados permanecem válidos:

| Componente | Verificação atual e implicação |
|---|---|
| `app/vault/contracts.py::extract_synthetic_pdf` | Usa `pypdf`, formulário AcroForm e texto digital com rótulos explícitos. Limita PDF a 5 MB/30 páginas e texto a 100 mil caracteres por página; isso não constitui sandbox. |
| `Origin` | Métodos aceitos são `acroform` e `digital_text`. Não se deve rotular OCR como texto digital para contornar o esquema. |
| `ContractPreview` | Versão `1.0`; confirmação humana obrigatória e ingestão real desativada. Não alterado. |
| `needs_local_ocr` | Resultado global baseado na ausência de texto e de campos. Um PDF misto pode conter página escaneada sem ativar a indicação. Não corrigido nesta etapa: exige classificação por página e testes próprios. |
| `LocalDocumentReviewer` | Retorna revisão manual; não configura nem chama um modelo local. |
| `POST /api/contracts/import` | Responde 409 sem ler o corpo. O novo módulo não é importado pela API nem pelo extrator. |

## Fontes primárias e conclusões

Os links abaixo são referências móveis consultadas nesta data, **não revisões aprovadas para execução**. Antes de qualquer PoC, registrar commits, hashes de pesos e dependências exatas, revisar código e licenças e só então preparar um ambiente isolado.

- **Modelo e execução oficial.** O [repositório Baidu](https://github.com/baidu/Unlimited-OCR) apresenta imagens, múltiplas páginas e PDF. Seu exemplo Transformers foi testado com Python 3.12.3/CUDA 12.9 em NVIDIA, usa `trust_remote_code=True`, BF16 e código próprio. Há instruções para Transformers, vLLM e SGLang. O modo multipágina/PDF documentado usa `base`; não é uma simples troca do identificador de um modelo genérico.
- **Limite do nome.** O [artigo dos autores](https://arxiv.org/abs/2606.23050) descreve R-SWA e KV cache constante, com comprimento padrão máximo de 32K. Isso não torna páginas, pixels, saída ou tempo ilimitados. Não medimos qualidade em português jurídico nem reproduzimos benchmarks.
- **vLLM específico.** A [receita oficial](https://recipes.vllm.ai/baidu/Unlimited-OCR) indica imagem dedicada e informa que a arquitetura ainda não está no wheel estável. Exige processador de logits próprio, prefixo literal `<image>`, preservação de tokens especiais e parâmetros de n-grama; sem a receita, pode haver saída vazia ou repetição. A página anuncia BF16 com pelo menos 8 GB de VRAM, mas esse número não é dimensionamento validado para nosso documento/hardware. O exemplo usa rede do host e URL remota: não deve ser copiado para o cofre. Nossa futura integração deve receber bytes locais, sem URL externa ou fallback em nuvem.
- **Plataforma AMD.** A [documentação geral do vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/gpu/) inclui Radeon RX 9000/ROCm e informa ausência de suporte nativo a Windows; WSL é uma possibilidade, não certificação desta combinação. As [notas AMD ROCm 7.2/Linux](https://www.amd.com/en/resources/support-articles/release-notes/RN-AMDGPU-LINUX-ROCM-7-2.html) incluem RX 9070 XT. Suporte do runtime e suporte do modelo/kernels são verificações distintas.
- **Adaptação comunitária.** O [repositório do autor da adaptação ROCm](https://github.com/AIwork4me/Unlimited-OCR-ROCm) é evidência de uma implementação comunitária, não garantia da Baidu/AMD nem resultado reproduzido aqui. Não executamos seus comandos e não transferimos suas alegações de desempenho/precisão para esta máquina.
- **Licenciamento.** A [licença do código Baidu](https://github.com/baidu/Unlimited-OCR/blob/main/LICENSE) e a [licença publicada junto ao modelo](https://huggingface.co/baidu/Unlimited-OCR/blob/main/LICENSE) são MIT; exigem preservar os avisos aplicáveis. Isso não licencia automaticamente toda a cadeia. O exemplo inclui PyMuPDF, cuja [documentação do fornecedor](https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright) informa opções AGPL/comercial. A distribuição e o renderer precisam de avaliação própria; não adicionamos PyMuPDF nem presumimos isenção por uso local. A licença do artigo também não substitui a dos artefatos.

### Hardware: evidência limitada

Consulta somente leitura às entradas de adaptadores do registro do Windows encontrou RX 9070 XT com 17.095.983.104 bytes informados pelo driver (aproximadamente 16 GiB), RX 7800 XT e vídeo integrado. O registro pode manter dispositivos anteriores; não determina qual GPU está ativa. A consulta de dispositivos presentes não retornou confirmação útil nesta sessão. Não foram verificados disponibilidade de VRAM, drivers de computação, ROCm/WSL ou kernels. Nenhum identificador de máquina, credencial ou dado de cliente foi coletado. Não há autorização implícita para instalar/trocar drivers.

## Arquitetura proposta, ainda não ativada

```text
documento autorizado → worker isolado → classificação de cada página
                       ├─ AcroForm/texto digital adequado → extração determinística
                       └─ imagem/trecho sem texto → renderer → OcrProvider
                     → associação de documento/página → candidatos a campos
                     → formatos e divergências → conferência humana → decisão explícita
```

O worker deve isolar também parsing e renderização, não somente inferência. Uma página com alguma camada textual pode ainda conter campos em imagem; a classificação futura não pode ser apenas `bool(text.strip())`. Priorizar a extração digital evita custo e novos erros em texto que já está disponível. A primeira interface é por página para preservar proveniência; batching multipágina pode ser uma otimização posterior, desde que devolva correspondência verificável de cada trecho. Isso abre mão de parte da vantagem de processamento conjunto até termos evidência suficiente.

**Ainda não implementados:** processo/serviço separado, bloqueio efetivo de egress/DNS, fila e cancelamento, timeout forçado, cotas CPU/RAM/VRAM/pixels, isolamento de diretório, limpeza de temporários, retenção, autorização por documento, armazenamento/backups cifrados e restauração verificada. Um `Protocol`, `repr=False`, flag offline ou endpoint local não implementa esses controles. Bibliotecas de decodificação também podem ter falhas. Não reutilizar o ambiente FastAPI com chaves de provedores no worker. Comunicação futura deve ser privada/autenticada; não expor um servidor em `0.0.0.0` por conveniência.

Preparação de pesos pode exigir download em etapa separada e controlada, sem documentos. Durante processamento, nenhum fallback automático para OpenAI, Claude, Baidu Cloud ou demonstrações públicas. Texto extraído é dado não confiável: não executar comandos, seguir links nem interpretá-lo como instrução. Logs devem guardar identificadores opacos de job, estado, duração e códigos de erro, nunca texto/imagens, CPF, caminhos pessoais ou exceções brutas de engines.

## O que o contrato implementa

`app/vault/ocr.py` usa apenas a biblioteca padrão:

- `OcrPage`: digest SHA-256 declarado do documento, página positiva com base 1, bytes e MIME PNG/JPEG. Não possui campo de caminho/URL nem faz download. O teto de 10 MB é uma escolha provisória **por imagem já renderizada**, não mudança do limite atual de 5 MB do PDF. Não valida pixels, formato real ou correspondência criptográfica com o PDF; isso cabe ao futuro worker.
- `OcrResult`: mesma origem, engine/revisão, texto limitado a 100 mil caracteres e estados `recognized`, `unavailable`, `timeout`, `failed`. `recognized` permite texto vazio para página em branco; outros estados não carregam texto. Não inclui confiança inventada nem coordenadas não verificadas. Todo resultado exige confirmação humana.
- `OcrProvider`: interface estrutural `recognize(page) -> OcrResult`, comparável a uma interface Java/C#. Não instancia um modelo e não garante segurança de implementações futuras.
- `DisabledOcrProvider`: retorna apenas `unavailable`, sem inspecionar/decodificar bytes ou fazer I/O. É a única implementação de produção entregue; a implementação fictícia existe só no teste.
- `validate_ocr_result`: recusa resultado de outro documento/página. Não mede precisão da transcrição.

Campos grandes são omitidos de `repr`; isso reduz exposição acidental, mas não protege serializações arbitrárias. Os dataclasses são congelados, sem getters de rede ou dependência de configuração/banco. Não existe adaptador para o `Origin` atual: integrar OCR requer extensão deliberada/versionada que preserve origem `ocr`, modelo/revisão e trecho, além da migração de consumidores. Nenhuma alteração do schema público foi feita aqui.

### Entendendo a função central

```python
def validate_ocr_result(page: OcrPage, result: OcrResult) -> OcrResult:
    if not isinstance(result, OcrResult):
        raise ValueError('Invalid OCR result type.')
    if (result.document_sha256, result.page_number) != (page.document_sha256, page.page_number):
        raise ValueError('OCR result does not match the requested document and page.')
    return result
```

1. Os parâmetros são a página solicitada e a resposta; as anotações descrevem o contrato, não convertem valores.
2. `isinstance` exige o objeto de resultado validado, recusando dicionários soltos.
3. A exceção é genérica e não expõe o conteúdo recebido.
4. A tupla compara documento **e** página; só comparar a página permitiria confundir dois PDFs diferentes.
5. Uma incompatibilidade interrompe o fluxo com `ValueError`, em vez de associar texto ao cliente errado.
6. A mesma instância é devolvida; não há cópia de texto, escrita, OCR nem chamada externa.

Essa verificação deve estar no futuro supervisor após a resposta do adaptador. Removê-la permite erros de associação; mantê-la não autentica um processo comprometido. O transporte privado, autenticação e autorização continuam necessários.

## Testes executáveis agora e plano de PoC

`tests/test_ocr_contract.py` usa bytes/strings sintéticos e fake provider: valida origem, limites e tipos, estados separados, conteúdo não promovido a instrução, ausência de imagem/texto em `repr`, imutabilidade, default sem I/O, compatibilidade do preview e HTTP 409 de ingestão. **Não são testes de precisão OCR.** Em 23/10/2026, os 17 casos novos passaram. Com os quatro testes existentes de contratos/documentos de `tests/test_security_evolution.py`, foram **21 aprovados**, 21 não selecionados e dois avisos de depreciação existentes (Starlette/httpx e pypdf). A leitura dotenv foi desativada por `DotEnvSettingsSource._read_env_files=lambda self: {}`; fixtures usam banco em memória. O TestClient precisou executar fora do sandbox após ficar aguardando no ambiente restrito. Nenhum teste de modelo/hardware foi executado.

Futura PoC, separada do redesign, somente com fixtures geradas pelo projeto e gabaritos versionados:

| Caso | Critério observável |
|---|---|
| PDF digital e AcroForm | Nenhuma chamada OCR quando a extração adequada já fornece campos; origem original preservada. |
| Página escaneada e documento misto | Acionamento só onde necessário; página 1/digital não mascara página 2/imagem; não duplicar campos. |
| Rotação, desfoque, baixo contraste, tabela | Medir perda por condição, associação correta de linha/campo; falha exige revisão. |
| Campos ausentes, página em branco, conflitos | Não completar valores ausentes; conflitos preservados como alternativas, sem sobrescrita silenciosa. |
| Datas, CPF e moeda brasileiros | Comparar transcrição exata e formato separadamente; formato correto não comprova identidade/validade jurídica. |
| Texto com instrução maliciosa | Permanecer texto inerte; nenhum processo, rede ou alteração de configuração causada por conteúdo. |
| Falha, engine ausente, timeout, cancelamento | Estado explícito, interrupção real do worker, limpeza verificável; nunca fallback externo. |
| Documento/página trocados e isolamento | Rejeição de origem incompatível; tentativa de rede/arquivo fora do job negada pelo ambiente. |

Registrar acerto exato por campo (antes/depois de normalização definida), omissões e valores inventados separadamente; preservação de página/trecho; latência por documento/página e p50/p95; picos RAM/VRAM; volume/pixels/tokens; versões de software e hardware. Comparar extração digital, um OCR local convencional e Unlimited-OCR nos mesmos gabaritos. Não estabelecer nota de produção a partir de um benchmark geral. Identificar divergências para revisão humana, com tolerância zero para cadastramento automático.

Antes de habilitar um experimento, definir orçamento de recursos e critérios de parada; revisar licenças/revisões; provar bloqueio de rede e kill no timeout; testar retenção e permissões. Qualidade e custos locais seguem desconhecidos até execução. O endpoint de ingestão continua bloqueado mesmo após testes unitários do contrato.

**Estudar:** interfaces estruturais (`Protocol`), imutabilidade, proveniência, limites entre processo e biblioteca, testes de contrato e avaliação de modelos. **Exercício:** acrescente um caso sintético em que duas páginas apresentam CPFs diferentes e descreva o que o futuro agregador deve preservar, sem alterar `contracts.py` nem aprovar automaticamente um dos valores.
