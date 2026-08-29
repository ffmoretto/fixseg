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
  sideFace,
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
 * `animate-dash-move` desloca o tracejado em exatamente 40 unidades por ciclo:
 * para o laço fechar sem salto, traço + vão precisa dividir 40. Daí "6 14",
 * "10 30" e "2 8".
 */
const FLUXO = '6 14';

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
 * Usar arco (e não a elipse inteira) mantém as trilhas EXTERNAS fora da base:
 * elas entram por trás da plataforma em vez de passarem por baixo dela.
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

/* Partículas que sobem da plataforma para o escudo (deslocamento em x). */
const PARTICULAS = [-84, -58, -31, -9, 14, 40, 67, 88];

/* -------------------------------------------------------------------------- */
/* ANEL QUE GIRA                                                              */
/* -------------------------------------------------------------------------- */
/**
 * Um anel em perspectiva que gira de verdade.
 *
 * O truque: a forma desenhada é um CÍRCULO, e quem achata é o grupo de fora
 * (`scale(1, ry/rx)`). Se a elipse girasse diretamente, ela cambalhotaria — o
 * eixo maior mudaria de direção e a peça deixaria de ler como um anel deitado.
 * Girando o círculo DENTRO do espaço já achatado, o que se vê é o tracejado
 * correndo em volta do emblema, que é o efeito desejado.
 *
 * `fill-box` põe a origem da rotação no centro da própria forma — sem isso, a
 * origem seria o (0,0) do viewBox e o anel sairia orbitando o canto do quadro.
 *
 * Só os anéis INTERNOS giram: os externos são a trilha onde os ícones se
 * apoiam, e uma trilha que gira desprende os ícones da própria órbita.
 */
function Anel({
  r,
  ry,
  dash,
  dur,
  width = 1.4,
  opacity = 0.4,
  reverse = false,
}: {
  r: number;
  ry: number;
  dash: string;
  dur: string;
  width?: number;
  opacity?: number;
  reverse?: boolean;
}) {
  return (
    <g transform={`translate(${CX} ${CY}) scale(1 ${xy(ry / r)})`}>
      <circle
        data-scene-live
        cx="0"
        cy="0"
        r={r}
        fill="none"
        stroke={`rgb(var(--brand-2) / ${opacity})`}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
        className="fill-box animate-spin-slow"
        style={{ animationDuration: dur, animationDirection: reverse ? 'reverse' : 'normal' }}
      />
    </g>
  );
}

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
 * PROFUNDIDADE EM CAMADAS
 *  · 0.15 — a aura e a atmosfera do emblema;
 *  · 0.3  — as trilhas externas onde os seis ícones se apoiam, com o fluxo
 *    correndo por elas;
 *  · 0.5  — os anéis internos, que giram em velocidades e sentidos diferentes,
 *    e as linhas de energia que convergem para o centro;
 *  · 0.7  — a plataforma, agora estreita: ela apoia o emblema, não o disputa;
 *  · 1    — o escudo, com varredura de luz sobre a chapa, pulso de emissão e o
 *    check da marca desenhado por último.
 *
 * Não há `data-scene-risk` aqui: este capítulo não tem imprevisto para mostrar,
 * ele é a resposta aos cinco anteriores. Tudo o que se move é construção.
 */
export function ShieldScene() {
  return (
    <div className="relative h-full w-full">
      <Scene id={ID}>
        {/* Defs LOCAIS da cena: a varredura de luz precisa de um recorte com a
            forma do escudo e de uma faixa em degradê. Ids prefixados pelo ID da
            cena, porque id de SVG é global no documento. */}
        <defs>
          <clipPath id={`${ID}-plate`}>
            <path d={SHIELD} />
          </clipPath>
          <linearGradient id={`${ID}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--brand-2) / 0)" />
            <stop offset="44%" stopColor="rgb(var(--brand-2) / .26)" />
            <stop offset="56%" stopColor="rgb(255 255 255 / .2)" />
            <stop offset="100%" stopColor="rgb(var(--brand-2) / 0)" />
          </linearGradient>
        </defs>

        <Air id={ID} y={318} />

        {/* ------------------------------------- aura do emblema (depth .15) */}
        <g data-scene-fill data-depth="0.15">
          <ellipse
            cx={CX}
            cy="196"
            rx="176"
            ry="152"
            fill={`rgb(var(--brand) / ${MASS.air})`}
            filter={`url(#${ID}-haze)`}
          />
          <ellipse cx={CX} cy="176" rx="128" ry="120" fill={`${INK.air}`} />
        </g>

        {/* ------------------------- trilhas externas dos ícones (depth .3) */}
        <g data-depth="0.3">
          <g data-scene-draw>
            <path {...detail(MASS.far, 1)} strokeDasharray="2 8" d={TRACK_ORBIT} />
            <path {...detail(MASS.mid, 1.1)} strokeDasharray="14 6" d={TRACK_MID} />
            <path {...detail(MASS.body, 1.4)} d={BRACKET_R} />
            <path {...detail(MASS.body, 1.4)} d={BRACKET_L} />
          </g>

          {/* o fluxo correndo pelas trilhas: a proteção circulando */}
          <path
            data-scene-live
            d={TRACK_ORBIT}
            fill="none"
            stroke="rgb(var(--brand-2) / .7)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="10 30"
            className="animate-dash-move"
            style={{ animationDuration: '2.2s' }}
          />
          <path
            data-scene-live
            d={TRACK_MID}
            fill="none"
            stroke="rgb(var(--brand) / .5)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="4 16"
            className="animate-dash-move"
            style={{ animationDuration: '3.4s', animationDirection: 'reverse' }}
          />

          <g data-scene-fill>
            {NODES.map((n, i) => (
              <circle key={i} {...accent()} cx={n.x} cy={n.y} r="3.2" />
            ))}
          </g>
          {NODES.map((n, i) => (
            <circle
              key={`p-${i}`}
              data-scene-live
              cx={n.x}
              cy={n.y}
              r="7"
              fill="none"
              stroke="rgb(var(--brand-2) / .45)"
              strokeWidth="1.6"
              className="fill-box animate-pulse-ring"
              style={{ animationDuration: '3s', animationDelay: `${xy(i * 0.5)}s` }}
            />
          ))}
        </g>

        {/* ------------------- anéis internos girando + energia (depth .5) */}
        <g data-depth="0.5">
          <Anel r={170} ry={122} dash="30 18" dur="34s" width={1.6} opacity={0.3} />
          <Anel r={150} ry={108} dash="4 12" dur="24s" width={1.4} opacity={0.42} reverse />
          <Anel r={128} ry={92} dash="52 34" dur="17s" width={2.2} opacity={0.5} />

          {/* linhas de energia: entram de fora e correm PARA o escudo */}
          <g data-scene-draw>
            {Array.from({ length: 24 }, (_, i) => {
              const deg = i * 15;
              const c = Math.cos((deg * Math.PI) / 180);
              if (Math.abs(c) < 0.46) return null;
              const long = i % 2 === 0;
              const from = long ? ring(deg, 212, 152) : ring(deg, 184, 132);
              const to = ring(deg, 156, 140);
              return (
                <path
                  key={i}
                  {...(long ? accentStroke(1.2, MASS.deep) : detail(MASS.mid, 1))}
                  d={`M${from.x} ${from.y}L${to.x} ${to.y}`}
                />
              );
            })}
          </g>
          <g data-scene-live>
            {Array.from({ length: 24 }, (_, i) => {
              const deg = i * 15;
              const c = Math.cos((deg * Math.PI) / 180);
              if (Math.abs(c) < 0.46 || i % 2 !== 0) return null;
              const from = ring(deg, 212, 152);
              const to = ring(deg, 156, 140);
              return (
                <path
                  key={`f-${i}`}
                  d={`M${from.x} ${from.y}L${to.x} ${to.y}`}
                  fill="none"
                  stroke="rgb(var(--brand-2) / .85)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={FLUXO}
                  className="animate-dash-move"
                  style={{ animationDuration: `${xy(1.1 + (i % 4) * 0.22)}s` }}
                />
              );
            })}
          </g>
        </g>

        {/* ----------------------- a base onde o escudo apoia (depth .7) ==
            Antes o tampo tinha 232 de largura e a face mais clara da escala:
            no tema claro virava um prato branco que roubava o emblema. Agora é
            estreito, na massa média, e só a aresta da frente pega luz. */}
        <g data-depth="0.7">
          <g data-scene-fill>
            {/* encaixe sob a ponta do escudo */}
            <path {...mass('deep')} d="M264 284h32l10 22h-52Z" />
            {/* tampo da plataforma */}
            <ellipse {...mass('mid')} cx={CX} cy="306" rx="96" ry="15" />
            {/* faixa frontal: a espessura da plataforma, sempre na sombra */}
            <path
              {...sideFace(ID)}
              d="M184 306v11a96 15 0 0 0 192 0v-11a96 15 0 0 1 -192 0z"
            />
            {/* fio de luz na aresta do tampo */}
            <path {...accent(0.5)} d="M214 296h132l-7 5H221Z" />
          </g>

          <g data-scene-draw>
            <ellipse {...accentStroke(1.3, 0.4)} cx={CX} cy="306" rx="96" ry="15" />
            <path {...detail(MASS.mid, 1.1)} d="M184 306v11M376 306v11" />
          </g>

          {/* partículas subindo da plataforma para o escudo */}
          <g>
            {PARTICULAS.map((dx, i) => (
              <circle
                key={i}
                data-scene-live
                cx={xy(CX + dx)}
                cy={xy(300 - ((i * 11) % 14))}
                r={xy(1.4 + ((i * 5) % 3) * 0.5)}
                fill="rgb(var(--brand-2) / .85)"
                className="fill-box animate-smoke-rise"
                style={{
                  animationDelay: `${xy(i * 0.44)}s`,
                  animationDuration: `${xy(3 + (i % 3) * 0.7)}s`,
                }}
              />
            ))}
          </g>

          <Contact id={ID} x={CX} y={322} rx={128} ry={13} opacity={0.85} />
        </g>

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
          {/* o pulso da emissão: dois anéis saindo do emblema */}
          <ellipse
            data-scene-live
            cx={CX}
            cy="184"
            rx="104"
            ry="112"
            fill="none"
            stroke="rgb(var(--brand-2) / .3)"
            strokeWidth="2"
            className="fill-box animate-pulse-ring"
            style={{ animationDuration: '4.4s' }}
          />
          <ellipse
            data-scene-live
            cx={CX}
            cy="184"
            rx="104"
            ry="112"
            fill="none"
            stroke="rgb(var(--brand) / .26)"
            strokeWidth="1.6"
            className="fill-box animate-pulse-ring"
            style={{ animationDuration: '4.4s', animationDelay: '2.2s' }}
          />

          {/* chapa: corpo sólido, para que os anéis não vazem pelo meio do
              símbolo. Mesma opacidade do selo do kit (ShieldSeal). */}
          <path d={SHIELD} fill="rgb(var(--panel) / .94)" />
          <path d={SHIELD} fill={`url(#${ID}-brand)`} opacity={MASS.mid} />

          {/* chanfro: duas facetas a partir do vértice dão a dobra da chapa */}
          <path d={FACET_L} {...sideFace(ID)} opacity={MASS.ink} />
          <path d={FACET_R} fill={`url(#${ID}-top)`} opacity={MASS.ink} />

          {/* varredura de luz sobre a chapa: a faixa corre recortada pela
              própria silhueta do escudo, então nada dela escapa para fora */}
          <g clipPath={`url(#${ID}-plate)`}>
            <g transform="skewX(-16)">
              <rect
                data-scene-live
                x="200"
                y="40"
                width="104"
                height="280"
                fill={`url(#${ID}-sweep)`}
                className="fill-box animate-sheen"
                style={{
                  animationDuration: '5s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                }}
              />
            </g>
          </g>

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

      {/* ícones orbitando o escudo — HTML sobre o SVG para herdar tipografia.
          Três camadas de propósito: a de fora carrega a POSIÇÃO (e o recuo de
          meia caixa), a do meio é o alvo do orquestrador (`data-scene-orbit`,
          que entra com escala) e a de dentro tem a flutuação própria. Se as
          três vivessem no mesmo elemento, a animação CSS de `transform`
          sobrescreveria a entrada do GSAP e o recuo de centralização. */}
      <div className="pointer-events-none absolute inset-0">
        {orbit.map((o, i) => {
          const rad = (o.angle * Math.PI) / 180;
          const x = xy(50 + 40 * Math.cos(rad));
          const y = xy(50 + 40 * Math.sin(rad));
          return (
            <div
              key={o.icon}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div data-scene-orbit data-orbit-index={i}>
                <div
                  className="animate-float-y grid h-11 w-11 place-items-center rounded-xl border border-hair bg-panel/[.9] text-accent-ink shadow-soft backdrop-blur-sm"
                  style={{
                    animationDuration: `${xy(5 + (i % 3) * 0.9)}s`,
                    animationDelay: `${xy(i * 0.55)}s`,
                  }}
                >
                  <Icon name={o.icon} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShieldScene;
