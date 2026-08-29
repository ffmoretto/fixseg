'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { site } from '@/config/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';

/**
 * Botão flutuante de WhatsApp.
 * - aparece após a primeira dobra, com entrada em escala;
 * - pulsação discreta (anel), pausada quando o usuário prefere menos movimento;
 * - rótulo que se expande no hover em desktop e permanece compacto no mobile;
 * - some quando o número não está configurado, em vez de gerar link quebrado.
 */
export function WhatsAppFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [dismissedHint, setDismissedHint] = useState(false);
  const reduced = useReducedMotion();
  const href = whatsappUrl();

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        start: 'top -320',
        end: 'max',
        onToggle: (self) => setVisible(self.isActive),
      });
      return () => st.kill();
    },
    { dependencies: [] },
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: visible ? 1 : 0, scale: 1, y: 0 });
        return;
      }
      gsap.to(el, {
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.7,
        y: visible ? 0 : 18,
        duration: 0.55,
        ease: visible ? 'snap' : 'brandIn',
        pointerEvents: visible ? 'auto' : 'none',
      });
    },
    { dependencies: [visible, reduced] },
  );

  /* a dica textual aparece uma vez e recolhe sozinha */
  useEffect(() => {
    if (!visible || dismissedHint || reduced) return;
    const t = setTimeout(() => setDismissedHint(true), 5200);
    return () => clearTimeout(t);
  }, [visible, dismissedHint, reduced]);

  if (!href) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 opacity-0 md:bottom-7 md:right-7"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* dica */}
      <span
        className={cn(
          'hidden max-w-[210px] rounded-2xl border border-hair bg-panel/95 px-4 py-2.5 text-[.9375rem] leading-snug text-fg-2 shadow-lift backdrop-blur-md transition-all duration-500 ease-brand md:block',
          dismissedHint ? 'pointer-events-none translate-x-3 opacity-0' : 'translate-x-0 opacity-100',
        )}
        aria-hidden="true"
      >
        Fale com um especialista agora
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_click', { placement: 'float' })}
        aria-label={`Conversar com a ${site.shortName} no WhatsApp`}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#1FAF54] text-on-brand shadow-[0_14px_38px_-12px_rgba(31,175,84,.85)] transition-transform duration-300 ease-brand hover:scale-[1.07] active:scale-95 md:h-[3.75rem] md:w-[3.75rem]"
      >
        {/* anel de pulsação */}
        {!reduced && (
          <>
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[#1FAF54]/45 animate-pulse-ring" />
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-[#1FAF54]/30 animate-pulse-ring"
              style={{ animationDelay: '1.1s' }}
            />
          </>
        )}
        <Icon
          name="whatsapp"
          size={27}
          className="relative transition-transform duration-300 ease-brand group-hover:rotate-[8deg]"
        />
      </a>
    </div>
  );
}

export default WhatsAppFloat;
