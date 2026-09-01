import type { CSSProperties, ReactNode } from 'react';

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
/* GEOMETRIA DO CRUZAMENTO                                                    */
/* ========================================================================== */
/**
 * A cena é um cruzamento visto quase de perfil:
 *
 *   · a VIA PRINCIPAL corre da esquerda para a direita, do rodapé até `VIA_Y`
 *     (a aresta distante do asfalto). É nela que os dois veículos rodam, em
 *     sentidos opostos, na faixa de trás;
 *   · a VIA TRANSVERSAL desce do ponto de fuga, cruza a principal entre
 *     `CRUZ_E` e `CRUZ_D` e segue em direção ao observador — é o que torna o
 *     lugar um cruzamento e não um trecho de reta;
 *   · as duas FAIXAS DE RETENÇÃO, uma de cada lado do cruzamento, e a quebra da
 *     linha divisória em cima da caixa do cruzamento completam a leitura.
 *
 * Todo o encontro dos dois veículos foi MEDIDO nestas constantes: o ponto de
 * contato é `IMPACTO_X`, e é para lá que o carro avança `AVANCO_CARRO` e o
 * caminhão avança `AVANCO_CAMINHAO` no instante do choque.
 */
const VP_X = 250; // ponto de fuga da via transversal
const VIA_Y = 342; // aresta distante da via principal
const GY = 356; // linha de contato dos pneus dos dois veículos
const CRUZ_E = 186; // aresta esquerda da caixa do cruzamento
const CRUZ_D = 336; // aresta direita da caixa do cruzamento

/* --- o carro: entra pela ESQUERDA, aponta para a direita ------------------ */
const CAR_X = 160; // centro do carro em repouso
const CAR_S = 0.92; // escala: o carro é o veículo leve da cena
const CAR_NOSE = 257.5; // 160 + 106 × 0.92 — para-choque dianteiro em repouso
const CAR_RODA_TRAS = 106.6; // 160 − 58 × 0.92 — pneu que trava e vira pivô
const AVANCO_CARRO = 30; // o quanto ele ainda anda até bater

/* --- o caminhão: entra pela DIREITA, aponta para a esquerda --------------- */
const TRK_X = 401; // centro do cavalo em repouso
const TRK_S = 1.06; // escala: 18 unidades mais alto que o carro
const TRK_NOSE = 307.7; // 401 − 88 × 1.06 — para-choque dianteiro em repouso
const TRK_RODA_TRAS = 466.7; // 401 + 62 × 1.06 — pneu traseiro, pivô do repique
const AVANCO_CAMINHAO = -25; // ele avança menos: massa maior, freio mais longo

/**
 * O PONTO DE CONTATO, conferido na conta:
 *   nariz do carro     257.5 + 30 = 287.5
 *   nariz do caminhão  307.7 − 25 = 282.7
 * ou seja, no quadro do impacto os dois se sobrepõem em ~4,8 unidades — eles se
 * ENCOSTAM de fato, não sobra vão entre as duas latarias.
 */
const IMPACTO_X = 285;
const IMPACTO_Y = 324;

/** Silhueta do automóvel. Desenhada com a frente à ESQUERDA; `dir` espelha. */
const CAR_BODY =
  'M-105 -40C-105 -50 -99 -55 -88 -56L-58 -57L-32 -80L36 -82L60 -58L94 -56C102 -55 105 -50 105 -41V-18C105 -13 102 -10 97 -10H-97C-102 -10 -105 -13 -105 -18Z';
const CAR_WINDSHIELD = 'M-30 -78H-10V-56H-54Z';
const CAR_DOORGLASS = 'M-4 -78H26V-56H-4Z';
const CAR_BACKLIGHT = 'M32 -78H36L54 -56H32Z';

/** Baú do caminhão: a maior face lateral da cena, e a mais escura. */
const TRUCK_BOX = 'M-30 -90H78C83 -90 86 -87 86 -82V-22H-30Z';
const TRUCK_CAB = 'M-86 -22V-52C-86 -60 -82 -66 -74 -70L-62 -76H-30V-22Z';

/** Estilhaço de energia: mesma receita para os três fragmentos do impacto. */
const shard = (d: string) => ({ d, ...heat(ID), opacity: 0.9 });

/* ========================================================================== */
/* CAIXA E ORIGEM DE UM ATOR                                                  */
/* ========================================================================== */
/**
 * O orquestrador recebe a origem da transformação em PORCENTAGEM da caixa do
 * ator, e a caixa de um grupo é a união das caixas dos filhos — ela muda quando
 * o conteúdo cresce, gira ou ganha um cone de luz. `Ancora` é um retângulo
 * transparente que ENVOLVE tudo o que o ator carrega: ele passa a ser a caixa, e
 * `origem()` converte um ponto do desenho em porcentagem exata.
 *
 * É isso que permite girar o carro em volta do pneu traseiro sem chute: o pivô
 * é uma coordenada da cena, não uma fração adivinhada.
 */
type Caixa = [x: number, y: number, w: number, h: number];

const origem = ([bx, by, bw, bh]: Caixa, px: number, py: number) =>
  `${xy(((px - bx) / bw) * 100)}% ${xy(((py - by) / bh) * 100)}%`;

const Ancora = ({ box: [x, y, w, h] }: { box: Caixa }) => (
  <rect x={x} y={y} width={w} height={h} fill="transparent" />
);

/** Caixa do ator do carro: carro + sombra de contato + facho do farol. */
const CAIXA_CARRO: Caixa = [40, 268, 360, 124];
/** Caixa do ator do caminhão: conjunto + sombra + facho. */
const CAIXA_CAMINHAO: Caixa = [200, 246, 310, 130];
/** Caixas das peças que crescem: teia no vidro e as duas marcas de frenagem. */
const CAIXA_TEIA: Caixa = [176, 282, 36, 28];
const CAIXA_FREIO_CARRO: Caixa = [40, 348, 180, 24];
const CAIXA_FREIO_CAMINHAO: Caixa = [412, 346, 126, 24];

/* ========================================================================== */
/* ATOR QUE CRESCE                                                            */
/* ========================================================================== */
/**
 * O orquestrador só sabe levar um ator PARA um valor: no beat de risco não
 * existe "de onde". Para uma peça que precisa NASCER pequena e crescer — a teia
 * no para-brisa, a marca de frenagem que se estende no asfalto —, o truque é
 * desenhá-la no tamanho final e encolhê-la num grupo interno ESTÁTICO: o ator
 * de fora cresce de 1 até `fator` e devolve a peça ao tamanho desenhado.
 *
 * Como o encolhimento vive no atributo `transform`, o modo sem movimento
 * continua coerente (a peça aparece menor, mas no lugar certo), e o ator de
 * fora fica sem transformação de base, então não briga com o GSAP.
 *
 * `px`/`py` é o ponto que fica PARADO — o ponto de impacto, o pneu que trava —
 * e `box` é a `Ancora` que fixa a caixa do ator. Como o encolhimento é uniforme
 * e acontece em volta de `px`/`py`, a porcentagem daquele ponto dentro da caixa
 * não muda: a mesma `origem()` serve para a peça encolhida e para a inteira.
 */
function Cresce({
  fator,
  px,
  py,
  box,
  dur = 0.5,
  ease = 'power2.out',
  children,
}: {
  fator: number;
  px: number;
  py: number;
  box: Caixa;
  dur?: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when="risk"
      data-move-scale={fator}
      data-move-origin={origem(box, px, py)}
      data-move-dur={dur}
      data-move-ease={ease}
    >
      <Ancora box={box} />
      {/* `xy()` porque o fator vem de uma divisão: servidor e navegador têm de
          escrever exatamente a mesma string. */}
      <g transform={`translate(${px} ${py}) scale(${xy(1 / fator)}) translate(${-px} ${-py})`}>
        {children}
      </g>
    </g>
  );
}

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
/* AUTOMÓVEL                                                                  */
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
 * `dir = -1` ESPELHA o veículo: nesta cena o carro sobe pela via apontando para
 * a direita, de encontro ao caminhão. O espelhamento também inverte o giro das
 * rodas, o que é exatamente o certo — os dois veículos vêm em sentidos opostos.
 *
 * A origem local é o PONTO DE CONTATO dos pneus com o chão, no centro do carro:
 * `translate(x, y)` assenta o veículo exatamente onde ele pisa no asfalto.
 */
function Car({
  x,
  y,
  s = 1,
  dir = 1,
}: {
  x: number;
  y: number;
  s?: number;
  dir?: 1 | -1;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${xy(dir * s)} ${xy(s)})`}>
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
      <path {...mass('deep')} d="M-94 -10A30 30 0 01-34 -10ZM28 -10A30 30 0 0188 -10Z" />

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
        rx="20"
        ry="13"
        fill="rgb(var(--brand-2) / .2)"
        filter={`url(#${ID}-haze)`}
      />
      <path {...accent(0.95)} d="M-104 -50L-86 -47V-39L-104 -42Z" />
      {/* lanterna traseira em âmbar: luz de freio, o uso legítimo do alerta */}
      <path {...alert(0.92)} d="M99 -50H106V-40H99Z" />

      {/* rodas com giro próprio */}
      <Wheel id={ID} x={-64} y={-20} r={20} />
      <Wheel id={ID} x={58} y={-20} r={20} />

      {/* contorno e detalhes internos */}
      <g data-scene-draw>
        <path {...outline(1.7, 0.4)} d={CAR_BODY} />
        <path {...outline(1.3, 0.3)} d={CAR_WINDSHIELD} />
        <path {...outline(1.3, 0.3)} d={CAR_DOORGLASS} />
        <path {...detail(0.26)} d="M-4 -56V-16M28 -56V-18M-58 -57L-32 -80" />
        <path {...detail(0.32, 1.4)} d="M2 -44H16" />
      </g>
    </g>
  );
}

/* ========================================================================== */
/* CAMINHÃO                                                                   */
/* ========================================================================== */
/**
 * Cavalo com baú. A face lateral do baú é a mais densa da cena — é o volume que
 * tapa a luz; a cabine recebe o gradiente de volume e o chassi é um recorte de
 * tinta que amarra as duas peças ao chão. Aponta para a ESQUERDA, contra o
 * carro.
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
/* ILUMINAÇÃO E SINALIZAÇÃO DA VIA                                            */
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

/**
 * Semáforo do cruzamento. Não é enfeite: é ele que diz, sem uma palavra, que
 * aquele ponto da via é um cruzamento com preferência — e o âmbar aceso é
 * exatamente "dois segundos de distração".
 *
 * O mastro nasce na aresta distante do asfalto e o braço avança para dentro do
 * cruzamento; a cabeça fica ACIMA do teto do carro, senão a peça desaparecia
 * atrás da lataria do primeiro plano.
 */
function TrafficLight({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path {...mass('near')} d="M-3 0H3L1.8 -148H-1.8Z" />
      <path {...mass('deep')} d="M-7 0H7V-6H-7Z" />
      <path
        d="M0 -148H34"
        fill="none"
        stroke={`${INK.near}`}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect {...mass('deep')} x="27" y="-146" width="15" height="34" rx="4" />
      <circle {...mass('void')} cx="34.5" cy="-138" r="3.4" />
      <ellipse
        cx="34.5"
        cy="-129"
        rx="12"
        ry="10"
        fill="rgb(var(--alert) / .32)"
        filter={`url(#${ID}-haze)`}
      />
      <circle {...alert(0.95)} cx="34.5" cy="-129" r="3.6" />
      <circle {...mass('void')} cx="34.5" cy="-120" r="3.4" />
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
 *   0,45  o asfalto: a via principal, a transversal que a cruza, as faixas de
 *         retenção dos dois lados e a divisória que se quebra no cruzamento;
 *   0,55  o semáforo e o poste distante;
 *   0,70  o poste da frente;
 *   0,90  os DOIS VEÍCULOS, no mesmo plano e na mesma linha de chão — é isso
 *         que permite que eles se encostem de verdade;
 *   1,00  o asfalto correndo rente ao rodapé do quadro.
 *
 * -----------------------------------------------------------------------------
 * A COLISÃO, BEAT POR BEAT (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  o carro entra rodando pela ESQUERDA e o caminhão pela DIREITA,
 *               em rotas convergentes, e param a 50 unidades um do outro — os
 *               dois faróis acesos, apontados um para o outro, os fachos se
 *               cruzando no meio do cruzamento. O espectador vê que eles vão
 *               se encontrar;
 *
 *   imprevisto  DOIS ATORES ENCAIXADOS, e é aqui que o capítulo se resolve:
 *                 · o de fora AVANÇA (0,10 de timeline, `power2.in`): o carro
 *                   anda +30 e o caminhão −25, e nesse instante as duas latarias
 *                   se sobrepõem em ~5 unidades. É o quadro do choque;
 *                 · o de dentro RECUA (0,25, `power4.in`): como `power4.in`
 *                   praticamente não sai do lugar na primeira metade do gesto
 *                   (2,5% em t = 0,4), o recuo só começa DEPOIS que o avanço
 *                   fechou — os dois se encostam antes de serem jogados para
 *                   trás. O carro, mais leve, recua 22 e gira 9°, levantando a
 *                   dianteira; o caminhão recua 10 e gira 1,6°.
 *               No ponto de contato: clarão, estilhaços de energia e faíscas.
 *               No carro, viajando com ele: capô amassado, para-brisa em teia,
 *               farol estourado. No caminhão: nariz amassado e farol quebrado.
 *               No asfalto, atrás de cada um: a marca de frenagem, que SE
 *               ESTENDE a partir do pneu que travou. E a poeira subindo do
 *               ponto de contato. Tudo fecha em 0,25 de timeline.
 *
 *   proteção    os dois se recompõem em parte — o carro volta a assentar as
 *               quatro rodas e o caminhão se endireita — e o escudo entra.
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
      </g>

      <Ground id={ID} perspective={false} />

      {/* ================================== o cruzamento (depth .45) ======= */}
      <g data-depth="0.45">
        <g data-scene-fill>
          {/* via principal: corre de ponta a ponta do quadro */}
          <path {...mass('mid')} d={`M-40 ${VIA_Y}H600V400H-40Z`} opacity=".8" />
          {/* via transversal: desce do ponto de fuga, entra no cruzamento e
              segue para o observador. É ela que faz do lugar um cruzamento. */}
          <path
            {...mass('mid')}
            d={`M${VP_X - 14} 330H${VP_X + 14}L${CRUZ_D} ${VIA_Y}H${CRUZ_E}Z`}
            opacity=".55"
          />
          <path
            {...mass('mid')}
            d={`M${CRUZ_E} ${VIA_Y}H${CRUZ_D}L${CRUZ_D + 12} 400H${CRUZ_E - 10}Z`}
            opacity=".4"
          />
          {/* faixas de retenção: uma de cada lado da caixa do cruzamento */}
          <path
            d={`M${CRUZ_E - 6} ${VIA_Y}H${CRUZ_E}L${CRUZ_E - 10} 400H${CRUZ_E - 17}Z`}
            fill="rgb(var(--brand-2) / .3)"
          />
          <path
            d={`M${CRUZ_D} ${VIA_Y}H${CRUZ_D + 6}L${CRUZ_D + 19} 400H${CRUZ_D + 12}Z`}
            fill="rgb(var(--brand-2) / .3)"
          />
          {/* ar quente rasteiro junto ao horizonte */}
          <path
            d={`M${VP_X - 14} 330H${VP_X + 14}L330 352H170Z`}
            fill="rgb(var(--brand) / .12)"
            filter={`url(#${ID}-soft)`}
          />
          {/* piso molhado: o brilho largo que a via devolve */}
          <ellipse
            cx="270"
            cy="382"
            rx="270"
            ry="28"
            fill="rgb(var(--brand-2) / .07)"
            filter={`url(#${ID}-haze)`}
          />
        </g>

        {/* a divisória da via principal CORRE e QUEBRA em cima do cruzamento —
            é o sinal de trânsito mais econômico que existe para "aqui cruza". */}
        <g data-scene-fill>
          <Running
            d={`M-40 372H${CRUZ_E - 14}`}
            width={5}
            dash="16 24"
            dur={0.7}
            color="rgb(var(--brand-2) / .34)"
          />
          <Running
            d={`M${CRUZ_D + 16} 372H600`}
            width={5}
            dash="16 24"
            dur={0.7}
            color="rgb(var(--brand-2) / .34)"
          />
          {/* bordas da via transversal, correndo em direção ao ponto de fuga */}
          <Running
            d={`M${CRUZ_E} ${VIA_Y}L${VP_X - 14} 330`}
            width={1.8}
            dash="5 5"
            dur={1.5}
            color={INK.near}
            opacity={0.45}
          />
          <Running
            d={`M${CRUZ_D} ${VIA_Y}L${VP_X + 14} 330`}
            width={1.8}
            dash="5 5"
            dur={1.5}
            color={INK.near}
            opacity={0.45}
          />
        </g>
      </g>

      {/* ============================ semáforo e poste do fundo (depth .55) */}
      <g data-scene-fill data-depth="0.55">
        <TrafficLight x={178} y={VIA_Y + 2} />
        <LightPole x={26} y={372} height={158} dir={1} arm={44} cone={false} />
      </g>

      {/* ================================= o poste da frente (depth .7) == */}
      <g data-scene-fill data-depth="0.7">
        <LightPole x={536} y={392} height={172} dir={-1} arm={52} />
      </g>

      {/* ======================= OS DOIS VEÍCULOS, MESMO PLANO (depth .9) == */}
      {/* Um único `data-depth` para os dois: no mesmo grupo eles recebem o mesmo
          deslocamento de parallax, e o contato medido no papel continua valendo
          na tela. Os atores ficam em grupos de DENTRO — parallax e ator escrevem
          os dois em `transform` e, no mesmo elemento, um anularia o outro. */}
      <g data-depth="0.9">
        {/* ---------------------------------------------------- o carro --- */}
        <g
          data-move-when="build"
          data-move-x="-430"
          data-move-dur="1.05"
          data-move-ease="power1.out"
        >
          {/* ATOR 1 — AVANÇA até encostar no caminhão */}
          <g
            data-move-when="risk"
            data-move-x={AVANCO_CARRO}
            data-move-dur="0.1"
            data-move-ease="power2.in"
          >
            {/* ATOR 2 — RECUA do choque, girando sobre o pneu traseiro */}
            <g
              data-move-when="risk"
              data-move-x="-22"
              data-move-y="-4"
              data-move-rot="-9"
              data-move-origin={origem(CAIXA_CARRO, CAR_RODA_TRAS, GY)}
              data-move-dur="0.25"
              data-move-ease="power4.in"
            >
              {/* ATOR 3 — na proteção ele assenta de novo */}
              <g
                data-move-when="shield"
                data-move-x="-6"
                data-move-y="4"
                data-move-rot="6"
                data-move-origin={origem(CAIXA_CARRO, CAR_RODA_TRAS, GY)}
                data-move-dur="0.5"
                data-move-ease="power2.inOut"
              >
                <Ancora box={CAIXA_CARRO} />
                <Contact id={ID} x={CAR_X} y={GY + 2} rx={108} ry={12} />
                {/* SEM `data-scene-fill` nos dois veículos: a materialização da
                    cena é escalonada e eles são os últimos grupos de massa da
                    lista — no instante em que o usuário lê a construção, o
                    caminhão ainda estaria translúcido. Quem ENTRA RODANDO não
                    precisa aparecer aos poucos, e os contornos continuam sendo
                    desenhados pelo DrawSVG. */}
                <Car x={CAR_X} y={GY} s={CAR_S} dir={-1} />

                <g>
                  {/* o facho do farol, apontado para o caminhão */}
                  <LightCone
                    x={CAR_NOSE - 6}
                    y={315}
                    length={112}
                    spread={22}
                    angle={11}
                    opacity={0.15}
                  />
                  {/* mancha do farol no asfalto e reflexo âmbar da lanterna */}
                  <ellipse
                    cx="300"
                    cy="352"
                    rx="60"
                    ry="12"
                    fill="rgb(var(--brand-2) / .14)"
                    filter={`url(#${ID}-soft)`}
                  />
                  <ellipse
                    cx="70"
                    cy="368"
                    rx="14"
                    ry="20"
                    fill="rgb(var(--alert) / .18)"
                    filter={`url(#${ID}-soft)`}
                  />
                </g>

                {/* --- decalques da batida, presos ao carro ---------------- */}

                {/* o para-brisa trinca: a teia NASCE no canto do vidro que
                    recebeu o golpe e se abre a partir dele. */}
                <Cresce
                  fator={2.2}
                  px={200}
                  py={295}
                  box={CAIXA_TEIA}
                  dur={0.3}
                  ease="power3.out"
                >
                  <Fracture d="M203 288L193 295L200 301L188 303" delay={0.06} />
                  <g data-scene-risk data-risk-delay="0.1">
                    <path
                      d="M203 288L206 297M193 295L180 292M200 301L204 306M196 291L186 286"
                      fill="none"
                      stroke="rgb(var(--brand-2) / .55)"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                </Cresce>

                {/* o capô amassa e o farol estoura */}
                <g data-scene-risk data-risk-delay="0.14">
                  <path {...mass('deep')} d="M211 306L222 298L231 308L242 300L245 320L211 322Z" />
                  <path
                    {...detail(0.42, 1.3)}
                    d="M216 320L223 302M228 321L233 306M238 320L243 305"
                  />
                  <path d="M240 309L257 312V321L240 318Z" fill={INK.void} opacity=".85" />
                  <path
                    d="M240 309L257 321M257 312L240 318"
                    fill="none"
                    stroke="rgb(var(--brand-2) / .5)"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* ------------------------------------------------- o caminhão --- */}
        <g
          data-move-when="build"
          data-move-x="430"
          data-move-dur="1.05"
          data-move-ease="power1.out"
        >
          {/* ATOR 1 — AVANÇA até encostar no carro */}
          <g
            data-move-when="risk"
            data-move-x={AVANCO_CAMINHAO}
            data-move-dur="0.1"
            data-move-ease="power2.in"
          >
            {/* ATOR 2 — RECUA pouco: a massa é outra */}
            <g
              data-move-when="risk"
              data-move-x="10"
              data-move-y="2"
              data-move-rot="1.6"
              data-move-origin={origem(CAIXA_CAMINHAO, TRK_RODA_TRAS, GY)}
              data-move-dur="0.25"
              data-move-ease="power4.in"
            >
              <g
                data-move-when="shield"
                data-move-x="6"
                data-move-y="-2"
                data-move-rot="-1.2"
                data-move-origin={origem(CAIXA_CAMINHAO, TRK_RODA_TRAS, GY)}
                data-move-dur="0.5"
                data-move-ease="power2.inOut"
              >
                <Ancora box={CAIXA_CAMINHAO} />
                <Contact id={ID} x={TRK_X} y={GY + 2} rx={102} ry={12} opacity={0.85} />
                <Truck x={TRK_X} y={GY} scale={TRK_S} />

                <g>
                  {/* o facho do caminhão, apontado para o carro: os dois cones
                      se cruzam em cima do ponto de encontro */}
                  <LightCone
                    x={TRK_NOSE}
                    y={313}
                    length={92}
                    spread={20}
                    angle={170}
                    opacity={0.15}
                  />
                  <ellipse
                    cx="470"
                    cy="352"
                    rx="16"
                    ry="9"
                    fill="rgb(var(--alert) / .2)"
                    filter={`url(#${ID}-soft)`}
                  />
                </g>

                {/* --- decalques da batida, presos ao caminhão ------------- */}
                <g data-scene-risk data-risk-delay="0.18">
                  <path {...mass('deep')} d="M308 300L318 292L323 304L322 332L308 333Z" />
                  <path {...detail(0.4, 1.3)} d="M312 331L317 300M319 330L322 306" />
                  <path d="M307 306L317 308V317L307 315Z" fill={INK.void} opacity=".85" />
                  <path
                    d="M307 306L317 317M317 308L307 315"
                    fill="none"
                    stroke="rgb(var(--brand-2) / .5)"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                <Fracture d="M322 284L332 292L324 297L336 300" delay={0.2} />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* O asfalto correndo rente ao rodapé do quadro: a camada mais próxima e
          a que carrega a velocidade. */}
      <g data-scene-fill data-depth="1">
        <Running
          d="M-30 388H590"
          width={7}
          dash="26 14"
          dur={0.5}
          color={INK.near}
          opacity={0.8}
        />
        <Running
          d="M-30 397H590"
          width={3}
          dash="20 20"
          dur={0.32}
          color="rgb(var(--brand-2) / .26)"
          delay={0.08}
        />
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 0 — O CHOQUE, no ponto de contato medido: clarão, estilhaços de energia
             e faíscas. O grupo NÃO viaja com nenhum dos dois veículos — o ponto
             onde as latarias se encontraram fica parado, e são eles que recuam
             a partir dele. O que se move aqui é a ABERTURA do estilhaço. */}
      <g
        data-move-when="risk"
        data-move-scale="1.4"
        data-move-origin="50% 50%"
        data-move-dur="0.24"
        data-move-ease="power3.out"
      >
        <g data-scene-risk data-risk-delay="0">
          <ellipse
            cx={IMPACTO_X}
            cy={IMPACTO_Y}
            rx="50"
            ry="40"
            fill="rgb(var(--brand-2) / .22)"
            filter={`url(#${ID}-haze)`}
          />
          <ellipse
            cx={IMPACTO_X}
            cy={IMPACTO_Y}
            rx="26"
            ry="22"
            fill="rgb(var(--alert) / .3)"
            filter={`url(#${ID}-haze)`}
          />
          <g filter={`url(#${ID}-glow)`}>
            <path {...shard('M285 324L258 308L266 334Z')} />
            <path {...shard('M285 324L272 348L290 344Z')} />
            <path {...shard('M285 324L302 302L308 322Z')} />
          </g>
          <Sparks x={IMPACTO_X} y={IMPACTO_Y} count={8} radius={24} tone="alert" />
          <Sparks x={IMPACTO_X} y={IMPACTO_Y} count={5} radius={18} tone="brand" />
        </g>
      </g>

      {/* 1 — os estilhaços que sobraram no asfalto, embaixo do ponto de
             contato: lascas de plástico e vidro em cor de massa. */}
      <g data-scene-risk data-risk-delay="0.24">
        <path {...mass('ink')} d="M262 352l7 3-8 2Z" />
        <path {...mass('deep')} d="M296 358l9 2-8 3Z" />
        <path {...mass('ink')} d="M276 364l6 4-9 1Z" />
        <path
          d="M308 350l6 3-7 2Z"
          fill="rgb(var(--brand-2) / .55)"
        />
      </g>

      {/* 2 — o asfalto guarda a frenagem: cada marca SE ESTENDE a partir do
             pneu que travou. Ela nasce onde a borracha começou a queimar (o
             ponto fixo do `Cresce`) e cresce até onde o veículo parou.
             A do carro fica atrás dele, à esquerda; a do caminhão, à direita. */}
      <g data-scene-risk data-risk-delay="0.2">
        <Cresce fator={1.9} px={44} py={354} box={CAIXA_FREIO_CARRO} dur={0.42}>
          <path
            d="M44 353C90 354 130 356 168 358"
            fill="none"
            stroke={`${INK.ink}`}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="30 12"
            opacity=".5"
          />
          <path
            d="M52 362C104 363 158 365 214 366"
            fill="none"
            stroke={`${INK.deep}`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="24 14"
            opacity=".55"
          />
        </Cresce>
      </g>
      <g data-scene-risk data-risk-delay="0.24">
        <Cresce fator={1.9} px={532} py={352} box={CAIXA_FREIO_CAMINHAO} dur={0.42}>
          <path
            d="M532 351C494 352 462 354 436 356"
            fill="none"
            stroke={`${INK.ink}`}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="30 12"
            opacity=".5"
          />
          <path
            d="M528 361C484 362 448 363 418 364"
            fill="none"
            stroke={`${INK.deep}`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="24 14"
            opacity=".55"
          />
        </Cresce>
      </g>

      {/* 3 — a poeira que o impacto levanta, em cor de massa: sobe do ponto de
             contato e se espalha. */}
      <g data-scene-risk data-risk-delay="0.3">
        <g
          data-move-when="risk"
          data-move-y="-26"
          data-move-scale="1.45"
          data-move-origin="50% 100%"
          data-move-dur="0.6"
          data-move-ease="power1.out"
        >
          <Smoke id={ID} x={296} y={330} scale={0.95} />
          <Smoke id={ID} x={254} y={346} scale={0.7} />
        </g>
      </g>

      {/* ===================================================== a proteção == */}
      <ShieldSeal id={ID} x={424} y={78} size={92} />
    </Scene>
  );
}

export default RoadScene;
