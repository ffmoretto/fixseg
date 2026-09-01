'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, ScrollSmoother, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * =============================================================================
 * NAVEGAÇÃO POR ÂNCORAS
 * =============================================================================
 * Por que este componente existe:
 *
 * A rolagem nativa por âncora (`scroll-behavior: smooth` do CSS ou o salto
 * padrão do navegador) entra em conflito com o ScrollSmoother — ele controla a
 * posição do conteúdo por transform, e um salto nativo o deixa dessincronizado:
 * a página vai para o lugar errado e as animações de entrada da seção não
 * disparam. É por isso que `scroll-behavior: smooth` foi removido do CSS.
 *
 * Aqui interceptamos os cliques em links de âncora da própria página e
 * executamos a rolagem pelo caminho correto:
 *   · com ScrollSmoother ativo  → smoother.scrollTo()
 *   · sem ScrollSmoother        → gsap + ScrollToPlugin
 *   · com movimento reduzido    → salto instantâneo, sem animação
 *
 * O deslocamento do header fixo é sempre descontado, e o endereço na barra do
 * navegador é atualizado sem provocar novo salto (`history.replaceState`).
 * =============================================================================
 */

/* Folga de respiro entre o cabeçalho e o título da seção de destino. */
const FOLGA = 14;

/* Reserva usada quando a barra ainda não existe no DOM (primeiro clique antes
   da montagem do header). Corresponde à barra rolada mais a folga. */
const OFFSET_PADRAO = 96;

/**
 * Quanto descontar da posição de destino, MEDIDO na hora.
 *
 * Antes isto era uma constante (96px, "a barra rolada de 76px mais folga"), e o
 * número envelheceu duas vezes: a barra cresceu junto com a logo e passou a ter
 * altura diferente no celular (84px) e no desktop (92px). Medir o elemento
 * resolve de uma vez — inclusive para quem mexer nas alturas depois, sem
 * precisar lembrar de vir aqui.
 *
 * Ler `offsetHeight` num tratador de clique é seguro: acontece uma vez por
 * clique, fora do render, então não há divergência de hidratação nem
 * "layout thrash" durante a animação.
 */
function headerOffset(): number {
  if (typeof document === 'undefined') return OFFSET_PADRAO;
  const barra = document.querySelector<HTMLElement>('[data-header-bar]');
  return barra ? barra.offsetHeight + FOLGA : OFFSET_PADRAO;
}

export function AnchorScroll() {
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const scrollToTarget = (target: Element, instant = false) => {
      const smoother = ScrollSmoother.get();
      /* Medido a cada rolagem: a barra tem alturas diferentes no celular e no
         desktop, e muda de altura ao rolar. */
      const HEADER_OFFSET = headerOffset();

      if (smoother) {
        smoother.scrollTo(target as HTMLElement, !instant, `top ${HEADER_OFFSET}px`);
        return;
      }

      const y =
        (target as HTMLElement).getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      if (instant) {
        window.scrollTo({ top: y, behavior: 'auto' });
        ScrollTrigger.refresh();
        return;
      }

      /* `autoKill: false` é intencional. Com ele ligado, o ScrollToPlugin
         interrompe a rolagem ao detectar qualquer variação de posição — e a
         seção fixada da narrativa provoca exatamente isso, fazendo a página
         parar cerca de 100px antes do destino. O `onComplete` garante a
         posição final exata mesmo se o layout tiver mudado no caminho. */
      gsap.to(window, {
        scrollTo: { y, autoKill: false },
        duration: 0.95,
        ease: 'brand',
        overwrite: 'auto',
        onComplete: () => {
          /* Correção final: se o layout mudou durante a rolagem (alturas de
             seções fixadas, imagens carregando), ajusta a posição exata. */
          const settle = () => {
            const exact =
              (target as HTMLElement).getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            if (Math.abs(exact - window.scrollY) > 4) {
              window.scrollTo({ top: exact, behavior: 'auto' });
            }
          };
          settle();
          window.setTimeout(settle, 300);
        },
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      /* aceita "#secao" e "/#secao"; ignora links para outras páginas */
      const hash = href.startsWith('#')
        ? href.slice(1)
        : href.startsWith('/#')
          ? href.slice(2)
          : null;
      if (!hash) return;

      const target = document.getElementById(hash);
      if (!target) return;

      event.preventDefault();
      history.replaceState(null, '', `#${hash}`);

      /* Espera um instante antes de rolar.
         Quando o clique vem do menu mobile, o React ainda precisa fechar o
         painel e liberar a trava de rolagem do body (`overflow: hidden`).
         Rolar antes disso fazia a página parar cerca de 100px antes do alvo. */
      window.setTimeout(() => scrollToTarget(target, reduced), 90);
    };

    /* Fase de CAPTURA (terceiro argumento `true`).
       O <Link> do Next.js registra o handler dele na raiz da aplicação, que
       fica abaixo do document na árvore — ou seja, ele rodaria ANTES de um
       listener normal daqui e já teria feito a navegação (com rolagem nativa
       pelo fragmento). Capturando, o `preventDefault` acontece primeiro e o
       Next respeita, deixando a rolagem por nossa conta. */
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [reduced, pathname]);

  /* Ao abrir a página já com uma âncora na URL (ex.: vindo de outra página),
     posiciona no destino depois que o layout está estável. */
  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;

    const id = window.setTimeout(() => {
      const HEADER_OFFSET = headerOffset();
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.scrollTo(target, false, `top ${HEADER_OFFSET}px`);
      } else {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
          behavior: 'auto',
        });
      }
      ScrollTrigger.refresh();
    }, 420);

    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

export default AnchorScroll;
