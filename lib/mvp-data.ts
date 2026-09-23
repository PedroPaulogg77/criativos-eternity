/*
 * O que faz o cliente comprar. Uma referência declara quais argumentos ela sustenta;
 * a campanha declara o argumento do produto. O cruzamento ordena a biblioteca.
 */
export type SalesDriver = 'funcao' | 'estetica';

/* A mecânica comercial muda o espaço e a hierarquia que a direção comporta. */
export type OfferMechanic = 'percentual' | 'leve-mais' | 'progressivo';

export const offerMechanics: Array<{ value: OfferMechanic; label: string; description: string }> = [
  { value: 'percentual', label: 'Desconto de até X%', description: 'Uma oferta direta, como “até 70% OFF”.' },
  { value: 'leve-mais', label: 'Compre X, leve Y', description: 'Quantidade bonificada, como “compre 1 e ganhe 1”.' },
  { value: 'progressivo', label: 'Desconto progressivo', description: 'Vários degraus que aumentam conforme a compra cresce.' },
];

/*
 * A mecânica da oferta sai do texto que o aluno já escreveu, em vez de virar
 * pergunta. Ela não corta nenhuma direção: só põe na frente as peças que já
 * nasceram anunciando o mesmo tipo de oferta. Quando não reconhece, a galeria
 * simplesmente não ganha essa aproximação e ninguém perde referência.
 */
export function guessOfferMechanic(offer: string): OfferMechanic | null {
  const texto = offer.toLowerCase();
  const escada = /(progressiv|quanto mais|je mehr|desto mehr|the more|mehr sparen|mais voc[êe] leva)/.test(texto)
    /* Dois ou mais degraus escritos na mesma frase também são uma escada. */
    || new Set(texto.match(/\d+\s*%/g) ?? []).size >= 2;
  if (escada) return 'progressivo';
  if (/(leve|ganhe|gr[áa]tis|gratis|gratuito|free|gratuit|kaufe|erhalte|f[åa] \d|k[øo]b|pague \d|\d\s*\+\s*\d|2x1|3x2)/.test(texto)) return 'leve-mais';
  if (/%|off|desconto|rabatt|reduziert|sale|descuento/.test(texto)) return 'percentual';
  return null;
}

/* Fato que uma direção específica precisa ter no contexto antes de ser usada. */
export type ReferenceRequirement = {
  label: string;
  question: string;
};

export const salesDrivers: Array<{ value: SalesDriver; label: string; description: string }> = [
  { value: 'funcao', label: 'Uma funcionalidade', description: 'O diferencial não aparece na foto e precisa ser dito em texto.' },
  { value: 'estetica', label: 'A estética', description: 'A foto vende sozinha. O produto é bonito e isso basta.' },
];

export type Reference = {
  id: string;
  name: string;
  family: 'Oferta tipográfica' | 'Produto herói' | 'Lifestyle' | 'Editorial';
  category: 'Relógios & joias' | 'Vestuário' | 'Calçados' | 'Óculos' | 'Outros';
  modes: Array<'single' | 'collection'>;
  people?: 'sem-pessoa' | 'corpo-suporte' | 'humanizado';
  drivers?: SalesDriver[];
  /* Mecânicas que a tipografia e a composição da referência realmente comportam. */
  offerMechanics?: OfferMechanic[];
  /*
   * Direção de coleção que também serve a um produto só: os módulos se preenchem
   * com as cores ou as vistas confirmadas do mesmo item. O número que morava aqui
   * deixou de existir quando a pergunta das variações saiu da trilha — quantas
   * existem é dado do CONTEXTO CAPTURADO, e a receita encolhe sozinha.
   */
  fillsWithVariants?: true;
  /* A repetição de unidades é a própria linguagem visual desta direção. */
  repeatsSameProduct?: boolean;
  /* Peca que na origem nao tem uma palavra comercial. O nucleo para de injetar oferta. */
  silent?: boolean;
  /* Criativo nativo: a peca nao pode parecer anuncio. Troca a regra da casa pela regra
     do nativo, dispensa design e presenca humana, e faz o prompt pedir a copy junto. */
  native?: boolean;
  /* Peca desenhada como molde: marca escrita SEU LOGO, idioma do aluno, produto neutro.
     O oposto e o criativo real capturado de outra loja, com marca e idioma dela. Os dois
     servem igual como direcao, mas o molde comunica de cara que e para reaproveitar —
     por isso ele abre a galeria. */
  molde?: boolean;
  /* Quantos produtos a grade comporta. A quantidade faz parte da diagramação:
     quatro itens em volta de um cartão só produzem uma grade 2x2. */
  slots?: number;
  tags: string[];
  image: string;
  sample?: string;
  requirement?: ReferenceRequirement;
  limits?: string;
  recipe: string;
};

export const references: Reference[] = [
  {
    id: 'REF-0001',
    name: 'Split premium escuro',
    family: 'Oferta tipográfica',
    category: 'Relógios & joias',
    modes: ['single', 'collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['split', 'luxo', 'produto grande'],
    image: '/references/ref-0001.png',
    sample: '/samples/sample-0001.png',
    recipe:
      'Composição assimétrica: marca, título e oferta em um painel à esquerda; produto ou coleção à direita. Fundo de estúdio escuro com gradiente suave, luz concentrada, base mineral e sombras de contato realistas. A oferta é o principal elemento textual.',
  },
  {
    id: 'REF-0002',
    name: 'Lifestyle esportivo',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['movimento', 'pessoa', 'camadas'],
    image: '/references/ref-0002.png',
    recipe:
      'Cena lifestyle dinâmica e urbana, com pessoa em ação ao centro, headline dominante, benefícios laterais somente quando confirmados e oferta em faixas inferiores. Alto contraste, sensação de movimento e produto claramente aplicado.',
      requirement: {
        label: 'prova social numérica confirmada',
        question: 'O contexto confirma um número real de clientes, vendas ou avaliações para a linha de prova social?',
      },
  },
  {
    id: 'REF-0003',
    name: 'Cenário tátil e quente',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['single', 'collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['tátil', 'diagonal', 'selo oferta'],
    image: '/references/ref-0003.png',
    sample: '/samples/sample-0003.png',
    recipe:
      'Fundo e superfície tátil em tom quente, natural e sofisticado, com iluminação difusa. Produto(s) em diagonais suaves, headline curta no topo e oferta completa dentro de um selo circular de alto contraste no canto inferior.',
  },
  {
    id: 'REF-0005',
    name: 'Cartão físico de oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['single', 'collection'],
    slots: 4,
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['mãos', 'cartão físico', 'oferta diegética'],
    image: '/references/ref-0005.png',
    sample: '/samples/sample-0005.png',
    recipe:
      'Cena de mesa escura, quente e premium, com profundidade de campo suave. Uma mão sustenta naturalmente o produto principal e outra segura um cartão promocional físico com a marca e a oferta completa. Sem embalagens ou acessórios inventados.',
  },
  {
    id: 'REF-0006',
    name: 'Lifestyle premium',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['modelo', 'luxo urbano', 'produto em uso'],
    image: '/references/ref-0006.png',
    recipe:
      'Composição aspiracional dividida: painel editorial escuro para a mensagem e modelo usando o produto no lado oposto. Paleta neutra, acabamento premium e oferta claramente hierarquizada, sem importar marcas ou padrões da referência.',
  },
  {
    id: 'REF-0007',
    name: 'Mosaico editorial',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 6,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['mosaico', 'grade', 'multiproduto'],
    image: '/references/ref-0007.png',
    recipe:
      'Mosaico modular de produtos em torno de um card central de oferta. Pesos variados entre os módulos, separadores limpos, luz de catálogo premium e cada item visualmente rastreável, sem variantes ou SKUs inventados.',
  },
  {
    id: 'REF-0008',
    name: 'Native ad retrô',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single', 'collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['retrô', 'native ad', 'feito à mão'],
    image: '/references/ref-0008.png',
    sample: '/samples/sample-0008.png',
    recipe:
      'Estética informal de anúncio nativo retrô dentro de uma janela genérica de editor antigo, sobre fundo digital colorido dos anos 2000. Composição dinâmica, headline manuscrita vermelha e oferta completa na parte inferior, sem copiar interface proprietária.',
  },
  {
    id: 'REF-0009',
    name: 'Vitrine tátil de coleção',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['coleção', 'textura', 'grupo', 'oferta lateral'],
    image: '/references/ref-0009.png',
    limits: 'Coleção com quatro produtos visualmente distintos.',
    recipe:
      'Cenário monocromático de textura rica e iluminação dramática suave. Quatro produtos distintos formam um grupo central escultórico, sem ocultar suas silhuetas. Headline grande no alto, oferta em selo lateral e somente uma faixa factual curta no rodapé.',
  },
  {
    id: 'REF-0010',
    name: 'Produto zenital com benefícios',
    family: 'Oferta tipográfica',
    category: 'Calçados',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    tags: ['zenital', 'simétrico', 'benefícios', 'claro'],
    image: '/references/ref-0010.png',
    limits: 'Benefícios só aparecem quando confirmados no contexto.',
    recipe:
      'Produto visto de cima e centralizado em fundo claro, com ampla margem. Headline em duas linhas logo abaixo, seguida de até três benefícios factuais, uma frase curta e oferta em faixa inferior. Simetria, alta legibilidade e estética de catálogo funcional.',
      requirement: {
        label: 'benefícios confirmados',
        question: 'O contexto confirma cada benefício que vai aparecer escrito na peça?',
      },
  },
  {
    id: 'REF-0011',
    name: 'Trio de coleção cromática',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['collection'],
    slots: 3,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    fillsWithVariants: true,
    tags: ['trio', 'cores', 'lançamento', 'fundo suave'],
    image: '/references/ref-0011.png',
    limits: 'A origem mostra um trio; com menos de três itens confirmados a fileira encurta em vez de ganhar item inventado.',
    recipe:
      'Quatro produtos distintos organizados em fileira escalonada sobre superfície contínua e fundo atmosférico suave. Headline curta no alto, título da coleção secundário e oferta em cápsula no rodapé. Paleta do ambiente deriva da identidade da loja e não recolore os produtos.',
  },
  {
    id: 'REF-0012',
    name: 'Catálogo amplo de coleção',
    family: 'Editorial',
    category: 'Calçados',
    modes: ['collection'],
    slots: 9,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    fillsWithVariants: true,
    tags: ['catálogo', 'fileiras', 'variedade', 'fundo branco'],
    image: '/references/ref-0012.png',
    limits: 'A origem é um catálogo largo do mesmo modelo; com poucos itens confirmados a grade encolhe em vez de ganhar cor inventada.',
    recipe:
      'Fundo branco de catálogo com headline de oferta dividida em duas cores no topo. Exatamente quatro produtos distintos ocupam uma única fileira ampla, grandes e igualmente legíveis. Uma faixa curta de disponibilidade ou título factual aparece abaixo, seguida apenas de informações confirmadas.',
  },
  {
    id: 'REF-0015',
    name: 'Vitrine modular clara',
    family: 'Editorial',
    category: 'Óculos',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 3,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['plintos', 'coleção', 'vitrine', 'benefícios'],
    image: '/references/ref-0015.png',
    limits: 'Cada módulo é um produto com a embalagem real dele; sem a foto da embalagem nas fontes, o módulo traz só o produto.',
    recipe:
      'Vitrine clara com plintos brancos e quatro produtos distintos distribuídos em níveis. Oferta grande e curta no quadrante superior esquerdo, seguida de até três benefícios factuais com ícones simples. Bordas discretas, sombras limpas e separação inequívoca entre os itens.',
  },
  {
    id: 'REF-0016',
    name: 'Close editorial em uso',
    family: 'Lifestyle',
    category: 'Óculos',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['close', 'rosto', 'produto em uso', 'benefícios'],
    image: '/references/ref-0016.png',
    limits: 'Indicado quando o produto pode ser mostrado corretamente em uso e vende pelo desejo. Não comporta lista de benefícios: se o produto precisa de argumento escrito, use outra direção.',
    recipe:
      'Close assimétrico de pessoa usando o produto ocupa a metade esquerda, com corte editorial deliberado sem deformar rosto ou produto. A metade direita fica limpa para oferta dominante e até quatro benefícios confirmados em linhas separadas. Fundo claro, contraste alto e leitura imediata.',
  },
  {
    id: 'REF-0017',
    name: 'Antes e depois direto',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['antes e depois', 'resultado', 'comparação', 'produto pequeno'],
    image: '/references/ref-0017.jpg',
    requirement: {
      label: 'antes e depois comprovado',
      question: 'O contexto confirma um antes e depois real do mesmo caso, causado pelo produto?',
    },
    limits: 'Só pode ser usado com resultado visual e comparação comprovados.',
    recipe:
      'Comparação vertical dividida ao meio mostrando antes e depois do mesmo enquadramento, com mudança visual somente quando comprovada pelas fontes. Produto pequeno sobreposto no rodapé e headline factual em caixa de alto contraste. Sem retoque exagerado nem resultado inventado.',
  },
  {
    id: 'REF-0018',
    name: 'Comparativo problema e solução',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['comparativo', 'problema solução', 'infográfico', 'benefícios'],
    image: '/references/ref-0018.jpg',
    requirement: {
      label: 'comparação comprovada',
      question: 'O contexto confirma alternativas reais, a limitação de cada uma e o resultado factual do produto?',
    },
    limits: 'Exige problemas, alternativas e benefícios confirmados nas fontes.',
    recipe:
      'Infográfico claro dividido entre alternativas ou problemas no lado esquerdo e produto protagonista no lado direito. Headline curta no topo, três objeções factuais em cartões e um benefício visual comprovado no rodapé. Produto grande, setas discretas e hierarquia clínica limpa.',
  },
  {
    id: 'REF-0019',
    name: 'Como usar em três passos',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['tutorial', 'três passos', 'demonstração', 'infográfico'],
    image: '/references/ref-0019.png',
    requirement: {
      label: 'três etapas reais de uso',
      question: 'O contexto confirma exatamente três etapas reais para usar este produto?',
    },
    limits: 'Requer sequência real de uso com exatamente três etapas confirmáveis.',
    recipe:
      'Headline operacional no topo, produto grande e isolado ao centro e três cartões numerados na faixa inferior demonstrando uma sequência real de uso. Fundo claro, cor de acento da marca e instruções muito curtas. Cada passo deve corresponder ao funcionamento confirmado do produto.',
  },
  {
    id: 'REF-0020',
    name: 'Produto com depoimentos',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['depoimentos', 'prova social', 'produto em uso', 'cartões'],
    image: '/references/ref-0020.png',
    limits: 'Os três cartões são depoimentos publicitários que fazem parte da direção visual.',
    recipe:
      'Produto grande em uso ocupa um lado da cena e três cartões de depoimentos empilhados ocupam o outro. Os depoimentos são parte da direção visual e entram mesmo sem avaliações fornecidas. Rodapé com até três benefícios factuais e fundo contextual suave.',
      requirement: {
        label: 'três relatos de clientes com foto',
        question: 'O contexto traz três relatos reais de clientes, cada um com a foto da pessoa?',
      },
  },
  {
    id: 'REF-0021',
    name: 'Coleção em pedestal de luxo',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 3,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['luxo', 'pedestal', 'coleção', 'oferta'],
    image: '/references/ref-0021.png',
    limits: 'Os itens sobre o pedestal vêm da lista factual: produtos diferentes ou cores confirmadas do mesmo modelo.',
    recipe:
      'Cenário escuro premium com detalhes metálicos e pedestal central. Quatro produtos distintos aparecem alinhados e grandes, sem sobreposição. Headline elegante no topo, título curto da coleção e oferta completa em placa integrada ao pedestal, com luz dirigida e acabamento de campanha de luxo.',
  },
  {
    id: 'REF-0022',
    name: 'Vitrine física com oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
    slots: 5,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['loja física', 'vitrine', 'cartão', 'coleção'],
    image: '/references/ref-0022.png',
    limits: 'A loja física é uma ambientação; não deve inventar endereço nem alegar encerramento.',
    recipe:
      'Cena fotorrealista de vitrine premium vista sobre balcão, com quatro produtos elegíveis em bandejas ou expositores e um produto principal em estojo aberto. Um cartão físico vertical concentra marca, título da coleção e oferta literal. Não incluir motivo promocional, endereço ou urgência não fornecidos.',
  },
  {
    id: 'REF-0023',
    name: 'Mosaico de produto em uso',
    family: 'Editorial',
    category: 'Relógios & joias',
    modes: ['collection'],
    fillsWithVariants: true,
    slots: 6,
    people: 'corpo-suporte',
    drivers: ['estetica'],
    silent: true,
    tags: ['mosaico', 'uso real', 'detalhes', 'coleção'],
    image: '/references/ref-0023.png',
    limits: 'Ideal para itens pequenos que possam ser mostrados em uso sem perder detalhes.',
    recipe:
      'Mosaico editorial com um painel principal grande e quatro painéis menores mostrando produtos distintos em uso, close e embalagem real quando disponível. Luz suave, materiais táteis e separadores claros. Um card discreto recebe marca, título e oferta sem cobrir os produtos.',
  },
  {
    id: 'REF-0024',
    name: 'Produto em caixa presenteável',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    silent: true,
    tags: ['caixa', 'presente', 'close', 'luxo claro'],
    image: '/references/ref-0024.png',
    limits: 'Só usar caixa real confirmada; caso contrário, substituir por expositor neutro.',
    recipe:
      'Close premium de um único produto dentro de sua caixa real aberta, em tons claros e iluminação quente lateral. Marca pequena no interior apenas quando confirmada. O produto permanece totalmente visível, com textura e escala fiéis; título curto e oferta ocupam espaço negativo sem cobrir a peça.',
  },
  {
    id: 'REF-0025',
    name: 'Flat lay radial de coleção',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['flat lay', 'coleção', 'radial', 'selo central'],
    image: '/references/ref-0025.png',
    limits: 'Mostra quatro looks ou conjuntos distintos sem criar combinações inexistentes.',
    recipe:
      'Flat lay zenital em fundo claro, com quatro produtos ou looks distintos distribuídos radialmente ao redor de um selo central grande com a oferta. Marca e título curto ficam no topo. Tecidos, cores, logos e pares de peças permanecem fiéis e cada conjunto ocupa seu próprio quadrante.',
  },
  {
    id: 'REF-0026',
    name: 'Modelo editorial com oferta gigante',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['modelo', 'oferta gigante', 'premium', 'benefícios'],
    image: '/references/ref-0026.png',
    limits: 'Requer imagem factual suficiente para preservar a peça vestida. Esta direção foi construída em torno de uma oferta curta, do tipo percentual. Não usar quando a oferta for uma frase longa de leve-mais-pague-menos: a tipografia gigante não sustenta mais de duas linhas.',
    recipe:
      'Modelo em corpo inteiro usando o produto ocupa a metade direita em cenário arquitetônico claro. A esquerda concentra marca, título factual e oferta muito grande; rodapé escuro recebe até três benefícios confirmados. Anatomia, caimento, logos e detalhes da peça devem permanecer íntegros.',
  },
  {
    id: 'REF-0027',
    name: 'Unboxing com oferta na tampa',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['unboxing', 'caixa de envio', 'oferta física', 'zenital'],
    image: '/references/ref-0027.png',
    limits: 'A caixa é genérica; não inventar embalagem oficial ou logos de terceiros.',
    recipe:
      'Vista zenital de uma caixa de envio genérica aberta sobre superfície realista, com o produto dobrado e inteiramente reconhecível. A parte interna da tampa concentra marca, título e oferta como impressão física. Papel de proteção discreto, luz natural e nenhuma embalagem oficial inventada.',
  },
  {
    id: 'REF-0028',
    name: 'Detalhe funcional com depoimento',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['detalhe', 'feature', 'depoimento', 'close'],
    image: '/references/ref-0028.png',
    limits: 'Requer detalhe funcional e depoimento reais; omitir o depoimento se não houver fonte.',
    recipe:
      'Close de uso real enquadra o detalhe funcional do produto e a interação da mão. Um bloco editorial de pincel recebe depoimento real curto, enquanto dois selos menores apontam o recurso e um benefício confirmado. Fundo neutro, produto dominante e nenhuma alegação sem fonte.',
      requirement: {
        label: 'frase de cliente e mecanismo visível',
        question: 'O contexto traz a frase de um cliente com nome e um detalhe do produto que a foto consegue mostrar?',
      },
  },
  {
    id: 'REF-0037',
    name: 'Escada de desconto com modelo',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['escada de desconto', 'modelo', 'painel lateral', 'claro'],
    image: '/references/ref-0037.png',
    limits: 'Mostra um único look. Os degraus da oferta vêm do contexto e devem estar confirmados.',
    recipe:
      'Peça clara e editorial com composição assimétrica: comunicação à esquerda, com marca no alto e título curto; pessoa usando o produto à direita, grande e protagonista. A escada de desconto é o principal elemento textual, em degraus empilhados de força crescente, com o último marcado como melhor valor. A pessoa aparece de frente, em pose relaxada e enquadrada do queixo para baixo, com o produto inteiramente legível. Fundo neutro e quente contínuo entre os dois territórios, luz ampla e diagonal, sombra projetada suave.',
  },
  {
    id: 'REF-0038',
    name: 'Mosaico de looks com card central',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 8,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['mosaico', 'coleção', 'card central', 'quente'],
    image: '/references/ref-0038.png',
    limits: 'Os módulos em volta do cartão são looks confirmados; com menos, a moldura encolhe em vez de repetir look.',
    recipe:
      'Mosaico de blocos fotográficos que sangram até as bordas da peça, sem moldura externa, cada bloco com um produto ou look distinto, alternando pessoa e still de produto. Ao centro, um cartão vertical de cantos arredondados e borda fina concentra um ornamento gráfico simples, a headline da mecânica de desconto e três faixas em linhas separadas por filetes curtos. A marca aparece como wordmark serifado no topo da área central. Paleta quente e neutra, luz de estúdio suave e separação limpa entre os blocos, sem que um look invada o outro.',
  },
  {
    id: 'REF-0039',
    name: 'Vitrine modular com card de desconto',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 8,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['plintos', 'catálogo', 'card central', 'claro'],
    image: '/references/ref-0039.png',
    limits: 'Os módulos misturam peça vestida, packshot e acessório; cada um precisa existir nas fontes.',
    recipe:
      'Grade modular em fundo branco frio, com produtos apoiados sobre plintos geométricos brancos de alturas diferentes e um único bloco de pessoa usando o produto funcionando como âncora da grade. Ao centro, um cartão claro de cantos arredondados reúne um rótulo curto em caixa alta, a headline da mecânica em duas cores e três faixas de desconto dispostas lado a lado, separadas por filetes verticais, com uma linha fina de condição abaixo. Marca em wordmark no topo do quadro. Luz ampla de catálogo, sombras curtas e nenhum elemento decorativo além dos plintos.',
  },
  {
    id: 'REF-0014',
    name: 'Modelo herói com catálogo inferior',
    family: 'Editorial',
    category: 'Óculos',
    modes: ['collection'],
    slots: 5,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['rosto', 'produto em uso', 'catálogo inferior', 'oferta lateral'],
    image: '/references/ref-0014.png',
    limits: 'Um produto aparece no rosto e quatro produtos distintos formam o catálogo. A área vazia sob a oferta permanece vazia.',
    recipe:
      'Grande retrato usando o produto ocupa a metade superior esquerda; a oferta fica isolada à direita e uma área clara abaixo dela permanece vazia. Uma faixa inferior separada por filete mostra quatro produtos distintos em módulos iguais, sem ícones, benefícios ou embalagens inventadas.',
  },
  {
   id: 'REF-0029',
   name: 'Dupla de produtos com oferta lateral',
   family: 'Produto herói',
   category: 'Relógios & joias',
   modes: ['collection'],
   slots: 2,
   people: 'sem-pessoa',
   drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    fillsWithVariants: true,
   tags: ['dupla', 'superfície tátil', 'oferta lateral', 'minimalista'],
    image: '/references/ref-0029.png',
    limits: 'Os dois itens vêm da lista factual: dois produtos ou duas cores confirmadas do mesmo modelo, nunca um inventado a partir do outro.',
    recipe:
      'Dois produtos repousam em diagonais diferentes sobre superfície bege texturizada, um grande no primeiro plano e outro acima. Marca pequena no alto e bloco curto de oferta ocupa somente o espaço vazio inferior direito, sem cartão, selo ou benefícios.',
  },
  {
    id: 'REF-0032',
    name: 'Peça em caixa com placa grande',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['loja física', 'caixa aberta', 'placa impressa', 'luxo quente'],
    image: '/references/ref-0032.png',
    limits: 'Caixa neutra e sem marca quando a embalagem oficial não estiver confirmada; produtos do fundo ficam irreconhecíveis.',
    recipe:
      'Produto único em uma caixa expositora aberta domina o primeiro plano de uma joalheria quente. Atrás dele, uma placa impressa muito maior concentra a marca e a oferta; o restante da loja aparece desfocado e sem outro produto identificável.',
  },
  {
    id: 'REF-0033',
    name: 'Caixa de envio em loja física',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
    slots: 14,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['caixa de papelão', 'loja física', 'coleção', 'folha de oferta'],
    image: '/references/ref-0033.png',
    limits: 'A caixa e a folha são genéricas quando não houver materiais oficiais; funcionários ficam no fundo e fora do foco principal.',
    recipe:
      'Uma caixa de papelão aberta e cheia de produtos expostos em bases ocupa o centro de uma loja moderna. Uma folha de oferta fica presa à frente da caixa, enquanto pessoas da equipe aparecem ao fundo com foco suave e sem disputar com a coleção.',
  },
  {
    id: 'REF-0034',
    name: 'Balcão de joalheria com placa',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
    slots: 12,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['balcão', 'placa central', 'joalheria', 'coleção'],
    image: '/references/ref-0034.png',
    limits: 'A placa é o centro e os produtos formam uma moldura sobre o balcão; não usar caixa de envio.',
    recipe:
      'Balcão de joalheria quente com uma grande placa física em pé no centro. Vários produtos elegíveis ficam distribuídos ao redor dela em bases de exposição, formando uma moldura baixa e deixando a oferta da placa totalmente legível.',
  },
  {
    id: 'REF-0036',
    name: 'Dois pulsos lifestyle com oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 2,
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['pulsos', 'dupla', 'gesto central', 'fundo noturno'],
    image: '/references/ref-0036.png',
    limits: 'Os dois pulsos trazem itens da lista factual: dois produtos ou duas cores confirmadas do mesmo modelo. Rostos, bebidas e acessórios decorativos não entram.',
    recipe:
      'Dois antebraços entram pelos lados e se encontram em um gesto central, cada pulso exibindo um produto diferente. Fundo noturno desfocado de bar sofisticado, oferta branca centralizada no espaço escuro superior e apoio em dourado discreto.',
  },
  {
   id: 'REF-0040',
   name: 'Modelo inteiro com escada de desconto',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['single', 'collection'],
   slots: 1,
   people: 'humanizado',
   drivers: ['estetica'],
    offerMechanics: ['progressivo'],
   tags: ['modelo inteiro', 'escada aberta', 'ícones de sacola', 'estúdio cinza'],
    image: '/references/ref-0040.png',
    limits: 'A coleção é representada por um único look; os degraus seguem somente a oferta recebida.',
    recipe:
      'Pessoa em pé de perfil num estúdio cinza frio e difuso. Do lado livre, a escada sobe empilhada em blocos: um círculo cheio com o símbolo dentro, a quantidade em corpo pequeno e o percentual grande logo abaixo dela, separados por traços curtos. Uma linha de condição fecha a coluna no pé.',
  },
  {
   id: 'REF-0046',
   name: 'Grade sobreposta com escada superior',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['collection'],
   fillsWithVariants: true,
   slots: 6,
   people: 'sem-pessoa',
   drivers: ['estetica'],
    offerMechanics: ['progressivo'],
   tags: ['seis peças', 'duas fileiras', 'sobreposição', 'oferta superior'],
    image: '/references/ref-0046.png',
    limits: 'As seis peças formam duas fileiras escalonadas e se sobrepõem; não transformar em grade de cartões.',
    recipe:
      'Seis peças frontais formam duas fileiras escalonadas sobre fundo branco, três atrás e três à frente, tocando-se levemente. Acima delas, uma tabela horizontal de oferta traz três colunas, com quantidade em branco e vantagem em uma faixa preta.',
  },
  {
    id: 'REF-0047',
    name: 'Flat lay neutro com oferta no vazio',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 5,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['flat lay', 'bege', 'assimétrico', 'texto no vazio'],
    image: '/references/ref-0047.png',
    limits: 'Mostra até cinco produtos ou looks elegíveis; não usa grade, cartões ou círculos.',
    recipe:
      'Flat lay quente e bege com cinco produtos distribuídos de forma assimétrica ao redor de uma área vazia no alto esquerdo. Marca, título curto e degraus simples da oferta ficam nesse vazio, sem caixas, enquanto os itens permanecem separados e inteiros.',
  },
  {
   id: 'REF-0048',
   name: 'Flat lay denso com escada lateral',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['collection'],
   fillsWithVariants: true,
   slots: 10,
   people: 'sem-pessoa',
   drivers: ['estetica'],
    offerMechanics: ['progressivo'],
   tags: ['flat lay', 'coleção densa', 'headline condensada', 'escada lateral'],
    image: '/references/ref-0048.png',
    limits: 'Acessórios só entram quando constarem na lista de produtos elegíveis.',
    recipe:
      'Flat lay bege e denso reúne os produtos na maior parte direita do quadro. À esquerda, uma headline condensada muito grande e uma escada aberta de oferta usam ícones de sacola, linhas divisórias e forte contraste, sem cartões flutuantes.',
  },
  {
    id: 'REF-0050',
    name: 'Grade de cinco looks com oferta inferior',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 5,
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['cinco looks', 'módulo central alto', 'oferta inferior', 'corpo sem rosto'],
    image: '/references/ref-0050.png',
    limits: 'São cinco looks: um módulo alto central e quatro módulos menores nos cantos.',
    recipe:
      'Cinco fotografias de looks formam uma grade com respiros brancos: uma imagem alta no centro atravessa duas fileiras e quatro imagens menores ocupam os cantos. Uma faixa larga no rodapé reúne chamada, headline grande e degraus da oferta.',
  },
  {
   id: 'REF-0051',
   name: 'Flat lay editorial com escada central',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['collection'],
   fillsWithVariants: true,
   slots: 6,
   people: 'sem-pessoa',
   drivers: ['estetica'],
    offerMechanics: ['progressivo'],
   tags: ['flat lay', 'produtos nas bordas', 'vazio central', 'escada aberta'],
    image: '/references/ref-0051.png',
    limits: 'Os produtos ficam nas bordas e podem ser cortados pelo quadro, mas continuam reconhecíveis.',
    recipe:
      'Seis produtos em flat lay são empurrados para as bordas de um fundo branco e parcialmente cortados, deixando uma coluna central ampla. Wordmark serifado, headline espaçada e tabela vertical de oferta ocupam somente esse vazio central.',
  },
  {
   id: 'REF-0052',
   name: 'Modelo sentado com escada lateral',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['single', 'collection'],
   slots: 1,
   people: 'humanizado',
   drivers: ['estetica'],
    offerMechanics: ['progressivo'],
   tags: ['modelo sentado', 'escada aberta', 'ícones de sacola', 'estúdio claro'],
    image: '/references/ref-0052.png',
    limits: 'A coleção é representada por um único look; não inventar peças adicionais.',
    recipe:
      'Sol duro recorta a sombra numa parede bege quente, e a pessoa aparece agachada perto do chão, apoiada numa das mãos, vestindo peças escuras. Do outro lado, assinatura serifada com tagline espaçada e vantagens em linhas horizontais soltas, pousadas na parede, sem círculo e sem preenchimento atrás.',
  },
  {
   id: 'REF-0063',
   name: 'Três variantes lado a lado',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['collection'],
   slots: 3,
   people: 'sem-pessoa',
   drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    fillsWithVariants: true,
   tags: ['trio frontal', 'fundo branco', 'headline gigante', 'oferta inferior'],
    image: '/references/ref-0063.png',
    limits: 'As três peças vêm da lista factual: produtos diferentes ou cores confirmadas do mesmo modelo, nenhuma inventada para fechar o trio.',
    recipe:
      'Três produtos frontais, grandes e alinhados lado a lado dominam o centro sobre fundo branco. Nome da categoria em caixa alta pesada ocupa o topo, nome do produto vem logo abaixo em peso leve e a oferta fecha a base em uma única linha colorida.',
  },
  {
   id: 'REF-0067',
   name: 'Pilha de unidades com selo circular',
   family: 'Lifestyle',
   category: 'Vestuário',
   modes: ['single'],
   people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    repeatsSameProduct: true,
   tags: ['pilha', 'ambiente doméstico', 'headline grande', 'selo circular'],
    image: '/references/ref-0067.png',
    limits: 'Repete apenas o mesmo produto real; cores diferentes só entram quando as variantes estiverem confirmadas.',
    recipe:
      'Pilha alta de unidades dobradas ocupa a base direita de um ambiente doméstico acolhedor. Headline funcional branca com sombra colorida domina o alto esquerdo e a oferta entra em um selo circular forte no canto inferior oposto.',
  },
  {
    id: 'REF-0068',
    name: 'Produto escuro com faixa inclinada',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['fundo preto', 'produto isolado', 'headline vermelha', 'faixa amarela'],
    image: '/references/ref-0068.png',
    limits: 'Urgência ou escassez só aparecem quando estiverem confirmadas no contexto.',
    recipe:
      'Produto único flutua no centro de um estúdio preto com halo e sombra. Headline condensada vermelha domina o alto, apoio branco fica logo abaixo e a oferta aparece numa faixa amarela inclinada atravessando a base do produto.',
  },
  {
    id: 'REF-0069',
    name: 'Prova documental com faixa de oferta',
    family: 'Oferta tipográfica',
    category: 'Outros',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    tags: ['antes e depois', 'documentos', 'seta', 'produto em círculo'],
    image: '/references/ref-0069.png',
    requirement: {
      label: 'Só pode ser usado com resultado comparável e comprovado.',
      question: 'O contexto traz dois resultados reais e comparáveis, com valores, medidas ou evidências que possam aparecer como antes e depois?',
    },
    limits: 'Valores, documentos e resultados precisam vir das fontes; o produto permanece reconhecível no círculo inferior.',
    recipe:
      'Pessoa ao centro segura dois resultados documentais, com antes em vermelho, depois em verde e seta larga ligando os valores. Uma faixa vermelha ocupa o rodapé com a mensagem factual, enquanto o produto aparece grande em um círculo sobreposto.',
  },
  {
    id: 'REF-0072',
    name: 'Depoimento com duas fotos do cliente',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['funcao'],
    tags: ['depoimento', 'duas fotos', 'cartão grande', 'estrelas'],
    image: '/references/ref-0072.png',
    limits: 'O depoimento é texto publicitário, mas só pode citar benefícios confirmados no contexto.',
    recipe:
      'Produto recortado acompanha uma cápsula de headline no topo. Abaixo, um cartão grande de cantos muito arredondados traz duas fotos da mesma cliente, depoimento centralizado, avatar, nome e estrelas em composição clara de prova social.',
      requirement: {
        label: 'duas fotos do mesmo cliente e o relato dele',
        question: 'O contexto traz duas fotos reais do mesmo cliente e o relato assinado por ele?',
      },
  },
  {
    id: 'REF-0076',
    name: 'Comparativo funcional em duas colunas',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    tags: ['comparação', 'duas colunas', 'benefícios', 'problemas'],
    image: '/references/ref-0076.png',
    requirement: {
      label: 'Só pode ser usado com comparação funcional comprovada.',
      question: 'O contexto identifica a solução antiga ou alternativa e traz diferenças factuais que podem ser comparadas sem inventar?',
    },
    limits: 'Nenhuma vantagem, problema ou componente comparativo pode ser inventado.',
    recipe:
      'Divisão vertical rigorosa: lado claro mostra o produto anunciado e seus benefícios com marcas de acerto; lado escuro mostra a solução antiga e seus problemas com marcas de erro. Imagens e linhas de texto se alinham entre as duas colunas.',
  },
  {
    id: 'REF-0078',
    name: 'Depoimento visual com relato longo',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['funcao'],
    tags: ['depoimento', 'duas fotos', 'relato longo', 'produto central'],
    image: '/references/ref-0078.png',
    limits: 'As fotos e o depoimento podem ser publicitários, mas resultados e benefícios citados ficam limitados ao contexto factual.',
    recipe:
      'Cartão branco de cantos arredondados divide duas fotos grandes da mesma cliente no alto e um depoimento longo abaixo. Um recorte reconhecível do produto ocupa a medalha central da divisão, seguido por estrelas, título serifado, relato e assinatura.',
      requirement: {
        label: 'antes e depois do mesmo cliente com prazo',
        question: 'O contexto traz duas fotos do mesmo cliente em datas diferentes e o relato dele?',
      },
  },
  {
    id: 'REF-0081',
    name: 'Close comparativo com produto em círculo',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['close', 'comparação visual', 'produto em círculo', 'faixa central'],
    image: '/references/ref-0081.png',
    requirement: {
      label: 'Só pode ser usado com efeito visual comprovado.',
      question: 'O produto possui um efeito visual confirmado que possa ser mostrado em dois closes comparáveis sem inventar resultado?',
    },
    limits: 'Os dois closes mostram o mesmo detalhe e o produto no círculo deve permanecer reconhecível.',
    recipe:
      'Dois closes extremos do mesmo detalhe humano ocupam as metades superior e inferior. Uma faixa horizontal curta atravessa o centro com a chamada, enquanto um círculo grande sobreposto mostra o produto e uma seta curva conecta uso e resultado.',
  },
  {
    id: 'REF-0084',
    name: 'Produto isolado com promessa numérica',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    tags: ['minimalista', 'produto gigante', 'promessa numérica', 'fundo branco'],
    image: '/references/ref-0084.png',
    requirement: {
      label: 'Só pode ser usado com número e prazo confirmados.',
      question: 'O contexto traz uma promessa numérica real, com unidade e período, que possa ser exibida sem estimativa?',
    },
    limits: 'Número, unidade e prazo devem ser preservados exatamente como aparecem na fonte.',
    recipe:
      'Fundo branco quase vazio com hook em três linhas no alto, produto isolado monumental no centro e promessa numérica na base. O número e a palavra-chave recebem a única cor de destaque; o restante usa cinza e preto.',
  },
  {
    id: 'REF-0085',
    name: 'Split de resultado com produto em círculo',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['antes e depois', 'split horizontal', 'produto em círculo', 'setas'],
    image: '/references/ref-0085.jpg',
    requirement: {
      label: 'Só pode ser usado com antes e depois visual comprovado.',
      question: 'O contexto traz um resultado visual real que possa ser mostrado como antes e depois do mesmo detalhe?',
    },
    limits: 'Prazo ou velocidade de ação só entram quando confirmados na fonte.',
    recipe:
      'Dois closes do mesmo detalhe formam um split horizontal de antes e depois. O produto aparece grande em um círculo vermelho sobre a divisão, duas setas curvas apontam para ele e uma cápsula curta recebe o benefício ou prazo factual.',
  },
  {
    id: 'REF-0086',
    name: 'Produto instalado com headline central',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    tags: ['produto instalado', 'ambiente real', 'minimalista', 'benefício inferior'],
    image: '/references/ref-0086.png',
    limits: 'O ambiente e a forma de instalação ou uso precisam ser compatíveis com o produto real.',
    recipe:
      'Produto aparece instalado e em uso no centro de um ambiente claro e quase vazio. Headline curta fica acima; abaixo, uma linha grande traz resultado ou benefício confirmado, usando número somente quando ele existir nas fontes.',
      requirement: {
        label: 'resultado numérico com prazo confirmado',
        question: 'O contexto confirma o número de resultado e em quanto tempo ele acontece?',
      },
  },
  {
    id: 'REF-0097',
    name: 'Produto em close sobre superfície premium',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    silent: true,
    tags: ['close', 'superfície premium', 'fundo desfocado', 'sem texto'],
    image: '/references/ref-0097.png',
    recipe:
      'Fotografia silenciosa em close baixo: produto inclinado ocupa quase todo o quadro sobre uma superfície mineral polida, com sombra e reflexo discretos. Fundo neutro muito desfocado, luz lateral macia e nenhum texto ou elemento gráfico.',
  },
  {
    id: 'REF-0126',
    name: 'Conjunto claro em flat lay',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    silent: true,
    tags: ['flat lay', 'conjunto', 'branco sobre branco', 'sem texto'],
    image: '/references/ref-0126.png',
    limits: 'Mostra somente os componentes reais do produto; não completa um conjunto inexistente.',
    recipe:
      'Flat lay silencioso e claro com os componentes reais do produto levemente sobrepostos sobre fundo branco contínuo. Texturas e logotipos permanecem nítidos, sombras suaves separam as peças e nenhum texto ou decoração entra.',
  },
  {
    id: 'REF-0140',
    name: 'Produto no corpo em ambiente externo',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    silent: true,
    tags: ['produto no corpo', 'close', 'ambiente externo', 'sem texto'],
    image: '/references/ref-0140.png',
    limits: 'O corte remove o rosto e acessórios chamativos; o casting acompanha o público-alvo capturado.',
    recipe:
      'Fotografia silenciosa em ambiente externo sofisticado, com pessoa enquadrada abaixo do rosto até o quadril. A peça vestida ocupa quase todo o quadro, o fundo urbano fica fortemente desfocado e nenhum texto, selo ou acessório compete com o produto.',
  },
  {
    id: 'REF-0141',
    name: 'Oferta direta sobre fundo branco',
    family: 'Oferta tipográfica',
    category: 'Calçados',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['fundo branco', 'oferta direta', 'packshot', 'produto grande'],
    image: '/references/ref-0141.png',
    limits: 'Mostra somente a unidade comercial real do produto; não duplica uma unidade avulsa para simular conjunto.',
    recipe:
      'Fundo branco vazio com marca centralizada no alto, oferta tipográfica dominante logo abaixo e produto isolado ocupando toda a parte inferior. A unidade comercial aparece em packshot frontal de três quartos, com uma segunda peça apenas quando o produto for naturalmente vendido em par. Texto preto, sombra de contato leve e nenhum cenário, selo, benefício ou CTA.',
  },
  {
    id: 'REF-0142',
    name: 'Lifestyle com packshot em primeiro plano',
    family: 'Lifestyle',
    category: 'Calçados',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['lifestyle', 'packshot', 'primeiro plano', 'oferta gigante'],
    image: '/references/ref-0142.png',
    limits: 'A pessoa usa e o primeiro plano repete exatamente o mesmo produto e a mesma variante.',
    recipe:
      'Cena externa clara com pessoa usando o produto ao fundo e packshot do mesmo produto muito maior no primeiro plano. Uma parede clara do próprio ambiente reserva espaço para marca, nome e oferta em escala dominante. A pessoa aparece inteira o suficiente para provar o uso, com rosto completo, enquanto o packshot continua sendo o primeiro produto lido.',
  },
  {
    id: 'REF-0143',
    name: 'Mosaico de uso e detalhes',
    family: 'Editorial',
    category: 'Calçados',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['mosaico', 'uso', 'packshot', 'macro', 'oferta'],
    image: '/references/ref-0143.png',
    limits: 'Todos os módulos mostram o mesmo produto e a mesma variante, apenas em enquadramentos diferentes.',
    recipe:
      'Mosaico assimétrico com uma fotografia alta de uso ocupando uma lateral e, na outra, oferta no topo, packshot principal, duas vistas menores e um macro de acabamento. Os módulos mantêm a mesma locação clara e o mesmo produto na mesma variante. Pessoa com rosto completo, respiros brancos finos entre blocos e nenhum benefício, selo ou CTA.',
  },
  {
    id: 'REF-0144',
    name: 'Split claro com uso e packshot',
    family: 'Oferta tipográfica',
    category: 'Calçados',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['split', 'lifestyle', 'packshot', 'oferta gigante'],
    image: '/references/ref-0144.png',
    limits: 'A pessoa em uso e o packshot repetem exatamente o mesmo produto e a mesma variante.',
    recipe:
      'Composição clara dividida entre uma área de comunicação com packshot apoiado na base e uma fotografia alta de pessoa usando o mesmo produto. A oferta é o maior texto da peça, o packshot é a primeira leitura de produto e a pessoa aparece com rosto inteiro em contexto externo sofisticado. A arquitetura clara une os dois lados.',
  },
  {
   id: 'REF-0145',
   name: 'Close íntimo com oferta em cartões',
   family: 'Lifestyle',
   category: 'Vestuário',
   modes: ['single'],
   people: 'corpo-suporte',
   drivers: ['funcao', 'estetica'],
    offerMechanics: ['leve-mais'],
   tags: ['close', 'produto no corpo', 'oferta em cartões', 'luz quente'],
    image: '/references/ref-0145.png',
    limits: 'O enquadramento deve manter o produto vestido inteiro e retirar completamente o rosto.',
    recipe:
      'Fotografia quente e íntima ocupa todo o quadro, com pessoa enquadrada abaixo do pescoço usando o produto em grande destaque. Uma coluna de texto vive sobre a área escura e vazia da própria foto, enquanto dois cartões coloridos empilhados apresentam os degraus da oferta. Tipografia serifada elegante na headline e nenhum benefício em lista.',
  },
  {
    id: 'REF-0146',
    name: 'Still life com lupa de detalhe',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    tags: ['still life', 'macro', 'detalhe', 'oferta circular'],
    image: '/references/ref-0146.png',
    limits: 'A lupa só amplia um acabamento realmente visível e confirmado no produto.',
    recipe:
      'Produto deitado sobre tecido claro e quente ocupa o centro como still life, acompanhado por uma ampliação circular de um detalhe real. Marca e headline serifada ficam no alto de uma lateral; a oferta entra em um selo circular grande no canto oposto ao detalhe. Luz natural suave, textura tátil e nenhum cenário adicional.',
  },
  {
   id: 'REF-0147',
   name: 'Painel editorial com produto no corpo',
   family: 'Oferta tipográfica',
   category: 'Vestuário',
   modes: ['single'],
   people: 'corpo-suporte',
   drivers: ['funcao', 'estetica'],
    offerMechanics: ['leve-mais'],
   tags: ['painel lateral', 'produto no corpo', 'oferta em cartões', 'fundo branco'],
    image: '/references/ref-0147.png',
    limits: 'Miniaturas inferiores só entram como vistas da mesma variante confirmada; não misturar cores.',
    recipe:
      'Painel editorial branco concentra marca, nome, headline e dois cartões de oferta em uma lateral; na outra, close claro de pessoa usando o produto, cortada abaixo do pescoço. O produto vestido é o maior elemento e fica inteiro. Miniaturas discretas na base usam somente a mesma variante, sem criar catálogo de cores.',
  },
  {
    id: 'REF-0043',
    name: 'Dupla de modelos com oferta lateral',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    slots: 2,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['percentual', 'leve-mais'],
    fillsWithVariants: true,
    tags: ['duas pessoas', 'duas cores', 'parede vazia', 'número dourado'],
    image: '/references/ref-0043.png',
    limits: 'O enquadramento fecha onde a peça vendida acaba: perna e calçado fora da venda não entram no quadro.',
    recipe:
      'Duas pessoas de corpo inteiro, lado a lado, vestindo o mesmo conjunto em duas cores diferentes, em cenário claro de luz natural. A parede ao lado delas segue vazia e recebe marca, nome do conjunto e a oferta, com um número grande em cor metálica como único ponto de cor.',
  },
  {
    id: 'REF-0044',
    name: 'Grade de conjuntos em fundo claro',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    fillsWithVariants: true,
    tags: ['conjunto completo', 'quadrantes', 'barra de oferta', 'fundo bege'],
    image: '/references/ref-0044.png',
    limits: 'Cada quadrante traz exatamente o que a loja vende: o conjunto se for conjunto, a peça sozinha se for avulsa.',
    recipe:
      'Quatro conjuntos completos do mesmo modelo, um por quadrante, em cores diferentes, recortados sobre um fundo bege contínuo sem moldura. No alto, marca e nome do conjunto em serifada, e a oferta dentro de uma barra horizontal larga em bege mais saturado.',
  },
  {
    id: 'REF-0045',
    name: 'Modelo com escada em cartões de duas faixas',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    slots: 1,
    people: 'humanizado',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['cartão branco sobre preto', 'acento tirado do produto', 'estúdio claro'],
    image: '/references/ref-0045.png',
    limits: 'O acento de cor do texto sai do próprio produto; produto neutro deixa a peça sem ponto de cor.',
    recipe:
      'Pessoa cortada abaixo do quadril, de frente, vestindo o produto em estúdio claro. Do lado oposto, a escada de oferta aparece em pares de cartões empilhados: a quantidade numa faixa branca colada sobre a vantagem numa faixa preta. A headline reaproveita a cor do próprio produto em parte das linhas.',
  },
  {
    id: 'REF-0053',
    name: 'Grade de produtos com tarja de anúncio',
    family: 'Oferta tipográfica',
    category: 'Outros',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    tags: ['tarja saturada', 'linguagem de marketplace', 'quatro fotos', 'sem refino'],
    image: '/references/ref-0053.png',
    limits: 'A tarja carrega a escada inteira em duas linhas; muitos degraus fazem ela crescer e comer a primeira fileira.',
    recipe:
      'Quatro fotos de produto sobre branco, encostadas umas nas outras em duas fileiras, sem margem externa. Colada no topo do quadro, uma tarja retangular de cor saturada atravessa a largura inteira e traz a oferta completa em texto corrido, com o acabamento direto de anúncio de marketplace.',
  },
  {
    id: 'REF-0054',
    name: 'Grade desigual cortada por faixa',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['collection'],
   fillsWithVariants: true,
    slots: 6,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    tags: ['módulos de tamanhos diferentes', 'faixa que atravessa', 'peça avulsa'],
    image: '/references/ref-0054.png',
    limits: 'A faixa corta os módulos que encontra na altura dela; com poucas peças, ela fica sem o que atravessar.',
    recipe:
      'Peças avulsas fotografadas de frente sobre branco, em módulos de tamanhos desiguais: um bem maior domina um lado e os outros o cercam em tamanhos menores. Uma faixa fina de cor saturada atravessa o quadro na horizontal, cortando os módulos que encontra, e carrega a oferta em uma linha única.',
  },
  {
    id: 'REF-0055',
    name: 'Quadrantes de conjunto com faixa no meio',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    fillsWithVariants: true,
    tags: ['quatro quadrantes iguais', 'conjunto na diagonal', 'faixa na emenda'],
    image: '/references/ref-0055.png',
    limits: 'Os quatro quadrantes têm o mesmo tamanho; conjunto incompleto deixa um quadrante visivelmente mais vazio.',
    recipe:
      'Quatro quadrantes de tamanho idêntico, cada um com um conjunto completo do mesmo modelo em uma cor, disposto na diagonal com a peça de baixo à frente. Uma faixa de cor saturada corre exatamente sobre a emenda horizontal entre as duas fileiras e traz a oferta em uma linha.',
  },
  {
    id: 'REF-0103',
    name: 'Peças sobre cenário do próprio universo',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    slots: 4,
    people: 'sem-pessoa',
    drivers: ['estetica'],
    silent: true,
    tags: ['cenário temático', 'luz quente dramática', 'vista de cima', 'sem texto'],
    image: '/references/ref-0103.png',
    limits: 'O cenário precisa ter laço factual com o produto; sem esse laço a cena vira colagem.',
    recipe:
      'Peças da coleção dispostas sobre uma superfície que pertence ao universo do próprio produto, vista de cima em ângulo, em ambiente escuro com luz quente e direcional. A superfície aparece inteira e reconhecível sob as peças. Nenhuma palavra no quadro.',
  },
  {
    id: 'REF-0148',
    name: 'Produto funcional com tópicos e número gigante',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['coluna de benefícios', 'número gigante', 'ícone de linha', 'fundo claro'],
    image: '/references/ref-0148.png',
    limits: 'Os três benefícios saem da lista factual; sem benefício confirmado, a coluna encolhe.',
    recipe:
      'o produto ocupa um lado inteiro do quadro e o outro lado é uma coluna de texto que explica a função, fechada embaixo por um número de desconto gigante. É a peça que precisa dizer o que o produto faz.',
  },
  {
    id: 'REF-0149',
    name: 'Produto funcional no corpo com coluna de benefícios',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['produto no corpo', 'faixa vertical', 'filetes finos', 'ambiente desfocado'],
    image: '/references/ref-0149.png',
    limits: 'Os benefícios da faixa vêm do contexto; sem nenhum confirmado, a faixa fica só com a oferta.',
    recipe:
      'o produto aparece em uso sobre o corpo, e o argumento fica numa faixa vertical clara ao lado, separada por filetes finos em vez de cartões.',
  },
  {
    id: 'REF-0150',
    name: 'Produto funcional em cena de uso com parede livre',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['cena de uso', 'parede contínua', 'headline curta', 'luz de janela'],
    image: '/references/ref-0150.png',
    limits: 'A headline carrega o argumento e sai do contexto; a peça não abre lista de benefícios.',
    recipe:
      'uma pessoa usa o produto de verdade em um ambiente real, e toda a comunicação vive na parede clara ao lado, sem painel e sem divisória. A parede da cena continua atrás do texto.',
  },
  {
    id: 'REF-0151',
    name: 'Trio funcional com benefício em linha única',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['trio alinhado', 'oferta no topo', 'benefício em uma linha', 'fundo branco'],
    image: '/references/ref-0151.png',
    limits: 'As três unidades são cores confirmadas do mesmo modelo, nunca produtos diferentes.',
    recipe:
      'o mesmo produto em três cores, alinhado como mostruário, com a oferta em cima e uma única linha de benefício embaixo. O argumento cabe numa frase; o resto é a variedade de cores.',
  },
  {
    id: 'REF-0152',
    name: 'Produto no corpo em estúdio escuro com número metálico',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['estúdio escuro', 'membro pela borda', 'número metálico', 'halo de luz'],
    image: '/references/ref-0152.png',
    limits: 'O metálico do número acompanha o material do produto; sem metal confirmado, use branco.',
    recipe:
      'um membro entra pela borda exibindo o produto, e o resto do quadro é estúdio escuro quase vazio, com o número da oferta em cor metálica como único ponto de cor.',
  },
  {
    id: 'REF-0153',
    name: 'Trio deitado em superfície clara vista de cima',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['vista de cima', 'diagonal solta', 'superfície quente', 'sem grade'],
    image: '/references/ref-0153.png',
    limits: 'As três unidades são cores confirmadas do mesmo modelo; sem variante, mostre uma só.',
    recipe:
      'as três unidades estão deitadas e fotografadas de cima sobre uma superfície contínua, em diagonal solta, sem alinhamento rígido. É mostruário de cor sem virar grade.',
  },
  {
    id: 'REF-0154',
    name: 'Close sem rosto com a coleção em miniaturas',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 5,
    molde: true,
    tags: ['close no corpo', 'coluna de texto', 'miniaturas recortadas', 'fundo quente'],
    image: '/references/ref-0154.png',
    limits: 'As miniaturas mostram os demais itens elegíveis; com menos itens, a fileira encurta.',
    recipe:
      'uma pessoa fotografada de perto, do maxilar para baixo, veste a peça principal e ocupa um lado inteiro do quadro; do outro lado, uma coluna de texto termina numa fileira de miniaturas recortadas com as outras peças da coleção.',
  },
  {
    id: 'REF-0155',
    name: 'Mãos arrumando a coleção sobre a mesa',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 4,
    fillsWithVariants: true,
    molde: true,
    tags: ['vista de cima', 'mãos pela borda', 'madeira clara', 'peças dobradas'],
    image: '/references/ref-0155.png',
    limits: 'As peças vêm da lista de elegíveis; com menos itens, a mesa fica mais livre.',
    recipe:
      'a cena é vista de cima e duas mãos entram pela borda inferior ajeitando as peças. O gesto humano dá vida à peça sem que ninguém apareça.',
  },
  {
    id: 'REF-0156',
    name: 'Pilha de unidades vista de cima em bancada escura',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    repeatsSameProduct: true,
    molde: true,
    tags: ['pilha de unidades', 'selo circular', 'bancada escura', 'vista de cima'],
    image: '/references/ref-0156.png',
    limits: 'Repete apenas o mesmo produto real; cores diferentes só entram quando confirmadas.',
    recipe:
      'a mesma unidade repetida e empilhada é o que anuncia a oferta — dá para contar as peças — e um selo circular de cor sólida carrega o número, solto sobre a foto.',
  },
  {
    id: 'REF-0157',
    name: 'Trio pendurado na arara com faixa de oferta',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['arara', 'cabides iguais', 'faixa inferior', 'fundo quente'],
    image: '/references/ref-0157.png',
    limits: 'As três peças são cores confirmadas do mesmo modelo, nunca produtos diferentes.',
    recipe:
      'o mesmo modelo em três cores, alinhado de frente como mostruário, com um bloco de texto no topo e a oferta numa faixa cheia fechando a base.',
  },
  {
    id: 'REF-0158',
    name: 'Dupla sem rosto com a mesma peça em duas cores',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 2,
    fillsWithVariants: true,
    molde: true,
    tags: ['dupla lado a lado', 'locação clara', 'coluna lateral', 'número quente'],
    image: '/references/ref-0158.png',
    limits: 'As duas cores vêm da lista factual; com uma só, fica uma pessoa no mesmo enquadramento.',
    recipe:
      'duas pessoas lado a lado, do maxilar para baixo, vestem o mesmo modelo em cores diferentes, e toda a comunicação vive numa coluna de texto ao lado, sobre a área clara da locação.',
  },
  {
    id: 'REF-0159',
    name: 'Duas mãos, a mesma bolsa em duas cores',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 2,
    fillsWithVariants: true,
    molde: true,
    tags: ['duas mãos', 'gesto repetido', 'parede quente', 'duas cores'],
    image: '/references/ref-0159.png',
    recipe:
      'duas mãos entram por lados opostos do quadro, cada uma segurando a mesma bolsa numa cor diferente. O gesto repetido mostra que existem opções sem virar mostruário.',
  },
  {
    id: 'REF-0160',
    name: 'Close sem rosto abraçando a pilha das outras cores',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 4,
    fillsWithVariants: true,
    molde: true,
    tags: ['close no corpo', 'pilha nos braços', 'quatro cores', 'parede clara'],
    image: '/references/ref-0160.png',
    recipe:
      'uma pessoa fotografada de perto, do maxilar para baixo, veste uma cor e segura contra o corpo a pilha dobrada das outras três. Caimento e variedade de cores cabem no mesmo enquadramento fechado, sem cenário.',
  },
  {
    id: 'REF-0161',
    name: 'Produto sozinho em luz de fim de tarde, sem texto',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    silent: true,
    molde: true,
    tags: ['faixa de sol', 'concreto claro', 'sombra longa', 'sem texto'],
    image: '/references/ref-0161.png',
    recipe:
      'o produto sozinho, iluminado por uma faixa de sol de fim de tarde que atravessa a cena. A luz é o argumento; não há texto nenhum.',
  },
  {
    id: 'REF-0162',
    name: 'Uma mão erguendo três cabides',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['três cores'],
    image: '/references/ref-0162.png',
    recipe:
      'uma única mão entra pelo alto do quadro segurando três cabides de uma vez, e as três cores pendem abertas em leque. É o gesto de quem já decidiu levar todas.',
  },
  {
    id: 'REF-0163',
    name: 'Gaveta aberta com as unidades enroladas',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 6,
    fillsWithVariants: true,
    repeatsSameProduct: true,
    molde: true,
    tags: ['seis unidades'],
    image: '/references/ref-0163.png',
    recipe:
      'uma gaveta aberta vista de cima, com as unidades enroladas em fileira. É a gaveta cheia que a oferta promete.',
  },
  {
    id: 'REF-0164',
    name: 'Peça pendurada na parede com prendedor',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0164.png',
    recipe:
      'uma única peça pendurada numa parede lisa, como em um ateliê. Quase todo o quadro é respiro, e o texto é curto.',
  },
  {
    id: 'REF-0165',
    name: 'Veste uma, mostra a outra',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 2,
    fillsWithVariants: true,
    molde: true,
    tags: ['duas cores'],
    image: '/references/ref-0165.png',
    recipe:
      'a pessoa veste uma unidade e estende a segunda, dobrada, em direção à câmera. A segunda peça na mão é a oferta.',
  },
  {
    id: 'REF-0166',
    name: 'Mão pegando uma unidade da fileira',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 5,
    fillsWithVariants: true,
    repeatsSameProduct: true,
    molde: true,
    tags: ['cinco unidades'],
    image: '/references/ref-0166.png',
    recipe:
      'as unidades formam uma fileira regular vista de cima, e uma mão entra pela borda pegando uma delas. O gesto quebra a grade e dá escala.',
  },
  {
    id: 'REF-0167',
    name: 'Uma mão usando a coleção inteira',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0167.png',
    recipe:
      'uma única mão e pulso usam as três peças ao mesmo tempo. O corpo vira expositor da coleção.',
  },
  {
    id: 'REF-0168',
    name: 'Conjunto vestido em luz de folhagem',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 2,
    silent: true,
    molde: true,
    tags: ['peça sem texto'],
    image: '/references/ref-0168.png',
    recipe:
      'o conjunto vestido fotografado como editorial, sem nenhum texto. A luz filtrada e o caimento vendem sozinhos.',
  },
  {
    id: 'REF-0169',
    name: 'Três peças no cabideiro de parede',
    family: 'Produto herói',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0169.png',
    recipe:
      'peças diferentes penduradas lado a lado em ganchos de parede, cada uma no seu cabide. É o guarda-roupa aberto da coleção.',
  },
  {
    id: 'REF-0170',
    name: 'Três pedestais em alturas crescentes',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0170.png',
    recipe:
      'a escada do desconto é física. Pedestais sobem de um lado para o outro, cada um com um produto, e cada degrau carrega o seu percentual.',
  },
  {
    id: 'REF-0171',
    name: 'Três faixas, mãos com uma, duas e três peças',
    family: 'Lifestyle',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    slots: 3,
    molde: true,
    tags: ['três degraus'],
    image: '/references/ref-0171.png',
    recipe:
      'o quadro é dividido em três faixas horizontais, e em cada uma um par de mãos segura uma pilha maior — uma peça, duas, três. A escada do desconto é contada nas mãos.',
  },
  {
    id: 'REF-0172',
    name: 'Escada de pedra, uma peça por degrau',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0172.png',
    recipe:
      'uma escada real vira a escada do desconto. Cada degrau segura um produto e o seu percentual, subindo.',
  },
  {
    id: 'REF-0173',
    name: 'Produto ao centro com legendas apontando',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0173.png',
    recipe:
      'o produto no centro e três legendas curtas ligadas por linhas finas às partes que elas descrevem. A peça explica o produto apontando para ele.',
  },
  {
    id: 'REF-0174',
    name: 'Mão afundando um dos dois travesseiros',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    slots: 2,
    repeatsSameProduct: true,
    molde: true,
    tags: ['duas unidades'],
    image: '/references/ref-0174.png',
    recipe:
      'as duas unidades lado a lado na cama, e uma mão afunda uma delas mostrando a espuma que volta ao formato. O par é a oferta; o gesto é o argumento.',
  },
  {
    id: 'REF-0175',
    name: 'Perna com o produto e faixa escura de oferta',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0175.png',
    recipe:
      'uma perna em perfil mostra o produto em uso, e uma faixa escura embaixo junta a oferta e os benefícios.',
  },
  {
    id: 'REF-0176',
    name: 'Macro que estoura as bordas com oferta minúscula',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0176.png',
    recipe:
      'o produto é fotografado tão perto que não cabe no quadro — ele entra por uma borda e sai pela outra, cortado dos dois lados. A textura do material é o assunto, e o texto é minúsculo ao lado.',
  },
  {
    id: 'REF-0177',
    name: 'Unidades em queda congelada no ar',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['três unidades'],
    image: '/references/ref-0177.png',
    recipe:
      'as unidades estão no ar, congeladas no meio de uma queda, em alturas e rotações diferentes. Nada toca o chão e não existe apoio, mesa, plinto ou fio à vista.',
  },
  {
    id: 'REF-0178',
    name: 'Sombra dura de persiana cortando o produto',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    silent: true,
    molde: true,
    tags: ['peça sem texto'],
    image: '/references/ref-0178.png',
    recipe:
      'uma sombra dura de persiana atravessa o quadro em faixas paralelas e passa por cima do produto. A sombra é o elemento gráfico da peça, e não existe nenhum texto.',
  },
  {
    id: 'REF-0179',
    name: 'Produto sobre cor chapada saturada',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 2,
    fillsWithVariants: true,
    molde: true,
    tags: ['duas cores'],
    image: '/references/ref-0179.png',
    recipe:
      'o quadro inteiro é uma única cor chapada e saturada, e o produto flutua sobre ela. É a peça mais colorida do banco, e a cor é do fundo, nunca do texto.',
  },
  {
    id: 'REF-0180',
    name: 'Torre alta de unidades cortada pelo topo',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['leve-mais'],
    slots: 4,
    fillsWithVariants: true,
    repeatsSameProduct: true,
    molde: true,
    tags: ['muitas unidades'],
    image: '/references/ref-0180.png',
    recipe:
      'uma torre de unidades dobradas sobe do pé do quadro e sai cortada pelo topo. Não dá para ver onde termina, e é isso que anuncia a quantidade.',
  },
  {
    id: 'REF-0181',
    name: 'Produto gigante atrás, produto real na frente',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0181.png',
    recipe:
      'o mesmo produto aparece duas vezes no mesmo quadro, em escalas muito diferentes — um close gigante e desfocado ocupando o fundo inteiro, e a unidade completa e nítida na frente. A peça mostra o detalhe e o produto de uma vez só.',
  },
  {
    id: 'REF-0182',
    name: 'Split diagonal entre o produto e a oferta',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    slots: 2,
    repeatsSameProduct: true,
    molde: true,
    tags: ['duas unidades'],
    image: '/references/ref-0182.png',
    recipe:
      'uma linha diagonal corta o quadro de canto a canto e divide a peça em dois territórios — de um lado a fotografia, do outro um campo de cor sólida com a oferta. O corte é inclinado, nunca vertical nem horizontal.',
  },
  {
    id: 'REF-0183',
    name: 'Mão com o produto e tópicos em linha fina',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    slots: 2,
    fillsWithVariants: true,
    molde: true,
    tags: ['duas cores'],
    image: '/references/ref-0183.png',
    recipe:
      'a mão mostra o produto de perto, a segunda cor fica em pé na base, e o argumento vem em três tópicos com ícone de linha fina.',
  },
  {
    id: 'REF-0184',
    name: 'Mão na bancada com as cores ao lado',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    slots: 3,
    fillsWithVariants: true,
    molde: true,
    tags: ['três cores'],
    image: '/references/ref-0184.png',
    recipe:
      'uma mão ergue o produto cheio de vitamina numa cozinha real, e as outras cores estão em pé na bancada, na mesma luz. Uso e variedade na mesma foto.',
  },
  {
    id: 'REF-0185',
    name: 'Os dois joelhos, uma unidade em cada',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    slots: 2,
    repeatsSameProduct: true,
    molde: true,
    tags: ['duas unidades'],
    image: '/references/ref-0185.png',
    recipe:
      'o produto vem em par porque o corpo tem dois joelhos. As duas pernas aparecem lado a lado, cada joelho com uma unidade.',
  },
  {
    id: 'REF-0186',
    name: 'Produto em uso visto de costas',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0186.png',
    recipe:
      'o produto em uso visto de costas, durante uma corrida real, com uma headline de benefício sobre o céu claro.',
  },
  {
    id: 'REF-0187',
    name: 'Textura do conteúdo ao lado do frasco fechado',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0187.png',
    recipe:
      'o produto fechado de um lado e o conteúdo dele espalhado direto na superfície do outro. A textura do creme é tão importante quanto a embalagem — é ela que o cliente compra.',
  },
  {
    id: 'REF-0188',
    name: 'Macro do conteúdo com o frasco pequeno em cima',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    silent: true,
    molde: true,
    tags: ['peça sem texto'],
    image: '/references/ref-0188.png',
    recipe:
      'o quadro inteiro é o conteúdo em macro absoluto, e o frasco aparece pequeno, pousado sobre ele. A escala inverte: o líquido é o cenário e a embalagem é o objeto.',
  },
  {
    id: 'REF-0189',
    name: 'Linha completa alinhada pela base, subindo em altura',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['progressivo'],
    slots: 4,
    molde: true,
    tags: ['quatro produtos'],
    image: '/references/ref-0189.png',
    recipe:
      'os frascos da linha ficam lado a lado, todos apoiados na mesma base, e as alturas diferentes desenham uma escada natural. A escada do desconto é a própria linha de produtos, e os percentuais correm rentes a essa silhueta.',
  },
  {
    id: 'REF-0190',
    name: 'Kit na caixa aberta com berço recortado',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0190.png',
    recipe:
      'uma caixa rígida aberta, vista de cima, com um berço interno recortado sob medida, e cada produto encaixado no seu vão. É o kit como objeto fechado, não como produtos soltos lado a lado.',
  },
  {
    id: 'REF-0191',
    name: 'Ingrediente cru cortado ao lado do produto',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0191.png',
    recipe:
      'o produto ao lado do ingrediente cru que ele carrega, cortado e fresco. O ingrediente prova a promessa sem que nenhum texto precise explicá-la.',
  },
  {
    id: 'REF-0192',
    name: 'Frasco cortado ao meio mostrando as camadas',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0192.png',
    recipe:
      'duas unidades do mesmo produto lado a lado — uma inteira e fechada, outra aberta em corte reto mostrando o interior. O corte é o argumento: o cliente vê o que está comprando por dentro.',
  },
  {
    id: 'REF-0193',
    name: 'Produto ao lado do refil, com a conta desenhada',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    slots: 2,
    molde: true,
    tags: ['duas unidades'],
    image: '/references/ref-0193.png',
    recipe:
      'o frasco com válvula de um lado e o refil de pé do outro, com uma seta larga entre eles apontando do refil para o frasco. A peça mostra a recompra em vez de anunciá-la só no texto.',
  },
  {
    id: 'REF-0194',
    name: 'Dose diária contada ao lado do pote',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    repeatsSameProduct: true,
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0194.png',
    recipe:
      'o pote fechado e, ao lado, as cápsulas contadas e alinhadas em fileira certinha sobre a superfície. Dá para contar a dose com o olho — esse é o argumento.',
  },
  {
    id: 'REF-0195',
    name: 'Frasco em luz âmbar com o respingo congelado',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    molde: true,
    tags: ['um produto'],
    image: '/references/ref-0195.png',
    recipe:
      'o frasco em pé sobre uma lâmina de líquido, com um respingo congelado subindo ao lado dele. O movimento parado é o que dá o clima, e a peça é quase toda escura.',
  },
  {
    id: 'REF-0196',
    name: 'Rotina numerada com um produto por passo',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    offerMechanics: ['percentual'],
    slots: 3,
    molde: true,
    tags: ['três produtos'],
    image: '/references/ref-0196.png',
    recipe:
      'o quadro se divide em três faixas verticais iguais, uma por passo da rotina, e cada faixa tem o seu número grande, o seu produto e a mão aplicando o conteúdo. A ordem de uso é a composição.',
  },
  {
    id: 'REF-0197',
    name: 'Produto esquecido na bancada da cozinha',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['produto na casa real'],
    image: '/references/ref-0197.png',
    recipe:
      'a foto que alguém tira da própria bancada de manhã, sem arrumar nada. O produto está ali no meio da rotina, não em cima de um pedestal.',
  },
  {
    id: 'REF-0198',
    name: 'Pé descalço no chão, no primeiro passo do dia',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['parte do corpo com o problema'],
    image: '/references/ref-0198.png',
    recipe:
      'a foto que alguém tira do próprio pé, olhando de cima, no momento em que dói. É o gesto de quem quer mostrar o problema para outra pessoa.',
  },
  {
    id: 'REF-0199',
    name: 'Cachorro deitado no tapete, visto de cima',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    native: true,
    molde: true,
    tags: ['pet'],
    image: '/references/ref-0199.png',
    recipe:
      'a foto que o dono tira do próprio cachorro deitado, do jeito que ele está, com o produto largado ao lado. É a foto que uma pessoa manda para a amiga.',
  },
  {
    id: 'REF-0200',
    name: 'Duas fotos do mesmo canto da casa, com meses de diferença',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['antes e depois caseiro'],
    image: '/references/ref-0200.png',
    recipe:
      'duas fotos caseiras do mesmo canto de parede, tiradas do mesmo lugar em momentos diferentes, encostadas uma na outra. Não existe cartão, borda, rótulo nem seta: são só duas fotos lado a lado, como quem junta duas imagens no celular.',
  },
  {
    id: 'REF-0201',
    name: 'Bilhete escrito à mão sobre a mesa',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['papel escrito à mão'],
    image: '/references/ref-0201.png',
    recipe:
      'um bilhete escrito à mão numa folha comum, fotografado de cima sobre a mesa, com o produto encostado ao lado. A letra é de alguém de verdade, não uma fonte imitando escrita.',
  },
  {
    id: 'REF-0202',
    name: 'Produto no porta-copos do carro, parado no trânsito',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    native: true,
    molde: true,
    tags: ['produto em uso real'],
    image: '/references/ref-0202.png',
    recipe:
      'a foto que alguém tira de dentro do próprio carro, parado, com o celular na mão. O produto está no porta-copos, usado, no meio da vida real.',
  },
  {
    id: 'REF-0203',
    name: 'Pessoa comum sentada no sofá, foto tirada por outra pessoa',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'humanizado',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['pessoa comum sem pose'],
    image: '/references/ref-0203.png',
    recipe:
      'a foto que um parente tira de alguém sentado, sem avisar. A pessoa não posa, não olha para a câmera e está no meio de outra coisa.',
  },
  {
    id: 'REF-0204',
    name: 'Detalhe do problema num objeto de casa',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['detalhe que denuncia o problema'],
    image: '/references/ref-0204.png',
    recipe:
      'um close de celular no problema, feito por quem estava incomodado com ele. A mão puxa o tecido para mostrar melhor, e o produto está por perto sem protagonismo.',
  },
  {
    id: 'REF-0205',
    name: 'Ingrediente e produto na mesa do café da manhã',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['leve-mais'],
    native: true,
    molde: true,
    tags: ['comida e ingrediente'],
    image: '/references/ref-0205.png',
    recipe:
      'a foto de uma mesa de café da manhã de verdade, no meio do preparo, com o produto entre as outras coisas. A cena está pela metade, não montada.',
  },
  {
    id: 'REF-0206',
    name: 'Cena do lugar onde o problema acontece, sem produto',
    family: 'Produto herói',
    category: 'Outros',
    modes: ['single'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    offerMechanics: ['percentual'],
    native: true,
    molde: true,
    tags: ['cena sem produto'],
    image: '/references/ref-0206.png',
    recipe:
      'a foto do lugar onde o problema acontece, sem o produto nenhum no quadro. A cena sozinha faz a pessoa reconhecer a própria casa.',
  },
];

/*
 * Ordenação genérica para auditorias e usos fora da galeria. A galeria usa
 * isReferenceApplicable antes de ordenar, pois incompatibilidade não é opção.
 * 0 = direção própria para o argumento, 1 = direção flexível/neutra,
 * 2 = briga com o argumento (peça densa para produto que vende pela foto).
 */
export function driverFit(reference: Reference, driver: SalesDriver | null) {
  if (!driver || !reference.drivers?.length) return 1;
  if (reference.drivers.includes(driver)) return reference.drivers.length === 1 ? 0 : 1;
  // Peça cheia de tópicos num produto que vende pela foto é o erro caro: vai para o fim.
  if (driver === 'estetica' && reference.drivers.includes('funcao')) return 2;
  return 1;
}

export function sortByDriver(list: Reference[], driver: SalesDriver | null) {
  return [...list].sort((a, b) => driverFit(a, driver) - driverFit(b, driver));
}

export type ReferenceCampaignCriteria = {
  mode: 'single' | 'collection';
  salesDriver: SalesDriver | null;
  offerMechanic: OfferMechanic | null;
  /* Lido do alvo da campanha, nunca perguntado. Só desempata. */
  category?: Reference['category'] | null;
};

/*
 * Palpite de nicho a partir do que o aluno escreveu no alvo da campanha.
 * Serve só para desempatar a ordem da galeria: quando não reconhece nada,
 * o desempate simplesmente não acontece e ninguém perde referência por isso.
 */
const pistasDeCategoria: Array<[Reference['category'], string[]]> = [
  ['Relógios & joias', ['relogio', 'relógio', 'uhr', 'watch', 'joia', 'jóia', 'anel', 'colar', 'pulseira', 'brinco', 'corrente']],
  ['Calçados', ['tenis', 'tênis', 'sapato', 'chinelo', 'sandalia', 'sandália', 'bota', 'schuh', 'sneaker', 'calcado', 'calçado']],
  ['Óculos', ['oculos', 'óculos', 'brille', 'sunglass', 'armacao', 'armação', 'lente']],
  ['Vestuário', ['camisa', 'camiseta', 'polo', 'short', 'calca', 'calça', 'jaqueta', 'casaco', 'blusa', 'vestido', 'saia', 'conjunto', 'moletom', 'cueca', 'sutia', 'sutiã', 'legging', 'top', 'hemd', 'shirt', 'roupa', 'bolsa', 'boxer']],
];

export function guessCategory(exactTarget: string): Reference['category'] | null {
  const alvo = exactTarget.toLowerCase();
  for (const [categoria, pistas] of pistasDeCategoria) {
    if (pistas.some((pista) => alvo.includes(pista))) return categoria;
  }
  return null;
}

/* 0 = mesma prateleira do produto dele; 1 = qualquer outra, ou nicho desconhecido. */
export function categoryFit(reference: Reference, category: Reference['category'] | null | undefined) {
  return category && reference.category === category ? 0 : 1;
}

/*
 * Duas peças parecem a mesma coisa quando compartilham família visual, presença
 * humana e quantidade de produtos. Esse é o tipo de composição, e é ele que a
 * galeria alterna para que as cinco primeiras nunca saiam iguais.
 */
export function compositionType(reference: Reference) {
  const itens = reference.slots ?? 1;
  const quantidade = itens >= 4 ? 'muitos' : itens >= 2 ? 'poucos' : 'um';
  return `${reference.family}|${reference.people ?? '—'}|${quantidade}`;
}

/*
 * Produto único continua sendo um produto único mesmo quando há três cores dele.
 * Algumas direções de coleção vendem justamente essa variedade, e elas ficam
 * sempre disponíveis para produto único: quase todo produto tem cores, e quantas
 * existem de fato é um dado do CONTEXTO CAPTURADO, não uma resposta do aluno.
 * Quando houver menos variações do que a composição comporta, a receita encolhe.
 */
export function supportsCampaignMode(reference: Reference, mode: ReferenceCampaignCriteria['mode']) {
  return reference.modes.includes(mode)
    || (mode === 'single' && Boolean(reference.fillsWithVariants));
}

/*
 * A mecânica nunca exclui uma direção. Oferta é texto: qualquer peça comercial
 * escreve qualquer oferta, e o relógio sozinho vende “compre 2, leve 1” do mesmo
 * jeito que a pilha de unidades. O que muda é se a construção reforça a oferta ou
 * apenas a anuncia — e isso é ordem de galeria, não barreira.
 * 0 = a construção foi feita para esta oferta; 1 = comercial geral, comporta qualquer uma.
 */
export function offerFit(reference: Reference, mechanic: OfferMechanic | null) {
  if (!mechanic) return 0;
  return reference.offerMechanics?.includes(mechanic) ? 0 : 1;
}

/*
 * Peça sem texto comercial continua sendo referência, e das boas: o que ela ensina
 * é a imagem. O núcleo já sabe não injetar oferta nela, então esconder da galeria
 * só tirava do aluno um jeito de anunciar que ele talvez nem saiba que existe.
 */
export function isReferenceApplicable(reference: Reference, criteria: ReferenceCampaignCriteria) {
  if (!supportsCampaignMode(reference, criteria.mode)) return false;
  return !criteria.salesDriver || Boolean(reference.drivers?.includes(criteria.salesDriver));
}

/*
 * A galeria alterna tipos de composição e usa oferta e nicho só como desempate
 * dentro de cada tipo. Ordenar direto pela oferta devolvia cinco grades de quatro
 * produtos em sequência; ordenar pelo nicho devolvia cinco mosaicos de vestuário.
 * Alternando, as cinco primeiras saem diferentes entre si e ainda assim próximas
 * da oferta e da prateleira do aluno.
 *
 * Dentro do tipo, a ordem é: oferta, depois nicho, depois argumento de venda.
 * A oferta muda o que a peça precisa escrever; o nicho só muda o quanto ele se
 * reconhece na imagem.
 */
export function sortForCampaign(list: Reference[], criteria: ReferenceCampaignCriteria) {
  const desempate = (a: Reference, b: Reference) =>
    offerFit(a, criteria.offerMechanic) - offerFit(b, criteria.offerMechanic)
    || categoryFit(a, criteria.category) - categoryFit(b, criteria.category)
    /* Molde antes de criativo capturado. Uma peça com a marca de outra loja e o texto
       em outro idioma é lida como anúncio alheio, não como direção reaproveitável —
       ela continua na galeria, mas não é ela que abre. */
    || (a.molde ? 0 : 1) - (b.molde ? 0 : 1)
    || driverFit(a, criteria.salesDriver) - driverFit(b, criteria.salesDriver);

  const filas = new Map<string, Reference[]>();
  for (const item of list) {
    const tipo = compositionType(item);
    if (!filas.has(tipo)) filas.set(tipo, []);
    filas.get(tipo)!.push(item);
  }
  for (const fila of filas.values()) fila.sort(desempate);

  /* A fila cuja melhor peça é a mais próxima abre a galeria. */
  const ordemDasFilas = [...filas.values()].sort((a, b) => desempate(a[0], b[0]));

  const ordenada: Reference[] = [];
  for (let rodada = 0; ordenada.length < list.length; rodada += 1) {
    let entrou = false;
    for (const fila of ordemDasFilas) {
      if (fila[rodada]) {
        ordenada.push(fila[rodada]);
        entrou = true;
      }
    }
    if (!entrou) break;
  }
  return ordenada;
}

/*
 * Um lote de cinco nao pode sair igual. Estes sao os eixos que fazem duas pecas
 * parecerem a mesma coisa; o app avisa quando a selecao repete todos eles.
 */
export type LotAxis = { label: string; value: string };

export function lotSameness(list: Reference[]): LotAxis[] {
  if (list.length < 2) return [];
  /*
   * O argumento de venda não entra: a galeria já abre filtrada por ele, então as
   * cinco escolhidas sempre o compartilham e o aviso virava ruído fixo na tela.
   */
  const eixos: Array<[string, (item: Reference) => string]> = [
    ['família visual', (item) => item.family],
    ['presença humana', (item) => item.people ?? '—'],
    ['quantidade de produtos', (item) => String(item.slots ?? '—')],
  ];
  return eixos
    /* Duas peças sem quantidade declarada não repetem nada: só não temos o dado. */
    .filter(([, get]) => new Set(list.map(get)).size === 1 && get(list[0]) !== '—')
    .map(([label, get]) => ({ label, value: get(list[0]) }));
}

/* O atalho nunca pode furar os critérios da campanha atual. */
export function recommendedReferenceIds(list: Reference[]) {
  return list.slice(0, 5).map(({ id }) => id);
}

export const reviewOptions = [
  { value: 'unreviewed', label: 'Aguardando conferência' },
  { value: 'correct', label: 'Correto' },
  { value: 'missing', label: 'Faltou ou veio só em texto' },
  { value: 'collage', label: 'Veio dentro de uma colagem' },
  { value: 'repeated', label: 'Repetiu outro criativo' },
  { value: 'wrong-direction', label: 'Direção visual errada' },
  { value: 'content', label: 'Precisa revisar conteúdo' },
  { value: 'variation', label: 'Quero outra variação' },
] as const;

export type ReviewStatus = (typeof reviewOptions)[number]['value'];

export const executionErrorStatuses: ReviewStatus[] = [
  'missing',
  'collage',
  'repeated',
  'wrong-direction',
];
