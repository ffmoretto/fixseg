import type { IconName } from '@/components/icons';

/** Tipos de campo suportados pelo formulário inteligente de cotação. */
export type FieldType = 'text' | 'number' | 'select' | 'date' | 'cep' | 'cnpj' | 'textarea';

export interface QuoteField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  /** Dica curta exibida sob o campo */
  hint?: string;
  /** Ocupa a largura inteira no grid de 2 colunas */
  full?: boolean;
}

export interface Insurance {
  slug: string;
  name: string;
  /** Frase curta usada nos cards */
  short: string;
  /** Texto de apoio no card */
  description: string;
  icon: IconName;
  /** Público principal — usado nos filtros e no SEO */
  audience: 'pessoa' | 'empresa' | 'ambos';
  /** Bullets da página do produto */
  coverage: string[];
  /** Perguntas específicas na etapa 2 da cotação */
  quoteFields: QuoteField[];
  /** Palavras-chave para SEO da página do produto */
  keywords: string[];
}

const UF = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

export const insurances: Insurance[] = [
  {
    slug: 'seguro-de-vida',
    name: 'Seguro de Vida',
    short: 'Amparo financeiro para quem depende de você.',
    description:
      'Garante renda e liquidez imediata à família em caso de morte ou invalidez, e pode adiantar capital em caso de doenças graves.',
    icon: 'life',
    audience: 'ambos',
    coverage: [
      'Morte natural e acidental',
      'Invalidez permanente total ou parcial por acidente',
      'Diagnóstico de doenças graves',
      'Assistência funeral familiar',
      'Diárias por incapacidade temporária',
      'Modalidades individual, familiar e em grupo (empresarial)',
    ],
    quoteFields: [
      { name: 'idade', label: 'Idade', type: 'number', placeholder: '38', required: true },
      { name: 'profissao', label: 'Profissão', type: 'text', placeholder: 'Ex.: engenheiro civil', required: true },
      {
        name: 'modalidade',
        label: 'Modalidade',
        type: 'select',
        options: ['Individual', 'Familiar', 'Em grupo (empresa)'],
        required: true,
      },
      {
        name: 'capital',
        label: 'Capital desejado (aproximado)',
        type: 'select',
        options: ['Até R$ 100 mil', 'R$ 100 mil a R$ 300 mil', 'R$ 300 mil a R$ 500 mil', 'Acima de R$ 500 mil', 'Preciso de orientação'],
      },
      {
        name: 'coberturas',
        label: 'Coberturas de interesse',
        type: 'textarea',
        placeholder: 'Ex.: doenças graves, invalidez por acidente, assistência funeral…',
        full: true,
      },
    ],
    keywords: ['seguro de vida', 'seguro de vida em grupo', 'seguro de vida empresarial', 'cotação seguro de vida'],
  },
  {
    slug: 'seguro-auto',
    name: 'Seguro Auto',
    short: 'Seu carro protegido, sua rotina intacta.',
    description:
      'Cobertura contra colisão, roubo, furto e incêndio, com assistência 24h, carro reserva e reparo em rede referenciada.',
    icon: 'car',
    audience: 'ambos',
    coverage: [
      'Colisão, incêndio, roubo e furto',
      'Danos materiais e corporais a terceiros',
      'Assistência 24h com reboque e chaveiro',
      'Carro reserva e vidros',
      'Cobertura para acessórios e blindagem',
      'Perda total e parcial',
    ],
    quoteFields: [
      { name: 'veiculo', label: 'Marca e modelo', type: 'text', placeholder: 'Ex.: Toyota Corolla XEi', required: true },
      { name: 'ano', label: 'Ano/modelo', type: 'text', placeholder: '2022/2023', required: true },
      { name: 'placa', label: 'Placa (se já possui)', type: 'text', placeholder: 'ABC1D23' },
      { name: 'cep', label: 'CEP de pernoite', type: 'cep', placeholder: '00000-000', required: true },
      {
        name: 'uso',
        label: 'Uso do veículo',
        type: 'select',
        options: ['Particular', 'Trabalho / deslocamento', 'Aplicativo de transporte', 'Comercial'],
        required: true,
      },
      { name: 'garagem', label: 'Possui garagem?', type: 'select', options: ['Sim, em casa e no trabalho', 'Somente em casa', 'Não'] },
    ],
    keywords: ['seguro auto', 'seguro de carro', 'cotação de seguro auto', 'seguro automotivo'],
  },
  {
    slug: 'seguro-de-transportes',
    name: 'Seguro de Transportes',
    short: 'A carga chega. E o prejuízo não.',
    description:
      'As três coberturas obrigatórias do transporte rodoviário de carga — RCTR-C, RC-DC e RC-V —, exigidas por lei e pelos embarcadores para a operação rodar.',
    icon: 'cargo',
    audience: 'empresa',
    coverage: [
      /* As TRÊS obrigatórias do transporte rodoviário de carga. A sigla do
         meio costuma aparecer errada como "RCF-DC": o seguro de roubo e
         desaparecimento é o RC-DC. */
      'RCTR-C — avarias e acidentes com a carga (obrigatório)',
      'RC-DC — roubo e desaparecimento da carga (obrigatório)',
      'RC-V — danos a terceiros durante o transporte (obrigatório)',
      'Averbação automática de embarques',
      'Cobertura para carga própria e de terceiros',
      'Gerenciamento de risco e adequação ao plano de gerenciamento',
    ],
    quoteFields: [
      { name: 'cnpj', label: 'CNPJ da transportadora', type: 'cnpj', placeholder: '00.000.000/0000-00' },
      { name: 'mercadoria', label: 'Tipo de mercadoria transportada', type: 'text', placeholder: 'Ex.: alimentos, eletrônicos, insumos industriais', required: true },
      { name: 'faturamento', label: 'Valor médio embarcado por mês', type: 'text', placeholder: 'Ex.: R$ 2.000.000', required: true },
      { name: 'valorMaximo', label: 'Valor máximo por embarque', type: 'text', placeholder: 'Ex.: R$ 350.000' },
      {
        name: 'abrangencia',
        label: 'Abrangência das viagens',
        type: 'select',
        options: ['Municipal', 'Estadual', 'Interestadual', 'Nacional', 'Internacional / Mercosul'],
        required: true,
      },
      { name: 'rotas', label: 'Principais rotas e observações', type: 'textarea', placeholder: 'Ex.: PR–SP–MG, coleta em porto, gerenciamento de risco ativo…', full: true },
    ],
    keywords: ['seguro de transportes', 'seguro de carga', 'RCTR-C', 'RC-DC', 'RC-V', 'seguro obrigatório de carga', 'seguro para transportadora'],
  },
  {
    slug: 'seguro-de-frota',
    name: 'Seguro de Frota',
    short: 'Uma apólice para toda a operação.',
    description:
      'Gestão centralizada de veículos com condições diferenciadas por volume, inclusão e exclusão de itens ao longo da vigência.',
    icon: 'fleet',
    audience: 'empresa',
    coverage: [
      'Apólice única para múltiplos veículos',
      'Inclusão e exclusão de veículos durante a vigência',
      'Cobertura de casco, RCF-V e APP',
      'Assistência 24h dimensionada para operação',
      'Franquias e coberturas ajustáveis por grupo de veículos',
      'Relatórios de sinistralidade para gestão',
    ],
    quoteFields: [
      { name: 'cnpj', label: 'CNPJ da empresa', type: 'cnpj', placeholder: '00.000.000/0000-00' },
      { name: 'quantidade', label: 'Quantidade de veículos', type: 'number', placeholder: '18', required: true },
      { name: 'composicao', label: 'Composição da frota', type: 'text', placeholder: 'Ex.: 8 utilitários, 6 cavalos, 4 carretas', required: true },
      {
        name: 'atividade',
        label: 'Atividade principal',
        type: 'text',
        placeholder: 'Ex.: distribuição, transporte de cargas, prestação de serviços',
        required: true,
      },
      { name: 'cep', label: 'CEP da base operacional', type: 'cep', placeholder: '00000-000' },
      { name: 'sinistralidade', label: 'Histórico de sinistros (últimos 24 meses)', type: 'textarea', full: true },
    ],
    keywords: ['seguro de frota', 'seguro frotista', 'apólice de frota', 'seguro para empresas com veículos'],
  },
  {
    slug: 'seguro-caminhao',
    name: 'Seguro Caminhão',
    short: 'O ativo que gera sua renda, protegido.',
    description:
      'Casco para cavalo mecânico, implementos e carretas, com coberturas para tombamento, colisão, incêndio e roubo.',
    icon: 'truck',
    audience: 'ambos',
    coverage: [
      'Casco do cavalo mecânico e dos implementos',
      'Colisão, tombamento, incêndio, roubo e furto',
      'RCF-V — danos a terceiros',
      'APP — acidentes pessoais de passageiros',
      'Assistência 24h com reboque pesado',
      'Cobertura para equipamentos agregados',
    ],
    quoteFields: [
      { name: 'veiculo', label: 'Marca e modelo do caminhão', type: 'text', placeholder: 'Ex.: Scania R450', required: true },
      { name: 'ano', label: 'Ano/modelo', type: 'text', placeholder: '2021/2022', required: true },
      { name: 'implementos', label: 'Implementos / carretas', type: 'text', placeholder: 'Ex.: 1 semirreboque graneleiro 2019' },
      { name: 'cep', label: 'CEP de pernoite', type: 'cep', placeholder: '00000-000', required: true },
      {
        name: 'operacao',
        label: 'Tipo de operação',
        type: 'select',
        options: ['Autônomo (TAC)', 'Frota própria', 'Agregado a transportadora', 'Uso agrícola / interno'],
        required: true,
      },
      { name: 'rastreador', label: 'Possui rastreador?', type: 'select', options: ['Sim', 'Não', 'Em instalação'] },
    ],
    keywords: ['seguro caminhão', 'seguro de carreta', 'seguro cavalo mecânico', 'seguro para caminhoneiro'],
  },
  {
    slug: 'seguro-residencial',
    name: 'Seguro Residencial',
    short: 'Sua casa é o seu porto seguro.',
    description:
      'Cobre incêndio, danos elétricos, vendaval, roubo de bens e responsabilidade civil familiar, com serviços de assistência.',
    icon: 'home',
    audience: 'pessoa',
    coverage: [
      'Incêndio, explosão, queda de raio',
      'Danos elétricos em aparelhos e instalações',
      'Vendaval, granizo e impacto de veículos',
      'Roubo e furto qualificado de bens',
      'Responsabilidade civil familiar',
      'Assistência 24h: encanador, eletricista, chaveiro e vidraceiro',
    ],
    quoteFields: [
      { name: 'cep', label: 'CEP do imóvel', type: 'cep', placeholder: '00000-000', required: true },
      {
        name: 'tipoImovel',
        label: 'Tipo de imóvel',
        type: 'select',
        options: ['Casa', 'Apartamento', 'Casa de condomínio', 'Casa de veraneio', 'Imóvel alugado'],
        required: true,
      },
      {
        name: 'ocupacao',
        label: 'Ocupação',
        type: 'select',
        options: ['Habitual (moradia)', 'Veraneio / uso eventual', 'Desocupado'],
        required: true,
      },
      { name: 'valorImovel', label: 'Valor estimado do imóvel', type: 'text', placeholder: 'Ex.: R$ 600.000' },
      { name: 'valorConteudo', label: 'Valor estimado dos bens (conteúdo)', type: 'text', placeholder: 'Ex.: R$ 80.000' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', placeholder: 'Ex.: possui alarme, piscina, energia solar…', full: true },
    ],
    keywords: ['seguro residencial', 'seguro de casa', 'seguro de apartamento', 'cotação seguro residencial'],
  },
  {
    slug: 'seguro-empresarial',
    name: 'Seguro Empresarial',
    short: 'Continuidade para o seu negócio.',
    description:
      'Protege prédio, estoque, máquinas e faturamento da sua empresa, com coberturas ajustadas ao ramo de atividade.',
    icon: 'business',
    audience: 'empresa',
    coverage: [
      'Incêndio, explosão e queda de raio',
      'Danos elétricos em máquinas e equipamentos',
      'Roubo e furto qualificado de bens e mercadorias',
      'Vendaval, granizo, alagamento e desmoronamento',
      'Lucros cessantes / despesas fixas',
      'Vidros, letreiros e responsabilidade civil de operações',
    ],
    quoteFields: [
      { name: 'cnpj', label: 'CNPJ', type: 'cnpj', placeholder: '00.000.000/0000-00' },
      { name: 'atividade', label: 'Atividade da empresa', type: 'text', placeholder: 'Ex.: indústria de embalagens', required: true },
      { name: 'cep', label: 'CEP do local a segurar', type: 'cep', placeholder: '00000-000', required: true },
      {
        name: 'imovel',
        label: 'O imóvel é',
        type: 'select',
        options: ['Próprio', 'Alugado', 'Cedido'],
        required: true,
      },
      { name: 'area', label: 'Área construída (m²)', type: 'number', placeholder: '850' },
      { name: 'valores', label: 'Valores a segurar (prédio, conteúdo, estoque, máquinas)', type: 'textarea', full: true },
    ],
    keywords: ['seguro empresarial', 'seguro para empresas', 'seguro patrimonial empresarial', 'seguro de estoque'],
  },
  {
    slug: 'seguro-de-responsabilidade-civil',
    name: 'Responsabilidade Civil',
    short: 'Quando o dano é a terceiros.',
    description:
      'Cobre indenizações por danos causados a clientes, vizinhos e terceiros na operação, na obra ou no exercício profissional.',
    icon: 'shield-law',
    audience: 'empresa',
    coverage: [
      'RC Operações — danos decorrentes da atividade',
      'RC Obras — construção, reforma e instalação',
      'RC Profissional (E&O) para atividades regulamentadas',
      'RC Empregador',
      'RC Produtos',
      'Custas de defesa e honorários',
    ],
    quoteFields: [
      { name: 'cnpj', label: 'CNPJ', type: 'cnpj', placeholder: '00.000.000/0000-00' },
      { name: 'atividade', label: 'Atividade / serviço prestado', type: 'text', placeholder: 'Ex.: instalação de estruturas metálicas', required: true },
      {
        name: 'modalidade',
        label: 'Modalidade de RC',
        type: 'select',
        options: ['RC Operações', 'RC Obras', 'RC Profissional', 'RC Empregador', 'RC Produtos', 'Preciso de orientação'],
        required: true,
      },
      { name: 'limite', label: 'Limite de indenização exigido', type: 'text', placeholder: 'Ex.: R$ 1.000.000' },
      { name: 'faturamento', label: 'Faturamento anual aproximado', type: 'text', placeholder: 'Ex.: R$ 8.000.000' },
      { name: 'exigencia', label: 'Existe exigência contratual? Qual?', type: 'textarea', full: true },
    ],
    keywords: ['seguro de responsabilidade civil', 'RC operações', 'RC obras', 'RC profissional', 'seguro RC empresarial'],
  },
  {
    slug: 'seguro-garantia',
    name: 'Seguro Garantia',
    short: 'Credibilidade para assumir contratos maiores.',
    description:
      'Substitui caução e fiança bancária em licitações e contratos privados, preservando o capital de giro da empresa.',
    icon: 'guarantee',
    audience: 'empresa',
    coverage: [
      'Garantia de proposta (bid bond)',
      'Garantia de execução do contrato (performance bond)',
      'Garantia de adiantamento de pagamento',
      'Garantia de retenção de pagamentos',
      'Garantia judicial e administrativa',
      'Substituição de depósito recursal e de caução locatícia',
    ],
    quoteFields: [
      { name: 'cnpj', label: 'CNPJ do tomador', type: 'cnpj', placeholder: '00.000.000/0000-00', required: true },
      {
        name: 'modalidade',
        label: 'Modalidade',
        type: 'select',
        options: [
          'Garantia de proposta (licitação)',
          'Garantia de execução de contrato',
          'Garantia judicial',
          'Garantia de adiantamento',
          'Garantia locatícia',
          'Preciso de orientação',
        ],
        required: true,
      },
      { name: 'valorGarantia', label: 'Valor da garantia', type: 'text', placeholder: 'Ex.: R$ 1.500.000', required: true },
      { name: 'prazo', label: 'Prazo de vigência necessário', type: 'text', placeholder: 'Ex.: 24 meses' },
      { name: 'beneficiario', label: 'Beneficiário / órgão contratante', type: 'text', placeholder: 'Ex.: Prefeitura Municipal de…' },
      { name: 'observacoes', label: 'Observações do edital ou contrato', type: 'textarea', full: true },
    ],
    keywords: ['seguro garantia', 'seguro garantia licitação', 'performance bond', 'seguro garantia judicial'],
  },
  {
    slug: 'seguro-de-riscos-diversos',
    name: 'Riscos Diversos',
    short: 'Para o que não cabe em uma apólice comum.',
    description:
      'Cobertura sob medida para equipamentos, máquinas móveis, obras, eventos e bens específicos, dentro e fora do estabelecimento.',
    icon: 'diverse',
    audience: 'ambos',
    coverage: [
      'Equipamentos estacionários e móveis',
      'Máquinas e implementos agrícolas',
      'Equipamentos eletrônicos e de informática',
      'Obras civis em construção e instalação e montagem',
      'Bens em poder de terceiros',
      'Eventos, exposições e bens de valor específico',
    ],
    quoteFields: [
      { name: 'bem', label: 'O que precisa ser segurado', type: 'text', placeholder: 'Ex.: escavadeira hidráulica, drone, equipamento médico', required: true },
      { name: 'valorBem', label: 'Valor do bem', type: 'text', placeholder: 'Ex.: R$ 420.000', required: true },
      {
        name: 'localRisco',
        label: 'Onde o bem é utilizado',
        type: 'select',
        options: ['Dentro do estabelecimento', 'Em campo / obras', 'Em trânsito', 'Em poder de terceiros'],
        required: true,
      },
      { name: 'cep', label: 'CEP principal de risco', type: 'cep', placeholder: '00000-000' },
      { name: 'observacoes', label: 'Detalhes que ajudam na cotação', type: 'textarea', full: true },
    ],
    keywords: ['seguro de riscos diversos', 'seguro de equipamentos', 'seguro de máquinas', 'seguro de obras'],
  },
  {
    slug: 'outros-seguros',
    name: 'Outros seguros',
    short: 'Não encontrou o que procura?',
    description:
      'Trabalhamos com um portfólio amplo e buscamos a solução adequada mesmo para demandas fora do padrão. Fale com um especialista.',
    icon: 'plus-circle',
    audience: 'ambos',
    coverage: [
      'Análise da necessidade junto a você',
      'Consulta às seguradoras com apetite para o risco',
      'Estruturação de cobertura sob medida',
      'Comparativo técnico antes da contratação',
    ],
    quoteFields: [
      { name: 'necessidade', label: 'Descreva o que precisa proteger', type: 'textarea', placeholder: 'Conte a situação com o máximo de detalhes possível.', required: true, full: true },
      { name: 'uf', label: 'Estado', type: 'select', options: UF },
    ],
    keywords: ['corretora de seguros', 'cotação de seguros', 'seguros sob medida'],
  },
];

export const insuranceBySlug = (slug: string) => insurances.find((i) => i.slug === slug);

/** Produtos exibidos em destaque nos seletores rápidos (hero e cotação). */
export const featuredSlugs = [
  'seguro-auto',
  'seguro-de-vida',
  'seguro-residencial',
  'seguro-empresarial',
  'seguro-caminhao',
  'seguro-de-transportes',
] as const;
