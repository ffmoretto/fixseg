/**
 * =============================================================================
 * VERIFICAÇÃO DA REGRA DE BÔNUS
 * =============================================================================
 * Exercita `src/config/bonus.ts` contra os casos conhecidos de mercado. Roda em
 * Node puro, sem navegador e sem framework de teste: o TypeScript é transpilado
 * em memória com o compilador que já é dependência do projeto.
 *
 *   node scripts/verificar-bonus.mjs
 *
 * Sai com código 1 se algum caso falhar.
 * =============================================================================
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = readFileSync(resolve(raiz, 'src/config/bonus.ts'), 'utf8');

const { outputText } = ts.transpileModule(fonte, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const modulo = { exports: {} };
new Function('exports', 'require', 'module', outputText)(modulo.exports, require, modulo);

const { calcularBonus, faixaDeAtraso, penalidadeDeSinistros } = modulo.exports;

/* ------------------------------------------------------------------ datas -- */

const MS = 86_400_000;
const iso = (ts) => new Date(ts).toISOString().slice(0, 10);
const dia = (texto) => Date.UTC(...texto.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
const mais = (texto, dias) => iso(dia(texto) + dias * MS);

/** Apólice anual completa: 366 dias de vigência, acima dos 335 exigidos. */
const INICIO = '2024-01-10';
const VENCIMENTO = '2025-01-10';

/* ------------------------------------------------------------------ casos -- */

const casos = [
  {
    nome: '0 sinistros, renovação em até 30 dias → sobe 1 classe',
    classe: 5,
    sinistros: 0,
    atrasoDias: 26,
    esperado: { novaClasse: 6, variacao: 1 },
  },
  {
    nome: '0 sinistros, 31 a 60 dias → mantém a classe',
    classe: 5,
    sinistros: 0,
    atrasoDias: 36,
    esperado: { novaClasse: 5, variacao: 0 },
  },
  {
    nome: '0 sinistros, 61 a 90 dias → perde 1',
    classe: 5,
    sinistros: 0,
    atrasoDias: 69,
    esperado: { novaClasse: 4, variacao: -1 },
  },
  {
    nome: '0 sinistros, 91 a 120 dias → perde 2',
    classe: 5,
    sinistros: 0,
    atrasoDias: 100,
    esperado: { novaClasse: 3, variacao: -2 },
  },
  {
    nome: '0 sinistros, mais de 330 dias → perde 10 (zera)',
    classe: 10,
    sinistros: 0,
    atrasoDias: 340,
    esperado: { novaClasse: 0, variacao: -10 },
  },
  {
    nome: '2 sinistros, 31 a 60 dias → perde 3',
    classe: 8,
    sinistros: 2,
    atrasoDias: 36,
    esperado: { novaClasse: 5, variacao: -3 },
  },
  {
    nome: '4 sinistros, 91 a 120 dias → perde 7',
    classe: 9,
    sinistros: 4,
    atrasoDias: 100,
    esperado: { novaClasse: 2, variacao: -7 },
  },
  {
    nome: '1 sinistro, renovação imediata → perde 1',
    classe: 6,
    sinistros: 1,
    atrasoDias: 0,
    esperado: { novaClasse: 5, variacao: -1 },
  },
];

/* Regras de vigência (adicionais aos oito casos de mercado). */
const casosVigencia = [
  {
    nome: 'vigência de 200 dias, sem sinistro, renovação em dia → sem avanço',
    inicio: '2024-06-01',
    fim: '2024-12-18', // 200 dias
    classe: 6,
    sinistros: 0,
    atrasoDias: 10,
    esperado: { novaClasse: 6, variacao: 0, regra: 'sem-avanco' },
  },
  {
    nome: 'vigência de 40 dias → bônus não se transfere (classe 0)',
    inicio: '2024-06-01',
    fim: '2024-07-11', // 40 dias
    classe: 9,
    sinistros: 0,
    atrasoDias: 5,
    esperado: { novaClasse: 0, variacao: -9, regra: 'sem-transferencia' },
  },
];

/* ---------------------------------------------------------------- execução - */

let falhas = 0;
const linha = (ok, texto) => console.log(`${ok ? '  ok  ' : ' FALHA'} │ ${texto}`);

console.log('\nCASOS CONHECIDOS DE MERCADO\n' + '─'.repeat(78));

for (const caso of [...casos, ...casosVigencia]) {
  const inicio = caso.inicio ?? INICIO;
  const fim = caso.fim ?? VENCIMENTO;
  const referencia = mais(fim, caso.atrasoDias);

  const r = calcularBonus({
    inicioVigencia: inicio,
    fimVigencia: fim,
    dataReferencia: referencia,
    classeAtual: caso.classe,
    sinistros: caso.sinistros,
  });

  const checagens = Object.entries(caso.esperado).filter(([k, v]) => r[k] !== v);
  const ok = checagens.length === 0 && r.diasDesdeVencimento === caso.atrasoDias;
  if (!ok) falhas++;

  linha(
    ok,
    `${caso.nome}\n       │ classe ${caso.classe} → ${r.novaClasse} (variação ${r.variacao}), ` +
      `${r.diasDesdeVencimento} dias de atraso, ${r.diasVigencia} dias de vigência, regra "${r.regra}"`,
  );
  if (!ok) {
    console.log(`       │ ESPERADO: ${JSON.stringify(caso.esperado)}`);
    console.log(`       │ OBTIDO:   ${JSON.stringify({ novaClasse: r.novaClasse, variacao: r.variacao, regra: r.regra, diasDesdeVencimento: r.diasDesdeVencimento })}`);
  }
}

/* ------------------------------------------------- limites das duas parcelas */

console.log('\nFRONTEIRAS DAS FAIXAS DE ATRASO\n' + '─'.repeat(78));

const fronteiras = [
  [0, 0], [1, 0], [30, 0], [31, 1], [60, 1], [61, 2], [90, 2], [91, 3],
  [120, 3], [121, 4], [330, 10], [331, 11], [400, 11], [5000, 11],
];
for (const [dias, esperado] of fronteiras) {
  const obtido = faixaDeAtraso(dias);
  const ok = obtido === esperado;
  if (!ok) falhas++;
  linha(ok, `${String(dias).padStart(4)} dias → faixa ${obtido} (esperado ${esperado})`);
}

console.log('\nPENALIDADE POR SINISTRO\n' + '─'.repeat(78));

for (const [n, esperado] of [[0, 0], [1, 2], [2, 3], [3, 4], [4, 5]]) {
  const obtido = penalidadeDeSinistros(n);
  const ok = obtido === esperado;
  if (!ok) falhas++;
  linha(ok, `${n} sinistro(s) → −${obtido} classes (esperado −${esperado})`);
}

console.log('─'.repeat(78));
if (falhas) {
  console.log(`\n${falhas} verificação(ões) falharam.\n`);
  process.exit(1);
}
console.log('\nTodas as verificações passaram.\n');
