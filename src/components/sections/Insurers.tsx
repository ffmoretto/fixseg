'use client';

import Image from 'next/image';
import { insurers } from '@/config/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Seguradoras parceiras.
 *
 * A seção só é renderizada quando há logos cadastrados em
 * src/config/content.ts → `insurers`. Nenhum parceiro é inventado e nenhum
 * logo é usado sem estar explicitamente na configuração.
 *
 * Para adicionar: coloque o arquivo em /public/seguradoras/ e inclua uma
 * entrada { name, logo, url? } na lista. O carrossel infinito se ajusta
 * automaticamente à quantidade.
 */
export function Insurers() {
  const reduced = useReducedMotion();

  if (insurers.length === 0) return null;

  /* duplicamos a lista para o loop contínuo não apresentar salto */
  const track = [...insurers, ...insurers];

  return (
    <section id="seguradoras" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Parceiros"
          title="Comparamos as principais seguradoras do mercado"
          highlight="principais seguradoras"
          subtitle="Você recebe as propostas lado a lado, com as diferenças de cobertura explicadas."
          className="mx-auto"
          size="md"
        />
      </div>

      <Reveal anim="up" className="mt-14">
        <div className="edge-fade-x relative overflow-hidden">
          <div
            className="flex w-max items-center gap-4"
            style={reduced ? undefined : { animation: 'marquee-x 38s linear infinite' }}
          >
            {track.map((ins, i) => {
  if (!ins.logo) return null;

  const Card = (
                <div className="grid h-[92px] w-[176px] place-items-center rounded-2xl border border-hair bg-tint/[.03] px-6 transition-all duration-500 ease-brand hover:border-brand-2/35 hover:bg-tint/[.06]">
                  <Image
                    src={ins.logo}
                    alt={ins.name}
                    width={132}
                    height={44}
                    loading="lazy"
                    className="h-auto max-h-[44px] w-auto max-w-[132px] object-contain opacity-70 transition-opacity duration-500 hover:opacity-100"
                  />
                </div>
              );

              return (
                <div key={`${ins.name}-${i}`} aria-hidden={i >= insurers.length}>
                  {ins.url ? (
                    <a
                      href={ins.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ins.name}
                      tabIndex={i >= insurers.length ? -1 : 0}
                    >
                      {Card}
                    </a>
                  ) : (
                    Card
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default Insurers;
