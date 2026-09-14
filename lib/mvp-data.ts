/*
 * O que faz o cliente comprar. Uma referência declara quais argumentos ela sustenta;
 * a campanha declara o argumento do produto. O cruzamento ordena a biblioteca.
 */
export type SalesDriver = 'funcao' | 'estetica';

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
  /* Peca que na origem nao tem uma palavra comercial. O nucleo para de injetar oferta. */
  silent?: boolean;
  tags: string[];
  image: string;
  sample?: string;
  validated: boolean;
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
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['split', 'luxo', 'produto grande'],
    image: '/references/ref-0001.png',
    sample: '/samples/sample-0001.png',
    validated: true,
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
    drivers: ['funcao'],
    tags: ['movimento', 'pessoa', 'camadas'],
    image: '/references/ref-0002.png',
    validated: false,
    recipe:
      'Cena lifestyle dinâmica e urbana, com pessoa em ação ao centro, headline dominante, benefícios laterais somente quando confirmados e oferta em faixas inferiores. Alto contraste, sensação de movimento e produto claramente aplicado.',
  },
  {
    id: 'REF-0003',
    name: 'Cenário tátil e quente',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['tátil', 'diagonal', 'selo oferta'],
    image: '/references/ref-0003.png',
    sample: '/samples/sample-0003.png',
    validated: true,
    recipe:
      'Fundo e superfície tátil em tom quente, natural e sofisticado, com iluminação difusa. Produto(s) em diagonais suaves, headline curta no topo e oferta completa dentro de um selo circular de alto contraste no canto inferior.',
  },
  {
    id: 'REF-0005',
    name: 'Cartão físico de oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['single', 'collection'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    tags: ['mãos', 'cartão físico', 'oferta diegética'],
    image: '/references/ref-0005.png',
    sample: '/samples/sample-0005.png',
    validated: true,
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
    tags: ['modelo', 'luxo urbano', 'produto em uso'],
    image: '/references/ref-0006.png',
    validated: false,
    recipe:
      'Composição aspiracional dividida: painel editorial escuro para a mensagem e modelo usando o produto no lado oposto. Paleta neutra, acabamento premium e oferta claramente hierarquizada, sem importar marcas ou padrões da referência.',
  },
  {
    id: 'REF-0007',
    name: 'Mosaico editorial',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['mosaico', 'grade', 'multiproduto'],
    image: '/references/ref-0007.png',
    validated: true,
    recipe:
      'Mosaico modular de produtos em torno de um card central de oferta. Pesos variados entre os módulos, separadores limpos, luz de catálogo premium e cada item visualmente rastreável, sem variantes ou SKUs inventados.',
  },
  {
    id: 'REF-0008',
    name: 'Native ad retrô',
    family: 'Editorial',
    category: 'Outros',
    modes: ['single', 'collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['retrô', 'native ad', 'feito à mão'],
    image: '/references/ref-0008.png',
    sample: '/samples/sample-0008.png',
    validated: true,
    recipe:
      'Estética informal de anúncio nativo retrô dentro de uma janela genérica de editor antigo, sobre fundo digital colorido dos anos 2000. Composição dinâmica, headline manuscrita vermelha e oferta completa na parte inferior, sem copiar interface proprietária.',
  },
  {
    id: 'REF-0009',
    name: 'Vitrine tátil de coleção',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['coleção', 'textura', 'grupo', 'oferta lateral'],
    image: '/references/ref-0009.png',
    validated: false,
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
    tags: ['zenital', 'simétrico', 'benefícios', 'claro'],
    image: '/references/ref-0010.png',
    validated: false,
    limits: 'Benefícios só aparecem quando confirmados no contexto.',
    recipe:
      'Produto visto de cima e centralizado em fundo claro, com ampla margem. Headline em duas linhas logo abaixo, seguida de até três benefícios factuais, uma frase curta e oferta em faixa inferior. Simetria, alta legibilidade e estética de catálogo funcional.',
  },
  {
    id: 'REF-0011',
    name: 'Trio de coleção cromática',
    family: 'Produto herói',
    category: 'Calçados',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['trio', 'cores', 'lançamento', 'fundo suave'],
    image: '/references/ref-0011.png',
    validated: false,
    limits: 'Usa quatro produtos elegíveis no MVP, mesmo que a origem mostre três.',
    recipe:
      'Quatro produtos distintos organizados em fileira escalonada sobre superfície contínua e fundo atmosférico suave. Headline curta no alto, título da coleção secundário e oferta em cápsula no rodapé. Paleta do ambiente deriva da identidade da loja e não recolore os produtos.',
  },
  {
    id: 'REF-0012',
    name: 'Catálogo amplo de coleção',
    family: 'Editorial',
    category: 'Calçados',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    tags: ['catálogo', 'fileiras', 'variedade', 'fundo branco'],
    image: '/references/ref-0012.png',
    validated: false,
    limits: 'Mostra exatamente quatro produtos no fluxo atual de coleção.',
    recipe:
      'Fundo branco de catálogo com headline de oferta dividida em duas cores no topo. Exatamente quatro produtos distintos ocupam uma única fileira ampla, grandes e igualmente legíveis. Uma faixa curta de disponibilidade ou título factual aparece abaixo, seguida apenas de informações confirmadas.',
  },
  {
    id: 'REF-0015',
    name: 'Vitrine modular clara',
    family: 'Editorial',
    category: 'Óculos',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['funcao'],
    tags: ['plintos', 'coleção', 'vitrine', 'benefícios'],
    image: '/references/ref-0015.png',
    validated: false,
    limits: 'Melhor para quatro produtos compactos e reconhecíveis.',
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
    tags: ['close', 'rosto', 'produto em uso', 'benefícios'],
    image: '/references/ref-0016.png',
    validated: false,
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
    validated: false,
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
    validated: false,
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
    validated: false,
    limits: 'Requer sequência real de uso com exatamente três etapas confirmáveis.',
    recipe:
      'Headline operacional no topo, produto grande e isolado ao centro e três cartões numerados na faixa inferior demonstrando uma sequência real de uso. Fundo claro, cor de acento da marca e instruções muito curtas. Cada passo deve corresponder ao funcionamento confirmado do produto.',
  },
  {
    id: 'REF-0020',
    name: 'Produto com prova social',
    family: 'Lifestyle',
    category: 'Outros',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['funcao'],
    tags: ['reviews', 'prova social', 'produto na mão', 'benefícios'],
    image: '/references/ref-0020.png',
    validated: false,
    limits: 'Só usar avaliações, autores e resultados fornecidos ou confirmados.',
    recipe:
      'Produto grande em uso ou sustentado por uma mão ocupa a metade esquerda. A direita recebe três cartões de avaliações reais, cada um com foto apenas se fornecida, estrelas apenas se confirmadas, headline e trecho fiel. Rodapé com até três benefícios factuais e fundo contextual suave.',
  },
  {
    id: 'REF-0021',
    name: 'Coleção em pedestal de luxo',
    family: 'Produto herói',
    category: 'Relógios & joias',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['luxo', 'pedestal', 'coleção', 'oferta'],
    image: '/references/ref-0021.png',
    validated: false,
    limits: 'Mostra quatro produtos distintos da coleção em posição frontal.',
    recipe:
      'Cenário escuro premium com detalhes metálicos e pedestal central. Quatro produtos distintos aparecem alinhados e grandes, sem sobreposição. Headline elegante no topo, título curto da coleção e oferta completa em placa integrada ao pedestal, com luz dirigida e acabamento de campanha de luxo.',
  },
  {
    id: 'REF-0022',
    name: 'Vitrine física com oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
    modes: ['collection'],
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['loja física', 'vitrine', 'cartão', 'coleção'],
    image: '/references/ref-0022.png',
    validated: false,
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
    people: 'corpo-suporte',
    drivers: ['funcao'],
    silent: true,
    tags: ['mosaico', 'uso real', 'detalhes', 'coleção'],
    image: '/references/ref-0023.png',
    validated: false,
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
    validated: false,
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
    people: 'sem-pessoa',
    drivers: ['estetica'],
    tags: ['flat lay', 'coleção', 'radial', 'selo central'],
    image: '/references/ref-0025.png',
    validated: false,
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
    tags: ['modelo', 'oferta gigante', 'premium', 'benefícios'],
    image: '/references/ref-0026.png',
    validated: false,
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
    tags: ['unboxing', 'caixa de envio', 'oferta física', 'zenital'],
    image: '/references/ref-0027.png',
    validated: false,
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
    validated: false,
    limits: 'Requer detalhe funcional e depoimento reais; omitir o depoimento se não houver fonte.',
    recipe:
      'Close de uso real enquadra o detalhe funcional do produto e a interação da mão. Um bloco editorial de pincel recebe depoimento real curto, enquanto dois selos menores apontam o recurso e um benefício confirmado. Fundo neutro, produto dominante e nenhuma alegação sem fonte.',
  },
  {
    id: 'REF-0037',
    name: 'Escada de desconto com modelo',
    family: 'Oferta tipográfica',
    category: 'Vestuário',
    modes: ['single'],
    people: 'corpo-suporte',
    drivers: ['estetica'],
    tags: ['escada de desconto', 'modelo', 'painel lateral', 'claro'],
    image: '/references/ref-0037.png',
    validated: false,
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
    people: 'humanizado',
    drivers: ['estetica'],
    tags: ['mosaico', 'coleção', 'card central', 'quente'],
    image: '/references/ref-0038.png',
    validated: false,
    limits: 'Coleção com quatro looks distintos; a escada exige três faixas de desconto confirmadas.',
    recipe:
      'Mosaico de blocos fotográficos que sangram até as bordas da peça, sem moldura externa, cada bloco com um produto ou look distinto, alternando pessoa e still de produto. Ao centro, um cartão vertical de cantos arredondados e borda fina concentra um ornamento gráfico simples, a headline da mecânica de desconto e três faixas em linhas separadas por filetes curtos. A marca aparece como wordmark serifado no topo da área central. Paleta quente e neutra, luz de estúdio suave e separação limpa entre os blocos, sem que um look invada o outro.',
  },
  {
    id: 'REF-0039',
    name: 'Vitrine modular com card de desconto',
    family: 'Editorial',
    category: 'Vestuário',
    modes: ['collection'],
    people: 'humanizado',
    drivers: ['estetica'],
    tags: ['plintos', 'catálogo', 'card central', 'claro'],
    image: '/references/ref-0039.png',
    validated: false,
    limits: 'Coleção com quatro produtos distintos; acessórios só entram se confirmados nas fontes.',
    recipe:
      'Grade modular em fundo branco frio, com produtos apoiados sobre plintos geométricos brancos de alturas diferentes e um único bloco de pessoa usando o produto funcionando como âncora da grade. Ao centro, um cartão claro de cantos arredondados reúne um rótulo curto em caixa alta, a headline da mecânica em duas cores e três faixas de desconto dispostas lado a lado, separadas por filetes verticais, com uma linha fina de condição abaixo. Marca em wordmark no topo do quadro. Luz ampla de catálogo, sombras curtas e nenhum elemento decorativo além dos plintos.',
  },
];

/*
 * Ordena a biblioteca pelo argumento de venda do produto, sem esconder nada:
 * o catálogo é pequeno, e sumir com metade dele não ensina quem escolhe.
 * 0 = serve, 1 = neutra, 2 = briga com o argumento (peça densa para produto que vende pela foto).
 */
export function driverFit(reference: Reference, driver: SalesDriver | null) {
  if (!driver || !reference.drivers?.length) return 1;
  if (reference.drivers.includes(driver)) return 0;
  // Peça cheia de tópicos num produto que vende pela foto é o erro caro: vai para o fim.
  if (driver === 'estetica' && reference.drivers.includes('funcao')) return 2;
  return 1;
}

export function sortByDriver(list: Reference[], driver: SalesDriver | null) {
  return [...list].sort((a, b) => driverFit(a, driver) - driverFit(b, driver));
}

export const recommendedReferenceIds = [
  'REF-0001',
  'REF-0003',
  'REF-0005',
  'REF-0007',
  'REF-0008',
];

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
