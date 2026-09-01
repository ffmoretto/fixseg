/**
 * =============================================================================
 * NOTÍCIAS DE SEGUROS — adaptador server-side (feed RSS / API REST WordPress)
 * =============================================================================
 * Mesmo princípio do adaptador das avaliações do Google
 * (src/services/googleReviews.ts) e do serviço de leads: a integração externa
 * fica isolada atrás de um adaptador, roda SOMENTE no servidor e o resto do
 * site conversa com um tipo próprio do projeto.
 *
 *   Home (Server Component) → fetchNoticias() → feed do CQCS
 *                                    ↓
 *                        <Blog noticias={…} />   (renderiza texto puro)
 *
 * Regras que este arquivo garante:
 *
 *  1. ATUALIZAÇÃO AUTOMÁTICA DE HORA EM HORA. É o `next: { revalidate }` do
 *     `fetch` que faz isso — uma consulta por hora no máximo, servida do cache
 *     do Next para todas as visitas do intervalo. Sem cron, sem worker.
 *     O número vem de `news.intervaloHoras` (src/config/news.ts).
 *  2. NUNCA LANÇA. Feed fora do ar, 403, HTML no lugar de XML, JSON inválido:
 *     devolve lista vazia, registra o motivo no log do servidor e a seção não é
 *     renderizada. A home não pode cair por causa de um portal de terceiro.
 *  3. TENTATIVA EM CASCATA. Primeiro o RSS da categoria; se falhar, a API REST
 *     do WordPress. Se as duas falharem, lista vazia.
 *  4. CONTEÚDO DE TERCEIRO É DADO, NUNCA HTML. O resumo é convertido em texto
 *     puro aqui, no servidor. Nada de `dangerouslySetInnerHTML` na seção.
 *  5. SEM DEPENDÊNCIA NOVA. O parser de RSS é próprio: feed de WordPress é
 *     previsível, e trazer um pacote de XML para ler quatro campos seria
 *     desproporcional. `scripts/verificar-noticias.mjs` exercita o parser.
 *
 * ⚠️ VALIDAÇÃO PENDENTE: o feed do CQCS responde 403 ao ambiente onde este
 * código foi escrito (proteção antibot contra IP de datacenter). O adaptador
 * foi testado contra uma fixture local que imita um feed RSS 2.0 de WordPress,
 * não contra o CQCS ao vivo. Ver seção 5 do README.
 * =============================================================================
 */

import { fonte, hostsDeImagem, news, termosExcluidos, termosIncluidos } from '@/config/news';

/* -------------------------------------------------------------------------- */
/* TIPO PRÓPRIO DO PROJETO                                                    */
/* -------------------------------------------------------------------------- */

export interface Noticia {
  /** Manchete, em texto puro. */
  titulo: string;
  /** Primeiras linhas da notícia, em texto puro, truncadas em fim de palavra. */
  resumo: string;
  /** Link para o artigo ORIGINAL na fonte. Nunca uma cópia local. */
  url: string;
  /** Data de publicação em ISO 8601. Vazia quando o feed não informa. */
  publicadoEm: string | null;
  /** Miniatura, se a fonte oferecer e o host estiver autorizado. */
  imagem: string | null;
  /** Categorias declaradas pela fonte, usadas pelo filtro. */
  categorias: string[];
}

/** O que a seção recebe quando não há notícia aprovada. */
export const SEM_NOTICIAS: Noticia[] = [];

/* -------------------------------------------------------------------------- */
/* CACHE — o mecanismo de atualização automática                              */
/* -------------------------------------------------------------------------- */

/**
 * Uma hora, em segundos (`news.intervaloHoras` = 1 → 3600).
 *
 * ESTA é a peça que atende ao "atualize automaticamente de hora em hora" do
 * pedido: o Next guarda a resposta e só vai ao portal de novo depois que o
 * prazo expira, na primeira visita seguinte. Mil visitas na mesma hora = uma
 * requisição ao CQCS.
 */
const REVALIDATE_SEGUNDOS = Math.max(60, Math.round(news.intervaloHoras * 3600));

/**
 * Cabeçalhos de uma requisição HTTP honesta.
 *
 * Muitos WordPress (e quase todo CDN na frente deles) recusam requisição sem
 * `User-Agent` e sem `Accept`. Isto NÃO é disfarce: o agente se identifica como
 * o site da FIXSEG, com endereço de contato, que é a prática recomendada para
 * quem consome feed alheio. Nenhum cookie, nenhum token, nenhuma tentativa de
 * parecer usuário logado ou de contornar proteção.
 */
const CABECALHOS: Record<string, string> = {
  'User-Agent':
    'FixsegSiteBot/1.0 (+https://fixsegcorretora.com.br; leitor de feed RSS institucional)',
  Accept:
    'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml;q=0.9, application/json;q=0.8, text/xml;q=0.8, */*;q=0.5',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

/** Limite de corpo lido da fonte, para não engolir um HTML de erro gigante. */
const MAX_CORPO = 2_000_000;

/* -------------------------------------------------------------------------- */
/* TEXTO — entidades, HTML, CDATA, truncamento                                */
/* -------------------------------------------------------------------------- */

/** Entidades nomeadas que aparecem de fato em feed de portal brasileiro. */
const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  bull: '•',
  middot: '·',
  deg: '°',
  euro: '€',
  pound: '£',
  copy: '©',
  reg: '®',
  trade: '™',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  agrave: 'à',
  eacute: 'é',
  ecirc: 'ê',
  iacute: 'í',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  uacute: 'ú',
  ccedil: 'ç',
  Aacute: 'Á',
  Acirc: 'Â',
  Atilde: 'Ã',
  Eacute: 'É',
  Ecirc: 'Ê',
  Iacute: 'Í',
  Oacute: 'Ó',
  Ocirc: 'Ô',
  Otilde: 'Õ',
  Uacute: 'Ú',
  Ccedil: 'Ç',
};

/** `&amp;`, `&#8217;`, `&#x2019;` → o caractere correspondente. */
export function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});/g, (todo, corpo: string) => {
    if (corpo[0] === '#') {
      const hex = corpo[1] === 'x' || corpo[1] === 'X';
      const numero = Number.parseInt(hex ? corpo.slice(2) : corpo.slice(1), hex ? 16 : 10);
      if (!Number.isFinite(numero) || numero <= 0 || numero > 0x10ffff) return todo;
      try {
        return String.fromCodePoint(numero);
      } catch {
        return todo;
      }
    }
    return Object.prototype.hasOwnProperty.call(ENTIDADES, corpo) ? ENTIDADES[corpo] : todo;
  });
}

/** Remove o invólucro `<![CDATA[ … ]]>`, que o WordPress usa em quase tudo. */
export function limparCdata(texto: string): string {
  return texto.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

/**
 * Conteúdo de terceiro → TEXTO PURO.
 *
 * A ordem importa. O WordPress entrega o resumo de duas formas: HTML cru dentro
 * de CDATA, ou HTML escapado (`&lt;p&gt;…`). Decodificar → remover tags →
 * decodificar de novo cobre as duas sem precisar saber qual chegou.
 */
export function textoPuro(bruto: string): string {
  let t = limparCdata(bruto);
  t = decodificarEntidades(t);
  /* script/style morrem com o conteúdo; o resto vira espaço */
  t = t.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  t = t.replace(/<br\s*\/?>/gi, ' ').replace(/<\/(p|div|li|h[1-6])>/gi, ' ');
  t = t.replace(/<[^>]*>/g, '');
  t = decodificarEntidades(t);
  return (
    t
      /* caracteres de controle que às vezes vêm colados no texto de terceiro */
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Igual a `textoPuro`, mais a remoção das caudas que o WordPress cola no fim do
 * resumo ("Continue lendo…", "The post … appeared first on …"). Não se aplica ao
 * TÍTULO: uma manchete pode legitimamente conter "Leia também".
 */
export function resumoPuro(bruto: string): string {
  return textoPuro(bruto)
    .replace(/\s*\[[…\.\s]+\]\s*$/, '')
    .replace(/\s*(continue lendo|leia mais|leia tamb[eé]m|saiba mais|the post|o post)\b[\s\S]*$/i, '')
    .replace(/[\s\u2026]+$/, '')
    .trim();
}

/** Corta no fim da palavra e fecha com reticências. Nunca no meio de palavra. */
export function truncarPorPalavra(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max + 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  const base = ultimoEspaco > Math.floor(max * 0.5) ? corte.slice(0, ultimoEspaco) : corte.slice(0, max);
  return `${base.replace(/[\s.,;:!?"'‘’“”–—-]+$/, '')}…`;
}

/* -------------------------------------------------------------------------- */
/* PARSER DE RSS — sem dependência nova                                       */
/* -------------------------------------------------------------------------- */

/** Escapa um nome de tag para uso em expressão regular. */
function tagRegex(tag: string, flags: string): RegExp {
  const t = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}\\s*>`, flags);
}

/** Todos os conteúdos de `<tag>…</tag>`, na ordem em que aparecem. */
export function extrairTodos(xml: string, tag: string): string[] {
  const re = tagRegex(tag, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

/** O primeiro `<tag>…</tag>`, já como texto puro. Vazio se não existir. */
export function extrairUm(xml: string, tag: string): string {
  const m = tagRegex(tag, 'i').exec(xml);
  return m ? textoPuro(m[1]) : '';
}

/**
 * Valor de um atributo em tag vazia: `<media:thumbnail url="…" />`,
 * `<enclosure url="…" type="image/jpeg" />`, `<img src="…">`.
 */
export function extrairAtributo(xml: string, tag: string, atributo: string): string | null {
  const t = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${t}\\b[^>]*?\\b${atributo}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
  const m = re.exec(xml);
  const valor = m ? (m[1] ?? m[2]) : null;
  return valor ? decodificarEntidades(valor).trim() : null;
}

/** Data do feed (RFC 822 ou ISO) → ISO 8601. `null` quando não dá para ler. */
export function dataIso(bruta: string): string | null {
  const t = bruta.trim();
  if (!t) return null;
  const ms = Date.parse(t);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

/** Aceita só URL http(s) de host autorizado (ver `hostsDeImagem`). */
function imagemSegura(valor: string | null): string | null {
  if (!valor) return null;
  try {
    const u = new URL(valor);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!hostsDeImagem.includes(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Aceita só URL https do artigo. http é rejeitado: link de saída é https. */
function urlDoArtigo(valor: string): string | null {
  const t = valor.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Feed RSS 2.0 (ou Atom) → lista de notícias normalizadas.
 *
 * Tudo é tolerante a ausência: um `<item>` sem título ou sem link é descartado,
 * um `<item>` sem data ou sem imagem entra sem eles.
 */
export function parseRss(xml: string): Noticia[] {
  /* `<item>` é RSS; `<entry>` é Atom. Alguns portais servem os dois. */
  const blocos = [...extrairTodos(xml, 'item'), ...extrairTodos(xml, 'entry')];

  return blocos
    .map((bloco): Noticia | null => {
      const titulo = extrairUm(bloco, 'title');

      /* No Atom o link é atributo; no RSS é conteúdo da tag. */
      const linkBruto = extrairUm(bloco, 'link') || extrairAtributo(bloco, 'link', 'href') || '';
      const url = urlDoArtigo(linkBruto);
      if (!titulo || !url) return null;

      const conteudo = extrairTodos(bloco, 'content:encoded')[0] ?? '';
      const descricao = extrairTodos(bloco, 'description')[0] ?? extrairTodos(bloco, 'summary')[0] ?? '';

      const resumoBruto = resumoPuro(descricao) || resumoPuro(conteudo);

      /* Miniatura, em ordem de confiança: media:thumbnail → media:content →
         enclosure de imagem → primeira <img> do conteúdo. */
      const imagem =
        imagemSegura(extrairAtributo(bloco, 'media:thumbnail', 'url')) ??
        imagemSegura(extrairAtributo(bloco, 'media:content', 'url')) ??
        imagemSegura(extrairAtributo(bloco, 'enclosure', 'url')) ??
        imagemSegura(extrairAtributo(limparCdata(conteudo), 'img', 'src'));

      const categorias = extrairTodos(bloco, 'category')
        .map((c) => textoPuro(c))
        .filter(Boolean)
        .slice(0, 12);

      return {
        titulo,
        resumo: truncarPorPalavra(resumoBruto, news.tamanhoDoResumo),
        url,
        publicadoEm:
          dataIso(extrairUm(bloco, 'pubDate')) ??
          dataIso(extrairUm(bloco, 'dc:date')) ??
          dataIso(extrairUm(bloco, 'published')) ??
          dataIso(extrairUm(bloco, 'updated')),
        imagem,
        categorias,
      };
    })
    .filter((n): n is Noticia => n !== null);
}

/* -------------------------------------------------------------------------- */
/* PARSER DA API REST DO WORDPRESS (alternativa quando o RSS falha)           */
/* -------------------------------------------------------------------------- */

interface WpRendered {
  rendered?: unknown;
}

interface WpTermo {
  taxonomy?: unknown;
  name?: unknown;
}

interface WpPost {
  link?: unknown;
  date_gmt?: unknown;
  date?: unknown;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: unknown }>;
    'wp:term'?: WpTermo[][];
  };
}

function renderizado(campo: WpRendered | undefined): string {
  return typeof campo?.rendered === 'string' ? resumoPuro(campo.rendered) : '';
}

/** Resposta de `/wp-json/wp/v2/posts?_embed` → lista de notícias. */
export function parseWpJson(corpo: string): Noticia[] {
  let dados: unknown;
  try {
    dados = JSON.parse(corpo);
  } catch {
    return [];
  }
  if (!Array.isArray(dados)) return [];

  return (dados as WpPost[])
    .map((post): Noticia | null => {
      const titulo = renderizado(post.title);
      const url = typeof post.link === 'string' ? urlDoArtigo(post.link) : null;
      if (!titulo || !url) return null;

      const resumoBruto = renderizado(post.excerpt) || renderizado(post.content);

      const midia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
      const imagem = imagemSegura(typeof midia === 'string' ? midia : null);

      const categorias = (post._embedded?.['wp:term'] ?? [])
        .flat()
        .filter((t) => t && t.taxonomy === 'category' && typeof t.name === 'string')
        .map((t) => textoPuro(String(t.name)))
        .filter(Boolean)
        .slice(0, 12);

      const dataBruta =
        typeof post.date_gmt === 'string'
          ? `${post.date_gmt}Z`.replace(/Z+$/, 'Z')
          : typeof post.date === 'string'
            ? post.date
            : '';

      return {
        titulo,
        resumo: truncarPorPalavra(resumoBruto, news.tamanhoDoResumo),
        url,
        publicadoEm: dataIso(dataBruta),
        imagem,
        categorias,
      };
    })
    .filter((n): n is Noticia => n !== null);
}

/* -------------------------------------------------------------------------- */
/* O FILTRO — função pura, sem rede, sem estado                               */
/* -------------------------------------------------------------------------- */

/**
 * Texto comparável: sem acento, sem caixa, sem pontuação, com um espaço em cada
 * ponta.
 *
 * As bordas são o truque que dá o "limite de palavra" de graça: com o texto e o
 * termo normalizados do mesmo jeito, `texto.includes(' ' + termo + ' ')` só casa
 * palavra inteira. É por isso que "saude" não barra "saudável" e "auto" não casa
 * dentro de "automaticamente" — e, de brinde, termos de várias palavras
 * ("plano de saude") e com hífen ("RCTR-C" → "rctr c") funcionam sem caso
 * especial.
 */
export function normalizarParaBusca(texto: string): string {
  return ` ${texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

/** true se o texto normalizado contém o termo como palavra (ou frase) inteira. */
export function casaTermo(textoNormalizado: string, termo: string): boolean {
  const t = normalizarParaBusca(termo).trim();
  return t.length > 0 && textoNormalizado.includes(` ${t} `);
}

/** Primeiro termo da lista que casa com o texto, ou null. */
function primeiroQueCasa(textoNormalizado: string, termos: readonly string[]): string | null {
  for (const termo of termos) if (casaTermo(textoNormalizado, termo)) return termo;
  return null;
}

export interface OpcoesDoFiltro {
  excluir?: readonly string[];
  incluir?: readonly string[];
  /** Considerar as categorias do feed além do título e do resumo. */
  usarCategorias?: boolean;
}

export interface Veredito {
  aprovada: boolean;
  /** Por que entrou ou por que saiu — legível, para log e para os testes. */
  motivo: 'excluida' | 'sem-sinal-de-inclusao' | 'aprovada';
  /** O termo que decidiu. null quando nenhum sinal de inclusão foi encontrado. */
  termo: string | null;
}

/** O que o filtro precisa ler. Um `Noticia` serve; um objeto solto também. */
export interface Filtravel {
  titulo: string;
  resumo?: string;
  categorias?: string[];
}

/**
 * A decisão, para UMA notícia. Pura: mesma entrada, mesma saída, sempre.
 *
 * A ordem é o coração do pedido da corretora:
 *
 *   1. Casou com termo de EXCLUSÃO?  → fora, e ponto. Exclusão vence inclusão,
 *      mesmo que a notícia também fale de seguro.
 *   2. Não casou com nenhum termo de INCLUSÃO? → fora. Sem sinal positivo nada
 *      entra, o que impede assunto genérico de vazar para a seção.
 *   3. Só então entra.
 */
export function avaliarNoticia(noticia: Filtravel, opcoes: OpcoesDoFiltro = {}): Veredito {
  const excluir = opcoes.excluir ?? termosExcluidos;
  const incluir = opcoes.incluir ?? termosIncluidos;
  const usarCategorias = opcoes.usarCategorias ?? news.usarCategoriasNoFiltro;

  const partes = [noticia.titulo, noticia.resumo ?? ''];
  if (usarCategorias) partes.push((noticia.categorias ?? []).join(' '));

  const texto = normalizarParaBusca(partes.join(' '));

  const excluido = primeiroQueCasa(texto, excluir);
  if (excluido) return { aprovada: false, motivo: 'excluida', termo: excluido };

  const incluido = primeiroQueCasa(texto, incluir);
  if (!incluido) return { aprovada: false, motivo: 'sem-sinal-de-inclusao', termo: null };

  return { aprovada: true, motivo: 'aprovada', termo: incluido };
}

/**
 * Aplica `avaliarNoticia` à lista, preservando a ordem da fonte (mais recente
 * primeiro, como o WordPress entrega).
 */
export function filtrarNoticias<T extends Filtravel>(lista: T[], opcoes: OpcoesDoFiltro = {}): T[] {
  return lista.filter((n) => avaliarNoticia(n, opcoes).aprovada);
}

/* -------------------------------------------------------------------------- */
/* BUSCA                                                                      */
/* -------------------------------------------------------------------------- */

interface Endpoint {
  rotulo: string;
  url: string;
  tipo: 'rss' | 'wp-json';
}

/**
 * Os endereços tentados, EM ORDEM. O primeiro que devolver notícia ganha.
 *
 *  1. o feed RSS da categoria — leve, estável, é o contrato público do portal;
 *  2. a API REST do WordPress — alternativa quando o feed está desligado por
 *     plugin de cache ou de segurança. `_embed` traz a imagem destacada e as
 *     categorias na mesma resposta, o que evita N requisições.
 */
export function endpointsDeNoticias(): Endpoint[] {
  const lista: Endpoint[] = [{ rotulo: 'feed RSS da categoria', url: fonte.feed, tipo: 'rss' }];

  try {
    const base = new URL(fonte.feed);
    const api = new URL('/wp-json/wp/v2/posts', base.origin);
    api.searchParams.set('_embed', '1');
    api.searchParams.set('per_page', String(news.buscarAteItens));
    lista.push({ rotulo: 'API REST do WordPress', url: api.toString(), tipo: 'wp-json' });
  } catch {
    /* feed com URL inválida: sobra só a primeira tentativa, que vai falhar
       e cair no aviso de log — que é exatamente o diagnóstico desejado. */
  }

  return lista;
}

/**
 * Busca as notícias da fonte, filtra e devolve no máximo `news.maximo`.
 *
 * Executa apenas no servidor. NUNCA lança: qualquer problema devolve lista
 * vazia e registra o motivo com `console.warn`, para quem publica o site ter
 * diagnóstico. O visitante não vê estado de erro — a seção simplesmente não é
 * renderizada.
 */
export async function fetchNoticias(): Promise<Noticia[]> {
  if (!news.ativo) return SEM_NOTICIAS;

  const falhas: string[] = [];

  for (const endpoint of endpointsDeNoticias()) {
    try {
      const res = await fetch(endpoint.url, {
        headers: CABECALHOS,
        /* ── A ATUALIZAÇÃO AUTOMÁTICA DE HORA EM HORA MORA NESTA LINHA ── */
        next: { revalidate: REVALIDATE_SEGUNDOS },
      });

      if (!res.ok) {
        falhas.push(`${endpoint.rotulo} respondeu ${res.status}`);
        continue;
      }

      const corpo = (await res.text()).slice(0, MAX_CORPO);
      const brutas = endpoint.tipo === 'rss' ? parseRss(corpo) : parseWpJson(corpo);

      if (!brutas.length) {
        falhas.push(`${endpoint.rotulo} respondeu 200 sem nenhuma notícia legível`);
        continue;
      }

      const aprovadas = filtrarNoticias(brutas.slice(0, news.buscarAteItens)).slice(0, news.maximo);

      if (!aprovadas.length) {
        console.warn(
          `[FIXSEG] ${fonte.nome}: ${brutas.length} notícia(s) lidas do ${endpoint.rotulo}, ` +
            'nenhuma passou pelo filtro de assunto (ver termosIncluidos / termosExcluidos em ' +
            'src/config/news.ts). A seção de notícias não será exibida.',
        );
        return SEM_NOTICIAS;
      }

      return aprovadas;
    } catch (erro) {
      falhas.push(`${endpoint.rotulo} falhou: ${erro instanceof Error ? erro.message : String(erro)}`);
    }
  }

  console.warn(
    `[FIXSEG] Não foi possível obter as notícias de ${fonte.nome}. A seção não será exibida. ` +
      `Tentativas: ${falhas.join(' | ')}`,
  );
  return SEM_NOTICIAS;
}
