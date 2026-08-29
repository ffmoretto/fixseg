'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, useReducedMotion } from '@/hooks/useReducedMotion';
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
 *
 * A altura é MEDIDA, não chutada: o painel é levado a `height: auto`, o
 * navegador informa a altura real daquele texto naquela largura, e só então a
 * animação parte de 0 até esse número — terminando de volta em `auto`, para que
 * o painel continue certo se a janela mudar de largura depois. É a diferença
 * entre isto e um `max-height` grande o bastante: com `max-height` o tempo real
 * da abertura depende do tamanho do texto, respostas curtas abrem num piscar e
 * o fechamento fica parado no começo.
 *
 * Animar altura força layout, e a regra do projeto é `transform`/`opacity` em
 * animação CONTÍNUA. Esta é pontual e disparada por interação — abre uma vez,
 * termina e não volta a rodar —, então o custo é pago uma vez, não a cada
 * quadro do scroll.
 */
export function Accordion({ items, defaultOpen = 0, className }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panels = useRef<Array<HTMLDivElement | null>>([]);
  /* O hook (assíncrono) decide o HTML renderizado — o `hidden` do painel —, e
     por isso precisa começar igual ao servidor. A decisão de ANIMAR é lida de
     forma síncrona dentro do gesto, onde o valor já está correto. */
  const reduced = useReducedMotion();

  const close = (el: HTMLDivElement) => {
    gsap.killTweensOf(el);
    gsap.to(el, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'brandIn',
      overwrite: true,
    });
    gsap.to(el.querySelectorAll('[data-acc-body]'), {
      y: -10,
      opacity: 0,
      duration: 0.28,
      ease: 'brandIn',
      overwrite: true,
    });
  };

  const expand = (el: HTMLDivElement) => {
    gsap.killTweensOf(el);
    /* mede a altura real deste texto nesta largura */
    gsap.set(el, { height: 'auto', opacity: 1 });
    const target = el.offsetHeight;

    gsap.fromTo(
      el,
      { height: 0, opacity: 0 },
      {
        height: target,
        opacity: 1,
        duration: 0.52,
        ease: 'brand',
        overwrite: true,
        /* volta para `auto`: se a janela mudar de largura, o texto reflui e a
           altura acompanha sozinha em vez de ficar travada no número medido */
        onComplete: () => gsap.set(el, { height: 'auto' }),
      },
    );

    gsap.fromTo(
      el.querySelectorAll('[data-acc-body]'),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.06, ease: 'brand', overwrite: true },
    );
  };

  const toggle = (i: number) => {
    const next = open === i ? -1 : i;
    const previous = open;
    setOpen(next);

    if (prefersReducedMotion()) return;

    if (previous !== -1 && previous !== next) {
      const el = panels.current[previous];
      if (el) close(el);
    }

    if (next !== -1) {
      const el = panels.current[next];
      if (el) expand(el);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            data-open={isOpen}
            className={cn(
              'group/acc relative rounded-2xl border-t border-hair transition-colors duration-500 ease-brand',
              'first:border-t-0',
              /* O recuo é CONSTANTE (com margem negativa que o compensa): assim
                 o item aberto ganha uma superfície própria sem empurrar o texto
                 para o lado toda vez que alguém abre ou fecha uma pergunta.
                 Só a cor muda. */
              '-mx-4 px-4 md:-mx-5 md:px-5',
              isOpen && 'border-transparent bg-tint/[.03]',
            )}
          >
            {/* fio da marca no item aberto — cresce a partir do topo */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-0 top-0 hidden w-[2px] origin-top rounded-full bg-brand-gradient',
                'transition-transform duration-500 ease-brand md:block',
                isOpen ? 'inset-y-2 scale-y-100' : 'inset-y-2 scale-y-0',
              )}
            />

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
                    'font-display text-[1.125rem] font-semibold leading-snug md:text-[1.25rem]',
                    'transition-[color,transform] duration-400 ease-brand',
                    /* a pergunta avança um passo no hover e volta ao ser
                       pressionada — o botão inteiro reage ao toque */
                    'group-hover/acc:translate-x-[3px] group-active/acc:translate-x-0',
                    isOpen ? 'text-fg' : 'text-fg-2 group-hover/acc:text-fg',
                  )}
                >
                  {item.q}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-[2px] grid h-11 w-11 shrink-0 place-items-center rounded-full border',
                    'transition-[background-color,border-color,color,transform] duration-500 ease-brand',
                    'group-active/acc:scale-90',
                    isOpen
                      ? 'border-transparent bg-brand-gradient text-on-brand shadow-[0_8px_22px_-12px_rgba(2,179,249,.9)]'
                      : 'border-hair text-fg-3 group-hover/acc:-translate-y-[2px] group-hover/acc:border-brand-2/50 group-hover/acc:text-fg',
                  )}
                >
                  <Icon
                    name="chevron-down"
                    size={17}
                    className={cn(
                      'transition-transform duration-500 ease-brand',
                      isOpen ? 'rotate-180' : 'group-hover/acc:translate-y-[2px]',
                    )}
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
