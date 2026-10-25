# Cartier — composição, continuidade e limites da adaptação

Inspeção em 23/10/2026, no Chrome: [Le Chœur des Pierres, Panthère Tunya](https://www.cartier.com/en-fr/lechoeurdespierres#tunya).

## O que foi observado

A abertura dedica quase toda a tela a uma única peça. O campo verde acompanha a pedra, enquanto título, marca e controles ocupam posições periféricas. Ao rolar, uma revelação de aparência aquarelada muda o campo para papel claro; a peça continua sendo o ponto de referência. Em seguida, uma frase serifada grande introduz o texto. O menu separa a coleção em capítulos e mantém acesso direto às peças.

Foram abertos a seção Tunya e o menu e percorrida a sequência inicial por rolagem. As três capturas locais são `references/cartier-tunya.png`, `cartier-tunya-reveal.png` e `cartier-tunya-editorial.png`, sob `output/design-review/design-engineering-v1/`. São registros de observação, não assets do produto. A inspeção não mediu duração, GPU ou acessibilidade integral e não comprovou a técnica interna que produz a revelação.

## Comparação com Arc e LegalGrowth

| Princípio | Cartier | Arc | Decisão para o LegalGrowth |
|---|---|---|---|
| Protagonista | Uma peça monumental | Uma capa central na coleção | Preservar uma capa ativa, com desenhos grandes e legendas separadas. |
| Cor | O ambiente acompanha a pedra | Cor e material pertencem à capa | Manter papel/tinta e pares próprios por tema; sem bloco escuro arbitrário no tema claro. |
| Continuidade | A peça permanece durante a revelação | A capa orienta a navegação até o projeto | Reutilizar a gravura da capa no cabeçalho do destino, com simplificação óptica no celular. |
| Ritmo | Peça, frase, descrição | Coleção, legenda, projeto | Coleção, ação “Ver resultados”, área operacional legível. |
| Movimento | Revelação narrativa ligada à rolagem | Resposta física e transições analógicas | Inclinação pequena e transição curta opcionais; dados e teclado estáveis. |

Cartier reforça escolhas já implementadas nesta rodada: escala, foco e continuidade gráfica. Não há uma nova implementação de shader ou efeito aquarelado atribuída a essa referência. Acrescentar uma segunda linguagem de efeitos agora enfraqueceria a identidade editorial existente e aumentaria custo de manutenção sem resolver os problemas encontrados na revisão.

Nenhuma fotografia, logotipo, fonte proprietária ou código da Cartier foi incorporado ao repositório. A referência é um ensaio de alta joalheria, não um painel operacional: som, longa encenação de entrada e mudanças de iluminação não foram transferidos para a leitura de campanhas.

## Encerramento desta rodada

Decidi encerrar o objetivo aberto de perseguir uma nota 9,9. Esta entrega será concluída por critérios verificáveis: corrigir os achados do crítico, preservar fluxos e temas, executar os testes, registrar limitações e atualizar a versão privada. Não representa declaração de perfeição nem de nota 9,9 alcançada. Futuras rodadas devem partir de problemas observados por pessoas usando o produto, em vez de novas notas isoladas de IA.
