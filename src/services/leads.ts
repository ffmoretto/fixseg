/**
 * =============================================================================
 * SERVIÇO DE LEADS — contrato único, adaptadores plugáveis
 * =============================================================================
 * O frontend NUNCA fala com CRM, Supabase ou API de cotação diretamente:
 * ele envia o lead para /api/leads, que roda no servidor. Assim nenhuma
 * credencial aparece no navegador (requisito de LGPD e de segurança).
 *
 * Para ativar um destino, preencha as variáveis do .env.local e defina
 * LEADS_ADAPTER. Nenhuma integração é simulada: enquanto o adaptador for
 * "log", o lead é apenas registrado no servidor e a resposta é honesta.
 * =============================================================================
 */

export type LeadOrigin = 'cotacao' | 'contato' | 'whatsapp' | 'produto';

export interface LeadPayload {
  origin: LeadOrigin;
  /** Slug do seguro (quando aplicável) */
  insurance?: string;
  name: string;
  email: string;
  phone: string;
  /** Assunto (formulário de contato) */
  subject?: string;
  message?: string;
  /** Respostas da etapa 2 da cotação, específicas do produto */
  answers?: Record<string, string>;
  /** Melhor horário / canal preferido */
  preferredContact?: string;
  /** Consentimento LGPD — obrigatório */
  consent: boolean;
  /** Aceite opcional de comunicações de marketing */
  marketingConsent?: boolean;
  /** Metadados de origem (UTM) */
  utm?: Record<string, string>;
  /** Página de origem */
  page?: string;
}

export interface LeadResult {
  ok: boolean;
  /** Identificador do lead, quando o destino devolve um */
  id?: string;
  /** Mensagem para exibir ao usuário */
  message: string;
  /** true quando o lead foi apenas registrado (nenhum destino configurado) */
  pending?: boolean;
}

/** Validação compartilhada entre cliente e servidor. */
export function validateLead(p: Partial<LeadPayload>): string[] {
  const errors: string[] = [];
  if (!p.name || p.name.trim().length < 2) errors.push('Informe seu nome.');
  if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) errors.push('Informe um e-mail válido.');
  if (!p.phone || p.phone.replace(/\D/g, '').length < 10) errors.push('Informe um telefone válido com DDD.');
  if (!p.consent) errors.push('É necessário aceitar a Política de Privacidade.');
  return errors;
}

/**
 * Envia o lead para a rota interna. Único ponto de saída do frontend.
 */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return {
      ok: false,
      message:
        data?.message ||
        'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.',
    };
  }

  return (await res.json()) as LeadResult;
}

/** Coleta parâmetros UTM da URL atual (client-side). */
export function collectUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(
    (k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    },
  );
  return utm;
}
