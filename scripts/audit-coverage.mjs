/*
 * Cobertura da biblioteca por caminho do aluno.
 *
 * O aluno responde escopo, mecânica da oferta e argumento de venda.
 * Cada combinação dessas respostas é um caminho, e cada caminho abre uma
 * biblioteca própria. Este relatório conta quantas direções sobram em cada um,
 * quantas foram desenhadas para aquela oferta e se o que sobrou dá para montar
 * um lote de cinco peças diferentes entre si.
 *
 * Roda com: npm run audit:cobertura
 */
import fs from 'node:fs';
import ts from 'typescript';

const transpiled = new Map();

function transpileToDataUrl(fileUrl) {
  if (transpiled.has(fileUrl.href)) return transpiled.get(fileUrl.href);

  let source = fs.readFileSync(fileUrl, 'utf8');
  for (const name of new Set([...source.matchAll(/'@\/lib\/([A-Za-z0-9_-]+)'/g)].map((match) => match[1]))) {
    const dependency = transpileToDataUrl(new URL(`../lib/${name}.ts`, import.meta.url));
    source = source.split(`'@/lib/${name}'`).join(`'${dependency}'`);
  }

  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const dataUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`;
  transpiled.set(fileUrl.href, dataUrl);
  return dataUrl;
}

const data = await import(transpileToDataUrl(new URL('../lib/mvp-data.ts', import.meta.url)));
const { references, isReferenceApplicable, sortForCampaign, lotSameness } = data;

/* O lote pede cinco. Abaixo disso o caminho não fecha uma rodada. */
const LOT = 5;

const mechanicLabel = {
  percentual: 'até X%',
  'leve-mais': 'compre X leve Y',
  progressivo: 'progressivo',
};
const driverLabel = { estetica: 'estética', funcao: 'função' };

/* Todo escopo abre as três mecânicas: a oferta é texto e não corta direção. */
function allPaths() {
  const paths = [];
  for (const driver of ['estetica', 'funcao']) {
    /* Desconto progressivo é oferta de catálogo: não existe em produto único. */
    for (const mechanic of ['percentual', 'leve-mais']) {
      paths.push({ mode: 'single', offerMechanic: mechanic, salesDriver: driver });
    }
    /* Coleção é sempre um conjunto de produtos que vendem pela estética. */
    if (driver !== 'estetica') continue;
    for (const mechanic of ['percentual', 'leve-mais', 'progressivo']) {
      paths.push({ mode: 'collection', offerMechanic: mechanic, salesDriver: driver });
    }
  }
  return paths;
}

function pathName(path) {
  const escopo = path.mode === 'single'
    ? 'produto único'
    : 'coleção';
  return `${escopo} · ${mechanicLabel[path.offerMechanic]} · ${driverLabel[path.salesDriver]}`;
}

/*
 * A oferta precisa aparecer na construção da imagem, não só no texto.
 * Em “compre X, leve Y” isso significa ver mais de uma unidade — repetição do mesmo
 * item, variações confirmadas lado a lado, uma coleção, ou cartões de oferta próprios.
 * Em “até X%” um bloco tipográfico ou um selo já basta, e toda direção comercial tem um.
 * Em progressivo, só quem tem degraus na composição.
 */
function carriesOffer(reference, path) {
  if (path.offerMechanic === 'percentual') return true;
  if (path.offerMechanic === 'progressivo') return Boolean(reference.offerMechanics?.includes('progressivo'));
  if (reference.offerMechanics?.includes('leve-mais')) return true;
  if (reference.repeatsSameProduct) return true;
  return path.mode === 'collection' ? (reference.slots ?? 1) >= 2 : Boolean(reference.fillsWithVariants);
}

function describe(path) {
  const open = sortForCampaign(references.filter((item) => isReferenceApplicable(item, path)), path);
  /* Desenhada para a oferta é diferente de apenas tolerada por ela. */
  const own = open.filter((item) => carriesOffer(item, path));
  const families = new Set(open.map((item) => item.family));
  const people = new Set(open.map((item) => item.people ?? 'sem-pessoa'));
  /* O aluno costuma pegar as cinco primeiras: se elas repetem todos os eixos, o lote sai igual.
     O argumento de venda sai da conta porque o próprio caminho já o fixou. */
  const topFive = open.slice(0, LOT);
  const sameness = lotSameness(topFive).filter((axis) => axis.label !== 'argumento de venda');
  return { path, open, own, families, people, sameness };
}

const rows = allPaths().map(describe);

const pad = (value, size) => String(value).padEnd(size);
const padStart = (value, size) => String(value).padStart(size);
const width = Math.max(...rows.map((row) => pathName(row.path).length));

console.log(`\nCOBERTURA POR CAMINHO — ${references.length} referências no banco, lote de ${LOT}\n`);
console.log(`${pad('caminho', width)}  abertas  na imagem  famílias  status`);
console.log('-'.repeat(width + 40));

/* O lote só fecha com cinco direções que mostram a oferta. Estar aberta não basta. */
let scarce = 0;
for (const row of rows) {
  const missing = Math.max(0, LOT - row.own.length);
  const status = missing > 0
    ? `FALTAM ${missing}`
    : row.sameness.length
      ? `top 5 repete ${row.sameness.map((axis) => axis.label).join(', ')}`
      : 'ok';
  if (missing > 0) scarce += 1;
  console.log(`${pad(pathName(row.path), width)}  ${padStart(row.open.length, 7)}  ${padStart(row.own.length, 9)}  ${padStart(row.families.size, 8)}  ${status}`);
}

console.log(`\n${scarce} de ${rows.length} caminhos não fecham um lote de cinco que mostrem a oferta.\n`);

const gaps = rows
  .map((row) => ({ name: pathName(row.path), missing: Math.max(0, LOT - row.own.length), own: row.own.length, total: row.open.length }))
  .filter((row) => row.missing > 0)
  .sort((a, b) => b.missing - a.missing);

if (gaps.length) {
  console.log('ONDE SUBIR PRIMEIRO\n');
  for (const gap of gaps) {
    console.log(`- ${gap.name}: ${gap.total} abertas, ${gap.own} mostram a oferta, faltam ${gap.missing}.`);
  }
  console.log('');
}

/* Quantas direções cada mecânica declara como sua. Mecânica sem dono aparece aqui. */
console.log('DIREÇÕES QUE DECLARAM CADA MECÂNICA\n');
for (const mechanic of ['percentual', 'leve-mais', 'progressivo']) {
  const owners = references.filter((item) => item.offerMechanics?.includes(mechanic));
  console.log(`- ${mechanicLabel[mechanic]}: ${owners.length} — ${owners.map((item) => item.id).join(', ') || 'nenhuma'}`);
}

const neutral = references.filter((item) => !item.silent && !item.offerMechanics?.length);
console.log(`- sem mecânica declarada (servem a % e leve-mais, nunca a progressivo): ${neutral.length}`);

console.log('\nARGUMENTO DE VENDA\n');
for (const driver of ['estetica', 'funcao']) {
  const list = references.filter((item) => !item.silent && item.drivers?.includes(driver));
  const onlyThis = list.filter((item) => item.drivers.length === 1);
  console.log(`- ${driverLabel[driver]}: ${list.length} abertas, ${onlyThis.length} exclusivas`);
}
const driverless = references.filter((item) => !item.silent && !item.drivers?.length);
console.log(`- sem argumento declarado (nunca aparecem, porque o aluno sempre responde essa pergunta): ${driverless.length}${driverless.length ? ` — ${driverless.map((item) => item.id).join(', ')}` : ''}`);

const silent = references.filter((item) => item.silent);
console.log(`\nFORA DA BIBLIOTECA\n\n- peças silenciosas (sem oferta, nunca entram no lote): ${silent.length} — ${silent.map((item) => item.id).join(', ') || 'nenhuma'}`);

/* Direções de coleção que já valem para o mesmo produto em cores. */
const variantReady = references.filter((item) => item.fillsWithVariants);
console.log(`- direções de coleção que também servem a um produto só: ${variantReady.length} — ${variantReady.map((item) => item.id).join(', ') || 'nenhuma'}`);

const repeats = references.filter((item) => item.repeatsSameProduct);
console.log(`- direções que repetem unidades idênticas (linguagem do leve-mais): ${repeats.length} — ${repeats.map((item) => item.id).join(', ') || 'nenhuma'}\n`);
