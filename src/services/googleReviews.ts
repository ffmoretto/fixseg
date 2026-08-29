/**
 * =============================================================================
 * AVALIAÇÕES DO GOOGLE — adaptador server-side (Places API New)
 * =============================================================================
 * Mesmo princípio do serviço de leads (src/services/leads.ts): a integração
 * externa fica isolada atrás de um adaptador, o segredo existe SOMENTE no
 * servidor e o resto do site conversa com um tipo próprio do projeto.
 *
 *   Componente de servidor  →  fetchGoogleReviews()  →  Places API (New)
 *
 * Regras que este arquivo garante:
 *
 *  1. A chave NUNCA vai para o navegador. Ela mora em `GOOGLE_PLACES_API_KEY`
 *     (sem o prefixo NEXT_PUBLIC_) e só é lida aqui, em código de servidor.
 *  2. Sem chave, sem Place ID ou com qualquer falha de rede, a função devolve
 *     o resultado VAZIO. A seção some, a página continua de pé e nenhuma
 *     avaliação é inventada.
 *  3. Cache obrigatório. O Google cobra por chamada e devolve no máximo 5
 *     avaliações por consulta — `next: { revalidate }` mantém uma requisição a
 *     cada seis horas, não uma por visita.
 *  4. O texto da avaliação é conteúdo de terceiro: aqui ele é limpo (controles,
 *     espaços) e truncado, e na tela é renderizado como TEXTO PURO, nunca HTML.
 *
 * Como ligar: veja o passo a passo na seção 5 do README.
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/* TIPO PRÓPRIO DO PROJETO                                                    */
/* -------------------------------------------------------------------------- */

export interface GoogleReview {
  /** Nome de quem avaliou, como exibido no perfil do Google. */
  autor: string;
  /** URL da foto do autor (hospedada pelo Google). Vazio = usar a inicial. */
  foto: string | null;
  /** Nota de 1 a 5. */
  nota: number;
  /** Texto da avaliação, já limpo. Pode ser vazio (avaliação só com nota). */
  texto: string;
  /** "há 2 semanas" — descrição relativa, em português, vinda do próprio Google. */
  quando: string;
  /** Link para a avaliação / perfil do autor no Google. */
  url: string | null;
}

export interface GoogleReviewsResult {
  /** Avaliações reais retornadas pela API (no máximo 5, limite do Google). */
  avaliacoes: GoogleReview[];
  /** Nota média do perfil. null quando não há avaliação. */
  notaMedia: number | null;
  /** Quantidade TOTAL de avaliações do perfil (maior que a lista acima). */
  totalAvaliacoes: number;
  /** Link do perfil no Google Maps, para "ver todas no Google". */
  googleMapsUri: string | null;
}

/** Resultado vazio — o que a seção recebe quando não há integração ativa. */
export const SEM_AVALIACOES: GoogleReviewsResult = {
  avaliacoes: [],
  notaMedia: null,
  totalAvaliacoes: 0,
  googleMapsUri: null,
};

/* -------------------------------------------------------------------------- */
/* CONFIGURAÇÃO                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Seis horas. Cache não é otimização aqui, é requisito: cada chamada é cobrada
 * e a API devolve no máximo 5 avaliações, que mudam com pouca frequência.
 */
const REVALIDATE_SEGUNDOS = 6 * 60 * 60;

/**
 * Endpoint da Places API (New). A variável de ambiente existe apenas para
 * apontar o adaptador a um servidor local durante testes — em produção deixe
 * em branco e o valor oficial do Google é usado.
 */
const ENDPOINT = process.env.GOOGLE_PLACES_ENDPOINT || 'https://places.googleapis.com/v1/places';

/**
 * Só pedimos os campos que a seção realmente usa. A Places API cobra por
 * "SKU" conforme a máscara de campos: pedir tudo custa mais caro sem motivo.
 */
const FIELD_MASK = 'rating,userRatingCount,reviews,googleMapsUri';

/**
 * Hosts aceitos para a foto do autor. Serve para não deixar uma URL arbitrária
 * de terceiro entrar no otimizador de imagens do Next. A mesma lista está em
 * `next.config.mjs` → `images.remotePatterns`; as duas precisam combinar.
 */
const HOSTS_DE_FOTO = [
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'streetviewpixels-pa.googleapis.com',
];

/** Tamanho máximo do texto guardado. O corte visual com "ler mais" é na UI. */
const MAX_TEXTO = 1500;

/* -------------------------------------------------------------------------- */
/* RESPOSTA CRUA DA API (só o que consumimos)                                 */
/* -------------------------------------------------------------------------- */

interface PlacesTexto {
  text?: unknown;
  languageCode?: unknown;
}

interface PlacesReview {
  rating?: unknown;
  text?: PlacesTexto;
  originalText?: PlacesTexto;
  relativePublishTimeDescription?: unknown;
  publishTime?: unknown;
  authorAttribution?: {
    displayName?: unknown;
    photoUri?: unknown;
    uri?: unknown;
  };
  googleMapsUri?: unknown;
}

interface PlacesResposta {
  rating?: unknown;
  userRatingCount?: unknown;
  googleMapsUri?: unknown;
  reviews?: unknown;
}

/* -------------------------------------------------------------------------- */
/* NORMALIZAÇÃO                                                               */
/* -------------------------------------------------------------------------- */

/** Texto de terceiro: tira controles, colapsa espaços e limita o tamanho. */
function limparTexto(valor: unknown, max = MAX_TEXTO): string {
  if (typeof valor !== 'string') return '';
  return valor
    /* remove caracteres de controle que possam vir no texto de terceiro */
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Aceita apenas URL https de host conhecido do Google. */
function urlSegura(valor: unknown, hosts?: string[]): string | null {
  if (typeof valor !== 'string' || !valor) return null;
  try {
    const u = new URL(valor);
    if (u.protocol !== 'https:') return null;
    if (hosts && !hosts.includes(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
}

/**
 * Descrição relativa em português.
 *
 * O Google já devolve `relativePublishTimeDescription` traduzido quando a
 * consulta informa `languageCode=pt-BR`. O cálculo abaixo é apenas a rede de
 * segurança — e roda no SERVIDOR, uma vez, junto do cache. Nunca no render do
 * cliente: dois cálculos de "agora" divergentes quebrariam a hidratação.
 */
function tempoRelativo(publishTime: unknown, agora: number): string {
  if (typeof publishTime !== 'string') return '';
  const t = Date.parse(publishTime);
  if (Number.isNaN(t)) return '';

  const dias = Math.floor((agora - t) / 86_400_000);
  if (dias < 1) return 'hoje';
  if (dias < 7) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
  if (dias < 30) {
    const s = Math.floor(dias / 7);
    return s === 1 ? 'há 1 semana' : `há ${s} semanas`;
  }
  if (dias < 365) {
    const m = Math.floor(dias / 30);
    return m === 1 ? 'há 1 mês' : `há ${m} meses`;
  }
  const a = Math.floor(dias / 365);
  return a === 1 ? 'há 1 ano' : `há ${a} anos`;
}

function normalizar(bruta: PlacesReview, agora: number): GoogleReview | null {
  const autor = limparTexto(bruta.authorAttribution?.displayName, 80);
  const nota = numero(bruta.rating);
  if (!autor || nota === null) return null;

  const texto =
    limparTexto(bruta.text?.text) || limparTexto(bruta.originalText?.text);

  const quando =
    limparTexto(bruta.relativePublishTimeDescription, 40) ||
    tempoRelativo(bruta.publishTime, agora);

  return {
    autor,
    foto: urlSegura(bruta.authorAttribution?.photoUri, HOSTS_DE_FOTO),
    nota: Math.min(5, Math.max(1, Math.round(nota * 10) / 10)),
    texto,
    quando,
    url: urlSegura(bruta.googleMapsUri) ?? urlSegura(bruta.authorAttribution?.uri),
  };
}

/* -------------------------------------------------------------------------- */
/* BUSCA                                                                      */
/* -------------------------------------------------------------------------- */

/** true quando as duas variáveis de ambiente estão preenchidas. */
export function googleReviewsConfigurado(): boolean {
  return !!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
}

/**
 * Busca as avaliações reais do perfil da corretora no Google.
 *
 * Executa apenas no servidor. Nunca lança: qualquer problema (chave ausente,
 * cota estourada, rede fora, resposta inesperada) devolve `SEM_AVALIACOES` e a
 * seção simplesmente não é renderizada.
 */
export async function fetchGoogleReviews(): Promise<GoogleReviewsResult> {
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!chave || !placeId) return SEM_AVALIACOES;

  const url =
    `${ENDPOINT}/${encodeURIComponent(placeId)}` +
    `?languageCode=pt-BR&regionCode=BR`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': chave,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      next: { revalidate: REVALIDATE_SEGUNDOS },
    });

    if (!res.ok) {
      console.warn(
        `[FIXSEG] Places API respondeu ${res.status} ao buscar as avaliações. A seção "O que falam de nós" não será exibida.`,
      );
      return SEM_AVALIACOES;
    }

    const dados = (await res.json()) as PlacesResposta;
    const agora = Date.now();

    const avaliacoes = (Array.isArray(dados.reviews) ? (dados.reviews as PlacesReview[]) : [])
      .map((r) => normalizar(r, agora))
      .filter((r): r is GoogleReview => r !== null);

    const media = numero(dados.rating);
    const total = numero(dados.userRatingCount);

    return {
      avaliacoes,
      notaMedia: media === null ? null : Math.min(5, Math.max(0, media)),
      totalAvaliacoes: total === null ? 0 : Math.max(0, Math.trunc(total)),
      googleMapsUri: urlSegura(dados.googleMapsUri),
    };
  } catch (error) {
    /* Falha de rede ou JSON inválido: a página não pode cair por causa disso. */
    console.warn('[FIXSEG] Não foi possível buscar as avaliações do Google:', error);
    return SEM_AVALIACOES;
  }
}
