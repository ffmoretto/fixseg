'use client';

import { differentials } from '@/config/content';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal, { RevealItem } from '@/components/ui/Reveal';

/**
 * "Mais do que vender seguros, protegemos suas conquistas."
 * Grade assimétrica: o primeiro item ocupa dois módulos, criando hierarquia
 * em vez de uma lista uniforme de caixas.
 *
 * Os ícones têm movimento próprio, e o ponto todo é que ele seja DESENCONTRADO:
 * a mesma deriva com o mesmo compasso em quatro cartões lado a lado lê como um
 * carrossel piscando, não como vida. O atraso e a duração saem do índice — nada
 * de `Math.random()`, que daria um valor no servidor e outro no navegador e
 * quebraria a hidratação.
 */
const driftDelays = ['0s', '-2.4s', '-4.1s', '-1.3s', '-3.2s'];
const driftDurations = ['7.2s', '8.6s', '6.4s', '9.1s', '7.8s'];

export function Differentials() {
  const [first, ...rest] = differentials;

  return (
    <section id="diferenciais" className="relative scroll-mt-24 overflow-hidden py-section">
      {/* linha de separação luminosa */}
      <div aria-hidden="true" className="shell">
        <div className="hairline" />
      </div>

      <div className="shell mt-16 lg:mt-20">
        <SectionHeading
          eyebrow="Por que a FIXSEG"
          title="Mais do que vender seguros, protegemos suas conquistas."
          highlight="protegemos suas conquistas."
          subtitle="Corretora não é intermediário de apólice. É quem interpreta o risco, negocia a cobertura certa e aparece quando a apólice precisa funcionar."
          className="max-w-[46rem]"
        />

        <Reveal stagger={0.075} className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* destaque */}
          <RevealItem
            anim="rise"
            className="surface-gradient-border relative flex flex-col justify-between overflow-hidden p-7 md:col-span-2 md:row-span-2 lg:p-9"
          >
            <div
              aria-hidden="true"
              className="glow-b pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-drift-a rounded-full opacity-60 blur-[70px]"
            />
            <div className="relative">
              <span className="grid h-16 w-16 place-items-center rounded-3xl border border-brand-2/30 bg-brand-2/[.09] text-accent-ink">
                <Icon name={first.icon} size={30} />
              </span>
              <h3 className="mt-7 font-display text-display-sm font-semibold text-fg">
                {first.title}
              </h3>
              <p className="mt-4 max-w-[38ch] text-[1rem] leading-relaxed text-fg-3">
                {first.text}
              </p>
            </div>

            <ul className="relative mt-9 flex flex-col gap-3 border-t border-hair pt-7">
              {['Um interlocutor conhecido', 'Análise antes da proposta', 'Acompanhamento no sinistro'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-[.96875rem] text-fg-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-2/[.14] text-accent-ink">
                      <Icon name="check" size={11} />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </RevealItem>

          {/* demais diferenciais */}
          {rest.map((d, i) => (
            <RevealItem
              key={d.title}
              anim="rise"
              className="group/d surface relative flex flex-col overflow-hidden p-6 transition-[transform,border-color,box-shadow] duration-500 ease-brand hover:-translate-y-1 hover:border-brand-2/35 hover:shadow-lift focus-within:-translate-y-1 focus-within:border-brand-2/35"
            >
              <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-hair bg-tint/[.035] text-accent-ink transition-all duration-500 ease-brand group-hover/d:border-brand-2/40 group-hover/d:text-fg">
                <span className="sheen-layer group-hover/d:animate-sheen-pass" aria-hidden="true" />
                {/* deriva própria, fora de compasso com a dos vizinhos */}
                <span
                  className="relative z-[1] block animate-icon-drift"
                  style={{
                    animationDelay: driftDelays[i % driftDelays.length],
                    animationDuration: driftDurations[i % driftDurations.length],
                  }}
                >
                  <Icon
                    name={d.icon}
                    size={23}
                    className="transition-transform duration-500 ease-brand group-hover/d:-rotate-6 group-hover/d:scale-110"
                  />
                </span>
              </span>
              <h3 className="mt-5 font-display text-[1.125rem] font-semibold text-fg">
                {d.title}
              </h3>
              <p className="mt-2.5 text-[.96875rem] leading-relaxed text-fg-3">{d.text}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Differentials;
