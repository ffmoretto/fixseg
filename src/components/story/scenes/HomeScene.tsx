import {
  Air,
  Contact,
  Flame,
  Fracture,
  Ground,
  INK,
  Rain,
  Scene,
  ShieldSeal,
  Smoke,
  accentStroke,
  detail,
  glass,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
} from '../sceneParts';

const ID = 'sc-home';

/**
 * Capítulo 02 — Casa.
 *
 * A casa é construída em volume: fachada, empena, duas águas de telhado em
 * perspectiva, parede lateral na sombra, caminho até a porta e as janelas
 * acesas. No imprevisto, o tempo vira contra ela — chuva, descarga elétrica,
 * fogo no telhado, a parede que trinca e o vidro que se rompe.
 */
export function HomeScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ------------------------------------------------- entorno de fundo */}
      <g data-scene-fill>
        {/* árvore */}
        <rect {...mass('mid')} x="487" y="248" width="10" height="82" rx="4" />
        <circle {...mass('far')} cx="492" cy="238" r="34" />
        <circle {...mass('far')} cx="466" cy="256" r="22" />
        <circle {...mass('far')} cx="518" cy="254" r="20" />
        {/* arbusto à esquerda */}
        <circle {...mass('far')} cx="106" cy="312" r="24" />
        <circle {...mass('far')} cx="136" cy="320" r="16" />
      </g>

      {/* ------------------------------------------------------- o caminho */}
      <g data-scene-fill>
        <path {...mass('mid')} d="M268 330h44l40 70H228Z" opacity=".7" />
      </g>

      {/* ------------------------------------------------------------ a casa */}
      <g data-scene-fill>
        {/* parede lateral, na sombra */}
        <path {...sideFace(ID)} d="M404 200l52 20v110h-52Z" />
        {/* fachada */}
        <path {...volume(ID)} d="M176 200h228v130H176Z" />
        {/* empena */}
        <path {...volume(ID)} d="M176 200L290 122L404 200Z" />
        {/* água de telhado direita, em perspectiva */}
        <path {...topFace(ID)} d="M290 122l52 20 114 78-52-20Z" />
        {/* beiral */}
        <path {...mass('near')} d="M164 200h252l-6 10H170Z" />
        {/* chaminé */}
        <path {...mass('deep')} d="M344 158h28v46l-28-14Z" />
        <path {...mass('near')} d="M341 152h34v10h-34Z" />
      </g>

      <g data-scene-draw>
        <path {...outline(1.6, 0.36)} d="M176 330V200L290 122l114 78v130" />
        <path {...outline(1.4, 0.3)} d="M404 200l52 20v110h-52M290 122l52 20 114 78" />
        <path {...detail(0.22)} d="M164 200h252" />
      </g>

      {/* ---------------------------------------------------- as aberturas */}
      <g data-scene-fill>
        {/* janelas acesas */}
        <rect {...glass(ID)} x="198" y="222" width="52" height="44" rx="4" />
        <rect {...glass(ID)} x="330" y="222" width="52" height="44" rx="4" />
        <rect {...glass(ID)} x="272" y="152" width="36" height="30" rx="4" />
        {/* halo de luz das janelas */}
        <g filter={`url(#${ID}-haze)`} opacity=".8">
          <rect x="198" y="222" width="52" height="44" fill="rgb(var(--brand-2) / .16)" />
          <rect x="330" y="222" width="52" height="44" fill="rgb(var(--brand-2) / .16)" />
        </g>
        {/* porta */}
        <path {...mass('deep')} d="M264 330v-64a26 26 0 0152 0v64Z" />
      </g>

      <g data-scene-draw>
        <rect {...outline(1.4, 0.32)} x="198" y="222" width="52" height="44" rx="4" />
        <rect {...outline(1.4, 0.32)} x="330" y="222" width="52" height="44" rx="4" />
        <rect {...outline(1.3, 0.28)} x="272" y="152" width="36" height="30" rx="4" />
        <path {...detail(0.26)} d="M224 222v44M198 244h52M356 222v44M330 244h52M290 152v30" />
        <path {...outline(1.5, 0.34)} d="M264 330v-64a26 26 0 0152 0v64" />
        <circle {...accentStroke(2, 0.8)} cx="304" cy="298" r="2.6" />
      </g>

      {/* medidor de energia — o detalhe que antecipa o risco */}
      <g data-scene-fill>
        <rect {...mass('near')} x="196" y="282" width="24" height="30" rx="4" />
      </g>
      <g data-scene-draw>
        <rect {...outline(1.3, 0.3)} x="196" y="282" width="24" height="30" rx="4" />
        <path {...accentStroke(1.6, 0.85)} d="M209 288l-6 11h11l-6 11" />
      </g>

      <Contact id={ID} x={300} y={330} rx={168} ry={14} />

      {/* ==================================================== o imprevisto == */}

      {/* o tempo fecha */}
      <g data-scene-risk data-risk-delay="0">
        <ellipse
          cx="270"
          cy="52"
          rx="190"
          ry="46"
          fill={`${INK.mid}`}
          filter={`url(#${ID}-haze)`}
        />
        <Rain x={70} y={78} width={420} height={150} count={24} opacity={0.5} />
      </g>

      {/* a descarga elétrica */}
      <g data-scene-risk data-risk-delay="0.1">
        <path
          d="M330 62l-26 66h26l-18 52 50-74h-28l20-44z"
          fill={`url(#${ID}-heat)`}
          filter={`url(#${ID}-glow)`}
        />
      </g>

      {/* fogo no telhado, com fumaça */}
      <g data-scene-risk data-risk-delay="0.18">
        <Smoke id={ID} x={318} y={132} scale={1.1} />
        <Flame id={ID} x={324} y={176} scale={1.05} />
        <Flame id={ID} x={352} y={186} scale={0.7} />
      </g>

      {/* a parede trinca */}
      <Fracture d="M176 238l24 26-16 22 22 26-12 18" delay={0.26} />
      <Fracture d="M200 264l26-6" delay={0.3} />

      {/* o vidro se rompe */}
      <g data-scene-risk data-risk-delay="0.34">
        <rect x="330" y="222" width="52" height="44" rx="4" fill={`${INK.ink}`} />
        <path
          d="M330 222l26 22 26-22M330 266l26-22 26 22M344 222l12 22-12 22"
          fill="none"
          stroke="rgb(var(--brand-2) / .7)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* água empoçando no caminho */}
      <g data-scene-risk data-risk-delay="0.38">
        <ellipse cx="290" cy="356" rx="62" ry="12" fill="rgb(var(--brand) / .22)" />
        <ellipse cx="290" cy="356" rx="62" ry="12" {...accentStroke(1.2, 0.4)} />
      </g>

      {/* ===================================================== a proteção == */}
      <g data-scene-shield>
        <path
          {...accentStroke(1.8, 0.4)}
          strokeDasharray="7 9"
          d="M64 330c0-118 96-214 216-214s216 96 216 214"
        />
        <path
          d="M64 330c0-118 96-214 216-214s216 96 216 214"
          fill="none"
          stroke="rgb(var(--brand-2) / .16)"
          strokeWidth="14"
          filter={`url(#${ID}-haze)`}
        />
      </g>
      <ShieldSeal id={ID} x={432} y={244} size={92} />
    </Scene>
  );
}

export default HomeScene;
