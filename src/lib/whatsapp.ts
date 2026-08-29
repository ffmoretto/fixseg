import { site } from '@/config/site';

/**
 * Monta o link do WhatsApp. O número é configurável em src/config/site.ts
 * ou pela variável NEXT_PUBLIC_WHATSAPP_NUMBER.
 * Retorna null quando o número ainda não foi informado — nesse caso os
 * componentes escondem o botão em vez de gerar um link quebrado.
 */
export function whatsappUrl(message?: string): string | null {
  const number = site.contact.whatsapp?.replace(/\D/g, '');
  if (!number) return null;
  const text = encodeURIComponent(message ?? site.contact.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}

/** Mensagem contextualizada por produto. */
export function whatsappForInsurance(insuranceName: string): string | null {
  return whatsappUrl(
    `Olá! Vim pelo site e gostaria de uma cotação de ${insuranceName}.`,
  );
}

export function telUrl(): string | null {
  const raw = site.contact.phoneRaw || site.contact.phone;
  if (!raw) return null;
  return `tel:+55${raw.replace(/\D/g, '').replace(/^55/, '')}`;
}

export function mailUrl(subject?: string): string | null {
  if (!site.contact.email) return null;
  const s = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${site.contact.email}${s}`;
}
