'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  /** Trecho do título que recebe o gradiente da marca (apenas com title string) */
  highlight?: string;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** Tamanho do título */
  size?: 'md' | 'lg';
  as?: 'h1' | 'h2' | 'h3';
  children?: ReactNode;
}

/**
 * Cabeçalho de seção com animação de entrada palavra por palavra (SplitText).
 * O título é revelado em blocos, com máscara de recorte — o mesmo recurso
 * usado por sites de produto de grandes empresas de tecnologia.
 */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'left',
  className,
  size = 'lg',
  as: Tag = 'h2',
  children,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const heading = el.querySelector<HTMLElement>('[data-heading]');
      const rest = el.querySelectorAll<HTMLElement>('[data-heading-rest]');

      if (reduced) {
        /* `heading` pode ser nulo; o filtro evita alvo inexistente no GSAP. */
        const done = [heading, ...Array.from(rest)].filter(Boolean) as HTMLElement[];
        if (done.length) gsap.set(done, { opacity: 1, y: 0 });
        el.querySelectorAll('[data-anim]').forEach((n) => n.classList.add('is-in'));
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      });

      let split: SplitText | null = null;

      if (heading) {
        /* Dividimos apenas em LINHAS (não em palavras).
           Motivo: o trecho destacado usa gradiente com `background-clip: text`.
           Ao dividir em palavras, o texto sai de dentro do span que carrega o
           gradiente e o recorte passa a não ter conteúdo — o destaque
           simplesmente desaparece. Com linhas, os spans internos permanecem
           intactos e o gradiente continua funcionando. */
        split = SplitText.create(heading, { type: 'lines', mask: 'lines' });
        gsap.set(heading, { opacity: 1 });
        tl.from(split.lines, {
          yPercent: 112,
          opacity: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'brandOut',
        });
      }

      if (rest.length) {
        tl.to(
          rest,
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'brand', clearProps: 'transform' },
          heading ? '-=0.55' : 0,
        );
      }

      return () => {
        split?.revert();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { dependencies: [reduced], scope: root },
  );

  const titleNode =
    typeof title === 'string' && highlight ? (
      <>
        {title.split(highlight)[0]}
        <span className="text-gradient-brand">{highlight}</span>
        {title.split(highlight)[1]}
      </>
    ) : (
      title
    );

  return (
    <div
      ref={root}
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow && (
        <span
          data-heading-rest
          data-anim="up"
          className="eyebrow mb-5 translate-y-3 opacity-0 [--anim-dist:12px]"
        >
          <Icon name="spark" size={13} className="text-accent-ink" />
          {eyebrow}
        </span>
      )}

      <Tag
        data-heading
        className={cn(
          'max-w-[22ch] text-fg opacity-0',
          size === 'lg' ? 'text-display-lg' : 'text-display-md',
          align === 'center' && 'max-w-[26ch]',
        )}
      >
        {titleNode}
      </Tag>

      {subtitle && (
        <p
          data-heading-rest
          className="mt-5 max-w-[54ch] translate-y-3 text-[1.125rem] leading-relaxed text-fg-3 opacity-0 md:text-[1.1875rem]"
        >
          {subtitle}
        </p>
      )}

      {children && (
        <div data-heading-rest className="mt-8 translate-y-3 opacity-0">
          {children}
        </div>
      )}
    </div>
  );
}

export default SectionHeading;
