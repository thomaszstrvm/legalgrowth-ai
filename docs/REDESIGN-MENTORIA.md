# Redesign: decisões e leitura do código

## Problema e solução

A interface anterior escondia oportunidades e contratos em links secundários, repetia tratamentos com pouca hierarquia e dependia da fonte instalada no computador. O redesenho organiza destinos em Gestão e Análises, dá prioridade aos três resultados já existentes e usa uma família tipográfica local. Configurações continuam fora da tela principal.

O template define os destinos e a estrutura; `app.js` transforma respostas das APIs em componentes; `style.css` aplica tokens e adapta a composição; `theme.js` controla tema e menu. Nenhum cálculo financeiro foi movido para o CSS, e nenhuma regra de negócio foi substituída pela apresentação.

## Decisões e alternativas

- **HTML/Jinja + CSS + JavaScript:** evita reescrita e novo build. React poderia ajudar em um produto muito maior, mas aqui acrescentaria migração, dependências e risco sem resolver o problema de composição.
- **Tokens semânticos:** `--accent` indica ação; `--warning` indica erro; cada tema define seus próprios valores. Copiar cores em cada componente facilitaria uma alteração isolada, mas criaria divergência entre páginas.
- **Fonte local:** Source Sans 3 mantém a mesma apresentação em Windows e outros sistemas, sem requisições ao Google durante o uso. O arquivo acrescenta aproximadamente 646 KB ao primeiro carregamento; uma fonte de sistema seria menor, mas variaria por computador.
- **Tabela rolável por teclado:** preserva todos os indicadores detalhados; esconder colunas seria mais compacto, porém impediria comparação. As campanhas principais usam lista rotulada no celular.
- **Dados após falha:** manter o formulário permite corrigir e tentar novamente. A chave de API é uma exceção deliberada e continua sendo limpa. Não é autorização para armazenar segredos no navegador.

## Componente central: tabela

Em `app/static/app.js`, a função `table(headers, rows)` organiza dados que já foram preparados pelos renderizadores. Seu fluxo é:

```javascript
function table(headers, rows) {
  if (!rows.length) return empty('Ainda não há registros.');
  const numeric = new Set(['Gasto', 'Valor', /* demais títulos numéricos */]);
  const cellClass = i => i === 0 ? 'wrap' : numeric.has(headers[i]) ? 'numeric' : '';
  // A expressão return do arquivo produz região, tabela, cabeçalhos e células.
}
```

O trecho acima abrevia somente a lista de títulos e a expressão HTML longa para explicar a lógica. O código completo está no arquivo.

1. **`headers, rows`:** recebe um vetor de títulos e uma matriz de células. É a mesma ideia de uma tabela relacional: colunas com significado fixo e linhas com valores.
2. **`if (!rows.length)`:** trata a ausência de dados antes de construir uma tabela vazia. `empty` escapa o texto. Se removida, o usuário veria cabeçalhos sem orientação.
3. **`new Set(...)`:** representa os títulos que devem ter alinhamento numérico. `Set.has` testa pertinência. Não deduzimos alinhamento pela posição da coluna, porque uma segunda coluna pode conter uma descrição ou um link.
4. **`cellClass`:** recebe o índice; permite quebra de linha na primeira coluna, alinha números à direita e deixa outros textos à esquerda. Trocar por `i > 0` recriaria o erro de alinhar todo texto secundário à direita.
5. **Região externa no retorno:** `role="region"`, `aria-label` e `tabindex="0"` permitem identificar e percorrer uma tabela larga pelo teclado.
6. **`headers.map`:** gera cada `<th scope="col">`, indicando a relação entre cabeçalho e coluna. `esc(h)` evita interpretar um título como HTML.
7. **`rows.map` e `row.map`:** percorrem linhas e células, aplicando a mesma regra de alinhamento. `join('')` une os fragmentos sem vírgulas entre eles.

**Retorno:** uma string HTML. **Exceções:** a função pressupõe arrays; uma entrada de outro tipo pode causar TypeError. Os dados são construídos pelos chamadores internos a partir de APIs validadas. As células aceitam HTML já preparado, necessário para links de PDF: texto externo deve passar por `esc` antes de chegar a `table`. Essa fronteira é uma limitação importante; uma futura API de células tipadas poderia torná-la mais explícita.

## Fluxo de uma falha de formulário

`action` guarda uma referência ao formulário ativo, bloqueia cliques repetidos e executa a operação. Em sucesso, atualiza o painel. Em falha, cria um parágrafo usando `textContent`, mantém os campos e move foco para a explicação. `finally` sempre reabilita os controles. Diferentemente de `innerHTML`, `textContent` não transforma a mensagem do servidor em marcação executável.

## Como manter a consistência

Leia docs/DESIGN.md antes de alterar um componente. Reutilize tokens e componentes existentes, confira os dois temas e use os scripts de navegador para testar o comportamento. Um detector de CSS não substitui olhar as capturas nem observar uma pessoa usando a interface.

## Conceitos para estudar

CSS custom properties e cascata; CSS Grid; media queries; semântica HTML; ARIA; escopo e closures em JavaScript; Set; tratamento assíncrono com try/catch/finally; fronteira entre texto e HTML; testes com respostas de rede simuladas.

## Meu desafio

Acrescente uma coluna fictícia “Custo médio” a uma tabela somente no ambiente de testes. Faça os valores alinharem à direita usando o mecanismo já existente e verifique que uma coluna textual vizinha continua à esquerda. Explique por que uma regra baseada apenas na posição não resolveria os dois casos. Não altere cálculos nem dados reais.


## Uma função completa, linha por linha

O controle do menu em theme.js usa esta função (mesmo código, com quebras de linha para leitura):

```javascript
const setMenu = open => {
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('aside').classList.toggle('menu-open', open);
};
```

1. `const setMenu = open => {` define uma função que recebe um booleano. `true` abre, `false` fecha. Ela captura `menu` do escopo de DOMContentLoaded: isso é uma closure.
2. `setAttribute` atualiza o estado que tecnologias assistivas consultam. `String` transforma o booleano em `"true"` ou `"false"`, como atributos HTML esperam. Remover esta linha deixaria o estado anunciado incorreto.
3. `querySelector` encontra a navegação externa, e `toggle` com segundo argumento adiciona ou remove a classe de forma determinística. Sem o segundo argumento, chamar duas vezes com `true` poderia fechar o menu. A regra CSS `.menu-open nav` torna os links visíveis em telas estreitas.
4. `};` encerra a função. Seu retorno é undefined; o efeito é atualizar o DOM.

O clique passa o estado inverso. Escape passa false e devolve foco ao botão. Se o template perder o botão ou o aside, o acesso a um elemento nulo causa TypeError: o componente pressupõe o template compartilhado. Não é uma função pura porque altera o DOM. Uma evolução possível seria receber os elementos como parâmetros caso apareçam outros menus; criar essa abstração agora seria desnecessário.
