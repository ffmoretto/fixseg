'use client';

import Link from 'next/link';
import { site, formattedAddress, mapsUrl } from '@/config/site';
import { footerNav, legalNav } from '@/config/navigation';
import { insurances } from '@/config/insurances';
import { whatsappUrl, telUrl, mailUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import Logo from '@/components/brand/Logo';
import Icon, { type IconName } from '@/components/icons';

const socialIcons: [keyof typeof site.social, IconName, string][] = [
  ['instagram', 'instagram', 'Instagram'],
  ['facebook', 'facebook', 'Facebook'],
  ['linkedin', 'linkedin', 'LinkedIn'],
  ['youtube', 'youtube', 'YouTube'],
  ['tiktok', 'tiktok', 'TikTok'],
];

export function Footer() {
  const year = new Date().getFullYear();
  const wa = whatsappUrl();
  const tel = telUrl();
  const mail = mailUrl();
  const address = formattedAddress();
  const maps = mapsUrl();

  return (
    <footer className="relative overflow-hidden border-t border-hair bg-panel">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-30" />
        <div
          className="glow-a absolute -left-[10%] top-[-40%] h-[46vw] max-h-[520px] w-[46vw] max-w-[520px] rounded-full opacity-40 blur-[110px]"
          
        />
      </div>

      <div className="shell relative">
        {/* topo */}
        <div className="grid gap-12 py-16 lg:grid-cols-[1.35fr_.9fr_.9fr_1fr] lg:gap-10 lg:py-20">
          {/* marca */}
          <div>
            <Logo height={52} />
            <p className="mt-6 max-w-[38ch] text-[.96875rem] leading-relaxed text-fg-3">
              {site.description}
            </p>

            {(wa || tel || mail) && (
              <div className="mt-7 flex flex-col gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_click', { placement: 'footer' })}
                    className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-hair px-4 py-2.5 text-[.9375rem] font-semibold text-fg transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:border-[#1FAF54]/60 hover:text-fg"
                  >
                    <Icon name="whatsapp" size={17} className="text-[#1FAF54]" />
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            )}

            {/* redes sociais */}
            {Object.values(site.social).some(Boolean) && (
              <div className="mt-7 flex items-center gap-2">
                {socialIcons.map(([key, icon, label]) => {
                  const url = site.social[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-hair text-fg-3 transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:border-brand-2/55 hover:text-fg"
                    >
                      <Icon name={icon} size={17} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* links rápidos */}
          <nav aria-label="Links rápidos">
            <h2 className="text-[.8125rem] font-semibold uppercase tracking-[0.18em] text-fg-4">
              Navegação
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex min-h-[40px] items-center gap-1.5 py-1 text-[.96875rem] text-fg-3 transition-colors duration-300 hover:text-fg"
                  >
                    <span className="h-[1px] w-0 bg-brand-2 transition-all duration-300 ease-brand group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* seguros */}
          <nav aria-label="Seguros">
            <h2 className="text-[.8125rem] font-semibold uppercase tracking-[0.18em] text-fg-4">
              Seguros
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {insurances.slice(0, 10).map((ins) => (
                <li key={ins.slug}>
                  <Link
                    href={`/seguros/${ins.slug}`}
                    className="group inline-flex min-h-[40px] items-center gap-1.5 py-1 text-[.96875rem] text-fg-3 transition-colors duration-300 hover:text-fg"
                  >
                    <span className="h-[1px] w-0 bg-brand-2 transition-all duration-300 ease-brand group-hover:w-3" />
                    {ins.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contato */}
          <div>
            <h2 className="text-[.8125rem] font-semibold uppercase tracking-[0.18em] text-fg-4">
              Contato
            </h2>
            <ul className="mt-5 flex flex-col gap-4 text-[.96875rem]">
              {tel && site.contact.phone && (
                <li>
                  <a
                    href={tel}
                    onClick={() => track('phone_click', { placement: 'footer' })}
                    className="flex min-h-[40px] items-start gap-2.5 py-1 text-fg-3 transition-colors duration-300 hover:text-fg"
                  >
                    <Icon name="phone" size={16} className="mt-0.5 shrink-0 text-accent-ink" />
                    {site.contact.phone}
                  </a>
                </li>
              )}
              {mail && site.contact.email && (
                <li>
                  <a
                    href={mail}
                    className="flex min-h-[40px] items-start gap-2.5 break-all py-1 text-fg-3 transition-colors duration-300 hover:text-fg"
                  >
                    <Icon name="mail" size={16} className="mt-0.5 shrink-0 text-accent-ink" />
                    {site.contact.email}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2.5 text-fg-3">
                  <Icon name="map-pin" size={16} className="mt-0.5 shrink-0 text-accent-ink" />
                  <span>
                    {address}
                    {maps && (
                      <>
                        {' '}
                        <a
                          href={maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-accent-ink hover:underline"
                        >
                          ver no mapa
                        </a>
                      </>
                    )}
                  </span>
                </li>
              )}
              {/* O horário COMPLETO mora aqui. A seção de contato mostrava a
                  mesma tabela em um cartão; a duplicidade foi removida de lá, e
                  o rodapé passou a listar todas as faixas em vez de só a
                  primeira. */}
              {site.hours.length > 0 && (
                <li className="flex items-start gap-2.5 text-fg-3">
                  <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-accent-ink" />
                  <span className="flex flex-col gap-1">
                    {site.hours.map((h) => (
                      <span key={h.label}>
                        {h.label}: <span className="text-fg-2">{h.value}</span>
                      </span>
                    ))}
                  </span>
                </li>
              )}
            </ul>

            {/* aviso quando os dados ainda não foram preenchidos */}
            {!tel && !mail && !address && (
              <p className="mt-5 rounded-xl border border-hair bg-tint/[.03] p-4 text-[.875rem] leading-relaxed text-fg-4">
                Dados de contato ainda não configurados. Preencha em{' '}
                <code className="text-accent-ink">src/config/site.ts</code>.
              </p>
            )}
          </div>
        </div>

        {/* base */}
        <div className="hairline" />

        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 text-[.875rem] text-fg-4">
            <p>
              © {year} {site.corporateName}. Todos os direitos reservados.
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {site.cnpj && <span>CNPJ {site.cnpj}</span>}
              {site.susep && <span>Registro SUSEP {site.susep}</span>}
              <span>
                Corretora de seguros. As condições de cada apólice são definidas pela seguradora
                emissora.
              </span>
            </p>
          </div>

          <nav aria-label="Informações legais">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[.875rem]">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[40px] items-center py-1 text-fg-3 transition-colors duration-300 hover:text-accent-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
