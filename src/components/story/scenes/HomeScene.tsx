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
} from '../sceneParts';

const ID = 'sc-home';

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
              d={`M${xyLocal(300 + i * 13)} ${xyLocal(128 + i * 9)}L${xyLocal(414 + i * 13)} ${xyLocal(
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
      <g data-scene-fill data-depth="0.6">
        <rect {...glass(ID)} x="198" y="222" width="52" height="44" rx="4" />
        <rect {...glass(ID)} x="330" y="222" width="52" height="44" rx="4" />
        <rect {...glass(ID)} x="272" y="152" width="36" height="30" rx="4" />
        {/* halo em volta de cada janela */}
        <g filter={`url(#${ID}-haze)`} opacity=".9">
          <rect x="192" y="216" width="64" height="56" fill="rgb(var(--brand-2) / .22)" />
          <rect x="324" y="216" width="64" height="56" fill="rgb(var(--brand-2) / .22)" />
          <rect x="268" y="148" width="44" height="38" fill="rgb(var(--brand-2) / .16)" />
        </g>
        {/* porta */}
        <path {...mass('deep')} d="M264 330v-64a26 26 0 0152 0v64Z" />
      </g>

      {/* cones de luz saindo das janelas e mancha no chão */}
      <g data-depth="0.6">
        <LightCone x={224} y={266} length={70} spread={30} angle={96} opacity={0.2} />
        <LightCone x={356} y={266} length={70} spread={30} angle={84} opacity={0.2} />
        <ellipse cx="224" cy="332" rx="46" ry="9" fill="rgb(var(--brand-2) / .18)" />
        <ellipse cx="356" cy="332" rx="46" ry="9" fill="rgb(var(--brand-2) / .18)" />
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

      {/* 1 — a descarga elétrica cai na chaminé */}
      <g data-scene-risk data-risk-delay="0.08">
        <Bolt id={ID} d="M336 44l-30 76h28l-20 58 54-82h-30l22-52z" />
      </g>

      {/* 2 — o curto no quadro de energia */}
      <g data-scene-risk data-risk-delay="0.14">
        <Sparks x={208} y={298} count={10} radius={22} tone="brand" />
      </g>

      {/* 3 — o fogo toma o telhado */}
      <g data-scene-risk data-risk-delay="0.2">
        {/* rombo aberto no telhado, com a brasa por dentro */}
        <path {...mass('void')} d="M300 150l34 8 22 26-30 12-32-20Z" />
        <path {...alert(0.55)} d="M308 156l22 6 14 16-20 8-20-14Z" />
        <Smoke id={ID} x={324} y={126} scale={1.35} />
        <Smoke id={ID} x={352} y={140} scale={0.9} />
        <Flame id={ID} x={322} y={178} scale={1.15} />
        <Flame id={ID} x={350} y={188} scale={0.78} />
        <Flame id={ID} x={300} y={182} scale={0.6} />
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

      {/* 4 — a parede trinca */}
      <Fracture d="M176 238l24 26-16 22 22 26-12 18" delay={0.26} />
      <Fracture d="M200 264l26-6" delay={0.3} />

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

      {/* 6 — a água empoça no caminho e reflete o fogo */}
      <g data-scene-risk data-risk-delay="0.38">
        <ellipse cx="290" cy="356" rx="68" ry="13" fill="rgb(var(--brand) / .26)" />
        <ellipse cx="304" cy="356" rx="22" ry="5" fill="rgb(var(--alert) / .35)" />
        <ellipse cx="290" cy="356" rx="68" ry="13" {...accentStroke(1.2, 0.4)} />
      </g>

      {/* ===================================================== a proteção == */}
      <g data-scene-shield>
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
      </g>
      <ShieldSeal id={ID} x={432} y={244} size={92} />
    </Scene>
  );
}

/* Arredondamento local: as ripas do telhado vêm de uma conta com índice, e
   qualquer número que vá para o HTML precisa render a mesma string no servidor
   e no navegador. Ver `xy()` em sceneParts. */
function xyLocal(v: number) {
  return v.toFixed(2);
}

export default HomeScene;
