'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Icon, { type IconName } from '@/components/icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Posição do ícone */
  iconPosition?: 'left' | 'right';
  className?: string;
  children: ReactNode;
  /** Bloqueia interações e mostra o spinner */
  loading?: boolean;
  full?: boolean;
}

/**
 * Estado de pressão: o `active:` desce o botão em vez de só encolher, e a
 * duração cai para 90ms — pressão precisa responder no ato; soltar é que pode
 * ser suave. `active:translate-y-0` desfaz a elevação do hover, senão o botão
 * fica pressionado E levantado ao mesmo tempo, que é uma leitura contraditória.
 */
const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold ' +
  'transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-brand ' +
  'active:scale-[.965] active:translate-y-0 active:duration-[90ms] disabled:pointer-events-none disabled:opacity-55 ' +
  // área de toque confortável em mobile
  'touch-manipulation';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-on-brand shadow-[0_10px_34px_-14px_rgba(11,100,252,.85)] ' +
    'hover:shadow-[0_18px_48px_-14px_rgba(2,179,249,.75)] hover:-translate-y-[2px] ' +
    'active:shadow-[0_6px_18px_-12px_rgba(11,100,252,.9)]',
  secondary:
    'border border-hair bg-tint/[.045] text-fg backdrop-blur-sm ' +
    'hover:border-brand-2/55 hover:bg-tint/[.08] hover:-translate-y-[2px] ' +
    'active:bg-tint/[.12]',
  ghost: 'text-fg-2 hover:text-fg hover:bg-tint/[.06] active:bg-tint/[.1]',
  whatsapp:
    'bg-[#1FAF54] text-on-brand shadow-[0_10px_30px_-14px_rgba(31,175,84,.9)] hover:bg-[#189a49] hover:-translate-y-[2px] ' +
    'active:shadow-[0_6px_16px_-12px_rgba(31,175,84,.95)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-[.9375rem]',
  md: 'h-12 px-6 text-[1.0625rem]',
  lg: 'h-[3.5rem] px-8 text-[1.0625rem]',
};

function Inner({
  icon,
  iconPosition = 'right',
  children,
  loading,
  variant,
}: Pick<BaseProps, 'icon' | 'iconPosition' | 'children' | 'loading' | 'variant'>) {
  /* O brilho passa em todo botão, não só no primário. Sobre superfície da
     marca (gradiente azul, verde do WhatsApp) ele é branco; sobre a superfície
     da página segue o tema, pelo token `--sheen-surface`. */
  const onBrand = variant === 'primary' || variant === 'whatsapp';

  return (
    <>
      {/* brilho que atravessa o botão no hover — usa o keyframe `sheen` */}
      {variant !== 'ghost' && (
        <span
          aria-hidden="true"
          className={cn(
            'sheen-layer z-0 group-hover/btn:animate-sheen-pass group-focus-visible/btn:animate-sheen-pass',
            onBrand && 'sheen-on-brand',
          )}
        />
      )}

      {loading ? (
        <span
          aria-hidden="true"
          className="relative z-[1] h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-on-brand/35 border-t-on-brand"
        />
      ) : (
        icon &&
        iconPosition === 'left' && (
          <Icon
            name={icon}
            size={18}
            className="relative z-[1] shrink-0 transition-transform duration-300 ease-brand group-hover/btn:-translate-x-[2px] group-active/btn:-translate-x-[3px] group-active/btn:scale-95"
          />
        )
      )}

      <span className="relative z-[1] whitespace-nowrap">{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={18}
          className="relative z-[1] shrink-0 transition-transform duration-300 ease-brand group-hover/btn:translate-x-[3px] group-active/btn:translate-x-[5px] group-active/btn:scale-95"
        />
      )}
    </>
  );
}

/* ---------------------------------- Link ---------------------------------- */

interface LinkButtonProps extends BaseProps {
  href: string;
  external?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export function LinkButton({
  href,
  external,
  variant = 'primary',
  size = 'md',
  className,
  full,
  ariaLabel,
  onClick,
  ...rest
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], full && 'w-full', className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <Inner variant={variant} {...rest} />
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel} onClick={onClick}>
      <Inner variant={variant} {...rest} />
    </Link>
  );
}

/* --------------------------------- Button --------------------------------- */

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, full, loading, disabled, ...rest },
  ref,
) {
  const { icon, iconPosition, children, ...native } = rest;
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], full && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...native}
    >
      <Inner variant={variant} icon={icon} iconPosition={iconPosition} loading={loading}>
        {children}
      </Inner>
    </button>
  );
});

export default Button;
