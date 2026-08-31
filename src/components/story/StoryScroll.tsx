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
            '[data-scene-fill], [data-scene-risk], [data-scene-shield], [data-scene-orbit], [data-move-when]',
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
            /* A câmera parte de um filtro EXPLÍCITO, não de `none`.
               O GSAP interpola `none` como zero: saindo de `none` para
               `brightness(.86)`, a cena atravessava o quase-preto no meio da
               transição e o instante do imprevisto piscava escuro. Com
               `brightness(1) contrast(1)` a interpolação é numérica, de 1 para
               0,86, e o escurecimento fica no tamanho pedido. */
            const cam = ch.querySelector<HTMLElement>('[data-scene-camera]');
            if (cam) gsap.set(cam, { filter: 'brightness(1) contrast(1)' });

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

          /* Quanto de rolagem cada capítulo consome, em % da altura da janela.
             Era 108% no desktop e 78% no celular — a narrativa inteira pedia
             quase 6.000px de scroll e cansava antes do fim. Encurtar aqui é o
             que deixa a história rápida: mesma quantidade de beats, menos
             estrada entre eles. */
          const porCapitulo = isMobile ? 56 : 70;
          const fim = `+=${total * porCapitulo}%`;

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              /* O gatilho é o próprio palco (e não a seção inteira): a
                 introdução rola normalmente antes e o pin começa no instante
                 exato em que o palco encosta no topo da janela. */
              trigger: stage,
              start: 'top top',
              end: fim,
              pin: true,
              pinSpacing: true,
              scrub: isMobile ? 0.55 : 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          chapters.forEach((ch, i) => {
            const scene = ch.querySelector<HTMLElement>('[data-scene]');
            /* A câmera é uma camada INTERNA da cena. A cena em si cuida da
               entrada e da saída (opacidade, deslocamento); a câmera cuida do
               avanço lento durante o capítulo. Separar as duas evita que uma
               sobrescreva a transformação da outra. */
            const camera = ch.querySelector<HTMLElement>('[data-scene-camera]');
            const flash = ch.querySelector<HTMLElement>('[data-scene-flash]');

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
            const depths = ch.querySelectorAll<SVGElement>('[data-depth]');
            /* ATORES: elementos que se DESLOCAM para representar o caso do
               capítulo (o carro que chega e bate, a caixa que cai, o fogo que
               se espalha). Ver o bloco "movimento dos atores" mais abaixo. */
            const atores = ch.querySelectorAll<SVGElement>('[data-move-when]');

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
            const enter = i > 0 ? at + 0.12 : at;

            if (i > 0) {
              const prev = chapters[i - 1];
              tl.to(prev, { autoAlpha: 0, duration: 0.16 }, at).to(
                prev.querySelector('[data-scene]'),
                { scale: 0.96, yPercent: -2, duration: 0.16 },
                at,
              );
              tl.set(ch, { autoAlpha: 1 }, enter);
            }

            tl.fromTo(
              scene,
              { scale: isMobile ? 0.98 : 1.03, yPercent: 2.5, autoAlpha: 0 },
              { scale: 1, yPercent: 0, autoAlpha: 1, duration: 0.32 },
              enter,
            );

            tl.fromTo(
              [kicker, title],
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05 },
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
                { drawSVG: '0% 100%', duration: 0.62, stagger: 0.008 },
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
                  duration: isMobile ? 0.36 : 0.46,
                  stagger: isMobile ? 0.025 : 0.045,
                  ease: 'power2.out',
                },
                enter + (isMobile ? 0.03 : 0.1),
              );
            }

            tl.fromTo(build, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.3 }, enter + 0.16);

            /* respiro curto antes do imprevisto */
            tl.to({}, { duration: 0.22 });

            /* --- 2. o imprevisto ------------------------------------------ */
            const momentoRisco = tl.duration();

            /* No celular o texto é sequencial: o parágrafo anterior sai antes
               de o próximo entrar. Empilhar os três não cabia na tela — o
               capítulo 5 passava de 830px numa área útil de 745px, e a cena
               subia para trás do cabeçalho. Um pensamento por vez também deixa
               a história mais direta. */
            if (isMobile) {
              tl.to(build, { autoAlpha: 0, y: -12, duration: 0.18 }, momentoRisco - 0.04);
            }

            if (risks.length) {
              /* O clarão: um pulso rápido de luz sobre a cena no instante do
                 impacto. É o que faz o momento parecer um acontecimento e não
                 uma transição. */
              if (flash) {
                tl.fromTo(
                  flash,
                  { autoAlpha: 0 },
                  { autoAlpha: 1, duration: 0.05, ease: 'power2.out' },
                  momentoRisco,
                ).to(flash, { autoAlpha: 0, duration: 0.28 }, momentoRisco + 0.05);
              }

              /* O ambiente fecha. Não é uma camada por cima: é um filtro na
                 própria câmera. Qualquer sobreposição com cor — chapada ou em
                 vinheta — desenha um retângulo visível em volta da ilustração,
                 justamente o "cartão colado" que a máscara de borda das cenas
                 existe para evitar. Um filtro não tem geometria, então não tem
                 borda. O fogo entra em seguida e passa a ser, de longe, a coisa
                 mais clara do quadro. */
              if (camera) {
                tl.to(
                  camera,
                  { filter: 'brightness(0.86) contrast(1.06)', duration: 0.3 },
                  momentoRisco,
                );
              }

              const ordered = Array.from(risks).sort(
                (a, b) =>
                  Number(a.getAttribute('data-risk-delay') || 0) -
                  Number(b.getAttribute('data-risk-delay') || 0),
              );

              tl.to(
                ordered,
                { autoAlpha: 1, scale: 1, duration: 0.34, stagger: 0.055, ease: 'back.out(2.2)' },
                momentoRisco,
              );

              /* tremor: curto e forte, com repique — sentido, não assistido */
              tl.to(
                scene,
                { x: isMobile ? -5 : -9, duration: 0.05, repeat: 5, yoyo: true, ease: 'none' },
                momentoRisco + 0.06,
              ).set(scene, { x: 0 });
            }

            tl.to(risk, { autoAlpha: 1, y: 0, duration: 0.3 }, momentoRisco + 0.14);
            tl.to({}, { duration: 0.26 });

            /* --- 3. a proteção ------------------------------------------- */
            const momentoEscudo = tl.duration();

            if (isMobile) {
              tl.to(risk, { autoAlpha: 0, y: -12, duration: 0.18 }, momentoEscudo - 0.02);
            }

            if (shields.length) {
              /* O capítulo final tem escudo mas não tem elementos de risco. */
              if (risks.length) {
                tl.to(risks, { autoAlpha: 0.18, duration: 0.3 }, momentoEscudo);
              }
              if (camera) {
                tl.to(camera, { filter: 'brightness(1) contrast(1)', duration: 0.4 }, momentoEscudo);
              }

              tl.to(
                shields,
                { autoAlpha: 1, scale: 1, duration: 0.44, ease: 'back.out(1.7)' },
                momentoEscudo + 0.08,
              );

              if (checks.length) {
                tl.fromTo(
                  checks,
                  { drawSVG: '0%' },
                  { drawSVG: '100%', duration: 0.36, ease: 'power2.out' },
                  momentoEscudo + 0.22,
                );
              }
            }

            if (orbits.length) {
              tl.to(
                orbits,
                { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' },
                momentoEscudo + 0.1,
              );
            }

            tl.to(
              [answer, related],
              { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.08 },
              momentoEscudo + 0.18,
            );

            /* respiro final do capítulo */
            tl.to({}, { duration: 0.3 });

            /* --- movimento dos atores da cena -----------------------------
               O que faz a história CONTAR o caso, em vez de só ilustrá-lo: o
               carro entra rodando e é jogado para trás na batida; o volume
               tomba; a chama sobe do rombo. Cada cena declara o movimento em
               atributos e o orquestrador executa — assim a cena não precisa
               conhecer a timeline, e a timeline não precisa conhecer a cena.

                 data-move-when="build|risk|shield"  em que beat acontece
                 data-move-x / -y                    deslocamento, em px do viewBox
                 data-move-rot                       rotação, em graus
                 data-move-scale                     escala final (1 = igual)
                 data-move-dur                       duração, em unidades da timeline
                 data-move-ease                      easing do GSAP
                 data-move-origin                    origem da transformação

               Regra de leitura: em `build` o valor declarado é DE ONDE o
               elemento vem (ele entra e assenta); em `risk` e `shield` é PARA
               ONDE ele vai. */
            if (atores.length) {
              atores.forEach((el) => {
                const quando = el.getAttribute('data-move-when');
                const alvo: gsap.TweenVars = {};
                const x = Number(el.getAttribute('data-move-x') || 0);
                const y = Number(el.getAttribute('data-move-y') || 0);
                const rot = Number(el.getAttribute('data-move-rot') || 0);
                const escala = el.getAttribute('data-move-scale');
                const origem = el.getAttribute('data-move-origin');

                if (x) alvo.x = x;
                if (y) alvo.y = y;
                if (rot) alvo.rotation = rot;
                if (escala) alvo.scale = Number(escala);
                if (origem) alvo.transformOrigin = origem;
                if (!Object.keys(alvo).length) return;

                const duracaoMov = Number(el.getAttribute('data-move-dur') || 0.5);
                const suavizacao = el.getAttribute('data-move-ease') || 'power2.out';

                const instante =
                  quando === 'risk'
                    ? momentoRisco
                    : quando === 'shield'
                      ? momentoEscudo
                      : enter;

                if (quando === 'build') {
                  /* entra: sai do deslocamento declarado e assenta no lugar */
                  const repouso: gsap.TweenVars = { duration: duracaoMov, ease: suavizacao };
                  if ('x' in alvo) repouso.x = 0;
                  if ('y' in alvo) repouso.y = 0;
                  if ('rotation' in alvo) repouso.rotation = 0;
                  if ('scale' in alvo) repouso.scale = 1;
                  if (origem) repouso.transformOrigin = origem;
                  tl.fromTo(el, alvo, repouso, instante);
                } else {
                  tl.to(el, { ...alvo, duration: duracaoMov, ease: suavizacao }, instante);
                }
              });
            }

            /* --- câmera e parallax, do começo ao fim do capítulo -----------
               Duas camadas de movimento contínuo, atadas ao scroll: a câmera
               avança devagar sobre a cena e os planos se deslocam em
               velocidades diferentes conforme o `data-depth`. É o que tira a
               sensação de cartão parado. */
            const fimDoCapitulo = tl.duration();
            const duracao = fimDoCapitulo - enter;

            if (camera && !isMobile) {
              tl.fromTo(
                camera,
                { scale: 1, yPercent: 1.2 },
                { scale: 1.075, yPercent: -1.2, ease: 'none', duration: duracao },
                enter,
              );
            }

            if (depths.length) {
              depths.forEach((el) => {
                const d = Number(el.getAttribute('data-depth') || 0);
                if (!d) return;
                tl.fromTo(
                  el,
                  { xPercent: 0, yPercent: 0 },
                  {
                    xPercent: -d * (isMobile ? 1.6 : 3.2),
                    yPercent: -d * 1.1,
                    ease: 'none',
                    duration: duracao,
                  },
                  enter,
                );
              });
            }
          });

          /* --------------------------- barra de progresso e marcadores ---- */
          const railFill = stage.querySelector('[data-rail-fill]');
          const railEnd = fim;

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
              /* O recuo superior no celular NÃO é estética: o cabeçalho fica
                 fixo por cima do palco e come os primeiros ~84px. Sem isso o
                 conteúdo se centraliza na altura inteira da janela e o topo da
                 cena desaparece atrás do menu — foi exatamente o defeito
                 relatado ("a história sobe enquanto você desce a página").
                 O recuo inferior reserva a faixa dos indicadores. */
              className="absolute inset-0 flex h-full flex-col justify-center px-0 pb-[64px] pt-[82px] opacity-0 [@media(max-height:700px)]:pb-[52px] [@media(max-height:700px)]:pt-[70px] lg:pb-0 lg:pt-0"
            >
              <div
                className={cn(
                  'shell grid w-full items-center gap-3.5 sm:gap-6 lg:gap-14',
                  isFinal ? 'lg:grid-cols-1 lg:justify-items-center' : 'lg:grid-cols-[.92fr_1.08fr]',
                )}
              >
                {/* texto */}
                <div
                  className={cn(
                    /* `min-w-0`: sem isso os chips de produto (que não quebram
                       linha) forçam a largura mínima da coluna, ela estoura a
                       célula da grade e empurra a cena para fora da tela no
                       celular — medido: 544px de coluna no capítulo 05. */
                    'order-2 min-w-0 max-w-[34rem] lg:order-1',
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
                    className="mt-2.5 text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.02em] text-fg [@media(max-height:700px)]:text-[1.3125rem] sm:mt-4 sm:text-display-md"
                  >
                    {chapter.title}
                  </h3>

                  {/* OS TRÊS TEMPOS DA HISTÓRIA.
                      No desktop eles se empilham e ficam visíveis juntos ao
                      fim do capítulo. No celular ocupam a MESMA caixa, um de
                      cada vez (`absolute` até `md`), e a timeline apaga o
                      anterior antes de trazer o próximo. Empilhados, os três
                      não cabiam: o capítulo mais longo pedia 834px numa área
                      útil de 745px. Um pensamento por vez também deixa a
                      leitura mais rápida, que é o efeito desejado. */}
                  <div className="relative mt-3 min-h-[112px] [@media(max-height:700px)]:min-h-[96px] sm:mt-5 sm:min-h-[136px] md:min-h-0">
                    <p
                      data-text="build"
                      className="absolute inset-x-0 top-0 text-[.96875rem] leading-relaxed text-fg-3 md:static md:text-[1.0625rem] lg:text-[1.125rem]"
                    >
                      {chapter.build}
                    </p>

                    <p
                      data-text="risk"
                      className="absolute inset-x-0 top-0 border-l-2 border-alert/45 pl-3.5 text-[.96875rem] font-medium leading-relaxed text-fg-2 md:static md:mt-5 md:pl-4 md:text-[1.0625rem] lg:text-[1.125rem]"
                    >
                      {chapter.risk}
                    </p>

                    <p
                      data-text="answer"
                      className={cn(
                        'absolute inset-x-0 top-0 border-l-2 border-brand-2 pl-3.5 text-[.96875rem] leading-relaxed text-fg md:static md:mt-5 md:pl-4 md:text-[1.0625rem] lg:text-[1.125rem]',
                        isFinal &&
                          'border-l-0 pl-0 font-display text-[1.0625rem] md:pl-0 md:text-display-sm',
                      )}
                    >
                      {chapter.answer}
                    </p>
                  </div>

                  {chapter.related.length > 0 && (
                    /* No celular os chips viram UMA faixa rolável na horizontal.
                       Quebrados em duas ou três linhas eles somavam ~100px e
                       eram o que estourava o capítulo 05 numa tela baixa. */
                    <div
                      data-text="related"
                      className="edge-fade-x -mx-5 mt-4 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-7 md:flex-wrap md:overflow-visible md:px-0"
                    >
                      {chapter.related.map((slug) => {
                        const ins = insuranceBySlug(slug);
                        if (!ins) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/seguros/${slug}`}
                            className="group flex shrink-0 snap-start items-center gap-2 rounded-full border border-brand-2/30 bg-brand-2/[.07] px-3.5 py-2 text-[.9375rem] font-medium text-fg transition-all duration-300 ease-brand hover:-translate-y-[2px] hover:border-brand-2/70 hover:bg-brand-2/[.13]"
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
                      className="mt-5 flex flex-row flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3"
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
                <div
                  data-scene
                  className={cn(
                    /* No celular a cena é governada pela ALTURA (`svh`), não
                       pela largura: numa tela baixa ela encolhe sozinha em vez
                       de empurrar o texto para fora do palco. A partir de `lg`
                       volta a ser governada pela largura, como no desktop. */
                    'relative order-1 mx-auto aspect-[8/5] w-auto lg:h-auto lg:max-h-none lg:w-full',
                    isFinal
                      ? /* o capítulo final carrega dois botões no lugar dos
                           chips, então a cena cede altura para eles */
                        'h-[21svh] max-h-[176px] min-h-[92px] lg:order-1 lg:max-w-[380px]'
                      : 'h-[26svh] max-h-[220px] min-h-[104px] lg:order-2 lg:max-w-[560px]',
                  )}
                >
                  {/* Camada de câmera: é ela que avança devagar sobre a cena
                      enquanto o capítulo corre. Fica separada de [data-scene]
                      porque a cena cuida da entrada e da saída — se as duas
                      transformações vivessem no mesmo elemento, uma
                      sobrescreveria a outra. */}
                  <div data-scene-camera className="h-full w-full will-change-transform">
                    <SceneComponent />
                  </div>

                  {/* clarão do impacto */}
                  <span
                    data-scene-flash
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 45%, rgb(var(--alert-2) / .55) 0%, rgb(var(--alert) / .2) 40%, transparent 70%)',
                    }}
                  />


                </div>
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
