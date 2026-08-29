/**
 * Configuração de tema.
 *
 * Fica aqui, e não no hook, por dois motivos: é uma decisão de projeto (como o
 * resto de src/config) e precisa ser lida também pelo layout, que é um Server
 * Component — importar de um módulo `'use client'` ali seria desnecessário.
 */

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

/**
 * Tema de quem entra pela primeira vez.
 *
 *   'light'  → todos começam no claro (padrão atual)
 *   'dark'   → todos começam no escuro
 *   'system' → segue a configuração do sistema operacional
 *
 * O visitante pode trocar a qualquer momento pelo botão do header; a escolha
 * fica salva no navegador dele e passa a ter precedência sobre este valor.
 */
export const THEME_DEFAULT: ThemePreference = 'light';

export const THEME_STORAGE_KEY = 'fixseg:theme';

/** Cor da barra do navegador em cada tema (deve casar com `--page`). */
export const THEME_BAR_COLOR: Record<Theme, string> = {
  light: '#FAFBFD',
  dark: '#04060B',
};
