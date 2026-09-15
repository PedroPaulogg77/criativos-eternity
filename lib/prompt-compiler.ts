import type { Reference } from '@/lib/mvp-data';
import { HOUSE_PRODUCT_RULE, HOUSE_DESIGN_RULE, SILENT_RULE, peopleRule } from '@/lib/house-rules';

export type CampaignInput = {
  mode: 'single' | 'collection';
  exactTarget: string;
  sourceUrl: string;
  linkAccess: 'public' | 'protected';
  offer: string;
};

type TestedDirection = {
  title: string;
  single?: string;
  collection?: string;
};

const itemLabel = (index: number, round = 1) => String((round - 1) * 5 + index + 1).padStart(2, '0');

/*
 * Rodadas seguidas na mesma conversa empilham instrução e colidem de numeração.
 * O bloco abaixo descarta as ordens da rodada anterior sem descartar o contexto factual.
 */
function roundReset(round: number) {
  if (round <= 1) return '';
  return `RODADA ${round} — ESTA MENSAGEM SUBSTITUI AS ORDENS ANTERIORES
- Esta é uma nova rodada de criação nesta mesma conversa.
- Do que veio antes, continue usando SOMENTE o CONTEXTO CAPTURADO: produto, marca, idioma, oferta, público-alvo, tipografia e fontes factuais.
- Descarte todas as instruções de composição, direção visual, enquadramento e formato das rodadas anteriores. Elas não valem mais. Valem apenas as instruções desta mensagem.
- Não reaproveite, não reenvie e não reedite nenhuma imagem já gerada nesta conversa. Cada criativo abaixo é uma geração nova, do zero.
- Os criativos desta rodada têm números próprios. Não os confunda com os criativos das rodadas anteriores e não repita aquelas peças.

`;
}

/*
 * Texto canônico reconstruído dos EXP-008 e EXP-009.
 * A interface pode mudar; estas receitas validadas não devem ser resumidas.
 */
const testedDirections: Record<string, TestedDirection> = {
  'REF-0001': {
    title: 'SPLIT PREMIUM ESCURO',
    single: `- O que define esta direção: UM produto gigante, em pé e iluminado, contra um estúdio escuro, com a oferta sozinha do outro lado. A peça tem só dois assuntos: o produto e o preço.
- O produto ocupa a maior parte do quadro, bem maior do que pareceria natural num anúncio comum, em três quartos, com a face principal voltada para o lado do texto.
- Ele se apoia sobre uma plataforma de pedra clara e veiada, de borda curva, que atravessa o canto inferior em diagonal. A pedra é clara e contrasta com o fundo escuro.
- Fundo de estúdio escuro com um halo de luz logo atrás do produto e névoa suave ao redor, escurecendo até os cantos.
- A parte mais luminosa e mais colorida de toda a peça é a face principal do produto. Nada mais compete com ela.
- Do lado oposto, alinhado à esquerda, o bloco de texto traz somente a oferta, em duas famílias tipográficas: a primeira linha em serifada clara e corpo menor, as linhas seguintes em sans pesada e cor metálica, bem maiores. Um filete fino fecha a primeira linha à direita.
- Abaixo do bloco, um ornamento horizontal fecha a composição: um filete fino com uma pequena forma geométrica no centro, na mesma cor metálica.
- Esta peça não tem título de produto, não tem benefício, não tem selo e não tem CTA. Se o contexto exigir a marca da loja, ela entra pequena e discreta no topo do lado do texto — e nada além disso.
- Só existem três cores na peça: o escuro do estúdio, o metálico do texto e as cores próprias do produto.`,
    collection: `- O que define esta direção: a mesma gramática do produto único, mas com o conjunto ocupando o lugar do produto gigante — um item claramente à frente e os demais escalonados atrás dele, todos em pé sobre a mesma plataforma de pedra clara.
- Um produto vem na frente, maior e mais iluminado, com a face principal voltada para o lado do texto. Os outros ficam atrás em profundidade, menores, escalonados em altura, e nenhum é encoberto a ponto de perder a silhueta.
- Fundo de estúdio escuro com halo de luz atrás do grupo, névoa suave e cantos escurecidos. A plataforma de pedra clara e veiada atravessa o canto inferior em diagonal.
- Cada produto mantém o seu próprio material, cor e acabamento; o escuro do cenário não recolore nenhum. Nada de repetir o mesmo item para completar o grupo.
- Do lado oposto, alinhado à esquerda, a oferta em duas famílias tipográficas: a primeira linha em serifada clara e corpo menor, as seguintes em sans pesada e cor metálica, bem maiores. Um filete fino fecha a primeira linha e um ornamento horizontal fecha o bloco embaixo.
- Um título curto da coleção pode entrar acima da oferta, em corpo pequeno, mas ele nunca disputa com ela. Se o contexto exigir a marca da loja, ela entra pequena e discreta no topo do lado do texto.
- Esta peça não tem benefício escrito, não tem selo, não tem ícone e não tem CTA.`,
  },
  'REF-0002': {
    title: 'LIFESTYLE ESPORTIVO EM MOVIMENTO',
    single: `- O que define esta direção: uma FOTOGRAFIA URBANA REAL ocupando o quadro inteiro, com uma pessoa em plena corrida, e todo o texto aplicado por cima dela. Não existe painel de cor, não existe metade reservada e não existe recorte do produto.
- A cena precisa ter um lado escuro e um lado claro: prédio ou muro em sombra de um lado, céu e construções claras do outro. O lado escuro é onde os benefícios ficam legíveis, e isso não é acaso — escolha o enquadramento pensando nisso.
- A imagem é dessaturada, num registro de cinza, preto e branco, com o asfalto claro embaixo. Sensação real de movimento, sem pose.
- O enquadramento vai do tronco até os pés e não inclui a cabeça, para que a peça vendida ocupe a maior área possível da foto.
- O corte privilegia a peça vendida: ela fica na faixa central da imagem, na área mais iluminada e mais nítida. As demais peças do figurino são lisas, sem estampa e de cor claramente diferente da do produto, para que a borda do produto apareça.
- O casting segue o público declarado do produto: gênero, faixa etária e biotipo compatíveis com quem a loja anuncia. Corpo e mãos anatomicamente corretos.
- A logo da loja fica no topo, centralizada, pequena e clara sobre a área escura da foto.
- Logo abaixo dela, a headline em caixa alta muito pesada, centralizada, em duas linhas que ocupam quase toda a largura. É o maior texto da peça.
- No lado escuro da foto, na altura média, uma coluna de até três benefícios confirmados. Cada um é um DESENHO DE LINHA solto — sem círculo, sem moldura, sem fundo — com uma etiqueta curta em caixa alta ao lado, tudo alinhado à esquerda. Se houver menos de três benefícios confirmados, mostre menos itens em vez de inventar.
- Na base, a oferta em faixas horizontais empilhadas, uma por degrau, com margem lateral e um canto chanfrado. Elas invertem o contraste entre si: a do degrau principal é de cor viva e forte com o texto em preto; a seguinte é escura com o texto em branco.
- Dentro de cada faixa há dois pesos: a condição em caixa alta pesada e a palavra final em peso mais leve. Se a oferta tiver um único degrau, use uma única faixa.
- Abaixo das faixas, uma linha curta de prova social em caixa alta bem espaçada, somente quando ela estiver confirmada no contexto.
- A única cor da peça é a da faixa principal. Todo o resto é a foto dessaturada e o branco do texto.`,
  },
  'REF-0003': {
    title: 'CENÁRIO TÁTIL E QUENTE',
    single: `- O que define esta direção: o produto aparece DUAS VEZES sobre uma superfície granulada em que ele AFUNDA de leve — areia, terra fina, tecido de trama grossa —, e uma das duas aparições mostra a face que o cliente nunca vê na vitrine.
- A superfície é o fundo inteiro: sem horizonte, sem parede, sem mesa. Ela tem textura visível, ondulações suaves e marcas de relevo, e o produto deixa uma depressão rasa onde se apoia.
- As duas unidades formam uma diagonal ascendente: uma mais à frente e mais baixa, vista de perfil ou três quartos; a outra mais atrás e mais alta, virada para mostrar a base, o verso ou o interior. Elas se tocam de leve no meio.
- A segunda vista existe para provar o argumento do produto — o solado, a costura interna, o mecanismo. Se essa face não puder ser confirmada pelas fontes, mostre um close real de um detalhe confirmado em vez de inventar um ângulo.
- As duas aparições são exatamente o mesmo produto e a mesma variante, sem diferença de cor, componente ou acabamento.
- Todo o texto fica alinhado à esquerda no topo, em três níveis: o título em caixa alta pesada e duas linhas, na cor da marca; uma linha de apoio em caixa mista e peso forte, na mesma cor; e uma terceira linha em caixa mista, peso leve e tom neutro.
- A oferta fica dentro de um selo circular chapado na cor da marca, encostado no canto inferior do quadro, com o texto em branco, caixa alta e duas linhas curtas. Uma pequena dobra de fita fecha um dos lados do círculo.
- Esta peça não tem logo da loja, não tem ícone, não tem benefício em lista e não tem pessoa.
- Só existem duas cores gráficas: a da marca, no texto e no selo, e o tom neutro da terceira linha. Todo o resto é a areia e as cores do produto.`,
    collection: `- O que define esta direção: os produtos aparecem espalhados sobre uma superfície granulada em que AFUNDAM de leve — areia, terra fina, tecido de trama grossa —, cada um em uma área do quadro e em um ângulo próprio.
- A superfície é o fundo inteiro: sem horizonte, sem parede, sem mesa. Textura visível, ondulações suaves e uma depressão rasa sob cada produto.
- Os quatro produtos se distribuem em diagonais suaves, sem alinhamento rígido, cada um com folga em volta. Um deles pode aparecer virado mostrando a base ou o verso, quando essa face estiver confirmada.
- Cada produto é distinto e elegível, com a sua própria cor e acabamento. Nenhum pode ser recolorido nem repetido para completar o conjunto.
- Todo o texto fica alinhado à esquerda no topo, em três níveis: o título em caixa alta pesada e duas linhas, na cor da marca; uma linha de apoio em caixa mista e peso forte; e uma terceira linha em caixa mista, peso leve e tom neutro.
- A oferta fica dentro de um selo circular chapado na cor da marca, encostado no canto inferior do quadro, com o texto em branco, caixa alta e duas linhas curtas. Uma pequena dobra de fita fecha um dos lados do círculo.
- Esta peça não tem logo da loja, não tem ícone, não tem benefício em lista e não tem pessoa.`,
  },
  'REF-0005': {
    title: 'PRODUTO E CARTÃO FÍSICO DE OFERTA',
    single: `- O que define esta direção: é um PONTO DE VISTA EM PRIMEIRA PESSOA. As duas mãos entram pela borda inferior do quadro, como se fossem do próprio espectador: uma segura o produto, a outra segura um cartão impresso com a oferta.
- As mãos são adultas e realistas, com o punho e um pedaço da manga visíveis. Dedos, pega, escala e sombra naturais; nenhum dedo deformado, nenhuma mão flutuando.
- A mão do produto o segura pelas laterais, com a face principal voltada para a câmera e nada de essencial coberto pelos dedos.
- A outra mão segura o cartão pela borda externa, entre o polegar e o indicador, levemente inclinado em perspectiva.
- Ao fundo, desfocado, um ambiente de mesa escura e quente: a superfície com veios, o estojo aberto do produto e um ou outro objeto de clima. Um SEGUNDO produto confirmado pode aparecer ali dentro do estojo, fora de foco — é o que sugere que existe uma coleção. Nada disso pode competir com o primeiro plano.
- O cartão é escuro, quase quadrado, com uma moldura de filete fino e metálico recuada da borda.
- Dentro do cartão, cinco níveis centralizados, nesta ordem: a marca da loja no topo; uma linha curta em caixa alta bem espaçada e cor de acento; um filete curto; a oferta em tipografia SERIFADA e cor metálica clara, em duas linhas, o maior texto do cartão; e uma linha de apoio menor, na mesma serifada.
- Todo o texto da peça vive dentro do cartão. Fora dele não existe headline, selo, ícone nem CTA.
- Luz quente e lateral, com brilho nos metais e na pele. Profundidade de campo curta: nítido na frente, dissolvido atrás.`,
    collection: `- O que define esta direção: PONTO DE VISTA EM PRIMEIRA PESSOA, com as mãos entrando pela borda inferior — uma segura um dos produtos, a outra segura um cartão impresso com a oferta — e o restante da coleção espalhado na mesa ao fundo.
- As mãos são adultas e realistas, com punho e manga visíveis. Dedos, pega, escala e sombra naturais.
- O produto na mão é o protagonista: nítido, com a face principal para a câmera e nada de essencial coberto pelos dedos.
- Os outros três produtos ficam sobre a mesa ao fundo, separados entre si, em foco parcial: suficientemente visíveis para se reconhecer que são itens diferentes, mas sem competir com o primeiro plano. Um deles pode estar dentro do estojo aberto.
- Cada produto mantém o seu material, cor e acabamento. Nada de repetir o mesmo item nem inventar variante para completar o grupo.
- O cartão é escuro, quase quadrado, com moldura de filete fino e metálico recuada da borda.
- Dentro do cartão, centralizados: a marca da loja no topo, uma linha curta em caixa alta espaçada na cor de acento, um filete curto, a oferta em tipografia serifada e cor metálica clara em duas linhas, e uma linha de apoio menor.
- Todo o texto da peça vive dentro do cartão. Fora dele não existe headline, selo, ícone nem CTA.
- Mesa escura e quente com veios, luz lateral, brilho nos metais e na pele, profundidade de campo curta.`,
  },
  'REF-0006': {
    title: 'EDITORIAL LIFESTYLE COM PAINEL DE OFERTA',
    single: `- O que define esta direção: uma fotografia de moda com LUZ NATURAL FORTE E DIRECIONAL, feita junto a uma arquitetura clássica de pedra clara — colunas, pilastras, cantaria. As sombras são nítidas e desenhadas, nunca difusas.
- A foto ocupa o quadro inteiro. Não existe painel de cor: o texto assenta direto sobre a área em sombra da arquitetura, de um dos lados.
- A pessoa aparece do outro lado, enquadrada da cabeça até a cintura, em três quartos, OLHANDO PARA FORA DO QUADRO — nunca para a câmera. Pose serena, queixo levemente erguido, nada de sorriso posado.
- O produto aparece grande na metade inferior do lado dela, nítido e inteiro, com o padrão, a ferragem e os detalhes legíveis. A mão da pessoa toca o produto de forma natural — segurando a alça junto ao ombro, apoiando a borda — sem cobrir nada que o identifique.
- Cabelo, tecido e dedos nunca invadem a parte reconhecível do produto.
- O casting segue o público declarado do produto: gênero, faixa etária e biotipo compatíveis com quem a loja anuncia.
- No lado em sombra, alinhado à esquerda e empilhado: uma linha curta em caixa alta bem espaçada, um filete horizontal fino abaixo dela, e o título em tipografia SERIFADA de caixa mista, grande, na cor de acento metálica. O título não é caixa alta e não é pesado.
- Abaixo do título, o painel da oferta dentro de uma moldura de filete fino fechada nos quatro lados. Um degrau por linha, e as linhas separadas por filetes horizontais que atravessam a moldura.
- Cada linha de degrau tem três tamanhos: a condição em corpo pequeno e tom claro, o valor da vantagem em corpo grande e cor metálica, e a palavra final em corpo pequeno de novo.
- Esta peça não tem logo da loja, não tem CTA, não tem selo, não tem ícone e não tem benefício escrito.
- A cor de acento metálica é a única cor gráfica. Todo o resto é a pedra clara, o figurino neutro e as cores do produto.`,
  },
  'REF-0007': {
    title: 'MOSAICO EDITORIAL',
    collection: `- O que define esta direção: é UMA ÚNICA FOTOGRAFIA de cima, recortada em módulos por respiros brancos largos. Todos os produtos estão deitados sobre a MESMA superfície contínua, e o fundo atravessa os cortes — o degradê e o tom seguem de um módulo para o outro como se o branco tivesse sido desenhado por cima da foto.
- A grade é IRREGULAR e essa irregularidade é o que dá o ritmo. Há módulos altos que descem por duas fileiras e módulos pequenos e quadrados ao lado deles. Nunca monte uma grade de retângulos iguais: seis células do mesmo tamanho matam esta direção.
- São exatamente seis produtos, cada um no seu módulo, mais o cartão ocupando um sétimo. O cartão é um dos módulos PEQUENOS, nunca um dos grandes.
- A escala dentro de cada módulo varia conforme a peça: um item pequeno como um boné aparece pequeno, com bastante superfície sobrando em volta; uma peça grande preenche quase todo o seu módulo. Não normalize os tamanhos para preencher tudo igual.
- Cada peça é fotografada deitada, levemente em diagonal, com sombra projetada suave e na mesma direção em todos os módulos. Quando um item for conjunto, as peças dele ficam juntas no mesmo módulo, sobrepostas com naturalidade.
- Nada de manequim, nada de pessoa, nada de plinto, nada de produto em pé, nada de cabide e nada de cenário.
- Os respiros brancos são largos, retos e vão de borda a borda do quadro, cortando a foto em ângulos retos.
- O cartão é chapado, no mesmo tom exato da superfície, e traz a logo da loja, uma expressão curta e a oferta. Ele não cresce, não ocupa duas células e não vira o maior elemento da peça.
- Quando a oferta tiver vários degraus, só o valor principal fica grande dentro do cartão; os demais entram em uma linha fina abaixo dele, completos. O cartão não aumenta para acomodá-los.
- O texto do cartão é preto ou o tom mais escuro da própria superfície. Esta direção não usa cor de acento: nada de vermelho, nada de dourado, nada de cor de marca no cartão.`,
  },
  'REF-0008': {
    title: 'ANÚNCIO NATIVO RETRÔ',
    single: `- O que define esta direção: uma FOTOGRAFIA REAL DO PRODUTO colada dentro de um editor de desenho antigo, com rabiscos feitos à mão por cima. O humor está nesse contraste: o produto é impecável, o resto parece feito às pressas por alguém.
- Ao fundo, um papel de parede de computador antigo: céu azul com nuvens e uma colina verde ao longe. A janela fica centralizada sobre ele, deixando uma faixa do papel de parede visível em volta.
- A janela tem a anatomia completa de um editor de imagem dos anos 2000: barra de título com um ícone pequeno e três botões de janela à direita, uma barra de menus com palavras curtas, uma coluna de ferramentas em duas colunas de ícones simples à esquerda, barras de rolagem nas bordas da área de desenho e uma paleta de quadradinhos coloridos na base.
- Nada disso pode copiar nome, logo, ícone ou interface de nenhum sistema ou programa real. É uma janela genérica, inspirada na memória visual, não uma reprodução.
- A área de desenho é branca e chapada. Sobre ela, o produto aparece em fotografia real, grande, recortado e com sombra própria, sem nenhum cenário.
- O texto é escrito à mão, em vermelho, imitando a ferramenta de lápis: uma frase em cursiva de duas linhas no alto, e a oferta em caixa alta de uma linha só, atravessando a base.
- Um desenho tosco feito à mão, na mesma cor e no mesmo traço, acompanha a frase do alto — um símbolo simples, nada elaborado.
- A imperfeição é controlada: o rabisco é torto de propósito, mas o produto, a oferta e a marca continuam impecáveis e legíveis.
- Esta peça não tem logo da loja, não tem CTA, não tem benefício e não tem pessoa.`,
    collection: `- O que define esta direção: FOTOGRAFIAS REAIS dos produtos coladas dentro de um editor de desenho antigo, com rabiscos feitos à mão por cima. O humor está nesse contraste: os produtos são impecáveis, o resto parece feito às pressas.
- Ao fundo, um papel de parede de computador antigo: céu azul com nuvens e uma colina verde ao longe. A janela fica centralizada sobre ele, deixando uma faixa visível em volta.
- A janela tem a anatomia completa de um editor dos anos 2000: barra de título com ícone e três botões, barra de menus, coluna de ferramentas em duas colunas à esquerda, barras de rolagem e paleta de quadradinhos coloridos na base. Nada pode copiar nome, logo ou interface de programa real.
- A área de desenho é branca e chapada. Sobre ela, os quatro produtos aparecem em fotografia real, agrupados em dois conjuntos sobrepostos em diagonal, um mais à frente e outro atrás, cada produto reconhecível e com sombra própria.
- Nenhum produto pode ser recolorido, duplicado ou inventado para completar os grupos.
- O texto é escrito à mão, em vermelho, imitando a ferramenta de lápis: uma frase em cursiva de duas linhas no alto, e a oferta em caixa alta de uma linha só atravessando a base.
- Um desenho tosco feito à mão, no mesmo traço, acompanha a frase do alto.
- A imperfeição é controlada: o rabisco é torto de propósito, mas produtos, oferta e marcas continuam impecáveis e legíveis.
- Esta peça não tem logo da loja, não tem CTA, não tem benefício e não tem pessoa.`,
  },
  'REF-0009': {
    title: 'VITRINE TÁTIL DE COLEÇÃO',
    collection: `- O que define esta direção: é UMA CENA FOTOGRÁFICA ÚNICA, sem grade e sem módulos, com a câmera quase no nível da superfície. Os produtos são vistos de frente, na altura dos olhos de quem está deitado no chão, nunca de cima.
- O cenário tem dois materiais no mesmo tom profundo: uma parede de tecido texturizado ou estampado ao fundo, e uma superfície lisa e macia embaixo, onde os produtos afundam de leve. Os quatro cantos do quadro escurecem, e a luz se concentra no grupo.
- Os quatro produtos formam um grupo compacto no terço inferior, tocando-se e se sobrepondo em profundidade, com alturas escalonadas que desenham uma pirâmide.
- Um dos quatro aparece DEITADO de lado, mostrando a face que os outros escondem — o solado, o interior, o verso. Os outros três ficam em pé, ligeiramente virados. Se essa segunda face não estiver confirmada nas fontes, mantenha os quatro em pé em vez de inventar.
- Cada produto mantém a sua própria cor e estampa. O tom do cenário não pode recolorir nenhum deles.
- A metade superior do quadro é quase toda fundo, e é nela que vive a headline: três linhas centralizadas, em sans pesada de CAIXA MISTA — não caixa alta —, em tom claro sobre o fundo escuro. É o maior texto da peça.
- A oferta fica dentro de um selo circular claro e pequeno, encostado na borda lateral, na altura do grupo de produtos: duas linhas curtas separadas por um filete horizontal, em caixa alta escura. O selo é pequeno; se a oferta não couber em duas linhas curtas, esta direção não é a indicada.
- No rodapé, uma faixa retangular clara e estreita com uma única condição confirmada, em caixa alta espaçada, e abaixo dela uma linha fina de assinatura em duas frases curtas, a segunda em itálico.
- Esta peça não tem logo da loja, não tem ícone, não tem lista de benefícios, não tem CTA e não tem pessoa.
- Só existem duas famílias de cor: o tom profundo do cenário e o claro dos elementos gráficos. Nenhuma cor de acento entra.`,
  },
  'REF-0010': {
    title: 'PRODUTO ZENITAL COM BENEFÍCIOS',
    single: `- Fundo liso de tom muito claro e uniforme, sem cenário, sem textura e sem sombra dura.
- Uma única unidade do produto vista de cima, centralizada na metade superior do quadro e apoiada em simetria perfeita. Quando o produto for vendido em par, mostre o par simétrico como uma unidade.
- Sombra de contato suave logo abaixo do produto, sem separá-lo do fundo com contorno artificial.
- Toda a comunicação fica centralizada na metade inferior, empilhada nesta ordem: uma linha curta em caixa alta leve, a headline em caixa alta pesada logo abaixo dela, um parágrafo de duas linhas com os atributos factuais e uma frase curta em itálico.
- Na base, a oferta e um benefício confirmado aparecem lado a lado, em duas etiquetas de mesmo tamanho e cor de acento da marca. Se só a oferta estiver confirmada, use uma única etiqueta centralizada.
- Simetria em todo o eixo vertical, leitura imediata e estética de catálogo funcional.`,
  },
  'REF-0011': {
    title: 'TRIO DE COLEÇÃO CROMÁTICA',
    collection: `- O que define esta direção: os produtos FLUTUAM sobre um fundo de cor sólida, sem superfície nenhuma embaixo deles. Só uma sombra suave e curta os ancora. Não existe mesa, chão, plinto nem linha de horizonte.
- O fundo é uma única cor fechada, derivada da identidade da loja, com os cantos escurecendo e um clareamento radial suave logo atrás do grupo, como um refletor apontado para ele.
- Os três produtos aparecem em diagonal ascendente da esquerda para a direita: o da frente é o mais baixo e o maior, e cada um atrás sobe um pouco e diminui. Eles se sobrepõem parcialmente, sem esconder a silhueta de nenhum.
- Os três estão exatamente no mesmo ângulo de três quartos, virados para o mesmo lado, como o mesmo modelo repetido em cores diferentes. Cada cor precisa estar confirmada nas fontes; nenhuma pode ser inventada para completar o trio.
- Tudo na peça é centralizado num único eixo vertical, do topo à base.
- No topo, a headline em caixa alta pesada e branca, em duas linhas, ocupando quase toda a largura. É a maior massa de texto da peça. Logo abaixo dela, uma linha fina em caixa mista com o nome da coleção.
- Abaixo dos produtos, um título curto em caixa alta, visivelmente menor que a headline, e duas linhas de apoio em caixa mista e peso leve.
- No rodapé, a oferta dentro de uma cápsula de contorno fino e cantos totalmente arredondados, com um ícone simples à esquerda do texto, em caixa alta espaçada. A cápsula é vazada: só o contorno, sem preenchimento.
- Todo o texto e todo o contorno são brancos. Não existe cor de acento além do fundo e das cores próprias dos produtos.
- Esta peça não tem logo da loja, não tem ícone de benefício, não tem selo, não tem faixa e não tem pessoa.`,
  },
  'REF-0012': {
    title: 'CATÁLOGO AMPLO DE COLEÇÃO',
    collection: `- O que define esta direção: é um MOSTRUÁRIO DE VARIANTES DO MESMO MODELO, não uma seleção de produtos diferentes. O que a peça vende é a quantidade de cores disponíveis. Se a loja tiver muitas variantes confirmadas, mostre todas que couberem; se tiver poucas, esta direção não é a indicada.
- Fundo branco frio, liso e contínuo, sem cenário, sem plinto e sem textura.
- Nove unidades do mesmo modelo, uma por cor confirmada, em duas fileiras DESIGUAIS: quatro na de cima e cinco na de baixo. A fileira de baixo vem ligeiramente maior e mais à frente.
- Todas as unidades estão exatamente no mesmo ângulo, viradas para o mesmo lado, no mesmo tamanho dentro da sua fileira, com espaçamento regular. Elas nunca se sobrepõem: cada uma fica isolada, com sombra suave própria.
- Nenhuma cor pode ser inventada para completar a grade. Se faltarem variantes, reduza o número de unidades e reequilibre as fileiras.
- No topo, a oferta partida em duas metades por um traço vertical fino, cada metade em uma cor diferente da identidade da loja, em caixa alta pesada ocupando quase toda a largura. É o maior elemento da peça.
- Logo abaixo da segunda metade, alinhada à direita e não ao centro, uma palavra curta em caixa alta espaçada e em preto.
- Abaixo dos produtos, uma faixa retangular preta chapada com uma condição curta em branco, caixa alta bem espaçada. Depois dela, duas linhas centralizadas em caixa mista, e por último uma linha menor com um ícone simples à esquerda.
- Esta peça não tem logo da loja, não tem pessoa, não tem cenário e não tem moldura.
- As únicas cores dos elementos gráficos são as duas da headline e o preto da faixa. Todo o resto é o branco do fundo e as cores próprias das variantes.`,
  },
  'REF-0015': {
    title: 'VITRINE MODULAR CLARA',
    collection: `- O que define esta direção: é uma CENA DENSA DE COLECIONADOR. Cada produto vem acompanhado da sua própria embalagem, do seu estojo e dos impressos que vêm com ele, empilhados em camadas de profundidade. Não é vitrine limpa nem grade: é uma mesa cheia, arrumada com capricho.
- Fundo claro e frio, contínuo, sem cenário. Uma moldura de filete fino e metálico acompanha a borda do quadro, com cantos arredondados e afastada da margem.
- Três produtos ao todo, cada um em um nível de profundidade diferente: um mais ao fundo e mais alto, apoiado sobre um bloco claro; outro no meio, deitado sobre a própria caixa; outro à frente, apoiado no estojo. Os três aparecem em ângulos diferentes entre si.
- As embalagens reais são parte da composição, não acessório: caixas fechadas servindo de apoio, estojo rígido sustentando um produto, capa de tecido ou couro sob outro. Só entram as que estiverem confirmadas nas fontes; sem elas, esta direção perde o sentido e outra deve ser escolhida.
- Objetos pequenos de apoio dão o tom de coleção: um impresso que acompanha o produto, uma plaquinha de identificação discreta. Eles ficam na frente, pequenos, e nunca disputam com os produtos.
- A câmera fica um pouco acima da altura da mesa, em três quartos. Luz difusa vinda de cima e de um lado, sombras suaves e alongadas para o lado oposto. Tudo nítido, sem desfoque de fundo.
- A metade superior de um dos lados fica livre de objetos e é ali que vive o texto, alinhado à esquerda, em apenas dois níveis: uma linha curta em caixa alta espaçada e, logo abaixo, a oferta em caixa alta pesada e escura, em duas linhas.
- Esta peça não tem logo da loja, não tem ícone, não tem lista de benefícios, não tem selo, não tem faixa e não tem pessoa.
- Os únicos elementos gráficos são a moldura metálica e o texto escuro. Toda a cor vem dos produtos e das embalagens.`,
  },
  'REF-0016': {
    title: 'CLOSE EDITORIAL EM USO',
    single: `- Close extremo de uma pessoa usando o produto ocupa a maior parte do quadro, com o rosto cortado de forma deliberada pela borda lateral. O corte é limpo e vertical na lateral, nunca no topo da cabeça.
- O produto em uso é o elemento mais nítido e mais detalhado da imagem, mostrado por inteiro, na altura dos olhos de quem vê, com a pele e o cabelo em foco levemente menor.
- A outra parte do quadro é um fundo claro, liso e contínuo com a pele iluminada, e recebe todo o texto alinhado a um único eixo.
- O texto é curto e tem só dois níveis: um ornamento discreto com filete e uma linha em caixa alta espaçada no alto, e logo abaixo a oferta em caixa alta pesada, em duas ou três linhas.
- A oferta é o único bloco grande da peça. Não existe lista de benefícios, não existe ícone, não existe CTA e não existe faixa no rodapé.
- Esta direção vende pelo desejo do produto, não por argumento escrito. Se houver benefício confirmado no contexto, ele fica de fora: o espaço é do close e da oferta.
- Alto contraste entre a pele iluminada e o fundo claro, com leitura imediata em tela pequena.`,
  },
  'REF-0017': {
    title: 'ANTES E DEPOIS DIRETO',
    single: `- O quadro é partido ao meio por uma divisória vertical fina: o mesmo enquadramento, na mesma distância, com a mesma luz, aparece dos dois lados.
- O lado esquerdo mostra a situação inicial e o direito o resultado. A única diferença entre eles é a mudança que as fontes comprovam. Nada de retoque, maquiagem, ângulo ou iluminação diferentes entre os lados.
- O recorte é fechado na região onde o resultado acontece, sem mostrar identidade da pessoa.
- No rodapé, o produto real aparece pequeno e inteiro, apoiado sobre a imagem, no canto oposto ao texto.
- Ao lado dele, um cartão claro de leitura fácil com uma frase curta e factual em duas linhas, na cor da marca.
- Se a comparação não estiver comprovada pelas fontes, esta direção não pode ser usada.`,
  },
  'REF-0018': {
    title: 'COMPARATIVO PROBLEMA E SOLUÇÃO',
    single: `- O que define esta direção: é um INFOGRÁFICO DE COMPARAÇÃO sobre fundo branco chapado, onde as alternativas que não funcionam aparecem RECUSADAS e o produto aparece como a saída. Não é foto de ambiente, não é cena de uso, não é depoimento.
- Headline curta em duas linhas no topo, na cor da marca, nomeando o incômodo que o produto resolve.
- De um lado, até três cartões claros empilhados. Cada cartão mostra a miniatura de uma alternativa concorrente, um ícone de recusa, o nome dessa alternativa e uma linha curta dizendo por que ela falha. Só entram alternativas confirmadas nas fontes.
- Do outro lado, o produto grande em still recortado, em uma ou duas unidades reais, nítido, sem cenário atrás e sem mão segurando.
- Um selo circular pequeno na cor da marca, encostado no produto, destaca o dado factual que sustenta a comparação.
- No rodapé, uma miniatura arredondada do resultado real e uma seta discreta ligando o produto a ela, apenas quando esse resultado estiver comprovado.
- Tudo respira branco: sem textura, sem sombra dramática, sem ambiente. A peça parece uma página de explicação, não um anúncio de estilo.`,
  },
  'REF-0019': {
    title: 'COMO USAR EM TRÊS PASSOS',
    single: `- Fundo liso de tom muito claro, com leve variação de cor derivada da identidade da loja.
- Headline operacional no topo, em duas linhas, nomeando a sequência de uso.
- O produto aparece grande e isolado no centro do quadro, em perspectiva, mostrando a face que explica o seu funcionamento. Quando for vendido em par, mostre o par.
- Setas curtas e discretas podem apontar partes do produto, somente quando essas partes existirem de verdade.
- Faixa inferior com exatamente três cartões do mesmo tamanho e alinhados no mesmo eixo. Cada cartão traz uma foto real da etapa, o número do passo e uma instrução de duas linhas.
- As três etapas precisam corresponder ao uso confirmado do produto. Se a sequência real tiver outro número de etapas, esta direção não deve ser usada.
- Nas fotos das etapas, mãos e pés entram apenas como demonstração, sem rosto e sem identidade.`,
  },
  'REF-0020': {
    title: 'PRODUTO COM PROVA SOCIAL',
    single: `- O que define esta direção: é uma CENA REAL do ambiente onde o produto é usado, com fundo fotográfico desfocado, e a prova vem de CLIENTES QUE JÁ COMPRARAM. Não é infográfico, não é fundo branco e não compara com concorrente nenhum.
- O produto aparece grande em primeiro plano, segurado por uma mão de forma natural ou apoiado no próprio ambiente, com o ambiente reconhecível mas fora de foco atrás dele.
- Do lado oposto, três cartões claros de cantos arredondados, empilhados e do mesmo tamanho, flutuando sobre a foto com sombra suave.
- Cada cartão traz o retrato do cliente apenas quando a foto for real e fornecida, as estrelas apenas quando a avaliação for confirmada, uma headline curta em duas linhas e o trecho fiel do depoimento.
- Nenhum nome, nota, número ou depoimento pode ser inventado. Sem fonte, o cartão sai da peça em vez de ser preenchido.
- No rodapé, até três ganhos confirmados, cada um com ícone circular de traço fino, separados por divisórias verticais discretas.
- Os cartões nunca cobrem o produto nem encostam nele. A sensação é de conversa real, não de folheto técnico.`,
  },
  'REF-0021': {
    title: 'COLEÇÃO EM PEDESTAL DE LUXO',
    collection: `- O que define esta direção: os produtos ficam EM PÉ E FRONTAIS sobre um pedestal escuro que atravessa a base do quadro inteiro, num estúdio quase preto. É uma vitrine de joalheria, não uma mesa nem uma grade.
- Fundo de tom escuro e profundo, fechando nos cantos, com um clareamento suave logo atrás dos produtos. O pedestal é do mesmo tom do fundo e se distingue dele só pela aresta chanfrada e pelo reflexo na quina.
- Três produtos, lado a lado, todos frontais e na mesma altura de base, com espaço regular entre eles. Eles não se tocam e não se sobrepõem.
- Cada produto é um modelo diferente, com o seu próprio material, acabamento e cor. Não são variantes de cor do mesmo item, e nenhum pode ser recolorido para compor o trio.
- Luz dirigida de cima e da frente, acendendo a face principal de cada produto e deixando reflexos metálicos nas laterais.
- No topo, a headline em tipografia serifada e cor metálica, em duas linhas de tamanhos diferentes: a primeira bem maior que a segunda. Logo abaixo, uma linha fina em caixa mista e branca, ladeada por um filete horizontal curto de cada lado.
- A oferta aparece numa placa retangular integrada à frente do pedestal, com moldura de borda dupla metálica e fundo escuro. O texto é branco em caixa alta, e apenas a palavra da vantagem vem na cor metálica.
- Um detalhe geométrico metálico pode fechar o rodapé, abaixo do pedestal, sem texto e sem função comercial.
- Esta peça não tem logo da loja, não tem ícone, não tem benefício escrito e não tem pessoa.
- Só existem três cores: o escuro do cenário, o metálico dos elementos gráficos e o branco do texto de apoio. O resto vem dos próprios produtos.`,
  },
  'REF-0022': {
    title: 'VITRINE FÍSICA COM OFERTA',
    collection: `- O que define esta direção: é UMA FOTOGRAFIA DE DENTRO DA LOJA FÍSICA, com um produto em destaque e o estoque em volta. Não é uma seleção de itens separados: é a vitrine cheia, com bandejas carregadas de peças que nem precisam ser contadas.
- Câmera na altura do balcão de vidro, olhando ligeiramente para baixo, em três quartos, com profundidade real: bandejas no primeiro plano, a placa no meio, e o interior da loja desfocado ao fundo.
- Um único produto é o protagonista: ele aparece dentro do seu estojo aberto, apoiado sobre uma base de madeira escura e polida, ocupando um dos lados do primeiro plano. É o mais nítido e o mais iluminado da cena.
- Ao redor, bandejas forradas de tecido claro com várias peças cada uma, alinhadas em fileiras. Elas comunicam quantidade, não seleção: não precisam estar inteiras no quadro nem ser identificáveis uma a uma.
- Ao fundo, desfocado, o mobiliário da loja: armário de madeira escura com peças iluminadas em expositores, parede clara com luz embutida, e um arranjo de flores ou um abajur de luz quente. Nada disso pode competir com o primeiro plano.
- Luz quente vinda de várias fontes, como iluminação real de loja. Reflexos no vidro do balcão e brilho nos metais.
- A comunicação vive numa placa de papel apoiada num cavalete de base metálica, em pé sobre o balcão, ao lado do produto em destaque.
- O texto da placa é MANUSCRITO, em letra cursiva escura e legível, como se alguém da loja tivesse escrito à mão. As linhas principais vêm sublinhadas à mão em vermelho, uma por vez.
- Abaixo das linhas principais, os degraus da oferta em corpo bem menor, sem sublinhado, e depois duas linhas ainda menores de condição.
- Não invente motivo promocional, endereço, data, encerramento de loja nem urgência que não estejam no contexto. O que a placa diz vem inteiro das fontes.
- Esta peça não tem logo da loja, não tem elemento gráfico digital, não tem moldura e não tem pessoa. O vermelho dos sublinhados é a única cor fora da paleta quente do ambiente.`,
  },
  'REF-0023': {
    title: 'MOSAICO DE PRODUTO EM USO',
    collection: `- O que define esta direção: o MESMO produto aparece em SEIS CENÁRIOS COMPLETAMENTE DIFERENTES, cada painel com sua própria superfície, sua própria paleta e sua própria luz. É o oposto de uma grade uniforme: se dois painéis parecerem a mesma sessão de fotos, a peça está errada.
- O layout é desigual e fixo: um painel grande ocupa o canto superior de um dos lados, dois painéis menores se empilham na coluna oposta, e três painéis lado a lado fecham a faixa inferior. Respiros brancos finos separam todos.
- O painel grande é still: o produto apoiado ou pendurado sobre um cilindro de papel de cor quente, com um adereço natural seco e um tecido claro ao fundo. É o único painel sem corpo.
- Os cinco painéis menores mostram o produto sendo usado, em close, cada um sobre um material distinto: seda clara, tricô, superfície escura, fundo liso neutro, cetim com adereço. Nunca repita o material entre painéis.
- Em pelo menos dois painéis aparecem DOIS pulsos de pessoas diferentes, lado a lado ou cruzados, mostrando o produto usado em par. É o argumento de presente e não pode sumir.
- Um dos painéis mostra a variante de ACABAMENTO diferente do produto — o outro metal, o outro tom —, desde que essa variante esteja confirmada nas fontes. Se só houver um acabamento, use esse painel para outro enquadramento em vez de inventar.
- Um dos painéis da faixa inferior mostra a embalagem real aberta, com o produto acomodado dentro e a marca impressa na tampa, quando essa embalagem estiver confirmada.
- Nas fotos de uso aparece só a região do corpo onde o produto é usado: pulso, mão, antebraço. Sem rosto, sem corpo inteiro, sem cena de vida.
- Esta peça não tem texto comercial nenhum: sem oferta, sem headline, sem selo e sem cartão. O único texto que pode existir é a marca impressa na própria embalagem.
- Nada de plinto, nada de fundo branco de estúdio, nada de modelo posando e nada de grade uniforme.
- Luz suave em todos os painéis e o mesmo tratamento de cor ligando cenários que são diferentes entre si.`,
  },
  'REF-0024': {
    title: 'PRODUTO EM CAIXA PRESENTEÁVEL',
    single: `- Close premium de uma única caixa real do produto, aberta em ângulo de três quartos, ocupando quase todo o quadro.
- O produto fica inteiramente visível sobre o apoio interno da caixa, nítido, com textura e escala fiéis.
- A tampa interna aparece na parte superior e pode receber a marca da loja, apenas quando ela estiver confirmada nas fontes.
- Fundo de tecido claro e macio, com adereço natural discreto e desfocado em um dos cantos.
- Luz quente e lateral, reflexos suaves no material do produto e sombras curtas dentro da caixa.
- Quando a peça precisar de título e oferta, eles entram no espaço livre de tecido, em corpo discreto, sem cobrir a caixa nem o produto.
- Se a caixa real não estiver confirmada, troque-a por um apoio neutro em vez de inventar uma embalagem.`,
  },
  'REF-0025': {
    title: 'FLAT LAY RADIAL DE COLEÇÃO',
    collection: `- O que define esta direção: é um FLAT LAY DE QUATRO CONJUNTOS IGUAIS EM CORES DIFERENTES, dispostos nos quatro cantos, com um selo no meio costurando tudo. O que a peça vende é a escolha de cor de um mesmo conjunto, não uma seleção de produtos diferentes.
- Fundo de tom claro e quente, uma superfície contínua só, sem módulo, sem respiro e sem moldura. Todas as peças estão deitadas e fotografadas de cima.
- Quatro conjuntos, um por quadrante. Cada conjunto reúne as mesmas peças do conjunto vizinho, só que em outra cor confirmada nas fontes. Nenhuma cor pode ser inventada para completar os quatro.
- Dentro de cada quadrante, a peça de cima fica atrás e acima, e a peça de baixo fica à frente e abaixo, sobrepondo-a de leve. As duas se tocam, como se tivessem sido postas juntas à mão.
- Nada é alinhado com régua: cada conjunto vem num ângulo levemente diferente, com caimento natural do tecido, dobras reais e nenhuma peça perfeitamente reta.
- Luz difusa de cima, sombra macia e alongada para o mesmo lado em todas as peças.
- No topo, o wordmark da loja em tipografia serifada de caixa mista, grande e escuro. Abaixo dele um filete curto de acento metálico, e abaixo do filete uma linha em caixa alta espaçada nomeando o conjunto.
- No centro exato do quadro, um selo circular escuro com borda fina metálica, sobreposto ao encontro dos quatro quadrantes. Ele cobre de propósito as bordas internas dos conjuntos vizinhos — é o que costura os quatro. O que ele não pode cobrir é a frente de nenhuma peça, o decote, o logo ou qualquer detalhe que identifique o produto.
- Dentro do selo, três níveis: uma expressão curta em caixa alta e corpo pequeno, o valor da vantagem em corpo grande e cor metálica, e uma palavra em caixa alta logo abaixo. Um filete curto fecha a base.
- O selo tem diâmetro fixo e modesto: ele cabe no vão central e nunca cresce para acomodar mais texto. Com vários degraus, só o principal ocupa o selo e os demais entram numa linha fina fora do círculo.
- Esta peça não tem pessoa, não tem cenário, não tem ícone, não tem benefício escrito e não tem CTA.`,
  },
  'REF-0026': {
    title: 'MODELO EDITORIAL COM OFERTA GIGANTE',
    single: `- A peça toda vive num mesmo ambiente claro e quente. A área de texto à esquerda é a parede da própria cena, no mesmo tom da arquitetura ao fundo: a passagem da área de texto para a fotografia é suave e contínua, sem linha divisória, sem moldura e sem dois retângulos colados.
- Uma pessoa em corpo inteiro usa o produto à direita, em pé, em pose natural e relaxada, num cenário arquitetônico claro com luz de sol lateral, sombra projetada macia e um elemento natural discreto ao fundo. Nada de parede de concreto cru e nada de cenário cinzento.
- A peça vendida aparece inteira, nítida e bem iluminada, sem dobras que escondam corte, caimento ou logo.
- Todo o texto fica na área clara à esquerda, alinhado à esquerda e empilhado nesta ordem: wordmark da loja em tipografia serifada no topo, filete curto na cor de acento, uma palavra em caixa alta espaçada, o título em caixa alta pesada, outro filete, uma expressão curta de introdução e a oferta.
- A oferta é o maior elemento da peça inteira, em corpo muito grande, na cor de acento, com um único tamanho e um único peso. Abaixo dela, uma palavra em caixa alta espaçada fecha o bloco.
- A cor de acento é premium — metálica, terrosa ou escura. Nada de vermelho de liquidação.
- Só existem esses dois níveis de texto: a identidade no topo e a oferta embaixo. Não existe lista de benefícios, não existe ícone, não existe faixa no rodapé e não existe CTA.
- Esta direção vende pela marca e pelo preço. Se houver benefício confirmado no contexto, ele fica de fora: o espaço é do respiro e do número.
- Acabamento de campanha de moda premium: muito ar em volta de cada bloco e nenhum elemento decorativo extra.
- Acessórios e calçados da pessoa ficam discretos e nunca mais chamativos que a peça vendida.`,
  },
  'REF-0027': {
    title: 'UNBOXING COM OFERTA NA TAMPA',
    single: `- Vista de cima de uma caixa de envio genérica de papelão, aberta, apoiada sobre uma superfície real de bancada.
- A caixa é neutra e sem marca de transportadora. A parte interna da tampa funciona como o suporte do texto, impresso diretamente no papelão.
- A tampa concentra, nesta ordem: a marca da loja no topo, uma headline curta em duas linhas e uma linha por degrau da oferta, todas alinhadas no mesmo eixo.
- Dentro da caixa, o produto aparece dobrado ou acomodado como chegaria ao cliente, inteiramente reconhecível, com cores, estampas e logos fiéis.
- Papel de proteção discreto pode aparecer nas bordas internas, sem cobrir o produto.
- Luz natural difusa, sombra macia e nenhum adereço de cena.
- Não invente embalagem oficial, fita personalizada, cartão ou brinde que não estejam confirmados.`,
  },
  'REF-0028': {
    title: 'DETALHE FUNCIONAL COM DEPOIMENTO',
    single: `- Fundo de estúdio claro e liso, sem cenário, com luz ampla e sombra suave.
- Close lateral da parte do corpo onde o produto é usado, enquadrando exatamente o recurso que a peça quer provar, com uma mão em ação natural demonstrando o uso.
- O produto ocupa o centro do quadro e o detalhe funcional aparece em foco máximo. Nada do corpo além da região necessária, e nenhum rosto.
- Blocos de texto com aspecto de pincelada aplicada sobre a foto: um bloco maior recebe um depoimento real e curto entre aspas, com o nome de quem falou logo abaixo.
- Dois blocos menores apontam, cada um, um recurso ou benefício confirmado, posicionados perto da parte do produto a que se referem.
- Os blocos nunca cobrem o recurso que estão descrevendo.
- Wordmark discreto da loja em uma das laterais.
- Se não houver depoimento real, a peça sai apenas com os blocos de recurso confirmados.`,
  },
  'REF-0037': {
    title: 'ESCADA DE DESCONTO COM MODELO',
    single: `- Fundo claro e quente, contínuo entre os dois lados da peça, com luz ampla e diagonal e sombra projetada suave.
- Uma pessoa usando o produto ocupa a metade direita, de frente, em pose relaxada, enquadrada do pescoço para baixo. A peça vendida aparece inteira e nítida.
- A metade esquerda recebe todo o texto, alinhado à esquerda e empilhado: wordmark da loja no topo, a headline em duas vozes tipográficas — parte em peso forte e parte em itálico leve —, um filete curto e até dois parágrafos curtos de condição.
- Abaixo deles, a escada de desconto: um cartão por degrau, empilhados, cada um com um ícone simples à esquerda, a quantidade em corpo pequeno e o valor da vantagem dominante.
- Os cartões escurecem progressivamente do primeiro ao último, e o último recebe uma fita diagonal curta marcando o melhor valor.
- A escada é o principal elemento textual da peça; a headline é secundária.
- Se a oferta tiver um único degrau, use um único cartão e dispense a fita.`,
  },
  'REF-0038': {
    title: 'MOSAICO DE LOOKS COM CARD CENTRAL',
    collection: `- O que define esta direção: as fotos ficam ENCOSTADAS NAS BORDAS e o CENTRO DO QUADRO FICA VAZIO. Não é uma grade que preenche tudo: é uma coluna de fotos colada na borda esquerda, outra colada na borda direita, e uma faixa de fotos na base, deixando o meio livre.
- Esse centro livre é fundo liso, na mesma cor quente e clara do estúdio das fotos. É nele que vivem o wordmark da loja, no alto, e o cartão da oferta, logo abaixo.
- Três blocos na coluna esquerda, três na direita e dois na faixa inferior quando houver oito itens elegíveis. Com menos itens, use menos blocos e deixe cada um maior, mantendo o centro livre. Os blocos de uma coluna não se alinham com os da outra: as alturas são diferentes e as emendas ficam em posições diferentes dos dois lados.
- Cada bloco traz uma pessoa usando um produto ou look distinto, fotografada sobre o mesmo fundo bege de estúdio, com sombra suave. Um dos blocos da base pode ser still, sem pessoa, para dar pausa — mas ele mostra um dos itens elegíveis, nunca um acessório inventado.
- O enquadramento muda de bloco para bloco e é isso que dá vida à peça: uma pessoa aparece de corpo inteiro, outra cortada na cintura, outra só do pescoço à coxa, outra mostrando apenas as pernas. Não padronize o enquadramento.
- O rosto aparece em alguns blocos e é cortado em outros, de propósito. Quando cortar, corte abaixo do nariz ou do queixo, nunca no meio dos olhos.
- Os blocos sangram até a borda externa do quadro, sem moldura e sem margem branca contornando a peça.
- No centro, o wordmark da loja em serifada alta e espaçada, com um filete fino logo abaixo dele, direto sobre o fundo — nunca dentro de uma caixa.
- Abaixo do wordmark, um cartão de cantos arredondados e borda fina dourada, em tom creme mais claro que o fundo: um pequeno ornamento vegetal no topo, a headline da mecânica em duas linhas centralizadas, e uma linha por degrau, separadas por filetes curtos e centralizados.
- Tudo no cartão é centralizado e em corpo de texto, sem nenhum número gigante. Esta direção não grita: a oferta é lida, não exibida.
- A largura do cartão é fixa e não passa de um terço da largura do quadro. Com mais degraus ele fica um pouco mais alto, nunca mais largo.
- Paleta quente e neutra em tudo: nada de vermelho, nada de cor de acento fora o dourado fino da borda e do ornamento.`,
  },
  'REF-0039': {
    title: 'VITRINE MODULAR COM CARD DE DESCONTO',
    collection: `- O que define esta direção: o quadro é dividido em TRÊS COLUNAS DE LARGURAS DESIGUAIS, e quanto mais estreita a coluna, mais blocos ela empilha. A coluna larga leva dois blocos grandes; a do meio, dois; a estreita, quatro pequenos.
- Os blocos se TOCAM, sem respiro e sem moldura. A separação entre eles vem só da mudança de conteúdo, nunca de uma faixa branca.
- São oito blocos ao todo. Um deles traz uma pessoa usando o produto, em pé, ocupando a coluna larga inteira. Todos os outros são still: cada produto apoiado sobre um bloco geométrico branco, fotografado de frente e ligeiramente de cima, com sombra curta projetada para o lado.
- O fundo de todos os stills é branco levemente quente, e o bloco de apoio é branco puro. A distinção entre o apoio e o fundo vem só da sombra.
- A escala dentro de cada bloco varia muito e isso é parte da peça: uma jaqueta preenche quase todo o seu bloco; uma presilha ou uma faixa de cabelo ocupam um terço do seu, com bastante branco em volta. Não normalize.
- Se e somente se a campanha incluir acessórios na lista de elegíveis, eles ocupam blocos próprios e enchem a coluna estreita. Numa campanha de uma categoria só, todos os blocos trazem itens dessa categoria, e a coluna estreita fica com menos blocos e maiores.
- O wordmark da loja fica no topo do quadro, centralizado, direto sobre a área clara da foto que estiver ali. Nunca dentro de caixa, nunca sobre cor.
- O cartão da oferta NÃO é um módulo da grade: ele flutua por cima das fotos, com cantos arredondados e sombra suave, posicionado fora do centro e invadindo duas colunas.
- Dentro do cartão, quatro níveis, nesta ordem: um rótulo minúsculo em caixa alta bem espaçada; a headline em duas linhas, onde parte da frase é escura e parte é da mesma cor em tom bem mais claro; os degraus em colunas lado a lado, cada um com o valor grande e as palavras de apoio minúsculas acima e abaixo; e uma linha fina de condição no rodapé.
- Divisórias verticais finas separam as colunas de degraus. Com mais degraus, as colunas ficam mais estreitas; elas nunca empilham e o cartão nunca vira um bloco alto.
- A peça inteira é branco, cinza e preto. A ÚNICA cor do quadro é a do texto do cartão, e ela aparece em dois tons da mesma família. Nenhuma outra cor entra em lugar nenhum.
- Nada de flat lay, nada de peça deitada, nada de fundo quente e nada de respiro branco entre blocos.`,
  },
};

function compileSingleContextPrompt(campaign: CampaignInput) {
  const protectedSource = campaign.linkAccess === 'protected'
    ? `\n\nO LINK ESTÁ PROTEGIDO OU INDISPONÍVEL. Use como fontes factuais principais as fotos reais e nítidas do produto e os prints completos da página de vendas anexados nesta conversa. As imagens anexadas são fontes factuais; não são referências criativas. Não peça senha. Se os anexos não estiverem visíveis, peça somente que eu os anexe antes de continuar.`
    : '';

  return `Vamos criar um criativo de PRODUTO ÚNICO.
ALVO EXATO: ${campaign.exactTarget}
LINK DO PRODUTO: ${campaign.sourceUrl}
ACESSO AO LINK: ${campaign.linkAccess === 'protected' ? 'PROTEGIDO OU INDISPONÍVEL' : 'PÚBLICO'}
OFERTA: ${campaign.offer}${protectedSource}

Antes de gerar qualquer imagem, analise o site e construa o contexto factual desta criação.

Extraia do site, da página e das imagens:
- nome da loja e da marca;
- idioma utilizado pela loja;
- produto correto, nome comercial e categoria;
- variante principal;
- formato, cores, materiais, componentes, estampas, rótulos e detalhes reconhecíveis;
- benefícios explicitamente publicados;
- logo, cores e identidade visual da loja;
- estilo tipográfico da loja: se as letras da marca e do site são com ou sem serifa, o peso, a caixa e o espaçamento que ela usa;
- público-alvo do produto: gênero, faixa etária e contexto de uso indicados pela página, pela categoria, pelas fotos e pela tabela de tamanhos;
- argumento de venda: este produto se vende por uma funcionalidade que a foto não mostra, ou pela própria estética? Responda uma das duas e diga em uma linha por quê.

Crie internamente um título publicitário curto. Eu não fornecerei o título exato.

Regras permanentes:
- esta campanha anuncia somente o produto do link, não a coleção da loja;
- não alterar nenhuma característica real do produto;
- não misturar variantes;
- não inventar benefícios, preços, descontos, cupons, urgência, avaliações, garantias ou selos;
- preservar exatamente o valor e as condições da oferta;
- não gerar a imagem ainda.

Responda somente:

CONTEXTO CAPTURADO

Marca:
Idioma:
Produto e categoria:
Variante visual:
Características que serão preservadas:
Benefícios factuais:
Oferta recebida:
Redação localizada da oferta:
Logo e cores observadas:
Estilo tipográfico da loja:
Público-alvo do produto:
Argumento de venda:
Título publicitário proposto:
Fatos que não puderam ser confirmados:
PRONTO PARA GERAR:`;
}

function compileCollectionContextPrompt(campaign: CampaignInput) {
  const sourceRule = campaign.linkAccess === 'protected'
    ? 'As imagens anexadas nesta conversa são fontes factuais da loja, da coleção e dos produtos. Elas não são referências criativas.'
    : 'O link informado é a fonte factual principal. Imagens eventualmente anexadas nesta conversa são fontes factuais da loja, da coleção e dos produtos; elas não são referências criativas.';

  return `Vamos preparar o contexto factual de uma campanha publicitária de COLEÇÃO.

ALVO EXATO: ${campaign.exactTarget}
LINK: ${campaign.sourceUrl}
ACESSO AO LINK: ${campaign.linkAccess === 'protected' ? 'PROTEGIDO OU INDISPONÍVEL; USE OS PRINTS E IMAGENS ANEXADOS COMO FONTES FACTUAIS' : 'PÚBLICO'}
OFERTA: ${campaign.offer}

${sourceRule}

Antes de gerar qualquer imagem, construa o contexto factual obedecendo a estas regras:

1. Analise somente a coleção declarada em ALVO EXATO. Ignore produtos, marcas ou coleções fora desse recorte, mesmo que apareçam na mesma loja ou nos prints.
2. Se o link estiver protegido ou indisponível, use os prints e as imagens anexadas como fonte principal. Não peça senha.
3. Separe a marca da loja/anunciante da marca dos produtos quando forem diferentes.
4. Preserve exatamente a oferta recebida, apenas localizando a redação para o idioma da loja quando necessário.
5. Não invente produtos, variantes, cores, materiais, logos, benefícios, preços, cupons, urgência, avaliações, garantias ou condições comerciais.
6. Identifique todos os produtos ou looks visualmente confirmáveis que pertençam à coleção. Atribua IDs P01, P02, P03 e assim por diante; cada ID deve descrever apenas um produto ou look real.
7. A seleção e a ordem dos produtos são LIVRES dentro dos itens elegíveis. Cada peça futura vai pedir a sua própria quantidade — pode ser três, quatro, seis ou mais — e escolherá entre os elegíveis. Liste TODOS os que conseguir confirmar, não apenas quatro. Só trate IDs específicos como obrigatórios se esta mensagem os declarar explicitamente.
8. Se não existirem pelo menos quatro itens confirmáveis, peça somente a menor fonte adicional necessária. Não gere a imagem ainda.
9. Registre o estilo tipográfico da loja: se as letras da marca e do site são com ou sem serifa, o peso, a caixa e o espaçamento que ela usa.
10. Registre o público-alvo da coleção: gênero, faixa etária e contexto de uso indicados pela página, pela categoria, pelas fotos e pela tabela de tamanhos.
11. Registre o argumento de venda da coleção: os produtos se vendem por uma funcionalidade que a foto não mostra, ou pela própria estética? Responda uma das duas.

Responda somente neste formato:

CONTEXTO CAPTURADO — V004
Tipo da campanha: COLEÇÃO
Alvo exato:
Escopo incluído:
Escopo excluído:
Marca da loja/anunciante:
Marca do produto ou da coleção:
Idioma:
Oferta recebida:
Redação localizada da oferta:
Identidade visual observada:
Estilo tipográfico da loja:
Público-alvo da coleção:
Argumento de venda:
Produtos/looks elegíveis:
- P01:
- P02:
- P03:
[continue se necessário]
Regra de seleção visual: escolher livremente entre os elegíveis, na quantidade que cada peça pedir.
Título publicitário proposto:
Fonte principal usada: link / prints / ambos
Fatos que não puderam ser confirmados:
PRONTO PARA GERAR: SIM ou NÃO`;
}

export function compileContextPrompt(campaign: CampaignInput) {
  return campaign.mode === 'collection'
    ? compileCollectionContextPrompt(campaign)
    : compileSingleContextPrompt(campaign);
}

function compileDirections(campaign: CampaignInput, selected: Reference[], round: number) {
  return selected
    .map((reference, index) => {
      const tested = testedDirections[reference.id];
      const title = tested?.title ?? reference.name.toUpperCase();
      const recipe = tested?.[campaign.mode] ?? `- ${reference.recipe}`;
      const limite = reference.limits ? `\n- Limite operacional: ${reference.limits}` : '';
      const people = peopleRule(reference);
      const peopleLines = people ? people.split('\n').slice(1).join('\n') : '';
      const slotLine = campaign.mode === 'collection' && reference.slots
        ? `
- Quantidade alvo desta direção: ${reference.slots} produtos ou looks distintos, todos da lista de elegíveis. Com menos itens confirmados, use menos módulos e deixe cada um maior. Nunca invente produto nem categoria para preencher.`
        : '';
      const silentLines = reference.silent ? `\n${SILENT_RULE.split('\n').slice(1).join('\n')}` : '';
      return `CRIATIVO ${itemLabel(index, round)} — ${title}\n${recipe}${limite}${slotLine}${silentLines}${peopleLines ? `\n${peopleLines}` : ''}`;
    })
    .join('\n\n');
}

export function compileReferencePrompt(campaign: CampaignInput, reference: Reference) {
  const tested = testedDirections[reference.id];
  const title = tested?.title ?? reference.name.toUpperCase();
  const baseRecipe = tested?.[campaign.mode] ?? `- ${reference.recipe}`;
  const recipe = `${baseRecipe}${reference.limits ? `
- Limite operacional: ${reference.limits}` : ''}`;
  const silentBlock = reference.silent ? `${SILENT_RULE}

` : '';
  const offerRule = reference.silent
    ? '- Esta direção é uma peça sem texto: não escreva a oferta, nem título, nem marca. Ela vende só pela imagem.'
    : `- Preserve exatamente a oferta recebida: “${campaign.offer}”.`;
  const peopleText = peopleRule(reference);
  const peopleBlock = peopleText ? `${peopleText}\n\n` : '';
  const slots = reference.slots ?? 4;
  const slotsWord = ['', '', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][slots] ?? String(slots);
  const contentRule = campaign.mode === 'collection'
    ? `- Anuncie somente a coleção “${campaign.exactTarget}”.
- Mostre simultaneamente até ${slotsWord} produtos ou looks distintos, e SOMENTE itens que constem na lista de elegíveis do CONTEXTO CAPTURADO — V004. Essa quantidade é o alvo da diagramação, não uma cota a cumprir.
- O número de itens confirmados manda sobre a quantidade da direção. Se houver menos itens do que módulos, use menos módulos e deixe cada um maior, reequilibrando a composição.
- É proibido inventar produto ou categoria para preencher espaço. Vale exatamente o que a lista de elegíveis traz: se ela reúne várias categorias, todas entram; se traz uma só, a peça inteira é dessa categoria e nada de fora aparece.
- Um quadro com menos itens do que módulos é correto. Um quadro com item que não está na lista é entrega inválida, por melhor que ele combine com a cena.
- Preserve a separação visual entre os itens; não sugira um kit obrigatório e não misture marcas, logos, cores ou componentes.`
    : `- Anuncie somente o produto “${campaign.exactTarget}” e a variante factual registrada no CONTEXTO CAPTURADO.
- Mostre o mesmo produto sem redesenhar, recolorir, misturar variantes ou inventar componentes.`;

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE UM criativo publicitário mestre em proporção 4:5.

${HOUSE_PRODUCT_RULE}

CONTEÚDO OBRIGATÓRIO
${contentRule}
- Use a loja/anunciante, a marca do produto e o idioma exatamente como registrados no contexto.
${offerRule}
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.
- Se houver conflito entre a direção visual e a leitura imediata do produto, a leitura do produto vence.

DIREÇÃO VISUAL — ${title}
${recipe}

${silentBlock}${peopleBlock}${HOUSE_DESIGN_RULE}

SAÍDA
- Entregue uma única imagem final e independente em 4:5.
- Não gere alternativas, colagem, grade, carrossel ou explicações em texto.
- Não gere nem altere nenhum outro criativo desta conversa.

Entregue agora somente a imagem final desta direção.`;
}

function compileSingleMasterPrompt(campaign: CampaignInput, selected: Reference[], round: number) {
  const labels = selected.map((_, index) => itemLabel(index, round));
  return `Usando exclusivamente o CONTEXTO CAPTURADO e verificado anteriormente nesta conversa, execute agora um lote de criação com EXATAMENTE CINCO criativos publicitários mestres.

${roundReset(round)}${HOUSE_PRODUCT_RULE}

CONTRATO DE ENTREGA — LEIA ANTES DE QUALQUER COISA
Esta resposta precisa terminar com EXATAMENTE CINCO arquivos de imagem anexados. Nem quatro, nem seis, nem um arquivo contendo cinco peças.
- Cada arquivo contém UMA ÚNICA peça publicitária, inteira, ocupando o quadro todo.
- É proibido entregar qualquer imagem que contenha mais de uma peça: nada de colagem, grade, mosaico, contact sheet, carrossel, painel comparativo, montagem lado a lado, moodboard, ou miniatura de outra direção dentro da imagem. Uma imagem com duas peças dentro conta como entrega inválida, mesmo que as duas estejam bonitas.
- Faça cinco chamadas separadas da ferramenta de geração de imagem, uma por criativo, na ordem ${labels.join(', ')}.
- Se o sistema só permitir gerar uma imagem por vez, gere uma por vez, em sequência, até completar as cinco. Preferir uma de cada vez é correto. Juntar peças em um arquivo para caber em menos gerações é errado.
- Não substitua nenhuma imagem por descrição em texto. Não escreva o plano, não resuma as direções, não pergunte nada: gere.
- Antes de enviar a resposta, conte os arquivos anexados. Se não forem cinco arquivos, cada um com uma peça só, gere os que faltam antes de responder.

REGRA DE SAÍDA DO LOTE
- As cinco imagens são finais, independentes e todas em proporção 4:5.
- Cada imagem deve funcionar sozinha como anúncio, sem depender das outras para ser entendida.
- Não interrompa depois da primeira imagem e não peça confirmação entre elas.
- Identifique cada arquivo fora da imagem com seu número e nome de direção visual.
- Cada imagem deve funcionar sozinha como anúncio e apresentar o mesmo produto, marca, idioma e oferta do contexto. Somente a direção visual muda.

REGRAS FACTUAIS COMUNS AOS CINCO CRIATIVOS
- Preserve exatamente o produto-alvo “${campaign.exactTarget}”: silhueta, mecanismo, proporções, variante, materiais, articulações, apoios, encaixes e demais detalhes reconhecíveis das fontes factuais.
- Não redesenhe, simplifique, recolora, misture variantes ou transforme o produto em outro produto.
- Use a loja/anunciante e preserve a marca do produto exatamente como registradas no CONTEXTO CAPTURADO.
- Preserve exatamente a oferta recebida: ${campaign.offer}. A única exceção é a direção que se declarar uma peça sem texto: nela a oferta não aparece.
- Use o idioma definido no contexto e um título curto factual derivado do nome ou da categoria do produto.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem ou acessório.
- Objetos de apoio só podem aparecer quando forem necessários para demonstrar uma função factual e não podem ocultar nem substituir o produto.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.
- Se houver conflito entre a direção visual e a leitura imediata do produto, a leitura do produto vence.

${HOUSE_DESIGN_RULE}

${compileDirections(campaign, selected, round)}

CHECAGEM FINAL DO LOTE
Antes de gerar, confirme internamente:
1. A resposta terá cinco arquivos de imagem anexados, e cada arquivo tem uma peça só. Nenhum arquivo é colagem, grade ou montagem.
2. Todos estarão em 4:5.
3. O mesmo produto factual e a mesma oferta aparecerão corretamente nos cinco.
4. Cada imagem corresponderá somente à sua direção visual numerada.
5. Nenhuma referência criativa, marca externa, embalagem ou fato inventado será incorporado.
6. As pessoas que aparecerem correspondem ao público-alvo registrado no contexto.
7. Nenhum texto está cortado pela borda, sobreposto ou ilegível.
8. Em cada peça, o produto anunciado é reconhecível em um segundo e se separa do fundo e do figurino.

Entregue agora os cinco criativos ${labels.join(', ')}, em ordem, sem explicações adicionais.`;
}

function compileCollectionMasterPrompt(campaign: CampaignInput, selected: Reference[], round: number) {
  const labels = selected.map((_, index) => itemLabel(index, round));
  return `Usando exclusivamente o CONTEXTO CAPTURADO — V004 e as fontes factuais já verificadas anteriormente nesta conversa, execute agora um lote com EXATAMENTE CINCO criativos publicitários mestres para a coleção “${campaign.exactTarget}”.

${roundReset(round)}${HOUSE_PRODUCT_RULE}

CONTRATO DE ENTREGA — LEIA ANTES DE QUALQUER COISA
Esta resposta precisa terminar com EXATAMENTE CINCO arquivos de imagem anexados. Nem quatro, nem seis, nem um arquivo contendo cinco peças.
- Cada arquivo contém UMA ÚNICA peça publicitária, inteira, ocupando o quadro todo.
- É proibido entregar qualquer imagem que contenha mais de uma peça: nada de colagem, grade, mosaico, contact sheet, carrossel, painel comparativo, montagem lado a lado, moodboard, ou miniatura de outra direção dentro da imagem. Uma imagem com duas peças dentro conta como entrega inválida, mesmo que as duas estejam bonitas.
- Faça cinco chamadas separadas da ferramenta de geração de imagem, uma por criativo, na ordem ${labels.join(', ')}.
- Se o sistema só permitir gerar uma imagem por vez, gere uma por vez, em sequência, até completar as cinco. Preferir uma de cada vez é correto. Juntar peças em um arquivo para caber em menos gerações é errado.
- Não substitua nenhuma imagem por descrição em texto. Não escreva o plano, não resuma as direções, não pergunte nada: gere.
- Antes de enviar a resposta, conte os arquivos anexados. Se não forem cinco arquivos, cada um com uma peça só, gere os que faltam antes de responder.

REGRA DE SAÍDA DO LOTE
- As cinco imagens são finais, independentes e todas em proporção 4:5.
- Cada imagem deve funcionar sozinha como anúncio, sem depender das outras para ser entendida.
- Não interrompa depois da primeira imagem e não peça confirmação entre elas.
- Identifique cada arquivo fora da imagem com seu número e nome de direção visual.
- Cada imagem deve funcionar sozinha como anúncio da coleção. Somente a direção visual muda.

CONTEÚDO COMUM E OBRIGATÓRIO
- Loja/anunciante: use exatamente a marca da loja/anunciante registrada no CONTEXTO CAPTURADO — V004.
- Coleção anunciada: “${campaign.exactTarget}”.
- Oferta exata: “${campaign.offer}”. A única exceção é a direção que se declarar uma peça sem texto: nela a oferta não aparece.
- Idioma: use exatamente o idioma registrado no CONTEXTO CAPTURADO — V004.
- Cada criativo comunica variedade mostrando simultaneamente vários produtos ou looks distintos e elegíveis do contexto factual. A quantidade muda de uma direção para outra e está declarada dentro de cada uma: respeite a de cada criativo em vez de padronizar.
- Os produtos ou looks devem permanecer visualmente separados e reconhecíveis; a peça não pode sugerir que formam um kit obrigatório.
- Preserve formato, cores, materiais, componentes, estampas, rótulos, logos e detalhes de cada produto conforme as fontes factuais.
- Não duplique, funda, redesenhe, recolora ou misture características entre produtos ou marcas.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, embalagem, numeração, selo ou condição comercial.
- Use a identidade da loja/anunciante e não transforme nenhuma marca dos produtos na anunciante principal.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.
- Se houver conflito entre a direção visual e a leitura imediata do produto, a leitura do produto vence.

${HOUSE_DESIGN_RULE}

${compileDirections(campaign, selected, round)}

CHECAGEM FINAL DO LOTE
Antes de gerar, confirme internamente:
1. A resposta terá cinco arquivos de imagem anexados, e cada arquivo tem uma peça só. Nenhum arquivo é colagem, grade ou montagem.
2. Todos estarão em 4:5.
3. Cada criativo mostrará a quantidade de produtos que a sua própria direção pede, e todos serão distintos e elegíveis.
4. Loja/anunciante, coleção “${campaign.exactTarget}”, oferta “${campaign.offer}” e idioma estarão corretos.
5. Produtos, logos e características não serão misturados entre os itens elegíveis.
6. Cada arquivo corresponderá somente à sua direção visual numerada.
7. As pessoas que aparecerem correspondem ao público-alvo registrado no contexto.
8. Nenhum texto está cortado pela borda, sobreposto ou ilegível.
9. Em cada peça, os produtos anunciados são reconhecíveis em um segundo e se separam do fundo e do figurino.

Entregue agora os cinco criativos ${labels.join(', ')}, em ordem, sem explicações adicionais.`;
}

export function compileMasterPrompt(campaign: CampaignInput, selected: Reference[], round = 1) {
  return campaign.mode === 'collection'
    ? compileCollectionMasterPrompt(campaign, selected, round)
    : compileSingleMasterPrompt(campaign, selected, round);
}

export function compileRecoveryPrompt(selected: Reference[], pendingIndexes: number[], round = 1) {
  const pending = pendingIndexes.map((index) => itemLabel(index, round));
  const approved = selected
    .map((_, index) => index)
    .filter((index) => !pendingIndexes.includes(index))
    .map((index) => itemLabel(index, round));
  const approvedLabel = approved.length === 1 ? 'o CRIATIVO' : 'os CRIATIVOS';

  return `${approved.length ? `Você gerou corretamente ${approvedLabel} ${approved.join(', ')}. Não ${approved.length === 1 ? 'o gere' : 'os gere'} novamente.\n\n` : ''}Agora gere somente ${pending.length === 1 ? 'o criativo pendente' : 'os criativos pendentes'}: ${pending.join(', ')}.
Execute uma geração de imagem independente para cada ID, seguindo integralmente sua receita já definida nesta conversa.

Cada ID é uma geração de imagem independente. Nenhuma imagem pode conter mais de uma peça: sem colagem, sem grade, sem mosaico, sem contact sheet e sem miniatura de outra direção dentro da imagem.

Não produza variações ${approved.length === 1 ? `do CRIATIVO ${approved[0]}` : 'dos criativos já aprovados'}.
Não responda com descrições em texto.
Não misture receitas entre os IDs.
Não peça confirmação entre as gerações.

Entregue ${pending.length === 1 ? 'uma imagem separada' : `${pending.length} imagens separadas`} em 4:5, na ordem ${pending.join(', ')}.`;
}

export function compileSingleRecoveryPrompt(reference: Reference, index: number, round = 1) {
  return `Agora gere somente o criativo pendente: ${itemLabel(index, round)}.
Execute uma geração de imagem independente para este ID, seguindo integralmente a receita “${reference.name}” já definida nesta conversa.

Entregue exatamente um arquivo de imagem, contendo uma única peça. Sem colagem, sem grade, sem mosaico, sem contact sheet, sem comparativo lado a lado e sem miniatura de nenhuma outra direção dentro da imagem.

Não gere novamente nenhum outro criativo.
Não responda com descrição em texto.
Não misture receitas.
Não peça confirmação.

Entregue uma imagem separada em 4:5: CRIATIVO ${itemLabel(index, round)}.`;
}

export function compileIndividualPrompt(reference: Reference, index: number, issue: string, kind: 'content' | 'variation', round = 1) {
  if (kind === 'variation') {
    return `Crie uma nova variação somente do CRIATIVO ${itemLabel(index, round)} — ${reference.name}.

${HOUSE_PRODUCT_RULE}

Preserve integralmente o CONTEXTO CAPTURADO, o produto ou conjunto de produtos, a oferta, o idioma, a proporção 4:5 e a receita visual dessa direção. Mude apenas a solução estética dentro da mesma direção.

Não altere nem gere novamente os outros quatro criativos. Entregue exatamente um arquivo de imagem, com uma única peça, sem colagem, sem grade e sem miniaturas, e sem explicações.`;
  }

  return `Corrija somente o conteúdo do CRIATIVO ${itemLabel(index, round)} — ${reference.name}.

ERRO OBSERVADO
${issue.trim() || '[descreva aqui o erro de produto, marca, oferta, texto ou detalhe visual]'}

Preserve tudo o que já está correto. Mantenha a mesma direção visual, composição, CONTEXTO CAPTURADO e proporção 4:5. Corrija apenas o erro informado, sem inventar fatos.

Não altere nem gere novamente os outros quatro criativos. Entregue somente a imagem corrigida, sem explicações.`;
}
