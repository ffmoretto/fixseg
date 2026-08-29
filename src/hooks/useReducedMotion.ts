'use client';

import { useEffect, useState } from 'react';

/**
 * =============================================================================
 * PREFERÊNCIA DE MOVIMENTO
 * =============================================================================
 * A decisão é tomada por um script que roda ANTES da primeira pintura
 * (src/app/layout.tsx) e gravada no atributo `data-motion` do <html>:
 *
 *   data-motion="full"     → animações ligadas
 *   data-motion="reduced"  → animações desligadas
 *
 * Ele considera, nesta ordem: a escolha explícita do visitante (parâmetro
 * `?motion=full|reduced|auto`, guardada no navegador) e, na ausência dela, a
 * preferência do sistema operacional (`prefers-reduced-motion`).
 *
 * Por que existe o override: em Windows e macOS o "movimento reduzido" liga
 * sozinho em economia de bateria e em perfis de desempenho. Nessas situações o
 * site fica inteiramente estático — correto do ponto de vista de
 * acessibilidade, mas indistinguível de um site quebrado para quem não sabe da
 * configuração. `?motion=full` permite ver a experiência completa sem mexer no
 * sistema, e `?motion=auto` volta a seguir o SO.
 * =============================================================================
 */

export type MotionMode = 'full' | 'reduced';

export const MOTION_STORAGE_KEY = 'fixseg:motion';
/** Evento disparado quando o modo muda em tempo de execução. */
export const MOTION_EVENT = 'fixseg:motionchange';

/**
 * Leitura SÍNCRONA do modo atual. Use dentro de efeitos e callbacks do GSAP.
 *
 * Preferir esta função a `useReducedMotion()` nos efeitos evita que a animação
 * seja construída com o valor errado e reconstruída em seguida — o que, no caso
 * de seções fixadas (pin), deixava o ScrollTrigger em estado inconsistente.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  const mode = document.documentElement.dataset.motion;
  if (mode === 'reduced') return true;
  if (mode === 'full') return false;
  /* Sem o atributo (script bloqueado, por exemplo): consulta o SO. */
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Modo atual como string. */
export function motionMode(): MotionMode {
  return prefersReducedMotion() ? 'reduced' : 'full';
}

/**
 * Define explicitamente o modo e persiste a escolha.
 * `null` volta a seguir o sistema operacional.
 */
export function setMotionOverride(mode: MotionMode | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode) window.localStorage.setItem(MOTION_STORAGE_KEY, mode);
    else window.localStorage.removeItem(MOTION_STORAGE_KEY);
  } catch {
    /* navegação privada ou armazenamento bloqueado: segue só nesta sessão */
  }

  const effective =
    mode ?? (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full');
  document.documentElement.dataset.motion = effective;
  window.dispatchEvent(new Event(MOTION_EVENT));
}

/** A escolha explícita salva, ou null quando está seguindo o sistema. */
export function motionOverride(): MotionMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(MOTION_STORAGE_KEY);
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Versão em estado do React, para decisões que afetam o HTML renderizado.
 *
 * Começa em `false` de propósito: é o mesmo valor do servidor, o que mantém a
 * hidratação consistente. Em efeitos, use `prefersReducedMotion()`.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const sync = () => setReduced(prefersReducedMotion());
    sync();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', sync);
    window.addEventListener(MOTION_EVENT, sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener(MOTION_EVENT, sync);
    };
  }, []);

  return reduced;
}

/**
 * true em telas pequenas / dispositivos de toque — usado para aliviar animações.
 *
 * O valor inicial é lido de forma SÍNCRONA no primeiro render do cliente.
 * Isso é essencial: se começássemos com `false` e corrigíssemos num efeito,
 * a rolagem suavizada seria criada e destruída em seguida — e essa destruição
 * quebrava os elementos fixados (pin) da narrativa em scroll no celular.
 *
 * Use este hook apenas para decisões de animação, nunca para alterar o HTML
 * renderizado, para não causar divergência de hidratação.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return mobile;
}
