'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Animação de sucesso: o círculo é desenhado, o check da marca aparece e
 * duas ondas se expandem. Usada após o envio de formulários.
 */
export function SuccessCheck({ size = 104 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced) {
        gsap.set(el.querySelectorAll('circle, path'), { drawSVG: '100%', opacity: 1 });
        return;
      }

      const tl = gsap.timeline();

      tl.fromTo(
        '[data-success-ring]',
        { drawSVG: '0%', rotate: -90, transformOrigin: '50% 50%' },
        { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' },
      )
        .fromTo(
          '[data-success-check]',
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.42, ease: 'power2.out' },
          '-=0.18',
        )
        .fromTo(
          '[data-success-wave]',
          { scale: 0.55, opacity: 0.55 },
          {
            scale: 1.5,
            opacity: 0,
            duration: 1.5,
            stagger: 0.22,
            ease: 'power2.out',
            transformOrigin: '50% 50%',
          },
          '-=0.3',
        );

      return () => tl.kill();
    },
    { dependencies: [reduced], scope: ref },
  );

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="success-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--brand))" />
            <stop offset="100%" stopColor="rgb(var(--brand-2))" />
          </linearGradient>
        </defs>

        {[0, 1].map((i) => (
          <circle
            key={i}
            data-success-wave
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgb(var(--brand-2))"
            strokeWidth="1.2"
            opacity="0"
          />
        ))}

        <circle
          data-success-ring
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#success-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          data-success-check
          d="M31 51.5 44 64.5 70 35"
          fill="none"
          stroke="url(#success-grad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default SuccessCheck;
