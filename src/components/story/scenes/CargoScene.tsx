import {
  Air,
  Contact,
  Fracture,
  Ground,
  INK,
  Scene,
  ShieldSeal,
  Smoke,
  Wheel,
  accent,
  accentStroke,
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

/**
 * Capítulo 04 — Carga.
 *
 * Leitura da imagem, do fundo para a frente:
 *  · plano distante — a rota traçada no ar em ciano, do ponto de embarque
 *    (esquerda) ao ponto de entrega (direita), e um pátio de contêineres que
 *    some no horizonte;
 *  · plano intermediário — o conjunto cavalo mecânico + carreta com contêiner,
 *    de lado, com teto claro, lateral em volume e a tampa traseira na sombra,
 *    lacrada;
 *  · primeiro plano — os volumes empilhados no pátio de destino.
 *
 * No imprevisto a rota é cortada e um desvio sai dela, o lacre rompe e a porta
 * escancara o vão vazio do baú, o baú trinca, um volume tomba no chão e outro
 * simplesmente deixa de existir: sobra a silhueta tracejada — o buraco onde a
 * carga estava. Esse buraco é o assunto do capítulo.
 */
export function CargoScene() {
  return (
    <Scene id={ID}>
      <Air id={ID} />
      <Ground id={ID} />

      {/* ============================================== plano distante ==== */}

      {/* pátio de embarque: contêineres que já são só silhueta */}
      <g data-scene-fill>
        <path {...mass('far')} d="M0 296h44v34H0Z" />
        <path {...mass('far')} d="M6 280h30v16H6Z" />
        <path {...mass('air')} d="M0 268h22v12H0Z" />
      </g>

      {/* a rota: o percurso contratado, do embarque à entrega */}
      <g data-scene-draw>
        <path
          {...accentStroke(2.4, 0.9)}
          strokeDasharray="12 9"
          d="M52 122C118 70 196 92 276 96c74 6 132 20 224 -24"
          filter={`url(#${ID}-glow)`}
        />
        <path {...detail(0.2, 1.1)} strokeDasharray="3 7" d="M52 132v18M500 82v18" />
        <circle {...accentStroke(1.6, 0.5)} cx="52" cy="122" r="11" />
        <circle {...accentStroke(1.6, 0.5)} cx="500" cy="72" r="11" />
      </g>
      <g data-scene-fill>
        <circle {...accent(0.9)} cx="52" cy="122" r="5" />
        <circle {...accent(0.9)} cx="500" cy="72" r="5" />
      </g>

      {/* =============================== plano intermediário: o conjunto === */}

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
        {/* faixa refletiva rasa */}
        <path {...accentStroke(2.6, 0.2)} d="M78 268H292" />
      </g>

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
        {/* espelho, lanterna e para-choque */}
        <path {...mass('near')} d="M396 212h6v14h-6Z" />
        <path {...accent(0.7)} d="M391 252h7v11h-7Z" />
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

      {/* fumaça do escapamento: movimento próprio, independente do scroll */}
      <Smoke id={ID} x={304} y={174} scale={0.55} />

      {/* ================================ primeiro plano: o pátio de destino */}

      <Contact id={ID} x={486} y={330} rx={68} ry={11} />

      {/* um grupo por volume: eles se empilham em sequência na construção */}
      <g data-scene-fill>
        <Crate x={438} y={288} w={44} h={42} />
      </g>
      <g data-scene-fill>
        <Crate x={502} y={288} w={44} h={42} />
      </g>
      <g data-scene-fill>
        <Crate x={442} y={246} w={44} h={42} />
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 1. a rota é cortada no meio do percurso.
             O vão é aberto por um traço que segue a MESMA curva da rota, e não
             por um retângulo: o que se apaga é a linha, não um pedaço do fundo. */}
      <g data-scene-risk data-risk-delay="0">
        <path
          d="M300 98c14 1 30 2 46 4"
          fill="none"
          stroke="rgb(var(--panel) / .95)"
          strokeWidth="9"
          strokeLinecap="butt"
        />
        <path {...outline(2.4, 0.44)} d="M298 90l7 17M348 93l7 17" />
        <path {...detail(0.2, 1.2)} strokeDasharray="3 6" d="M304 98c12 1 26 2 38 3" />
      </g>

      {/* 2. o desvio de rota: o percurso que ninguém contratou */}
      <g data-scene-risk data-risk-delay="0.08">
        <path
          d="M296 97c28 10 36 30 30 50"
          fill="none"
          stroke={`${INK.near}`}
          strokeWidth="2.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M319 138l7 10 9 -7"
          fill="none"
          stroke={`${INK.near}`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path {...detail(0.24, 1.4)} strokeDasharray="4 6" d="M328 152c6 8 6 14 4 20" />
      </g>

      {/* 3. o lacre rompe e a porta escancara o vão do baú */}
      <g data-scene-risk data-risk-delay="0.16">
        {/* o interior exposto */}
        <path d="M72 178L46 160V262L72 280Z" fill={`${INK.ink}`} opacity=".92" />
        {/* a porta aberta para fora */}
        <path {...sideFace(ID)} d="M46 160L22 172V272L46 262Z" />
        <path {...outline(1.5, 0.34)} d="M46 160L22 172V272L46 262Z" />
        <path {...detail(0.24)} d="M34 168V266" />
        {/* o lacre partido: as duas metades já não se encontram */}
        <path {...accentStroke(2.4, 0.95)} d="M55 254a6 6 0 01-1 -12" />
        <path {...accentStroke(2.4, 0.95)} d="M65 238a6 6 0 011 12" />
        <circle {...accent(0.8)} cx="47" cy="260" r="2.2" />
        <circle {...accent(0.6)} cx="72" cy="232" r="1.7" />
      </g>

      {/* 4. o baú trinca sob a carga que se deslocou */}
      <Fracture d="M150 186l15 26-11 18 16 22-8 14" delay={0.24} />
      <Fracture d="M165 212l26-8" delay={0.28} />

      {/* 5. um volume tomba — em primeiro plano, onde não há como não ver */}
      <g data-scene-risk data-risk-delay="0.34">
        <ellipse cx="296" cy="388" rx="52" ry="9" fill={`url(#${ID}-contact)`} />
        <g transform="translate(300 380) rotate(-13)">
          <Crate x={-34} y={-44} w={64} h={44} dx={-20} dy={-14} />
        </g>
        <ellipse cx="368" cy="377" rx="26" ry="6" fill={`url(#${ID}-contact)`} />
        <g transform="translate(365 376) rotate(9)">
          <Crate x={-13} y={-24} w={26} h={24} dx={-9} dy={-7} />
        </g>
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
          d="M426 234H470L486 246V288H442L426 276Z"
          fill="none"
          stroke="rgb(var(--brand-2) / .6)"
          strokeWidth="1.8"
          strokeDasharray="7 6"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
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

      {/* ===================================================== a proteção == */}
      <ShieldSeal id={ID} x={438} y={104} size={92} />
    </Scene>
  );
}

export default CargoScene;
