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
            <div className="group/help surface relative flex flex-col gap-4 overflow-hidden p-6 transition-[border-color,box-shadow] duration-500 ease-brand hover:border-brand-2/35 hover:shadow-lift">
              {/* Brilho fixo. A deriva foi cortada na medição — ver o comentário
                  equivalente em Blog.tsx. O cartão continua respondendo ao
                  cursor, que é o que importa neste bloco. */}
              <span
                aria-hidden="true"
                className="glow-b pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-55 blur-[52px]"
              />
              <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-brand-2/30 bg-brand-2/[.08] text-accent-ink">
                <Icon name="headset" size={21} />
              </span>
              <p className="relative text-[1.0625rem] leading-relaxed text-fg-3">
                Prefere conversar? Um especialista responde direto no WhatsApp, sem formulário.
              </p>
              {wa ? (
                <LinkButton
                  className="relative"
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
                <LinkButton
                  href="/#contato"
                  variant="secondary"
                  size="md"
                  icon="arrow-right"
                  className="relative"
                  full
                >
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
