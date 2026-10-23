# Avaliação das skills de front-end indicadas

23/10/2026. Artigo consultado:
[The best AI skills for front-end development](https://llm-skills.com/en/blog/best-ai-skills-front-end-development).
O catálogo agrupa recursos de componentes, estilos, responsividade, acessibilidade
e conversão de design. A seleção foi feita para o código existente: FastAPI,
Jinja, HTML, CSS e JavaScript sem framework.

## Fontes verificadas e decisão

| Indicação | Fonte original conferida | Decisão para LegalGrowth |
|---|---|---|
| Accessibility | [ECC](https://github.com/affaan-m/ECC/blob/main/skills/accessibility/SKILL.md) | Aplicar orientação de erros descritivos, semântica e foco; resolve pendência concreta do formulário. |
| Design Thinking / frontend-design | [Anthropic](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Já temos frontend-design; manter direção editorial e evitar instruções duplicadas. |
| Frontend Interface Design | [OpenDesign](https://github.com/nexu-io/open-design/blob/main/skills/frontend-design/SKILL.md) | Reforça usar DESIGN.md como referência; princípio já presente. |
| Design-to-code feedback loop | [OpenDesign stitch-loop](https://github.com/nexu-io/open-design/blob/main/skills/stitch-loop/SKILL.md) | Entrada encaminha ao pacote upstream; não equivale ao fluxo completo instalado. Manter capturas e THE CRITIC existentes. |

As opções do artigo para React/Next, shadcn, Tailwind, GSAP e Figma não justificam
trocar a stack nem adicionar serviços a este ajuste. Não foram instaladas em bloco.
Páginas individuais do catálogo falharam no acesso web; as fontes originais acima
foram lidas diretamente. Popularidade listada não foi usada como garantia de qualidade.

Também foram consultadas as [Web Interface Guidelines da Vercel](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md),
através da skill local já instalada `web-design-guidelines`.

## Aplicação concreta — v0.1.1

A API de cidades devolve somente o índice da linha e um código permitido quando
a validação falha. Não retorna o valor digitado, contexto de exceção nem conteúdo
de outros formulários. O frontend associa a orientação à linha com
`aria-describedby`, marca `aria-invalid` e move o foco ao primeiro campo afetado.
Ao editar a linha, remove o erro antigo. A regra que aceita/rejeita cidades não
foi alterada; mudou a explicação do erro.

Essa leitura foi usada como referência nesta entrega. **Nenhuma nova skill foi
instalada persistentemente**; as três autorizadas anteriormente continuam
instaladas. Não houve nova dependência do produto.

## Estudo e limites

Validação desta entrega: **159 testes passaram**, seis avisos de depreciação;
teste específico confirma posição da cidade inválida, ausência do valor enviado
na resposta e nenhuma gravação parcial. Seis combinações de navegador
(1366/390/320, claro/escuro) confirmam foco no primeiro campo afetado,
`aria-describedby`, remoção do estado antigo ao editar e fluxo de salvamento.
Zero gravações reais, chamadas externas ou erros JavaScript nesses testes.
Capturas e manifesto em `output/design-review/locations-v1/accessibility/`.
THE CRITIC examinou as seis capturas de erro e encerrou a pendência de orientação,
sem identificar regressão visual nesse estado. A nota anterior não foi alterada.

Índice identifica a linha; código identifica o motivo; texto orienta a pessoa.
Separar esses papéis evita interpretar mensagens internas e vazar dados enviados.
A resposta antiga genérica continua para erros não localizados e outras rotas.

O trecho central da API extrai apenas posições permitidas:

```python
rows = sorted({item['loc'][2] for item in error.errors()
               if len(item['loc']) == 3 and item['loc'][:2] == ('body', 'localities')
               and type(item['loc'][2]) is int and 0 <= item['loc'][2] < 20})
```

1. `error.errors()` fornece erros estruturados do Pydantic; o conjunto remove
   posições repetidas, e `sorted` garante ordem de leitura.
2. A segunda linha admite apenas erros de um item de `localities` no corpo da
   requisição. Ignora outros campos, inclusive credenciais de outras rotas.
3. A terceira linha exige índice inteiro dentro do limite da lista. O índice
   começa em zero; a interface mostra `índice + 1` para a pessoa.

Sem os filtros, a interface poderia receber posições inesperadas. Sem uma
resposta formada com textos fixos, a serialização indiscriminada dos erros
poderia devolver o próprio valor enviado. Não usamos o hash geográfico ou
dados do banco para construir mensagens de validação.

Exercício: envie duas cidades inválidas em um teste sintético e confirme que a
resposta contém as duas posições, sem repetir nenhum valor recebido.
Testes automáticos e capturas não certificam conformidade WCAG completa;
leitor de tela real não foi testado nesta entrega.
