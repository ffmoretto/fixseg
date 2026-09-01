/**
 * =============================================================================
 * CURIOSIDADES SOBRE SEGUROS — conteúdo da seção "Informação também é proteção"
 * =============================================================================
 * Substitui a antiga integração com o feed de notícias de um portal de
 * terceiro. Aqui o conteúdo é NOSSO: nada é buscado na internet em tempo de
 * execução, nada depende de um site que pode sair do ar, e não há link de saída
 * levando o visitante para fora — o que ele lê aqui foi escrito para ele.
 *
 * -----------------------------------------------------------------------------
 * A REGRA DESTE ARQUIVO
 * -----------------------------------------------------------------------------
 * TODO NÚMERO AQUI É REAL, TEM ANO E TEM FONTE. Nenhum dado foi inventado,
 * arredondado a ponto de mudar de sentido, nem "estimado". A pesquisa foi feita
 * item por item em fontes primárias brasileiras — CNseg, FenSeg, FenaPrevi,
 * SUSEP, NTC&Logística, CNT, Sinesp, Fórum Brasileiro de Segurança Pública,
 * INPE, STJ e a própria legislação. O endereço de cada fonte está no comentário
 * acima do item, para conferência.
 *
 * Quando um assunto é interessante mas não tem número confiável, o item entra
 * SEM número (`destaque: null`) e conta a regra, o prazo ou a cobertura. É o
 * melhor caminho: uma estatística chutada num site de corretora é pior do que
 * curiosidade nenhuma.
 *
 * -----------------------------------------------------------------------------
 * COMO MANTER
 * -----------------------------------------------------------------------------
 *  · Dado envelhece. Números de mercado (arrecadação, roubos no ano, % de bens
 *    segurados) merecem revisão anual — a `fonte` já mostra o ano na tela, e um
 *    ano antigo é visível para o visitante, o que é honesto mas não é bom.
 *  · O campo `fonte` APARECE no cartão, em corpo pequeno. É o que diferencia
 *    informação de conversa. Não deixe vazio.
 *  · `slug` precisa casar com o slug de `src/config/insurances.ts`: é ele que
 *    liga a curiosidade ao produto e monta os filtros da seção.
 *  · O texto é lido por quem NÃO trabalha com seguros. Sem "estipulante",
 *    "prêmio" no sentido técnico ou "aviso de sinistro" sem explicação.
 * =============================================================================
 */

export interface Destaque {
  /** Dado curto, exibido em corpo grande. Ex.: '71%', 'R$ 5,1 bi', '30 dias'. */
  valor: string;
  /** O que o número significa, em uma linha. Sem ponto final. */
  rotulo: string;
}

export interface Curiosidade {
  /** Slug do produto em `src/config/insurances.ts`. */
  slug: string;
  /** Manchete curta. 4 a 9 palavras. */
  titulo: string;
  /** 2 a 4 frases. O fato e por que ele importa para quem tem o bem. */
  texto: string;
  /** Dado numérico para exibir grande, ou null quando o item não tem número. */
  destaque: Destaque | null;
  /** Fonte + ano, exibido no cartão. */
  fonte: string;
}

export const curiosidadesConfig = {
  /** Liga e desliga a seção inteira. */
  ativo: true,
  /**
   * Segundos que cada cartão fica na tela antes de o carrossel avançar sozinho.
   * O texto tem até 4 frases: menos de 7s não dá para ler. A rotação para no
   * ponteiro, no foco de teclado e com `prefers-reduced-motion`.
   */
  intervalo: 9,
} as const;

/* -------------------------------------------------------------------------- */
/* SEGURO DE VIDA                                                             */
/* -------------------------------------------------------------------------- */

const vida: Curiosidade[] = [
  {
    /* Fonte: Código Civil, art. 794.
       https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm */
    slug: 'seguro-de-vida',
    titulo: 'O seguro de vida não entra no inventário',
    texto:
      'O Código Civil é expresso: o capital do seguro de vida não é herança e não responde pelas dívidas do falecido. Ele vai direto a quem está indicado na apólice. Enquanto um inventário se arrasta por meses ou anos, esse dinheiro chega à família bem antes.',
    destaque: null,
    fonte: 'Código Civil, art. 794',
  },
  {
    /* Fonte: Fenaprevi/Datafolha, 2024.
       https://www.cnseg.org.br/noticias/pesquisa-fenaprevi-datafolha-explora-como-o-brasileiro-se-planeja-e-se-protege-para-o-futuro-e-para-a-aposentadoria */
    slug: 'seguro-de-vida',
    titulo: 'Oito em cada dez adultos estão sem proteção',
    texto:
      'Pesquisa da FenaPrevi com o Datafolha mostrou que a grande maioria dos adultos brasileiros não tem seguro de vida contratado. Diante de uma morte prematura, de uma doença grave ou de uma invalidez, a conta da casa continua chegando — e sem a renda de quem sustentava.',
    destaque: { valor: '82%', rotulo: 'dos adultos brasileiros não têm seguro de vida' },
    fonte: 'FenaPrevi/Datafolha, 2024',
  },
  {
    /* Fonte: Revista de Seguros (CNseg), 2024.
       https://revistadeseguros.cnseg.org.br/o-que-muitos-ignoram-mas-precisam-saber-sobre-o-seguro-de-vida/ */
    slug: 'seguro-de-vida',
    titulo: 'Ele também paga enquanto você está vivo',
    texto:
      'Boa parte das apólices de vida cobre o diagnóstico de doenças graves — câncer, infarto, AVC — e antecipa parte do capital sem esperar o óbito. Há ainda diária por internação e cobertura de invalidez, que entram justamente quando a renda para e as despesas aumentam.',
    destaque: null,
    fonte: 'CNseg, 2024',
  },
  {
    /* Fonte: Lei 15.040/2024, art. 87 (nova Lei de Seguros) e Circular SUSEP
       256/2004. https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l15040.htm */
    slug: 'seguro-de-vida',
    titulo: 'A seguradora tem prazo para pagar',
    texto:
      'Depois que a família entrega a documentação completa, a seguradora tem até 30 dias para pagar. O prazo já valia por norma da SUSEP e passou a estar na nova Lei de Seguros. Não é favor nem boa vontade: é obrigação, e o beneficiário pode cobrar.',
    destaque: { valor: '30 dias', rotulo: 'prazo máximo para pagar, após a documentação completa' },
    fonte: 'Lei 15.040/2024, art. 87',
  },
  {
    /* Fonte: CNseg, 2024.
       https://cnseg.org.br/noticias/seguros-de-pessoas-arrecadacao-em-2024-soma-r-72-7-bilhoes */
    slug: 'seguro-de-vida',
    titulo: 'O brasileiro começou a se proteger',
    texto:
      'Os seguros de pessoas, que incluem o seguro de vida, arrecadaram R$ 72,7 bilhões em 2024 — 16,2% mais que no ano anterior, puxados pelo vida individual. Deixou de ser assunto de executivo: virou item de orçamento de família.',
    destaque: { valor: 'R$ 72,7 bi', rotulo: 'arrecadados em seguros de pessoas no Brasil, em 2024' },
    fonte: 'CNseg, 2024',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO AUTO                                                                */
/* -------------------------------------------------------------------------- */

const auto: Curiosidade[] = [
  {
    /* Fonte: levantamento CNseg divulgado em 2025.
       https://www.segs.com.br/seguros/451876-classe-c-lidera-contratacao-de-seguro-automovel-no-brasil-mas-71-da-frota-ainda-roda-sem-protecao-aponta-levantamento-inedito-da-cnseg */
    slug: 'seguro-auto',
    titulo: 'Sete de cada dez carros rodam sem seguro',
    texto:
      'Levantamento da CNseg aponta que, de cerca de 63 milhões de automóveis em circulação no país, pouco mais de 18 milhões têm seguro. Os outros dependem de uma coisa só: que nada aconteça. Quando acontece, o prejuízo é inteiro do dono.',
    destaque: { valor: '71%', rotulo: 'da frota brasileira de automóveis não tem seguro' },
    fonte: 'CNseg, 2025',
  },
  {
    /* Fonte: CNseg, 2024, via InfoMoney.
       https://www.infomoney.com.br/minhas-financas/enchentes-do-rs-fazem-indenizacoes-de-seguro-auto-dobrarem-ate-maio-diz-cnseg/ */
    slug: 'seguro-auto',
    titulo: 'A enchente do RS dobrou as indenizações',
    texto:
      'Com as cheias de maio de 2024, as indenizações de seguro auto no Rio Grande do Sul mais que dobraram em relação ao ano anterior. Muita gente descobriu ali que alagamento não é cobertura automática: entra na apólice quando é contratada.',
    destaque: { valor: '+104%', rotulo: 'nas indenizações de seguro auto no RS, até maio de 2024' },
    fonte: 'CNseg, 2024',
  },
  {
    /* Fonte: Código Penal, arts. 155 e 157. Distinção usada nas condições
       gerais das apólices de automóvel. */
    slug: 'seguro-auto',
    titulo: 'Roubo e furto não são a mesma coisa',
    texto:
      'Na lei, furto é levar o carro sem que ninguém perceba; roubo envolve ameaça ou violência. A maioria das apólices cobre os dois, mas contratos mais enxutos tratam cada caso de forma diferente. Essa é a linha que decide se o carro é indenizado ou não.',
    destaque: null,
    fonte: 'Código Penal, arts. 155 e 157',
  },
  {
    /* Fonte: Circular SUSEP 269/2004 (revogada pela Circular SUSEP 639/2021),
       que fixava o teto de 75% do valor de mercado para indenização integral.
       Hoje o percentual está nas condições contratuais de cada seguradora. */
    slug: 'seguro-auto',
    titulo: 'Existe um ponto em que consertar não vale',
    texto:
      'Quando o reparo se aproxima de três quartos do valor de mercado do carro, a seguradora indeniza em vez de consertar. Esse teto de 75% já esteve em norma da SUSEP; hoje cada seguradora o define em contrato. Em perda total, a franquia não é cobrada.',
    destaque: { valor: '75%', rotulo: 'do valor do veículo era o teto da antiga norma da SUSEP' },
    fonte: 'Circulares SUSEP 269/2004 e 639/2021',
  },
  {
    /* Fonte: condições gerais das apólices de automóvel (prática consolidada e
       descrita em material das seguradoras).
       https://www.allianz.com.br/Blog/2024/carro-reserva-como-funciona-seguro-auto-da-Allianz.html */
    slug: 'seguro-auto',
    titulo: 'Carro reserva não vem de brinde',
    texto:
      'Carro reserva não é item obrigatório do seguro auto: é cobertura opcional, com prazo contratado — 7, 15, 30 dias. Quem não contratou fica sem carro justamente no período em que o dele está na oficina. Vale conferir na apólice antes de precisar.',
    destaque: null,
    fonte: 'Condições gerais das apólices',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO DE TRANSPORTES (CARGA)                                              */
/* -------------------------------------------------------------------------- */

const transportes: Curiosidade[] = [
  {
    /* Fonte: Decreto-Lei 73/1966 e condições do RCTR-C; NTC&Logística.
       https://www.gov.br/antt/pt-br/assuntos/cargas/seguro-de-responsabilidade-civil-do-transportador */
    slug: 'seguro-de-transportes',
    titulo: 'O seguro obrigatório cobre menos do que parece',
    texto:
      'O RCTR-C é exigido por lei desde 1966, mas responde só por acidente com o veículo: colisão, tombamento, capotagem, incêndio, explosão. Roubo e furto da carga ficam fora — isso é outra apólice. Quem acha que "está tudo coberto" costuma descobrir na pior hora.',
    destaque: null,
    fonte: 'Decreto-Lei 73/1966',
  },
  {
    /* Fonte: Lei 14.599/2023 e Resolução SUSEP 51/2025.
       https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14599.htm */
    slug: 'seguro-de-transportes',
    titulo: 'Agora são três seguros obrigatórios, não um',
    texto:
      'Desde a Lei 14.599/2023, o transporte rodoviário de carga precisa reunir três coberturas: avarias (RCTR-C), roubo e desaparecimento (RC-DC) e danos a terceiros (RC-V). Circular sem uma delas expõe a transportadora a multa e a prejuízo integral.',
    destaque: { valor: '3', rotulo: 'seguros formam hoje o pacote obrigatório do transporte de carga' },
    fonte: 'Lei 14.599/2023',
  },
  {
    /* Fonte: Sinesp (10.478 registros em 2024) e estimativa de prejuízo da
       NTC&Logística. https://agenciabrasil.ebc.com.br/geral/noticia/2025-08/mais-de-10-mil-roubos-de-carga-foram-registrados-no-pais-em-2024 */
    slug: 'seguro-de-transportes',
    titulo: 'São 27 cargas roubadas por dia no Brasil',
    texto:
      'Foram 10.478 roubos de carga registrados em 2024 — uma média de 27 por dia. A NTC&Logística estima o prejuízo do ano em R$ 1,2 bilhão. É o tipo de perda que não se dilui: cai inteira sobre o embarcador ou o transportador que estava sem cobertura.',
    destaque: { valor: '27 por dia', rotulo: 'roubos de carga registrados no Brasil, em 2024' },
    fonte: 'Sinesp e NTC&Logística, 2024',
  },
  {
    /* Fonte: análise de roubo de cargas 2024 (Nstech), divulgada pela imprensa.
       https://www.cnnbrasil.com.br/auto/sudeste-registra-83-dos-prejuizos-de-roubo-de-carga-em-2024/ */
    slug: 'seguro-de-transportes',
    titulo: 'A rota pesa tanto quanto a mercadoria',
    texto:
      'Em 2024, o Sudeste concentrou 83,6% do prejuízo com roubo de carga no país. Trajeto, horário e ponto de parada entram na conta do risco junto com o valor do que está no baú — e são eles que definem as exigências de rastreamento da apólice.',
    destaque: { valor: '83,6%', rotulo: 'do prejuízo com roubo de carga em 2024 foi no Sudeste' },
    fonte: 'Análise de roubo de cargas, 2024',
  },
  {
    /* Fonte: Anuário de Riscos do TRC (Pamcary), via Revista de Seguros CNseg.
       https://revistadeseguros.cnseg.org.br/acidentes-com-caminhoes-superam-roubos-e-redefinem-o-mapa-do-risco-logistico/ */
    slug: 'seguro-de-transportes',
    titulo: 'O acidente ameaça a carga mais que o assalto',
    texto:
      'Levantamento do setor mostra que acidentes com caminhão são cerca de 4,5 vezes mais frequentes que roubos de carga e respondem pela maior parte das perdas. Blindar a operação só contra assalto é proteger o lado menos provável do risco.',
    destaque: { valor: '4,5×', rotulo: 'mais frequentes: acidentes com caminhão do que roubos de carga' },
    fonte: 'Anuário de Riscos do TRC, 2024',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO DE FROTA                                                            */
/* -------------------------------------------------------------------------- */

const frota: Curiosidade[] = [
  {
    /* Fonte: Código Civil, arts. 932, III e 933 (responsabilidade objetiva do
       empregador). https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm */
    slug: 'seguro-de-frota',
    titulo: 'A empresa responde pelo motorista dela',
    texto:
      'O Código Civil é direto: a empresa responde pelos danos que seus funcionários causam a terceiros no trabalho, mesmo sem culpa própria. Basta a ligação com a função. Cada veículo a mais na rua é uma exposição a mais no CNPJ, não no CPF do condutor.',
    destaque: null,
    fonte: 'Código Civil, arts. 932 e 933',
  },
  {
    /* Fonte: CNseg, 2024 — levantamento sobre associações de "proteção
       veicular" e ações judiciais movidas pela SUSEP.
       https://sindsegsp.org.br/site/noticia-texto.aspx?id=34133 */
    slug: 'seguro-de-frota',
    titulo: '"Proteção veicular" não é seguro',
    texto:
      'Associação de proteção veicular não é fiscalizada pela SUSEP e não garante pagamento: a indenização depende do caixa e do critério do grupo. A SUSEP já levou à Justiça mais de 200 dessas operações. Para uma frota, a economia mensal pode custar a apólice inteira.',
    destaque: { valor: '213 ações', rotulo: 'movidas pela SUSEP contra associações irregulares' },
    fonte: 'CNseg e SUSEP, 2024',
  },
  {
    /* Fonte: STJ, EREsp 1.577.162-SP (Informativo 744, 2022).
       https://www.dizerodireito.com.br/2022/11/transportadora-que-descumpriu-sua.html */
    slug: 'seguro-de-frota',
    titulo: 'Descumprir o protocolo cancela a cobertura',
    texto:
      'O STJ negou indenização a uma transportadora porque o motorista não consultou a plataforma de gerenciamento de risco antes de sair — mesmo o roubo tendo sido à mão armada. Não foi o assalto que tirou o direito: foi o procedimento não cumprido.',
    destaque: null,
    fonte: 'STJ, 2022',
  },
  {
    /* Fonte: Anuário Brasileiro de Segurança Pública 2025 (FBSP), dados de 2024.
       https://forumseguranca.org.br/wp-content/uploads/2025/07/anuario-2025-infografico.pdf */
    slug: 'seguro-de-frota',
    titulo: 'Foram 126 mil veículos roubados em um ano',
    texto:
      'O Brasil registrou 126.675 roubos de veículos em 2024. O número caiu frente a 2023, mas segue concentrado nas áreas urbanas onde as frotas comerciais trabalham. Cada ocorrência é veículo parado, entrega atrasada e renovação mais cara no ano seguinte.',
    destaque: { valor: '126.675', rotulo: 'roubos de veículos registrados no Brasil, em 2024' },
    fonte: 'Fórum Brasileiro de Segurança Pública, 2025',
  },
  {
    /* Fonte: Pesquisa CNT de Rodovias 2024.
       https://pesquisarodovias.cnt.org.br/ */
    slug: 'seguro-de-frota',
    titulo: 'Só um terço das rodovias está em bom estado',
    texto:
      'A Pesquisa CNT de Rodovias avaliou mais de 111 mil km de estradas em 2024 e classificou apenas um terço como ótimas ou boas. O resto castiga suspensão, pneu e freio — e transforma desgaste mecânico em frequência de sinistro para quem roda todo dia.',
    destaque: { valor: '33%', rotulo: 'das rodovias avaliadas em 2024 são ótimas ou boas' },
    fonte: 'CNT, 2024',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO CAMINHÃO                                                            */
/* -------------------------------------------------------------------------- */

const caminhao: Curiosidade[] = [
  {
    /* Fonte: regras de seguros obrigatórios do transporte (ANTT/SUSEP): a lei
       obriga carga e terceiros, não o casco do veículo.
       https://www.gov.br/antt/pt-br/assuntos/cargas */
    slug: 'seguro-caminhao',
    titulo: 'A lei protege a carga, não o seu caminhão',
    texto:
      'Os seguros obrigatórios do transporte cobrem a mercadoria e os danos a terceiros. O caminhão em si — o bem mais caro da operação — só está protegido se o dono contratar o casco. Sem ele, um capotamento pode encerrar a atividade sem indenização nenhuma.',
    destaque: null,
    fonte: 'Regras de seguros obrigatórios do transporte',
  },
  {
    /* Fonte: condições gerais de apólices de casco de veículos de carga: cada
       implemento é um bem com placa e valor próprios, declarado na apólice. */
    slug: 'seguro-caminhao',
    titulo: 'Segurar o cavalo não segura a carreta',
    texto:
      'Carreta, baú, tanque e implementos são bens separados: só ficam cobertos se estiverem declarados na apólice, com placa e valor. É um dos enganos mais comuns e mais caros — o cavalo mecânico indenizado e a carreta, que tombou junto, fora.',
    destaque: null,
    fonte: 'Condições gerais das apólices de casco',
  },
  {
    /* Fonte: dados CNT/PRF de 2024, via Revista de Seguros (CNseg).
       https://revistadeseguros.cnseg.org.br/acidentes-com-caminhoes-superam-roubos-e-redefinem-o-mapa-do-risco-logistico/ */
    slug: 'seguro-caminhao',
    titulo: 'Acidente custa quatro vezes mais que roubo',
    texto:
      'O custo estimado dos acidentes com caminhões nas rodovias federais chegou a R$ 5,1 bilhões em 2024, contra cerca de R$ 1,2 bilhão ligado a roubo de carga. Para o veículo, o risco maior não é o assalto: é a colisão e o tombamento do dia a dia.',
    destaque: { valor: 'R$ 5,1 bi', rotulo: 'custo estimado dos acidentes com caminhões em 2024' },
    fonte: 'CNT e PRF, 2024',
  },
  {
    /* Fonte: dados do Ministério do Trabalho e Emprego (CANPAT) sobre mortes em
       acidentes de trabalho por ocupação, 2016–2025. */
    slug: 'seguro-caminhao',
    titulo: 'Nenhuma profissão perde mais gente na estrada',
    texto:
      'Entre 2016 e 2025, mais de 4.200 motoristas de caminhão morreram em acidentes de trabalho no Brasil — mais do que em qualquer outra ocupação. Por trás de cada número há uma família, e é ela que o seguro de vida e o de acidentes pessoais alcançam.',
    destaque: { valor: '4.249', rotulo: 'motoristas de caminhão mortos em acidentes de trabalho (2016–2025)' },
    fonte: 'Ministério do Trabalho e Emprego, 2026',
  },
  {
    /* Fonte: jurisprudência sobre lucros cessantes de veículo de carga parado
       (TJPR e TJRS, 2020–2021), que usa como critério o faturamento médio dos
       meses anteriores com dedução de despesas.
       https://estradas.com.br/artigo-transportadoras-devem-ser-reembolsadas-por-prejuizos-causados-em-acidentes-transito/ */
    slug: 'seguro-caminhao',
    titulo: 'Caminhão parado também é prejuízo indenizável',
    texto:
      'Quando o acidente é causado por terceiro, os tribunais reconhecem o direito de cobrar o que o caminhão deixou de faturar parado na oficina. O cálculo parte do faturamento médio dos meses anteriores, descontadas as despesas que não correram.',
    destaque: null,
    fonte: 'TJPR e TJRS, 2020–2021',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO RESIDENCIAL                                                         */
/* -------------------------------------------------------------------------- */

const residencial: Curiosidade[] = [
  {
    /* Fonte: FenSeg — percentual de domicílios brasileiros com seguro
       residencial. https://www.infomoney.com.br/minhas-financas/de-incendio-a-vendaval-seguro-residencial-cresce-25-em-4-anos-no-pais-veja-valores/ */
    slug: 'seguro-residencial',
    titulo: 'A casa é o maior bem e o menos protegido',
    texto:
      'Só cerca de 17% dos domicílios brasileiros têm seguro residencial, segundo a FenSeg. É o patrimônio que a família levou a vida para construir, protegido por menos de um em cada cinco. Um incêndio, um vendaval ou um furto resolve isso em uma tarde.',
    destaque: { valor: '17%', rotulo: 'dos domicílios brasileiros têm seguro residencial' },
    fonte: 'FenSeg',
  },
  {
    /* Fonte: Código Civil, art. 1.346 (seguro obrigatório da edificação em
       condomínio). */
    slug: 'seguro-residencial',
    titulo: 'O seguro do condomínio não cobre o seu apartamento',
    texto:
      'A lei obriga todo condomínio a segurar a edificação contra incêndio e destruição — mas essa apólice cobre a estrutura e as áreas comuns. Móveis, eletrodomésticos, roupa, computador e o que está dentro da sua porta dependem de um seguro seu.',
    destaque: null,
    fonte: 'Código Civil, art. 1.346',
  },
  {
    /* Fonte: INPE/ELAT — incidência de descargas atmosféricas no Brasil.
       https://agenciabrasil.ebc.com.br/radioagencia-nacional/geral/audio/2022-01/brasil-e-o-pais-com-maior-incidencia-de-raios-no-mundo */
    slug: 'seguro-residencial',
    titulo: 'O Brasil é o país que leva mais raios no mundo',
    texto:
      'São cerca de 70 milhões de descargas elétricas por ano, mais que em qualquer outro país, segundo o INPE. Não é preciso o raio cair na casa: a oscilação na rede queima geladeira, ar-condicionado e televisão de uma vez — e essa cobertura é contratada à parte.',
    destaque: { valor: '70 milhões', rotulo: 'de raios caem no Brasil todos os anos' },
    fonte: 'INPE',
  },
  {
    /* Fonte: condições gerais das apólices residenciais e jurisprudência que
       reconhece a distinção entre furto simples e furto qualificado.
       https://www.segs.com.br/seguros/105422-seguro-residencial-que-limita-cobertura-a-furto-e-roubo-nao-e-abusiva */
    slug: 'seguro-residencial',
    titulo: 'Nem todo furto em casa é coberto',
    texto:
      'Muitas apólices cobrem roubo (com ameaça ou violência) e furto qualificado — aquele com arrombamento, escalada, chave falsa. O furto simples, em que o bem desaparece sem sinal de invasão, costuma ficar fora, e a Justiça já validou essa distinção.',
    destaque: null,
    fonte: 'Condições gerais e jurisprudência',
  },
  {
    /* Fonte: cobertura de responsabilidade civil familiar nas apólices
       residenciais. https://www.infomoney.com.br/minhas-financas/quebrou-a-vidraca-do-vizinho-seguro-pode-cobrir-prejuizos-a-terceiros-veja-como/ */
    slug: 'seguro-residencial',
    titulo: 'O vazamento que molha o vizinho é sua conta',
    texto:
      'O cano que estoura no seu apartamento e desce pela parede do vizinho gera um dano que a lei manda você reparar. A cobertura de responsabilidade civil familiar paga essa conta — inclusive a bola que quebra a vidraça e o cachorro que morde alguém.',
    destaque: null,
    fonte: 'Coberturas do seguro residencial',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO EMPRESARIAL                                                         */
/* -------------------------------------------------------------------------- */

const empresarial: Curiosidade[] = [
  {
    /* Fonte: pesquisa CNseg com micro e pequenos empresários, 2025.
       https://www.sindsegsp.org.br/site/noticia-texto.aspx?id=36400 */
    slug: 'seguro-empresarial',
    titulo: 'Uma em cada quatro pequenas empresas tem seguro',
    texto:
      'Pesquisa da CNseg mostrou que apenas 26,7% dos micro e pequenos empresários brasileiros contratam seguro empresarial. O restante trabalha com o estoque, o maquinário e o ponto expostos — e um sinistro grave numa empresa pequena costuma ser definitivo.',
    destaque: { valor: '26,7%', rotulo: 'dos micro e pequenos empresários têm seguro empresarial' },
    fonte: 'CNseg, 2025',
  },
  {
    /* Fonte: pesquisa CNseg, 2025 — motivação da contratação.
       https://www.sonhoseguro.com.br/2025/01/micro-e-pequenos-empresarios-contratam-seguros-apos-tragedias-ou-exigencias-legais-revela-cnseg/ */
    slug: 'seguro-empresarial',
    titulo: 'A maioria só contrata depois do prejuízo',
    texto:
      'A mesma pesquisa da CNseg mostra que o pequeno empresário brasileiro costuma buscar seguro depois de um incêndio, de um assalto ou porque um contrato exigiu. Ou seja: a decisão quase sempre chega tarde, quando o dinheiro já foi.',
    destaque: null,
    fonte: 'CNseg, 2025',
  },
  {
    /* Fonte: cobertura de lucros cessantes nas apólices patrimoniais.
       https://www.chubb.com/br-pt/negocios/recursos/seguro-lucros-cessantes.html */
    slug: 'seguro-empresarial',
    titulo: 'Reconstruir o prédio não paga a folha',
    texto:
      'O seguro patrimonial reconstrói a estrutura e repõe as máquinas, mas não devolve o faturamento dos meses de porta fechada. Salário, aluguel e financiamento continuam vencendo. Quem cobre esse período é a cobertura de lucros cessantes.',
    destaque: null,
    fonte: 'Coberturas do seguro empresarial',
  },
  {
    /* Fonte: STJ, REsp 1.943.335 (2022) — indenização de perda total de bens
       mais lucros cessantes e despesas fixas após incêndio.
       https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/14012022-Em-caso-de-perda-total--apolice-so-sera-paga-integralmente-se-o-valor-do-bem-nao-sofrer-depreciacao.aspx */
    slug: 'seguro-empresarial',
    titulo: 'O que uma apólice paga depois de um incêndio',
    texto:
      'Em caso julgado pelo STJ, uma empresa atingida por incêndio recebeu R$ 1,8 milhão pela perda dos bens, mais lucros cessantes e despesas fixas do período parado. O tamanho da conta mostra por que o seguro empresarial não é despesa de luxo.',
    destaque: { valor: 'R$ 1,8 mi', rotulo: 'pagos pela perda dos bens, além de lucros cessantes' },
    fonte: 'STJ, 2022',
  },
  {
    /* Fonte: cláusula de rateio das apólices patrimoniais — a indenização cai na
       mesma proporção da subdeclaração do valor em risco. */
    slug: 'seguro-empresarial',
    titulo: 'Declarar estoque a menos sai caro no sinistro',
    texto:
      'Se o valor declarado é menor que o real, entra a cláusula de rateio: a indenização cai na mesma proporção. Um milhão em bens declarado como seiscentos mil devolve 60% de qualquer prejuízo — inclusive de um pequeno, que teria sido coberto inteiro.',
    destaque: { valor: '60%', rotulo: 'é o que se recebe ao declarar 40% menos do que o valor real' },
    fonte: 'Cláusula de rateio das apólices',
  },
];

/* -------------------------------------------------------------------------- */
/* RESPONSABILIDADE CIVIL                                                     */
/* -------------------------------------------------------------------------- */

const responsabilidade: Curiosidade[] = [
  {
    /* Fonte: Código Civil, arts. 932 e 933 — responsabilidade sem culpa por ato
       de empregado. */
    slug: 'seguro-de-responsabilidade-civil',
    titulo: 'Sua empresa responde mesmo sem ter culpa',
    texto:
      'O Código Civil obriga a empresa a reparar o dano que o funcionário causa a terceiro no exercício do trabalho, ainda que a empresa não tenha errado em nada. Basta o vínculo com a função. Um descuido de um único empregado vira uma indenização no caixa.',
    destaque: null,
    fonte: 'Código Civil, arts. 932 e 933',
  },
  {
    /* Fonte: Código Civil, art. 618 e jurisprudência do STJ sobre o conceito de
       solidez e segurança.
       https://conjur.com.br/2025-jun-13/artigo-618-do-codigo-civil-de-2002-e-artigo-1-245-do-codigo-civil-de-1916-o-conceito-de-solidez-e-seguranca-no-ambito-do-superior-tribunal-de-justica/ */
    slug: 'seguro-de-responsabilidade-civil',
    titulo: 'A obra entregue segue no seu nome por cinco anos',
    texto:
      'O construtor responde por solidez e segurança da obra durante cinco anos após a entrega. O STJ entende que isso vai além de risco de desabamento: inclui infiltração, vazamento e falha elétrica que afete o uso do imóvel.',
    destaque: { valor: '5 anos', rotulo: 'de responsabilidade do construtor por solidez e segurança' },
    fonte: 'Código Civil, art. 618',
  },
  {
    /* Fonte: Código Civil, art. 206, §3º, V — prescrição da pretensão de
       reparação civil em três anos. */
    slug: 'seguro-de-responsabilidade-civil',
    titulo: 'Quem sofreu o dano tem três anos para cobrar',
    texto:
      'A pretensão de reparação civil prescreve em três anos. Parece muito, mas é o tempo em que uma obra, um serviço ou um produto seu pode voltar como processo — quando a equipe já mudou e ninguém lembra do detalhe. A apólice cobre também a defesa.',
    destaque: { valor: '3 anos', rotulo: 'é o prazo para a vítima cobrar reparação na Justiça' },
    fonte: 'Código Civil, art. 206',
  },
  {
    /* Fonte: exigência de RC e Riscos de Engenharia em financiamento de obras
       (Caixa Econômica Federal), compilada pelo Sinduscon-SP.
       https://sindusconsp.com.br/conheca-os-seguros-obrigatorios-para-as-obras/ */
    slug: 'seguro-de-responsabilidade-civil',
    titulo: 'Banco não financia obra sem apólice de RC',
    texto:
      'Para liberar financiamento de obra, a Caixa exige responsabilidade civil com cobertura mínima de R$ 300 mil, além do seguro de riscos de engenharia. É o reconhecimento de que um dano ao vizinho ou à rede pública pode estourar o orçamento da construtora.',
    destaque: { valor: 'R$ 300 mil', rotulo: 'de cobertura mínima de RC exigida em obra financiada' },
    fonte: 'Sinduscon-SP, 2024',
  },
  {
    /* Fonte: Lei 6.404/1976, art. 158 — responsabilidade pessoal do
       administrador, base do seguro D&O. */
    slug: 'seguro-de-responsabilidade-civil',
    titulo: 'O diretor responde com o patrimônio dele',
    texto:
      'A Lei das S.A. responsabiliza pessoalmente o administrador por ato praticado com culpa, dolo ou fora do estatuto — e a empresa não pode afastar essa responsabilidade. É por isso que existe o seguro D&O: separa o bolso do executivo da cadeira que ele ocupa.',
    destaque: null,
    fonte: 'Lei 6.404/1976, art. 158',
  },
];

/* -------------------------------------------------------------------------- */
/* SEGURO GARANTIA                                                            */
/* -------------------------------------------------------------------------- */

const garantia: Curiosidade[] = [
  {
    /* Fonte: Lei 14.133/2021, arts. 98 e 99 — garantia de até 30% em obras de
       grande vulto. https://licitacoesecontratos.tcu.gov.br/5-11-2-garantias-2/ */
    slug: 'seguro-garantia',
    titulo: 'Em obra grande, a garantia chega a 30%',
    texto:
      'A Lei de Licitações permite exigir seguro garantia com cláusula de retomada de até 30% do valor do contrato em obras de grande vulto — o triplo do limite geral. É o tamanho do prejuízo que o poder público enxerga numa obra abandonada no meio.',
    destaque: { valor: '30%', rotulo: 'é a garantia máxima exigível em obra pública de grande vulto' },
    fonte: 'Lei 14.133/2021',
  },
  {
    /* Fonte: Lei 14.133/2021, art. 102 — cláusula de retomada.
       https://www.novaleilicitacao.com.br/2022/07/19/as-obras-de-engenharia-e-a-clausula-de-retomada/ */
    slug: 'seguro-garantia',
    titulo: 'Se a construtora sai, a seguradora termina a obra',
    texto:
      'Na cláusula de retomada, o abandono do contrato não para a obra: a seguradora pode assumir a execução até o fim, entrando no canteiro. Se preferir não assumir, paga o valor integral da apólice. Para o contratante, o risco de obra inacabada sai da mesa.',
    destaque: null,
    fonte: 'Lei 14.133/2021, art. 102',
  },
  {
    /* Fonte: CPC, art. 835, §2º — seguro garantia judicial equiparado a
       dinheiro, desde que cubra o débito acrescido de 30%. */
    slug: 'seguro-garantia',
    titulo: 'Na Justiça, vale o mesmo que dinheiro',
    texto:
      'O Código de Processo Civil equipara o seguro garantia judicial a dinheiro na ordem de penhora, desde que a apólice cubra o débito mais 30%. Na prática, a empresa discute a cobrança com o caixa girando, em vez de ver o valor bloqueado até o fim do processo.',
    destaque: { valor: '+30%', rotulo: 'sobre o débito é o que faz a apólice valer como penhora em dinheiro' },
    fonte: 'CPC, art. 835',
  },
  {
    /* Fonte: STJ, 1ª Seção, junho de 2025 — fiança bancária e seguro garantia
       suspendem a exigibilidade de créditos não tributários.
       https://www.conjur.com.br/2025-jun-12/fianca-bancaria-e-seguro-garantia-judicial-suspendem-credito-nao-tributario/ */
    slug: 'seguro-garantia',
    titulo: 'O STJ reforçou o poder da apólice',
    texto:
      'Em 2025, o STJ decidiu que fiança bancária e seguro garantia também suspendem a cobrança de créditos não tributários, com efeito equivalente ao depósito em dinheiro. O argumento do tribunal foi direto: custa menos e libera capital de giro.',
    destaque: null,
    fonte: 'STJ, 2025',
  },
  {
    /* Fonte: SUSEP — o seguro garantia tem contragarantia e direito de regresso
       contra o tomador. https://www.gov.br/susep/pt-br */
    slug: 'seguro-garantia',
    titulo: 'Não é um seguro comum: a conta volta',
    texto:
      'No seguro garantia, se a seguradora paga, ela tem direito de cobrar o valor de volta da empresa contratada, com base na contragarantia. Ele resolve a exigência do contrato e preserva o limite de crédito no banco — mas não apaga a obrigação de entregar.',
    destaque: null,
    fonte: 'SUSEP',
  },
];

/* -------------------------------------------------------------------------- */
/* RISCOS DIVERSOS                                                            */
/* -------------------------------------------------------------------------- */

const riscosDiversos: Curiosidade[] = [
  {
    /* Fonte: escopo do seguro patrimonial (endereço fixo declarado) x seguro de
       riscos diversos (bens que circulam). */
    slug: 'seguro-de-riscos-diversos',
    titulo: 'O equipamento que sai da empresa fica descoberto',
    texto:
      'O seguro patrimonial protege bens no endereço declarado na apólice. Notebook em campo, ferramenta na obra, drone, equipamento de medição e máquina móvel saem dessa proteção quando saem pela porta. É esse buraco que o riscos diversos fecha.',
    destaque: null,
    fonte: 'Escopo das apólices patrimoniais',
  },
  {
    /* Fonte: CNseg / Revista de Seguros — participação dos danos elétricos nas
       indenizações patrimoniais; INPE para a incidência de raios.
       https://revistadeseguros.cnseg.org.br/crise-climatica-tem-aumentado-incidencia-de-raios-no-pais/ */
    slug: 'seguro-de-riscos-diversos',
    titulo: 'Dano elétrico é a indenização mais comum',
    texto:
      'Os danos elétricos respondem por cerca de 35% das indenizações pagas em seguros patrimoniais no Brasil. Uma oscilação na rede queima servidor, painel de comando e linha de produção sem deixar marca de incêndio — e, sem incêndio, o seguro básico pode não pagar.',
    destaque: { valor: '35%', rotulo: 'das indenizações patrimoniais no Brasil vêm de dano elétrico' },
    fonte: 'CNseg',
  },
  {
    /* Fonte: cobertura de quebra de máquinas (falha interna súbita), fora do
       escopo de eventos externos do seguro patrimonial. */
    slug: 'seguro-de-riscos-diversos',
    titulo: 'A máquina pode quebrar sozinha e ficar fora',
    texto:
      'O seguro patrimonial cobre evento externo: incêndio, raio, explosão. Uma falha mecânica ou elétrica interna da própria máquina, mesmo súbita e imprevisível, não entra ali. Para isso existe a cobertura de quebra de máquinas — que é o sinistro mais provável na indústria.',
    destaque: null,
    fonte: 'Coberturas de riscos de engenharia',
  },
  {
    /* Fonte: exigência de Riscos de Engenharia em obra financiada, cobrindo
       100% do valor da obra, compilada pelo Sinduscon-SP.
       https://sindusconsp.com.br/conheca-os-seguros-obrigatorios-para-as-obras/ */
    slug: 'seguro-de-riscos-diversos',
    titulo: 'A obra é segurada desde o material no canteiro',
    texto:
      'Em obra financiada, o seguro de riscos de engenharia exigido cobre 100% do valor da construção, com adicionais para remoção de escombros e erro de projeto. A proteção começa no descarregamento do material e vai até a entrega — inclusive contra vendaval e desmoronamento.',
    destaque: { valor: '100%', rotulo: 'do valor da obra é a cobertura básica exigida em financiamento' },
    fonte: 'Sinduscon-SP, 2024',
  },
  {
    /* Fonte: prática de mercado em eventos: estrutura alugada não está coberta
       por apólice do fornecedor nem do espaço.
       https://www.berkley.com.br/tendencias/seguro-de-responsabilidade-civil-eventos/ */
    slug: 'seguro-de-riscos-diversos',
    titulo: 'No evento, o prejuízo é de quem organiza',
    texto:
      'Palco, som, tenda e estrutura alugados não vêm com seguro do fornecedor nem do espaço. Se algo cai na montagem, se o vendaval leva a tenda ou se alguém se machuca, a conta é do organizador. Um evento de um dia pode custar o lucro de um ano.',
    destaque: null,
    fonte: 'Práticas de seguro para eventos',
  },
];

/* -------------------------------------------------------------------------- */
/* A LISTA ÚNICA                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ordem intencional: alterna produto de pessoa física e de empresa, para que
 * quem passa pelo carrossel sem filtrar encontre variedade em vez de dez
 * cartões seguidos do mesmo assunto.
 */
export const curiosities: Curiosidade[] = [
  ...vida,
  ...auto,
  ...residencial,
  ...transportes,
  ...caminhao,
  ...frota,
  ...empresarial,
  ...responsabilidade,
  ...garantia,
  ...riscosDiversos,
];

/** Slugs que têm curiosidade, na ordem em que aparecem na lista. */
export function slugsComCuriosidade(): string[] {
  const vistos: string[] = [];
  for (const c of curiosities) if (!vistos.includes(c.slug)) vistos.push(c.slug);
  return vistos;
}
