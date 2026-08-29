import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { insurances, insuranceBySlug } from '@/config/insurances';
import { steps } from '@/config/content';
import { site, CTA } from '@/config/site';
import { breadcrumbSchema, JsonLd } from '@/lib/seo';
import Icon from '@/components/icons';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';
import WhatsAppProductButton from './WhatsAppProductButton';

/** URLs amigáveis geradas estaticamente a partir da configuração. */
export function generateStaticParams() {
  return insurances.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ins = insuranceBySlug(slug);
  if (!ins) return { title: 'Seguro não encontrado' };

  const local = site.address.city ? ` em ${site.address.city}` : '';

  return {
    title: ins.name,
    description: `${ins.description} Cotação com atendimento personalizado${local}.`,
    keywords: ins.keywords,
    alternates: { canonical: `/seguros/${ins.slug}` },
    openGraph: {
      title: `${ins.name} · ${site.shortName}`,
      description: ins.description,
      url: `${site.url}/seguros/${ins.slug}`,
    },
  };
}

export default async function InsurancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ins = insuranceBySlug(slug);
  if (!ins) notFound();

  const others = insurances.filter((i) => i.slug !== ins.slug).slice(0, 3);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ins.name,
    description: ins.description,
    serviceType: ins.name,
    url: `${site.url}/seguros/${ins.slug}`,
    provider: { '@id': `${site.url}/#organizacao` },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Coberturas — ${ins.name}`,
      itemListElement: ins.coverage.map((c) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: c },
      })),
    },
  };

  return (
    <>
      <JsonLd
        data={[
          serviceSchema,
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seguros', path: '/seguros' },
            { name: ins.name, path: `/seguros/${ins.slug}` },
          ]),
        ]}
      />

      {/* ------------------------------------------------------------- topo */}
      <section className="relative overflow-hidden pb-16 pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-50" />
          <div
            className="glow-b absolute right-[-12%] top-[-16%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] rounded-full opacity-55 blur-[100px]"
            
          />
        </div>

        <div className="shell">
          <nav aria-label="Você está em" className="mb-9">
            <ol className="flex flex-wrap items-center gap-2 text-[.9375rem] text-fg-4">
              <li>
                <Link href="/" className="transition-colors hover:text-fg">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevron-right" size={13} />
              </li>
              <li>
                <Link href="/seguros" className="transition-colors hover:text-fg">
                  Seguros
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevron-right" size={13} />
              </li>
              <li className="font-medium text-fg-2">{ins.name}</li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <span className="grid h-16 w-16 place-items-center rounded-3xl border border-brand-2/30 bg-brand-2/[.09] text-accent-ink">
                <Icon name={ins.icon} size={30} />
              </span>

              <h1 className="mt-7 text-display-lg font-semibold text-fg">{ins.name}</h1>
              <p className="mt-4 font-display text-display-sm font-medium text-gradient-brand">
                {ins.short}
              </p>
              <p className="mt-5 max-w-[52ch] text-[1.125rem] leading-relaxed text-fg-3">
                {ins.description}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LinkButton
                  href={`/cotacao?seguro=${ins.slug}`}
                  size="lg"
                  icon="arrow-right"
                >
                  {CTA.quote}
                </LinkButton>
                <WhatsAppProductButton insuranceName={ins.name} />
              </div>
            </div>

            {/* coberturas */}
            <Reveal anim="rise" className="min-w-0">
              <div className="surface-gradient-border relative overflow-hidden p-7 md:p-9">
                <h2 className="eyebrow">
                  <Icon name="shield-check" size={14} />
                  O que costuma estar coberto
                </h2>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {ins.coverage.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-2/[.14] text-accent-ink">
                        <Icon name="check" size={11} />
                      </span>
                      <span className="text-[1.0625rem] leading-relaxed text-fg-2">{c}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 border-t border-hair pt-5 text-[.875rem] leading-relaxed text-fg-4">
                  As coberturas efetivas, limites, franquias e exclusões variam conforme a
                  seguradora e o produto escolhido, e constam na apólice emitida.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- como contratar */}
      <section className="relative py-section">
        <div className="shell">
          <h2 className="max-w-[24ch] text-display-md font-semibold text-fg">
            Como contratar seu {ins.name.toLowerCase()}
          </h2>

          <Reveal stagger={0.07} className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((s) => (
              <RevealItem key={s.n} anim="rise" className="surface flex flex-col p-6">
                <span className="font-mono text-[.9375rem] font-semibold text-accent-ink/70">
                  {s.n}
                </span>
                <span className="mt-4 text-accent-ink">
                  <Icon name={s.icon} size={22} />
                </span>
                <h3 className="mt-4 font-display text-[1.0625rem] font-semibold leading-snug text-fg">
                  {s.title}
                </h3>
                <p className="mt-2 text-[.9375rem] leading-relaxed text-fg-3">{s.text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ outros */}
      <section className="relative pb-section">
        <div className="shell">
          <div className="hairline" />
          <h2 className="mt-14 text-display-sm font-semibold text-fg">
            Outros seguros que podem interessar
          </h2>

          <Reveal stagger={0.07} className="mt-8 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <RevealItem key={o.slug} anim="rise">
                <Link
                  href={`/seguros/${o.slug}`}
                  className="group surface flex h-full items-start gap-4 p-6 transition-[transform,border-color] duration-500 ease-brand hover:-translate-y-1 hover:border-brand-2/40"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair text-accent-ink transition-colors duration-500 group-hover:border-brand-2/45 group-hover:text-fg">
                    <Icon name={o.icon} size={20} />
                  </span>
                  <span>
                    <span className="block font-display text-[1.0625rem] font-semibold text-fg">
                      {o.name}
                    </span>
                    <span className="mt-1.5 block text-[.9375rem] leading-relaxed text-fg-3">
                      {o.short}
                    </span>
                  </span>
                  <Icon
                    name="arrow-up-right"
                    size={16}
                    className="ml-auto shrink-0 text-fg-4 transition-all duration-500 ease-brand group-hover:translate-x-0.5 group-hover:text-accent-ink"
                  />
                </Link>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
