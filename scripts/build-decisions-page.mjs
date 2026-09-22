/*
 * As duas decisões que ficaram abertas depois da varredura do sistema:
 *
 * 1. direções de coleção que hoje somem quando o aluno anuncia um produto só
 * 2. peças silenciosas, que têm receita pronta e nenhum caminho até o aluno
 *
 * Roda com: npm run pagina:decisoes  →  public/decisoes.html
 */
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/mvp-data.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const data = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
const { references } = data;

/* O que eu abriria e por quê, olhando a composição de cada imagem. */
const parecer = {
  'REF-0007': ['abrir', 'os seis módulos aceitam cores ou vistas do mesmo produto'],
  'REF-0009': ['abrir', 'a origem já é o mesmo modelo em estampas diferentes'],
  'REF-0015': ['abrir', 'os módulos aceitam cores do mesmo produto'],
  'REF-0021': ['abrir', 'o pedestal aceita três cores, ou uma peça sozinha'],
  'REF-0025': ['abrir', 'a origem é o mesmo conjunto em quatro cores'],
  'REF-0036': ['abrir', 'dois pulsos viram duas cores do mesmo item, ou um só'],
  'REF-0046': ['abrir', 'as duas fileiras aceitam cores do mesmo modelo'],
  'REF-0047': ['abrir', 'flat lay aceita cores e vistas'],
  'REF-0048': ['abrir', 'flat lay aceita cores e vistas'],
  'REF-0051': ['abrir', 'flat lay aceita cores e vistas'],
  'REF-0053': ['abrir', 'as quatro fotos aceitam cores ou ângulos do mesmo produto'],
  'REF-0054': ['abrir', 'a origem é o mesmo modelo em cores, em módulos desiguais'],
  'REF-0014': ['fechada', 'a faixa inferior exige packshots com embalagem própria de cada item'],
  'REF-0022': ['fechada', 'a vitrine precisa de estoque variado em volta do produto'],
  'REF-0033': ['fechada', 'a caixa cheia só existe com muitos itens realmente diferentes'],
  'REF-0034': ['fechada', 'o balcão só existe com muitos itens realmente diferentes'],
  'REF-0038': ['fechada', 'são oito looks distintos com pessoas diferentes'],
  'REF-0039': ['fechada', 'mistura produto, acessório e objeto de marca em oito módulos'],
  'REF-0050': ['fechada', 'cinco looks distintos vestidos, com enquadramentos próprios'],
};

const invisiveis = references.filter((r) => !r.silent && r.modes.length === 1 && r.modes[0] === 'collection' && !r.fillsWithVariants);
const silenciosas = references.filter((r) => r.silent);

const escape = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const card = (r, selo, nota) => `
    <figure class="${selo === 'abrir' ? 'sim' : selo === 'fechada' ? 'nao' : ''}">
      ${selo ? `<span class="tag ${selo === 'abrir' ? 'ok' : 'no'}">${selo === 'abrir' ? 'eu abriria' : 'eu deixaria fechada'}</span>` : ''}
      <img loading="lazy" src="${escape(r.image)}" alt="${escape(r.name)}">
      <figcaption>
        <b>${escape(r.id)} &middot; ${escape(r.slots ?? 1)} produto${(r.slots ?? 1) > 1 ? 's' : ''}</b>
        ${escape(r.name)}
        ${nota ? `<i>${escape(nota)}</i>` : ''}
      </figcaption>
    </figure>`;

const abrir = invisiveis.filter((r) => parecer[r.id]?.[0] === 'abrir');
const fechar = invisiveis.filter((r) => parecer[r.id]?.[0] !== 'abrir');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Duas decisões</title>
<style>
  :root{--bg:#131019;--fg:#f4f1f8;--card:#1c1826;--muted:#9b93ab;--line:rgba(255,255,255,.12);--ok:#3ecf8e;--no:#e8b13a}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1180px;margin:0 auto;padding:44px 16px 96px}
  h1{font-size:29px;letter-spacing:-.02em;margin:0 0 6px}
  .sub{color:var(--muted);margin:0 0 38px;max-width:80ch}
  section{border-top:1px solid var(--line);padding-top:24px;margin-bottom:48px}
  h2{font-size:19px;margin:0 0 4px}
  h3{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:500;margin:26px 0 10px}
  .lead{color:var(--muted);margin:0 0 6px;max-width:78ch}
  .grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(184px,1fr))}
  figure{margin:0;background:var(--card);border:1px solid var(--line);position:relative}
  figure.sim{border-color:rgba(62,207,142,.5)}
  figure.nao{border-color:rgba(232,177,58,.4)}
  figure img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#000}
  figcaption{padding:8px 9px;font-size:11px;line-height:1.4;color:var(--muted)}
  figcaption b{display:block;color:var(--fg);font-weight:600;font-size:11px;letter-spacing:.02em}
  figcaption i{display:block;margin-top:5px;font-style:normal;color:#cbc3da}
  .tag{position:absolute;top:0;left:0;font-size:10px;font-weight:700;letter-spacing:.04em;padding:3px 7px;text-transform:uppercase}
  .tag.ok{background:var(--ok);color:#06231a}
  .tag.no{background:var(--no);color:#241a05}
</style>
</head>
<body>
<div class="wrap">
  <h1>Duas decisões</h1>
  <p class="sub">O que sobrou da varredura do sistema. As duas dependem de olhar a imagem, então estão aqui com a imagem.</p>

  <section>
    <h2>1. Direções de coleção que somem quando é um produto só</h2>
    <p class="lead">Eram 19. Doze já foram abertas; sobraram ${invisiveis.length}, que a galeria ainda esconde de quem anuncia um produto. Agora que toda receita diz o que fazer quando vem menos produto, a maioria consegue se preencher com as cores ou as vistas do mesmo item.</p>
    <h3>${abrir.length} que eu abriria</h3>
    <div class="grid">${abrir.map((r) => card(r, 'abrir', parecer[r.id][1])).join('')}</div>
    <h3>${fechar.length} que eu deixaria fechadas</h3>
    <div class="grid">${fechar.map((r) => card(r, 'fechada', parecer[r.id]?.[1] ?? '')).join('')}</div>
  </section>

  <section>
    <h2>2. As peças sem texto — resolvido</h2>
    <p class="lead">São ${silenciosas.length}, e a galeria recusava todas por não terem palavra comercial. Agora entram como qualquer outra, com um aviso no card dizendo que a peça vende só pela imagem e que a oferta fica nas outras do lote. O núcleo continua impedindo que a oferta seja injetada nelas.</p>
    <div class="grid">${silenciosas.map((r) => card(r, null, r.limits ?? '')).join('')}</div>
  </section>
</div>
</body>
</html>
`;

fs.writeFileSync(new URL('../public/decisoes.html', import.meta.url), html, 'utf8');
console.log(`public/decisoes.html gerado — ${invisiveis.length} de coleção, ${silenciosas.length} silenciosas.`);
