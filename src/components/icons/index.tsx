import type { SVGProps } from 'react';

/**
 * Conjunto de ícones próprios (não é biblioteca externa): traço de 1.6,
 * grid de 24, cantos suaves. Todos usam `currentColor` e herdam o tamanho
 * do contexto, o que permite animar cor e escala sem custo de rede.
 *
 * As partes marcadas com `data-icon-accent` identificam o detalhe do ícone —
 * o traço que carrega o significado. Use esse atributo para animar ou colorir
 * apenas essa parte (por exemplo, com DrawSVG) sem tocar no resto do desenho.
 */

export type IconName =
  // produtos
  | 'life'
  | 'car'
  | 'cargo'
  | 'fleet'
  | 'truck'
  | 'home'
  | 'business'
  | 'shield-law'
  | 'guarantee'
  | 'diverse'
  | 'plus-circle'
  // diferenciais
  | 'user-check'
  | 'layers'
  | 'compass'
  | 'zap'
  | 'life-buoy'
  | 'headset'
  | 'building-user'
  // etapas
  | 'cursor-click'
  | 'search-heart'
  | 'check-circle'
  | 'shield-check'
  // interface
  | 'arrow-right'
  | 'arrow-up-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'menu'
  | 'close'
  | 'check'
  | 'alert'
  | 'quote'
  | 'star'
  | 'clock'
  | 'calculator'
  | 'percent'
  | 'trending-up'
  | 'trending-down'
  | 'equal'
  | 'map-pin'
  | 'mail'
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'tiktok';

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number | string };

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const paths: Record<IconName, React.ReactNode> = {
  /* ------------------------------- PRODUTOS ------------------------------- */
  life: (
    <>
      <path {...S} d="M12 20.5S4 15.6 4 10.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 8 2.2c0 5.4-8 10.3-8 10.3Z" />
      <path {...S} data-icon-accent d="M7.2 12.4h2.1l1.3-2.2 1.6 4 1.3-2.6.9 .8h2.4" />
    </>
  ),
  car: (
    <>
      <path {...S} d="M3.5 14.4h17M5.6 14.4l1.7-5a2 2 0 0 1 1.9-1.4h5.6a2 2 0 0 1 1.9 1.4l1.7 5" />
      <path {...S} d="M4.5 14.4v3a1 1 0 0 0 1 1h1.3a1 1 0 0 0 1-1v-.7h8.4v.7a1 1 0 0 0 1 1H18.5a1 1 0 0 0 1-1v-3" />
      <path {...S} data-icon-accent d="M7.4 11.6h9.2" />
      <circle {...S} cx="7.6" cy="16.4" r=".9" />
      <circle {...S} cx="16.4" cy="16.4" r=".9" />
    </>
  ),
  cargo: (
    <>
      <rect {...S} x="3.4" y="7.2" width="17.2" height="11.4" rx="1.8" />
      <path {...S} d="M8.2 7.2v11.4M15.8 7.2v11.4" />
      <path {...S} data-icon-accent d="M5.8 10.4h.01M5.8 13h.01M5.8 15.6h.01M11.2 10.4h1.6M11.2 13h1.6M11.2 15.6h1.6M18.2 10.4h.01M18.2 13h.01M18.2 15.6h.01" />
      <path {...S} data-icon-accent d="M6.6 4.6h10.8" />
      <path {...S} data-icon-accent d="M15.4 2.8l2 1.8-2 1.8" />
      <path {...S} d="M5.4 18.6v1.6M18.6 18.6v1.6" />
    </>
  ),
  fleet: (
    <>
      {/* silhuetas ao fundo, sugerindo quantidade */}
      <path {...S} strokeWidth="1.2" opacity=".55" d="M4.6 8.4l1.5-3.1a1.6 1.6 0 011.5-.9h5.2a1.6 1.6 0 011.4.8l1.7 3.2" />
      <path {...S} strokeWidth="1.2" opacity=".55" d="M3.6 8.4h16.8" />
      <path {...S} strokeWidth="1.2" opacity=".8" d="M3.4 12.2l1.6-3.3a1.6 1.6 0 011.4-.9h7.5a1.6 1.6 0 011.4.8l1.8 3.4" />
      <path {...S} strokeWidth="1.2" opacity=".8" d="M2.4 12.2h18.2" />
      {/* veículo em primeiro plano */}
      <path {...S} data-icon-accent d="M4.2 17.2l1.7-3.5a1.8 1.8 0 011.6-1h7.9a1.8 1.8 0 011.6 1l1.8 3.5" />
      <path {...S} data-icon-accent d="M2.8 17.2h18.4" />
      <path {...S} data-icon-accent d="M4.4 17.2v2a.9.9 0 00.9.9h1.1a.9.9 0 00.9-.9v-.6h9.4v.6a.9.9 0 00.9.9h1.1a.9.9 0 00.9-.9v-2" />
      <circle {...S} data-icon-accent cx="7" cy="18.4" r=".8" />
      <circle {...S} data-icon-accent cx="17" cy="18.4" r=".8" />
    </>
  ),
  truck: (
    <>
      <path {...S} d="M2.6 16.2V7.8a1 1 0 0 1 1-1h7.6a1 1 0 0 1 1 1v8.4" />
      <path {...S} d="M12.2 9.9h3.3c.4 0 .7.1 1 .4l2.8 3c.2.2.3.5.3.8v2.1" />
      <path {...S} d="M2.6 16.2h1.6M8.2 16.2h4M18 16.2h1.4" />
      <circle {...S} cx="6.2" cy="16.9" r="1.9" />
      <circle {...S} cx="15.9" cy="16.9" r="1.9" />
      <path {...S} data-icon-accent d="M15.1 12.6h2.1l1.4 1.5h-3.5z" />
    </>
  ),
  home: (
    <>
      <path {...S} d="M4 10.6 12 4.4l8 6.2v8.1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path {...S} data-icon-accent d="M9.6 19.7v-4.9h4.8v4.9" />
      <path {...S} d="M12 4.4v1.4" />
    </>
  ),
  business: (
    <>
      <path {...S} d="M3.6 20h16.8M5.4 20V5.6a1 1 0 0 1 1-1h6.2a1 1 0 0 1 1 1V20" />
      <path {...S} d="M13.6 10.4h4a1 1 0 0 1 1 1V20" />
      <path {...S} data-icon-accent d="M8 8h3M8 11.4h3M8 14.8h3M15.8 13.6h.9M15.8 16.6h.9" />
    </>
  ),
  'shield-law': (
    <>
      <path {...S} d="M12 3.6 19.2 6v6c0 4.2-3 7.1-7.2 8.4C7.8 19.1 4.8 16.2 4.8 12V6z" />
      <path {...S} data-icon-accent d="M12 8.4v6.6M9.2 11.2h5.6M8.4 14.6h7.2" />
    </>
  ),
  guarantee: (
    <>
      <path {...S} d="M6 3.8h9l3.4 3.4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1z" />
      <path {...S} d="M14.6 3.9v3.5h3.7" />
      <path {...S} data-icon-accent d="M8.2 12.4h7.2M8.2 15.4h4.6" />
      <circle {...S} data-icon-accent cx="15.4" cy="16.6" r="2.2" />
      <path {...S} data-icon-accent d="M14.4 16.6l.8.8 1.5-1.6" />
    </>
  ),
  diverse: (
    <>
      <rect {...S} x="3.6" y="3.6" width="7" height="7" rx="1.6" />
      <rect {...S} data-icon-accent x="13.4" y="3.6" width="7" height="7" rx="3.5" />
      <rect {...S} data-icon-accent x="3.6" y="13.4" width="7" height="7" rx="3.5" />
      <rect {...S} x="13.4" y="13.4" width="7" height="7" rx="1.6" />
    </>
  ),
  'plus-circle': (
    <>
      <circle {...S} cx="12" cy="12" r="8.2" />
      <path {...S} data-icon-accent d="M12 8.6v6.8M8.6 12h6.8" />
    </>
  ),

  /* ----------------------------- DIFERENCIAIS ---------------------------- */
  'user-check': (
    <>
      <circle {...S} cx="10.4" cy="8.4" r="3.4" />
      <path {...S} d="M4.2 19.6c0-3.1 2.8-5.2 6.2-5.2 1.2 0 2.3.3 3.2.7" />
      <path {...S} data-icon-accent d="M14.6 17.4l1.9 1.9 3.6-3.9" />
    </>
  ),
  layers: (
    <>
      <path {...S} d="M12 3.8 20 8l-8 4.2L4 8z" />
      <path {...S} data-icon-accent d="M4 12.2 12 16.4l8-4.2" />
      <path {...S} data-icon-accent d="M4 16.2 12 20.4l8-4.2" />
    </>
  ),
  compass: (
    <>
      <circle {...S} cx="12" cy="12" r="8.4" />
      <path {...S} data-icon-accent d="M14.9 9.1l-1.6 4.2-4.2 1.6 1.6-4.2z" />
    </>
  ),
  zap: <path {...S} data-icon-accent d="M13.4 3.4 6.6 13.4h4.3L10 20.6l7.2-10.4h-4.4z" />,
  'life-buoy': (
    <>
      <circle {...S} cx="12" cy="12" r="8.4" />
      <circle {...S} cx="12" cy="12" r="3.5" />
      <path {...S} data-icon-accent d="M6.1 6.1l3.4 3.4M14.5 14.5l3.4 3.4M17.9 6.1l-3.4 3.4M9.5 14.5l-3.4 3.4" />
    </>
  ),
  headset: (
    <>
      <path {...S} d="M4.6 14.4v-2.2a7.4 7.4 0 0 1 14.8 0v2.2" />
      <path {...S} d="M4.6 13.2h1.6a1 1 0 0 1 1 1v3.2a1 1 0 0 1-1 1H5.6a1 1 0 0 1-1-1z" />
      <path {...S} d="M19.4 13.2h-1.6a1 1 0 0 0-1 1v3.2a1 1 0 0 0 1 1h.8a1 1 0 0 0 1-1z" />
      <path {...S} data-icon-accent d="M17.2 18.4v.6a2 2 0 0 1-2 2h-2.4" />
    </>
  ),
  'building-user': (
    <>
      <path {...S} d="M3.6 20.2h8.2V5.4a1 1 0 0 1 1-1h5.6a1 1 0 0 1 1 1v3" />
      <path {...S} d="M4.8 20.2V10a1 1 0 0 1 1-1h6" />
      <path {...S} d="M14.4 7.6h2.4" />
      <circle {...S} data-icon-accent cx="17" cy="14.2" r="2.2" />
      <path {...S} data-icon-accent d="M13.4 20.2c0-1.8 1.6-3 3.6-3s3.6 1.2 3.6 3" />
    </>
  ),

  /* -------------------------------- ETAPAS ------------------------------- */
  'cursor-click': (
    <>
      <path {...S} d="M8.4 4.8l2.2 14.6 2.6-4.6 4.8 1z" />
      <path {...S} data-icon-accent d="M17.6 6.6l2.4-2.2M19.4 11h3M15.4 3.2l.6-2.4" />
    </>
  ),
  'search-heart': (
    <>
      <circle {...S} cx="10.8" cy="10.8" r="6.6" />
      <path {...S} d="M15.6 15.6l4.4 4.4" />
      <path {...S} data-icon-accent d="M10.8 13.6s-2.9-1.8-2.9-3.7A1.5 1.5 0 0 1 10.8 9a1.5 1.5 0 0 1 2.9.9c0 1.9-2.9 3.7-2.9 3.7Z" />
    </>
  ),
  'check-circle': (
    <>
      <circle {...S} cx="12" cy="12" r="8.4" />
      <path {...S} data-icon-accent d="M8.4 12.2l2.6 2.6 4.8-5.2" />
    </>
  ),
  'shield-check': (
    <>
      <path {...S} d="M12 3.6 19.2 6v6c0 4.2-3 7.1-7.2 8.4C7.8 19.1 4.8 16.2 4.8 12V6z" />
      <path {...S} data-icon-accent d="M8.8 12.1l2.4 2.4 4.2-4.6" />
    </>
  ),

  /* ------------------------------ INTERFACE ----------------------------- */
  'arrow-right': <path {...S} d="M4.6 12h14.2M13.4 6.6 18.8 12l-5.4 5.4" />,
  'arrow-up-right': <path {...S} d="M7 17 17 7M9 7h8v8" />,
  'chevron-down': <path {...S} d="M6.4 9.6 12 15.2l5.6-5.6" />,
  'chevron-left': <path {...S} d="M14.4 6.4 8.8 12l5.6 5.6" />,
  'chevron-right': <path {...S} d="M9.6 6.4 15.2 12l-5.6 5.6" />,
  menu: <path {...S} d="M4 7.4h16M4 12h16M4 16.6h16" />,
  close: <path {...S} d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />,
  check: <path {...S} d="M5 12.6l4.4 4.4L19 6.8" />,
  alert: (
    <>
      <circle {...S} cx="12" cy="12" r="8.4" />
      <path {...S} d="M12 7.8v5.2M12 16.4h.01" />
    </>
  ),
  quote: (
    <path
      fill="currentColor"
      d="M9.1 6.4c-2.9 0-5.1 2.3-5.1 5.3 0 3 2 5.1 4.6 5.1 1 0 1.7-.3 2.2-.7-.6 1.6-2 2.6-3.5 3l.5 1.5c3.4-.8 6.1-3.8 6.1-8.4 0-3.6-2-5.8-4.8-5.8Zm10 0c-2.9 0-5.1 2.3-5.1 5.3 0 3 2 5.1 4.6 5.1 1 0 1.7-.3 2.2-.7-.6 1.6-2 2.6-3.5 3l.5 1.5c3.4-.8 6.1-3.8 6.1-8.4 0-3.6-2-5.8-4.8-5.8Z"
      transform="translate(-1 -1) scale(.94)"
    />
  ),
  /* Estrela CHEIA (fill), usada nas notas de avaliação. A escala parcial de uma
     nota como 4,7 é feita por recorte de largura no componente, não por meia
     estrela desenhada — assim qualquer fração fica correta. */
  star: (
    <path
      fill="currentColor"
      data-icon-accent
      d="M12 2.9l2.72 5.51 6.08.89-4.4 4.29 1.04 6.05L12 16.78l-5.44 2.86 1.04-6.05-4.4-4.29 6.08-.89z"
    />
  ),
  /* O ícone `spark` (faísca de quatro pontas) FOI REMOVIDO do registro, não
     apenas dos componentes. Ele abria todas as etiquetas de seção e a faixa de
     versículos, e o cliente identificou aquela estrelinha repetida como marca
     de "site gerado por IA". Deixar o desenho aqui só convidaria a voltar a
     usá-lo sem perceber. O `star` (estrela cheia, cinco pontas) continua: é o
     das notas de avaliação do Google, que é outra coisa. */
  clock: (
    <>
      <circle {...S} cx="12" cy="12" r="8.4" />
      <path {...S} data-icon-accent d="M12 7.6V12l3.2 2" />
    </>
  ),
  calculator: (
    <>
      <rect {...S} x="4.6" y="2.8" width="14.8" height="18.4" rx="2.6" />
      <rect {...S} x="7.6" y="5.8" width="8.8" height="3.4" rx="1.1" />
      <path {...S} data-icon-accent d="M8.4 12.6h.01M12 12.6h.01M15.6 12.6h.01M8.4 16.2h.01M12 16.2h.01M15.6 16.2h.01" />
    </>
  ),
  percent: (
    <>
      <path {...S} data-icon-accent d="M18.4 5.6 5.6 18.4" />
      <circle {...S} cx="8.1" cy="8.1" r="2.5" />
      <circle {...S} cx="15.9" cy="15.9" r="2.5" />
    </>
  ),
  'trending-up': (
    <>
      <path {...S} data-icon-accent d="M3.6 16.4 9.2 10.8l3.2 3.2 7-7" />
      <path {...S} d="M14.6 7h4.8v4.8" />
    </>
  ),
  'trending-down': (
    <>
      <path {...S} data-icon-accent d="M3.6 7.6 9.2 13.2l3.2-3.2 7 7" />
      <path {...S} d="M14.6 17h4.8v-4.8" />
    </>
  ),
  equal: <path {...S} data-icon-accent d="M5.6 9.6h12.8M5.6 14.4h12.8" />,
  'map-pin': (
    <>
      <path {...S} d="M12 21c4-4.4 6.2-7.5 6.2-10.4A6.2 6.2 0 0 0 5.8 10.6C5.8 13.5 8 16.6 12 21Z" />
      <circle {...S} data-icon-accent cx="12" cy="10.4" r="2.4" />
    </>
  ),
  mail: (
    <>
      <rect {...S} x="3.4" y="5.6" width="17.2" height="12.8" rx="2.2" />
      <path {...S} data-icon-accent d="m4.4 7.6 7.6 5.4 7.6-5.4" />
    </>
  ),
  phone: (
    <path
      {...S}
      d="M7.4 3.8h2.2l1.4 3.6-1.8 1.4a10.6 10.6 0 0 0 5.4 5.4l1.4-1.8 3.6 1.4v2.2a2.2 2.2 0 0 1-2.4 2.2A15.4 15.4 0 0 1 5.2 6.2 2.2 2.2 0 0 1 7.4 3.8Z"
    />
  ),
  whatsapp: (
    <path
      fill="currentColor"
      d="M12.04 2.5c-5.2 0-9.42 4.22-9.42 9.42 0 1.66.43 3.28 1.26 4.71L2.5 21.5l5.02-1.3a9.4 9.4 0 0 0 4.52 1.15c5.2 0 9.42-4.22 9.42-9.43 0-5.2-4.22-9.42-9.42-9.42Zm0 17.2a7.8 7.8 0 0 1-3.97-1.09l-.28-.17-2.94.77.78-2.88-.18-.29a7.77 7.77 0 0 1-1.19-4.12 7.79 7.79 0 1 1 7.78 7.78Zm4.4-5.83c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.36 6.36 0 0 1-1.87-1.15 7.06 7.06 0 0 1-1.3-1.62c-.13-.24-.01-.37.11-.49.1-.11.24-.3.36-.44.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.7 4.12 3.68 2.42.98 2.42.65 2.86.61.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
    />
  ),
  instagram: (
    <>
      <rect {...S} x="3.6" y="3.6" width="16.8" height="16.8" rx="5" />
      <circle {...S} cx="12" cy="12" r="4.1" />
      <circle fill="currentColor" cx="16.9" cy="7.1" r="1.1" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.6 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.4-1.4h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v1.8H8.1v2.9h2.1V21z"
    />
  ),
  linkedin: (
    <>
      <rect {...S} x="3.6" y="3.6" width="16.8" height="16.8" rx="3" />
      <path fill="currentColor" d="M7.3 10.2h2v7h-2zM8.3 6.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
      <path
        fill="currentColor"
        d="M11.2 10.2h1.9v1h.03c.3-.6 1.1-1.2 2.2-1.2 1.9 0 2.5 1.2 2.5 3v4.2h-2v-3.7c0-.9-.3-1.5-1.1-1.5-.9 0-1.4.6-1.4 1.5v3.7h-2z"
      />
    </>
  ),
  youtube: (
    <>
      <rect {...S} x="2.6" y="5.6" width="18.8" height="12.8" rx="4" />
      <path fill="currentColor" d="M10.4 9.1l5.2 2.9-5.2 2.9z" />
    </>
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M16.7 3h-2.6v10.6a2.3 2.3 0 1 1-2.3-2.3c.24 0 .47.04.7.11V8.7a5.1 5.1 0 1 0 4.2 5v-4.4a5 5 0 0 0 3 .98V7.6a3 3 0 0 1-3-3z"
    />
  ),
};

export function Icon({ name, size = 24, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
