'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';

export interface AccordionItemData {
  q: string;
  a: string;
}

interface Props {
  items: AccordionItemData[];
  /** Índice aberto inicialmente (-1 = todos fechados) */
  defaultOpen?: number;
  className?: string;
}

/**
 * Acordeão acessível: navegável por teclado, com aria-expanded/aria-controls,
 * e animação de altura suave feita pelo GSAP (sem "salto" de layout).
 */
export function Accordion({ items, defaultOpen = 0, className }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panels = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = useReducedMotion();

  const toggle = (i: number) => {
    const next = open === i ? -1 : i;
    const previous = open;
    setOpen(next);

    if (reduced) return;

    // fecha o anterior
    if (previous !== -1 && previous !== next) {
      const el = panels.current[previous];
      if (el) {
        gsap.to(el, { height: 0, opacity: 0, duration: 0.42, ease: 'brandIn' });
        gsap.to(el.querySelectorAll('[data-acc-body]'), { y: -8, duration: 0.3, ease: 'brandIn' });
      }
    }

    // abre o novo
    if (next !== -1) {
      const el = panels.current[next];
      if (el) {
        gsap.set(el, { height: 'auto', opacity: 1 });
        gsap.from(el, { height: 0, opacity: 0, duration: 0.55, ease: 'brand' });
        gsap.from(el.querySelectorAll('[data-acc-body]'), {
          y: 14,
          opacity: 0,
          duration: 0.5,
          delay: 0.06,
          ease: 'brand',
        });
      }
    }
  };

  return (
    <div className={cn('divide-y divide-hair', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="group/acc">
            <h3>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-start justify-between gap-5 py-6 text-left transition-colors duration-300"
              >
                <span
                  className={cn(
                    'font-display text-[1.125rem] font-semibold leading-snug transition-colors duration-300 md:text-[1.25rem]',
                    isOpen ? 'text-fg' : 'text-fg-2 group-hover/acc:text-fg',
                  )}
                >
                  {item.q}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-[2px] grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-brand',
                    isOpen
                      ? 'border-transparent bg-brand-gradient text-on-brand'
                      : 'border-hair text-fg-3 group-hover/acc:border-brand-2/50 group-hover/acc:text-fg',
                  )}
                >
                  <Icon
                    name="chevron-down"
                    size={17}
                    className={cn('transition-transform duration-500 ease-brand', isOpen && 'rotate-180')}
                  />
                </span>
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              ref={(el) => {
                panels.current[i] = el;
              }}
              hidden={!isOpen && reduced}
              style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              className="overflow-hidden"
            >
              <p
                data-acc-body
                className="max-w-prose pb-7 pr-10 text-[1.0625rem] leading-relaxed text-fg-3 md:text-[1.0625rem]"
              >
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
