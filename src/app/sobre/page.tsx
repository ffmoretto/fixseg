import type { Metadata } from 'next';
import Link from 'next/link';
import { about, stats } from '@/config/content';
import { site, CTA } from '@/config/site';
import { breadcrumbSchema, JsonLd } from '@/lib/seo';
import Icon from '@/components/icons';
import Counter from '@/components/ui/Counter';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

/**
 * =============================================================================
 * PÁGINA "SOBRE NÓS"
 * =============================================================================
 * Esta seção já morou na home e saiu de lá porque a página estava longa demais.
 * O conteúdo não foi descartado: virou rota própria, que é o lugar certo de um
 * texto institucional — quem quer saber quem é a corretora clica para saber,
 * em vez de atravessar o assunto a caminho da cotação.
 *
 * O texto continua vindo de `about` em `src/config/content.ts`, e os indicadores
 * de `stats`. Os indicadores só aparecem quando têm valor real: enquanto
 * `value` for `null`, o bloco inteiro é omitido. Nada é inventado.
 * =============================================================================
 */
export const metadata: Metadata = {
  title: 'Sobre nós',
  description:
    'Quem é a FIXSEG: como trabalhamos, o que analisamos antes de recomendar uma apólice e por que a corretora importa mais na hora do sinistro.',
  alternates: { canonical: '/sobre' },
  openGraph: { url: `${site.url}/sobre` },
};

export default function SobrePage() {
  const visibleStats = stats.filter((s) => s.value !== null);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Sobre nós', path: '/sobre' },
        ])}
      />

      <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-55" />
          <div className="glow-a absolute -right-[12%] top-[-18%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] rounded-full opacity-50 blur-[120px]" />
        </div>

        <div className="shell">
          <nav aria-label="Você está em" className="mb-9">
            <ol className="flex items-center gap-2 text-[.9375rem] text-fg-4">
              <li>
                <Link href="/" className="transition-colors hover:text-fg">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevron-right" size={13} />
              </li>
              <li className="font-medium text-fg-2">Sobre nós</li>
            </ol>
          </nav>

          <div className="max-w-[46rem]">
            <span className="eyebrow">{about.eyebrow}</span>
            <h1 className="mt-5 text-display-lg font-semibold text-fg">
              Segurança para hoje.{' '}
              <span className="text-gradient-brand">Tranquilidade para amanhã.</span>
            </h1>
          </div>

          <Reveal stagger={0.1} className="mt-10 flex max-w-[62rem] flex-col gap-5">
            {about.paragraphs.map((p, i) => (
              <RevealItem
                key={i}
                as="p"
                className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3 md:text-[1.125rem]"
              >
                {p}
              </RevealItem>
            ))}
          </Reveal>

          {/* --------------------------------------------------------- pilares */}
          <Reveal stagger={0.09} className="mt-16 grid gap-4 md:grid-cols-3">
            {about.pillars.map((pillar, i) => (
              <RevealItem
                key={pillar.title}
                anim="rise"
                className="group/p surface relative flex h-full flex-col overflow-hidden p-7 transition-[border-color,transform,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:border-brand-2/35 hover:shadow-lift"
              >
                <span aria-hidden="true" className="sheen-layer group-hover/p:animate-sheen-pass" />
                <span className="relative font-mono text-[.875rem] font-semibold text-accent-ink/60 transition-colors duration-500 group-hover/p:text-accent-ink">
                  0{i + 1}
                </span>
                <h2 className="relative mt-4 font-display text-[1.1875rem] font-semibold text-fg">
                  {pillar.title}
                </h2>
                <p className="relative mt-2.5 text-[.96875rem] leading-relaxed text-fg-3">
                  {pillar.text}
                </p>
              </RevealItem>
            ))}
          </Reveal>

          {/* ---------------------------------------------------- indicadores
              Só com dado real preenchido em `content.ts` → `stats`. */}
          {visibleStats.length > 0 && (
            <Reveal
              stagger={0.08}
              className="relative mt-5 grid grid-cols-2 gap-4 overflow-hidden rounded-3xl border border-hair bg-tint/[.025] p-7 md:grid-cols-4"
            >
              <span
                aria-hidden="true"
                className="glow-b pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-60 blur-[54px]"
              />
              {visibleStats.map((s) => (
                <RevealItem key={s.label} anim="scale" className="relative text-left">
                  <p className="font-display text-display-sm font-semibold text-fg">
                    <Counter
                      value={s.value as number}
                      prefix={s.prefix ?? ''}
                      suffix={s.suffix ?? ''}
                      className="text-gradient-brand"
                    />
                  </p>
                  <p className="mt-1.5 text-[.875rem] font-medium uppercase tracking-[0.12em] text-fg-4">
                    {s.label}
                  </p>
                </RevealItem>
              ))}
            </Reveal>
          )}

          {/* ------------------------------------------------------------- CTA */}
          <Reveal anim="rise" className="surface-gradient-border relative mt-16 overflow-hidden">
            <div
              aria-hidden="true"
              className="glow-panel pointer-events-none absolute -inset-[8%] animate-drift-a opacity-80"
            />
            <div className="relative flex flex-col items-start justify-between gap-7 p-8 md:flex-row md:items-center md:p-11">
              <div>
                <span className="eyebrow">Próximo passo</span>
                <h2 className="mt-4 max-w-[26ch] font-display text-display-sm font-semibold text-fg">
                  Vamos olhar a sua proteção juntos?
                </h2>
                <p className="mt-3 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-3">
                  Analisamos as apólices que você já tem e apontamos lacunas de cobertura — sem
                  custo e sem obrigação de trocar de corretora.
                </p>
              </div>
              <LinkButton href="/cotacao" size="lg" icon="arrow-right" className="shrink-0">
                {CTA.patrimony}
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
