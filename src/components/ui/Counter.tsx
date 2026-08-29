'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Contador animado disparado quando entra na viewport.
 * Formata com separador de milhar pt-BR e respeita prefers-reduced-motion.
 */
export function Counter({ value, prefix = '', suffix = '', duration = 1.9, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const format = (n: number) => `${prefix}${Math.round(n).toLocaleString('pt-BR')}${suffix}`;

      if (reduced) {
        el.textContent = format(value);
        return;
      }

      const obj = { n: 0 };
      el.textContent = format(0);

      const tween = gsap.to(obj, {
        n: value,
        duration,
        ease: 'expo.out',
        onUpdate: () => {
          el.textContent = format(obj.n);
        },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [value, reduced], scope: ref },
  );

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      {value.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}

export default Counter;
