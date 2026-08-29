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
  accent,
  accentStroke,
  detail,
  glass,
  mass,
  outline,
  sideFace,
  volume,
} from '../sceneParts';

const ID = 'sc-life';

/* -------------------------------------------------------------------------- */
/* SILHUETA HUMANA                                                            */
/* -------------------------------------------------------------------------- */

const TORSO = 'M-19 -52C-19 -76 -12 -90 0 -90C12 -90 19 -76 19 -52L16 -32H-16Z';

/**
 * Figura em massa, não em risco: cabeça e tronco são formas preenchidas,
 * membros são traços grossos de ponta arredondada — é o que dá peso ao braço e
 * à perna sem precisar modelar cada um.
 *
 * A origem local é o CHÃO, no centro do corpo: `translate(x, y)` posiciona os
 * pés exatamente onde a figura toca a superfície, e `scale` muda a idade.
 *
 * `variant='ghost'` desenha a MESMA figura preenchida com a cor do painel e
 * contornada em tracejado, mais um véu ciano por dentro. Sobreposta à figura
 * sólida, ela a apaga e deixa só o contorno: é assim que o capítulo mostra a
 * ausência sem recorrer a nenhum símbolo mórbido. O véu ciano é o que mantém a
 * silhueta legível nos DOIS temas — com `--panel` puro, no tema escuro ela
 * sumia dentro do vão da porta.
 */
function Figure({
  x,
  y,
  scale = 1,
  limb = INK.deep,
  reach,
  variant = 'solid',
}: {
  x: number;
  y: number;
  scale?: number;
  limb?: string;
  /** Braço esticado para o lado indicado — as mãos dadas da cena. */
  reach?: 'left' | 'right' | 'both';
  variant?: 'solid' | 'ghost';
}) {
  const armL = reach === 'left' || reach === 'both';
  const armR = reach === 'right' || reach === 'both';
  const ghost = variant === 'ghost';

  const limbColor = ghost ? 'rgb(var(--panel) / .92)' : limb;
  const bodyFill = ghost ? { fill: 'rgb(var(--panel) / .92)' } : volume(ID);

  const legL = 'M-8 -36V-4';
  const legR = 'M8 -36V-4';
  const armLd = armL ? 'M-17 -74L-30 -44' : 'M-17 -74L-22 -42';
  const armRd = armR ? 'M17 -74L30 -44' : 'M17 -74L22 -42';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[legL, legR].map((d) => (
        <path key={d} d={d} stroke={limbColor} strokeWidth="13" strokeLinecap="round" fill="none" />
      ))}
      {[armLd, armRd].map((d) => (
        <path key={d} d={d} stroke={limbColor} strokeWidth="10" strokeLinecap="round" fill="none" />
      ))}
      <path {...bodyFill} d={TORSO} />
      <circle {...bodyFill} cx="0" cy="-104" r="13.5" />

      {ghost ? (
        <g>
          <path d={TORSO} fill="rgb(var(--brand-2) / .12)" />
          <circle cx="0" cy="-104" r="13.5" fill="rgb(var(--brand-2) / .12)" />
          <path {...accentStroke(1.5, 0.75)} strokeDasharray="5 5" d={TORSO} />
          <circle {...accentStroke(1.5, 0.75)} strokeDasharray="5 5" cx="0" cy="-104" r="13.5" />
          <path
            {...accentStroke(1.4, 0.5)}
            strokeDasharray="4 6"
            d={`${legL}${legR}${armLd}${armRd}`}
          />
        </g>
      ) : (
        <g data-scene-draw>
          <path {...outline(1.3, 0.3)} d={TORSO} />
          <circle {...outline(1.3, 0.3)} cx="0" cy="-104" r="13.5" />
        </g>
      )}
    </g>
  );
}

/**
 * Sombra projetada pela luz da porta: a figura está em contraluz, então a
 * sombra sai dos pés na direção do observador e se abre.
 *
 * Cor: `INK.void` — o único degrau da escala que é SEMPRE mais escuro que a
 * página. Com um tom baseado em `--fg`, no tema escuro a sombra vira um risco
 * claro no chão, exatamente o oposto do que ela é.
 */
function CastShadow({ x, spread = 20, length = 58 }: { x: number; spread?: number; length?: number }) {
  const half = spread / 2;
  return (
    <path
      d={`M${x - half} 326H${x + half}L${x + half + 16} ${326 + length}H${x - half - 16}Z`}
      fill={INK.void}
      opacity=".2"
    />
  );
}

/* Posições da família. Ficam fora do componente porque o imprevisto precisa
   desenhar uma das figuras EXATAMENTE em cima da original. */
const FAMILY = {
  adultA: { x: 232, y: 326, scale: 1.16 },
  child: { x: 284, y: 326, scale: 0.7 },
  adultB: { x: 334, y: 326, scale: 1.08 },
};

const DOOR = 'M186 330V206A94 52 0 01374 206V330Z';

/**
 * Poeira suspensa no facho da porta. Posições literais, sem conta nenhuma: é a
 * forma mais barata de garantir que servidor e navegador escrevam o mesmo HTML.
 * Cada partícula flutua no seu próprio ritmo (`float-y`), o que faz o ar da
 * cena parecer ar e não vazio.
 */
const MOTES = [
  { x: 168, y: 268, r: 2.4, dur: 5.2, delay: 0 },
  { x: 152, y: 300, r: 1.8, dur: 6.4, delay: 1.1 },
  { x: 186, y: 246, r: 1.6, dur: 4.6, delay: 2.2 },
  { x: 176, y: 312, r: 2.1, dur: 7, delay: 0.6 },
  { x: 142, y: 276, r: 1.4, dur: 5.8, delay: 3 },
  { x: 386, y: 258, r: 2.3, dur: 6, delay: 0.4 },
  { x: 404, y: 296, r: 1.7, dur: 4.9, delay: 1.7 },
  { x: 372, y: 314, r: 2, dur: 6.8, delay: 2.6 },
  { x: 418, y: 272, r: 1.5, dur: 5.5, delay: 0.9 },
  { x: 396, y: 232, r: 1.3, dur: 7.4, delay: 3.4 },
];

/** Traçado cardíaco: duas batidas completas e a linha seguindo em frente. */
const ECG =
  'M30 76h48q8-10 16 0h16l6 14l10-52l10 66l8-28h14q10-16 20 0h104q8-10 16 0h16l6 14l10-52l10 66l8-28h14q10-16 20 0h44';

/**
 * Capítulo 01 — Vida.
 *
 * Camadas, do fundo para a frente:
 *   0,12  a rua: telhado do vizinho, árvore, arbusto — o bairro existe;
 *   0,20  o traçado cardíaco, com batida própria e um ponto de luz correndo;
 *   0,50  a fachada: parede, beiral, duas janelas acesas;
 *   0,60  a porta iluminada, os fachos que escapam por ela e a mancha no chão;
 *   0,80  a família em contraluz e as sombras que ela projeta;
 *   0,95  o primeiro plano vivido: degrau, capacho, vaso, bola.
 *
 * No imprevisto a luz cai de verdade — a mancha do chão é comida pela sombra,
 * os fachos apagam, o traçado é lavado e vira uma reta —, a parede trinca e uma
 * das figuras deixa de ter corpo: sobra o contorno de onde ela estava.
 */
export function LifeScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ================================================ a rua (depth .12) */}
      <g data-scene-fill data-depth="0.12">
        {/* telhado do vizinho, à esquerda */}
        <path {...mass('air')} d="M-10 330V262l58-38 58 38v68Z" />
        <path {...mass('far')} d="M-10 262l58-38 58 38H-10Z" />
        {/* árvore à direita */}
        <rect {...mass('far')} x="512" y="252" width="9" height="78" rx="4" />
        <circle {...mass('air')} cx="516" cy="242" r="32" />
        <circle {...mass('air')} cx="492" cy="258" r="20" />
        {/* arbusto rente à casa */}
        <circle {...mass('far')} cx="482" cy="316" r="22" />
        <circle {...mass('far')} cx="508" cy="322" r="15" />
      </g>

      {/* ========================================= a fachada (depth .5) == */}
      <g data-scene-fill data-depth="0.5">
        {/* espessura da parede, à direita */}
        <path {...sideFace(ID)} d="M440 130l30 14v186h-30Z" />
        {/* pano de parede */}
        <path {...volume(ID)} d="M120 130h320v200H120Z" />
        {/* chaminé: quebra a linha reta do topo e dá altura à casa */}
        <path {...mass('deep')} d="M396 92h30v24h-30Z" />
        <path {...mass('near')} d="M392 86h38v8h-38Z" />
        {/* beiral: uma peça só, virando a quina com a parede lateral */}
        <path {...mass('near')} d="M108 116h346l20 12-26 14H114Z" />
        {/* toldo sobre a porta, com a sombra que ele joga na parede */}
        <path {...mass('near')} d="M158 190h244l12 14H146Z" />
        <path d="M146 204h268v7H146Z" fill={INK.deep} opacity=".5" />
      </g>

      <g data-scene-draw data-depth="0.5">
        <path {...outline(1.5, 0.32)} d="M120 330V130h320v200" />
        <path {...outline(1.3, 0.26)} d="M440 130l30 14v186" />
        <path {...detail(0.16)} d="M120 168h320M120 232h320M120 296h320" />
        <path {...detail(0.22)} d="M108 116h346M158 190h244M396 92h30" />
      </g>

      {/* as janelas acesas da sala */}
      <g data-scene-fill data-depth="0.5">
        <rect {...glass(ID)} x="132" y="232" width="44" height="44" rx="4" />
        <rect {...glass(ID)} x="384" y="232" width="44" height="44" rx="4" />
        <g filter={`url(#${ID}-haze)`} opacity=".9">
          <rect x="124" y="224" width="60" height="60" fill="rgb(var(--brand-2) / .2)" />
          <rect x="376" y="224" width="60" height="60" fill="rgb(var(--brand-2) / .2)" />
        </g>
      </g>

      <g data-scene-draw data-depth="0.5">
        <rect {...outline(1.3, 0.3)} x="132" y="232" width="44" height="44" rx="4" />
        <rect {...outline(1.3, 0.3)} x="384" y="232" width="44" height="44" rx="4" />
        <path {...detail(0.24)} d="M154 232v44M132 254h44M406 232v44M384 254h44" />
      </g>

      {/* ============================== a porta e a luz de dentro (depth .6) */}
      <g data-scene-fill data-depth="0.6">
        <path {...glass(ID)} d={DOOR} />
        {/* halo: a luz que escapa pela porta */}
        <path d={DOOR} fill="rgb(var(--brand-2) / .2)" filter={`url(#${ID}-haze)`} />
      </g>

      <g data-scene-draw data-depth="0.6">
        <path {...outline(1.6, 0.34)} d="M186 330V206A94 52 0 01374 206V330" />
      </g>

      {/* luminária pendente: o detalhe que faz a sala parecer habitada */}
      <g data-scene-draw data-depth="0.6">
        <path {...detail(0.3)} d="M280 168v18" />
      </g>
      <g data-scene-fill data-depth="0.6">
        <path {...accent(0.85)} d="M268 186h24l-6 12h-12Z" />
        <circle
          cx="280"
          cy="200"
          r="14"
          fill="rgb(var(--brand-2) / .3)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      {/* Os fachos que escapam pelas laterais da porta: a luz passa AO REDOR
          das silhuetas, que é o que acontece em contraluz. Ficam fora do
          caminho da família de propósito — no imprevisto eles apagam, e um véu
          por cima das figuras as apagaria junto. */}
      <g data-scene-fill data-depth="0.6">
        <LightCone x={200} y={214} length={118} spread={30} angle={118} opacity={0.17} />
        <LightCone x={360} y={214} length={118} spread={30} angle={62} opacity={0.17} />
        {/* poeira suspensa dentro dos fachos */}
        {MOTES.map((m, i) => (
          <circle
            key={i}
            data-scene-live
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill="rgb(var(--brand-2) / .55)"
            className="fill-box animate-float-y"
            style={
              { animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` } as CSSProperties
            }
          />
        ))}
      </g>

      {/* =============================================== a família (depth .8) */}
      <g data-scene-fill data-depth="0.8">
        <Figure {...FAMILY.adultA} reach="right" />
        <Figure {...FAMILY.child} reach="both" limb={INK.ink} />
        <Figure {...FAMILY.adultB} reach="left" />
        {/* as mãos que se encontram */}
        <circle cx="262" cy="291" r="3.6" fill="rgb(var(--brand-2) / .95)" />
        <circle cx="307" cy="291" r="3.6" fill="rgb(var(--brand-2) / .95)" />
      </g>

      <Contact id={ID} x={282} y={328} rx={126} ry={10} opacity={0.8} />

      {/* ======================================= primeiro plano (depth .95) */}
      <g data-scene-fill data-depth="0.95">
        {/* degrau da entrada */}
        <path {...mass('near')} d="M166 330h228l14 18H152Z" />
        <path {...mass('deep')} d="M152 348h256v9H152Z" />
        {/* capacho */}
        <path d="M244 332h72l6 12h-84Z" fill={INK.deep} opacity=".55" />
        {/* vaso com planta */}
        <path {...mass('mid')} d="M122 312c-8-14-16-22-26-27c12 1 22 8 26 19Z" />
        <path {...mass('mid')} d="M130 310c1-16 5-27 12-35c-2 13-3 24-6 35Z" />
        <path {...mass('far')} d="M136 314c8-11 17-17 27-19c-9 6-16 13-21 22Z" />
        <path {...volume(ID)} d="M116 320h30l-4 26h-22Z" />
        <path {...mass('near')} d="M113 315h36v7h-36Z" />
        {/* a bola esquecida no chão */}
        <circle {...mass('near')} cx="432" cy="340" r="11" />
        <path {...accentStroke(1.8, 0.7)} d="M422 337a11 11 0 0121 3" />
        <ellipse cx="432" cy="352" rx="12" ry="3" fill={INK.void} opacity=".22" />
      </g>

      <g data-scene-draw data-depth="0.95">
        <path {...outline(1.4, 0.3)} d="M166 330h228l14 18H152Z" />
        <path {...outline(1.3, 0.28)} d="M116 320h30l-4 26h-22Z" />
        <circle {...outline(1.3, 0.3)} cx="432" cy="340" r="11" />
      </g>

      {/* A luz que a porta joga no chão vem DEPOIS do primeiro plano: ela cai
          sobre o degrau e o capacho, não por baixo deles. As sombras da família
          moram aqui pelo mesmo motivo — são projetadas por essa luz. */}
      <g data-scene-fill data-depth="0.9">
        <path
          d="M196 330h168l72 44H124Z"
          fill="rgb(var(--brand-2) / .14)"
          filter={`url(#${ID}-soft)`}
        />
        <ellipse cx="280" cy="366" rx="132" ry="20" fill="rgb(var(--brand-2) / .1)" />
        <CastShadow x={232} spread={26} length={62} />
        <CastShadow x={284} spread={16} length={46} />
        <CastShadow x={334} spread={24} length={58} />
      </g>

      {/* ============================ o traçado: a vida em curso (depth .2) */}
      {/* O halo que respira ao longo da linha inteira. Fica colado ao traçado
          (e não numa mancha larga) para que o imprevisto consiga apagá-lo com
          uma fita da cor do fundo, sem lavar um pedaço inteiro do céu. */}
      <g data-scene-fill data-depth="0.2">
        <path
          data-scene-live
          d={ECG}
          fill="none"
          stroke="rgb(var(--brand-2) / .3)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${ID}-soft)`}
          className="fill-box animate-flicker"
          style={{ animationDuration: '2.4s' } as CSSProperties}
        />
      </g>

      <g data-scene-draw data-depth="0.2">
        <path {...accentStroke(2.6, 0.95)} d={ECG} filter={`url(#${ID}-glow)`} />
        <path {...detail(0.2, 1.2)} strokeDasharray="3 8" d="M478 76h58" />
      </g>

      {/* O ponto de luz que corre sobre a linha e os anéis de batida.
          Ficam FORA de `data-scene-draw`: o DrawSVG reescreve `strokeDasharray`
          e engoliria a animação de tracejado. O período do tracejado é 40, que é
          exatamente o deslocamento de `dash-move` — assim o ciclo emenda sem
          salto. */}
      <g data-scene-fill data-depth="0.2">
        <path
          data-scene-live
          d={ECG}
          fill="none"
          stroke="rgb(var(--brand-2) / .95)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="5 35"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${ID}-glow)`}
          className="animate-dash-move"
          style={{ animationDuration: '1.15s' } as CSSProperties}
        />
        {[
          { x: 126, delay: '0s' },
          { x: 330, delay: '.55s' },
        ].map((p) => (
          <circle
            key={p.x}
            data-scene-live
            cx={p.x}
            cy="38"
            r="7"
            fill="none"
            stroke="rgb(var(--brand-2) / .7)"
            strokeWidth="2"
            className="fill-box animate-pulse-ring"
            style={{ animationDuration: '2.2s', animationDelay: p.delay } as CSSProperties}
          />
        ))}
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 0 — o traçado é lavado e vira uma reta.
             O véu usa `--panel`: nos dois temas ele empurra o que está embaixo
             de volta para a cor do fundo, em vez de clarear num tema e escurecer
             no outro. É assim que o ponto de luz some junto com a linha. */}
      <g data-scene-risk data-risk-delay="0">
        <path
          d={ECG}
          fill="none"
          stroke="rgb(var(--panel) / .9)"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${ID}-soft)`}
        />
        <path
          d="M30 76h496"
          fill="none"
          stroke={INK.near}
          strokeWidth="2.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* 1 — a luz da casa cai: o vão escurece, os fachos apagam e a mancha do
             chão é comida pela sombra que fecha em volta. */}
      <g data-scene-risk data-risk-delay="0.06">
        <path d={DOOR} fill={INK.void} opacity=".44" />
        {/* os fachos laterais viram sombra */}
        <path
          d="M200 214L114 306L172 340Z"
          fill={INK.void}
          opacity=".22"
          filter={`url(#${ID}-soft)`}
        />
        <path
          d="M360 214L446 306L388 340Z"
          fill={INK.void}
          opacity=".22"
          filter={`url(#${ID}-soft)`}
        />
        {/* anel de penumbra: a mancha de luz encolhe de fora para dentro */}
        <path
          fillRule="evenodd"
          d="M280 364m-146 0a146 28 0 10292 0a146 28 0 10-292 0M280 362m-74 0a74 15 0 10148 0a74 15 0 10-148 0"
          fill={INK.void}
          opacity=".3"
          filter={`url(#${ID}-soft)`}
        />
        {/* as janelas se apagam */}
        <rect x="132" y="232" width="44" height="44" rx="4" fill={INK.void} opacity=".5" />
        <rect x="384" y="232" width="44" height="44" rx="4" fill={INK.void} opacity=".5" />
      </g>

      {/* 2 — uma das figuras deixa de ter corpo */}
      <g data-scene-risk data-risk-delay="0.16">
        <Figure {...FAMILY.adultB} reach="left" variant="ghost" />
      </g>

      {/* 3 — a parede trinca */}
      <Fracture d="M120 176l26 28-18 24 24 28-12 20" delay={0.24} />
      <Fracture d="M146 204l28-8" delay={0.28} />
      <Fracture d="M440 214l-24 26 16 22" delay={0.32} />

      {/* ===================================================== a proteção == */}
      <ShieldSeal id={ID} x={452} y={34} size={92} />
    </Scene>
  );
}

export default LifeScene;
