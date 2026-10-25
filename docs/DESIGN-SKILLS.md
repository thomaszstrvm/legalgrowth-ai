# Skills locais de design

Atualização 25/10/2026: as oito skills do registro de origem estão presentes e
seus SHA-256 correspondem ao registro. A [triagem dos 30 itens](PLUGIN-SELECTION-2026-10-25.md)
separa instalação confirmada, estudo documental e recurso ausente; inclui o
[inventário verificado](skill-inventory-2026-10-25.json). Nenhum pacote ou hook novo
foi instalado. `AGENTS.md` existe hoje; a observação abaixo sobre sua ausência
descreve somente a inspeção de 22/10. Taste de Leonxlnx foi estudada, mas não está
instalada nas raízes consultadas; não é a mesma skill que `design-taste`.

Atualização 23/10/2026: `design-taste`, `retro-print` e `taste-typography` foram
instaladas na pasta global de skills do Codex, após autorização explícita.
[Triagem do tweet, fontes e aplicação contextual](DESIGN-TWEET-REVIEW.md).
O restante deste documento registra o estado histórico de 22/10.

Data: 22/10/2026. Raiz: `C:/Users/KABUM/Documents/ChatGPT/testejuridico`.

## Ambiente e instalação

Node 24.19.0; npm/npx 11.17.0. Python e Playwright Node já disponíveis. Não existia AGENTS.md no projeto nem nos diretórios pais consultados; aplicadas as instruções globais fornecidas nesta conversa. Não houve alteração de configurações globais.

As seis skills solicitadas e duas complementares de Owl-Listener foram verificadas. SKILL.md lidos, referências utilizadas e hashes registrados em design-skill-sources.json. As versões remotas foram fixadas por referência Git imutável. Impeccable 4.7.0 foi copiada da instalação existente, com SHA-256 do arquivo, sem nova instalação global.

| Skill | Diretório local | Referência |
|---|---|---|
| frontend-design | `.agents/skills/frontend-design` | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` |
| webapp-testing | `.agents/skills/webapp-testing` | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` |
| ux-dashboard | `.agents/skills/ux-dashboard` | `5007cd0241ccaa51ae2e4681f9618912dc10e239` |
| web-design-guidelines | `.agents/skills/web-design-guidelines` | `063bee94c3f4df8453406c830b0a7df0f2860278` |
| ui-ux-pro-max | `.agents/skills/ui-ux-pro-max` | `076a2b3a31394ad788afaa71f55d0bf789e7b3ec` |
| impeccable | `.agents/skills/impeccable` | `local-copy-4.7.0` |
| critique-visual-hierarchy | `.agents/skills/critique-visual-hierarchy` | `9a6930cf84a822eb458624bd11c61aac5bbdf224` |
| design-token-audit | `.agents/skills/design-token-audit` | `9a6930cf84a822eb458624bd11c61aac5bbdf224` |

## Método e segurança

Usado o instalador de skills do Codex com `--repo`, `--ref`, `--path` e `--dest .agents/skills`. A alternativa baixa arquivos sem rodar os instaladores npm. O instalador foi inspecionado: download de ZIP, validação de caminhos e cópia da pasta selecionada; usa também temporários do sistema, mas não instala globalmente com esse destino.

Para UI/UX Pro Max, o CLI oficial 2.5.0 e seu init foram inspecionados: dependências chalk, commander, ora e prompts, opção de instalação global separada. Foi preferida a pasta completa da skill oficial, que contém os mesmos dados e scripts necessários, evitando dependências de instalação desnecessárias. Nenhum comando npx foi executado. Nenhuma telemetria de instalador npm foi ativada.

Antes de executar search.py foram conferidos imports e operações de leitura/escrita dos módulos usados. As consultas foram locais, em CSV; sem persistência automática de recomendações inadequadas. Scripts adicionais de geração, redes e hooks não foram ativados. O helper Webapp Testing usa subprocessos; o servidor já estava disponível, portanto ele não foi executado. A suíte Playwright existente foi reaproveitada, com ações pagas simuladas.

Impeccable: launcher local inspecionado anteriormente, engine já disponível; `context` e `detect` executados. Nenhum hook instalado. As duas skills Owl-Listener selecionadas contêm somente SKILL.md, sem executáveis.

Não há prova formal de segurança de toda a cadeia de terceiros. A inspeção foi estática, limitada às instruções, instalador utilizado e caminhos executados. Não foram enviados dados do projeto, credenciais ou contratos para serviços externos.

## Papéis e conflitos

O brief do usuário e docs/DESIGN.md prevalecem. Frontend Design orienta a identidade; UI/UX Pro Max e Uxcel orientam os padrões; Webapp Testing e Vercel orientam a verificação; Impeccable dá acabamento; Owl-Listener fornece crítica de hierarquia e auditoria de tokens. Não se aplicam recomendações de landing pages, React, slides ou efeitos visuais que não atendem ao painel existente.

Estas skills ficam disponíveis para descoberta no projeto nos próximos turnos; foram lidas e usadas explicitamente nesta execução, sem depender de reinício.
