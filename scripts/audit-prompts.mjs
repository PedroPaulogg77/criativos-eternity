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
const campaignStore = await importTypescriptModule('../lib/campaign-store.ts');

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
const googleOnly = { ...single, channels: ['google'] };

const savedStores = {
  version: 2,
  activeId: null,
  activeStoreId: 'store-a',
  stores: [
    { id: 'store-a', name: 'Loja A', sourceUrl: 'https://www.loja-a.test/produto-a' },
    { id: 'store-b', name: 'Loja B', sourceUrl: 'https://loja-b.test/produto-b' },
  ],
  items: [],
};
assert.equal(campaignStore.findStoreBySource(savedStores, 'https://loja-a.test/colecao'), savedStores.stores[0], 'um novo produto da mesma loja não foi agrupado');
assert.equal(campaignStore.findStoreBySource(savedStores, 'https://outra-loja.test/produto'), undefined, 'um produto de outra loja entrou no grupo errado');

const singleContext = compiler.compileContextPrompt(single);
const collectionContext = compiler.compileContextPrompt(collection);
const singleBatch = compiler.compileMasterPrompt(single, references);
const collectionBatch = compiler.compileMasterPrompt(collection, references);
const singleReference = compiler.compileReferencePrompt(single, references[0]);
const collectionReference = compiler.compileReferencePrompt(collection, references[0]);
const recovery = compiler.compileRecoveryPrompt(single, references, [1, 2, 3, 4]);
const googleBatch = compiler.compileMasterPrompt(googleOnly, references);
const googleReference = compiler.compileReferencePrompt(googleOnly, references[0]);
const googleRecovery = compiler.compileRecoveryPrompt(googleOnly, references, [1, 2, 3, 4]);
const pilotReference = data.references.find(({ id }) => id === 'REF-0017');
const pilotPrompt = compiler.compileReferencePrompt(single, pilotReference);
const testimonialReference = data.references.find(({ id }) => id === 'REF-0020');
const testimonialPrompt = compiler.compileReferencePrompt(single, testimonialReference);
const testimonialPhotoPrompt = compiler.compileReferencePrompt(single, data.references.find(({ id }) => id === 'REF-0072'));
const testimonialLongPrompt = compiler.compileReferencePrompt(single, data.references.find(({ id }) => id === 'REF-0078'));
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
assert.ok(testimonialPrompt.includes('Os três depoimentos desta direção são texto publicitário da composição'), 'REF-0020 ainda bloqueia seus depoimentos sem fonte');
assert.ok(testimonialPrompt.includes('Gere os três depoimentos como texto publicitário'), 'REF-0020 perdeu os três depoimentos');
assert.ok(testimonialPhotoPrompt.includes('O depoimento, o nome, o avatar e as estrelas desta direção são elementos de texto publicitário'), 'REF-0072 ainda bloqueia o depoimento');
assert.ok(testimonialLongPrompt.includes('O depoimento, o nome, o avatar e as estrelas desta direção são elementos de texto publicitário'), 'REF-0078 ainda bloqueia o depoimento');

assert.ok(
  collectionContext.startsWith(
    'Vamos preparar o contexto factual de uma campanha publicitária de COLEÇÃO.',
  ),
);
assert.ok(collectionContext.includes('CONTEXTO CAPTURADO — V004'));
assert.ok(collectionContext.includes('Não peça senha.'));
assert.ok(collectionContext.includes('P01'));
assert.ok(collectionContext.includes('P08'));
assert.ok(collectionContext.includes('ordem em que os produtos aparecem na página'));
assert.ok(!collectionContext.includes('seleção e a ordem dos produtos são LIVRES'));

assert.equal((singleBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.equal((collectionBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.ok(singleBatch.includes('CENÁRIO TÁTIL E QUENTE'));
assert.ok(collectionBatch.includes('A quantidade muda de uma direção para outra'));
assert.equal(compiler.masterFormatForCampaign(googleOnly), '1:1');
assert.ok(googleBatch.includes('todas em proporção 1:1'), 'Google sozinho ainda nasce em 4:5');
assert.ok(googleReference.includes('uma única imagem final e independente em 1:1'), 'a direção avulsa de Google não usa 1:1');
assert.ok(googleRecovery.includes('imagens separadas em 1:1'), 'a recuperação de Google não mantém 1:1');
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
  ['recuperação unitária', compiler.compileSingleRecoveryPrompt(single, references[1], 1)],
  ['variação individual', compiler.compileIndividualPrompt(single, references[0], 0, '', 'variation')],
]) {
  assert.ok(/colagem/.test(prompt), `${nome} sem a trava de colagem`);
}
assert.ok(singleReference.includes('SOMENTE UM criativo publicitário mestre'));
assert.ok(singleReference.includes('uma única imagem final e independente em 4:5'));
assert.ok(singleReference.includes('Anuncie somente o produto “Suporte Pocket preto”'));
assert.ok(collectionReference.includes('Anuncie somente a coleção “Automarken-Kollektion”'));
assert.ok(collectionReference.includes('lista prioritária'));

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
/* O lote pronto parte apenas das direções que a campanha já considerou adequadas. */
const readyLot = data.recommendedReferenceIds(data.references);
assert.equal(readyLot.length, 5, 'o lote pronto não tem cinco direções');
for (const id of readyLot) {
  assert.ok(data.references.some((reference) => reference.id === id), `o lote pronto aponta para ${id}, que não existe no banco`);
}
assert.ok(pilotPrompt.includes('ANTES E DEPOIS DIRETO'));
assert.ok(pilotPrompt.includes('Só pode ser usado com resultado visual e comparação comprovados.'));
assert.equal((singlePilotBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.equal((collectionPilotBatch.match(/CRIATIVO 0[1-5] —/g) ?? []).length, 5);
assert.ok(singlePilotBatch.includes('PRODUTO ZENITAL COM BENEFÍCIOS'));
assert.ok(singlePilotBatch.includes('MODELO EDITORIAL COM OFERTA GIGANTE'));
assert.ok(collectionPilotBatch.includes('VITRINE TÁTIL DE COLEÇÃO'));
assert.ok(collectionPilotBatch.includes('FLAT LAY RADIAL DE COLEÇÃO'));
assert.ok(collectionPilotBatch.includes('Limite operacional:'));

const carousel = flow.compileCarouselPrompt(collection);
assert.ok(carousel.includes('primeiros até CINCO produtos ou looks prioritários'));
assert.ok(carousel.includes('P01, P02, P03, P04 e P05'));
assert.ok(carousel.includes('QUANDO HOUVER UMA PESSOA NA IMAGEM'));
assert.ok(carousel.includes('QUANDO O PRODUTO ESTIVER SEM PESSOA'));
assert.ok(carousel.includes('SEPARADAS e INDEPENDENTES, todas em 4:5'));
assert.ok(carousel.includes('Não entregue colagem, grade, carrossel montado'));

const humanizada = data.references.find(({ people }) => people === 'humanizado');
const corpoSuporte = data.references.find(({ people }) => people === 'corpo-suporte');
const squareCreatives = flow.compileCreativeFormatPrompt('1:1', [humanizada, corpoSuporte]);

/*
 * A adaptação recompõe a cena inteira. Sem a regra de presença humana ela cortava a cabeça
 * do modelo — era o erro mais frequente no 9:16. O comando único também preserva essa regra.
 */
for (const [nome, prompt] of [
  ['lote 1:1', squareCreatives],
  ['lote 9:16', flow.compileCreativeFormatPrompt('9:16', [humanizada, corpoSuporte])],
  ['uma peça em 9:16', flow.compileCreativeFormatSinglePrompt('9:16')],
]) {
  assert.ok(prompt.includes('PESSOA NO NOVO FORMATO'), `${nome} sem a regra de enquadramento da pessoa`);
  assert.ok(/Nunca corte cabeça, topo da cabeça ou parte do rosto pela borda/.test(prompt), `${nome} deixa cortar a cabeça pela borda`);
  assert.ok(/nenhuma cabeça, rosto ou topo de cabeça cortado pela borda/.test(prompt), `${nome} sem a conferência do corte`);
}
const creativeSingle = flow.compileCreativeFormatSinglePrompt('9:16');
assert.ok(creativeSingle.includes('CRIATIVO [NÚMERO]'), 'o prompt único não indica qual criativo adaptar');
assert.ok(!creativeSingle.includes('CRIATIVO 01 —'), 'o prompt único voltou a depender de uma escolha por criativo');
const verticalCarousel = flow.compileCarouselFormatPrompt('9:16');
assert.ok(squareCreatives.includes('cinco criativos mestres 4:5 aprovados'));
assert.ok(flow.compileCreativeFormatPrompt('9:16', [humanizada], '1:1').includes('criativos mestres 1:1 aprovados'), 'a adaptação de Google não parte do mestre 1:1');
assert.ok(squareCreatives.includes('1:1, preferencialmente 1080 × 1080 px'));
assert.ok(verticalCarousel.includes('cinco cards 4:5 do carrossel já aprovados'));
assert.ok(verticalCarousel.includes('9:16, preferencialmente 1080 × 1920 px'));

/*
 * O card do carrossel já vem cortado no pescoço. No quadro alto, a altura extra precisa ser
 * ganha para baixo: sem isso o tronco sem cabeça flutua no meio do 9:16 e a peça parece quebrada.
 */
for (const [nome, prompt] of [
  ['carrossel em lote 9:16', verticalCarousel],
  ['um card em 9:16', flow.compileCarouselFormatSinglePrompt('9:16')],
]) {
  assert.ok(prompt.includes('SEM CABEÇA NO QUADRO ALTO'), nome + ' sem a regra do corte na borda superior');
  assert.ok(/fica exatamente na BORDA SUPERIOR/.test(prompt), nome + ' não fixa o corte na borda de cima');
  assert.ok(/altura que sobra no formato mais alto é ganha para baixo/.test(prompt), nome + ' deixa a altura extra ir para cima');
  assert.ok(/nenhum tronco sem cabeça com fundo vazio acima/.test(prompt), nome + ' sem a conferência do tronco flutuando');
}

/*
 * A tela de formato mostra somente dois comandos: um para o lote e outro reutilizável
 * para uma peça. No segundo, o aluno indica o número no próprio prompt, sem clicar em
 * uma escolha adicional dentro do app.
 */
const carouselCards = [0, 1, 2, 3, 4].map((index) => flow.compileCarouselCardPrompt(index));
assert.ok(carouselCards[0].includes('define o padrão visual'), 'card 01 não define o padrão do carrossel');
assert.ok(carouselCards[4].includes('produto prioritário P05'), 'card 05 não preserva a ordem prioritária da vitrine');
const prompsUnitarios = [];
for (const [index, prompt] of carouselCards.entries()) {
  const card = String(index + 1).padStart(2, '0');
  assert.ok(prompt.includes(`SOMENTE o CARD ${card}`), `card ${card} não pede uma peça só`);
  assert.ok(prompt.includes('Entregue exatamente UMA imagem final em 4:5'), `card ${card} sem a contagem de arquivos`);
  assert.ok(prompt.includes('Não gere os outros cards nesta resposta.'), `card ${card} deixa os outros virem junto`);
  prompsUnitarios.push([`card ${card} do carrossel`, prompt]);
}
for (const formato of ['1:1', '9:16']) {
  const criativo = flow.compileCreativeFormatSinglePrompt(formato);
  const card = flow.compileCarouselFormatSinglePrompt(formato);
  assert.ok(criativo.includes('CRIATIVO [NÚMERO]'), `adaptação única em ${formato} não pede o número do criativo`);
  assert.ok(criativo.includes('sem gerar os outros criativos'), `adaptação única em ${formato} deixa os outros virem junto`);
  assert.ok(card.includes('CARD [NÚMERO]'), `card único em ${formato} não pede o número do card`);
  assert.ok(card.includes('Não gere os outros cards'), `card único em ${formato} deixa os outros virem junto`);
  prompsUnitarios.push([`criativo único em ${formato}`, criativo], [`card único em ${formato}`, card]);
}
/*
 * O feed mantém as nove imagens no mesmo pedido, porque não carrega texto nem dados
 * operacionais. Todo story sai em trio: esse é o teto em que a imagem e a tipografia
 * continuam estáveis no ChatGPT.
 *
 * E a regra da casa NÃO entra aqui. Ela foi escrita para criativo de anúncio: produto maior,
 * mais nítido e mais iluminado que tudo. Aplicada ao playbook de redes, transformava post de
 * feed, story de destaque e review de cliente em peça de venda. O playbook já estava validado
 * sem ela; o teste agora impede que ela volte.
 */
const pecasEsperadas = { feed: 9, highlights: 9, weekly: 6, reviews: 3 };
const blocosEsperados = { feed: 1, highlights: 3, weekly: 2, reviews: 1 };
for (const social of flow.socialPrompts) {
  assert.equal(social.pieces.length, pecasEsperadas[social.id], `${social.id} não tem uma peça por mensagem`);
  assert.equal(social.batches.length, blocosEsperados[social.id], `${social.id} não foi dividido nos blocos corretos`);
  const rotulos = social.pieces.map(({ label }) => label);
  assert.equal(new Set(rotulos).size, rotulos.length, `${social.id} repete rótulo de peça`);
  for (const batch of social.batches) {
    assert.ok(
      !batch.prompt.includes('REGRA DA CASA'),
      `o prompt ${batch.id} voltou a levar a regra da casa; ela é de criativo de anúncio e descaracteriza o playbook de redes`,
    );
  }
  for (const { label, prompt } of social.pieces) {
    assert.ok(/SOMENTE/.test(prompt), `${social.id} ${label} não pede uma peça só`);
    assert.ok(prompt.includes('Entregue exatamente UMA imagem'), `${social.id} ${label} sem a contagem de arquivos`);
    assert.ok(/Não gere os outros/.test(prompt), `${social.id} ${label} deixa as outras peças virem junto`);
    assert.ok(
      !prompt.includes('REGRA DA CASA'),
      `${social.id} ${label} voltou a levar a regra da casa; ela é de criativo de anúncio e descaracteriza o playbook de redes`,
    );
    assert.ok(/colagem|grade/.test(prompt), `${social.id} ${label} sem a trava de colagem`);
  }
}
/*
 * Stories antes voltavam como prancha e ficavam poluídos. Cada bloco agora pede somente
 * três arquivos, sem copy extra depois das imagens e com um contrato visual minimalista.
 */
for (const social of [flow.socialPrompts[1], flow.socialPrompts[2]]) {
  for (const batch of social.batches) {
    assert.ok(batch.prompt.includes('EXATAMENTE TRÊS arquivos de imagem anexados'), `${batch.id} não declara a contagem de três arquivos`);
    assert.ok(/conte os arquivos anexados/.test(batch.prompt), `${batch.id} sem a conferência de contagem`);
    assert.ok(/prancha de apresentação/.test(batch.prompt) && /mockup de celular/.test(batch.prompt), `${batch.id} não recusa prancha nem mockup`);
    assert.ok(/Não escreva copy, explicação, tradução ou lista depois das imagens/.test(batch.prompt), `${batch.id} ainda pede copy extra depois das imagens`);
    assert.ok(batch.prompt.includes('STORY DE LOJA REAL, LIMPO E MINIMALISTA'), `${batch.id} perdeu a direção visual limpa`);
    assert.ok(batch.prompt.includes('UMA única ideia'), `${batch.id} deixa o story acumular informação`);
    assert.ok(/Não use lista, parágrafo longo, tabela/.test(batch.prompt), `${batch.id} deixa o story voltar poluído`);
    assert.ok(batch.prompt.includes('IDIOMA OBRIGATÓRIO'), `${batch.id} não trava o idioma da loja`);
    assert.ok(batch.prompt.includes('Português só pode aparecer'), `${batch.id} permite português fora do idioma da loja`);
  }
}
assert.ok(flow.socialPrompts[1].batches[2].prompt.includes('Story 9 —'), 'o terceiro trio de destaques perdeu o story 9');
assert.ok(flow.socialPrompts[2].batches[1].prompt.includes('Story 6 —'), 'o segundo trio semanal perdeu o story 6');

/*
 * Redes sociais é perfil, não campanha. Se toda peça mostrar produto, o feed vira catálogo —
 * e se o prompt não mandar rodar produto e variante, as nove peças saem com o mesmo item.
 */
const cenasDoFeed = flow.socialPrompts.find(({ id }) => id === 'feed').pieces.map(({ prompt }) => prompt.split('CENA DESTE POST')[1].split('\n')[1]);
const cenasSemProduto = cenasDoFeed.filter((cena) => /SEM (nenhum )?produto/.test(cena)).length;
assert.ok(cenasSemProduto >= 3, `o feed só tem ${cenasSemProduto} cena(s) sem produto; assim ele vira catálogo`);
for (const [nome, prompt] of [
  ['feed em bloco', flow.socialPrompts[0].batches[0].prompt],
  ...flow.socialPrompts[1].batches.map((batch) => [`destaques · ${batch.title}`, batch.prompt]),
  ...flow.socialPrompts[2].batches.map((batch) => [`rotina · ${batch.title}`, batch.prompt]),
  ...flow.socialPrompts[0].pieces.map(({ label, prompt }) => [`feed · ${label}`, prompt]),
]) {
  assert.ok(/Nem toda peça mostra produto/.test(prompt), `${nome} exige produto em todas as peças`);
  assert.ok(/produto ou uma variante diferente/.test(prompt), `${nome} não manda rodar o produto entre as peças`);
}
assert.ok(
  /variante diferente em cada uma das três peças/.test(flow.socialPrompts[3].batches[0].prompt),
  'os três reviews podem sair com o mesmo produto',
);

/* As nove cenas do feed existem para o grid não sair com nove fotos iguais. */
assert.equal(new Set(flow.socialPrompts.find(({ id }) => id === 'feed').pieces.map(({ prompt }) => prompt.split('CENA DESTE POST')[1].split('\n')[1])).size, 9, 'o feed repete cena entre os nove posts');

for (const [nome, prompt] of prompsUnitarios) {
  assert.ok(/colagem/.test(prompt), `${nome} sem a trava de colagem`);
}

assert.deepEqual(
  flow.socialPrompts.map(({ id }) => id),
  ['feed', 'highlights', 'weekly', 'reviews'],
);
assert.ok(flow.socialPrompts[0].batches[0].prompt.includes('crie 9 posts de feed'));
/* O feed herda o contexto capturado em vez de mandar reanalisar a loja do zero. */
assert.ok(flow.socialPrompts[0].batches[0].prompt.startsWith('Usando exclusivamente o CONTEXTO CAPTURADO'), 'o feed voltou a pedir uma nova análise da loja');
assert.ok(flow.socialPrompts[0].batches[0].prompt.includes('Antes de entregar, confirme internamente'), 'o feed perdeu a autoconferência');
assert.ok(flow.socialPrompts[1].batches.every((batch) => batch.prompt.includes('crie TRÊS stories para o destaque')));
assert.ok(flow.socialPrompts[2].batches.every((batch) => batch.prompt.includes('crie TRÊS stories de Instagram')));

/*
 * Cada destaque tem um regime de fato diferente, e é isso que faz o bloco funcionar:
 * o depoimento é composição da peça, o dado operacional nunca é.
 */
for (const [nome, prompt] of [
  ...flow.socialPrompts[1].batches.map((batch) => [`destaques · ${batch.title}`, batch.prompt]),
  ...flow.socialPrompts[1].pieces.map(({ label, prompt }) => [`destaque · ${label}`, prompt]),
]) {
  if (!/REVIEWS/.test(prompt)) continue;
  assert.ok(
    /depoimento é texto publicitário da composição|depoimento é texto da composição/.test(prompt),
    `${nome} proíbe o depoimento que a própria peça pede`,
  );
  assert.ok(/não escreva nota|Não escreva nota/.test(prompt), `${nome} deixa passar nota, número de vendas ou nome de cliente`);
}
for (const [nome, prompt] of [
  ...flow.socialPrompts[1].batches.filter((batch) => batch.title.startsWith('Informações')).map((batch) => [`destaques · ${batch.title}`, batch.prompt]),
  ...flow.socialPrompts[1].pieces.filter(({ label }) => label.startsWith('INFORMAÇÕES')).map(({ label, prompt }) => [`destaque · ${label}`, prompt]),
]) {
  assert.ok(/aqui não existe composição/.test(prompt), `${nome} permite aproximar prazo, pagamento ou garantia`);
}
assert.ok(flow.socialPrompts[2].batches[1].prompt.includes('WELCOME10'), 'a rotina semanal perdeu o cupom padrão');
assert.ok(/Não invente percentual/.test(flow.socialPrompts[2].batches[1].prompt), 'a rotina semanal deixa inventar condição de oferta');
assert.ok(flow.socialPrompts[3].batches[0].prompt.includes('me entregue 3 reviews de cliente'));
assert.ok(/foto tirada pelo próprio cliente|Foto tirada pelo próprio cliente/.test(flow.socialPrompts[3].batches[0].prompt), 'o review perdeu a aparência de foto de cliente');
for (const social of flow.socialPrompts.slice(1)) {
  for (const prompt of [...social.batches.map((batch) => batch.prompt), ...social.pieces.map((piece) => piece.prompt)]) {
    assert.ok(prompt.includes('IDIOMA OBRIGATÓRIO'), `${social.id} deixou uma alternativa sem a trava de idioma`);
    assert.ok(prompt.includes('Português só pode aparecer'), `${social.id} deixou uma alternativa aceitar português indevido`);
  }
}

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
  ['variação individual', compiler.compileIndividualPrompt(single, references[0], 0, '', 'variation')],
  ['carrossel', carousel],
  ['formato 1:1', squareCreatives],
  ['formato 9:16 do carrossel', verticalCarousel],
  ['vídeo Kling', video],
  ['panfleto', flyer],
  ...prompsUnitarios,
];

/*
 * Todo prompt que gera imagem carrega uma das duas regras de foco. A do nativo existe
 * porque aquela peça só funciona se não parecer anúncio — ela substitui a regra da casa
 * em vez de conviver com ela, do mesmo jeito que o playbook de redes a dispensa.
 */
for (const [nome, prompt] of promptsQueGeramImagem) {
  assert.ok(
    prompt.includes('REGRA DA CASA — O PRODUTO EM PRIMEIRO LUGAR')
      || prompt.includes('REGRA DO NATIVO — A PEÇA NÃO PODE PARECER ANÚNCIO'),
    `${nome} saiu sem a regra da casa de foco no produto`,
  );
}

/*
 * Uma peça nativa não pode receber a regra da casa junto: as duas se contradizem, e a
 * peça vira packshot de estúdio. Ela também não recebe tipografia nem presença humana,
 * e precisa pedir a copy, que no nativo é metade do criativo.
 */
for (const reference of references.filter(({ native }) => native)) {
  const prompt = compiler.compileReferencePrompt(
    { mode: 'single', exactTarget: 'produto de teste', offer: 'ATÉ 50% DE DESCONTO', offerMechanic: 'percentual', salesDriver: 'funcao' },
    reference,
  );
  assert.ok(prompt.includes('REGRA DO NATIVO'), `${reference.id} é nativa e saiu sem a regra do nativo`);
  assert.ok(!prompt.includes('REGRA DA CASA'), `${reference.id} é nativa e voltou a levar a regra da casa`);
  assert.ok(!prompt.includes('DESIGN E TIPOGRAFIA'), `${reference.id} é nativa e voltou a levar a regra de tipografia`);
  assert.ok(!prompt.includes('PRESENÇA HUMANA'), `${reference.id} é nativa e voltou a levar a regra de presença humana`);
  assert.ok(prompt.includes('COPY DESTA PEÇA'), `${reference.id} é nativa e não pede a copy`);
  assert.deepEqual(reference.drivers, ['funcao'], `${reference.id} é nativa e precisa servir só ao argumento de função`);
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

// Produto que vende pela foto não pode abrir a lista com peça exclusiva de explicação.
// Direção declarada nos dois argumentos é flexível, não uma peça cheia de tópicos.
const porEstetica = data.sortByDriver(data.references, 'estetica');
const densaNaFrente = porEstetica.findIndex((item) => item.drivers.length === 1 && item.drivers.includes('funcao'));
const ultimaCompativel = porEstetica.map((item) => item.drivers.includes('estetica')).lastIndexOf(true);
assert.ok(densaNaFrente > ultimaCompativel, 'referência cheia de tópicos apareceu antes das diretas');

// Sem resposta do aluno, a ordem original é preservada.
assert.deepEqual(
  data.sortByDriver(data.references, null).map(({ id }) => id),
  data.references.map(({ id }) => id),
);

/*
 * A galeria não pode tratar “produto único” como sinônimo de uma única unidade
 * nem devolver demonstrações funcionais para uma peça que se vende pela estética.
 */
for (const reference of data.references) {
  if (reference.offerMechanics) {
    assert.ok(reference.offerMechanics.every((item) => ['percentual', 'leve-mais', 'progressivo'].includes(item)), `${reference.id} tem mecânica de oferta inválida`);
  }
  if (reference.fillsWithVariants) {
    assert.ok(reference.modes.includes('collection'), `${reference.id} só pode abrir para produto único por ser uma direção de coleção de variações`);
  }
}

/*
 * Direcao de colecao usada num produto so: o limite nao pode exigir produtos distintos,
 * senao ele contradiz a linha que manda mostrar as cores confirmadas do mesmo item.
 * Foi assim que a REF-0029 e a REF-0063 sairam mandando o contrario do nucleo.
 */
for (const reference of data.references.filter(({ fillsWithVariants }) => fillsWithVariants)) {
  const texto = `${reference.limits ?? ''}`.toLowerCase();
  const exigeDistintos = /produtos? (ou looks )?(distintos|diferentes)|looks distintos/.test(texto);
  const abreParaCores = /cores? confirmadas|mesmo modelo|mesmo conjunto|variantes|varia/.test(texto);
  assert.ok(
    !exigeDistintos || abreParaCores,
    `${reference.id} serve a produto único mas o limite exige produtos distintos`,
  );
}

const camisaLeveMais = { mode: 'single', salesDriver: 'estetica', offerMechanic: 'leve-mais' };
const camisaLeveMaisReferences = data.sortForCampaign(
  data.references.filter((reference) => data.isReferenceApplicable(reference, camisaLeveMais)),
  camisaLeveMais,
);
assert.ok(camisaLeveMaisReferences.length >= 5, 'produto estético com compre-x-leve-y ficou sem cinco direções');
assert.ok(camisaLeveMaisReferences.every((reference) => reference.drivers.includes('estetica')), 'uma referência de função apareceu para produto estético');
/*
 * Peça sem texto entra na galeria como qualquer outra. O que o teste cobra é que o
 * prompt dela não receba a oferta: a regra de peça silenciosa substitui a linha da oferta.
 */
for (const reference of camisaLeveMaisReferences.filter(({ silent }) => silent)) {
  const prompt = compiler.compileReferencePrompt({ ...single, offerMechanic: 'leve-mais' }, reference);
  assert.ok(prompt.includes('PEÇA SEM TEXTO COMERCIAL'), `${reference.id} entrou na galeria sem a regra de peça sem texto`);
  assert.ok(!prompt.includes(`Preserve exatamente a oferta recebida`), `${reference.id} recebeu a oferta mesmo sendo peça sem texto`);
}
for (const id of ['REF-0067', 'REF-0145', 'REF-0147']) {
  assert.ok(camisaLeveMaisReferences.some((reference) => reference.id === id), `${id} deveria aparecer para compre-x-leve-y de produto estético`);
}

const camisaComVariacoes = { ...camisaLeveMais };
const referenciasComVariacoes = data.references.filter((reference) => data.isReferenceApplicable(reference, camisaComVariacoes));
for (const id of ['REF-0029', 'REF-0011', 'REF-0063']) {
  assert.ok(referenciasComVariacoes.some((reference) => reference.id === id), `${id} não abriu para o mesmo produto com variações confirmadas`);
}

const colecaoProgressiva = { mode: 'collection', salesDriver: 'estetica', offerMechanic: 'progressivo' };
const referenciasProgressivas = data.sortForCampaign(
  data.references.filter((reference) => data.isReferenceApplicable(reference, colecaoProgressiva)),
  colecaoProgressiva,
);
assert.ok(referenciasProgressivas.length >= 5, 'coleção com desconto progressivo ficou sem cinco direções');

/*
 * A galeria alterna tipos de composição, então o que o teste cobra é o que o Pedro pediu:
 * as cinco primeiras de qualquer caminho saem diferentes entre si, e a primeira de todas
 * é a que mais se aproxima da oferta e do nicho. Exigir que as cinco primeiras fossem
 * todas da mesma mecânica devolvia cinco peças iguais, que é o erro oposto.
 */
for (const { rotulo, criterio, alvo } of [
  { rotulo: 'coleção progressiva', criterio: colecaoProgressiva, alvo: 'Coleção de camisas' },
  { rotulo: 'produto único com leve-mais', criterio: camisaLeveMais, alvo: 'Camisa xadrez' },
]) {
  const comNicho = { ...criterio, category: data.guessCategory(alvo) };
  const ordenada = data.sortForCampaign(
    data.references.filter((reference) => data.isReferenceApplicable(reference, comNicho)),
    comNicho,
  );
  const cinco = ordenada.slice(0, 5);
  assert.equal(new Set(cinco.map(data.compositionType)).size, 5, `as cinco primeiras de ${rotulo} repetem tipo de composição`);
  assert.deepEqual(data.lotSameness(cinco), [], `o lote de abertura de ${rotulo} sai igual em algum eixo`);
  if (criterio.offerMechanic) {
    assert.ok(
      data.offerFit(ordenada[0], criterio.offerMechanic) === 0,
      `a primeira direção de ${rotulo} não é uma das que já nascem com essa oferta`,
    );
  }
}

/*
 * Oferta é texto, e nenhuma peça comercial é excluída por causa dela. O relógio da REF-0001
 * anuncia “compre 2, leve 1” e continua servindo a um desconto percentual.
 */
/*
 * Desconto progressivo é oferta de catálogo — “2 artigos, 3 artigos, 4 ou mais” —
 * e por isso só existe em coleção: a tela não oferece a opção em produto único.
 */
for (const mechanic of ['percentual', 'leve-mais']) {
  const abertas = data.references.filter((reference) => data.isReferenceApplicable(reference, {
    mode: 'single',
    salesDriver: 'estetica',
    offerMechanic: mechanic,
  }));
  assert.ok(abertas.some(({ id }) => id === 'REF-0001'), `REF-0001 sumiu da galeria por causa da mecânica ${mechanic}`);
  assert.ok(abertas.length >= 5, `produto único estético ficou sem cinco direções em ${mechanic}`);
}


const promptComVariacoes = compiler.compileReferencePrompt({
  ...single,
  offerMechanic: 'leve-mais',
}, data.references.find(({ id }) => id === 'REF-0029'));
assert.ok(promptComVariacoes.includes('variações visuais confirmadas do MESMO produto'), 'direção de coleção não explica o uso de variações do mesmo produto');
const promptComPilha = compiler.compileReferencePrompt({
  ...single,
  offerMechanic: 'leve-mais',
}, data.references.find(({ id }) => id === 'REF-0067'));
assert.ok(promptComPilha.includes('repetir unidades reais do mesmo produto'), 'oferta leve-mais não libera a pilha da mesma unidade');

/*
 * Buraco de catálogo: cada caminho que a trilha abre precisa ter pelo menos uma
 * referência. Coleção só existe em estética — um conjunto de produtos se vende pela
 * imagem —, então essa combinação não entra na conta.
 */
for (const mode of ['single', 'collection']) {
  const doModo = data.references.filter(({ modes }) => modes.includes(mode));
  for (const driver of mode === 'collection' ? ['estetica'] : ['funcao', 'estetica']) {
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
/*
 * A regra da peca sem texto proibia wordmark, e a REF-0024 vende justamente a caixa
 * com a marca gravada na tampa. Proibir o que a referencia faz e um dos sete erros.
 */
{
  const semTexto = data.references.find(({ silent }) => silent);
  const prompt = compiler.compileReferencePrompt(
    semTexto.modes.includes('single') ? single : collection,
    semTexto,
  );
  assert.ok(
    /marca gravada na tampa da caixa/.test(prompt),
    'a regra da peça sem texto voltou a apagar a marca que está no próprio objeto',
  );
}

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
const grades = { 'REF-0007': 'UMA ÚNICA FOTOGRAFIA', 'REF-0023': 'SEIS CENÁRIOS COMPLETAMENTE DIFERENTES', 'REF-0038': 'CENTRO DO QUADRO FICA VAZIO', 'REF-0039': 'TRÊS COLUNAS DE LARGURAS DESIGUAIS' };
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
  const palavra = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][reference.slots] ?? String(reference.slots);
  assert.ok(
    prompt.includes(`Mostre simultaneamente até ${palavra} produtos`),
    `${reference.id} não pede a própria quantidade (${reference.slots})`,
  );
}

// No lote, cada direção carrega a sua quantidade em vez de todas herdarem quatro.
const loteGrades = compiler.compileMasterPrompt(
  collection,
  ['REF-0007', 'REF-0021', 'REF-0023', 'REF-0038', 'REF-0039'].map((id) => data.references.find((item) => item.id === id)),
);
for (const [id, n] of [['REF-0007', 6], ['REF-0021', 3], ['REF-0023', 6], ['REF-0038', 8], ['REF-0039', 8]]) {
  assert.ok(loteGrades.includes(`Quantidade alvo desta direção: ${n} produtos`), `${id} sem a quantidade no lote`);
}

/*
 * Nenhum lote de cinco pode sair igual. Duas travas:
 * 1. duas receitas nao podem dizer a mesma coisa especifica;
 * 2. a selecao nao pode repetir todos os eixos que fazem duas pecas se parecerem.
 *
 * A similaridade ignora o vocabulario comum do dominio -- "produto", "oferta",
 * "cartao" aparecem em quase toda receita e nao distinguem nada. Sobra o que e
 * proprio de cada direcao.
 */
function palavrasProprias(textos) {
  const bags = textos.map((texto) => new Set(
    texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((palavra) => palavra.length > 4),
  ));
  const frequencia = new Map();
  for (const bag of bags) for (const palavra of bag) frequencia.set(palavra, (frequencia.get(palavra) ?? 0) + 1);
  const dominio = new Set([...frequencia].filter(([, n]) => n > textos.length * 0.4).map(([palavra]) => palavra));
  return bags.map((bag) => new Set([...bag].filter((palavra) => !dominio.has(palavra))));
}

const TETO_SIMILARIDADE = 0.5;
for (const [mode, campanha] of [['single', single], ['collection', collection]]) {
  const list = data.references.filter(({ modes }) => modes.includes(mode));
  const receitas = list.map((reference) => {
    const prompt = compiler.compileReferencePrompt(campanha, reference);
    const resto = prompt.slice(prompt.indexOf('DIREÇÃO VISUAL') + 20);
    /* O corte precisa pegar o travessão: o bloco que mais contamina a medida é
       "PRESENÇA HUMANA — CORPO SEM IDENTIDADE", e sem o — ele entrava na conta.
       Duas peças com o mesmo `people` compartilham esse bloco inteiro, e isso
       inflava a semelhança entre receitas que não têm nada a ver uma com a outra. */
    return resto.slice(0, resto.search(/\n[A-ZÇÃÕÁÉÍÓÚÂÊÔ —-]{6,}\n/));
  });
  const proprias = palavrasProprias(receitas);
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = proprias[i];
      const b = proprias[j];
      const comuns = [...a].filter((palavra) => b.has(palavra)).length;
      const similaridade = comuns / (a.size + b.size - comuns);
      assert.ok(
        similaridade < TETO_SIMILARIDADE,
        `${list[i].id} e ${list[j].id} descrevem a mesma peça (${Math.round(similaridade * 100)}% do vocabulário próprio em comum). Duas direções assim devolvem criativos iguais.`,
      );
    }
  }
}

// Um lote com cinco direções da mesma família e mesma quantidade é um lote repetido.
const loteRepetido = ['REF-0038', 'REF-0039'].map((id) => data.references.find((item) => item.id === id));
assert.ok(data.lotSameness(loteRepetido).length >= 2, 'lotSameness não detecta duas grades equivalentes');
assert.equal(data.lotSameness([]).length, 0);
const loteVariado = ['REF-0007', 'REF-0021', 'REF-0005'].map((id) => data.references.find((item) => item.id === id));
assert.ok(data.lotSameness(loteVariado).length <= 1, 'lotSameness acusa repetição num lote variado');

/*
 * A pasta de curadoria e o app podem sair de sincronia quando alguem troca uma
 * imagem la e nao copia para ca. Foi o que aconteceu com a REF-0015. Quando a
 * pasta existe, o teste compara os bytes; quando nao existe, nao atrapalha.
 */
const pastaCuradoria = new URL('../../REFERENCIAS-COM-PROMPT/', import.meta.url);
if (fs.existsSync(pastaCuradoria)) {
  const listarCuradas = (pasta) => fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = new URL(encodeURIComponent(item.name) + (item.isDirectory() ? '/' : ''), pasta);
    if (item.isDirectory()) return listarCuradas(caminho);
    return /^REF-\d{4}.*\.(png|jpg)$/i.test(item.name) ? [{ nome: item.name, caminho }] : [];
  });
  const curadas = listarCuradas(pastaCuradoria);
  const dessincronizadas = [];
  for (const { nome, caminho } of curadas) {
    const id = nome.slice(0, 8).toLowerCase();
    const extensao = nome.slice(nome.lastIndexOf('.'));
    const noApp = new URL(`../public/references/${id}${extensao}`, import.meta.url);
    if (!fs.existsSync(noApp)) continue;
    const a = fs.readFileSync(caminho);
    const b = fs.readFileSync(noApp);
    if (!a.equals(b)) dessincronizadas.push(id.toUpperCase());
  }
  assert.deepEqual(
    dessincronizadas,
    [],
    `imagem trocada na pasta de curadoria e não copiada para o app: ${dessincronizadas.join(', ')}`,
  );
  console.log('Imagens do app conferem com a pasta de curadoria:', curadas.length, 'referências.');
}

/*
 * Fundo sem ancora de claridade. A REF-0044 dizia "bege quente" e o modelo devolveu
 * bege medio; as barras graficas precisaram saltar para aparecer e viraram adesivos
 * dourados. Toda descricao de fundo, superficie, parede ou estudio diz se e clara ou
 * escura. A REF-0020 fica de fora: o fundo dela e o ambiente real de uso, que varia.
 */
/*
 * Peca de varios modulos usada com um produto so. Sem uma linha dizendo o que
 * preencher, o modelo inventa cor ou enfia outro produto para fechar a conta.
 * Cada receita precisa dizer qual das saidas cabe naquela composicao: menos
 * modulos maiores, outras vistas reais do mesmo produto, ou unidades repetidas.
 */
const QUEDA = /(com|se) (menos|poucas?|apenas|somente|houver|uma?|duas|dois|tr[êe]s|quatro|cinco|seis)\b|menos (itens|m[óo]dulos|cores|conjuntos|cenas|pe[çc]as|diagonais|produtos)|s[óo] existe se|houver apenas|unidades reais do mesmo produto/i;
const fonteDasReceitas = fs.readFileSync(new URL('../lib/prompt-compiler.ts', import.meta.url), 'utf8');
for (const reference of data.references.filter(({ slots }) => (slots ?? 1) >= 2)) {
  const inicio = fonteDasReceitas.indexOf(`'${reference.id}': {`);
  assert.ok(inicio >= 0, `${reference.id} tem vários módulos e nenhuma receita própria`);
  const bloco = fonteDasReceitas.slice(inicio, fonteDasReceitas.indexOf('\n  },', inicio));
  assert.ok(QUEDA.test(bloco), `${reference.id} não diz o que fazer quando vem menos produto do que a composição comporta`);
}

const ABRE_FUNDO = /^- (Fundo|O fundo|A superfície|Superfície|A parede|Cenário|O cenário|Mesa|A mesa|Estúdio|O estúdio)\b/i;
const ANCORA_DE_TOM = /\b(clar[oa]s?|escur[oa]s?|branc[oa]s?|pret[oa]s?|cinza|off-white|profund[oa]s?|quase branco|pálid[oa]|neutr[oa]s?|médio a escuro)\b/i;
const FUNDO_VARIAVEL = new Set(['REF-0020']);
for (const reference of data.references) {
  if (FUNDO_VARIAVEL.has(reference.id)) continue;
  const inicio = fonteDasReceitas.indexOf(`'${reference.id}': {`);
  if (inicio < 0) continue;
  const bloco = fonteDasReceitas.slice(inicio, fonteDasReceitas.indexOf('\n  },', inicio));
  for (const linha of bloco.split('\n').map((texto) => texto.trim())) {
    if (!ABRE_FUNDO.test(linha)) continue;
    assert.ok(ANCORA_DE_TOM.test(linha), `${reference.id} descreve o fundo sem dizer se ele é claro ou escuro: ${linha.slice(0, 80)}`);
  }
}

/*
 * Invencao de produto. A quantidade alta somada a uma ordem de nao mostrar menos
 * fazia o modelo inventar categoria nova -- chapeu e bolsa numa campanha de
 * vestidos -- so para fechar a conta de modulos.
 */
for (const reference of data.references.filter(({ modes, slots }) => modes.includes('collection') && slots)) {
  const prompt = compiler.compileReferencePrompt(collection, reference);
  assert.ok(prompt.includes('não uma cota a cumprir'), `${reference.id} trata a quantidade como cota`);
  assert.ok(prompt.includes('É proibido inventar produto ou categoria'), `${reference.id} sem a trava de categoria inventada`);
  assert.ok(!/não mostre mais nem menos/.test(prompt), `${reference.id} ainda exige a quantidade exata`);
}

/*
 * O carrossel cobrava cinco produtos fixos. Com colecao menor, o modelo inventava
 * item para fechar a conta -- o mesmo erro que as receitas ja tinham resolvido.
 */
assert.ok(carousel.includes('não uma cota a cumprir'), 'o carrossel ainda trata a quantidade como cota');
assert.ok(/proibido inventar produto/i.test(carousel), 'o carrossel não proíbe inventar produto para completar');

console.log('Nenhum par de referências descreve a mesma peça, no teto de', Math.round(TETO_SIMILARIDADE * 100) + '%.');

console.log('Argumento de venda declarado nas', data.references.length, 'referências, e a ordenação respeita os dois em produto único e em coleção.');

console.log(
  'Prompts aprovados: contexto, lote mestre 4:5/1:1, recuperação, carrossel, formatos, redes sociais, áudio, Kling e panfleto.',
);
console.log('Regra da casa presente nos', promptsQueGeramImagem.length, 'prompts que geram imagem, contando os caminhos de uma peça por vez.');

/*
 * Molde abre a galeria. Uma peça com a marca de outra loja e o texto em outro idioma
 * é lida como anúncio alheio, não como direção reaproveitável — ela continua na
 * biblioteca, mas atrás. Sem isso a galeria de camisa abria com short alemão.
 */
{
  const criterios = { mode: 'single', offerMechanic: 'leve-mais', salesDriver: 'estetica', category: 'Vestuário' };
  const abertas = data.references.filter((item) => data.isReferenceApplicable(item, criterios));
  const abertura = data.sortForCampaign(abertas, criterios).slice(0, 5);
  const capturadas = abertura.filter((item) => !item.molde).map(({ id }) => id);
  assert.deepEqual(capturadas, [], `a abertura da galeria trouxe criativo capturado antes de molde: ${capturadas.join(', ')}`);
  assert.ok(data.references.some((item) => item.molde), 'nenhuma referência está marcada como molde');
}
