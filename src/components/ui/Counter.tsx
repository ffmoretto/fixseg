'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

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
 *
 * O fim da contagem tem dois acabamentos, e é o que separa "um número que sobe"
 * de "um número que chega":
 *
 *  1. ASSENTAMENTO — o número passa um pouco do tamanho final e volta, com a
 *     curva `snap` (a única da marca com overshoot). Escalamos o INVÓLUCRO e
 *     não o texto, porque `transform` não se aplica a elemento em linha.
 *  2. BRILHO — uma faixa atravessa o número UMA vez, no instante em que ele
 *     para. Ela vive num span próprio: o texto é escrito com `textContent`, o
 *     que apagaria qualquer filho colocado dentro do mesmo elemento.
 *
 * A origem do `scale` é a base à esquerda, e não o centro: o contador aparece
 * no meio de uma linha de texto ("Classe 8 de 10") e crescer pelo centro o
 * empurraria por cima dos vizinhos.
 */
export function Counter({ value, prefix = '', suffix = '', duration = 1.9, className }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const sheen = useRef<HTMLSpanElement>(null);
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

      const settle = gsap.timeline({ paused: true });
      if (wrap.current) {
        settle.fromTo(
          wrap.current,
          { scale: 1.075 },
          { scale: 1, duration: 0.72, ease: 'snap', transformOrigin: '0% 100%' },
          0,
        );
      }
      if (sheen.current) {
        const brilho = sheen.current;
        settle.fromTo(
          brilho,
          { xPercent: -140, opacity: 1 },
          {
            xPercent: 140,
            opacity: 1,
            duration: 0.9,
            ease: 'brand',
            /* volta a sumir no fim: a faixa passa UMA vez, e em repouso ela não
               pode ficar desenhável por cima do número */
            onComplete: () => gsap.set(brilho, { opacity: 0 }),
          },
          0.02,
        );
      }

      const tween = gsap.to(obj, {
        n: value,
        duration,
        ease: 'expo.out',
        onUpdate: () => {
          el.textContent = format(obj.n);
        },
        onComplete: () => settle.play(0),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        settle.kill();
      };
    },
    { dependencies: [value, reduced], scope: wrap },
  );

  return (
    <span
      ref={wrap}
      className={cn('counter-live', className)}
      aria-label={`${prefix}${value}${suffix}`}
    >
      <span ref={ref}>
        {prefix}
        {value.toLocaleString('pt-BR')}
        {suffix}
      </span>
      <span ref={sheen} aria-hidden="true" className="counter-sheen" />
    </span>
  );
}

export default Counter;
