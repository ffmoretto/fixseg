'use client';

import Image from 'next/image';
import { insurers, type Insurer } from '@/config/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * "Parceiros da FIXSEG" — carrossel contínuo das companhias.
 *
 * A seção só é renderizada quando há companhias cadastradas em
 * src/config/content.ts → `insurers`. Nenhum parceiro é inventado e nenhum
 * logo é usado sem estar explicitamente na configuração.
 *
 * Duas decisões que valem o comentário:
 *
 * 1. **Logo é opcional.** Enquanto o arquivo não chega, a companhia aparece
 *    como CARTÃO TIPOGRÁFICO — o nome composto na fonte da marca, com o mesmo
 *    peso visual de um logo. Quando o arquivo for adicionado em
 *    `/public/seguradoras/` e o campo `logo` for preenchido, a imagem assume
 *    sozinha: nada mais precisa mudar.
 *
 * 2. **Duas faixas em direções opostas** a partir de 8 companhias. Com poucas,
 *    duas faixas ficariam ralas e repetitivas; com muitas, uma faixa só passa
 *    a ser uma fila interminável em vez de um movimento.
 *
 * O movimento é o keyframe `marquee-x` do Tailwind sobre a lista DUPLICADA
 * (por isso o passo do loop é exatamente -50%, sem salto). Pausa no hover e no
 * foco por teclado. Com movimento reduzido, vira uma grade estática legível.
 */

/** A partir daqui vale a pena dividir em duas faixas. */
const LIMIAR_DUAS_FAIXAS = 8;

/* -------------------------------------------------------------------------- */
/* CARTÃO                                                                     */
/* -------------------------------------------------------------------------- */

/** Escala do nome conforme o comprimento — nome grande não pode estourar. */
function classeDoNome(nome: string): string {
  if (nome.length <= 9) return 'text-[1.375rem] md:text-[1.5rem]';
  if (nome.length <= 14) return 'text-[1.125rem] md:text-[1.25rem]';
  if (nome.length <= 20) return 'text-[.9375rem] md:text-[1.0625rem]';
  return 'text-[.875rem] md:text-[.9375rem]';
}

function CartaoParceiro({ parceiro }: { parceiro: Insurer }) {
  const temLogo = !!parceiro.logo;

  return (
    <div
      className={cn(
        'group/parceiro grid h-[104px] w-[196px] place-items-center rounded-2xl border border-hair',
        'bg-tint/[.03] px-5 transition-[background-color,border-color,transform] duration-500 ease-brand',
        'hover:-translate-y-[3px] hover:border-brand-2/35 hover:bg-tint/[.06] md:h-[112px] md:w-[212px]',
      )}
    >
      {temLogo ? (
        <Image
          src={parceiro.logo as string}
          alt={parceiro.name}
          width={140}
          height={48}
          loading="lazy"
          className="h-auto max-h-[48px] w-auto max-w-[140px] object-contain opacity-70 transition-opacity duration-500 group-hover/parceiro:opacity-100"
        />
      ) : (
        /* Cartão tipográfico: o nome é a peça gráfica. Fonte da marca, caixa
           equilibrada e um fio degradê que assina o bloco — para parecer
           intencional, e não um espaço à espera de imagem. */
        <span className="flex flex-col items-center gap-2.5 px-1 text-center">
          <span
            className={cn(
              'font-display font-semibold leading-tight tracking-[-.02em] text-fg-2',
              'transition-colors duration-500 ease-brand group-hover/parceiro:text-fg',
              classeDoNome(parceiro.name),
            )}
          >
            {parceiro.name}
          </span>
          <span
            aria-hidden="true"
            className="h-[2px] w-8 rounded-full bg-brand-gradient opacity-45 transition-opacity duration-500 group-hover/parceiro:opacity-100"
          />
        </span>
      )}
    </div>
  );
}

/** Envolve o cartão em link quando a companhia tem site. */
function ItemDaFaixa({
  parceiro,
  clone,
}: {
  parceiro: Insurer;
  /** Cópia usada apenas para o loop: fora do fluxo de leitura e de tabulação. */
  clone: boolean;
}) {
  const cartao = <CartaoParceiro parceiro={parceiro} />;

  return (
    <div className="shrink-0" aria-hidden={clone || undefined}>
      {parceiro.url ? (
        <a
          href={parceiro.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={parceiro.name}
          tabIndex={clone ? -1 : 0}
          className="block rounded-2xl"
        >
          {cartao}
        </a>
      ) : (
        cartao
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FAIXA                                                                      */
/* -------------------------------------------------------------------------- */

function Faixa({
  itens,
  segundos,
  reverso,
}: {
  itens: Insurer[];
  segundos: number;
  reverso?: boolean;
}) {
  /* A lista duplicada é o que faz o loop fechar: ao chegar em -50% a segunda
     cópia está exatamente onde a primeira começou. */
  const trilha = [...itens, ...itens];

  return (
    <div className="group/faixa edge-fade-x relative overflow-hidden py-1">
      {/* `animate-marquee-x` NÃO pode virar `style={{ animation: 'marquee-x …' }}`:
          o Tailwind só emite o `@keyframes marquee-x` quando a classe do
          utilitário existe no HTML. Sem ela, o nome da animação não resolve e a
          faixa fica parada. Duração e sentido continuam vindo do style. */}
      <div
        className={cn(
          'flex w-max items-center gap-4 will-change-transform animate-marquee-x',
          /* O `!` é necessário: `animate-marquee-x` é a propriedade `animation`
             ABREVIADA, que redefine `animation-play-state: running`. Sem a
             marca de importante, quem vence é a ordem das regras no arquivo, e
             a pausa não acontece. */
          'group-hover/faixa:![animation-play-state:paused]',
          'group-focus-within/faixa:![animation-play-state:paused]',
        )}
        style={{
          animationDuration: `${segundos}s`,
          animationDirection: reverso ? 'reverse' : 'normal',
        }}
      >
        {trilha.map((parceiro, i) => (
          <ItemDaFaixa
            key={`${parceiro.name}-${i}`}
            parceiro={parceiro}
            clone={i >= itens.length}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SEÇÃO                                                                      */
/* -------------------------------------------------------------------------- */

export function Partners() {
  /* Aqui a preferência de movimento muda o HTML (faixa × grade), então usamos
     o hook em estado — que começa `false`, igual ao servidor, e se corrige na
     hidratação sem divergência. */
  const reduced = useReducedMotion();

  if (insurers.length === 0) return null;

  const duasFaixas = insurers.length >= LIMIAR_DUAS_FAIXAS;
  const meio = Math.ceil(insurers.length / 2);
  const faixaA = duasFaixas ? insurers.slice(0, meio) : insurers;
  const faixaB = duasFaixas ? insurers.slice(meio) : [];

  /* Velocidade proporcional à quantidade: cada cartão leva ~3,4s para
     atravessar, independentemente de quantos existam. */
  const duracao = (lista: Insurer[]) => Math.max(22, lista.length * 3.4 * 2);

  return (
    <section id="parceiros" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Parceiros"
          title="Parceiros da FIXSEG"
          highlight="FIXSEG"
          subtitle="Trabalhamos com as seguradoras que oferecem a melhor relação entre cobertura e preço para cada perfil."
          className="mx-auto"
          size="md"
        />
      </div>

      <Reveal anim="up" className="mt-14">
        {reduced ? (
          /* Movimento reduzido: grade estática, tudo visível e legível. */
          <div className="shell">
            <ul className="flex flex-wrap justify-center gap-4">
              {insurers.map((parceiro) => (
                <li key={parceiro.name}>
                  <ItemDaFaixa parceiro={parceiro} clone={false} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Faixa itens={faixaA} segundos={duracao(faixaA)} />
            {duasFaixas && faixaB.length > 0 && (
              <Faixa itens={faixaB} segundos={duracao(faixaB)} reverso />
            )}
          </div>
        )}
      </Reveal>
    </section>
  );
}

export default Partners;
