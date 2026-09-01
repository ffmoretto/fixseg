'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { curiosities, curiosidadesConfig, slugsComCuriosidade } from '@/config/curiosities';
import { insuranceBySlug } from '@/config/insurances';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

/**
 * =============================================================================
 * "Informação também é proteção." — curiosidades sobre seguros
 * =============================================================================
 * Esta seção substituiu a leitura do feed de notícias de um portal de terceiro.
 * A diferença não é só de conteúdo:
 *
 *  · o texto é NOSSO, escrito para o cliente final (ver src/config/curiosities.ts);
 *  · não há requisição a servidor nenhum em tempo de execução — nada a cair, nada
 *    a bloquear, nada a esperar;
 *  · NÃO HÁ LINK DE SAÍDA. O visitante não é mandado para fora do site para ler
 *    o resto: o cartão traz o assunto inteiro. Era o principal problema do
 *    modelo anterior, em que cada cartão levava para o portal de origem.
 *
 * -----------------------------------------------------------------------------
 * POR QUE UM SCROLLER NATIVO, E NÃO TRANSFORM
 * -----------------------------------------------------------------------------
 * O carrossel é um contêiner com `overflow-x` e `scroll-snap`. Avançar é chamar
 * `scrollTo` no elemento — não há cálculo de translate, nem largura medida à
 * mão, nem estado de posição para dessincronizar. De graça vêm o arrasto com o
 * dedo no celular, a inércia do sistema, a roda do mouse na horizontal e a
 * rolagem por teclado. Um carrossel de transform reimplementaria tudo isso pior.
 *
 * -----------------------------------------------------------------------------
 * ACESSIBILIDADE
 * -----------------------------------------------------------------------------
 *  · `aria-roledescription="carrossel"` na região, e cada cartão é um grupo com
 *    "N de M" no rótulo, para o leitor de tela saber onde está.
 *  · a rotação automática PARA no ponteiro, no foco de teclado e quando a aba
 *    sai de vista (WCAG 2.2.2), e existem botões de anterior/próximo — controle
 *    explícito, não só gesto.
 *  · setas do teclado navegam quando o carrossel tem foco.
 *  · com `prefers-reduced-motion` não há rotação automática nem rolagem animada.
 * =============================================================================
 */

const TODOS = 'todos';

export function Curiosities() {
  const reduced = prefersReducedMotion();

  const [produto, setProduto] = useState<string>(TODOS);
  const [indice, setIndice] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
  const pausado = useRef(false);
  /* O avanço automático programa o próximo passo dentro do próprio efeito.
     Guardar o id fora dele permite cancelar quando o filtro muda no meio. */
  const timer = useRef<number | null>(null);

  /* ------------------------------------------------------------- os dados */
  const abas = useMemo(() => {
    const slugs = slugsComCuriosidade();
    return [
      { key: TODOS, label: 'Todos os temas' },
      ...slugs.map((slug) => ({
        key: slug,
        /* O nome vem do catálogo de produtos: uma fonte só para os dois lugares.
           Sem "Seguro" na frente — a etiqueta já está dentro da seção. */
        label: (insuranceBySlug(slug)?.name ?? slug).replace(/^Seguro (de |d')?/i, ''),
      })),
    ];
  }, []);

  const itens = useMemo(
    () => (produto === TODOS ? curiosities : curiosities.filter((c) => c.slug === produto)),
    [produto],
  );

  const total = itens.length;

  /* ------------------------------------------------------- ir para um item */
  const irPara = useCallback(
    (alvo: number, animado = true) => {
      const el = pista.current;
      if (!el || total === 0) return;
      /* Circular: passar do último volta ao primeiro. */
      const i = ((alvo % total) + total) % total;
      const cartao = el.children[i] as HTMLElement | undefined;
      if (!cartao) return;
      el.scrollTo({
        left: cartao.offsetLeft - el.offsetLeft,
        behavior: animado && !reduced ? 'smooth' : 'auto',
      });
      setIndice(i);
    },
    [reduced, total],
  );

  /* ------------------------------------------- qual cartão está na tela */
  /* A posição de verdade é a do scroll, não a do estado: o visitante pode
     arrastar com o dedo, girar a roda ou usar o teclado. Lemos de volta em vez
     de assumir. */
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let raf = 0;
    const aoRolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const meio = el.scrollLeft + el.clientWidth / 2;
        let maisProximo = 0;
        let menorDistancia = Infinity;
        Array.from(el.children).forEach((filho, i) => {
          const c = filho as HTMLElement;
          const centro = c.offsetLeft - el.offsetLeft + c.clientWidth / 2;
          const d = Math.abs(centro - meio);
          if (d < menorDistancia) {
            menorDistancia = d;
            maisProximo = i;
          }
        });
        setIndice(maisProximo);
      });
    };
    el.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      el.removeEventListener('scroll', aoRolar);
      cancelAnimationFrame(raf);
    };
  }, [produto]);

  /* ------------------------------------------------- rotação automática */
  useEffect(() => {
    if (reduced || total < 2) return;
    const ms = Math.max(5, curiosidadesConfig.intervalo) * 1000;

    const tick = () => {
      /* `document.hidden`: aba em segundo plano não gasta bateria avançando
         cartões que ninguém vê — e o visitante não volta no meio do assunto. */
      if (!pausado.current && !document.hidden) {
        const el = pista.current;
        if (el) {
          const meio = el.scrollLeft + el.clientWidth / 2;
          let atual = 0;
          let menor = Infinity;
          Array.from(el.children).forEach((filho, i) => {
            const c = filho as HTMLElement;
            const centro = c.offsetLeft - el.offsetLeft + c.clientWidth / 2;
            const d = Math.abs(centro - meio);
            if (d < menor) {
              menor = d;
              atual = i;
            }
          });
          irPara(atual + 1);
        }
      }
      timer.current = window.setTimeout(tick, ms);
    };

    timer.current = window.setTimeout(tick, ms);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [irPara, reduced, total, produto]);

  /* ---------------------------------------------- troca de produto (aba) */
  const trocarProduto = (key: string) => {
    setProduto(key);
    setIndice(0);
    /* Volta ao início SEM animação: animar uma pista que acabou de trocar de
       conteúdo produz um borrão lateral sem informação. */
    requestAnimationFrame(() => {
      const el = pista.current;
      if (el) el.scrollTo({ left: 0, behavior: 'auto' });
    });
  };

  /* -------------------------------------- entrada dos cartões ao trocar */
  const primeiraPassagem = useRef(true);
  useGSAP(
    () => {
      if (reduced) return;
      const el = pista.current;
      if (!el) return;
      /* Na montagem quem revela é o <Reveal> da seção. Só a partir da troca de
         aba esta animação assume — o mesmo cuidado da grade de seguros, onde
         animar na primeira passagem fazia os cartões piscarem duas vezes. */
      if (primeiraPassagem.current) {
        primeiraPassagem.current = false;
        return;
      }
      const cartoes = Array.from(el.children) as HTMLElement[];
      if (!cartoes.length) return;
      gsap.fromTo(
        cartoes.slice(0, 4),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'brand',
          clearProps: 'transform,opacity',
        },
      );
    },
    { dependencies: [produto] },
  );

  if (!curiosidadesConfig.ativo || total === 0) return null;

  return (
    <section id="curiosidades" className="relative scroll-mt-24 py-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Curiosidades sobre seguros"
          title="Informação também é proteção."
          highlight="também é proteção."
          subtitle="Fatos, regras e números que quase ninguém conhece — e que costumam aparecer justamente quando já é tarde. Cada cartão traz a fonte."
          className="md:max-w-[40rem]"
        />

        {/* ------------------------------------------------------------ abas */}
        <Reveal anim="up" delay={0.05} className="mt-10">
          <div
            role="tablist"
            aria-label="Filtrar curiosidades por tipo de seguro"
            className="-mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {abas.map((aba) => (
              <button
                key={aba.key}
                role="tab"
                type="button"
                aria-selected={produto === aba.key}
                onClick={() => trocarProduto(aba.key)}
                className={cn(
                  'shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-[.875rem] font-semibold',
                  'min-h-[44px] transition-all duration-400 ease-brand active:scale-[.96] active:duration-[90ms]',
                  produto === aba.key
                    ? 'border-transparent bg-brand-gradient text-on-brand shadow-[0_8px_24px_-14px_rgba(2,179,249,.8)]'
                    : 'border-hair text-fg-3 hover:-translate-y-[2px] hover:border-brand-2/45 hover:text-fg',
                )}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ------------------------------------------------------- carrossel */}
        <Reveal anim="up" delay={0.1} className="mt-8">
          <div
            aria-roledescription="carrossel"
            aria-label="Curiosidades sobre seguros"
            onMouseEnter={() => {
              pausado.current = true;
            }}
            onMouseLeave={() => {
              pausado.current = false;
            }}
            onFocusCapture={() => {
              pausado.current = true;
            }}
            onBlurCapture={() => {
              pausado.current = false;
            }}
          >
            <div
              ref={pista}
              tabIndex={0}
              aria-live="off"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  irPara(indice + 1);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  irPara(indice - 1);
                }
              }}
              className={cn(
                '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2',
                'sm:mx-0 sm:px-0',
                /* barra de rolagem escondida: a navegação é pelos botões e pelos
                   pontos; a barra nativa no meio da seção suja o desenho */
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                'rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-2/60',
              )}
            >
              {itens.map((c, i) => (
                <Cartao
                  key={`${c.slug}-${c.titulo}`}
                  curiosidade={c}
                  posicao={i + 1}
                  total={total}
                />
              ))}
            </div>

            {/* ------------------------------------------------- controles */}
            <div className="mt-7 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Botao rotulo="Curiosidade anterior" icone="chevron-left" onClick={() => irPara(indice - 1)} />
                <Botao rotulo="Próxima curiosidade" icone="chevron-right" onClick={() => irPara(indice + 1)} />
              </div>

              {/* Pontos até 8 itens; acima disso, contador. Trinta pontinhos
                  numa linha não informam posição nenhuma — viram textura. */}
              {total <= 8 ? (
                <div className="flex items-center gap-2">
                  {itens.map((c, i) => (
                    <button
                      key={`ponto-${c.slug}-${i}`}
                      type="button"
                      aria-label={`Ir para a curiosidade ${i + 1} de ${total}`}
                      aria-current={i === indice}
                      onClick={() => irPara(i)}
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-400 ease-brand',
                        i === indice
                          ? 'w-7 bg-brand-gradient'
                          : 'w-2.5 bg-tint/25 hover:bg-tint/45',
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[.875rem] font-medium tabular-nums text-fg-4">
                  <span className="text-fg-2">{String(indice + 1).padStart(2, '0')}</span>
                  {' / '}
                  {String(total).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {/* Nota de transparência: sem link de saída, e a fonte de cada dado fica
            no próprio cartão. */}
        <Reveal anim="up" delay={0.15} className="mt-9">
          <p className="max-w-[62ch] border-t border-hair pt-7 text-[.9375rem] leading-relaxed text-fg-4">
            Conteúdo produzido pela FIXSEG a partir de dados públicos de órgãos do setor,
            legislação e decisões judiciais. A fonte aparece em cada cartão, e os números
            trazem o ano a que se referem.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* O CARTÃO                                                                   */
/* -------------------------------------------------------------------------- */

function Cartao({
  curiosidade,
  posicao,
  total,
}: {
  curiosidade: (typeof curiosities)[number];
  posicao: number;
  total: number;
}) {
  const produto = insuranceBySlug(curiosidade.slug);

  return (
    <article
      role="group"
      aria-roledescription="curiosidade"
      aria-label={`${posicao} de ${total}`}
      /* `snap-center` no celular (um cartão por vez, centrado) e larguras que
         deixam o próximo cartão espiando no desktop — é o espiar que conta ao
         visitante que existe mais para ver. */
      className={cn(
        'surface group/cur relative flex w-[86vw] shrink-0 snap-center flex-col overflow-hidden p-7',
        'sm:w-[520px] sm:p-9 lg:w-[600px]',
        'transition-[border-color,box-shadow] duration-500 ease-brand hover:border-brand-2/35 hover:shadow-glow',
      )}
    >
      <span
        aria-hidden="true"
        className="glow-a pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-60 blur-[64px] transition-opacity duration-700 group-hover/cur:opacity-90"
      />

      {/* etiqueta do produto */}
      <div className="relative flex items-center gap-2.5">
        {produto && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint/[.06] text-accent-ink">
            <Icon name={produto.icon} size={18} />
          </span>
        )}
        <span className="text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
          {produto?.name ?? 'Seguros'}
        </span>
      </div>

      {/* O MESMO ESPAÇO, SEMPRE OCUPADO.
          Quando o item tem número, ele entra grande — é o que segura o olho no
          cartão. Quando não tem (uma regra da lei, um prazo, uma cobertura), o
          lugar recebe "Você sabia?". Sem isso, os cartões sem número ficavam com
          um vão branco no meio, e a fileira perdia o ritmo. */}
      {curiosidade.destaque ? (
        <div className="relative mt-6">
          <p className="font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-.02em] text-gradient-brand sm:text-[2.75rem]">
            {curiosidade.destaque.valor}
          </p>
          <p className="mt-1.5 max-w-[34ch] text-[.9375rem] leading-snug text-fg-3">
            {curiosidade.destaque.rotulo}
          </p>
        </div>
      ) : (
        <div className="relative mt-6">
          <p className="font-display text-[1.75rem] font-semibold leading-[1.05] tracking-[-.02em] text-gradient-brand sm:text-[2rem]">
            Você sabia?
          </p>
          <p className="mt-1.5 max-w-[34ch] text-[.9375rem] leading-snug text-fg-3">
            está na lei, no contrato ou na decisão do tribunal
          </p>
        </div>
      )}

      <h3 className="relative mt-6 font-display text-[1.1875rem] font-semibold leading-snug text-fg sm:text-[1.25rem]">
        {curiosidade.titulo}
      </h3>

      <p className="relative mt-3 flex-1 text-[1rem] leading-relaxed text-fg-3">
        {curiosidade.texto}
      </p>

      <p className="relative mt-6 text-[.8125rem] uppercase tracking-[0.12em] text-fg-4">
        Fonte: <span className="text-fg-3">{curiosidade.fonte}</span>
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* BOTÃO REDONDO DE NAVEGAÇÃO                                                 */
/* -------------------------------------------------------------------------- */

function Botao({
  rotulo,
  icone,
  onClick,
}: {
  rotulo: string;
  icone: 'chevron-left' | 'chevron-right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className={cn(
        'grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-2',
        'transition-all duration-300 ease-brand hover:-translate-y-[2px] hover:border-brand-2/55 hover:text-fg',
        'active:translate-y-0 active:scale-[.94] active:duration-[90ms]',
      )}
    >
      <Icon name={icone} size={19} />
    </button>
  );
}

export default Curiosities;
