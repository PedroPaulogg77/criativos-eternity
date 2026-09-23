/*
 * Lote de imagens novas para o banco, gerado pelo compilador do próprio app.
 *
 * O prompt que o aluno recebe é `compileReferencePrompt`, e ele só funciona depois
 * do contexto capturado da loja. Aqui não existe loja, então cada direção traz o
 * contexto que o ChatGPT teria devolvido — no mesmo formato do app — e o resto é o
 * prompt real, sem nenhuma linha escrita à mão fora da receita.
 *
 * Roda com: npm run prompts:lote
 *   → REFERENCIAS-NO-AR/prompts-lote-codex.md    (todas)
 *   → REFERENCIAS-NO-AR/prompts-amostra-codex.md (as três primeiras, para conferir antes)
 */
import fs from 'node:fs';
import ts from 'typescript';
import { lote } from './referencias-lote.mjs';
import { serie3 } from './referencias-serie-3.mjs';
import { serie4 } from './referencias-serie-4.mjs';
import { nativos } from './referencias-nativos.mjs';

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

const { compileReferencePrompt } = await import(moduloTs(new URL('lib/prompt-compiler.ts', raiz)));

const MARCA = 'SEU LOGO — a peça é um molde; onde pedir a marca da loja, escreva exatamente SEU LOGO. Não invente nome de loja nem use marca real.';
const TIPOGRAFIA = 'sem serifa, neutra e comercial; títulos em caixa alta e peso forte, textos de apoio em peso regular.';
const argumentoTexto = {
  estetica: 'ESTÉTICA — o produto se vende pela própria imagem.',
  funcao: 'FUNCIONALIDADE — o produto se vende pelo que resolve, e isso precisa ser dito na peça.',
};
const naoConfirmado = [
  'Prazo de entrega publicado: não confirmado',
  'Formas de pagamento publicadas: não confirmado',
  'Troca e devolução publicadas: não confirmado',
  'Garantia publicada: não confirmado',
  'Canais de atendimento publicados: não confirmado',
];

function contextoProdutoUnico(item) {
  const variantes = (item.variantes ?? []).map((cor, i) => `- V${String(i + 1).padStart(2, '0')}: ${item.alvo}, ${cor}`);
  return [
    'CONTEXTO CAPTURADO',
    '',
    `Marca: ${MARCA} O produto não tem marca aparente.`,
    'Idioma: português do Brasil',
    `Produto e categoria: ${item.alvo} — ${item.categoria}`,
    `Variante visual: ${item.variantes?.[0] ?? 'única'}`,
    'Variações visuais confirmadas do mesmo produto (uma por linha, ou “nenhuma”):',
    ...(variantes.length > 1 ? variantes : ['- nenhuma']),
    `Características que serão preservadas: ${item.detalhes}`,
    `Benefícios factuais: ${item.beneficios?.length ? item.beneficios.join('; ') : 'nenhum a destacar'}`,
    `Oferta recebida: ${item.oferta}`,
    `Redação localizada da oferta: ${item.oferta}`,
    'Logo e cores observadas: sem logo de marca real; identidade neutra.',
    `Estilo tipográfico da loja: ${TIPOGRAFIA}`,
    `Público-alvo do produto: ${item.publico}`,
    `Argumento de venda: ${argumentoTexto[item.argumento]}`,
    'Título publicitário proposto: nenhum além do que a direção visual pedir.',
    ...naoConfirmado,
    'Fatos que não puderam ser confirmados: nenhum relevante para esta peça.',
    'PRONTO PARA GERAR: SIM',
  ].join('\n');
}

function contextoColecao(item) {
  return [
    'CONTEXTO CAPTURADO — V004',
    'Tipo da campanha: COLEÇÃO',
    `Alvo exato: ${item.alvo}`,
    `Escopo incluído: ${item.categoria}`,
    'Escopo excluído: qualquer produto fora da lista de elegíveis',
    `Marca da loja/anunciante: ${MARCA}`,
    'Marca do produto ou da coleção: nenhuma aparente',
    'Idioma: português do Brasil',
    `Oferta recebida: ${item.oferta}`,
    `Redação localizada da oferta: ${item.oferta}`,
    'Identidade visual observada: neutra, sem logo de marca real.',
    `Estilo tipográfico da loja: ${TIPOGRAFIA}`,
    `Público-alvo da coleção: ${item.publico}`,
    `Argumento de venda: ${argumentoTexto.estetica}`,
    'Produtos/looks elegíveis:',
    ...item.itens.map((nome, i) => `- P${String(i + 1).padStart(2, '0')}: ${nome}`),
    'Regra de seleção visual: escolher livremente entre os elegíveis, na quantidade que cada peça pedir.',
    'Título publicitário proposto: nenhum além do que a direção visual pedir.',
    'Fonte principal usada: link',
    ...naoConfirmado,
    'Fatos que não puderam ser confirmados: nenhum relevante para esta peça.',
    'PRONTO PARA GERAR: SIM',
  ].join('\n');
}

/* A referência provisória tem os mesmos campos que ela terá em `lib/mvp-data.ts`. */
function referencia(item) {
  return {
    id: item.id,
    name: item.nome,
    family: 'Lifestyle',
    modes: [item.mode],
    people: item.people,
    drivers: [item.argumento],
    offerMechanics: [item.mech],
    slots: item.slots,
    silent: item.silent,
    native: item.native,
    fillsWithVariants: item.fillsWithVariants,
    repeatsSameProduct: item.repeatsSameProduct,
    recipe: item.receita.join('\n- '),
  };
}

function prompt(item) {
  const campanha = { mode: item.mode, exactTarget: item.alvo, offer: item.oferta, offerMechanic: item.mech, salesDriver: item.argumento };
  const contexto = item.mode === 'collection' ? contextoColecao(item) : contextoProdutoUnico(item);
  return `${contexto}\n\n${compileReferencePrompt(campanha, referencia(item))}`;
}

function arquivo(titulo, itens) {
  return [
    `# ${titulo} — ${itens.length} referências`,
    '',
    'Cada bloco é um prompt inteiro, montado pelo compilador do app a partir de um contexto',
    'de loja fictícia. Gere uma imagem por bloco, sem imagem de referência, e salve como `<id>.png`.',
    '',
    ...itens.flatMap((item) => [`## ${item.id} · ${item.nome}`, '', `Preenche: ${item.caminho}`, '', '```', prompt(item), '```', '']),
  ].join('\n');
}

/* Já geradas e aprovadas por Pedro: saem do lote e ficam só como registro. */
const APROVADAS = new Set([
  'NOVA-13', 'NOVA-16', 'NOVA-17', 'NOVA-19', 'NOVA-20', 'NOVA-22', 'NOVA-24',
  'NOVA-25', 'NOVA-26', 'NOVA-27', 'NOVA-28', 'NOVA-31', 'NOVA-34', 'NOVA-35',
  'NOVA-37', 'NOVA-39', 'NOVA-40', 'NOVA-41', 'NOVA-42', 'NOVA-43', 'NOVA-44',
  'NOVA-29B', 'NOVA-30B', 'NOVA-33B', 'NOVA-36B',
  'NOVA-45', 'NOVA-46', 'NOVA-47', 'NOVA-48', 'NOVA-49',
  'NOVA-50', 'NOVA-51', 'NOVA-52', 'NOVA-53', 'NOVA-54',
]);
/* Reprovadas: a direção some, ou volta corrigida na série 3 com outro id. */
const REPROVADAS = new Set(['NOVA-12', 'NOVA-14', 'NOVA-15', 'NOVA-18', 'NOVA-21', 'NOVA-23', 'NOVA-29', 'NOVA-30', 'NOVA-32', 'NOVA-33', 'NOVA-36']);

const pendentes = [...lote, ...serie3, ...serie4].filter((item) => !APROVADAS.has(item.id) && !REPROVADAS.has(item.id));

const pasta = new URL('../../REFERENCIAS-NO-AR/', import.meta.url);
fs.writeFileSync(new URL('prompts-lote-codex.md', pasta), arquivo('Lote', pendentes), 'utf8');
fs.writeFileSync(new URL('prompts-amostra-codex.md', pasta), arquivo('Amostra', pendentes.slice(0, 3)), 'utf8');
fs.writeFileSync(new URL('prompts-consumiveis-codex.md', pasta), arquivo('Consumíveis e cosméticos', serie4), 'utf8');
fs.writeFileSync(new URL('prompts-nativos-codex.md', pasta), arquivo('Nativos', nativos.map((item) => ({ ...item, native: true, slots: 1 }))), 'utf8');
console.log(`prompts-lote-codex.md — ${pendentes.length} prompts; amostra: ${pendentes.slice(0, 3).map((i) => i.id).join(', ')}.`);
