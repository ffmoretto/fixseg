/**
 * =============================================================================
 * ADAPTADORES DE DESTINO DO LEAD (server-side apenas)
 * =============================================================================
 * Cada adaptador implementa a mesma interface. Trocar de destino é trocar a
 * variável LEADS_ADAPTER no .env.local — nenhuma alteração de componente.
 *
 * Nenhum adaptador finge sucesso: se a integração não estiver configurada,
 * o `log` assume e informa que o contato será tratado manualmente.
 * =============================================================================
 */

import type { LeadPayload, LeadResult } from '@/services/leads';

export interface LeadAdapter {
  name: string;
  configured(): boolean;
  send(lead: LeadPayload): Promise<LeadResult>;
}

/* -------------------------------------------------------------------------- */
/* LOG — padrão. Registra no servidor, sem integração externa.                */
/* -------------------------------------------------------------------------- */
const logAdapter: LeadAdapter = {
  name: 'log',
  configured: () => true,
  async send(lead) {
    // eslint-disable-next-line no-console
    console.info('[FIXSEG] Novo lead recebido', {
      origin: lead.origin,
      insurance: lead.insurance,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      at: new Date().toISOString(),
    });
    return {
      ok: true,
      pending: true,
      message: 'Recebemos sua solicitação. Um especialista entrará em contato.',
    };
  },
};

/* -------------------------------------------------------------------------- */
/* WEBHOOK — Make, n8n, Zapier, CRM próprio…                                  */
/* -------------------------------------------------------------------------- */
const webhookAdapter: LeadAdapter = {
  name: 'webhook',
  configured: () => !!process.env.LEADS_WEBHOOK_URL,
  async send(lead) {
    const url = process.env.LEADS_WEBHOOK_URL!;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error(`Webhook respondeu ${res.status}`);
    return { ok: true, message: 'Recebemos sua solicitação. Um especialista entrará em contato.' };
  },
};

/* -------------------------------------------------------------------------- */
/* SUPABASE — integração futura                                               */
/* -------------------------------------------------------------------------- */
/**
 * Esquema sugerido da tabela `leads` (execute no SQL Editor do Supabase):
 *
 *   create table public.leads (
 *     id uuid primary key default gen_random_uuid(),
 *     created_at timestamptz not null default now(),
 *     origin text not null,
 *     insurance text,
 *     name text not null,
 *     email text not null,
 *     phone text not null,
 *     subject text,
 *     message text,
 *     answers jsonb default '{}'::jsonb,
 *     preferred_contact text,
 *     consent boolean not null default false,
 *     marketing_consent boolean not null default false,
 *     utm jsonb default '{}'::jsonb,
 *     page text
 *   );
 *   alter table public.leads enable row level security;
 *   -- Sem policy de select para o papel anon: leads só são lidos pelo
 *   -- service role (painel interno). A inserção acontece via API route.
 *
 * Para ativar: `npm i @supabase/supabase-js`, preencha as variáveis e
 * descomente o corpo de `send`.
 */
const supabaseAdapter: LeadAdapter = {
  name: 'supabase',
  configured: () =>
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  async send(lead) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({
        origin: lead.origin,
        insurance: lead.insurance ?? null,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        subject: lead.subject ?? null,
        message: lead.message ?? null,
        answers: lead.answers ?? {},
        preferred_contact: lead.preferredContact ?? null,
        consent: lead.consent,
        marketing_consent: lead.marketingConsent ?? false,
        utm: lead.utm ?? {},
        page: lead.page ?? null,
      }),
    });
    if (!res.ok) throw new Error(`Supabase respondeu ${res.status}`);
    const rows = (await res.json()) as Array<{ id?: string }>;
    return {
      ok: true,
      id: rows?.[0]?.id,
      message: 'Recebemos sua solicitação. Um especialista entrará em contato.',
    };
  },
};

/* -------------------------------------------------------------------------- */
/* CRM — integração futura (endpoint genérico com bearer token)               */
/* -------------------------------------------------------------------------- */
const crmAdapter: LeadAdapter = {
  name: 'crm',
  configured: () => !!process.env.CRM_API_URL && !!process.env.CRM_API_KEY,
  async send(lead) {
    const res = await fetch(process.env.CRM_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRM_API_KEY!}`,
      },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error(`CRM respondeu ${res.status}`);
    return { ok: true, message: 'Recebemos sua solicitação. Um especialista entrará em contato.' };
  },
};

const adapters: Record<string, LeadAdapter> = {
  log: logAdapter,
  webhook: webhookAdapter,
  supabase: supabaseAdapter,
  crm: crmAdapter,
};

/**
 * Resolve o adaptador ativo. Se o escolhido não estiver configurado,
 * cai para o `log` — o lead nunca é perdido silenciosamente.
 */
export function resolveAdapter(): LeadAdapter {
  const chosen = (process.env.LEADS_ADAPTER || 'log').toLowerCase();
  const adapter = adapters[chosen];
  if (adapter && adapter.configured()) return adapter;
  if (adapter && !adapter.configured()) {
    // eslint-disable-next-line no-console
    console.warn(
      `[FIXSEG] LEADS_ADAPTER="${chosen}" não está configurado. Usando o adaptador "log".`,
    );
  }
  return logAdapter;
}
