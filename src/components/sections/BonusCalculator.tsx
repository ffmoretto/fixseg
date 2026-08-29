'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, ScrollSmoother } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import {
  CLASSES_OPCOES,
  SINISTROS_OPCOES,
  TEXTOS,
  calcularBonus,
  formatarDataBR,
  hojeISO,
  mensagemWhatsapp,
  validarEntrada,
  type ErrosBonus,
  type ResultadoBonus,
} from '@/config/bonus';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import Icon, { type IconName } from '@/components/icons';
import Field from '@/components/ui/Field';
import Button, { LinkButton } from '@/components/ui/Button';
import Counter from '@/components/ui/Counter';

/**
 * =============================================================================
 * CALCULADORA DE BÔNUS DO SEGURO AUTO
 * =============================================================================
 * Formulário + resultado. Toda a regra e todo o texto vêm de
 * `src/config/bonus.ts`; aqui só existe interface.
 *
 * Três cuidados que valem conhecer antes de mexer:
 *
 * 1. HIDRATAÇÃO — a data de hoje NUNCA é lida durante a renderização. O campo
 *    "data da renovação" nasce vazio e é preenchido no `useEffect` abaixo, já
 *    no cliente. Ler o relógio no render faria o HTML do servidor divergir do
 *    HTML do navegador.
 * 2. PRIVACIDADE — nada é enviado a lugar nenhum. Não há `fetch`, não há
 *    `/api/leads`, não há armazenamento. O cálculo é uma função pura rodando no
 *    próprio navegador, e a tela diz isso ao visitante.
 * 3. MOVIMENTO — a preferência é lida de forma síncrona com
 *    `prefersReducedMotion()`, para a animação ser construída uma única vez com
 *    o valor certo. Com movimento reduzido nada some: só não anima.
 * =============================================================================
 */

/** Altura do header rolado (76px) mais folga — o mesmo valor do AnchorScroll. */
const HEADER_OFFSET = 96;

/** Ícone e cor do selo de variação, por direção do movimento. */
const SELO: Record<ResultadoBonus['direcao'], { icon: IconName; classes: string }> = {
  subiu: {
    icon: 'trending-up',
    classes: 'border-brand-2/45 bg-brand-2/[.1] text-accent-ink',
  },
  manteve: {
    icon: 'equal',
    classes: 'border-hair bg-tint/[.05] text-fg-2',
  },
  perdeu: {
    icon: 'trending-down',
    classes: 'border-red-400/40 bg-red-400/[.08] text-red-300',
  },
};

export function BonusCalculator() {
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const [inicioVigencia, setInicioVigencia] = useState('');
  const [fimVigencia, setFimVigencia] = useState('');
  const [dataReferencia, setDataReferencia] = useState('');
  const [classeRotulo, setClasseRotulo] = useState('');
  const [sinistrosRotulo, setSinistrosRotulo] = useState(SINISTROS_OPCOES[0].rotulo);

  const [erros, setErros] = useState<ErrosBonus>({});
  const [resultado, setResultado] = useState<ResultadoBonus | null>(null);

  /* A data de "hoje" só pode ser lida depois da hidratação. */
  useEffect(() => {
    setDataReferencia((atual) => atual || hojeISO());
  }, []);

  const limparErro = (campo: keyof ErrosBonus) =>
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e));

  const valorClasse = CLASSES_OPCOES.find((o) => o.rotulo === classeRotulo)?.valor;
  const valorSinistros = SINISTROS_OPCOES.find((o) => o.rotulo === sinistrosRotulo)?.valor;

  /* ------------------------------------------------------------- cálculo -- */
  const calcular = () => {
    const entrada = {
      inicioVigencia,
      fimVigencia,
      dataReferencia,
      classeAtual: valorClasse ?? NaN,
      sinistros: valorSinistros ?? NaN,
    };

    const proximosErros = validarEntrada(entrada);
    setErros(proximosErros);

    if (Object.values(proximosErros).some(Boolean)) {
      /* pequeno tremor no painel para sinalizar o erro, como no formulário
         de cotação — sem movimento quando a preferência pede o contrário */
      if (!reduced && stageRef.current) {
        gsap.fromTo(
          stageRef.current,
          { x: -6 },
          { x: 0, duration: 0.42, ease: 'elastic.out(1,0.35)' },
        );
      }
      return;
    }

    const calculado = calcularBonus(entrada);
    setResultado(calculado);
    /* Evento sem nenhum dado do visitante: só o fato de ter calculado. */
    track('bonus_calculate', { regra: calculado.regra });
  };

  const recalcular = () => setResultado(null);

  /* Traz o TOPO do resultado para a área visível, logo abaixo do cabeçalho.
     Duas decisões aqui:
     · O alvo é o topo do painel, não o centro. O resultado é mais alto que a
       janela, e centralizá-lo jogava justamente a classe em destaque — a
       informação principal — para cima da dobra.
     · A rolagem passa pelo ScrollSmoother quando ele está ativo, como faz o
       AnchorScroll. Uma rolagem nativa (`scrollIntoView`) o deixa
       dessincronizado, porque ele posiciona o conteúdo por transform: a página
       parava no lugar errado. */
  useEffect(() => {
    if (!resultado) return;
    const alvo = stageRef.current;
    if (!alvo) return;

    /* pequena espera para o painel novo estar medido antes de rolar */
    const id = window.setTimeout(() => {
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.scrollTo(alvo, !reduced, `top ${HEADER_OFFSET}px`);
        return;
      }

      const y = alvo.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      if (reduced) {
        window.scrollTo({ top: y, behavior: 'auto' });
        return;
      }
      gsap.to(window, {
        scrollTo: { y, autoKill: false },
        duration: 0.8,
        ease: 'brand',
        overwrite: 'auto',
      });
    }, 60);

    return () => window.clearTimeout(id);
  }, [resultado, reduced]);

  /* entrada animada do painel (formulário ou resultado) */
  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage || reduced) return;
      const painel = stage.querySelector('[data-bonus-panel]');
      if (!painel) return;

      const tl = gsap.timeline();
      tl.fromTo(
        painel,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'brand', clearProps: 'transform' },
      ).fromTo(
        painel.querySelectorAll('[data-bonus-item]'),
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'brand', clearProps: 'transform' },
        '-=0.3',
      );

      return () => tl.kill();
    },
    { dependencies: [resultado, reduced] },
  );

  const wa = resultado ? whatsappUrl(mensagemWhatsapp(resultado)) : null;
  const selo = resultado ? SELO[resultado.direcao] : null;

  /* ============================================================ resultado = */
  if (resultado && selo) {
    return (
      <div
        ref={stageRef}
        className="surface-gradient-border relative overflow-hidden"
      >
        <div aria-hidden="true" className="glow-panel pointer-events-none absolute inset-0" />

        <div data-bonus-panel className="relative px-6 py-9 md:px-9 md:py-11">
          <div role="status" aria-live="polite">
            {/* Resumo em texto para leitor de tela: o número grande é
                decorativo do ponto de vista da acessibilidade, porque o
                contador troca o conteúdo quadro a quadro durante a animação. */}
            <p className="sr-only">
              {TEXTOS.resultadoEyebrow}: classe {resultado.novaClasse}. {resultado.variacaoRotulo}.{' '}
              {resultado.frase}
            </p>

            {/* ---------------------------------------------- classe em destaque */}
            <div data-bonus-item className="flex flex-col items-center text-center">
              {/* Sem ícone aqui, de propósito: em 390px o rótulo quebra em duas
                  linhas e o ícone, sendo item flexível, ficava sozinho na
                  primeira linha, fora do eixo do texto centralizado. */}
              <span className="eyebrow text-center">{TEXTOS.resultadoEyebrow}</span>

              <div aria-hidden="true" className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-[1.375rem] font-medium text-fg-4">Classe</span>
                <Counter
                  value={resultado.novaClasse}
                  duration={1.1}
                  className="text-gradient-brand font-display text-[clamp(3.75rem,13vw,6rem)] font-semibold leading-none"
                />
                <span className="font-display text-[1.375rem] font-medium text-fg-4">de 10</span>
              </div>

              <span
                className={cn(
                  'mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[.9375rem] font-semibold',
                  selo.classes,
                )}
              >
                <Icon name={selo.icon} size={16} />
                {resultado.variacaoRotulo}
              </span>
            </div>

            {/* ------------------------------------------------------ indicadores */}
            <dl
              data-bonus-item
              className="mt-9 grid gap-2.5 sm:grid-cols-3"
            >
              {[
                { rotulo: TEXTOS.rotuloClasseAtual, valor: `Classe ${resultado.classeAtual}` },
                {
                  rotulo: TEXTOS.rotuloDiasVigencia,
                  valor: `${resultado.diasVigencia.toLocaleString('pt-BR')} dias`,
                },
                {
                  rotulo: TEXTOS.rotuloDiasAtraso,
                  valor: `${resultado.diasDesdeVencimento.toLocaleString('pt-BR')} dias`,
                },
              ].map((item) => (
                <div
                  key={item.rotulo}
                  className="rounded-2xl border border-hair bg-tint/[.025] p-4 text-center sm:text-left"
                >
                  <dt className="text-[.875rem] uppercase tracking-[0.12em] text-fg-4">
                    {item.rotulo}
                  </dt>
                  <dd className="mt-1.5 text-[1.0625rem] font-semibold text-fg">{item.valor}</dd>
                </div>
              ))}
            </dl>

            {/* -------------------------------------------------- regra aplicada */}
            <div
              data-bonus-item
              className="mt-2.5 rounded-2xl border border-hair bg-tint/[.025] p-5"
            >
              <p className="text-[.875rem] uppercase tracking-[0.12em] text-fg-4">
                {TEXTOS.rotuloRegra}
              </p>
              <p className="mt-2 text-[1.0625rem] leading-relaxed text-fg-2">{resultado.frase}</p>
              <p className="mt-3 text-[.9375rem] leading-relaxed text-fg-4">
                Apólice de {formatarDataBR(inicioVigencia)} a {formatarDataBR(fimVigencia)},
                renovação em {formatarDataBR(dataReferencia)}.
              </p>
            </div>

            {/* ---------------------------------------- avisos das regras de vigência */}
            {resultado.avisos.map((aviso) => (
              <div
                key={aviso}
                data-bonus-item
                className="mt-2.5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/[.06] p-5"
              >
                <Icon name="alert" size={18} className="mt-[3px] shrink-0 text-red-300" />
                <p className="text-[.96875rem] leading-relaxed text-fg-2">{aviso}</p>
              </div>
            ))}

            {/* ------------------------------------------- faixa típica de desconto */}
            <div
              data-bonus-item
              className="mt-2.5 rounded-2xl border border-brand-2/30 bg-brand-2/[.06] p-5"
            >
              <p className="text-[.875rem] uppercase tracking-[0.12em] text-fg-4">
                {TEXTOS.rotuloFaixa}
              </p>
              <p className="mt-2 text-[1.0625rem] font-semibold text-fg">
                Classe {resultado.novaClasse}: {resultado.faixa.rotulo}
              </p>
              <p className="mt-2 text-[.9375rem] leading-relaxed text-fg-3">{TEXTOS.faixaAviso}</p>
            </div>

            {/* ------------------------------------------------------- ressalva */}
            <div
              data-bonus-item
              className="mt-2.5 rounded-2xl border border-hair bg-panel-2/60 p-5"
            >
              <p className="flex items-center gap-2 text-[1.0625rem] font-semibold text-fg">
                <Icon name="alert" size={17} className="shrink-0 text-accent-ink" />
                {TEXTOS.ressalvaTitulo}
              </p>
              <p className="mt-2 text-[.96875rem] leading-relaxed text-fg-3">{TEXTOS.ressalva}</p>
            </div>
          </div>

          {/* ----------------------------------------------------------- ações */}
          <p data-bonus-item className="mt-8 text-[.96875rem] text-fg-3">
            {TEXTOS.ctaLegenda}
          </p>

          <div data-bonus-item className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton
              href="/cotacao?seguro=seguro-auto"
              size="md"
              icon="arrow-right"
              onClick={() =>
                track('cta_click', { placement: 'calculadora_bonus', label: TEXTOS.ctaCotacao })
              }
            >
              {TEXTOS.ctaCotacao}
            </LinkButton>

            {wa && (
              <LinkButton
                href={wa}
                external
                variant="whatsapp"
                size="md"
                icon="whatsapp"
                iconPosition="left"
                onClick={() => track('whatsapp_click', { placement: 'calculadora_bonus' })}
              >
                {TEXTOS.ctaWhatsapp}
              </LinkButton>
            )}

            <Button variant="secondary" size="md" icon="calculator" iconPosition="left" onClick={recalcular}>
              {TEXTOS.botaoRecalcular}
            </Button>
          </div>

          <p data-bonus-item className="mt-7 flex items-start gap-2 text-[.9375rem] leading-relaxed text-fg-4">
            <Icon name="shield-check" size={16} className="mt-[3px] shrink-0" />
            {TEXTOS.privacidade}
          </p>
        </div>
      </div>
    );
  }

  /* ========================================================== formulário == */
  return (
    <div ref={stageRef} className="surface relative overflow-hidden">
      <div data-bonus-panel>
        <div className="border-b border-hair px-6 pb-6 pt-7 md:px-9 md:pt-8">
          <span data-bonus-item className="eyebrow">
            <Icon name="calculator" size={13} />
            {TEXTOS.eyebrow}
          </span>
          <p data-bonus-item className="mt-3 text-[1.0625rem] leading-relaxed text-fg-3">
            {TEXTOS.subtitulo}
          </p>
        </div>

        <div className="px-6 py-7 md:px-9 md:py-9">
          <div data-bonus-item className="grid gap-5 sm:grid-cols-2">
            <Field
              label={TEXTOS.labelInicio}
              name="inicio-vigencia"
              type="date"
              value={inicioVigencia}
              onChange={(v) => {
                setInicioVigencia(v);
                limparErro('inicioVigencia');
              }}
              hint={TEXTOS.hintInicio}
              required
              error={erros.inicioVigencia}
            />

            <Field
              label={TEXTOS.labelFim}
              name="fim-vigencia"
              type="date"
              value={fimVigencia}
              onChange={(v) => {
                setFimVigencia(v);
                limparErro('fimVigencia');
              }}
              hint={TEXTOS.hintFim}
              required
              error={erros.fimVigencia}
            />

            <Field
              label={TEXTOS.labelClasse}
              name="classe-atual"
              type="select"
              options={CLASSES_OPCOES.map((o) => o.rotulo)}
              value={classeRotulo}
              onChange={(v) => {
                setClasseRotulo(v);
                limparErro('classeAtual');
              }}
              hint={TEXTOS.hintClasse}
              required
              error={erros.classeAtual}
            />

            <Field
              label={TEXTOS.labelSinistros}
              name="sinistros"
              type="select"
              options={SINISTROS_OPCOES.map((o) => o.rotulo)}
              value={sinistrosRotulo}
              onChange={(v) => {
                setSinistrosRotulo(v);
                limparErro('sinistros');
              }}
              hint={TEXTOS.hintSinistros}
              required
              error={erros.sinistros}
            />

            <Field
              label={TEXTOS.labelReferencia}
              name="data-referencia"
              type="date"
              value={dataReferencia}
              onChange={(v) => {
                setDataReferencia(v);
                limparErro('dataReferencia');
              }}
              hint={TEXTOS.hintReferencia}
              error={erros.dataReferencia}
              full
            />
          </div>

          <p
            data-bonus-item
            className="mt-7 flex items-start gap-2 text-[.9375rem] leading-relaxed text-fg-4"
          >
            <Icon name="shield-check" size={16} className="mt-[3px] shrink-0" />
            {TEXTOS.privacidade}
          </p>
        </div>

        <div className="border-t border-hair px-6 py-5 md:px-9">
          <div data-bonus-item className="sm:w-fit">
            <Button onClick={calcular} size="md" icon="arrow-right" full>
              {TEXTOS.botaoCalcular}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusCalculator;
