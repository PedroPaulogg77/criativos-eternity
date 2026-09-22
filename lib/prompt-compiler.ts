import type { OfferMechanic, Reference } from '@/lib/mvp-data';
import { HOUSE_PRODUCT_RULE, HOUSE_DESIGN_RULE, SILENT_RULE, peopleRule } from '@/lib/house-rules';

export type CampaignInput = {
  mode: 'single' | 'collection';
  exactTarget: string;
  sourceUrl: string;
  linkAccess: 'public' | 'protected';
  offer: string;
  offerMechanic?: OfferMechanic | null;
};

type TestedDirection = {
  title: string;
  single?: string;
  collection?: string;
};

const itemLabel = (index: number, round = 1) => String((round - 1) * 5 + index + 1).padStart(2, '0');
const testimonialReferenceIds = new Set(['REF-0020', 'REF-0072', 'REF-0078']);

/* Direção de coleção que vende o mesmo modelo em cores, usada num produto único. */
function supportsVariants(campaign: CampaignInput, reference: Reference) {
  return campaign.mode === 'single' && Boolean(reference.fillsWithVariants);
}

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
- Esta peça não tem benefício escrito, não tem selo, não tem ícone e não tem CTA.
- Com menos itens confirmados, escalone menos produtos atrás e deixe o da frente maior. Com um único item, ele fica sozinho sobre a plataforma, gigante, e o vazio do estúdio cresce atrás dele. Não repita o mesmo produto para formar o grupo nem invente uma cor.`,
  },
  'REF-0002': {
    title: 'LIFESTYLE ESPORTIVO EM MOVIMENTO',
    single: `- O que define esta direção: uma FOTOGRAFIA URBANA REAL ocupando o quadro inteiro, com uma pessoa em plena corrida, e todo o texto aplicado por cima dela. Não existe painel de cor, não existe metade reservada e não existe recorte do produto.
- A cena precisa ter um lado escuro e um lado claro: prédio ou muro em sombra de um lado, céu e construções claras do outro. O lado escuro é onde o texto branco fica legível, e isso não é acaso — escolha o enquadramento pensando nisso.
- A imagem é dessaturada, num registro de cinza, preto e branco, com o asfalto claro embaixo. Sensação real de movimento, sem pose.
- O enquadramento vai do tronco até os pés e não inclui a cabeça, para que a peça vendida ocupe a maior área possível da foto.
- O corte privilegia a peça vendida: ela fica na faixa central da imagem, na área mais iluminada e mais nítida. As demais peças do figurino são lisas, sem estampa e de cor claramente diferente da do produto, para que a borda do produto apareça.
- O casting segue o público declarado do produto: gênero, faixa etária e biotipo compatíveis com quem a loja anuncia. Corpo e mãos anatomicamente corretos.
- A logo da loja fica no topo, centralizada, pequena e clara sobre a área escura da foto.
- Logo abaixo dela, a headline em caixa alta muito pesada, centralizada, em duas linhas que ocupam quase toda a largura. É o maior texto da peça.
- Entre a headline e as faixas, a foto fica livre: nenhuma lista de benefícios, nenhum ícone, nenhuma etiqueta. A peça tem três blocos de texto e mais nada.
- Na base, a oferta em faixas horizontais empilhadas, uma por degrau, com margem lateral e um canto chanfrado. Elas invertem o contraste entre si: a do degrau principal é de cor viva e forte com o texto em preto; a seguinte é escura com o texto em branco.
- Dentro de cada faixa há dois pesos: a condição em caixa alta pesada e a palavra final em peso mais leve. Se a oferta tiver um único degrau, use uma única faixa.
- Abaixo das faixas, uma linha curta de prova social em caixa alta bem espaçada, somente quando ela estiver confirmada no contexto.
- A única cor da peça é a da faixa principal. Todo o resto é a foto dessaturada e o branco do texto.`,
  },
  'REF-0003': {
    title: 'CENÁRIO TÁTIL E QUENTE',
    single: `- O que define esta direção: o produto aparece DUAS VEZES sobre uma superfície granulada em que ele AFUNDA de leve — areia, terra fina, tecido de trama grossa —, e uma das duas aparições mostra a face que o cliente nunca vê na vitrine.
- A superfície é o fundo inteiro e é CLARA — areia, terra fina clara ou tecido de trama grossa em tom claro, nunca um tom médio ou terroso: sem horizonte, sem parede, sem mesa. Ela tem textura visível, ondulações suaves e marcas de relevo, e o produto deixa uma depressão rasa onde se apoia.
- As duas unidades formam uma diagonal ascendente: uma mais à frente e mais baixa, vista de perfil ou três quartos; a outra mais atrás e mais alta, virada para mostrar a base, o verso ou o interior. Elas se tocam de leve no meio.
- A segunda vista existe para provar o argumento do produto — o solado, a costura interna, o mecanismo. Se essa face não puder ser confirmada pelas fontes, mostre um close real de um detalhe confirmado em vez de inventar um ângulo.
- As duas aparições são exatamente o mesmo produto e a mesma variante, sem diferença de cor, componente ou acabamento.
- O único texto do topo é o título: caixa alta pesada, duas linhas, alinhado à esquerda, na cor da marca. Não há linha de apoio, subtítulo nem terceira linha.
- A oferta fica dentro de um selo circular chapado na cor da marca, encostado no canto inferior do quadro, com o texto em branco, caixa alta e duas linhas curtas. Uma pequena dobra de fita fecha um dos lados do círculo.
- Esta peça não tem logo da loja, não tem ícone, não tem benefício em lista e não tem pessoa.
- Só existe uma cor gráfica: a da marca, no título e no selo. Todo o resto é a areia e as cores do produto.`,
    collection: `- O que define esta direção: os produtos aparecem espalhados sobre uma superfície granulada em que AFUNDAM de leve — areia, terra fina, tecido de trama grossa —, cada um em uma área do quadro e em um ângulo próprio.
- A superfície é o fundo inteiro e é CLARA — areia, terra fina clara ou tecido de trama grossa em tom claro, nunca um tom médio ou terroso: sem horizonte, sem parede, sem mesa. Textura visível, ondulações suaves e uma depressão rasa sob cada produto.
- Os quatro produtos se distribuem em diagonais suaves, sem alinhamento rígido, cada um com folga em volta. Um deles pode aparecer virado mostrando a base ou o verso, quando essa face estiver confirmada.
- Cada produto é distinto e elegível, com a sua própria cor e acabamento. Nenhum pode ser recolorido nem repetido para completar o conjunto.
- O único texto do topo é o título: caixa alta pesada, duas linhas, alinhado à esquerda, na cor da marca. Não há linha de apoio nem subtítulo.
- A oferta fica dentro de um selo circular chapado na cor da marca, encostado no canto inferior do quadro, com o texto em branco, caixa alta e duas linhas curtas. Uma pequena dobra de fita fecha um dos lados do círculo.
- Esta peça não tem logo da loja, não tem ícone, não tem benefício em lista e não tem pessoa.
- Com menos itens confirmados, use menos diagonais e aumente os produtos que ficarem. Com um só, ele ocupa a diagonal central inteira, acompanhado no máximo por uma segunda vista dele mesmo — as costas, a sola, o avesso — e só se essa foto existir nas fontes. Não invente cor nem produto para completar.`,
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
- Mesa escura e quente com veios, luz lateral, brilho nos metais e na pele, profundidade de campo curta.
- O produto no estojo ao fundo só existe se as fontes confirmarem um segundo item ou uma segunda cor. Sem isso, o estojo aparece fechado ou sai do quadro e a mesa fica mais vazia. Nunca invente a segunda peça.`,
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
- O texto do cartão é preto ou o tom mais escuro da própria superfície. Esta direção não usa cor de acento: nada de vermelho, nada de dourado, nada de cor de marca no cartão.
- Com menos itens confirmados, use menos módulos e aumente os que ficarem, mantendo o cartão no centro. Os módulos restantes podem receber outras vistas reais do mesmo produto — costas, avesso, detalhe de acabamento — desde que a foto exista nas fontes. Não recolora nem invente peça para fechar a grade.`,
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
- Esta peça não tem logo da loja, não tem CTA, não tem benefício e não tem pessoa.
- As pilhas são feitas de unidades reais do mesmo produto, então elas funcionam mesmo com uma cor só: empilhe unidades idênticas. Com mais cores confirmadas, alterne-as dentro da pilha. Não invente cor para dar variedade ao empilhamento.`,
  },
  'REF-0009': {
    title: 'VITRINE TÁTIL DE COLEÇÃO',
    collection: `- O que define esta direção: é UMA CENA FOTOGRÁFICA ÚNICA, sem grade e sem módulos, com a câmera quase no nível da superfície. Os produtos são vistos de frente, na altura dos olhos de quem está deitado no chão, nunca de cima.
- O cenário tem dois materiais no mesmo tom profundo: uma parede de tecido texturizado ou estampado ao fundo, e uma superfície lisa e macia embaixo, onde os produtos afundam de leve. Os quatro cantos do quadro escurecem, e a luz se concentra no grupo.
- Os quatro produtos formam um grupo compacto no terço inferior, tocando-se e se sobrepondo em profundidade, com alturas escalonadas que desenham uma pirâmide.
- Um dos quatro aparece DEITADO de lado, mostrando a face que os outros escondem — o solado, o interior, o verso. Os outros três ficam em pé, ligeiramente virados. Se essa segunda face não estiver confirmada nas fontes, mantenha os quatro em pé em vez de inventar.
- Cada produto mantém a sua própria cor e estampa. O tom do cenário não pode recolorir nenhum deles.
- A metade superior do quadro é quase toda fundo, e ela carrega só dois textos. No alto, centralizado e pequeno, o wordmark da loja em tom claro. Abaixo dele, a oferta em uma única linha de sans pesada em CAIXA ALTA, clara sobre o fundo escuro, ocupando quase toda a largura: é o maior elemento gráfico da peça.
- Não existe selo, faixa de rodapé, assinatura, subtítulo nem segunda linha de texto. A oferta é a headline, e a peça termina nos produtos.
- Esta peça não tem ícone, não tem lista de benefícios, não tem CTA e não tem pessoa.
- Só existem duas famílias de cor: o tom profundo do cenário e o claro dos elementos gráficos. Nenhuma cor de acento entra.
- Com menos itens confirmados, use menos peças e aumente as que ficarem, mas mantenha sempre uma delas virada mostrando a face oculta — sola, avesso, interior. Com um só, ele aparece duas vezes na mesma cena: em pé e virado nessa face. Não invente estampa nem cor.`,
  },
  'REF-0010': {
    title: 'PRODUTO ZENITAL COM BENEFÍCIOS',
    single: `- O que define esta direção: SIMETRIA TOTAL num eixo vertical, com o produto visto de cima na metade superior e todo o texto centralizado na metade inferior. A peça é lida de cima para baixo, como uma página, e nada quebra o eixo.
- Fundo liso de tom muito claro e uniforme, sem cenário, sem textura e sem sombra dura.
- O produto aparece de cima, centralizado, ocupando cerca de metade da altura. Quando for vendido em par, os dois aparecem espelhados e encostados um no outro no meio, com as aberturas para o mesmo lado. Nunca duplique um produto que não seja vendido em par.
- Sombra de contato curta e suave, sem contorno artificial separando o produto do fundo.
- Na metade inferior, cinco níveis de texto, todos centralizados e nesta ordem: uma linha curta em caixa alta e peso normal; a headline em caixa alta pesada, a maior linha da peça; os atributos factuais em DUAS LINHAS DE FRASE CORRIDA, separados por vírgula, em caixa alta e corpo menor — nunca em lista, nunca com ícone e nunca com marcador; e uma frase curta em caixa mista e itálico.
- Na base, duas etiquetas retangulares de cantos retos, do mesmo tamanho, lado a lado, com texto branco em caixa alta: uma traz a oferta e a outra um benefício confirmado. Se só a oferta estiver confirmada, use uma única etiqueta centralizada.
- A cor das etiquetas é tirada do PRÓPRIO PRODUTO — o tom do material, do couro, do tecido. Não é a cor da marca e nunca é um vermelho ou amarelo de promoção.
- Esta peça não tem logo da loja, não tem ícone, não tem selo, não tem pessoa e não tem moldura.
- Estética de catálogo funcional: leitura imediata, muito ar em volta do produto e nenhum elemento decorativo.`,
  },
  'REF-0011': {
    title: 'TRIO DE COLEÇÃO CROMÁTICA',
    collection: `- O que define esta direção: os produtos FLUTUAM sobre um fundo de cor sólida, sem superfície nenhuma embaixo deles. Só uma sombra suave e curta os ancora. Não existe mesa, chão, plinto nem linha de horizonte.
- O fundo é uma única cor fechada, derivada da identidade da loja, num tom médio a escuro — fundo o bastante para o texto branco ser lido com folga —, com os cantos escurecendo e um clareamento radial suave logo atrás do grupo, como um refletor apontado para ele.
- Os três produtos aparecem em diagonal ascendente da esquerda para a direita: o da frente é o mais baixo e o maior, e cada um atrás sobe um pouco e diminui. Eles se sobrepõem parcialmente, sem esconder a silhueta de nenhum.
- Os três estão exatamente no mesmo ângulo de três quartos, virados para o mesmo lado, como o mesmo modelo repetido em cores diferentes. Cada cor precisa estar confirmada nas fontes; nenhuma pode ser inventada para completar o trio.
- Tudo na peça é centralizado num único eixo vertical, do topo à base.
- No topo, a headline em caixa alta pesada e branca, em duas linhas, ocupando quase toda a largura. É a maior massa de texto da peça. Logo abaixo dela, uma linha fina em caixa mista com o nome da coleção.
- Abaixo dos produtos, um título curto em caixa alta, visivelmente menor que a headline, e duas linhas de apoio em caixa mista e peso leve.
- No rodapé, a oferta dentro de uma cápsula de contorno fino e cantos totalmente arredondados, com um ícone simples à esquerda do texto, em caixa alta espaçada. A cápsula é vazada: só o contorno, sem preenchimento.
- Todo o texto e todo o contorno são brancos. Não existe cor de acento além do fundo e das cores próprias dos produtos.
- Esta peça não tem logo da loja, não tem ícone de benefício, não tem selo, não tem faixa e não tem pessoa.
- Com duas cores confirmadas, use duas peças maiores e centralizadas. Com uma só, use uma peça sozinha ao centro, maior, e deixe o fundo respirar. Não invente a terceira cor para fechar o trio.`,
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
- Abaixo dos produtos, o único elemento é o wordmark da loja: pequeno, centralizado, caixa alta espaçada e preto, com bastante ar em volta. Não há faixa, condição escrita, linha de apoio nem ícone.
- Esta peça não tem pessoa, não tem cenário e não tem moldura.
- As únicas cores dos elementos gráficos são as duas da oferta e o preto do wordmark. Todo o resto é o branco do fundo e as cores próprias das variantes.
- A grade acompanha o número de cores confirmadas: com quatro, quatro módulos; com duas, dois, maiores e centralizados. Com uma cor só, mostre a mesma peça em vistas reais diferentes — frente, costas, detalhe — em vez de repetir a mesma foto. Não invente cor para encher a grade.`,
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
- Os únicos elementos gráficos são a moldura metálica e o texto escuro. Toda a cor vem dos produtos e das embalagens.
- Com menos itens confirmados, use menos módulos e aumente os que ficarem. A embalagem só entra quando as fontes mostrarem a embalagem real do produto; sem ela, o módulo traz só o produto. Não invente caixa, estojo nem cor.`,
  },
  'REF-0016': {
    title: 'CLOSE EDITORIAL EM USO',
    single: `- O que define esta direção: um CLOSE EXTREMO do rosto, cortado pela borda lateral, com o produto em uso na altura dos olhos e a oferta sozinha do outro lado. O fundo de estúdio é um só: ele passa por trás da pessoa e continua até a borda oposta, virando o espaço do texto sem nenhuma divisão.
- O rosto aparece de três quartos, quase inteiro, com uma fatia cortada pela borda lateral. O corte é vertical e deliberado, nunca no topo da cabeça.
- Verticalmente o enquadramento vai do alto do cabelo até a base do pescoço, e a pessoa veste algo escuro e liso que fecha o canto inferior.
- O produto em uso ocupa uma faixa horizontal na altura dos olhos e é o elemento mais nítido e mais detalhado da peça: armação, ferragem, acabamento e logo legíveis. Pele e cabelo ficam um grau abaixo em nitidez.
- O casting segue o público declarado do produto. Expressão neutra, sem sorriso, olhar para a frente ou levemente fora do quadro.
- Do lado do fundo livre, o texto em dois níveis apenas. No alto, um ornamento discreto — um filete horizontal com uma pequena forma geométrica no centro — e, logo abaixo, uma linha curta em caixa alta bem espaçada.
- Abaixo dela, a oferta em caixa alta muito pesada, em três linhas de tamanhos crescentes: a última é a maior de todas e fecha o bloco.
- A oferta é o único bloco grande da peça. Não existe lista de benefícios, não existe ícone, não existe CTA, não existe faixa e não existe logo da loja.
- Esta direção vende pelo desejo do produto, não por argumento escrito. Se houver benefício confirmado no contexto, ele fica de fora: o espaço é do close e da oferta.
- Não há cor de acento: o texto é escuro sobre o fundo claro, e toda a cor vem da pele e do próprio produto.`,
  },
  'REF-0017': {
    title: 'ANTES E DEPOIS DIRETO',
    single: `- O que define esta direção: A MESMA FOTOGRAFIA aparece dos dois lados de uma linha branca fina e vertical no centro exato, e a única coisa diferente entre elas é o resultado que o produto entrega. Mesma pessoa, mesmo enquadramento, mesma distância, mesma luz, mesma pele, mesmos detalhes.
- Não existe rótulo escrito de antes e depois, nem seta, nem moldura separando os lados. A comparação é só visual, e o espectador entende sozinho.
- O recorte fecha na região exata onde o resultado acontece, mostrando só a parte do corpo necessária. Nunca aparece o rosto inteiro nem nada que identifique a pessoa.
- A foto ocupa o quadro inteiro. Nada de fundo de estúdio, nada de cenário montado: é uma foto real, com a textura de pele e a luz que ela tem.
- Nenhum retoque além do resultado comprovado. Se a comparação não estiver comprovada pelas fontes, esta direção não pode ser usada de forma alguma.
- No canto inferior, apoiadas sobre a foto, duas unidades do produto real, pequenas e inteiras, ligeiramente sobrepostas uma à outra, com o rótulo legível.
- Ao lado delas, ocupando o resto da faixa inferior, um cartão claro de cantos arredondados encostado na borda, com uma frase curta e factual em duas linhas, em caixa mista e peso forte.
- A cor do texto do cartão é a mesma do rótulo do produto, não uma cor de marca escolhida à parte.
- Quando houver oferta a comunicar, ela entra como uma segunda linha menor dentro do mesmo cartão, abaixo da frase. O cartão não cresce e nenhum outro elemento é criado para acomodá-la.
- Esta peça não tem logo da loja separada, não tem headline no topo, não tem selo e não tem ícone.`,
  },
  'REF-0018': {
    title: 'COMPARATIVO PROBLEMA E SOLUÇÃO',
    single: `- O que define esta direção: é uma PÁGINA DE EXPLICAÇÃO sobre branco puro, em que as alternativas que não funcionam aparecem recusadas de um lado e o produto aparece do outro como a saída. Não é cena, não é ambiente, não é anúncio de estilo.
- Headline no topo, em duas linhas centralizadas, em caixa MISTA e peso forte, na cor escura da identidade — nunca caixa alta.
- De um lado, até três alternativas empilhadas. Cada uma é uma miniatura quadrada de fundo cinza muito claro e cantos arredondados, com a foto da alternativa dentro. O TEXTO fica fora da miniatura, ao lado dela, direto sobre o branco.
- Cada texto traz um ícone circular de recusa, o nome da alternativa em peso forte e duas linhas curtas dizendo por que ela falha. Só entram alternativas e objeções confirmadas nas fontes.
- Os ícones de recusa são a ÚNICA cor quente da peça inteira. Todo o resto é branco, cinza claro e o tom escuro da identidade.
- Do outro lado, duas unidades do produto real em still recortado, grandes, em diagonal ascendente e sobrepostas uma à outra. Sem cenário atrás, sem mesa, sem mão segurando e sem sombra dramática.
- Encostado nos produtos, um selo em duas partes: um círculo escuro com um ícone simples em branco e, logo abaixo, uma etiqueta retangular da mesma cor com duas linhas curtas em branco, trazendo o dado factual que sustenta a comparação.
- No canto inferior oposto, uma miniatura de cantos arredondados com a foto do resultado real, e uma seta curva e grossa saindo de baixo do produto e apontando para ela. A seta e a miniatura só entram quando esse resultado estiver comprovado nas fontes.
- Quando houver oferta a comunicar, ela entra em uma linha curta logo abaixo da headline, no mesmo tom escuro, sem caixa e sem selo próprio.
- Esta peça não tem logo da loja separada, não tem CTA e não tem pessoa além do recorte de resultado.`,
  },
  'REF-0019': {
    title: 'COMO USAR EM TRÊS PASSOS',
    single: `- O que define esta direção: o produto aparece grande e FLUTUANDO no meio do quadro, com setas coloridas apontando o mecanismo que o faz funcionar, e a sequência de uso em três fotos reais na faixa inferior.
- Fundo liso de tom muito claro e frio, uniforme, sem cenário e sem textura.
- O produto flutua em perspectiva inclinada, visto de cima e de lado ao mesmo tempo, com uma sombra elíptica suave logo abaixo. Não se apoia em mesa, plinto nem superfície. Quando for vendido em par, mostre os dois, espelhados e ligeiramente separados.
- A face voltada para a câmera é a que explica o funcionamento — o relevo, o encaixe, o mecanismo —, não a face bonita.
- Duas ou três setas curvas apontam partes específicas desse mecanismo. Elas são de uma cor VIVA E CONTRASTANTE com a do produto, escolhidas para saltar, não para se integrar. Só apontam partes que existem de verdade nas fontes.
- Na faixa inferior, exatamente três fotos reais da sequência de uso, lado a lado, do mesmo tamanho e alinhadas no mesmo eixo. Cada uma tem cantos arredondados e um contorno de filete fino, sem fundo de cartão atrás.
- Abaixo de cada foto, soltos sobre o fundo: o número do passo em caixa alta e peso forte na cor da identidade, e duas linhas de instrução em caixa mista e peso leve.
- As três etapas precisam corresponder ao uso confirmado do produto. Se a sequência real tiver outro número de etapas, esta direção não deve ser usada.
- Nas fotos das etapas aparecem mãos e pés apenas como demonstração, sem rosto e sem nada que identifique a pessoa.
- Headline no topo, em duas linhas centralizadas, em caixa mista e peso forte, na cor da identidade, nomeando a sequência.
- Quando houver oferta a comunicar, ela entra em uma linha curta abaixo da headline, sem caixa e sem selo próprio.
- Esta peça não tem logo da loja, não tem selo e não tem CTA.`,
  },
  'REF-0020': {
    title: 'PRODUTO COM DEPOIMENTOS',
    single: `- O que define esta direção: uma CENA REAL do ambiente onde o produto é usado, com o produto inteiro e reconhecível de um lado e três cartões de DEPOIMENTOS empilhados do outro. A prova social é a linguagem visual desta direção.
- O fundo é o ambiente real de uso, reconhecível mas desfocado, com detalhes coerentes com o produto. Não importe cenário de outra categoria: água e azulejo só entram para item usado no banho; vestuário pede um ambiente coerente com o look.
- Produto portátil: uma mão entra pela borda inferior e o segura sem cobrir marca ou detalhes. Produto vestível: a pessoa o veste e o enquadramento corta abaixo do pescoço, deixando a peça inteira mais nítida do que o restante do look. Em ambos os casos, o produto ocupa quase toda a altura desse lado.
- Do lado oposto, três cartões claros de cantos bem arredondados, empilhados com espaço entre eles, flutuando sobre a foto com sombra suave.
- Dentro de cada cartão: um retrato pequeno de cliente segurando ou usando o mesmo produto, cinco estrelas amarelas, uma frase curta em peso forte e duas linhas de depoimento em corpo menor abaixo de um filete fino.
- Gere os três depoimentos como texto publicitário curto e natural, coerente com o produto e com o público-alvo. Eles entram mesmo sem avaliações fornecidas no contexto. Não use nomes, números, fontes externas ou resultados técnicos não confirmados.
- As estrelas são a única cor de acento de toda a peça. Todo o resto é a cena, o produto e o texto escuro.
- Na base, sobre a própria foto e sem cartão atrás, até três ganhos confirmados, cada um com um ícone circular de traço fino e duas linhas curtas, separados por divisórias verticais finas.
- Quando houver oferta a comunicar, ela entra em uma linha curta na base, junto dos ganhos, sem selo e sem faixa própria.
- Os cartões nunca cobrem o produto nem encostam nele. Esta peça não tem logo da loja separada nem CTA.`,
  },
  'REF-0021': {
    title: 'COLEÇÃO EM PEDESTAL DE LUXO',
    collection: `- O que define esta direção: os produtos ficam EM PÉ E FRONTAIS sobre um pedestal escuro que atravessa a base do quadro inteiro, num estúdio quase preto. É uma vitrine de joalheria, não uma mesa nem uma grade.
- Fundo de tom escuro e profundo, fechando nos cantos, com um clareamento suave logo atrás dos produtos. O pedestal é do mesmo tom do fundo e se distingue dele só pela aresta chanfrada e pelo reflexo na quina.
- Três produtos, lado a lado, todos frontais e na mesma altura de base, com espaço regular entre eles. Eles não se tocam e não se sobrepõem.
- Cada produto é um modelo diferente, com o seu próprio material, acabamento e cor. Não são variantes de cor do mesmo item, e nenhum pode ser recolorido para compor o trio.
- Luz dirigida de cima e da frente, acendendo a face principal de cada produto e deixando reflexos metálicos nas laterais.
- No alto, centralizado e pequeno, o wordmark da loja em cor metálica. Abaixo dele, a oferta em tipografia serifada e cor metálica, em duas linhas de tamanhos diferentes: a primeira bem maior que a segunda. Não há linha de apoio, subtítulo nem filete entre elas.
- A oferta aparece numa placa retangular integrada à frente do pedestal, com moldura de borda dupla metálica e fundo escuro. O texto é branco em caixa alta, e apenas a palavra da vantagem vem na cor metálica.
- Um detalhe geométrico metálico pode fechar o rodapé, abaixo do pedestal, sem texto e sem função comercial.
- Esta peça não tem ícone, não tem benefício escrito e não tem pessoa.
- Só existem três cores: o escuro do cenário, o metálico dos textos e o branco dentro da placa. O resto vem dos próprios produtos.
- Com menos itens confirmados, use menos produtos sobre o pedestal e aumente os que ficarem; com um só, ele fica centralizado e o pedestal aparece inteiro em volta. Não repita o mesmo produto para formar o trio nem invente uma variante.`,
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
- Esta peça não tem logo da loja, não tem elemento gráfico digital, não tem moldura e não tem pessoa. O vermelho dos sublinhados é a única cor fora da paleta quente do ambiente.
- O estoque em volta vem das peças realmente confirmadas. Com poucas, a vitrine mostra menos bandejas e mais superfície vazia; com uma só, fica o produto em destaque e o balcão limpo ao redor. Não povoe a vitrine com peças inventadas.`,
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
- Luz suave em todos os painéis e o mesmo tratamento de cor ligando cenários que são diferentes entre si.
- Com menos cenas confirmadas, use menos painéis e aumente os que ficarem. Os painéis podem mostrar o mesmo produto em momentos e enquadramentos diferentes de uso; o que não pode é inventar um produto ou um cenário que as fontes não sustentem.`,
  },
  'REF-0024': {
    title: 'PRODUTO EM CAIXA PRESENTEÁVEL',
    single: `- O que define esta direção: um CLOSE DA CAIXA ABERTA, tão perto que ela é cortada pelas bordas do quadro, com tudo no mesmo tom claro e o produto sendo o único brilho da cena.
- A caixa aparece em três quartos, vista de cima e de lado, com a tampa aberta para trás. Ela ocupa quase todo o quadro e as bordas inferior e laterais cortam a imagem.
- Todo o interior é forrado de tecido texturizado no mesmo tom claro da parte externa: a peça inteira é monocromática, e a única coisa que reluz é o produto.
- O apoio interno é um rolo macio, cilíndrico, atravessando a caixa. As peças se acomodam sobre ele e as partes flexíveis — correntes, tiras, fechos — caem naturalmente pelas suas bordas.
- Duas unidades do produto aparecem sobre o rolo, paralelas, uma acima da outra, ligeiramente diferentes entre si quando essa variação estiver confirmada nas fontes. Se só houver uma unidade confirmada, mostre uma e reequilibre a composição.
- Na parte interna da tampa, ao fundo, a marca da loja impressa em cor metálica, em tipografia serifada e caixa alta espaçada, com um pequeno símbolo acima dela — somente quando essa marca e essa embalagem estiverem confirmadas nas fontes.
- Ao fundo, fora de foco, um tecido acetinado dobrado e um adereço natural pequeno e claro num dos cantos. Nada disso pode competir com a caixa.
- Luz quente e lateral, brilho no acetinado e nas partes metálicas do produto, sombras suaves dentro da caixa.
- Se a caixa real não estiver confirmada, troque-a por um apoio neutro em vez de inventar uma embalagem.
- Esta peça não tem logo separada, não tem selo, não tem ícone e não tem pessoa.`,
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
- Esta peça não tem pessoa, não tem cenário, não tem ícone, não tem benefício escrito e não tem CTA.
- Com menos conjuntos confirmados, distribua menos em volta do selo e aumente cada um, mantendo o selo no centro. Com um só, ele ocupa um lado inteiro e o selo desloca para o lado oposto. Não recolora um conjunto para completar a roda.`,
  },
  'REF-0026': {
    title: 'MODELO EDITORIAL COM OFERTA GIGANTE',
    single: `- O que define esta direção: uma foto de moda ao ar livre com SOL FORTE e arquitetura mediterrânea clara, onde a parede iluminada da própria cena vira o espaço do texto. Não existe painel de cor, não existe divisória e não existem dois retângulos colados.
- O cenário é de pedra e reboco claro: parede lisa, degraus largos, e um vaso de pedra com uma planta de folha estreita num dos cantos. Luz de sol direta, sombras nítidas e desenhadas na parede.
- A pessoa aparece de corpo inteiro no lado oposto ao texto, em pé, de três quartos, olhando para fora do quadro. Uma das mãos no bolso, postura relaxada, sem sorriso posado.
- O conjunto vendido aparece inteiro, do peito aos joelhos, nítido, com os logos e o caimento legíveis. Nada de dobra que esconda corte ou acabamento.
- Todo o texto fica na parede clara, alinhado à esquerda e empilhado nesta ordem: o wordmark da loja em tipografia SERIFADA de caixa mista; um filete curto na cor metálica; uma palavra em caixa alta espaçada; o título em caixa alta SANS CONDENSADA muito pesada; um segundo filete, mais longo que o primeiro; uma expressão curta em caixa alta espaçada; e a oferta.
- A oferta é o maior elemento da peça inteira, em sans pesada e cor metálica, num único tamanho e num único peso. Abaixo dela, uma palavra em caixa alta com espaçamento de letra bem aberto fecha o bloco.
- São três famílias tipográficas ao todo — serifada, condensada pesada e sans pesada — e duas cores gráficas: o escuro do texto e o metálico dos filetes e do número.
- A cor metálica é premium: dourada, terrosa ou bronze. Nada de vermelho de liquidação.
- Só existem esses dois territórios de texto: a identidade no topo e a oferta embaixo. Não existe lista de benefícios, não existe ícone, não existe faixa no rodapé e não existe CTA.
- Esta direção vende pela marca e pelo preço. Se houver benefício confirmado no contexto, ele fica de fora: o espaço é do respiro e do número.
- Acessórios e calçados da pessoa ficam discretos e nunca mais chamativos que a peça vendida.`,
  },
  'REF-0027': {
    title: 'UNBOXING COM OFERTA NA TAMPA',
    single: `- O que define esta direção: uma caixa de envio de papelão vista ESTRITAMENTE DE CIMA, com as quatro abas abertas formando uma cruz, e a oferta impressa na aba maior como se fizesse parte da embalagem.
- A câmera está a prumo, direto acima da caixa. Sem perspectiva, sem inclinação, sem ângulo de três quartos.
- A caixa é de papelão natural, sem impressão externa e sem marca de transportadora. As abas laterais ficam abertas para os lados e a aba de trás, a maior, fica aberta para cima e é onde vive todo o texto.
- O texto parece IMPRESSO no papelão, com a textura do papel aparecendo através dele. Nada de adesivo, cartão colado ou etiqueta.
- Na aba, tudo centralizado e nesta ordem: a marca da loja no topo, uma headline curta em duas linhas, e uma linha por degrau da oferta.
- Todo esse texto é em CAIXA ALTA e sans condensada pesada, em preto. A marca da loja é o único elemento colorido da aba.
- Dentro da caixa, o produto aparece dobrado como chegaria ao cliente, com a face principal para cima, inteiramente reconhecível, com cores, estampas e logos fiéis.
- Papel de seda claro aparece amassado nas bordas internas, contornando o produto sem cobri-lo.
- A caixa se apoia sobre uma bancada de pedra clara com grão visível. Luz difusa de cima, sombra macia projetada ao redor da caixa, e nenhum adereço de cena.
- Não invente embalagem oficial, fita personalizada, cartão, brinde nem marca de terceiros que não estejam confirmados nas fontes.
- Esta peça não tem selo, não tem ícone, não tem CTA e não tem pessoa.`,
  },
  'REF-0028': {
    title: 'DETALHE FUNCIONAL COM DEPOIMENTO',
    single: `- O que define esta direção: a AÇÃO ESTÁ CONGELADA NO MEIO. O objeto que prova o recurso aparece meio dentro e meio fora — entrando no bolso, passando pelo fecho, sendo encaixado — e é esse instante que demonstra a funcionalidade. Produto parado não serve aqui.
- Fundo de estúdio claro e liso, com leve gradiente, sem cenário e sem adereço. Luz ampla e sombra suave.
- Close lateral da região do corpo onde o produto é usado, de perfil, indo da cintura até abaixo dos joelhos. Nada do corpo além disso, e nenhum rosto.
- O recurso que está sendo provado — o bolso, o fecho, a costura, o forro — ocupa o centro do quadro e é a parte mais nítida da imagem. O produto aparece inteiro o suficiente para ser reconhecido.
- A mão aparece em ação real, com a musculatura e a pega naturais de quem está de fato usando, não posando.
- Sobre a foto, blocos brancos com BORDAS IRREGULARES, como pinceladas de tinta aplicadas por cima. Eles têm tamanhos diferentes e ficam perto da parte do produto a que se referem, sem nunca cobrir o recurso que descrevem.
- O bloco maior traz um depoimento real e curto entre aspas, em caixa mista, com o trecho decisivo em peso forte e o resto em peso normal, e o nome de quem falou logo abaixo.
- Dois blocos menores trazem, cada um, um recurso ou benefício confirmado, em caixa alta e peso forte, centralizados dentro da pincelada.
- O wordmark da loja aparece VERTICAL, rotacionado, encostado numa das bordas laterais, em corpo pequeno e caixa alta espaçada.
- Quando houver oferta a comunicar, ela entra dentro de um dos blocos de pincelada, junto do benefício, sem criar faixa nem selo novo.
- Se não houver depoimento real, a peça sai apenas com os blocos de recurso confirmados.
- Não existe cor de acento: a peça é o branco do estúdio, o preto do produto e do texto, e os tons de pele.`,
  },
  'REF-0037': {
    title: 'ESCADA DE DESCONTO COM MODELO',
    single: `- O que define esta direção: uma ESCADA DE DESCONTO onde cada degrau é um cartão, e a QUANTIDADE DE ÍCONES DENTRO DELE CRESCE junto com a oferta — um ícone no primeiro degrau, dois no segundo, três no terceiro. A quantidade é mostrada, não só escrita.
- A foto ocupa o quadro inteiro e o fundo claro e quente dela continua para o lado do texto, sem divisória e sem painel de cor. Uma sombra diagonal suave atravessa a parede.
- A pessoa usando o produto ocupa o lado oposto ao texto, de frente, em pose relaxada e braços ao longo do corpo, enquadrada do pescoço até abaixo do joelho. A cabeça fica fora do quadro.
- A peça vendida aparece inteira e nítida, com o acabamento e os detalhes legíveis, ocupando a maior parte da altura do corpo.
- Do lado do texto, alinhado à esquerda e empilhado: o wordmark da loja no topo; a headline em duas partes que diferem em TRÊS coisas ao mesmo tempo — peso, cor e estilo: a primeira em peso forte e tom escuro, a segunda em itálico, peso leve e tom médio; um filete horizontal fino; e até dois parágrafos curtos de condição em corpo pequeno.
- Abaixo deles, os cartões da escada, empilhados e do mesmo tamanho, com cantos arredondados. Cada cartão traz, da esquerda para a direita: os ícones de contorno fino, uma divisória vertical, e três níveis de texto — a quantidade em corpo pequeno, o valor da vantagem em corpo grande, e a palavra final em corpo médio.
- Os cartões escurecem progressivamente do primeiro ao último. No último, os ícones e todo o texto invertem para claro, e uma fita diagonal curta no canto superior marca o melhor valor.
- A escada é o principal elemento da peça; a headline é secundária.
- Se a oferta tiver um único degrau, use um único cartão, com um ícone só, e dispense a fita.
- Não existe cor de acento: a peça é o bege da parede, o preto do produto e do texto, e os cinzas da escada.`,
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
  'REF-0014': {
    title: 'MODELO HERÓI COM CATÁLOGO INFERIOR',
    collection: `- O que define esta direção: um retrato enorme usando um produto ocupa o alto esquerdo, a oferta ocupa o alto direito e uma faixa de catálogo com quatro produtos distintos atravessa toda a base. O rosto vende o produto herói; a faixa prova a variedade da coleção.
- A fotografia superior é um close frontal ou em três quartos, do topo da cabeça até pouco abaixo do queixo. O rosto aparece completo e corresponde ao público-alvo capturado.
- O produto usado no rosto é a primeira leitura comercial: fica nítido, sem reflexo que esconda formato, lente, armação, cor, haste ou acabamento. Pele, cabelo e roupa permanecem secundários.
- No lado oposto ao rosto, a oferta fica alinhada à esquerda sobre fundo claro, em sans-serif pesada e poucas linhas. A vantagem principal é a maior linha; marca e condição ficam menores.
- Logo abaixo da oferta existe uma área retangular clara e vazia. Preserve esse vazio de propósito: não coloque ali benefício, ícone, selo, CTA, avaliação nem texto de apoio.
- Uma linha horizontal separa o retrato da faixa inferior. Na faixa, quatro módulos iguais mostram quatro produtos elegíveis distintos, um por módulo, frontais ou em três quartos e sobre o mesmo fundo claro.
- O produto no rosto pode ser um quinto item elegível. Se a coleção trouxer menos itens, use menos módulos e deixe-os maiores; não repita, recolora ou invente produto para completar.
- As divisões da faixa são discretas e retas. Não use cartões com sombra, círculos, plintos, embalagens ou cenários individuais.
- Toda a peça usa branco, cinzas suaves, texto escuro e as cores reais dos produtos. A fotografia superior e o catálogo inferior precisam parecer parte da mesma campanha.`,
  },
  'REF-0029': {
    title: 'DUPLA DE PRODUTOS COM OFERTA LATERAL',
    collection: `- O que define esta direção: dois produtos repousam soltos sobre uma única superfície bege e tátil, em ângulos diferentes, deixando um vazio claro no canto inferior direito para a oferta. Não existe grade, caixa ou pedestal.
- O produto principal fica grande no primeiro plano, atravessando a base em diagonal suave. O segundo fica acima e mais ao fundo, menor e quase horizontal, sem tocar nem esconder o primeiro.
- Os dois itens do quadro são reais e elegíveis, e cada um preserva mostrador, fecho, pulseira, material, cor e proporção. Eles vêm da lista factual — dois produtos diferentes ou duas cores confirmadas do mesmo modelo. O que não pode é inventar o segundo recolorindo o primeiro.
- A câmera fica próxima da superfície, com profundidade de campo suficiente para os dois produtos serem reconhecíveis. Sombras de contato macias ancoram cada peça.
- A superfície é clara e quente, levemente irregular, como pedra fosca ou papel mineral. O fundo continua no mesmo material, sem horizonte marcado e sem objetos decorativos.
- O wordmark da loja fica pequeno e centralizado no alto, em cor escura. Ele não disputa com os produtos.
- No vazio inferior direito, uma linha curta de apoio pode ficar acima da oferta. A oferta vem em poucas linhas, alinhada à esquerda, usando a tipografia e as cores capturadas da loja.
- Não copie chamadas de urgência, “última chance” ou “mix and match” da referência. Só entram mensagens e condições presentes no contexto.
- Esta peça não tem pessoa, benefício em lista, selo, cartão, CTA, embalagem nem acessórios.
- Com um único item confirmado, ele fica sozinho, maior, na mesma diagonal, e o bloco de oferta ocupa o espaço que sobra. Não duplique a peça para formar a dupla.`,
  },
  'REF-0032': {
    title: 'PEÇA EM CAIXA COM PLACA GRANDE',
    single: `- O que define esta direção: o produto aparece dentro de uma pequena caixa expositora aberta no primeiro plano, enquanto uma placa impressa muito maior se ergue logo atrás. O produto e a placa formam um único eixo vertical no balcão de uma loja física.
- A caixa fica apoiada sobre o balcão e aberta em direção à câmera. O produto ocupa o centro interno, inteiro, nítido e grande o bastante para ser reconhecido antes de qualquer objeto do ambiente.
- Use embalagem oficial somente quando ela estiver confirmada nas fontes. Caso contrário, a caixa é neutra, sem logo, sem estampa e com interior simples de exposição.
- A placa atrás da caixa é alta e retangular, impressa em papel rígido. Ela traz o wordmark no alto, uma headline curta e a oferta completa em hierarquia forte, tudo alinhado como material real de ponto de venda.
- A placa é maior do que a caixa, mas não encobre o produto. A base da placa desaparece atrás da caixa, criando profundidade real.
- Ao fundo, uma joalheria ou loja premium quente, com madeira, metal e luzes suaves desfocadas. Qualquer mercadoria distante fica irreconhecível; não introduza outro produto da campanha.
- A luz principal recai sobre o produto e a placa. Reflexos em metal e vidro são controlados e não apagam rótulos, pedras, gravações ou acabamento.
- Todo o texto comercial fica na placa. Não acrescente faixa, selo, texto solto, CTA, avaliação, urgência ou benefício fora dela.
- A cena não tem pessoa. A sensação é de fotografia real feita diante de uma vitrine, não de packshot recortado em fundo artificial.`,
  },
  'REF-0033': {
    title: 'CAIXA DE ENVIO EM LOJA FÍSICA',
    collection: `- O que define esta direção: uma caixa de papelão aberta, vista de frente sobre o balcão, funciona como expositor improvisado para a coleção. Uma folha impressa com a oferta está presa na face frontal da própria caixa.
- A caixa é o maior objeto do quadro e fica no centro, com as abas superiores abertas. Ela parece uma caixa real de recebimento de mercadoria, não um expositor de luxo.
- Dentro dela, os produtos elegíveis aparecem organizados em pequenas bases ou almofadas, formando fileiras irregulares e densas. Cada item continua separado e reconhecível.
- A quantidade indicada para esta direção é um alvo visual. Se o contexto trouxer menos itens, use menos e aumente suas bases; jamais duplique, recolora ou invente produto para lotar a caixa.
- Na face da caixa, uma folha branca retangular fica presa de modo simples. Ela concentra todo o texto: wordmark, headline curta, oferta e somente condições confirmadas.
- Caixa e folha são genéricas quando as fontes não trouxerem materiais oficiais. Não invente etiqueta de envio, endereço, código, fita de marca ou embalagem proprietária.
- O ambiente é uma loja moderna, clara e real. Pessoas da equipe podem aparecer atrás do balcão em foco suave, com rostos completos e postura natural, apenas para dar vida ao local.
- O foco e a luz ficam na caixa e nos produtos; equipe, prateleiras e balcão recuam. Nenhuma pessoa segura ou cobre um item.
- Não transforme esta direção em balcão de joalheria organizado nem em grade de catálogo. A caixa de papelão e a folha presa na frente são os dois sinais que a distinguem.`,
  },
  'REF-0034': {
    title: 'BALCÃO DE JOALHERIA COM PLACA',
    collection: `- O que define esta direção: uma placa física alta fica em pé no centro de um balcão de joalheria, e os produtos formam uma moldura baixa ao redor dela. Não existe caixa de envio nem pessoa.
- A placa se apoia num suporte metálico discreto e ocupa o eixo central. Ela é o elemento vertical mais alto; os produtos nunca cobrem o texto principal.
- Dentro da placa, wordmark no alto, headline curta no meio e oferta completa abaixo, em acabamento editorial premium. Todo o texto comercial vive nela.
- Os produtos elegíveis ficam distribuídos sobre bases, almofadas e pequenos suportes reais de joalheria, dos dois lados e à frente da placa. A organização é abundante, mas não caótica.
- Itens maiores ficam mais próximos das laterais; itens menores podem preencher a frente. Cada produto preserva forma, metal, pedra, mostrador, corrente, fecho e cor reais.
- A quantidade é um alvo da composição. Com menos produtos, abra os espaços e aumente as bases; não repita ou invente para formar uma multidão artificial.
- O balcão tem tampo claro ou madeira quente, reflexos suaves e iluminação de vitrine. O fundo traz a loja desfocada em tons quentes, sem outra mercadoria reconhecível.
- Paleta neutra e luxuosa, com dourado ou latão apenas nos suportes e filetes quando coerente com a identidade. Nenhuma cor promocional forte é criada.
- Esta peça não tem pessoa, selo, lista de benefícios, CTA, faixa gráfica, caixa de papelão ou texto fora da placa.`,
  },
  'REF-0036': {
    title: 'DOIS PULSOS LIFESTYLE COM OFERTA',
    collection: `- O que define esta direção: dois antebraços entram por lados opostos e se encontram no centro num gesto de cumplicidade, exibindo um item em cada pulso. Os rostos ficam totalmente fora do quadro.
- Cada pulso sustenta um item da lista factual: dois produtos diferentes, ou duas cores confirmadas do mesmo modelo. Os dois têm importância semelhante, aparecem nítidos e mantêm mostrador, caixa, pulseira, fecho, material e cor reais.
- As mãos formam punhos relaxados que se tocam de leve no centro. Dedos, articulações, escala e direção dos braços são anatomicamente corretos.
- O enquadramento vai somente das mãos até parte dos antebraços. Roupa escura e neutra pode aparecer nos punhos, sem estampa nem marca concorrente.
- O ambiente ao fundo lembra um bar ou lounge noturno sofisticado, com luzes âmbar e azuladas em bokeh. Nenhum copo, garrafa, tatuagem ou acessório decorativo entra em foco.
- A parte superior escura fica livre para o texto. A oferta é centralizada em serifada branca, com linhas curtas e elegantes; uma linha de apoio em caixa alta espaçada pode aparecer em dourado logo abaixo.
- O texto não toca os produtos nem os braços. Não acrescente cartão, selo, faixa, benefício, ícone, preço separado, avaliação ou CTA.
- A luz lateral cria brilho controlado nos dois produtos e separa os braços do fundo. O gesto humano constrói o clima, mas os produtos continuam sendo a primeira leitura.
- Com um único item confirmado, a cena mostra um braço só, e o outro sai do quadro ou aparece sem produto à vista. Não coloque o mesmo produto nos dois pulsos nem invente uma segunda variante.`,
  },
  'REF-0040': {
    title: 'MODELO INTEIRO COM ESCADA DE DESCONTO',
    collection: `- O que define esta direção: um único look de corpo inteiro fica em pé numa lateral, enquanto a outra lateral apresenta uma escada de oferta aberta diretamente sobre o fundo cinza. Não existem cartões atrás dos degraus.
- O estúdio é cinza claro e contínuo, com piso e parede unidos por transição suave. A luz vem ampla de um lado e projeta uma sombra longa e discreta atrás da pessoa.
- A pessoa aparece da cabeça aos pés, de frente ou em leve três quartos, com rosto completo e expressão natural. Casting, idade, gênero e corpo seguem o público capturado.
- O look é a primeira leitura de produto: aparece inteiro, nítido, sem casaco, bolsa ou acessório que cubra as peças. Um único look representa a coleção; não invente outros itens ao redor.
- No lado vazio, o wordmark fica no alto. Abaixo dele, uma headline em duas linhas combina uma linha regular e outra mais pesada, sem virar um bloco maior do que a pessoa.
- A escada fica abaixo da headline, aberta no próprio fundo. Cada degrau forma uma linha horizontal com ícones de sacola à esquerda, quantidade no meio, um filete vertical e a vantagem grande à direita.
- A quantidade de ícones cresce de acordo com cada condição real da oferta. As linhas são separadas por filetes horizontais finos; não existe borda externa nem fundo de cartão.
- Se a oferta tiver menos degraus, mostre menos linhas e preserve o espaço. Não invente percentuais, vantagens ou uma terceira condição para imitar a referência.
- Paleta cinza, preta e branca, com somente uma cor suave da identidade se ela estiver presente na marca. Nada de selo, CTA, benefício, avaliação ou faixa inferior.`,
  },
  'REF-0046': {
    title: 'GRADE SOBREPOSTA COM ESCADA SUPERIOR',
    collection: `- O que define esta direção: seis peças frontais formam duas fileiras sobrepostas sobre fundo branco, e uma tabela de oferta de três colunas fica aberta no alto. Os produtos se tocam; não vivem em módulos separados.
- A fileira de trás traz três peças ligeiramente mais altas. A fileira da frente traz outras três, deslocadas para cobrir apenas pequenas bordas das de trás.
- Cada produto aparece de frente, como recorte de catálogo, com silhueta completa e detalhes nítidos. Cabides, manequins, corpos e cenários não aparecem.
- A sobreposição cria profundidade, mas nenhuma peça perde gola, cintura, fechamento, estampa ou parte que a identifique. Sombras curtas e suaves separam uma camada da outra.
- Se houver menos de seis itens elegíveis, use menos peças e aumente os intervalos; não repita, recolora ou invente produto. Se houver mais, escolha somente os necessários para esta composição.
- Acima dos produtos, a oferta ocupa uma tabela horizontal de colunas lado a lado. Cada coluna traz a quantidade numa faixa branca superior e a vantagem numa faixa preta inferior.
- Divisórias verticais finas separam as colunas. Com menos degraus, use menos colunas e centralize a tabela; não empilhe condições nem crie cartões individuais.
- No alto, centralizado e com ar em volta, o wordmark da loja abre a peça — símbolo e nome juntos, no tamanho em que a marca se apresenta. Uma linha curta de assinatura pode acompanhá-lo, menor, logo abaixo.
- Não existe headline: depois do wordmark, a tabela de oferta é o único outro texto da peça.
- Esta peça usa branco, preto e as cores reais dos produtos. Não há pessoa, benefício, selo, ícone, CTA, fundo colorido ou grade de células.`,
  },
  'REF-0047': {
    title: 'FLAT LAY NEUTRO COM OFERTA NO VAZIO',
    collection: `- O que define esta direção: cinco produtos vistos de cima ficam espalhados em torno de um vazio no alto esquerdo, onde vivem marca e oferta. Não existe grade, círculo, cartão ou alinhamento rígido.
- O fundo inteiro é uma única superfície bege clara e fosca, com pequenas variações naturais de textura. Não há horizonte nem cenário construído.
- Os produtos ficam separados, cada um em uma direção levemente diferente. Alguns entram pelas bordas e outros ficam inteiros, criando um ritmo solto de editorial impresso.
- Cada item mantém escala coerente com seu tamanho real. Peças maiores ocupam mais área; itens menores não são inflados para preencher o mesmo espaço.
- Sombras suaves caem na mesma direção e deixam claro que tudo foi fotografado junto. Nada flutua nem recebe base individual.
- Se o contexto trouxer menos itens, mantenha a assimetria com menos objetos e mais respiro. Não repita, recolora ou acrescente acessórios fora da lista de elegíveis.
- No vazio superior esquerdo, wordmark pequeno, headline curta e degraus da oferta aparecem alinhados à esquerda. Cada degrau é uma linha de texto simples, sem fundo e sem ícone.
- A hierarquia tipográfica é delicada: marca e apoio leves, vantagem em peso maior. O bloco não invade os produtos nem cresce até o centro.
- Paleta quente e neutra, sem cor promocional estridente. Esta peça não tem pessoa, lista de benefícios, selo, CTA, moldura ou divisórias.`,
  },
  'REF-0048': {
    title: 'FLAT LAY DENSO COM ESCADA LATERAL',
    collection: `- O que define esta direção: uma coleção densa ocupa a maior parte direita de um flat lay bege, enquanto uma headline muito alta e condensada e uma escada de oferta ocupam a coluna esquerda. O contraste entre massa de produtos e massa tipográfica cria a peça.
- O fundo é uma única superfície bege clara, fotografada de cima. Todos os produtos compartilham a mesma luz, sombra e direção de câmera.
- Os itens se distribuem em diagonal, próximos entre si, com pequenas sobreposições naturais. Cada silhueta continua legível; a composição parece abundante, não amontoada.
- Peças de roupa, calçados e acessórios só podem coexistir quando todos aparecem na lista de elegíveis. Se a campanha tiver uma única categoria, use somente essa categoria e deixe os itens maiores.
- A quantidade é alvo de densidade, não obrigação. Com menos itens, aumente-os e abra o conjunto; nunca invente bolsa, boné, joia ou outra categoria para preencher.
- A headline na esquerda usa sans-serif muito condensada, caixa alta e várias linhas curtas. Ela é o maior texto da peça, mas não ultrapassa visualmente o conjunto de produtos.
- Abaixo dela, a escada fica aberta no fundo: ícones de sacola crescentes, quantidade, filete vertical e vantagem grande. Filetes horizontais finos separam os degraus.
- A quantidade de linhas acompanha exatamente a oferta recebida. Sem cartões, cápsulas, selo ou faixa colorida.
- O wordmark pode aparecer pequeno no topo da coluna de texto. Não há pessoa, benefício em lista, avaliação, CTA ou objetos decorativos.`,
  },
  'REF-0050': {
    title: 'GRADE DE CINCO LOOKS COM OFERTA INFERIOR',
    collection: `- O que define esta direção: cinco fotografias de looks formam uma grade assimétrica acima de uma faixa larga de oferta. Um módulo alto no centro atravessa duas fileiras; quatro módulos menores ocupam os cantos.
- Respiros brancos retos separam as cinco fotos. A grade não tem moldura externa pesada e nenhuma imagem invade a outra.
- O módulo central é o mais alto e funciona como âncora. Ele mostra uma pessoa do pescoço até abaixo do joelho, com o produto inteiro no corpo.
- Os quatro cantos alternam enquadramentos mais fechados: tronco, cintura, pernas ou detalhe de caimento. O rosto fica fora de todos os quadros; o corpo serve como suporte.
- Cada módulo mostra um look ou produto elegível distinto. Se houver menos de cinco, use menos módulos e amplie os restantes; não repita o mesmo look em cinco poses.
- Todas as fotos compartilham fundo de estúdio claro, luz suave e tratamento editorial coerente. O produto recebe mais contraste do que pele, cabelo ou peças neutras de apoio.
- A faixa inferior atravessa toda a largura com uma cor sólida retirada da identidade. Nela, uma linha pequena introduz a condição, a headline em caixa alta muito pesada domina o centro e os degraus aparecem abaixo em linhas compactas.
- Se a oferta tiver um único degrau, a faixa mostra uma única condição completa. Não invente uma escada para preencher o rodapé.
- Não existe wordmark solto sobre as fotos, selo, ícone, CTA, benefício ou produto sem pessoa. A grade de cinco fotos e a faixa inferior são os únicos blocos.`,
  },
  'REF-0051': {
    title: 'FLAT LAY EDITORIAL COM ESCADA CENTRAL',
    collection: `- O que define esta direção: seis produtos em flat lay são empurrados para as bordas e parcialmente cortados pelo quadro, deixando uma coluna branca e vazia no centro para marca, headline e oferta.
- O fundo é branco puro e contínuo. Não existe mesa, textura, cenário, módulo ou cartão.
- Dois produtos entram pelo alto, dois pelas laterais e dois pela base, em ângulos variados. O corte sugere abundância, mas cada item preserva a parte que permite reconhecê-lo.
- Os produtos nunca atravessam a coluna central. Sombras de contato muito suaves os separam do fundo, todas na mesma direção.
- Cada item é distinto e elegível. Com menos itens, use menos entradas pelas bordas e deixe os recortes maiores; não repita nem recolora.
- No centro, o wordmark aparece em serifada elegante, acompanhado por uma linha pequena e espaçada. A headline vem abaixo em sans-serif de caixa alta e espaçamento amplo.
- Um filete horizontal fino separa a headline da tabela vertical de oferta. Cada linha da tabela traz quantidade à esquerda e vantagem à direita, divididas por um filete vertical.
- As linhas da oferta ficam abertas no fundo branco, separadas por filetes horizontais; não têm caixas, preenchimentos nem ícones.
- A quantidade de linhas segue os degraus reais. Esta peça não tem pessoa, benefício, selo, CTA, cor de acento ou acessórios decorativos.`,
  },
  'REF-0052': {
    title: 'MODELO SENTADO COM ESCADA LATERAL',
    collection: `- O que define esta direção: um único look aparece numa pessoa sentada sobre um bloco na lateral direita, enquanto uma headline pesada e uma tabela compacta de oferta ocupam a lateral esquerda. A pose sentada e a tabela curta distinguem esta direção da modelo em pé.
- O estúdio é off-white ou cinza muito claro, com parede e base contínuas. O bloco tem o mesmo tom do fundo e aparece somente pela sombra.
- A pessoa fica sentada de lado, com o tronco voltado para a câmera e uma perna avançando em diagonal sobre a base. O corpo aparece da cabeça até os pés, com rosto completo e expressão natural.
- O look é inteiro e nítido. Roupa, calçado e acessórios só aparecem quando pertencem ao produto ou são neutros e necessários ao uso; nada compete com a peça anunciada.
- Um único look representa a coleção. Não espalhe produtos, não crie miniaturas e não invente outras peças para preencher o quadro.
- No lado esquerdo, o wordmark serifado no alto, acompanhado de uma linha curta de assinatura em corpo bem menor e letras espaçadas. Não existe headline: depois dessas duas linhas vem a oferta.
- Um filete fino separa o wordmark da oferta. Cada degrau ocupa uma linha compacta com ícones de sacola, quantidade, filete vertical e vantagem grande; tudo fica aberto no próprio fundo.
- A quantidade de ícones cresce conforme a condição real. Com menos degraus, mostre menos linhas e preserve o vazio; não use cartões nem fita de melhor oferta.
- Paleta clara e neutra, texto escuro e somente cores reais do look. Não há selo, CTA, benefício, avaliação ou faixa inferior.`,
  },
  'REF-0063': {
    title: 'TRÊS PRODUTOS FRONTAIS COM OFERTA INFERIOR',
    collection: `- O que define esta direção: três produtos frontais e recortados ocupam uma única fileira, quase encostados, entre um título tipográfico enorme no alto e uma oferta enorme na base. Não existe cenário, módulo ou pessoa.
- Fundo branco ou cinza quase branco, contínuo e sem textura. Sombras de contato suaves ancoram os produtos na mesma linha.
- Os três itens ficam na mesma escala e vistos exatamente de frente. O item central pode avançar levemente, mas nenhum vira protagonista absoluto.
- Cada peça do trio é real e elegível, com formato, recortes, estampas, textura, logo, costura e cor preservados. As três vêm da lista factual — produtos diferentes ou cores confirmadas do mesmo modelo. O que não pode é inventar uma peça recolorindo outra para fechar o trio.
- Se houver apenas dois itens elegíveis, use dois maiores e centralizados. A fileira nunca recebe produto de outra categoria para preencher o espaço.
- No alto, o nome curto da função ou categoria aparece em sans-serif preta, caixa alta e peso extremo, ocupando a maior largura possível. Logo abaixo, o nome comercial vem em sans-serif muito leve e caixa mista.
- A tipografia do topo forma um bloco compacto e centralizado, sem caixa, filete ou logotipo adicional. O título não toca nos produtos.
- Na base, a oferta completa aparece em uma única linha ou em duas linhas muito compactas, em caixa alta pesada e vermelho vivo. Ela é o único elemento colorido fora dos produtos.
- Esta peça não tem benefício em lista, selo, CTA, avaliação, embalagem, faixa de fundo ou objetos decorativos.`,
  },
  'REF-0067': {
    title: 'PILHA DE UNIDADES COM SELO CIRCULAR',
    single: `- O que define esta direção: várias unidades do mesmo produto formam uma pilha alta sobre uma mesa real, enquanto uma headline funcional ocupa o alto esquerdo e a oferta fica dentro de um círculo grande na base oposta.
- A cena acontece em ambiente doméstico acolhedor, com sofá, almofadas e um vaso desfocados. A pilha fica sobre mesa de pedra clara no primeiro plano.
- Cada unidade dobrada ou empilhada preserva uma parte imediatamente reconhecível do produto — cós, gola, rótulo, formato, embalagem ou outro sinal real. A pilha não pode parecer tecido genérico.
- Repita somente o produto anunciado. Cores diferentes entram apenas quando forem variantes confirmadas; caso contrário, todas as unidades mantêm a mesma variante.
- Produtos que não dobram são empilhados ou escalonados de forma fisicamente plausível, sem deformar o formato e sem inventar caixa ou embalagem.
- A headline ocupa o alto esquerdo em sans-serif branca, caixa alta, muito pesada e com linhas apertadas. Uma sombra deslocada em laranja cria o efeito gráfico da referência sem virar contorno grosso.
- A frase deve comunicar um benefício funcional confirmado ou o nome material do produto. Não copie promessas de fibra, conforto ou clima quando elas não vierem do contexto.
- O selo circular laranja fica na base esquerda, parcialmente sobre a mesa, com a oferta centralizada em branco. A condição principal usa peso maior; apoio e limite só entram quando confirmados.
- A pilha continua maior do que o selo e do que o conjunto de texto. Não há pessoa, lista de benefícios, CTA, avaliação, faixa ou produto solto adicional.`,
  },
  'REF-0068': {
    title: 'PRODUTO ESCURO COM FAIXA INCLINADA',
    single: `- O que define esta direção: um produto único, isolado e muito grande flutua no centro de um estúdio preto; uma headline vermelha monumental ocupa o alto e a oferta atravessa a base numa faixa amarela inclinada.
- Fundo preto profundo com halo cinza suave atrás do produto e vinheta escura nos cantos. Uma sombra oval abaixo cria a sensação de suspensão sem parecer recorte mal colado.
- O produto aparece frontal ou em três quartos, inteiro, nítido e com a parte mais reconhecível voltada para a câmera. Materiais escuros recebem luz de recorte para não desaparecer no fundo.
- No alto, uma frase factual curta em sans-serif extremamente condensada, caixa alta e vermelho vivo ocupa quase toda a largura. Ela é o maior texto da peça.
- Logo abaixo, uma linha curta em sans-serif branca e pesada funciona como apoio. Se não houver apoio factual, omita a linha e deixe mais ar sobre o produto.
- A oferta completa entra numa faixa retangular amarela, levemente inclinada, sobre a parte inferior do produto sem cobrir sua característica principal. Texto preto, condensado, pesado e em caixa alta.
- A faixa é um único elemento. Não acrescente selo, cartão, segunda faixa, preço separado ou ícone.
- Qualquer frase de urgência, estoque ou prazo no rodapé só pode aparecer se estiver confirmada no contexto. Sem essa fonte, a área inferior fica apenas com sombra e fundo preto.
- A peça usa preto, vermelho, amarelo, branco e as cores reais do produto. Não há pessoa, cenário, benefício em lista, avaliação ou CTA.`,
  },
  'REF-0069': {
    title: 'PROVA DOCUMENTAL COM FAIXA DE OFERTA',
    single: `- O que define esta direção: uma pessoa encara a câmera e segura dois resultados documentais lado a lado; “antes” e “depois” ficam sobre cada documento, uma seta liga os valores e o produto aparece dentro de um círculo grande na faixa inferior.
- A cena é doméstica, quente e real, com fundo desfocado. A pessoa ocupa o centro, aparece do peito para cima e mantém rosto completo e expressão natural.
- Cada mão segura uma evidência real fornecida pelo contexto. Os dois documentos têm mesma escala, orientação e altura, com os valores ou medidas confirmados claramente destacados.
- O lado do antes recebe etiqueta retangular vermelha com texto branco; o lado do depois recebe etiqueta verde. Uma seta vermelha larga curva do primeiro resultado para o segundo.
- Nunca invente conta, exame, captura, valor, medida, logotipo de empresa ou documento oficial. Use somente a forma de evidência realmente informada e reproduza os dados recebidos.
- O rodapé é uma faixa vermelha sólida. À esquerda, uma mensagem curta explica o resultado e a oferta usando somente fatos confirmados, com palavras-chave em amarelo ou verde para marcar a mudança.
- À direita, um círculo branco grande invade a fotografia e a faixa. Dentro dele, o produto aparece inteiro, frontal ou em três quartos, grande o bastante para ser reconhecido de imediato.
- O círculo não vira foto de detalhe nem ícone. Ele é o único packshot do produto e recebe luz de catálogo limpa.
- Esta peça não tem benefício adicional, depoimento, avaliação, CTA, urgência ou selo. Sem dois resultados comparáveis confirmados, não gere esta direção.`,
  },
  'REF-0072': {
    title: 'DEPOIMENTO COM DUAS FOTOS DO CLIENTE',
    single: `- O que define esta direção: um cartão grande de prova social traz duas fotos lado a lado da mesma cliente, um depoimento, avatar, nome e estrelas; o produto aparece recortado junto de uma cápsula de headline acima do cartão.
- Fundo externo branco e limpo. O cartão usa uma cor escura da identidade, cantos muito arredondados e sombra suave, ocupando quase todo o quadro abaixo do cabeçalho.
- No topo, um packshot do produto entra pela esquerda e se sobrepõe parcialmente a uma cápsula horizontal da mesma cor do cartão. O produto precisa ficar inteiro e reconhecível, nunca reduzido a um ícone.
- A cápsula recebe uma frase curta em sans-serif branca e pesada, alinhada à esquerda depois do produto. Ela resume a experiência sem prometer benefício ausente do contexto.
- Dentro do cartão, duas fotografias retangulares da mesma pessoa ficam lado a lado e com a mesma altura. Elas podem mostrar dois momentos ou situações de uso diferentes, com aparência espontânea de foto de cliente.
- As duas fotos mantêm identidade, idade, gênero e características da mesma pessoa. Quando não houver antes e depois factual, não simule transformação: mostre apenas dois momentos de uso.
- Abaixo das fotos, um depoimento publicitário curto ocupa poucas linhas centralizadas em branco. Ele pode ser criado para a peça, mas só menciona características e benefícios confirmados.
- Na base, avatar circular, nome plausível e cinco estrelas amarelas formam uma assinatura compacta. Esses elementos são parte da linguagem publicitária da direção e não exigem avaliação real anexada.
- Não inclua data, selo de compra verificada, número de clientes, resultado numérico, oferta ou CTA. Produto, cápsula e cartão formam a composição completa.`,
  },
  'REF-0076': {
    title: 'COMPARATIVO FUNCIONAL EM DUAS COLUNAS',
    single: `- O que define esta direção: o quadro é dividido verticalmente em duas colunas iguais — produto anunciado sobre fundo claro à esquerda, solução antiga sobre fundo escuro à direita — com imagens no alto e linhas comparativas alinhadas na base.
- A coluna clara mostra o produto inteiro e, ao lado dele, somente componentes reais que pertençam ao conjunto. Tudo fica dentro de uma área clara de cantos suaves.
- A coluna escura mostra a solução antiga ou alternativa realmente identificada no contexto, em ângulo semelhante e na mesma escala. Não use marca concorrente nem deixe o objeto grotesco além do que a evidência permite.
- Um título curto no alto identifica a solução antiga. Quando houver nome factual para o produto anunciado, uma identificação equivalente pode aparecer no lado claro.
- A metade inferior traz pares de linhas alinhadas. À esquerda, cada benefício confirmado começa com um círculo escuro e marca de acerto branca; à direita, o problema correspondente começa com círculo vermelho e marca de erro branca.
- Cada par compara o mesmo critério. Não coloque cinco benefícios de um lado e problemas sem relação do outro.
- Use somente diferenças, componentes e efeitos informados no contexto. Não invente percentuais, bactérias, riscos médicos, materiais, tecnologia ou desempenho para completar as linhas.
- Se houver menos comparações, use menos linhas e aumente o respiro. Não force cinco tópicos.
- Esta peça não tem pessoa, oferta, depoimento, avaliação, CTA, selo ou cenário. Sem alternativa e diferenças factuais, não gere esta direção.`,
  },
  'REF-0078': {
    title: 'DEPOIMENTO VISUAL COM RELATO LONGO',
    single: `- O que define esta direção: duas fotos grandes da mesma cliente ocupam o alto de um cartão branco, e um relato longo ocupa a parte inferior. O produto substitui o pequeno símbolo central e fica claramente reconhecível na divisão entre foto e texto.
- O cartão tem cantos arredondados, borda branca e sombra muito suave sobre fundo cinza claro. Uma linha vertical fina separa as duas fotos e uma linha horizontal separa fotos e relato.
- As fotografias são closes semelhantes da mesma pessoa, com luz e enquadramento comparáveis. A identidade permanece consistente nos dois lados.
- Quando houver resultado visual factual, as fotos podem mostrar dois momentos desse resultado. Sem resultado confirmado, mostre duas situações de uso ou dois ângulos do mesmo cliente, sem insinuar transformação.
- Pequenas etiquetas de tempo podem aparecer nos cantos inferiores das fotos somente quando o período estiver confirmado. Sem prazo factual, use rótulos neutros ou omita as etiquetas.
- No centro da divisão, uma medalha circular clara recebe um recorte do produto, não um ícone abstrato. O produto ultrapassa levemente a medalha e mantém formato, rótulo e cor legíveis.
- Abaixo, cinco estrelas em dourado, um título serifado em caixa alta, um filete curto, o depoimento em sans-serif e uma assinatura itálica formam uma coluna central.
- O depoimento pode ser criado como texto publicitário, mas só usa benefícios e experiências compatíveis com o contexto. Não invente resultado médico, número, prazo ou garantia.
- Esta peça não mostra oferta, CTA, selo de verificação, preço nem logo concorrente.`,
  },
  'REF-0081': {
    title: 'CLOSE COMPARATIVO E PRODUTO EM CÍRCULO',
    single: `- O que define esta direção: dois closes extremos do mesmo detalhe humano ocupam as metades superior e inferior, e um círculo grande com o produto se sobrepõe à divisão no lado esquerdo. A imagem vende um efeito visual específico.
- Os dois closes usam o mesmo ângulo, escala, iluminação e pessoa para permitir comparação. O enquadramento mostra apenas a região necessária; não transforma o rosto inteiro em personagem.
- A metade superior apresenta a condição inicial confirmada; a inferior apresenta o efeito confirmado após o uso. Não exagere textura, cor, densidade, tamanho ou perfeição além do que o contexto permite.
- Uma faixa horizontal clara atravessa a divisão e segue até a borda direita. Nela, uma frase curta em sans-serif pesada e vermelha descreve o benefício ou a facilidade de uso.
- No lado esquerdo, um círculo com contorno vermelho invade as duas imagens. Dentro dele, o produto aparece inteiro, acompanhado somente de peças que realmente pertençam ao conjunto.
- O produto precisa ser reconhecível antes que o observador leia a frase: embalagem, formato, aplicador, cor, logo e componentes confirmados ficam legíveis.
- Uma seta vermelha desenhada à mão sobe da parte inferior para o círculo, ligando o detalhe humano ao produto sem apontar para outra região.
- Não acrescente rótulos de antes/depois, prazo, número, promessa médica, avaliação, oferta ou CTA quando esses elementos não estiverem no contexto.
- Sem efeito visual factual e comparável, não gere esta direção.`,
  },
  'REF-0084': {
    title: 'PRODUTO ISOLADO COM PROMESSA NUMÉRICA',
    single: `- O que define esta direção: um único produto monumental ocupa o centro de um fundo branco quase vazio, entre um hook tipográfico no alto e uma promessa numérica isolada na base.
- O fundo é branco ou cinza muito claro, com vinheta suave e nenhuma linha de horizonte. Não há cenário, pedestal ou objeto secundário.
- O produto aparece inteiro em três quartos, grande, nítido e apoiado por sombra de contato longa e muito suave. Face principal, rótulo, controles e detalhes reais ficam voltados para a câmera.
- No alto, o hook usa até três linhas centralizadas. A primeira é menor e cinza; a segunda e a terceira usam caixa alta espaçada em preto, com a palavra final em peso muito mais forte.
- O hook explica a ação ou consequência do produto usando somente informações factuais. Não use urgência, medo ou afirmação social não confirmada.
- Na base, o número confirmado aparece junto da unidade e do prazo em sans-serif fina e espaçada. O número e a palavra-chave recebem verde; o restante permanece cinza escuro.
- Preserve exatamente valor, unidade e período. Não arredonde, traduza para outra medida, transforme média em garantia nem crie um prazo mais forte.
- O produto é maior do que os dois blocos de texto juntos e continua sendo a primeira leitura visual.
- Esta peça não tem pessoa, oferta comercial, selo, benefício adicional, CTA, avaliação ou logo solto. Sem número e prazo confirmados, não gere esta direção.`,
  },
  'REF-0085': {
    title: 'SPLIT DE RESULTADO COM PRODUTO EM CÍRCULO',
    single: `- O que define esta direção: um antes e depois do mesmo detalhe humano é dividido horizontalmente, enquanto o produto aparece grande dentro de um círculo vermelho sobre a divisão, acompanhado por duas setas curvas.
- A imagem superior mostra a condição inicial e a inferior mostra o resultado confirmado. Enquadramento, escala, pessoa e luz permanecem comparáveis.
- O corte é extremamente fechado no detalhe relevante. O restante do rosto ou corpo não vira personagem e não desvia a atenção do resultado.
- Uma linha branca fina marca a divisão horizontal. Sobre ela, no lado esquerdo, uma cápsula vermelha de cantos arredondados recebe uma frase factual curta em branco.
- No lado direito, o círculo vermelho invade as duas metades. Dentro dele, o produto e somente seus componentes reais aparecem em packshot claro, inteiros e legíveis.
- Uma seta vermelha curva vem da imagem superior até o círculo e outra sai da região inferior em direção a ele, criando uma ligação visual contínua entre condição, produto e resultado.
- Se houver prazo confirmado, ele pode ocupar a cápsula. Sem prazo, use um benefício curto e factual; jamais copie “30 segundos” ou qualquer número da referência.
- Não suavize, clareie, emagreça, aumente ou aperfeiçoe o resultado além da evidência disponível.
- Esta peça não tem oferta, depoimento, avaliação, CTA, selo ou lista de benefícios. Sem antes e depois visual confirmado, não gere.`,
  },
  'REF-0086': {
    title: 'PRODUTO INSTALADO COM HEADLINE CENTRAL',
    single: `- O que define esta direção: o produto aparece instalado e funcionando no centro de um ambiente real quase vazio; uma frase curta fica acima e um benefício grande fica abaixo. Não é packshot recortado.
- Escolha o ambiente correto para a categoria — parede, bancada, piso, móvel, corpo de uso ou outra superfície factual. A instalação, encaixe, apoio ou forma de uso precisa ser fisicamente plausível.
- O produto ocupa o centro, frontal ou em leve três quartos, com os elementos essenciais visíveis. Nenhuma mão ou objeto cobre rótulo, controle, forma ou acabamento.
- O ambiente usa tons muito claros e textura discreta. Luz lateral suave cria sombra real e, somente quando o produto possui luz confirmada, um brilho coerente ao redor.
- No alto, uma primeira linha curta em sans-serif leve introduz a ação; abaixo dela, uma frase em caixa alta destaca o benefício principal com a última palavra em peso forte.
- Na base, uma linha grande e espaçada apresenta um benefício factual. Se houver dado numérico confirmado, ele pode abrir a frase em cor de destaque; sem número, use somente texto.
- O texto segue a tipografia e o idioma capturados, permanece centralizado e não invade o produto.
- Não copie tomada, parede, luz verde ou promessa de economia quando eles não pertencerem ao produto real. O contexto de uso muda; a estrutura vertical permanece.
- Esta peça não tem pessoa como personagem, oferta, selo, CTA, avaliação, lista de benefícios ou objetos decorativos.`,
  },
  'REF-0097': {
    title: 'PRODUTO EM CLOSE SOBRE SUPERFÍCIE PREMIUM',
    single: `- O que define esta direção: uma fotografia silenciosa em close baixo, sem uma única palavra, em que o produto inclinado ocupa quase todo o quadro sobre uma superfície mineral polida.
- A câmera fica próxima da altura da superfície. O produto atravessa o centro em diagonal suave, com a face principal voltada para a câmera e a forma completa ainda legível.
- Quando o produto tiver alça, pulseira ou partes flexíveis, elas se abrem naturalmente para os lados e ajudam a preencher a base. Não invente componente para criar essa forma.
- Mostrador, rótulo, textura, costura, metal, botões, fechos e cores reais recebem nitidez máxima. Reflexos são controlados para não apagar detalhes.
- A superfície é clara, de pedra polida, com veios discretos e reflexo muito suave. Uma sombra de contato firme ancora o produto e impede aparência de recorte flutuante.
- O fundo é neutro, claro e profundamente desfocado, com apenas manchas de luz e uma sugestão de verde ou arquitetura distante. Nenhum objeto é reconhecível.
- A luz lateral macia desenha volume e brilho premium sem recolorir o produto. Profundidade de campo curta mantém a face principal nítida e dissolve o fundo.
- Não inclua texto, logo da loja, oferta, selo, CTA, avaliação, pessoa, embalagem, pedestal ou decoração.`,
  },
  'REF-0126': {
    title: 'CONJUNTO CLARO EM FLAT LAY',
    single: `- O que define esta direção: todos os componentes reais de um único produto ou conjunto aparecem em flat lay branco sobre branco, levemente sobrepostos e sem qualquer texto.
- A câmera fica exatamente acima. Fundo branco contínuo e fosco, sem horizonte, textura decorativa ou objeto de cena.
- A peça principal ocupa o alto e o centro, aberta e vista de frente. Os demais componentes ficam em diagonal na base, sobrepondo apenas uma pequena parte da peça principal.
- Mostre somente o que pertence à unidade comercial real. Produto de uma peça aparece sozinho e maior; conjunto de duas ou mais peças mostra cada componente uma vez.
- Não invente shorts, camisa, cinto, embalagem, acessório ou segunda unidade para reproduzir a quantidade da referência.
- Branco, off-white e materiais claros precisam se separar do fundo por textura real, costura, relevo e sombra suave; não escureça nem contorne artificialmente o produto.
- Logos, bordados, botões, cós, cordões, gola, punhos e acabamentos reais permanecem na posição e cor corretas.
- A luz é ampla e difusa, com sombras cinza muito suaves projetadas para o mesmo lado. Tudo parece fotografado junto.
- Não inclua pessoa, cabide, manequim, texto, oferta, logo da loja, selo, CTA, avaliação ou decoração.`,
  },
  'REF-0140': {
    title: 'PRODUTO NO CORPO EM AMBIENTE EXTERNO',
    single: `- O que define esta direção: uma fotografia silenciosa em ambiente externo mostra a peça vestida em close, com o corpo cortado abaixo do rosto e o produto ocupando praticamente todo o quadro.
- A pessoa aparece de frente ou em leve três quartos, enquadrada do maxilar até o quadril. Olhos e identidade facial ficam fora do quadro; o corpo serve somente para mostrar caimento e uso.
- Casting, gênero, faixa etária, tom de pele e biotipo seguem o público capturado. Mãos podem entrar nos bolsos ou descansar ao lado do corpo sem cobrir o produto.
- A peça anunciada fica inteira, central, nítida e mais contrastada do que pele, calça e ambiente. Preserve gola, mangas, botões, logo, estampa, textura, corte e acabamento reais.
- As roupas de apoio são lisas, neutras e claramente secundárias. Retire relógio, joia, bolsa, óculos ou qualquer acessório que possa parecer o produto anunciado.
- O fundo é uma rua, fachada ou arquitetura externa sofisticada, com tons neutros e profundidade de campo muito curta. Nenhuma placa, carro ou pessoa ao fundo fica reconhecível.
- Luz natural suave modela o tecido e o corpo sem sombras duras. O produto não recebe brilho plástico nem mudança de cor.
- Não inclua texto, oferta, logo da loja, selo, CTA, avaliação, benefício, borda ou efeito gráfico.`,
  },
  'REF-0141': {
    title: 'OFERTA DIRETA SOBRE FUNDO BRANCO',
    single: `- O que define esta direção: o quadro fica quase vazio e se divide em duas leituras muito claras — comunicação centralizada na parte superior e um único packshot monumental na parte inferior. Não é cena, não é catálogo e não é composição com cartões.
- Fundo branco puro e contínuo, sem textura, horizonte, pedestal, objetos, degradê colorido ou recorte de ambiente.
- No alto, centralizados e com bastante ar: o wordmark real da loja; abaixo dele, a oferta completa em sans-serif muito pesada e caixa alta; depois, o nome curto do produto em sans-serif leve e caixa mista.
- A oferta é o primeiro texto lido. Ela ocupa uma ou duas linhas conforme o conteúdo real, mantendo todas as condições juntas. O nome do produto é bem menor e nunca compete com ela.
- Na parte inferior, a unidade comercial real do produto aparece isolada, em vista de três quartos, com a face mais reconhecível voltada para a câmera.
- Quando o produto for naturalmente vendido em par, as duas peças aparecem: uma maior à frente e outra atrás, deslocada para o lado, ambas na mesma variante e voltadas para a mesma direção. Quando for uma unidade avulsa, mostre apenas uma e amplie-a; não duplique para preencher.
- O produto é nítido de ponta a ponta, preserva materiais, costuras, estampas, rótulos e proporções, e recebe somente uma sombra de contato cinza muito suave.
- Toda a peça usa apenas branco, preto e as cores reais do produto. Não existe cor de acento criada para a oferta.
- Esta direção não tem pessoa, cenário, cartão, borda, selo, ícone, lista de benefícios, preço separado nem CTA.`,
  },
  'REF-0142': {
    title: 'LIFESTYLE COM PACKSHOT EM PRIMEIRO PLANO',
    single: `- O que define esta direção: o MESMO PRODUTO aparece em duas escalas e com duas funções — sendo usado por uma pessoa no fundo e como packshot grande no primeiro plano. O primeiro plano vende o produto; a pessoa prova o contexto de uso.
- A cena é externa, clara e sofisticada, construída com pedra ou arquitetura em tons neutros, luz natural de dia e profundidade real. O ambiente pode mudar para continuar coerente com a categoria, mas mantém superfícies claras e uma área vertical limpa para a comunicação.
- A pessoa ocupa uma lateral e aparece em pose natural, sentada ou apoiada no ambiente, com rosto inteiro, expressão tranquila e contexto de vida reconhecível. Ela corresponde exatamente ao público registrado.
- O produto em uso permanece visível e identificável na pessoa. Nenhuma roupa, acessório ou objeto secundário recebe mais contraste do que ele.
- No primeiro plano, o mesmo produto e a mesma variante reaparecem muito maiores, apoiados sobre uma superfície real do ambiente e voltados em três quartos para a câmera. Esse packshot é a primeira coisa que o olho reconhece como produto anunciado.
- A unidade comercial manda na quantidade: par natural aparece completo; item avulso aparece uma vez. A repetição entre uso e packshot não cria kit nem sugere duas unidades na oferta.
- A comunicação ocupa a área clara da própria arquitetura, sem cartão sobreposto: wordmark no alto; nome curto do produto em corpo médio; um filete horizontal fino; e a oferta abaixo.
- A oferta usa sans-serif pesada em caixa alta e três níveis: introdução menor, vantagem muito maior e condição final forte. Se a oferta não tiver número grande, destaque a vantagem principal por peso e escala, sem inventar percentual.
- A paleta nasce da locação e do produto. Não acrescente cor promocional, selo ou faixa.
- Esta direção não tem lista de benefícios, ícones, avaliação, CTA, moldura nem texto sobre o corpo da pessoa.`,
  },
  'REF-0143': {
    title: 'MOSAICO DE USO E DETALHES',
    single: `- O que define esta direção: uma fotografia alta de uso ocupa uma lateral inteira, enquanto a outra lateral funciona como uma sequência editorial de oferta, packshot, duas vistas menores e um macro de acabamento. Cada bloco cumpre uma função diferente; não são cinco anúncios repetidos.
- Os dois lados têm larguras próximas. A foto de uso sangra no topo, na lateral e na base. Do outro lado, os módulos se separam por respiros brancos finos e regulares.
- Na fotografia alta, uma pessoa aparece em contexto real, sentada ou apoiada, com rosto inteiro e o produto corretamente em uso. O corpo cabe inteiro o suficiente para que o uso seja entendido, e o produto recebe mais nitidez e contraste do que o restante do figurino.
- O módulo superior da outra lateral é fundo claro da própria locação. Traz o wordmark centralizado, um filete fino e a oferta em sans-serif pesada e caixa alta. A vantagem é a maior linha; as palavras de apoio ficam menores acima e abaixo.
- Logo abaixo, um módulo largo mostra o packshot principal apoiado no mesmo ambiente, inteiro e em vista de três quartos.
- A faixa seguinte tem dois módulos menores lado a lado. Eles mostram o mesmo produto e a mesma variante em dois ângulos factual e visualmente possíveis. Não introduza outras cores, modelos ou categorias para diferenciar os quadros.
- O último módulo é um macro fechado de um detalhe real que identifica o produto — acabamento, textura, costura, fecho, sola, rótulo ou mecanismo confirmado nas fontes. Ele não inventa componente interno nem benefício.
- Todos os módulos compartilham a mesma luz natural, temperatura de cor e locação clara, como fotografias do mesmo ensaio.
- Esta direção não tem título além da oferta, lista de benefícios, selo, CTA, cartão flutuante nem fundo de estúdio isolado.`,
  },
  'REF-0144': {
    title: 'SPLIT CLARO COM USO E PACKSHOT',
    single: `- O que define esta direção: o quadro tem dois lados contínuos da mesma locação clara — comunicação e packshot numa lateral, pessoa em corpo inteiro usando o mesmo produto na outra. Não é mosaico e o packshot não atravessa para o lado da pessoa.
- A locação é externa, luminosa e sofisticada, com arquitetura de pedra clara, luz natural, sombras suaves e poucos elementos vegetais desfocados. Uma parede quase branca forma a área de comunicação.
- Na lateral da comunicação, tudo se alinha à esquerda: wordmark da loja no alto, nome curto do produto abaixo, filete horizontal fino e oferta em sans-serif muito pesada.
- A oferta usa três níveis: introdução forte, vantagem como a maior linha da peça e condição final logo abaixo. Quando não houver percentual, a vantagem real recebida assume o maior peso sem ser abreviada nem substituída.
- Na base dessa lateral, o produto aparece como packshot grande, apoiado sobre um bloco da própria arquitetura e visto em três quartos. Mostre a unidade comercial real: par completo quando for naturalmente um par; uma unidade quando for item avulso.
- Na outra lateral, a pessoa aparece de corpo inteiro ou quase inteiro, em pé e apoiada na arquitetura, com rosto completo e expressão natural. Ela corresponde ao público-alvo confirmado.
- O mesmo produto e a mesma variante aparecem corretamente em uso na pessoa. O restante do figurino fica neutro e não compete com ele.
- Packshot e produto em uso não sugerem kit nem quantidade promocional; são duas apresentações do mesmo item anunciado.
- Não há cartão sobreposto, lista de benefícios, selo, ícone, CTA, preço isolado ou cor promocional. A paleta vem da pedra, da luz e do próprio produto.`,
  },
  'REF-0145': {
    title: 'CLOSE ÍNTIMO COM OFERTA EM CARTÕES',
    single: `- O que define esta direção: uma fotografia íntima e quente ocupa o quadro inteiro, com o produto vestido dominando um lado e toda a comunicação encaixada na área escura e vazia do outro. Não existe painel gráfico separando texto e foto.
- A pessoa aparece sentada ou reclinada em ambiente doméstico acolhedor, com luz lateral baixa e quente, fundo marrom desfocado e tecido claro solto ao redor do corpo.
- O enquadramento começa abaixo do pescoço e termina depois de toda a peça vendida. O rosto não aparece nem parcialmente. O corpo serve somente para mostrar caimento, forma e uso.
- O produto é o ponto mais nítido e contrastado da fotografia. Tecidos ou outras peças do figurino permanecem abertos, claros e secundários, sem cobri-lo.
- No alto da área vazia, wordmark da loja em serifada cursiva ou na tipografia real da marca; abaixo, um filete curto e fino.
- A headline vem em serifada elegante, caixa mista e linhas curtas, maior do que o texto de apoio. O apoio usa sans-serif leve e ocupa poucas linhas.
- Na base da coluna de texto, os degraus da oferta aparecem em cartões quadrados empilhados, do mesmo tamanho, com cantos arredondados e uma única cor suave retirada da identidade. Números e vantagem ficam centralizados em sans-serif branca e pesada.
- Se a oferta tiver um único degrau, use um único cartão e deixe mais respiro ao redor. Não invente um segundo degrau para repetir a referência.
- Esta direção não tem lista de benefícios, ícones, selo, CTA, preço, moldura ou logo sobre o produto.`,
  },
  'REF-0146': {
    title: 'STILL LIFE COM LUPA DE DETALHE',
    single: `- O que define esta direção: o produto aparece deitado como still life e um único círculo amplia exatamente o detalhe visual que sustenta a headline. O círculo é uma lupa fotográfica do mesmo produto, não um selo e não uma segunda variante.
- Fundo feito por tecido claro e quente com dobras largas, acompanhado apenas por uma superfície de madeira clara na base. Luz natural lateral cria sombras suaves e revela a textura dos materiais.
- O produto ocupa o centro e a metade inferior, deitado em diagonal suave, inteiro e sem embalagem. Preserve forma, estrutura, acabamento, costura e material sem estilizar.
- No alto de uma lateral, wordmark da loja; abaixo, um filete curto; depois, headline serifada em caixa mista, distribuída em poucas linhas e alinhada à esquerda.
- Na lateral oposta, um círculo grande com contorno branco mostra um macro real de acabamento, textura, costura, estampa, fecho ou componente confirmado. O recorte preenche o círculo e continua reconhecível como parte do produto.
- No canto inferior oposto à lupa, um selo circular grande recebe os degraus da oferta, centralizados e separados por um filete fino. O selo usa uma cor só da identidade, com texto branco em sans-serif pesada.
- Com um único degrau de oferta, o selo mantém o formato circular e usa apenas esse conteúdo, maior e centralizado. Não invente outro degrau.
- A lupa e o selo equilibram lados opostos da peça e não cobrem o produto principal.
- Esta direção não tem pessoa, cenário montado, lista de benefícios, ícone, CTA, avaliação, preço separado nem objetos decorativos.`,
  },
  'REF-0147': {
    title: 'PAINEL EDITORIAL COM PRODUTO NO CORPO',
    single: `- O que define esta direção: um painel branco estreito organiza toda a comunicação numa lateral, enquanto um close limpo da pessoa usando o produto ocupa a lateral maior. A peça vendida aparece inteira no corpo e é maior do que todo o conjunto de textos.
- Fundo branco ou off-white contínuo, com leve sombra natural atrás do corpo. A divisão entre painel e fotografia nasce da composição, sem linha vertical, moldura ou mudança brusca de cor.
- A pessoa fica de frente, enquadrada abaixo do pescoço até depois de toda a peça vendida. O rosto não aparece. Braços e mãos permanecem fora da frente do produto.
- A peça vendida é nítida, preserva recortes, textura, acabamento e transparências reais. A outra roupa usada pela pessoa é neutra e não compete com ela.
- No alto do painel, o wordmark da loja; abaixo, um filete curto; uma linha pequena em sans-serif espaçada com o nome do produto; e a headline principal em serifada, caixa mista e poucas linhas.
- Abaixo da headline, os degraus da oferta aparecem em cartões retangulares empilhados, do mesmo tamanho, com cantos arredondados. Cada cartão usa uma única cor suave da identidade e texto branco centralizado em sans-serif pesada.
- Uma linha curta de condição pode aparecer abaixo dos cartões, em sans-serif leve, somente se vier do contexto.
- Na base do painel, miniaturas pequenas podem mostrar outras vistas reais da MESMA VARIANTE. Se as fontes não trouxerem vistas adicionais, omita as miniaturas e mantenha o espaço em branco. Nunca transforme essa faixa em catálogo de cores.
- Esta direção não tem benefício em lista, ícone, selo, CTA, preço, cenário, acessório ou texto sobre o corpo.`,
  },
  'REF-0043': {
    title: 'DUPLA DE MODELOS COM A PAREDE VAZIA AO LADO',
    single: `- O que define esta direção: uma pessoa vestindo o produto ocupa um lado de uma cena externa clara, e a parede lisa do outro lado permanece vazia para receber toda a comunicação. O vazio da parede é tão importante quanto a figura.
- O enquadramento acompanha o tamanho do produto, não o tamanho da pessoa. Ele começa acima da cabeça e termina um palmo depois de onde a peça vendida acaba: peça de cima fecha na altura da coxa; conjunto ou peça longa vai até os pés. Mostrar perna e calçado que não estão à venda tira o produto do centro da atenção.
- A figura fica de frente, parada, com as mãos nos bolsos e o peso distribuído. Nada de passada, salto ou ação. Nenhuma extremidade fica cortada pela borda dentro do enquadramento escolhido.
- Arquitetura externa simples e clara, degraus baixos e uma planta discreta ao fundo. Luz natural alta e difusa, sombras curtas embaixo dos pés.
- A parede clara da cena continua atrás do texto. Não existe painel, retângulo de cor, coluna gráfica nem divisória entre foto e comunicação: é o mesmo fundo do começo ao fim.
- Sobre a parede, alinhado à esquerda e empilhado de cima para baixo: wordmark da loja pequeno, o nome do produto em caixa alta pesada distribuído em poucas linhas, um filete curto em cor metálica, e a oferta.
- Na oferta, uma linha pequena e muito espaçada introduz a condição, o número vem muitas vezes maior em cor metálica, e a palavra final volta ao corpo pequeno com letras bem afastadas.
- O metálico do filete e do número é o único ponto de cor do quadro. Fora dele existem só o tom da parede, o preto do texto e as cores reais do produto.
- A parte baixa da parede, abaixo da oferta, fica deliberadamente vazia. Se a oferta tiver mais degraus, eles descem por esse vazio em linhas pequenas e alinhadas, e o número grande continua sendo um só.
- Esta direção não tem selo, cartão, faixa, moldura, lista de benefícios, ícone, CTA, preço riscado nem packshot solto do produto.`,
    collection: `- O que define esta direção: duas pessoas de corpo inteiro, encostadas ombro com ombro, vestindo a mesma composição em versões diferentes, enquanto a parede lisa ao lado delas permanece vazia e recebe toda a comunicação. A peça compara duas versões lado a lado, no corpo.
- O enquadramento acompanha o tamanho do produto, não o das pessoas: começa acima das cabeças e termina um palmo depois de onde a peça vendida acaba. Com peça de cima, fecha na altura da coxa; com conjunto ou peça longa, vai até os pés.
- As duas figuras ficam de frente, paradas, com as mãos nos bolsos. Elas se tocam pelo ombro e não deixam vão entre si, e nenhuma extremidade fica cortada pela borda dentro do enquadramento escolhido.
- As duas versões vestidas são o mesmo modelo e o mesmo corte; o que muda entre elas é a cor ou a estampa, e ela precisa estar confirmada no CONTEXTO CAPTURADO. As duas escolhas contrastam entre si e nenhuma repete o tom da parede.
- Arquitetura externa simples e clara, degraus baixos e uma planta discreta ao fundo. Luz natural alta e difusa, sombras curtas embaixo dos pés.
- A parede clara da cena continua atrás do texto. Não existe painel, retângulo de cor, coluna gráfica nem divisória entre foto e comunicação.
- Sobre a parede, alinhado à esquerda e empilhado: wordmark da loja pequeno, o nome da composição em caixa alta pesada em poucas linhas, um filete curto em cor metálica, e a oferta.
- Na oferta, uma linha pequena e muito espaçada introduz a condição, o número vem muitas vezes maior em cor metálica, e a palavra final volta ao corpo pequeno com letras bem afastadas.
- O metálico é o único ponto de cor do quadro. Fora dele existem só o tom da parede, o preto do texto e as cores reais dos produtos.
- Com mais degraus na oferta, eles descem pela parte baixa da parede em linhas pequenas; o número grande continua sendo um só. Com uma versão só confirmada, use uma pessoa e deixe a parede vazia maior — nunca vista duas pessoas com a mesma cor para completar a dupla.
- Esta direção não tem selo, cartão, faixa, moldura, lista de benefícios, ícone, CTA, preço riscado nem packshot solto do produto.`,
  },
  'REF-0044': {
    title: 'QUADRANTES DE CONJUNTO COMPLETO EM FUNDO QUENTE',
    collection: `- O que define esta direção: o mesmo produto se repete em quadrantes, um por cor, sempre no mesmo arranjo. O que a peça vende é a variedade de cores do mesmo item.
- O que entra em cada quadrante é exatamente o que a loja vende. Se o produto for um conjunto, a peça de cima fica atrás e acima, aberta e de frente, e a de baixo repousa adiante, cobrindo só a barra inferior da primeira. Se o produto for uma peça avulsa, o quadrante traz essa peça sozinha, maior e centralizada. Nunca invente a segunda peça para formar um conjunto.
- Todos os quadrantes usam o mesmo arranjo, a mesma inclinação e o mesmo enquadramento. O que muda de um para outro é somente a cor.
- O fundo é um off-white levemente quente, quase branco, contínuo pelo quadro inteiro. Não é bege médio nem creme forte: é claro a ponto de as peças escuras recortarem sozinhas. Não há células, molduras, linhas divisórias nem blocos de cor — os grupos flutuam no mesmo fundo, separados apenas pelo respiro.
- Luz de estúdio suave e frontal, sombra de contato curta embaixo de cada peça. Tecido sem vinco marcado, cor fiel, textura visível.
- No alto, centralizado: o wordmark da loja em serifada com um filete curto embaixo, depois o nome do produto em serifada caixa alta em duas linhas. A segunda linha repousa sobre uma barra um tom mais clara que o fundo, com a largura ajustada ao texto.
- Logo abaixo, a oferta ocupa uma barra horizontal mais larga, num tom só um passo mais escuro que o fundo, com o texto em caixa alta numa linha só. O número da oferta tem o mesmo corpo do resto da linha: aqui não existe número gigante.
- As duas barras são degraus de tom do próprio fundo, não blocos de cor: retângulos chapados, cantos retos, sem borda, sem sombra e sem brilho. Nada de dourado, de cor de marca ou de texto branco sobre cor — todo o texto da peça é preto. Se uma barra parecer um adesivo colado ou um botão, ela está escura demais.
- A peça inteira vive em bege e preto. Toda a cor do quadro vem dos produtos.
- Com menos cores confirmadas, use menos quadrantes e amplie os que sobrarem; nunca recolora o produto para completar a grade. Com mais degraus de oferta, eles entram em linhas compactas abaixo da barra, sem virar cartões.
- Esta direção não tem pessoa, cenário, selo circular, ícone, CTA, benefício, preço nem sombra dramática.`,
  },
  'REF-0045': {
    title: 'ESCADA EM PLACAS EMPILHADAS COM O ACENTO DO PRODUTO',
    single: `- O que define esta direção: cada degrau da oferta é um par de placas coladas uma na outra — a quantidade numa placa clara e, imediatamente abaixo, a vantagem numa placa escura de texto invertido. Os pares se empilham na vertical ao lado da pessoa, como uma coluna de etiquetas.
- Os pares ficam alinhados pela esquerda e têm larguras diferentes, cada um acompanhando o comprimento do próprio texto. Entre um par e o outro há respiro; dentro do par não há nenhum.
- A pessoa aparece do topo da cabeça até pouco abaixo do quadril, de frente, apoiada, olhando para a câmera, com o produto vestido ocupando o centro do corpo.
- Fundo de estúdio liso e claro, levemente esfumado, com sombra suave atrás do corpo. O mesmo fundo segue atrás das placas: não há painel nem divisória.
- A headline fica acima da coluna de placas, em caixa mista, sans pesada, três a quatro linhas curtas. Parte das linhas usa a cor dominante do próprio produto e o restante fica em preto.
- Essa cor tirada do produto é o único acento do quadro. Se o produto for neutro, a headline fica inteira em preto e a peça não ganha cor nenhuma: não invente um vermelho de liquidação.
- O wordmark da loja entra pequeno acima da headline, e só se o contexto trouxer a marca.
- Com menos degraus, use menos pares e mantenha a coluna alinhada pelo topo. Com um degrau só, o par fica sozinho e maior. Nunca invente degrau para encher a coluna.
- Esta direção não tem selo, ícone de sacola, círculo, moldura, CTA, benefício, preço nem segundo produto no quadro.`,
    collection: `- O que define esta direção: cada degrau da oferta é um par de placas coladas uma na outra — a quantidade numa placa clara e, imediatamente abaixo, a vantagem numa placa escura de texto invertido. Os pares se empilham na vertical ao lado de uma pessoa que veste um look completo da coleção.
- Os pares ficam alinhados pela esquerda e têm larguras diferentes, cada um acompanhando o comprimento do próprio texto. Entre um par e o outro há respiro; dentro do par não há nenhum.
- Aparece uma pessoa só, do topo da cabeça até pouco abaixo do quadril, vestindo um único look da coleção, inteiro e sem sobreposição. Os outros produtos elegíveis não entram no quadro nem em miniatura.
- Fundo de estúdio liso e claro, levemente esfumado, com sombra suave atrás do corpo. O mesmo fundo segue atrás das placas.
- A headline fica acima da coluna de placas, em caixa mista, sans pesada, em linhas curtas. Parte das linhas usa a cor dominante da peça vestida e o restante fica em preto.
- Essa cor tirada da peça é o único acento do quadro. Com look neutro, a headline fica inteira em preto: não invente cor de liquidação.
- Com menos degraus, use menos pares e alinhe a coluna pelo topo. Nunca invente degrau para encher a coluna.
- Esta direção não tem grade de produtos, selo, ícone de sacola, moldura, CTA, benefício nem preço.`,
  },
  'REF-0053': {
    title: 'TARJA DE ANÚNCIO SOBRE FOTOS ENCOSTADAS',
    collection: `- O que define esta direção: o acabamento é deliberadamente cru, de anúncio de marketplace. As fotos de produto se encostam sem margem nenhuma e uma tarja retangular de cor saturada fica grudada na borda de cima do quadro, carregando a oferta inteira em texto corrido.
- As fotos formam duas fileiras coladas, com um fio branco fino entre elas como única separação. Nenhuma foto tem moldura, sombra projetada ou cantos tratados.
- Cada foto mostra um produto elegível diferente sobre fundo branco de catálogo, em ângulo de três quartos, com sombra de contato curta. Os enquadramentos não combinam entre si: um produto aparece maior, outro menor, cada um do jeito que a foto de origem oferece.
- A tarja atravessa a largura inteira, encosta nas bordas laterais e não tem canto tratado. O texto dentro dela é branco, em sans pesada, centralizado, quebrado em duas linhas, com a condição escrita por extenso e os degraus separados por vírgula na mesma frase.
- A tarja é o único elemento colorido da peça. O branco do fundo e as cores reais dos produtos respondem por todo o resto.
- Com mais degraus, a frase cresce e a tarja fica mais alta, avançando sobre a primeira fileira de fotos. Isso é próprio da direção e não deve ser corrigido diagramando os degraus em colunas ou cartões.
- Com menos produtos confirmados, use menos fotos e deixe cada uma maior; nunca repita o mesmo produto em duas fotos.
- Esta direção não tem wordmark, headline, nome de produto, pessoa, cenário, selo, ícone, CTA nem qualquer refino tipográfico.`,
  },
  'REF-0054': {
    title: 'MÓDULOS DESIGUAIS ATRAVESSADOS POR UMA FAIXA',
    collection: `- O que define esta direção: os módulos têm tamanhos claramente diferentes entre si — um domina uma área grande e os outros o cercam bem menores — e uma faixa fina de cor saturada corta o quadro na horizontal, passando por cima dos módulos que encontra no caminho.
- O módulo grande fica de um lado e sozinho; do outro lado, os módulos pequenos se empilham em alturas diferentes. Embaixo da faixa, uma fileira de módulos de largura parecida fecha a composição.
- Cada módulo traz uma peça avulsa, de frente, estendida como recorte de catálogo sobre fundo branco. Peça avulsa, não conjunto: uma peça por módulo.
- Os módulos se tocam por fios brancos finos. Não há moldura externa, cantos tratados nem sombra projetada.
- A faixa atravessa de borda a borda, tem altura modesta e traz uma linha única em caixa alta branca, centralizada, com a condição e a oferta na mesma frase. Ela passa por cima dos módulos sem respeitar a emenda entre eles.
- A faixa é o único elemento colorido. Todo o resto é o branco do fundo e a cor real de cada peça.
- Com poucas peças confirmadas, refaça a distribuição para que ainda exista um módulo dominante e módulos menores em volta; se não houver módulo na altura da faixa, ela passa sobre o fundo branco. Não iguale os tamanhos.
- Com mais degraus de oferta, a frase encurta para caber em uma linha só. A faixa nunca vira bloco de várias linhas.
- Esta direção não tem wordmark, headline separada, pessoa, cenário, selo, ícone, CTA, benefício nem preço.`,
  },
  'REF-0055': {
    title: 'QUATRO QUADRANTES IGUAIS COM FAIXA NA EMENDA',
    collection: `- O que define esta direção: quatro quadrantes exatamente do mesmo tamanho dividem o quadro em dois por dois, e a faixa de oferta corre justamente sobre a emenda horizontal do meio, no ponto onde as quatro fotos se encontram.
- Dentro de cada quadrante, um conjunto do mesmo modelo aparece deitado na diagonal: a peça de cima recuada e aberta, a peça de baixo adiante e dobrada, encostando na barra da primeira.
- O que distingue um quadrante do outro é só a cor do conjunto. Modelo, corte, gola, botões, textura e disposição permanecem idênticos nos quatro.
- O fundo de cada quadrante é um branco levemente cinzento, e fios brancos finos marcam a divisão entre eles. Nenhum quadrante tem moldura, legenda ou número.
- Luz de estúdio suave e alta, sombra de contato curta sob os tecidos, caimento natural com dobras largas.
- A faixa de cor saturada atravessa a largura inteira sobre a emenda, com uma linha única em caixa alta branca centralizada. Ela cobre a parte de baixo dos quadrantes superiores e o topo dos inferiores em igual medida.
- A faixa é o único elemento colorido do quadro; o resto é branco e a cor real de cada conjunto.
- Com menos cores confirmadas, use menos quadrantes e mantenha os restantes do mesmo tamanho entre si; não recolora um conjunto nem invente estampa para fechar o quadrado.
- Esta direção não tem wordmark, headline, pessoa, cenário, selo, ícone, CTA, benefício nem peça avulsa.`,
  },
  'REF-0103': {
    title: 'PEÇAS SOBRE UMA SUPERFÍCIE DO PRÓPRIO UNIVERSO DO PRODUTO',
    collection: `- O que define esta direção: as peças não estão sobre uma mesa neutra, e sim apoiadas sobre um objeto grande que pertence ao mesmo universo do produto. Esse objeto aparece inteiro e reconhecível embaixo delas, e é ele que dá o assunto da imagem.
- O objeto de apoio precisa vir do contexto factual do produto ou da loja. Se as fontes não sustentarem nenhum, use uma superfície ampla do próprio ambiente de uso, e nunca um cenário emprestado de outra marca.
- A câmera fica alta e inclinada, olhando o objeto de cima em ângulo, o suficiente para ler a forma dele e as peças ao mesmo tempo.
- As peças ficam abertas e sobrepostas em leque, tocando umas nas outras, cada uma mostrando frente, gola e o detalhe que a identifica. Nenhuma fica dobrada a ponto de perder a silhueta.
- Ambiente escuro ao redor, com uma luz quente e direcional entrando de cima e de lado. O brilho escorre pela superfície do objeto e morre nos cantos do quadro.
- As peças recebem a luz mais forte; o objeto de apoio fica um passo mais escuro, e o ambiente ao fundo some quase por completo.
- A cor vem inteira dos produtos e do objeto. Não existe fundo colorido nem luz colorida artificial.
- Com menos peças confirmadas, use menos e deixe mais superfície aparecendo; nunca recolora nem invente peça para preencher o leque.
- Esta direção não tem pessoa, texto, tarja, selo, ícone, wordmark, moldura nem qualquer elemento gráfico sobre a imagem.`,
  },
};

function compileSingleContextPrompt(campaign: CampaignInput) {
  const protectedSource = campaign.linkAccess === 'protected'
    ? `\n\nO LINK ESTÁ PROTEGIDO OU INDISPONÍVEL. Use como fontes factuais principais as fotos reais e nítidas do produto e os prints completos da página de vendas anexados nesta conversa. As imagens anexadas são fontes factuais; não são referências criativas. Não peça senha. Se os anexos não estiverem visíveis, peça somente que eu os anexe antes de continuar.`
    : '';
  /* Quantas cores existem é fato da loja, não resposta do aluno: o contexto sempre pergunta. */
  const variants = '\n- todas as variações visuais confirmadas do MESMO produto — cada cor, estampa ou versão real que a página oferecer, identificadas uma a uma; se não houver nenhuma, escreva “nenhuma”;';
  const variantsOutput = 'Variações visuais confirmadas do mesmo produto (uma por linha, ou “nenhuma”):\n- V01:\n';
  const offerMechanic = campaign.offerMechanic === 'leve-mais'
    ? 'COMPRE X, LEVE Y'
    : campaign.offerMechanic === 'progressivo'
      ? 'DESCONTO PROGRESSIVO'
      : campaign.offerMechanic === 'percentual'
        ? 'DESCONTO PERCENTUAL'
        : 'NÃO DECLARADA';

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
- mecânica da oferta: ${offerMechanic};${variants}
- formato, cores, materiais, componentes, estampas, rótulos e detalhes reconhecíveis;
- benefícios explicitamente publicados;
- atendimento da loja, somente o que estiver publicado: prazo de entrega, formas de pagamento, política de troca e devolução, garantia e canais de contato. O que não estiver escrito no site entra como não confirmado, nunca como estimativa;
- logo, cores e identidade visual da loja;
- estilo tipográfico da loja: se as letras da marca e do site são com ou sem serifa, o peso, a caixa e o espaçamento que ela usa;
- público-alvo do produto: gênero, faixa etária e contexto de uso indicados pela página, pela categoria, pelas fotos e pela tabela de tamanhos;
- argumento de venda: este produto se vende por uma funcionalidade que a foto não mostra, ou pela própria estética? Responda uma das duas e diga em uma linha por quê.

Crie internamente um título publicitário curto. Eu não fornecerei o título exato.

Regras permanentes:
- esta campanha anuncia somente o produto do link, não a coleção da loja;
- não alterar nenhuma característica real do produto;
- quando houver variações confirmadas, elas continuam sendo o mesmo produto: não incluir produto, categoria ou variante fora da lista factual;
- não inventar benefícios, preços, descontos, cupons, urgência, avaliações, garantias ou selos;
- preservar exatamente o valor e as condições da oferta;
- não gerar a imagem ainda.

Responda somente:

CONTEXTO CAPTURADO

Marca:
Idioma:
Produto e categoria:
Variante visual:
${variantsOutput}Características que serão preservadas:
Benefícios factuais:
Oferta recebida:
Redação localizada da oferta:
Logo e cores observadas:
Estilo tipográfico da loja:
Público-alvo do produto:
Argumento de venda:
Título publicitário proposto:
Prazo de entrega publicado:
Formas de pagamento publicadas:
Troca e devolução publicadas:
Garantia publicada:
Canais de atendimento publicados:
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
11. Registre o argumento de venda da coleção como ESTÉTICA: uma coleção é um conjunto de produtos que se vendem pela própria imagem. Não transforme a coleção em peça de explicação técnica.
12. Registre o atendimento da loja, somente o que estiver publicado: prazo de entrega, formas de pagamento, política de troca e devolução, garantia e canais de contato. O que não estiver escrito no site entra como não confirmado, nunca como estimativa.

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
Prazo de entrega publicado:
Formas de pagamento publicadas:
Troca e devolução publicadas:
Garantia publicada:
Canais de atendimento publicados:
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
      const recipe = tested?.[supportsVariants(campaign, reference) ? 'collection' : campaign.mode] ?? `- ${reference.recipe}`;
      const limite = reference.limits ? `\n- Limite operacional: ${reference.limits}` : '';
      const people = peopleRule(reference);
      const peopleLines = people ? people.split('\n').slice(1).join('\n') : '';
      const slotLine = campaign.mode === 'collection' && reference.slots
        ? `
- Quantidade alvo desta direção: ${reference.slots} produtos ou looks distintos, todos da lista de elegíveis. Com menos itens confirmados, use menos módulos e deixe cada um maior. Nunca invente produto nem categoria para preencher.`
        : '';
      const variantLine = supportsVariants(campaign, reference)
        ? `
- Esta direção mostra o MESMO produto em variações visuais. Use somente as cores, estampas ou versões registradas no CONTEXTO CAPTURADO; elas não formam uma coleção, então nome, modelo, materiais e todos os detalhes continuam idênticos entre elas. Se houver menos variações do que a composição comporta, use menos e ajuste o arranjo. Se não houver nenhuma, mostre o produto uma vez só.`
        : '';
      const repeatedUnitsLine = campaign.mode === 'single' && campaign.offerMechanic === 'leve-mais' && reference.repeatsSameProduct
        ? `
- A pilha materializa a oferta de leve-mais: repita somente unidades reais do mesmo produto e da variante confirmada. Não crie um kit, produto complementar, nova cor ou embalagem para completar a pilha.`
        : '';
      const silentLines = reference.silent ? `\n${SILENT_RULE.split('\n').slice(1).join('\n')}` : '';
      return `CRIATIVO ${itemLabel(index, round)} — ${title}\n${recipe}${limite}${slotLine}${variantLine}${repeatedUnitsLine}${silentLines}${peopleLines ? `\n${peopleLines}` : ''}`;
    })
    .join('\n\n');
}

export function compileReferencePrompt(campaign: CampaignInput, reference: Reference) {
  const tested = testedDirections[reference.id];
  const title = tested?.title ?? reference.name.toUpperCase();
  const baseRecipe = tested?.[supportsVariants(campaign, reference) ? 'collection' : campaign.mode] ?? `- ${reference.recipe}`;
  const recipe = `${baseRecipe}${reference.limits ? `
- Limite operacional: ${reference.limits}` : ''}`;
  const silentBlock = reference.silent ? `${SILENT_RULE}

` : '';
  const offerRule = reference.silent
    ? '- Esta direção é uma peça sem texto: não escreva a oferta, nem título, nem marca. Ela vende só pela imagem.'
    : `- Preserve exatamente a oferta recebida: “${campaign.offer}”.`;
  const peopleText = peopleRule(reference);
  const peopleBlock = peopleText ? `${peopleText}\n\n` : '';
  const factualRule = reference.id === 'REF-0020'
    ? '- Não invente preço, benefício, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial. Os três depoimentos desta direção são texto publicitário da composição e devem ser gerados como a direção pedir.'
    : testimonialReferenceIds.has(reference.id)
      ? '- Não invente preço, benefício, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial. O depoimento, o nome, o avatar e as estrelas desta direção são elementos de texto publicitário e devem ser gerados como a receita pedir, sempre limitados aos fatos confirmados sobre o produto.'
      : '- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial.';
  const slots = reference.slots ?? 4;
  const slotsWord = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][slots] ?? String(slots);
  const variantRule = supportsVariants(campaign, reference)
    ? `- Mostre as variações visuais confirmadas do MESMO produto registradas no CONTEXTO CAPTURADO. Elas precisam compartilhar o mesmo nome, modelo, materiais e detalhes; só cor, estampa ou versão registrada pode mudar. Com menos variações do que a composição comporta, use menos e ajuste o arranjo; sem nenhuma, mostre o produto uma vez só.
- Não apresente essas variações como produtos de uma coleção e não complete a composição com outro produto, categoria ou cor inventada.`
    : '';
  const repeatedUnitsRule = campaign.mode === 'single' && campaign.offerMechanic === 'leve-mais' && reference.repeatsSameProduct
    ? `- A composição pode repetir unidades reais do mesmo produto para materializar a oferta. Repita somente a variante confirmada, sem criar kit, acessório, embalagem ou nova cor.`
    : '';
  const contentRule = campaign.mode === 'collection'
    ? `- Anuncie somente a coleção “${campaign.exactTarget}”.
- Mostre simultaneamente até ${slotsWord} produtos ou looks distintos, e SOMENTE itens que constem na lista de elegíveis do CONTEXTO CAPTURADO — V004. Essa quantidade é o alvo da diagramação, não uma cota a cumprir.
- O número de itens confirmados manda sobre a quantidade da direção. Se houver menos itens do que módulos, use menos módulos e deixe cada um maior, reequilibrando a composição.
- É proibido inventar produto ou categoria para preencher espaço. Vale exatamente o que a lista de elegíveis traz: se ela reúne várias categorias, todas entram; se traz uma só, a peça inteira é dessa categoria e nada de fora aparece.
- Um quadro com menos itens do que módulos é correto. Um quadro com item que não está na lista é entrega inválida, por melhor que ele combine com a cena.
- Preserve a separação visual entre os itens; não sugira um kit obrigatório e não misture marcas, logos, cores ou componentes.`
    : `- Anuncie somente o produto “${campaign.exactTarget}”, nas variantes factuais registradas no CONTEXTO CAPTURADO.
- Mostre o mesmo produto sem redesenhar, recolorir ou inventar componentes.
${variantRule || '- Não misture variantes; use somente a variante factual registrada.'}
${repeatedUnitsRule}`;

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE UM criativo publicitário mestre em proporção 4:5.

${HOUSE_PRODUCT_RULE}

CONTEÚDO OBRIGATÓRIO
${contentRule}
- Use a loja/anunciante, a marca do produto e o idioma exatamente como registrados no contexto.
${offerRule}
${factualRule}
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
  const factualRule = selected.some(({ id }) => testimonialReferenceIds.has(id))
    ? '- Não invente preço, benefício, garantia, cupom, urgência, selo, embalagem ou acessório. Nas referências de depoimento, depoimento, nome, avatar e estrelas são elementos de texto publicitário e devem ser gerados como a receita pedir. Isso não autoriza inventar fato técnico, oferta ou detalhe do produto.'
    : '- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem ou acessório.';
  const variantBatchRule = selected.some((reference) => supportsVariants(campaign, reference))
    ? '- Somente as direções que se declararem compatíveis com variações podem mostrar cores, estampas ou versões diferentes. Mesmo nelas, cada unidade continua sendo o mesmo produto e só usa variações registradas no CONTEXTO CAPTURADO.'
    : '- Não misture variantes: todas as aparições usam somente a variante factual registrada no CONTEXTO CAPTURADO.';
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
- Não redesenhe, simplifique, recolora ou transforme o produto em outro produto.
${variantBatchRule}
- Use a loja/anunciante e preserve a marca do produto exatamente como registradas no CONTEXTO CAPTURADO.
- Preserve exatamente a oferta recebida: ${campaign.offer}. A única exceção é a direção que se declarar uma peça sem texto: nela a oferta não aparece.
- Use o idioma definido no contexto e um título curto factual derivado do nome ou da categoria do produto.
${factualRule}
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
