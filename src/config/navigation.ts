export interface NavItem {
  label: string;
  /** Âncora na home ou rota própria */
  href: string;
}

/** Menu principal do header. A ordem aqui é a ordem exibida. */
export const mainNav: NavItem[] = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Seguros', href: '/#seguros' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Curiosidades', href: '/#curiosidades' },
  /* Estes dois são PÁGINAS, não âncoras. O conteúdo saiu da home (que estava
     longa demais) e ganhou rota própria — e é por isso que o `href` não tem
     `#`: o clique leva para outra página, não rola a atual. */
  { label: 'Sobre nós', href: '/sobre' },
  { label: 'Dúvidas frequentes', href: '/duvidas-frequentes' },
];
/* COMO ESTE MENU CHEGOU AQUI.
   A home encolheu a pedido do cliente e cinco blocos saíram dela. Dois deles —
   "Sobre nós" e "Dúvidas frequentes" — continuam no menu, mas agora como
   PÁGINAS próprias (/sobre e /duvidas-frequentes): o visitante que quiser o
   assunto clica e vai até ele, em vez de atravessá-lo a caminho da cotação.
   "Contato" não voltou: o botão "Calcule seu seguro" leva à página de cotação,
   o botão flutuante de WhatsApp acompanha a rolagem e o rodapé traz e-mail,
   endereço e horário.

   São seis itens, que é o limite da barra: somados à logo, ao seletor de tema,
   ao atalho da calculadora e ao CTA, ocupam o que cabe em 1280px — que é onde o
   menu horizontal aparece (abaixo disso, tudo vive no menu lateral). */

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
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Curiosidades', href: '/#curiosidades' },
  { label: 'Sobre nós', href: '/sobre' },
  { label: 'Dúvidas frequentes', href: '/duvidas-frequentes' },
  { label: 'Calculadora de bônus', href: '/calculadora-bonus' },
  { label: 'Cotação', href: '/cotacao' },
];

export const legalNav: NavItem[] = [
  { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
  { label: 'Termos de Uso', href: '/termos-de-uso' },
];
