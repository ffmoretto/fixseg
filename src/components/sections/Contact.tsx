'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { collectUtm, submitLead } from '@/services/leads';
import { track } from '@/lib/analytics';
import { cn, isValidEmail, isValidPhone, maskPhone } from '@/lib/utils';
import Icon from '@/components/icons';
import Field from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import SuccessCheck from '@/components/ui/SuccessCheck';

const subjects = [
  'Quero uma cotação',
  'Dúvida sobre uma apólice vigente',
  'Preciso de ajuda com um sinistro',
  'Renovação de seguro',
  'Seguros para empresa',
  'Outro assunto',
];

export function Contact() {
  /* Leitura síncrona: já correta no primeiro render do cliente, então a
     animação é construída uma única vez em vez de montada e remontada. */
  const reduced = prefersReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ ok: boolean; message: string } | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Informe seu nome.';
    if (!isValidEmail(form.email)) next.email = 'Informe um e-mail válido.';
    if (!isValidPhone(form.phone)) next.phone = 'Informe um telefone com DDD.';
    if (form.message.trim().length < 10) next.message = 'Conte um pouco mais sobre sua necessidade.';
    if (!consent) next.consent = 'É necessário aceitar a Política de Privacidade.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (!reduced && formRef.current) {
        gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.45, ease: 'elastic.out(1,.35)' });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitLead({
        origin: 'contato',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject || undefined,
        message: form.message.trim(),
        consent,
        utm: collectUtm(),
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
      setSent(res);
      if (res.ok) track('contact_submit', {});
    } catch {
      setSent({
        ok: false,
        message: 'Falha de conexão. Tente novamente ou fale com a gente pelo WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* animação de entrada do card de sucesso, já trazido para a área visível */
  useGSAP(
    () => {
      if (!sent?.ok) return;
      document.querySelector('[data-contact-success]')?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      });
      if (reduced) return;
      gsap.fromTo(
        '[data-contact-success]',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'brand' },
      );
    },
    { dependencies: [sent?.ok, reduced] },
  );

  return (
    <section id="contato" className="relative scroll-mt-24 py-section">
      {/* UMA coluna, centrada.
          Antes esta seção repetia WhatsApp, telefone, e-mail, endereço, horário
          e redes sociais em cartões — tudo isso já está no rodapé, que é o
          lugar canônico desses dados no site. Duas cópias da mesma informação
          na mesma página é ruído, e obrigava a manter dois lugares em sincronia.
          Aqui ficou só o que é exclusivo desta seção: o convite e o formulário.
          Os canais de contato vivem no rodapé. */}
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Contato"
          title="Fale com quem entende do seu risco"
          highlight="do seu risco"
          subtitle="Conte o que você precisa proteger e um especialista responde. Atendemos pessoas físicas e empresas."
          className="mx-auto"
        />

        <div className="mx-auto mt-12 w-full max-w-[46rem]">
          <Reveal anim="rise" className="flex min-w-0 flex-col">
          {sent?.ok ? (
            <div
              data-contact-success
              role="status"
              aria-live="polite"
              className="surface-gradient-border relative flex flex-col items-center justify-center overflow-hidden px-7 py-14 text-center md:px-12"
            >
              <div
                aria-hidden="true"
                className="glow-panel pointer-events-none absolute inset-0"
                
              />
              <SuccessCheck />
              <h3 className="relative mt-8 font-display text-display-sm font-semibold text-fg">
                Mensagem enviada.
              </h3>
              <p className="relative mt-3 max-w-[42ch] text-[1.0625rem] leading-relaxed text-fg-3">
                {sent.message}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(null);
                  setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                  setConsent(false);
                }}
                className="relative mt-8 text-[.96875rem] font-semibold text-accent-ink transition-colors hover:text-fg"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={onSubmit}
              noValidate
              className="surface flex flex-col p-6 md:p-9"
              aria-label="Formulário de contato"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nome"
                  name="name"
                  value={form.name}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, name: v }));
                    setErrors((e) => ({ ...e, name: '' }));
                  }}
                  placeholder="Seu nome completo"
                  required
                  error={errors.name}
                  autoComplete="name"
                />
                <Field
                  label="Telefone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, phone: maskPhone(v) }));
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
                  value={form.email}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, email: v }));
                    setErrors((e) => ({ ...e, email: '' }));
                  }}
                  placeholder="seu@email.com"
                  required
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  label="Assunto"
                  name="subject"
                  type="select"
                  options={subjects}
                  value={form.subject}
                  onChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                />
              </div>

              {/* A mensagem fica FORA da grade para poder esticar: é ela que
                  absorve a altura que sobra e faz o cartão fechar exatamente
                  na mesma linha da coluna ao lado. */}
              <div className="mt-5 flex min-h-0 flex-1 flex-col">
                <Field
                  label="Mensagem"
                  name="message"
                  type="textarea"
                  value={form.message}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, message: v }));
                    setErrors((e) => ({ ...e, message: '' }));
                  }}
                  placeholder="Conte o que você precisa proteger ou qual a sua dúvida."
                  required
                  error={errors.message}
                  grow
                  rows={5}
                />
              </div>

              <label className="group mt-6 flex cursor-pointer items-start gap-3 text-[.9375rem] leading-relaxed text-fg-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setErrors((err) => ({ ...err, consent: '' }));
                  }}
                  className="sr-only"
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
                  Autorizo o contato e o tratamento dos meus dados conforme a{' '}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    className="font-medium text-accent-ink underline decoration-brand-2/40 underline-offset-2"
                  >
                    Política de Privacidade
                  </a>
                  . <span className="text-accent-ink">*</span>
                </span>
              </label>

              {errors.consent && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-[.875rem] text-red-300">
                  <Icon name="alert" size={13} />
                  {errors.consent}
                </p>
              )}

              {sent && !sent.ok && (
                <p
                  role="alert"
                  className="mt-5 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/8 p-4 text-[.9375rem] text-red-200"
                >
                  <Icon name="alert" size={15} className="mt-px shrink-0" />
                  {sent.message}
                </p>
              )}

              <div className="mt-7">
                <Button type="submit" size="lg" icon="arrow-right" loading={submitting} full>
                  {submitting ? 'Enviando…' : 'Enviar mensagem'}
                </Button>
              </div>

              <p className="mt-4 text-center text-[.875rem] text-fg-4">
                Seus dados são usados apenas para responder este contato.
              </p>
            </form>
          )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Contact;
