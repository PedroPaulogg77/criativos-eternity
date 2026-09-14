import type { Reference } from '@/lib/mvp-data';
import { HOUSE_PRODUCT_RULE, HOUSE_DESIGN_RULE, peopleRule } from '@/lib/house-rules';

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
    single: `- Composição assimétrica: título e oferta à esquerda; produto grande à direita.
- Fundo de estúdio escuro com gradiente suave e luz concentrada atrás do produto.
- Produto em perspectiva publicitária de três quartos, apoiado sobre base mineral escura, com sombra de contato realista.
- A oferta é o principal elemento textual. Título curto e secundário. Logo da loja/anunciante pequena no alto.
- Sensação premium, contraste alto e acabamento fotorrealista.`,
    collection: `- Composição assimétrica: marca, título e oferta em um painel à esquerda; coleção à direita.
- Organize os quatro produtos em uma composição editorial escalonada, com um produto principal e três apoios claramente distintos.
- Fundo de estúdio escuro com gradiente suave, luz concentrada, base mineral e sombras de contato realistas.
- A oferta é o principal elemento textual; o título da coleção é secundário.
- Nenhum produto pode ficar escondido atrás de outro ou parecer uma variante inventada.`,
  },
  'REF-0002': {
    title: 'LIFESTYLE ESPORTIVO EM MOVIMENTO',
    single: `- Fotografia lifestyle urbana real ocupando todo o quadro: a foto é o fundo da peça inteira e o texto fica por cima dela. Não existe painel de cor nem metade reservada só para texto.
- A pessoa aparece em plena ação no centro do quadro, com o cenário escurecido e desfocado atrás dela.
- O enquadramento fecha na peça vendida: vai do peito até logo abaixo dos joelhos, sem incluir a cabeça e sem incluir os pés. A peça vendida ocupa a maior parte da altura da foto.
- O corte privilegia a peça vendida: ela fica na faixa central da imagem, na área mais iluminada e mais nítida da foto. As demais peças do figurino são lisas, sem estampa e de cor claramente diferente da do produto, para que a borda do produto apareça.
- O casting segue o público declarado do produto: gênero, faixa etária e biotipo compatíveis com quem a loja anuncia. Corpo e mãos anatomicamente corretos.
- Logo da loja/anunciante pequena no topo. Logo abaixo, a headline curta em caixa alta pesada, atravessando quase toda a largura em duas ou três linhas: é o maior texto da peça. O nome comercial do produto vem em uma linha fina logo abaixo dela.
- Coluna de benefícios em uma das laterais, na altura média do quadro, sobre a parte mais escura da foto: cada item é um ícone redondo de traço fino com uma etiqueta curta ao lado, todos alinhados no mesmo eixo. Use somente benefícios confirmados no contexto; se houver menos de três confirmados, mostre menos itens em vez de inventar.
- Oferta na base em faixas horizontais largas e empilhadas, uma por degrau, quase da largura do quadro: a faixa do degrau principal em cor viva de alto contraste e as seguintes progressivamente mais escuras. O valor da vantagem é a palavra dominante de cada faixa. Se a oferta tiver um único degrau, use uma única faixa.
- Rodapé opcional com uma única linha curta de prova social, somente quando ela estiver confirmada no contexto.
- Alto contraste, sensação real de movimento e acabamento de campanha esportiva.`,
  },
  'REF-0003': {
    title: 'CENÁRIO TÁTIL E QUENTE',
    single: `- Fundo e superfície tátil em tom quente, natural e suave, com iluminação difusa.
- Mostre o mesmo SKU em duas vistas factualmente coerentes: uma vista principal aberta em três quartos e uma segunda vista lateral, traseira ou dobrada somente se ela puder ser confirmada pelas fontes.
- As duas aparições devem representar exatamente o mesmo produto e a mesma variante, sem diferenças de mecanismo, cor ou componentes.
- Headline curta na parte superior e oferta dentro de selo circular de alto contraste no canto inferior.
- Se uma segunda vista não for confirmável, use um close real de um detalhe confirmado em vez de inventar outro ângulo.`,
    collection: `- Fundo e superfície tátil em tom quente, natural e sofisticado, com iluminação difusa.
- Distribua os quatro produtos em diagonais suaves sobre a superfície, cada um em sua própria área visual e com ângulo coerente.
- Headline curta no topo e a oferta completa dentro de um selo circular de alto contraste no canto inferior.
- Não use duas vistas do mesmo produto: neste modo coleção, cada aparição deve ser um produto distinto e elegível.
- Preserve a identidade de cada produto ou marca sem misturar logos, componentes ou características.`,
  },
  'REF-0005': {
    title: 'PRODUTO E CARTÃO FÍSICO DE OFERTA',
    single: `- Cena lifestyle de mesa escura, quente e premium, com profundidade de campo suave.
- Uma mão segura o produto de forma anatomicamente natural e sem ocultar seus detalhes essenciais.
- Outra mão segura um cartão promocional físico em perspectiva, contendo a marca anunciante e a oferta completa claramente legível.
- Não invente embalagem. Não duplique o produto. Dedos, pega, escala, perspectiva e sombra devem ser naturais.
- Produto e cartão compartilham o protagonismo; nenhum texto comercial adicional é permitido.`,
    collection: `- Cena de mesa escura, quente e premium, com profundidade de campo suave.
- Uma mão segura naturalmente um dos produtos como protagonista. Outra mão segura um cartão promocional físico com a marca da loja/anunciante e a oferta completa.
- Os outros três produtos aparecem apoiados e separados sobre a mesa, suficientemente visíveis para comunicar coleção.
- Não invente caixas ou acessórios. Não permita dedos deformados, objetos fundidos ou produtos ocultos.
- Produto principal, variedade da coleção e cartão/oferta compartilham a hierarquia.`,
  },
  'REF-0006': {
    title: 'EDITORIAL LIFESTYLE COM PAINEL DE OFERTA',
    single: `- Cena editorial aspiracional em ambiente urbano sofisticado, luz natural suave e paleta neutra e quente.
- Uma pessoa ocupa um dos lados do quadro usando ou carregando o produto-alvo; o produto aparece grande, desobstruído e legível, com foco nítido sobre ele.
- O casting segue o público declarado do produto. Pose natural e serena, mãos corretas, nada do produto coberto por cabelo, tecido ou dedos.
- O lado oposto da foto é mantido limpo e levemente escurecido e recebe todo o texto, empilhado de cima para baixo: linha de abertura curta em caixa alta espaçada, título em tipografia serifada elegante com acento metálico da identidade da loja e, abaixo, o painel da oferta.
- O painel da oferta fica dentro de uma moldura discreta, com um degrau por linha: a condição à esquerda e o valor da vantagem dominante à direita. Se a oferta tiver um único degrau, use uma única linha.
- Sem CTA, selo, urgência ou benefício que não esteja confirmado no contexto. O texto nunca invade o rosto nem o produto.
- Acabamento de campanha de moda premium: pouco texto, muito ar e contraste suave.`,
  },
  'REF-0007': {
    title: 'MOSAICO EDITORIAL',
    collection: `- Grade editorial premium: os quatro produtos distribuídos em módulos de tamanhos diferentes ao redor de um cartão promocional central.
- Cada produto ocupa sozinho o seu módulo, fotografado de cima sobre superfície neutra contínua, com luz suave e sombra própria realista. Nenhum módulo pode ficar vazio e nenhum produto pode ser cortado a ponto de perder a silhueta.
- Os módulos são separados por respiros limpos e alinhados entre si; nenhum produto invade o módulo do vizinho.
- Cada item deve ser grande o suficiente para reconhecer silhueta, cor, material, acabamentos e logos existentes. Quando um item for um look completo, preserve-o como unidade; quando for peça isolada, não invente peças complementares.
- O cartão central concentra a logo da loja/anunciante, um título curto da coleção e a oferta completa. A oferta é o principal elemento textual da peça, com o valor da vantagem dominante; o título é secundário.
- Fundo e cartão em tons neutros coerentes com a identidade da loja. Sem pessoas, sem CTA, sem selo e sem elemento decorativo extra.`,
  },
  'REF-0008': {
    title: 'ANÚNCIO NATIVO RETRÔ',
    single: `- Estética deliberadamente informal de anúncio nativo retrô, inspirada em uma janela genérica de editor gráfico antigo sobre fundo colorido de computador dos anos 2000.
- Não copie nome, logo, ícones, botões ou interface proprietária de nenhum sistema operacional ou programa real.
- Dentro da janela genérica, mostre uma única unidade do produto grande e reconhecível sobre fundo claro.
- Use uma headline curta com aparência manuscrita vermelha e a oferta completa em destaque na parte inferior.
- Mantenha a imperfeição controlada e divertida, mas preserve legibilidade, produto, marca e qualidade comercial.`,
    collection: `- Estética informal de anúncio nativo retrô, dentro de uma janela genérica de editor gráfico antigo sobre fundo digital colorido dos anos 2000.
- Não copie nome, logo, ícones, botões ou interface proprietária de nenhum sistema operacional ou programa real.
- Dentro da janela, organize os quatro produtos distintos em composição dinâmica, sem duplicação e sem sobreposição que esconda detalhes.
- Use uma headline manuscrita vermelha curta relacionada à coleção e destaque a oferta completa na parte inferior.
- Mantenha a imperfeição divertida e controlada, com texto legível e identidade da loja/anunciante preservada.`,
  },
  'REF-0009': {
    title: 'VITRINE TÁTIL DE COLEÇÃO',
    collection: `- Fundo e superfície de tecido texturizado em um único tom profundo, com luz de estúdio concentrada no centro e cantos escurecidos.
- Os quatro produtos formam um grupo escultórico no meio do quadro: alguns em pé e escalonados em profundidade, um deitado à frente mostrando o lado que os outros escondem. Nenhum produto cobre a silhueta do vizinho.
- Cada produto mantém a sua própria cor e o seu próprio acabamento; o fundo não recolore nenhum deles.
- Headline curta em três linhas no topo, clara sobre o fundo escuro, ocupando a largura livre acima dos produtos.
- Selo circular claro em uma das laterais, na altura do grupo, com a oferta em duas linhas separadas por um traço curto.
- Faixa clara e estreita no rodapé com uma única garantia ou condição, somente quando confirmada no contexto, e uma linha fina de assinatura abaixo dela.
- Acabamento de campanha de catálogo premium: pouca informação, muito contraste e textura visível.`,
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
    collection: `- Fundo de cor sólida derivada da identidade da loja, com vinheta suave escurecendo as bordas e clareando o centro.
- Os quatro produtos aparecem em fileira escalonada e levemente diagonal, todos no mesmo ângulo de três quartos, cada um em uma cor distinta e confirmada. Nenhum produto pode ser recolorido para completar a fileira.
- Os produtos ficam grandes e centralizados na faixa média do quadro, com sombra projetada suave e igual entre eles.
- Headline curta em caixa alta pesada no topo, em duas linhas, com uma linha fina de nome da coleção logo abaixo.
- Abaixo dos produtos, um título secundário curto em caixa alta e até duas linhas de apoio factual.
- Oferta no rodapé dentro de uma cápsula de contorno fino, com um ícone simples à esquerda do texto.
- Sensação de lançamento: cor viva, fundo limpo e nenhum elemento decorativo extra.`,
  },
  'REF-0012': {
    title: 'CATÁLOGO AMPLO DE COLEÇÃO',
    collection: `- Fundo branco frio e contínuo de catálogo, sem cenário e sem textura.
- A oferta é a headline do topo, partida em dois blocos de cores diferentes separados por um traço vertical, com uma palavra pequena e espaçada logo abaixo. É o maior texto da peça.
- Os quatro produtos ocupam a faixa central, todos no mesmo ângulo, no mesmo tamanho e com o mesmo espaçamento entre si. Use uma fileira única quando couber, ou duas fileiras de dois quando a proporção exigir.
- Cada produto é uma variante ou modelo distinto e confirmado, com cor, material e detalhes próprios. Não invente cores para completar a grade.
- Abaixo dos produtos, uma faixa escura curta em caixa alta com uma informação factual, seguida de até duas linhas de apoio.
- Uma última linha fina com ícone pode trazer uma condição de entrega ou serviço, apenas quando confirmada no contexto.
- Tudo centralizado no mesmo eixo, com muito respiro e legibilidade de catálogo.`,
  },
  'REF-0015': {
    title: 'VITRINE MODULAR CLARA',
    collection: `- Fundo claro e neutro, com uma moldura de filete discreto acompanhando a borda da peça.
- Os quatro produtos aparecem apoiados sobre blocos geométricos claros de alturas diferentes e sobre as suas embalagens reais, formando níveis escalonados que ocupam a maior parte do quadro.
- Cada produto fica em seu próprio nível, separado e inteiramente visível. Os blocos são apoios neutros, sem marca e sem texto.
- O canto superior livre concentra a comunicação: uma linha curta em caixa alta espaçada, a oferta em duas linhas logo abaixo e até três benefícios confirmados com ícones de traço fino.
- Luz ampla de vitrine, reflexos controlados e sombras curtas e limpas sob cada apoio.
- Nada de elemento decorativo além dos blocos e das embalagens confirmadas.`,
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
    single: `- Fundo branco de infográfico, limpo, com os dois territórios separados apenas pelo espaço.
- Headline curta em duas linhas no topo, na cor da marca, nomeando o problema.
- Coluna esquerda com até três cartões claros empilhados. Cada cartão traz a miniatura de uma alternativa, um ícone de recusa, o nome da alternativa e uma linha curta dizendo por que ela falha. Só entram alternativas e objeções confirmadas nas fontes.
- Lado direito com o produto grande, em uma ou duas unidades reais em diagonal, nítido e inteiro. É o maior elemento da peça.
- Um selo circular pequeno na cor da marca, encostado no produto, destaca o diferencial factual principal.
- No rodapé, uma miniatura arredondada com o resultado real e uma seta discreta ligando o produto a ela, apenas quando esse resultado estiver comprovado.
- Hierarquia clínica: problema em cima, alternativas à esquerda, solução à direita, prova embaixo.`,
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
    single: `- Cena de ambiente real de uso, com fundo suavemente desfocado e coerente com o produto.
- O produto ocupa a metade esquerda, grande e nítido, segurado por uma mão de forma natural ou apoiado no próprio ambiente. É o maior elemento da peça.
- A metade direita recebe três cartões claros de cantos arredondados, empilhados e do mesmo tamanho.
- Cada cartão traz, nesta ordem: o retrato do cliente apenas quando a foto for real e fornecida, as estrelas apenas quando a avaliação for confirmada, uma headline curta em duas linhas e o trecho fiel do depoimento.
- Nenhum nome, nota, número ou depoimento pode ser inventado. Sem fonte, o cartão sai da peça em vez de ser preenchido.
- No rodapé, até três benefícios confirmados, cada um com ícone circular de traço fino, separados por divisórias verticais discretas.
- Os cartões nunca cobrem o produto nem encostam nele.`,
  },
  'REF-0021': {
    title: 'COLEÇÃO EM PEDESTAL DE LUXO',
    collection: `- Cenário escuro e profundo de estúdio, com luz dirigida no centro e detalhes metálicos discretos derivados da identidade da loja.
- Headline elegante em duas linhas no topo, em tipografia serifada e cor metálica, com uma linha fina de apoio logo abaixo, entre dois filetes curtos.
- Os quatro produtos aparecem alinhados e em pé sobre um pedestal central, todos na mesma altura de apoio, frontais, grandes e sem sobreposição.
- Cada produto mantém o seu próprio material, mostrador, cor e acabamento. Nada de recolorir ou repetir o mesmo produto para completar a fileira.
- A oferta aparece em uma placa retangular com borda metálica fina, integrada à frente do pedestal, logo abaixo dos produtos.
- Um detalhe geométrico metálico pode fechar o rodapé, sem texto e sem função comercial.
- Acabamento de campanha de alto luxo: fundo escuro, brilho controlado e pouquíssimo texto.`,
  },
  'REF-0022': {
    title: 'VITRINE FÍSICA COM OFERTA',
    collection: `- Cena fotorrealista dentro de uma loja física premium, vista sobre o balcão, com luz quente e fundo de expositores suavemente desfocado.
- Sobre o balcão, quatro produtos elegíveis aparecem distribuídos em bandejas e expositores reais, todos visíveis e separados entre si.
- Um dos produtos aparece em destaque dentro do seu estojo aberto, em primeiro plano, como protagonista da cena.
- Um cartão físico vertical apoiado no balcão concentra a comunicação: um título curto no topo, a oferta e, quando existirem degraus, uma linha por degrau. O cartão parece impresso de verdade, com a letra da identidade da loja.
- Sublinhados ou marcações no cartão podem destacar a oferta, desde que pareçam parte do material impresso.
- Não invente motivo promocional, endereço, data, encerramento de loja ou urgência que não estejam no contexto.
- A loja é ambientação: ela nunca pode ocupar mais atenção que os produtos e o cartão.`,
  },
  'REF-0023': {
    title: 'MOSAICO DE PRODUTO EM USO',
    collection: `- Mosaico editorial de painéis fotográficos com um painel grande e vários painéis menores, todos separados por respiros brancos limpos e alinhados entre si.
- O painel grande mostra os produtos em still, apoiados sobre um suporte curvo neutro, com adereço natural discreto ao fundo.
- Os painéis menores mostram os produtos em uso real, em close, e um deles mostra a embalagem real quando ela estiver confirmada.
- Cada painel traz um produto ou combinação distinta e rastreável às fontes. Nenhum painel pode repetir exatamente o mesmo enquadramento do vizinho.
- Luz suave, materiais táteis, paleta quente e neutra, com o mesmo tratamento de cor em todos os painéis.
- Quando a peça precisar de texto comercial, ele entra em um cartão discreto dentro de um único painel, sem cobrir nenhum produto.
- Nas fotos de uso aparecem apenas mãos, pulsos ou a parte do corpo onde o produto é usado. Sem rosto e sem identidade.`,
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
    collection: `- Vista de cima sobre superfície lisa de tom claro e quente, com sombra natural suave e nenhuma textura marcada.
- A marca da loja aparece em wordmark grande no topo, com um filete curto abaixo e uma linha em caixa alta espaçada nomeando a coleção.
- Os quatro produtos ou looks distintos ocupam os quatro cantos do quadro, cada um em seu próprio quadrante, dispostos em torno do centro.
- Quando um item for um conjunto, as peças dele ficam juntas e alinhadas no mesmo quadrante, sem se misturar com o conjunto vizinho.
- Tecidos, cores, estampas e logos permanecem fiéis a cada item. Não crie combinações que não existam nas fontes.
- Um selo circular no centro do quadro concentra a oferta, com o valor da vantagem dominante e uma borda fina de acento.
- O selo nunca cobre parte reconhecível de nenhum dos quatro itens.`,
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
    collection: `- Mosaico de blocos fotográficos que sangram até as bordas da peça, sem moldura externa e sem respiro branco entre eles.
- Cada bloco traz um produto ou look distinto, alternando pessoa usando a peça e still do produto isolado. Nenhum look invade o bloco do vizinho.
- As fotos compartilham a mesma paleta quente e neutra, a mesma luz de estúdio suave e o mesmo tratamento de cor, como se fossem da mesma sessão.
- No centro, um cartão vertical de cantos arredondados e borda fina, em tom claro, recebe toda a comunicação: um ornamento gráfico simples no topo, o wordmark da loja, a headline da mecânica em duas linhas e uma linha por degrau da oferta, separadas por filetes curtos.
- O cartão fica sobre o cruzamento dos blocos e nunca cobre a parte reconhecível de nenhum produto.
- Os quatro produtos ou looks precisam ser distintos e rastreáveis às fontes; não invente combinações.
- Quando houver pessoa nos blocos, o enquadramento fecha na peça vendida e o rosto, se aparecer, aparece inteiro.`,
  },
  'REF-0039': {
    title: 'VITRINE MODULAR COM CARD DE DESCONTO',
    collection: `- Grade modular sobre fundo branco frio, com blocos de tamanhos diferentes e respiros limpos entre eles.
- Os produtos aparecem apoiados sobre blocos geométricos brancos de alturas diferentes, um produto por módulo, todos com a mesma luz ampla de catálogo e sombras curtas.
- Um único módulo traz uma pessoa usando um dos produtos e funciona como âncora da grade; os demais são still de produto.
- Wordmark da loja centralizado no topo do quadro, em corpo discreto.
- No centro, um cartão claro de cantos arredondados reúne: um rótulo curto em caixa alta espaçada, a headline da mecânica em duas cores e os degraus da oferta lado a lado, separados por divisórias verticais, com uma linha fina de condição abaixo.
- O valor da vantagem é o elemento dominante de cada degrau. Se a oferta tiver um único degrau, use uma coluna só.
- Os quatro produtos precisam ser distintos e confirmados. Acessórios só entram quando estiverem nas fontes.
- O cartão central não pode cobrir parte reconhecível de nenhum produto.`,
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
7. A seleção e a ordem dos produtos são LIVRES dentro dos itens elegíveis. A imagem futura deverá escolher quatro produtos ou looks distintos que melhor representem a coleção. Só trate IDs específicos como obrigatórios se esta mensagem os declarar explicitamente.
8. Se não existirem quatro itens confirmáveis, peça somente a menor fonte adicional necessária. Não gere a imagem ainda.
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
Regra de seleção visual: escolher livremente quatro produtos ou looks distintos entre os elegíveis.
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
      return `CRIATIVO ${itemLabel(index, round)} — ${title}\n${recipe}${limite}${peopleLines ? `\n${peopleLines}` : ''}`;
    })
    .join('\n\n');
}

export function compileReferencePrompt(campaign: CampaignInput, reference: Reference) {
  const tested = testedDirections[reference.id];
  const title = tested?.title ?? reference.name.toUpperCase();
  const baseRecipe = tested?.[campaign.mode] ?? `- ${reference.recipe}`;
  const recipe = `${baseRecipe}${reference.limits ? `
- Limite operacional: ${reference.limits}` : ''}`;
  const peopleText = peopleRule(reference);
  const peopleBlock = peopleText ? `${peopleText}\n\n` : '';
  const contentRule = campaign.mode === 'collection'
    ? `- Anuncie somente a coleção “${campaign.exactTarget}”.
- Mostre simultaneamente quatro produtos ou looks distintos e elegíveis do CONTEXTO CAPTURADO — V004.
- Preserve a separação visual entre os quatro itens; não sugira um kit obrigatório e não misture marcas, logos, cores ou componentes.`
    : `- Anuncie somente o produto “${campaign.exactTarget}” e a variante factual registrada no CONTEXTO CAPTURADO.
- Mostre o mesmo produto sem redesenhar, recolorir, misturar variantes ou inventar componentes.`;

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE UM criativo publicitário mestre em proporção 4:5.

${HOUSE_PRODUCT_RULE}

CONTEÚDO OBRIGATÓRIO
${contentRule}
- Use a loja/anunciante, a marca do produto e o idioma exatamente como registrados no contexto.
- Preserve exatamente a oferta recebida: “${campaign.offer}”.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.
- Se houver conflito entre a direção visual e a leitura imediata do produto, a leitura do produto vence.

DIREÇÃO VISUAL — ${title}
${recipe}

${peopleBlock}${HOUSE_DESIGN_RULE}

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
- Preserve exatamente a oferta recebida: ${campaign.offer}.
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
- Oferta exata: “${campaign.offer}”.
- Idioma: use exatamente o idioma registrado no CONTEXTO CAPTURADO — V004.
- Cada criativo deve comunicar variedade e mostrar simultaneamente quatro produtos ou looks distintos e elegíveis do contexto factual.
- Os quatro produtos ou looks devem permanecer visualmente separados e reconhecíveis; a peça não pode sugerir que formam um kit obrigatório.
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
3. Cada criativo mostrará quatro produtos ou looks distintos e elegíveis, comunicando coleção.
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
