/**
 * =============================================================================
 * VERIFICAÇÃO DO FILTRO E DO PARSER DE NOTÍCIAS
 * =============================================================================
 * Exercita `src/services/news.ts` (filtro + parser de RSS) contra casos
 * escritos à mão. Roda em Node puro, sem navegador e sem framework de teste: o
 * TypeScript é transpilado em memória com o compilador que já é dependência do
 * projeto — o mesmo caminho de `scripts/verificar-bonus.mjs`.
 *
 *   node scripts/verificar-noticias.mjs
 *
 * Sai com código 1 se algum caso falhar.
 *
 * ⚠️ IMPORTANTE — as manchetes abaixo são CASOS DE TESTE, escritas no estilo de
 * um portal de seguros para exercitar as duas listas de termos. NÃO são notícias
 * reais, não têm data nem autor, não vêm do CQCS e não são publicadas em lugar
 * nenhum: elas existem só dentro deste arquivo, que nunca é importado pelo site.
 * =============================================================================
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Transpila um .ts do projeto e devolve os exports, resolvendo o alias `@/`. */
function carregar(caminhoRelativo, alias = {}) {
  const fonte = readFileSync(resolve(raiz, caminhoRelativo), 'utf8');
  const { outputText } = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const modulo = { exports: {} };
  const requireLocal = (id) =>
    Object.prototype.hasOwnProperty.call(alias, id) ? alias[id] : require(id);
  new Function('exports', 'require', 'module', outputText)(modulo.exports, requireLocal, modulo);
  return modulo.exports;
}

const config = carregar('src/config/news.ts');
const news = carregar('src/services/news.ts', { '@/config/news': config });

const {
  avaliarNoticia,
  filtrarNoticias,
  normalizarParaBusca,
  casaTermo,
  decodificarEntidades,
  textoPuro,
  resumoPuro,
  truncarPorPalavra,
  parseRss,
  parseWpJson,
  dataIso,
} = news;

/* ========================================================================== */
/* PLACAR                                                                     */
/* ========================================================================== */

let ok = 0;
const falhas = [];

function conferir(nome, condicao, detalhe = '') {
  if (condicao) {
    ok += 1;
  } else {
    falhas.push(`${nome}${detalhe ? ` — ${detalhe}` : ''}`);
  }
}

/* ========================================================================== */
/* 1. O FILTRO — 28 manchetes de teste                                        */
/* ========================================================================== */

/**
 * `entra: true`  → a notícia interessa ao cliente da corretora.
 * `entra: false` → precisa ficar de fora, e `motivo` diz por quê:
 *                  'excluida'               casou com termo de exclusão;
 *                  'sem-sinal-de-inclusao'  não falou de nada que interessa.
 */
const casos = [
  /* ---------------- DEVEM ENTRAR: seguro que afeta o cliente -------------- */
  {
    titulo: 'Roubo de carga cresce nas rodovias e eleva a importância do seguro de transporte',
    categorias: ['Notícia', 'Transportes'],
    entra: true,
  },
  {
    titulo: 'Chuva de granizo: como funciona a cobertura no seguro auto',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Enchente destrói móveis e eletrodomésticos: o que o seguro residencial cobre',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Sinistro de incêndio em galpão reacende debate sobre seguro empresarial',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Franquia reduzida: o que muda na apólice de quem tem rastreador instalado',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Motorista com bônus 10 pode perder classe na renovação; entenda a regra',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'RCTR-C e RCF-DC: as duas coberturas obrigatórias de quem transporta carga',
    categorias: ['Notícia', 'Transportes'],
    entra: true,
  },
  {
    titulo: 'Tombamento de carga em curva: quem responde pela indenização',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Assistência 24h passa a incluir reboque de caminhão em rodovia federal',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Furto de veículo em estacionamento privado tem cobertura? Depende da apólice',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Seguro de vida: por que a indenização atrasa quando falta documento',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Vistoria prévia volta a ser exigida para veículo com mais de dez anos',
    categorias: ['Notícia'],
    entra: true,
  },
  {
    titulo: 'Frota de caminhões: o que muda no seguro depois da nova regra de rastreamento',
    categorias: ['Notícia'],
    entra: true,
  },

  /* -------------- DEVEM SAIR: corretores, corretoras, comissão ----------- */
  {
    titulo: 'Corretor de seguros terá novo prazo para renovar o registro',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Comissão de corretagem em alta no seguro de transporte, aponta levantamento',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Corretoras ampliam venda digital de apólice de seguro auto',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },

  /* ---------------------- DEVEM SAIR: saúde e afins ---------------------- */
  {
    titulo: 'Plano de saúde tem reajuste autorizado pela ANS',
    categorias: ['Notícia', 'Saúde'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Seguro odontológico cresce entre empresas de médio porte',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Cobertura de seguro de vida em internação hospitalar entra em discussão',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
    /* fala de cobertura e de seguro de vida, que são termos de inclusão — e sai
       de qualquer forma, porque exclusão vence inclusão. Note que "hospitalar"
       precisa estar na lista: por limite de palavra, "hospital" não casa dentro
       de "hospitalar". */
  },
  {
    titulo: 'Medicina do trabalho e seguro de vida em grupo: o que muda na apólice',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },

  /* ---------------- DEVEM SAIR: notícia corporativa de mercado ------------ */
  {
    titulo: 'Seguradora anuncia lucro recorde no trimestre',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Balanço do setor mostra alta de prêmio emitido em seguro de cargas',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Grupo nomeia novo diretor de sinistros para a operação brasileira',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Ranking de market share em seguro auto tem mudança na liderança',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },
  {
    titulo: 'Fusão entre duas companhias muda o mapa do seguro empresarial',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'excluida',
  },

  /* --------- DEVEM SAIR: nenhum sinal de inclusão (assunto genérico) ------ */
  {
    titulo: 'Vendas do comércio crescem 2% no semestre, diz pesquisa',
    categorias: ['Notícia', 'Economia'],
    entra: false,
    motivo: 'sem-sinal-de-inclusao',
  },
  {
    titulo: 'Nova regra de trânsito muda a sinalização em rodovias estaduais',
    categorias: ['Notícia'],
    entra: false,
    motivo: 'sem-sinal-de-inclusao',
  },
  {
    titulo: 'Inteligência artificial automaticamente organiza documentos em cartórios',
    categorias: ['Notícia', 'Tecnologia'],
    entra: false,
    motivo: 'sem-sinal-de-inclusao',
  },
];

for (const caso of casos) {
  const veredito = avaliarNoticia({ titulo: caso.titulo, resumo: '', categorias: caso.categorias });
  const nome = `filtro: "${caso.titulo.slice(0, 62)}${caso.titulo.length > 62 ? '…' : ''}"`;

  conferir(
    nome,
    veredito.aprovada === caso.entra,
    `esperado ${caso.entra ? 'ENTRAR' : 'SAIR'}, veio ${veredito.aprovada ? 'ENTROU' : 'SAIU'} (${veredito.motivo}${veredito.termo ? `: "${veredito.termo}"` : ''})`,
  );

  if (!caso.entra && caso.motivo) {
    conferir(
      `${nome} → motivo`,
      veredito.motivo === caso.motivo,
      `esperado "${caso.motivo}", veio "${veredito.motivo}"`,
    );
  }
}

/* ========================================================================== */
/* 2. EXCLUSÃO VENCE INCLUSÃO, E LIMITE DE PALAVRA                            */
/* ========================================================================== */

conferir(
  'exclusão vence inclusão na mesma manchete',
  avaliarNoticia({
    titulo: 'Corretora explica como acionar a cobertura de granizo na apólice do seguro auto',
    categorias: [],
  }).aprovada === false,
);

conferir(
  '"saúde" (exclusão) NÃO barra "saudável"',
  avaliarNoticia({
    titulo: 'Frota saudável: manutenção preventiva reduz sinistro de caminhão',
    categorias: [],
  }).aprovada === true,
);

conferir(
  '"auto" (inclusão) NÃO casa dentro de "automaticamente"',
  avaliarNoticia({
    titulo: 'Sistema renova documentos automaticamente em órgãos públicos',
    categorias: [],
  }).motivo === 'sem-sinal-de-inclusao',
);

conferir(
  'acento e caixa são ignorados na comparação',
  avaliarNoticia({ titulo: 'INDENIZAÇÃO por ENCHENTE é paga em 30 dias', categorias: [] })
    .aprovada === true,
);

conferir(
  'termo com hífen: RCTR-C casa com "rctr c"',
  casaTermo(normalizarParaBusca('Cobertura RCTR-C obrigatória'), 'rctr c') === true,
);

conferir(
  'sem sinal de inclusão, nada entra (lista genérica vazia)',
  filtrarNoticias([{ titulo: 'Prefeitura anuncia obra na avenida central', categorias: [] }])
    .length === 0,
);

conferir(
  'filtrarNoticias preserva a ordem da fonte',
  (() => {
    const lista = [
      { titulo: 'Granizo danifica veículos; veja a cobertura', categorias: [] },
      { titulo: 'Corretor tem novo prazo', categorias: [] },
      { titulo: 'Roubo de carga na BR-277 e o seguro de transporte', categorias: [] },
    ];
    const r = filtrarNoticias(lista);
    return r.length === 2 && r[0] === lista[0] && r[1] === lista[2];
  })(),
);

conferir(
  'categorias podem ser desligadas do filtro (usarCategorias: false)',
  avaliarNoticia(
    { titulo: 'Granizo e a cobertura do seguro auto', categorias: ['Corretor'] },
    { usarCategorias: false },
  ).aprovada === true &&
    avaliarNoticia({ titulo: 'Granizo e a cobertura do seguro auto', categorias: ['Corretor'] })
      .aprovada === false,
);

/* ========================================================================== */
/* 3. TEXTO — entidades, HTML, CDATA, truncamento                             */
/* ========================================================================== */

conferir('entidade nomeada &amp;', decodificarEntidades('Seguro &amp; Proteção') === 'Seguro & Proteção');
conferir('entidade decimal &#8217;', decodificarEntidades('O&#8217;Brien') === 'O’Brien');
conferir('entidade hexadecimal &#x2019;', decodificarEntidades('O&#x2019;Brien') === 'O’Brien');
conferir('entidades tipográficas &ldquo; &rdquo;', decodificarEntidades('&ldquo;fim&rdquo;') === '“fim”');
conferir(
  'entidade desconhecida fica intacta',
  decodificarEntidades('&naoexiste; fim') === '&naoexiste; fim',
);
conferir(
  'HTML escapado vira texto puro',
  textoPuro('&lt;p&gt;Granizo &amp;#8211; cobertura&lt;/p&gt;').includes('Granizo'),
);
conferir(
  'CDATA + HTML cru vira texto puro',
  textoPuro('<![CDATA[<p>Chuva de <strong>granizo</strong> em Cascavel</p>]]>') ===
    'Chuva de granizo em Cascavel',
);
conferir('script é removido com o conteúdo', textoPuro('<script>alert(1)</script>Texto') === 'Texto');
conferir(
  'cauda "Continue lendo" sai do resumo',
  resumoPuro('<p>Texto do resumo. Continue lendo em nosso site</p>') === 'Texto do resumo.',
);
conferir(
  'cauda "[…]" do WordPress sai do resumo',
  resumoPuro('<p>Texto cortado pelo WordPress […]</p>') === 'Texto cortado pelo WordPress',
);
conferir(
  'truncamento respeita o fim da palavra',
  (() => {
    const r = truncarPorPalavra('cobertura de granizo para veículos particulares', 20);
    return r.endsWith('…') && !r.includes('grani…') && r.length <= 22;
  })(),
);
conferir(
  'texto curto não é truncado',
  truncarPorPalavra('Resumo curto.', 180) === 'Resumo curto.',
);
conferir('data RFC 822 → ISO', dataIso('Tue, 26 Aug 2025 14:32:07 +0000') === '2025-08-26T14:32:07.000Z');
conferir('data ilegível → null', dataIso('ontem à tarde') === null);

/* ========================================================================== */
/* 4. PARSER DE RSS 2.0 (WordPress)                                           */
/* ========================================================================== */

/* Feed de TESTE, escrito à mão para exercitar o parser: CDATA, <category>
   repetido, <content:encoded>, <media:thumbnail>, <enclosure>, acentuação,
   entidades e um item quebrado (sem link) que precisa ser descartado. */
const FEED_TESTE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Feed de teste</title>
  <link>https://cqcs.com.br</link>
  <item>
    <title><![CDATA[Chuva de granizo &#8211; o que a cobertura do seguro auto paga]]></title>
    <link>https://cqcs.com.br/2026/08/granizo-cobertura/</link>
    <pubDate>Thu, 28 Aug 2026 11:05:00 +0000</pubDate>
    <dc:creator><![CDATA[Redação]]></dc:creator>
    <category><![CDATA[Notícia]]></category>
    <category><![CDATA[Seguro Auto]]></category>
    <category><![CDATA[Prevenção]]></category>
    <description><![CDATA[<p>A cobertura de granizo é opcional em boa parte das ap&oacute;lices &#8212; e muda de pre&ccedil;o conforme a regi&atilde;o.</p>
Continue lendo]]></description>
    <content:encoded><![CDATA[<p>Texto completo, com <img src="https://cqcs.com.br/wp-content/uploads/2026/08/granizo.jpg" alt="" /> no meio.</p>]]></content:encoded>
    <media:thumbnail url="https://cqcs.com.br/wp-content/uploads/2026/08/granizo-150x150.jpg" />
  </item>
  <item>
    <title>Roubo de carga: seguro de transporte &amp; gerenciamento de risco</title>
    <link>https://cqcs.com.br/2026/08/roubo-de-carga/</link>
    <pubDate>Wed, 27 Aug 2026 09:41:12 +0000</pubDate>
    <category>Notícia</category>
    <description>&lt;p&gt;O n&amp;uacute;mero de ocorr&amp;ecirc;ncias subiu na regi&amp;atilde;o.&lt;/p&gt;</description>
    <enclosure url="https://cqcs.com.br/wp-content/uploads/2026/08/carga.jpg" length="84213" type="image/jpeg" />
  </item>
  <item>
    <title><![CDATA[Corretor de seguros terá novo prazo de registro]]></title>
    <link>https://cqcs.com.br/2026/08/corretor-prazo/</link>
    <pubDate>Wed, 27 Aug 2026 08:00:00 +0000</pubDate>
    <category><![CDATA[Corretor]]></category>
    <description><![CDATA[<p>Prazo prorrogado.</p>]]></description>
  </item>
  <item>
    <title><![CDATA[Item quebrado, sem link]]></title>
    <pubDate>Wed, 27 Aug 2026 07:00:00 +0000</pubDate>
    <description><![CDATA[<p>Não deve entrar.</p>]]></description>
  </item>
  <item>
    <title><![CDATA[Sinistro em galp&atilde;o e a imagem s&oacute; no conte&uacute;do]]></title>
    <link>https://cqcs.com.br/2026/08/galpao/</link>
    <pubDate>Tue, 26 Aug 2026 18:20:00 +0000</pubDate>
    <category><![CDATA[Notícia]]></category>
    <description><![CDATA[<p>Incêndio destruiu parte do estoque; a apólice do seguro empresarial estava em vigor.</p>]]></description>
    <content:encoded><![CDATA[<p><img src="https://cqcs.com.br/wp-content/uploads/2026/08/galpao.jpg" /> Texto.</p>]]></content:encoded>
  </item>
  <item>
    <title><![CDATA[Imagem de host n&atilde;o autorizado]]></title>
    <link>https://cqcs.com.br/2026/08/host-estranho/</link>
    <pubDate>Tue, 26 Aug 2026 10:00:00 +0000</pubDate>
    <category><![CDATA[Notícia]]></category>
    <description><![CDATA[<p>Enchente e alagamento: como acionar a cobertura.</p>]]></description>
    <media:thumbnail url="https://cdn-desconhecido.example.com/foto.jpg" />
  </item>
</channel>
</rss>`;

const doFeed = parseRss(FEED_TESTE);

conferir('RSS: 5 itens legíveis (o sem link é descartado)', doFeed.length === 5, `veio ${doFeed.length}`);
conferir(
  'RSS: CDATA e entidade no título',
  doFeed[0]?.titulo === 'Chuva de granizo – o que a cobertura do seguro auto paga',
  `veio "${doFeed[0]?.titulo}"`,
);
conferir(
  'RSS: <category> múltiplos viram lista',
  JSON.stringify(doFeed[0]?.categorias) === JSON.stringify(['Notícia', 'Seguro Auto', 'Prevenção']),
  `veio ${JSON.stringify(doFeed[0]?.categorias)}`,
);
conferir(
  'RSS: acentuação por entidade no resumo',
  doFeed[0]?.resumo.includes('apólices') && doFeed[0]?.resumo.includes('região'),
  `veio "${doFeed[0]?.resumo}"`,
);
conferir(
  'RSS: cauda "Continue lendo" não sobra no resumo',
  !/continue lendo/i.test(doFeed[0]?.resumo ?? ''),
);
conferir('RSS: pubDate → ISO', doFeed[0]?.publicadoEm === '2026-08-28T11:05:00.000Z');
conferir(
  'RSS: media:thumbnail é a primeira escolha de imagem',
  doFeed[0]?.imagem === 'https://cqcs.com.br/wp-content/uploads/2026/08/granizo-150x150.jpg',
);
conferir(
  'RSS: entidade dupla (&amp;uacute;) no resumo escapado',
  doFeed[1]?.resumo === 'O número de ocorrências subiu na região.',
  `veio "${doFeed[1]?.resumo}"`,
);
conferir(
  'RSS: enclosure de imagem serve de miniatura',
  doFeed[1]?.imagem === 'https://cqcs.com.br/wp-content/uploads/2026/08/carga.jpg',
);
conferir(
  'RSS: primeira <img> do content:encoded serve de miniatura',
  doFeed[3]?.imagem === 'https://cqcs.com.br/wp-content/uploads/2026/08/galpao.jpg',
  `veio "${doFeed[3]?.imagem}"`,
);
conferir('RSS: imagem de host não autorizado é descartada', doFeed[4]?.imagem === null);
conferir('RSS: nenhum item traz "<" no texto', doFeed.every((n) => !n.titulo.includes('<') && !n.resumo.includes('<')));
conferir('RSS: feed vazio não quebra o parser', parseRss('<rss><channel></channel></rss>').length === 0);
conferir('RSS: HTML no lugar do XML não quebra o parser', parseRss('<html><body>403</body></html>').length === 0);

/* O parser + o filtro juntos: é este o resultado que chega à seção. */
const aprovadas = filtrarNoticias(doFeed);
conferir(
  'feed de teste → filtro: o item do corretor é o único de seguro barrado',
  aprovadas.length === 4 && !aprovadas.some((n) => /corretor/i.test(n.titulo)),
  `entraram ${aprovadas.length}: ${aprovadas.map((n) => n.titulo.slice(0, 30)).join(' | ')}`,
);

/* ========================================================================== */
/* 5. PARSER DA API REST DO WORDPRESS                                         */
/* ========================================================================== */

const WP_TESTE = JSON.stringify([
  {
    link: 'https://cqcs.com.br/2026/08/franquia/',
    date_gmt: '2026-08-28T11:05:00',
    title: { rendered: 'Franquia reduzida na ap&oacute;lice de quem instala rastreador' },
    excerpt: { rendered: '<p>Entenda a conta que a seguradora faz [&hellip;]</p>' },
    _embedded: {
      'wp:featuredmedia': [{ source_url: 'https://cqcs.com.br/wp-content/uploads/f.jpg' }],
      'wp:term': [[{ taxonomy: 'category', name: 'Notícia' }], [{ taxonomy: 'post_tag', name: 'auto' }]],
    },
  },
  { link: 'https://cqcs.com.br/sem-titulo/', title: { rendered: '' } },
]);

const doWp = parseWpJson(WP_TESTE);
conferir('WP-JSON: item sem título é descartado', doWp.length === 1, `veio ${doWp.length}`);
conferir(
  'WP-JSON: entidade no título',
  doWp[0]?.titulo === 'Franquia reduzida na apólice de quem instala rastreador',
  `veio "${doWp[0]?.titulo}"`,
);
conferir('WP-JSON: date_gmt vira ISO em UTC', doWp[0]?.publicadoEm === '2026-08-28T11:05:00.000Z');
conferir(
  'WP-JSON: imagem destacada do _embed',
  doWp[0]?.imagem === 'https://cqcs.com.br/wp-content/uploads/f.jpg',
);
conferir(
  'WP-JSON: só a taxonomia "category" entra nas categorias',
  JSON.stringify(doWp[0]?.categorias) === JSON.stringify(['Notícia']),
  `veio ${JSON.stringify(doWp[0]?.categorias)}`,
);
conferir('WP-JSON: JSON inválido não quebra o parser', parseWpJson('403 Forbidden').length === 0);
conferir('WP-JSON: objeto no lugar do array não quebra', parseWpJson('{"erro":true}').length === 0);

/* ========================================================================== */
/* 6. CACHE — o intervalo pedido pela corretora                               */
/* ========================================================================== */

conferir(
  'intervalo configurado é de 1 hora',
  config.news.intervaloHoras === 1,
  `veio ${config.news.intervaloHoras}`,
);
conferir(
  'o revalidate do fetch é 3600s (uma hora)',
  /next:\s*\{\s*revalidate:\s*REVALIDATE_SEGUNDOS\s*\}/.test(
    readFileSync(resolve(raiz, 'src/services/news.ts'), 'utf8'),
  ) && Math.round(config.news.intervaloHoras * 3600) === 3600,
);

/* ========================================================================== */
/* PLACAR FINAL                                                               */
/* ========================================================================== */

const total = ok + falhas.length;
console.log('');
console.log('  Verificação do filtro e do parser de notícias');
console.log('  ' + '─'.repeat(58));
console.log(`  manchetes de teste no filtro: ${casos.length}`);
console.log(`  verificações executadas:      ${total}`);
console.log(`  aprovadas:                    ${ok}`);
console.log(`  falhas:                       ${falhas.length}`);

if (falhas.length) {
  console.log('');
  for (const f of falhas) console.log(`  ✗ ${f}`);
  console.log('');
  process.exit(1);
}

console.log('');
console.log('  ✓ tudo certo.');
console.log('');
