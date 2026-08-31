import type { Config } from 'tailwindcss';

/**
 * =============================================================================
 * IDENTIDADE VISUAL FIXSEG
 * =============================================================================
 * As cores vêm de tokens semânticos definidos em src/app/globals.css, em
 * triplas RGB, para que os dois temas (claro e escuro) usem exatamente as
 * mesmas classes utilitárias e os modificadores de opacidade continuem
 * funcionando (`text-fg/60`, `border-line/40`).
 *
 * Ao escrever componentes, use os tokens — nunca `text-white` ou `bg-black`
 * direto, que quebram um dos temas.
 *
 *   fg / fg-2 / fg-3 / fg-4 ...... texto, do mais forte ao mais discreto
 *   page / panel / panel-2 ....... superfícies
 *   line ......................... traços e divisores
 *   tint ......................... véu sobre a superfície (clareia no escuro,
 *                                  escurece no claro)
 *   brand / brand-2 / brand-mid .. azul elétrico e azul ciano da logo
 *   accent-ink ................... azul com contraste seguro para TEXTO
 * =============================================================================
 */

/** Escala de opacidade completa (0–100), para modificadores como `/62`. */
const opacityScale = Object.fromEntries(
  Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)]),
) as Record<string, string>;

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      opacity: opacityScale,
      colors: {
        page: token('page'),
        panel: token('panel'),
        'panel-2': token('panel-2'),

        fg: token('fg'),
        'fg-2': token('fg-2'),
        'fg-3': token('fg-3'),
        'fg-4': token('fg-4'),

        line: token('line'),
        tint: token('tint'),

        /* Traços prontos, com a opacidade já embutida por tema.
           Use `border-hair` no lugar de `border-white/10`: funciona nos dois
           temas e não precisa de modificador de opacidade. */
        hair: 'rgb(var(--line) / var(--line-opacity))',
        'hair-strong': 'rgb(var(--line) / var(--line-strong-opacity))',

        brand: token('brand'),
        'brand-2': token('brand-2'),
        'brand-mid': token('brand-mid'),
        'accent-ink': token('accent-ink'),

        /* Cor de alerta — só as ilustrações da narrativa usam (fogo, perigo).
           Ver o comentário em globals.css: é a única exceção à paleta. */
        alert: token('alert'),
        'alert-2': token('alert-2'),

        /* placa clara sob os logos das seguradoras (ver globals.css) */
        'logo-plate': token('logo-plate'),

        /* Texto e ícones POR CIMA de superfície da marca (gradiente azul,
           verde do WhatsApp). Branco nos dois temas, de propósito: o fundo ali
           não muda. Usar `text-fg` nesses lugares deixaria texto escuro sobre
           azul no tema claro. */
        'on-brand': '#ffffff',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      /**
       * Escala tipográfica — um degrau acima da inicial.
       * Corpo em 17px e nenhum texto abaixo de 12px no site.
       */
      fontSize: {
        'display-xl': [
          'clamp(3rem, 7vw, 5.5rem)',
          { lineHeight: '0.99', letterSpacing: '-0.034em' },
        ],
        'display-lg': [
          'clamp(2.5rem, 5vw, 4rem)',
          { lineHeight: '1.03', letterSpacing: '-0.029em' },
        ],
        'display-md': [
          'clamp(1.9375rem, 3.7vw, 3rem)',
          { lineHeight: '1.09', letterSpacing: '-0.021em' },
        ],
        'display-sm': [
          'clamp(1.5rem, 2.5vw, 2.0625rem)',
          { lineHeight: '1.16', letterSpacing: '-0.014em' },
        ],
        label: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: 'var(--shadow-card)',
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        header: 'var(--shadow-header)',
        glow: '0 0 0 1px rgb(var(--brand-2) / .3), 0 14px 44px -16px rgb(var(--brand-2) / .35)',
        'glow-strong':
          '0 0 0 1px rgb(var(--brand-2) / .45), 0 20px 60px -14px rgb(var(--brand) / .5)',
        cta: '0 10px 34px -14px rgb(var(--brand) / .6)',
        'cta-hover': '0 18px 48px -14px rgb(var(--brand-2) / .6)',
      },
      spacing: {
        section: 'clamp(4.5rem, 9vw, 8.5rem)',
        gutter: 'clamp(1.25rem, 4vw, 2.5rem)',
      },
      maxWidth: {
        shell: '1240px',
        prose: '68ch',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(96deg, rgb(var(--brand)) 0%, rgb(var(--brand-mid)) 45%, rgb(var(--brand-2)) 100%)',
      },
      transitionDuration: {
        400: '400ms',
        450: '450ms',
        600: '600ms',
        800: '800ms',
        900: '900ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(.22,1,.36,1)',
        'brand-in': 'cubic-bezier(.65,0,.35,1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(.85)', opacity: '.55' },
          '70%': { transform: 'scale(1.55)', opacity: '0' },
          '100%': { transform: 'scale(1.55)', opacity: '0' },
        },
        'marquee-x': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'float-y': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        flicker: {
          '0%,100%': { transform: 'scaleY(1) scaleX(1)', opacity: '.92' },
          '35%': { transform: 'scaleY(1.1) scaleX(.94)', opacity: '1' },
          '70%': { transform: 'scaleY(.94) scaleX(1.05)', opacity: '.86' },
        },
        'rain-fall': {
          from: { transform: 'translateY(-14%)', opacity: '0' },
          '20%': { opacity: '1' },
          '85%': { opacity: '1' },
          to: { transform: 'translateY(120%)', opacity: '0' },
        },
        'smoke-rise': {
          from: { transform: 'translateY(0) scale(1)', opacity: '0' },
          '30%': { opacity: '.5' },
          to: { transform: 'translateY(-42px) scale(1.6)', opacity: '0' },
        },
        'dash-move': { to: { strokeDashoffset: '-40' } },

        /* ------------------------------------------------------------------
           MOVIMENTO CONTÍNUO DISCRETO (passada de "vida")
           ------------------------------------------------------------------
           Todos abaixo mexem SÓ em `transform`/`opacity`. Os que se aplicam a
           brilhos grandes e desfocados usam apenas translação: `scale` num
           elemento com `blur()` obriga o navegador a rasterizar de novo a cada
           quadro, e era exatamente o que derrubava o quadro nas medições.

           O primeiro e o último passo de cada um são o estado neutro. Isso é o
           que faz o movimento reduzido funcionar de graça: o CSS global zera a
           duração e o elemento volta ao estilo base, no lugar certo.
           ------------------------------------------------------------------ */
        'drift-a': {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(2.5%,-3.5%,0)' },
        },
        'drift-b': {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-3%,2.5%,0)' },
        },
        /* respiração de brilho: opacidade, sem tocar na geometria */
        'glow-breathe': {
          '0%,100%': { opacity: '0.72' },
          '50%': { opacity: '1' },
        },
        /* deriva mínima de ícone — o compasso vem do atraso, não do keyframe */
        'icon-drift': {
          '0%,100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0,-4px,0) rotate(-2.5deg)' },
        },
        'icon-bob': {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-5px,0)' },
        },
        /* Respiração do halo da primeira dobra. SÓ opacidade — e essa é a
           escolha que importa aqui: o halo tem `blur(64px)`, e mexer na escala
           de uma camada desfocada obriga o navegador a rasterizá-la de novo a
           cada quadro. A versão anterior escalava (por GSAP) e era a peça mais
           cara da cena. A opacidade é resolvida no compositor.
           A opacidade base vive no keyframe, não numa classe `opacity-*`: uma
           animação de opacidade substitui o valor da classe, e o halo entraria
           bem mais claro do que foi calibrado. */
        'halo-breathe': {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.56' },
        },
        /* `sheen` com a opacidade dentro. Existe por medição, não por gosto: o
           brilho que atravessa é uma camada do tamanho do cartão, e enquanto ela
           estivesse desenhável o navegador a repintava junto com o cartão em
           toda rolagem — havia mais de vinte na página. Em repouso a camada fica
           em `opacity: 0` (a classe `.sheen-layer`) e o navegador a pula
           inteira; a opacidade só existe durante a passagem, aqui. O `sheen`
           original continua onde estava, intocado. */
        'sheen-pass': {
          '0%': { transform: 'translateX(-120%)', opacity: '0' },
          '14%': { opacity: '1' },
          '86%': { opacity: '1' },
          '100%': { transform: 'translateX(220%)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.6s cubic-bezier(.22,1,.36,1) infinite',
        'marquee-x': 'marquee-x 38s linear infinite',
        sheen: 'sheen 1.1s cubic-bezier(.22,1,.36,1)',
        'float-y': 'float-y 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        flicker: 'flicker 1.1s ease-in-out infinite',
        'rain-fall': 'rain-fall 1.1s linear infinite',
        'smoke-rise': 'smoke-rise 3.4s ease-out infinite',
        'dash-move': 'dash-move 1.6s linear infinite',

        /* passada de "vida" — ver os keyframes acima */
        'drift-a': 'drift-a 26s ease-in-out infinite',
        'drift-b': 'drift-b 32s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 9s ease-in-out infinite',
        'icon-drift': 'icon-drift 7s ease-in-out infinite',
        'icon-bob': 'icon-bob 6.4s ease-in-out infinite',
        'halo-breathe': 'halo-breathe 7s ease-in-out infinite',
        'sheen-pass': 'sheen-pass 1.1s cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
};

export default config;
