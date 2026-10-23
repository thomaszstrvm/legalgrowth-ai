⚠️ DEGRADED: single-context (revisão de capturas, sem detector automatizado ou novos subagentes).

## Veredito

**8/10 — REVISÃO NECESSÁRIA.**

Existe uma identidade profissional, mas o investimento expressivo está distribuído de maneira desigual. A galeria recebeu direção de arte; as superfícies operacionais receberam principalmente um tratamento tipográfico e cromático.

O que separa esta execução de uma solução excepcional é a capacidade de fazer **composição, dados, navegação e identidade parecerem decisões do mesmo sistema**. Adicionar efeitos não resolveria essa distância.

Esta avaliação amplia o recorte anterior, incluindo Campanhas e Orçamento. A diferença de julgamento não comprova regressão.

## Evidências e limites

Versão identificada pelas capturas em `output/design-review/after`, modificadas em **22/10/2026, entre 21:43:51 e 21:44:33**. Não confirmei correspondência com commit ou aplicação atualmente executada.

Inspecionei efetivamente:

| Capturas | Dimensões reais |
|---|---:|
| `overview-{light,dark}-1366.png` | 1366 × 2007 |
| `overview-{light,dark}-390.png` | 390 × 2823 |
| `settings-light-1366.png`; `settings-dark-390.png` | 1366 × 1213; 390 × 1678 |
| `reports-light-1366.png`; `reports-dark-390.png` | 1366 × 957; 390 × 1108 |
| `finance-{light,dark}-1366.png` | 1366 × 1275 |
| `campaigns-dark-390.png` | 390 × 1699 |

As alturas são das imagens completas, não dos viewports. Também visualizei `arc-current.png`, `nova-live.png`, `attio-live.png` e `linear-live.png`, em `output/design-review/references`.

Li integralmente a persona, `DESIGN.md` e o parecer anterior solicitado. Não avaliei movimento, teclado, contraste calculado, downloads ou estados não capturados. As referências são registros locais; não representam inspeção dos sites atuais. Nenhum arquivo foi alterado.

## Problemas críticos e intervenções priorizadas

Não identifiquei bloqueio funcional comprovável pelas imagens. As prioridades abaixo tratam da qualidade visual e da eficiência de leitura.

### 1. Reorganizar a entrada das páginas — alto

**Evidência:** cabeçalhos de Configurações, Relatórios e Orçamento; início de `campaigns-dark-390.png`.

Logo, navegação, título, descrição, seletor demonstrativo e aviso formam sucessivas faixas antes do trabalho principal. No desktop, Configurações e Relatórios reservam uma faixa extensa quase vazia para seletor e aviso. No celular, Campanhas chega aos indicadores somente depois dessa sequência.

**Correção:** reunir período, seletor e aviso numa área contextual mais compacta; manter o aviso explícito. Padronizar a ordem entre contexto e indicadores, hoje diferente no Resumo e em Campanhas.

**Princípio observado:** Linear distingue estrutura permanente de conteúdo ativo.

**Impacto:** entrada mais imediata, sem remover conteúdo ou funcionalidades.

### 2. Fazer o gráfico merecer sua área — alto

**Evidência:** “Gastos ao longo do período”, nas quatro capturas do Resumo.

A curva quase horizontal ocupa um retângulo alto e amplamente preenchido. Apenas os extremos temporais e dois valores verticais orientam a leitura. A massa gráfica chama mais atenção que a informação disponível.

**Correção:** reduzir a altura, suavizar o preenchimento e acrescentar referências intermediárias de eixo, calculadas sobre os mesmos dados. Preservar a escala honesta; não ampliar artificialmente pequenas oscilações.

**Princípio observado:** Attio demonstra densidade organizada; cada região aproxima informação relacionada.

**Impacto:** leitura temporal mais precisa e melhor proporção entre análise e espaço ocupado.

### 3. Ajustar o grid ao tipo de dado — médio

**Evidência:** tabela “Onde foi gasto”, em Orçamento; “Relatórios salvos”, no desktop.

Em Orçamento, os valores ficam na extremidade oposta aos rótulos, atravessando uma grande faixa vazia. Em Relatórios, data e downloads concentram-se à esquerda, enquanto a linha divisória percorre praticamente toda a página.

**Correção:** estabelecer larguras próprias para tabelas de duas colunas; aproximar rótulo e valor. Em Relatórios, alinhar os downloads a uma coluna deliberada e limitar a região tabular à largura útil. Preservar o alinhamento numérico à direita.

**Princípio observado:** Attio usa colunas para sustentar comparação, não apenas preencher largura.

**Impacto:** menos deslocamento ocular e maior precisão editorial.

### 4. Integrar a galeria ao sistema visual — alto para direção de arte

**Evidência:** encerramento das quatro capturas do Resumo.

Palco preto, moldura espessa, perspectiva e cinco cores introduzem uma segunda linguagem muito mais expressiva que o restante. Sua posição final protege a análise, mas não resolve completamente a integração.

**Correção:** reduzir moldura e altura do palco; preservar capas e perspectiva. Reutilizar discretamente a linguagem de filetes e organização editorial das capas nos cabeçalhos existentes dos destinos. Não transportar a cenografia para formulários.

Os símbolos também precisam de revisão: orçamento circular, monograma e pirâmide possuem relações desiguais com seus destinos. Evitar aparência de gráfico quando o desenho é apenas ilustração.

**Princípio observado:** Arc constrói um ambiente coerente ao redor dos objetos.

**Impacto:** identidade distribuída pelo produto. A solução proposta é direção estética, não correção funcional obrigatória.

### 5. Definir uma hierarquia tipográfica por função — médio

**Evidência:** “Conectar suas IAs”, “Adicionar ou trocar chave”, “Criar relatório” e “Relatórios salvos”.

A combinação Newsreader–Manrope funciona. O problema é a distribuição: títulos de seção, ações e chamadas alternam entre serifada grande e sans menor sem uma regra funcional suficientemente evidente.

**Correção:** reservar Newsreader para título de página e síntese editorial; usar uma escala consistente de Manrope para seções operacionais, formulários e listas. Uniformizar posição das descrições, pesos e espaçamentos associados.

**Princípio observado:** Nova Dental obtém contraste tipográfico por papéis claros.

**Impacto:** personalidade acompanhada de previsibilidade. A escolha das famílias é defensável; não exige substituição.

### 6. Diferenciar ações, leitura e configuração pelo agrupamento — médio

**Evidência:** final de Campanhas no celular; acordeões de Relatórios e Orçamento.

Importação, consulta de indicadores, preparação de arquivo e ajustes compartilham repetidamente o mesmo tratamento de linha e divisor. Em Campanhas, “Importar resultados” começa praticamente encostado ao encerramento da seção anterior.

**Correção:** criar separação consistente entre blocos de consulta e edição; alinhar títulos, controles e divisores a recuos comuns. Usar fundo suave apenas quando ele delimitar uma tarefa completa.

**Princípio observado:** Linear diferencia contexto, conteúdo e ação com superfícies e agrupamentos proporcionais.

**Impacto:** leitura mais rápida da natureza de cada bloco, preservando todos os fluxos.

## Problemas sutis

O formulário desktop de Configurações continua com folga lateral pouco articulada. A orientação “Configurar IA” permanece uma transição editorial fraca antes da galeria. São ajustes reais, mas insuficientes para produzir a evolução substancial solicitada.

## Decisões questionáveis

A repetição da mesma arquitetura de faixas em páginas com necessidades diferentes parece mais conveniente que intencional. Isso é julgamento compositivo. Já a compreensão dos símbolos das capas e de “Baixar para IA” exige teste com usuários; as capturas não resolvem essa questão.

## Qualidades reais

Preservar a dupla tipográfica, os números alinhados, a adaptação móvel das campanhas, a paleta escura coerente e a separação entre dados demonstrativos e resultados reais. A galeria possui presença e elaboração próprias.

## Veredito final

**REVISÃO NECESSÁRIA.** A próxima evolução deve reorganizar relações entre elementos existentes. O produto precisa da mesma precisão compositiva na tabela, no formulário e no primeiro viewport que já procura demonstrar nas capas.