import {
  Air,
  Contact,
  INK,
  MASS,
  Scene,
  accent,
  accentStroke,
  detail,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';
import Icon, { type IconName } from '@/components/icons';

const ID = 'sc-shield';

/* -------------------------------------------------------------------------- */
/* GEOMETRIA DO EMBLEMA                                                       */
/* -------------------------------------------------------------------------- */
/**
 * O centro do emblema é o centro exato do viewBox porque a órbita de ícones
 * (HTML absoluto, sobreposto ao SVG) também é centrada em 50%/50% do quadro.
 * O container da cena é `aspect-[8/5]`, a mesma proporção do viewBox 560×400,
 * então 1% na horizontal são 5,6 unidades e 1% na vertical são 4 unidades:
 * `left: 50 + 40·cos` / `top: 50 + 40·sin` cai sobre a elipse rx 224 / ry 160.
 * É por isso que a trilha da órbita desenhada abaixo passa exatamente sob os
 * ícones — SVG e HTML compartilham o mesmo eixo e a mesma escala.
 */
const CX = 280;
const CY = 200;
const ORBIT_RX = 224;
const ORBIT_RY = 160;

/**
 * Ponto sobre uma elipse concêntrica ao emblema, já arredondado.
 *
 * Todo valor que sai de `Math.cos`/`Math.sin` passa por `xy()`: o HTML é gerado
 * no servidor (Node) e reaproveitado no navegador na hidratação, e as duas
 * implementações podem divergir na última casa decimal. Esta cena já causou um
 * "hydration mismatch" por causa disso — nenhuma coordenada trigonométrica sai
 * daqui sem precisão fixa, e não existe `Math.random()`/`Date.now()` no arquivo.
 */
const ring = (deg: number, rx: number, ry: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: xy(CX + Math.cos(a) * rx), y: xy(CY + Math.sin(a) * ry) };
};

/**
 * Arco de elipse concêntrica, sempre no sentido crescente do ângulo.
 * Usar arco (e não a elipse inteira) mantém os anéis fora da base: eles entram
 * por trás da plataforma em vez de passarem por baixo dela.
 */
const arc = (fromDeg: number, toDeg: number, rx: number, ry: number, large: 0 | 1 = 1) => {
  const a = ring(fromDeg, rx, ry);
  const b = ring(toDeg, rx, ry);
  return `M${a.x} ${a.y}A${rx} ${ry} 0 ${large} 1 ${b.x} ${b.y}`;
};

/* Trilha da órbita: passa sob os seis ícones e morre na altura da base. */
const TRACK_ORBIT = arc(140, 400, ORBIT_RX, ORBIT_RY);
/* Anel intermediário. */
const TRACK_MID = arc(138, 402, 204, 146);
/* Colchetes laterais: os únicos setores com folga real em volta do escudo. */
const BRACKET_R = arc(-58, 58, 186, 133, 0);
const BRACKET_L = arc(122, 238, 186, 133, 0);

/* Nós de energia nos vãos entre os ícones, sobre a trilha da órbita. */
const NODES = [0, 60, 120, 180, 240, 300].map((deg) => ring(deg, ORBIT_RX, ORBIT_RY));

/* -------------------------------------------------------------------------- */
/* O ESCUDO                                                                   */
/* -------------------------------------------------------------------------- */
/* Uma única silhueta reaproveitada em quatro camadas (massa sólida, camada da
   marca, chanfro e borda) — é o que dá corpo sem multiplicar formas. */
const SHIELD = 'M280 76l100 34v72c0 54-40 93-100 110-60-17-100-56-100-110v-72z';
/* Silhueta interna, recuada ~14: a espessura da chapa. */
const SHIELD_INNER = 'M280 92l86 29v60c0 45-33 78-86 93-53-15-86-48-86-93v-60z';
/* Duas facetas partindo do vértice: a esquerda na sombra, a direita na luz. */
const FACET_L = 'M280 92L194 121v60c0 45 33 78 86 93Z';
const FACET_R = 'M280 92L366 121v60c0 45-33 78-86 93Z';

const orbit: { icon: IconName; angle: number }[] = [
  { icon: 'life', angle: -90 },
  { icon: 'home', angle: -30 },
  { icon: 'car', angle: 30 },
  { icon: 'cargo', angle: 90 },
  { icon: 'business', angle: 150 },
  { icon: 'shield-law', angle: 210 },
];

/**
 * Capítulo final — a convergência.
 *
 * Leitura da imagem, de fora para dentro: o ar da cena, a trilha da órbita que
 * costura os seis nichos, o anel intermediário e os colchetes laterais, os
 * raios que puxam tudo para o centro, a plataforma onde o emblema se apoia e,
 * no meio, o escudo com massa — chapa sólida, camada da marca, chanfro em duas
 * facetas e borda em gradiente. O check da FIXSEG é a última coisa a existir.
 *
 * Não há `data-scene-risk` aqui: este capítulo não tem imprevisto para mostrar,
 * ele é a resposta aos cinco anteriores.
 */
export function ShieldScene() {
  return (
    <div className="relative h-full w-full">
      <Scene id={ID}>
        <Air id={ID} y={318} />

        {/* ---------------------------------------------- aura do emblema */}
        <g data-scene-fill>
          <ellipse
            cx={CX}
            cy="196"
            rx="164"
            ry="148"
            fill={`rgb(var(--brand) / ${MASS.air})`}
            filter={`url(#${ID}-haze)`}
          />
          <ellipse
            cx={CX}
            cy="176"
            rx="128"
            ry="120"
            fill={`${INK.air}`}
          />
        </g>

        {/* ------------------------------------- anéis, raios e nós (traço) */}
        <g data-scene-draw>
          <path {...detail(MASS.far, 1)} strokeDasharray="2 10" d={TRACK_ORBIT} />
          <path {...detail(MASS.mid, 1.1)} strokeDasharray="14 10" d={TRACK_MID} />
          <path {...detail(MASS.body, 1.4)} d={BRACKET_R} />
          <path {...detail(MASS.body, 1.4)} d={BRACKET_L} />

          {/* raios de convergência: só nos setores laterais, que são os que
              têm folga entre o escudo e a órbita de ícones */}
          {Array.from({ length: 24 }, (_, i) => {
            const deg = i * 15;
            const c = Math.cos((deg * Math.PI) / 180);
            if (Math.abs(c) < 0.46) return null;
            const long = i % 2 === 0;
            const from = ring(deg, 156, 140);
            const to = long ? ring(deg, 212, 152) : ring(deg, 184, 132);
            return (
              <path
                key={i}
                {...(long ? accentStroke(1.2, MASS.deep) : detail(MASS.mid, 1))}
                d={`M${from.x} ${from.y}L${to.x} ${to.y}`}
              />
            );
          })}
        </g>

        <g data-scene-fill>
          {NODES.map((n, i) => (
            <circle key={i} {...accent()} cx={n.x} cy={n.y} r="3.2" />
          ))}
        </g>

        {/* --------------------------------------- a base onde o escudo apoia */}
        <g data-scene-fill>
          {/* encaixe sob a ponta do escudo */}
          <path {...mass('deep')} d="M262 284h36l12 22h-60Z" />
          {/* tampo da plataforma */}
          <ellipse {...topFace(ID)} cx={CX} cy="306" rx="116" ry="20" />
          {/* faixa frontal: a espessura da plataforma, sempre na sombra */}
          <path
            {...sideFace(ID)}
            d="M164 306v12a116 20 0 0 0 232 0v-12a116 20 0 0 1 -232 0z"
          />
          {/* fio de luz na aresta do tampo */}
          <path {...mass('near')} d="M196 291h168l-8 6H204Z" opacity={MASS.ink} />
        </g>

        <g data-scene-draw>
          <ellipse {...outline(1.4, MASS.deep)} cx={CX} cy="306" rx="116" ry="20" />
          <path {...detail(MASS.mid, 1.1)} d="M164 306v12M396 306v12" />
        </g>

        <Contact id={ID} x={CX} y={322} rx={148} ry={14} opacity={0.85} />

        {/* ===================================================== o escudo == */}
        <g data-scene-shield>
          {/* brilho difuso atrás: o escudo não é um recorte, ele emite */}
          <ellipse
            cx={CX}
            cy="184"
            rx="112"
            ry="118"
            fill={`rgb(var(--brand-2) / ${MASS.mid})`}
            filter={`url(#${ID}-haze)`}
          />

          {/* chapa: corpo sólido, para que os raios não vazem pelo meio do
              símbolo. Mesma opacidade do selo do kit (ShieldSeal). */}
          <path d={SHIELD} fill="rgb(var(--panel) / .94)" />
          <path d={SHIELD} fill={`url(#${ID}-brand)`} opacity={MASS.mid} />

          {/* chanfro: duas facetas a partir do vértice dão a dobra da chapa */}
          <path d={FACET_L} {...sideFace(ID)} opacity={MASS.ink} />
          <path d={FACET_R} {...topFace(ID)} opacity={MASS.ink} />
          <path d={SHIELD_INNER} {...volume(ID)} opacity={MASS.air} />

          {/* arestas internas: a espessura da borda e a quina central */}
          <path {...detail(MASS.body, 1.2)} d={SHIELD_INNER} />
          <path {...detail(MASS.mid, 1.1)} d="M280 92v185" />

          {/* borda da marca */}
          <path
            d={SHIELD}
            fill="none"
            stroke={`url(#${ID}-brand)`}
            strokeWidth="2.8"
            vectorEffect="non-scaling-stroke"
          />

          {/* rebites nos ombros — detalhe de peça montada, não de ícone */}
          <circle {...accent()} cx="280" cy="104" r="2.6" />
          <circle {...accent()} cx="204" cy="134" r="2.2" />
          <circle {...accent()} cx="356" cy="134" r="2.2" />

          {/* o check da marca: traço grosso, desenhado por último pelo DrawSVG */}
          <path
            data-shield-check
            d="M234 182l38 38 76-80"
            fill="none"
            stroke={`url(#${ID}-brand)`}
            strokeWidth="15"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${ID}-glow)`}
          />
        </g>
      </Scene>

      {/* ícones orbitando o escudo — HTML sobre o SVG para herdar tipografia */}
      <div className="pointer-events-none absolute inset-0">
        {orbit.map((o, i) => {
          const rad = (o.angle * Math.PI) / 180;
          const x = xy(50 + 40 * Math.cos(rad));
          const y = xy(50 + 40 * Math.sin(rad));
          return (
            <div
              key={o.icon}
              data-scene-orbit
              data-orbit-index={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-hair bg-panel/[.9] text-accent-ink shadow-soft backdrop-blur-sm">
                <Icon name={o.icon} size={20} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShieldScene;
