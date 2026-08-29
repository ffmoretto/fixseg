import {
  Air,
  Contact,
  Fracture,
  Ground,
  INK,
  Scene,
  ShieldSeal,
  Smoke,
  Wheel,
  accent,
  accentStroke,
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

/* ========================================================================== */
/* AUTOMÓVEL — primeiro plano                                                 */
/* ========================================================================== */
/**
 * Perfil de carro construído em massa: o corpo leva uma base chapada mais o
 * gradiente de volume por cima (é o que dá peso à silhueta), as cavas de roda e
 * a saia inferior ficam na sombra, a vidraça é ciano frio e as rodas giram
 * sozinhas — a peça `Wheel` cuida do movimento.
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
      {/* retrovisor, colado na base da coluna */}
      <path {...mass('deep')} d="M-54 -58L-66 -56V-51L-54 -53Z" />

      {/* farol e lanterna */}
      <ellipse
        cx="-96"
        cy="-45"
        rx="18"
        ry="12"
        fill="rgb(var(--brand-2) / .2)"
        filter={`url(#${ID}-haze)`}
      />
      <path {...accent(0.88)} d="M-104 -50L-86 -47V-39L-104 -42Z" />
      <path d="M100 -50H106V-40H100Z" fill="rgb(var(--brand-2) / .5)" />

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
      {/* lanterna dianteira */}
      <path {...accent(0.8)} d="M-88 -46H-80V-38H-88Z" />

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
          fill="rgb(var(--brand-2) / .07)"
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
 * Leitura da imagem, do fundo para a frente: a serra fecha o horizonte e mostra
 * a subida em ziguezague; a pista converge para o ponto de fuga; a frota recua
 * em fila até virar silhueta; o caminhão ocupa o plano intermediário; os postes
 * de luz levantam a cena; e o carro vem à frente, grande, exatamente onde o
 * impacto acontece.
 *
 * No imprevisto: a dianteira estoura em energia, o para-brisa trinca, o asfalto
 * guarda a frenagem, o capô solta fumaça, o baú do caminhão racha na descida da
 * serra e um veículo da frota não volta para o pátio — sobra o contorno vazio.
 */
export function RoadScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />

      {/* ------------------------------------------------ a serra ao fundo */}
      <g data-scene-fill>
        <path
          {...mass('air')}
          d="M0 330V286L54 240L96 268L150 214L206 262L262 226L318 268L380 196L444 250L498 218L560 262V330Z"
        />
        <path
          {...mass('far')}
          d="M0 330V310L40 282L88 302L146 258L198 296L252 268L306 300L360 250L414 288L470 262L520 288L560 274V330Z"
        />
      </g>

      <Ground id={ID} perspective={false} />

      {/* --------------------------------------------- a pista em perspectiva */}
      <g data-scene-fill>
        {/* asfalto: um trapézio que se abre do ponto de fuga até fora do quadro */}
        <path {...mass('mid')} d={`M${VP_X - 16} 330H${VP_X + 16}L700 400H-180Z`} opacity=".75" />
        {/* ar quente rasteiro junto ao horizonte */}
        <path
          d={`M${VP_X - 16} 330H${VP_X + 16}L330 352H150Z`}
          fill="rgb(var(--brand) / .12)"
          filter={`url(#${ID}-soft)`}
        />
        {/* faixas centrais: crescem conforme se aproximam do observador */}
        <g fill="rgb(var(--brand-2) / .34)">
          <path d="M249 336h3l1 6h-5z" />
          <path d="M250 348h4.5l1.5 9h-7z" />
          <path d="M252 363h6.5l2 13h-11z" />
          <path d="M255 382h9l3 18h-15z" />
        </g>
      </g>

      <g data-scene-draw>
        <path {...detail(0.22)} d={`M${VP_X - 16} 330L-180 400`} />
        <path {...detail(0.22)} d={`M${VP_X + 16} 330L700 400`} />
      </g>

      {/* ------------------------------- a frota que recua até o horizonte */}
      <g data-scene-fill>
        <Van x={330} y={330.6} scale={0.42} />
        <Van x={352} y={330.2} scale={0.3} />
        <Van x={368} y={330} scale={0.22} />
      </g>

      {/* -------------------------------- o caminhão no plano intermediário */}
      <Contact id={ID} x={452} y={336} rx={92} ry={9} opacity={0.8} />
      <g data-scene-fill>
        <Truck x={450} y={336} scale={0.84} />
      </g>

      {/* ------------------------------------------- a iluminação da via */}
      <g data-scene-fill>
        <LightPole x={536} y={390} height={168} dir={-1} arm={52} />
        <LightPole x={26} y={372} height={158} dir={1} arm={44} cone={false} />
      </g>

      {/* ------------------------------------- o carro em primeiro plano */}
      <Contact id={ID} x={168} y={358} rx={118} ry={13} />
      <g data-scene-fill>
        <Car x={168} y={358} />
      </g>

      {/* o facho do farol varrendo o asfalto */}
      <g data-scene-draw>
        <path {...accentStroke(1.6, 0.34)} strokeDasharray="14 10" d="M56 312H10M56 320H-6" />
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* impacto na dianteira: estilhaço de energia */}
      <g data-scene-risk data-risk-delay="0">
        <ellipse
          cx="66"
          cy="324"
          rx="46"
          ry="42"
          fill="rgb(var(--brand-2) / .22)"
          filter={`url(#${ID}-haze)`}
        />
        <g filter={`url(#${ID}-glow)`}>
          <path {...shard('M66 324L30 306L42 336Z')} />
          <path {...shard('M66 324L44 350L64 348Z')} />
          <path {...shard('M66 324L48 292L70 302Z')} />
        </g>
        {Array.from({ length: 14 }, (_, i) => {
          /* raios abertos em círculo. As coordenadas vêm de trigonometria, então
             passam por `xy()`: servidor e cliente geram a mesma string e a
             hidratação não quebra. */
          const a = (i / 14) * Math.PI * 2;
          const c = Math.cos(a);
          const s = Math.sin(a);
          const len = 34 + (i % 3) * 9;
          return (
            <path
              key={i}
              d={`M${xy(66 + c * 15)} ${xy(324 + s * 15)}L${xy(66 + c * len)} ${xy(324 + s * len)}`}
              fill="none"
              stroke="rgb(var(--brand-2) / .78)"
              strokeWidth={i % 2 === 0 ? 2.2 : 1.3}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* o para-brisa realmente trinca */}
      <Fracture d="M134 281L143 289L130 295L139 302" delay={0.08} />
      <Fracture d="M143 289L157 285" delay={0.12} />

      {/* marcas de frenagem no asfalto */}
      <g data-scene-risk data-risk-delay="0.18">
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

      {/* o capô amassa e solta fumaça */}
      <g data-scene-risk data-risk-delay="0.24">
        <path {...mass('deep')} d="M74 302L88 293L100 301L112 295V303L74 304Z" />
        <Smoke id={ID} x={94} y={294} scale={1.05} />
      </g>

      {/* o tombamento na serra: o baú racha e a carroceria pende */}
      <Fracture d="M436 270L449 284L438 296L453 306" delay={0.3} />
      <g data-scene-risk data-risk-delay="0.34">
        <path {...accentStroke(1.8, 0.55)} strokeDasharray="6 7" d="M426 232A40 40 0 00396 260" />
        <path {...accent(0.85)} d="M404 250l-10 13 14-2z" />
      </g>

      {/* o veículo da frota que não volta ao pátio: sobra a vaga vazia.
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
