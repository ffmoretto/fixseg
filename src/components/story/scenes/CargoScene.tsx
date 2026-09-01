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
 * ESQUERDA. É o que mantém a perspectiva coerente entre a plataforma da
 * carreta, a cabine e os volumes de carga — o observador está atrás e à
 * esquerda do conjunto, um pouco acima dele. Por isso o que se vê de cada caixa
 * é sempre a face lateral (voltada para nós), o teto (pega a luz) e a tampa
 * traseira, à esquerda.
 */

/* -------------------------------------------------------------------------- */
/* GEOMETRIA DO CONJUNTO E DO TOMBAMENTO                                      */
/* -------------------------------------------------------------------------- */
/**
 * A carreta é uma PLATAFORMA, não um contêiner fechado: é a única forma de a
 * carga estar visível empilhada dentro dela antes do tombamento — e de o
 * espectador ver, no imprevisto, que o que caiu no chão é exatamente o que
 * estava em cima do assoalho.
 *
 * As três medidas que governam o tombamento:
 *   PIVO_X / PIVO_Y  ponto de contato do pneu dianteiro do jogo de eixos da
 *                    carreta com o chão. É em volta dele que o conjunto gira —
 *                    o eixo de trás sai do chão, que é o que dá a leitura de
 *                    "tombou" em vez de "desceu";
 *   TOMBO_ANG        24°, dentro da faixa que lê como tombamento sem que a
 *                    ponta do conjunto saia do quadro. A esta altura o eixo de
 *                    trás da carreta fica 14 unidades no ar e a frente do
 *                    assoalho desce 39 até raspar o asfalto: os DOIS extremos
 *                    se movem, e é isso que separa um tombamento de uma
 *                    caçamba levantando;
 *   CANIVETE_ANG     −8° no cavalo, medidos a partir do pino-rei: o cavalo
 *                    acompanha em ÂNGULO DIFERENTE (16° contra os 24° da
 *                    carreta), e a dobra entre as duas unidades é o canivete.
 *                    Mais que isso e a roda dianteira do cavalo sai do quadro
 *                    por baixo — o conjunto é longo, e cada grau de rotação
 *                    joga a ponta dele 4 unidades para baixo.
 */
const DECK_Y = 280; // aresta próxima do assoalho da carreta
const CARGA_Y = 274; // face inferior dos volumes: o assoalho aparece na frente
const PIVO_X = 150;
const PIVO_Y = 330;
const PINO_X = 240; // pino-rei: a articulação entre cavalo e carreta
const PINO_Y = 292;
const TOMBO_ANG = 24;
const CANIVETE_ANG = -8;

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
 */
const ROTA_A = 'M52 122C118 70 196 92 276 96';
const ROTA_B = 'M276 96C350 102 408 116 500 72';
const RUPTURA_X = 276;
const RUPTURA_Y = 96;

/* -------------------------------------------------------------------------- */
/* CAIXA E ORIGEM DE UM ATOR                                                  */
/* -------------------------------------------------------------------------- */
/**
 * O orquestrador recebe a origem da transformação em PORCENTAGEM da caixa do
 * ator (ver `data-move-origin` em StoryScroll.tsx), e a caixa de um grupo é a
 * união das caixas dos filhos — ela muda quando o conteúdo cresce ou gira, e
 * caixa de curva de Bézier não é o retângulo dos seus pontos de controle.
 *
 * `Ancora` é um retângulo transparente maior que o conteúdo: ele passa a ser a
 * caixa do ator, e a partir dela `origem()` converte um ponto do desenho em
 * porcentagem exata. É assim que o tombamento gira em volta do PNEU, e não de
 * um ponto adivinhado no meio do conjunto.
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
/** Caixa do conjunto inteiro — cavalo, carreta, sombra, fachos e poeira. */
const CAIXA_CONJUNTO: Caixa = [-50, 150, 462, 196];
/** Caixa só do cavalo mecânico, para o canivete girar no pino-rei. */
const CAIXA_CAVALO: Caixa = [218, 142, 194, 204];

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
 * `px`/`py` é o ponto que fica PARADO: o ponto de ruptura da rota. Como o
 * encolhimento é uniforme e acontece em volta dele, a porcentagem daquele ponto
 * dentro da caixa não muda — é por isso que a mesma `origem()` serve para a
 * peça encolhida e para a peça inteira.
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
        <path {...accentStroke(1.6, 0.34)} d={`M${x} ${midY}H${x + w}`} />
        <path {...detail(0.22)} d={`M${midX} ${y}V${y + h}`} />
      </g>
    </g>
  );
}

/**
 * O VOLUME QUE VAI DESAPARECER.
 *
 * É um `Crate` com uma única diferença, e ela é decisiva: os contornos NÃO usam
 * `non-scaling-stroke`. O roubo é contado encolhendo o volume até o nada, e um
 * traço de espessura fixa sobrevive ao encolhimento — sobrava um borrão escuro
 * exatamente no lugar onde a carga devia ter desaparecido. Aqui o traço encolhe
 * junto e o volume deixa de existir de verdade.
 */
function VolumeIntacto({
  x,
  y,
  w,
  h,
  dx,
  dy,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
}) {
  const front = `M${x} ${y}h${w}v${h}h${-w}Z`;
  const top = `M${x} ${y}L${x + dx} ${y + dy}H${x + w + dx}L${x + w} ${y}Z`;
  const end = `M${x} ${y}L${x + dx} ${y + dy}V${y + h + dy}L${x} ${y + h}Z`;
  const midY = xy(y + h / 2);
  const linha = {
    fill: 'none',
    stroke: 'rgb(var(--fg) / .32)',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
  };

  return (
    <g>
      <path {...sideFace(ID)} d={end} />
      <path {...topFace(ID)} d={top} />
      <path {...volume(ID)} d={front} />
      <g data-scene-draw>
        <path {...linha} d={front} />
        <path {...linha} d={top} />
        <path {...linha} d={end} />
        <path
          d={`M${x} ${midY}H${x + w}`}
          fill="none"
          stroke="rgb(var(--brand-2) / .34)"
          strokeWidth="1.6"
        />
      </g>
    </g>
  );
}

/**
 * UM VOLUME QUE SE DERRAMA.
 *
 * Cada volume da carga é um ator do beat de risco: sai da carreta, cai e TOMBA.
 * A origem da rotação é `50% 100%` — a base do volume —, então o ponto que eu
 * controlo é a BASE dele: `dx`/`dy` levam a base até onde ela vai parar no
 * chão, e `rot` é o quanto o volume deita em cima dessa base. Sem isso a caixa
 * giraria pelo centro e terminaria enterrada ou flutuando.
 *
 * `dur` diferente em cada um é o que faz a carga se derramar em vez de cair em
 * bloco: os cinco partem juntos e chegam ao chão em tempos ligeiramente
 * diferentes.
 */
function Volume({
  dx,
  dy,
  rot,
  dur,
  ease = 'power2.in',
  children,
}: {
  dx: number;
  dy: number;
  rot: number;
  dur: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when="risk"
      data-move-x={dx}
      data-move-y={dy}
      data-move-rot={rot}
      data-move-origin="50% 100%"
      data-move-dur={dur}
      data-move-ease={ease}
    >
      {children}
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
 *  · 0.15 — o pátio de embarque e o de destino: galpões, contêineres que já são
 *    só silhueta, portas acesas e a mancha de luz que elas jogam no piso;
 *  · 0.28 — a rota contratada, no ar, com o tracejado correndo e um pulso de
 *    luz percorrendo o traçado;
 *  · 0.5  — o conjunto cavalo + carreta plataforma, CARREGADO: rodas girando,
 *    faróis acesos, giroflex piscando, poeira saindo do asfalto, e os cinco
 *    volumes empilhados e inteiros em cima do assoalho;
 *  · 0.9  — o volume que espera no destino, em primeiro plano.
 *
 * -----------------------------------------------------------------------------
 * O TOMBAMENTO, BEAT POR BEAT (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  o conjunto ENTRA RODANDO pela esquerda, carregado; a rota se
 *               desenha do embarque e o ponto de entrega CHEGA pela ponta dela;
 *               os cinco volumes estão empilhados e inteiros dentro da carreta;
 *
 *   imprevisto  O CONJUNTO TOMBA. A carreta gira 21° em volta do ponto de
 *               contato do pneu dianteiro do seu jogo de eixos: o eixo de trás
 *               sai do chão e a frente do assoalho desce na direção do
 *               observador até raspar o asfalto. O cavalo, num ator ENCAIXADO,
 *               gira −8° em volta do pino-rei: as duas unidades ficam em
 *               ângulos diferentes e a dobra entre elas é o canivete.
 *               E A CARGA SE DERRAMA: os cinco volumes saem da carreta, caem,
 *               tombam sobre a própria base e espalham pelo chão — cada um com
 *               deslocamento, rotação e duração próprios (0,26 a 0,38), então
 *               nenhum cai junto com o outro. Poeira sobe do pneu que travou e
 *               dos três pontos onde a carga bateu.
 *               E O ROUBO: longe do monte que caiu, no pátio de destino, UM
 *               VOLUME DEIXA DE EXISTIR — ele encolhe até desaparecer e no
 *               lugar dele sobra o contorno tracejado. Duas metades da mesma
 *               cobertura, separadas no espaço para não se confundirem: o
 *               tombamento à esquerda, o desaparecimento à direita;
 *
 *   proteção    a rota se RECOMPÕE, do ponto de ruptura até a entrega, e o
 *               escudo entra.
 */
export function CargoScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ================================== plano distante (depth .15) ====
          Sem `data-scene-fill`: o pátio ao fundo não precisa "ganhar corpo", ele
          já entra com a cena. */}
      <g data-depth="0.15">
        {/* armazém do pátio de embarque, à esquerda */}
        <path {...mass('far')} d="M-10 330v-70h60v70Z" />
        <path {...mass('mid')} d="M-10 260h60l-8-12H-2Z" opacity=".6" />
        <path {...mass('far')} d="M0 300h40v30H0Z" />
        <path {...mass('air')} d="M6 286h24v14H6Z" />

        {/* armazém de destino, à direita. A faixa acesa fica ACIMA da altura
            das cargas: na cota das portas, a única luz do fundo sumia atrás
            do volume que espera no pátio. */}
        <path {...mass('far')} d="M414 330v-104h146v104Z" />
        <path {...mass('mid')} d="M414 226h146l-14-12H428Z" opacity=".6" />
        {[422, 462, 502, 542].map((x0) => (
          <rect key={x0} {...accent(0.36)} x={x0} y="232" width="28" height="12" rx="2" />
        ))}
        <g filter={`url(#${ID}-haze)`}>
          <rect x="414" y="224" width="146" height="28" fill="rgb(var(--brand-2) / .18)" />
        </g>
        <ellipse cx="438" cy="331" rx="42" ry="8" fill="rgb(var(--brand-2) / .16)" />
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

        <circle {...accent(0.95)} cx="52" cy="122" r="5" />
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

          {/* ATOR — a entrega: o ponto de destino CHEGA pela rota. */}
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
            <circle {...accent(0.95)} cx="500" cy="72" r="5" />
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
        <rect x="-20" y="340" width="600" height="22" fill={INK.air} />
        <path
          data-scene-live
          d="M-20 351H580"
          fill="none"
          stroke={INK.mid}
          strokeWidth="5"
          strokeDasharray="20 20"
          className="animate-dash-move"
          style={{ animationDuration: '0.55s' }}
        />
      </g>

      {/* =============================== o conjunto (depth .5) ============ */}
      {/* O parallax fica no grupo de FORA e os atores nos de dentro: as duas
          coisas escrevem `transform`, e no mesmo elemento uma anularia a
          outra. */}
      <g data-depth="0.5">
        {/* ATOR — o conjunto e a carga ENTRAM RODANDO pela esquerda. As rodas já
            giram por conta própria (CSS), então o deslocamento é o que falta
            para o conjunto estar de fato viajando, carregado. */}
        <g
          data-move-when="build"
          data-move-x="-430"
          data-move-dur="0.9"
          data-move-ease="power1.out"
        >
          {/* ATOR — O TOMBAMENTO. A carreta gira em volta do PONTO DE CONTATO
              do pneu dianteiro do jogo de eixos: o eixo de trás sai do chão e a
              frente do assoalho desce na direção do observador. */}
          <g
            data-move-when="risk"
            data-move-rot={TOMBO_ANG}
            data-move-origin={origem(CAIXA_CONJUNTO, PIVO_X, PIVO_Y)}
            data-move-dur="0.32"
            data-move-ease="power2.in"
          >
            <Ancora box={CAIXA_CONJUNTO} />
            <Contact id={ID} x={PIVO_X} y={330} rx={190} ry={13} />

            {/* --------------------------------- carreta plataforma -------
                SEM `data-scene-fill`: a materialização da cena é escalonada, e
                o conjunto é o último grupo de massa da lista — no instante em
                que o usuário lê a construção do capítulo, a carreta ainda
                estaria em 40% de opacidade e a carga, invisível. Quem ENTRA
                RODANDO não precisa aparecer aos poucos: a entrada já é a
                revelação, e os contornos continuam sendo desenhados pelo
                DrawSVG. */}
            <g>
              {/* assoalho: teto (a superfície onde a carga pisa), face próxima
                  e tampa traseira, à esquerda, na sombra */}
              <path {...topFace(ID)} d={`M52 ${DECK_Y}L28 264H214L238 ${DECK_Y}Z`} />
              <path {...sideFace(ID)} d={`M52 ${DECK_Y}L28 264V276L52 292Z`} />
              <path {...volume(ID)} d={`M52 ${DECK_Y}H238V292H52Z`} />
              {/* paravento da frente: a parede que separa a carga da cabine */}
              <path {...mass('near')} d="M226 228H238V280H226Z" />
              <path {...topFace(ID)} d="M226 228L206 214H218L238 228Z" />
              {/* longarina, quinta roda e cavas de roda */}
              <path {...mass('deep')} d="M56 292H246V300H56Z" />
              {/* a face de BAIXO da plataforma: em pé ela não existe, mas
                  quando a carreta gira é ela que aparece — e é o que diz que
                  o conjunto saiu da posição em que devia estar */}
              <path {...mass('ink')} d="M60 300H244V307H60Z" />
              <path {...mass('deep')} d="M232 286h14v12h-14Z" />
              <path {...mass('deep')} d="M93 300A19 12 0 01131 300ZM131 300A19 12 0 01169 300Z" />
            </g>

            <g data-scene-draw>
              <path {...outline(1.7, 0.4)} d={`M52 ${DECK_Y}H238V292H52Z`} />
              <path
                {...outline(1.3, 0.28)}
                d={`M52 ${DECK_Y}L28 264H214L238 ${DECK_Y}M28 264V276L52 292`}
              />
              <path {...detail(0.24)} d="M84 280V292M116 280V292M148 280V292M180 280V292M212 280V292" />
            </g>

            {/* faixa refletiva na longarina: pega a luz do pátio */}
            <path
              data-scene-live
              d="M60 296H240"
              fill="none"
              stroke="rgb(var(--brand-2) / .5)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="20 20"
              className="animate-dash-move"
              style={{ animationDuration: '2.2s' }}
            />

            <Wheel id={ID} x={112} y={311} r={19} />
            <Wheel id={ID} x={150} y={311} r={19} />

            {/* a longarina racha onde a carga se deslocou */}
            <Fracture d="M176 292l10 10-8 8" delay={0.22} />

            {/* --------------------------------------- cavalo mecânico ----
                ATOR — o CANIVETE: o cavalo gira em volta do pino-rei, num
                ângulo diferente do da carreta. Como este ator está DENTRO do
                ator do tombamento, a articulação continua ligada: o que muda é
                só o ângulo entre as duas unidades. */}
            <g
              data-move-when="risk"
              data-move-rot={CANIVETE_ANG}
              data-move-origin={origem(CAIXA_CAVALO, PINO_X, PINO_Y)}
              data-move-dur="0.3"
              data-move-ease="power2.in"
            >
              <Ancora box={CAIXA_CAVALO} />

              <g>
                {/* teto da cabine, no mesmo eixo de profundidade da carreta */}
                <path {...topFace(ID)} d="M256 200L230 182H272L298 200Z" />
                {/* corpo da cabine */}
                <path
                  {...volume(ID)}
                  d="M244 288V212C244 205 248 200 256 200H298C302 200 305 201 307 204L326 232C328 235 329 238 329 242V288Z"
                />
                {/* vidraça: janela da porta e para-brisa */}
                <rect {...glass(ID)} x="258" y="212" width="36" height="30" rx="4" />
                <path {...glass(ID)} d="M302 208L322 236V244H302Z" />
                {/* espelho, para-choque e escapamento vertical */}
                <path {...mass('near')} d="M328 212h6v14h-6Z" />
                <path {...mass('ink')} d="M322 276h14v18h-14Z" />
                <path {...mass('near')} d="M232 186h8v96h-8Z" />
                <path {...mass('near')} d="M229 182h14v7h-14Z" />
                {/* chassi e cavas do cavalo */}
                <path {...mass('deep')} d="M240 288H332V298H240Z" />
                <path
                  {...mass('deep')}
                  d="M235 298A19 12 0 01273 298ZM297 298A19 12 0 01335 298Z"
                />
              </g>

              <g data-scene-draw>
                <path
                  {...outline(1.7, 0.4)}
                  d="M244 288V212C244 205 248 200 256 200H298C302 200 305 201 307 204L326 232C328 235 329 238 329 242V288"
                />
                <path {...outline(1.3, 0.26)} d="M256 200L230 182H272L298 200" />
                <rect {...outline(1.3, 0.3)} x="258" y="212" width="36" height="30" rx="4" />
                <path {...outline(1.3, 0.3)} d="M302 208L322 236V244H302Z" />
                <path {...accentStroke(1.6, 0.6)} d="M262 254h11" />
              </g>

              {/* faróis: o conjunto está rodando */}
              <g>
                <path {...accent(0.9)} d="M323 250h8v12h-8Z" />
                <path {...accent(0.7)} d="M323 266h8v8h-8Z" />
                <Wheel id={ID} x={254} y={311} r={19} />
                <Wheel id={ID} x={316} y={311} r={19} />
              </g>
              <LightCone x={332} y={256} length={64} spread={26} angle={-3} opacity={0.3} />
              <ellipse cx="356" cy="330" rx="38" ry="8" fill="rgb(var(--brand-2) / .2)" />
              <ellipse
                cx="331"
                cy="258"
                rx="22"
                ry="17"
                fill="rgb(var(--brand-2) / .42)"
                filter={`url(#${ID}-haze)`}
              />

              {/* giroflex no teto da cabine: o único âmbar antes do imprevisto */}
              <g>
                <path {...mass('deep')} d="M250 178h18v4h-18Z" />
                <path {...alert(0.9)} d="M252 170h14v9h-14Z" />
              </g>
              <ellipse
                data-scene-live
                cx="259"
                cy="173"
                rx="17"
                ry="13"
                fill="rgb(var(--alert-2) / .45)"
                filter={`url(#${ID}-haze)`}
                className="fill-box animate-flicker"
                style={{ animationDuration: '1.3s' }}
              />
              <Smoke id={ID} x={236} y={174} scale={0.55} />
            </g>
          </g>

          {/* ------------------------------------- a poeira da rodagem ---- */}
          <Poeira x={92} y={332} scale={0.8} />
          <Poeira x={276} y={334} scale={0.6} delay={0.9} />

          {/* ==================== A CARGA ==================================
              Os volumes ficam FORA do ator que tomba, de propósito: eles têm de
              se derramar em coordenadas da CENA, e não acompanhar a carreta que
              vira. Em repouso estão empilhados em cima do assoalho, inteiros, a
              6 unidades da aresta da plataforma — é essa folga que deixa o
              assoalho aparecer na frente deles e faz a carga estar DENTRO da
              carreta, não em cima de uma linha.

              No risco, cada um leva a própria base até um ponto do chão e deita
              em cima dela. Os cinco partem juntos; as durações diferentes é que
              fazem a carga se derramar. */}
          <g>
            <Volume dx={-3} dy={98} rot={34} dur={0.3}>
              <Crate x={58} y={CARGA_Y - 42} w={56} h={42} dx={-18} dy={-13} />
            </Volume>
            <Volume dx={-7} dy={106} rot={-30} dur={0.36}>
              <Crate x={118} y={CARGA_Y - 42} w={56} h={42} dx={-18} dy={-13} />
            </Volume>
            {/* este não chega ao chão: fica pendurado na aresta do assoalho que
                girou. É ele que impede a plataforma vazia de parecer uma rampa */}
            <Volume dx={54} dy={58} rot={28} dur={0.26}>
              <Crate x={178} y={CARGA_Y - 42} w={54} h={42} dx={-18} dy={-13} />
            </Volume>
            <Volume dx={212} dy={132} rot={-44} dur={0.38} ease="power1.in">
              <Crate x={70} y={CARGA_Y - 76} w={48} h={34} dx={-15} dy={-11} />
            </Volume>
            <Volume dx={220} dy={146} rot={22} dur={0.33} ease="power1.in">
              <Crate x={132} y={CARGA_Y - 76} w={48} h={34} dx={-15} dy={-11} />
            </Volume>
          </g>
        </g>
      </g>

      {/* ============= o volume que espera no destino (depth .9) ===========
          ATOR — O ROUBO. Ele existe na construção, inteiro, no pátio de
          destino; no imprevisto ENCOLHE até deixar de existir. Encolher (e não
          apagar) é o que o orquestrador sabe fazer com um ator — e evita
          remendar o fundo com um retângulo de cor por cima da carga. */}
      <g data-depth="0.9">
        <g>
          <g
            data-move-when="risk"
            data-move-scale="0.02"
            data-move-origin="50% 100%"
            data-move-dur="0.3"
            data-move-ease="power2.in"
          >
            {/* a sombra vive DENTRO do ator: uma carga que deixou de existir
                não pode continuar projetando sombra no piso do pátio */}
            <Contact id={ID} x={486} y={332} rx={54} ry={10} />
            <VolumeIntacto x={456} y={286} w={58} h={46} dx={-18} dy={-13} />
          </g>
        </g>
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 1. a ruptura, exatamente onde o trecho final recolhe: as duas arestas
             do corte e a faísca de rompimento. */}
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
        <Sparks x={277} y={97} count={8} radius={22} tone="alert" />
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
        </Cresce>
      </g>

      {/* 3. a poeira que o tombamento levanta: no pneu que travou e nos três
             pontos onde os volumes bateram no chão. */}
      <g data-scene-risk data-risk-delay="0.3">
        <Poeira x={PIVO_X} y={338} scale={1.1} />
        <Poeira x={80} y={380} scale={1.15} delay={0.4} />
        <Poeira x={136} y={390} scale={1.2} delay={0.7} />
        <Poeira x={298} y={372} scale={1.05} delay={1} />
        <Poeira x={364} y={386} scale={0.9} delay={1.4} />
      </g>

      {/* 3b. o arrasto: onde a longarina da carreta raspou o asfalto. É a marca
              que separa "o conjunto tombou" de "o conjunto desceu uma rampa". */}
      <g data-scene-risk data-risk-delay="0.2">
        <path
          d="M220 344c26 5 48 7 70 5"
          fill="none"
          stroke={`${INK.ink}`}
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".34"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M232 352c24 4 44 5 62 3"
          fill="none"
          stroke={`${INK.deep}`}
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".4"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 4. e o lugar onde a carga estava: o contorno tracejado, o buraco que
             sobra quando um volume desaparece entre o embarque e a entrega. */}
      <g data-scene-risk data-risk-delay="0.4">
        <path
          data-scene-live
          d="M456 286h58v46h-58Z"
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
          d="M456 286L438 273H496L514 286M438 273V319L456 332"
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
              ao fim do capítulo com exatamente o mesmo desenho. */}
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
      <ShieldSeal id={ID} x={434} y={100} size={88} />
    </Scene>
  );
}

export default CargoScene;
