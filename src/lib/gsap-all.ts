'use client';

/**
 * =============================================================================
 * REGISTRO COMPLETO DO GSAP (opcional)
 * =============================================================================
 * Este arquivo reproduz integralmente o snippet de registro fornecido, com
 * TODOS os plugins do GSAP. Ele NÃO é importado por padrão: o site usa
 * `src/lib/gsap.ts`, que registra somente os plugins realmente utilizados —
 * o que mantém o JavaScript enviado ao navegador menor e a nota de
 * performance mais alta.
 *
 * Para habilitar o pacote inteiro, troque os imports de `@/lib/gsap`
 * por `@/lib/gsap-all` nos componentes que precisarem.
 *
 * Observação sobre ESM x UMD:
 * ---------------------------
 * Em Next.js com App Router, use SEMPRE a forma ESM (abaixo): `gsap/ScrollTrigger`.
 * A forma UMD (`gsap/dist/ScrollTrigger`) existe para bundlers antigos e para
 * ambientes sem suporte a ES Modules; usá-la aqui apenas aumentaria o bundle,
 * já que os arquivos `dist` não são tree-shakeable.
 *
 * Equivalência (referência):
 *   ESM  →  import { ScrollTrigger } from "gsap/ScrollTrigger";
 *   UMD  →  import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
 * =============================================================================
 */

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { CustomEase } from 'gsap/CustomEase';
// CustomBounce requer CustomEase
import { CustomBounce } from 'gsap/CustomBounce';
// CustomWiggle requer CustomEase
import { CustomWiggle } from 'gsap/CustomWiggle';
import { RoughEase, ExpoScaleEase, SlowMo } from 'gsap/EasePack';

import { Draggable } from 'gsap/Draggable';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { EaselPlugin } from 'gsap/EaselPlugin';
import { Flip } from 'gsap/Flip';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Observer } from 'gsap/Observer';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// ScrollSmoother requer ScrollTrigger
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';

// GSDevTools e MotionPathHelper são ferramentas de DESENVOLVIMENTO.
// Mantenha-as fora do build de produção para não enviar código inútil ao usuário.
// Para usá-las localmente, descomente as duas linhas abaixo e adicione-as ao
// registerPlugin — e comente novamente antes do deploy.
// import { GSDevTools } from 'gsap/GSDevTools';
// import { MotionPathHelper } from 'gsap/MotionPathHelper';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    useGSAP,
    Draggable,
    DrawSVGPlugin,
    EaselPlugin,
    Flip,
    InertiaPlugin,
    MotionPathPlugin,
    MorphSVGPlugin,
    Observer,
    Physics2DPlugin,
    PhysicsPropsPlugin,
    ScrambleTextPlugin,
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    SplitText,
    TextPlugin,
    RoughEase,
    ExpoScaleEase,
    SlowMo,
    CustomEase,
    CustomBounce,
    CustomWiggle,
  );
}

export * from 'gsap';
export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin };
