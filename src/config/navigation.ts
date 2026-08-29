export interface NavItem {
  label: string;
  /** Âncora na home ou rota própria */
  href: string;
}

/** Menu principal do header. A ordem aqui é a ordem exibida. */
export const mainNav: NavItem[] = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Seguros', href: '/#seguros' },
  { label: 'Sobre nós', href: '/#sobre' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Dúvidas frequentes', href: '/#faq' },
  { label: 'Contato', href: '/#contato' },
];

/** Links rápidos do footer. */
export const footerNav: NavItem[] = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Seguros', href: '/#seguros' },
  { label: 'Por que a FIXSEG', href: '/#diferenciais' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Sobre nós', href: '/#sobre' },
  { label: 'Conteúdo', href: '/#blog' },
  { label: 'Dúvidas frequentes', href: '/#faq' },
  { label: 'Cotação', href: '/cotacao' },
];

export const legalNav: NavItem[] = [
  { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
  { label: 'Termos de Uso', href: '/termos-de-uso' },
];
