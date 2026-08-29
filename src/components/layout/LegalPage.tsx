import Link from 'next/link';
import { site } from '@/config/site';
import Icon from '@/components/icons';

export interface LegalSection {
  title: string;
  /** Parágrafos e listas. Strings simples são parágrafos; arrays são listas. */
  blocks: (string | string[])[];
}

interface Props {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
  breadcrumbLabel: string;
}

/**
 * Layout compartilhado das páginas legais.
 * Texto em coluna estreita, hierarquia clara e sumário lateral com âncoras —
 * um documento que a pessoa consegue ler, não um bloco de letra miúda.
 */
export function LegalPage({ title, updatedAt, intro, sections, breadcrumbLabel }: Props) {
  const anchor = (t: string) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  return (
    <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-40" />
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
            <li className="font-medium text-fg-2">{breadcrumbLabel}</li>
          </ol>
        </nav>

        <div className="grid gap-14 lg:grid-cols-[.34fr_.66fr] lg:gap-20">
          {/* sumário */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h1 className="text-display-md font-semibold text-fg">{title}</h1>
            <p className="mt-4 text-[.9375rem] text-fg-4">
              Última atualização: {updatedAt}
            </p>

            <nav aria-label="Sumário" className="mt-8 border-t border-hair pt-7">
              <p className="text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
                Nesta página
              </p>
              <ol className="mt-4 flex flex-col gap-2.5">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#${anchor(s.title)}`}
                      className="group flex gap-2.5 text-[.9375rem] text-fg-3 transition-colors duration-300 hover:text-fg"
                    >
                      <span className="font-mono text-accent-ink/60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* conteúdo */}
          <div className="min-w-0">
            <p className="max-w-prose text-[1.125rem] leading-relaxed text-fg-2">{intro}</p>

            {/* Aviso de documento pendente.
                Ele NÃO desaparece quando os dados institucionais são
                preenchidos: dado preenchido não é revisão jurídica feita. O que
                muda é o texto — enquanto falta dado, o aviso pede o dado;
                depois, pede a revisão. Para retirá-lo por completo, apague este
                bloco ao publicar a versão revisada. */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand-2/25 bg-brand-2/[.06] p-5">
              <Icon name="alert" size={17} className="mt-0.5 shrink-0 text-accent-ink" />
              <p className="text-[.9375rem] leading-relaxed text-fg-3">
                {!site.cnpj || !site.contact.email ? (
                  <>
                    <strong className="font-semibold text-fg">Documento a ser finalizado.</strong>{' '}
                    Este texto está estruturado conforme a LGPD (Lei nº 13.709/2018), mas depende
                    dos dados definitivos da corretora — razão social, CNPJ, endereço e e-mail do
                    encarregado de dados. Preencha em{' '}
                    <code className="text-accent-ink">src/config/site.ts</code> e submeta a versão
                    final à revisão jurídica antes de publicar.
                  </>
                ) : (
                  <>
                    <strong className="font-semibold text-fg">
                      Documento pendente de revisão jurídica.
                    </strong>{' '}
                    Os dados da corretora já constam corretamente e o texto está estruturado
                    conforme a LGPD (Lei nº 13.709/2018), mas ele foi redigido como base — submeta
                    à revisão de um advogado antes de considerá-lo definitivo.
                  </>
                )}
              </p>
            </div>

            <div className="mt-14 flex flex-col gap-14">
              {sections.map((s, i) => (
                <section key={s.title} id={anchor(s.title)} className="scroll-mt-28">
                  <h2 className="flex items-baseline gap-3 font-display text-[1.375rem] font-semibold text-fg">
                    <span className="font-mono text-[.9375rem] text-accent-ink/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </h2>

                  <div className="mt-5 flex flex-col gap-4">
                    {s.blocks.map((block, bi) =>
                      Array.isArray(block) ? (
                        <ul key={bi} className="flex flex-col gap-2.5">
                          {block.map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-2/70" />
                              <span className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          key={bi}
                          className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3"
                        >
                          {block}
                        </p>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LegalPage;
