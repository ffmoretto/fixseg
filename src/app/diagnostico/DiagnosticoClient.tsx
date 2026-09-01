'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  gsap,
  ScrollSmoother,
  ScrollTrigger,
  ScrollToPlugin,
  DrawSVGPlugin,
  SplitText,
  MotionPathPlugin,
  Observer,
  Flip,
  CustomEase,
} from '@/lib/gsap';
import {
  motionMode,
  motionOverride,
  setMotionOverride,
  type MotionMode,
} from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';

interface Check {
  label: string;
  value: string;
  /** ok = como esperado · warn = explica um comportamento · info = neutro */
  status: 'ok' | 'warn' | 'info';
  note?: string;
}

/**
 * Verificação dos plugins.
 *
 * Há dois tipos no GSAP e eles se checam de formas diferentes:
 *  · plugins de PROPRIEDADE (drawSVG, scrollTo, motionPath) ficam registrados
 *    em `gsap.plugins`, sob o nome da propriedade que eles habilitam;
 *  · os demais são classes importadas (ScrollTrigger, SplitText, Flip…) e
 *    basta conferir se o módulo foi carregado.
 */
const PLUGINS: { name: string; check: () => boolean }[] = [
  { name: 'ScrollTrigger', check: () => typeof ScrollTrigger?.create === 'function' },
  { name: 'ScrollSmoother', check: () => typeof ScrollSmoother?.create === 'function' },
  { name: 'ScrollToPlugin', check: () => !!ScrollToPlugin && hasPropPlugin('scrollTo') },
  { name: 'DrawSVGPlugin', check: () => !!DrawSVGPlugin && hasPropPlugin('drawSVG') },
  { name: 'SplitText', check: () => typeof SplitText?.create === 'function' },
  { name: 'MotionPathPlugin', check: () => !!MotionPathPlugin && hasPropPlugin('motionPath') },
  { name: 'Observer', check: () => typeof Observer?.create === 'function' },
  { name: 'Flip', check: () => typeof Flip?.getState === 'function' },
  { name: 'CustomEase', check: () => typeof CustomEase?.create === 'function' },
];

function hasPropPlugin(prop: string): boolean {
  const registry = (gsap as unknown as { plugins?: Record<string, unknown> }).plugins;
  return !!registry && prop in registry;
}

export default function DiagnosticoClient() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [plugins, setPlugins] = useState<{ name: string; ok: boolean }[]>([]);
  const [override, setOverride] = useState<MotionMode | null>(null);

  const run = useCallback(() => {
    const mode = motionMode();
    const width = window.innerWidth;
    const smoother = ScrollSmoother.get();
    const triggers = ScrollTrigger.getAll().length;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const osReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setOverride(motionOverride());

    setChecks([
      {
        label: 'Preferência de movimento em uso',
        value: mode === 'reduced' ? 'REDUZIDO — animações desligadas' : 'COMPLETO — animações ligadas',
        status: mode === 'reduced' ? 'warn' : 'ok',
        note:
          mode === 'reduced'
            ? 'É por isso que a narrativa não fixa na tela e nada anima. Use o botão abaixo para forçar a experiência completa, ou reative os efeitos de animação no sistema.'
            : undefined,
      },
      {
        label: 'Sistema operacional pede movimento reduzido?',
        value: osReduced ? 'Sim' : 'Não',
        status: osReduced ? 'warn' : 'ok',
        note: osReduced
          ? 'No Windows: Configurações → Acessibilidade → Efeitos visuais → Efeitos de animação. No macOS: Ajustes → Acessibilidade → Exibição → Reduzir movimento. A economia de bateria também liga isso sozinha.'
          : undefined,
      },
      {
        label: 'Escolha manual salva neste navegador',
        value: motionOverride() ? `Sim — "${motionOverride()}"` : 'Não (seguindo o sistema)',
        status: 'info',
      },
      {
        label: 'Largura da janela',
        value: `${width}px`,
        status: 'info',
        note:
          width < 1024
            ? 'Abaixo de 1024px a rolagem suavizada é desligada de propósito — o scroll nativo é mais fluido em telas de toque. A narrativa fixada continua funcionando.'
            : undefined,
      },
      {
        label: 'Dispositivo de toque',
        value: touch ? 'Sim' : 'Não',
        status: 'info',
      },
      {
        label: 'Rolagem suavizada (ScrollSmoother)',
        value: smoother ? 'Ativa' : 'Inativa',
        status: smoother ? 'ok' : 'info',
        note: smoother
          ? undefined
          : 'Inativa é o comportamento correto em movimento reduzido, em telas de toque e abaixo de 1024px.',
      },
      {
        label: 'Gatilhos de scroll registrados',
        value: String(triggers),
        status: triggers > 0 ? 'ok' : 'warn',
        note:
          triggers === 0
            ? 'Zero gatilhos nesta página é esperado (ela não tem animações). Na página inicial, o normal é passar de 20.'
            : undefined,
      },
      {
        label: 'Versão do GSAP',
        value: gsap.version,
        status: 'ok',
      },
    ]);

    setPlugins(
      PLUGINS.map((p) => {
        let ok = false;
        try {
          ok = p.check();
        } catch {
          ok = false;
        }
        return { name: p.name, ok };
      }),
    );
  }, []);

  useEffect(() => {
    run();
    const t = window.setTimeout(run, 1200); // dá tempo de o ScrollSmoother assumir
    return () => window.clearTimeout(t);
  }, [run]);

  const apply = (mode: MotionMode | null) => {
    setMotionOverride(mode);
    window.location.reload();
  };

  return (
    <section className="relative min-h-screen-dvh pb-section pt-[136px] md:pt-[164px]">
      <div className="shell max-w-[54rem]">
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
            <li className="font-medium text-fg-2">Diagnóstico</li>
          </ol>
        </nav>

        <span className="eyebrow">
          Página interna
        </span>
        <h1 className="mt-5 text-display-md font-semibold text-fg">
          Diagnóstico de animações
        </h1>
        <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-fg-3">
          Esta página mostra o que o seu navegador está reportando agora. Ela não aparece em
          nenhum menu e não é indexada por buscadores — serve para descobrir rapidamente por
          que as animações podem não estar rodando em uma máquina específica.
        </p>

        {/* controles */}
        <div className="surface mt-10 p-6 md:p-8">
          <h2 className="font-display text-[1.125rem] font-semibold text-fg">
            Forçar um modo neste navegador
          </h2>
          <p className="mt-2 max-w-prose text-[.96875rem] leading-relaxed text-fg-3">
            A escolha fica salva só neste navegador e vale para todo o site. Também funciona
            pela URL, em qualquer página:{' '}
            <code className="text-accent-ink">?motion=full</code>,{' '}
            <code className="text-accent-ink">?motion=reduced</code> ou{' '}
            <code className="text-accent-ink">?motion=auto</code>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={override === 'full' ? 'primary' : 'secondary'}
              onClick={() => apply('full')}
            >
              Animações completas
            </Button>
            <Button
              size="sm"
              variant={override === 'reduced' ? 'primary' : 'secondary'}
              onClick={() => apply('reduced')}
            >
              Movimento reduzido
            </Button>
            <Button
              size="sm"
              variant={override === null ? 'primary' : 'secondary'}
              onClick={() => apply(null)}
            >
              Seguir o sistema
            </Button>
          </div>
        </div>

        {/* verificações */}
        <div className="mt-6 flex flex-col gap-2.5">
          {checks.map((c) => (
            <div
              key={c.label}
              className={cn(
                'surface p-5',
                c.status === 'warn' && 'border-brand-2/45 bg-brand-2/[.06]',
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="text-[.9375rem] text-fg-3">{c.label}</span>
                <span
                  className={cn(
                    'font-mono text-[.96875rem] font-medium',
                    c.status === 'ok' && 'text-accent-ink',
                    c.status === 'warn' && 'text-fg',
                    c.status === 'info' && 'text-fg-2',
                  )}
                >
                  {c.value}
                </span>
              </div>
              {c.note && (
                <p className="mt-3 max-w-prose text-[.9375rem] leading-relaxed text-fg-3">
                  {c.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* plugins */}
        <div className="surface mt-6 p-6">
          <h2 className="text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
            Plugins do GSAP carregados
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {plugins.map((p) => (
              <li
                key={p.name}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[.875rem]',
                  p.ok
                    ? 'border-brand-2/40 bg-brand-2/[.08] text-fg'
                    : 'border-hair text-fg-4',
                )}
              >
                <Icon name={p.ok ? 'check' : 'close'} size={11} />
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="sm" variant="secondary" icon="arrow-right" onClick={run}>
            Verificar novamente
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center px-2 text-[.9375rem] font-semibold text-accent-ink transition-colors hover:text-fg"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </section>
  );
}
