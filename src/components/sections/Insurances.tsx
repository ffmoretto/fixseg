'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { insurances, type Insurance } from '@/config/insurances';
import { whatsappForInsurance } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/Button';

type Filter = 'todos' | 'pessoa' | 'empresa';

const filters: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pessoa', label: 'Para você e sua família' },
  { key: 'empresa', label: 'Para sua empresa' },
];

/** Card de produto com microinterações: brilho que segue o cursor, ícone que
 *  reage, borda que acende e elevação suave. */
function InsuranceCard({ ins, index }: { ins: Insurance; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={ref}
      data-reveal-item
      data-anim="rise"
      onMouseMove={onMove}
      className="group/card surface relative flex flex-col overflow-hidden p-6 transition-[transform,border-color,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:border-brand-2/40 hover:shadow-glow md:p-7"
    >
      {/* brilho que acompanha o cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            'radial-gradient(340px circle at var(--mx,50%) var(--my,0%), rgb(var(--brand-2) / .13), transparent 62%)',
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-hair icon-tile text-accent-ink transition-all duration-500 ease-brand group-hover/card:border-brand-2/45 group-hover/card:text-fg">
          <Icon
            name={ins.icon}
            size={27}
            className="transition-transform duration-500 ease-brand group-hover/card:scale-110"
          />
        </span>

        <span className="mt-1 font-mono text-[.8125rem] text-fg-4 transition-colors duration-500 group-hover/card:text-accent-ink/60">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <h3 className="relative mt-6 font-display text-[1.25rem] font-semibold leading-snug text-fg">
        {ins.name}
      </h3>
      <p className="relative mt-1.5 text-[.96875rem] font-medium text-accent-ink/85">
        {ins.short}
      </p>
      <p className="relative mt-3 flex-1 text-[.96875rem] leading-relaxed text-fg-3">
        {ins.description}
      </p>

      <div className="relative mt-6 flex items-center gap-2">
        <Link
          href={`/seguros/${ins.slug}`}
          onClick={() => track('insurance_view', { insurance: ins.slug })}
          className="group/btn inline-flex items-center gap-1.5 rounded-full border border-hair px-4 py-2.5 text-[.9375rem] font-semibold text-fg transition-all duration-300 ease-brand hover:border-brand-2/60 hover:bg-brand-2/[.09]"
        >
          Conhecer
          <Icon
            name="arrow-right"
            size={15}
            className="transition-transform duration-300 ease-brand group-hover/btn:translate-x-[3px]"
          />
        </Link>

        <Link
          href={`/cotacao?seguro=${ins.slug}`}
          onClick={() => track('cta_click', { placement: 'card_seguro', label: ins.name })}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[.9375rem] font-semibold text-fg-3 transition-colors duration-300 hover:text-accent-ink"
        >
          Cotar
        </Link>
      </div>
    </div>
  );
}

export function Insurances() {
  const [filter, setFilter] = useState<Filter>('todos');
  const gridRef = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();

  const visible = insurances.filter(
    (i) => filter === 'todos' || i.audience === filter || i.audience === 'ambos',
  );

  /* entrada em cascata dos cards */
  useGSAP(
    () => {
      const el = gridRef.current;
      if (!el) return;
      if (reduced) {
        el.querySelectorAll('[data-reveal-item]').forEach((n) => n.classList.add('is-in'));
        return;
      }
      const tween = gsap.to(el.querySelectorAll('[data-reveal-item]'), {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: 'brand',
        stagger: { each: 0.055, grid: 'auto', from: 'start' },
        clearProps: 'transform,opacity',
        onStart: () =>
          el.querySelectorAll('[data-reveal-item]').forEach((n) => n.classList.add('is-in')),
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reduced], scope: gridRef },
  );

  /* reordenação animada ao trocar o filtro */
  useGSAP(
    () => {
      if (reduced) return;
      const el = gridRef.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll('[data-reveal-item]'),
        { opacity: 0, y: 18, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.035,
          ease: 'brand',
          clearProps: 'transform,opacity',
        },
      );
    },
    { dependencies: [filter] },
  );

  const wa = whatsappForInsurance('seguros');

  return (
    <section id="seguros" className="relative scroll-mt-24 py-section">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Portfólio"
            title="Encontre a proteção ideal para você"
            highlight="proteção ideal"
            subtitle="Trabalhamos com pessoas físicas e jurídicas. Escolha o ponto de partida — o resto a gente estrutura junto."
            className="lg:max-w-[36rem]"
          />

          {/* filtros */}
          <div
            role="tablist"
            aria-label="Filtrar seguros por público"
            className="flex flex-wrap gap-1.5 rounded-full border border-hair bg-tint/[.03] p-1.5"
          >
            {filters.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-[.9375rem] font-semibold transition-all duration-400 ease-brand',
                  filter === f.key
                    ? 'bg-brand-gradient text-on-brand shadow-[0_8px_24px_-12px_rgba(2,179,249,.8)]'
                    : 'text-fg-3 hover:bg-tint/6 hover:text-fg',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5"
        >
          {visible.map((ins) => (
            <InsuranceCard key={ins.slug} ins={ins} index={insurances.indexOf(ins)} />
          ))}

          {/* card de conversão fechando a grade */}
          <div
            data-reveal-item
            data-anim="rise"
            className="surface-gradient-border relative flex flex-col justify-between overflow-hidden p-7"
          >
            <div
              aria-hidden="true"
              className="glow-a pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-70 blur-[52px]"
              
            />
            <div className="relative">
              <span className="eyebrow">
                <Icon name="spark" size={13} />
                Sob medida
              </span>
              <h3 className="mt-5 font-display text-display-sm text-fg">
                Não sabe qual seguro precisa?
              </h3>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-3">
                Descreva a situação e nós mapeamos o risco com você antes de indicar qualquer
                produto. Sem compromisso.
              </p>
            </div>

            <div className="relative mt-8 flex flex-col gap-2.5">
              <LinkButton href="/cotacao" size="md" icon="arrow-right" full>
                Solicite uma cotação
              </LinkButton>
              {wa && (
                <LinkButton
                  href={wa}
                  external
                  variant="secondary"
                  size="md"
                  icon="whatsapp"
                  iconPosition="left"
                  full
                  onClick={() => track('whatsapp_click', { placement: 'card_sob_medida' })}
                >
                  Falar no WhatsApp
                </LinkButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Insurances;
