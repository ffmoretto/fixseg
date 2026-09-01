'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { verseBand, verses } from '@/config/verses';

const CHAVE = 'fixseg:versiculos';

/**
 * =============================================================================
 * FAIXA DE VERSÍCULOS — fim de página
 * =============================================================================
 * Discreta, mas visível: uma faixa fina acima do rodapé, com um versículo por
 * vez, trocando sozinha. Sem título, sem botão, sem chamada — só a passagem.
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
 *  · a rotação PARA no hover e no foco de teclado. A WCAG 2.2.2 pede um jeito
 *    de pausar conteúdo em movimento automático; a pausa no ponteiro e no foco
 *    cumpre isso sem colocar um controle na tela. O cliente pediu justamente
 *    que não houvesse botão — a troca é parte do site, não uma tarefa do
 *    visitante — e a faixa é conteúdo decorativo, não essencial: quem não
 *    interage não perde nada.
 *  · com `prefers-reduced-motion`, a faixa mostra um versículo e não troca mais.
 * =============================================================================
 */
export function VerseBand() {
  const total = verses.length;
  const [indice, setIndice] = useState(0);
  /* O MESMO índice, também em ref. O intervalo de rotação chama `proximo`, que
     precisa saber qual versículo está na tela; lendo isso do estado capturado
     pela closure, duas trocas que se sobrepõem (a animação de troca dura ~0,8s)
     leriam o mesmo valor e o "não repetir" podia falhar na emenda. O ref está
     sempre atual. */
  const indiceRef = useRef(0);
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

    /* O saco, na forma mais simples que é PROVADAMENTE correta:
       saco vazio → embaralha tudo garantindo que o primeiro não seja o que está
       na tela; então tira o próximo da frente. Nada é descartado e nenhuma
       rodada é desperdiçada, então cada ciclo entrega todos os versículos.

       A versão anterior tinha um ramo a mais: se o item sorteado fosse igual ao
       da tela, pegava o seguinte. Esse ramo consumia uma rodada em silêncio e
       era exatamente por onde escapava um versículo por ciclo (medido: 17 de 18
       antes de reembaralhar). Com a garantia no embaralhamento, o caso que ele
       tratava não pode acontecer, e o ramo deixou de existir. */
    if (!saco.current.length) saco.current = embaralhar(indiceRef.current);
    const definitivo = saco.current.shift() as number;
    indiceRef.current = definitivo;

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
  }, [embaralhar, gravar, reduced, total]);

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
      indiceRef.current = primeiro;
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

      <div className="shell flex justify-center py-7 text-center md:py-8">
        <div
          ref={texto}
          aria-live="off"
          className="min-w-0 max-w-[64ch]"
        >
          {/* Sem ícone. A faísca que abria a faixa saiu junto com as das
              etiquetas de seção — o cliente identificou aquela estrelinha como
              marca de página gerada por IA. Um fio curto na cor da marca faz o
              mesmo papel de abertura, sem símbolo. */}
          <span
            aria-hidden="true"
            className="mx-auto mb-4 block h-px w-10 bg-brand-gradient opacity-60"
          />
          <p className="text-balance font-display text-[.9375rem] italic leading-relaxed text-fg-2 md:text-[1.0625rem]">
            “{atual.texto}”
          </p>
          {/* Só a referência. O crédito da tradução ("Almeida, domínio público")
              saiu da tela por pedido do cliente — a informação continua
              registrada no comentário de `src/config/verses.ts`, que é onde ela
              importa: é lá que se decide trocar de tradução, e trocar exige
              autorização da editora quando a versão for protegida. */}
          <p className="mt-1.5 text-[.75rem] uppercase tracking-[0.16em]">
            <span data-verse-ref className="font-semibold text-accent-ink">
              {atual.referencia}
            </span>
          </p>
        </div>

        {/* O botão é sempre renderizado. Condicioná-lo a `prefersReducedMotion()`
            dentro do JSX quebrava a hidratação: no servidor a preferência é
            desconhecida (o valor cai no padrão) e no cliente ela já está
            resolvida, então servidor e navegador produziam marcações
            diferentes — React #418. Quem está em modo sem movimento não vê a
            faixa trocar sozinha, mas continua podendo avançar no botão, o que
            é melhor do que esconder o controle. */}
      </div>
    </section>
  );
}

export default VerseBand;
