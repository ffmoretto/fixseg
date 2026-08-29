'use client';

import { faq } from '@/config/content';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import Icon from '@/components/icons';
import Accordion from '@/components/ui/Accordion';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

export function Faq() {
  const wa = whatsappUrl('Olá! Vim pelo site e tenho uma dúvida sobre seguros.');

  return (
    <section id="faq" className="relative scroll-mt-24 py-section">
      <div className="shell grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="Dúvidas frequentes"
            title="Perguntas que todo mundo faz antes de contratar"
            highlight="antes de contratar"
            subtitle="Se a sua dúvida não estiver aqui, é só perguntar — respondemos sem enrolação."
          />

          <Reveal anim="up" delay={0.15} className="mt-9">
            <div className="surface flex flex-col gap-4 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-2/30 bg-brand-2/[.08] text-accent-ink">
                <Icon name="headset" size={21} />
              </span>
              <p className="text-[1.0625rem] leading-relaxed text-fg-3">
                Prefere conversar? Um especialista responde direto no WhatsApp, sem formulário.
              </p>
              {wa ? (
                <LinkButton
                  href={wa}
                  external
                  variant="whatsapp"
                  size="md"
                  icon="whatsapp"
                  iconPosition="left"
                  full
                  onClick={() => track('whatsapp_click', { placement: 'faq' })}
                >
                  Tirar uma dúvida
                </LinkButton>
              ) : (
                <LinkButton href="/#contato" variant="secondary" size="md" icon="arrow-right" full>
                  Enviar uma mensagem
                </LinkButton>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal anim="up" className="min-w-0">
          <Accordion items={faq} defaultOpen={0} />
        </Reveal>
      </div>
    </section>
  );
}

export default Faq;
