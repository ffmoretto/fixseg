import type { ReactNode } from 'react';

import {
  Air,
  Bolt,
  Contact,
  Flame,
  Fracture,
  Ground,
  INK,
  LightCone,
  Rain,
  Scene,
  ShieldSeal,
  Smoke,
  Sparks,
  accentStroke,
  alert,
  detail,
  glass,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-home';

/* ========================================================================== */
/* ATOR QUE CRESCE                                                            */
/* ========================================================================== */
/**
 * O orquestrador só sabe levar um ator PARA um valor: no beat de risco não
 * existe "de onde". Para uma peça que precisa NASCER pequena e crescer, o
 * truque é desenhá-la no tamanho final e encolhê-la num grupo interno
 * ESTÁTICO — o ator de fora cresce de 1 até `fator` e devolve a peça ao
 * tamanho desenhado.
 *
 * Duas consequências boas:
 *  · o encolhimento vive no atributo `transform`, então o modo sem movimento
 *    continua coerente (a peça aparece menor, mas no lugar certo);
 *  · o ator de fora não tem transformação de base, então não briga com o GSAP.
 *
 * `px`/`py` é o ponto que fica PARADO — o pé da chama, o topo da trinca. Ele
 * precisa ser exatamente o ponto para onde `origin` aponta na caixa do ator;
 * encolher em torno desse ponto o mantém no mesmo lugar da caixa, então os dois
 * continuam coincidindo.
 */
function Cresce({
  fator,
  px,
  py,
  origin,
  when = 'risk',
  dur = 0.5,
  ease = 'power2.out',
  children,
}: {
  fator: number;
  px: number;
  py: number;
  origin: string;
  when?: 'risk' | 'shield';
  dur?: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when={when}
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

/* ========================================================================== */
/* ABERTURA ACESA                                                             */
/* ========================================================================== */
/**
 * Uma janela e tudo o que ela produz de luz: o vidro, o halo em volta, o facho
 * no ar e a mancha no chão. Ficam na MESMA peça porque a casa "liga" janela por
 * janela — e uma janela que acende sem derramar luz no chão não acende.
 */
function Janela({
  x,
  y,
  w,
  h,
  pad = 6,
  halo = 0.22,
  cone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  pad?: number;
  halo?: number;
  cone?: { x: number; angle: number };
}) {
  return (
    <>
      <rect {...glass(ID)} x={x} y={y} width={w} height={h} rx={4} />
      <g filter={`url(#${ID}-haze)`} opacity=".9">
        <rect
          x={x - pad}
          y={y - pad}
          width={w + pad * 2}
          height={h + pad * 2}
          fill={`rgb(var(--brand-2) / ${halo})`}
        />
      </g>
      {cone && (
        <>
          <LightCone x={cone.x} y={y + h} length={70} spread={30} angle={cone.angle} opacity={0.2} />
          <ellipse cx={cone.x} cy="332" rx="46" ry="9" fill="rgb(var(--brand-2) / .18)" />
        </>
      )}
    </>
  );
}

/**
 * As três aberturas, na ordem em que a casa acende. A duração cresce de uma
 * para a outra: os três atores partem juntos, mas cada um assenta depois do
 * anterior — é assim que se obtém sequência sem que o orquestrador precise
 * conhecer um atraso por ator.
 */
const JANELAS = [
  { x: 198, y: 222, w: 52, h: 44, cone: { x: 224, angle: 96 }, dur: 0.8 },
  { x: 330, y: 222, w: 52, h: 44, cone: { x: 356, angle: 84 }, dur: 1 },
  { x: 272, y: 152, w: 36, h: 30, pad: 4, halo: 0.16, dur: 1.2 },
];

/**
 * Capítulo 02 — Casa.
 *
 * Referência de linguagem para as demais cenas. Três coisas definem o padrão:
 *
 * 1. PROFUNDIDADE EM CAMADAS. Cada plano leva `data-depth`: o fundo perto de
 *    0,15 e o primeiro plano perto de 1. O orquestrador desloca cada um numa
 *    velocidade diferente enquanto o capítulo corre, e a cena deixa de parecer
 *    um cartão parado.
 * 2. LUZ. As janelas não são retângulos coloridos: elas jogam cone de luz no ar
 *    e mancha no chão. É o que faz a casa parecer habitada e a noite parecer
 *    noite.
 * 3. FOGO EM COR DE FOGO. O incêndio usa `--alert` (âmbar) — a única exceção à
 *    paleta da marca, explicada no globals.css. O relâmpago segue ciano, que é
 *    a cor que o olho espera para eletricidade.
 *
 * -----------------------------------------------------------------------------
 * O CASO ACONTECE NA TELA (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  as três aberturas acendem em sequência — a casa "liga";
 *   imprevisto  o relâmpago DESCE do céu até a chaminé; a faísca SALTA do
 *               quadro de energia; o fogo NASCE pequeno dentro do rombo e
 *               CRESCE a partir do pé das chamas; a fumaça sobe e se espalha;
 *               a trinca DESCE pela parede a partir do beiral; a poça se abre;
 *   proteção    a cúpula fecha por cima, subindo do chão até cobrir a casa.
 */
export function HomeScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ============================================ fundo distante (depth .15) */}
      <g data-scene-fill data-depth="0.15">
        {/* morros */}
        <path {...mass('air')} d="M-20 330l150-96 96 62 118-84 156 118v20H-20Z" />
        {/* árvore */}
        <rect {...mass('mid')} x="487" y="248" width="10" height="82" rx="4" />
        <circle {...mass('far')} cx="492" cy="238" r="34" />
        <circle {...mass('far')} cx="466" cy="256" r="22" />
        <circle {...mass('far')} cx="518" cy="254" r="20" />
        {/* arbusto à esquerda */}
        <circle {...mass('far')} cx="106" cy="312" r="24" />
        <circle {...mass('far')} cx="136" cy="320" r="16" />
      </g>

      {/* poste de rua: a fonte de luz que existe antes do imprevisto */}
      <g data-scene-fill data-depth="0.3">
        <rect {...mass('deep')} x="86" y="176" width="6" height="154" rx="3" />
        <path {...mass('deep')} d="M89 176h34a10 10 0 0110 10v6h-10v-6H89Z" />
        <ellipse cx="128" cy="196" rx="9" ry="5" fill="rgb(var(--brand-2) / .9)" />
      </g>
      <LightCone x={128} y={198} length={126} spread={40} angle={98} opacity={0.16} />

      {/* ==================================================== o caminho (depth .5) */}
      <g data-scene-fill data-depth="0.5">
        <path {...mass('mid')} d="M268 330h44l40 70H228Z" opacity=".7" />
        <path {...detail(0.18)} d="M262 352h56M250 376h80" />
      </g>

      {/* ======================================================= a casa (depth .6) */}
      <g data-scene-fill data-depth="0.6">
        {/* parede lateral, na sombra */}
        <path {...sideFace(ID)} d="M404 200l52 20v110h-52Z" />
        {/* fachada */}
        <path {...volume(ID)} d="M176 200h228v130H176Z" />
        {/* empena */}
        <path {...volume(ID)} d="M176 200L290 122L404 200Z" />
        {/* água de telhado direita, em perspectiva */}
        <path {...topFace(ID)} d="M290 122l52 20 114 78-52-20Z" />
        {/* ripado do telhado — detalhe que dá textura à água mais visível */}
        <g opacity=".5">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              {...detail(0.14, 1)}
              d={`M${xy(300 + i * 13)} ${xy(128 + i * 9)}L${xy(414 + i * 13)} ${xy(
                206 + i * 9,
              )}`}
            />
          ))}
        </g>
        {/* beiral */}
        <path {...mass('near')} d="M164 200h252l-6 10H170Z" />
        {/* chaminé */}
        <path {...mass('deep')} d="M344 158h28v46l-28-14Z" />
        <path {...mass('near')} d="M341 152h34v10h-34Z" />
      </g>

      <g data-scene-draw data-depth="0.6">
        <path {...outline(1.6, 0.36)} d="M176 330V200L290 122l114 78v130" />
        <path {...outline(1.4, 0.3)} d="M404 200l52 20v110h-52M290 122l52 20 114 78" />
        <path {...detail(0.22)} d="M164 200h252" />
      </g>

      {/* ------------------------------------------- as aberturas e a luz de casa */}
      {/* ATORES — a casa LIGA. Cada abertura nasce recolhida no próprio centro
          e se abre em luz; as durações escalonadas fazem as três acenderem em
          sequência. O parallax fica no grupo de fora, os atores em grupos de
          dentro: as duas coisas escrevem `transform`. */}
      <g data-scene-fill data-depth="0.6">
        {JANELAS.map((j) => (
          <g
            key={`${j.x}-${j.y}`}
            data-move-when="build"
            data-move-scale="0.22"
            data-move-origin="50% 50%"
            data-move-dur={j.dur}
            data-move-ease="back.out(2.4)"
          >
            <Janela x={j.x} y={j.y} w={j.w} h={j.h} pad={j.pad} halo={j.halo} cone={j.cone} />
          </g>
        ))}
        {/* porta */}
        <path {...mass('deep')} d="M264 330v-64a26 26 0 0152 0v64Z" />
      </g>

      <g data-scene-draw data-depth="0.6">
        <rect {...outline(1.4, 0.32)} x="198" y="222" width="52" height="44" rx="4" />
        <rect {...outline(1.4, 0.32)} x="330" y="222" width="52" height="44" rx="4" />
        <rect {...outline(1.3, 0.28)} x="272" y="152" width="36" height="30" rx="4" />
        <path {...detail(0.26)} d="M224 222v44M198 244h52M356 222v44M330 244h52M290 152v30" />
        <path {...outline(1.5, 0.34)} d="M264 330v-64a26 26 0 0152 0v64" />
        <circle {...accentStroke(2, 0.8)} cx="304" cy="298" r="2.6" />
      </g>

      {/* medidor de energia — o detalhe que antecipa o risco */}
      <g data-scene-fill data-depth="0.7">
        <rect {...mass('near')} x="196" y="282" width="24" height="30" rx="4" />
      </g>
      <g data-scene-draw data-depth="0.7">
        <rect {...outline(1.3, 0.3)} x="196" y="282" width="24" height="30" rx="4" />
        <path {...accentStroke(1.6, 0.85)} d="M209 288l-6 11h11l-6 11" />
      </g>

      <Contact id={ID} x={300} y={330} rx={168} ry={14} />

      {/* ==================================================== o imprevisto == */}

      {/* 0 — o tempo fecha e a chuva chega */}
      <g data-scene-risk data-risk-delay="0">
        <ellipse
          cx="270"
          cy="46"
          rx="200"
          ry="52"
          fill={INK.mid}
          filter={`url(#${ID}-haze)`}
        />
        <ellipse
          cx="360"
          cy="34"
          rx="120"
          ry="34"
          fill={INK.deep}
          filter={`url(#${ID}-haze)`}
          opacity=".7"
        />
        <Rain x={40} y={70} width={480} height={180} count={30} opacity={0.55} />
      </g>

      {/* 1 — a descarga elétrica DESCE do céu até a chaminé.
             O raio nasce curto, logo abaixo da nuvem, e se estende para baixo
             (origem no topo) até encostar no telhado. */}
      <g data-scene-risk data-risk-delay="0.08">
        <Cresce fator={2} px={337} py={44} origin="50% 0%" dur={0.2} ease="power4.in">
          <Bolt id={ID} d="M336 44l-30 76h28l-20 58 54-82h-30l22-52z" />
        </Cresce>
      </g>

      {/* 2 — o curto no quadro de energia: a faísca SALTA da caixa */}
      <g data-scene-risk data-risk-delay="0.14">
        <g
          data-move-when="risk"
          data-move-scale="1.5"
          data-move-y="-5"
          data-move-origin="50% 50%"
          data-move-dur="0.26"
          data-move-ease="power3.out"
        >
          <Sparks x={208} y={298} count={10} radius={15} tone="brand" />
        </g>
      </g>

      {/* 3 — o fogo toma o telhado */}
      <g data-scene-risk data-risk-delay="0.2">
        {/* rombo aberto no telhado, com a brasa por dentro */}
        <path {...mass('void')} d="M300 150l34 8 22 26-30 12-32-20Z" />
        <path {...alert(0.55)} d="M308 156l22 6 14 16-20 8-20-14Z" />

        {/* ATOR — a fumaça sobe e se espalha (cresce a partir do pé) */}
        <g
          data-move-when="risk"
          data-move-y="-30"
          data-move-scale="1.4"
          data-move-origin="50% 100%"
          data-move-dur="0.6"
          data-move-ease="power1.out"
        >
          <Smoke id={ID} x={324} y={126} scale={1.35} />
          <Smoke id={ID} x={352} y={140} scale={0.9} />
        </g>

        {/* ATOR — o fogo NASCE pequeno dentro do rombo e cresce a partir da
            base. `px`/`py` é o pé do conjunto de chamas: é o ponto que fica
            parado enquanto o incêndio ganha o telhado. */}
        <Cresce fator={2.3} px={327.7} py={200.5} origin="50% 100%" dur={0.6}>
          <Flame id={ID} x={322} y={178} scale={1.15} />
          <Flame id={ID} x={350} y={188} scale={0.78} />
          <Flame id={ID} x={300} y={182} scale={0.6} />
        </Cresce>

        {/* o incêndio ilumina a fachada */}
        <ellipse
          cx="326"
          cy="200"
          rx="120"
          ry="80"
          fill="rgb(var(--alert) / .22)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      {/* 4 — a parede trinca: a fenda DESCE do beiral, crescendo a partir do
             próprio topo (origem no canto superior esquerdo da caixa). */}
      <Cresce fator={2} px={176} py={238} origin="0% 0%" dur={0.4}>
        <Fracture d="M176 238l24 26-16 22 22 26-12 18" delay={0.26} />
        <Fracture d="M200 264l26-6" delay={0.3} />
      </Cresce>

      {/* 5 — o vidro se rompe e a luz da sala se apaga */}
      <g data-scene-risk data-risk-delay="0.34">
        <rect x="330" y="222" width="52" height="44" rx="4" fill={INK.void} />
        <path
          d="M330 222l26 22 26-22M330 266l26-22 26 22M344 222l12 22-12 22"
          fill="none"
          stroke="rgb(var(--brand-2) / .7)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 6 — a água empoça no caminho e reflete o fogo: a poça SE ABRE */}
      <g data-scene-risk data-risk-delay="0.38">
        <Cresce fator={1.35} px={290} py={356} origin="50% 50%" dur={0.45}>
          <ellipse cx="290" cy="356" rx="68" ry="13" fill="rgb(var(--brand) / .26)" />
          <ellipse cx="304" cy="356" rx="22" ry="5" fill="rgb(var(--alert) / .35)" />
          <ellipse cx="290" cy="356" rx="68" ry="13" {...accentStroke(1.2, 0.4)} />
        </Cresce>
      </g>

      {/* ===================================================== a proteção == */}
      {/* ATOR — a cúpula FECHA por cima: sobe do chão (origem no meio da base)
          e se abre até cobrir a casa inteira. */}
      <g data-scene-shield>
        <Cresce fator={1.3} px={280} py={330} origin="50% 100%" when="shield" dur={0.5}>
          <path
            {...accentStroke(1.8, 0.42)}
            strokeDasharray="7 9"
            d="M64 330c0-118 96-214 216-214s216 96 216 214"
          />
          <path
            d="M64 330c0-118 96-214 216-214s216 96 216 214"
            fill="none"
            stroke="rgb(var(--brand-2) / .18)"
            strokeWidth="16"
            filter={`url(#${ID}-haze)`}
          />
        </Cresce>
      </g>
      <ShieldSeal id={ID} x={432} y={244} size={92} />
    </Scene>
  );
}

export default HomeScene;
