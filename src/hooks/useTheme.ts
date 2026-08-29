'use client';

import { useEffect, useState } from 'react';

/**
 * =============================================================================
 * TEMA CLARO / ESCURO
 * =============================================================================
 * O tema é resolvido por um script que roda ANTES da primeira pintura
 * (src/app/layout.tsx) e gravado no atributo `data-theme` do <html>. Resolver
 * ali, e não em um efeito do React, é o que evita o "flash" de tema errado no
 * carregamento — o problema clássico de quem implementa tema com estado.
 *
 * Ordem de precedência:
 *   1. escolha do visitante (guardada em localStorage);
 *   2. parâmetro `?tema=claro|escuro|auto` na URL;
 *   3. THEME_DEFAULT (abaixo).
 *
 * Note que a configuração do sistema operacional NÃO é seguida por padrão:
 * a decisão do projeto foi entrar sempre no tema claro. Para passar a seguir o
 * sistema, troque THEME_DEFAULT para 'system' — o script do layout já trata
 * esse valor.
 * =============================================================================
 */

import { THEME_DEFAULT, THEME_STORAGE_KEY, type Theme } from '@/config/theme';

export type { Theme } from '@/config/theme';
export { THEME_DEFAULT, THEME_STORAGE_KEY } from '@/config/theme';

export const THEME_EVENT = 'fixseg:themechange';

/** Leitura síncrona do tema aplicado. */
export function currentTheme(): Theme {
  if (typeof document === 'undefined') {
    return THEME_DEFAULT === 'dark' ? 'dark' : 'light';
  }
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** A escolha explícita salva, ou null quando está no padrão. */
export function storedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

/** Aplica um tema e persiste a escolha. `null` volta ao padrão do projeto. */
export function applyTheme(theme: Theme | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (theme) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    else window.localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* navegação privada: vale só nesta sessão */
  }

  const effective: Theme =
    theme ??
    (THEME_DEFAULT === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : (THEME_DEFAULT as Theme));

  document.documentElement.dataset.theme = effective;
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/**
 * Hook para componentes que precisam reagir ao tema.
 *
 * Começa em `null` e assume o valor real no primeiro efeito. Isso é
 * intencional: o servidor não sabe o tema do visitante, então qualquer valor
 * usado no HTML renderizado causaria divergência de hidratação. Enquanto for
 * `null`, renderize um estado neutro (o botão de tema faz exatamente isso).
 */
export function useTheme(): { theme: Theme | null; toggle: () => void } {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();

    window.addEventListener(THEME_EVENT, sync);

    /* observa mudanças feitas por outra aba ou por outro componente */
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) applyTheme(storedTheme());
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  return { theme, toggle: () => setTheme(toggleTheme()) };
}
