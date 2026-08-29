import {
  Air,
  Contact,
  Flame,
  Fracture,
  Ground,
  INK,
  MASS,
  Scene,
  ShieldSeal,
  Smoke,
  accent,
  accentStroke,
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
 * Não tem giro próprio de propósito — é o equipamento essencial da operação, e
 * o imprevisto deste capítulo é justamente ele PARAR.
 */
function Gear({
  cx,
  cy,
  r,
  teeth = 8,
  mode,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth?: number;
  mode: 'fill' | 'draw';
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

  return (
    <>
      <path
        d={spokes}
        fill="none"
        stroke={`${INK.deep}`}
        strokeWidth={xy(r * 0.34)}
      />
      <circle {...mass('near')} cx={cx} cy={cy} r={r} />
      <circle {...mass('deep')} cx={cx} cy={cy} r={xy(r * 0.36)} />
    </>
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
/** Pilha principal, no pátio à direita do galpão (palete + 5 volumes). */
const STACK_MAIN = [
  { x: 414, y: 339, w: 112, h: 9 }, // palete
  { x: 414, y: 330, w: 54, h: 36 },
  { x: 470, y: 330, w: 54, h: 36 },
  { x: 424, y: 294, w: 52, h: 34 },
  { x: 480, y: 294, w: 42, h: 30 },
  { x: 436, y: 260, w: 44, h: 30 },
];

/** Pilha de separação, encostada na lateral do galpão (mais perto, menor). */
const STACK_SIDE = [
  { x: 384, y: 343, w: 64, h: 8, d: 14 },
  { x: 384, y: 335, w: 32, h: 26, d: 14 },
  { x: 418, y: 335, w: 30, h: 22, d: 14 },
];

/** Ripado do portão de enrolar. */
const SLATS = [244, 255, 266, 277, 288, 299, 310, 321];

/** Transformação do contrato — a folha inclinada, no ar, à esquerda. */
const DOC = 'translate(28 56) rotate(-4)';

/**
 * Capítulo 05 — Empresa.
 *
 * Leitura da imagem, do fundo para a frente: silo e chaminé de vizinhança;
 * o galpão em volume — fachada em dente de serra, telhado em shed com as faixas
 * de vidro recuando, parede lateral na sombra, portão de enrolar e janelas
 * acesas; o estoque empilhado no pátio; a máquina essencial e a equipe em
 * silhueta no primeiro plano, pequenas, dando a escala do prédio; e o contrato
 * com selo suspenso à esquerda — a garantia que sustenta os negócios.
 *
 * No imprevisto: fogo saindo do telhado com fumaça densa, fogo no estoque, a
 * luz que se apaga, a engrenagem travada, o selo do contrato rompido e a parede
 * estrutural que trinca.
 */
export function BusinessScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* --------------------------------------------- vizinhança, ao fundo */}
      <g data-scene-fill>
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

      {/* ============================================================ GALPÃO */}
      <g data-scene-fill>
        {/* base opaca do prédio: o chão e o silo não atravessam a alvenaria */}
        <path
          fill={SOLID}
          d={`M88 330V${VALLEY_Y}L176 ${RIDGE_Y}V${VALLEY_Y}L264 ${RIDGE_Y}V${VALLEY_Y}L352 ${RIDGE_Y}V330ZM352 ${VALLEY_Y}L${
            352 + DX
          } ${VALLEY_Y + DY}V310L352 330Z`}
        />
        {/* parede lateral, na sombra: recua na direção de fuga da cena */}
        <path {...sideFace(ID)} d={`M352 ${VALLEY_Y}L${352 + DX} ${VALLEY_Y + DY}V310L352 330Z`} />

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
        <g filter={`url(#${ID}-haze)`} opacity=".75">
          {SHEDS.map((x0) => {
            const x1 = x0 + 88;
            return (
              <path
                key={`halo-${x0}`}
                fill="rgb(var(--brand-2) / .16)"
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
        {/* portão de enrolar */}
        <path {...mass('deep')} d="M116 330v-98h100v98Z" />
        <path {...mass('near')} d="M110 220h112v13H110Z" />
        {/* janelas acesas */}
        <rect {...glass(ID)} x="240" y="228" width="46" height="36" rx="3" />
        <rect {...glass(ID)} x="294" y="228" width="46" height="36" rx="3" />
        <g filter={`url(#${ID}-haze)`} opacity=".8">
          <rect x="240" y="228" width="46" height="36" fill="rgb(var(--brand-2) / .18)" />
          <rect x="294" y="228" width="46" height="36" fill="rgb(var(--brand-2) / .18)" />
        </g>
        {/* quadro de energia: o detalhe que antecipa o risco */}
        <rect {...mass('near')} x="322" y="278" width="20" height="26" rx="3" />
      </g>

      <g data-scene-draw>
        <path {...outline(1.5, 0.34)} d="M116 330v-98h100v98" />
        <rect {...outline(1.3, 0.3)} x="110" y="220" width="112" height="13" rx="2" />
        {/* ripado fino do portão */}
        <path {...detail(0.22, 1)} d={SLATS.map((y) => `M116 ${y}H216`).join('')} />
        <rect {...outline(1.4, 0.32)} x="240" y="228" width="46" height="36" rx="3" />
        <rect {...outline(1.4, 0.32)} x="294" y="228" width="46" height="36" rx="3" />
        <path {...detail(0.26)} d="M263 228v36M240 246h46M317 228v36M294 246h46" />
        <rect {...outline(1.3, 0.3)} x="322" y="278" width="20" height="26" rx="3" />
        <path {...accentStroke(1.6, 0.85)} d="M334 284l-6 9h9l-6 9" />
      </g>

      <Contact id={ID} x={250} y={330} rx={176} ry={15} />

      {/* ========================================================== ESTOQUE */}
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
      <Contact id={ID} x={470} y={339} rx={78} ry={11} opacity={0.8} />

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
      <Contact id={ID} x={412} y={343} rx={52} ry={9} opacity={0.7} />

      {/* ====================================== MÁQUINA (primeiro plano) === */}
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
        <Gear cx={62} cy={338} r={18} mode="fill" />
        <Gear cx={88} cy={352} r={7} teeth={6} mode="fill" />
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

      <Contact id={ID} x={72} y={375} rx={58} ry={10} />

      {/* ========================================= EQUIPE (primeiro plano) = */}
      <g data-scene-fill>
        {/* a pessoa que confere o estoque, na distância do galpão: bem menor que
            a equipe da frente — é o que abre a profundidade do pátio */}
        <Figure x={366} y={336} scale={0.33} tone={MASS.deep} />
        <Figure x={152} y={358} scale={0.5} reach="left" tone={MASS.ink} />
        <Figure x={184} y={356} scale={0.46} />
        <Figure x={214} y={361} scale={0.53} tone={MASS.ink} />
        <Figure x={248} y={356} scale={0.48} />
        <Figure x={282} y={359} scale={0.51} reach="right" tone={MASS.ink} />
      </g>
      <Contact id={ID} x={214} y={361} rx={104} ry={10} opacity={0.7} />

      {/* ============================== CONTRATO COM GARANTIA (no ar) ====== */}
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

      {/* ==================================================== o imprevisto == */}

      {/* 1. fogo saindo do telhado, com fumaça densa — o risco principal */}
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
        <ellipse
          cx="272"
          cy="146"
          rx="98"
          ry="58"
          fill="rgb(var(--brand-2) / .12)"
          filter={`url(#${ID}-haze)`}
        />
        {/* o telhado rompido por onde o fogo sai */}
        <path
          {...mass('ink')}
          opacity=".5"
          d="M232 196l16-22 20 8 14-14 18 20-6 12-24-6-14 8z"
        />
        <Smoke id={ID} x={244} y={158} scale={1.5} />
        <Smoke id={ID} x={276} y={142} scale={1.25} />
        <Smoke id={ID} x={306} y={152} scale={1.05} />
        <Smoke id={ID} x={330} y={168} scale={0.8} />
        <Flame id={ID} x={256} y={196} scale={1.25} />
        <Flame id={ID} x={292} y={188} scale={0.9} />
        <Flame id={ID} x={228} y={200} scale={0.66} glow={false} />
      </g>

      {/* 2. o fogo alcança o estoque no pátio */}
      <g data-scene-risk data-risk-delay="0.08">
        <Smoke id={ID} x={450} y={212} scale={0.9} />
        <Flame id={ID} x={448} y={230} scale={0.85} />
        <Flame id={ID} x={476} y={238} scale={0.5} glow={false} />
      </g>

      {/* 3. a operação apaga: as janelas perdem a luz */}
      <g data-scene-risk data-risk-delay="0.14">
        <rect
          x="240"
          y="228"
          width="46"
          height="36"
          rx="3"
          fill={`${INK.deep}`}
        />
        <rect
          x="294"
          y="228"
          width="46"
          height="36"
          rx="3"
          fill={`${INK.deep}`}
        />
      </g>

      {/* 4. a engrenagem essencial travada: marca de parada sobre ela */}
      <g data-scene-risk data-risk-delay="0.2">
        <circle cx="62" cy="338" r="27" fill={`${INK.mid}`} />
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
          stroke="rgb(var(--brand-2) / .85)"
          strokeWidth="3.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 5. o selo do contrato se rompe: a garantia que não se apresenta */}
      <g transform={DOC}>
        <g data-scene-risk data-risk-delay="0.26">
          <path
            {...detail(0.34, 1.2)}
            strokeDasharray="3 5"
            d="M62 73a15 15 0 010 30"
          />
          <path {...mass('ink')} d="M75 82l12-6-7 15Z" opacity=".5" />
        </g>
        <Fracture d="M62 72l-6 10 8 5-6 9 5 8" delay={0.26} width={1.6} />
      </g>

      {/* 6. a parede estrutural trinca */}
      <Fracture d="M88 236l26 24-16 22 22 26-10 20" delay={0.32} />
      <Fracture d="M340 250l-22 22 14 20-10 18" delay={0.36} />

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
