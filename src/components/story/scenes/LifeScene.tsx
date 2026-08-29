import {
  Air,
  Contact,
  Fracture,
  Ground,
  INK,
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
 * `variant='ghost'` desenha a MESMA figura preenchida com a cor da página e
 * contornada em tracejado. Sobreposta à figura sólida, ela a apaga e deixa só o
 * contorno: é assim que o capítulo mostra a ausência sem recorrer a nenhum
 * símbolo mórbido.
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

  const limbColor = ghost ? 'rgb(var(--page) / .92)' : limb;
  const bodyFill = ghost ? { fill: 'rgb(var(--page) / .92)' } : volume(ID);

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

/* Posições da família. Ficam fora do componente porque o imprevisto precisa
   desenhar uma das figuras EXATAMENTE em cima da original. */
const FAMILY = {
  adultA: { x: 232, y: 326, scale: 1.16 },
  child: { x: 284, y: 326, scale: 0.7 },
  adultB: { x: 334, y: 326, scale: 1.08 },
};

const DOOR = 'M186 330V206A94 52 0 01374 206V330Z';

/**
 * Capítulo 01 — Vida.
 *
 * A família em contraluz, na porta iluminada de casa: é a imagem mais direta de
 * "quem depende de você". Acima, o traçado cardíaco em ciano — a vida em curso.
 * No imprevisto a luz da sala baixa, o traçado vira uma reta, a parede trinca e
 * uma das figuras deixa de ter corpo: sobra o contorno de onde ela estava.
 */
export function LifeScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ------------------------------------------------------- a fachada */}
      <g data-scene-fill>
        {/* espessura da parede, à direita */}
        <path {...sideFace(ID)} d="M440 130l30 14v186h-30Z" />
        {/* pano de parede */}
        <path {...mass('mid')} d="M120 130h320v200H120Z" />
        {/* verga sobre a porta */}
        <path {...mass('near')} d="M172 196h216v12H172Z" />
      </g>

      {/* -------------------------------------------------- a luz de dentro */}
      <g data-scene-fill>
        <path {...glass(ID)} d={DOOR} />
        {/* halo: a luz que escapa pela porta */}
        <path d={DOOR} fill="rgb(var(--brand-2) / .2)" filter={`url(#${ID}-haze)`} />
        {/* mancha de luz projetada no chão */}
        <ellipse cx="280" cy="342" rx="118" ry="16" fill="rgb(var(--brand-2) / .16)" />
      </g>

      <g data-scene-draw>
        <path {...outline(1.6, 0.34)} d="M186 330V206A94 52 0 01374 206V330" />
        <path {...detail(0.2)} d="M120 130h320M172 202h216" />
      </g>

      {/* luminária pendente: o detalhe que faz a sala parecer habitada */}
      <g data-scene-draw>
        <path {...detail(0.3)} d="M280 168v18" />
      </g>
      <g data-scene-fill>
        <path {...accent(0.85)} d="M268 186h24l-6 12h-12Z" />
        <circle
          cx="280"
          cy="200"
          r="14"
          fill="rgb(var(--brand-2) / .3)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      {/* --------------------------------------------------------- a família */}
      <g data-scene-fill>
        <Figure {...FAMILY.adultA} reach="right" />
        <Figure {...FAMILY.child} reach="both" limb={INK.ink} />
        <Figure {...FAMILY.adultB} reach="left" />
        {/* as mãos que se encontram */}
        <circle cx="262" cy="291" r="3.6" fill="rgb(var(--brand-2) / .95)" />
        <circle cx="307" cy="291" r="3.6" fill="rgb(var(--brand-2) / .95)" />
      </g>

      <Contact id={ID} x={282} y={328} rx={126} ry={10} opacity={0.8} />

      {/* ------------------------------------------- o traçado: a vida em curso */}
      <g data-scene-draw>
        <path
          {...accentStroke(2.6, 0.95)}
          d="M34 86h74l14-32 19 66 16-34h30l13 21 12-21h58"
          filter={`url(#${ID}-glow)`}
        />
        <path {...detail(0.2, 1.2)} strokeDasharray="3 8" d="M270 86h256" />
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* o traçado vira uma reta */}
      <g data-scene-risk data-risk-delay="0">
        <path
          d="M34 86h492"
          fill="none"
          stroke={INK.near}
          strokeWidth="2.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* a sala escurece — véu TRANSLÚCIDO de propósito: as silhuetas precisam
          continuar legíveis. Uma versão opaca aqui apagou a família inteira. */}
      <g data-scene-risk data-risk-delay="0.06">
        <path d={DOOR} fill="rgb(var(--fg) / .3)" />
      </g>

      {/* uma das figuras deixa de ter corpo */}
      <g data-scene-risk data-risk-delay="0.16">
        <Figure {...FAMILY.adultB} reach="left" variant="ghost" />
      </g>

      {/* a parede trinca */}
      <Fracture d="M120 176l26 28-18 24 24 28-12 20" delay={0.24} />
      <Fracture d="M146 204l28-8" delay={0.28} />
      <Fracture d="M440 214l-24 26 16 22" delay={0.32} />

      {/* ===================================================== a proteção == */}
      <ShieldSeal id={ID} x={452} y={34} size={92} />
    </Scene>
  );
}

export default LifeScene;
