'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { verseBand, verses } from '@/config/verses';
import Icon from '@/components/icons';

const CHAVE = 'fixseg:versiculos';

/**
 * =============================================================================
 * FAIXA DE VERSÍCULOS — fim de página
 * =============================================================================
 * Discreta, mas visível: uma faixa fina acima do rodapé, com um versículo por
 * vez, trocando sozinha.
 *
 * -----------------------------------------------------------------------------
 * "ESCOLHA ALEATÓRIA, SEM NUNCA REPETIR" — como isso é resolvido
 * -----------------------------------------------------------------------------
 * Sorteio simples repete: com 18 versículos, a chance de o mesmo sair duas
 * vezes seguidas é pequena, mas ao longo de uma visita a repetição é certa e
 * incômoda. A solução é o modelo do SACO: embaralha-se a lista inteira uma vez
 * (Fisher-Yates) e percorre-se do começo ao fim; só quando o último sai é que
 * um novo embaralhamento acontece — e, nesse novo, garante-se que o primeiro
 * não seja igual ao último que acabou de aparecer, para não haver repetição na
 * emenda entre os ciclos.
 *
 * O saco fica no `localStorage`, então quem volta ao site continua de onde
 * parou em vez de recomeçar sempre pelos mesmos versículos. Se o navegador
 * bloquear o armazenamento (aba privativa, configuração restritiva), o
 * componente simplesmente sorteia na memória: nada quebra.
 *
 * -----------------------------------------------------------------------------
 * HIDRATAÇÃO
 * -----------------------------------------------------------------------------
 * O sorteio NÃO pode acontecer no render: `Math.random()` no servidor e no
 * cliente devolve valores diferentes, o React acusa divergência e descarta a
 * árvore. Por isso o primeiro versículo é sempre o índice 0 — igual nos dois
 * lados — e o embaralhamento só começa depois da montagem.
 *
 * -----------------------------------------------------------------------------
 * ACESSIBILIDADE
 * -----------------------------------------------------------------------------
 *  · `aria-live="off"`: conteúdo que troca sozinho não deve interromper quem
 *    usa leitor de tela a cada 14 segundos.
 *  · a rotação PARA no hover e no foco de teclado, e existe um botão explícito
 *    para avançar — é o que a WCAG 2.2.2 exige de conteúdo em movimento.
 *  · com `prefers-reduced-motion`, a faixa mostra um versículo e não troca mais.
 * =============================================================================
 */
export function VerseBand() {
  const total = verses.length;
  const [indice, setIndice] = useState(0);
  const saco = useRef<number[]>([]);
  const pausado = useRef(false);
  const texto = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  /* --------------------------------------------------------- o saco */
  const embaralhar = useCallback(
    (evitarPrimeiro?: number) => {
      const ordem = Array.from({ length: total }, (_, i) => i);
      for (let i = ordem.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
      }
      /* emenda entre ciclos: o primeiro do saco novo não pode ser o último que
         acabou de sair na tela */
      if (total > 1 && evitarPrimeiro !== undefined && ordem[0] === evitarPrimeiro) {
        [ordem[0], ordem[1]] = [ordem[1], ordem[0]];
      }
      return ordem;
    },
    [total],
  );

  const gravar = useCallback((restante: number[], atual: number) => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ restante, atual }));
    } catch {
      /* armazenamento indisponível: segue só na memória */
    }
  }, []);

  const proximo = useCallback(() => {
    if (total < 2) return;
    if (!saco.current.length) saco.current = embaralhar(indice);
    const escolhido = saco.current.shift() as number;
    /* se o sorteio devolveu justamente o que já está na tela, pega o seguinte */
    const definitivo =
      escolhido === indice && saco.current.length
        ? (saco.current.shift() as number)
        : escolhido;

    const trocar = () => {
      setIndice(definitivo);
      gravar(saco.current, definitivo);
    };

    if (reduced || !texto.current) {
      trocar();
      return;
    }

    gsap
      .timeline()
      .to(texto.current, { autoAlpha: 0, y: -6, duration: 0.32, ease: 'brandIn' })
      .add(trocar)
      .fromTo(
        texto.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: 'brand' },
      );
  }, [embaralhar, gravar, indice, reduced, total]);

  /* ------------------------------------------- retoma de onde parou */
  useEffect(() => {
    let restante: number[] | null = null;
    let atual: number | null = null;
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto) as { restante?: unknown; atual?: unknown };
        if (Array.isArray(salvo.restante)) {
          restante = salvo.restante.filter(
            (n): n is number => typeof n === 'number' && n >= 0 && n < total,
          );
        }
        if (typeof salvo.atual === 'number' && salvo.atual >= 0 && salvo.atual < total) {
          atual = salvo.atual;
        }
      }
    } catch {
      /* ignora: a faixa funciona sem memória */
    }

    saco.current = restante && restante.length ? restante : embaralhar(atual ?? undefined);
    /* Ao entrar na página, já mostra um versículo diferente do índice 0 que veio
       do servidor — assim duas visitas seguidas não abrem com o mesmo texto. */
    if (total > 1) {
      const primeiro = saco.current.shift() as number;
      setIndice(primeiro);
      gravar(saco.current, primeiro);
    }
  }, [embaralhar, gravar, total]);

  /* ------------------------------------------------------ rotação */
  useEffect(() => {
    if (reduced || total < 2) return;
    const ms = Math.max(6, verseBand.intervalo) * 1000;
    const id = window.setInterval(() => {
      if (!pausado.current) proximo();
    }, ms);
    return () => window.clearInterval(id);
  }, [proximo, reduced, total]);

  /* entrada da faixa ao aparecer na tela */
  useGSAP(
    () => {
      if (reduced || !texto.current) return;
      gsap.fromTo(
        texto.current,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'brand',
          scrollTrigger: { trigger: texto.current, start: 'top 92%', once: true },
        },
      );
    },
    { dependencies: [] },
  );

  if (!verseBand.ativo || total === 0) return null;

  const atual = verses[indice] ?? verses[0];

  return (
    <section
      aria-label="Versículo"
      className="relative overflow-hidden border-t border-hair bg-panel-2/60"
      onMouseEnter={() => {
        pausado.current = true;
      }}
      onMouseLeave={() => {
        pausado.current = false;
      }}
      onFocus={() => {
        pausado.current = true;
      }}
      onBlur={() => {
        pausado.current = false;
      }}
    >
      {/* um fio de luz da marca, bem discreto, para a faixa não parecer um
          rodapé a mais */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-30"
      />

      <div className="shell flex flex-col items-center gap-3 py-7 text-center md:flex-row md:justify-center md:gap-6 md:py-6">
        {verseBand.chamada && (
          <p className="flex shrink-0 items-center gap-2 text-[.6875rem] font-semibold uppercase tracking-[0.2em] text-fg-4">
            <Icon name="spark" size={12} className="text-accent-ink" />
            {verseBand.chamada}
          </p>
        )}

        <div
          ref={texto}
          aria-live="off"
          className="min-w-0 max-w-[62ch] md:border-l md:border-hair md:pl-6"
        >
          <p className="text-balance font-display text-[.9375rem] italic leading-relaxed text-fg-2 md:text-[1rem]">
            “{atual.texto}”
          </p>
          <p className="mt-1.5 text-[.75rem] uppercase tracking-[0.16em] text-fg-4">
            <span data-verse-ref className="font-semibold text-accent-ink">
              {atual.referencia}
            </span>
            <span className="mx-1.5 opacity-50">·</span>
            {verseBand.traducao}
          </p>
        </div>

        {/* O botão é sempre renderizado. Condicioná-lo a `prefersReducedMotion()`
            dentro do JSX quebrava a hidratação: no servidor a preferência é
            desconhecida (o valor cai no padrão) e no cliente ela já está
            resolvida, então servidor e navegador produziam marcações
            diferentes — React #418. Quem está em modo sem movimento não vê a
            faixa trocar sozinha, mas continua podendo avançar no botão, o que
            é melhor do que esconder o controle. */}
        {total > 1 && (
          <button
            type="button"
            onClick={proximo}
            aria-label="Ver outro versículo"
            className="group/v grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair text-fg-4 transition-all duration-300 ease-brand hover:border-brand-2/50 hover:text-accent-ink focus-visible:border-brand-2/50"
          >
            <Icon
              name="arrow-right"
              size={14}
              className="transition-transform duration-300 ease-brand group-hover/v:translate-x-0.5"
            />
          </button>
        )}
      </div>
    </section>
  );
}

export default VerseBand;
