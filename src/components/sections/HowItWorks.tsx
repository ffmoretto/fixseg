'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { steps } from '@/config/content';
import { CTA } from '@/config/site';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/Button';

/* Compassos desencontrados para a deriva dos ícones — derivados do índice, sem
   `Math.random()`, que divergiria entre servidor e navegador. */
const stepDelays = ['0s', '-3.1s', '-1.4s', '-4.6s', '-2.2s'];
const stepDurations = ['7.4s', '8.9s', '6.6s', '9.3s', '7.9s'];

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
      const head = el.querySelector<HTMLElement>('[data-step-head]');
      const track = el.querySelector<HTMLElement>('[data-step-track]');

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 });
        if (progress) gsap.set(progress, { scaleY: 1 });
        /* a ponta luminosa não tem para onde ir sem scroll: some de vez */
        if (head) gsap.set(head, { opacity: 0 });
        el.querySelectorAll('[data-step-dot]').forEach((d) => d.classList.add('is-lit'));
        return;
      }

      /* Linha de progresso atrelada ao scroll, com a ponta luminosa viajando na
         frente do traço como a brasa de um pavio.

         As duas ficam numa timeline ÚNICA, com um gatilho só. Cada
         ScrollTrigger registrado é trabalho em todo quadro de rolagem da página
         inteira, não apenas desta seção — dois gatilhos com exatamente o mesmo
         início, fim e scrub custam o dobro e entregam o mesmo resultado.

         A ponta é um elemento separado, movido por `y`: filho da barra ela
         seria esticada junto com o `scaleY` e chegaria embaixo achatada num
         risco. */
      const lineTween = progress
        ? gsap
            .timeline({
              scrollTrigger: {
                trigger: el.querySelector('[data-step-list]'),
                start: 'top 72%',
                end: 'bottom 72%',
                scrub: 0.5,
              },
            })
            .fromTo(progress, { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
            .fromTo(
              head && track ? head : [],
              { y: 0 },
              { y: () => (track ? track.offsetHeight : 0), ease: 'none' },
              0,
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

      /* Número e ícone reagem quando a etapa fica ativa — e é aqui, no gatilho
         que já existe, que o marcador acende. Acender era um ScrollTrigger a
         mais por etapa (cinco no total) fazendo exatamente a mesma pergunta que
         este; agora é uma linha no `onStart`, de graça.
         O aceso é uma CLASSE e não uma tween: envolve cor, borda e sombra, e é
         o CSS que sabe traduzir isso nos dois temas. */
      const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-step-dot]')).map((dot) =>
        gsap.fromTo(
          dot,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'snap',
            onStart: () => dot.classList.add('is-lit'),
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
        {/* Dois níveis de propósito: o de fora é o que o ScrollSmoother move
            pelo `data-speed`, o de dentro é o que deriva sozinho. Numa div só,
            a animação CSS de `transform` sobrescreveria o transform que o
            parallax escreve, e o brilho ficaria parado no scroll. */}
        <div
          data-speed="0.9"
          className="absolute left-1/2 top-0 h-[52vw] max-h-[620px] w-[92vw] max-w-[1100px] -translate-x-1/2"
        >
          <div className="glow-band absolute inset-0 animate-drift-a opacity-55 blur-[100px]" />
        </div>
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
            data-step-track
            aria-hidden="true"
            className="absolute bottom-6 left-[26px] top-6 w-[2px] md:left-1/2 md:-translate-x-1/2"
          >
            <span className="absolute inset-0 rounded-full bg-tint/8" />
            <span
              data-step-progress
              className="absolute inset-0 origin-top rounded-full bg-brand-gradient"
              style={{ transform: 'scaleY(0)' }}
            />
            {/* ponta luminosa que viaja na frente do traço */}
            <span
              data-step-head
              className="absolute -left-[3px] top-0 h-2 w-2 rounded-full bg-brand-2 shadow-[0_0_16px_4px_rgba(2,179,249,.55)]"
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
                    className="step-dot absolute left-0 top-0 z-10 grid h-[54px] w-[54px] place-items-center rounded-2xl border border-hair bg-panel text-accent-ink shadow-[0_10px_30px_-16px_rgba(0,0,0,.9)] md:left-1/2 md:top-1/2 md:h-[58px] md:w-[58px] md:-translate-x-1/2 md:-translate-y-1/2"
                  >
                    {/* deriva desencontrada: o compasso vem do índice da etapa */}
                    <span
                      className="block animate-icon-drift"
                      style={{
                        animationDelay: stepDelays[i % stepDelays.length],
                        animationDuration: stepDurations[i % stepDurations.length],
                      }}
                    >
                      <Icon name={step.icon} size={24} />
                    </span>
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
