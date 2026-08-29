'use client';

import { about, stats } from '@/config/content';
import { CTA } from '@/config/site';
import Icon from '@/components/icons';
import Counter from '@/components/ui/Counter';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

/**
 * Seção institucional.
 * Os indicadores só aparecem quando têm valor real em src/config/content.ts —
 * nada é inventado. Se todos estiverem nulos, o bloco de números é omitido
 * e a seção segue coerente.
 */
export function About() {
  const visibleStats = stats.filter((s) => s.value !== null);

  return (
    <section id="sobre" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell grid gap-14 lg:grid-cols-[1fr_.86fr] lg:items-start lg:gap-20">
        {/* texto */}
        <div>
          <SectionHeading
            eyebrow={about.eyebrow}
            title={about.title}
            highlight="Tranquilidade para amanhã."
          />

          <Reveal stagger={0.1} className="mt-8 flex flex-col gap-5">
            {about.paragraphs.map((p, i) => (
              <RevealItem
                key={i}
                as="p"
                className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3 md:text-[1.125rem]"
              >
                {p}
              </RevealItem>
            ))}
          </Reveal>

          <div className="mt-10">
            <LinkButton href="/#contato" variant="secondary" size="md" icon="arrow-right">
              Conversar com a FIXSEG
            </LinkButton>
          </div>
        </div>

        {/* pilares + indicadores */}
        <div className="flex flex-col gap-4">
          <Reveal stagger={0.09} className="flex flex-col gap-4">
            {about.pillars.map((pillar, i) => (
              <RevealItem
                key={pillar.title}
                anim="left"
                className="group/p surface flex items-start gap-5 p-6 transition-[border-color,transform] duration-500 ease-brand hover:-translate-x-1 hover:border-brand-2/35"
              >
                <span className="mt-0.5 font-mono text-[.875rem] font-semibold text-accent-ink/60">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[1.125rem] font-semibold text-fg">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[.96875rem] leading-relaxed text-fg-3">{pillar.text}</p>
                </div>
                <Icon
                  name="arrow-up-right"
                  size={17}
                  className="ml-auto mt-0.5 shrink-0 text-fg-4/55 transition-all duration-500 ease-brand group-hover/p:translate-x-1 group-hover/p:text-accent-ink"
                />
              </RevealItem>
            ))}
          </Reveal>

          {/* indicadores animados — só com dados reais preenchidos */}
          {visibleStats.length > 0 && (
            <Reveal
              stagger={0.08}
              className="mt-2 grid grid-cols-2 gap-4 rounded-3xl border border-hair bg-tint/[.025] p-6"
            >
              {visibleStats.map((s) => (
                <RevealItem key={s.label} anim="scale" className="text-left">
                  <p className="font-display text-display-sm font-semibold text-fg">
                    <Counter
                      value={s.value as number}
                      prefix={s.prefix ?? ''}
                      suffix={s.suffix ?? ''}
                      className="text-gradient-brand"
                    />
                  </p>
                  <p className="mt-1.5 text-[.875rem] font-medium uppercase tracking-[0.12em] text-fg-4">
                    {s.label}
                  </p>
                </RevealItem>
              ))}
            </Reveal>
          )}
        </div>
      </div>

      {/* faixa de CTA */}
      <div className="shell mt-20">
        <Reveal anim="rise" className="surface-gradient-border relative overflow-hidden">
          <div
            aria-hidden="true"
            className="glow-panel pointer-events-none absolute inset-0 opacity-80"
            
          />
          <div className="relative flex flex-col items-start justify-between gap-7 p-8 md:flex-row md:items-center md:p-11">
            <div>
              <span className="eyebrow">
                <Icon name="spark" size={13} />
                Patrimônio protegido
              </span>
              <h3 className="mt-4 max-w-[26ch] font-display text-display-sm font-semibold text-fg">
                Quer saber se sua proteção atual é suficiente?
              </h3>
              <p className="mt-3 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-3">
                Analisamos as apólices que você já tem e apontamos lacunas de cobertura — sem custo
                e sem obrigação de trocar de corretora.
              </p>
            </div>
            <LinkButton href="/cotacao" size="lg" icon="arrow-right" className="shrink-0">
              {CTA.patrimony}
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default About;
