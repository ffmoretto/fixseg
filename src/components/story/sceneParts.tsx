import type { CSSProperties, ReactNode } from 'react';

/**
 * =============================================================================
 * KIT DE ILUSTRAÇÃO DAS CENAS DA NARRATIVA EM SCROLL
 * =============================================================================
 * As cenas não são mais desenhos de linha: são ilustrações vetoriais com massa,
 * volume, profundidade em camadas, sombra de contato no chão e elementos com
 * movimento próprio (fogo, chuva, fumaça, rodas). O traço continua existindo,
 * mas agora é contorno de forma — não a forma inteira.
 *
 * -----------------------------------------------------------------------------
 * COMO A COR FUNCIONA NOS DOIS TEMAS
 * -----------------------------------------------------------------------------
 * Nada aqui usa cor absoluta. Toda massa é `rgb(var(--fg) / α)`:
 *   · tema claro  → `--fg` é quase preto, então as massas são tinta sobre papel;
 *   · tema escuro → `--fg` é branco, então as mesmas massas são luz sobre breu.
 * A ilustração inverte junto com o tema sem nenhuma regra duplicada. Os pontos
 * de cor são `--brand` / `--brand-2` / `--accent-ink`, ajustados por tema no
 * globals.css.
 *
 * UMA exceção, e só uma: `--alert` / `--alert-2` (âmbar), usados exclusivamente
 * nas peças de fogo e perigo. Chama em ciano não é lida como chama. O âmbar não
 * aparece em nenhum outro lugar do site. Ver o comentário no globals.css.
 *
 * -----------------------------------------------------------------------------
 * CONVENÇÃO DE ANIMAÇÃO (lida pelo orquestrador em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   data-scene-draw    contorno. Entra sendo desenhado (DrawSVGPlugin).
 *                      Precisa ser traço (stroke), nunca preenchimento.
 *   data-scene-fill    massa. Materializa DEPOIS do contorno, com leve subida.
 *                      É o que dá a sensação de "o mundo ganhou corpo".
 *   data-scene-live    tem movimento próprio, em CSS, independente do scroll
 *                      (chama, chuva, fumaça, roda). Nunca é alvo do GSAP.
 *   data-depth="0.3"   participa do parallax: o orquestrador desloca o
 *                      elemento na proporção informada enquanto o capítulo
 *                      avança. Fundo perto de 0.1, primeiro plano perto de 1.
 *   data-scene-risk    o imprevisto. Entra com impacto, depois da construção.
 *   data-scene-shield  a proteção. Entra por último e devolve a cor à cena.
 *
 * Um mesmo grupo pode ter contorno e massa: `data-scene-fill` no grupo das
 * formas e `data-scene-draw` no grupo dos contornos, na mesma ordem visual.
 * =============================================================================
 */

export const SCENE_VIEWBOX = '0 0 560 400';

/** Linha do horizonte / chão padrão das cenas. */
export const GROUND_Y = 330;

/**
 * Arredonda uma coordenada para 2 casas decimais e devolve string.
 *
 * Por que isso é necessário: `Math.sin` e `Math.cos` NÃO são obrigados pela
 * especificação a devolver o mesmo bit final em implementações diferentes. O
 * Node (que gera o HTML no servidor) e o navegador (que hidrata) podem divergir
 * na 14ª casa decimal — o suficiente para o React acusar "hydration mismatch" e
 * descartar a árvore. Fixar a precisão faz servidor e cliente produzirem
 * exatamente a mesma string, e 2 casas são mais do que suficientes num viewBox
 * de 560×400.
 *
 * Use SEMPRE que uma coordenada vier de trigonometria e for para o HTML.
 */
export const xy = (value: number): string => value.toFixed(2);

/* ========================================================================== */
/* MASSA E PROFUNDIDADE                                                       */
/* ========================================================================== */

/**
 * Escala de massa. É a única fonte de profundidade da ilustração: quanto mais
 * perto do observador, mais densa a forma. Usar sempre um degrau da escala —
 * valores avulsos achatam a cena.
 *
 * `MASS` são os PESOS (números), usados onde o valor é uma opacidade ou a força
 * de um traço. `INK` são as CORES correspondentes, e é o que se usa em `fill` e
 * `stroke`.
 */
export const MASS = {
  air: 0.05, // névoa, céu, o que quase não existe
  far: 0.11, // silhueta de fundo
  mid: 0.18, // plano intermediário
  body: 0.26, // corpo principal da forma
  near: 0.36, // face voltada para a luz, em primeiro plano
  deep: 0.5, // face na sombra
  ink: 0.68, // recorte máximo
  void: 0.82, // vazio: buraco, pneu, vão de porta
  lift: 1, // aresta iluminada
} as const;

export type MassLevel = keyof typeof MASS;

/**
 * Cores da massa — tokens OPACOS definidos por tema no globals.css.
 *
 * Por que opacos e não `rgb(var(--fg) / α)`: com formas translúcidas, dois
 * volumes sobrepostos mostram um através do outro e a ilustração ganha aspecto
 * de raio-X — dava para ver a lateral do caminhão através da caixa da frente.
 * O `color-mix` resolve a mistura uma vez, no token, e a forma passa a cobrir
 * o que está atrás dela.
 *
 * `void` é o oposto da escala: um vazio SEMPRE mais escuro que a página, nos
 * dois temas. Sem ele, no tema escuro um pneu "denso" viraria o objeto mais
 * claro da cena — e o pneu ficava com cara de farol aceso.
 */
export const INK = {
  air: 'var(--m-air)',
  far: 'var(--m-far)',
  mid: 'var(--m-mid)',
  body: 'var(--m-body)',
  near: 'var(--m-near)',
  deep: 'var(--m-deep)',
  ink: 'var(--m-ink)',
  void: 'var(--m-void)',
  lift: 'var(--m-lift)',
} as const;

/** Preenchimento chapado num degrau da escala de massa. */
export const mass = (level: MassLevel = 'body') => ({ fill: INK[level] });

/** Contorno da forma. `w` = espessura, `o` = opacidade. */
export const outline = (w = 1.6, o = 0.5) => ({
  fill: 'none',
  stroke: `rgb(var(--fg) / ${o})`,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
});

/** Traço fino de detalhe interno (ripado, junta, moldura). */
export const detail = (o = 0.26, w = 1.1) => ({
  fill: 'none',
  stroke: `rgb(var(--fg) / ${o})`,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
});

/** Preenchimento na cor da marca (ciano). */
export const accent = (o = 0.9) => ({ fill: `rgb(var(--brand-2) / ${o})` });

/** Preenchimento na cor de alerta (fogo, brasa, sinal de perigo). */
export const alert = (o = 0.9) => ({ fill: `rgb(var(--alert) / ${o})` });

/** Traço na cor de alerta. */
export const alertStroke = (w = 2, o = 0.9) => ({
  fill: 'none',
  stroke: `rgb(var(--alert) / ${o})`,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
});

/** Traço na cor da marca. */
export const accentStroke = (w = 2, o = 0.85) => ({
  fill: 'none',
  stroke: `rgb(var(--brand-2) / ${o})`,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
});

/** Preenchimentos por gradiente — dependem de `SceneDefs` com o mesmo `id`. */
export const volume = (id: string) => ({ fill: `url(#${id}-volume)` });
export const sideFace = (id: string) => ({ fill: `url(#${id}-side)` });
export const topFace = (id: string) => ({ fill: `url(#${id}-top)` });
export const glass = (id: string) => ({ fill: `url(#${id}-glass)` });
export const brandFill = (id: string) => ({ fill: `url(#${id}-brand)` });
export const heat = (id: string) => ({ fill: `url(#${id}-heat)` });
export const energy = (id: string) => ({ fill: `url(#${id}-energy)` });

/* ------------------------------------------------------------------ legado */
/** Compatibilidade: cenas antigas importavam `line`/`lineThin`. */
export const line = outline(2, 0.55);
export const lineThin = detail(0.3, 1.2);

/* ========================================================================== */
/* DEFS                                                                       */
/* ========================================================================== */

/**
 * Gradientes e filtros da cena. Todos os `stop` usam variáveis de tema, então
 * o mesmo `defs` serve claro e escuro. Cada cena passa um `id` único porque
 * ids de SVG são globais no documento.
 */
export function SceneDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* marca — usado no escudo, no check e nos pontos de energia */}
      <linearGradient id={`${id}-brand`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="rgb(var(--brand))" />
        <stop offset="52%" stopColor="rgb(var(--brand-mid))" />
        <stop offset="100%" stopColor="rgb(var(--brand-2))" />
      </linearGradient>

      {/* face frontal: mais densa embaixo, como se a luz viesse de cima */}
      <linearGradient id={`${id}-volume`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`${INK.near}`} />
        <stop offset="100%" stopColor={`${INK.mid}`} />
      </linearGradient>

      {/* face lateral: sempre na sombra */}
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={`${INK.deep}`} />
        <stop offset="100%" stopColor={`${INK.near}`} />
      </linearGradient>

      {/* face superior: pega luz, quase se dissolve */}
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`${INK.far}`} />
        <stop offset="100%" stopColor={`${INK.mid}`} />
      </linearGradient>

      {/* vidro / tela: ciano frio com reflexo */}
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="rgb(var(--brand-2) / .34)" />
        <stop offset="55%" stopColor="rgb(var(--brand) / .16)" />
        <stop offset="100%" stopColor={`${INK.deep}`} />
      </linearGradient>

      {/* atmosfera: o ar acima da linha do horizonte.
          Aqui a cor É translúcida de propósito — ar e sombra não são objetos,
          precisam deixar passar o fundo da página. */}
      <linearGradient id={`${id}-air`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`rgb(var(--fg) / ${MASS.air})`} />
        <stop offset="100%" stopColor="rgb(var(--fg) / 0)" />
      </linearGradient>

      {/* sombra de contato — o que assenta a forma no chão */}
      <radialGradient id={`${id}-contact`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={`rgb(var(--fg) / ${MASS.deep})`} />
        <stop offset="62%" stopColor={`rgb(var(--fg) / ${MASS.air})`} />
        <stop offset="100%" stopColor="rgb(var(--fg) / 0)" />
      </radialGradient>

      {/* máscara de borda: dissolve o "cartão" da cena na página.
          Sem ela, `Air` e `Ground` desenham um retângulo com aresta visível no
          meio do fundo — a cena parecia colada num quadro. */}
      <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="66%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="58%" stopColor="#fff" />
        <stop offset="100%" stopColor="#000" />
      </radialGradient>
      <mask id={`${id}-edge`} maskUnits="userSpaceOnUse" x="0" y="0" width="560" height="400">
        <rect x="0" y="0" width="560" height="400" fill={`url(#${id}-vignette)`} />
      </mask>

      {/* CALOR — fogo e brasa.
          Única parte da ilustração fora da paleta da marca, e por um motivo
          concreto: chama em ciano não é lida como chama. Ver `--alert` no
          globals.css. Base quente e escura, topo claro. */}
      <linearGradient id={`${id}-heat`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="rgb(var(--alert) / .35)" />
        <stop offset="42%" stopColor="rgb(var(--alert) / .92)" />
        <stop offset="100%" stopColor="rgb(var(--alert-2) / .98)" />
      </linearGradient>

      {/* ENERGIA — descarga elétrica, faísca, curto-circuito.
          Esta continua ciano: relâmpago azul é o que o olho espera, e é a cor
          da marca no seu papel mais natural. */}
      <linearGradient id={`${id}-energy`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="rgb(var(--brand) / .55)" />
        <stop offset="50%" stopColor="rgb(var(--brand-2) / .95)" />
        <stop offset="100%" stopColor="rgb(255 255 255 / .95)" />
      </linearGradient>

      <filter id={`${id}-glow`} x="-45%" y="-45%" width="190%" height="190%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id={`${id}-soft`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>

      <filter id={`${id}-haze`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  );
}

/* ========================================================================== */
/* PEÇAS PRONTAS                                                              */
/* ========================================================================== */

/**
 * Atmosfera: o ar da cena. Duas manchas suaves e uma névoa junto ao horizonte.
 * Entra como massa (não tem traço) e existe só para separar os planos.
 */
export function Air({
  id,
  y = GROUND_Y,
  tint = true,
}: {
  id: string;
  y?: number;
  tint?: boolean;
}) {
  return (
    <g data-scene-fill mask={`url(#${id}-edge)`}>
      <rect x="0" y="0" width="560" height={y} fill={`url(#${id}-air)`} />
      {tint && (
        <>
          <ellipse
            cx="140"
            cy={y - 150}
            rx="150"
            ry="96"
            fill="rgb(var(--brand) / .07)"
            filter={`url(#${id}-haze)`}
          />
          <ellipse
            cx="430"
            cy={y - 190}
            rx="128"
            ry="82"
            fill="rgb(var(--brand-2) / .07)"
            filter={`url(#${id}-haze)`}
          />
        </>
      )}
      <ellipse
        cx="280"
        cy={y}
        rx="270"
        ry="34"
        fill={`rgb(var(--fg) / ${MASS.air})`}
        filter={`url(#${id}-haze)`}
      />
    </g>
  );
}

/**
 * Chão: plano preenchido em perspectiva + linha do horizonte.
 * Não é mais um risco no meio do nada — é uma superfície onde as coisas pisam.
 */
export function Ground({
  id,
  y = GROUND_Y,
  perspective = true,
}: {
  id: string;
  y?: number;
  perspective?: boolean;
}) {
  return (
    <>
      {/* O plano do chão é opaco, mas a máscara de borda o dissolve nas
          laterais e no rodapé — é o que evita a aresta de "cartão colado". */}
      <g data-scene-fill mask={`url(#${id}-edge)`}>
        <path d={`M0 ${y}H560V400H0Z`} fill={INK.far} />
        <path d={`M0 ${y}H560V${y + 14}H0Z`} fill={INK.mid} opacity=".55" />
        {perspective && (
          <g opacity=".45">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const t = i / 6;
              const xTop = 200 + t * 160;
              const xBottom = -140 + t * 840;
              return (
                <path
                  key={i}
                  d={`M${xy(xTop)} ${y}L${xy(xBottom)} 400`}
                  stroke={`rgb(var(--fg) / ${MASS.far})`}
                  strokeWidth="1"
                  fill="none"
                />
              );
            })}
          </g>
        )}
      </g>

      <g data-scene-draw mask={`url(#${id}-edge)`}>
        <path {...outline(1.4, 0.28)} d={`M0 ${y}H560`} />
      </g>
    </>
  );
}

/** Sombra de contato: assenta uma forma no chão. */
export function Contact({
  id,
  x,
  y = GROUND_Y,
  rx = 90,
  ry = 12,
  opacity = 0.9,
}: {
  id: string;
  x: number;
  y?: number;
  rx?: number;
  ry?: number;
  opacity?: number;
}) {
  return (
    <ellipse
      data-scene-fill
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
      fill={`url(#${id}-contact)`}
      opacity={opacity}
    />
  );
}

/**
 * Fratura — o imprevisto que rompe a forma. Traço claro por cima da massa
 * escura, como uma trinca real: o que aparece é a luz passando pela fenda.
 */
export function Fracture({
  d,
  delay = 0,
  width = 1.8,
}: {
  d: string;
  delay?: number;
  width?: number;
}) {
  return (
    <g data-scene-risk data-risk-delay={delay}>
      <path
        d={d}
        fill="none"
        stroke="rgb(var(--fg) / .16)"
        strokeWidth={width + 2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        fill="none"
        stroke="rgb(var(--brand-2) / .8)"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** Uma baforada de fumaça com movimento próprio. */
function Puff({
  id,
  x,
  y,
  r,
  delay,
}: {
  id: string;
  x: number;
  y: number;
  r: number;
  delay: number;
}) {
  return (
    <ellipse
      data-scene-live
      cx={x}
      cy={y}
      rx={r}
      ry={r * 0.82}
      fill={`${INK.mid}`}
      filter={`url(#${id}-soft)`}
      className="fill-box animate-smoke-rise"
      style={{ animationDelay: `${delay}s` } as CSSProperties}
    />
  );
}

/** Coluna de fumaça — 4 baforadas defasadas subindo de um ponto. */
export function Smoke({
  id,
  x,
  y,
  scale = 1,
}: {
  id: string;
  x: number;
  y: number;
  scale?: number;
}) {
  const puffs = [
    { dx: 0, dy: 0, r: 13, d: 0 },
    { dx: 7, dy: -12, r: 10, d: 0.85 },
    { dx: -8, dy: -20, r: 15, d: 1.7 },
    { dx: 3, dy: -30, r: 11, d: 2.55 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity=".9">
      {puffs.map((p, i) => (
        <Puff key={i} id={id} x={p.dx} y={p.dy} r={p.r} delay={p.d} />
      ))}
    </g>
  );
}

/**
 * Chama.
 *
 * A paleta não tem laranja, então o fogo precisa ser reconhecido pela FORMA e
 * pelo comportamento, não pela cor: língua estreita na base, bordas onduladas,
 * duas pontas lambendo em alturas diferentes, núcleo branco-quente no centro,
 * brasa espalhada no pé e tremulação contínua. A primeira versão usava lâminas
 * arredondadas e o resultado parecia folhagem azul, não incêndio.
 *
 * A origem local é o PÉ da chama: `translate(x, y)` marca onde ela nasce.
 */
export function Flame({
  id,
  x,
  y,
  scale = 1,
  glow = true,
}: {
  id: string;
  x: number;
  y: number;
  scale?: number;
  glow?: boolean;
}) {
  /* três línguas de alturas diferentes + núcleo. As pontas desencontradas são
     o que faz o olho ler "fogo": uma silhueta simétrica e arredondada parece
     gota d'água. */
  const tongues = [
    {
      d: 'M0 0C-16-2-22-14-19-27C-17-37-6-42-11-56C-3-49 2-42 3-34C7-45 14-49 11-62C22-48 25-32 21-19C18-7 9-1 0 0Z',
      o: 0.45,
      dur: 1.4,
    },
    {
      d: 'M-13-4C-19-9-19-19-15-26C-12-31-6-33-9-42C-2-37 3-29 2-21C1-13-5-6-13-4Z',
      o: 0.6,
      dur: 1.15,
    },
    {
      d: 'M0 0C-10-1-15-10-13-20C-11-28-4-32-7-44C1-36 8-27 9-17C10-7 5-1 0 0Z',
      o: 0.85,
      dur: 0.95,
    },
  ];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {glow && (
        <ellipse
          cx="0"
          cy="-22"
          rx="30"
          ry="38"
          fill="rgb(var(--alert) / .3)"
          filter={`url(#${id}-haze)`}
        />
      )}

      {/* brasa: o pé quente que assenta a chama na superfície */}
      <ellipse cx="1" cy="0" rx="17" ry="4.5" fill="rgb(var(--alert) / .55)" />
      <ellipse cx="1" cy="0" rx="9" ry="2.6" fill="rgb(var(--alert-2) / .75)" />

      {tongues.map((t, i) => (
        <path
          key={i}
          data-scene-live
          d={t.d}
          fill={`url(#${id}-heat)`}
          opacity={t.o}
          className="fill-box animate-flicker"
          style={
            {
              animationDelay: `${i * 0.21}s`,
              animationDuration: `${t.dur}s`,
              transformOrigin: 'bottom center',
            } as CSSProperties
          }
        />
      ))}

      {/* núcleo branco-quente: uma lasca estreita, não um bojo */}
      <path
        data-scene-live
        d="M0 0C-4 0-6-6-5-12C-4-18-1-20-2-29C2-21 4-15 4-9C4-4 2 0 0 0Z"
        fill="rgb(255 255 255 / .9)"
        className="fill-box animate-flicker"
        style={
          { animationDuration: '.8s', transformOrigin: 'bottom center' } as CSSProperties
        }
      />
    </g>
  );
}

/** Chuva — fios verticais caindo em ritmos diferentes. */
export function Rain({
  x = 0,
  y = 0,
  width = 560,
  height = 200,
  count = 22,
  opacity = 0.5,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  count?: number;
  opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        /* distribuição determinística: sem Math.random, o SSR e o cliente
           geram exatamente o mesmo HTML */
        const t = (i * 37) % 100;
        const px = x + (t / 100) * width;
        const len = 16 + ((i * 13) % 22);
        const dur = 0.85 + ((i * 7) % 9) / 10;
        return (
          <line
            key={i}
            data-scene-live
            x1={xy(px)}
            y1={y}
            x2={xy(px - 5)}
            y2={y + len}
            stroke="rgb(var(--brand-2) / .55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="animate-rain-fall"
            style={
              {
                animationDelay: `${((i * 17) % 11) / 10}s`,
                animationDuration: `${dur}s`,
              } as CSSProperties
            }
          />
        );
      })}
      <rect x={x} y={y} width={width} height={height} fill="transparent" />
    </g>
  );
}

/** Roda com massa, aro e giro próprio. */
export function Wheel({
  id,
  x,
  y,
  r = 16,
  spin = true,
}: {
  id: string;
  x: number;
  y: number;
  r?: number;
  spin?: boolean;
}) {
  /* O pneu usa `void` (sempre mais escuro que a página) e não `ink`: no tema
     escuro, "densidade máxima" significa BRANCO, e a roda virava um farol
     aceso no meio do carro. */
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK.void} />
      <circle cx={x} cy={y} r={r * 0.64} fill={INK.mid} />
      <g
        data-scene-live={spin ? '' : undefined}
        className={spin ? 'fill-box animate-spin-slow' : undefined}
        style={spin ? ({ animationDuration: '2.2s' } as CSSProperties) : undefined}
      >
        {/* raios que NÃO cruzam o centro: cruzando, cinco traços viravam um
            asterisco e a roda parecia um floco de neve. */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          const c = Math.cos(a);
          const s = Math.sin(a);
          return (
            <path
              key={i}
              d={`M${xy(x + c * r * 0.24)} ${xy(y + s * r * 0.24)}L${xy(
                x + c * r * 0.55,
              )} ${xy(y + s * r * 0.55)}`}
              stroke={INK.deep}
              strokeWidth={Math.max(1.4, r * 0.11)}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
      </g>
      <circle cx={x} cy={y} r={r * 0.18} fill={INK.deep} />
      <circle {...detail(0.3, 1.2)} cx={x} cy={y} r={r} />
    </g>
  );
}

/**
 * Faísca — estilhaço de luz que salta de um ponto de impacto.
 *
 * Determinístico de propósito: os ângulos vêm do índice, não de `Math.random`,
 * senão servidor e cliente geram HTML diferente e o React descarta a árvore.
 */
export function Sparks({
  x,
  y,
  count = 9,
  radius = 26,
  tone = 'alert',
}: {
  x: number;
  y: number;
  count?: number;
  radius?: number;
  tone?: 'alert' | 'brand';
}) {
  const cor = tone === 'alert' ? 'rgb(var(--alert-2) / .95)' : 'rgb(var(--brand-2) / .95)';
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = ((i * 360) / count + (i % 2 ? 14 : 0)) * (Math.PI / 180);
        const r1 = radius * (0.45 + ((i * 7) % 5) / 12);
        const r2 = radius * (1 + ((i * 11) % 6) / 10);
        return (
          <path
            key={i}
            d={`M${xy(x + Math.cos(a) * r1)} ${xy(y + Math.sin(a) * r1)}L${xy(
              x + Math.cos(a) * r2,
            )} ${xy(y + Math.sin(a) * r2)}`}
            stroke={cor}
            strokeWidth={i % 3 === 0 ? 2.4 : 1.5}
            strokeLinecap="round"
            fill="none"
            data-scene-live
            className="animate-flicker"
            style={
              {
                animationDelay: `${(i % 5) * 0.09}s`,
                animationDuration: `${0.5 + (i % 4) * 0.14}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </g>
  );
}

/**
 * Descarga elétrica — o raio e o clarão que ele joga em volta.
 * Fica em ciano: relâmpago azul é o que o olho espera, e é a cor da marca no
 * seu papel mais natural.
 */
export function Bolt({
  id,
  d,
  glow = true,
}: {
  id: string;
  d: string;
  glow?: boolean;
}) {
  return (
    <g>
      {glow && <path d={d} fill="rgb(var(--brand-2) / .35)" filter={`url(#${id}-haze)`} />}
      <path
        data-scene-live
        d={d}
        fill={`url(#${id}-energy)`}
        filter={`url(#${id}-glow)`}
        className="animate-flicker"
        style={{ animationDuration: '.42s' } as CSSProperties}
      />
    </g>
  );
}

/**
 * Cone de luz — farol, holofote, luz que escapa por uma abertura.
 * Dá volume ao ar da cena e é o que faz a noite parecer noite.
 */
export function LightCone({
  x,
  y,
  length = 120,
  spread = 26,
  angle = 180,
  tone = 'brand',
  opacity = 0.5,
}: {
  x: number;
  y: number;
  length?: number;
  spread?: number;
  angle?: number;
  tone?: 'brand' | 'alert';
  opacity?: number;
}) {
  const cor = tone === 'alert' ? 'var(--alert-2)' : 'var(--brand-2)';
  const rad = (angle * Math.PI) / 180;
  const px = x + Math.cos(rad) * length;
  const py = y + Math.sin(rad) * length;
  const nx = Math.cos(rad + Math.PI / 2) * spread;
  const ny = Math.sin(rad + Math.PI / 2) * spread;
  return (
    <path
      d={`M${xy(x)} ${xy(y)}L${xy(px + nx)} ${xy(py + ny)}L${xy(px - nx)} ${xy(py - ny)}Z`}
      fill={`rgb(${cor} / ${opacity})`}
      style={{ filter: 'blur(6px)' }}
    />
  );
}

/**
 * Selo de proteção: escudo cheio com borda da marca e o check desenhado.
 * O fundo usa `--panel`, então o selo tem corpo sólido nos dois temas e o que
 * está atrás dele não vaza pelo meio do símbolo.
 */
export function ShieldSeal({
  x,
  y,
  size = 96,
  id,
}: {
  x: number;
  y: number;
  size?: number;
  id: string;
}) {
  const s = size / 96;
  return (
    <g data-scene-shield transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="48" cy="52" rx="46" ry="48" fill="rgb(var(--brand-2) / .16)" filter={`url(#${id}-haze)`} />
      <path
        d="M48 2 92 16v34c0 24-18 41-44 48C22 91 4 74 4 50V16z"
        fill="rgb(var(--panel) / .94)"
      />
      <path
        d="M48 2 92 16v34c0 24-18 41-44 48C22 91 4 74 4 50V16z"
        fill={`url(#${id}-brand)`}
        opacity=".14"
      />
      <path
        d="M48 2 92 16v34c0 24-18 41-44 48C22 91 4 74 4 50V16z"
        fill="none"
        stroke={`url(#${id}-brand)`}
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
      />
      <path
        data-shield-check
        d="M27 47 41 61 71 29"
        fill="none"
        stroke={`url(#${id}-brand)`}
        strokeWidth="6.5"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** Invólucro comum: viewBox, defs e cor base herdada. */
export function Scene({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg
      viewBox={SCENE_VIEWBOX}
      className="h-full w-full text-fg-3"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <SceneDefs id={id} />
      {children}
    </svg>
  );
}
