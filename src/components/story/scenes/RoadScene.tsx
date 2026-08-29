import type { CSSProperties } from 'react';

import {
  Air,
  Contact,
  Fracture,
  Ground,
  INK,
  LightCone,
  Scene,
  ShieldSeal,
  Smoke,
  Sparks,
  Wheel,
  accent,
  accentStroke,
  alert,
  detail,
  glass,
  heat,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-road';

/* ========================================================================== */
/* GEOMETRIA COMPARTILHADA                                                    */
/* ========================================================================== */

/**
 * Ponto de fuga da pista. Tudo que recua na cena converge para cá: as bordas do
 * asfalto, as faixas centrais e a fila da frota. Fica um pouco à esquerda do
 * centro para abrir espaço ao caminhão no plano intermediário.
 */
const VP_X = 250;

/** Silhueta do automóvel de primeiro plano. Frente voltada para a ESQUERDA. */
const CAR_BODY =
  'M-105 -40C-105 -50 -99 -55 -88 -56L-58 -57L-32 -80L36 -82L60 -58L94 -56C102 -55 105 -50 105 -41V-18C105 -13 102 -10 97 -10H-97C-102 -10 -105 -13 -105 -18Z';
const CAR_WINDSHIELD = 'M-30 -78H-10V-56H-54Z';
const CAR_DOORGLASS = 'M-4 -78H26V-56H-4Z';
const CAR_BACKLIGHT = 'M32 -78H36L54 -56H32Z';

/** Baú do caminhão: a maior face lateral da cena, e a mais escura. */
const TRUCK_BOX = 'M-30 -90H78C83 -90 86 -87 86 -82V-22H-30Z';
const TRUCK_CAB = 'M-86 -22V-52C-86 -60 -82 -66 -74 -70L-62 -76H-30V-22Z';

/** Silhueta do furgão da frota: cabine baixa na frente, baú alto atrás. */
const VAN_BODY = 'M-30 -10V-19H-18L-12 -30H20C24 -30 26 -28 26 -24V-10Z';

/** Estilhaço de energia: mesma receita para os três fragmentos do impacto. */
const shard = (d: string) => ({ d, ...heat(ID), opacity: 0.9 });

/**
 * Traço que CORRE.
 *
 * O truque é o período do tracejado: `dash-move` desloca o `strokeDashoffset`
 * em exatamente 40 unidades por ciclo, então qualquer padrão cujo período
 * divida 40 (40, 20, 10, 8, 5) emenda sem salto. O tempo é o que dá a
 * perspectiva: o mesmo padrão corre devagar perto do horizonte e rápido em
 * primeiro plano.
 *
 * Nunca colocar isto dentro de um grupo `data-scene-draw` — o DrawSVG reescreve
 * `strokeDasharray` e a animação morre.
 */
function Running({
  d,
  width,
  dash,
  dur,
  color,
  opacity = 1,
  delay = 0,
}: {
  d: string;
  width: number;
  dash: string;
  dur: number;
  color: string;
  opacity?: number;
  delay?: number;
}) {
  return (
    <path
      data-scene-live
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="butt"
      strokeDasharray={dash}
      opacity={opacity}
      className="animate-dash-move"
      style={
        { animationDuration: `${dur}s`, animationDelay: `${delay}s` } as CSSProperties
      }
    />
  );
}

/* ========================================================================== */
/* AUTOMÓVEL — primeiro plano                                                 */
/* ========================================================================== */
/**
 * Perfil de carro construído em massa: o corpo leva uma base chapada mais o
 * gradiente de volume por cima (é o que dá peso à silhueta), as cavas de roda e
 * a saia inferior ficam na sombra, a vidraça é ciano frio e as rodas giram
 * sozinhas — a peça `Wheel` cuida do movimento.
 *
 * O farol é ciano (luz branca/fria) e a lanterna traseira é âmbar: é o único
 * uso legítimo do `--alert` fora do fogo, porque luz de freio é sinal de
 * perigo. Vermelho não existe na paleta — e não faz falta.
 *
 * A origem local é o PONTO DE CONTATO dos pneus com o chão, no centro do carro:
 * `translate(x, y)` assenta o veículo exatamente onde ele pisa no asfalto.
 */
function Car({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* corpo: base + volume */}
      <path {...mass('mid')} d={CAR_BODY} />
      <path {...volume(ID)} d={CAR_BODY} />
      {/* faixa de teto: pega a luz e afina a silhueta */}
      <path {...topFace(ID)} d="M-32 -82H36L34 -78H-30Z" />
      {/* saia inferior e para-choques: sempre na sombra */}
      <path {...mass('deep')} d="M-96 -16H96V-11H-96Z" />
      <path {...mass('deep')} d="M-106 -30H-86V-10H-97C-102 -10 -106 -14 -106 -20Z" />
      <path {...mass('deep')} d="M86 -30H106V-20C106 -14 102 -10 97 -10H86Z" />
      {/* cavas de roda: o vão escuro onde a roda entra */}
      <path {...mass('deep')} d="M-94 -10A30 30 0 01-34 -10Z" />
      <path {...mass('deep')} d="M28 -10A30 30 0 0188 -10Z" />

      {/* vidraça */}
      <path {...glass(ID)} d={CAR_WINDSHIELD} />
      <path {...glass(ID)} d={CAR_DOORGLASS} />
      <path {...glass(ID)} d={CAR_BACKLIGHT} />
      {/* reflexo corrido no vidro: uma lasca clara na diagonal */}
      <path d="M-28 -76L-14 -76L-40 -58H-50Z" fill="rgb(var(--brand-2) / .3)" />
      {/* retrovisor, colado na base da coluna */}
      <path {...mass('deep')} d="M-54 -58L-66 -56V-51L-54 -53Z" />

      {/* farol aceso */}
      <ellipse
        cx="-96"
        cy="-45"
        rx="22"
        ry="15"
        fill="rgb(var(--brand-2) / .3)"
        filter={`url(#${ID}-haze)`}
      />
      <path {...accent(0.95)} d="M-104 -50L-86 -47V-39L-104 -42Z" />
      {/* lanterna traseira em âmbar: luz de freio, o uso legítimo do alerta */}
      <ellipse
        cx="102"
        cy="-45"
        rx="15"
        ry="12"
        fill="rgb(var(--alert) / .34)"
        filter={`url(#${ID}-haze)`}
      />
      <path {...alert(0.92)} d="M99 -50H106V-40H99Z" />

      {/* rodas com giro próprio */}
      <Wheel id={ID} x={-64} y={-20} r={20} />
      <Wheel id={ID} x={58} y={-20} r={20} />

      {/* contorno e detalhes internos */}
      <g data-scene-draw>
        <path {...outline(1.7, 0.4)} d={CAR_BODY} />
        <path {...outline(1.3, 0.3)} d={CAR_WINDSHIELD} />
        <path {...outline(1.3, 0.3)} d={CAR_DOORGLASS} />
        <path {...outline(1.3, 0.3)} d={CAR_BACKLIGHT} />
        <path {...detail(0.26)} d="M-4 -56V-16M28 -56V-18M-58 -57L-32 -80" />
        <path {...detail(0.32, 1.4)} d="M2 -44H16" />
      </g>
    </g>
  );
}

/* ========================================================================== */
/* CAMINHÃO — plano intermediário                                             */
/* ========================================================================== */
/**
 * Cavalo com baú. A face lateral do baú é a mais densa da cena — é o volume que
 * tapa a luz; a cabine recebe o gradiente de volume e o chassi é um recorte de
 * tinta que amarra as duas peças ao chão. Também aponta para a esquerda.
 */
function Truck({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* baú: base + face lateral na sombra */}
      <path {...mass('mid')} d={TRUCK_BOX} />
      <path {...sideFace(ID)} d={TRUCK_BOX} />
      <path {...mass('near')} d="M-32 -94H86V-88H-32Z" />
      {/* cabine */}
      <path {...volume(ID)} d={TRUCK_CAB} />
      <path {...mass('near')} d="M-64 -80H-30V-74H-60Z" />
      <path {...glass(ID)} d="M-62 -72H-36V-54H-79Z" />
      {/* chassi, para-choque e cavas */}
      <path {...mass('deep')} d="M-86 -22H86V-14H-86Z" />
      <path {...mass('deep')} d="M-88 -22H-66V-12H-88Z" />
      <path
        {...mass('deep')}
        d="M-86 -14A22 22 0 01-42 -14ZM14 -14A22 22 0 0158 -14ZM40 -14A22 22 0 0184 -14Z"
      />
      {/* farol ciano na frente, lanterna âmbar atrás */}
      <path {...accent(0.9)} d="M-88 -46H-80V-38H-88Z" />
      <path {...alert(0.9)} d="M82 -46H86V-36H82Z" />
      <ellipse
        cx="86"
        cy="-41"
        rx="12"
        ry="10"
        fill="rgb(var(--alert) / .3)"
        filter={`url(#${ID}-haze)`}
      />

      <Wheel id={ID} x={-64} y={-18} r={18} />
      <Wheel id={ID} x={36} y={-18} r={18} />
      <Wheel id={ID} x={62} y={-18} r={18} />

      <g data-scene-draw>
        <path {...outline(1.5, 0.32)} d={TRUCK_BOX} />
        <path {...outline(1.5, 0.32)} d="M-86 -22V-52C-86 -60 -82 -66 -74 -70L-62 -76H-30" />
        <path {...detail(0.2)} d="M-12 -86V-26M6 -86V-26M24 -86V-26M42 -86V-26M60 -86V-26" />
      </g>
    </g>
  );
}

/* ========================================================================== */
/* FROTA — plano distante                                                     */
/* ========================================================================== */
/** Furgão pequeno: só massa `far` e rodas sem giro — é silhueta, não detalhe. */
function Van({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path {...mass('far')} d={VAN_BODY} />
      <path {...mass('mid')} d="M20 -30H26V-10H20Z" />
      <path d="M-27 -18H-19V-13H-27Z" fill="rgb(var(--brand-2) / .3)" />
      <path d="M22 -20H26V-14H22Z" fill="rgb(var(--alert) / .5)" />
      <circle {...mass('mid')} cx="-20" cy="-8" r="5.5" />
      <circle {...mass('mid')} cx="14" cy="-8" r="5.5" />
    </g>
  );
}

/* ========================================================================== */
/* ILUMINAÇÃO DA VIA                                                          */
/* ========================================================================== */
/**
 * Poste de iluminação: mastro em massa, braço curvo, luminária em ciano e um
 * cone de luz aberto até o asfalto. É o que dá altura à cena — sem ele a
 * ilustração se acumularia no rodapé do quadro.
 *
 * `dir` é o lado para onde o braço se estica (-1 esquerda, +1 direita). Origem
 * local no pé do poste. Todas as coordenadas derivadas passam por `xy()`: o
 * servidor e o navegador precisam gerar exatamente a mesma string.
 */
function LightPole({
  x,
  y,
  height,
  dir,
  arm,
  cone = true,
}: {
  x: number;
  y: number;
  height: number;
  dir: 1 | -1;
  arm: number;
  cone?: boolean;
}) {
  const top = -height;
  const lx = dir * arm; // luminária
  const ly = top - 12;

  return (
    <g transform={`translate(${x} ${y})`}>
      {cone && (
        <path
          d={`M${xy(lx - 9)} ${xy(ly + 6)}L${xy(lx - 58)} 2H${xy(lx + 58)}L${xy(lx + 9)} ${xy(ly + 6)}Z`}
          fill="rgb(var(--brand-2) / .09)"
          filter={`url(#${ID}-soft)`}
        />
      )}
      {/* mastro e base */}
      <path {...mass('near')} d={`M-4 0H4L2.4 ${xy(top)}H-2.4Z`} />
      <path {...mass('deep')} d="M-9 0H9V-7H-9Z" />
      {/* braço */}
      <path
        d={`M0 ${xy(top)}Q${xy(dir * 8)} ${xy(top - 16)} ${xy(lx)} ${xy(ly)}`}
        fill="none"
        stroke={`${INK.near}`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* luminária */}
      <ellipse
        cx={xy(lx)}
        cy={xy(ly + 6)}
        rx="21"
        ry="13"
        fill="rgb(var(--brand-2) / .22)"
        filter={`url(#${ID}-haze)`}
      />
      <path
        {...mass('deep')}
        d={`M${xy(lx - 12)} ${xy(ly - 3)}H${xy(lx + 12)}L${xy(lx + 8)} ${xy(ly + 5)}H${xy(lx - 8)}Z`}
      />
      <ellipse {...accent(0.85)} cx={xy(lx)} cy={xy(ly + 5)} rx="7.5" ry="2.8" />
    </g>
  );
}

/* ========================================================================== */
/* CENA                                                                       */
/* ========================================================================== */
/**
 * Capítulo 03 — Estrada: auto, caminhão e frota.
 *
 * Camadas, do fundo para a frente:
 *   0,10  a serra em três cristas e o clarão do céu atrás dela;
 *   0,25  a frota que recua até virar silhueta e o poste distante;
 *   0,40  o caminhão no plano intermediário, farol aceso e lanterna âmbar;
 *   0,55  o asfalto: faixas correndo em perspectiva e o brilho do piso molhado;
 *   0,90  o carro em primeiro plano, farol varrendo a pista, reflexos e as
 *         linhas de velocidade rasgando o rodapé do quadro.
 *
 * Movimento próprio: as faixas da pista e as linhas do asfalto correm com
 * `dash-move` — devagar no fundo, rápido na frente, que é o que cria a
 * sensação de velocidade —, as rodas giram e as faíscas do impacto tremulam.
 *
 * No imprevisto: a dianteira estoura, o para-brisa vira teia, o capô amassa, o
 * farol apaga, o asfalto guarda a frenagem, a poeira sobe, o baú do caminhão
 * racha na descida da serra e um veículo da frota não volta para o pátio.
 */
export function RoadScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />

      {/* ============================================ a serra (depth .1) == */}
      <g data-scene-fill data-depth="0.1">
        {/* clarão baixo atrás da serra: separa o céu do relevo */}
        <ellipse
          cx="300"
          cy="300"
          rx="240"
          ry="70"
          fill="rgb(var(--brand) / .1)"
          filter={`url(#${ID}-haze)`}
        />
        {/* crista distante: levanta o horizonte e tira o vazio do céu */}
        <path
          {...mass('air')}
          d="M0 330V244L64 186L124 232L192 148L262 218L326 172L396 226L462 160L516 214L560 188V330Z"
          opacity=".8"
        />
        <path
          {...mass('air')}
          d="M0 330V286L54 240L96 268L150 214L206 262L262 226L318 268L380 196L444 250L498 218L560 262V330Z"
        />
        <path
          {...mass('far')}
          d="M0 330V310L40 282L88 302L146 258L198 296L252 268L306 300L360 250L414 288L470 262L520 288L560 274V330Z"
        />
        {/* mata rasteira no pé da serra */}
        <path
          {...mass('mid')}
          d="M0 330v-8l22-6 18 8 26-10 20 9 30-7 24 8 34-6 26 9 30-8 28 7 32-9 26 8 30-6 26 9 28-7 26 8 30-9 24 8 30-6v10Z"
          opacity=".55"
        />
      </g>

      <Ground id={ID} perspective={false} />

      {/* ================================== o asfalto e as faixas (depth .55) */}
      <g data-depth="0.55">
        <g data-scene-fill>
          {/* asfalto: um trapézio que se abre do ponto de fuga até fora do quadro */}
          <path {...mass('mid')} d={`M${VP_X - 16} 330H${VP_X + 16}L700 400H-180Z`} opacity=".75" />
          {/* acostamento de terra dos dois lados */}
          <path {...mass('far')} d={`M${VP_X - 16} 330L-180 400H-220V330Z`} opacity=".5" />
          {/* ar quente rasteiro junto ao horizonte */}
          <path
            d={`M${VP_X - 16} 330H${VP_X + 16}L330 352H150Z`}
            fill="rgb(var(--brand) / .12)"
            filter={`url(#${ID}-soft)`}
          />
          {/* piso molhado: o brilho largo que a via devolve */}
          <ellipse
            cx="250"
            cy="378"
            rx="260"
            ry="30"
            fill="rgb(var(--brand-2) / .07)"
            filter={`url(#${ID}-haze)`}
          />
        </g>

        {/* as faixas centrais correndo: três trechos, cada um no seu ritmo.
            É a camada que mais faz a estrada parecer estrada em movimento. */}
        <g data-scene-fill>
        <Running
          d="M250.3 332L253.1 352"
          width={2}
          dash="3 7"
          dur={2.6}
          color="rgb(var(--brand-2) / .34)"
        />
        <Running
          d="M253.1 352L256 372"
          width={5}
          dash="8 12"
          dur={1.3}
          color="rgb(var(--brand-2) / .4)"
        />
        <Running
          d="M256 372L260 400"
          width={9}
          dash="14 26"
          dur={0.65}
          color="rgb(var(--brand-2) / .46)"
        />
        {/* bordas da pista, também correndo */}
        <Running
          d="M234 331L-180 400"
          width={2.2}
          dash="10 10"
          dur={0.9}
          color={INK.near}
          opacity={0.5}
        />
        <Running
          d="M266 331L700 400"
          width={2.2}
          dash="10 10"
          dur={0.9}
          color={INK.near}
          opacity={0.5}
        />
        </g>
      </g>

      {/* ============================= a frota que recua (depth .25) == */}
      <g data-scene-fill data-depth="0.25">
        <Van x={330} y={330.6} scale={0.42} />
        <Van x={352} y={330.2} scale={0.3} />
        <Van x={368} y={330} scale={0.22} />
      </g>
      <g data-scene-fill data-depth="0.25">
        <LightPole x={26} y={372} height={158} dir={1} arm={44} cone={false} />
      </g>

      {/* ================================ o caminhão (depth .4) == */}
      <g data-depth="0.4">
        <Contact id={ID} x={452} y={336} rx={92} ry={9} opacity={0.8} />
        <g data-scene-fill>
          <Truck x={450} y={336} scale={0.84} />
          {/* farol do caminhão varrendo a pista à frente */}
          <LightCone x={376} y={297} length={96} spread={22} angle={172} opacity={0.13} />
          {/* o piso devolve a lanterna âmbar do caminhão */}
          <ellipse
            cx="522"
            cy="342"
            rx="14"
            ry="9"
            fill="rgb(var(--alert) / .2)"
            filter={`url(#${ID}-soft)`}
          />
        </g>
      </g>

      {/* ================================= o poste da frente (depth .7) == */}
      <g data-scene-fill data-depth="0.7">
        <LightPole x={536} y={390} height={168} dir={-1} arm={52} />
      </g>

      {/* ============================= o carro em primeiro plano (depth .9) */}
      <g data-depth="0.9">
        <Contact id={ID} x={168} y={358} rx={118} ry={13} />
        <g data-scene-fill>
          <Car x={168} y={358} />
        </g>

        <g data-scene-fill>
        {/* o facho do farol varrendo o asfalto à frente */}
        <LightCone x={62} y={313} length={136} spread={36} angle={168} opacity={0.26} />
        <LightCone x={62} y={313} length={96} spread={14} angle={173} opacity={0.2} />
        {/* mancha do farol no asfalto molhado, e o reflexo vertical embaixo */}
        <ellipse cx="6" cy="352" rx="72" ry="14" fill="rgb(var(--brand-2) / .16)" />
        <ellipse
          cx="58"
          cy="374"
          rx="16"
          ry="26"
          fill="rgb(var(--brand-2) / .18)"
          filter={`url(#${ID}-soft)`}
        />
        {/* reflexo âmbar da lanterna traseira no piso molhado */}
        <ellipse
          cx="272"
          cy="374"
          rx="13"
          ry="24"
          fill="rgb(var(--alert) / .2)"
          filter={`url(#${ID}-soft)`}
        />

        {/* linhas de velocidade: o ar rasgado logo atrás do carro */}
        <Running
          d="M280 302H346"
          width={2.2}
          dash="12 28"
          dur={0.45}
          color="rgb(var(--brand-2) / .38)"
        />
        <Running
          d="M284 320H338"
          width={1.6}
          dash="8 32"
          dur={0.38}
          color="rgb(var(--brand-2) / .3)"
          delay={0.16}
        />
        </g>
      </g>

      {/* O asfalto correndo debaixo do carro — a camada mais próxima e a que
          carrega a velocidade: a faixa central chapada, uma estria de brilho
          molhado atrás dela e um rastro rápido rente ao rodapé do quadro. */}
      <g data-scene-fill data-depth="1">
        <Running
          d="M-30 366H590"
          width={2}
          dash="16 24"
          dur={0.8}
          color={INK.mid}
          opacity={0.5}
        />
        <Running
          d="M-30 381H590"
          width={7}
          dash="26 14"
          dur={0.5}
          color={INK.near}
          opacity={0.85}
        />
        <Running
          d="M-30 393H590"
          width={3}
          dash="20 20"
          dur={0.32}
          color="rgb(var(--brand-2) / .26)"
          delay={0.08}
        />
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 0 — o impacto na dianteira: clarão, estilhaço de energia e faísca */}
      <g data-scene-risk data-risk-delay="0">
        <ellipse
          cx="66"
          cy="324"
          rx="52"
          ry="46"
          fill="rgb(var(--brand-2) / .22)"
          filter={`url(#${ID}-haze)`}
        />
        <ellipse
          cx="66"
          cy="324"
          rx="30"
          ry="26"
          fill="rgb(var(--alert) / .28)"
          filter={`url(#${ID}-haze)`}
        />
        <g filter={`url(#${ID}-glow)`}>
          <path {...shard('M66 324L30 306L42 336Z')} />
          <path {...shard('M66 324L44 350L64 348Z')} />
          <path {...shard('M66 324L48 292L70 302Z')} />
        </g>
        <Sparks x={66} y={324} count={8} radius={34} tone="alert" />
        <Sparks x={66} y={324} count={5} radius={22} tone="brand" />
      </g>

      {/* 1 — o para-brisa vira teia */}
      <Fracture d="M134 281L143 289L130 295L139 302" delay={0.08} />
      <Fracture d="M143 289L157 285" delay={0.1} />
      <g data-scene-risk data-risk-delay="0.12">
        <path
          d="M143 289L136 275M143 289L152 300M143 289L128 286M137 279L149 277M133 293L136 300"
          fill="none"
          stroke="rgb(var(--brand-2) / .55)"
          strokeWidth="1.1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 2 — o capô amassa e o farol apaga */}
      <g data-scene-risk data-risk-delay="0.16">
        <path {...mass('deep')} d="M70 302L86 291L98 301L112 294V304L70 306Z" />
        <path {...detail(0.4, 1.3)} d="M76 304L86 293M92 305L98 296M104 304L110 297" />
        {/* o farol quebrado: o vão escuro no lugar da luz */}
        <path d="M64 308L82 311V319L64 316Z" fill={INK.void} opacity=".8" />
        <path
          d="M64 308L82 319M82 311L64 316"
          fill="none"
          stroke="rgb(var(--brand-2) / .5)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 3 — o asfalto guarda a frenagem */}
      <g data-scene-risk data-risk-delay="0.2">
        <path
          d="M112 361C182 358 244 350 302 338"
          fill="none"
          stroke={`${INK.ink}`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="34 14"
          opacity=".5"
        />
        <path
          d="M124 372C198 368 266 356 322 343"
          fill="none"
          stroke={`${INK.deep}`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="26 15"
          opacity=".6"
        />
      </g>

      {/* 4 — a poeira que o impacto levanta, em cor de massa */}
      <g data-scene-risk data-risk-delay="0.26">
        <Smoke id={ID} x={96} y={296} scale={0.9} />
        <Smoke id={ID} x={44} y={350} scale={0.68} />
      </g>

      {/* 5 — o tombamento na serra: o baú racha e a carroceria pende */}
      <Fracture d="M436 270L449 284L438 296L453 306" delay={0.3} />
      <g data-scene-risk data-risk-delay="0.34">
        <path {...accentStroke(1.8, 0.55)} strokeDasharray="6 7" d="M426 232A40 40 0 00396 260" />
        <path {...accent(0.85)} d="M404 250l-10 13 14-2z" />
      </g>

      {/* 6 — o veículo da frota que não volta ao pátio: sobra a vaga vazia.
          A escala fica no grupo DE FORA e o `data-scene-risk` no grupo de
          dentro: o GSAP reescreve o `transform` do elemento que anima, e se a
          escala estivesse nele o furgão terminaria em tamanho de primeiro plano. */}
      <g transform="translate(296 331) scale(0.55)">
        <g data-scene-risk data-risk-delay="0.38">
          <path
            d={VAN_BODY}
            fill="none"
            stroke="rgb(var(--brand-2) / .5)"
            strokeWidth="1.8"
            strokeDasharray="7 6"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M-20 -27L16 -6M16 -27L-20 -6"
            fill="none"
            stroke="rgb(var(--brand-2) / .85)"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </g>

      {/* ===================================================== a proteção == */}
      <ShieldSeal id={ID} x={424} y={84} size={92} />
    </Scene>
  );
}

export default RoadScene;
