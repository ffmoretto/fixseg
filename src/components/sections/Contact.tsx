'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { site, formattedAddress, mapsUrl } from '@/config/site';
import { collectUtm, submitLead } from '@/services/leads';
import { whatsappUrl, telUrl, mailUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn, isValidEmail, isValidPhone, maskPhone } from '@/lib/utils';
import Icon, { type IconName } from '@/components/icons';
import Field from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
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

  const wa = whatsappUrl();
  const tel = telUrl();
  const mail = mailUrl(`Contato pelo site — ${site.shortName}`);
  const address = formattedAddress();
  const maps = mapsUrl();

  /* `wide` = o cartão ocupa a linha inteira. E-mail e endereço são longos: em
     meia largura o e-mail quebrava no meio da palavra ("...com.b / r") e o
     endereço virava cinco linhas. WhatsApp e telefone são curtos e ficam lado
     a lado. */
  const channels: {
    icon: IconName;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    wide?: boolean;
  }[] =
    [
      wa && site.contact.whatsapp
        ? {
            icon: 'whatsapp',
            label: 'WhatsApp',
            /* O número aparece no cartão de telefone e no rodapé. Repeti-lo
               aqui fazia os dois primeiros cartões parecerem duplicados; o que
               distingue este canal é a AÇÃO, não o número. */
            value: 'Abrir conversa agora',
            href: wa,
            external: true,
          }
        : null,
      tel && site.contact.phone
        ? { icon: 'phone', label: 'Telefone', value: site.contact.phone, href: tel }
        : null,
      mail && site.contact.email
        ? { icon: 'mail', label: 'E-mail', value: site.contact.email, href: mail, wide: true }
        : null,
      address
        ? {
            icon: 'map-pin',
            label: 'Endereço',
            value: address,
            href: maps ?? undefined,
            external: !!maps,
            wide: true,
          }
        : null,
    ].filter(Boolean) as never;

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
      {/* Duas colunas de MESMA largura e mesma altura.
          Antes eram .9fr/1.1fr com alinhamento ao topo: a coluna da esquerda
          (título + quatro canais empilhados + horários) ficava ~250px mais
          alta que o formulário, e a seção terminava com um bloco vazio no
          canto inferior direito. Agora os canais ocupam duas colunas, o
          formulário estica até o fim da linha e as duas colunas fecham na
          mesma altura. */}
      <div className="shell grid items-stretch gap-12 lg:grid-cols-2 lg:gap-14">
        {/* informações */}
        <div className="flex flex-col">
          <SectionHeading
            eyebrow="Contato"
            title="Fale com quem entende do seu risco"
            highlight="do seu risco"
            subtitle="Responda o formulário ou escolha o canal que preferir. Atendemos pessoas físicas e empresas."
          />

          {channels.length > 0 && (
            <Reveal stagger={0.08} className="mt-10 grid gap-3 sm:grid-cols-2">
              {channels.map((c) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair bg-tint/[.035] text-accent-ink transition-all duration-400 ease-brand group-hover/ch:border-brand-2/45">
                      <Icon name={c.icon} size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
                        {c.label}
                      </span>
                      <span
                        className={cn(
                          'mt-1 block font-medium text-fg',
                          c.wide ? 'break-words text-[1rem]' : 'text-[1rem] sm:whitespace-nowrap',
                        )}
                      >
                        {c.value}
                      </span>
                    </span>
                    {c.href && (
                      <Icon
                        name="arrow-up-right"
                        size={16}
                        className="ml-auto mt-1 shrink-0 text-fg-4 transition-all duration-400 ease-brand group-hover/ch:translate-x-0.5 group-hover/ch:text-accent-ink"
                      />
                    )}
                  </>
                );

                return (
                  <RevealItem
                    key={c.label}
                    anim="left"
                    className={cn('min-w-0', c.wide && 'sm:col-span-2')}
                  >
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() =>
                          track(c.icon === 'whatsapp' ? 'whatsapp_click' : 'phone_click', {
                            placement: 'contato',
                          })
                        }
                        className="group/ch surface flex h-full items-start gap-4 p-5 transition-[border-color,transform] duration-400 ease-brand hover:-translate-y-0.5 hover:border-brand-2/35"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="surface flex h-full items-start gap-4 p-5">{inner}</div>
                    )}
                  </RevealItem>
                );
              })}
            </Reveal>
          )}

          {/* horários — `lg:mt-auto` empurra o bloco para o rodapé da coluna,
              que é o que faz as duas colunas terminarem na mesma linha. */}
          {site.hours.length > 0 && (
            <Reveal anim="up" delay={0.1} className="mt-6 lg:mt-auto lg:pt-6">
              <div className="surface p-6">
                <p className="flex items-center gap-2 text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-fg-4">
                  <Icon name="clock" size={14} className="text-accent-ink" />
                  Horário de atendimento
                </p>
                <dl className="mt-4 flex flex-col gap-2.5">
                  {site.hours.map((h) => (
                    <div key={h.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-[.96875rem] text-fg-3">{h.label}</dt>
                      <dd className="text-[.96875rem] font-medium text-fg">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          )}

          {/* redes sociais */}
          {Object.values(site.social).some(Boolean) && (
            <Reveal anim="up" delay={0.15} className="mt-6">
              <div className="flex items-center gap-2.5">
                {(
                  [
                    ['instagram', 'Instagram'],
                    ['facebook', 'Facebook'],
                    ['linkedin', 'LinkedIn'],
                    ['youtube', 'YouTube'],
                    ['tiktok', 'TikTok'],
                  ] as const
                ).map(([key, label]) => {
                  const url = site.social[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-11 w-11 place-items-center rounded-full border border-hair text-fg-3 transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:border-brand-2/55 hover:text-fg"
                    >
                      <Icon name={key} size={18} />
                    </a>
                  );
                })}
              </div>
            </Reveal>
          )}
        </div>

        {/* formulário */}
        <Reveal anim="rise" className="flex min-w-0 flex-col">
          {sent?.ok ? (
            <div
              data-contact-success
              role="status"
              aria-live="polite"
              className="surface-gradient-border relative flex h-full flex-col items-center justify-center overflow-hidden px-7 py-14 text-center md:px-12"
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
              className="surface flex h-full flex-col p-6 md:p-9"
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
    </section>
  );
}

export default Contact;
