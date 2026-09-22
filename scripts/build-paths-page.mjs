/*
 * Gera a página que mostra, com as imagens, o que o aluno vê em cada caminho.
 *
 * Um caminho é uma combinação das respostas que ele dá antes da galeria:
 * escopo, mecânica da oferta e argumento de venda. A página sai
 * direto dos dados do app, então ela nunca discorda da galeria real.
 *
 * Roda com: npm run pagina:caminhos  →  public/caminhos.html
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
const { references, isReferenceApplicable, sortForCampaign, compositionType } = data;

const LOT = 5;
const mechanicLabel = { percentual: 'até X% de desconto', 'leve-mais': 'compre X, leve Y', progressivo: 'desconto progressivo' };
const driverLabel = { estetica: 'vende pela estética', funcao: 'vende por uma funcionalidade' };

/* Os caminhos que a interface abre: escopo x mecânica da oferta x argumento de venda. */
function allPaths() {
  const paths = [];
  for (const salesDriver of ['estetica', 'funcao']) {
    /* Desconto progressivo é oferta de catálogo: não existe em produto único. */
    for (const offerMechanic of ['percentual', 'leve-mais']) {
      paths.push({ mode: 'single', offerMechanic, salesDriver });
    }
    /* Coleção é sempre um conjunto de produtos que vendem pela estética. */
    if (salesDriver !== 'estetica') continue;
    for (const offerMechanic of ['percentual', 'leve-mais', 'progressivo']) {
      paths.push({ mode: 'collection', offerMechanic, salesDriver });
    }
  }
  return paths;
}

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function pathTitle(path) {
  return path.mode === 'single' ? 'Produto único' : 'Coleção';
}

function describe(path) {
  /* Mesma ordem da galeria real: alterna tipo de composição, desempata por oferta. */
  const open = sortForCampaign(references.filter((item) => isReferenceApplicable(item, path)), path);
  const builds = open.filter((item) => item.offerMechanics?.includes(path.offerMechanic));
  const abertura = open.slice(0, LOT);
  const tipos = new Set(abertura.map(compositionType)).size;
  return { path, open, builds, abertura, tipos };
}

const rows = allPaths().map(describe);

const card = (reference, highlight, posicao) => `
      <figure${highlight ? ' class="hi"' : ''}>
        ${posicao ? `<span class="pos">${posicao}</span>` : ''}
        ${highlight ? '<span class="tag">nasceu com a oferta</span>' : ''}
        <img loading="lazy" src="${escape(reference.image)}" alt="${escape(reference.name)}">
        <figcaption><b>${escape(reference.id)}</b>${escape(reference.name)}</figcaption>
      </figure>`;

const sections = rows.map((row, index) => {
  const { path, open, builds, abertura, tipos } = row;
  /* O alarme é não ter cinco direções para escolher. Não ter nenhuma desenhada
     para a oferta é um aviso: o aluno consegue montar o lote, mas nenhuma peça
     da galeria já nasceu anunciando essa mecânica. */
  const status = tipos < Math.min(LOT, open.length)
    ? `<span class="pill bad">a abertura repete composição</span>`
    : open.length < LOT
    ? `<span class="pill bad">beco sem saída: faltam ${LOT - open.length} para montar um lote</span>`
    : builds.length === 0
      ? `<span class="pill aviso">nenhuma nasceu com essa oferta</span>`
      : `<span class="pill ok">fecha o lote</span>`;
  const resto = open.slice(LOT);
  const corpo = open.length
    ? `<h3 class="sub2">O lote de abertura — as ${Math.min(LOT, open.length)} primeiras que ele vê</h3>
       <div class="grid destaque">${abertura.map((item, i) => card(item, builds.includes(item), i + 1)).join('')}</div>
       ${resto.length ? `<h3 class="sub2">Depois delas, mais ${resto.length}</h3><div class="grid">${resto.map((item) => card(item, builds.includes(item))).join('')}</div>` : ''}`
    : `<p class="vazio">Nenhuma direção abre neste caminho. O aluno chega na etapa 3 e não tem o que escolher.</p>`;
  return `
  <section id="c${index}">
    <div class="head">
      <div>
        <h2>${escape(pathTitle(path))}</h2>
        <p class="answers">${escape(mechanicLabel[path.offerMechanic])} &middot; ${escape(driverLabel[path.salesDriver])}</p>
      </div>
      <div class="counts">
        <span class="n">${open.length}</span> direções abrem &middot; <span class="n">${builds.length}</span> nasceram com essa oferta &middot; abertura com <span class="n">${tipos}</span> de ${LOT} composições distintas ${status}
      </div>
    </div>
    ${corpo}
  </section>`;
}).join('\n');

const resumo = rows.map((row, index) => `
    <tr${row.open.length >= LOT ? (row.builds.length ? '' : ' class="aviso"') : ' class="alerta"'}>
      <td><a href="#c${index}">${escape(pathTitle(row.path))}</a></td>
      <td>${escape(mechanicLabel[row.path.offerMechanic])}</td>
      <td>${escape(driverLabel[row.path.salesDriver])}</td>
      <td class="num">${row.open.length}</td>
      <td class="num">${row.builds.length}</td>
    </tr>`).join('');

const furos = rows.filter((row) => row.open.length < LOT).length;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Caminhos do aluno</title>
<style>
  :root{--bg:#131019;--fg:#f4f1f8;--card:#1c1826;--muted:#9b93ab;--line:rgba(255,255,255,.12);--good:#3ecf8e;--bad:#f4585c}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1240px;margin:0 auto;padding:44px 16px 96px}
  h1{font-size:29px;letter-spacing:-.02em;margin:0 0 6px}
  .sub{color:var(--muted);margin:0 0 32px;max-width:78ch}
  table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:56px}
  th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line)}
  th{color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  tr.alerta td{background:rgba(244,88,92,.09)}
  tr.aviso td{background:rgba(232,177,58,.08)}
  a{color:inherit}
  section{border-top:1px solid var(--line);padding-top:22px;margin-bottom:46px}
  .head{display:flex;flex-wrap:wrap;gap:10px 24px;align-items:baseline;justify-content:space-between;margin-bottom:16px}
  h2{font-size:18px;margin:0;letter-spacing:-.01em}
  .answers{margin:2px 0 0;color:var(--muted);font-size:13px}
  .counts{color:var(--muted);font-size:12px}
  .counts .n{color:var(--fg);font-weight:700;font-size:15px}
  .pill{display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:.03em}
  .pill.ok{background:rgba(62,207,142,.16);color:var(--good)}
  .pill.bad{background:rgba(244,88,92,.16);color:var(--bad)}
  .pill.aviso{background:rgba(232,177,58,.16);color:#e8b13a}
  .grid{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(118px,1fr))}
  .grid.destaque{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));margin-bottom:22px}
  .sub2{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:500;margin:0 0 9px}
  .pos{position:absolute;bottom:0;right:0;background:rgba(0,0,0,.75);color:#fff;font-size:11px;font-weight:700;padding:2px 7px}
  figure{margin:0;background:var(--card);border:1px solid var(--line);position:relative}
  figure.hi{border-color:var(--good)}
  figure img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#000}
  figcaption{padding:6px 7px;font-size:10px;line-height:1.3;color:var(--muted)}
  figcaption b{display:block;color:var(--fg);font-weight:600;letter-spacing:.02em}
  .tag{position:absolute;top:0;left:0;background:var(--good);color:#06231a;font-size:9px;font-weight:700;letter-spacing:.04em;padding:2px 5px;text-transform:uppercase}
  .vazio{background:rgba(244,88,92,.1);border:1px solid rgba(244,88,92,.35);padding:14px;color:#ffd7d8;margin:0}
</style>
</head>
<body>
<div class="wrap">
  <h1>O que o aluno vê em cada caminho</h1>
  <p class="sub">${references.length} referências no banco, ${rows.length} caminhos possíveis. O caminho nasce de três respostas: o que ele vai anunciar, como a oferta funciona e o que faz o cliente comprar. Borda verde marca as direções cuja peça de origem já anuncia essa mesma oferta — são as que a galeria põe na frente.</p>

  <table>
    <tr><th>escopo</th><th>oferta</th><th>argumento</th><th class="num">abrem</th><th class="num">constroem</th></tr>
    ${resumo}
  </table>
${sections}
</div>
</body>
</html>
`;

fs.writeFileSync(new URL('../public/caminhos.html', import.meta.url), html, 'utf8');
console.log(`public/caminhos.html gerado — ${rows.length} caminhos, ${furos} sem cinco direções para montar um lote.`);
