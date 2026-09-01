import type { CSSProperties, ReactNode } from 'react';

import {
  Air,
  Contact,
  Ground,
  INK,
  LightCone,
  Scene,
  ShieldSeal,
  accentStroke,
  detail,
  mass,
  outline,
  sideFace,
  topFace,
  volume,
  xy,
} from '../sceneParts';

const ID = 'sc-life';

/* ========================================================================== */
/* ATOR QUE CRESCE                                                            */
/* ========================================================================== */
/**
 * O orquestrador só sabe levar um ator PARA um valor — no beat de risco e no de
 * proteção não existe "de onde". Para uma peça que precisa NASCER curta e
 * crescer, o truque é desenhá-la no tamanho final e encolhê-la num grupo
 * interno ESTÁTICO: o ator de fora cresce de 1 até `fator` e devolve a peça ao
 * tamanho desenhado.
 *
 * `px`/`py` é o ponto que fica PARADO — aqui, o ponto onde o fio encosta na
 * janela: é de lá que a renda volta a correr para dentro da casa.
 */
function Cresce({
  fator,
  px,
  py,
  origin,
  when = 'shield',
  dur = 0.5,
  ease = 'power2.out',
  children,
}: {
  fator: number;
  px: number;
  py: number;
  origin: string;
  when?: 'risk' | 'shield';
  dur?: number;
  ease?: string;
  children: ReactNode;
}) {
  return (
    <g
      data-move-when={when}
      data-move-scale={fator}
      data-move-origin={origin}
      data-move-dur={dur}
      data-move-ease={ease}
    >
      {/* `xy()` porque o fator vem de uma divisão: servidor e navegador têm de
          escrever exatamente a mesma string. */}
      <g transform={`translate(${px} ${py}) scale(${xy(1 / fator)}) translate(${-px} ${-py})`}>
        {children}
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* ABERTURA ACESA                                                             */
/* -------------------------------------------------------------------------- */
/**
 * Vão iluminado — porta ou janela.
 *
 * POR QUE NÃO USA `glass()` DO KIT: o gradiente de vidro termina em `INK.deep`,
 * que é ESCURO nos dois temas. Com ele, o vão ficava mais escuro que as
 * silhuetas na metade de baixo e o contraluz se desfazia — era o defeito
 * principal da versão anterior. Aqui o vão é construído em duas camadas:
 *
 *   1. `INK.lift`, o único degrau da escala que é SEMPRE claro (branco no tema
 *      claro, quase branco no escuro);
 *   2. um véu ciano por cima, que dá temperatura sem derrubar a luminância.
 *
 * Medido no pixel renderizado (não estimado): o vão da porta fica em L = 0,70
 * no tema claro e L = 0,55 no escuro; as janelas em 0,76 e 0,58. As silhuetas
 * (`INK.void`) ficam em 0,14 e 0,0003. Ou seja, contraste de 4,0:1 a 4,3:1 no
 * claro e de 12:1 a 13:1 no escuro — a ordem "vão mais claro que a silhueta"
 * vale nos DOIS temas, por construção, e com margem.
 *
 * O véu ciano é de apenas .17 justamente por isso: com .26 a leitura ficava mais
 * bonita mas o vão caía para 3,4:1 no tema claro.
 */
const VAO_BASE = { fill: INK.lift } as const;
const VAO_LUZ = { fill: 'rgb(var(--brand-2) / .17)' } as const;

/**
 * Janela acesa: o vidro, o halo que escapa e a mancha que ela joga no chão.
 * Ficam na mesma peça porque uma janela que acende sem derramar luz não acende.
 */
function Janela({
  x,
  y,
  w,
  h,
  pool = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  pool?: boolean;
}) {
  return (
    <>
      <rect {...VAO_BASE} x={x} y={y} width={w} height={h} rx={4} />
      <rect {...VAO_LUZ} x={x} y={y} width={w} height={h} rx={4} />
      <g filter={`url(#${ID}-haze)`} opacity=".9">
        <rect
          x={x - 9}
          y={y - 9}
          width={w + 18}
          height={h + 18}
          fill="rgb(var(--brand-2) / .18)"
        />
      </g>
      {pool && (
        <ellipse
          cx={xy(x + w / 2)}
          cy="334"
          rx="46"
          ry="9"
          fill="rgb(var(--brand-2) / .13)"
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* SILHUETA HUMANA                                                            */
/* -------------------------------------------------------------------------- */

const TORSO = 'M-19 -52C-19 -76 -12 -90 0 -90C12 -90 19 -76 19 -52L16 -32H-16Z';

/**
 * Figura em CONTRALUZ: cabeça e tronco são formas chapadas, membros são traços
 * grossos de ponta arredondada.
 *
 * A massa é `INK.void`, e isso é o coração da correção de legibilidade: `void`
 * é o único degrau da escala que é SEMPRE mais escuro que a página. Com
 * `volume()` (o gradiente de fachada que a versão anterior usava) a silhueta
 * ficava entre 153 e 199 no tema claro e entre 50 e 89 no escuro — quase o mesmo
 * tom do vão e da parede atrás dela, e as figuras desapareciam. Com `void` a
 * silhueta é o objeto mais escuro da cena nos dois temas.
 *
 * O contorno usa `--fg`, que INVERTE com o tema: linha escura sobre papel no
 * tema claro, fio branco no escuro. É a segunda linha de defesa do recorte.
 *
 * A origem local é o CHÃO, no centro do corpo: `translate(x, y)` põe os pés
 * exatamente onde a figura toca a superfície, e `scale` muda a idade.
 *
 *   `solid`  a pessoa. Com `rim`, ganha um fio de luz ciano no contorno — é o
 *            que separa o provedor das outras duas silhuetas SEM depender de
 *            tom, e por isso funciona nos dois temas.
 *   `trace`  o vazio que sobra: contorno tracejado e um véu ciano mínimo por
 *            dentro. Não leva massa nenhuma — uma silhueta chapada no lugar da
 *            pessoa leria como mais uma pessoa na cena.
 */
function Figure({
  x,
  y,
  scale = 1,
  reach,
  variant = 'solid',
  rim = false,
}: {
  x: number;
  y: number;
  scale?: number;
  /** Braço esticado para o lado indicado — as mãos dadas da cena. */
  reach?: 'left' | 'right' | 'both';
  variant?: 'solid' | 'trace';
  rim?: boolean;
}) {
  const armL = reach === 'left' || reach === 'both';
  const armR = reach === 'right' || reach === 'both';

  const legL = 'M-8 -36V-4';
  const legR = 'M8 -36V-4';
  const armLd = armL ? 'M-17 -74L-30 -44' : 'M-17 -74L-22 -42';
  const armRd = armR ? 'M17 -74L30 -44' : 'M17 -74L22 -42';

  if (variant === 'trace') {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d={TORSO} fill="rgb(var(--brand-2) / .1)" />
        <circle cx="0" cy="-104" r="13.5" fill="rgb(var(--brand-2) / .1)" />
        <path {...accentStroke(1.8, 0.9)} strokeDasharray="5 5" d={TORSO} />
        <circle {...accentStroke(1.8, 0.9)} strokeDasharray="5 5" cx="0" cy="-104" r="13.5" />
        <path
          {...accentStroke(1.6, 0.7)}
          strokeDasharray="4 6"
          d={`${legL}${legR}${armLd}${armRd}`}
        />
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[legL, legR].map((d) => (
        <path key={d} d={d} stroke={INK.void} strokeWidth="13" strokeLinecap="round" fill="none" />
      ))}
      {[armLd, armRd].map((d) => (
        <path key={d} d={d} stroke={INK.void} strokeWidth="10" strokeLinecap="round" fill="none" />
      ))}
      <path {...mass('void')} d={TORSO} />
      <circle {...mass('void')} cx="0" cy="-104" r="13.5" />

      <g data-scene-draw>
        <path {...outline(2, 0.42)} d={TORSO} />
        <circle {...outline(2, 0.42)} cx="0" cy="-104" r="13.5" />
      </g>

      {rim && (
        <>
          <path {...accentStroke(2.4, 0.95)} d={TORSO} />
          <circle {...accentStroke(2.4, 0.95)} cx="0" cy="-104" r="13.5" />
          <path {...accentStroke(1.8, 0.7)} d={`${armLd}${armRd}${legL}${legR}`} />
        </>
      )}
    </g>
  );
}

/**
 * A MALETA — o sinal mais direto e mais barato de "esta pessoa trabalha".
 * Pende da mão que sobra do provedor e, no imprevisto, cai no chão: é o detalhe
 * que dói, e o único objeto da cena que continua lá depois.
 */
function Maleta({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path {...mass('void')} d={`M${x - 13} ${y + 2}h26v21h-26Z`} />
      <path {...accentStroke(1.5, 0.6)} d={`M${x - 6} ${y + 2}a6 5 0 0112 0`} />
      <path {...outline(1.2, 0.42)} d={`M${x - 13} ${y + 2}h26v21h-26Z`} />
      <path {...detail(0.32)} d={`M${x - 13} ${y + 10}h26`} />
    </g>
  );
}

/**
 * Sombra projetada pela luz da porta: as figuras estão em contraluz, então a
 * sombra sai dos pés na direção do observador e se abre.
 *
 * Cor: `INK.void` — o único degrau da escala que é SEMPRE mais escuro que a
 * página. Com um tom baseado em `--fg`, no tema escuro a sombra vira um risco
 * claro no chão, exatamente o oposto do que ela é.
 */
function CastShadow({
  x,
  y = 330,
  spread = 20,
  length = 50,
}: {
  x: number;
  y?: number;
  spread?: number;
  length?: number;
}) {
  const half = spread / 2;
  return (
    <path
      d={`M${x - half} ${y}H${x + half}L${x + half + 14} ${y + length}H${x - half - 14}Z`}
      fill={INK.void}
      opacity=".2"
    />
  );
}

/* -------------------------------------------------------------------------- */
/* GEOMETRIA DA CENA                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A CASA. Mesma linguagem de fachada do capítulo 02 (`HomeScene`), e por um
 * motivo concreto: a versão anterior era um bloco retangular com beiral pesado
 * e um vão de 188×116 — proporção de portão — e lia como garagem ou bunker.
 *
 * O que faz ler como CASA, na ordem em que o olho decide:
 *   · empena visível: a fachada não termina numa aresta reta, termina num
 *     triângulo com o cume em (288, 100);
 *   · água de telhado em perspectiva à direita, com ripado, e parede lateral na
 *     sombra — a casa tem volume, não é um cartão;
 *   · porta de 66×109 (proporção 1:1,65) com arco, no meio da fachada;
 *   · duas janelas acesas flanqueando a porta, na mesma altura, e uma janela de
 *     desvão na empena;
 *   · chaminé apoiada na água de telhado, quebrando a linha do cume.
 */
const APEX = { x: 288, y: 100 };
const WALL = { x0: 136, x1: 440, y0: 174 };

/** Porta: 66 de largura por 109 de altura, arco de raio 33 no topo. */
const DOOR = 'M254 330v-76a33 33 0 0166 0v76Z';
/** Mesmo perfil sem o fechamento embaixo: contorno não fecha na soleira. */
const DOOR_LINE = 'M254 330v-76a33 33 0 0166 0v76';

/** As duas janelas acesas, simétricas em relação ao eixo da porta (287). */
const JAN_E = { x: 176, y: 222, w: 52, h: 46 };
const JAN_D = { x: 346, y: 222, w: 52, h: 46 };

/**
 * A família. O PROVEDOR é o eixo da leitura e por isso é o único que muda de
 * tamanho, de altura e de camada:
 *
 *   · é o MAIOR (1,04 contra 0,92 do outro adulto);
 *   · está À FRENTE — os pés em 348, na base do degrau, contra 330/332 dos
 *     outros, que estão na soleira;
 *   · está no MEIO, no vão da porta, com a família encostada de um lado e de
 *     outro — e cada um dos três tem uma abertura acesa atrás de si, que é o que
 *     faz as três silhuetas se destacarem;
 *   · é o único que chega DE FORA do quadro na construção;
 *   · é o único com maleta na mão, fio de renda saindo do ombro e luz ciano no
 *     contorno.
 */
const PROVEDOR = { x: 288, y: 348, scale: 1.04 };
const CRIANCA = { x: 202, y: 330, scale: 0.72 };
const ADULTO = { x: 372, y: 332, scale: 0.92 };

/** Mão que sobra do provedor: é dali que a maleta pende. */
const MALETA = { x: 313, y: 304 };

/**
 * O FIO DA RENDA — a peça mais importante da cena.
 *
 * Percurso: ombro esquerdo do provedor (270, 271) → aresta da janela acesa da
 * esquerda (229, 235). É isso e nada mais: 50px de arco, uma curva só, DENTRO
 * do mesmo pedaço de quadro onde estão a pessoa e a janela.
 *
 * A versão anterior subia pela fachada, virava sob o beiral e descia até o vão
 * da porta: 250px, três dobras, traço de 5px opaco. Lia como mangueira. A
 * correção tem três partes:
 *   1. PERCURSO curto e direto, do provedor até a janela — não do telhado;
 *   2. ESPESSURA: núcleo de 1,4px (era 5), sobre um brilho de 3,2 e um halo
 *      difuso de 8 — o peso está na LUZ em volta, não no traço;
 *   3. GLOW real (`-glow` no núcleo, `-soft` no halo) e um ponto de luz
 *      correndo, para que o olho leia energia e não tubo.
 *
 * Sobre a ANCORAGEM: no imprevisto, o fio inteiro se recolhe para a ponta da
 * JANELA (nunca para a ponta do provedor, que deixa de existir) e o que fica no
 * lugar é um rabicho partido pendurado na própria janela — um ponto que
 * continua na cena. Nada de traço começando no nada.
 */
const FIO = 'M270 271C259 264 243 252 229 235';
/** Ponta do fio na casa: o ponto parado do recolhimento e da religação. */
const FIO_CASA = { x: 229, y: 235 };
/** Ponta do fio no provedor: o nó de onde a renda sai. */
const FIO_OMBRO = { x: 270, y: 271 };
/** O rabicho partido que sobra pendurado na janela depois da ruptura. */
const RABICHO = 'M229 235C234 241 235 249 232 257';

/** Quanto a família se fecha em volta do vazio no beat de proteção. */
const REAPROXIMA = 24;

/**
 * Poeira suspensa nos fachos da porta. Posições literais, sem conta nenhuma: é
 * a forma mais barata de garantir que servidor e navegador escrevam o mesmo
 * HTML.
 */
const MOTES = [
  { x: 240, y: 280, r: 2.3, dur: 5.2, delay: 0 },
  { x: 220, y: 310, r: 1.8, dur: 6.4, delay: 1.1 },
  { x: 336, y: 278, r: 2.2, dur: 6, delay: 0.4 },
  { x: 352, y: 308, r: 1.9, dur: 6.8, delay: 2.6 },
];

/** Ripado da água de telhado — duas linhas paralelas ao cume. */
const RIPADO = [
  'M303 106L455 180',
  'M317 112L469 186',
];

/**
 * Capítulo 01 — Vida.
 *
 * A pergunta que a cena tem de responder ANTES do imprevisto é "quem sustenta
 * esta casa?". Ela responde com quatro sinais somados, nenhum deles em texto:
 * escala e posição (o maior, à frente, no meio da porta), a maleta na mão, o
 * fio de renda que sai dele e alimenta a janela, e a família presa a ele — a
 * criança de mão dada, o outro adulto encostado, os dois inclinados na direção
 * dele.
 *
 * Camadas, do fundo para a frente:
 *   0,12  a rua: telhado do vizinho, árvore, arbusto — o bairro existe;
 *   0,50  a casa: parede lateral, fachada, empena, água de telhado, beiral,
 *         chaminé, janela do desvão;
 *   0,60  as três aberturas acesas, os fachos da porta e a poeira;
 *   0,80  a criança e o outro adulto, cada um contra a sua janela;
 *   0,95  o primeiro plano vivido: degrau, capacho, vaso, bola;
 *   0,90  a mancha de luz no chão e as sombras projetadas;
 *   0,92  o provedor — a camada mais próxima do observador, na frente do
 *         degrau, com a sombra dele no mesmo grupo (é o que faz a sombra sair
 *         de cena junto com ele);
 *   —     o fio da renda, por cima de tudo o que ele atravessa.
 *
 * -----------------------------------------------------------------------------
 * O CASO ACONTECE NA TELA (atores, ver `data-move-*` em StoryScroll.tsx)
 * -----------------------------------------------------------------------------
 *   construção  o provedor CHEGA de fora do quadro, com a maleta na mão; a
 *               criança e o outro adulto sobem da soleira; o fio da renda
 *               NASCE no ombro dele e corre até a janela, com um ponto de luz
 *               percorrendo o trajeto;
 *   imprevisto  o fio se ROMPE: a luz se recolhe para a ponta da janela e
 *               apaga, e sobra um rabicho partido pendurado ali, faiscando; o
 *               provedor SE AFASTA e diminui até desaparecer, levando consigo a
 *               sombra que projetava, e no lugar dele fica só o contorno
 *               tracejado; a maleta CAI no chão; a mão da criança fica
 *               estendida no vazio; as janelas e a porta apagam, a mancha de
 *               luz encolhe e as contas começam a acumular na soleira;
 *   proteção    o fio é RECONECTADO da janela até o ombro que já não está lá —
 *               em tracejado, não igual ao original: a renda continua, a pessoa
 *               não voltou; a família se fecha em volta do vazio e as duas mãos
 *               se encontram na frente dele.
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
        <rect {...mass('far')} x="516" y="252" width="9" height="78" rx="4" />
        <circle {...mass('air')} cx="520" cy="242" r="32" />
        {/* arbusto rente à casa */}
        <circle {...mass('far')} cx="502" cy="318" r="20" />
      </g>

      {/* ========================================= a casa (depth .5) ====== */}
      {/* Fachada, empena, telhado e detalhes num único `data-scene-fill`. Não é
          arrumação: a materialização das massas é escalonada em ordem de DOM, e
          cada grupo a mais empurra as últimas peças da cena (o provedor, o fio)
          para depois do fim do beat de construção. */}
      <g data-scene-fill data-depth="0.5">
        {/* parede lateral, na sombra */}
        <path {...sideFace(ID)} d={`M${WALL.x1} ${WALL.y0}l44 18v138h-44Z`} />
        {/* pano de fachada */}
        <path {...volume(ID)} d={`M${WALL.x0} ${WALL.y0}h304v156H${WALL.x0}Z`} />
        {/* EMPENA: o triângulo que transforma o bloco em casa */}
        <path {...volume(ID)} d={`M${WALL.x0} ${WALL.y0}L${APEX.x} ${APEX.y}L${WALL.x1} ${WALL.y0}Z`} />
        {/* água de telhado à direita, em perspectiva */}
        <path {...topFace(ID)} d={`M${APEX.x} ${APEX.y}l44 18 152 74-44-18Z`} />
        <g opacity=".5">
          {RIPADO.map((d) => (
            <path key={d} {...detail(0.14, 1)} d={d} />
          ))}
        </g>
        {/* beiral: fita fina, virando a quina com a parede lateral */}
        <path {...mass('near')} d="M124 174h330l-6 10H130Z" />
        {/* chaminé apoiada na água de telhado */}
        <path {...mass('deep')} d="M356 128h26v46l-26-14Z" />
        <path {...mass('near')} d="M353 122h32v9h-32Z" />
        {/* janela do desvão: apagada, só forma — a casa tem um andar de cima */}
        <rect {...mass('void')} x="270" y="124" width="36" height="30" rx="3" />
        {/* medidor de energia: por onde a casa consome */}
        <rect {...mass('near')} x="410" y="250" width="24" height="30" rx="4" />
      </g>

      <g data-scene-draw data-depth="0.5">
        <path {...outline(1.6, 0.36)} d="M136 330V174L288 100l152 74v156" />
        <path {...outline(1.4, 0.3)} d="M440 174l44 18v138M288 100l44 18 152 74" />
        <path {...detail(0.22)} d="M124 174h330M356 128h26" />
        <rect {...outline(1.3, 0.28)} x="270" y="124" width="36" height="30" rx="3" />
        <path {...detail(0.24)} d="M288 124v30M270 139h36" />
        <rect {...outline(1.3, 0.3)} x="410" y="250" width="24" height="30" rx="4" />
        <path {...accentStroke(1.6, 0.8)} d="M423 256l-6 11h11l-6 11" />
      </g>

      {/* ========================= as aberturas acesas (depth .6) ========= */}
      {/* Três fontes de luz, uma atrás de cada silhueta. É a correção estrutural
          do contraluz: com uma porta só, a criança e o outro adulto ficavam
          contra a parede e desapareciam. Aqui cada figura tem um vão claro
          imediatamente atrás dela, nos dois temas. */}
      <g data-scene-fill data-depth="0.6">
        <path {...VAO_BASE} d={DOOR} />
        <path {...VAO_LUZ} d={DOOR} />
        {/* halo: a luz que escapa pela porta */}
        <path d={DOOR} fill="rgb(var(--brand-2) / .18)" filter={`url(#${ID}-haze)`} />
        {/* o foco de luz lá dentro, no alto do arco */}
        <ellipse
          cx="287"
          cy="240"
          rx="22"
          ry="17"
          fill="rgb(var(--brand-2) / .26)"
          filter={`url(#${ID}-haze)`}
        />
        <Janela {...JAN_E} />
        <Janela {...JAN_D} />
      </g>

      <g data-scene-draw data-depth="0.6">
        <path {...outline(1.6, 0.34)} d={DOOR_LINE} />
        <rect {...outline(1.4, 0.32)} x={JAN_E.x} y={JAN_E.y} width={JAN_E.w} height={JAN_E.h} rx="4" />
        <rect {...outline(1.4, 0.32)} x={JAN_D.x} y={JAN_D.y} width={JAN_D.w} height={JAN_D.h} rx="4" />
        <path {...detail(0.26)} d="M202 222v46M176 245h52M372 222v46M346 245h52" />
      </g>

      {/* ATORES — os fachos que escapam pelas laterais da porta. No imprevisto
          cada um encolhe PARA O SEU ÁPICE (a origem aponta para o canto onde
          ele nasce, junto ao vão) e na proteção volta a abrir: é o gesto que
          faz a luz "se fechar" em vez de simplesmente escurecer. */}
      <g data-scene-fill data-depth="0.6">
        <g
          data-move-when="risk"
          data-move-scale="0.3"
          data-move-origin="100% 0%"
          data-move-dur="0.26"
          data-move-ease="power2.inOut"
        >
          <g
            data-move-when="shield"
            data-move-scale="3.2"
            data-move-origin="100% 0%"
            data-move-dur="0.48"
            data-move-ease="power2.out"
          >
            <LightCone x={260} y={250} length={94} spread={24} angle={124} opacity={0.16} />
          </g>
        </g>
        <g
          data-move-when="risk"
          data-move-scale="0.3"
          data-move-origin="0% 0%"
          data-move-dur="0.26"
          data-move-ease="power2.inOut"
        >
          <g
            data-move-when="shield"
            data-move-scale="3.2"
            data-move-origin="0% 0%"
            data-move-dur="0.48"
            data-move-ease="power2.out"
          >
            <LightCone x={314} y={250} length={94} spread={24} angle={56} opacity={0.16} />
          </g>
        </g>
        {MOTES.map((m) => (
          <circle
            key={`${m.x}-${m.y}`}
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

      {/* ====================================== a família (depth .8) ======= */}
      {/* O parallax mora no grupo de FORA e os atores em grupos de dentro: as
          duas coisas escrevem `transform`, e no mesmo elemento uma anularia a
          outra.

          A criança e o outro adulto sobem DA SOLEIRA na construção — o
          contraste com o provedor, que chega de fora, é metade do que conta
          quem sustenta a casa. Os dois estão inclinados na direção dele. */}
      <g data-scene-fill data-depth="0.8">
        {/* ATOR — a criança. Cabeça e ombros contra a janela da esquerda; na
            proteção, dá um passo para o meio e fecha o vazio pela esquerda. */}
        <g
          data-move-when="build"
          data-move-y="30"
          data-move-scale="0.66"
          data-move-origin="50% 100%"
          data-move-dur="1.3"
          data-move-ease="power1.out"
        >
          <g
            data-move-when="shield"
            data-move-x={REAPROXIMA}
            data-move-dur="0.45"
            data-move-ease="power2.inOut"
          >
            <g transform={`rotate(5 ${CRIANCA.x} ${CRIANCA.y})`}>
              <Figure {...CRIANCA} reach="right" />
            </g>
          </g>
        </g>

        {/* ATOR — o outro adulto, contra a janela da direita. Na proteção fecha
            o vazio pelo lado direito. */}
        <g
          data-move-when="build"
          data-move-y="26"
          data-move-scale="0.74"
          data-move-origin="50% 100%"
          data-move-dur="1.5"
          data-move-ease="power1.out"
        >
          <g
            data-move-when="shield"
            data-move-x={-REAPROXIMA}
            data-move-dur="0.45"
            data-move-ease="power2.inOut"
          >
            <g transform={`rotate(-5 ${ADULTO.x} ${ADULTO.y})`}>
              <Figure {...ADULTO} />
            </g>
          </g>
        </g>

        {/* A mão da criança. Fica FORA do grupo do provedor de propósito: é a
            mão que sobra estendida no vazio quando ele sai de cena. */}
        <g
          data-move-when="shield"
          data-move-x={REAPROXIMA}
          data-move-dur="0.45"
          data-move-ease="power2.inOut"
        >
          <circle cx="226" cy="298" r="3.6" fill="rgb(var(--brand-2) / .95)" />
        </g>
      </g>

      <Contact id={ID} x={287} y={330} rx={142} ry={11} opacity={0.8} />

      {/* ======================================= primeiro plano (depth .95) */}
      <g data-scene-fill data-depth="0.95">
        {/* degrau da entrada */}
        <path {...mass('near')} d="M236 330h102l16 18H220Z" />
        <path {...mass('deep')} d="M220 348h134v9H220Z" />
        {/* capacho */}
        <path d="M262 332h50l6 12h-62Z" fill={INK.deep} opacity=".55" />
        {/* vaso com planta, à esquerda da janela */}
        <path {...mass('mid')} d="M150 312c-8-14-16-22-26-27c12 1 22 8 26 19Z" />
        <path {...mass('mid')} d="M158 310c1-16 5-27 12-35c-2 13-3 24-6 35Z" />
        <path {...volume(ID)} d="M144 320h28l-4 26h-20Z" />
        <path {...mass('near')} d="M141 315h34v7h-34Z" />
        {/* a bola esquecida no chão */}
        <circle {...mass('near')} cx="462" cy="344" r="11" />
        <path {...accentStroke(1.8, 0.7)} d="M452 341a11 11 0 0121 3" />
        <ellipse cx="462" cy="356" rx="12" ry="3" fill={INK.void} opacity=".22" />
      </g>

      <g data-scene-draw data-depth="0.95">
        <path {...outline(1.4, 0.3)} d="M236 330h102l16 18H220Z" />
        <path {...outline(1.3, 0.28)} d="M144 320h28l-4 26h-20Z" />
        <circle {...outline(1.3, 0.3)} cx="462" cy="344" r="11" />
      </g>

      {/* A luz que a porta joga no chão vem DEPOIS do primeiro plano: ela cai
          sobre o degrau e o capacho, não por baixo deles. As sombras da família
          moram aqui pelo mesmo motivo — são projetadas por essa luz. */}
      <g data-scene-fill data-depth="0.9">
        {/* ATOR — a mancha de luz no chão. Encolhe para a soleira (origem no
            topo, no meio da porta) quando a luz cai, e volta a se derramar na
            proteção. */}
        <g
          data-move-when="risk"
          data-move-scale="0.42"
          data-move-origin="50% 0%"
          data-move-dur="0.26"
          data-move-ease="power2.inOut"
        >
          <g
            data-move-when="shield"
            data-move-scale="2.3"
            data-move-origin="50% 0%"
            data-move-dur="0.48"
            data-move-ease="power2.out"
          >
            <path
              d="M254 330h66l70 44H184Z"
              fill="rgb(var(--brand-2) / .14)"
              filter={`url(#${ID}-soft)`}
            />
            <ellipse cx="287" cy="366" rx="128" ry="19" fill="rgb(var(--brand-2) / .1)" />
          </g>
        </g>

        {/* As sombras da criança e do adulto acompanham o passo que os dois dão
            na proteção — o mesmo `data-move-*`, num grupo separado, porque a
            sombra vive nesta camada e a figura na de cima. */}
        <g
          data-move-when="shield"
          data-move-x={REAPROXIMA}
          data-move-dur="0.45"
          data-move-ease="power2.inOut"
        >
          <CastShadow x={202} spread={16} length={40} />
        </g>
        <g
          data-move-when="shield"
          data-move-x={-REAPROXIMA}
          data-move-dur="0.45"
          data-move-ease="power2.inOut"
        >
          <CastShadow x={372} spread={20} length={48} />
        </g>
      </g>

      {/* ================================= O PROVEDOR (depth .92) ========= */}
      {/* Camada própria, e à FRENTE do degrau: é o que coloca a maior figura da
          cena no plano mais próximo do observador. A sombra projetada dele mora
          NESTE grupo, e não na camada das outras sombras — é assim que ela sai
          do chão junto com ele, sem precisar repetir os atributos de movimento
          em outro lugar. */}
      {/* Sem `data-scene-fill`: ele não materializa, ele CHEGA. A massa da cena
          entra escalonada em ordem de DOM, e esta é a última camada — com fade
          ele só apareceria depois do fim da construção. */}
      <g data-depth="0.92">
        {/* ATOR — chega de fora do quadro, com a maleta na mão. */}
        <g data-move-when="build" data-move-x="150" data-move-dur="1.1" data-move-ease="power1.out">
          {/* ATOR — no imprevisto ele SAI DE CENA: caminha para fora do quadro
              diminuindo, como quem se afasta até deixar de estar ali. Encolher
              a partir dos PÉS (origem 50% 100%) é o que dá a perspectiva de
              afastamento; sair do viewBox é o que garante que não sobre
              resíduo de figura no lugar do vazio. */}
          <g
            data-move-when="risk"
            data-move-x="330"
            data-move-y="-24"
            data-move-scale="0.28"
            data-move-origin="50% 100%"
            data-move-dur="0.26"
            data-move-ease="power2.in"
          >
            <CastShadow x={PROVEDOR.x} y={348} spread={32} length={62} />
            {/* contraluz: ele é a coisa mais iluminada por trás do quadro */}
            <ellipse
              cx={PROVEDOR.x}
              cy="282"
              rx="40"
              ry="64"
              fill="rgb(var(--brand-2) / .22)"
              filter={`url(#${ID}-haze)`}
            />
            <Figure {...PROVEDOR} reach="left" rim />
            {/* a mão dada: o ponto e o elo até a mão da criança saem de cena
                com ele, e é isso que deixa a mão dela apontando para o vazio */}
            <circle cx="257" cy="302" r="3.6" fill="rgb(var(--brand-2) / .95)" />
            <path {...accentStroke(2, 0.7)} d="M255 302L232 300" />
          </g>

          {/* ATOR — a maleta CAI. Fica irmã da figura, e não filha, justamente
              para não sair de cena com ela. */}
          <g
            data-move-when="risk"
            data-move-x="-16"
            data-move-y="20"
            data-move-rot="14"
            data-move-dur="0.22"
            data-move-ease="power2.in"
          >
            <Maleta {...MALETA} />
          </g>
        </g>
      </g>

      {/* ================================== O FIO DA RENDA ================ */}
      {/* Sem `data-depth`: o fio liga uma figura do plano .92 a uma janela do
          plano .5, e qualquer parallax próprio o descolaria de uma das pontas.

          Também não leva `data-scene-fill`: é a última peça do DOM e com fade
          escalonado só chegaria depois do fim da construção. Entra como ator,
          nascendo no ombro do provedor.

          As camadas do fio, de baixo para cima — a soma é o que faz LUZ em vez
          de tubo: cabo escuro finíssimo (para o fio não desaparecer quando
          cruza o vão claro, em qualquer tema), halo difuso, brilho e núcleo de
          1,4px. Nenhuma delas usa `non-scaling-stroke`: o fio precisa AFINAR
          enquanto nasce e enquanto recua, é isso que faz a luz parecer correr e
          depois drenar. */}
      <g>
        <g
          data-move-when="build"
          data-move-scale="0.05"
          data-move-origin="100% 100%"
          data-move-dur="1"
          data-move-ease="power2.out"
        >
          {/* ATOR — no imprevisto a luz se RECOLHE para a ponta da janela: é a
              única das duas pontas que continua existindo depois que ele sai. */}
          <g
            data-move-when="risk"
            data-move-scale="0.03"
            data-move-origin="0% 0%"
            data-move-dur="0.26"
            data-move-ease="power2.inOut"
          >
            <path d={FIO} fill="none" stroke="rgb(var(--fg) / .18)" strokeWidth="2.6" />
            <path
              d={FIO}
              fill="none"
              stroke="rgb(var(--brand-2) / .3)"
              strokeWidth="8"
              strokeLinecap="round"
              filter={`url(#${ID}-soft)`}
            />
            <path
              d={FIO}
              fill="none"
              stroke="rgb(var(--brand-2) / .55)"
              strokeWidth="3.2"
              strokeLinecap="round"
              filter={`url(#${ID}-glow)`}
            />
            <path
              d={FIO}
              fill="none"
              stroke="rgb(var(--brand-2) / .95)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* o ponto de luz que corre do provedor para a janela */}
            <path
              data-scene-live
              d={FIO}
              fill="none"
              stroke="rgb(var(--brand-2) / .95)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="3 24"
              filter={`url(#${ID}-glow)`}
              className="animate-dash-move"
              style={{ animationDuration: '1.15s' } as CSSProperties}
            />
            {/* o nó no ombro dele: ponto parado da entrada */}
            <circle cx={FIO_OMBRO.x} cy={FIO_OMBRO.y} r="3.2" fill="rgb(var(--brand-2) / .95)" />
            <circle
              data-scene-live
              cx={FIO_OMBRO.x}
              cy={FIO_OMBRO.y}
              r="7"
              fill="none"
              stroke="rgb(var(--brand-2) / .7)"
              strokeWidth="1.6"
              className="fill-box animate-pulse-ring"
              style={{ animationDuration: '2.2s' } as CSSProperties}
            />
            {/* onde o fio encosta na casa */}
            <circle cx={FIO_CASA.x} cy={FIO_CASA.y} r="3" fill="rgb(var(--brand-2) / .95)" />
          </g>
        </g>
      </g>

      {/* ==================================================== o imprevisto == */}

      {/* 1 — o RABICHO PARTIDO. Fica pendurado na janela, que é o ponto da cena
             que continua existindo: nenhum traço começa no nada. */}
      <g data-scene-risk data-risk-delay="0.02">
        <path d={RABICHO} fill="none" stroke="rgb(var(--fg) / .2)" strokeWidth="2.6" />
        <path {...accentStroke(1.4, 0.5)} d={RABICHO} />
        <circle cx="229" cy="235" r="2.8" fill="rgb(var(--brand-2) / .55)" />
        <circle
          data-scene-live
          cx="232"
          cy="257"
          r="3.2"
          fill="rgb(var(--brand-2) / .6)"
          className="fill-box animate-flicker"
          style={{ animationDuration: '.9s' } as CSSProperties}
        />
        <path {...accentStroke(1.3, 0.4)} d="M236 259l8 3M234 264l3 7M225 259l-7 4" />
      </g>

      {/* 2 — a casa perde a luz: o vão escurece, as duas janelas apagam, o
             medidor apaga e a mancha do chão é comida pela sombra que fecha em
             volta. (a mancha e os fachos são atores, e já encolheram) */}
      <g data-scene-risk data-risk-delay="0.08">
        <path d={DOOR} fill={INK.void} opacity=".6" />
        <rect x={JAN_E.x} y={JAN_E.y} width={JAN_E.w} height={JAN_E.h} rx="4" fill={INK.void} opacity=".74" />
        <rect x={JAN_D.x} y={JAN_D.y} width={JAN_D.w} height={JAN_D.h} rx="4" fill={INK.void} opacity=".74" />
        <rect x="410" y="250" width="24" height="30" rx="4" fill={INK.void} opacity=".66" />
        <path
          d="M258 248L172 330L232 356Z"
          fill={INK.void}
          opacity=".2"
          filter={`url(#${ID}-soft)`}
        />
        <path
          d="M316 248L404 330L344 356Z"
          fill={INK.void}
          opacity=".2"
          filter={`url(#${ID}-soft)`}
        />
        {/* anel de penumbra: a mancha de luz encolhe de fora para dentro */}
        <path
          fillRule="evenodd"
          d="M287 364m-142 0a142 27 0 10284 0a142 27 0 10-284 0M287 362m-72 0a72 15 0 10144 0a72 15 0 10-144 0"
          fill={INK.void}
          opacity=".3"
          filter={`url(#${ID}-soft)`}
        />
      </g>

      {/* 3 — o VAZIO no lugar do provedor.
             Só contorno tracejado: nenhuma massa, para que não haja como ler
             "mais uma pessoa" ali. A criança fica com a mão apontada para
             dentro desse contorno, sem nada para segurar. */}
      <g data-scene-risk data-risk-delay="0.16">
        <Figure {...PROVEDOR} variant="trace" />
      </g>

      {/* 4 — as contas. Um envelope e um papel na soleira, sem número e sem
             texto: só o sinal de que a correspondência começou a acumular. */}
      <g data-scene-risk data-risk-delay="0.24">
        <g transform="rotate(-8 246 340)">
          <path d="M230 333h34v14h-34Z" fill={INK.lift} />
          <path {...detail(0.32)} d="M230 333l17 9 17-9" />
          <path {...outline(1.1, 0.34)} d="M230 333h34v14h-34Z" />
        </g>
        <g transform="rotate(6 262 346)">
          <path d="M250 342h26v9h-26Z" fill={INK.lift} opacity=".85" />
          <path {...outline(1, 0.28)} d="M250 342h26v9h-26Z" />
        </g>
      </g>

      {/* ===================================================== a proteção == */}

      {/* O vazio DE NOVO, agora como peça de proteção. Os elementos de risco
          caem para 18% de opacidade quando o escudo entra (ver StoryScroll), e
          sem esta segunda cópia a ausência praticamente desapareceria no
          último beat — exatamente a leitura que o capítulo não pode ter. */}
      <g data-scene-shield>
        <Figure {...PROVEDOR} variant="trace" />
      </g>

      {/* O FIO RECONECTADO — tracejado, e crescendo DA JANELA em direção ao
          ombro que já não está lá: a renda volta a chegar, a pessoa não. */}
      <g data-scene-shield>
        <Cresce fator={1.8} px={FIO_CASA.x} py={FIO_CASA.y} origin="0% 0%" dur={0.55}>
          <path
            d={FIO}
            fill="none"
            stroke="rgb(var(--brand-2) / .22)"
            strokeWidth="8"
            filter={`url(#${ID}-soft)`}
          />
          <path {...accentStroke(2, 0.85)} strokeDasharray="6 7" d={FIO} />
          <circle cx={FIO_CASA.x} cy={FIO_CASA.y} r="3.2" fill="rgb(var(--brand-2) / .9)" />
          <circle cx={FIO_OMBRO.x} cy={FIO_OMBRO.y} r="3" fill="rgb(var(--brand-2) / .8)" />
        </Cresce>
      </g>

      {/* as duas mãos que se encontram na frente do vazio */}
      <g data-scene-shield>
        <path {...accentStroke(2.4, 0.75)} d="M228 298C254 291 314 288 352 293" />
        <circle cx="290" cy="291" r="4.2" fill="rgb(var(--brand-2) / .95)" />
        <circle
          cx="290"
          cy="291"
          r="11"
          fill="rgb(var(--brand-2) / .3)"
          filter={`url(#${ID}-haze)`}
        />
      </g>

      <ShieldSeal id={ID} x={460} y={14} size={84} />
    </Scene>
  );
}

export default LifeScene;
