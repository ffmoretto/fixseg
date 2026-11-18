import type { CSSProperties } from 'react';

import {
  Air,
  Ancora,
  type Caixa,
  Contact,
  GROUND_Y,
  Ground,
  INK,
  MASS,
  Scene,
  ShieldSeal,
  accent,
  accentStroke,
  detail,
  glass,
  mass,
  origem,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-life';

/* ==========================================================================
 * CAPÍTULO 01 — "Tudo começa com quem depende de você."
 * ==========================================================================
 * O QUE ESTA CENA PRECISA CONTAR, em três tempos:
 *
 *   1. CONSTRUÇÃO  uma casa acesa e três pessoas na frente dela. Uma delas —
 *                  a mais alta, com a pasta na mão — está ligada à casa por um
 *                  fio de luz que corre do peito dela até a porta: é a renda
 *                  entrando. O fio é o personagem principal da cena.
 *   2. IMPREVISTO  a pessoa SOME. Não "fica triste", não "deita": desaparece,
 *                  e no lugar dela fica o contorno vazado do corpo. O fio de
 *                  luz se rompe no meio do caminho, as janelas apagam, a pasta
 *                  cai no chão e as contas se acumulam na porta. Quem ficou se
 *                  encolhe em direção ao vão.
 *   3. PROTEÇÃO    o selo se forma EXATAMENTE sobre o vão — não em um canto
 *                  qualquer do quadro — e de dentro dele sai um fio novo, que
 *                  refaz o trajeto até a casa. As janelas voltam a acender e as
 *                  contas ganham o visto de pagas.
 *
 * A pessoa não volta. Essa é a ideia inteira do seguro de vida, e desenhar o
 * contrário seria mentir: o que o seguro devolve é a renda, não a pessoa.
 *
 * -----------------------------------------------------------------------------
 * POR QUE A CENA ANTERIOR NÃO FUNCIONAVA
 * -----------------------------------------------------------------------------
 * As figuras eram pequenas, do mesmo tamanho e espalhadas na frente de uma casa
 * que ocupava o meio do quadro; a "ausência" era um tracejado fino do mesmo tom
 * do fundo, e nada se MOVIA no instante em que ela acontecia. Sem movimento e
 * sem contraste, a falta não é percebida — o olho só vê um desenho um pouco
 * diferente do anterior. Aqui a casa foi para a direita, a família cresceu e
 * ficou à esquerda, com a figura que sustenta ISOLADA na ponta: o vão que ela
 * deixa é o maior espaço vazio do quadro.
 * ========================================================================== */

/* --- a casa --------------------------------------------------------------- */
const CASA_E = 250; // aresta esquerda da fachada
const CASA_D = 470; // aresta direita da fachada
const CASA_TOPO = 176; // onde a fachada encontra o beiral
const APICE = 118; // cumeeira do telhado
const CASA_MEIO = (CASA_E + CASA_D) / 2;

/* --- a família ------------------------------------------------------------ */
/** A pessoa que sustenta: mais alta e sozinha na ponta esquerda. */
const PROV_X = 112;
const PROV_H = 116;
/** Quem fica: juntos, à direita do vão. */
const PAR_X = 182;
const PAR_H = 102;
const FILHO_X = 226;
const FILHO_H = 70;

/* O ponto da casa onde a renda entra: a verga da porta. */
const PORTA_X = CASA_MEIO + 8;
const PORTA_TOPO = 246;

/* ==========================================================================
 * UMA PESSOA
 * ==========================================================================
 * Uma função só, usada três vezes para as figuras sólidas e mais uma para o
 * contorno do vão. É isso que garante que a AUSÊNCIA tenha exatamente a forma
 * da presença: se o contorno fosse desenhado à parte, qualquer diferença de
 * ombro ou de altura leria como "outra pessoa", não como "a que faltou".
 *
 * As proporções saem todas da altura, então uma criança não é um adulto
 * reduzido: a cabeça pesa mais no corpo, como pesa de verdade.
 */
function pessoa(x: number, h: number) {
  const base = GROUND_Y;
  const topo = base - h;
  /* cabeça: 11,5% da altura no adulto, e proporcionalmente maior em quem é
     mais baixo — é o que faz a criança parecer criança, e não gente pequena */
  const r = h * (h > 90 ? 0.115 : 0.135);
  const cy = topo + r;
  const ombro = cy + r * 1.45;
  const cintura = base - h * 0.4;
  const wo = h * 0.2; // meia-largura do ombro
  const wq = h * 0.16; // meia-largura do quadril
  /* Pernas mais cheias do que a primeira versão: em 0,58 do quadril elas
     viravam palito e a figura ficava com cara de boneco de arame. */
  const wp = wq * 0.74;

  return {
    cabeca: { cx: xy(x), cy: xy(cy), r: xy(r) },
    /* tronco: ombros arredondados descendo até a cintura */
    tronco:
      `M${xy(x - wo)} ${xy(ombro + 4)}` +
      `C${xy(x - wo)} ${xy(ombro - r * 0.9)} ${xy(x - wo * 0.45)} ${xy(ombro - r * 1.1)} ${xy(x)} ${xy(ombro - r * 1.1)}` +
      `C${xy(x + wo * 0.45)} ${xy(ombro - r * 1.1)} ${xy(x + wo)} ${xy(ombro - r * 0.9)} ${xy(x + wo)} ${xy(ombro + 4)}` +
      `L${xy(x + wq)} ${xy(cintura)}L${xy(x - wq)} ${xy(cintura)}Z`,
    /* pernas: duas, com um vão entre elas — uma massa só vira pedestal */
    pernaE: `M${xy(x - wq + 1)} ${xy(cintura - 2)}h${xy(wp)}v${xy(base - cintura + 2)}h${xy(-wp)}z`,
    pernaD: `M${xy(x + wq - wp - 1)} ${xy(cintura - 2)}h${xy(wp)}v${xy(base - cintura + 2)}h${xy(-wp)}z`,
    /* braço do lado de fora, levemente afastado do corpo */
    braco:
      `M${xy(x - wo * 0.82)} ${xy(ombro + 2)}` +
      `Q${xy(x - wo * 1.25)} ${xy(cintura - h * 0.08)} ${xy(x - wo * 1.05)} ${xy(cintura + h * 0.04)}`,
    /* medidas que a cena reaproveita */
    m: { topo, cy, r, ombro, cintura, wo },
  };
}

/** Desenha uma pessoa em massa (a versão "presente"). */
function Pessoa({
  x,
  h,
  tom = 'body',
  children,
}: {
  x: number;
  h: number;
  tom?: 'body' | 'near' | 'deep';
  children?: React.ReactNode;
}) {
  const p = pessoa(x, h);
  return (
    <g>
      <path d={p.pernaE} fill={INK.deep} />
      <path d={p.pernaD} fill={INK.deep} />
      <path d={p.tronco} fill={INK[tom]} />
      <path {...detail(0.22, 1.2)} d={p.braco} strokeWidth={Math.max(2.4, h * 0.05)} />
      <circle cx={p.cabeca.cx} cy={p.cabeca.cy} r={p.cabeca.r} fill={INK[tom]} />
      {/* aresta de luz no ombro: o que separa a figura do fundo sem contorno */}
      <path
        {...detail(0.3, 1.1)}
        d={`M${xy(x - p.m.wo * 0.5)} ${xy(p.m.ombro - p.m.r * 0.9)}Q${xy(x)} ${xy(
          p.m.ombro - p.m.r * 1.25,
        )} ${xy(x + p.m.wo * 0.5)} ${xy(p.m.ombro - p.m.r * 0.9)}`}
      />
      {children}
    </g>
  );
}

/** O mesmo corpo, agora como VAZIO: só o contorno tracejado da silhueta. */
function Vazio({ x, h }: { x: number; h: number }) {
  const p = pessoa(x, h);
  const traco = {
    fill: 'none',
    stroke: 'rgb(var(--brand-2) / .95)',
    strokeWidth: 2.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: '7 7',
    vectorEffect: 'non-scaling-stroke' as const,
  };
  return (
    <g>
      {/* o vão é mais claro que o fundo: a falta precisa ter presença */}
      <path d={p.tronco} fill="rgb(var(--brand-2) / .10)" />
      <path d={p.pernaE} fill="rgb(var(--brand-2) / .10)" />
      <path d={p.pernaD} fill="rgb(var(--brand-2) / .10)" />
      <circle cx={p.cabeca.cx} cy={p.cabeca.cy} r={p.cabeca.r} fill="rgb(var(--brand-2) / .10)" />
      <path {...traco} d={p.tronco} />
      <path {...traco} d={p.pernaE} />
      <path {...traco} d={p.pernaD} />
      <circle {...traco} cx={p.cabeca.cx} cy={p.cabeca.cy} r={p.cabeca.r} />
    </g>
  );
}

/** Envelope de conta que se acumula na porta. */
function Conta({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${xy(x)} ${xy(y)}) rotate(${xy(rot)})`}>
      <rect x="-15" y="-10" width="30" height="20" rx="2.5" fill={INK.near} />
      <path {...detail(0.34, 1.2)} d="M-15 -10 0 2 15 -10" />
      <rect {...detail(0.2, 1)} x="-15" y="-10" width="30" height="20" rx="2.5" />
    </g>
  );
}

/* Caixas dos atores: ver `Ancora` em sceneParts — o pivô vira medida, não
   chute. A do grupo que fica inclui as duas figuras. */
const CAIXA_FICAM: Caixa = [150, 212, 110, 124];

export function LifeScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ---------------------------------------------------------------- fundo */}
      <g data-scene-fill data-depth="0.12">
        {/* vizinhança: silhuetas que dão rua à casa */}
        <path d="M18 330V262l34-26 34 26v68Z" fill={INK.far} />
        <path d="M486 330v-58l28-21 28 21v58Z" fill={INK.far} />
        {/* árvore atrás da casa, com copa que balança */}
        <rect x="222" y="246" width="7" height="84" fill={INK.mid} />
        <g
          data-scene-live
          className="animate-sway-soft"
          style={{ transformOrigin: '226px 250px' } as CSSProperties}
        >
          <circle cx="226" cy="232" r="34" fill={INK.far} />
          <circle cx="206" cy="246" r="22" fill={INK.far} />
          <circle cx="246" cy="244" r="20" fill={INK.far} />
        </g>
      </g>

      {/* ---------------------------------------------------------------- a casa */}
      <g data-scene-fill data-depth="0.45">
        <Contact id={ID} x={CASA_MEIO} rx={160} ry={16} opacity={0.5} />

        {/* fachada */}
        <path d={`M${CASA_E} ${CASA_TOPO}H${CASA_D}V${GROUND_Y}H${CASA_E}Z`} {...volume(ID)} />
        {/* lateral em perspectiva curta: é o que tira a casa do plano chapado */}
        <path d={`M${CASA_D} ${CASA_TOPO}L${CASA_D + 32} ${CASA_TOPO + 20}V${GROUND_Y}H${CASA_D}Z`} {...sideFace(ID)} />
        {/* telhado */}
        <path d={`M${CASA_E - 18} ${CASA_TOPO}L${CASA_MEIO} ${APICE}L${CASA_D + 18} ${CASA_TOPO}Z`} {...topFace(ID)} />
        <path
          d={`M${CASA_D + 18} ${CASA_TOPO}L${CASA_MEIO} ${APICE}L${CASA_MEIO + 30} ${APICE + 13}L${CASA_D + 44} ${CASA_TOPO + 20}Z`}
          fill={INK.mid}
        />
        {/* chaminé */}
        <path d="M402 134h24v42h-24z" fill={INK.near} />
        <path d="M399 128h30v9h-30z" fill={INK.deep} />
      </g>

      {/* fumaça da chaminé: a casa está habitada, e isso se vê antes de
          qualquer texto */}
      <g data-depth="0.45">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            data-scene-live
            cx={414 + i * 3}
            cy={122}
            r={7 + i}
            fill={`rgb(var(--fg) / ${MASS.air})`}
            className="animate-smoke-rise"
            style={{ animationDelay: `${i * 1.1}s` } as CSSProperties}
          />
        ))}
      </g>

      {/* contornos da casa */}
      <g data-scene-draw data-depth="0.45">
        <path {...outline(1.6, 0.34)} d={`M${CASA_E} ${GROUND_Y}V${CASA_TOPO}H${CASA_D}V${GROUND_Y}`} />
        <path {...outline(1.6, 0.34)} d={`M${CASA_E - 18} ${CASA_TOPO}L${CASA_MEIO} ${APICE}L${CASA_D + 18} ${CASA_TOPO}`} />
      </g>

      {/* --------------------------------------------------- portas e janelas */}
      <g data-scene-fill data-depth="0.5">
        {/* porta */}
        <rect x={PORTA_X - 26} y={PORTA_TOPO} width="52" height={GROUND_Y - PORTA_TOPO} rx="4" fill={INK.void} />
        <rect x={PORTA_X - 21} y={PORTA_TOPO + 6} width="42" height={GROUND_Y - PORTA_TOPO - 6} rx="3" {...volume(ID)} />
        <circle cx={PORTA_X + 12} cy={PORTA_TOPO + 44} r="3" fill={INK.lift} />
        {/* degrau */}
        <path d={`M${PORTA_X - 40} ${GROUND_Y}h80l10 10h-100Z`} fill={INK.mid} />
      </g>

      {/* JANELAS — dois estados no mesmo lugar.
          O estado ACESO sai no imprevisto (`data-scene-vanish`); o apagado
          entra no mesmo instante. A troca é o que faz a casa "esfriar". */}
      <g data-depth="0.5">
        {[CASA_E + 30, CASA_D - 76].map((jx) => (
          <g key={jx}>
            <rect data-scene-fill x={jx} y="206" width="46" height="44" rx="4" fill={INK.void} />
            {/* aceso */}
            <g data-scene-vanish data-risk-delay="1">
              <rect x={jx + 3} y="209" width="40" height="38" rx="3" {...glass(ID)} />
              <rect x={jx + 3} y="209" width="40" height="38" rx="3" fill="rgb(var(--brand-2) / .3)" />
              <ellipse
                cx={jx + 23}
                cy={228}
                rx="40"
                ry="34"
                fill="rgb(var(--brand-2) / .16)"
                filter={`url(#${ID}-haze)`}
              />
            </g>
            {/* apagado */}
            <rect
              data-scene-risk
              data-risk-delay="2"
              x={jx + 3}
              y="209"
              width="40"
              height="38"
              rx="3"
              fill={INK.void}
            />
            {/* aceso de novo, na proteção */}
            <g data-scene-shield>
              <rect x={jx + 3} y="209" width="40" height="38" rx="3" {...glass(ID)} />
              <rect x={jx + 3} y="209" width="40" height="38" rx="3" fill="rgb(var(--brand-2) / .34)" />
            </g>
            <path {...detail(0.3, 1.2)} d={`M${jx + 23} 206v44M${jx + 3} 228h40`} />
          </g>
        ))}
      </g>

      {/* ============================================================ A RENDA
          O fio que liga quem sustenta à casa. Na construção ele corre com os
          tracinhos em movimento — dinheiro entrando. */}
      <g data-scene-vanish data-risk-delay="0">
        <path
          data-scene-live
          {...accentStroke(2.8, 0.95)}
          strokeDasharray="10 9"
          className="animate-dash-move"
          d={`M${PROV_X + 24} ${xy(GROUND_Y - PROV_H * 0.56)}C190 ${xy(GROUND_Y - PROV_H * 0.9)} 300 196 ${PORTA_X - 30} ${PORTA_TOPO - 6}`}
          filter={`url(#${ID}-glow)`}
        />
        <circle cx={PORTA_X - 30} cy={PORTA_TOPO - 6} r="5" {...accent(0.95)} />
      </g>

      {/* O FIO ROMPIDO: entra no imprevisto, com as duas pontas soltas. */}
      <g data-scene-risk data-risk-delay="1">
        <path
          {...accentStroke(2.6, 0.5)}
          strokeDasharray="10 9"
          d={`M${PROV_X + 24} ${xy(GROUND_Y - PROV_H * 0.56)}C170 ${xy(GROUND_Y - PROV_H * 0.86)} 206 212 232 206`}
        />
        <path {...accentStroke(2.6, 0.5)} strokeDasharray="10 9" d={`M292 200C320 198 ${PORTA_X - 46} 224 ${PORTA_X - 30} ${PORTA_TOPO - 6}`} />
        {/* a ruptura */}
        <path {...outline(2.4, 0.5)} stroke="rgb(var(--alert) / .95)" d="M236 200l16 10M252 196l-16 12" />
      </g>

      {/* =================================================== QUEM SUSTENTA */}
      {/* Sai no imprevisto. A pasta na mão é o que identifica a figura como a
          que trabalha fora — e é ela que cai quando a pessoa deixa de estar. */}
      <g data-scene-vanish data-risk-delay="0" data-depth="0.95">
        <Contact id={ID} x={PROV_X} rx={34} ry={7} opacity={0.75} />
        <g
          data-scene-live
          className="animate-bob-soft"
          style={{ animationDuration: '4.2s' } as CSSProperties}
        >
          <Pessoa x={PROV_X} h={PROV_H} tom="near">
            {/* pasta de trabalho */}
            <g>
              <rect x={PROV_X + 14} y={GROUND_Y - 54} width="30" height="23" rx="3" fill={INK.deep} />
              <path {...detail(0.34, 1.4)} d={`M${PROV_X + 24} ${GROUND_Y - 54}v-6h10v6`} />
              <path {...detail(0.26, 1.2)} d={`M${PROV_X + 14} ${GROUND_Y - 44}h30`} />
            </g>
          </Pessoa>
        </g>
      </g>

      {/* ======================================================== O VÃO
          Mesma silhueta, agora vazada. É o elemento mais claro do quadro no
          instante do imprevisto — de propósito. */}
      <g data-scene-risk data-risk-delay="0" data-depth="0.95">
        <Vazio x={PROV_X} h={PROV_H} />
      </g>

      {/* A PASTA NO CHÃO: cai no mesmo instante, e fica. */}
      <g
        data-scene-risk
        data-risk-delay="1"
        data-move-when="risk"
        data-move-y="4"
        data-move-rot="-14"
        data-move-dur="0.45"
        data-move-ease="bounce.out"
        data-move-origin="50% 100%"
        data-depth="0.95"
      >
        <rect x={PROV_X + 18} y={GROUND_Y - 20} width="34" height="20" rx="3" fill={INK.deep} />
        <path {...detail(0.3, 1.2)} d={`M${PROV_X + 30} ${GROUND_Y - 20}v-5h10v5`} />
      </g>

      {/* ============================================== QUEM FICA
          As duas figuras se aproximam do vão no instante do imprevisto: é um
          deslocamento pequeno, de 9 unidades, e é o que transforma duas pessoas
          paradas em duas pessoas que SENTIRAM o que aconteceu. */}
      <g
        data-move-when="risk"
        data-move-x="-9"
        data-move-dur="0.7"
        data-move-ease="power2.out"
        data-move-origin={origem(CAIXA_FICAM, PAR_X, GROUND_Y)}
        data-depth="0.92"
      >
        <Ancora box={CAIXA_FICAM} />
        <Contact id={ID} x={PAR_X} rx={30} ry={6} opacity={0.7} />
        <Contact id={ID} x={FILHO_X} rx={22} ry={5} opacity={0.7} />
        <g
          data-scene-live
          className="animate-bob-soft"
          style={{ animationDuration: '5.1s' } as CSSProperties}
        >
          <Pessoa x={PAR_X} h={PAR_H} />
        </g>
        <g
          data-scene-live
          className="animate-bob-soft"
          style={{ animationDuration: '3.4s', animationDelay: '.6s' } as CSSProperties}
        >
          <Pessoa x={FILHO_X} h={FILHO_H} />
        </g>
      </g>

      {/* ============================================== AS CONTAS
          Chegam no imprevisto e se empilham na porta: a vida financeira não
          para quando a renda para. */}
      <g data-scene-risk data-risk-delay="2" data-depth="0.6">
        <Conta x={PORTA_X - 30} y={GROUND_Y + 4} rot={-9} />
        <Conta x={PORTA_X + 2} y={GROUND_Y + 8} rot={6} />
        <Conta x={PORTA_X + 30} y={GROUND_Y + 2} rot={-3} />
      </g>

      {/* ============================================== A PROTEÇÃO */}
      {/* O selo nasce no lugar exato do vão. */}
      <ShieldSeal id={ID} x={PROV_X - 44} y={GROUND_Y - PROV_H * 0.62 - 44} size={88} />

      {/* O fio refeito — agora saindo do selo. */}
      <g data-scene-shield>
        <path
          data-scene-live
          {...accentStroke(3, 1)}
          strokeDasharray="12 8"
          className="animate-dash-move"
          d={`M${PROV_X + 40} ${xy(GROUND_Y - PROV_H * 0.62)}C190 ${xy(GROUND_Y - PROV_H * 0.95)} 300 194 ${PORTA_X - 30} ${PORTA_TOPO - 6}`}
          filter={`url(#${ID}-glow)`}
        />
        <circle cx={PORTA_X - 30} cy={PORTA_TOPO - 6} r="6" {...accent(1)} />
      </g>

      {/* As contas ganham o visto: deixaram de ser um problema. */}
      <g data-scene-shield data-depth="0.6">
        <circle cx={PORTA_X + 2} cy={GROUND_Y + 8} r="13" fill="rgb(var(--panel) / .96)" />
        <circle cx={PORTA_X + 2} cy={GROUND_Y + 8} r="13" fill={`url(#${ID}-brand)`} opacity=".2" />
        <circle
          cx={PORTA_X + 2}
          cy={GROUND_Y + 8}
          r="13"
          fill="none"
          stroke={`url(#${ID}-brand)`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M${PORTA_X - 5} ${GROUND_Y + 8}l5 5 9-10`}
          fill="none"
          stroke={`url(#${ID}-brand)`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </Scene>
  );
}

export default LifeScene;
