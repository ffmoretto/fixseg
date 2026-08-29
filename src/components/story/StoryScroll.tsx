'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger, someTargets } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { storyChapters, storyIntro, type SceneKey } from '@/config/story';
import { insuranceBySlug } from '@/config/insurances';
import { CTA } from '@/config/site';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import { LinkButton } from '@/components/ui/Button';

import LifeScene from './scenes/LifeScene';
import HomeScene from './scenes/HomeScene';
import RoadScene from './scenes/RoadScene';
import CargoScene from './scenes/CargoScene';
import BusinessScene from './scenes/BusinessScene';
import ShieldScene from './scenes/ShieldScene';

const scenes: Record<SceneKey, React.ComponentType> = {
  life: LifeScene,
  home: HomeScene,
  road: RoadScene,
  cargo: CargoScene,
  business: BusinessScene,
  shield: ShieldScene,
};

/**
 * =============================================================================
 * NARRATIVA EM SCROLL — "O imprevisto não avisa"
 * =============================================================================
 * Seção fixada na tela (pin) com timeline atrelada ao scroll (scrub). Cada
 * capítulo passa por três estados encadeados:
 *
 *   1. CONSTRUÇÃO  o traço é desenhado (DrawSVG): a vida, a casa, o veículo,
 *                  a carga, a empresa — o que existe e funciona.
 *   2. IMPREVISTO  os elementos de risco entram com impacto e a cena perde a
 *                  cor da marca: é o momento em que algo dá errado.
 *   3. PROTEÇÃO    o escudo se forma, o check da FIXSEG é desenhado e a cena
 *                  recupera a cor — a perda deixa de ser ruína.
 *
 * Decisões de desempenho e acessibilidade:
 *  - só `transform` e `opacity` são animados (nada que force layout);
 *  - `gsap.matchMedia` reduz a complexidade em telas pequenas (sem DrawSVG
 *    de traço longo, sem tremor de cena);
 *  - com `prefers-reduced-motion`, o pin é desligado e os capítulos viram
 *    uma lista vertical legível, sem movimento.
 * =============================================================================
 */
export function StoryScroll() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const stage = pin.current;
      if (!section || !stage) return;

      /* Leitura SÍNCRONA da preferência de movimento.
         Antes isso vinha de um estado do React que começava em `false` e era
         corrigido depois — o pin era construído com o valor errado e
         desmontado em seguida, o que deixava o ScrollTrigger inconsistente. */
      const reduced = prefersReducedMotion();

      /* ------------------------------------------------ versão sem movimento
         Com `prefers-reduced-motion` a narrativa deixa de ser fixada e passa a
         ser uma lista vertical legível. Aqui limpamos QUALQUER estilo inline
         deixado por uma execução anterior (o hook roda de novo quando a
         preferência é detectada) e forçamos tudo visível — inclusive os
         elementos de risco e de proteção das cenas, para que a história possa
         ser lida por completo, parada. */
      if (reduced) {
        /* Blocos de layout (HTML): posição e filtro podem ser zerados. */
        const blocks = someTargets(
          stage.querySelectorAll<HTMLElement>('[data-chapter], [data-scene], [data-text]'),
        );
        if (blocks) {
          gsap.set(blocks, { clearProps: 'all' });
          gsap.set(blocks, { autoAlpha: 1, opacity: 1, y: 0, x: 0, scale: 1, filter: 'none' });
        }

        /* Peças internas das ilustrações: aqui NÃO se mexe em transform.
           Um grupo de SVG carrega a própria posição no atributo `transform`
           (translate/scale da cena); zerar isso jogava o selo de proteção e a
           fumaça para o canto do quadro. Limpar os estilos inline devolve o
           atributo original, e só a visibilidade é forçada. */
        const parts = someTargets(
          stage.querySelectorAll<SVGElement | HTMLElement>(
            '[data-scene-fill], [data-scene-risk], [data-scene-shield], [data-scene-orbit]',
          ),
        );
        if (parts) {
          gsap.set(parts, { clearProps: 'transform,opacity,visibility' });
          gsap.set(parts, { autoAlpha: 1 });
        }
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean };

          const chapters = Array.from(stage.querySelectorAll<HTMLElement>('[data-chapter]'));
          const total = chapters.length;

          /* estado inicial: só o primeiro capítulo visível */
          chapters.forEach((ch, i) => {
            gsap.set(ch, { autoAlpha: i === 0 ? 1 : 0 });
            /* Cada capítulo tem um conjunto diferente de elementos, então os
               alvos são verificados antes de irem para o GSAP. */
            const initial: [ArrayLike<Element>, gsap.TweenVars][] = [
              /* massa da ilustração: entra materializando depois do contorno */
              [
                ch.querySelectorAll('[data-scene-fill]'),
                { autoAlpha: 0, y: 12, scale: 0.985, transformOrigin: '50% 100%' },
              ],
              [ch.querySelectorAll('[data-scene-risk]'), { autoAlpha: 0, scale: 0.7 }],
              [ch.querySelectorAll('[data-scene-shield]'), { autoAlpha: 0, scale: 0.72 }],
              [ch.querySelectorAll('[data-scene-orbit]'), { autoAlpha: 0, scale: 0.5 }],
              [
                ch.querySelectorAll('[data-text="risk"], [data-text="answer"], [data-text="related"]'),
                { autoAlpha: 0, y: 18 },
              ],
            ];
            initial.forEach(([list, vars]) => {
              const t = someTargets(list);
              if (t) gsap.set(t, vars);
            });
          });

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              /* O gatilho é o próprio palco (e não a seção inteira): a
                 introdução rola normalmente antes e o pin começa no instante
                 exato em que o palco encosta no topo da janela. */
              trigger: stage,
              start: 'top top',
              end: `+=${total * (isMobile ? 78 : 108)}%`,
              pin: true,
              pinSpacing: true,
              scrub: isMobile ? 0.6 : 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          chapters.forEach((ch, i) => {
            const scene = ch.querySelector<HTMLElement>('[data-scene]');
            /* CONTORNO — traços desenhados pelo DrawSVG.
               `data-scene-draw` pode estar no grupo (e aí os filhos são os
               alvos) ou no próprio traço. `data-scene-build` é o nome antigo,
               mantido para não quebrar nenhuma cena que ainda o use. */
            const strokeSel = (attr: string) =>
              `[${attr}] path, [${attr}] circle, [${attr}] rect, [${attr}] line, [${attr}] polyline, [${attr}] ellipse`;
            const buildStrokes = ch.querySelectorAll(
              `${strokeSel('data-scene-draw')}, ${strokeSel('data-scene-build')}`,
            );
            const buildSelf = ch.querySelectorAll(
              'path[data-scene-draw], path[data-scene-build]',
            );
            /* MASSA — as formas preenchidas da ilustração. */
            const fills = ch.querySelectorAll('[data-scene-fill]');
            const risks = ch.querySelectorAll<SVGElement>('[data-scene-risk]');
            const shields = ch.querySelectorAll('[data-scene-shield]');
            const checks = ch.querySelectorAll('[data-shield-check]');
            const orbits = ch.querySelectorAll('[data-scene-orbit]');

            const kicker = ch.querySelector('[data-text="kicker"]');
            const title = ch.querySelector('[data-text="title"]');
            const build = ch.querySelector('[data-text="build"]');
            const risk = ch.querySelector('[data-text="risk"]');
            const answer = ch.querySelector('[data-text="answer"]');
            const related = ch.querySelector('[data-text="related"]');

            tl.addLabel(`cap-${i}`);

            /* --- entrada do capítulo --------------------------------------
               A saída do capítulo anterior e a entrada do próximo acontecem no
               MESMO instante da timeline (posição absoluta `at`). Sem isso,
               sobra uma janela de scroll em que o capítulo novo já está
               visível mas o texto e a cena ainda não entraram — e o usuário vê
               a tela praticamente vazia. */
            const at = tl.duration();
            /* O capítulo anterior sai um pouco antes de o novo entrar: a
               sobreposição fica em 0,04 — o bastante para parecer dissolução,
               pouco o suficiente para os dois textos nunca se lerem juntos
               (o que embaralhava a leitura no celular). */
            const enter = i > 0 ? at + 0.14 : at;

            if (i > 0) {
              const prev = chapters[i - 1];
              tl.to(prev, { autoAlpha: 0, duration: 0.18 }, at).to(
                prev.querySelector('[data-scene]'),
                { scale: 0.95, yPercent: -3, duration: 0.18 },
                at,
              );
              tl.set(ch, { autoAlpha: 1 }, enter);
            }

            tl.fromTo(
              scene,
              { scale: isMobile ? 1 : 1.04, yPercent: 3, autoAlpha: 0 },
              { scale: 1, yPercent: 0, autoAlpha: 1, duration: 0.38 },
              enter,
            );

            tl.fromTo(
              [kicker, title],
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.06 },
              enter,
            );

            /* --- 1. construção: contorno desenhado, massa materializando ---
               Os dois se sobrepõem de propósito: o traço abre o caminho e a
               forma preenchida chega logo atrás, dando a sensação de que o
               mundo da cena ganha corpo em vez de simplesmente aparecer. */
            if (!isMobile && (buildStrokes.length || buildSelf.length)) {
              tl.fromTo(
                [...Array.from(buildStrokes), ...Array.from(buildSelf)],
                { drawSVG: '0% 0%' },
                { drawSVG: '0% 100%', duration: 0.8, stagger: 0.01 },
                enter,
              );
            }

            if (fills.length) {
              tl.to(
                fills,
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: isMobile ? 0.42 : 0.55,
                  stagger: isMobile ? 0.03 : 0.055,
                  ease: 'power2.out',
                },
                enter + (isMobile ? 0.04 : 0.12),
              );
            }

            tl.fromTo(
              build,
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.36 },
              enter + 0.2,
            );

            /* respiro antes do imprevisto */
            tl.to({}, { duration: 0.3 });

            /* --- 2. o imprevisto ------------------------------------------ */
            if (risks.length) {
              tl.to(scene, { filter: 'saturate(0.15)', duration: 0.3 }, '<');

              const ordered = Array.from(risks).sort(
                (a, b) =>
                  Number(a.getAttribute('data-risk-delay') || 0) -
                  Number(b.getAttribute('data-risk-delay') || 0),
              );

              tl.to(
                ordered,
                { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(2)' },
                '<',
              );

              if (!isMobile) {
                tl.to(
                  scene,
                  { x: -7, duration: 0.06, repeat: 5, yoyo: true, ease: 'none' },
                  '<+=0.12',
                ).set(scene, { x: 0 });
              }
            }

            tl.to(risk, { autoAlpha: 1, y: 0, duration: 0.36 }, '<+=0.08');
            tl.to({}, { duration: 0.34 });

            /* --- 3. a proteção ------------------------------------------- */
            if (shields.length) {
              /* O capítulo final tem escudo mas não tem elementos de risco.
                 Sem esta verificação, o GSAP recebia uma NodeList vazia e
                 avisava "target not found" no console. */
              if (risks.length) {
                tl.to(risks, { autoAlpha: 0.22, duration: 0.35 });
              } else {
                tl.to({}, { duration: 0.35 });
              }

              tl.to(scene, { filter: 'saturate(1)', duration: 0.45 }, '<').to(
                shields,
                { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
                '<+=0.1',
              );

              if (checks.length) {
                tl.fromTo(
                  checks,
                  { drawSVG: '0%' },
                  { drawSVG: '100%', duration: 0.42, ease: 'power2.out' },
                  '<+=0.16',
                );
              }
            }

            if (orbits.length) {
              tl.to(
                orbits,
                { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.06, ease: 'back.out(2)' },
                '<',
              );
            }

            tl.to([answer, related], { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, '<+=0.1');

            /* respiro final do capítulo */
            tl.to({}, { duration: 0.42 });
          });

          /* --------------------------- barra de progresso e marcadores ---- */
          const railFill = stage.querySelector('[data-rail-fill]');
          const railEnd = `+=${total * (isMobile ? 78 : 108)}%`;

          if (railFill) {
            gsap.fromTo(
              railFill,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: { trigger: stage, start: 'top top', end: railEnd, scrub: 0.3 },
              },
            );
          }

          const markers = Array.from(stage.querySelectorAll<HTMLElement>('[data-rail-marker]'));
          const st = ScrollTrigger.create({
            trigger: stage,
            start: 'top top',
            end: railEnd,
            onUpdate: (self) => {
              const active = Math.min(total - 1, Math.floor(self.progress * total));
              markers.forEach((m, i) => m.setAttribute('data-active', String(i <= active)));
            },
          });

          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            st.kill();
          };
        },
      );

      return () => mm.revert();
    },
    /* Sem dependências: a preferência é resolvida antes da primeira pintura,
       então a timeline é montada exatamente uma vez. */
    { dependencies: [], scope: root },
  );

  return (
    <section
      ref={root}
      id="historia"
      aria-labelledby="historia-titulo"
      className="relative bg-page"
    >
      {/* introdução (rola normalmente antes do pin) */}
      <div className="shell relative z-10 pb-14 pt-section text-center md:pb-20">
        <span className="eyebrow justify-center">
          <Icon name="spark" size={13} />
          {storyIntro.eyebrow}
        </span>
        <h2 id="historia-titulo" className="mx-auto mt-5 max-w-[18ch] text-display-lg text-fg">
          {storyIntro.title}
        </h2>
        <p className="mx-auto mt-5 max-w-[52ch] text-[1.125rem] leading-relaxed text-fg-3">
          {storyIntro.subtitle}
        </p>
      </div>

      {/* palco fixado */}
      {/* O layout do modo "movimento reduzido" (lista vertical em vez de seção
          fixada) vem do CSS, via `html[data-motion='reduced'] [data-story-stage]`.
          Manter a marcação idêntica nos dois modos evita divergência de
          hidratação e permite construir a timeline uma única vez. */}
      <div
        ref={pin}
        data-story-stage
        className="relative h-screen-dvh min-h-[620px] overflow-hidden"
      >
        {/* fundo do palco */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-tech-grid opacity-40" />
          <div
            className="glow-a absolute left-1/2 top-1/2 h-[120vh] w-[120vw] -translate-x-1/2 -translate-y-1/2 opacity-70"
            
          />
        </div>

        {/* trilha de progresso — vertical no desktop */}
        <div data-story-rail className="contents">
          <div className="pointer-events-none absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:left-5">
            <div className="relative flex flex-col items-center gap-0">
              <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-tint/10" />
              <span
                data-rail-fill
                className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 origin-top rounded-full bg-brand-gradient"
              />
              {storyChapters.map((c, i) => (
                <span
                  key={c.key}
                  data-rail-marker
                  data-active="false"
                  className="group relative flex items-center gap-3 py-[22px] transition-opacity duration-500 data-[active=false]:opacity-40"
                >
                  <span className="relative z-10 grid h-[13px] w-[13px] place-items-center rounded-full border border-hair-strong bg-page transition-colors duration-500 group-data-[active=true]:border-brand-2">
                    <span className="h-[5px] w-[5px] rounded-full bg-tint/25 transition-colors duration-500 group-data-[active=true]:bg-brand-2" />
                  </span>
                  <span className="absolute left-7 hidden whitespace-nowrap text-[.75rem] font-semibold uppercase tracking-[0.2em] text-fg-4 transition-colors duration-500 group-data-[active=true]:text-fg-2 2xl:block">
                    {i + 1 < 10 ? `0${i + 1}` : i + 1} {c.marker}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* capítulos */}
        {storyChapters.map((chapter, index) => {
          const SceneComponent = scenes[chapter.key];
          const isFinal = chapter.key === 'shield';

          return (
            <article
              key={chapter.key}
              data-chapter
              className="absolute inset-0 flex h-full flex-col justify-center opacity-0"
            >
              <div
                className={cn(
                  'shell grid w-full items-center gap-5 sm:gap-8 lg:gap-14',
                  isFinal ? 'lg:grid-cols-1 lg:justify-items-center' : 'lg:grid-cols-[.92fr_1.08fr]',
                )}
              >
                {/* texto */}
                <div
                  className={cn(
                    'order-2 max-w-[34rem] lg:order-1',
                    isFinal && 'order-2 text-center lg:order-2 lg:max-w-[46rem] lg:text-center',
                  )}
                >
                  <p
                    data-text="kicker"
                    className={cn('eyebrow', isFinal && 'justify-center')}
                  >
                    <span className="font-mono text-accent-ink">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-[1px] w-6 bg-brand-2/50" />
                    {chapter.kicker}
                  </p>

                  <h3
                    data-text="title"
                    className="mt-3 text-[1.5625rem] font-semibold leading-[1.12] tracking-[-0.02em] text-fg sm:mt-4 sm:text-display-md"
                  >
                    {chapter.title}
                  </h3>

                  <p
                    data-text="build"
                    className="mt-3.5 text-[.96875rem] leading-relaxed text-fg-3 sm:mt-5 sm:text-[1.0625rem] md:text-[1.125rem]"
                  >
                    {chapter.build}
                  </p>

                  <p
                    data-text="risk"
                    className="mt-3.5 border-l-2 border-hair-strong pl-3.5 text-[.96875rem] font-medium leading-relaxed text-fg-2 sm:mt-5 sm:pl-4 sm:text-[1.0625rem] md:text-[1.125rem]"
                  >
                    {chapter.risk}
                  </p>

                  <p
                    data-text="answer"
                    className={cn(
                      'mt-3.5 border-l-2 border-brand-2 pl-3.5 text-[.96875rem] leading-relaxed text-fg sm:mt-5 sm:pl-4 sm:text-[1.0625rem] md:text-[1.125rem]',
                      isFinal &&
                        'border-l-0 pl-0 font-display text-[1.125rem] sm:pl-0 sm:text-display-sm',
                    )}
                  >
                    {chapter.answer}
                  </p>

                  {chapter.related.length > 0 && (
                    <div data-text="related" className="mt-5 flex flex-wrap gap-2 sm:mt-7">
                      {chapter.related.map((slug) => {
                        const ins = insuranceBySlug(slug);
                        if (!ins) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/seguros/${slug}`}
                            className="group flex items-center gap-2 rounded-full border border-brand-2/30 bg-brand-2/[.07] px-3.5 py-2 text-[.9375rem] font-medium text-fg transition-all duration-300 ease-brand hover:-translate-y-[2px] hover:border-brand-2/70 hover:bg-brand-2/[.13]"
                          >
                            <Icon name={ins.icon} size={15} className="text-accent-ink" />
                            {ins.name}
                            <Icon
                              name="arrow-up-right"
                              size={13}
                              className="text-fg-4 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:text-accent-ink"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {isFinal && (
                    <div
                      data-text="related"
                      className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row"
                    >
                      <LinkButton href="/cotacao" size="lg" icon="arrow-right">
                        {CTA.primary}
                      </LinkButton>
                      <LinkButton href="/#seguros" variant="secondary" size="lg">
                        Ver todos os seguros
                      </LinkButton>
                    </div>
                  )}
                </div>

                {/* cena */}
                {!isFinal && (
                  <div
                    data-scene
                    className="order-1 mx-auto aspect-[8/5] w-full max-w-[300px] sm:max-w-[440px] lg:order-2 lg:max-w-[560px]"
                  >
                    <SceneComponent />
                  </div>
                )}

                {isFinal && (
                  <div
                    data-scene
                    className="order-1 mx-auto aspect-[8/5] w-full max-w-[240px] sm:max-w-[320px] lg:order-1 lg:max-w-[380px]"
                  >
                    <SceneComponent />
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {/* progresso horizontal — mobile */}
        <div data-story-rail className="contents">
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center lg:hidden">
            <div className="flex items-center gap-1.5 rounded-full border border-hair bg-panel/[.86] px-3 py-2 backdrop-blur-md">
              {storyChapters.map((c) => (
                <span
                  key={c.key}
                  data-rail-marker
                  data-active="false"
                  className="h-[5px] w-5 rounded-full bg-tint/18 transition-colors duration-500 data-[active=true]:bg-brand-2"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StoryScroll;
