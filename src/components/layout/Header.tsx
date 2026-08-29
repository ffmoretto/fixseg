'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { mainNav } from '@/config/navigation';
import { CTA } from '@/config/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import Logo from '@/components/brand/Logo';
import Icon from '@/components/icons';
import { LinkButton } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * Header fixo que muda de aparência ao rolar (altura, fundo, blur e borda),
 * com barra de progresso de leitura e menu lateral animado em mobile.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();

  /* fecha o menu ao trocar de rota */
  useEffect(() => setOpen(false), [pathname]);

  /* trava o scroll do body com o menu aberto */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* fecha no ESC */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  /* estado "rolado" + progresso de leitura */
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 'top -12',
      end: 'max',
      onUpdate: (self) => setScrolled(self.progress > 0 || self.scroll() > 12),
      onToggle: (self) => setScrolled(self.isActive),
    });

    const progressTween = progressRef.current
      ? gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
          },
        )
      : null;

    return () => {
      st.kill();
      progressTween?.scrollTrigger?.kill();
      progressTween?.kill();
    };
  }, []);

  /* entrada sequencial do header (etapa 1 da primeira dobra) */
  useGSAP(
    () => {
      if (reduced) {
        gsap.set('[data-header-item]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-header-item]', {
        y: -18,
        opacity: 0,
        duration: 0.85,
        stagger: 0.07,
        delay: 0.15,
        ease: 'brand',
        clearProps: 'all',
      });
    },
    { dependencies: [reduced], scope: headerRef },
  );

  /* animação do painel mobile */
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const sheet = panel.querySelector('[data-mobile-sheet]');

      if (reduced) {
        gsap.set(panel, { autoAlpha: open ? 1 : 0 });
        gsap.set(sheet, { xPercent: open ? 0 : 100 });
        gsap.set('[data-mobile-item]', { opacity: 1, x: 0 });
        return;
      }

      if (open) {
        const tl = gsap.timeline();
        tl.set(panel, { autoAlpha: 1 })
          .fromTo(sheet, { xPercent: 100 }, { xPercent: 0, duration: 0.62, ease: 'brandOut' })
          .fromTo(
            panel.querySelectorAll('[data-mobile-item]'),
            { x: 26, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.055, ease: 'brand', clearProps: 'all' },
            '-=0.32',
          );
      } else {
        gsap.to(sheet, {
          xPercent: 100,
          duration: 0.42,
          ease: 'brandIn',
          onComplete: () => gsap.set(panel, { autoAlpha: 0 }),
        });
      }
    },
    { dependencies: [open, reduced] },
  );

  const wa = whatsappUrl();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-gradient focus:px-5 focus:py-3 focus:text-[.96875rem] focus:font-semibold focus:text-on-brand"
      >
        Ir para o conteúdo principal
      </a>

      <header
        ref={headerRef}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-brand',
          scrolled
            ? 'border-b border-hair bg-page/[.82] shadow-[0_10px_40px_-24px_rgba(0,0,0,.9)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          className={cn(
            'shell flex items-center justify-between gap-6 transition-[height] duration-500 ease-brand',
            scrolled ? 'h-[76px]' : 'h-[98px]',
          )}
        >
          <div data-header-item className="flex items-center">
            <Logo height={scrolled ? 40 : 48} animatable />
          </div>

          {/* navegação desktop */}
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-header-item
                className="group relative rounded-full px-3.5 py-2 text-[.96875rem] font-medium text-fg-2 transition-colors duration-300 hover:text-fg"
              >
                {item.label}
                <span className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[1.5px] origin-left scale-x-0 rounded-full bg-brand-gradient transition-transform duration-400 ease-brand group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div data-header-item>
              <ThemeToggle />
            </div>

            {wa && (
              <a
                data-header-item
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { placement: 'header' })}
                aria-label="Falar no WhatsApp"
                className="hidden h-11 w-11 place-items-center rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:border-brand-2/55 hover:text-fg sm:grid"
              >
                <Icon name="whatsapp" size={19} />
              </a>
            )}

            <div data-header-item className="hidden sm:block">
              <LinkButton
                href="/cotacao"
                size="sm"
                icon="arrow-right"
                onClick={() => track('cta_click', { placement: 'header', label: CTA.primary })}
              >
                {CTA.primary}
              </LinkButton>
            </div>

            {/* botão hambúrguer */}
            <button
              data-header-item
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-hair text-fg transition-colors duration-300 hover:border-brand-2/55 lg:hidden"
            >
              <span className="relative block h-[14px] w-[19px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'absolute left-0 h-[1.8px] rounded-full bg-current transition-all duration-400 ease-brand',
                      i === 0 && (open ? 'top-[6px] w-full rotate-45' : 'top-0 w-full'),
                      i === 1 && (open ? 'top-[6px] w-full opacity-0' : 'top-[6px] w-[13px]'),
                      i === 2 && (open ? 'top-[6px] w-full -rotate-45' : 'top-[12px] w-full'),
                    )}
                  />
                ))}
              </span>
            </button>
          </div>
        </div>

        {/* progresso de leitura */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0 h-[2px] overflow-hidden transition-opacity duration-500',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span ref={progressRef} className="block h-full origin-left scale-x-0 bg-brand-gradient" />
        </span>
      </header>

      {/* painel mobile */}
      <div
        ref={panelRef}
        id="menu-mobile"
        className="invisible fixed inset-0 z-[60] opacity-0 lg:hidden"
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 h-full w-full cursor-default bg-page/[.72] backdrop-blur-md"
        />

        <div
          data-mobile-sheet
          /* Atenção: NÃO usar classes de transform do Tailwind aqui
             (ex.: `translate-x-full`). O GSAP leria esse deslocamento como
             posição base e o painel terminaria a animação ainda fora da tela.
             A posição inicial é definida por JS, logo abaixo. */
          className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l border-hair bg-panel"
        >
          <div className="flex items-center justify-between border-b border-hair px-6 py-5">
            <Logo height={38} asLink={false} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              tabIndex={open ? 0 : -1}
              className="grid h-10 w-10 place-items-center rounded-full border border-hair text-fg-2 transition-colors hover:border-brand-2/55 hover:text-fg"
            >
              <Icon name="close" size={17} />
            </button>
          </div>

          <nav aria-label="Navegação principal (mobile)" className="flex-1 overflow-y-auto px-4 py-5">
            <ul className="flex flex-col gap-1">
              {mainNav.map((item, i) => (
                <li key={item.href} data-mobile-item>
                  <Link
                    href={item.href}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-[1.125rem] font-medium text-fg transition-colors duration-300 active:bg-tint/8"
                  >
                    <span className="flex items-baseline gap-3">
                      {/* numeração decorativa: oculta para leitores de tela,
                          para que o link seja anunciado apenas como "Seguros"
                          e não como "02 Seguros" */}
                      <span
                        aria-hidden="true"
                        className="font-mono text-[.8125rem] text-accent-ink/70"
                      >
                        0{i + 1}
                      </span>
                      {item.label}
                    </span>
                    <Icon name="chevron-right" size={16} className="text-fg-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div data-mobile-item className="flex flex-col gap-3 border-t border-hair px-5 py-6">
            <ThemeToggle variant="row" />

            <LinkButton
              href="/cotacao"
              size="md"
              full
              icon="arrow-right"
              onClick={() => {
                setOpen(false);
                track('cta_click', { placement: 'menu_mobile', label: CTA.primary });
              }}
            >
              {CTA.primary}
            </LinkButton>

            {wa && (
              <LinkButton
                href={wa}
                external
                variant="whatsapp"
                size="md"
                full
                icon="whatsapp"
                iconPosition="left"
                onClick={() => track('whatsapp_click', { placement: 'menu_mobile' })}
              >
                Falar no WhatsApp
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
