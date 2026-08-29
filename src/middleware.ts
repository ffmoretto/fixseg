import { NextResponse, type NextRequest } from 'next/server';

/**
 * =============================================================================
 * TRAVA DE PRÉ-VISUALIZAÇÃO (opcional)
 * =============================================================================
 * Protege TODO o site com usuário e senha enquanto ele estiver em homologação.
 * Funciona em qualquer hospedagem — Vercel (inclusive no plano gratuito),
 * Cloudflare, Netlify, VPS própria — porque a verificação acontece na própria
 * aplicação, e não em um recurso pago da plataforma.
 *
 * Como ativar:
 *   1. defina `PREVIEW_PASSWORD` nas variáveis de ambiente;
 *   2. opcionalmente defina `PREVIEW_USER` (o padrão é "fixseg").
 *
 * Como desativar (ir ao ar de verdade):
 *   remova a variável `PREVIEW_PASSWORD` e faça um novo deploy.
 *
 * Enquanto a trava estiver ativa o site responde 401 e envia
 * `X-Robots-Tag: noindex`, ou seja: buscadores não indexam nada da versão de
 * homologação — importante para não competir com o site definitivo no Google.
 *
 * Observação: em plataformas serverless a variável é lida a cada requisição,
 * mas algumas exigem novo deploy para que a mudança valha. Se alterar a senha
 * e nada mudar, refaça o deploy.
 * =============================================================================
 */

/* Somente ASCII: cabeçalhos HTTP não aceitam acentos nem travessão — um
   caractere fora dessa faixa faz o servidor devolver erro 500 em vez do 401. */
const REALM = 'FIXSEG - area restrita';

function unauthorized(): NextResponse {
  return new NextResponse('Acesso restrito. Informe usuário e senha.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/** Comparação em tempo constante, para não vazar a senha por tempo de resposta. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(request: NextRequest) {
  const password = process.env.PREVIEW_PASSWORD;

  /* Sem senha configurada, a trava não existe: o site funciona normalmente. */
  if (!password) return NextResponse.next();

  const expectedUser = process.env.PREVIEW_USER || 'fixseg';
  const header = request.headers.get('authorization');

  if (!header?.startsWith('Basic ')) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return unauthorized();

  const user = decoded.slice(0, separator);
  const pass = decoded.slice(separator + 1);

  if (!safeEqual(user, expectedUser) || !safeEqual(pass, password)) {
    return unauthorized();
  }

  /* Autenticado: segue o fluxo, mas sem deixar rastro em buscadores. */
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  /**
   * Cobre o site inteiro, inclusive assets e a rota de leads.
   * O navegador reenvia as credenciais automaticamente depois do primeiro
   * acesso, então a senha é pedida uma única vez por sessão.
   */
  matcher: '/:path*',
};
