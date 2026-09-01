import type { IconName } from '@/components/icons';

/**
 * Conteúdo editorial do site. Tudo aqui é configurável e nada foi inventado
 * a respeito da corretora: números, seguradoras e depoimentos começam vazios
 * ou nulos e as seções correspondentes se ocultam automaticamente.
 */

/* -------------------------------------------------------------------------- */
/* DIFERENCIAIS                                                               */
/* -------------------------------------------------------------------------- */

export interface Differential {
  icon: IconName;
  title: string;
  text: string;
}

export const differentials: Differential[] = [
  {
    icon: 'user-check',
    title: 'Atendimento personalizado',
    text: 'Você fala com quem entende do seu caso, não com um formulário. Cada cotação começa com uma conversa.',
  },
  {
    icon: 'layers',
    title: 'Diversas seguradoras',
    text: 'Comparamos condições em várias companhias e apresentamos as opções lado a lado, com prós e contras.',
  },
  {
    icon: 'compass',
    title: 'Consultoria especializada',
    text: 'Análise técnica de coberturas, franquias e cláusulas — para você contratar entendendo o que está contratando.',
  },
  {
    icon: 'zap',
    title: 'Cotação rápida',
    text: 'Processo enxuto: informações essenciais, retorno objetivo e sem burocracia desnecessária.',
  },
  {
    icon: 'life-buoy',
    title: 'Suporte durante toda a vigência',
    text: 'A relação não termina na assinatura. Endossos, renovações e dúvidas continuam com o mesmo time.',
  },
  {
    icon: 'headset',
    title: 'Atendimento humano',
    text: 'Em um sinistro, ninguém quer robô. Quer alguém do lado, orientando cada passo até a indenização.',
  },
  {
    icon: 'building-user',
    title: 'Soluções para pessoas e empresas',
    text: 'Do seguro de vida familiar à apólice de frota e ao seguro garantia de uma licitação.',
  },
];

/* -------------------------------------------------------------------------- */
/* COMO FUNCIONA                                                              */
/* -------------------------------------------------------------------------- */

export interface Step {
  n: string;
  title: string;
  text: string;
  icon: IconName;
}

export const steps: Step[] = [
  {
    n: '01',
    title: 'Você solicita uma cotação',
    text: 'Pelo site, WhatsApp ou telefone. Poucos dados bastam para começar.',
    icon: 'cursor-click',
  },
  {
    n: '02',
    title: 'Entendemos suas necessidades',
    text: 'Conversamos sobre o seu risco real: o que precisa ser protegido e até onde.',
    icon: 'search-heart',
  },
  {
    n: '03',
    title: 'Buscamos as melhores opções',
    text: 'Consultamos as seguradoras e organizamos um comparativo claro de coberturas e valores.',
    icon: 'layers',
  },
  {
    n: '04',
    title: 'Você escolhe',
    text: 'Com a explicação técnica de cada alternativa. Sem pressão e sem letra miúda.',
    icon: 'check-circle',
  },
  {
    n: '05',
    title: 'Nós cuidamos do resto',
    text: 'Emissão, vistoria, endossos, renovação e acompanhamento de sinistro do início ao fim.',
    icon: 'shield-check',
  },
];

/* -------------------------------------------------------------------------- */
/* SOBRE + INDICADORES                                                        */
/* -------------------------------------------------------------------------- */

export interface Stat {
  /** null = número real ainda não informado; o card não é renderizado. */
  value: number | null;
  suffix?: string;
  prefix?: string;
  label: string;
}

/**
 * IMPORTANTE: preencha com os números reais da corretora.
 * Enquanto estiverem `null`, a seção de indicadores não aparece no site.
 */
export const stats: Stat[] = [
  { value: null, suffix: '+', label: 'Clientes atendidos' },
  { value: null, suffix: '', label: 'Anos de experiência' },
  { value: null, suffix: '+', label: 'Seguros contratados' },
  { value: null, suffix: '', label: 'Seguradoras parceiras' },
];

export const about = {
  eyebrow: 'Sobre a FIXSEG',
  title: 'Segurança para hoje. Tranquilidade para amanhã.',
  /**
   * Textos institucionais. Substitua pelos dados reais de história e propósito
   * da corretora — o que está aqui descreve apenas a proposta de atuação.
   */
  paragraphs: [
    'A FIXSEG existe para transformar a contratação de um seguro em uma decisão consciente. Em vez de empurrar apólices, começamos pela pergunta que importa: o que aconteceria com você, sua família ou sua empresa se o pior acontecesse amanhã?',
    'A partir dessa resposta, desenhamos a proteção. Consultamos diversas seguradoras, comparamos coberturas linha por linha e explicamos cada cláusula em português claro — para que a escolha seja sua, e não uma imposição do mercado.',
    'Atuamos com pessoas físicas e jurídicas, de um seguro de vida individual a operações de transporte de cargas, frotas e seguro garantia. E permanecemos ao lado do cliente durante toda a vigência, especialmente na hora em que a apólice precisa funcionar.',
  ],
  pillars: [
    { title: 'Técnica', text: 'Leitura criteriosa de coberturas, exclusões e franquias antes de qualquer recomendação.' },
    { title: 'Transparência', text: 'Comparativo aberto entre seguradoras, com os pontos fortes e fracos de cada proposta.' },
    { title: 'Presença', text: 'Um interlocutor conhecido para cotação, endosso, renovação e sinistro.' },
  ],
};

/* -------------------------------------------------------------------------- */
/* PARCEIROS DA FIXSEG (seguradoras)                                          */
/* -------------------------------------------------------------------------- */

export interface Insurer {
  /** Nome da companhia, como deve aparecer na tela. */
  name: string;
  /**
   * Caminho do logo em /public/seguradoras/… (SVG ou PNG com fundo
   * transparente). OPCIONAL: enquanto o arquivo não chega, a companhia aparece
   * como cartão tipográfico, com o nome composto na fonte da marca. Basta
   * preencher este campo depois e a imagem assume sozinha.
   */
  logo?: string | null;
  /**
   * Versão da marca para o TEMA ESCURO — a "reversa" monocromática branca que
   * os manuais de marca preveem. Existe porque os arquivos das seguradoras são
   * tinta escura sobre transparente: no tema escuro eles desapareceriam, e
   * recolorir marca de terceiro não é opção.
   *
   * `scripts/logos.py` gera as duas versões de uma vez (`nome.png` e
   * `nome-escuro.png`). Se este campo ficar vazio, o cartão daquela companhia
   * mantém a placa clara também no tema escuro — funciona, mas destoa das
   * outras, então vale gerar a reversa.
   */
  logoDark?: string | null;
  /** Site oficial (opcional) */
  url?: string;
}

/**
 * Adicione aqui APENAS seguradoras com as quais a corretora efetivamente
 * trabalha. Se for usar o logo, o uso da marca precisa estar autorizado e o
 * arquivo deve ficar em /public/seguradoras/ (veja o LEIA-ME da pasta).
 *
 * Com a lista vazia, a seção "Parceiros da FIXSEG" NÃO é renderizada.
 *
 * Exemplo — o nome basta para entrar no carrossel:
 *
 * export const insurers: Insurer[] = [
 *   { name: 'Nome da Seguradora' },
 *   { name: 'Outra Seguradora', url: 'https://…' },
 *   { name: 'Com logo', logo: '/seguradoras/com-logo.svg', url: 'https://…' },
 * ];
 */
export const insurers: Insurer[] = [
  { name: 'AVLA', logo: '/seguradoras/avla.png', logoDark: '/seguradoras/avla-escuro.png', url: 'https://www.avla.com.br' },
  { name: 'AXA', logo: '/seguradoras/axa.png', logoDark: '/seguradoras/axa-escuro.png', url: 'https://www.axa.com.br' },
  { name: 'Allianz', logo: '/seguradoras/allianz.png', logoDark: '/seguradoras/allianz-escuro.png', url: 'https://www.allianz.com.br' },
  { name: 'Azul Seguros', logo: '/seguradoras/azul-seguros.png', logoDark: '/seguradoras/azul-seguros-escuro.png', url: 'https://www.azulseguros.com.br' },
  { name: 'Bradesco Seguros', logo: '/seguradoras/bradesco-seguros.png', logoDark: '/seguradoras/bradesco-seguros-escuro.png', url: 'https://www.bradescoseguros.com.br' },
  { name: 'HDI Seguros', logo: '/seguradoras/hdi-seguros.png', logoDark: '/seguradoras/hdi-seguros-escuro.png', url: 'https://www.hdiseguros.com.br' },
  { name: 'Mapfre', logo: '/seguradoras/mapfre.png', logoDark: '/seguradoras/mapfre-escuro.png', url: 'https://www.mapfre.com.br' },
  { name: 'MetLife', logo: '/seguradoras/metlife.png', logoDark: '/seguradoras/metlife-escuro.png', url: 'https://www.metlife.com.br' },
  { name: 'Porto', logo: '/seguradoras/porto.png', logoDark: '/seguradoras/porto-escuro.png', url: 'https://www.portoseguro.com.br' },
  { name: 'Pottencial', logo: '/seguradoras/pottencial.png', logoDark: '/seguradoras/pottencial-escuro.png', url: 'https://www.pottencial.com.br' },
  { name: 'Sancor Seguros', logo: '/seguradoras/sancor-seguros.png', logoDark: '/seguradoras/sancor-seguros-escuro.png', url: 'https://www.sancorseguros.com.br' },
  { name: 'SulAmérica', logo: '/seguradoras/sulamerica.png', logoDark: '/seguradoras/sulamerica-escuro.png', url: 'https://www.sulamerica.com.br' },
  { name: 'Tokio Marine', logo: '/seguradoras/tokio-marine.png', logoDark: '/seguradoras/tokio-marine-escuro.png', url: 'https://www.tokiomarine.com.br' },
  { name: 'Zurich', logo: '/seguradoras/zurich.png', logoDark: '/seguradoras/zurich-escuro.png', url: 'https://www.zurich.com.br' },
  /* Faltando o arquivo utilizável:
     - Fairfax: o arquivo enviado é a versão CLARA (texto branco), feita para
       fundo escuro — sobre a placa branca do carrossel ela fica invisível.
       Peça a versão escura sobre fundo claro e descomente a linha abaixo.
     - Seguros Unimed, Swiss Re e Yelum foram citados no envio mas os arquivos
       não chegaram.
  */
  // { name: 'Fairfax', logo: '/seguradoras/fairfax.png', logoDark: '/seguradoras/fairfax-escuro.png', url: 'https://www.fairfax.com.br' },
];

/* -------------------------------------------------------------------------- */
/* DEPOIMENTOS DIRETOS                                                        */
/* -------------------------------------------------------------------------- */

export interface Testimonial {
  quote: string;
  author: string;
  /** Cargo/cidade — opcional */
  role?: string;
  /** Produto contratado — opcional */
  product?: string;
  /** Avatar em /public/depoimentos/… — opcional */
  avatar?: string;
}

/**
 * A seção "O que falam de nós" é alimentada pelas AVALIAÇÕES REAIS do perfil
 * da corretora no Google (ver src/services/googleReviews.ts e a seção 5 do
 * README). Esta lista é a alternativa para depoimentos que chegaram FORA do
 * Google — por e-mail, WhatsApp ou formulário — e que tenham autorização de
 * uso por escrito.
 *
 * Se houver itens aqui, eles entram no mesmo carrossel, identificados como
 * "Depoimento enviado à FIXSEG" (e não como avaliação do Google). Vazia, e sem
 * avaliações do Google, a seção inteira não é renderizada — nada é inventado.
 */
export const testimonials: Testimonial[] = [];

/** Autoplay do carrossel de avaliações (ms). 0 desativa. */
export const testimonialsAutoplay = 6500;

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: 'Qual seguro é ideal para mim?',
    a: 'Depende do que você teria dificuldade de repor sozinho. Para uma família, geralmente começa pelo seguro de vida e pelo residencial. Para uma empresa, pelo patrimonial, pela responsabilidade civil e pelas exigências contratuais que ela precisa cumprir. Na cotação, mapeamos isso com você antes de indicar qualquer produto.',
  },
  {
    q: 'Como funciona a cotação?',
    a: 'Você informa o tipo de seguro e alguns dados essenciais pelo formulário, WhatsApp ou telefone. Nós analisamos o risco, consultamos as seguradoras e voltamos com um comparativo das opções disponíveis, explicando coberturas, franquias e diferenças entre as propostas.',
  },
  {
    q: 'Quanto tempo demora para receber uma cotação?',
    a: 'Varia conforme o produto. Seguros mais padronizados, como auto e residencial, costumam ser rápidos. Riscos empresariais, transportes, frotas e seguro garantia exigem análise das seguradoras e podem levar mais tempo. Sempre informamos o prazo estimado assim que recebemos os dados.',
  },
  {
    q: 'Posso comparar diferentes seguradoras?',
    a: 'Sim — é justamente o papel da corretora. Apresentamos as propostas lado a lado e apontamos onde elas diferem de fato: limites, franquias, exclusões, assistências e forma de regulação de sinistro. A decisão final é sempre sua.',
  },
  {
    q: 'Posso contratar o seguro online?',
    a: 'Boa parte do processo é digital: cotação, envio de documentos e assinatura eletrônica quando a seguradora permite. Ainda assim, mantemos a etapa de conversa com um especialista antes da contratação, porque é ali que se evita comprar uma cobertura que não atende à necessidade.',
  },
  {
    q: 'A corretora auxilia em caso de sinistro?',
    a: 'Sim. Orientamos sobre a abertura do aviso, os documentos exigidos, os prazos e o acompanhamento junto à seguradora até a conclusão. É o momento em que a corretora mais importa, e é nele que fazemos questão de estar presentes.',
  },
  {
    q: 'Quais documentos são necessários?',
    a: 'Para pessoa física, geralmente documento de identidade, CPF, comprovante de endereço e os dados do bem a segurar (como CRLV, no caso de veículos). Para pessoa jurídica, cartão CNPJ, contrato social e informações da operação. A lista definitiva depende do produto e da seguradora, e nós indicamos exatamente o que pedir.',
  },
  {
    q: 'Posso falar com um especialista antes de contratar?',
    a: 'Sim, e recomendamos. Nenhuma contratação precisa ser feita às cegas: você pode tirar todas as dúvidas por WhatsApp, telefone ou reunião antes de decidir.',
  },
];

/* -------------------------------------------------------------------------- */
/* BLOG                                                                       */
/* -------------------------------------------------------------------------- */

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date. null = ainda não publicado */
  date: string | null;
  /** Imagem de capa em /public/blog/… — opcional */
  cover?: string;
  /** Tempo de leitura estimado */
  readingTime?: string;
  /** URL externa, caso o conteúdo more fora do site */
  url?: string;
}

/**
 * Estrutura pronta para receber conteúdo de um CMS ou do Supabase
 * (ver src/services/content.ts).
 *
 * Enquanto esta lista estiver vazia, a seção de artigos NÃO é renderizada —
 * nada de "em breve" nem de cartão fictício. Quem ocupa o lugar dela na home é
 * a seção de curiosidades (`src/config/curiosities.ts`), que é conteúdo próprio
 * e não depende de publicação nova. Ao publicar o primeiro artigo aqui, a seção
 * aparece automaticamente, acima do rodapé.
 */
export const posts: Post[] = [];

/**
 * Categorias previstas para o blog — usadas no SEO e como rótulo do cartão
 * (`Post.category`) quando o artigo não tem imagem de capa.
 */
export const postCategories = [
  'Seguros',
  'Seguro Auto',
  'Seguro Empresarial',
  'Seguro Residencial',
  'Seguro de Vida',
  'Proteção patrimonial',
  'Prevenção',
  'Finanças',
];
