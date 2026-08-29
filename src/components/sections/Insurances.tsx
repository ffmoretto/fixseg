'use client';

import { useEffect, useRef, useState } from 'react';
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
 *  reage, borda que acende e elevação suave.
 *
 *  O estado "aceso" tem DUAS portas de entrada, e é o que faz o cartão
 *  responder também no celular: `:hover` para quem tem ponteiro, e o atributo
 *  `data-hot` para quem toca. Sem a segunda, num aparelho de toque o cartão
 *  ficava exatamente como um PNG — e, pior, o `:hover` do navegador móvel
 *  grudava depois do toque, deixando um cartão aceso para sempre.
 *
 *  `data-hot` é escrito direto no DOM, não em estado do React: o objetivo é não
 *  redesenhar onze cartões a cada dedo que encosta na tela. */
function InsuranceCard({ ins, index }: { ins: Insurance; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  /* Coordenada pendente + quadro agendado: o `mousemove` dispara muito mais
     vezes do que a tela se atualiza, e escrever a variável CSS a cada evento
     fazia o navegador repintar o gradiente várias vezes por quadro. Com o
     acúmulo, escrevemos uma vez por quadro — e só quando há quadro. */
  const pending = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const flush = () => {
    frame.current = 0;
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    el.style.setProperty('--mx', `${p.x}%`);
    el.style.setProperty('--my', `${p.y}%`);
  };

  const aim = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pending.current = {
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
    };
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      data-reveal-item
      data-card
      data-anim="rise"
      onMouseMove={(e) => {
        if (!reduced) aim(e.clientX, e.clientY);
      }}
      onPointerDown={(e) => {
        /* no toque não existe hover: o cartão acende ao ser tocado, com o
           brilho nascendo exatamente onde o dedo encostou */
        if (e.pointerType === 'mouse') return;
        aim(e.clientX, e.clientY);
        ref.current?.setAttribute('data-hot', 'true');
      }}
      className={cn(
        'group/card surface relative flex flex-col overflow-hidden p-6 md:p-7',
        'transition-[transform,border-color,box-shadow] duration-500 ease-brand',
        'hover:-translate-y-1.5 hover:border-brand-2/40 hover:shadow-glow',
        'data-[hot=true]:-translate-y-1.5 data-[hot=true]:border-brand-2/40 data-[hot=true]:shadow-glow',
        /* teclado: quem chega pelo Tab vê o mesmo cartão que quem passa o mouse */
        'focus-within:-translate-y-1.5 focus-within:border-brand-2/40 focus-within:shadow-glow',
      )}
    >
      {/* brilho que acompanha o cursor (posição em --mx/--my) */}
      <span
        aria-hidden="true"
        className="cursor-spot group-hover/card:opacity-100 group-focus-within/card:opacity-100 group-data-[hot=true]/card:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            'grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-hair icon-tile text-accent-ink',
            'transition-[border-color,color,transform,box-shadow] duration-500 ease-brand',
            'group-hover/card:-translate-y-[3px] group-hover/card:border-brand-2/45 group-hover/card:text-fg',
            'group-data-[hot=true]/card:-translate-y-[3px] group-data-[hot=true]/card:border-brand-2/45 group-data-[hot=true]/card:text-fg',
          )}
        >
          {/* reflexo que atravessa a peça do ícone junto com o cartão */}
          <span
            aria-hidden="true"
            className="sheen-layer group-hover/card:animate-sheen-pass group-data-[hot=true]/card:animate-sheen-pass"
          />
          <Icon
            name={ins.icon}
            size={27}
            className={cn(
              'relative z-[1] transition-transform duration-500 ease-brand',
              'group-hover/card:-rotate-6 group-hover/card:scale-110',
              'group-data-[hot=true]/card:-rotate-6 group-data-[hot=true]/card:scale-110',
            )}
          />
        </span>

        <span
          className={cn(
            'mt-1 font-mono text-[.8125rem] text-fg-4 transition-colors duration-500',
            'group-hover/card:text-accent-ink/60 group-data-[hot=true]/card:text-accent-ink/60',
          )}
        >
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
          className={cn(
            'group/btn relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-hair px-4 py-2.5',
            'text-[.9375rem] font-semibold text-fg transition-all duration-300 ease-brand',
            'hover:border-brand-2/60 hover:bg-brand-2/[.09] active:scale-[.96] active:duration-[90ms]',
            /* quando o cartão inteiro acende, a borda do botão acende junto */
            'group-data-[hot=true]/card:border-brand-2/60',
          )}
        >
          <span className="sheen-layer group-hover/btn:animate-sheen-pass" aria-hidden="true" />
          <span className="relative z-[1]">Conhecer</span>
          {/* a seta avança no hover do próprio botão E quando o cartão acende */}
          <Icon
            name="arrow-right"
            size={15}
            className={cn(
              'relative z-[1] transition-transform duration-300 ease-brand',
              'group-hover/btn:translate-x-[4px] group-active/btn:translate-x-[6px]',
              'group-data-[hot=true]/card:translate-x-[4px]',
            )}
          />
        </Link>

        <Link
          href={`/cotacao?seguro=${ins.slug}`}
          onClick={() => track('cta_click', { placement: 'card_seguro', label: ins.name })}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[.9375rem] font-semibold text-fg-3 transition-[color,transform] duration-300 hover:text-accent-ink active:scale-[.96] active:duration-[90ms]"
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

  /* Só UM cartão fica aceso por vez no toque. Um ouvinte na seção inteira
     resolve os onze: ao tocar em qualquer lugar, apaga todos os que não contêm
     o alvo. Sem isto, cada cartão tocado ficaria aceso até a página recarregar
     — que é o mesmo defeito do `:hover` grudado que o `data-hot` veio corrigir. */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      document.querySelectorAll<HTMLElement>('[data-card][data-hot="true"]').forEach((card) => {
        if (!target || !card.contains(target)) card.removeAttribute('data-hot');
      });
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

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
                  'relative min-h-[44px] overflow-hidden rounded-full px-4 py-2.5 text-[.9375rem] font-semibold',
                  'transition-all duration-400 ease-brand active:scale-[.96] active:duration-[90ms]',
                  filter === f.key
                    ? 'bg-brand-gradient text-on-brand shadow-[0_8px_24px_-12px_rgba(2,179,249,.8)]'
                    : 'text-fg-3 hover:-translate-y-[2px] hover:bg-tint/6 hover:text-fg',
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
