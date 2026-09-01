/**
 * =============================================================================
 * NOTÍCIAS DE SEGUROS — configuração da seção "Informação também é proteção"
 * =============================================================================
 * Este é o ÚNICO arquivo que precisa ser editado para mudar o comportamento da
 * seção de notícias: a fonte, quantas notícias aparecem, de quanto em quanto
 * tempo o site vai buscar novidades e — o mais importante — QUAIS assuntos
 * entram e quais ficam de fora.
 *
 * A busca em si e o filtro estão em `src/services/news.ts`. Nada aqui depende
 * do resto do projeto, de propósito: é um arquivo de dados, seguro de editar.
 *
 * COMO O FILTRO FUNCIONA, em uma frase: a notícia entra apenas se falar de
 * algum assunto da lista `termosIncluidos` E não falar de nenhum assunto da
 * lista `termosExcluidos`. Exclusão sempre vence inclusão.
 *
 * Os termos são comparados SEM ACENTO, SEM DIFERENÇA DE MAIÚSCULAS e por
 * PALAVRA INTEIRA. Então "saude" barra "saúde" e "Saúde", mas não barra
 * "saudável"; e "auto" casa com "Seguro Auto", mas não com "automaticamente".
 * Termos com mais de uma palavra ("plano de saude") também funcionam.
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/* A FONTE                                                                    */
/* -------------------------------------------------------------------------- */

export interface FonteDeNoticias {
  /** Nome exibido na atribuição de cada cartão ("via CQCS"). */
  nome: string;
  /** Página da fonte, usada no link de atribuição no rodapé da seção. */
  site: string;
  /** Endereço do feed RSS da categoria de notícias. */
  feed: string;
}

/**
 * Endereços padrão do CQCS (Centro de Qualificação do Corretor de Seguros),
 * que publica em WordPress — daí o `/feed/` na categoria.
 *
 * As duas variáveis de ambiente existem para trocar a fonte SEM MEXER NO
 * CÓDIGO (outro portal, um espelho, ou um servidor local durante testes):
 *
 *   NEWS_FEED_URL=https://exemplo.com.br/categoria/noticia/feed/
 *   NEWS_SITE_URL=https://exemplo.com.br
 */
const FEED_PADRAO = 'https://cqcs.com.br/categoria/noticia/feed/';
const SITE_PADRAO = 'https://cqcs.com.br/categoria/noticia/';

export const fonte: FonteDeNoticias = {
  nome: process.env.NEWS_SOURCE_NAME?.trim() || 'CQCS',
  site: process.env.NEWS_SITE_URL?.trim() || SITE_PADRAO,
  feed: process.env.NEWS_FEED_URL?.trim() || FEED_PADRAO,
};

/* -------------------------------------------------------------------------- */
/* AJUSTES DA SEÇÃO                                                           */
/* -------------------------------------------------------------------------- */

export const news = {
  /**
   * Liga e desliga a seção inteira. Com `false`, nenhuma requisição é feita à
   * fonte e a seção não é renderizada.
   */
  ativo: true,

  /**
   * De quanto em quanto tempo o site vai buscar notícias novas, em horas.
   * É este número que vira o `revalidate` do `fetch` em `src/services/news.ts`
   * — o mecanismo de atualização automática pedido pela corretora.
   * 1 = uma consulta por hora, no máximo, independentemente de quantas
   * pessoas visitarem a página nesse intervalo.
   */
  intervaloHoras: 1,

  /** Quantas notícias aparecem na home (a grade é de 3 colunas no desktop). */
  maximo: 3,

  /** Tamanho do resumo, em caracteres. O corte respeita o fim da palavra. */
  tamanhoDoResumo: 180,

  /**
   * Quantos itens buscar na fonte antes de filtrar. Precisa ser bem maior que
   * `maximo`: o filtro é rigoroso e descarta a maior parte do feed.
   */
  buscarAteItens: 30,

  /**
   * O filtro lê o título e o resumo. Com `true`, lê também as CATEGORIAS que o
   * feed declara para a notícia — o que costuma ser o sinal mais confiável.
   *
   * Quando desligar: se o portal marcar TODAS as notícias com uma categoria da
   * lista de exclusão (um "Corretor" genérico em tudo, por exemplo), o filtro
   * derrubaria o feed inteiro. Nesse caso ponha `false` e o filtro passa a
   * olhar somente o texto da notícia.
   */
  usarCategoriasNoFiltro: true,
} as const;

/* -------------------------------------------------------------------------- */
/* O FILTRO — LISTA DE EXCLUSÃO                                               */
/* -------------------------------------------------------------------------- */

/**
 * Se a notícia mencionar QUALQUER termo desta lista, ela está fora — mesmo que
 * também fale de seguro. Foi assim que a corretora pediu: o cliente final não
 * quer notícia de mercado, quer notícia que afete o seguro dele.
 *
 * Para liberar um assunto, apague (ou comente) a linha correspondente.
 */
export const termosExcluidos: readonly string[] = [
  /* --- 1. Assuntos de corretagem (interessam ao corretor, não ao cliente) -- */
  'corretor',
  'corretores',
  'corretora',
  'corretoras',
  'corretagem',
  'comissao',
  'comissoes',
  'corretor de seguros',

  /* --- 2. Saúde e odontológico (a FIXSEG não trabalha esses ramos) --------- */
  'saude',
  'plano de saude',
  'planos de saude',
  'odontologico',
  'odontologica',
  'ans',
  'hospital',
  'hospitais',
  'hospitalar',
  'internacao',
  'medicina',
  'medico',
  'medicos',

  /* --- 3. Notícia corporativa de seguradora (mercado, não cliente) -------- */
  'seguradora',
  'seguradoras',
  'resultado',
  'resultados',
  'balanco',
  'lucro',
  'premio emitido',
  'premios emitidos',
  'ranking',
  'fusao',
  'aquisicao',
  'nomeia',
  'novo diretor',
  'nova diretora',
  'ceo',
  'presidente',
  'contrata executivo',
  'contrata executiva',
  'market share',
];

/* -------------------------------------------------------------------------- */
/* O FILTRO — LISTA DE INCLUSÃO                                               */
/* -------------------------------------------------------------------------- */

/**
 * A notícia só entra se mencionar ao menos UM termo desta lista. Sem nenhum
 * sinal de inclusão, ela fica fora — é o que impede que assunto genérico
 * ("economia", "juros", "trânsito") vaze para a seção.
 *
 * Para abrir a seção a um novo assunto, acrescente uma linha aqui.
 */
export const termosIncluidos: readonly string[] = [
  /* --- Os ramos que a corretora atende --------------------------------- */
  'seguro auto',
  'seguro de auto',
  'seguro automotivo',
  'seguro residencial',
  'seguro de vida',
  'seguro de transporte',
  'seguro de transportes',
  'seguro empresarial',
  'seguro de carga',
  'seguro de cargas',
  'seguro de frota',
  'seguro de caminhao',
  'seguro de responsabilidade civil',
  'seguro garantia',
  'seguro patrimonial',
  'seguro contra roubo',
  'rctr c',
  'rcf dc',
  'rc facultativa',
  'responsabilidade civil',
  'carga',
  'cargas',
  'frota',
  'frotas',
  'caminhao',
  'caminhoes',

  /* --- Vocabulário de apólice (o que o cliente vive na prática) --------- */
  'apolice',
  'apolices',
  'cobertura',
  'coberturas',
  'sinistro',
  'sinistros',
  'franquia',
  'indenizacao',
  'indenizacoes',
  'assistencia 24h',
  'assistencia 24 horas',
  'bonus',
  'renovacao',
  'vistoria',
  'rastreador',

  /* --- Eventos que geram acionamento de seguro -------------------------- */
  'roubo',
  'roubos',
  'furto',
  'furtos',
  'granizo',
  'enchente',
  'enchentes',
  'alagamento',
  'alagamentos',
  'vendaval',
  'incendio',
  'incendios',
  'colisao',
  'capotamento',
  'tombamento de carga',
];

/* -------------------------------------------------------------------------- */
/* HOSTS AUTORIZADOS PARA A MINIATURA                                         */
/* -------------------------------------------------------------------------- */

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * De onde a imagem de capa pode vir. O adaptador descarta qualquer URL fora
 * desta lista, e o `next.config.mjs` autoriza os mesmos hosts no otimizador de
 * imagens do Next — as duas pontas precisam combinar: aqui filtra, lá autoriza.
 *
 * Sai daqui: o host do feed, o host do site e o que estiver em
 * `NEWS_IMAGE_HOSTS` (lista separada por vírgula, para casos em que a imagem é
 * servida por um CDN diferente do site).
 */
export const hostsDeImagem: readonly string[] = Array.from(
  new Set(
    [
      hostname(fonte.feed),
      hostname(fonte.site),
      ...(process.env.NEWS_IMAGE_HOSTS || '')
        .split(',')
        .map((h) => h.trim().replace(/^https?:\/\//, ''))
        .filter(Boolean),
    ].filter((h): h is string => !!h),
  ),
);
