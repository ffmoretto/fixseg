'use client';

import { useId, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/icons';
import type { FieldType } from '@/config/insurances';

interface Props {
  label: string;
  name: string;
  type?: FieldType | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  error?: string;
  hint?: string;
  full?: boolean;
  autoComplete?: string;
  rows?: number;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
}

const controlBase =
  'peer w-full rounded-xl border bg-tint/[.03] px-4 text-fg placeholder:text-fg-4 ' +
  'transition-[border-color,box-shadow,background-color] duration-300 ease-brand ' +
  'focus:border-brand-2/70 focus:bg-tint/[.055] focus:outline-none focus:ring-4 focus:ring-[rgba(2,179,249,.14)]';

/**
 * Campo de formulário com rótulo sempre visível (melhor para acessibilidade
 * e para preenchimento em mobile), estado de erro anunciado por aria-live e
 * altura de toque de 52px.
 */
export function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  required,
  error,
  hint,
  full,
  autoComplete,
  rows = 4,
  inputMode,
}: Props) {
  const id = useId();
  /**
   * O erro aparece assim que o componente pai o informa (ou seja, quando o
   * usuário tenta avançar/enviar), sem esperar o campo perder o foco. Antes,
   * clicar em "Continuar" com um campo obrigatório vazio não mostrava
   * mensagem alguma — parecia que o botão não funcionava.
   */
  const showError = !!error;
  const describedBy = [hint ? `${id}-hint` : null, showError ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange(e.target.value);

  const nativeType =
    type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text';

  return (
    <div className={cn('flex flex-col gap-2', full && 'sm:col-span-2')}>
      <label htmlFor={id} className="text-[.9375rem] font-medium text-fg-2">
        {label}
        {required && (
          <span className="ml-1 text-accent-ink" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={handle}
            placeholder={placeholder}
            required={required}
            rows={rows}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy || undefined}
            className={cn(controlBase, 'min-h-[124px] resize-y py-3.5 text-[1.0625rem] leading-relaxed', showError ? 'border-red-400/70' : 'border-hair')}
          />
        ) : type === 'select' ? (
          <>
            <select
              id={id}
              name={name}
              value={value}
              onChange={handle}
                required={required}
              aria-invalid={showError || undefined}
              aria-describedby={describedBy || undefined}
              className={cn(
                controlBase,
                'h-[52px] appearance-none pr-11 text-[1.0625rem]',
                showError ? 'border-red-400/70' : 'border-hair',
                !value && 'text-fg-4',
              )}
            >
              <option value="" disabled className="bg-panel text-fg-3">
                Selecione…
              </option>
              {options?.map((o) => (
                <option key={o} value={o} className="bg-panel text-fg">
                  {o}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-down"
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fg-4 transition-transform duration-300 peer-focus:rotate-180 peer-focus:text-accent-ink"
            />
          </>
        ) : (
          <input
            id={id}
            name={name}
            type={nativeType}
            inputMode={inputMode}
            value={value}
            onChange={handle}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy || undefined}
            className={cn(controlBase, 'h-[52px] text-[1.0625rem]', showError ? 'border-red-400/70' : 'border-hair')}
          />
        )}

        {/* traço luminoso que cresce no foco (microinteração) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-brand-gradient transition-[width] duration-500 ease-brand peer-focus:w-[calc(100%-1.5rem)]"
        />
      </div>

      {hint && !showError && (
        <p id={`${id}-hint`} className="text-[.875rem] text-fg-4">
          {hint}
        </p>
      )}

      {showError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-[.875rem] font-medium text-red-300"
        >
          <Icon name="alert" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export default Field;
