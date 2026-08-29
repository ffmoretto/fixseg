'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CTA, site } from '@/config/site';
import { insurances, featuredSlugs } from '@/config/insurances';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { LinkButton } from '@/components/ui/Button';
import Icon from '@/components/icons';
import HeroVisual from './HeroVisual';

/**
 * Primeira dobra.
 *
 * A ordem de entrada segue exatamente a sequência definida:
 *   1. logo/menu (animados no Header)
 *   2. título
 *   3. texto
 *   4. botões
 *   5. elementos visuais (HeroVisual, com atraso próprio)
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const wa = whatsappUrl();

  const quickPicks = featuredSlugs
    .map((slug) => insurances.find((i) => i.slug === slug))
    .filter(Boolean)
    .slice(0, 5) as typeof insurances;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const title = el.querySelector<HTMLElement>('[data-hero="title"]');

      if (reduced) {
        gsap.set(el.querySelectorAll('[data-hero]'), { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.32 });

      /* 2. título — revelado linha a linha, com máscara */
      let split: SplitText | null = null;
      if (title) {
        split = SplitText.create(title, { type: 'lines', mask: 'lines' });
        gsap.set(title, { opacity: 1 });
        tl.from(split.lines, {
          yPercent: 108,
          opacity: 0,
          duration: 1.05,
          stagger: 0.12,
          ease: 'brandOut',
        });
      }

      /* 3. texto de apoio */
      tl.to('[data-hero="lede"]', { opacity: 1, y: 0, duration: 0.8, ease: 'brand' }, '-=0.62');

      /* 4. botões */
      tl.to(
        '[data-hero="actions"] > *',
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'brand', clearProps: 'transform' },
        '-=0.45',
      );

      /* 5. atalhos e selo de apoio */
      tl.to(
        '[data-hero="picks"] > *',
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.055, ease: 'brand', clearProps: 'transform' },
        '-=0.35',
      ).to('[data-hero="scroll"]', { opacity: 1, y: 0, duration: 0.6, ease: 'brand' }, '-=0.2');

      /* eyebrow entra primeiro, junto com o header */
      gsap.to('[data-hero="eyebrow"]', { opacity: 1, y: 0, duration: 0.7, delay: 0.22, ease: 'brand' });

      return () => {
        split?.revert();
        tl.kill();
      };
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section
      ref={root}
      id="inicio"
      className="relative flex min-h-screen-dvh items-center overflow-hidden pb-16 pt-[128px] lg:pb-24 lg:pt-[148px]"
    >
      {/* ---------------------------------------------------------------- fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-70" />
        <div
          data-speed="0.86"
          className="glow-a absolute -left-[18%] top-[-18%] h-[62vw] max-h-[760px] w-[62vw] max-w-[760px] rounded-full opacity-60 blur-[110px]"
          
        />
        <div
          data-speed="1.12"
          className="glow-b absolute -right-[14%] top-[24%] h-[52vw] max-h-[640px] w-[52vw] max-w-[640px] rounded-full opacity-55 blur-[110px]"
          
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-page" />
      </div>

      <div className="shell grid w-full items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        {/* ------------------------------------------------------------ coluna 1 */}
        <div className="max-w-[38rem]">
          <p
            data-hero="eyebrow"
            className="eyebrow translate-y-3 opacity-0"
          >
            <Icon name="spark" size={13} />
            {site.tagline} · Pessoas e empresas
          </p>

          <h1
            data-hero="title"
            className="mt-6 text-display-xl font-semibold text-fg opacity-0"
          >
            Proteção para o que <span className="text-gradient-brand">realmente importa.</span>
          </h1>

          <p
            data-hero="lede"
            className="mt-7 max-w-[46ch] translate-y-4 text-[1.125rem] leading-relaxed text-fg-3 opacity-0 md:text-[1.1875rem]"
          >
            Encontre o seguro ideal para você, sua família e sua empresa com atendimento
            personalizado e as melhores opções do mercado.
          </p>

          <div data-hero="actions" className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="translate-y-4 opacity-0">
              <LinkButton
                href="/cotacao"
                size="lg"
                icon="arrow-right"
                full
                onClick={() => track('cta_click', { placement: 'hero', label: CTA.primary })}
              >
                {CTA.primary}
              </LinkButton>
            </div>

            <div className="translate-y-4 opacity-0">
              <LinkButton
                href={wa ?? '/#contato'}
                external={!!wa}
                variant="secondary"
                size="lg"
                icon="whatsapp"
                iconPosition="left"
                full
                onClick={() =>
                  track(wa ? 'whatsapp_click' : 'cta_click', {
                    placement: 'hero',
                    label: CTA.secondary,
                  })
                }
              >
                {CTA.secondary}
              </LinkButton>
            </div>
          </div>

          {/* atalhos por tipo de seguro */}
          <div className="mt-11">
            <p className="text-[.8125rem] font-semibold uppercase tracking-[0.18em] text-fg-4">
              Comece por um tipo de seguro
            </p>
            <div data-hero="picks" className="mt-4 flex flex-wrap gap-2">
              {quickPicks.map((ins) => (
                <Link
                  key={ins.slug}
                  href={`/cotacao?seguro=${ins.slug}`}
                  onClick={() => track('cta_click', { placement: 'hero_pick', label: ins.name })}
                  className="group flex translate-y-3 items-center gap-2 rounded-full border border-hair bg-tint/[.035] px-3.5 py-2 text-[.9375rem] font-medium text-fg-2 opacity-0 transition-all duration-300 ease-brand hover:-translate-y-[3px] hover:border-brand-2/50 hover:bg-tint/[.07] hover:text-fg"
                >
                  <Icon
                    name={ins.icon}
                    size={16}
                    className="text-accent-ink transition-transform duration-300 ease-brand group-hover:scale-110"
                  />
                  {ins.name.replace('Seguro ', '')}
                </Link>
              ))}
              <Link
                href="/#seguros"
                className="flex translate-y-3 items-center gap-1.5 rounded-full px-3 py-2 text-[.9375rem] font-semibold text-accent-ink opacity-0 transition-colors duration-300 hover:text-fg"
              >
                Ver todos
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ coluna 2 */}
        <div className="relative flex justify-center lg:justify-end">
          <HeroVisual />
        </div>
      </div>

      {/* indicador de scroll */}
      <a
        href="#historia"
        data-hero="scroll"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 translate-y-3 flex-col items-center gap-2 text-fg-4 opacity-0 transition-colors duration-300 hover:text-fg lg:flex"
      >
        <span className="text-[.75rem] font-semibold uppercase tracking-[0.24em]">Role</span>
        <span className="relative block h-11 w-[1px] overflow-hidden bg-tint/12">
          <span
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-brand-2 to-transparent"
            style={reduced ? undefined : { animation: 'float-y 2.4s ease-in-out infinite' }}
          />
        </span>
      </a>
    </section>
  );
}

export default Hero;
