import type { Metadata } from 'next';
import { site } from '@/config/site';
import { faq } from '@/config/content';

const baseKeywords = [
  'corretora de seguros',
  'cotação de seguros',
  'seguro auto',
  'seguro residencial',
  'seguro empresarial',
  'seguro de vida',
  'seguro para empresas',
  'seguro de frota',
  'seguro de transportes',
  'seguro caminhão',
  'seguro garantia',
  'seguro de responsabilidade civil',
  'corretor de seguros',
];

/** Metadata base, herdada por todas as páginas. */
export function baseMetadata(): Metadata {
  const localSuffix = site.address.city ? ` em ${site.address.city}` : '';

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.legalName} — Proteção para o que realmente importa`,
      template: `%s · ${site.shortName}`,
    },
    description: site.description,
    keywords: [
      ...baseKeywords,
      ...(site.address.city ? [`corretora de seguros ${site.address.city}`] : []),
    ],
    applicationName: site.shortName,
    authors: [{ name: site.legalName }],
    creator: site.legalName,
    publisher: site.legalName,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: site.url,
      siteName: site.legalName,
      title: `${site.legalName}${localSuffix}`,
      description: site.description,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${site.legalName} — ${site.positioning}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${site.legalName}`,
      description: site.description,
      images: ['/opengraph-image'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    category: 'insurance',
    formatDetection: { telephone: true, address: true, email: true },
  };
}

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Schema.org InsuranceAgency + LocalBusiness.
 * Campos ainda não configurados são omitidos — dados falsos em structured data
 * prejudicam o SEO em vez de ajudar.
 */
export function organizationSchema() {
  const a = site.address;
  const hasAddress = !!(a.street || a.city);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'InsuranceAgency',
    '@id': `${site.url}/#organizacao`,
    name: site.legalName,
    legalName: site.corporateName,
    alternateName: site.shortName,
    description: site.description,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    logo: `${site.url}/brand/fixseg-icon.svg`,
    slogan: site.positioning,
    areaServed: { '@type': 'Country', name: 'Brasil' },
    knowsLanguage: 'pt-BR',
  };

  /* Telefone em formato internacional: é o que o Google espera em `telephone`.
     O número exibido na página continua no formato brasileiro. */
  if (site.contact.phoneRaw) {
    schema.telephone = `+55${site.contact.phoneRaw.replace(/\D/g, '').replace(/^55/, '')}`;
  } else if (site.contact.phone) {
    schema.telephone = site.contact.phone;
  }
  if (site.contact.email) schema.email = site.contact.email;
  if (site.cnpj) schema.taxID = site.cnpj;
  /* Registro na SUSEP: é a credencial que identifica a corretora. */
  if (site.susep) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: 'Registro SUSEP',
      value: site.susep,
    };
  }

  if (hasAddress) {
    /* O bairro NÃO tem campo próprio no Schema.org — vai junto do logradouro.
       Antes ele ia em `addressRegion`, que é o campo do ESTADO: as duas chaves
       colidiam e o bairro sobrescrevia a sigla do estado. */
    const street = [a.street, a.district].filter(Boolean).join(' - ');
    schema.address = {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      ...(street ? { streetAddress: street } : {}),
      ...(a.city ? { addressLocality: a.city } : {}),
      ...(a.state ? { addressRegion: a.state } : {}),
      ...(a.zip ? { postalCode: a.zip } : {}),
    };
  }

  const socials = Object.values(site.social).filter(Boolean);
  if (socials.length) schema.sameAs = socials;

  return schema;
}

/**
 * `aggregateRating` + `Review` da organização — SOMENTE com avaliações reais.
 *
 * Não editamos `organizationSchema()`: este bloco é um nó separado com o MESMO
 * `@id`, e o Google funde nós que compartilham identificador. Assim a nota só
 * existe no structured data quando as avaliações do Google estão realmente
 * configuradas e retornaram conteúdo — e a organização continua sendo emitida
 * do jeito de sempre no layout, com ou sem avaliação.
 *
 * Devolve `null` quando não há dado real. Nota inventada em structured data é
 * violação das diretrizes do Google, não um detalhe de SEO.
 */
export function reviewsSchema(dados: {
  notaMedia: number | null;
  totalAvaliacoes: number;
  avaliacoes: { autor: string; nota: number; texto: string }[];
}): Record<string, unknown> | null {
  if (dados.notaMedia === null || dados.totalAvaliacoes < 1) return null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'InsuranceAgency',
    '@id': `${site.url}/#organizacao`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(dados.notaMedia.toFixed(1)),
      reviewCount: dados.totalAvaliacoes,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const comTexto = dados.avaliacoes.filter((a) => a.texto.trim().length > 0);
  if (comTexto.length) {
    schema.review = comTexto.map((a) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: a.autor },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: a.nota,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: a.texto,
    }));
  }

  return schema;
}

/** Lista de serviços oferecidos — ajuda o Google a entender o portfólio. */
export function servicesSchema(items: { name: string; description: string; slug: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Seguros oferecidos',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: item.name,
        description: item.description,
        url: `${site.url}/seguros/${item.slug}`,
        provider: { '@id': `${site.url}/#organizacao` },
        areaServed: { '@type': 'Country', name: 'Brasil' },
      },
    })),
  };
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  };
}

/** Injeta um bloco JSON-LD. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
