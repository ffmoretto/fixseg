'use client';

import { Suspense } from 'react';
import { site } from '@/config/site';
import { whatsappUrl, telUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import QuoteForm from './QuoteForm';

/** Bloco de cotação na home — a principal área de conversão do site. */
export function QuoteSection() {
  const wa = whatsappUrl();
  const tel = telUrl();

  return (
    <section id="cotacao" className="relative scroll-mt-24 overflow-hidden py-section">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          data-speed="0.92"
          className="glow-b absolute right-[-10%] top-[8%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] rounded-full opacity-50 blur-[100px]"
          
        />
      </div>

      <div className="shell grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="Cotação"
            title="Encontre o seguro ideal para você"
            highlight="seguro ideal"
            subtitle="Quatro etapas rápidas. Você informa o essencial, nós consultamos as seguradoras e voltamos com o comparativo."
          />

          <ul className="mt-9 flex flex-col gap-4">
            {[
              { icon: 'clock' as const, text: 'Leva menos de dois minutos para enviar.' },
              { icon: 'shield-check' as const, text: 'Dados usados apenas para elaborar a cotação.' },
              { icon: 'user-check' as const, text: 'A análise é feita por uma pessoa, não por um robô.' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-hair bg-tint/[.035] text-accent-ink">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="text-[1.0625rem] leading-relaxed text-fg-3">{item.text}</span>
              </li>
            ))}
          </ul>

          {(wa || tel) && (
            <div className="mt-9 border-t border-hair pt-7">
              <p className="text-[.875rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
                Prefere falar direto?
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_click', { placement: 'cotacao' })}
                    className="group flex items-center gap-3 text-[1.0625rem] font-medium text-fg-2 transition-colors duration-300 hover:text-fg"
                  >
                    <Icon name="whatsapp" size={19} className="text-[#1FAF54]" />
                    Chamar no WhatsApp
                    <Icon
                      name="arrow-up-right"
                      size={14}
                      className="text-fg-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
                {tel && site.contact.phone && (
                  <a
                    href={tel}
                    onClick={() => track('phone_click', { placement: 'cotacao' })}
                    className="group flex items-center gap-3 text-[1.0625rem] font-medium text-fg-2 transition-colors duration-300 hover:text-fg"
                  >
                    <Icon name="phone" size={18} className="text-accent-ink" />
                    {site.contact.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <Reveal anim="rise" className="min-w-0">
          <Suspense
            fallback={
              <div className="surface grid min-h-[420px] place-items-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-hair border-t-accent-ink" />
              </div>
            }
          >
            <QuoteForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}

export default QuoteSection;
