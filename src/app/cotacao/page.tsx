import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { site } from '@/config/site';
import { breadcrumbSchema, JsonLd } from '@/lib/seo';
import Icon from '@/components/icons';
import QuoteForm from '@/components/sections/QuoteForm';

export const metadata: Metadata = {
  title: 'Cotação de seguros',
  description:
    'Solicite sua cotação de seguro em quatro etapas. Comparamos as principais seguradoras e um especialista retorna com o comparativo de coberturas.',
  alternates: { canonical: '/cotacao' },
  openGraph: {
    title: `Cotação de seguros · ${site.shortName}`,
    description:
      'Solicite sua cotação de seguro em quatro etapas e receba um comparativo entre seguradoras.',
    url: `${site.url}/cotacao`,
  },
};

export default function CotacaoPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Cotação', path: '/cotacao' },
        ])}
      />

      <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-55" />
          <div
            className="glow-band absolute left-1/2 top-[-14%] h-[54vw] max-h-[620px] w-[92vw] max-w-[1080px] -translate-x-1/2 rounded-full opacity-55 blur-[110px]"
            
          />
        </div>

        <div className="shell">
          {/* breadcrumb */}
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
              <li className="font-medium text-fg-2">Cotação</li>
            </ol>
          </nav>

          <div className="max-w-[46rem]">
            <span className="eyebrow">
              Cotação sem compromisso
            </span>
            <h1 className="mt-5 text-display-lg font-semibold text-fg">
              Encontre o seguro ideal <span className="text-gradient-brand">para você</span>
            </h1>
            <p className="mt-5 max-w-[54ch] text-[1.125rem] leading-relaxed text-fg-3">
              Quatro etapas rápidas. Você informa o essencial, nós consultamos as seguradoras e
              voltamos com o comparativo de coberturas explicado.
            </p>
          </div>

          <div className="mt-12 max-w-[54rem]">
            <Suspense
              fallback={
                <div className="surface grid min-h-[440px] place-items-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-hair border-t-accent-ink" />
                </div>
              }
            >
              <QuoteForm />
            </Suspense>
          </div>

          <p className="mt-8 max-w-[60ch] text-[.9375rem] leading-relaxed text-fg-4">
            A cotação é gratuita e não gera obrigação de contratação. As condições finais de
            cobertura, franquia e prêmio são definidas pela seguradora emissora na apólice.
          </p>
        </div>
      </section>
    </>
  );
}
