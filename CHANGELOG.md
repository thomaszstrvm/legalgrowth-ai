# Histórico de versões

## 0.1.2 — 2026-10-23

- Abertura editorial v53: campos gráficos em sangria, proporções de publicação,
  vinco e lombada, aresta contínua e ação de abertura mais visível.
- Dois temas e todos os destinos preservados; nenhuma mudança em regras de
  negócio, APIs ou JavaScript funcional. Sem nova dependência.
- Pesquisa de skills, posts e referências individuais documentada em
  `docs/OPENING-V4.md`; nenhuma nova instalação persistente.
- THE CRITIC: 9,0/10, aprovado no escopo da abertura após corrigir a serrilha
  da aresta. Meta 9,9 ainda não atingida; integração tipográfica de IA permanece
  oportunidade estética. Detalhes e limites em `docs/THE-CRITIC-OPENING-V4.md`.
- 159 testes passaram; galeria em dez combinações de largura/tema e seis páginas
  em 24 capturas verificadas. README com novas prévias e material de estudo.

## 0.1.1 — 2026-10-23

- Estudo das skills indicadas pelo artigo LLM Skills, com fontes originais e
  decisões em `docs/LLM-SKILLS-REVIEW.md`.
- Erros de cidades identificam a linha, associam orientação aos campos e levam
  o foco ao primeiro campo afetado. Valores enviados não são repetidos na resposta.
- Mesmas regras de negócio e paletas; nenhuma dependência nova ou instalação
  persistente de skill. A meta visual de 9,9 não é declarada alcançada.
- 159 testes passaram; seis combinações de navegador verificadas. THE CRITIC
  encerrou a pendência do erro por campo, sem alterar a avaliação anterior.

## 0.1.0 — 2026-10-23

Primeiro marco versionado do MVP existente. Inclui o trabalho local anterior;
não representa uma reimplementação do sistema nesta data.

- Painel em português, claro/escuro, coleção editorial de capas e navegação
  preservada. Capas v49 revisadas independentemente em 8,9/10; a meta de 9,9
  pedida para portfólio ainda não foi alcançada.
- Cidades de atuação configuráveis por nome e UF, sem limitar a três municípios.
  Instalações novas não predefinem Cruzeiro no ambiente real.
- Histórico de notícias separado por semana e seleção geográfica; migração
  preserva IDs e conteúdo histórico. Sem fallback silencioso para Cruzeiro.
- README com configuração, limites de cobertura, aprendizado e versionamento.
- Configurações e Notícias revistas pelo THE CRITIC: dois achados de orientação
  corrigidos; escopo de localidades aprovado com ressalvas, 8,7/10. Pendente:
  apontar erros de validação por campo em vez da mensagem genérica.
- Repositório privado e licença MIT; sem publicação pública automática.

### Limites

As fontes incluídas continuam regionais; novas regiões precisam de fontes
compatíveis revisadas pelo mantenedor. Não há catálogo IBGE ou geolocalização.
Não foram executados benchmarks pagos nem usados clientes reais nos testes.
Contratos reais continuam bloqueados, conforme documentação de segurança.
