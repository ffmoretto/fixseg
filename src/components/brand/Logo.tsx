import Link from 'next/link';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import LogoLockup from './LogoLockup';
import LogoWordmark from './LogoWordmark';

interface LogoProps {
  /** 'lockup' = marca + fio + assinatura (proporção do arquivo original)
   *  'mark'   = apenas o wordmark FIXSEG */
  variant?: 'lockup' | 'mark';
  /** Altura TOTAL da peça em px. A largura acompanha, preservando a proporção. */
  height?: number;
  className?: string;
  asLink?: boolean;
  /** Marca o elemento para o GSAP encontrar na entrada da página */
  animatable?: boolean;
}

/**
 * Marca da FIXSEG.
 *
 * O lockup é um SVG único com a geometria exata do arquivo original — é isso
 * que mantém o fio degradê alinhado às letras. Não recomponha as partes em
 * CSS: as três têm larguras quase idênticas no original, e qualquer caixa
 * intermediária faz o fio ficar mais largo que o nome.
 *
 * `height` é a altura total. As proporções do arquivo (261 × 101) dão uma
 * largura de aproximadamente 2,58 × a altura.
 */
export function Logo({
  variant = 'lockup',
  height = 40,
  className,
  asLink = true,
  animatable = false,
}: LogoProps) {
  const Mark = variant === 'lockup' ? LogoLockup : LogoWordmark;

  const content = (
    <span
      className={cn('inline-flex items-center', className)}
      data-logo={animatable ? 'root' : undefined}
    >
      <Mark
        style={{ height, width: 'auto' }}
        className="block text-fg transition-colors duration-400 ease-brand"
      />
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      aria-label={`${site.shortName} — ${site.tagline}, ir para a página inicial`}
      className="group inline-flex shrink-0 rounded-lg transition-transform duration-300 ease-brand hover:-translate-y-px focus-visible:outline-offset-4"
    >
      {content}
    </Link>
  );
}

export default Logo;
