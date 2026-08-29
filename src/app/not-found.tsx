import Link from 'next/link';
import { insurances } from '@/config/insurances';
import Icon from '@/components/icons';
import { LinkButton } from '@/components/ui/Button';

export const metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen-dvh items-center overflow-hidden py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-50" />
      </div>

      <div className="shell max-w-[46rem] text-center">
        <p className="font-mono text-[.9375rem] font-semibold uppercase tracking-[0.2em] text-accent-ink">
          Erro 404
        </p>
        <h1 className="mt-6 text-display-lg font-semibold text-fg">
          Esta página <span className="text-gradient-brand">não existe</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-[1.125rem] leading-relaxed text-fg-3">
          O endereço pode ter mudado ou o link estar incompleto. Você pode voltar ao início ou ir
          direto para um dos nossos seguros.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/" size="lg" icon="arrow-right">
            Voltar ao início
          </LinkButton>
          <LinkButton href="/cotacao" variant="secondary" size="lg">
            Solicitar uma cotação
          </LinkButton>
        </div>

        <div className="mt-14">
          <p className="text-[.875rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
            Seguros mais procurados
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {insurances.slice(0, 6).map((ins) => (
              <li key={ins.slug}>
                <Link
                  href={`/seguros/${ins.slug}`}
                  className="flex items-center gap-2 rounded-full border border-hair bg-tint/[.035] px-3.5 py-2 text-[.9375rem] text-fg-2 transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:border-brand-2/50 hover:text-fg"
                >
                  <Icon name={ins.icon} size={15} className="text-accent-ink" />
                  {ins.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
