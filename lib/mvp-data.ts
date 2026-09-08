export type Reference = {
  id: string;
  name: string;
  family: 'Oferta tipográfica' | 'Produto herói' | 'Lifestyle' | 'Editorial';
  category: 'Relógios & joias' | 'Vestuário' | 'Calçados' | 'Óculos' | 'Outros';
  tags: string[];
  image: string;
  sample?: string;
  validated: boolean;
  recipe: string;
};

export const references: Reference[] = [
  {
    id: 'REF-0001',
    name: 'Split premium escuro',
    family: 'Oferta tipográfica',
    category: 'Relógios & joias',
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
    tags: ['tátil', 'diagonal', 'selo oferta'],
    image: '/references/ref-0003.png',
    sample: '/samples/sample-0003.png',
    validated: true,
    recipe:
      'Fundo e superfície tátil em tom quente, natural e sofisticado, com iluminação difusa. Produto(s) em diagonais suaves, headline curta no topo e oferta completa dentro de um selo circular de alto contraste no canto inferior.',
  },
  {
    id: 'REF-0004',
    name: 'Still life premium',
    family: 'Produto herói',
    category: 'Óculos',
    tags: ['still life', 'minimalista', 'espaço negativo'],
    image: '/references/ref-0004.png',
    sample: '/samples/sample-0004.png',
    validated: true,
    recipe:
      'Fundo branco a cinza muito claro, espaço negativo superior e superfície contínua. Produto(s) sobre plintos geométricos neutros de alturas diferentes, luz ampla e suave, reflexos controlados, sombras limpas e baixa densidade de texto.',
  },
  {
    id: 'REF-0005',
    name: 'Cartão físico de oferta',
    family: 'Lifestyle',
    category: 'Relógios & joias',
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
    tags: ['retrô', 'native ad', 'feito à mão'],
    image: '/references/ref-0008.png',
    sample: '/samples/sample-0008.png',
    validated: true,
    recipe:
      'Estética informal de anúncio nativo retrô dentro de uma janela genérica de editor antigo, sobre fundo digital colorido dos anos 2000. Composição dinâmica, headline manuscrita vermelha e oferta completa na parte inferior, sem copiar interface proprietária.',
  },
];

export const recommendedReferenceIds = [
  'REF-0001',
  'REF-0003',
  'REF-0004',
  'REF-0005',
  'REF-0008',
];

export const reviewOptions = [
  { value: 'unreviewed', label: 'Aguardando conferência' },
  { value: 'correct', label: 'Correto' },
  { value: 'missing', label: 'Faltou ou veio só em texto' },
  { value: 'repeated', label: 'Repetiu outro criativo' },
  { value: 'wrong-direction', label: 'Direção visual errada' },
  { value: 'content', label: 'Precisa revisar conteúdo' },
  { value: 'variation', label: 'Quero outra variação' },
] as const;

export type ReviewStatus = (typeof reviewOptions)[number]['value'];

export const executionErrorStatuses: ReviewStatus[] = [
  'missing',
  'repeated',
  'wrong-direction',
];
