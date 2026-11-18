'use client';

import { CTA } from '@/config/site';
import Reveal from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';

/**
 * =============================================================================
 * FAIXA "PATRIMÔNIO PROTEGIDO"
 * =============================================================================
 * O que sobrou da antiga seção institucional ("Sobre a FIXSEG"), a pedido do
 * cliente: a página estava longa demais e o texto institucional, os pilares e
 * os indicadores saíram. Ficou só o convite — que é a parte que pede uma ação.
 *
 * O conteúdo que saiu NÃO foi apagado da configuração: `about` e `stats`
 * continuam em `src/config/content.ts`, prontos para voltar numa página
 * "Sobre" própria, se um dia ela existir. Era conteúdo real, só não precisava
 * estar na home.
 *
 * A âncora mudou de `#sobre` para `#patrimonio` porque o bloco deixou de ser
 * uma seção institucional. Os links de menu que apontavam para `#sobre` foram
 * retirados junto (ver src/config/navigation.ts).
 * =============================================================================
 */
export function PatrimonyCta() {
  return (
    <section id="patrimonio" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell">
        <Reveal anim="rise" className="surface-gradient-border relative overflow-hidden">
          {/* Folga de 8% em volta: o gradiente deriva alguns pixels, e sem a
              folga a borda oposta abriria uma faixa vazia dentro do cartão. */}
          <div
            aria-hidden="true"
            className="glow-panel pointer-events-none absolute -inset-[8%] animate-drift-a opacity-80"
          />
          <div className="relative flex flex-col items-start justify-between gap-7 p-8 md:flex-row md:items-center md:p-11">
            <div>
              <span className="eyebrow">Patrimônio protegido</span>
              <h2 className="mt-4 max-w-[26ch] font-display text-display-sm font-semibold text-fg">
                Quer saber se sua proteção atual é suficiente?
              </h2>
              <p className="mt-3 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-3">
                Analisamos as apólices que você já tem e apontamos lacunas de cobertura — sem custo
                e sem obrigação de trocar de corretora.
              </p>
            </div>
            <LinkButton href="/cotacao" size="lg" icon="arrow-right" className="shrink-0">
              {CTA.patrimony}
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default PatrimonyCta;
