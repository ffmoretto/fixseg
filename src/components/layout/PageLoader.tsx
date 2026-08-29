'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import LogoLockup from '@/components/brand/LogoLockup';

/**
 * Animação de carregamento: cortina escura com a marca e uma barra de
 * progresso. Sai em menos de 1,2s e nunca bloqueia o conteúdo — o HTML já
 * está renderizado por baixo (bom para SEO e para o LCP).
 *
 * A cortina é removida do DOM ao final, portanto não custa nada depois.
 */
export function PageLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced) {
        setDone(true);
        return;
      }

      const tl = gsap.timeline({ onComplete: () => setDone(true) });

      tl.to('[data-loader-mark]', { opacity: 1, y: 0, duration: 0.5, ease: 'brand' })
        .to('[data-loader-bar]', { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, '-=0.24')
        .to('[data-loader-mark], [data-loader-track]', { opacity: 0, duration: 0.28, ease: 'brandIn' })
        .to(el, { yPercent: -100, duration: 0.72, ease: 'brandOut' }, '-=0.1');

      return () => tl.kill();
    },
    { dependencies: [reduced], scope: ref },
  );

  if (done) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] flex flex-col items-center justify-center gap-7 bg-page"
    >
      <LogoLockup
        data-loader-mark
        style={{ height: 62, width: 'auto' }}
        className="translate-y-3 text-fg opacity-0"
      />
      <span
        data-loader-track
        className="block h-[2px] w-[140px] overflow-hidden rounded-full bg-tint/10"
      >
        <span data-loader-bar className="block h-full origin-left scale-x-0 bg-brand-gradient" />
      </span>
    </div>
  );
}

export default PageLoader;
