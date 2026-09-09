import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

async function importTypescriptModule(path) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
}

const compiler = await importTypescriptModule('../lib/prompt-compiler.ts');
const flow = await importTypescriptModule('../lib/flow-prompts.ts');
const data = await importTypescriptModule('../lib/mvp-data.ts');

const references = [
  ['REF-0001', 'Split premium escuro'],
  ['REF-0003', 'Cenário tátil e quente'],
  ['REF-0004', 'Still life premium'],
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
  ['REF-0010', 'REF-0013', 'REF-0016', 'REF-0019', 'REF-0026'].map((id) =>
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
assert.ok(collectionContext.includes('Regra de seleção visual: escolher livremente quatro'));

assert.equal((singleBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.equal((collectionBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.ok(singleBatch.includes('CENÁRIO TÁTIL E QUENTE'));
assert.ok(collectionBatch.includes('mostrar simultaneamente quatro produtos ou looks distintos'));
assert.ok(singleBatch.includes('cinco imagens finais SEPARADAS e INDEPENDENTES'));
assert.ok(collectionBatch.includes('cinco imagens finais SEPARADAS e INDEPENDENTES'));
assert.ok(singleReference.includes('SOMENTE UM criativo publicitário mestre'));
assert.ok(singleReference.includes('uma única imagem final e independente em 4:5'));
assert.ok(singleReference.includes('Anuncie somente o produto “Suporte Pocket preto”'));
assert.ok(collectionReference.includes('Anuncie somente a coleção “Automarken-Kollektion”'));
assert.ok(collectionReference.includes('quatro produtos ou looks distintos e elegíveis'));

assert.ok(recovery.startsWith('Você gerou corretamente o CRIATIVO 01. Não o gere novamente.'));
assert.ok(recovery.includes('Agora gere somente os criativos pendentes: 02, 03, 04, 05.'));
assert.ok(recovery.includes('Não responda com descrições em texto.'));

assert.equal(data.references.length, 28);
assert.equal(data.references.filter(({ validated }) => !validated).length, 22);
assert.ok(data.references.every(({ modes }) => modes.length > 0));
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

console.log(
  'Prompts aprovados: contexto, lote 4:5, recuperação, carrossel, formatos, redes sociais, áudio, Kling e panfleto.',
);
