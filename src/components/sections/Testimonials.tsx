'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, useGSAP, Observer } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { testimonials, testimonialsAutoplay } from '@/config/content';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Carrossel de depoimentos.
 *
 * Só é renderizado quando existem depoimentos reais cadastrados em
 * src/config/content.ts → `testimonials`. Nada é inventado: a lista começa
 * vazia e a seção simplesmente não aparece até ser preenchida.
 *
 * Recursos: setas, indicadores, swipe (Observer do GSAP), autoplay opcional
 * que pausa no hover, no foco e quando a aba está em segundo plano.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const total = testimonials.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  /* transição entre cards */
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const cards = track.querySelectorAll<HTMLElement>('[data-testimonial]');
      if (!cards.length) return;

      cards.forEach((card, i) => {
        const active = i === index;
        if (reduced) {
          gsap.set(card, { autoAlpha: active ? 1 : 0, x: 0, scale: 1 });
          return;
        }
        gsap.to(card, {
          autoAlpha: active ? 1 : 0,
          x: active ? 0 : i < index ? -42 : 42,
          scale: active ? 1 : 0.97,
          duration: 0.62,
          ease: 'brand',
          pointerEvents: active ? 'auto' : 'none',
        });
      });
    },
    { dependencies: [index, reduced] },
  );

  /* swipe / arraste */
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || total < 2) return;

      const obs = Observer.create({
        target: track,
        type: 'touch,pointer',
        tolerance: 42,
        preventDefault: false,
        onLeft: () => go(index + 1),
        onRight: () => go(index - 1),
      });

      return () => obs.kill();
    },
    { dependencies: [index, total, go] },
  );

  /* autoplay */
  useEffect(() => {
    if (!testimonialsAutoplay || reduced || paused || total < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), testimonialsAutoplay);
    return () => clearInterval(t);
  }, [paused, reduced, total]);

  if (total === 0) return null;

  return (
    <section id="depoimentos" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Depoimentos"
          title="O que nossos clientes dizem"
          highlight="nossos clientes"
          className="mx-auto"
        />

        <div
          className="relative mx-auto mt-14 max-w-[52rem]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="relative min-h-[300px] touch-pan-y sm:min-h-[268px]"
            role="region"
            aria-roledescription="carrossel"
            aria-label="Depoimentos de clientes"
            aria-live="polite"
          >
            {testimonials.map((t, i) => (
              <figure
                key={`${t.author}-${i}`}
                data-testimonial
                aria-hidden={i !== index}
                className={cn(
                  'surface absolute inset-0 flex flex-col justify-between p-8 md:p-11',
                  i !== index && 'opacity-0',
                )}
              >
                <Icon name="quote" size={34} className="text-accent-ink/35" />

                <blockquote className="mt-5 flex-1">
                  <p className="font-display text-[1.125rem] leading-relaxed text-fg md:text-[1.375rem]">
                    {t.quote}
                  </p>
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-4 border-t border-hair pt-6">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt=""
                      width={48}
                      height={48}
                      loading="lazy"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-hair bg-tint/[.04] font-display text-[1.0625rem] font-semibold text-accent-ink">
                      {t.author.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="font-display text-[1.0625rem] font-semibold text-fg">
                      {t.author}
                    </p>
                    <p className="text-[.9375rem] text-fg-4">
                      {[t.role, t.product].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* controles */}
          {total > 1 && (
            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Depoimento anterior"
                className="grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:-translate-x-0.5 hover:border-brand-2/55 hover:text-fg"
              >
                <Icon name="chevron-left" size={17} />
              </button>

              <div className="flex items-center gap-2" role="tablist" aria-label="Selecionar depoimento">
                {testimonials.map((t, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Depoimento ${i + 1} de ${total}`}
                    onClick={() => go(i)}
                    className={cn(
                      'h-[6px] rounded-full transition-all duration-500 ease-brand',
                      i === index ? 'w-7 bg-brand-gradient' : 'w-[6px] bg-tint/20 hover:bg-tint/40',
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Próximo depoimento"
                className="grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:translate-x-0.5 hover:border-brand-2/55 hover:text-fg"
              >
                <Icon name="chevron-right" size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
