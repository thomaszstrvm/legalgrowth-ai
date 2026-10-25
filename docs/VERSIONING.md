# Versões e privacidade

Escolhi manter meu repositório `thomaszstrvm/legalgrowth-ai` **privado** desde sua criação. A licença MIT não muda a visibilidade no GitHub. Tornar público
depende de uma decisão futura, após uma nova revisão de arquivos e permissões.

## Convenção

- Commits registram mudanças coerentes, com explicação e verificação.
- Tags `v0.x.y` identificam marcos do MVP. `0` indica evolução ainda sujeita a
  alterações; não é certificação de prontidão para produção.
- Versões de assets, como `arc.css?v=50`, invalidam o cache do navegador.
  Elas não são a versão de lançamento do produto.
- `CHANGELOG.md` resume mudanças e limites conhecidos de cada marco.

O primeiro envio reúne o trabalho local que ainda não tinha commits. Os ciclos
visuais anteriores estão documentados, mas não serão apresentados como commits
históricos que nunca existiram.

## Fluxo para o mantenedor

1. Confira `git status --short` e a branch antes de editar.
2. Desenvolva uma mudança delimitada; use `codex/<assunto>` quando precisar de
   uma branch de trabalho. Preserve alterações de outros colaboradores.
3. Rode os testes apropriados. Mudança visual exige captura desktop/celular,
   claro/escuro, e revisão conforme `AGENTS.md`.
4. Atualize documentação e changelog. Revise `git diff --cached` antes do commit.
5. Confirme que `origin` aponta para o repositório privado correto e que arquivos
   de segredos/bancos não estão no índice. Só então faça commit e push.
6. Depois do envio, confira o SHA remoto e a visibilidade no GitHub.

Não use `git add .` sem revisar a lista de arquivos. `.gitignore` evita inclusões
acidentais comuns, mas não remove segredos que já entraram no histórico. Se uma
credencial vazar, revogue-a; apagar a linha em um commit novo não a torna segura.

O versionamento será atualizado durante as entregas deste projeto. Não há um
processo autônomo rodando continuamente, nem publicação pública automática.

## Backup é diferente de Git

Git armazena código e documentação. `.env`, `.secrets/`, bancos, logs e `output/`
ficam fora do repositório, inclusive privado. Faça backup protegido desses dados
separadamente. Guarde as chaves de criptografia junto à política de recuperação:
um backup do banco sem suas chaves pode ser irrecuperável.
