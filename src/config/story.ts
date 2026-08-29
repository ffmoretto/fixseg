/**
 * Roteiro da animação narrativa em scroll ("A história do imprevisto").
 * Cada capítulo é uma cena SVG animada em src/components/story/scenes.
 * O texto é totalmente configurável; a ordem aqui é a ordem da narrativa.
 */

export type SceneKey = 'life' | 'home' | 'road' | 'cargo' | 'business' | 'shield';

export interface StoryChapter {
  key: SceneKey;
  /** Rótulo curto do capítulo (aparece no marcador lateral) */
  marker: string;
  /** Etiqueta acima do título */
  kicker: string;
  /** Título do capítulo */
  title: string;
  /** Parágrafo de construção — o que existe de bom */
  build: string;
  /** O imprevisto */
  risk: string;
  /** A resposta da proteção */
  answer: string;
  /** Slugs de src/config/insurances.ts relacionados a este capítulo */
  related: string[];
}

export const storyIntro = {
  eyebrow: 'A história que ninguém quer viver',
  title: 'O imprevisto não avisa.',
  subtitle:
    'Role a página. Em cinco capítulos, o que uma vida e um negócio constroem — e o que basta para colocar tudo em risco.',
};

export const storyChapters: StoryChapter[] = [
  {
    key: 'life',
    marker: 'Vida',
    kicker: 'Capítulo 01',
    title: 'Tudo começa com quem depende de você.',
    build:
      'Uma casa cheia, contas em dia, planos para os próximos anos. A renda que sustenta tudo isso tem nome e sobrenome.',
    risk: 'Um diagnóstico inesperado. Um acidente no caminho de casa. E a única fonte de renda para de existir.',
    answer:
      'O seguro de vida não devolve a pessoa. Devolve tempo: liquidez imediata para a família decidir sem pressa e sem dívida.',
    related: ['seguro-de-vida'],
  },
  {
    key: 'home',
    marker: 'Casa',
    kicker: 'Capítulo 02',
    title: 'Um endereço que levou anos para virar casa.',
    build:
      'Cada móvel escolhido, cada reforma parcelada, cada memória guardada em um lugar que é só seu.',
    risk: 'Um curto-circuito às três da manhã. Um vendaval fora de época. Uma porta arrombada em uma tarde comum.',
    answer:
      'O seguro residencial reconstrói o que o imprevisto destruiu — e resolve o urgente no mesmo dia, com assistência 24 horas.',
    related: ['seguro-residencial'],
  },
  {
    key: 'road',
    marker: 'Estrada',
    kicker: 'Capítulo 03',
    title: 'A rotina inteira depende de rodar.',
    build:
      'O carro que leva ao trabalho. O caminhão que paga as contas do mês. A frota que mantém a operação de pé.',
    risk: 'Dois segundos de distração no cruzamento. Um tombamento na serra. Um veículo que não volta para o pátio.',
    answer:
      'Auto, caminhão e frota: o ativo é reposto, o terceiro é indenizado e a operação volta a rodar antes que o prejuízo vire dívida.',
    related: ['seguro-auto', 'seguro-caminhao', 'seguro-de-frota'],
  },
  {
    key: 'cargo',
    marker: 'Carga',
    kicker: 'Capítulo 04',
    title: 'A carga não é sua. A responsabilidade é.',
    build:
      'Cada embarque carrega o faturamento de outra empresa, um prazo assinado em contrato e a sua reputação como transportador.',
    risk: 'Um desvio de rota. Uma carga que desaparece entre o embarque e a entrega. Um sinistro de milhões em cima do seu CNPJ.',
    answer:
      'RCTR-C e RCF-DC transferem esse valor para a seguradora — e mantêm sua empresa habilitada a operar para os grandes embarcadores.',
    related: ['seguro-de-transportes'],
  },
  {
    key: 'business',
    marker: 'Empresa',
    kicker: 'Capítulo 05',
    title: 'Um negócio que sustenta muitas famílias.',
    build:
      'Galpão, estoque, máquinas, uma equipe inteira e contratos que exigem garantia para serem assinados.',
    risk:
      'Fogo no estoque. Uma ação por dano causado a terceiro. Um equipamento essencial parado. Uma garantia contratual que a empresa não consegue apresentar.',
    answer:
      'Empresarial, responsabilidade civil, riscos diversos e seguro garantia: a empresa continua operando — e continua competindo.',
    related: [
      'seguro-empresarial',
      'seguro-de-responsabilidade-civil',
      'seguro-de-riscos-diversos',
      'seguro-garantia',
    ],
  },
  {
    key: 'shield',
    marker: 'Proteção',
    kicker: 'Capítulo final',
    title: 'Nada disso deixa de acontecer. Deixa de te derrubar.',
    build: 'Seguro não impede o acidente, o incêndio, o roubo ou a perda.',
    risk: 'Ele impede que um único dia ruim apague anos de trabalho.',
    answer:
      'Essa é a diferença entre reconstruir do zero e simplesmente continuar. É por isso que a FIXSEG existe.',
    related: [],
  },
];
