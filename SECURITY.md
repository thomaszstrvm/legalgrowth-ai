# Segurança

Este é um MVP local em evolução, sem compromisso de suporte por versão ou prazo
formal de correção. A existência de testes não equivale a auditoria de segurança.

## Relatar vulnerabilidades

Não abra uma issue pública com credenciais, dados pessoais ou informações de clientes.
Quando o repositório estiver publicado, use **Report a vulnerability** na aba Security,
se o mantenedor tiver habilitado o recurso. Caso indisponível, solicite um canal
privado ao mantenedor sem divulgar detalhes sensíveis. Não foi inventado endereço
de contato nesta documentação.

Informe versão ou commit, componente, impacto e reprodução com dados sintéticos.
Não envie `.env`, banco real, chaves criptográficas ou relatórios de clientes.

## Operação e publicação

- Mantenha o servidor em `127.0.0.1` durante o desenvolvimento.
- Não desative autenticação para facilitar demonstrações.
- HTTP Basic local não substitui HTTPS, gestão de acesso e proteção operacional
  necessários para hospedar publicamente a aplicação.
- Preserve as chaves existentes: trocá-las sem migração pode impedir a recuperação
  dos dados cifrados.
- Use `scope=demo` para testes e capturas públicas.

Envio de dados, custos e limites das integrações estão em [docs/AI.md](docs/AI.md)
e nos registros de [decisões](docs/decisions/).

O `.gitignore` exclui credenciais, bancos e saídas locais, mas não remove segredos
já commitados. Antes de publicar, inspecione os arquivos e o histórico. Se uma
credencial for exposta, revogue-a ou faça sua rotação; apagar a linha no último
commit não resolve a exposição anterior. Não envie automaticamente todo o diretório.
