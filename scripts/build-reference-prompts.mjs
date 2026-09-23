/*
 * Prompts para gerar IMAGENS DE REFERÊNCIA novas.
 *
 * A imagem que sai daqui vira direção no banco, então ela precisa nascer das mesmas
 * regras que o app injeta em todo criativo: foco no produto, presença humana e
 * tipografia. Por isso este arquivo importa os blocos reais de `lib/house-rules.ts`
 * em vez de reescrevê-los — se a regra da casa mudar, estes prompts mudam junto.
 *
 * Dois tipos de saída, montados do mesmo jeito:
 *
 * 1. DIREÇÃO NOVA — preenche um caminho que hoje está vazio. A composição é escrita
 *    aqui em bullets, no mesmo formato de `testedDirections`, e o texto que sobrar
 *    vira a receita quando a imagem for aprovada.
 * 2. VARIAÇÃO — parte de uma direção que já funciona e troca a fotografia: ponto de
 *    vista, superfície, luz ou enquadramento. Também vem escrita inteira, porque o
 *    ChatGPT não conhece a referência de origem — mandar “mude tal coisa” não diria
 *    nada a ele, e compilar o prompt do app devolveria a imagem que o banco já tem.
 *
 * Roda com: npm run prompts:referencias  →  REFERENCIAS-NO-AR/prompts-novos.md
 */
import fs from 'node:fs';
import ts from 'typescript';
import { serie2 } from './referencias-serie-2.mjs';

const raiz = new URL('../', import.meta.url);
const transpilados = new Map();

function moduloTs(fileUrl) {
  if (transpilados.has(fileUrl.href)) return transpilados.get(fileUrl.href);
  let fonte = fs.readFileSync(fileUrl, 'utf8');
  for (const nome of new Set([...fonte.matchAll(/'@\/lib\/([A-Za-z0-9_-]+)'/g)].map((m) => m[1]))) {
    const dep = moduloTs(new URL(`lib/${nome}.ts`, raiz));
    fonte = fonte.split(`'@/lib/${nome}'`).join(`'${dep}'`);
  }
  const js = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  transpilados.set(fileUrl.href, dataUrl);
  return dataUrl;
}

const regras = await import(moduloTs(new URL('lib/house-rules.ts', raiz)));

const FORMATO = 'Gere UMA imagem publicitária realista em proporção 4:5, 1122 x 1402 px.';

/*
 * A referência é um molde: o lugar da marca fica marcado, nunca preenchido com uma
 * marca real. É a convenção que o Pedro passou a usar nas imagens que ele revisou.
 */
const MARCADOR = `MARCA
- Onde a peça pedir a marca da loja, escreva exatamente SEU LOGO, em caixa alta.
- Não invente nome de loja, não use marca real e não desenhe símbolo de marca existente.
- Nenhum produto pode trazer logotipo de marca real: use peças sem marca aparente.`;

/* Caminhos que hoje abrem sem nenhuma peça própria daquela oferta. */
const novas = [
  {
    id: 'NOVA-01',
    publico: 'Adulto de 30 a 55 anos, morando em casa ou apartamento próprio, que se preocupa com a qualidade da água que bebe.',
    caminho: 'produto único · até X% · função · sem pessoa · um produto',
    nome: 'Produto funcional com tópicos e número gigante',
    people: 'sem-pessoa',
    produto: 'um purificador de água de torneira, branco com detalhe cinza-escuro',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
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
    id: 'NOVA-02',
    publico: 'Adulto de 30 a 50 anos que passa o dia sentado e sente tensão no pescoço e nos ombros.',
    caminho: 'produto único · até X% · função · corpo sem rosto · um produto',
    nome: 'Produto funcional no corpo com coluna de benefícios',
    people: 'corpo-suporte',
    produto: 'um massageador cervical preto, em uso no pescoço e ombros',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: o produto aparece em uso sobre o corpo, e o argumento fica numa faixa vertical clara ao lado, separada por filetes finos em vez de cartões.',
      'Fundo de ambiente doméstico claro e neutro, profundamente desfocado, sem objeto reconhecível.',
      'O enquadramento começa abaixo do queixo e termina na altura do peito. O produto é o elemento mais nítido e mais iluminado do quadro.',
      'Na faixa vertical à esquerda, alinhado à esquerda: a marca no alto; três linhas curtas de benefício separadas por filetes finos horizontais; e o bloco da oferta embaixo, com o número em corpo grande.',
      'A roupa da pessoa é lisa e de cor claramente diferente do produto, num tom intermediário e sem brilho.',
      'Esta peça não tem selo, cartão, moldura, CTA, estrela de avaliação nem depoimento.',
    ],
  },
  {
    id: 'NOVA-03',
    publico: 'Mulher de 25 a 45 anos que seca e modela o cabelo em casa, sem salão.',
    caminho: 'produto único · até X% · função · pessoa com rosto · um produto',
    nome: 'Produto funcional em cena de uso com parede livre',
    people: 'humanizado',
    produto: 'uma escova secadora rosé, em uso no próprio cabelo',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: uma pessoa usa o produto de verdade em um ambiente real, e toda a comunicação vive na parede clara ao lado, sem painel e sem divisória. A parede da cena continua atrás do texto.',
      'Ambiente interno claro, com luz natural de janela. A parede lisa ocupa um lado inteiro do quadro.',
      'A pessoa aparece da cabeça até a cintura, com rosto inteiro e expressão natural. O produto fica na altura do rosto, nítido e bem iluminado.',
      'Sobre a parede, alinhado à esquerda: a marca pequena no alto; uma headline de duas linhas em caixa alta pesada; um filete horizontal curto; e a oferta em uma linha só, caixa alta, corpo médio.',
      'Não existe lista de benefícios com ícone: o argumento cabe na headline.',
      'Esta peça não tem selo, cartão, moldura, CTA nem texto sobre o corpo da pessoa.',
    ],
  },
  {
    id: 'NOVA-04',
    publico: 'Adulto de 20 a 45 anos, rotina fora de casa, academia ou trabalho, que leva bebida consigo.',
    caminho: 'produto único · até X% · função · sem pessoa · duas ou três cores',
    nome: 'Trio funcional com benefício em linha única',
    people: 'sem-pessoa',
    produto: 'três garrafas térmicas do mesmo modelo, em preto fosco, verde oliva e areia',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: o mesmo produto em três cores, alinhado como mostruário, com a oferta em cima e uma única linha de benefício embaixo. O argumento cabe numa frase; o resto é a variedade de cores.',
      'Fundo branco levemente cinzento, contínuo, sem cenário, sem plinto e sem textura.',
      'As três unidades ficam lado a lado, todas em pé, no mesmo ângulo e no mesmo tamanho, com espaçamento regular e sem se sobrepor. A do meio avança ligeiramente. Sombra de contato suave sob cada uma.',
      'No alto, centralizados: a marca em corpo pequeno e espaçado, e a oferta em caixa alta pesada ocupando quase toda a largura — o maior elemento de texto da peça.',
      'Abaixo dos produtos, uma única linha centralizada, corpo pequeno e espaçado, com os benefícios separados por pontos.',
      'Esta peça não tem pessoa, cenário, selo, moldura, ícone nem CTA.',
    ],
  },
  {
    id: 'NOVA-05',
    publico: 'Homem de 25 a 45 anos que usa relógio como acessório diário de estilo.',
    caminho: 'produto único · até X% · estética · corpo sem rosto · um produto',
    nome: 'Produto no corpo em estúdio escuro com número metálico',
    people: 'corpo-suporte',
    produto: 'um relógio de pulso prateado com mostrador azul, em um antebraço',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
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
    id: 'NOVA-06',
    publico: 'Mulher de 25 a 45 anos que compra bolsa pelo desenho e pela cor, não pela função.',
    caminho: 'produto único · até X% · estética · sem pessoa · duas ou três cores',
    nome: 'Trio deitado em superfície clara vista de cima',
    people: 'sem-pessoa',
    produto: 'três bolsas de ombro do mesmo modelo, em caramelo, preto e off-white',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: as três unidades estão deitadas e fotografadas de cima sobre uma superfície contínua, em diagonal solta, sem alinhamento rígido. É mostruário de cor sem virar grade.',
      'A superfície é clara e quente — papel mineral ou pedra fosca clareada — e ocupa o quadro inteiro, sem horizonte, sem mesa e sem cenário.',
      'As três unidades se distribuem em diagonal suave, com folga entre elas. A do centro fica ligeiramente maior e mais à frente. Alças e detalhes arrumados, sem nó e sem dobra confusa.',
      'No canto superior, alinhado à esquerda e em preto: a marca pequena e espaçada, um filete horizontal curto, e a oferta em duas linhas de caixa alta pesada.',
      'Nenhuma cor gráfica além do preto do texto. Toda a cor vem dos produtos.',
      'Esta peça não tem pessoa, selo, etiqueta, preço, CTA nem moldura.',
    ],
  },
  {
    id: 'NOVA-07',
    publico: 'Homem de 25 a 45 anos que compra peças de inverno pela estética e monta looks completos.',
    caminho: 'coleção · até X% · estética · corpo sem rosto · quatro ou mais',
    nome: 'Close sem rosto com a coleção em miniaturas na coluna',
    people: 'corpo-suporte',
    produto:
      'cinco peças da mesma coleção masculina de inverno, todas lisas e sem estampa: um moletom bege vestido por um homem, e em miniaturas recortadas uma jaqueta corta-vento preta, uma camiseta branca, um colete acolchoado verde-escuro e uma calça de moletom cinza',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: uma pessoa fotografada de perto, do maxilar para baixo, veste a peça principal e ocupa um lado inteiro do quadro; do outro lado, uma coluna de texto termina numa fileira de miniaturas recortadas com as outras peças da coleção.',
      'Fundo claro e quente, liso e contínuo, com luz suave vinda de um lado.',
      'A pessoa fica de frente no lado direito do quadro, enquadrada do maxilar até o quadril, em close. O rosto não aparece. Braços relaxados ao lado do corpo, sem cobrir o produto.',
      'O moletom é o maior e o mais iluminado elemento do quadro. A calça é lisa, neutra, em tom escuro e apagado, claramente secundária.',
      'Na coluna esquerda, alinhado à esquerda: a marca pequena, um filete horizontal curto e a oferta em caixa alta pesada de duas linhas — o maior texto da peça.',
      'Embaixo da oferta, na mesma coluna, uma fileira de quatro miniaturas recortadas direto sobre o fundo claro, sem cartão e sem moldura, cada uma com uma das outras peças, todas no mesmo tamanho, de frente e na mesma luz.',
      'Esta peça não tem selo, cartão, moldura, benefício escrito nem CTA.',
      'Com menos produtos confirmados, a fileira de miniaturas encurta; nada é inventado para completá-la.',
    ],
  },
  {
    id: 'NOVA-08',
    publico: 'Adulto de 25 a 45 anos que compra vestuário pela coleção inteira, não por peça avulsa.',
    caminho: 'coleção · até X% · estética · corpo sem rosto · quatro ou mais',
    nome: 'Mãos arrumando a coleção sobre a mesa, vista de cima',
    people: 'corpo-suporte',
    produto: 'quatro peças dobradas de uma mesma coleção, sobre mesa de madeira clara',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: a cena é vista de cima e duas mãos entram pela borda inferior ajeitando as peças. O gesto humano dá vida à peça sem que ninguém apareça.',
      'A madeira clara da mesa ocupa o quadro inteiro. Luz natural vinda de um lado, sombras suaves e curtas.',
      'Só as mãos e um pedaço dos antebraços aparecem: nada de rosto, ombro ou tronco. As mãos tocam uma das peças, sem cobrir nenhuma delas por inteiro.',
      'As peças ficam dobradas e distribuídas com folga, cada uma em uma cor distinta, todas no mesmo tratamento de luz.',
      'Na área livre da mesa, no alto: a marca pequena e espaçada, centralizada, e a oferta em caixa alta pesada numa linha só, também centralizada.',
      'Esta peça não tem selo, cartão, etiqueta, preço, CTA nem moldura.',
    ],
  },
];

/*
 * Variações de direções que já funcionam.
 *
 * Variação não é a mesma imagem com outro produto: isso o compilador do app já faz,
 * e o resultado sai idêntico ao que o banco tem. O que muda aqui é a fotografia —
 * ponto de vista, superfície, luz ou enquadramento — enquanto o que faz o layout
 * funcionar fica de pé. Por isso o prompt é escrito inteiro, como qualquer direção:
 * o ChatGPT não conhece a referência de origem, então descrever “mude tal coisa”
 * não significaria nada para ele. O que se manteve e o que mudou fica no markdown,
 * para o Pedro conferir de fora.
 */
const variacoes = [
  {
    id: 'VAR-01',
    base: 'REF-0067',
    mantem: 'a pilha de unidades idênticas, o selo circular carregando a oferta e a headline por cima da foto',
    muda: 'a câmera desce do nível da mesa para uma vista de cima em diagonal, a sala quente vira bancada escura de cozinha, o selo troca de lado e a headline encolhe para duas linhas',
    publico: 'Homem de 25 a 45 anos que compra cueca em pacote e repõe a gaveta inteira de uma vez.',
    caminho: 'produto único · compre X leve Y · estética · sem pessoa · uma unidade repetida',
    nome: 'Pilha de unidades vista de cima em bancada escura',
    people: 'sem-pessoa',
    produto:
      'seis cuecas boxer do mesmo modelo, dobradas e empilhadas uma sobre a outra, em azul-marinho, vinho, verde-militar, cinza, preto e off-white',
    oferta: 'COMPRE 5, LEVE 7',
    composicao: [
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
    id: 'VAR-02',
    base: 'REF-0063',
    mantem: 'as três unidades lado a lado do mesmo modelo, o bloco tipográfico no topo e a faixa de oferta fechando embaixo',
    muda: 'as peças deixam de flutuar em manequim invisível e passam a estar penduradas em cabides numa arara, o fundo cinza frio vira claro e quente, e a faixa de oferta troca o vermelho pelo preto',
    publico: 'Adulto de 25 a 45 anos que compra camiseta básica em mais de uma cor de uma vez.',
    caminho: 'produto único · compre X leve Y · estética · sem pessoa · duas ou três cores',
    nome: 'Trio pendurado na arara com faixa de oferta',
    people: 'sem-pessoa',
    produto: 'três camisetas caneladas do mesmo modelo, em off-white, preto e verde-musgo, penduradas em cabides iguais',
    oferta: 'COMPRE 2, LEVE 3',
    composicao: [
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
    id: 'VAR-03',
    base: 'REF-0043',
    mantem: 'o mesmo modelo em duas cores vestido lado a lado em locação clara, e a coluna de texto de um lado, com marca, nome, filete e número grande',
    muda: 'a dupla perde o rosto e vem mais perto: o enquadramento vai do maxilar até o quadril, e a camisa vira o maior elemento da foto',
    publico: 'Homem de 25 a 45 anos que compra camisa leve pelo caimento e pela cor.',
    caminho: 'produto único · até X% · estética · corpo sem rosto · duas cores',
    nome: 'Dupla sem rosto com a mesma camisa em duas cores',
    people: 'corpo-suporte',
    produto: 'duas camisas de linho masculinas do mesmo modelo, uma branca e uma azul-marinho, vestidas por dois homens',
    oferta: 'ATÉ 70% DE DESCONTO',
    composicao: [
      'O que define esta direção: duas pessoas lado a lado, do maxilar para baixo, vestem o mesmo modelo em cores diferentes, e toda a comunicação vive numa coluna de texto ao lado, sobre a área clara da locação.',
      'Locação externa de pedra clara, com parede lisa e luz natural alta. O fundo é claro e quase sem detalhe.',
      'As duas pessoas ficam de frente, lado a lado, enquadradas do maxilar até o quadril, em close. Os rostos não aparecem. Mãos nos bolsos ou ao lado do corpo, sem cobrir as camisas.',
      'As calças são lisas, neutras, iguais nas duas pessoas, em tom escuro e apagado, claramente secundárias.',
      'As duas camisas são os dois maiores elementos da fotografia. Braços relaxados, sem cobrir a frente da camisa, e nenhuma pessoa encobre a outra.',
      'Na coluna lateral, sobre o fundo claro e alinhado à esquerda: a marca pequena no alto; o nome do produto em três linhas de caixa alta pesada; um filete horizontal curto; e o bloco da oferta, com uma palavra pequena espaçada, o número em corpo gigante e uma linha pequena em caixa alta espaçada.',
      'O número da oferta é o único elemento em cor quente; todo o resto do texto é escuro.',
      'Esta peça não tem selo, cartão, moldura, relógio, acessório em destaque, benefício escrito nem CTA.',
      'Com uma cor confirmada, fica uma pessoa só, no mesmo enquadramento, e a coluna de texto continua igual.',
    ],
  },
];

/* A regra de tipografia do app manda imitar a marca da loja. Aqui não existe loja. */
const DESIGN = regras.HOUSE_DESIGN_RULE.replace(
  '- Use o estilo tipográfico da loja registrado no contexto: mesma família de letra, mesmo peso e mesma caixa que a marca usa. Se ele não tiver sido confirmado, escolha uma tipografia neutra coerente com o produto e repita a mesma escolha em toda a peça.',
  '- Escolha uma tipografia neutra e comercial, coerente com o produto, e repita a mesma escolha em toda a peça. Esta imagem é um molde: ela não tem marca real para imitar.',
);

/*
 * O que muda de imagem para imagem. A presença humana anda junto porque depende do
 * `people` de cada direção — é a única regra da casa que não é igual nas onze.
 */
function blocoVariavel(nova) {
  return `PRODUTO DESTA IMAGEM
- Mostre ${nova.produto}.
- É um produto sem marca aparente, fotografado de forma realista, como foto de catálogo.

PÚBLICO-ALVO DESTE ANÚNCIO
- ${nova.publico}
- É este o público que a regra de presença humana chama de “registrado no contexto”.

DIREÇÃO VISUAL
${nova.composicao.map((linha) => `- ${linha}`).join('\n')}

${nova.silent ? regras.SILENT_RULE : `OFERTA
- Escreva exatamente: “${nova.oferta}”.
- Não invente preço, cupom, prazo, garantia, avaliação ou condição além dessa.`}

${regras.peopleRule({ people: nova.people })}`;
}

/* O que é igual nas onze: a regra da casa, o marcador de marca e a tipografia. */
const BLOCO_FIXO = `${regras.HOUSE_PRODUCT_RULE}

${MARCADOR}

${DESIGN}`;

/*
 * Mesma ordem e mesmos blocos de `compileReferencePrompt` em lib/prompt-compiler.ts:
 * regra da casa, conteúdo obrigatório com as duas regras de conflito, direção visual
 * com título, presença humana, design e saída. A única parte que não vem do app é
 * produto e público, que no app chegam pelo contexto capturado da loja — aqui não
 * existe loja, então eles vêm escritos.
 */
function promptDeDirecaoNova(nova) {
  const oferta = nova.silent
    ? '- Esta direção é uma peça sem texto: não escreva a oferta, nem título, nem marca. Ela vende só pela imagem.'
    : `- Escreva exatamente a oferta: “${nova.oferta}”.`;
  const pessoa = regras.peopleRule({ people: nova.people });
  return `${FORMATO}

${regras.HOUSE_PRODUCT_RULE}

PRODUTO DESTA IMAGEM
- ${nova.produto.charAt(0).toUpperCase()}${nova.produto.slice(1)}.
- Produto sem marca aparente, fotografado de forma realista, como foto de catálogo.

PÚBLICO-ALVO DESTE ANÚNCIO
- ${nova.publico}

CONTEÚDO OBRIGATÓRIO
${oferta}
- Não invente preço, avaliação, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial.
- Se houver conflito entre a direção visual e a leitura imediata do produto, a leitura do produto vence.

${MARCADOR}

DIREÇÃO VISUAL — ${nova.nome.toUpperCase()}
${nova.composicao.map((linha) => `- ${linha}`).join('\n')}

${nova.silent ? `${regras.SILENT_RULE}

` : ''}${pessoa ? `${pessoa}

` : ''}${DESIGN}

SAÍDA
- Entregue uma única imagem final e independente em 4:5.
- Não gere alternativas, colagem, grade, carrossel ou explicações em texto.

Entregue agora somente a imagem final desta direção.`;
}

const partes = [
  '# Prompts para gerar referências novas',
  '',
  'Gerado por `npm run prompts:referencias`. Cada bloco é um prompt inteiro: cole um por vez',
  'no ChatGPT, com a conversa limpa. A regra da casa, a presença humana e as regras de',
  'tipografia vêm dos mesmos arquivos que o app usa, então a imagem nasce obedecendo o que',
  'o banco vai cobrar dela depois.',
  '',
  '---',
  '',
  '## Direções novas — caminhos que hoje abrem sem nenhuma peça própria da oferta',
  '',
];

for (const nova of novas) {
  partes.push(`### ${nova.id} · ${nova.nome}`, '', `**Preenche:** ${nova.caminho}`, '', '```', promptDeDirecaoNova(nova), '```', '');
}

partes.push(
  '---',
  '',
  '## Variações de direções que já funcionam',
  '',
  'Aqui não é a mesma imagem com outro produto — isso o app já faz, e o resultado sai igual',
  'ao que o banco tem. O que muda é a fotografia: ponto de vista, superfície, luz ou',
  'enquadramento. O que faz o layout funcionar continua de pé.',
  '',
);

for (const variacao of variacoes) {
  partes.push(
    `### ${variacao.id} · ${variacao.nome}`, '',
    `**Nasce de:** ${variacao.base} — **preenche:** ${variacao.caminho}`, '',
    `**Mantém:** ${variacao.mantem}`, '',
    `**Muda:** ${variacao.muda}`, '',
    '```', promptDeDirecaoNova(variacao), '```', '',
  );
}

partes.push('---', '', '## Série 2 — lacunas que continuavam abertas', '');
for (const nova of serie2) {
  partes.push(`### ${nova.id} · ${nova.nome}`, '', `**Preenche:** ${nova.caminho}`, '', '```', promptDeDirecaoNova(nova), '```', '');
}

const destino = new URL('../../REFERENCIAS-NO-AR/prompts-novos.md', import.meta.url);
fs.writeFileSync(destino, partes.join('\n'), 'utf8');
console.log(`prompts-novos.md gerado — ${novas.length} direções novas e ${variacoes.length} variações.`);

/*
 * Mesma matéria-prima, partida em dois para rodar em lote num canvas de nós.
 * O que é igual nas onze fica no nó de imagem e é escrito uma vez só; o que muda
 * vira um item da lista. A proporção sai do prompt e vira ajuste do nó.
 */
/* Já geradas e aprovadas: ficam no arquivo de registro, fora do lote. */
const JA_APROVADAS = new Set([
  'NOVA-01', 'NOVA-02', 'NOVA-03', 'NOVA-04', 'NOVA-05', 'NOVA-06', 'NOVA-08',
  'VAR-01', 'VAR-02', 'NOVA-09', 'NOVA-11', 'NOVA-07', 'VAR-03', 'NOVA-10',
]);
const todas = [...novas, ...variacoes, ...serie2].filter((item) => !JA_APROVADAS.has(item.id));

const lote = [
  `# Freepik Spaces — lote de ${todas.length} referências`,
  '',
  'Gerado por `npm run prompts:referencias`. O prompt é o mesmo do arquivo do ChatGPT,',
  'partido em dois: o que é igual nas onze vai no nó de imagem, o que muda vira item da',
  'lista. A proporção 4:5 sai do texto e passa a ser ajuste do nó.',
  '',
  '---',
  '',
  '## 1. Nó de imagem — cole no campo de prompt, uma vez só',
  '',
  'Este texto não muda de um item para outro. A entrada da lista entra junto com ele.',
  '',
  '```',
  BLOCO_FIXO,
  '```',
  '',
  '## 2. Ajustes do nó de imagem',
  '',
  '| ajuste | valor |',
  '| --- | --- |',
  '| proporção | 4:5 (retrato) |',
  '| resolução | a maior que o modelo oferecer |',
  '| imagens por item | 2, para ter escolha |',
  '| imagem de referência | nenhuma — a receita é texto autossuficiente |',
  '| modelo | um que escreva texto legível; é o que separa uma referência usável de uma inútil |',
  '',
  `## 3. Nó de lista — ${todas.length} itens`,
  '',
  'Um item por imagem. Só entra aqui o que ainda não foi gerado com o prompt atual.',
  '',
];

for (const item of todas) {
  lote.push(
    `### ${item.id} · ${item.nome}`, '',
    item.base
      ? `**Nasce de:** ${item.base} — **preenche:** ${item.caminho}`
      : `**Preenche:** ${item.caminho}`,
    '',
    '```', blocoVariavel(item), '```', '',
  );
}

/* A lista gera na ordem dos itens: este índice casa cada imagem com a sua direção. */
lote.splice(lote.indexOf('---') , 0,
  '## Ordem do lote',
  '',
  '| # | id | direção | preenche |',
  '| --- | --- | --- | --- |',
  ...todas.map((item, i) => `| ${i + 1} | ${item.id} | ${item.nome} | ${item.caminho} |`),
  '',
);

const destinoLote = new URL('../../REFERENCIAS-NO-AR/prompts-novos-freepik.md', import.meta.url);
fs.writeFileSync(destinoLote, lote.join('\n'), 'utf8');
console.log(`prompts-novos-freepik.md gerado — 1 bloco fixo e ${todas.length} itens de lista.`);

/*
 * Texto corrido para colar de uma vez num node de lista que separa por linha em
 * branco: cada item vira um bloco sem quebra interna, e só existe uma linha vazia
 * entre um item e o próximo. Sem cabeçalho, sem markdown — é só o que a lista precisa.
 */
const corrido = todas
  .map((item) => blocoVariavel(item).split('\n').filter((linha) => linha.trim() !== '').join('\n'))
  .join('\n\n');

const destinoCorrido = new URL('../../REFERENCIAS-NO-AR/prompts-novos-freepik-corrido.txt', import.meta.url);
fs.writeFileSync(destinoCorrido, corrido, 'utf8');
console.log(`prompts-novos-freepik-corrido.txt gerado — ${todas.length} itens separados por linha em branco.`);
