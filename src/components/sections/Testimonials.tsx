'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { testimonials, testimonialsAutoplay } from '@/config/content';
import type { GoogleReview } from '@/services/googleReviews';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * "O que falam de nós" — avaliações reais do Google.
 *
 * Divisão de responsabilidades (o mesmo padrão do restante do projeto):
 * o componente de SERVIDOR busca (src/services/googleReviews.ts, com a chave
 * que nunca chega ao navegador) e este componente de CLIENTE anima.
 *
 * O que entra no carrossel:
 *  - as avaliações do perfil da corretora no Google Meu Negócio;
 *  - e, se houver, os depoimentos enviados diretamente à FIXSEG
 *    (src/config/content.ts → `testimonials`), claramente marcados como tal —
 *    um depoimento com autorização por escrito não é uma avaliação pública, e
 *    misturar os dois sem aviso seria enganoso.
 *
 * Sem nenhuma das duas fontes, a seção NÃO é renderizada. Nada de depoimento
 * inventado nem de foto de pessoa que não existe.
 *
 * Segurança: o texto da avaliação é conteúdo de terceiro e é renderizado como
 * TEXTO PURO pelo React — nunca com `dangerouslySetInnerHTML`.
 */

interface Props {
  /** Avaliações já normalizadas pelo adaptador (podem vir vazias). */
  avaliacoes: GoogleReview[];
  /** Nota média do perfil no Google. */
  notaMedia: number | null;
  /** Total de avaliações do perfil (maior que a lista exibida). */
  totalAvaliacoes: number;
  /** Perfil no Google Maps — destino do "ver todas no Google". */
  googleMapsUri: string | null;
}

/** Item unificado do carrossel. */
interface Cartao {
  chave: string;
  origem: 'google' | 'direto';
  autor: string;
  foto: string | null;
  texto: string;
  /** Só nas avaliações do Google. */
  nota?: number;
  quando?: string;
  url?: string | null;
  /** Só nos depoimentos diretos: cargo/cidade · produto. */
  detalhe?: string;
}

/** Acima disso o texto é truncado e ganha o botão "ler mais". */
const LIMITE_TEXTO = 330;

/* -------------------------------------------------------------------------- */
/* AUXILIARES                                                                 */
/* -------------------------------------------------------------------------- */

/** Corta no último espaço antes do limite — nunca no meio de uma palavra. */
function truncar(texto: string): { visivel: string; cortado: boolean } {
  if (texto.length <= LIMITE_TEXTO) return { visivel: texto, cortado: false };
  const bruto = texto.slice(0, LIMITE_TEXTO);
  const corte = bruto.lastIndexOf(' ');
  const visivel = (corte > LIMITE_TEXTO * 0.6 ? bruto.slice(0, corte) : bruto).replace(
    /[\s.,;:!?—-]+$/,
    '',
  );
  return { visivel, cortado: true };
}

/** "4,9" — formatação manual de propósito: `toLocaleString` pode divergir
 *  entre o Node e o navegador e quebrar a hidratação. */
function nota1Casa(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

/** 1234 → "1.234" */
function inteiroPtBr(v: number): string {
  return String(Math.trunc(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* -------------------------------------------------------------------------- */
/* ESTRELAS                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Cinco estrelas com preenchimento proporcional.
 *
 * A fração vem de um RECORTE DE LARGURA sobre uma segunda fileira idêntica —
 * assim 4,3 e 4,7 ficam visualmente diferentes, o que meia-estrela desenhada
 * não resolveria.
 */
function Estrelas({ nota, size = 15 }: { nota: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (nota / 5) * 100));

  return (
    <span
      className="relative inline-flex shrink-0 align-middle"
      role="img"
      aria-label={`Nota ${nota1Casa(nota)} de 5`}
    >
      <span aria-hidden="true" className="flex gap-[3px] text-fg-4/40">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" size={size} />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <span className="flex gap-[3px] text-accent-ink">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" size={size} />
          ))}
        </span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* CARTÃO                                                                     */
/* -------------------------------------------------------------------------- */

function CartaoAvaliacao({
  item,
  ativo,
  empilhado,
}: {
  item: Cartao;
  ativo: boolean;
  /** true no modo de movimento reduzido: os cartões viram lista vertical. */
  empilhado: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const { visivel, cortado } = truncar(item.texto);
  const foco = ativo || empilhado;

  return (
    <figure
      data-testimonial
      aria-hidden={!foco || undefined}
      className={cn(
        'surface flex flex-col p-7 md:p-9',
        empilhado ? 'relative' : 'col-start-1 row-start-1',
        !empilhado && !ativo && 'opacity-0',
      )}
    >
      {/* autor */}
      <figcaption className="flex items-center gap-4">
        {item.foto ? (
          /* Fotos do Google vêm de `lh*.googleusercontent.com`, host declarado
             em next.config.mjs → images.remotePatterns (e validado no
             adaptador). O `alt` é vazio de propósito: o nome do autor está
             logo ao lado, em texto. */
          <Image
            src={item.foto}
            alt=""
            width={52}
            height={52}
            loading="lazy"
            className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-hair bg-tint/[.04] font-display text-[1.1875rem] font-semibold text-accent-ink">
            {item.autor.charAt(0).toUpperCase()}
          </span>
        )}

        <span className="min-w-0">
          <span className="block truncate font-display text-[1.0625rem] font-semibold text-fg">
            {item.autor}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[.9375rem] text-fg-4">
            {item.origem === 'google' && typeof item.nota === 'number' && (
              <Estrelas nota={item.nota} />
            )}
            {item.quando && <span>{item.quando}</span>}
            {item.detalhe && <span>{item.detalhe}</span>}
          </span>
        </span>
      </figcaption>

      {/* texto — conteúdo de terceiro, renderizado como texto puro */}
      <blockquote className="mt-6 flex-1">
        <Icon name="quote" size={26} className="text-accent-ink/30" />
        <p className="mt-3 whitespace-pre-line text-[1.0625rem] leading-relaxed text-fg-2 md:text-[1.125rem]">
          {expandido || !cortado ? item.texto : `${visivel}…`}
        </p>
        {cortado && (
          <button
            type="button"
            tabIndex={foco ? 0 : -1}
            onClick={() => setExpandido((v) => !v)}
            className="mt-2 rounded text-[.9375rem] font-semibold text-accent-ink underline-offset-4 transition-opacity duration-300 hover:underline"
          >
            {expandido ? 'ler menos' : 'ler mais'}
          </button>
        )}
      </blockquote>

      {/* procedência */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-hair pt-5 text-[.875rem] text-fg-4">
        <span>
          {item.origem === 'google'
            ? 'Avaliação publicada no Google'
            : 'Depoimento enviado à FIXSEG'}
        </span>
        {item.origem === 'google' && item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            tabIndex={foco ? 0 : -1}
            className="inline-flex shrink-0 items-center gap-1.5 rounded font-semibold text-accent-ink transition-opacity duration-300 hover:opacity-80"
          >
            ver no Google
            <Icon name="arrow-up-right" size={14} />
          </a>
        )}
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* SEÇÃO                                                                      */
/* -------------------------------------------------------------------------- */

export function Testimonials({
  avaliacoes,
  notaMedia,
  totalAvaliacoes,
  googleMapsUri,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Aqui a preferência de movimento muda o HTML (carrossel × lista), então
     usamos o hook em estado: começa `false`, igual ao servidor, e se ajusta
     na hidratação sem divergência. */
  const reduced = useReducedMotion();

  /* União das duas fontes. O Google vem primeiro: é a prova social pública. */
  const cartoes = useMemo<Cartao[]>(() => {
    const doGoogle: Cartao[] = avaliacoes
      .filter((a) => a.texto.length > 0)
      .map((a, i) => ({
        chave: `google-${i}-${a.autor}`,
        origem: 'google',
        autor: a.autor,
        foto: a.foto,
        texto: a.texto,
        nota: a.nota,
        quando: a.quando,
        url: a.url,
      }));

    const diretos: Cartao[] = testimonials.map((t, i) => ({
      chave: `direto-${i}-${t.author}`,
      origem: 'direto',
      autor: t.author,
      foto: t.avatar ?? null,
      texto: t.quote,
      detalhe: [t.role, t.product].filter(Boolean).join(' · ') || undefined,
    }));

    return [...doGoogle, ...diretos];
  }, [avaliacoes]);

  const total = cartoes.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  /* transição entre cartões */
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const cards = track.querySelectorAll<HTMLElement>('[data-testimonial]');
      if (!cards.length) return;

      if (reduced) {
        /* O hook começa em `false` (igual ao servidor), então no primeiro render
           do cliente o carrossel chega a ser montado e o GSAP deixa os cartões
           inativos com opacity/visibility inline. Ao virar lista, esses valores
           PRECISAM ser limpos — senão sobra conteúdo invisível justamente no
           modo em que nada pode ficar invisível.

           O `killTweensOf` é obrigatório: `useGSAP` com `dependencies` NÃO
           reverte a execução anterior, então as transições de 0,62s ainda em
           curso reescreveriam a limpeza no quadro seguinte. */
        gsap.killTweensOf(cards);
        gsap.set(cards, { clearProps: 'all' });
        return;
      }

      cards.forEach((card, i) => {
        const ativo = i === index;
        gsap.to(card, {
          autoAlpha: ativo ? 1 : 0,
          x: ativo ? 0 : i < index ? -42 : 42,
          scale: ativo ? 1 : 0.97,
          duration: 0.62,
          ease: 'brand',
          pointerEvents: ativo ? 'auto' : 'none',
        });
      });
    },
    { dependencies: [index, reduced, total] },
  );

  /* arraste / swipe — eventos de ponteiro, não o Observer do GSAP.
     Motivo: `useGSAP` com `dependencies` não reverte a execução anterior, então
     um Observer novo seria criado a cada troca de cartão e os antigos só
     morreriam ao desmontar o componente. Umas poucas linhas explícitas são
     previsíveis, funcionam igual no toque e no mouse, e ficam fáceis de
     verificar.

     Sem `setPointerCapture` de propósito: com a captura ativa, os eventos de
     mouse derivados também passam a ser entregues ao elemento que capturou, e
     os links de dentro do cartão ("ver no Google", "ler mais") parariam de
     receber o clique. O gesto simplesmente é descartado se o ponteiro sair. */
  const arrasto = useRef<{ x: number; y: number } | null>(null);

  const aoPressionar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || total < 2) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    arrasto.current = { x: e.clientX, y: e.clientY };
  };

  const aoSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const inicio = arrasto.current;
    arrasto.current = null;
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    /* limiar alto o bastante para não roubar cliques em links do cartão, e
       comparação com o eixo Y para não competir com a rolagem da página */
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  /* autoplay — respeita `testimonialsAutoplay`, o hover, o foco e o modo reduzido */
  useEffect(() => {
    if (!testimonialsAutoplay || reduced || paused || total < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), testimonialsAutoplay);
    return () => clearInterval(t);
  }, [paused, reduced, total]);

  if (total === 0) return null;

  const temResumo = notaMedia !== null && totalAvaliacoes > 0;

  return (
    <section id="depoimentos" className="relative scroll-mt-24 overflow-hidden py-section">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Prova social"
          title="O que falam de nós"
          highlight="falam de nós"
          className="mx-auto"
        />

        {/* resumo: nota média + quantidade + link para o perfil */}
        {temResumo && (
          <div className="mx-auto mt-10 flex max-w-[52rem] flex-col items-center gap-4 rounded-2xl border border-hair bg-tint/[.03] px-6 py-6 text-center sm:flex-row sm:justify-center sm:gap-7 sm:text-left">
            <span className="flex items-center gap-3">
              <span className="font-display text-[2.25rem] font-semibold leading-none text-fg">
                {nota1Casa(notaMedia)}
              </span>
              <span className="flex flex-col gap-1.5">
                <Estrelas nota={notaMedia} size={17} />
                <span className="text-[.9375rem] text-fg-4">
                  {totalAvaliacoes === 1
                    ? '1 avaliação no Google'
                    : `${inteiroPtBr(totalAvaliacoes)} avaliações no Google`}
                </span>
              </span>
            </span>

            {googleMapsUri && (
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 rounded-full border border-hair px-4 py-2 text-[.9375rem] font-semibold text-accent-ink transition-[border-color,transform] duration-300 ease-brand hover:-translate-y-[2px] hover:border-brand-2/55 sm:ml-auto"
              >
                ver todas no Google
                <Icon name="arrow-up-right" size={15} />
              </a>
            )}
          </div>
        )}

        <div
          className="relative mx-auto mt-8 max-w-[52rem]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            tabIndex={reduced || total < 2 ? undefined : 0}
            onPointerDown={aoPressionar}
            onPointerUp={aoSoltar}
            onPointerCancel={() => {
              arrasto.current = null;
            }}
            onPointerLeave={() => {
              arrasto.current = null;
            }}
            onKeyDown={(e) => {
              if (reduced || total < 2) return;
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                go(index + 1);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                go(index - 1);
              }
            }}
            className={cn(
              'relative rounded-[18px] touch-pan-y',
              reduced ? 'flex flex-col gap-5' : 'grid',
            )}
            role="region"
            aria-roledescription="carrossel"
            aria-label="Avaliações e depoimentos sobre a FIXSEG"
            aria-live="polite"
          >
            {cartoes.map((item, i) => (
              <CartaoAvaliacao
                key={item.chave}
                item={item}
                ativo={i === index}
                empilhado={reduced}
              />
            ))}
          </div>

          {/* controles */}
          {!reduced && total > 1 && (
            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Avaliação anterior"
                className="grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:-translate-x-0.5 hover:border-brand-2/55 hover:text-fg"
              >
                <Icon name="chevron-left" size={17} />
              </button>

              <div
                className="flex items-center gap-0.5"
                role="tablist"
                aria-label="Selecionar avaliação"
              >
                {cartoes.map((item, i) => (
                  /* O traço tem 6px, mas a ÁREA DE TOQUE tem 36 — sem isso o
                     indicador vira um alvo de 6×6px no celular. */
                  <button
                    key={item.chave}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Avaliação ${i + 1} de ${total}`}
                    onClick={() => go(i)}
                    className="group/ponto grid h-9 place-items-center px-1"
                  >
                    <span
                      className={cn(
                        'h-[6px] rounded-full transition-all duration-500 ease-brand',
                        i === index
                          ? 'w-7 bg-brand-gradient'
                          : 'w-[6px] bg-tint/20 group-hover/ponto:bg-tint/40',
                      )}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Próxima avaliação"
                className="grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-2 transition-all duration-300 ease-brand hover:translate-x-0.5 hover:border-brand-2/55 hover:text-fg"
              >
                <Icon name="chevron-right" size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
