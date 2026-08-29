'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Icon, { type IconName } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * Composição visual da primeira dobra: um núcleo de proteção com órbitas.
 *
 * Leitura pretendida: no centro, a marca protege; em torno dela, os frentes
 * de risco cobertos pela corretora (vida, casa, veículo, carga, empresa,
 * responsabilidade). O movimento é contínuo mas lento, feito só com
 * `transform` e `opacity` — nenhuma propriedade que force layout.
 *
 * Tudo é vetorial: nenhuma imagem é baixada, o LCP não é penalizado e a
 * nitidez é a mesma em qualquer tela.
 */

interface Node {
  icon: IconName;
  label: string;
  /** ângulo inicial em graus */
  angle: number;
  ring: 1 | 2;
}

const nodes: Node[] = [
  { icon: 'life', label: 'Vida', angle: -90, ring: 1 },
  { icon: 'car', label: 'Auto', angle: -18, ring: 1 },
  { icon: 'cargo', label: 'Carga', angle: 54, ring: 1 },
  { icon: 'home', label: 'Residência', angle: 126, ring: 1 },
  { icon: 'business', label: 'Empresa', angle: 198, ring: 1 },
  { icon: 'truck', label: 'Caminhão', angle: 30, ring: 2 },
  { icon: 'shield-law', label: 'Resp. civil', angle: 150, ring: 2 },
  { icon: 'guarantee', label: 'Garantia', angle: 270, ring: 2 },
];

export function HeroVisual({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (reduced) {
        /* Entrega a composição já montada, sem animar.
           (A linha que buscava `[data-hv-draw]` foi removida: esse atributo não
           existe nesta cena — o check é um traço fixo, não desenhado — e a
           NodeList vazia gerava "target not found" no console.)

           O halo fica de fora: ele não participa da entrada, e forçar
           `opacity: 1` nele acendia o brilho de fundo bem acima do calibrado,
           deixando a primeira dobra lavada justamente no modo em que ela
           deveria ficar mais sóbria. */
        gsap.set(el.querySelectorAll('[data-hv]:not([data-hv="halo"])'), {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ delay: 0.85 }); // entra após título, texto e botões

      tl.from('[data-hv="core"]', { scale: 0.6, opacity: 0, duration: 1, ease: 'snap' })
        .from(
          '[data-hv="check"]',
          { scale: 0.4, opacity: 0, rotate: -12, duration: 0.8, ease: 'snap' },
          '-=0.55',
        )
        .from(
          '[data-hv="ring"]',
          { scale: 0.82, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'brandOut' },
          '-=0.7',
        )
        .from(
          '[data-hv="node"]',
          { scale: 0, opacity: 0, duration: 0.72, stagger: { each: 0.07, from: 'random' }, ease: 'snap' },
          '-=0.75',
        )
        .from(
          '[data-hv="chip"]',
          { y: 16, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'brand', clearProps: 'all' },
          '-=0.5',
        );

      /* O pulso do halo era uma tween infinita do GSAP escalando o elemento;
         virou a animação CSS `animate-halo-breathe`, só de opacidade.
         Duas razões, as duas medidas:
           1. tween infinita paga o motor de animação do GSAP em TODO quadro,
              inclusive com a primeira dobra fora da tela;
           2. o halo tem `blur(64px)`, e escalar uma camada desfocada obriga o
              navegador a rasterizá-la de novo a cada quadro. Opacidade se
              resolve no compositor.
         Como o halo saiu da timeline, ele também saiu do `gsap.set` do modo
         reduzido logo acima. */

      /* leve reação ao mouse (só em ponteiro fino) */
      let ctx: (() => void) | undefined;
      if (window.matchMedia('(pointer: fine)').matches) {
        const xTo = gsap.quickTo('[data-hv="parallax"]', 'x', { duration: 0.9, ease: 'power3' });
        const yTo = gsap.quickTo('[data-hv="parallax"]', 'y', { duration: 0.9, ease: 'power3' });
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - (r.left + r.width / 2)) / r.width;
          const py = (e.clientY - (r.top + r.height / 2)) / r.height;
          xTo(px * 22);
          yTo(py * 22);
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        ctx = () => window.removeEventListener('mousemove', onMove);
      }

      return () => {
        tl.kill();
        ctx?.();
      };
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <div
      ref={root}
      className={cn('relative aspect-square w-full max-w-[560px]', className)}
      aria-hidden="true"
    >
      <div data-hv="parallax" className="absolute inset-0">
        {/* Halo de fundo — respira sozinho, em CSS (ver o comentário no efeito).
            Sem classe `opacity-*`: o valor base mora no keyframe, senão a
            animação o sobrescreveria e o halo entraria mais claro. Com o
            movimento reduzido a animação é zerada e sobra a opacidade padrão,
            1 — daí o `opacity-40` continuar aqui como piso de segurança, e o
            keyframe começar no mesmo lugar. */}
        <div
          data-hv="halo"
          className="glow-core absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 animate-halo-breathe rounded-full opacity-40 blur-[64px]"
        />

        {/* anéis */}
        {[
          { size: '100%', dur: '68s', dir: 'normal' },
          { size: '72%', dur: '52s', dir: 'reverse' },
          { size: '46%', dur: '40s', dir: 'normal' },
        ].map((ring, i) => (
          <div
            key={ring.size}
            data-hv="ring"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: ring.size, height: ring.size }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <circle
                cx="100"
                cy="100"
                r="99"
                fill="none"
                stroke={i === 1 ? 'rgb(var(--brand-2) / .38)' : 'rgb(var(--line) / .18)'}
                strokeWidth="0.5"
                strokeDasharray={i === 1 ? '3 5' : i === 2 ? '1 4' : undefined}
                style={
                  reduced
                    ? undefined
                    : {
                        transformOrigin: '100px 100px',
                        animation: `spin-slow ${ring.dur} linear infinite ${ring.dir === 'reverse' ? 'reverse' : ''}`,
                      }
                }
              />
            </svg>
          </div>
        ))}

        {/* nós orbitais */}
        {[1, 2].map((ringIndex) => (
          <div
            key={ringIndex}
            className="absolute inset-0"
            style={
              reduced
                ? undefined
                : {
                    animation: `spin-slow ${ringIndex === 1 ? '96s' : '74s'} linear infinite ${
                      ringIndex === 2 ? 'reverse' : ''
                    }`,
                  }
            }
          >
            {nodes
              .filter((n) => n.ring === ringIndex)
              .map((n) => {
                const radius = ringIndex === 1 ? 50 : 36; // % do container
                const rad = (n.angle * Math.PI) / 180;
                /* Precisão fixa: `Math.cos`/`Math.sin` podem divergir no
                   último dígito entre o Node e o navegador, e a diferença
                   quebraria a hidratação do React. */
                const x = (50 + radius * Math.cos(rad)).toFixed(2);
                const y = (50 + radius * Math.sin(rad)).toFixed(2);
                return (
                  <div
                    key={n.label}
                    data-hv="node"
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {/* Contra-rotação: mantém a peça em pé enquanto a órbita
                        gira. Precisa ser um elemento SÓ dela — uma segunda
                        animação de `transform` no mesmo elemento venceria esta
                        e a peça giraria junto com a órbita. */}
                    <div
                      style={
                        reduced
                          ? undefined
                          : {
                              animation: `spin-slow ${ringIndex === 1 ? '96s' : '74s'} linear infinite ${
                                ringIndex === 1 ? 'reverse' : ''
                              }`,
                            }
                      }
                    >
                      {/* Os oito nós chegaram a flutuar cada um no seu compasso.
                          Foi CORTADO na medição: oito animações a mais, todas em
                          peças com `backdrop-blur`, custaram quadro na CPU 4×
                          mais lenta por um movimento que a órbita — que já é
                          contínua e já é desencontrada entre os dois anéis — dá
                          de graça. O que respira na primeira dobra são os
                          brilhos, o halo e as duas etiquetas. */}
                      <div className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-hair bg-panel/[.86] text-accent-ink shadow-[0_10px_30px_-16px_rgba(0,0,0,.9)] backdrop-blur-sm md:h-[58px] md:w-[58px]">
                        <Icon name={n.icon} size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

        {/* núcleo */}
        <div
          data-hv="core"
          className="absolute left-1/2 top-1/2 grid h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28%] border border-hair hero-core backdrop-blur-md"
        >
          <svg data-hv="check" viewBox="0 0 100 62" className="w-[58%]">
            <defs>
              <linearGradient id="hv-check" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(var(--brand))" />
                <stop offset="55%" stopColor="rgb(var(--brand-mid))" />
                <stop offset="100%" stopColor="rgb(var(--brand-2))" />
              </linearGradient>
            </defs>
            <path
              d="M6 33 L28 56 L94 6"
              fill="none"
              stroke="url(#hv-check)"
              strokeWidth="13"
              strokeLinecap="square"
            />
          </svg>
        </div>

        {/* selo girando ao redor do núcleo */}
        <div
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2"
          style={reduced ? undefined : { animation: 'spin-slow 34s linear infinite' }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full opacity-70">
            <circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              stroke="url(#hv-arc)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="52 256"
            />
            <defs>
              <linearGradient id="hv-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(var(--brand-2))" />
                <stop offset="100%" stopColor="rgb(var(--brand) / 0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Etiquetas flutuantes — o que "respira" na primeira dobra, junto com os
          brilhos e o halo.

          Três decisões, todas com motivo:
          • A entrada (GSAP, com `clearProps`) fica no elemento de fora e a
            flutuação no de dentro. No mesmo elemento, as duas disputariam a
            propriedade `transform` e uma apagaria a outra.
          • Compassos diferentes: 7,4s e 9,2s, com atraso negativo na segunda.
            Subindo juntas, as duas pareciam um elevador.
          • O `backdrop-blur-md` foi RETIRADO destas duas. Ele obriga o navegador
            a refazer o desfoque do fundo a cada quadro de deslocamento, e era o
            que tornava a flutuação cara. O fundo já é `bg-panel/[.9]`: com 90%
            de opacidade, o desfoque praticamente não aparecia. */}
      <div data-hv="chip" className="absolute -left-1 top-[13%] sm:left-2">
        <div
          className="flex animate-icon-bob items-center gap-2 rounded-full border border-hair bg-panel/[.9] px-3.5 py-2 text-[.8125rem] font-semibold uppercase tracking-[0.14em] text-fg-2 shadow-soft"
          style={{ animationDuration: '7.4s' }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-brand-2" />
            {!reduced && (
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-2" />
            )}
          </span>
          Cobertura ativa
        </div>
      </div>

      <div data-hv="chip" className="absolute bottom-[15%] right-0">
        <div
          className="animate-icon-bob rounded-2xl border border-hair bg-panel/[.9] px-4 py-3 shadow-soft"
          style={{ animationDuration: '9.2s', animationDelay: '-3.6s' }}
        >
          <p className="text-[.75rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
            Pessoas e empresas
          </p>
          <p className="mt-1 font-display text-[1.0625rem] font-semibold text-fg">
            10 frentes de proteção
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;
