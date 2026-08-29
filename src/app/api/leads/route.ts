import { NextResponse } from 'next/server';
import { resolveAdapter } from '@/services/adapters';
import { validateLead, type LeadPayload } from '@/services/leads';

/**
 * =============================================================================
 * POST /api/leads — recebimento de leads (server-side)
 * =============================================================================
 * Este é o único caminho pelo qual dados de clientes saem do navegador.
 * Motivos para existir:
 *  - nenhuma credencial de CRM / Supabase / API de cotação fica no frontend;
 *  - a validação é refeita no servidor (nunca confiar no cliente);
 *  - o destino do lead é trocável por variável de ambiente, sem tocar na UI;
 *  - dá um ponto único para aplicar limite de requisições e anti-spam.
 *
 * LGPD: o consentimento é obrigatório e é registrado junto ao lead. Nenhum
 * dado é logado além do necessário para o atendimento.
 * =============================================================================
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* --- Limite simples de requisições por IP -----------------------------------
 * Suficiente para conter envios repetidos de um mesmo visitante. Para
 * proteção real contra ataques distribuídos, use o Rate Limiting da Vercel
 * ou um serviço dedicado (Upstash, Cloudflare).
 * -------------------------------------------------------------------------- */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;

  /* limpeza oportunista para não crescer indefinidamente */
  if (hits.size > 5000) {
    for (const [key, value] of hits) if (now > value.reset) hits.delete(key);
  }

  return entry.count > MAX_PER_WINDOW;
}

/** Remove tags e limita o tamanho de cada campo de texto. */
function sanitize(value: unknown, max = 2000): string {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim().slice(0, max);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'desconhecido';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: 'Muitas tentativas. Aguarde um minuto e tente novamente.' },
      { status: 429 },
    );
  }

  let body: Partial<LeadPayload>;
  try {
    body = (await request.json()) as Partial<LeadPayload>;
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  /* --- normalização e sanitização ---------------------------------------- */
  const lead: LeadPayload = {
    origin: (['cotacao', 'contato', 'whatsapp', 'produto'] as const).includes(
      body.origin as never,
    )
      ? (body.origin as LeadPayload['origin'])
      : 'contato',
    insurance: sanitize(body.insurance, 80) || undefined,
    name: sanitize(body.name, 120),
    email: sanitize(body.email, 160).toLowerCase(),
    phone: sanitize(body.phone, 32),
    subject: sanitize(body.subject, 160) || undefined,
    message: sanitize(body.message, 4000) || undefined,
    preferredContact: sanitize(body.preferredContact, 40) || undefined,
    answers: Object.fromEntries(
      Object.entries(body.answers ?? {})
        .slice(0, 40)
        .map(([k, v]) => [sanitize(k, 60), sanitize(v, 1000)]),
    ),
    consent: body.consent === true,
    marketingConsent: body.marketingConsent === true,
    utm: Object.fromEntries(
      Object.entries(body.utm ?? {})
        .slice(0, 12)
        .map(([k, v]) => [sanitize(k, 40), sanitize(String(v), 200)]),
    ),
    page: sanitize(body.page, 200) || undefined,
  };

  /* --- validação server-side --------------------------------------------- */
  const errors = validateLead(lead);
  if (errors.length) {
    return NextResponse.json({ ok: false, message: errors[0] }, { status: 422 });
  }

  /* --- entrega ao destino configurado ------------------------------------ */
  const adapter = resolveAdapter();

  try {
    const result = await adapter.send(lead);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    /* Falha na integração externa: o lead não pode ser perdido.
       Registramos no servidor e devolvemos uma resposta honesta. */
    console.error('[FIXSEG] Falha ao entregar o lead:', error);
    console.info('[FIXSEG] Lead preservado no log:', {
      origin: lead.origin,
      insurance: lead.insurance,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        ok: true,
        pending: true,
        message:
          'Recebemos sua solicitação. Um especialista entrará em contato — se preferir agilizar, chame no WhatsApp.',
      },
      { status: 200 },
    );
  }
}

/** Bloqueia métodos não usados. */
export async function GET() {
  return NextResponse.json({ ok: false, message: 'Método não permitido.' }, { status: 405 });
}
