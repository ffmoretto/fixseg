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
/* A seção de curiosidades NÃO entra aqui de propósito: os seis itens acima já
   ocupam cerca de 600px e, somados à logo, ao seletor de tema, ao atalho da
   calculadora e ao CTA, é o limite do que cabe na barra. O atalho para ela
   existe nos links do rodapé. */

/**
 * Atalho da calculadora de bônus.
 *
 * Fica fora do `mainNav` de propósito: o menu de desktop já tem seis itens e
 * um sétimo estouraria a largura em telas de 1024px. A calculadora aparece
 * como botão próprio no cabeçalho (ao lado do CTA principal), como item
 * destacado no menu mobile e na lista do rodapé — todos leem daqui.
 */
export const calculadoraNav: NavItem = {
  label: 'Calculadora de bônus',
  href: '/calculadora-bonus',
};

/** Rótulo curto do botão do cabeçalho, quando há espaço para texto. */
export const calculadoraLabelCurto = 'Bônus';

/**
 * Links rápidos do footer.
 *
 * Tem entrada para `/#curiosidades` e NÃO tem para `/#blog`. A diferença é a
 * garantia de existência: a seção de curiosidades é conteúdo próprio, sempre
 * presente (`src/config/curiosities.ts`), então o atalho nunca cai no vazio. A
 * de artigos só aparece depois que a corretora publicar o primeiro post — e um
 * link fixo para ela apontaria para um destino inexistente no estado padrão de
 * uma publicação nova.
 */
export const footerNav: NavItem[] = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Seguros', href: '/#seguros' },
  { label: 'Por que a FIXSEG', href: '/#diferenciais' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Sobre nós', href: '/#sobre' },
  { label: 'Curiosidades', href: '/#curiosidades' },
  { label: 'Dúvidas frequentes', href: '/#faq' },
  { label: 'Calculadora de bônus', href: '/calculadora-bonus' },
  { label: 'Cotação', href: '/cotacao' },
];

export const legalNav: NavItem[] = [
  { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
  { label: 'Termos de Uso', href: '/termos-de-uso' },
];
