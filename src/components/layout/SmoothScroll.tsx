'use client';

import { useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP, ScrollSmoother, ScrollTrigger, someTargets } from '@/lib/gsap';
import { prefersReducedMotion, useIsMobile } from '@/hooks/useReducedMotion';

/**
 * Rolagem suavizada (ScrollSmoother) com parallax por atributo `data-speed`
 * e `data-lag`.
 *
 * Regras aplicadas:
 *  - desligada em `prefers-reduced-motion` (acessibilidade);
 *  - desligada em telas de toque, onde o scroll nativo é mais fluido e
 *    interceptá-lo prejudica o desempenho e a sensação de resposta;
 *  - `effects: true` habilita parallax declarativo sem JS extra por elemento.
 *
 * Para desativar globalmente, mude ENABLE_SMOOTH para false.
 */
const ENABLE_SMOOTH = true;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const isMobile = useIsMobile(1024);
  const pathname = usePathname();

  useGSAP(
    () => {
      const enabled = ENABLE_SMOOTH && !reduced && !isMobile;

      if (!enabled) {
        ScrollSmoother.get()?.kill();
        // garante que os efeitos declarativos não fiquem com transform residual
        // (nas páginas sem parallax a lista é vazia, daí a verificação)
        const parallax = someTargets(document.querySelectorAll('[data-speed], [data-lag]'));
        if (parallax) gsap.set(parallax, { clearProps: 'transform' });
        ScrollTrigger.refresh();
        return;
      }

      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        /* Era 1.05 e engolia cliques. Com 1,05s de easing, um clique logo
           depois de rolar era engolido: a página ainda estava se acomodando
           entre o `mousedown` e o `mouseup`, e o elemento saía de baixo do
           ponteiro. O navegador só dispara `click` no ancestral comum aos dois
           eventos — se o botão escapou, o `click` vai parar num contêiner e o
           botão nunca é acionado.

           Medido nesta página, do último evento de roda até o conteúdo parar:
             smooth 1.05 → 693–797ms
             smooth 0.60 → 483–602ms
           E, tomando um clique humano (90ms segurando) 430ms após a roda, o
           quanto a página ainda anda embaixo do ponteiro cai de 8–10px para
           1px. Dá para conferir abrindo um item do FAQ logo após uma rolagem.

           0,6s ainda é rolagem suavizada — só deixou de disputar o ponteiro com
           quem está clicando. */
        smooth: 0.6,
        effects: true,
        normalizeScroll: false,
        ignoreMobileResize: true,
      });

      /* Recalcula os gatilhos já registrados (pin da narrativa, contadores,
         barras de progresso) agora que o scroller passou a ser o smoother. */
      ScrollTrigger.refresh();

      // reposiciona corretamente ao abrir a página com âncora na URL
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          requestAnimationFrame(() => smoother.scrollTo(target as HTMLElement, false, 'top 96px'));
        }
      }

      return () => {
        smoother.kill();
        ScrollTrigger.refresh();
      };
    },
    { dependencies: [reduced, isMobile, pathname] },
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}

export default SmoothScroll;
