'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { mainNav, calculadoraNav, calculadoraLabelCurto } from '@/config/navigation';
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
          /* `data-header-bar` é o que AnchorScroll mede para descontar a altura
             da barra na rolagem por âncora. Não remova. */
          data-header-bar
          className={cn(
            /* Folga de 16px entre logo, menu e ações. Com 24px a soma dos três
               blocos passava dos 1160px úteis da `shell` em 1440px. */
            'shell flex items-center justify-between gap-4 transition-[height] duration-500 ease-brand',
            /* A altura da barra acompanha a da logo, e é MENOR no celular
               porque a logo também é (ver abaixo). Ao mexer aqui, atualize
               `--header-h` em globals.css — é o valor que a rolagem por âncora
               desconta para o título da seção não parar atrás do cabeçalho — e
               remeça a narrativa no celular com `story-fit.mjs`. */
            scrolled ? 'h-[84px] md:h-[92px]' : 'h-[108px] md:h-[120px]',
          )}
        >
          <div data-header-item className="flex items-center">
            {/* 68px no desktop (56px rolado) e 56px no celular (46px rolado).
                Duas razões para o tamanho maior: a assinatura "Corretora de
                Seguros" ocupa 8% da altura da peça, então é ELA que define o
                tamanho mínimo legível — não o nome (ver ASSINATURA_ESCALA em
                LogoLockup). E a peça é larga: 2,58 × a altura, ou 175px a
                68px de altura, o que não caberia ao lado do menu num aparelho
                de 320px. */}
            <Logo
              height={scrolled ? 56 : 68}
              heightSm={scrolled ? 46 : 56}
              animatable
            />
          </div>

          {/* Navegação desktop — a partir de 1280px (xl), não de 1024px (lg).
              Os seis itens do menu ocupam cerca de 600px; somados à logo, ao
              seletor de tema, ao atalho da calculadora e ao CTA, passavam dos
              944px úteis da `shell` em 1024px e o último item era cortado.
              Entre 1024px e 1279px vale o menu lateral, que cabe sempre e não
              esconde nenhum item. */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-0.5 xl:flex"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-header-item
                className="group relative whitespace-nowrap rounded-full px-2.5 py-2 text-[.9375rem] font-medium text-fg-2 transition-colors duration-300 hover:text-fg"
              >
                {item.label}
                <span className="pointer-events-none absolute inset-x-2.5 bottom-1 h-[1.5px] origin-left scale-x-0 rounded-full bg-brand-gradient transition-transform duration-400 ease-brand group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div data-header-item>
              <ThemeToggle />
            </div>

            {/* Atalho da calculadora de bônus.
                Ocupa o lugar que era do botão redondo de WhatsApp, a pedido do
                cliente. O WhatsApp continua no botão flutuante da página e no
                menu mobile — só saiu daqui.
                A partir de 768px o botão mostra ícone + rótulo curto; entre
                640px e 767px, onde o CTA principal já disputa cada pixel com a
                logo, ele fica só com o ícone. O `aria-label` completo vale nos
                dois casos, então leitor de tela e busca por voz sempre
                anunciam a função inteira. Abaixo de 640px o atalho vive no
                menu lateral. */}
            <Link
              data-header-item
              href={calculadoraNav.href}
              aria-label={calculadoraNav.label}
              onClick={() =>
                track('cta_click', { placement: 'header', label: calculadoraNav.label })
              }
              className="hidden h-11 w-11 items-center justify-center gap-2 rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:border-brand-2/55 hover:text-fg sm:inline-flex md:w-auto md:px-4"
            >
              <Icon name="percent" size={19} className="shrink-0" />
              <span aria-hidden="true" className="hidden text-[.9375rem] font-medium md:inline">
                {calculadoraLabelCurto}
              </span>
            </Link>

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
              className="relative grid h-11 w-11 place-items-center rounded-full border border-hair text-fg transition-colors duration-300 hover:border-brand-2/55 xl:hidden"
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
        className="invisible fixed inset-0 z-[60] opacity-0 xl:hidden"
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

              {/* Calculadora de bônus: entra destacada, com ícone no lugar da
                  numeração decorativa, para não se confundir com as âncoras da
                  home — é uma página própria. */}
              <li data-mobile-item className="mt-2 border-t border-hair pt-2">
                <Link
                  href={calculadoraNav.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    setOpen(false);
                    track('cta_click', {
                      placement: 'menu_mobile',
                      label: calculadoraNav.label,
                    });
                  }}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 text-[1.125rem] font-medium text-fg transition-colors duration-300 active:bg-tint/8"
                >
                  <span className="flex items-center gap-3">
                    <Icon name="percent" size={17} className="shrink-0 text-accent-ink" />
                    {calculadoraNav.label}
                  </span>
                  <Icon name="chevron-right" size={16} className="text-fg-4" />
                </Link>
              </li>
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
