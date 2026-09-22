/*
 * Gera o mapa das lacunas: para cada caminho real, o que já existe no TOPO da
 * galeria — as peças que nascem com a cara daquela oferta — distribuído por
 * presença humana e quantidade de produtos. Célula vazia é imagem que falta.
 *
 * Roda com: npm run pagina:lacunas  →  public/lacunas.html
 */
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/mvp-data.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const data = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
const { references, isReferenceApplicable } = data;

/* Desconto progressivo é oferta de catálogo, e produto funcional não tem coleção. */
const caminhos = [
  { escopo: 'Produto único', mode: 'single', mech: 'percentual', driver: 'estetica' },
  { escopo: 'Produto único', mode: 'single', mech: 'leve-mais', driver: 'estetica' },
  { escopo: 'Coleção', mode: 'collection', mech: 'percentual', driver: 'estetica' },
  { escopo: 'Coleção', mode: 'collection', mech: 'leve-mais', driver: 'estetica' },
  { escopo: 'Coleção', mode: 'collection', mech: 'progressivo', driver: 'estetica' },
  { escopo: 'Produto único', mode: 'single', mech: 'percentual', driver: 'funcao' },
  { escopo: 'Produto único', mode: 'single', mech: 'leve-mais', driver: 'funcao' },
];

const mechLabel = { percentual: 'até X% de desconto', 'leve-mais': 'compre X, leve Y', progressivo: 'desconto progressivo' };
const driverLabel = { estetica: 'vende pela estética', funcao: 'vende por uma funcionalidade' };

const linhas = [
  { key: 'sem-pessoa', label: 'Sem pessoa', hint: 'só o produto no quadro' },
  { key: 'corpo-suporte', label: 'Corpo sem rosto', hint: 'mão, pulso, tronco' },
  { key: 'humanizado', label: 'Pessoa com rosto', hint: 'gente em cena' },
];
const colunas = [
  { key: 'um', label: 'Um produto', test: (r) => (r.slots ?? 1) <= 1 },
  { key: 'poucos', label: 'Dois ou três', test: (r) => (r.slots ?? 1) >= 2 && r.slots <= 3 },
  { key: 'muitos', label: 'Quatro ou mais', test: (r) => (r.slots ?? 1) >= 4 },
];

const escape = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function topoDe(caminho) {
  return references
    .filter((r) => isReferenceApplicable(r, { mode: caminho.mode, salesDriver: caminho.driver, offerMechanic: caminho.mech }))
    .filter((r) => r.offerMechanics?.includes(caminho.mech));
}

const secoes = caminhos.map((caminho, index) => {
  const topo = topoDe(caminho);
  const celulas = [];
  let vazias = 0;
  for (const linha of linhas) {
    for (const coluna of colunas) {
      const itens = topo.filter((r) => (r.people ?? 'sem-pessoa') === linha.key && coluna.test(r));
      if (!itens.length) vazias += 1;
      celulas.push({ linha, coluna, itens });
    }
  }
  const corpo = celulas.map(({ linha, coluna, itens }) => `
      <div class="cel${itens.length ? '' : ' vazia'}">
        <div class="cab">${escape(linha.label)} &middot; ${escape(coluna.label)}${itens.length ? `<span class="q">${itens.length}</span>` : '<span class="falta">falta</span>'}</div>
        ${itens.length
          ? `<div class="fotos">${itens.map((r) => `<figure><img loading="lazy" src="${escape(r.image)}" alt="${escape(r.name)}"><figcaption>${escape(r.id)}</figcaption></figure>`).join('')}</div>`
          : '<p class="nada">nenhuma peça</p>'}
      </div>`).join('');
  return `
  <section id="p${index}">
    <div class="head">
      <div>
        <h2>${escape(caminho.escopo)} &middot; ${escape(mechLabel[caminho.mech])}</h2>
        <p class="answers">${escape(driverLabel[caminho.driver])}</p>
      </div>
      <div class="counts"><span class="n">${topo.length}</span> peças no topo &middot; <span class="n">${vazias}</span> de 9 combinações vazias</div>
    </div>
    <div class="matriz">${corpo}</div>
  </section>`;
}).join('\n');

const resumo = caminhos.map((caminho, index) => {
  const topo = topoDe(caminho);
  const jeitos = new Set(topo.map((r) => `${r.family}|${r.people}|${r.slots ?? 1}`)).size;
  const classe = topo.length === 0 ? ' class="alerta"' : jeitos < 5 ? ' class="aviso"' : '';
  return `
    <tr${classe}>
      <td><a href="#p${index}">${escape(caminho.escopo)}</a></td>
      <td>${escape(mechLabel[caminho.mech])}</td>
      <td>${escape(driverLabel[caminho.driver])}</td>
      <td class="num">${topo.length}</td>
      <td class="num">${jeitos}</td>
    </tr>`;
}).join('');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Onde faltam imagens</title>
<style>
  :root{--bg:#131019;--fg:#f4f1f8;--card:#1c1826;--muted:#9b93ab;--line:rgba(255,255,255,.12);--bad:#f4585c;--warn:#e8b13a}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1240px;margin:0 auto;padding:44px 16px 96px}
  h1{font-size:29px;letter-spacing:-.02em;margin:0 0 6px}
  .sub{color:var(--muted);margin:0 0 30px;max-width:80ch}
  table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:52px}
  th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line)}
  th{color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  tr.alerta td{background:rgba(244,88,92,.12)}
  tr.aviso td{background:rgba(232,177,58,.09)}
  a{color:inherit}
  section{border-top:1px solid var(--line);padding-top:22px;margin-bottom:44px}
  .head{display:flex;flex-wrap:wrap;gap:8px 24px;align-items:baseline;justify-content:space-between;margin-bottom:14px}
  h2{font-size:18px;margin:0;letter-spacing:-.01em}
  .answers{margin:2px 0 0;color:var(--muted);font-size:13px}
  .counts{color:var(--muted);font-size:12px}
  .counts .n{color:var(--fg);font-weight:700;font-size:15px}
  .matriz{display:grid;gap:8px;grid-template-columns:repeat(3,1fr)}
  .cel{border:1px solid var(--line);background:var(--card);padding:9px;min-height:104px}
  .cel.vazia{border-style:dashed;border-color:rgba(244,88,92,.45);background:rgba(244,88,92,.06)}
  .cab{font-size:11px;color:var(--muted);margin-bottom:7px;display:flex;justify-content:space-between;gap:8px;align-items:center}
  .cab .q{color:var(--fg);font-weight:700}
  .cab .falta{color:var(--bad);font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:10px}
  .fotos{display:flex;flex-wrap:wrap;gap:6px}
  figure{margin:0;width:70px}
  figure img{display:block;width:70px;height:70px;object-fit:cover;background:#000;border:1px solid var(--line)}
  figcaption{font-size:9px;color:var(--muted);padding-top:3px;letter-spacing:.02em}
  .nada{margin:0;color:rgba(244,88,92,.8);font-size:12px}
  @media (max-width:820px){.matriz{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Onde faltam imagens</h1>
  <p class="sub">Cada caminho real do aluno, e no topo dele as peças que já nascem com a cara daquela oferta — são as que ele escolhe primeiro. A matriz cruza presença humana com quantidade de produtos. Célula tracejada é combinação que não existe no banco: é ali que a imagem nova entra, para que as cinco primeiras saiam próximas da oferta e ainda assim diferentes entre si.</p>

  <table>
    <tr><th>escopo</th><th>oferta</th><th>argumento</th><th class="num">no topo</th><th class="num">jeitos distintos</th></tr>
    ${resumo}
  </table>
${secoes}
</div>
</body>
</html>
`;

fs.writeFileSync(new URL('../public/lacunas.html', import.meta.url), html, 'utf8');
console.log('public/lacunas.html gerado.');
