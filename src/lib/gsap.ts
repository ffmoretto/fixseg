'use client';

/**
 * =============================================================================
 * REGISTRO CENTRAL DO GSAP
 * =============================================================================
 * Um único ponto de importação e registro. Nenhum componente importa plugins
 * diretamente — todos importam daqui. Isso evita registro duplicado, mantém o
 * bundle previsível e facilita ligar/desligar recursos.
 *
 * Registramos apenas os plugins efetivamente usados no site. O snippet
 * completo fornecido (ESM e UMD, com todos os plugins) está preservado em
 * `src/lib/gsap-all.ts` — importe-o em vez deste arquivo se quiser habilitar
 * o pacote inteiro. Manter apenas o necessário é o que preserva a nota de
 * performance no Lighthouse.
 *
 * A partir do GSAP 3.13 todos os plugins (SplitText, DrawSVG, ScrollSmoother,
 * MorphSVG, Inertia…) fazem parte do pacote público `gsap` no npm.
 * =============================================================================
 */

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { ExpoScaleEase, RoughEase, SlowMo } from 'gsap/EasePack';

let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    DrawSVGPlugin,
    SplitText,
    MotionPathPlugin,
    Observer,
    Flip,
    CustomEase,
    RoughEase,
    ExpoScaleEase,
    SlowMo,
  );

  /* --- Curvas de animação da marca ---------------------------------------- */
  CustomEase.create('brand', 'M0,0 C0.22,1 0.36,1 1,1'); // saída suave, entrada firme
  CustomEase.create('brandIn', 'M0,0 C0.65,0 0.35,1 1,1');
  CustomEase.create('brandOut', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('snap', 'M0,0 C0.34,1.24 0.64,1 1,1'); // leve overshoot p/ microinterações

  /* --- Defaults globais ---------------------------------------------------- */
  gsap.defaults({ ease: 'brand', duration: 0.8 });

  /* --- Comportamento do ScrollTrigger em mobile --------------------------- */
  // Evita o "salto" causado pela barra de endereço do iOS/Android ao rolar.
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.normalizeScroll(false);

  registered = true;
}

/**
 * Devolve os alvos apenas quando existe pelo menos um.
 *
 * O GSAP registra "target not found" no console quando recebe uma NodeList
 * vazia — o que acontece naturalmente aqui, porque cada capítulo da narrativa
 * tem um conjunto diferente de elementos (o último, por exemplo, tem escudo mas
 * não tem elementos de risco). Este helper mantém o console limpo sem esconder
 * problemas reais: um alvo que deveria existir e não existe continua aparecendo
 * como animação que não acontece.
 */
export function someTargets<T extends Element>(list: ArrayLike<T> | null | undefined): T[] | null {
  return list && list.length ? Array.from(list) : null;
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  DrawSVGPlugin,
  SplitText,
  MotionPathPlugin,
  Observer,
  Flip,
  CustomEase,
};
