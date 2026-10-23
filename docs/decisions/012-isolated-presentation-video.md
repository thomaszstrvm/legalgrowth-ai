# ADR 012 - Filme isolado do aplicativo, com dois temas

Data: 2026-10-23. Status: aceita; atualizada ao briefing de filme com UI real.

## Contexto
Produzir um filme de 20 segundos em dois temas, preservando o sistema e dados de clientes. O briefing mais recente exige UI real em lugar de interfaces ilustradas, sem depender de APIs na reprodução.

## Decisão
Manter Remotion/React em media/legalgrowth-presentation, separado de FastAPI. Registrar duas composições que compartilham cenas e recebem theme. Usar capturas sintéticas e um recorte do renderer original de insights com fixture curta. Fontes Newsreader/Manrope e cores seguem DESIGN.md. Trilha original sintetizada offline. Movimento determinístico por frame.

## Justificativa
Isolamento de dependências, ausência de credenciais na mídia, sem custos de IA e menor chance de divergência entre temas. Nenhuma lógica de negócio é alterada.

## Alternativas
Gravar dados de uma sessão real aumenta risco de exposição. Reconstruir o painel em React duplica UI e manutenção. Inverter cores de capturas não preserva a paleta. Copiar duas timelines aumenta divergências. Usar áudio de anúncios externos não oferece autorização de reutilização. Misturar Remotion ao backend Python não traz benefício.

## Consequências positivas
Projeto editável e reproduzível, assets rastreáveis, cenas reutilizáveis, histórico de decisões e validações. Sem chamadas pagas ou dados reais.

## Consequências negativas
Capturas envelhecem, extração delimitada do renderer precisa acompanhar mudanças de nomes e depende do CSS. Trilha sintética precisa de escuta humana. Uma árvore Node adicional é mantida. Versão vertical requer reenquadramento. Remotion tem licença própria, não substituída pela MIT do projeto. Override temporário de Zod 4.6.7 corrige alerta de segurança, mas mantém aviso de incompatibilidade com a versão requerida pelo Remotion; recursos de schema fora do filme não foram validados.
