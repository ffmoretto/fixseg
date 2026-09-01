'use client';

import { Suspense } from 'react';
import { site } from '@/config/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import QuoteForm from './QuoteForm';

/** Bloco de cotação na home — a principal área de conversão do site. */
export function QuoteSection() {
  const wa = whatsappUrl();

  return (
    <section id="cotacao" className="relative scroll-mt-24 overflow-hidden py-section">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Dois níveis: o de fora recebe o parallax do ScrollSmoother
            (`data-speed`, que escreve `transform` em linha), o de dentro deriva
            em CSS. Juntos no mesmo elemento, a animação venceria o parallax. */}
        <div
          data-speed="0.92"
          className="absolute right-[-10%] top-[8%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px]"
        >
          <div className="glow-b absolute inset-0 animate-drift-b rounded-full opacity-50 blur-[100px]" />
        </div>
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
              <li key={item.text} className="group/adv flex items-start gap-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-hair bg-tint/[.035] text-accent-ink transition-[border-color,transform] duration-500 ease-brand group-hover/adv:-translate-y-[2px] group-hover/adv:border-brand-2/40">
                  {/* Estes três ícones também derivavam sozinhos. CORTADO na
                      medição: junto com os das outras seções, o conjunto de
                      derivas custava quadro na CPU 4× mais lenta, e aqui é onde
                      menos falta — a seção inteira já tem o brilho em deriva ao
                      fundo e o formulário ao lado, que é o que pede atenção. O
                      ícone continua reagindo ao cursor, logo acima. */}
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="text-[1.0625rem] leading-relaxed text-fg-3 transition-colors duration-500 group-hover/adv:text-fg-2">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          {wa && (
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
                    className="group flex min-h-[44px] items-center gap-3 text-[1.0625rem] font-medium text-fg-2 transition-[color,transform] duration-300 ease-brand hover:translate-x-1 hover:text-fg active:translate-x-0 active:scale-[.98] active:duration-[90ms]"
                  >
                    <Icon
                      name="whatsapp"
                      size={19}
                      className="text-[#1FAF54] transition-transform duration-300 ease-brand group-hover:scale-110"
                    />
                    Chamar no WhatsApp
                    <Icon
                      name="arrow-up-right"
                      size={14}
                      className="text-fg-4 transition-transform duration-300 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
                {/* O número não é exibido: o contato por telefone acontece pelo
                    WhatsApp, e o número existe só como destino daquele link. */}
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
