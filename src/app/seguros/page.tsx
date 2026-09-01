import type { Metadata } from 'next';
import Link from 'next/link';
import { insurances } from '@/config/insurances';
import { site } from '@/config/site';
import { breadcrumbSchema, JsonLd, servicesSchema } from '@/lib/seo';
import Icon from '@/components/icons';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Seguros',
  description:
    'Todos os seguros da FIXSEG: vida, auto, frota, caminhão, transportes de carga, residencial, empresarial, responsabilidade civil, garantia e riscos diversos.',
  alternates: { canonical: '/seguros' },
  openGraph: { url: `${site.url}/seguros` },
};

export default function SegurosPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seguros', path: '/seguros' },
          ]),
          servicesSchema(
            insurances.map((i) => ({ name: i.name, description: i.description, slug: i.slug })),
          ),
        ]}
      />

      <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-55" />
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
              <li className="font-medium text-fg-2">Seguros</li>
            </ol>
          </nav>

          <div className="max-w-[44rem]">
            <span className="eyebrow">
              Portfólio completo
            </span>
            <h1 className="mt-5 text-display-lg font-semibold text-fg">
              Seguros para <span className="text-gradient-brand">pessoas e empresas</span>
            </h1>
            <p className="mt-5 text-[1.125rem] leading-relaxed text-fg-3">
              Escolha um produto para ver as coberturas e solicitar a cotação. Se a sua necessidade
              não estiver na lista, fale com um especialista — trabalhamos também com riscos fora do
              padrão.
            </p>
          </div>

          <Reveal stagger={0.05} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insurances.map((ins) => (
              <RevealItem key={ins.slug} anim="rise">
                <Link
                  href={`/seguros/${ins.slug}`}
                  className="group surface flex h-full flex-col p-6 transition-[transform,border-color,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:border-brand-2/40 hover:shadow-glow"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-hair bg-tint/[.035] text-accent-ink transition-colors duration-500 group-hover:border-brand-2/45 group-hover:text-fg">
                    <Icon name={ins.icon} size={25} />
                  </span>
                  <h2 className="mt-5 font-display text-[1.1875rem] font-semibold text-fg">
                    {ins.name}
                  </h2>
                  <p className="mt-2 flex-1 text-[.96875rem] leading-relaxed text-fg-3">
                    {ins.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[.9375rem] font-semibold text-accent-ink">
                    Ver coberturas
                    <Icon
                      name="arrow-right"
                      size={15}
                      className="transition-transform duration-300 ease-brand group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </Reveal>

          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <LinkButton href="/cotacao" size="lg" icon="arrow-right">
              Solicite uma cotação
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
