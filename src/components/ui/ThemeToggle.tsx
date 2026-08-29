'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

/**
 * Alternância entre tema claro e escuro.
 *
 * O ícone é um único desenho que se transforma: o disco do sol encolhe e vira
 * lua ao ganhar um recorte, e os raios recolhem. Isso evita o efeito de dois
 * ícones piscando um sobre o outro.
 *
 * Enquanto o tema não é conhecido no cliente (primeiro render, para não
 * divergir do HTML do servidor), o botão aparece em estado neutro e sem
 * rótulo de destino — nunca some, para não causar salto de layout.
 */
export function ThemeToggle({
  className,
  variant = 'icon',
}: {
  className?: string;
  /** 'icon' = redondo no header · 'row' = linha larga no menu mobile */
  variant?: 'icon' | 'row';
}) {
  const { theme, toggle } = useTheme();
  const iconRef = useRef<SVGSVGElement>(null);
  const isDark = theme === 'dark';

  useGSAP(
    () => {
      const el = iconRef.current;
      if (!el || theme === null) return;

      const reduced = prefersReducedMotion();
      const rays = el.querySelectorAll('[data-ray]');
      const disc = el.querySelector('[data-disc]');
      const notch = el.querySelector('[data-notch]');

      if (reduced) {
        gsap.set(rays, { autoAlpha: isDark ? 0 : 1, scale: isDark ? 0.4 : 1 });
        gsap.set(disc, { scale: isDark ? 1.08 : 1 });
        gsap.set(notch, { autoAlpha: isDark ? 1 : 0, x: isDark ? 0 : 6 });
        return;
      }

      const tl = gsap.timeline();
      tl.to(rays, {
        autoAlpha: isDark ? 0 : 1,
        scale: isDark ? 0.4 : 1,
        duration: 0.42,
        stagger: { each: 0.026, from: isDark ? 'end' : 'start' },
        ease: isDark ? 'brandIn' : 'snap',
        transformOrigin: '12px 12px',
      })
        .to(
          disc,
          { scale: isDark ? 1.08 : 1, duration: 0.5, ease: 'snap', transformOrigin: '12px 12px' },
          0,
        )
        .to(
          notch,
          { autoAlpha: isDark ? 1 : 0, x: isDark ? 0 : 6, duration: 0.46, ease: 'brand' },
          isDark ? 0.08 : 0,
        );

      return () => tl.kill();
    },
    { dependencies: [isDark, theme] },
  );

  const label =
    theme === null
      ? 'Alternar entre tema claro e escuro'
      : isDark
        ? 'Mudar para o tema claro'
        : 'Mudar para o tema escuro';

  const icon = (
    <svg
      ref={iconRef}
      viewBox="0 0 24 24"
      width={variant === 'row' ? 20 : 19}
      height={variant === 'row' ? 20 : 19}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      {/* raios do sol */}
      <g
        data-ray-group
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            data-ray
            x1="12"
            y1="2.6"
            x2="12"
            y2="5.1"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
      </g>

      {/* disco: sol cheio ou lua (com o recorte deslizando para dentro) */}
      <mask id="theme-toggle-mask">
        <rect x="0" y="0" width="24" height="24" fill="#fff" />
        <circle data-notch cx="18.4" cy="7.4" r="5.4" fill="#000" />
      </mask>
      <circle
        data-disc
        cx="12"
        cy="12"
        r="5.2"
        fill="currentColor"
        mask="url(#theme-toggle-mask)"
      />
    </svg>
  );

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl border border-hair px-4 py-3.5 text-[0.9375rem] font-medium text-fg-2 transition-colors duration-300 active:bg-tint/[.06]',
          className,
        )}
      >
        <span className="flex items-center gap-3">
          <span className="text-accent-ink">{icon}</span>
          Tema {theme === null ? '' : isDark ? 'escuro' : 'claro'}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-400 ease-brand',
            isDark ? 'bg-brand-gradient' : 'bg-tint/[.14]',
          )}
        >
          <span
            className={cn(
              'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-panel shadow-soft transition-[left] duration-400 ease-brand',
              isDark ? 'left-[24px]' : 'left-[3px]',
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-3 transition-all duration-300 ease-brand hover:-translate-y-[1px] hover:border-brand-2/55 hover:text-fg',
        className,
      )}
    >
      {icon}
    </button>
  );
}

export default ThemeToggle;
