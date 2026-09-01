/**
 * =============================================================================
 * CONFIGURAÇÃO CENTRAL DA CORRETORA
 * =============================================================================
 * Este é o único arquivo que precisa ser editado para trocar dados de contato,
 * endereço, redes sociais, CNPJ e textos institucionais. Nada disso está
 * espalhado pelo código: todos os componentes leem daqui.
 *
 * Campos marcados com `null` ou string vazia são PLACEHOLDERS: o site esconde
 * automaticamente o elemento correspondente até que o dado real seja informado.
 * Nenhum número, cliente, seguradora ou depoimento foi inventado.
 * =============================================================================
 */

export type SocialKey = 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok';

export interface SiteConfig {
  /** Nome comercial curto (usado em títulos e no header) */
  shortName: string;
  /**
   * Nome comercial completo — é o que aparece em títulos de página, Open Graph
   * e no `name` do Schema.org. Legível, sem "LTDA".
   */
  legalName: string;
  /**
   * RAZÃO SOCIAL, como consta no CNPJ. Usada onde a identificação jurídica é o
   * que importa: linha de copyright do rodapé, Política de Privacidade, Termos
   * de Uso e o campo `legalName` do Schema.org. Não entra em título de página —
   * "LTDA" em caixa alta na aba do navegador não ajuda ninguém.
   */
  corporateName: string;
  /** Tagline da logo */
  tagline: string;
  /** Frase de posicionamento (1 linha) */
  positioning: string;
  /** Descrição institucional curta — usada no footer e em meta description */
  description: string;
  /** URL canônica do site */
  url: string;
  /** Locale */
  locale: string;

  contact: {
    /** Somente dígitos, com código do país. Ex.: '5545999999999'. null = esconder */
    whatsapp: string | null;
    /** Telefone formatado para exibição. null = esconder */
    phone: string | null;
    /** Telefone apenas dígitos (com DDD, sem o 55), para o link tel: */
    phoneRaw: string | null;
    email: string | null;
    /** Mensagem pré-preenchida do WhatsApp */
    whatsappMessage: string;
  };

  address: {
    /** Logradouro, número e complemento. */
    street: string | null;
    district: string | null;
    city: string | null;
    /** Sigla do estado (2 letras). */
    state: string | null;
    zip: string | null;
    /**
     * Link do Google Maps. Deixe `null` para que o site gere sozinho um link de
     * BUSCA a partir do endereço acima (ver `mapsUrl()`). Preencha aqui apenas
     * se a corretora tiver um perfil no Google Business — aí o link do perfil é
     * melhor do que a busca.
     */
    mapsUrl: string | null;
  };

  /** Horário de atendimento. Deixe a lista vazia para esconder o bloco. */
  hours: { label: string; value: string }[];

  /** CNPJ formatado. null = esconder. */
  cnpj: string | null;
  /** Registro SUSEP da corretora. null = esconder. */
  susep: string | null;

  /** Redes sociais. Deixe null para esconder o ícone. */
  social: Record<SocialKey, string | null>;

  /** Responsável pelo tratamento de dados (LGPD). */
  lgpd: {
    /** E-mail do encarregado (DPO). Usa o e-mail principal se null. */
    dpoEmail: string | null;
    dpoName: string | null;
  };
}

export const site: SiteConfig = {
  shortName: 'FIXSEG',
  legalName: 'FIXSEG Corretora de Seguros',
  corporateName: 'FIXSEG CORRETORA DE SEGUROS LTDA',
  tagline: 'Corretora de Seguros',
  positioning: 'Proteção para o que realmente importa.',
  description:
    'Corretora de seguros com atendimento personalizado e comparação entre as principais seguradoras do mercado. Seguro de vida, auto, frota, caminhão, transportes de carga, residencial, empresarial, responsabilidade civil, garantia e riscos diversos.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fixseg.com.br',
  locale: 'pt-BR',

  contact: {
    /* O mesmo número atende WhatsApp e telefone. As variáveis de ambiente
       continuam tendo prioridade — é o caminho para trocar o contato em uma
       publicação de teste sem alterar o código. */
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5545999550676',
    phone: process.env.NEXT_PUBLIC_PHONE || '(45) 99955-0676',
    phoneRaw: '45999550676',
    email: process.env.NEXT_PUBLIC_EMAIL || 'contato@fixsegcorretora.com.br',
    whatsappMessage:
      'Olá! Vim pelo site e gostaria de falar com um especialista sobre seguros.',
  },

  address: {
    street: 'Rua Rui Barbosa, 741 — Sala 02',
    district: 'Centro',
    city: 'Cascavel',
    state: 'PR',
    zip: '85810-240',
    /* null = o site monta um link de busca no Google Maps a partir do endereço.
       Troque pelo link do perfil no Google Business quando ele existir. */
    mapsUrl: null,
  },

  hours: [
    { label: 'Segunda a sexta', value: '08h00 às 18h00' },
    { label: 'Sábado', value: 'Sob agendamento' },
    { label: 'Emergências e sinistros', value: 'Atendimento via WhatsApp' },
  ],

  cnpj: '62.792.741/0001-00',
  susep: '252173442',

  social: {
    instagram: null, // TODO ex.: 'https://instagram.com/fixseg'
    facebook: null,
    linkedin: null,
    youtube: null,
    tiktok: null,
  },

  lgpd: {
    /* Sem encarregado nomeado, os pedidos de titular vão para o e-mail
       principal — que é o que a Política de Privacidade informa. */
    dpoEmail: null,
    dpoName: null,
  },
};

/** Endereço em uma linha, ou null se ainda não configurado. */
export function formattedAddress(): string | null {
  const a = site.address;
  const parts = [
    a.street,
    a.district,
    a.city && a.state ? `${a.city}/${a.state}` : a.city || a.state,
    a.zip ? `CEP ${a.zip}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Endereço em LINHAS, para blocos estreitos.
 *
 * `formattedAddress()` devolve tudo numa string separada por "·", o que serve
 * para uma linha larga. Numa coluna estreita — a de contato do rodapé — aquela
 * string quebra em lugares ruins: "741 —" numa linha e "Sala 02" na outra.
 * Aqui cada parte vira uma linha própria, curta o bastante para não quebrar.
 */
export function addressLines(): string[] {
  const a = site.address;
  const linhas = [
    a.street,
    [a.district, a.city && a.state ? `${a.city}/${a.state}` : a.city || a.state]
      .filter(Boolean)
      .join(' · '),
    a.zip ? `CEP ${a.zip}` : null,
  ].filter((l): l is string => !!l && l.length > 0);
  return linhas;
}

/**
 * Link do mapa.
 *
 * Se `address.mapsUrl` estiver preenchido, usa ele. Caso contrário monta uma
 * BUSCA no Google Maps com o endereço configurado: um link de busca não pode
 * apontar para o lugar errado, e é melhor do que esconder o botão "ver no
 * mapa". Devolve null só quando não há endereço nenhum.
 */
export function mapsUrl(): string | null {
  if (site.address.mapsUrl) return site.address.mapsUrl;
  const a = site.address;
  const query = [a.street, a.district, a.city, a.state, a.zip].filter(Boolean).join(', ');
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const CTA = {
  primary: 'Calcule seu seguro',
  secondary: 'Fale com um especialista',
  quote: 'Solicite uma cotação',
  patrimony: 'Quero proteger meu patrimônio',
} as const;
