import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const transpiled = new Map();

// Resolve o alias "@/lib/*" trocando o specifier pelo data URL do módulo já transpilado.
function transpileToDataUrl(fileUrl) {
  if (transpiled.has(fileUrl.href)) {
    return transpiled.get(fileUrl.href);
  }

  let source = fs.readFileSync(fileUrl, 'utf8');

  for (const name of new Set([...source.matchAll(/'@\/lib\/([A-Za-z0-9_-]+)'/g)].map((match) => match[1]))) {
    const dependency = transpileToDataUrl(new URL(`../lib/${name}.ts`, import.meta.url));
    source = source.split(`'@/lib/${name}'`).join(`'${dependency}'`);
  }

  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const dataUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`;
  transpiled.set(fileUrl.href, dataUrl);
  return dataUrl;
}

async function importTypescriptModule(path) {
  return import(transpileToDataUrl(new URL(path, import.meta.url)));
}

const compiler = await importTypescriptModule('../lib/prompt-compiler.ts');
const flow = await importTypescriptModule('../lib/flow-prompts.ts');
const data = await importTypescriptModule('../lib/mvp-data.ts');

const references = [
  ['REF-0001', 'Split premium escuro'],
  ['REF-0007', 'Mosaico editorial'],
  ['REF-0003', 'Cenário tátil e quente'],
  ['REF-0005', 'Cartão físico de oferta'],
  ['REF-0008', 'Native ad retrô'],
].map(([id, name]) => ({ id, name, recipe: 'fallback não validado' }));

const single = {
  mode: 'single',
  exactTarget: 'Suporte Pocket preto',
  sourceUrl: 'https://loja.test/produto',
  linkAccess: 'public',
  offer: '30% OFF',
};
const collection = {
  mode: 'collection',
  exactTarget: 'Automarken-Kollektion',
  sourceUrl: 'https://loja.test/colecao',
  linkAccess: 'protected',
  offer: 'Kaufen Sie 2 und erhalten Sie 1 gratis',
};

const singleContext = compiler.compileContextPrompt(single);
const collectionContext = compiler.compileContextPrompt(collection);
const singleBatch = compiler.compileMasterPrompt(single, references);
const collectionBatch = compiler.compileMasterPrompt(collection, references);
const singleReference = compiler.compileReferencePrompt(single, references[0]);
const collectionReference = compiler.compileReferencePrompt(collection, references[0]);
const recovery = compiler.compileRecoveryPrompt(references, [1, 2, 3, 4]);
const pilotReference = data.references.find(({ id }) => id === 'REF-0017');
const pilotPrompt = compiler.compileReferencePrompt(single, pilotReference);
const singlePilotBatch = compiler.compileMasterPrompt(
  single,
  ['REF-0010', 'REF-0016', 'REF-0019', 'REF-0026', 'REF-0028'].map((id) =>
    data.references.find((reference) => reference.id === id),
  ),
);
const collectionPilotBatch = compiler.compileMasterPrompt(
  collection,
  ['REF-0009', 'REF-0011', 'REF-0012', 'REF-0015', 'REF-0025'].map((id) =>
    data.references.find((reference) => reference.id === id),
  ),
);

assert.ok(singleContext.startsWith('Vamos criar um criativo de PRODUTO ÚNICO.'));
assert.ok(singleContext.includes('LINK DO PRODUTO: https://loja.test/produto'));
assert.ok(singleContext.includes('CONTEXTO CAPTURADO\n\nMarca:'));
assert.ok(singleContext.includes('esta campanha anuncia somente o produto do link'));

assert.ok(
  collectionContext.startsWith(
    'Vamos preparar o contexto factual de uma campanha publicitária de COLEÇÃO.',
  ),
);
assert.ok(collectionContext.includes('CONTEXTO CAPTURADO — V004'));
assert.ok(collectionContext.includes('Não peça senha.'));
assert.ok(collectionContext.includes('na quantidade que cada peça pedir'));

assert.equal((singleBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.equal((collectionBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.ok(singleBatch.includes('CENÁRIO TÁTIL E QUENTE'));
assert.ok(collectionBatch.includes('A quantidade muda de uma direção para outra'));
/*
 * Trava de colagem. O cliente do ChatGPT decide o formato de entrega, então o prompt
 * precisa declarar a contagem de arquivos e recusar todo formato agregado.
 */
for (const [nome, prompt] of [['lote produto único', singleBatch], ['lote coleção', collectionBatch]]) {
  assert.ok(prompt.includes('EXATAMENTE CINCO arquivos de imagem anexados'), `${nome} sem a contagem de arquivos`);
  assert.ok(prompt.includes('conte os arquivos anexados'), `${nome} sem a conferência de contagem`);
  for (const formato of ['colagem', 'grade', 'mosaico', 'contact sheet', 'carrossel', 'moodboard']) {
    assert.ok(prompt.includes(formato), `${nome} não recusa o formato "${formato}"`);
  }
}
for (const [nome, prompt] of [
  ['recuperação em lote', recovery],
  ['recuperação unitária', compiler.compileSingleRecoveryPrompt(references[1], 1)],
  ['variação individual', compiler.compileIndividualPrompt(references[0], 0, '', 'variation')],
]) {
  assert.ok(/colagem/.test(prompt), `${nome} sem a trava de colagem`);
}
assert.ok(singleReference.includes('SOMENTE UM criativo publicitário mestre'));
assert.ok(singleReference.includes('uma única imagem final e independente em 4:5'));
assert.ok(singleReference.includes('Anuncie somente o produto “Suporte Pocket preto”'));
assert.ok(collectionReference.includes('Anuncie somente a coleção “Automarken-Kollektion”'));
assert.ok(collectionReference.includes('produtos ou looks distintos e elegíveis'));

assert.ok(recovery.startsWith('Você gerou corretamente o CRIATIVO 01. Não o gere novamente.'));
assert.ok(recovery.includes('Agora gere somente os criativos pendentes: 02, 03, 04, 05.'));
assert.ok(recovery.includes('Não responda com descrições em texto.'));

/*
 * O banco cresce; travar o total obrigaria a editar este arquivo a cada inclusão.
 * O que precisa ser estável é a integridade de cada registro e o conjunto validado.
 */
assert.ok(data.references.length >= 25);
assert.equal(new Set(data.references.map(({ id }) => id)).size, data.references.length);
assert.ok(data.references.every(({ modes }) => modes.length > 0));
assert.ok(data.references.every(({ id, name, family, category, image, recipe }) =>
  /^REF-\d{4}$/.test(id)
  && Boolean(name && family && category)
  && new RegExp(`^/references/${id.toLowerCase()}\\.(png|jpg)$`).test(image)
  && recipe.length > 80
));
assert.deepEqual(
  data.references.filter(({ validated }) => validated).map(({ id }) => id),
  ['REF-0001', 'REF-0003', 'REF-0005', 'REF-0007', 'REF-0008'],
);
assert.ok(pilotPrompt.includes('ANTES E DEPOIS DIRETO'));
assert.ok(pilotPrompt.includes('Só pode ser usado com resultado visual e comparação comprovados.'));
assert.equal((singlePilotBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.equal((collectionPilotBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.ok(singlePilotBatch.includes('PRODUTO ZENITAL COM BENEFÍCIOS'));
assert.ok(singlePilotBatch.includes('MODELO EDITORIAL COM OFERTA GIGANTE'));
assert.ok(collectionPilotBatch.includes('VITRINE TÁTIL DE COLEÇÃO'));
assert.ok(collectionPilotBatch.includes('FLAT LAY RADIAL DE COLEÇÃO'));
assert.ok(collectionPilotBatch.includes('Limite operacional:'));

const carousel = flow.compileCarouselPrompt();
assert.ok(carousel.includes('EXATAMENTE CINCO produtos ou looks distintos'));
assert.ok(carousel.includes('QUANDO HOUVER UMA PESSOA NA IMAGEM'));
assert.ok(carousel.includes('QUANDO O PRODUTO ESTIVER SEM PESSOA'));
assert.ok(carousel.includes('cinco imagens finais SEPARADAS e INDEPENDENTES, todas em 4:5'));
assert.ok(carousel.includes('Não entregue colagem, grade, carrossel montado'));

const squareCreatives = flow.compileCreativeFormatPrompt('1:1');
const verticalCarousel = flow.compileCarouselFormatPrompt('9:16');
assert.ok(squareCreatives.includes('cinco criativos mestres 4:5 aprovados'));
assert.ok(squareCreatives.includes('1:1, preferencialmente 1080 × 1080 px'));
assert.ok(verticalCarousel.includes('cinco cards 4:5 do carrossel já aprovados'));
assert.ok(verticalCarousel.includes('9:16, preferencialmente 1080 × 1920 px'));

assert.deepEqual(
  flow.socialPrompts.map(({ id }) => id),
  ['feed', 'highlights', 'weekly', 'reviews'],
);
assert.ok(flow.socialPrompts[0].prompt.includes('Crie 9 posts individuais'));
assert.ok(flow.socialPrompts[1].prompt.includes('Crie 9 stories individuais'));
assert.ok(flow.socialPrompts[2].prompt.includes('crie 6 stories de Instagram'));
assert.ok(flow.socialPrompts[3].prompt.includes('Me entregue 3 reviews de cliente'));

const audio = flow.compileAudioPrompt(collection);
assert.ok(audio.includes('Duração máxima de 30 segundos'));
assert.ok(audio.includes('Kaufen Sie 2 und erhalten Sie 1 gratis'));
assert.ok(audio.includes('Automarken-Kollektion'));

const video = flow.compileVideoPrompt();
assert.equal((video.match(/PROMPT KLING — VÍDEO 0[1-3]/g) ?? []).length, 3);
assert.ok(video.includes('Não escreva, adapte ou gere uma nova narração'));
assert.ok(video.includes('Só varie cores quando essas variações estiverem confirmadas'));

const flyer = flow.compileFlyerPrompt({
  prize: 'iPhone 17',
  coupon: 'LOJA20',
  discount: '20%',
});
assert.ok(flyer.includes('Prêmio do sorteio: iPhone 17'));
assert.ok(flyer.includes('Cupom: LOJA20'));
assert.ok(flyer.includes('Você e outros 9 clientes'));
assert.ok(flyer.includes('A6 — 105 × 148 mm'));

/*
 * Regra da casa: nenhum prompt que gera imagem pode sair sem o bloco de foco no produto.
 * Vale para qualquer nicho e vem antes da direção visual da referência.
 */
const promptsQueGeramImagem = [
  ['lote produto único', singleBatch],
  ['lote coleção', collectionBatch],
  ['direção única produto único', singleReference],
  ['direção única coleção', collectionReference],
  ['direção piloto', pilotPrompt],
  ['variação individual', compiler.compileIndividualPrompt(references[0], 0, '', 'variation')],
  ['carrossel', carousel],
  ['formato 1:1', squareCreatives],
  ['formato 9:16 do carrossel', verticalCarousel],
  ['vídeo Kling', video],
  ['panfleto', flyer],
  ...flow.socialPrompts.map(({ id, prompt }) => [`social ${id}`, prompt]),
];

for (const [nome, prompt] of promptsQueGeramImagem) {
  assert.ok(
    prompt.includes('REGRA DA CASA — O PRODUTO EM PRIMEIRO LUGAR'),
    `${nome} saiu sem a regra da casa de foco no produto`,
  );
}

// Nos criativos completos a regra vem inteira e antes da direção visual.
for (const [nome, prompt] of [
  ['lote produto único', singleBatch],
  ['lote coleção', collectionBatch],
  ['direção única produto único', singleReference],
  ['direção piloto', pilotPrompt],
]) {
  assert.ok(prompt.includes('Esta regra vale mais que a direção visual'), `${nome} sem a trava de prioridade`);
  const inicioDaDirecao = prompt.includes('DIREÇÃO VISUAL')
    ? prompt.indexOf('DIREÇÃO VISUAL')
    : prompt.indexOf('CRIATIVO 01 —');
  assert.ok(inicioDaDirecao > 0, `${nome} não tem direção visual identificável`);
  assert.ok(
    prompt.indexOf('REGRA DA CASA — O PRODUTO EM PRIMEIRO LUGAR') < inicioDaDirecao,
    `${nome} traz a regra da casa depois da direção visual`,
  );
  assert.ok(prompt.includes('DESIGN E TIPOGRAFIA'), `${nome} sem as regras de design`);
}

/*
 * Presença humana: cada referência declara se o corpo entra como suporte do produto,
 * como personagem, ou se a peça não tem pessoa nenhuma.
 */
const presencaEsperada = [
  ['REF-0002', 'corpo-suporte', 'Esta direção é desumanizada'],
  ['REF-0005', 'corpo-suporte', 'Esta direção é desumanizada'],
  ['REF-0006', 'humanizado', 'Esta direção é humanizada'],
  ['REF-0010', 'sem-pessoa', 'Esta direção não usa pessoas.'],
];

for (const [id, valor, marca] of presencaEsperada) {
  const reference = data.references.find((item) => item.id === id);
  assert.equal(reference.people, valor, `${id} deveria estar declarada como ${valor}`);
  assert.ok(
    compiler.compileReferencePrompt(single, reference).includes(marca),
    `${id} não levou o bloco de presença humana correto`,
  );
}

// Sem o campo declarado, o bloco não entra e o modelo volta a decidir sozinho.
assert.ok(!singleReference.includes('PRESENÇA HUMANA'));

// Contexto: sem público-alvo e tipografia capturados, a regra de casting e de tipografia fica sem fonte.
for (const [nome, prompt] of [['produto único', singleContext], ['coleção', collectionContext]]) {
  assert.ok(/Público-alvo d[oa]/.test(prompt), `contexto ${nome} não captura o público-alvo`);
  assert.ok(prompt.includes('Estilo tipográfico da loja'), `contexto ${nome} não captura a tipografia`);
}

/*
 * Argumento de venda. Categoria não direciona referência: o que direciona é o que
 * faz o cliente comprar. A biblioteca ordena por isso, sem esconder opção.
 */
assert.deepEqual(data.salesDrivers.map(({ value }) => value), ['funcao', 'estetica']);
assert.ok(data.references.every(({ drivers }) => drivers?.length), 'toda referência precisa declarar seu argumento de venda');
assert.ok(
  data.references.every(({ drivers }) => drivers.every((item) => ['funcao', 'estetica'].includes(item))),
  'argumento de venda fora da lista',
);

for (const driver of ['funcao', 'estetica']) {
  const ordenadas = data.sortByDriver(data.references, driver);
  const posicoes = ordenadas.map((item) => data.driverFit(item, driver));
  assert.deepEqual(posicoes, [...posicoes].sort((a, b) => a - b), `ordenação por ${driver} saiu fora de ordem`);
  assert.ok(ordenadas.some((item) => item.drivers.includes(driver)), `nenhuma referência serve ao argumento ${driver}`);
  assert.ok(ordenadas[0].drivers.includes(driver), `a primeira referência para ${driver} não serve a esse argumento`);
}

// Produto que vende pela foto não pode abrir a lista com peça cheia de tópicos.
const porEstetica = data.sortByDriver(data.references, 'estetica');
const densaNaFrente = porEstetica.findIndex((item) => item.drivers.includes('funcao'));
const ultimaCompativel = porEstetica.map((item) => item.drivers.includes('estetica')).lastIndexOf(true);
assert.ok(densaNaFrente > ultimaCompativel, 'referência cheia de tópicos apareceu antes das diretas');

// Sem resposta do aluno, a ordem original é preservada.
assert.deepEqual(
  data.sortByDriver(data.references, null).map(({ id }) => id),
  data.references.map(({ id }) => id),
);

/*
 * Buraco de catálogo: cada combinação de modo e argumento precisa ter pelo menos
 * uma referência. Sem isso o aluno cai num modo sem nenhuma opção adequada.
 */
for (const mode of ['single', 'collection']) {
  const doModo = data.references.filter(({ modes }) => modes.includes(mode));
  for (const driver of ['funcao', 'estetica']) {
    const servem = doModo.filter(({ drivers }) => drivers.includes(driver));
    assert.ok(servem.length, `nenhuma referência de ${mode} serve ao argumento ${driver}`);
    assert.ok(
      data.sortByDriver(doModo, driver)[0].drivers.includes(driver),
      `a primeira referência de ${mode} para ${driver} não serve a esse argumento`,
    );
  }
}

/*
 * Peca silenciosa: referencia que na origem nao tem uma palavra comercial nao
 * pode receber a oferta injetada pelo nucleo. Era o que fazia a REF-0023 sair
 * com um bloco de texto que a peca original nunca teve.
 */
const silenciosas = data.references.filter(({ silent }) => silent);
assert.ok(silenciosas.length, 'nenhuma referência marcada como peça sem texto');
for (const reference of silenciosas) {
  const prompt = compiler.compileReferencePrompt(
    reference.modes.includes('single') ? single : collection,
    reference,
  );
  assert.ok(prompt.includes('PEÇA SEM TEXTO COMERCIAL'), `${reference.id} sem a trava de peça silenciosa`);
  assert.ok(!prompt.includes('Preserve exatamente a oferta recebida'), `${reference.id} ainda recebe a oferta do núcleo`);
}
// A referência normal continua obrigada a mostrar a oferta.
assert.ok(singleReference.includes('Preserve exatamente a oferta recebida'));

/*
 * As quatro grades de colecao precisam abrir por tracos diferentes, senao o
 * modelo achata as quatro na mesma peca.
 */
const grades = { 'REF-0007': 'DEITADOS', 'REF-0023': 'VÁRIOS CONTEXTOS DIFERENTES', 'REF-0038': 'SANGRAM', 'REF-0039': 'EM PÉ SOBRE PLINTOS' };
for (const [id, marca] of Object.entries(grades)) {
  const prompt = compiler.compileReferencePrompt(collection, data.references.find((item) => item.id === id));
  assert.ok(prompt.includes('O que define esta direção'), `${id} não declara o que a separa das outras grades`);
  assert.ok(prompt.includes(marca), `${id} perdeu o traço que a distingue`);
}

/*
 * Quantidade de produtos por grade. Quatro itens em volta de um cartao so
 * produzem uma grade 2x2: era isso que fazia as grades sairem identicas.
 */
const comSlots = data.references.filter(({ modes, slots }) => modes.includes('collection') && slots);
assert.ok(comSlots.length >= 10, 'poucas referências de coleção declaram quantidade');
assert.ok(new Set(comSlots.map(({ slots }) => slots)).size >= 4, 'as grades de coleção não variam de quantidade');

for (const reference of comSlots) {
  const prompt = compiler.compileReferencePrompt(collection, reference);
  const palavra = ['', '', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][reference.slots];
  assert.ok(
    prompt.includes(`Mostre simultaneamente ${palavra} produtos`),
    `${reference.id} não pede a própria quantidade (${reference.slots})`,
  );
}

// No lote, cada direção carrega a sua quantidade em vez de todas herdarem quatro.
const loteGrades = compiler.compileMasterPrompt(
  collection,
  ['REF-0007', 'REF-0021', 'REF-0023', 'REF-0038', 'REF-0039'].map((id) => data.references.find((item) => item.id === id)),
);
for (const [id, n] of [['REF-0007', 6], ['REF-0021', 3], ['REF-0023', 6], ['REF-0038', 8], ['REF-0039', 8]]) {
  assert.ok(loteGrades.includes(`Quantidade desta direção: ${n} produtos`), `${id} sem a quantidade no lote`);
}

console.log('Argumento de venda declarado nas', data.references.length, 'referências, e a ordenação respeita os dois em produto único e em coleção.');

console.log(
  'Prompts aprovados: contexto, lote 4:5, recuperação, carrossel, formatos, redes sociais, áudio, Kling e panfleto.',
);
console.log('Regra da casa presente nos 15 prompts que geram imagem.');
