import type { Metadata } from 'next';
import Link from 'next/link';
import { faq } from '@/config/content';
import { site } from '@/config/site';
import { breadcrumbSchema, faqSchema, JsonLd } from '@/lib/seo';
import Icon from '@/components/icons';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

/**
 * =============================================================================
 * PÁGINA "DÚVIDAS FREQUENTES"
 * =============================================================================
 * As perguntas moravam na home e saíram de lá a pedido do cliente — a página
 * estava longa demais. Virar rota própria resolve dois problemas de uma vez: a
 * home encurta e o conteúdo ganha um endereço que pode ser compartilhado,
 * indexado e linkado de dentro do site.
 *
 * -----------------------------------------------------------------------------
 * O `FAQPage` VOLTOU A SER EMITIDO — E AQUI ELE É LEGÍTIMO
 * -----------------------------------------------------------------------------
 * Quando a seção saiu da home, o structured data saiu junto: declarar perguntas
 * ao Google numa página onde elas não aparecem é contra as diretrizes dele e
 * rende aviso no Search Console. Nesta página as perguntas ESTÃO visíveis, com
 * as respostas no HTML (o acordeão esconde com `hidden`, não omite), então o
 * `faqSchema()` descreve exatamente o que o visitante vê.
 * =============================================================================
 */
export const metadata: Metadata = {
  title: 'Dúvidas frequentes',
  description:
    'Respostas às perguntas mais comuns sobre cotação, contratação, documentos, comparação entre seguradoras e atendimento de sinistro.',
  alternates: { canonical: '/duvidas-frequentes' },
  openGraph: { url: `${site.url}/duvidas-frequentes` },
};

export default function DuvidasFrequentesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Dúvidas frequentes', path: '/duvidas-frequentes' },
          ]),
          faqSchema(),
        ]}
      />

      <section className="relative overflow-hidden pb-section pt-[136px] md:pt-[164px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-tech-grid opacity-55" />
          <div className="glow-b absolute -left-[10%] top-[-14%] h-[42vw] max-h-[520px] w-[42vw] max-w-[520px] rounded-full opacity-50 blur-[120px]" />
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
              <li className="font-medium text-fg-2">Dúvidas frequentes</li>
            </ol>
          </nav>

          <div className="max-w-[46rem]">
            <span className="eyebrow">Perguntas e respostas</span>
            <h1 className="mt-5 text-display-lg font-semibold text-fg">
              O que as pessoas <span className="text-gradient-brand">mais perguntam</span>
            </h1>
            <p className="mt-5 text-[1.125rem] leading-relaxed text-fg-3">
              Reunimos aqui as dúvidas que aparecem em quase toda primeira conversa. Se a sua não
              estiver na lista, é só chamar no WhatsApp — a resposta não custa nada e não gera
              compromisso.
            </p>
          </div>

          <Reveal anim="up" className="mt-14 grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:gap-14">
            <Accordion items={faq} />

            {/* coluna de apoio: para quem não achou a resposta */}
            <aside className="lg:sticky lg:top-[140px] lg:self-start">
              <div className="surface relative overflow-hidden p-7">
                <span
                  aria-hidden="true"
                  className="glow-a pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-70 blur-[52px]"
                />
                <div className="relative">
                  <span className="eyebrow">Ainda com dúvida?</span>
                  <h2 className="mt-4 font-display text-[1.375rem] font-semibold leading-snug text-fg">
                    Fale com quem vai cuidar da sua apólice
                  </h2>
                  <p className="mt-3 text-[.96875rem] leading-relaxed text-fg-3">
                    Explicamos coberturas, franquias e exclusões em português claro, antes de
                    qualquer proposta.
                  </p>
                  <div className="mt-7 flex flex-col gap-3">
                    <LinkButton href="/cotacao" size="md" icon="arrow-right" full>
                      Solicitar uma cotação
                    </LinkButton>
                    <LinkButton href="/seguros" variant="secondary" size="md" icon="arrow-right" full>
                      Ver todos os seguros
                    </LinkButton>
                  </div>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
