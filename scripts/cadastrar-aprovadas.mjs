/*
 * Cadastra as direcoes aprovadas: copia a imagem, escreve a referencia em
 * `lib/mvp-data.ts` e a receita em `lib/prompt-compiler.ts`.
 *
 * A receita ja foi escrita quando a direcao nasceu, no arquivo da serie. Ela entra
 * aqui sem reescrita, que e o que a diretriz 24 manda: se a imagem foi aprovada, o
 * texto que a gerou vira a receita.
 *
 * Roda com: node scripts/cadastrar-aprovadas.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { lote } from './referencias-lote.mjs';
import { serie2 } from './referencias-serie-2.mjs';
import { serie3 } from './referencias-serie-3.mjs';
import { serie4 } from './referencias-serie-4.mjs';
import { nativos } from './referencias-nativos.mjs';

const seco = process.argv.includes('--dry');
const ORIGEM = 'E:/Dowloands/NOVAS IMAGENS';
const raiz = new URL('../', import.meta.url);
const curadoria = new URL('../../REFERENCIAS-COM-PROMPT/LEVA 4/', import.meta.url);

/* A primeira leva nasceu antes dos arquivos de serie; a receita dela vem escrita aqui. */
const primeiraLeva = [
  {
    id: 'NOVA-01', nome: 'Produto funcional com tópicos e número gigante', arquivo: 'NOVA 01.png',
    family: 'Oferta tipográfica', category: 'Outros', mode: 'single', mech: 'percentual', argumento: 'funcao',
    people: 'sem-pessoa', slots: 1,
    tags: ['coluna de benefícios', 'número gigante', 'ícone de linha', 'fundo claro'],
    limits: 'Os três benefícios saem da lista factual; sem benefício confirmado, a coluna encolhe.',
    receita: [
      'O que define esta direção: o produto ocupa um lado inteiro do quadro e o outro lado é uma coluna de texto que explica a função, fechada embaixo por um número de desconto gigante. É a peça que precisa dizer o que o produto faz.',
      'Fundo cinza muito claro, quase branco, liso e contínuo, sem cenário e sem textura.',
      'O produto aparece de frente em três quartos, ocupando a metade direita e a maior área da imagem, com sombra de contato curta embaixo.',
      'Na metade esquerda, alinhados à esquerda e empilhados: a marca no alto; três linhas curtas de benefício, cada uma com um ícone de LINHA FINA solto ao lado, sem círculo, sem moldura e sem fundo; e o bloco da oferta na base.',
      'O bloco da oferta tem três níveis: uma palavra pequena e muito espaçada, o número em corpo gigante — o maior texto da peça — e uma linha pequena em caixa alta espaçada.',
      'Só existem duas cores gráficas: o preto do texto e o cinza do fundo. Toda a cor vem do produto.',
      'Esta peça não tem pessoa, cenário, selo, moldura, CTA, preço riscado nem embalagem.',
    ],
  },
  {
    id: 'NOVA-02', nome: 'Produto funcional no corpo com coluna de benefícios', arquivo: 'NOVA 02.png',
    family: 'Lifestyle', category: 'Outros', mode: 'single', mech: 'percentual', argumento: 'funcao',
    people: 'corpo-suporte', slots: 1,
    tags: ['produto no corpo', 'faixa vertical', 'filetes finos', 'ambiente desfocado'],
    limits: 'Os benefícios da faixa vêm do contexto; sem nenhum confirmado, a faixa fica só com a oferta.',
    receita: [
      'O que define esta direção: o produto aparece em uso sobre o corpo, e o argumento fica numa faixa vertical clara ao lado, separada por filetes finos em vez de cartões.',
      'Fundo de ambiente doméstico claro e neutro, profundamente desfocado, sem objeto reconhecível.',
      'O enquadramento começa abaixo do queixo e termina na altura do peito. O produto é o elemento mais nítido e mais iluminado do quadro.',
      'Na faixa vertical à esquerda, alinhado à esquerda: a marca no alto; três linhas curtas de benefício separadas por filetes finos horizontais; e o bloco da oferta embaixo, com o número em corpo grande.',
      'A roupa da pessoa é lisa e de cor claramente diferente do produto, num tom intermediário e sem brilho.',
      'Esta peça não tem selo, cartão, moldura, CTA, estrela de avaliação nem depoimento.',
    ],
  },
  {
    id: 'NOVA-03', nome: 'Produto funcional em cena de uso com parede livre', arquivo: 'NOVA 03.png',
    family: 'Lifestyle', category: 'Outros', mode: 'single', mech: 'percentual', argumento: 'funcao',
    people: 'humanizado', slots: 1,
    tags: ['cena de uso', 'parede contínua', 'headline curta', 'luz de janela'],
    limits: 'A headline carrega o argumento e sai do contexto; a peça não abre lista de benefícios.',
    receita: [
      'O que define esta direção: uma pessoa usa o produto de verdade em um ambiente real, e toda a comunicação vive na parede clara ao lado, sem painel e sem divisória. A parede da cena continua atrás do texto.',
      'Ambiente interno claro, com luz natural de janela. A parede lisa ocupa um lado inteiro do quadro.',
      'A pessoa aparece da cabeça até a cintura, com rosto inteiro e expressão natural. O produto fica na altura do rosto, nítido e bem iluminado.',
      'Sobre a parede, alinhado à esquerda: a marca pequena no alto; uma headline de duas linhas em caixa alta pesada; um filete horizontal curto; e a oferta em uma linha só, caixa alta, corpo médio.',
      'Não existe lista de benefícios com ícone: o argumento cabe na headline.',
      'Esta peça não tem selo, cartão, moldura, CTA nem texto sobre o corpo da pessoa.',
    ],
  },
  {
    id: 'NOVA-04', nome: 'Trio funcional com benefício em linha única', arquivo: 'NOVA 04.png',
    family: 'Oferta tipográfica', category: 'Outros', mode: 'single', mech: 'percentual', argumento: 'funcao',
    people: 'sem-pessoa', slots: 3, fillsWithVariants: true,
    tags: ['trio alinhado', 'oferta no topo', 'benefício em uma linha', 'fundo branco'],
    limits: 'As três unidades são cores confirmadas do mesmo modelo, nunca produtos diferentes.',
    receita: [
      'O que define esta direção: o mesmo produto em três cores, alinhado como mostruário, com a oferta em cima e uma única linha de benefício embaixo. O argumento cabe numa frase; o resto é a variedade de cores.',
      'Fundo branco levemente cinzento, contínuo, sem cenário, sem plinto e sem textura.',
      'As três unidades ficam lado a lado, todas em pé, no mesmo ângulo e no mesmo tamanho, com espaçamento regular e sem se sobrepor. A do meio avança ligeiramente. Sombra de contato suave sob cada uma.',
      'No alto, centralizados: a marca em corpo pequeno e espaçado, e a oferta em caixa alta pesada ocupando quase toda a largura — o maior elemento de texto da peça.',
      'Abaixo dos produtos, uma única linha centralizada, corpo pequeno e espaçado, com os benefícios separados por pontos.',
      'Esta peça não tem pessoa, cenário, selo, moldura, ícone nem CTA.',
    ],
  },
  {
    id: 'NOVA-05', nome: 'Produto no corpo em estúdio escuro com número metálico', arquivo: 'NOVA 05.png',
    family: 'Produto herói', category: 'Relógios & joias', mode: 'single', mech: 'percentual', argumento: 'estetica',
    people: 'corpo-suporte', slots: 1,
    tags: ['estúdio escuro', 'membro pela borda', 'número metálico', 'halo de luz'],
    limits: 'O metálico do número acompanha o material do produto; sem metal confirmado, use branco.',
    receita: [
      'O que define esta direção: um membro entra pela borda exibindo o produto, e o resto do quadro é estúdio escuro quase vazio, com o número da oferta em cor metálica como único ponto de cor.',
      'Fundo de estúdio escuro profundo, quase preto, com um halo de luz logo atrás do produto e os cantos escurecendo.',
      'O antebraço entra em diagonal por baixo, cortado bem antes do cotovelo. Nada do rosto, do ombro ou do tronco aparece. A manga, quando aparecer, é lisa e escura.',
      'O produto é o ponto mais claro e mais nítido de toda a imagem.',
      'Na área escura acima do braço, alinhado à esquerda: a marca pequena no alto; uma palavra pequena e muito espaçada; o número em corpo gigante e cor metálica; e uma linha pequena em caixa alta espaçada.',
      'Só existem três cores: o escuro do estúdio, o branco do texto e o metálico do número.',
      'Esta peça não tem selo, cartão, moldura, benefício escrito nem CTA.',
    ],
  },
  {
    id: 'NOVA-06', nome: 'Trio deitado em superfície clara vista de cima', arquivo: 'NOVA 06.png',
    family: 'Produto herói', category: 'Outros', mode: 'single', mech: 'percentual', argumento: 'estetica',
    people: 'sem-pessoa', slots: 3, fillsWithVariants: true,
    tags: ['vista de cima', 'diagonal solta', 'superfície quente', 'sem grade'],
    limits: 'As três unidades são cores confirmadas do mesmo modelo; sem variante, mostre uma só.',
    receita: [
      'O que define esta direção: as três unidades estão deitadas e fotografadas de cima sobre uma superfície contínua, em diagonal solta, sem alinhamento rígido. É mostruário de cor sem virar grade.',
      'A superfície é clara e quente — papel mineral ou pedra fosca clareada — e ocupa o quadro inteiro, sem horizonte, sem mesa e sem cenário.',
      'As três unidades se distribuem em diagonal suave, com folga entre elas. A do centro fica ligeiramente maior e mais à frente. Alças e detalhes arrumados, sem nó e sem dobra confusa.',
      'No canto superior, alinhado à esquerda e em preto: a marca pequena e espaçada, um filete horizontal curto, e a oferta em duas linhas de caixa alta pesada.',
      'Nenhuma cor gráfica além do preto do texto. Toda a cor vem dos produtos.',
      'Esta peça não tem pessoa, selo, etiqueta, preço, CTA nem moldura.',
    ],
  },
  {
    id: 'NOVA-07', nome: 'Close sem rosto com a coleção em miniaturas', arquivo: 'NOVA-07.png',
    family: 'Editorial', category: 'Vestuário', mode: 'collection', mech: 'percentual', argumento: 'estetica',
    people: 'corpo-suporte', slots: 5,
    tags: ['close no corpo', 'coluna de texto', 'miniaturas recortadas', 'fundo quente'],
    limits: 'As miniaturas mostram os demais itens elegíveis; com menos itens, a fileira encurta.',
    receita: [
      'O que define esta direção: uma pessoa fotografada de perto, do maxilar para baixo, veste a peça principal e ocupa um lado inteiro do quadro; do outro lado, uma coluna de texto termina numa fileira de miniaturas recortadas com as outras peças da coleção.',
      'Fundo claro e quente, liso e contínuo, com luz suave vinda de um lado.',
      'A pessoa fica de frente no lado direito do quadro, enquadrada do maxilar até o quadril, em close. O rosto não aparece. Braços relaxados ao lado do corpo, sem cobrir o produto.',
      'A peça vestida é o maior e o mais iluminado elemento do quadro. A calça é lisa, neutra, em tom escuro e apagado, claramente secundária.',
      'Na coluna do outro lado, alinhado à esquerda: a marca pequena, um filete horizontal curto e a oferta em caixa alta pesada de duas linhas — o maior texto da peça.',
      'Embaixo da oferta, na mesma coluna, uma fileira de miniaturas recortadas direto sobre o fundo claro, sem cartão e sem moldura, cada uma com uma das outras peças, todas no mesmo tamanho, de frente e na mesma luz.',
      'Esta peça não tem selo, cartão, moldura, benefício escrito nem CTA.',
      'Com menos produtos confirmados, a fileira de miniaturas encurta; nada é inventado para completá-la.',
    ],
  },
  {
    id: 'NOVA-08', nome: 'Mãos arrumando a coleção sobre a mesa', arquivo: 'NOVA 08.png',
    family: 'Lifestyle', category: 'Vestuário', mode: 'collection', mech: 'percentual', argumento: 'estetica',
    people: 'corpo-suporte', slots: 4, fillsWithVariants: true,
    tags: ['vista de cima', 'mãos pela borda', 'madeira clara', 'peças dobradas'],
    limits: 'As peças vêm da lista de elegíveis; com menos itens, a mesa fica mais livre.',
    receita: [
      'O que define esta direção: a cena é vista de cima e duas mãos entram pela borda inferior ajeitando as peças. O gesto humano dá vida à peça sem que ninguém apareça.',
      'A madeira clara da mesa ocupa o quadro inteiro. Luz natural vinda de um lado, sombras suaves e curtas.',
      'Só as mãos e um pedaço dos antebraços aparecem: nada de rosto, ombro ou tronco. As mãos tocam uma das peças, sem cobrir nenhuma delas por inteiro.',
      'As peças ficam dobradas e distribuídas com folga, cada uma em uma cor distinta, todas no mesmo tratamento de luz.',
      'Na área livre da mesa, no alto: a marca pequena e espaçada, centralizada, e a oferta em caixa alta pesada numa linha só, também centralizada.',
      'Esta peça não tem selo, cartão, etiqueta, preço, CTA nem moldura.',
    ],
  },
  {
    id: 'VAR-01', nome: 'Pilha de unidades vista de cima em bancada escura', arquivo: '02_VAR-01.png',
    family: 'Produto herói', category: 'Vestuário', mode: 'single', mech: 'leve-mais', argumento: 'estetica',
    people: 'sem-pessoa', slots: 1, repeatsSameProduct: true,
    tags: ['pilha de unidades', 'selo circular', 'bancada escura', 'vista de cima'],
    limits: 'Repete apenas o mesmo produto real; cores diferentes só entram quando confirmadas.',
    receita: [
      'O que define esta direção: a mesma unidade repetida e empilhada é o que anuncia a oferta — dá para contar as peças — e um selo circular de cor sólida carrega o número, solto sobre a foto.',
      'Bancada de pedra escura e fosca, ocupando o quadro inteiro, com luz lateral fria e sombra curta sob a pilha. Sem cenário, sem objeto de decoração e sem horizonte.',
      'A pilha é fotografada de cima, em diagonal, de perto: cada camada dobrada aparece inteira e em cor distinta, empilhada com alinhamento solto, uma peça levemente deslocada da outra.',
      'No alto, sobre a bancada, a marca pequena e clara, e abaixo dela uma headline de duas linhas em caixa alta pesada e clara.',
      'Num canto livre, um selo circular de cor sólida quente traz a oferta em duas linhas, sem moldura e sem sombra. É o único elemento colorido da parte gráfica.',
      'Esta peça não tem pessoa, embalagem, etiqueta, preço riscado, CTA nem moldura.',
      'Com menos unidades confirmadas, a pilha fica mais baixa e a bancada mais livre. Nenhuma peça é inventada para engordar a pilha.',
    ],
  },
  {
    id: 'VAR-02', nome: 'Trio pendurado na arara com faixa de oferta', arquivo: '03_VAR-02.png',
    family: 'Oferta tipográfica', category: 'Vestuário', mode: 'single', mech: 'leve-mais', argumento: 'estetica',
    people: 'sem-pessoa', slots: 3, fillsWithVariants: true,
    tags: ['arara', 'cabides iguais', 'faixa inferior', 'fundo quente'],
    limits: 'As três peças são cores confirmadas do mesmo modelo, nunca produtos diferentes.',
    receita: [
      'O que define esta direção: o mesmo modelo em três cores, alinhado de frente como mostruário, com um bloco de texto no topo e a oferta numa faixa cheia fechando a base.',
      'Fundo claro e quente, liso e contínuo, tipo parede de estúdio. Uma barra metálica fina e horizontal atravessa a parte de cima da área das peças, e os cabides penduram nela.',
      'As três peças ficam lado a lado, de frente, no mesmo tamanho e na mesma altura, com folga entre elas e sem se sobrepor. Cabides idênticos e discretos. Caimento natural, sem dobra confusa.',
      'No alto, centralizado e em preto: a marca em corpo pequeno e espaçado, e abaixo o nome do produto em duas linhas de caixa alta pesada.',
      'Na base, uma faixa horizontal preta de ponta a ponta, com a oferta centralizada em caixa alta clara.',
      'Fora do preto do texto e da faixa, nenhuma cor gráfica: toda a cor vem das peças.',
      'Esta peça não tem pessoa, selo, etiqueta, preço, ícone, CTA nem moldura.',
      'Com duas cores confirmadas, ficam duas peças na arara, centralizadas e com a mesma folga. Nenhuma cor é inventada para fechar o trio.',
    ],
  },
  {
    id: 'VAR-03', nome: 'Dupla sem rosto com a mesma peça em duas cores', arquivo: 'VAR-03.png',
    family: 'Editorial', category: 'Vestuário', mode: 'single', mech: 'percentual', argumento: 'estetica',
    people: 'corpo-suporte', slots: 2, fillsWithVariants: true,
    tags: ['dupla lado a lado', 'locação clara', 'coluna lateral', 'número quente'],
    limits: 'As duas cores vêm da lista factual; com uma só, fica uma pessoa no mesmo enquadramento.',
    receita: [
      'O que define esta direção: duas pessoas lado a lado, do maxilar para baixo, vestem o mesmo modelo em cores diferentes, e toda a comunicação vive numa coluna de texto ao lado, sobre a área clara da locação.',
      'Locação externa de pedra clara, com parede lisa e luz natural alta. O fundo é claro e quase sem detalhe.',
      'As duas pessoas ficam de frente, lado a lado, enquadradas do maxilar até o quadril, em close. Os rostos não aparecem. Mãos nos bolsos ou ao lado do corpo, sem cobrir as peças.',
      'As calças são lisas, neutras, iguais nas duas pessoas, em tom escuro e apagado, claramente secundárias.',
      'As duas peças vestidas são os dois maiores elementos da fotografia. Braços relaxados, e nenhuma pessoa encobre a outra.',
      'Na coluna lateral, sobre o fundo claro e alinhado à esquerda: a marca pequena no alto; o nome do produto em três linhas de caixa alta pesada; um filete horizontal curto; e o bloco da oferta, com uma palavra pequena espaçada, o número em corpo gigante e uma linha pequena em caixa alta espaçada.',
      'O número da oferta é o único elemento em cor quente; todo o resto do texto é escuro.',
      'Esta peça não tem selo, cartão, moldura, relógio, acessório em destaque, benefício escrito nem CTA.',
      'Com uma cor confirmada, fica uma pessoa só, no mesmo enquadramento, e a coluna de texto continua igual.',
    ],
  },
];

/* Nome do arquivo gerado, por id de direcao. O padrao mudou entre as levas. */
const arquivoDe = (id) => {
  const tentativas = [`${id}.png`, `${id.replace('-', ' ')}.png`];
  for (const nome of tentativas) {
    if (fs.existsSync(path.join(ORIGEM, nome))) return nome;
  }
  return null;
};

/* As quatro corrigidas regravaram o arquivo original, sem o sufixo B. */
const metadadosSerie2 = {
  'NOVA-29B': { arquivo: 'NOVA-29.png' },
  'NOVA-30B': { arquivo: 'NOVA-30.png' },
  'NOVA-33B': { arquivo: 'NOVA-33.png' },
  'NOVA-36B': { arquivo: 'NOVA-36.png' },
  'NOVA-09': { mode: 'single', mech: 'percentual', argumento: 'estetica', slots: 2, fillsWithVariants: true, category: 'Outros', arquivo: '05_NOVA-09.png', tags: ['duas mãos', 'gesto repetido', 'parede quente', 'duas cores'] },
  'NOVA-10': { mode: 'single', mech: 'percentual', argumento: 'estetica', slots: 4, fillsWithVariants: true, category: 'Vestuário', arquivo: 'NOVA-10.png', tags: ['close no corpo', 'pilha nos braços', 'quatro cores', 'parede clara'] },
  'NOVA-11': { mode: 'single', mech: 'percentual', argumento: 'estetica', slots: 1, category: 'Calçados', arquivo: '07_NOVA-11.png', tags: ['faixa de sol', 'concreto claro', 'sombra longa', 'sem texto'] },
};

const APROVADAS = [
  ...primeiraLeva.map((item) => item.id),
  'NOVA-09', 'NOVA-10', 'NOVA-11',
  'NOVA-13', 'NOVA-16', 'NOVA-17', 'NOVA-19', 'NOVA-20', 'NOVA-22', 'NOVA-24',
  'NOVA-25', 'NOVA-26', 'NOVA-27', 'NOVA-28', 'NOVA-31', 'NOVA-34', 'NOVA-35',
  'NOVA-37', 'NOVA-39', 'NOVA-40', 'NOVA-41', 'NOVA-42', 'NOVA-43', 'NOVA-44',
  'NOVA-29B', 'NOVA-30B', 'NOVA-33B', 'NOVA-36B',
  'NOVA-45', 'NOVA-46', 'NOVA-47', 'NOVA-48', 'NOVA-49',
  'NOVA-50', 'NOVA-51', 'NOVA-52', 'NOVA-53', 'NOVA-54',
  ...nativos.map((item) => item.id),
];

/* Categoria do app tem cinco valores; a categoria da direcao e mais fina que isso. */
const CATEGORIA = {
  'vestuário': 'Vestuário', 'vestuário masculino': 'Vestuário', 'vestuário feminino': 'Vestuário',
  'vestuário e calçado masculino': 'Vestuário', 'calçados': 'Calçados',
  'semijoias': 'Relógios & joias', 'acessórios': 'Relógios & joias', 'relógios & joias': 'Relógios & joias',
  'bolsas, calçados e acessórios': 'Calçados',
};
const FAMILIA = {
  'sem-pessoa': 'Produto herói', 'corpo-suporte': 'Lifestyle', humanizado: 'Lifestyle',
};

const receitaDe = (item) => item.receita ?? item.composicao ?? [];

const porId = new Map();
for (const item of [...primeiraLeva, ...lote, ...serie2, ...serie3, ...serie4, ...nativos]) {
  if (!porId.has(item.id)) porId.set(item.id, item);
}

const aspas = (texto) => `'${String(texto).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const blocosData = [];
const blocosReceita = [];
const copias = [];
const faltando = [];
let proximo = 148;

for (const idDirecao of APROVADAS) {
  const base = porId.get(idDirecao);
  if (!base) { faltando.push(`${idDirecao}: sem definição`); continue; }
  /* As nativas vivem no proprio arquivo; o marcador vem da origem, nao de cada item. */
  const ehNativa = nativos.some((n) => n.id === idDirecao);
  const item = { ...base, ...metadadosSerie2[idDirecao], native: ehNativa || base.native };
  const arquivo = item.arquivo ?? arquivoDe(idDirecao);
  if (!arquivo) { faltando.push(`${idDirecao}: sem imagem em ${ORIGEM}`); continue; }

  const id = `REF-${String(proximo).padStart(4, '0')}`;
  proximo += 1;
  const slug = item.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

  copias.push({ de: path.join(ORIGEM, arquivo), id, slug });

  const campos = [
    `    id: ${aspas(id)},`,
    `    name: ${aspas(item.nome)},`,
    `    family: ${aspas(item.native ? 'Lifestyle' : (FAMILIA[item.people] ?? 'Produto herói'))},`,
    `    category: ${aspas(item.category ?? CATEGORIA[item.categoria] ?? 'Outros')},`,
    /* Convenção do banco: quem preenche com variantes abre nos dois modos — em coleção
       mostra produtos distintos, em produto único mostra cores do mesmo modelo. */
    `    modes: [${(item.fillsWithVariants ? ['single', 'collection'] : [item.mode]).map(aspas).join(', ')}],`,
    `    people: ${aspas(item.people)},`,
    `    drivers: [${aspas(item.argumento)}],`,
    `    offerMechanics: [${aspas(item.mech)}],`,
  ];
  if (item.slots && item.slots > 1) campos.push(`    slots: ${item.slots},`);
  if (item.fillsWithVariants) campos.push('    fillsWithVariants: true,');
  if (item.repeatsSameProduct) campos.push('    repeatsSameProduct: true,');
  if (item.silent) campos.push('    silent: true,');
  if (item.native) campos.push('    native: true,');
  campos.push(`    tags: [${(item.tags ?? [item.caminho?.split(' · ').pop() ?? 'direção nova']).map(aspas).join(', ')}],`);
  campos.push(`    image: '/references/${id.toLowerCase()}.png',`);
  if (item.limits) campos.push(`    limits: ${aspas(item.limits)},`);
  campos.push(`    recipe:\n      ${aspas(receitaDe(item)[0].replace('O que define esta direção: ', ''))},`);
  blocosData.push(`  {\n${campos.join('\n')}\n  },`);

  const linhas = receitaDe(item).map((l) => `- ${l}`).join('\n');
  blocosReceita.push(`  '${id}': {\n    title: ${aspas(item.nome.toUpperCase())},\n    ${item.mode}: \`${linhas.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`,\n  },`);
}

if (faltando.length) {
  console.log('NÃO CADASTRADAS:\n' + faltando.map((f) => `  - ${f}`).join('\n') + '\n');
}
console.log(`${copias.length} direções prontas: REF-0148 a REF-${String(proximo - 1).padStart(4, '0')}`);

if (seco) process.exit(0);

fs.mkdirSync(curadoria, { recursive: true });
for (const { de, id, slug } of copias) {
  fs.copyFileSync(de, new URL(`public/references/${id.toLowerCase()}.png`, raiz));
  fs.copyFileSync(de, new URL(`${id}_${slug}.png`, curadoria));
}

/* Os blocos entram antes do fechamento de cada estrutura, sem tocar no que ja existe. */
const inserir = (arquivo, marcador, blocos) => {
  const url = new URL(arquivo, raiz);
  const original = fs.readFileSync(url, 'utf8');
  /* Os arquivos do app estão em CRLF; o marcador é escrito em LF. */
  const crlf = original.includes('\r\n');
  const texto = crlf ? original.replace(/\r\n/g, '\n') : original;
  const corte = texto.lastIndexOf(marcador);
  if (corte < 0) throw new Error(`marcador não encontrado em ${arquivo}`);
  const novo = `${texto.slice(0, corte)}${blocos.join('\n')}\n${texto.slice(corte)}`;
  fs.writeFileSync(url, crlf ? novo.replace(/\n/g, '\r\n') : novo);
};

inserir('lib/mvp-data.ts', '];\n\n/*\n * Ordenação genérica', blocosData);
inserir('lib/prompt-compiler.ts', '\n};\n\nfunction compileSingleContextPrompt', blocosReceita);
console.log(`Imagens copiadas para public/references e para REFERENCIAS-COM-PROMPT/LEVA 4.`);
