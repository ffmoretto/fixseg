'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { insurances, insuranceBySlug, type QuoteField } from '@/config/insurances';
import { site } from '@/config/site';
import { collectUtm, submitLead, validateLead } from '@/services/leads';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn, isValidEmail, isValidPhone, maskCep, maskCnpj, maskPhone } from '@/lib/utils';
import Icon from '@/components/icons';
import Field from '@/components/ui/Field';
import Button, { LinkButton } from '@/components/ui/Button';
import SuccessCheck from '@/components/ui/SuccessCheck';

/**
 * =============================================================================
 * FORMULÁRIO DE COTAÇÃO EM 4 ETAPAS
 * =============================================================================
 *   1. Tipo de seguro
 *   2. Informações necessárias (campos vindos da configuração do produto)
 *   3. Dados de contato
 *   4. Confirmação
 *
 * O envio passa por /api/leads (server-side). Nenhuma credencial de CRM,
 * Supabase ou API de cotação existe no navegador. Enquanto nenhum destino
 * estiver configurado, a resposta é honesta: o lead é registrado e a equipe
 * entra em contato — nada de integração simulada.
 * =============================================================================
 */

const STEPS = ['Tipo de seguro', 'Informações', 'Contato', 'Confirmação'] as const;

const contactPreferences = ['WhatsApp', 'Telefone', 'E-mail', 'Tanto faz'];

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const params = useSearchParams();
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; pending?: boolean } | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const insurance = useMemo(() => (slug ? insuranceBySlug(slug) : undefined), [slug]);

  /* pré-seleção pelo parâmetro ?seguro=slug */
  useEffect(() => {
    const q = params.get('seguro');
    if (q && insuranceBySlug(q)) {
      setSlug(q);
      setStep(1);
      track('quote_start', { insurance: q, source: 'url' });
    }
  }, [params]);

  /* barra de progresso animada */
  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;
      const pct = result?.ok ? 1 : step / (STEPS.length - 1);
      if (reduced) {
        gsap.set(bar, { scaleX: pct });
        return;
      }
      gsap.to(bar, { scaleX: pct, duration: 0.7, ease: 'brand' });
    },
    { dependencies: [step, reduced, result] },
  );

  /* transição entre etapas */
  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage || reduced) return;
      const panel = stage.querySelector('[data-step-panel]');
      if (!panel) return;

      const tl = gsap.timeline();
      tl.fromTo(
        panel,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'brand', clearProps: 'transform' },
      ).fromTo(
        panel.querySelectorAll('[data-step-item]'),
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.045,
          ease: 'brand',
          clearProps: 'transform',
        },
        '-=0.3',
      );

      return () => tl.kill();
    },
    { dependencies: [step, result?.ok, reduced] },
  );

  /* ------------------------------------------------------------ validação */
  const validateStep = (target: number): boolean => {
    const next: Record<string, string> = {};

    if (target > 0 && !slug) next.slug = 'Escolha um tipo de seguro para continuar.';

    if (target > 1 && insurance) {
      insurance.quoteFields.forEach((f) => {
        if (f.required && !answers[f.name]?.trim()) next[f.name] = 'Campo obrigatório.';
      });
    }

    if (target > 2) {
      if (contact.name.trim().length < 2) next.name = 'Informe seu nome completo.';
      if (!isValidEmail(contact.email)) next.email = 'Informe um e-mail válido.';
      if (!isValidPhone(contact.phone)) next.phone = 'Informe um telefone com DDD.';
      if (!consent) next.consent = 'É necessário aceitar a Política de Privacidade.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step + 1)) {
      /* pequeno tremor no painel para sinalizar o erro */
      if (!reduced && stageRef.current) {
        gsap.fromTo(
          stageRef.current.querySelector('[data-step-panel]'),
          { x: -6 },
          { x: 0, duration: 0.42, ease: 'elastic.out(1,0.35)' },
        );
      }
      return;
    }
    const target = Math.min(STEPS.length - 1, step + 1);
    setStep(target);
    track('quote_step', { step: target + 1, insurance: slug });
    if (step === 0) track('quote_start', { insurance: slug, source: 'form' });
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  /* --------------------------------------------------------------- envio */
  const onSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setResult(null);

    const payload = {
      origin: 'cotacao' as const,
      insurance: slug,
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      message: contact.message.trim() || undefined,
      preferredContact: contact.preferredContact || undefined,
      answers,
      consent,
      marketingConsent: marketing,
      utm: collectUtm(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    const localErrors = validateLead(payload);
    if (localErrors.length) {
      setResult({ ok: false, message: localErrors[0] });
      setSubmitting(false);
      return;
    }

    try {
      const res = await submitLead(payload);
      setResult(res);
      if (res.ok) track('quote_submit', { insurance: slug });
    } catch {
      setResult({
        ok: false,
        message: 'Falha de conexão. Tente novamente ou fale com a gente pelo WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const setAnswer = (name: string, value: string) => {
    setAnswers((a) => ({ ...a, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const maskFor = (f: QuoteField, v: string) =>
    f.type === 'cep' ? maskCep(v) : f.type === 'cnpj' ? maskCnpj(v) : v;

  const wa = whatsappUrl();

  /* Leva a tela de sucesso para a área visível: o formulário é alto e, sem
     isso, a animação de confirmação podia ficar acima da dobra. */
  useEffect(() => {
    if (!result?.ok) return;
    stageRef.current?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [result?.ok, reduced]);

  /* =========================================================== sucesso === */
  if (result?.ok) {
    return (
      <div
        ref={stageRef}
        className="surface-gradient-border relative overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <div
          aria-hidden="true"
          className="glow-panel pointer-events-none absolute inset-0"
          
        />
        <div
          data-step-panel
          className="relative flex flex-col items-center px-7 py-14 text-center md:px-14"
        >
          <SuccessCheck />

          <h3 data-step-item className="mt-8 font-display text-display-sm font-semibold text-fg">
            Solicitação enviada.
          </h3>
          <p data-step-item className="mt-3 max-w-[46ch] text-[1.0625rem] leading-relaxed text-fg-3">
            {result.message}
          </p>

          <div
            data-step-item
            className="mt-8 grid w-full max-w-[30rem] gap-3 rounded-2xl border border-hair bg-tint/[.03] p-5 text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">Seguro</span>
              <span className="text-[.96875rem] font-medium text-fg">{insurance?.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">Contato</span>
              <span className="text-[.96875rem] font-medium text-fg">{contact.email}</span>
            </div>
            {contact.preferredContact && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">
                  Preferência
                </span>
                <span className="text-[.96875rem] font-medium text-fg">
                  {contact.preferredContact}
                </span>
              </div>
            )}
          </div>

          <div data-step-item className="mt-9 flex flex-col gap-3 sm:flex-row">
            {wa && (
              <LinkButton
                href={wa}
                external
                variant="whatsapp"
                size="md"
                icon="whatsapp"
                iconPosition="left"
                onClick={() => track('whatsapp_click', { placement: 'cotacao_sucesso' })}
              >
                Agilizar pelo WhatsApp
              </LinkButton>
            )}
            <LinkButton href="/" variant="secondary" size="md">
              Voltar ao início
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================ etapas === */
  return (
    <div className="surface relative overflow-hidden">
      {/* cabeçalho com progresso */}
      <div className="border-b border-hair px-6 pb-5 pt-6 md:px-9 md:pt-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[.875rem] font-semibold uppercase tracking-[0.16em] text-accent-ink">
            Etapa {step + 1}
            <span className="text-fg-4"> / {STEPS.length}</span>
          </p>
          <p className="text-[.9375rem] font-medium text-fg-3">{STEPS[step]}</p>
        </div>

        <span className="mt-4 block h-[3px] w-full overflow-hidden rounded-full bg-tint/8">
          <span ref={barRef} className="block h-full origin-left scale-x-0 bg-brand-gradient" />
        </span>

        {/* trilha de etapas */}
        <ol className="mt-5 hidden items-center gap-2 md:flex">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[.8125rem] font-semibold transition-all duration-500 ease-brand',
                  i < step
                    ? 'border-transparent bg-brand-gradient text-on-brand'
                    : i === step
                      ? 'border-brand-2 text-accent-ink'
                      : 'border-hair text-fg-4',
                )}
              >
                {i < step ? <Icon name="check" size={11} /> : i + 1}
              </span>
              <span
                className={cn(
                  'truncate text-[.875rem] transition-colors duration-500',
                  i <= step ? 'text-fg-2' : 'text-fg-4',
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-[1px] flex-1 bg-tint/10" />}
            </li>
          ))}
        </ol>
      </div>

      {/* painéis */}
      <div ref={stageRef} className="px-6 py-7 md:px-9 md:py-9">
        {/* ------------------------------------------------- etapa 1: tipo -- */}
        {step === 0 && (
          <div data-step-panel>
            <h3 data-step-item className="font-display text-[1.375rem] font-semibold text-fg">
              Qual seguro você procura?
            </h3>
            <p data-step-item className="mt-2 text-[.96875rem] text-fg-3">
              Se não souber ao certo, escolha “Outros seguros” e descreva a situação.
            </p>

            <div
              data-step-item
              role="radiogroup"
              aria-label="Tipo de seguro"
              className={cn(
                'mt-6 grid gap-2.5',
                compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
              )}
            >
              {insurances.map((ins) => {
                const active = slug === ins.slug;
                return (
                  <button
                    key={ins.slug}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSlug(ins.slug);
                      setErrors((e) => ({ ...e, slug: '' }));
                    }}
                    className={cn(
                      'group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-400 ease-brand',
                      active
                        ? 'border-brand-2/70 bg-brand-2/[.1] shadow-glow'
                        : 'border-hair bg-tint/[.025] hover:-translate-y-0.5 hover:border-hair-strong hover:bg-tint/[.05]',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors duration-400',
                        active
                          ? 'border-brand-2/50 bg-brand-2/[.14] text-accent-ink'
                          : 'border-hair text-fg-3 group-hover:text-fg',
                      )}
                    >
                      <Icon name={ins.icon} size={20} />
                    </span>
                    <span className="min-w-0">
                      {/* Sem `truncate`: com a tipografia maior, os nomes dos
                          produtos ficavam cortados em "Segur…". Deixamos
                          quebrar em duas linhas e limitamos a descrição. */}
                      <span className="block text-[.96875rem] font-semibold leading-snug text-fg">
                        {ins.name}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[.875rem] leading-snug text-fg-4">
                        {ins.short}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-400',
                        active ? 'border-transparent bg-brand-gradient' : 'border-hair',
                      )}
                    >
                      {active && <Icon name="check" size={11} className="text-on-brand" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.slug && (
              <p role="alert" className="mt-4 flex items-center gap-1.5 text-[.9375rem] text-red-300">
                <Icon name="alert" size={14} />
                {errors.slug}
              </p>
            )}
          </div>
        )}

        {/* ------------------------------------------ etapa 2: informações -- */}
        {step === 1 && insurance && (
          <div data-step-panel>
            <div data-step-item className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-2/35 bg-brand-2/[.1] text-accent-ink">
                <Icon name={insurance.icon} size={21} />
              </span>
              <div>
                <h3 className="font-display text-[1.1875rem] font-semibold text-fg">
                  {insurance.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-[.875rem] font-medium text-accent-ink transition-colors hover:text-fg"
                >
                  trocar tipo de seguro
                </button>
              </div>
            </div>

            <p data-step-item className="mt-5 text-[.96875rem] text-fg-3">
              Estas informações permitem consultar as seguradoras com precisão. Se alguma não se
              aplicar, deixe em branco.
            </p>

            <div data-step-item className="mt-6 grid gap-5 sm:grid-cols-2">
              {insurance.quoteFields.map((f) => (
                <Field
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type={f.type}
                  value={answers[f.name] ?? ''}
                  onChange={(v) => setAnswer(f.name, maskFor(f, v))}
                  placeholder={f.placeholder}
                  options={f.options}
                  required={f.required}
                  error={errors[f.name]}
                  hint={f.hint}
                  full={f.full}
                  inputMode={f.type === 'number' || f.type === 'cep' || f.type === 'cnpj' ? 'numeric' : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------- etapa 3: contato -- */}
        {step === 2 && (
          <div data-step-panel>
            <h3 data-step-item className="font-display text-[1.375rem] font-semibold text-fg">
              Como podemos falar com você?
            </h3>
            <p data-step-item className="mt-2 text-[.96875rem] text-fg-3">
              Usamos seus dados apenas para elaborar e enviar a cotação.
            </p>

            <div data-step-item className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Nome completo"
                name="name"
                value={contact.name}
                onChange={(v) => {
                  setContact((c) => ({ ...c, name: v }));
                  setErrors((e) => ({ ...e, name: '' }));
                }}
                placeholder="Como devemos te chamar"
                required
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Telefone / WhatsApp"
                name="phone"
                type="tel"
                inputMode="tel"
                value={contact.phone}
                onChange={(v) => {
                  setContact((c) => ({ ...c, phone: maskPhone(v) }));
                  setErrors((e) => ({ ...e, phone: '' }));
                }}
                placeholder="(00) 00000-0000"
                required
                error={errors.phone}
                autoComplete="tel"
              />
              <Field
                label="E-mail"
                name="email"
                type="email"
                inputMode="email"
                value={contact.email}
                onChange={(v) => {
                  setContact((c) => ({ ...c, email: v }));
                  setErrors((e) => ({ ...e, email: '' }));
                }}
                placeholder="seu@email.com"
                required
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Preferência de contato"
                name="preferredContact"
                type="select"
                options={contactPreferences}
                value={contact.preferredContact}
                onChange={(v) => setContact((c) => ({ ...c, preferredContact: v }))}
              />
              <Field
                label="Algo mais que devemos saber?"
                name="message"
                type="textarea"
                value={contact.message}
                onChange={(v) => setContact((c) => ({ ...c, message: v }))}
                placeholder="Opcional"
                full
              />
            </div>

            {/* consentimento LGPD */}
            <div data-step-item className="mt-7 flex flex-col gap-3.5">
              <label className="group flex cursor-pointer items-start gap-3 text-[.9375rem] leading-relaxed text-fg-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setErrors((err) => ({ ...err, consent: '' }));
                  }}
                  className="peer sr-only"
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-300 ease-brand',
                    consent
                      ? 'border-transparent bg-brand-gradient'
                      : errors.consent
                        ? 'border-red-400/70'
                        : 'border-hair group-hover:border-hair-strong',
                  )}
                >
                  {consent && <Icon name="check" size={12} className="text-on-brand" />}
                </span>
                <span>
                  Autorizo a {site.shortName} a tratar meus dados para elaborar e enviar esta
                  cotação, conforme a{' '}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    className="font-medium text-accent-ink underline decoration-brand-2/40 underline-offset-2 hover:decoration-brand-2"
                  >
                    Política de Privacidade
                  </a>
                  . <span className="text-accent-ink">*</span>
                </span>
              </label>

              {errors.consent && (
                <p id="consent-error" role="alert" className="flex items-center gap-1.5 text-[.875rem] text-red-300">
                  <Icon name="alert" size={13} />
                  {errors.consent}
                </p>
              )}

              <label className="group flex cursor-pointer items-start gap-3 text-[.9375rem] leading-relaxed text-fg-3">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-300 ease-brand',
                    marketing
                      ? 'border-transparent bg-brand-gradient'
                      : 'border-hair group-hover:border-hair-strong',
                  )}
                >
                  {marketing && <Icon name="check" size={12} className="text-on-brand" />}
                </span>
                <span>Quero receber conteúdos e avisos de renovação (opcional).</span>
              </label>
            </div>
          </div>
        )}

        {/* ----------------------------------------- etapa 4: confirmação -- */}
        {step === 3 && insurance && (
          <div data-step-panel>
            <h3 data-step-item className="font-display text-[1.375rem] font-semibold text-fg">
              Confira antes de enviar
            </h3>

            <div data-step-item className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-brand-2/30 bg-brand-2/[.07] p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-2/[.14] text-accent-ink">
                  <Icon name={insurance.icon} size={19} />
                </span>
                <div className="min-w-0">
                  <p className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">Seguro</p>
                  <p className="text-[1.0625rem] font-semibold leading-snug text-fg">
                    {insurance.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="ml-auto shrink-0 text-[.875rem] font-medium text-accent-ink hover:text-fg"
                >
                  editar
                </button>
              </div>

              {/* respostas do produto */}
              {insurance.quoteFields.some((f) => answers[f.name]) && (
                <div className="rounded-2xl border border-hair bg-tint/[.025] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">
                      Informações
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[.875rem] font-medium text-accent-ink hover:text-fg"
                    >
                      editar
                    </button>
                  </div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {insurance.quoteFields
                      .filter((f) => answers[f.name])
                      .map((f) => (
                        <div key={f.name} className="min-w-0">
                          <dt className="text-[.875rem] text-fg-4">{f.label}</dt>
                          <dd className="mt-0.5 break-words text-[.96875rem] text-fg">
                            {answers[f.name]}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}

              {/* contato */}
              <div className="rounded-2xl border border-hair bg-tint/[.025] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[.875rem] uppercase tracking-[0.14em] text-fg-4">Contato</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[.875rem] font-medium text-accent-ink hover:text-fg"
                  >
                    editar
                  </button>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-[.875rem] text-fg-4">Nome</dt>
                    <dd className="mt-0.5 text-[.96875rem] text-fg">{contact.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[.875rem] text-fg-4">Telefone</dt>
                    <dd className="mt-0.5 text-[.96875rem] text-fg">{contact.phone}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[.875rem] text-fg-4">E-mail</dt>
                    <dd className="mt-0.5 break-words text-[.96875rem] text-fg">
                      {contact.email}
                    </dd>
                  </div>
                  {contact.preferredContact && (
                    <div>
                      <dt className="text-[.875rem] text-fg-4">Preferência</dt>
                      <dd className="mt-0.5 text-[.96875rem] text-fg">
                        {contact.preferredContact}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {result && !result.ok && (
              <p
                role="alert"
                data-step-item
                className="mt-5 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/8 p-4 text-[.9375rem] text-red-200"
              >
                <Icon name="alert" size={15} className="mt-px shrink-0" />
                {result.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* navegação */}
      <div className="flex flex-col gap-3 border-t border-hair px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-9">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className={cn(
            'order-2 inline-flex min-h-[48px] items-center gap-2 text-[.96875rem] font-medium transition-colors duration-300 sm:order-1',
            step === 0 ? 'cursor-not-allowed text-fg-4' : 'text-fg-3 hover:text-fg',
          )}
        >
          <Icon name="chevron-left" size={16} />
          Voltar
        </button>

        <div className="order-1 sm:order-2">
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} size="md" icon="arrow-right" full>
              Continuar
            </Button>
          ) : (
            <Button onClick={onSubmit} size="md" icon="check" loading={submitting} full>
              {submitting ? 'Enviando…' : 'Enviar solicitação'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuoteForm;
