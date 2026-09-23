/*
 * O que ainda falta no banco, contando as imagens ja aprovadas mas ainda nao cadastradas.
 *
 * O aluno chega na galeria por um caminho: escopo x mecanica da oferta x argumento de
 * venda. Dentro do caminho, o que faz um lote de cinco parecer cinco peças diferentes
 * e a combinacao de presenca humana com quantidade de produtos. Este relatorio cruza
 * as duas coisas e mostra onde nao existe nenhuma peca que nasca com aquela oferta.
 *
 * Roda com: npm run audit:lacunas
 */
import fs from 'node:fs';
import ts from 'typescript';
import { lote } from './referencias-lote.mjs';
import { serie2 } from './referencias-serie-2.mjs';
import { serie3 } from './referencias-serie-3.mjs';
import { serie4 } from './referencias-serie-4.mjs';
import { nativos } from './referencias-nativos.mjs';

const fonte = fs.readFileSync(new URL('../lib/mvp-data.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(fonte, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { references, isReferenceApplicable } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

/* A primeira leva e as variacoes nasceram antes dos arquivos de serie, entao vem aqui. */
const primeiraLeva = [
  { id: 'NOVA-01', mode: 'single', mech: 'percentual', argumento: 'funcao', people: 'sem-pessoa', slots: 1, categoria: 'utilidades' },
  { id: 'NOVA-02', mode: 'single', mech: 'percentual', argumento: 'funcao', people: 'corpo-suporte', slots: 1, categoria: 'saúde e bem-estar' },
  { id: 'NOVA-03', mode: 'single', mech: 'percentual', argumento: 'funcao', people: 'humanizado', slots: 1, categoria: 'eletroportáteis' },
  { id: 'NOVA-04', mode: 'single', mech: 'percentual', argumento: 'funcao', people: 'sem-pessoa', slots: 3, categoria: 'utilidades' },
  { id: 'NOVA-05', mode: 'single', mech: 'percentual', argumento: 'estetica', people: 'corpo-suporte', slots: 1, categoria: 'relógios & joias' },
  { id: 'NOVA-06', mode: 'single', mech: 'percentual', argumento: 'estetica', people: 'sem-pessoa', slots: 3, categoria: 'bolsas e mochilas' },
  { id: 'NOVA-07', mode: 'collection', mech: 'percentual', argumento: 'estetica', people: 'corpo-suporte', slots: 5, categoria: 'vestuário' },
  { id: 'NOVA-08', mode: 'collection', mech: 'percentual', argumento: 'estetica', people: 'corpo-suporte', slots: 4, categoria: 'vestuário' },
  { id: 'VAR-01', mode: 'single', mech: 'leve-mais', argumento: 'estetica', people: 'sem-pessoa', slots: 1, categoria: 'vestuário' },
  { id: 'VAR-02', mode: 'single', mech: 'leve-mais', argumento: 'estetica', people: 'sem-pessoa', slots: 3, categoria: 'vestuário' },
  { id: 'VAR-03', mode: 'single', mech: 'percentual', argumento: 'estetica', people: 'corpo-suporte', slots: 2, categoria: 'vestuário' },
];

const APROVADAS = new Set([
  'NOVA-01', 'NOVA-02', 'NOVA-03', 'NOVA-04', 'NOVA-05', 'NOVA-06', 'NOVA-07', 'NOVA-08',
  'VAR-01', 'VAR-02', 'VAR-03',
  'NOVA-09', 'NOVA-10', 'NOVA-11',
  'NOVA-13', 'NOVA-16', 'NOVA-17', 'NOVA-19', 'NOVA-20', 'NOVA-22', 'NOVA-24',
  'NOVA-25', 'NOVA-26', 'NOVA-27', 'NOVA-28', 'NOVA-31', 'NOVA-34', 'NOVA-35',
  'NOVA-37', 'NOVA-39', 'NOVA-40', 'NOVA-41', 'NOVA-42', 'NOVA-43', 'NOVA-44',
  'NOVA-29B', 'NOVA-30B', 'NOVA-33B', 'NOVA-36B',
  'NOVA-45', 'NOVA-46', 'NOVA-47', 'NOVA-48', 'NOVA-49',
  'NOVA-50', 'NOVA-51', 'NOVA-52', 'NOVA-53', 'NOVA-54',
]);

/*
 * A serie 2 foi reescrita no formato do app dentro de `referencias-lote.mjs`, entao os
 * mesmos ids existem nos dois arquivos. Vence o primeiro da lista, que e o do lote.
 */
const porId = new Map();
for (const item of [...primeiraLeva, ...lote, ...serie2, ...serie3, ...serie4, ...nativos]) {
  if (APROVADAS.has(item.id) && !porId.has(item.id)) porId.set(item.id, item);
}

/* A aprovada entra no mapa com a mesma forma de uma referencia do banco. */
const novas = [...porId.values()]
  .map((item) => ({
    id: item.id,
    modes: [item.mode],
    people: item.people,
    drivers: [item.argumento],
    offerMechanics: [item.mech],
    slots: item.slots ?? 1,
    categoria: item.categoria,
    nova: true,
  }));

const todas = [...references, ...novas];

const caminhos = [
  ['single', 'percentual', 'estetica'], ['single', 'leve-mais', 'estetica'],
  ['collection', 'percentual', 'estetica'], ['collection', 'leve-mais', 'estetica'], ['collection', 'progressivo', 'estetica'],
  ['single', 'percentual', 'funcao'], ['single', 'leve-mais', 'funcao'],
];
const rotuloModo = { single: 'produto único', collection: 'coleção' };
const rotuloMech = { percentual: 'até X%', 'leve-mais': 'compre X leve Y', progressivo: 'progressivo' };
const rotuloDriver = { estetica: 'estética', funcao: 'função' };
const pessoas = [['sem-pessoa', 'sem pessoa'], ['corpo-suporte', 'corpo sem rosto'], ['humanizado', 'pessoa com rosto']];
const quantidades = [['um', (s) => s <= 1], ['dois ou três', (s) => s >= 2 && s <= 3], ['quatro ou mais', (s) => s >= 4]];

console.log(`\nLACUNAS — ${references.length} no ar + ${novas.length} aprovadas = ${todas.length}\n`);

const vazias = [];
for (const [mode, mech, driver] of caminhos) {
  const topo = todas.filter((r) =>
    isReferenceApplicable(r, { mode, salesDriver: driver, offerMechanic: mech })
    && r.offerMechanics?.includes(mech));
  const linhas = [];
  for (const [chavePessoa, rotuloPessoa] of pessoas) {
    for (const [rotuloQtd, testa] of quantidades) {
      const itens = topo.filter((r) => (r.people ?? 'sem-pessoa') === chavePessoa && testa(r.slots ?? 1));
      const novasAqui = itens.filter((r) => r.nova).length;
      if (!itens.length) vazias.push(`${rotuloModo[mode]} · ${rotuloMech[mech]} · ${rotuloDriver[driver]} · ${rotuloPessoa} · ${rotuloQtd}`);
      linhas.push(`   ${rotuloPessoa.padEnd(16)} ${rotuloQtd.padEnd(15)} ${itens.length ? `${itens.length} (${novasAqui} novas)` : '—— VAZIO'}`);
    }
  }
  console.log(`${rotuloModo[mode]} · ${rotuloMech[mech]} · ${rotuloDriver[driver]}  —  ${topo.length} no topo`);
  console.log(linhas.join('\n'), '\n');
}

console.log(`${vazias.length} de 63 combinações continuam vazias:\n`);
for (const v of vazias) console.log(`  - ${v}`);

/* Nicho: o aluno precisa se reconhecer na galeria, mesmo que o layout sirva a todos. */
const nicho = {};
for (const r of references) nicho[r.category] = (nicho[r.category] ?? 0) + 1;
for (const r of novas) nicho[r.categoria ?? '—'] = (nicho[r.categoria ?? '—'] ?? 0) + 1;
console.log('\nNICHO\n');
for (const [k, v] of Object.entries(nicho).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);

console.log(`\nREGIME\n\n  ${references.filter((r) => r.native).length} nativas cadastradas, ${nativos.length} direções escritas e 0 imagens geradas.`);
console.log(`  ${[...references, ...novas].filter((r) => r.silent).length} peças sem texto.\n`);
