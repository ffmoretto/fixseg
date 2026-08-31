import type { ReactNode } from 'react';

import {
  Air,
  Flame,
  Fracture,
  Ground,
  INK,
  LightCone,
  MASS,
  Scene,
  ShieldSeal,
  Smoke,
  Sparks,
  accent,
  accentStroke,
  alert,
  brandFill,
  detail,
  glass,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-biz';

/* -------------------------------------------------------------------------- */
/* PERSPECTIVA DA CENA                                                        */
/* -------------------------------------------------------------------------- */
/**
 * Uma única direção de fuga para TODOS os volumes: a profundidade recua para a
 * direita e para cima. Isso coloca o observador à frente do galpão, um pouco
 * acima do chão — é o que faz o telhado em shed, o vão do portão e as pilhas de
 * estoque parecerem parte do mesmo espaço.
 */
const DX = 56;
const DY = -20;
/** Inclinação aparente da fuga: usada para recuar peças menores na mesma direção. */
const DEPTH_RATIO = 20 / 56;

/**
 * Base opaca dos sólidos. As massas da cena são translúcidas de propósito (é o
 * que faz a ilustração inverter junto com o tema), mas num pátio industrial há
 * volume ATRÁS de volume: sem uma base opaca, a caixa da frente deixa ver a
 * caixa de trás e o galpão deixa ver o chão. `--panel` resolve isso nos dois
 * temas — é papel no claro e breu no escuro —, então o gradiente de volume
 * continua sendo a única fonte de luz da forma.
 */
const SOLID = 'rgb(var(--panel) / .95)';

/* Recuo da máquina do primeiro plano (16 de profundidade na mesma fuga). */
const MDY = xy(-16 * DEPTH_RATIO);
const MBY = xy(368 - 16 * DEPTH_RATIO);

/** x inicial de cada dente do telhado em shed (largura fixa de 88). */
const SHEDS = [88, 176, 264];
/** Cota do vale e da crista do dente. */
const VALLEY_Y = 196;
const RIDGE_Y = 164;

/**
 * `animate-dash-move` anda 40 unidades por ciclo: o padrão do tracejado precisa
 * dividir 40 para o laço fechar sem salto. Daí "8 12" na esteira.
 */
const ESTEIRA_TRACO = '8 12';

/* -------------------------------------------------------------------------- */
/* SOMBRA DE CONTATO                                                          */
/* -------------------------------------------------------------------------- */
/**
 * O mesmo desenho do `Contact` do kit — o mesmo gradiente, a mesma elipse — mas
 * SEM `data-scene-fill`.
 *
 * O motivo é de ritmo, não de estética: a construção materializa cada grupo de
 * massa em sequência, e nesta cena, a mais pesada do projeto, essa fila ficou
 * longa o suficiente para empurrar o imprevisto para o fim do capítulo. Uma
 * sombra não precisa "ganhar corpo": ela entra com a cena, junto do chão onde
 * mora, e a fila fica quatro passos mais curta.
 */
function Sombra({
  x,
  y,
  rx,
  ry,
  opacity = 0.9,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  opacity?: number;
}) {
  return (
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${ID}-contact)`} opacity={opacity} />
  );
}

/* -------------------------------------------------------------------------- */
/* ATOR QUE CRESCE                                                            */
/* -------------------------------------------------------------------------- */
/**
 * O orquestrador só sabe levar um ator PARA um valor: no beat de risco não
 * existe "de onde". Para uma peça que precisa NASCER pequena e crescer — o fogo
 * que começa no estoque, a marca de parada que entra por cima da engrenagem — o
 * caminho é desenhá-la no tamanho final e encolhê-la num grupo interno
 * ESTÁTICO: o ator de fora cresce de 1 até `fator` e devolve a peça ao tamanho
 * desenhado.
 *
 * `px`/`py` é o ponto que fica PARADO (o pé das chamas, o eixo da engrenagem).
 * Ele tem de ser exatamente o ponto para onde `origin` aponta na caixa do ator:
 * como o encolhimento é uniforme e gira em volta dele, a porcentagem daquele
 * ponto dentro da caixa é a mesma antes e depois.
 *
 * Ganho extra: o encolhimento vive no atributo `transform`, então o modo sem
 * movimento continua coerente, e o ator de fora não tem transformação de base,
 * então não briga com o GSAP.
 */
function Cresce({
  fator,
  px,
  py,
  origin,
  dur = 0.5,
  ease = 'power2.out',
  children,
}: {
  fator: number;
  px: number;
  py: number;
  origin: string;
  dur?: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when="risk"
      data-move-scale={fator}
      data-move-origin={origin}
      data-move-dur={dur}
      data-move-ease={ease}
    >
      {/* `xy()` porque o fator vem de uma divisão: servidor e navegador têm de
          escrever exatamente a mesma string. */}
      <g transform={`translate(${px} ${py}) scale(${xy(1 / fator)}) translate(${-px} ${-py})`}>
        {children}
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* CAIXA DE ESTOQUE                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Volume de três faces: frontal em gradiente (luz vindo de cima), topo quase
 * dissolvido na luz e lateral sempre na sombra — a mesma lógica do galpão, em
 * escala menor. `x`/`y` é o canto inferior esquerdo da FACE FRONTAL.
 *
 * Renderiza em dois modos para que o chamador possa juntar todas as massas num
 * grupo `data-scene-fill` e todos os contornos num grupo `data-scene-draw`,
 * sem aninhar atributos de animação.
 */
function Crate({
  x,
  y,
  w,
  h,
  d = 18,
  mode,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  /** profundidade aparente da peça */
  d?: number;
  mode: 'fill' | 'draw';
}) {
  const dy = -d * DEPTH_RATIO;
  const top = y - h;
  const xr = x + w;
  const xrB = xr + d;
  const xlB = x + d;
  const topB = xy(top + dy);
  const baseB = xy(y + dy);
  const band = xy(y - h * 0.42);

  const front = `M${x} ${y}V${top}H${xr}V${y}Z`;
  const face = `M${x} ${top}H${xr}L${xrB} ${topB}H${xlB}Z`;
  const side = `M${xr} ${top}L${xrB} ${topB}V${baseB}L${xr} ${y}Z`;

  if (mode === 'draw') {
    return (
      <>
        <path {...outline(1.6, 0.42)} d={front} />
        <path
          {...outline(1.4, 0.32)}
          d={`M${x} ${top}L${xlB} ${topB}H${xrB}L${xr} ${top}M${xrB} ${topB}V${baseB}L${xr} ${y}`}
        />
        <path {...detail(0.26)} d={`M${x} ${band}H${xr}`} />
      </>
    );
  }

  return (
    <>
      {/* base opaca: uma caixa não deixa ver a caixa de trás */}
      <path fill={SOLID} d={`${face}${side}${front}`} />
      <path {...topFace(ID)} d={face} />
      <path {...sideFace(ID)} d={side} />
      <path {...volume(ID)} d={front} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* ENGRENAGEM                                                                 */
/* -------------------------------------------------------------------------- */
/**
 * Engrenagem em massa: dentes como traço radial grosso, disco e cubo.
 * O giro é próprio (`animate-spin-slow` sobre `fill-box`, cuja origem é o
 * centro da própria forma) — a máquina ESTÁ funcionando, e é justamente isso
 * que o imprevisto interrompe. Os dentes são simétricos em volta de `cx,cy`,
 * então a caixa de preenchimento tem o mesmo centro do eixo: a peça gira no
 * lugar, sem deriva — e `50% 50%` é exatamente o eixo, o que serve de origem
 * para quem quiser girá-la de fora.
 *
 * `spin={false}` devolve a mesma engrenagem PARADA. É o que o imprevisto usa:
 * o giro é uma animação de CSS e não se desliga do meio da timeline, então a
 * peça viva é coberta e uma cópia imóvel entra no lugar dela.
 */
function Gear({
  cx,
  cy,
  r,
  teeth = 8,
  mode,
  dur = '9s',
  reverse = false,
  spin = true,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth?: number;
  mode: 'fill' | 'draw';
  dur?: string;
  reverse?: boolean;
  spin?: boolean;
}) {
  if (mode === 'draw') {
    return (
      <>
        <circle {...outline(1.4, 0.32)} cx={cx} cy={cy} r={r} />
        <circle {...detail(0.26)} cx={cx} cy={cy} r={xy(r * 0.36)} />
      </>
    );
  }

  /* coordenadas vindas de seno/cosseno passam por xy(): servidor e cliente
     geram exatamente a mesma string e a hidratação não quebra */
  const spokes = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${xy(cx + c * r * 0.82)} ${xy(cy + s * r * 0.82)}L${xy(cx + c * r * 1.3)} ${xy(
      cy + s * r * 1.3,
    )}`;
  }).join('');

  const peca = (
    <>
      <path d={spokes} fill="none" stroke={`${INK.deep}`} strokeWidth={xy(r * 0.34)} />
      <circle {...mass('near')} cx={cx} cy={cy} r={r} />
      <circle {...mass('deep')} cx={cx} cy={cy} r={xy(r * 0.36)} />
      {/* uma chaveta fora do eixo: sem ela o giro de um disco não se vê */}
      <path
        d={`M${cx} ${xy(cy - r * 0.62)}V${xy(cy - r * 0.3)}`}
        stroke={`${INK.void}`}
        strokeWidth={xy(r * 0.16)}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );

  if (!spin) return peca;

  return (
    <g
      data-scene-live
      className="fill-box animate-spin-slow"
      style={{ animationDuration: dur, animationDirection: reverse ? 'reverse' : 'normal' }}
    >
      {peca}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* BRASA                                                                      */
/* -------------------------------------------------------------------------- */
/**
 * Fagulhas de brasa subindo do fogo. Determinístico: as posições vêm do índice,
 * nunca de `Math.random`. A opacidade vive na COR e não no atributo `opacity`
 * porque `[data-scene-live]` é forçado a `opacity: 1` no modo de movimento
 * reduzido — no atributo, as brasas apareceriam chapadas naquele modo.
 */
function Brasa({
  x,
  y,
  count = 6,
  spread = 60,
}: {
  x: number;
  y: number;
  count?: number;
  spread?: number;
}) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const dx = ((i * 29) % spread) - spread / 2;
        const r = 1.5 + ((i * 7) % 3) * 0.6;
        return (
          <circle
            key={i}
            data-scene-live
            cx={xy(x + dx)}
            cy={xy(y - ((i * 13) % 18))}
            r={xy(r)}
            fill="rgb(var(--alert-2) / .9)"
            className="fill-box animate-smoke-rise"
            style={{
              animationDelay: `${xy(i * 0.47)}s`,
              animationDuration: `${xy(2.4 + (i % 3) * 0.6)}s`,
            }}
          />
        );
      })}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* SILHUETA HUMANA                                                            */
/* -------------------------------------------------------------------------- */
/**
 * Mesma ideia do capítulo 01: tronco e cabeça preenchidos, membros em traço
 * grosso de ponta arredondada. Aqui a figura é de PRIMEIRO PLANO, então vira
 * silhueta chapada — a opacidade fica no grupo e as formas internas são opacas,
 * o que evita emendas escuras onde braço, perna e tronco se cruzam.
 *
 * A origem local é o CHÃO, no centro do corpo: `translate(x, y)` põe os pés
 * exatamente onde a pessoa pisa; `scale` dá a escala do galpão.
 */
function Figure({
  x,
  y,
  scale = 1,
  tone = MASS.deep,
  reach,
  helmet = true,
}: {
  x: number;
  y: number;
  scale?: number;
  /** degrau da escala de massa: quanto mais perto, mais densa a silhueta */
  tone?: number;
  reach?: 'left' | 'right' | 'both';
  helmet?: boolean;
}) {
  const armL = reach === 'left' || reach === 'both';
  const armR = reach === 'right' || reach === 'both';

  /** O corpo é desenhado duas vezes: base opaca e, por cima, a tinta no degrau
   *  de massa. Assim a silhueta não fica vazada nem ganha emenda escura onde
   *  braço, perna e tronco se cruzam. */
  const body = (color: string) => (
    <>
      {/* pernas */}
      <path d="M-8 -36V-4" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" />
      <path d="M8 -36V-4" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" />
      {/* braços */}
      <path
        d={armL ? 'M-17 -74L-33 -48' : 'M-17 -74L-21 -42'}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={armR ? 'M17 -74L33 -48' : 'M17 -74L21 -42'}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* tronco e cabeça */}
      <path d="M-19 -52C-19 -76 -12 -90 0 -90C12 -90 19 -76 19 -52L16 -32H-16Z" fill={color} />
      <circle cx="0" cy="-104" r="13.5" fill={color} />
      {/* capacete: é uma equipe de operação, não um grupo de passantes */}
      {helmet && (
        <>
          <path d="M-15 -108a15 15 0 0130 0Z" fill={color} />
          <path
            d="M-20 -107H20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
    </>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g>{body(SOLID)}</g>
      <g opacity={tone}>{body('rgb(var(--fg) / 1)')}</g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* PILHAS DE ESTOQUE                                                          */
/* -------------------------------------------------------------------------- */
/** Pilha principal, no pátio à direita do galpão (palete + base da pilha). */
const STACK_MAIN = [
  { x: 414, y: 339, w: 112, h: 9 }, // palete
  { x: 414, y: 330, w: 54, h: 36 },
  { x: 470, y: 330, w: 54, h: 36 },
  { x: 424, y: 294, w: 52, h: 34 },
];

/**
 * Os dois volumes do TOPO da pilha vivem fora da lista porque cada um é um ator:
 * no imprevisto a pilha cede e eles escorregam e tombam sobre a quina que apoia
 * na caixa de baixo.
 *
 * A caixa de um `Crate` é `[x, top+dy, w+d, h-dy]`: a face de topo e a lateral
 * recuam `d` para a DIREITA, então a quina frontal esquerda é 0% e a direita cai
 * em `w / (w + d)` — nunca em 100%.
 */
const STACK_TOPO = [
  {
    c: { x: 480, y: 294, w: 42, h: 30 },
    rot: -10,
    dx: -5,
    dy: 0,
    quina: 'esq' as const,
    dur: 0.44,
    ease: 'power2.in',
  },
  {
    c: { x: 436, y: 260, w: 44, h: 30 },
    rot: 17,
    dx: 7,
    dy: 4,
    quina: 'dir' as const,
    dur: 0.3,
    ease: 'power3.in',
  },
];

/** Origem da queda de um volume: a quina da frente que continua apoiada. */
const quina = (w: number, d: number, lado: 'esq' | 'dir') =>
  `${lado === 'esq' ? '0' : xy((w / (w + d)) * 100)}% 100%`;

/** Pilha de separação, encostada na lateral do galpão (mais perto, menor). */
const STACK_SIDE = [
  { x: 384, y: 343, w: 64, h: 8, d: 14 },
  { x: 384, y: 335, w: 32, h: 26, d: 14 },
];

/** Ripado do portão de enrolar (agora recolhido: o vão embaixo fica aceso). */
const SLATS = [242, 250, 258, 266, 274, 282, 290];

/** Transformação do contrato — a folha inclinada, no ar, à esquerda. */
const DOC = 'translate(28 56) rotate(-4)';

/**
 * Capítulo 05 — Empresa.
 *
 * PROFUNDIDADE EM CAMADAS
 *  · 0.15 — silo, chaminé fumegando e os blocos do horizonte;
 *  · 0.35 — o poste de holofote do pátio, com cone no ar e mancha no piso;
 *  · 0.5  — o galpão: fachada em dente de serra, telhado em shed com as faixas
 *    de vidro acesas jogando luz no ar, janelas iluminadas e o portão recolhido
 *    deixando escapar a luz de dentro;
 *  · 0.8  — o contrato com selo, suspenso à esquerda;
 *  · 0.9  — o estoque empilhado, a máquina com engrenagens girando e a esteira
 *    correndo, e a equipe em silhueta.
 *
 * -----------------------------------------------------------------------------
 * O CASO ACONTECE NA TELA (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  o portão de enrolar SOBE e a operação abre; as engrenagens já
 *               giram por conta própria; a EQUIPE ENTRA, cada um de um lado e em
 *               tempos diferentes; o contrato DESCE no ar e assenta;
 *   imprevisto  o fogo NASCE NO ESTOQUE e cresce; a fumaça SOBE e toma o
 *               telhado; a engrenagem TRAVA — a cópia parada dá o último quarto
 *               de volta e morre, com a marca de parada crescendo por cima; o
 *               selo do contrato SE ROMPE e as duas metades se separam; a PILHA
 *               CEDE e os dois volumes do topo tombam sobre a quina que apoia;
 *   proteção    o perímetro se fecha em volta do pátio.
 *
 * ORÇAMENTO DE NÓS. Esta é a cena mais pesada do projeto. Cada peça de
 * movimento entrou pagando o próprio custo: o terceiro volume da pilha de
 * separação, a quinta pessoa da equipe, o cone central do shed, uma trinca de
 * parede e algumas brasas saíram para que os atores caibam.
 */
export function BusinessScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ============================ vizinhança, ao fundo (depth .15) =====
          Sem `data-scene-fill`: a vizinhança e o holofote não precisam "ganhar
          corpo", entram com a cena. Cada grupo de massa a mais estica o
          escalonamento da construção — e aqui o que precisa materializar é o
          galpão, o estoque, a equipe e o contrato, que é o que a história conta. */}
      <g data-depth="0.15">
        {/* silo */}
        <path {...mass('far')} d="M28 330V226a20 20 0 0140 0v104Z" />
        <path {...mass('mid')} d="M28 252h40v7H28Z" opacity=".7" />
        {/* chaminé */}
        <path {...mass('far')} d="M486 330V168h18v162Z" />
        <path {...mass('mid')} d="M482 162h26v8h-26Z" />
        {/* blocos do horizonte */}
        <path {...mass('far')} d="M520 330v-46h40v46Z" />
        <path {...mass('far')} d="M0 330v-38h30v38Z" />
      </g>
      {/* a chaminé trabalha: fumaça leve, o tempo todo */}
      <g data-depth="0.15">
        <Smoke id={ID} x={495} y={156} scale={0.55} />
      </g>

      {/* ========================= holofote do pátio (depth .35) ========== */}
      <g data-depth="0.35">
        <rect {...mass('deep')} x="534" y="146" width="6" height="184" rx="3" />
        <path {...mass('deep')} d="M536 146h-28v6h28Z" />
        <path {...mass('deep')} d="M492 151h32l-7 12h-18Z" />
        <ellipse cx="508" cy="163" rx="9" ry="3" fill="rgb(var(--brand-2) / .95)" />
      </g>
      <g data-depth="0.35">
        <LightCone x={508} y={165} length={176} spread={78} angle={104} opacity={0.13} />
        <ellipse cx="474" cy="342" rx="90" ry="13" fill="rgb(var(--brand-2) / .14)" />
      </g>

      {/* ================================ GALPÃO (depth .5) =============== */}
      <g data-depth="0.5">
        <g data-scene-fill>
          {/* base opaca do prédio: o chão e o silo não atravessam a alvenaria */}
          <path
            fill={SOLID}
            d={`M88 330V${VALLEY_Y}L176 ${RIDGE_Y}V${VALLEY_Y}L264 ${RIDGE_Y}V${VALLEY_Y}L352 ${RIDGE_Y}V330ZM352 ${VALLEY_Y}L${
              352 + DX
            } ${VALLEY_Y + DY}V310L352 330Z`}
          />
          {/* parede lateral, na sombra: recua na direção de fuga da cena */}
          <path
            {...sideFace(ID)}
            d={`M352 ${VALLEY_Y}L${352 + DX} ${VALLEY_Y + DY}V310L352 330Z`}
          />

          {/* telhado em shed: a face de vidro de cada dente, recuando */}
          {SHEDS.map((x0) => {
            const x1 = x0 + 88;
            return (
              <g key={`glass-${x0}`}>
                <path
                  {...glass(ID)}
                  d={`M${x1} ${RIDGE_Y}L${x1 + DX} ${RIDGE_Y + DY}L${x1 + DX} ${
                    VALLEY_Y + DY
                  }L${x1} ${VALLEY_Y}Z`}
                />
                {/* a água do telhado, quase de perfil: sobra uma lâmina de luz */}
                <path
                  {...mass('far')}
                  d={`M${x0} ${VALLEY_Y}L${x1} ${RIDGE_Y}L${x1 + DX} ${RIDGE_Y + DY}L${x0 + DX} ${
                    VALLEY_Y + DY
                  }Z`}
                />
              </g>
            );
          })}

          {/* halo das faixas de vidro */}
          <g filter={`url(#${ID}-haze)`} opacity=".85">
            {SHEDS.map((x0) => {
              const x1 = x0 + 88;
              return (
                <path
                  key={`halo-${x0}`}
                  fill="rgb(var(--brand-2) / .22)"
                  d={`M${x1} ${RIDGE_Y}L${x1 + DX} ${RIDGE_Y + DY}L${x1 + DX} ${
                    VALLEY_Y + DY
                  }L${x1} ${VALLEY_Y}Z`}
                />
              );
            })}
          </g>

          {/* fachada: o topo é o próprio dente de serra */}
          <path
            {...volume(ID)}
            d={`M88 330V${VALLEY_Y}L176 ${RIDGE_Y}V${VALLEY_Y}L264 ${RIDGE_Y}V${VALLEY_Y}L352 ${RIDGE_Y}V330Z`}
          />
          {/* rodapé: a base encardida de quem opera todo dia */}
          <path {...mass('near')} d="M88 314h264v16H88Z" opacity=".55" />
        </g>

        {/* a luz que escapa pelas faixas de vidro do shed.
            Dois cones, não três: o do meio ficava atrás da coluna de fumaça e
            só somava nó à cena mais pesada do projeto. */}
        <g>
          {[SHEDS[0], SHEDS[2]].map((x0) => (
            <LightCone
              key={`cone-${x0}`}
              x={x0 + 116}
              y={172}
              length={92}
              spread={30}
              angle={-42}
              opacity={0.14}
            />
          ))}
        </g>

        <g data-scene-draw>
          <path
            {...outline(1.7, 0.36)}
            d={`M88 330V${VALLEY_Y}L176 ${RIDGE_Y}V${VALLEY_Y}L264 ${RIDGE_Y}V${VALLEY_Y}L352 ${RIDGE_Y}V330Z`}
          />
          <path
            {...outline(1.4, 0.3)}
            d={`M352 ${VALLEY_Y}L${352 + DX} ${VALLEY_Y + DY}V310L352 330`}
          />
          {SHEDS.map((x0) => {
            const x1 = x0 + 88;
            return (
              <path
                key={`ridge-${x0}`}
                {...detail(0.26)}
                d={`M${x1} ${RIDGE_Y}L${x1 + DX} ${RIDGE_Y + DY}M${x0} ${VALLEY_Y}L${x0 + DX} ${
                  VALLEY_Y + DY
                }`}
              />
            );
          })}
          <path {...detail(0.2)} d="M88 314h264" />
        </g>

        {/* ------------------------------------------------------- aberturas */}
        <g data-scene-fill>
          {/* ATOR — o portão de enrolar SOBE: a operação abre.
              Ele é desenhado RECOLHIDO (o ripado em cima, o vão aceso embaixo) e
              entra 30 unidades mais baixo, ou seja, fechado sobre o vão. O
              ripado e o traço fino andam juntos porque estão no mesmo ator: o
              portão é uma peça só. */}
          <g
            data-move-when="build"
            data-move-y="30"
            data-move-dur="0.85"
            data-move-ease="power2.out"
          >
            <path {...mass('deep')} d="M116 300v-68h100v68Z" />
            <g data-scene-draw>
              <path {...detail(0.22, 1)} d={SLATS.map((y) => `M116 ${y}H216`).join('')} />
              <path {...detail(0.3)} d="M116 300H216" />
            </g>
          </g>
          {/* caixa do eixo: fica onde está, é ela que recolhe o ripado */}
          <path {...mass('near')} d="M110 220h112v13H110Z" />
          {/* o vão aceso do portão */}
          <path {...glass(ID)} d="M116 330v-30h100v30Z" />
          <path {...accent(0.22)} d="M116 330v-30h100v30Z" />
          {/* janelas acesas */}
          <rect {...glass(ID)} x="240" y="228" width="46" height="36" rx="3" />
          <rect {...glass(ID)} x="294" y="228" width="46" height="36" rx="3" />
          <g filter={`url(#${ID}-haze)`} opacity=".85">
            <rect x="236" y="224" width="54" height="44" fill="rgb(var(--brand-2) / .24)" />
            <rect x="290" y="224" width="54" height="44" fill="rgb(var(--brand-2) / .24)" />
            <rect x="112" y="298" width="108" height="34" fill="rgb(var(--brand-2) / .26)" />
          </g>
          {/* quadro de energia: o detalhe que antecipa o risco */}
          <rect {...mass('near')} x="322" y="278" width="20" height="26" rx="3" />
        </g>

        {/* cones e manchas: as aberturas jogam luz no ar e no piso */}
        <g>
          <LightCone x={263} y={264} length={64} spread={26} angle={94} opacity={0.18} />
          <LightCone x={317} y={264} length={64} spread={26} angle={86} opacity={0.18} />
          <LightCone x={166} y={318} length={54} spread={44} angle={92} opacity={0.2} />
          <ellipse cx="263" cy="331" rx="42" ry="8" fill="rgb(var(--brand-2) / .16)" />
          <ellipse cx="317" cy="331" rx="42" ry="8" fill="rgb(var(--brand-2) / .16)" />
          <ellipse cx="166" cy="334" rx="74" ry="11" fill="rgb(var(--brand-2) / .2)" />
        </g>

        <g data-scene-draw>
          <path {...outline(1.5, 0.34)} d="M116 330v-98h100v98H116Z" />
          <rect {...outline(1.3, 0.3)} x="110" y="220" width="112" height="13" rx="2" />
          <rect {...outline(1.4, 0.32)} x="240" y="228" width="46" height="36" rx="3" />
          <rect {...outline(1.4, 0.32)} x="294" y="228" width="46" height="36" rx="3" />
          <path {...detail(0.26)} d="M263 228v36M240 246h46M317 228v36M294 246h46" />
          <rect {...outline(1.3, 0.3)} x="322" y="278" width="20" height="26" rx="3" />
          <path {...accentStroke(1.6, 0.85)} d="M334 284l-6 9h9l-6 9" />
        </g>

        <Sombra x={250} y={330} rx={176} ry={15} />
      </g>

      {/* ========================= ESTOQUE E OPERAÇÃO (depth .9) ========== */}
      <g data-depth="0.9">
        <g data-scene-fill>
          {STACK_MAIN.map((c) => (
            <Crate key={`ma-${c.x}-${c.y}`} {...c} mode="fill" />
          ))}
        </g>
        <g data-scene-draw>
          {STACK_MAIN.map((c) => (
            <Crate key={`md-${c.x}-${c.y}`} {...c} mode="draw" />
          ))}
        </g>

        {/* ATORES — a PILHA CEDE. Os dois volumes do topo giram sobre a quina
            que ainda apoia e escorregam para fora; as durações diferentes fazem
            um ceder antes do outro, que é como uma pilha desmorona. */}
        <g data-scene-fill>
          {STACK_TOPO.map((t) => (
            <g
              key={`ta-${t.c.x}`}
              data-move-when="risk"
              data-move-rot={t.rot}
              data-move-x={t.dx}
              data-move-y={t.dy}
              data-move-origin={quina(t.c.w, 18, t.quina)}
              data-move-dur={t.dur}
              data-move-ease={t.ease}
            >
              <Crate {...t.c} mode="fill" />
            </g>
          ))}
        </g>
        <g data-scene-draw>
          {STACK_TOPO.map((t) => (
            <g
              key={`td-${t.c.x}`}
              data-move-when="risk"
              data-move-rot={t.rot}
              data-move-x={t.dx}
              data-move-y={t.dy}
              data-move-origin={quina(t.c.w, 18, t.quina)}
              data-move-dur={t.dur}
              data-move-ease={t.ease}
            >
              <Crate {...t.c} mode="draw" />
            </g>
          ))}
        </g>
        <Sombra x={470} y={339} rx={78} ry={11} opacity={0.8} />

        <g data-scene-fill>
          {STACK_SIDE.map((c) => (
            <Crate key={`sa-${c.x}-${c.y}`} {...c} mode="fill" />
          ))}
        </g>
        <g data-scene-draw>
          {STACK_SIDE.map((c) => (
            <Crate key={`sd-${c.x}-${c.y}`} {...c} mode="draw" />
          ))}
        </g>

        {/* ------------------------------- MÁQUINA e ESTEIRA (primeiro plano) */}
        <g data-scene-fill>
          {/* corpo em três faces, sobre base opaca */}
          <path fill={SOLID} d={`M24 368V296l16 ${MDY}H120V${MBY}L104 368Z`} />
          <path {...topFace(ID)} d={`M24 296h80l16 ${MDY}H40Z`} />
          <path {...sideFace(ID)} d={`M104 296l16 ${MDY}V${MBY}L104 368Z`} />
          <path {...volume(ID)} d="M24 368V296h80v72Z" />
          {/* primeiro plano: a massa da frente é mais densa que a do galpão */}
          <path {...mass('mid')} d="M24 368V296h80v72Z" opacity=".7" />
          {/* pés */}
          <path {...mass('ink')} d="M32 368h16v7H32ZM82 368h16v7H82Z" />
          {/* painel de comando */}
          <rect {...glass(ID)} x="30" y="302" width="30" height="11" rx="2" />
          {/* par de engrenagens engrenadas — a operação em marcha */}
          <Gear cx={62} cy={338} r={18} mode="fill" dur="9s" />
          <Gear cx={88} cy={352} r={7} teeth={6} mode="fill" dur="3.5s" reverse />
          {/* a massa da esteira entra junto com a da máquina: é a mesma peça de
              operação, e um grupo de massa a menos encurta a construção */}
          <path {...mass('deep')} d="M104 322h58v12h-58Z" />
          <path {...mass('ink')} d="M126 334h5v22h-5ZM152 334h5v22h-5Z" />
        </g>

        <g data-scene-draw>
          <path {...outline(1.6, 0.38)} d="M24 368V296h80v72Z" />
          <path
            {...outline(1.3, 0.3)}
            d={`M24 296l16 ${MDY}H120V${MBY}L104 368M104 296l16 ${MDY}`}
          />
          <rect {...outline(1.2, 0.26)} x="30" y="302" width="30" height="11" rx="2" />
          <Gear cx={62} cy={338} r={18} mode="draw" />
          <Gear cx={88} cy={352} r={7} teeth={6} mode="draw" />
          <circle {...accentStroke(2, 0.85)} cx="68" cy="307" r="2.4" />
        </g>

        {/* a esteira que sai da máquina: a operação correndo de verdade */}
        <g data-scene-live>
          <path
            d="M108 328H158"
            fill="none"
            stroke="rgb(var(--brand-2) / .75)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={ESTEIRA_TRACO}
            className="animate-dash-move"
            style={{ animationDuration: '0.9s' }}
          />
        </g>
        <g data-scene-draw>
          <path {...outline(1.3, 0.3)} d="M104 322h58v12h-58Z" />
        </g>
        <Sombra x={72} y={375} rx={58} ry={10} />

        {/* ---------------------------------- EQUIPE (primeiro plano) ======
            ATORES — a EQUIPE ENTRA. Cada pessoa vem de fora do quadro e assenta
            no seu posto; as durações diferentes espalham as chegadas, e quem
            está mais longe entra do lado oposto. Gestos curtos: ninguém
            atravessa a cena inteira. */}
        <g data-scene-fill>
          {/* a pessoa que confere o estoque, na distância do galpão: bem menor
              que a equipe da frente — é o que abre a profundidade do pátio */}
          <g data-move-when="build" data-move-x="34" data-move-dur="0.9" data-move-ease="power2.out">
            <Figure x={366} y={336} scale={0.33} tone={MASS.deep} />
          </g>
          <g data-move-when="build" data-move-x="-52" data-move-dur="0.8" data-move-ease="power2.out">
            <Figure x={186} y={358} scale={0.5} reach="left" tone={MASS.ink} />
          </g>
          <g data-move-when="build" data-move-x="-64" data-move-dur="1" data-move-ease="power2.out">
            <Figure x={250} y={361} scale={0.53} tone={MASS.ink} />
          </g>
          <g data-move-when="build" data-move-x="-76" data-move-dur="1.15" data-move-ease="power2.out">
            <Figure x={288} y={358} scale={0.5} reach="right" tone={MASS.ink} />
          </g>
        </g>
        <Sombra x={232} y={361} rx={96} ry={10} opacity={0.7} />
      </g>

      {/* ================= CONTRATO COM GARANTIA (no ar, depth .8) ========
          ATOR — o contrato DESCE no ar e assenta. Um único ator para a massa e
          para o contorno: a folha é uma peça só, e o parallax continua no grupo
          de fora, que é o único que pode escrever `transform` além dele. */}
      <g data-depth="0.8">
        <g data-move-when="build" data-move-y="-46" data-move-dur="0.95" data-move-ease="power2.out">
        <g data-scene-fill>
          <g transform={DOC}>
            <rect x="0" y="0" width="84" height="106" rx="4" fill="rgb(var(--panel) / .92)" />
            <rect x="0" y="0" width="84" height="106" rx="4" {...volume(ID)} opacity=".5" />
            {/* orelha dobrada */}
            <path {...mass('near')} d="M62 0l22 22H62Z" />
            {/* selo de garantia */}
            <path {...accent(0.5)} d="M55 96l-6 16 13-6 9 7-3-17Z" />
            <circle {...brandFill(ID)} cx="62" cy="88" r="13" opacity=".9" />
          </g>
        </g>

        <g data-scene-draw>
          <g transform={DOC}>
            <rect {...outline(1.5, 0.34)} x="0" y="0" width="84" height="106" rx="4" />
            <path {...detail(0.3)} d="M62 0l22 22H62Z" />
            <path
              {...detail(0.28, 1.1)}
              strokeDasharray="3 5"
              d="M12 26H72M12 38H72M12 50H72M12 62H62M12 74H44"
            />
            <circle {...accentStroke(1.6, 0.7)} cx="62" cy="88" r="13" />
            {/* relevo do selo */}
            <circle {...detail(0.4, 1.2)} cx="62" cy="88" r="6.5" />
          </g>
        </g>
        </g>
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 1. o rombo no telhado com a brasa por dentro, e o fogo saindo */}
      <g data-scene-risk data-risk-delay="0">
        {/* fuligem: a coluna densa que fica no ar, por baixo das baforadas */}
        <ellipse
          cx="276"
          cy="126"
          rx="78"
          ry="46"
          fill={`${INK.mid}`}
          filter={`url(#${ID}-haze)`}
        />
        <ellipse
          cx="302"
          cy="80"
          rx="46"
          ry="28"
          fill={`${INK.mid}`}
          filter={`url(#${ID}-haze)`}
          opacity=".8"
        />
        {/* o telhado rompido, e a brasa que se vê pelo rombo */}
        <path
          {...mass('void')}
          d="M232 196l16-22 20 8 14-14 18 20-6 12-24-6-14 8z"
        />
        <path {...alert(0.6)} d="M240 192l12-16 16 7 11-11 13 15-5 9-19-5-11 6z" />

        {/* ATOR — a FUMAÇA TOMA O TELHADO: sobe e se espalha a partir do pé da
            coluna (origem na base da caixa), enquanto as baforadas seguem com o
            movimento próprio delas. */}
        <g
          data-move-when="risk"
          data-move-y="-26"
          data-move-scale="1.3"
          data-move-origin="50% 100%"
          data-move-dur="0.62"
          data-move-ease="power1.out"
        >
          <Smoke id={ID} x={244} y={158} scale={1.5} />
          <Smoke id={ID} x={276} y={142} scale={1.25} />
          <Smoke id={ID} x={310} y={154} scale={1.05} />
        </g>

        {/* ATOR — o fogo do telhado NASCE no rombo e ganha a água inteira.
            `px`/`py` é o pé do conjunto de chamas: o ponto que fica parado.
            A caixa de uma chama vai de -30 a +30 em volta do pé e de -60 a +16
            na vertical (o halo é a peça mais larga), tudo multiplicado pela
            escala — daí o centro da base do conjunto em 266,25 / 216. */}
        <Cresce fator={2.2} px={266.25} py={216} origin="50% 100%" dur={0.6}>
          <Flame id={ID} x={256} y={196} scale={1.25} />
          <Flame id={ID} x={292} y={188} scale={0.9} />
          <Flame id={ID} x={228} y={200} scale={0.66} glow={false} />
        </Cresce>
        <Brasa x={272} y={168} count={4} spread={92} />
        <Sparks x={262} y={182} count={6} radius={30} tone="alert" />
        {/* o incêndio ilumina a fachada inteira em âmbar */}
        <ellipse
          cx="252"
          cy="238"
          rx="164"
          ry="106"
          fill="rgb(var(--alert) / .2)"
          filter={`url(#${ID}-haze)`}
        />
        <ellipse
          cx="262"
          cy="196"
          rx="96"
          ry="52"
          fill="rgb(var(--alert-2) / .22)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      {/* 2. o fogo NASCE NO ESTOQUE e cresce.
             ATOR — é o começo do caso: uma chama pequena entre os volumes que
             ganha a pilha. O pé do conjunto fica parado em 455,5 / 243,6 (mesmo
             cálculo de caixa do fogo do telhado) e tudo abre a partir dele. */}
      <g data-scene-risk data-risk-delay="0.08">
        <Smoke id={ID} x={450} y={212} scale={0.9} />
        <Cresce fator={2.4} px={455.5} py={243.6} origin="50% 100%" dur={0.6}>
          <Flame id={ID} x={448} y={230} scale={0.85} />
          <Flame id={ID} x={476} y={238} scale={0.5} glow={false} />
        </Cresce>
        <Brasa x={456} y={216} count={3} spread={56} />
        <ellipse
          cx="462"
          cy="266"
          rx="86"
          ry="62"
          fill="rgb(var(--alert) / .18)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      {/* 3. a sirene dispara e a operação apaga: as janelas perdem a luz */}
      <g data-scene-risk data-risk-delay="0.14">
        <rect x="240" y="228" width="46" height="36" rx="3" fill={`${INK.deep}`} />
        <rect x="294" y="228" width="46" height="36" rx="3" fill={`${INK.deep}`} />
        <path d="M116 330v-30h100v30Z" fill={`${INK.deep}`} />
        {/* a sirene na quina da fachada */}
        <path {...mass('ink')} d="M92 214h6v18h-6Z" />
        <path {...alert(0.95)} d="M95 206h16v11H95Z" />
        <ellipse
          data-scene-live
          cx="103"
          cy="211"
          rx="26"
          ry="20"
          fill="rgb(var(--alert-2) / .42)"
          filter={`url(#${ID}-haze)`}
          className="fill-box animate-flicker"
          style={{ animationDuration: '0.9s' }}
        />
        <LightCone x={112} y={211} length={92} spread={40} angle={16} tone="alert" opacity={0.16} />
      </g>

      {/* 4. a engrenagem essencial TRAVA.
             O giro é uma animação de CSS e não se desliga do meio da timeline.
             Então: um disco opaco cobre a peça viva, uma cópia PARADA entra no
             lugar dela e é essa cópia que dá o último quarto de volta e morre —
             `power4.out` é uma desaceleração, não um deslocamento. A marca de
             parada entra por cima, crescendo. */}
      <g data-scene-risk data-risk-delay="0.2">
        <circle cx="62" cy="338" r="27" fill={`${INK.mid}`} />
        {/* a engrenagem pequena é engrenada na grande: se uma para, a outra não
            pode continuar girando. Ela desaparece sob a mesma massa. */}
        <circle cx="88" cy="352" r="12" fill={`${INK.mid}`} />
        <g
          data-move-when="risk"
          data-move-rot="44"
          data-move-origin="50% 50%"
          data-move-dur="0.5"
          data-move-ease="power4.out"
        >
          <Gear cx={62} cy={338} r={18} mode="fill" spin={false} />
        </g>
        <Cresce fator={2.4} px={62} py={338} origin="50% 50%" dur={0.3} ease="back.out(2.2)">
          <path
            d="M44 320L80 356M80 320L44 356"
            fill="none"
            stroke="rgb(var(--fg) / .18)"
            strokeWidth="7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M44 320L80 356M80 320L44 356"
            fill="none"
            stroke="rgb(var(--alert) / .9)"
            strokeWidth="3.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </Cresce>
        {/* a esteira para junto: o tracejado some sob a marca de parada */}
        <path d="M104 322h58v12h-58Z" fill={`${INK.mid}`} />
      </g>

      {/* 5. o selo do contrato SE ROMPE: a garantia que não se apresenta.
             ATORES — o disco do selo é desenhado em duas metades, coincidentes
             com o selo inteiro da construção. No imprevisto cada metade sai para
             o seu lado, girando em volta do ponto de partição (a origem de uma é
             100% e a da outra 0% da própria caixa: as duas apontam para o mesmo
             ponto, o centro do selo). */}
      <g transform={DOC}>
        <g data-scene-risk data-risk-delay="0.26">
          <g
            data-move-when="risk"
            data-move-x="-7"
            data-move-y="3"
            data-move-rot="-15"
            data-move-origin="100% 50%"
            data-move-dur="0.34"
            data-move-ease="power3.out"
          >
            <path {...brandFill(ID)} d="M62 75A13 13 0 0062 101Z" opacity=".9" />
            <path {...accentStroke(1.5, 0.7)} d="M62 75A13 13 0 0062 101" />
          </g>
          <g
            data-move-when="risk"
            data-move-x="7"
            data-move-y="-2"
            data-move-rot="13"
            data-move-origin="0% 50%"
            data-move-dur="0.44"
            data-move-ease="power3.out"
          >
            <path {...brandFill(ID)} d="M62 75A13 13 0 0162 101Z" opacity=".9" />
            <path {...accentStroke(1.5, 0.7)} d="M62 75A13 13 0 0162 101" />
          </g>
        </g>
        <Fracture d="M62 72l-6 10 8 5-6 9 5 8" delay={0.26} width={1.6} />
      </g>

      {/* 6. a parede estrutural trinca */}
      <Fracture d="M88 236l26 24-16 22 22 26-10 20" delay={0.32} />

      {/* ===================================================== a proteção == */}
      <g data-scene-shield>
        <path
          {...accentStroke(1.8, 0.42)}
          strokeDasharray="7 9"
          d="M20 340v44h520v-44"
        />
        <path
          d="M20 340v44h520v-44"
          fill="none"
          stroke="rgb(var(--brand-2) / .16)"
          strokeWidth="14"
          filter={`url(#${ID}-haze)`}
        />
      </g>
      <ShieldSeal id={ID} x={446} y={46} size={88} />
    </Scene>
  );
}

export default BusinessScene;
