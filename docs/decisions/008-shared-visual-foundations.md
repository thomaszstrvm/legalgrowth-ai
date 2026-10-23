# ADR 008 — Fundamentos visuais únicos e arte por capítulo

Data: 23/10/2026. Estado: adotado.

## Contexto

Duas folhas de estilo repetiam paletas globais. A abertura ganhou capas próprias ao longo de várias rodadas, mas cabeçalhos internos ainda usavam gravuras antigas. Alterações de tema podiam divergir, e a auditoria cobria apenas style.css.

## Decisão e justificativa

Carregar `tokens.css` antes de `style.css` e `arc.css`. Centralizar paletas claro/escuro, famílias tipográficas, espaçamentos, alvos de controle, foco e raios comuns. Manter tintas e composições das capas no CSS do componente. Reusar a macro de arte da capa no cabeçalho amplo, com variantes simplificadas para tamanhos pequenos. Auditar todas as folhas realmente carregadas pelo template.

## Alternativas

Reescrita em React ou biblioteca de componentes: ampliaria custo e superfície de regressão sem resolver, por si só, a identidade. Nova camada de overrides: rápida, mas conservaria definições globais conflitantes. Substituição automática de todos os pixels por tokens: geraria nomes sem significado e arriscaria ajustes ópticos das capas.

## Consequências positivas

Uma origem para cada papel cromático; dois temas continuam locais, sem requisições a serviços externos. Identidade conecta navegação e capítulos. Auditoria mostra literais e referências indefinidas, sem mascarar dívida histórica. Sem nova dependência de execução.

## Consequências negativas

Há um arquivo estático adicional. As regras históricas de componentes ainda têm sobrescritas e valores ópticos literais; a consolidação não equivale a eliminar toda a dívida CSS. Mudanças de tokens afetam várias telas e exigem revalidar estados/contraste. Contagens estáticas não resolvem a cascata nem certificam WCAG.

## Movimento

A Arc motivou resposta física das capas, adaptada à stack existente: pequena inclinação apenas no mouse, sem loop contínuo, desligada por movimento reduzido, foco de teclado e toque. Transição nativa entre documentos é aprimoramento progressivo. A alternativa WebGL permite materiais e deformações mais sofisticados, mas adiciona custo de GPU, dependências e fallback desnecessários para o fluxo atual. Não há ganho de desempenho medido nem equivalência visual prometida.
