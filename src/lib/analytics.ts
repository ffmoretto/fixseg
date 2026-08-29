/**
 * =============================================================================
 * CAMADA DE ANALYTICS — preparada, não ativada
 * =============================================================================
 * Nenhum script de terceiros é carregado enquanto as variáveis de ambiente
 * não forem preenchidas. Isso mantém o site rápido e em conformidade com a
 * LGPD (sem rastreamento antes do consentimento).
 *
 * `track()` é um disparador único que envia o evento para as ferramentas
 * ativas. Se nenhuma estiver configurada, ele não faz nada em produção e
 * apenas registra no console em desenvolvimento.
 * =============================================================================
 */

export const analyticsConfig = {
  ga: process.env.NEXT_PUBLIC_GA_ID || null,
  gtm: process.env.NEXT_PUBLIC_GTM_ID || null,
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
};

export const analyticsEnabled =
  !!analyticsConfig.ga || !!analyticsConfig.gtm || !!analyticsConfig.metaPixel;

/** Eventos de conversão do site. */
export type TrackEvent =
  | 'cta_click'
  | 'whatsapp_click'
  | 'phone_click'
  | 'quote_start'
  | 'quote_step'
  | 'quote_submit'
  | 'contact_submit'
  | 'insurance_view'
  /* calculadora de bônus: o cálculo roda só no navegador; o evento registra
     apenas que houve um cálculo, sem nenhum dado digitado pelo visitante. */
  | 'bonus_calculate';

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: TrackEvent, payload: Payload = {}): void {
  if (typeof window === 'undefined') return;

  if (analyticsConfig.gtm) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  }

  if (analyticsConfig.ga && typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  }

  if (analyticsConfig.metaPixel && typeof window.fbq === 'function') {
    const metaMap: Partial<Record<TrackEvent, string>> = {
      quote_submit: 'Lead',
      contact_submit: 'Lead',
      quote_start: 'InitiateCheckout',
      whatsapp_click: 'Contact',
      phone_click: 'Contact',
    };
    const metaEvent = metaMap[event];
    if (metaEvent) window.fbq('track', metaEvent, payload);
  }

  if (process.env.NODE_ENV === 'development' && !analyticsEnabled) {
    // eslint-disable-next-line no-console
    console.debug('[analytics:desativado]', event, payload);
  }
}
