import type { CSSProperties } from 'react';

import {
  Air,
  Ancora,
  type Caixa,
  Contact,
  Fracture,
  GROUND_Y,
  INK,
  MASS,
  Scene,
  ShieldSeal,
  Smoke,
  Wheel,
  accent,
  accentStroke,
  alertStroke,
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

const ID = 'sc-cargo';

/* ==========================================================================
 * CAPÍTULO 04 — "A carga não é sua. A responsabilidade é."
 * ==========================================================================
 * O QUE A CENA PRECISA CONTAR:
 *
 *   1. CONSTRUÇÃO  um conjunto — cavalo mecânico mais carreta — rodando numa
 *                  estrada, com a carga amarrada na plataforma e a rota
 *                  correndo por cima, do embarque até o armazém de destino.
 *   2. IMPREVISTO  a cinta arrebenta, o conjunto desestabiliza e a carga TOMBA
 *                  na pista: as caixas saem voando do estrado, giram e param
 *                  espalhadas no asfalto, levantando poeira. A rota se parte no
 *                  meio do caminho — a entrega não vai acontecer.
 *   3. PROTEÇÃO    o selo cobre a carga caída e a rota se refaz até o armazém.
 *                  O caminhão continua tombado: o acidente aconteceu. O que
 *                  muda é quem paga por ele.
 *
 * -----------------------------------------------------------------------------
 * POR QUE A CENA ANTERIOR NÃO FUNCIONAVA
 * -----------------------------------------------------------------------------
 * O veículo não se lia como caminhão: a cabine era uma caixinha solta, o estrado
 * era uma chapa com rodas em posições que não correspondiam a eixo nenhum, e as
 * caixas pairavam no ar em vez de cair. Um desenho que o olho não reconhece não
 * conta história nenhuma — vira ruído bonito. Aqui o conjunto foi medido como
 * conjunto de verdade: quinta roda sobre o tandem traseiro, cabine à frente do
 * tandem, eixo dianteiro sob o nariz da cabine, e a carreta apoiada por cima.
 *
 * -----------------------------------------------------------------------------
 * POR QUE O TOMBAMENTO É PARCIAL
 * -----------------------------------------------------------------------------
 * De perfil, um capotamento lateral não existe: o giro acontece no eixo que
 * aponta para o observador, e na tela ele viraria um "cavalo de pau". O que se
 * desenha aqui é o que a perspectiva permite ler — o conjunto inclinando e a
 * carga saindo do estrado. É a informação que importa para o seguro: a carga foi
 * ao chão.
 * ========================================================================== */

/* --- a pista -------------------------------------------------------------- */
const PISTA_TOPO = GROUND_Y; // aresta distante do asfalto
const PISTA_FIM = 384; // aresta junto ao observador
const EIXO_Y = 312; // centro dos pneus (raio 18 → encostam em 330)
const RAIO = 18;

/* --- o cavalo mecânico ---------------------------------------------------- */
const CAB_E = 346;
const CAB_D = 424;
const CAB_TOPO = 224;
const RODA_DIANT = 404;
const TANDEM_A = 318;
const TANDEM_B = 352;

/* --- a carreta ------------------------------------------------------------ */
const DECK_E = 80;
const DECK_D = 340;
const DECK_TOPO = 272;
const BOGIE_A = 112;
const BOGIE_B = 146;

/* --- a carga -------------------------------------------------------------- */
const CAIXA_W = 46;
const CAIXA_H = 44;
/** As quatro caixas em cima do estrado, da traseira para a frente. */
const CARGA = [88, 140, 196, 248];

/* O armazém de destino, lá no fundo. */
const ARM_E = 462;
const ARM_D = 552;
const ARM_BASE = 318;

/* Caixa do ator "conjunto": o pivô da inclinação é o tandem traseiro do
   cavalo, que é onde um conjunto realmente pivota quando a traseira perde
   aderência. Ver `Ancora`/`origem` em sceneParts. */
const CAIXA_CONJUNTO: Caixa = [60, 200, 390, 150];

/** Uma caixa de carga: três faces, para ter volume mesmo pequena. */
function CaixaCarga({ x, y = DECK_TOPO - CAIXA_H }: { x: number; y?: number }) {
  return (
    <g>
      {/* face frontal */}
      <rect x={x} y={y} width={CAIXA_W} height={CAIXA_H} rx="2" {...volume(ID)} />
      {/* topo em perspectiva curta */}
      <path d={`M${x} ${y}l9-7h${CAIXA_W}l-9 7Z`} {...topFace(ID)} />
      {/* lateral */}
      <path d={`M${x + CAIXA_W} ${y}l9-7v${CAIXA_H}l-9 7Z`} {...sideFace(ID)} />
      {/* fita de fechamento: o detalhe que faz o volume virar "caixa" */}
      <path {...detail(0.3, 1.4)} d={`M${x + CAIXA_W / 2} ${y}v${CAIXA_H}`} />
      <path {...detail(0.22, 1.1)} d={`M${x} ${y + CAIXA_H * 0.38}h${CAIXA_W}`} />
      <rect {...outline(1.3, 0.3)} x={x} y={y} width={CAIXA_W} height={CAIXA_H} rx="2" />
    </g>
  );
}

export function CargoScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} y={PISTA_TOPO} />

      {/* ------------------------------------------------------------ a pista */}
      <g data-scene-fill mask={`url(#${ID}-edge)`}>
        <path d={`M0 ${PISTA_TOPO}H560V400H0Z`} fill={INK.far} />
        <path d={`M0 ${PISTA_TOPO}H560V${PISTA_TOPO + 7}H0Z`} fill={INK.mid} opacity=".5" />
        <path d={`M0 ${PISTA_FIM}H560V${PISTA_FIM + 5}H0Z`} fill={INK.mid} opacity=".35" />
      </g>
      {/* faixa central: os tracinhos correm, e é o que diz "em movimento"
          antes de qualquer outra coisa na cena */}
      <path
        data-scene-live
        {...detail(0.32, 3)}
        strokeDasharray="26 22"
        className="animate-dash-move"
        d={`M-20 ${(PISTA_TOPO + PISTA_FIM) / 2}H580`}
      />

      {/* --------------------------------------------------------- o destino */}
      <g data-scene-fill data-depth="0.18">
        {/* Menor e mais atrás do que a primeira versão: do tamanho do caminhão
            e colado nele, lia-se como um galpão preso ao para-choque. */}
        <path d={`M${ARM_E} ${ARM_BASE}V268h${ARM_D - ARM_E}v${ARM_BASE - 268}Z`} fill={INK.far} />
        <path d={`M${ARM_E - 8} 268L${(ARM_E + ARM_D) / 2} 250L${ARM_D + 8} 268Z`} fill={INK.mid} />
        <rect x={ARM_E + 14} y="290" width="26" height="28" fill={INK.void} opacity=".45" />
        <rect x={ARM_E + 50} y="290" width="26" height="28" fill={INK.void} opacity=".45" />
        <path {...detail(0.18, 1.1)} d={`M${ARM_E} 280h${ARM_D - ARM_E}`} />
      </g>

      {/* ------------------------------------------------------------- A ROTA
          Sai do ponto de embarque, à esquerda, e termina no destino. Os
          tracinhos correm enquanto a carga está a caminho. */}
      <g data-scene-vanish data-risk-delay="0">
        <path
          data-scene-live
          {...accentStroke(2.6, 0.9)}
          strokeDasharray="11 9"
          className="animate-dash-move"
          d="M26 168C120 118 220 112 300 128S430 150 486 124"
          filter={`url(#${ID}-glow)`}
        />
        <circle cx="26" cy="168" r="5.5" {...accent(0.95)} />
      </g>

      {/* O destino, sempre no lugar: o alfinete que a rota tenta alcançar. */}
      <g data-scene-fill data-depth="0.2">
        <path
          d="M486 100c8 0 14 6 14 14 0 10-14 24-14 24s-14-14-14-24c0-8 6-14 14-14Z"
          fill="rgb(var(--brand) / .9)"
        />
        <circle cx="486" cy="114" r="5" fill="rgb(var(--panel))" />
      </g>

      {/* A ROTA PARTIDA: entra no imprevisto, com a interrupção no meio. */}
      <g data-scene-risk data-risk-delay="1">
        <path {...accentStroke(2.4, 0.42)} strokeDasharray="11 9" d="M26 168C110 122 190 114 252 124" />
        <path {...accentStroke(2.4, 0.22)} strokeDasharray="6 10" d="M320 136C390 148 440 148 486 124" />
        <path {...alertStroke(2.8, 0.95)} d="M268 120l22 22M290 118l-22 22" />
      </g>

      {/* ====================================================== O CONJUNTO
          Entra rodando pela esquerda (build) e inclina no imprevisto (risk).
          São DOIS grupos encaixados porque são dois movimentos diferentes: o
          de fora leva o conjunto até o lugar, o de dentro o desestabiliza. */}
      <g
        data-move-when="build"
        data-move-x="-300"
        data-move-dur="0.9"
        data-move-ease="power2.out"
      >
        <g
          data-move-when="risk"
          data-move-rot="-7"
          data-move-y="3"
          data-move-dur="0.5"
          data-move-ease="power3.in"
          data-move-origin={origem(CAIXA_CONJUNTO, TANDEM_A, GROUND_Y)}
        >
          <Ancora box={CAIXA_CONJUNTO} />
          <Contact id={ID} x={240} rx={190} ry={13} opacity={0.75} />

          {/* ---------------------------------------------------- a carreta */}
          <g data-scene-fill>
            {/* estrado */}
            <path d={`M${DECK_E} ${DECK_TOPO}H${DECK_D}v10H${DECK_E}Z`} {...volume(ID)} />
            <path d={`M${DECK_E} ${DECK_TOPO + 10}H${DECK_D}v4H${DECK_E}Z`} fill={INK.deep} />
            {/* ripas do assoalho: sem elas, o estrado vazio depois do tombo
                vira uma prancha cinza sem leitura */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path
                key={i}
                {...detail(0.18, 1)}
                d={`M${DECK_E + 16 + i * 32} ${DECK_TOPO}v10`}
              />
            ))}
            {/* longarina e suporte do bogie */}
            <path d={`M${BOGIE_A - 16} ${DECK_TOPO + 14}h${BOGIE_B - BOGIE_A + 32}v16h-${BOGIE_B - BOGIE_A + 32}Z`} fill={INK.deep} />
            {/* para-choque traseiro, a peça que identifica a traseira */}
            <path d={`M${DECK_E - 4} ${DECK_TOPO + 14}h8v34h-8Z`} fill={INK.deep} />
            <path d={`M${DECK_E - 10} ${DECK_TOPO + 44}h26v7h-26Z`} fill={INK.near} />
          </g>

          {/* ----------------------------------------------- o cavalo mecânico */}
          <g data-scene-fill>
            {/* chassi */}
            <path d={`M296 284h134v10H296Z`} fill={INK.deep} />
            {/* quinta roda: o prato onde a carreta se apoia */}
            <path d={`M306 274h44v10h-44Z`} fill={INK.near} />
            {/* cabine */}
            <path
              d={`M${CAB_E} 292V${CAB_TOPO + 16}c0-9 5-15 14-17l40-7c13-2 22 5 23 17l3 26v60Z`}
              {...volume(ID)}
            />
            {/* defletor de teto */}
            <path d={`M${CAB_E + 6} ${CAB_TOPO + 14}l10-12h30l-4 12Z`} fill={INK.mid} />
            {/* para-brisa e janela lateral */}
            <path d={`M${CAB_D - 30} ${CAB_TOPO + 12}l20 4 3 22h-23Z`} {...glass(ID)} />
            <path d={`M${CAB_E + 12} ${CAB_TOPO + 18}h28v26h-28Z`} {...glass(ID)} />
            {/* grade e para-choque */}
            <path d={`M${CAB_D - 6} 262h12v30h-12Z`} fill={INK.deep} />
            <path d={`M${CAB_D - 10} 284h22v12h-22Z`} fill={INK.near} />
            {/* farol */}
            <ellipse cx={CAB_D + 2} cy="276" rx="5" ry="4" fill="rgb(var(--brand-2) / .9)" />
            {/* escapamento vertical, atrás da cabine */}
            <path d={`M${CAB_E - 10} 206h9v86h-9Z`} fill={INK.deep} />
            {/* retrovisor */}
            <path {...detail(0.4, 2)} d={`M${CAB_D - 2} ${CAB_TOPO + 16}l10 4v16`} />
            <path {...outline(1.4, 0.3)} d={`M${CAB_E} 292V${CAB_TOPO + 16}c0-9 5-15 14-17l40-7c13-2 22 5 23 17l3 26`} />
          </g>

          {/* fumaça do escapamento: o conjunto está trabalhando */}
          <g>
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                data-scene-live
                cx={CAB_E - 6 + i * 2}
                cy={200}
                r={5 + i}
                fill={`rgb(var(--fg) / ${MASS.air})`}
                className="animate-smoke-rise"
                style={{ animationDelay: `${i * 0.9}s` } as CSSProperties}
              />
            ))}
          </g>

          {/* --------------------------------------------------------- rodas */}
          <g data-scene-fill>
            <Wheel id={ID} x={BOGIE_A} y={EIXO_Y} r={RAIO} />
            <Wheel id={ID} x={BOGIE_B} y={EIXO_Y} r={RAIO} />
            <Wheel id={ID} x={TANDEM_A} y={EIXO_Y} r={RAIO} />
            <Wheel id={ID} x={TANDEM_B} y={EIXO_Y} r={RAIO} />
            <Wheel id={ID} x={RODA_DIANT} y={EIXO_Y} r={RAIO} />
          </g>
        </g>
      </g>

      {/* ======================================================== A CARGA
          Cada caixa é um ator com destino próprio. Na construção elas chegam
          junto com o conjunto; no imprevisto saem do estrado, giram e param no
          asfalto. O trajeto de cada uma é diferente de propósito: quatro caixas
          caindo igual parecem um elevador, não um tombamento. */}
      {[
        /* Cada caixa cai numa distância e num giro diferentes, e todas param
           NA FAIXA DA FRENTE da pista — abaixo das rodas, onde o olho as lê
           como "no chão" e não como "atrás do caminhão". */
        { x: CARGA[0], mx: -46, my: 82, rot: -96 },
        { x: CARGA[1], mx: -18, my: 74, rot: 58 },
        { x: CARGA[2], mx: -4, my: 80, rot: -42 },
        { x: CARGA[3], mx: 34, my: 70, rot: 122 },
      ].map((c, i) => (
        <g
          key={c.x}
          data-move-when="build"
          data-move-x="-300"
          data-move-dur="0.9"
          data-move-ease="power2.out"
        >
          <g
            data-move-when="risk"
            data-move-x={c.mx}
            data-move-y={c.my}
            data-move-rot={c.rot}
            data-move-dur="0.62"
            data-move-ease="power2.in"
            /* Gira em volta do PRÓPRIO CENTRO, não da base. Girando pela base,
               um tombo de 100° joga a caixa a uma altura inteira dali e ela
               saía pelo rodapé do quadro — foi medido. Pelo centro, a caixa
               tomba onde caiu, que é o que acontece de verdade. */
            data-move-origin={origem(
              [c.x - 10, DECK_TOPO - CAIXA_H - 10, CAIXA_W + 30, CAIXA_H + 20],
              c.x + CAIXA_W / 2,
              DECK_TOPO - CAIXA_H / 2,
            )}
            data-depth={0.9 - i * 0.02}
          >
            <Ancora box={[c.x - 10, DECK_TOPO - CAIXA_H - 10, CAIXA_W + 30, CAIXA_H + 20]} />
            <CaixaCarga x={c.x} />
          </g>
        </g>
      ))}

      {/* A CINTA que amarra a carga. Arrebenta no imprevisto — é o gesto que
          explica por que as caixas saíram voando. */}
      <g data-scene-vanish data-risk-delay="0">
        <path
          {...detail(0.5, 3)}
          d={`M${DECK_E + 2} ${DECK_TOPO + 2}v-10h${DECK_D - DECK_E - 50}v10`}
        />
        <path {...detail(0.5, 3)} d={`M${CARGA[1] + CAIXA_W / 2} ${DECK_TOPO - CAIXA_H - 4}v${CAIXA_H + 6}`} />
        <path {...detail(0.5, 3)} d={`M${CARGA[2] + CAIXA_W / 2} ${DECK_TOPO - CAIXA_H - 4}v${CAIXA_H + 6}`} />
      </g>
      {/* as duas pontas soltas da cinta rompida */}
      <g data-scene-risk data-risk-delay="0">
        <path {...detail(0.45, 3)} d={`M${DECK_E + 2} ${DECK_TOPO - 8}q26-16 48-6`} />
        <path {...detail(0.45, 3)} d={`M${DECK_D - 60} ${DECK_TOPO - 8}q-22-18-46-6`} />
      </g>

      {/* POEIRA onde as caixas batem no asfalto. */}
      <g data-scene-risk data-risk-delay="2">
        <Smoke id={ID} x={66} y={372} scale={0.72} />
        <Smoke id={ID} x={150} y={376} scale={0.58} />
        <Smoke id={ID} x={300} y={370} scale={0.5} />
      </g>

      {/* A caixa que não resistiu: rompida, com o conteúdo à mostra. */}
      <g data-scene-risk data-risk-delay="3">
        <Fracture d="M44 372l16-12 10 14 14-10" width={2} />
        <Fracture d="M196 378l14-10 8 12" width={1.6} delay={0.1} />
      </g>

      {/* ===================================================== A PROTEÇÃO */}
      {/* O selo cobre a carga no chão — não o caminhão. É a carga que está
          segurada, e é dela que a história trata. */}
      <ShieldSeal id={ID} x={118} y={196} size={86} />

      {/* A rota refeita, agora até o fim. */}
      <g data-scene-shield>
        <path
          data-scene-live
          {...accentStroke(3, 1)}
          strokeDasharray="12 8"
          className="animate-dash-move"
          d="M26 168C120 118 220 112 300 128S430 150 486 124"
          filter={`url(#${ID}-glow)`}
        />
        <circle cx="486" cy="114" r="9" fill="rgb(var(--panel) / .96)" />
        <circle
          cx="486"
          cy="114"
          r="9"
          fill="none"
          stroke={`url(#${ID}-brand)`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M481 114l4 4 7-8"
          fill="none"
          stroke={`url(#${ID}-brand)`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* A COBERTURA sobre a carga caída. Era um retângulo tracejado em volta
          de tudo e lia-se como moldura solta no meio da pista; virou o que
          realmente se quer dizer: a mercadoria no chão continua valendo, e cada
          volume está coberto. Luz por baixo e visto em cima. */}
      <g data-scene-shield>
        <ellipse
          cx="170"
          cy="356"
          rx="172"
          ry="34"
          fill="rgb(var(--brand-2) / .14)"
          filter={`url(#${ID}-haze)`}
        />
        {[
          [64, 338],
          [216, 336],
          [306, 326],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="11" fill="rgb(var(--panel) / .96)" />
            <circle
              cx={cx}
              cy={cy}
              r="11"
              fill="none"
              stroke={`url(#${ID}-brand)`}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M${cx - 5} ${cy}l4 4 7-8`}
              fill="none"
              stroke={`url(#${ID}-brand)`}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </g>
    </Scene>
  );
}

export default CargoScene;
