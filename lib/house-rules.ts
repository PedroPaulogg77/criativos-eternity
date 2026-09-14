import type { Reference } from '@/lib/mvp-data';

/*
 * Regras da casa. Valem para todo prompt que gera imagem, em qualquer nicho.
 * A receita de cada referência continua específica; estas regras vêm antes dela.
 */

export const HOUSE_PRODUCT_RULE = `REGRA DA CASA — O PRODUTO EM PRIMEIRO LUGAR
Esta regra vale mais que a direção visual, mais que a beleza da cena e mais que qualquer instrução abaixo. Se alguma delas conflitar com esta, esta vence.
- Quem bater o olho por um segundo tem que saber exatamente qual produto está à venda.
- O produto é o maior e o mais nítido elemento do quadro. Nada pode ocupar mais espaço nem chamar mais atenção que ele.
- O produto fica na área mais iluminada da imagem e recebe o foco mais fechado. O resto da cena fica mais escuro e mais desfocado.
- A silhueta inteira do produto precisa se separar do que está atrás e ao redor. Se algo encostado nele tiver a mesma cor, mude a cor desse outro elemento, nunca a do produto.
- Quando o produto for uma peça de roupa ou um acessório usado por alguém, as demais peças do figurino usam cor claramente diferente da dele, para que a borda do produto fique visível. Nenhuma peça fora da venda pode encostar e se fundir com ele.
- Essa cor diferente é sempre um tom intermediário e sem brilho. Não vista a pessoa de branco puro nem de cor viva ao lado de um produto escuro: a peça de apoio não pode virar o ponto mais claro da imagem só para se distinguir do produto.
- Tudo que não está à venda — calçado, meia, relógio, bolsa, acessório, adereço de cena — aparece em tom escuro e apagado, ou fica fora do quadro. Nada disso pode ser o ponto mais claro nem o mais nítido da imagem.
- Pele, membros, cenário e objetos de apoio não podem ocupar mais área do que o produto.
- Nenhum bloco de texto pode ocupar área maior que o produto nem disputar o primeiro olhar com ele.
- O fundo imediatamente atrás do produto tem claridade oposta à dele: produto escuro pede fundo mais claro atrás, produto claro pede fundo mais escuro. Assim a silhueta aparece inteira.
- Nenhum objeto, membro, sombra ou bloco de texto pode cruzar por cima do produto.
- Se o enquadramento escolhido não cumprir tudo isso, feche mais o enquadramento no produto antes de qualquer outro ajuste.`;

export const HOUSE_DESIGN_RULE = `DESIGN E TIPOGRAFIA
- Use o estilo tipográfico da loja registrado no contexto: mesma família de letra, mesmo peso e mesma caixa que a marca usa. Se ele não tiver sido confirmado, escolha uma tipografia neutra coerente com o produto e repita a mesma escolha em toda a peça.
- No máximo dois estilos de letra na peça inteira. Nada de fonte decorativa que a marca não use.
- Todo bloco de texto alinhado a um mesmo eixo, com margem livre em volta. Nenhum texto colado na borda, cortado pelo limite do quadro, sobreposto a outro texto ou pousado sobre uma área que o torne ilegível.
- Hierarquia clara: um único elemento manda na leitura e os outros ficam visivelmente subordinados. A diferença de tamanho entre eles precisa ser óbvia à primeira vista.
- Espaçamento regular entre os blocos. O que pertence ao mesmo assunto fica junto; assuntos diferentes ficam separados.
- Distribua o peso pelo quadro inteiro: nenhuma metade fica vazia e nenhum canto fica sobrecarregado.
- Todo texto precisa de contraste suficiente contra o fundo para ser lido em tela de celular.
- Escreva cada texto uma única vez, sem repetir a oferta, o título ou a marca em dois lugares.`;

/*
 * Presença humana não é "tem pessoa ou não". O eixo é o corpo entrar como suporte
 * do produto ou como personagem. Uma peça com pessoa correndo, sem rosto e fechada
 * no produto, é desumanizada.
 */
export function peopleRule(reference: Reference) {
  if (reference.people === 'sem-pessoa') {
    return `PRESENÇA HUMANA — SEM PESSOA
- Esta direção não usa pessoas. Não inclua modelo, rosto, mãos, silhueta, manequim, sombra humana ou qualquer parte do corpo.
- O produto aparece sozinho, sustentado pelo cenário, pela superfície ou pelos apoios da própria direção visual.`;
  }
  if (reference.people === 'corpo-suporte') {
    return `PRESENÇA HUMANA — CORPO SEM IDENTIDADE
- Esta direção é desumanizada: o corpo entra apenas como suporte do produto, nunca como personagem.
- Não mostre rosto nem parte dele no plano principal. Corte abaixo do pescoço ou enquadre de costas. Sem olhar, sem expressão, sem sorriso, sem contato visual.
- Retratos só podem aparecer dentro de elementos gráficos que a direção visual pedir, como cartões de avaliação, e apenas quando forem fotos reais fornecidas.
- O enquadramento fecha no produto sobre o corpo. Nada de cena de vida, história, companhia, ambiente doméstico ou situação social ao redor.
- Não inclua tatuagem, joia, acessório, maquiagem marcada ou qualquer detalhe que identifique a pessoa, a menos que o próprio produto seja isso.
- O corpo representa o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto. Não troque o gênero do público.
- Mãos, dedos e membros anatomicamente corretos.`;
  }
  if (reference.people === 'humanizado') {
    return `PRESENÇA HUMANA — PESSOA COMO PERSONAGEM
- Esta direção é humanizada: existe uma pessoa real, com rosto visível, expressão natural e presença própria.
- Mostre o rosto inteiro dentro do quadro, salvo quando a direção visual pedir um close editorial — e nesse caso o corte é lateral, limpo e deliberado. Nunca corte a cabeça no topo nem mostre meio rosto por acidente.
- A pessoa representa o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto. Não troque o gênero do público.
- A cena sugere um momento real de uso, com ambiente, roupa e postura coerentes com a vida desse público.
- Mesmo humanizada, a peça obedece à regra da casa: a pessoa não pode cobrir, deformar nem roubar a atenção do produto.
- Mãos, dedos e membros anatomicamente corretos.`;
  }
  return '';
}

export const HOUSE_PRODUCT_RULE_SHORT = `REGRA DA CASA — O PRODUTO EM PRIMEIRO LUGAR
- Sempre que um produto da loja aparecer, quem bater o olho por um segundo tem que reconhecer exatamente qual produto é.
- O produto fica nítido, bem iluminado e com a silhueta separada do fundo, do figurino e dos objetos ao redor.
- Nada que não esteja à venda pode ser o ponto mais claro, mais nítido ou maior da imagem.
- Se algo encostado no produto tiver a mesma cor, mude a cor desse outro elemento, nunca a do produto.`;
