'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { steps } from '@/config/content';
import { CTA } from '@/config/site';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/Button';

/**
 * Timeline animada de 5 etapas.
 * A linha que conecta as etapas é um SVG desenhado conforme o scroll
 * (DrawSVG + scrub), e cada etapa entra quando a linha chega até ela.
 * No mobile a linha fica à esquerda; no desktop, ao centro.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const items = el.querySelectorAll<HTMLElement>('[data-step]');
      const progress = el.querySelector('[data-step-progress]');

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 });
        if (progress) gsap.set(progress, { scaleY: 1 });
        return;
      }

      /* linha de progresso atrelada ao scroll */
      const lineTween = progress
        ? gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el.querySelector('[data-step-list]'),
                start: 'top 72%',
                end: 'bottom 72%',
                scrub: 0.5,
              },
            },
          )
        : null;

      /* cada etapa entra individualmente */
      const tweens = Array.from(items).map((item, i) =>
        gsap.fromTo(
          item,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'brand',
            clearProps: 'transform',
            scrollTrigger: { trigger: item, start: 'top 84%', once: true },
            delay: i * 0.02,
          },
        ),
      );

      /* número e ícone reagem quando a etapa fica ativa */
      const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-step-dot]')).map((dot) =>
        gsap.fromTo(
          dot,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'snap',
            scrollTrigger: { trigger: dot, start: 'top 82%', once: true },
          },
        ),
      );

      return () => {
        lineTween?.scrollTrigger?.kill();
        lineTween?.kill();
        [...tweens, ...dots].forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <section
      ref={root}
      id="como-funciona"
      className="relative scroll-mt-24 overflow-hidden py-section"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          data-speed="0.9"
          className="glow-band absolute left-1/2 top-0 h-[52vw] max-h-[620px] w-[92vw] max-w-[1100px] -translate-x-1/2 opacity-55 blur-[100px]"
          
        />
      </div>

      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Como funciona"
          title="Cinco etapas. Nenhuma surpresa."
          highlight="Nenhuma surpresa."
          subtitle="Um processo curto, com você entendendo cada decisão antes de assinar."
          className="mx-auto"
        />

        <div data-step-list className="relative mx-auto mt-16 max-w-[58rem] lg:mt-20">
          {/* trilha */}
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-[26px] top-6 w-[2px] md:left-1/2 md:-translate-x-1/2"
          >
            <span className="absolute inset-0 rounded-full bg-tint/8" />
            <span
              data-step-progress
              className="absolute inset-0 origin-top rounded-full bg-brand-gradient"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>

          <ol className="relative flex flex-col gap-10 md:gap-14">
            {steps.map((step, i) => {
              const rightSide = i % 2 === 1;
              return (
                <li
                  key={step.n}
                  data-step
                  className="relative pl-[68px] opacity-0 md:grid md:grid-cols-2 md:items-center md:gap-12 md:pl-0"
                >
                  {/* marcador */}
                  <span
                    data-step-dot
                    className="absolute left-0 top-0 z-10 grid h-[54px] w-[54px] place-items-center rounded-2xl border border-hair bg-panel text-accent-ink shadow-[0_10px_30px_-16px_rgba(0,0,0,.9)] md:left-1/2 md:top-1/2 md:h-[58px] md:w-[58px] md:-translate-x-1/2 md:-translate-y-1/2"
                  >
                    <Icon name={step.icon} size={24} />
                  </span>

                  {/* conteúdo */}
                  <div
                    className={
                      rightSide
                        ? 'md:col-start-2 md:pl-14 md:text-left'
                        : 'md:col-start-1 md:pr-14 md:text-right'
                    }
                  >
                    <span className="font-mono text-[.9375rem] font-semibold text-accent-ink/70">
                      {step.n}
                    </span>
                    <h3 className="mt-2 font-display text-[1.25rem] font-semibold text-fg md:text-[1.5rem]">
                      {step.title}
                    </h3>
                    <p
                      className={`mt-2.5 text-[1.0625rem] leading-relaxed text-fg-3 ${
                        rightSide ? 'md:mr-auto' : 'md:ml-auto'
                      } md:max-w-[34ch]`}
                    >
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="max-w-[44ch] text-[1.0625rem] text-fg-3">
            A primeira etapa leva menos de dois minutos.
          </p>
          <LinkButton href="/cotacao" size="lg" icon="arrow-right">
            {CTA.primary}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
