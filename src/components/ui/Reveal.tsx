'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export type RevealAnim = 'up' | 'down' | 'left' | 'right' | 'scale' | 'rise' | 'clip';

interface RevealProps {
  children: ReactNode;
  /** Direção/estilo da entrada */
  anim?: RevealAnim;
  /** Atraso em segundos */
  delay?: number;
  duration?: number;
  /** Distância em px do deslocamento inicial */
  distance?: number;
  /** Anima os filhos marcados com data-reveal-item em cascata */
  stagger?: number;
  /** Ponto de disparo do ScrollTrigger */
  start?: string;
  as?: ElementType;
  className?: string;
  /** Reanima ao sair e voltar para a viewport */
  repeat?: boolean;
  id?: string;
}

/**
 * Invólucro de animação de entrada por scroll.
 *
 * O estado inicial vem do CSS (`[data-anim]` em globals.css), aplicado apenas
 * quando o JavaScript está ativo — assim não há "flash" de conteúdo nem
 * conteúdo invisível para quem navega sem JS ou com leitor de tela.
 * Com `prefers-reduced-motion`, o elemento é entregue pronto, sem animação.
 */
export function Reveal({
  children,
  anim = 'up',
  delay = 0,
  duration = 0.85,
  distance,
  stagger,
  start = 'top 86%',
  as: Tag = 'div',
  className,
  repeat = false,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const targets = stagger
        ? (Array.from(el.querySelectorAll('[data-reveal-item]')) as HTMLElement[])
        : [el];

      if (!targets.length) return;

      if (reduced) {
        targets.forEach((t) => t.classList.add('is-in'));
        el.classList.add('is-in');
        gsap.set(targets, { clearProps: 'all' });
        return;
      }

      const to: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        ease: 'brand',
        stagger: stagger ? { each: stagger, from: 'start' } : undefined,
        onStart: () => targets.forEach((t) => t.classList.add('is-in')),
        clearProps: 'transform,opacity,clipPath',
      };

      if (anim === 'clip') {
        to.clipPath = 'inset(0 0 0% 0)';
        delete to.y;
        delete to.scale;
      }

      const tween = gsap.to(targets, {
        ...to,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: repeat ? 'play none none reverse' : 'play none none none',
          once: !repeat,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reduced, anim, delay, duration, stagger, start, repeat], scope: ref },
  );

  const style = distance ? ({ ['--anim-dist' as string]: `${distance}px` } as React.CSSProperties) : undefined;

  return (
    <Tag
      id={id}
      ref={ref as never}
      data-anim={stagger ? undefined : anim}
      className={cn(className)}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** Filho de um Reveal com `stagger`. */
export function RevealItem({
  children,
  anim = 'up',
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  anim?: RevealAnim;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag data-reveal-item data-anim={anim} className={className}>
      {children}
    </Tag>
  );
}

/** Atualiza os cálculos do ScrollTrigger (chamar após mudar altura de conteúdo). */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

export default Reveal;
