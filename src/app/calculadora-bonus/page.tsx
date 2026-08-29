import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import {
  CLASSE_MAX,
  DIAS_VIGENCIA_PARA_AVANCO,
  DIAS_VIGENCIA_PARA_TRANSFERIR,
  EXPLICACAO,
  FAIXAS_ATRASO,
  FAIXAS_DESCONTO,
  FAQ_BONUS,
  TEXTOS,
} from '@/config/bonus';
import { breadcrumbSchema, JsonLd } from '@/lib/seo';
import Icon from '@/components/icons';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import BonusCalculator from '@/components/sections/BonusCalculator';

/**
 * =============================================================================
 * /calculadora-bonus
 * =============================================================================
 * Página da calculadora de bônus do seguro auto. O topo segue o mesmo
 * tratamento da página de cotação (grade técnica + brilho, migalha de pão,
 * título e subtítulo), e abaixo da ferramenta vem o conteúdo explicativo.
 *
 * O que está escrito aqui é informação pública sobre o funcionamento do seguro
 * auto no Brasil. Nenhum percentual é apresentado como promessa: a tabela de
 * faixas é explicitamente rotulada como típica de mercado e variável por
 * seguradora, e a ressalva sobre a classe definitiva aparece tanto no
 * resultado da calculadora quanto no texto da página.
 * =============================================================================
 */

const descricao =
  'Calcule a classe de bônus estimada da renovação do seu seguro auto. Escala de 0 a 10, ' +
  'considerando sinistros no período e os dias corridos desde o vencimento da apólice. ' +
  'O cálculo roda no seu navegador e é uma estimativa.';

export const metadata: Metadata = {
  title: 'Calculadora de bônus do seguro auto',
  description: descricao,
  keywords: [
    'calculadora de bônus',
    'classe de bônus seguro auto',
    'bônus seguro auto',
    'perder bônus do seguro',
    'renovação de seguro auto',
  ],
  alternates: { canonical: '/calculadora-bonus' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: `Calculadora de bônus do seguro auto · ${site.shortName}`,
    description: descricao,
    url: `${site.url}/calculadora-bonus`,
    siteName: site.legalName,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `Calculadora de bônus do seguro auto — ${site.legalName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Calculadora de bônus do seguro auto · ${site.shortName}`,
    description: descricao,
    images: ['/opengraph-image'],
  },
};

function faqBonusSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_BONUS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export default function CalculadoraBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Calculadora de bônus', path: '/calculadora-bonus' },
          ]),
          faqBonusSchema(),
        ]}
      />

      {/* ==================================================== topo + ferramenta */}
      <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-55" />
          <div className="glow-band absolute left-1/2 top-[-14%] h-[54vw] max-h-[620px] w-[92vw] max-w-[1080px] -translate-x-1/2 rounded-full opacity-55 blur-[110px]" />
        </div>

        <div className="shell">
          {/* migalha de pão */}
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
              <li className="font-medium text-fg-2">Calculadora de bônus</li>
            </ol>
          </nav>

          <div className="max-w-[46rem]">
            <span className="eyebrow">
              <Icon name="percent" size={13} />
              Seguro auto
            </span>
            <h1 className="mt-5 text-display-lg font-semibold text-fg">
              Qual será sua classe de bônus{' '}
              <span className="text-gradient-brand">na renovação</span>
            </h1>
            <p className="mt-5 max-w-[54ch] text-[1.125rem] leading-relaxed text-fg-3">
              Informe os dados da apólice que está vencendo e veja a classe estimada da próxima,
              pela escala de 0 a {CLASSE_MAX} usada no mercado brasileiro. Leva menos de um
              minuto e nada do que você digitar sai do seu navegador.
            </p>
          </div>

          <div className="mt-12 max-w-[54rem]">
            <BonusCalculator />
          </div>

          <p className="mt-8 max-w-[62ch] text-[.9375rem] leading-relaxed text-fg-4">
            {TEXTOS.ressalva}
          </p>
        </div>
      </section>

      {/* ========================================================== o que é ==== */}
      <section className="relative border-t border-hair py-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Entendendo a escala"
            title={EXPLICACAO.oQueE.titulo}
            size="md"
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {EXPLICACAO.oQueE.paragrafos.map((p) => (
              <Reveal key={p.slice(0, 24)} anim="up">
                <p className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3">{p}</p>
              </Reveal>
            ))}
          </div>

          {/* ganha / perde */}
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <Reveal anim="up" className="surface p-7 md:p-8">
              <h3 className="flex items-center gap-3 font-display text-[1.25rem] font-semibold text-fg">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-2/40 bg-brand-2/[.1] text-accent-ink">
                  <Icon name="trending-up" size={19} />
                </span>
                {EXPLICACAO.comoGanha.titulo}
              </h3>
              <ul className="mt-6 flex flex-col gap-3.5">
                {EXPLICACAO.comoGanha.itens.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon
                      name="check-circle"
                      size={18}
                      className="mt-[3px] shrink-0 text-accent-ink"
                    />
                    <span className="text-[1.0625rem] leading-relaxed text-fg-3">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal anim="up" delay={0.1} className="surface p-7 md:p-8">
              <h3 className="flex items-center gap-3 font-display text-[1.25rem] font-semibold text-fg">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hair bg-tint/[.05] text-fg-2">
                  <Icon name="trending-down" size={19} />
                </span>
                {EXPLICACAO.comoPerde.titulo}
              </h3>
              <ul className="mt-6 flex flex-col gap-3.5">
                {EXPLICACAO.comoPerde.itens.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon name="alert" size={18} className="mt-[3px] shrink-0 text-fg-4" />
                    <span className="text-[1.0625rem] leading-relaxed text-fg-3">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* faixas de atraso */}
          <Reveal anim="up" className="surface mt-5 p-7 md:p-8">
            <h3 className="font-display text-[1.25rem] font-semibold text-fg">
              O que o atraso na renovação custa
            </h3>
            <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-fg-3">
              A contagem começa no vencimento da apólice anterior, em dias corridos. Os trinta
              primeiros dias não custam nada; a partir daí, cada bloco de trinta dias iniciado
              derruba uma classe.
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FAIXAS_ATRASO.map((faixa) => (
                <li
                  key={faixa.blocos}
                  className="flex items-center justify-between gap-3 rounded-xl border border-hair bg-tint/[.025] px-4 py-3"
                >
                  <span className="text-[.96875rem] text-fg-2">{faixa.rotulo}</span>
                  <span
                    className={cnFaixa(faixa.blocos)}
                  >
                    {faixa.efeito}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ========================================================== tabela ===== */}
      <section className="relative border-t border-hair py-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Referência"
            title={EXPLICACAO.tabela.titulo}
            subtitle={EXPLICACAO.tabela.intro}
            size="md"
          />

          <Reveal anim="up" className="mt-10">
            <div className="surface overflow-hidden">
              {/* A tabela rola dentro do próprio contêiner: em 390px uma tabela
                  de duas colunas com percentuais não cabe sem isso, e a página
                  passaria a rolar de lado. */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-left">
                  <caption className="border-b border-hair px-6 py-4 text-left text-[.9375rem] leading-relaxed text-fg-4">
                    {TEXTOS.faixaAviso} Os percentuais abaixo não são oferta, proposta nem
                    garantia de preço.
                  </caption>
                  <thead>
                    <tr className="border-b border-hair">
                      <th
                        scope="col"
                        className="px-6 py-4 text-[.875rem] font-semibold uppercase tracking-[0.14em] text-fg-4"
                      >
                        Classe de bônus
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-[.875rem] font-semibold uppercase tracking-[0.14em] text-fg-4"
                      >
                        Faixa típica de desconto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FAIXAS_DESCONTO.map((faixa) => (
                      <tr key={faixa.classe} className="border-b border-hair last:border-b-0">
                        <th
                          scope="row"
                          className="px-6 py-3.5 text-[1.0625rem] font-semibold text-fg"
                        >
                          Classe {faixa.classe}
                        </th>
                        <td className="px-6 py-3.5 text-[1.0625rem] text-fg-2">
                          <span className="inline-flex items-center gap-3">
                            {/* barra proporcional: leitura rápida da escala */}
                            <span
                              aria-hidden="true"
                              className="hidden h-[6px] w-24 overflow-hidden rounded-full bg-tint/10 sm:block"
                            >
                              <span
                                className="block h-full rounded-full bg-brand-gradient"
                                style={{ width: `${(faixa.max / 55) * 100}%` }}
                              />
                            </span>
                            {faixa.rotulo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal anim="up" className="mt-6">
            <p className="max-w-prose text-[.9375rem] leading-relaxed text-fg-4">
              Regras de vigência que também entram na conta: uma apólice precisa ter vigorado ao
              menos {DIAS_VIGENCIA_PARA_AVANCO} dias para dar direito ao avanço de classe, e com
              menos de {DIAS_VIGENCIA_PARA_TRANSFERIR} dias o bônus não se transfere para a
              apólice nova.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================= FAQ ===== */}
      <section className="relative border-t border-hair py-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Dúvidas frequentes"
            title="Perguntas sobre o bônus"
            size="md"
          />

          <Reveal anim="up" className="mt-10 max-w-[54rem]">
            <Accordion items={FAQ_BONUS} defaultOpen={-1} />
          </Reveal>

          <Reveal anim="up" className="mt-12">
            <p className="max-w-prose text-[1.0625rem] leading-relaxed text-fg-3">
              Ainda com dúvida sobre a sua classe?{' '}
              <Link
                href="/cotacao?seguro=seguro-auto"
                className="font-medium text-accent-ink underline decoration-brand-2/40 underline-offset-2 transition-colors hover:decoration-brand-2"
              >
                Peça uma cotação de seguro auto
              </Link>{' '}
              e conferimos o histórico junto com você, sem compromisso.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** Realce do efeito conforme a gravidade do atraso. */
function cnFaixa(blocos: number): string {
  const base = 'shrink-0 text-[.9375rem] font-semibold';
  if (blocos === 0) return `${base} text-accent-ink`;
  if (blocos >= 11) return `${base} text-red-300`;
  return `${base} text-fg-3`;
}
