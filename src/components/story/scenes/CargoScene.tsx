import type { ReactNode } from 'react';

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
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-cargo';

/* -------------------------------------------------------------------------- */
/* PERSPECTIVA                                                                */
/* -------------------------------------------------------------------------- */
/**
 * Toda a cena usa UMA única direção de profundidade: para cima e para a
 * ESQUERDA. É o que mantém a perspectiva coerente entre o contêiner, a cabine e
 * os volumes de carga — o observador está atrás e à esquerda do conjunto, um
 * pouco acima dele. Por isso o que se vê de cada caixa é sempre: a face lateral
 * (voltada para nós), o teto (pega a luz) e a tampa traseira, à esquerda.
 *
 * Consequência importante: as portas do contêiner ficam VISÍVEIS, à esquerda.
 * É lá que o lacre rompe.
 */
const DEPTH_X = -26;
const DEPTH_Y = -18;

/* -------------------------------------------------------------------------- */
/* RITMO DAS LINHAS TRACEJADAS                                                */
/* -------------------------------------------------------------------------- */
/**
 * `animate-dash-move` desloca o tracejado em exatamente 40 unidades por ciclo.
 * Para o laço fechar sem salto, a SOMA de traço + vão precisa dividir 40 — daí
 * "13 7", "5 35" e "20 20". Qualquer outro par pisca a cada volta.
 */
const ROTA_TRACO = '13 7';
const ROTA_PULSO = '5 35';

/* -------------------------------------------------------------------------- */
/* A ROTA, EM DOIS TRECHOS                                                    */
/* -------------------------------------------------------------------------- */
/**
 * O traçado é partido no ponto onde o imprevisto acontece. Não é capricho de
 * geometria: é o que permite ao trecho final RECOLHER no imprevisto (o traço
 * PARA de avançar, no meio do caminho) sem tocar no trecho que já se cumpriu —
 * e crescer de novo, do mesmo ponto até a entrega, na proteção.
 *
 * As duas curvas são a curva original cortada na junção dos seus dois segmentos
 * cúbicos, então o desenho é exatamente o mesmo de antes.
 */
const ROTA_A = 'M52 122C118 70 196 92 276 96';
const ROTA_B = 'M276 96C350 102 408 116 500 72';
const RUPTURA_X = 276;
const RUPTURA_Y = 96;

/* -------------------------------------------------------------------------- */
/* ORIGEM DE UM ATOR                                                          */
/* -------------------------------------------------------------------------- */
/**
 * O orquestrador recebe a origem da transformação em PORCENTAGEM da caixa do
 * ator (ver `data-move-origin` em StoryScroll.tsx), e a caixa de um grupo é a
 * união das caixas dos filhos — ela muda quando o conteúdo cresce ou gira, e
 * caixa de curva de Bézier não é o retângulo dos seus pontos de controle.
 *
 * `Ancora` é um retângulo transparente maior que o conteúdo: ele passa a ser a
 * caixa do ator, e a partir dela `origem()` converte um ponto do desenho em
 * porcentagem exata. Nada de medir curva a olho.
 */
type Caixa = [x: number, y: number, w: number, h: number];

const origem = ([bx, by, bw, bh]: Caixa, px: number, py: number) =>
  `${xy(((px - bx) / bw) * 100)}% ${xy(((py - by) / bh) * 100)}%`;

const Ancora = ({ box: [x, y, w, h] }: { box: Caixa }) => (
  <rect x={x} y={y} width={w} height={h} fill="transparent" />
);

/** Caixa do trecho final da rota (contém a curva inteira e o ponto de entrega). */
const CAIXA_ROTA: Caixa = [272, 56, 244, 54];
/** Caixa do desvio que sai da ruptura. */
const CAIXA_DESVIO: Caixa = [272, 92, 44, 84];

/* -------------------------------------------------------------------------- */
/* ATOR QUE CRESCE                                                            */
/* -------------------------------------------------------------------------- */
/**
 * O orquestrador só sabe levar um ator PARA um valor: no beat de risco não
 * existe "de onde". Para uma peça que precisa NASCER recolhida e crescer, o
 * caminho é desenhá-la no tamanho final e encolhê-la num grupo interno
 * ESTÁTICO — o ator de fora cresce de 1 até `fator` e devolve a peça ao tamanho
 * desenhado.
 *
 * `px`/`py` é o ponto que fica PARADO: o pé da chama, a dobradiça da porta, o
 * ponto de ruptura da rota. Como o encolhimento é uniforme e acontece em volta
 * dele, a porcentagem daquele ponto dentro da caixa não muda — é por isso que a
 * mesma `origem()` serve para a peça encolhida e para a peça inteira.
 *
 * Duas consequências boas: o encolhimento vive no atributo `transform`, então o
 * modo sem movimento continua coerente; e o ator de fora não tem transformação
 * de base, então não briga com o GSAP.
 */
function Cresce({
  fator,
  px,
  py,
  box,
  when = 'risk',
  dur = 0.5,
  ease = 'power2.out',
  children,
}: {
  fator: number;
  px: number;
  py: number;
  box: Caixa;
  when?: 'risk' | 'shield';
  dur?: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when={when}
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
 * Quina de apoio de um volume, em porcentagem da caixa do ator — é a origem da
 * queda. A caixa de um `Crate` inclui as faces de topo e de fundo, que recuam
 * `dx` para a esquerda, então a quina da FRENTE não é 0%: à esquerda ela cai em
 * `-dx / (w - dx)`. À direita a face frontal é o próprio limite da caixa.
 */
const quina = (w: number, dx: number, lado: 'esq' | 'dir') =>
  `${lado === 'dir' ? '100' : xy((-dx / (w - dx)) * 100)}% 100%`;

/* -------------------------------------------------------------------------- */
/* VOLUME DE CARGA                                                            */
/* -------------------------------------------------------------------------- */
/**
 * Caixa em três faces. `x, y` é o canto superior esquerdo da face que olha para
 * o observador; `w, h` o tamanho dessa face; `dx, dy` a profundidade (o mesmo
 * eixo da cena, apenas mais curto quanto menor o volume).
 *
 * Massa por face: teto claro (`topFace`), lateral em gradiente de volume,
 * tampa traseira na sombra (`sideFace`). A cinta em ciano é o único ponto de cor
 * — é ela que diz "isto está lacrado".
 */
function Crate({
  x,
  y,
  w,
  h,
  dx = -16,
  dy = -12,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  dx?: number;
  dy?: number;
}) {
  const front = `M${x} ${y}h${w}v${h}h${-w}Z`;
  const top = `M${x} ${y}L${x + dx} ${y + dy}H${x + w + dx}L${x + w} ${y}Z`;
  const end = `M${x} ${y}L${x + dx} ${y + dy}V${y + h + dy}L${x} ${y + h}Z`;
  /* metades passam por `xy()`: divisão que vai virar string no HTML */
  const midX = xy(x + w / 2);
  const midY = xy(y + h / 2);

  return (
    <g>
      <path {...sideFace(ID)} d={end} />
      <path {...topFace(ID)} d={top} />
      <path {...volume(ID)} d={front} />
      <g data-scene-draw>
        <path {...outline(1.5, 0.34)} d={front} />
        <path {...outline(1.3, 0.26)} d={top} />
        <path {...outline(1.3, 0.26)} d={end} />
        <path {...detail(0.22)} d={`M${midX} ${y}V${y + h}`} />
        <path {...accentStroke(1.6, 0.34)} d={`M${x} ${midY}H${x + w}`} />
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* POEIRA                                                                     */
/* -------------------------------------------------------------------------- */
/**
 * Poeira de asfalto: baforadas achatadas e claras que sobem do chão.
 * Diferente da fumaça do kit em dois pontos — é larga e baixa (o pó rasteja
 * antes de subir) e a opacidade vive na COR, não no atributo `opacity`, porque
 * `[data-scene-live]` é forçado a `opacity: 1` no modo de movimento reduzido.
 */
function Poeira({
  x,
  y,
  scale = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
}) {
  const puffs = [
    { dx: 0, dy: 0, r: 11, d: 0 },
    { dx: -13, dy: -3, r: 14, d: 0.95 },
    { dx: 11, dy: -7, r: 9, d: 1.9 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {puffs.map((p, i) => (
        <ellipse
          key={i}
          data-scene-live
          cx={p.dx}
          cy={p.dy}
          rx={p.r}
          ry={p.r * 0.46}
          fill="rgb(var(--fg) / .12)"
          filter={`url(#${ID}-soft)`}
          className="fill-box animate-smoke-rise"
          style={{ animationDelay: `${p.d + delay}s`, animationDuration: '3s' }}
        />
      ))}
    </g>
  );
}

/**
 * Capítulo 04 — Carga.
 *
 * PROFUNDIDADE EM CAMADAS
 *  · 0.15 — o pátio de embarque: galpões, contêineres empilhados que já são só
 *    silhueta, janelas acesas e a mancha de luz que elas jogam no piso;
 *  · 0.28 — a rota contratada, no ar, com o tracejado correndo, os dois pontos
 *    pulsando e um pulso de luz percorrendo o traçado;
 *  · 0.4  — o mastro de iluminação do pátio, com cone no ar e mancha no chão;
 *  · 0.5  — o conjunto cavalo mecânico + carreta: rodas girando, faróis
 *    acesos, giroflex piscando, poeira saindo do asfalto;
 *  · 0.9  — os volumes empilhados no pátio de destino, em primeiro plano.
 *
 * -----------------------------------------------------------------------------
 * O CASO ACONTECE NA TELA (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  o conjunto ENTRA RODANDO pela esquerda e assenta no pátio; a
 *               rota se desenha e o ponto de entrega CHEGA pela ponta dela; os
 *               volumes DESCEM e se empilham, inteiros, um depois do outro;
 *   imprevisto  a rota SE ROMPE no meio do caminho — o trecho final RECOLHE até
 *               o ponto de corte (o traço para de avançar) e o ponto de desvio
 *               SALTA de lá; a porta da carreta ABRE a partir da dobradiça; os
 *               dois volumes de pé TOMBAM, cada um girando sobre a quina que
 *               toca o chão e em tempos diferentes; e um volume da pilha
 *               simplesmente deixa de existir — sobra a silhueta tracejada, o
 *               buraco onde a carga estava. Esse buraco é o assunto do capítulo;
 *   proteção    a rota se RECOMPÕE, do ponto de ruptura até a entrega.
 */
export function CargoScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ================================== plano distante (depth .15) ====
          Sem `data-scene-fill`: o pátio ao fundo não precisa "ganhar corpo", ele
          já entra com a cena. Cada grupo de massa estica o escalonamento da
          construção, e o que importa materializando é o que conta a história —
          o conjunto, a carga, a rota. */}
      <g data-depth="0.15">
        {/* armazém do pátio de embarque, à esquerda */}
        <path {...mass('far')} d="M-10 330v-70h66v70Z" />
        <path {...mass('mid')} d="M-10 260h66l-8-12H-2Z" opacity=".6" />
        {/* contêineres empilhados, já quase só silhueta */}
        <path {...mass('far')} d="M0 296h44v34H0Z" />
        <path {...mass('far')} d="M6 280h30v16H6Z" />
        <path {...mass('air')} d="M0 268h22v12H0Z" />

        {/* armazém de destino, à direita — as pilhas de carga o cobrem em parte.
            A faixa acesa fica ACIMA da altura das pilhas: se ficasse na cota das
            portas, a única luz do fundo sumia atrás da carga. */}
        <path {...mass('far')} d="M396 330v-106h164v106Z" />
        <path {...mass('mid')} d="M396 224h164l-14-12H410Z" opacity=".6" />
        {[404, 444, 484, 524].map((x0) => (
          <rect key={x0} {...accent(0.36)} x={x0} y="230" width="30" height="12" rx="2" />
        ))}
        <g filter={`url(#${ID}-haze)`}>
          <rect x="396" y="222" width="164" height="28" fill="rgb(var(--brand-2) / .18)" />
        </g>
        {/* o que a doca joga no piso, no vão entre a cabine e as pilhas */}
        <ellipse cx="420" cy="331" rx="44" ry="8" fill="rgb(var(--brand-2) / .16)" />
      </g>

      {/* ================================= a rota contratada (depth .28) === */}
      <g data-depth="0.28">
        {/* ---------------------- trecho cumprido: embarque → ruptura ------ */}
        <g data-scene-draw>
          <path
            {...accentStroke(2.4, 0.85)}
            strokeDasharray={ROTA_TRACO}
            d={ROTA_A}
            filter={`url(#${ID}-glow)`}
          />
          <path {...detail(0.2, 1.1)} strokeDasharray="3 7" d="M52 132v18" />
          <circle {...accentStroke(1.6, 0.5)} cx="52" cy="122" r="11" />
        </g>

        {/* o pulso que percorre o traçado: o embarque em trânsito */}
        <path
          data-scene-live
          d={ROTA_A}
          fill="none"
          stroke="rgb(var(--brand-2) / .95)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={ROTA_PULSO}
          className="animate-dash-move"
          style={{ animationDuration: '1.5s' }}
          filter={`url(#${ID}-glow)`}
        />

        <g data-scene-fill>
          <circle {...accent(0.95)} cx="52" cy="122" r="5" />
        </g>
        <circle
          data-scene-live
          cx="52"
          cy="122"
          r="11"
          fill="none"
          stroke="rgb(var(--brand-2) / .5)"
          strokeWidth="2"
          className="fill-box animate-pulse-ring"
          style={{ animationDuration: '2.8s' }}
        />

        {/* ATOR — trecho da ruptura até a entrega. No imprevisto ele RECOLHE
            até o ponto de ruptura: o traço para de avançar no meio do caminho,
            e o que sobra na tela é o percurso que se cumpriu. */}
        <g
          data-move-when="risk"
          data-move-scale="0.08"
          data-move-origin={origem(CAIXA_ROTA, RUPTURA_X, RUPTURA_Y)}
          data-move-dur="0.32"
          data-move-ease="power3.in"
        >
          <Ancora box={CAIXA_ROTA} />
          <g data-scene-draw>
            <path
              {...accentStroke(2.4, 0.85)}
              strokeDasharray={ROTA_TRACO}
              d={ROTA_B}
              filter={`url(#${ID}-glow)`}
            />
          </g>
          <path
            data-scene-live
            d={ROTA_B}
            fill="none"
            stroke="rgb(var(--brand-2) / .95)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={ROTA_PULSO}
            className="animate-dash-move"
            style={{ animationDuration: '1.5s' }}
            filter={`url(#${ID}-glow)`}
          />

          {/* ATOR — a entrega: o ponto de destino CHEGA pela rota, do lado do
              embarque para o lado da entrega. Gesto curto: a rota se desenha e
              o destino assenta na ponta dela. */}
          <g
            data-move-when="build"
            data-move-x="-58"
            data-move-y="9"
            data-move-dur="1.05"
            data-move-ease="power2.out"
          >
            <g data-scene-draw>
              <circle {...accentStroke(1.6, 0.5)} cx="500" cy="72" r="11" />
              <path {...detail(0.2, 1.1)} strokeDasharray="3 7" d="M500 82v18" />
            </g>
            <g data-scene-fill>
              <circle {...accent(0.95)} cx="500" cy="72" r="5" />
            </g>
            <circle
              data-scene-live
              cx="500"
              cy="72"
              r="11"
              fill="none"
              stroke="rgb(var(--brand-2) / .5)"
              strokeWidth="2"
              className="fill-box animate-pulse-ring"
              style={{ animationDuration: '2.8s', animationDelay: '1.4s' }}
            />
          </g>
        </g>
      </g>

      {/* ============================ o asfalto que corre (depth .5) ======= */}
      <g data-depth="0.5">
        <rect x="-20" y="340" width="600" height="24" fill={INK.air} />
        <path
          data-scene-live
          d="M-20 352H580"
          fill="none"
          stroke={INK.mid}
          strokeWidth="5"
          strokeDasharray="20 20"
          className="animate-dash-move"
          style={{ animationDuration: '0.55s' }}
        />
      </g>

      {/* =============================== o conjunto (depth .5) ============ */}
      {/* O parallax fica no grupo de FORA e o ator no de dentro: as duas coisas
          escrevem `transform`, e no mesmo elemento uma anularia a outra. */}
      <g data-depth="0.5">
        {/* ATOR — o conjunto ENTRA RODANDO pela esquerda e assenta no pátio.
            As rodas já giram por conta própria (CSS), então o deslocamento é o
            que falta para o conjunto estar de fato viajando. */}
        <g
          data-move-when="build"
          data-move-x="-430"
          data-move-dur="1.15"
          data-move-ease="power1.out"
        >
        <Contact id={ID} x={222} y={330} rx={196} ry={14} />

        {/* --------------------------------------- carreta com contêiner */}
        <g data-scene-fill>
          {/* tampa traseira, à esquerda, na sombra: é a face lacrada */}
          <path {...sideFace(ID)} d="M72 178L46 160V262L72 280Z" />
          {/* teto: recebe a luz e afina a silhueta */}
          <path {...topFace(ID)} d="M72 178L46 160H272L298 178Z" />
          {/* lateral: o corpo do volume */}
          <path {...volume(ID)} d="M72 280V178H298V280Z" />
          {/* longarina superior e inferior do contêiner */}
          <path {...mass('near')} d="M72 178H298V184H72Z" />
          <path {...mass('deep')} d="M72 274H298V280H72Z" />
        </g>

        <g data-scene-draw>
          <path {...outline(1.7, 0.4)} d="M72 280V178H298V280Z" />
          <path {...outline(1.4, 0.3)} d="M72 178L46 160H272L298 178M46 160V262L72 280" />
          {/* corrugação da lateral: traço fino, nada de forma */}
          <path
            {...detail(0.18)}
            d={Array.from({ length: 12 }, (_, i) => `M${86 + i * 17} 186V272`).join('')}
          />
          <path {...detail(0.24)} d="M72 200H298M72 258H298" />
        </g>

        {/* faixa refletiva: pega a luz do pátio e devolve em ciano */}
        <path
          data-scene-live
          d="M78 268H292"
          fill="none"
          stroke="rgb(var(--brand-2) / .5)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeDasharray="20 20"
          className="animate-dash-move"
          style={{ animationDuration: '2.2s' }}
        />

        {/* portas traseiras e o lacre */}
        <g data-scene-draw>
          <path {...detail(0.3)} d="M59 169V271" />
          <path {...detail(0.22)} d="M52 165V265M66 175V274" />
          <path {...detail(0.24)} d="M50 186H68M50 250H68" />
          <path {...accentStroke(1.6, 0.7)} d="M59 240v-8" />
          <circle {...accentStroke(1.9, 0.85)} cx="59" cy="246" r="4.6" />
        </g>

        {/* --------------------------------------------- chassi e rodagem */}
        <g data-scene-fill>
          <path {...mass('deep')} d="M72 280H306V291H72Z" />
          <path {...mass('deep')} d="M276 282H400V293H276Z" />
          {/* cavas de roda: o vão por onde a roda entra, achatado contra o chassi */}
          <path {...mass('deep')} d="M85 291A19 12 0 01123 291ZM127 291A19 12 0 01165 291Z" />
          <path
            {...mass('deep')}
            d="M265 293A19 12 0 01303 293ZM303 293A19 12 0 01341 293ZM365 293A19 12 0 01403 293Z"
          />
          {/* vão entre a carreta e a cabine: a quinta roda, sempre na sombra */}
          <path {...mass('deep')} d="M298 190h14v92h-14Z" />
        </g>

        {/* cinco eixos: dois da carreta, três do cavalo. Giram por conta própria. */}
        <g data-scene-fill>
          <Wheel id={ID} x={104} y={311} r={19} />
          <Wheel id={ID} x={146} y={311} r={19} />
          <Wheel id={ID} x={284} y={311} r={19} />
          <Wheel id={ID} x={322} y={311} r={19} />
          <Wheel id={ID} x={384} y={311} r={19} />
        </g>

        {/* a poeira que a rodagem levanta do asfalto */}
        <Poeira x={92} y={326} scale={0.85} />
        <Poeira x={268} y={328} scale={0.7} delay={0.6} />
        <Poeira x={372} y={326} scale={0.6} delay={1.2} />

        {/* ------------------------------------------------ cavalo mecânico */}
        <g data-scene-fill>
          {/* teto da cabine, no mesmo eixo de profundidade da carreta */}
          <path {...topFace(ID)} d="M324 200L298 182H340L366 200Z" />
          {/* corpo da cabine */}
          <path
            {...volume(ID)}
            d="M312 288V212C312 205 316 200 324 200H366C370 200 373 201 375 204L394 232C396 235 397 238 397 242V288Z"
          />
          {/* vidraça: janela da porta e para-brisa */}
          <rect {...glass(ID)} x="326" y="212" width="36" height="30" rx="4" />
          <path {...glass(ID)} d="M370 208L390 236V244H370Z" />
          {/* espelho e para-choque */}
          <path {...mass('near')} d="M396 212h6v14h-6Z" />
          <path {...mass('ink')} d="M390 276h14v18h-14Z" />
          {/* escapamento vertical, atrás da cabine */}
          <path {...mass('near')} d="M300 186h8v96h-8Z" />
          <path {...mass('near')} d="M297 182h14v7h-14Z" />
        </g>

        <g data-scene-draw>
          <path
            {...outline(1.7, 0.4)}
            d="M312 288V212C312 205 316 200 324 200H366C370 200 373 201 375 204L394 232C396 235 397 238 397 242V288"
          />
          <path {...outline(1.3, 0.26)} d="M324 200L298 182H340L366 200" />
          <rect {...outline(1.3, 0.3)} x="326" y="212" width="36" height="30" rx="4" />
          <path {...outline(1.3, 0.3)} d="M370 208L390 236V244H370Z" />
          <path {...detail(0.24)} d="M326 246V286M392 218h4" />
          <path {...accentStroke(1.6, 0.6)} d="M330 254h11" />
        </g>

        {/* ------------------------------------- faróis: o conjunto está rodando */}
        <g data-scene-fill>
          <path {...accent(0.9)} d="M391 250h8v12h-8Z" />
          <path {...accent(0.7)} d="M391 266h8v8h-8Z" />
        </g>
        {/* o cone é curto de propósito: o vão livre entre o nariz da cabine e a
            primeira pilha tem 40 unidades, e um facho longo só se enterrava
            atrás da carga */}
        <LightCone x={400} y={256} length={62} spread={26} angle={-3} opacity={0.34} />
        <LightCone x={400} y={270} length={48} spread={17} angle={14} opacity={0.26} />
        <ellipse cx="424" cy="330" rx="38" ry="8" fill="rgb(var(--brand-2) / .22)" />
        <ellipse
          cx="399"
          cy="258"
          rx="24"
          ry="19"
          fill="rgb(var(--brand-2) / .5)"
          filter={`url(#${ID}-haze)`}
        />

        {/* giroflex no teto da cabine: o único âmbar antes do imprevisto —
            é sinal de alerta, não decoração */}
        <g data-scene-fill>
          <path {...mass('deep')} d="M318 178h18v4h-18Z" />
          <path {...alert(0.9)} d="M320 170h14v9h-14Z" />
        </g>
        <ellipse
          data-scene-live
          cx="327"
          cy="173"
          rx="17"
          ry="13"
          fill="rgb(var(--alert-2) / .45)"
          filter={`url(#${ID}-haze)`}
          className="fill-box animate-flicker"
          style={{ animationDuration: '1.3s' }}
        />

        {/* fumaça do escapamento: movimento próprio, independente do scroll */}
        <Smoke id={ID} x={304} y={174} scale={0.55} />
        </g>
      </g>

      {/* ================== primeiro plano: o pátio de destino (depth .9) == */}
      <g data-depth="0.9">
        <Contact id={ID} x={486} y={330} rx={68} ry={11} />

        {/* ATORES — a carga se EMPILHA: cada volume desce e assenta. Os três
            partem juntos e as durações crescentes fazem a pilha subir de baixo
            para cima, sem que o orquestrador precise de um atraso por peça.
            Um único `data-scene-fill` para os três: cada grupo de massa a mais
            estica o escalonamento da construção, e a pilha inteira materializa
            junto de qualquer forma. */}
        <g data-scene-fill>
          <g
            data-move-when="build"
            data-move-y="-40"
            data-move-dur="0.7"
            data-move-ease="power2.out"
          >
            <Crate x={438} y={288} w={44} h={42} />
          </g>
          <g
            data-move-when="build"
            data-move-y="-40"
            data-move-dur="0.9"
            data-move-ease="power2.out"
          >
            <Crate x={502} y={288} w={44} h={42} />
          </g>
          <g
            data-move-when="build"
            data-move-y="-46"
            data-move-dur="1.1"
            data-move-ease="power2.out"
          >
            <Crate x={442} y={246} w={44} h={42} />
          </g>
        </g>

        {/* --------------------- dois volumes de pé, no pátio da frente ----
            Eles existem ANTES do imprevisto: é isso que permite vê-los tombar.
            ATORES — no risco cada um gira em volta da quina que toca o chão e
            escorrega para o lado; as durações são diferentes, então não caem ao
            mesmo tempo. */}
        <Contact id={ID} x={306} y={382} rx={92} ry={11} />
        <g data-scene-fill>
          <g
            data-move-when="risk"
            data-move-rot="16"
            data-move-x="6"
            data-move-origin={quina(58, -18, 'dir')}
            data-move-dur="0.32"
            data-move-ease="power3.in"
          >
            <Crate x={262} y={344} w={58} h={40} dx={-18} dy={-13} />
          </g>
          <g
            data-move-when="risk"
            data-move-rot="-24"
            data-move-x="-8"
            data-move-y="2"
            data-move-origin={quina(30, -11, 'esq')}
            data-move-dur="0.5"
            data-move-ease="power2.in"
          >
            <Crate x={344} y={352} w={30} h={26} dx={-11} dy={-8} />
          </g>
        </g>
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 1. a ruptura, exatamente onde o trecho final recolhe: as duas arestas
             do corte e a faísca de rompimento. Não há mais remendo de fundo
             por cima da linha — o que desaparece é o próprio traço, porque ele
             se recolhe. */}
      <g data-scene-risk data-risk-delay="0">
        <path {...outline(2.4, 0.44)} d="M266 86l8 18M288 88l8 18" />
        <ellipse
          cx="279"
          cy="98"
          rx="34"
          ry="24"
          fill="rgb(var(--alert) / .3)"
          filter={`url(#${ID}-haze)`}
        />
        <Sparks x={277} y={97} count={9} radius={22} tone="alert" />
      </g>

      {/* 2. o desvio de rota: o percurso que ninguém contratou.
             ATOR — o ponto de desvio SALTA da ruptura: nasce recolhido no ponto
             de corte e se abre para baixo, na direção que a carga tomou. */}
      <g data-scene-risk data-risk-delay="0.08">
        <Cresce
          box={CAIXA_DESVIO}
          px={RUPTURA_X}
          py={RUPTURA_Y}
          fator={2.1}
          dur={0.3}
          ease="back.out(1.8)"
        >
          <path
            d="M276 96c28 10 36 30 30 50"
            fill="none"
            stroke={`${INK.near}`}
            strokeWidth="2.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M299 137l7 10 9 -7"
            fill="none"
            stroke={`${INK.near}`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path {...detail(0.24, 1.4)} strokeDasharray="4 6" d="M308 152c6 8 6 14 4 20" />
        </Cresce>
      </g>

      {/* 3. o lacre rompe e a porta ABRE.
             ATOR — a folha é desenhada aberta e nasce recolhida contra a
             dobradiça (a aresta em x=46). Crescer a partir dela é exatamente
             como uma porta se abre numa projeção plana: a folha sai de perfil e
             ganha largura. O vão escuro do baú aparece atrás dela. */}
      <g data-scene-risk data-risk-delay="0.16">
        {/* o interior exposto */}
        <path d="M72 178L46 160V262L72 280Z" fill={`${INK.ink}`} opacity=".92" />
        <Cresce box={[22, 160, 24, 112]} px={46} py={211} fator={3} dur={0.34}>
          <path {...sideFace(ID)} d="M46 160L22 172V272L46 262Z" />
          <path {...outline(1.5, 0.34)} d="M46 160L22 172V272L46 262Z" />
          <path {...detail(0.24)} d="M34 168V266" />
        </Cresce>
        {/* o lacre partido: as duas metades já não se encontram */}
        <path {...accentStroke(2.4, 0.95)} d="M55 254a6 6 0 01-1 -12" />
        <path {...accentStroke(2.4, 0.95)} d="M65 238a6 6 0 011 12" />
        <Sparks x={60} y={246} count={7} radius={16} tone="alert" />
      </g>

      {/* 4. o baú trinca sob a carga que se deslocou */}
      <Fracture d="M150 186l15 26-11 18 16 22-8 14" delay={0.24} />
      <Fracture d="M165 212l26-8" delay={0.28} />

      {/* 5. a poeira que a queda dos volumes levanta do piso do pátio.
             Os volumes em si estão na construção (de pé) — quem tomba são os
             atores lá; aqui fica só o que a queda produz. */}
      <g data-scene-risk data-risk-delay="0.34">
        <Poeira x={258} y={386} scale={1.3} />
        <Poeira x={340} y={380} scale={0.95} delay={0.5} />
      </g>

      {/* 6. o volume que virou vazio: o buraco onde a carga estava */}
      <g data-scene-risk data-risk-delay="0.42">
        {/* a carga deixa de existir */}
        <path d="M426 234H470L486 246V288H442L426 276Z" fill="rgb(var(--panel) / .96)" />
        {/* e sobra só o lugar dela */}
        <path d="M426 234H470L486 246V288H442L426 276Z" fill={`${INK.air}`} />
        {/* o volume de baixo reaparece: o teto que estava coberto pela carga */}
        <path {...topFace(ID)} d="M438 288L422 276H466L482 288Z" />
        <path {...outline(1.3, 0.26)} d="M438 288L422 276H466L482 288Z" />
        <path
          data-scene-live
          d="M426 234H470L486 246V288H442L426 276Z"
          fill="none"
          stroke="rgb(var(--brand-2) / .6)"
          strokeWidth="1.8"
          strokeDasharray="8 12"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="animate-dash-move"
          style={{ animationDuration: '2.6s' }}
        />
        <path
          d="M442 246H486M442 246V288M442 246L426 234"
          fill="none"
          stroke={`${INK.mid}`}
          strokeWidth="1.3"
          strokeDasharray="5 6"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* ===================================================== a proteção ==
             ATOR — a rota se RECOMPÕE: o trecho que havia recolhido volta a
             crescer do ponto de ruptura até a entrega. É uma segunda cópia do
             traçado, e não o mesmo ator do risco: assim cada movimento é medido
             uma única vez, no seu próprio beat, e nenhum dos dois herda a
             caixa deformada do outro. */}
      <g data-scene-shield>
        <path
          d={`${ROTA_A}${ROTA_B}`}
          fill="none"
          stroke="rgb(var(--brand-2) / .2)"
          strokeWidth="14"
          strokeLinecap="round"
          filter={`url(#${ID}-haze)`}
        />
        <Cresce
          box={CAIXA_ROTA}
          px={RUPTURA_X}
          py={RUPTURA_Y}
          fator={9}
          when="shield"
          dur={0.52}
        >
          {/* `data-scene-draw` para que este traço receba o MESMO tratamento do
              traçado original: o DrawSVG o desenha na construção, enquanto o
              grupo de proteção ainda está invisível, e os dois trechos chegam
              ao fim do capítulo com exatamente o mesmo desenho. Sem isso um
              ficava contínuo (desenhado) e o outro tracejado. */}
          <g data-scene-draw>
            <path
              {...accentStroke(2.4, 0.9)}
              strokeDasharray={ROTA_TRACO}
              d={ROTA_B}
              filter={`url(#${ID}-glow)`}
            />
            <circle {...accentStroke(1.9, 0.7)} cx="500" cy="72" r="11" />
          </g>
          <circle {...accent(0.95)} cx="500" cy="72" r="5" />
        </Cresce>
      </g>
      <ShieldSeal id={ID} x={438} y={104} size={92} />
    </Scene>
  );
}

export default CargoScene;
