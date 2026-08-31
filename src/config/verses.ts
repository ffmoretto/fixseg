/**
 * =============================================================================
 * VERSÍCULOS — a faixa no fim da página
 * =============================================================================
 * A FIXSEG quer declarar, de forma discreta, que o negócio se sustenta na fé.
 * A faixa aparece no rodapé de todas as páginas, troca de versículo a cada
 * intervalo e nunca repete: a rotação passa por TODOS antes de recomeçar.
 *
 * Tradução: João Ferreira de Almeida, edição em DOMÍNIO PÚBLICO. A escolha é
 * deliberada — as revisões modernas (ARA, ARC, NVI, NAA) são obras protegidas
 * por direito autoral e exigiriam licença da editora para publicação em site.
 * Se a corretora preferir outra tradução, é preciso obter a autorização antes
 * de trocar os textos aqui.
 *
 * Para DESLIGAR a faixa por completo: `verseBand.ativo = false`.
 * =============================================================================
 */

export interface Verse {
  /** O texto do versículo. */
  texto: string;
  /** Referência canônica: livro, capítulo e versículo. */
  referencia: string;
}

export const verseBand = {
  /** Liga ou desliga a faixa em todo o site. */
  ativo: true,
  /** Segundos que cada versículo permanece na tela. */
  intervalo: 14,
  /** Crédito da tradução, exibido junto da referência. */
  traducao: 'Almeida, domínio público',
  /** Frase curta que apresenta a faixa. Deixe vazia para não exibir. */
  chamada: 'Um negócio que crê em Deus acima de tudo',
} as const;

/**
 * Os versículos. Escolhidos pelo que dizem sobre confiança, amparo, trabalho e
 * o cuidado com quem depende de nós — os mesmos temas do site.
 *
 * Para acrescentar ou trocar: basta editar a lista. A rotação se ajusta sozinha
 * à quantidade.
 */
export const verses: Verse[] = [
  {
    texto:
      'Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.',
    referencia: 'Salmos 91:2',
  },
  {
    texto: 'Se o Senhor não edificar a casa, em vão trabalham os que a edificam.',
    referencia: 'Salmos 127:1',
  },
  {
    texto: 'Entrega ao Senhor as tuas obras, e os teus pensamentos serão estabelecidos.',
    referencia: 'Provérbios 16:3',
  },
  {
    texto:
      'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    referencia: 'Provérbios 3:5-6',
  },
  {
    texto: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.',
    referencia: 'Salmos 46:1',
  },
  {
    texto: 'O meu socorro vem do Senhor, que fez o céu e a terra.',
    referencia: 'Salmos 121:2',
  },
  {
    texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele o fará.',
    referencia: 'Salmos 37:5',
  },
  {
    texto: 'O Senhor é o meu pastor; nada me faltará.',
    referencia: 'Salmos 23:1',
  },
  {
    texto:
      'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo.',
    referencia: 'Isaías 41:10',
  },
  {
    texto:
      'Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor teu Deus é contigo por onde quer que andares.',
    referencia: 'Josué 1:9',
  },
  {
    texto:
      'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens.',
    referencia: 'Colossenses 3:23',
  },
  {
    texto: 'Todas as vossas coisas sejam feitas com amor.',
    referencia: '1 Coríntios 16:14',
  },
  {
    texto:
      'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que não se veem.',
    referencia: 'Hebreus 11:1',
  },
  {
    texto:
      'Toda a boa dádiva e todo o dom perfeito vem do alto, descendo do Pai das luzes.',
    referencia: 'Tiago 1:17',
  },
  {
    texto:
      'Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.',
    referencia: 'Mateus 6:33',
  },
  {
    texto: 'Melhores são dois do que um, porque têm melhor paga do seu trabalho.',
    referencia: 'Eclesiastes 4:9',
  },
  {
    texto: 'Posso todas as coisas naquele que me fortalece.',
    referencia: 'Filipenses 4:13',
  },
  {
    texto:
      'Os pensamentos do diligente tendem só para a abundância, porém os do apressado, tão só para a pobreza.',
    referencia: 'Provérbios 21:5',
  },
];
