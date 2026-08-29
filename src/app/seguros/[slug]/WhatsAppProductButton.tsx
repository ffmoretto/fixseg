'use client';

import { whatsappForInsurance } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { CTA } from '@/config/site';
import { LinkButton } from '@/components/ui/Button';

/**
 * Botão de WhatsApp com mensagem específica do produto.
 * É um Client Component isolado para que a página do produto permaneça
 * estática (melhor para SEO e para o tempo de resposta).
 * Se o número não estiver configurado, cai para a seção de contato.
 */
export function WhatsAppProductButton({ insuranceName }: { insuranceName: string }) {
  const wa = whatsappForInsurance(insuranceName);

  return (
    <LinkButton
      href={wa ?? '/#contato'}
      external={!!wa}
      variant="secondary"
      size="lg"
      icon={wa ? 'whatsapp' : 'arrow-right'}
      iconPosition={wa ? 'left' : 'right'}
      onClick={() =>
        track(wa ? 'whatsapp_click' : 'cta_click', {
          placement: 'produto',
          label: insuranceName,
        })
      }
    >
      {wa ? CTA.secondary : 'Enviar uma mensagem'}
    </LinkButton>
  );
}

export default WhatsAppProductButton;
