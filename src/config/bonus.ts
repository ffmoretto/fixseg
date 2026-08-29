/**
 * =============================================================================
 * CLASSE DE BÔNUS DO SEGURO AUTO — REGRA, FAIXAS E TEXTOS
 * =============================================================================
 * Este arquivo concentra TUDO o que a calculadora de bônus usa: os tipos, a
 * função de cálculo (pura, sem React e sem acesso ao relógio), as faixas de
 * atraso, a tabela de referência de desconto por classe e todos os textos
 * exibidos na tela. Para ajustar qualquer palavra da calculadora, edite aqui —
 * o componente não tem texto solto.
 *
 * A ESCALA
 * --------
 * O bônus do seguro auto no Brasil é expresso em classes de 0 a 10 (padrão
 * FENASEG). A classe 1 é a de quem contrata pela primeira vez e completa o
 * período sem sinistro; a classe 10 é o teto da escala.
 *
 * A CONTA
 * -------
 *   novaClasse = classeAtual + 1 − faixaDeAtraso − penalidadeDeSinistros
 *
 * ...limitada ao intervalo 0–10. Duas regras de vigência podem interferir:
 * apólice com menos de 335 dias de vigência não dá direito ao avanço, e apólice
 * com menos de 60 dias não transfere bônus nenhum.
 *
 * IMPORTANTE
 * ----------
 * O resultado é uma ESTIMATIVA. Cada seguradora tem sua própria tabela e suas
 * próprias condições de aceitação; a classe definitiva é a que a seguradora
 * emissora atribuir na apólice. Nada aqui promete desconto.
 *
 * NADA SAI DO NAVEGADOR: o cálculo é 100% local, nenhum dado é enviado.
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/** Data no formato ISO curto: 'AAAA-MM-DD' (o mesmo do `<input type="date">`). */
export type DataISO = string;

export interface EntradaBonus {
  /** Início da vigência da apólice anterior. */
  inicioVigencia: DataISO;
  /** Vencimento da apólice anterior — ou a data em que ela foi cancelada. */
  fimVigencia: DataISO;
  /**
   * Data usada como "hoje" na conta (normalmente a data da renovação).
   *
   * A calculadora NUNCA lê o relógio durante a renderização: quem preenche
   * este campo é um evento ou um `useEffect` no cliente. Ver `hojeISO()`.
   */
  dataReferencia: DataISO;
  /** Classe de bônus vigente na apólice anterior (0 a 10). */
  classeAtual: number;
  /** Sinistros indenizados no período (0 a 4). */
  sinistros: number;
}

/** Qual dos três caminhos da regra foi aplicado. */
export type RegraAplicada =
  /** Vigência completa: há direito ao avanço de uma classe. */
  | 'avanco'
  /** Vigência entre 60 e 334 dias: sem avanço, penalidades continuam valendo. */
  | 'sem-avanco'
  /** Vigência menor que 60 dias: o bônus não se transfere. */
  | 'sem-transferencia';

export interface FaixaDesconto {
  classe: number;
  /** Piso típico de desconto praticado pelo mercado, em %. */
  min: number;
  /** Teto típico de desconto praticado pelo mercado, em %. */
  max: number;
  /** Como a faixa aparece na tabela. */
  rotulo: string;
}

export interface ResultadoBonus {
  classeAtual: number;
  novaClasse: number;
  /** novaClasse − classeAtual. Positivo sobe, negativo perde, 0 mantém. */
  variacao: number;
  /** 'subiu' | 'manteve' | 'perdeu' — pronto para escolher ícone e cor. */
  direcao: 'subiu' | 'manteve' | 'perdeu';
  /** Frase curta do movimento: "Subiu 1 classe", "Perdeu 3 classes"… */
  variacaoRotulo: string;
  /** Dias corridos de vigência da apólice anterior. */
  diasVigencia: number;
  /** Dias corridos entre o vencimento e a data de referência (nunca negativo). */
  diasDesdeVencimento: number;
  /** Blocos de 30 dias de atraso descontados (0 a 11). */
  faixaAtraso: number;
  /** Classes descontadas por sinistro (0, ou sinistros + 1). */
  penalidadeSinistros: number;
  regra: RegraAplicada;
  /** A regra aplicada explicada em uma frase. */
  frase: string;
  /** Explicações das regras de vigência acionadas (pode vir vazio). */
  avisos: string[];
  /** Faixa típica de desconto da classe resultante. */
  faixa: FaixaDesconto;
}

/* -------------------------------------------------------------------------- */
/* Limites e opções dos campos                                                */
/* -------------------------------------------------------------------------- */

export const CLASSE_MIN = 0;
export const CLASSE_MAX = 10;
export const SINISTROS_MAX = 4;

/** Um bloco de atraso equivale a 30 dias corridos. */
export const DIAS_POR_BLOCO = 30;

/** Acima disto o atraso para de crescer: 11 blocos zeram qualquer bônus. */
export const FAIXA_ATRASO_MAX = 11;

/** Vigência mínima que dá direito ao avanço de classe. */
export const DIAS_VIGENCIA_PARA_AVANCO = 335;

/** Abaixo disto o bônus não se transfere para a apólice nova. */
export const DIAS_VIGENCIA_PARA_TRANSFERIR = 60;

/**
 * Opções do campo "classe atual". O rótulo é o que aparece no `select` e é
 * usado como chave — por isso precisa ser único.
 */
export const CLASSES_OPCOES: { valor: number; rotulo: string }[] = [
  { valor: 0, rotulo: 'Classe 0 — sem bônus' },
  { valor: 1, rotulo: 'Classe 1' },
  { valor: 2, rotulo: 'Classe 2' },
  { valor: 3, rotulo: 'Classe 3' },
  { valor: 4, rotulo: 'Classe 4' },
  { valor: 5, rotulo: 'Classe 5' },
  { valor: 6, rotulo: 'Classe 6' },
  { valor: 7, rotulo: 'Classe 7' },
  { valor: 8, rotulo: 'Classe 8' },
  { valor: 9, rotulo: 'Classe 9' },
  { valor: 10, rotulo: 'Classe 10 — teto da escala' },
];

/** Opções do campo "sinistros no período". */
export const SINISTROS_OPCOES: { valor: number; rotulo: string }[] = [
  { valor: 0, rotulo: 'Nenhum sinistro' },
  { valor: 1, rotulo: '1 sinistro' },
  { valor: 2, rotulo: '2 sinistros' },
  { valor: 3, rotulo: '3 sinistros' },
  { valor: 4, rotulo: '4 sinistros ou mais' },
];

/**
 * FAIXAS TÍPICAS DE MERCADO, QUE VARIAM POR SEGURADORA.
 *
 * Não é tabela oficial e não é promessa: é a ordem de grandeza que se pratica
 * no mercado brasileiro de seguro auto. O desconto real depende da seguradora,
 * do perfil do condutor, do veículo, da região e das coberturas escolhidas —
 * duas pessoas na mesma classe podem receber percentuais bem diferentes.
 */
export const FAIXAS_DESCONTO: FaixaDesconto[] = [
  { classe: 0, min: 0, max: 0, rotulo: 'sem desconto' },
  { classe: 1, min: 5, max: 10, rotulo: '5% a 10%' },
  { classe: 2, min: 10, max: 15, rotulo: '10% a 15%' },
  { classe: 3, min: 15, max: 20, rotulo: '15% a 20%' },
  { classe: 4, min: 20, max: 25, rotulo: '20% a 25%' },
  { classe: 5, min: 25, max: 30, rotulo: '25% a 30%' },
  { classe: 6, min: 30, max: 35, rotulo: '30% a 35%' },
  { classe: 7, min: 35, max: 40, rotulo: '35% a 40%' },
  { classe: 8, min: 40, max: 45, rotulo: '40% a 45%' },
  { classe: 9, min: 45, max: 50, rotulo: '45% a 50%' },
  { classe: 10, min: 50, max: 55, rotulo: '50% a 55%' },
];

/** Como cada bloco de atraso é apresentado na explicação da página. */
export const FAIXAS_ATRASO: { blocos: number; rotulo: string; efeito: string }[] = [
  { blocos: 0, rotulo: 'Até 30 dias', efeito: 'sem perda' },
  { blocos: 1, rotulo: 'De 31 a 60 dias', efeito: '−1 classe' },
  { blocos: 2, rotulo: 'De 61 a 90 dias', efeito: '−2 classes' },
  { blocos: 3, rotulo: 'De 91 a 120 dias', efeito: '−3 classes' },
  { blocos: 4, rotulo: 'De 121 a 150 dias', efeito: '−4 classes' },
  { blocos: 5, rotulo: 'De 151 a 180 dias', efeito: '−5 classes' },
  { blocos: 6, rotulo: 'De 181 a 210 dias', efeito: '−6 classes' },
  { blocos: 7, rotulo: 'De 211 a 240 dias', efeito: '−7 classes' },
  { blocos: 8, rotulo: 'De 241 a 270 dias', efeito: '−8 classes' },
  { blocos: 9, rotulo: 'De 271 a 300 dias', efeito: '−9 classes' },
  { blocos: 10, rotulo: 'De 301 a 330 dias', efeito: '−10 classes' },
  { blocos: 11, rotulo: 'Acima de 330 dias', efeito: '−11 classes (zera)' },
];

/* -------------------------------------------------------------------------- */
/* Datas — sempre em UTC, para o fuso não deslocar o resultado                 */
/* -------------------------------------------------------------------------- */

/**
 * Converte 'AAAA-MM-DD' em milissegundos UTC. Retorna `null` quando a data é
 * inválida ou não existe no calendário (31/02, por exemplo).
 *
 * Por que UTC e não `new Date(texto)`: uma data ISO curta é interpretada como
 * meia-noite UTC, mas as contas feitas com métodos locais deslocam o resultado
 * em um dia inteiro em fusos negativos — que é justamente o caso do Brasil.
 */
export function parseDataISO(valor: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((valor ?? '').trim());
  if (!m) return null;

  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

  const ts = Date.UTC(ano, mes - 1, dia);
  const d = new Date(ts);
  /* rejeita 31/02 e afins, que o Date.UTC "conserta" silenciosamente */
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    return null;
  }
  return ts;
}

const MS_POR_DIA = 86_400_000;

/** Dias corridos de `de` até `ate`. Negativo quando `ate` é anterior. */
export function diasEntre(de: number, ate: number): number {
  return Math.round((ate - de) / MS_POR_DIA);
}

/** Formata 'AAAA-MM-DD' como '31/12/2025'. Devolve o original se não parsear. */
export function formatarDataBR(valor: string): string {
  const ts = parseDataISO(valor);
  if (ts === null) return valor;
  const d = new Date(ts);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

/**
 * A data de hoje em 'AAAA-MM-DD', no fuso do próprio navegador.
 *
 * CHAME APENAS dentro de um evento ou de um `useEffect`. Usar isto durante a
 * renderização faria o HTML do servidor divergir do HTML do cliente e o React
 * descartaria a árvore por *hydration mismatch*.
 */
export function hojeISO(): DataISO {
  const agora = new Date();
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mm}-${dd}`;
}

/* -------------------------------------------------------------------------- */
/* As duas parcelas da conta                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Blocos de 30 dias corridos entre o vencimento e a data de referência.
 *
 *   0 a 30 dias → 0   |   31 a 60 → 1   |   61 a 90 → 2   |   91 a 120 → 3 …
 *
 * Renovar dentro dos 30 dias não custa nada. A partir daí, cada bloco iniciado
 * derruba uma classe, até o teto de 11 blocos (acima de 330 dias), que zera
 * qualquer bônus.
 */
export function faixaDeAtraso(diasDesdeVencimento: number): number {
  if (diasDesdeVencimento <= DIAS_POR_BLOCO) return 0;
  const blocos = Math.ceil(diasDesdeVencimento / DIAS_POR_BLOCO) - 1;
  return Math.min(FAIXA_ATRASO_MAX, blocos);
}

/**
 * Classes descontadas por sinistro no período.
 *
 * Sem sinistro não há desconto. Havendo, a penalidade é `sinistros + 1`: o
 * primeiro sinistro custa 2 classes (ele anula também o avanço do ano),
 * o segundo custa 3, e assim por diante.
 */
export function penalidadeDeSinistros(sinistros: number): number {
  const n = Math.max(0, Math.floor(sinistros));
  return n === 0 ? 0 : n + 1;
}

const limitar = (n: number) => Math.max(CLASSE_MIN, Math.min(CLASSE_MAX, n));

/** Faixa típica de desconto de uma classe. */
export function faixaDaClasse(classe: number): FaixaDesconto {
  return FAIXAS_DESCONTO[limitar(classe)];
}

/* -------------------------------------------------------------------------- */
/* Validação                                                                  */
/* -------------------------------------------------------------------------- */

export type ErrosBonus = Partial<Record<keyof EntradaBonus, string>>;

/**
 * Valida a entrada e devolve as mensagens por campo. Objeto vazio = tudo certo.
 * As mensagens ficam aqui, e não no componente, para poderem ser revisadas sem
 * mexer em código de interface.
 */
export function validarEntrada(entrada: Partial<EntradaBonus>): ErrosBonus {
  const erros: ErrosBonus = {};

  const inicio = parseDataISO(entrada.inicioVigencia ?? '');
  const fim = parseDataISO(entrada.fimVigencia ?? '');
  const referencia = parseDataISO(entrada.dataReferencia ?? '');

  if (!entrada.inicioVigencia) erros.inicioVigencia = 'Informe o início da vigência.';
  else if (inicio === null) erros.inicioVigencia = 'Data inválida. Use dia, mês e ano.';

  if (!entrada.fimVigencia) erros.fimVigencia = 'Informe o vencimento ou o cancelamento.';
  else if (fim === null) erros.fimVigencia = 'Data inválida. Use dia, mês e ano.';

  if (inicio !== null && fim !== null && fim <= inicio) {
    erros.fimVigencia = 'O vencimento precisa ser posterior ao início da vigência.';
  }

  if (!entrada.dataReferencia) erros.dataReferencia = 'Informe a data da renovação.';
  else if (referencia === null) erros.dataReferencia = 'Data inválida. Use dia, mês e ano.';
  else if (fim !== null && referencia < fim) {
    erros.dataReferencia = 'A renovação não pode ser anterior ao vencimento da apólice.';
  }

  if (
    entrada.classeAtual === undefined ||
    Number.isNaN(entrada.classeAtual) ||
    entrada.classeAtual < CLASSE_MIN ||
    entrada.classeAtual > CLASSE_MAX
  ) {
    erros.classeAtual = 'Escolha a classe de bônus da apólice atual.';
  }

  if (
    entrada.sinistros === undefined ||
    Number.isNaN(entrada.sinistros) ||
    entrada.sinistros < 0 ||
    entrada.sinistros > SINISTROS_MAX
  ) {
    erros.sinistros = 'Informe quantos sinistros houve no período.';
  }

  return erros;
}

/* -------------------------------------------------------------------------- */
/* O cálculo                                                                  */
/* -------------------------------------------------------------------------- */

const plural = (n: number, singular: string, pluralForma: string) =>
  n === 1 ? singular : pluralForma;

/**
 * Calcula a classe de bônus estimada da renovação.
 *
 * Função PURA: não lê o relógio, não toca no DOM e não depende de fuso — a
 * data de referência entra por parâmetro. É isso que a torna testável por um
 * script de Node sem navegador.
 *
 * Lança `Error` se a entrada não passar em `validarEntrada`.
 */
export function calcularBonus(entrada: EntradaBonus): ResultadoBonus {
  const erros = validarEntrada(entrada);
  const primeiroErro = Object.values(erros)[0];
  if (primeiroErro) throw new Error(primeiroErro);

  const inicio = parseDataISO(entrada.inicioVigencia) as number;
  const fim = parseDataISO(entrada.fimVigencia) as number;
  const referencia = parseDataISO(entrada.dataReferencia) as number;

  const classeAtual = limitar(Math.floor(entrada.classeAtual));
  const diasVigencia = diasEntre(inicio, fim);
  const diasDesdeVencimento = Math.max(0, diasEntre(fim, referencia));

  const atraso = faixaDeAtraso(diasDesdeVencimento);
  const penalidade = penalidadeDeSinistros(entrada.sinistros);

  const avisos: string[] = [];
  let regra: RegraAplicada;
  let bruto: number;

  if (diasVigencia < DIAS_VIGENCIA_PARA_TRANSFERIR) {
    /* Apólice curta demais: não há bônus a transferir. */
    regra = 'sem-transferencia';
    bruto = 0;
    avisos.push(TEXTOS.avisoSemTransferencia);
  } else if (diasVigencia < DIAS_VIGENCIA_PARA_AVANCO) {
    /* Vigência incompleta: sem avanço, mas as penalidades continuam valendo. */
    regra = 'sem-avanco';
    bruto = classeAtual - atraso - penalidade;
    avisos.push(TEXTOS.avisoSemAvanco);
  } else {
    regra = 'avanco';
    bruto = classeAtual + 1 - atraso - penalidade;
  }

  const novaClasse = limitar(bruto);
  const variacao = novaClasse - classeAtual;
  const direcao = variacao > 0 ? 'subiu' : variacao < 0 ? 'perdeu' : 'manteve';

  const variacaoRotulo =
    direcao === 'subiu'
      ? `Subiu ${variacao} ${plural(variacao, 'classe', 'classes')}`
      : direcao === 'perdeu'
        ? `Perdeu ${Math.abs(variacao)} ${plural(Math.abs(variacao), 'classe', 'classes')}`
        : 'Manteve a classe';

  return {
    classeAtual,
    novaClasse,
    variacao,
    direcao,
    variacaoRotulo,
    diasVigencia,
    diasDesdeVencimento,
    faixaAtraso: atraso,
    penalidadeSinistros: penalidade,
    regra,
    frase: montarFrase({
      regra,
      classeAtual,
      novaClasse,
      atraso,
      penalidade,
      sinistros: Math.max(0, Math.floor(entrada.sinistros)),
      diasDesdeVencimento,
    }),
    avisos,
    faixa: faixaDaClasse(novaClasse),
  };
}

/** A conta em uma frase, do jeito que um corretor explicaria. */
function montarFrase(p: {
  regra: RegraAplicada;
  classeAtual: number;
  novaClasse: number;
  atraso: number;
  penalidade: number;
  sinistros: number;
  diasDesdeVencimento: number;
}): string {
  if (p.regra === 'sem-transferencia') {
    return `A apólice anterior vigorou menos de ${DIAS_VIGENCIA_PARA_TRANSFERIR} dias, então o bônus não se transfere: a renovação parte da classe 0.`;
  }

  const partes: string[] = [];

  partes.push(
    p.regra === 'avanco'
      ? `Classe ${p.classeAtual} + 1 pelo período completo sem interrupção`
      : `Classe ${p.classeAtual} mantida, sem o avanço de uma classe (a apólice vigorou menos de ${DIAS_VIGENCIA_PARA_AVANCO} dias)`,
  );

  if (p.atraso > 0) {
    partes.push(
      `− ${p.atraso} ${plural(p.atraso, 'classe', 'classes')} por ${p.diasDesdeVencimento} ${plural(p.diasDesdeVencimento, 'dia corrido', 'dias corridos')} desde o vencimento`,
    );
  }

  if (p.penalidade > 0) {
    partes.push(
      `− ${p.penalidade} ${plural(p.penalidade, 'classe', 'classes')} por ${p.sinistros} ${plural(p.sinistros, 'sinistro no período', 'sinistros no período')}`,
    );
  }

  const conta = partes.join(' ');
  const limite =
    p.novaClasse === CLASSE_MAX && p.regra === 'avanco'
      ? ` A escala termina na classe ${CLASSE_MAX}, que é onde o cálculo parou.`
      : p.novaClasse === CLASSE_MIN
        ? ' O resultado não desce abaixo da classe 0.'
        : '';

  return `${conta}. Estimativa: classe ${p.novaClasse}.${limite}`;
}

/* -------------------------------------------------------------------------- */
/* Textos da interface                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Todo o texto visível da calculadora. Editar aqui muda a tela inteira sem
 * tocar em componente.
 */
export const TEXTOS = {
  eyebrow: 'Calculadora de bônus',
  titulo: 'Qual será sua classe de bônus na renovação',
  destaque: 'na renovação',
  subtitulo:
    'Informe os dados da apólice que está vencendo e veja a classe estimada da próxima. O cálculo segue a escala de 0 a 10 usada pelo mercado brasileiro de seguro auto.',

  /* rótulos dos campos */
  labelInicio: 'Início da vigência da apólice atual',
  hintInicio: 'A data em que a apólice que está vencendo começou a valer.',
  labelFim: 'Vencimento (ou cancelamento) da apólice',
  hintFim: 'Se a apólice foi cancelada antes do fim, use a data do cancelamento.',
  labelReferencia: 'Data da renovação',
  hintReferencia: 'Vem preenchida com hoje. Altere para simular outra data.',
  labelClasse: 'Classe de bônus atual',
  hintClasse: 'Está na apólice, geralmente perto do nome da seguradora.',
  labelSinistros: 'Sinistros indenizados no período',
  hintSinistros: 'Conte só os sinistros pagos pela seguradora.',

  botaoCalcular: 'Calcular minha classe',
  botaoRecalcular: 'Calcular de novo',

  /* resultado */
  resultadoEyebrow: 'Classe estimada na renovação',
  rotuloDiasVigencia: 'Dias de vigência',
  rotuloDiasAtraso: 'Dias desde o vencimento',
  rotuloClasseAtual: 'Classe informada',
  rotuloFaixa: 'Faixa típica de desconto',
  rotuloRegra: 'Como chegamos nesse número',

  /* avisos das regras de vigência */
  avisoSemAvanco: `A apólice anterior vigorou menos de ${DIAS_VIGENCIA_PARA_AVANCO} dias. Em geral, o avanço de uma classe exige o período praticamente completo — por isso a classe foi mantida, e não aumentada. As penalidades por sinistro e por atraso continuam valendo normalmente.`,
  avisoSemTransferencia: `A apólice anterior vigorou menos de ${DIAS_VIGENCIA_PARA_TRANSFERIR} dias. Nesse caso o bônus não se transfere para a apólice nova: a renovação começa na classe 0, mesmo que a classe anterior fosse alta.`,

  /* honestidade — não é letra miúda, é parte do resultado */
  ressalvaTitulo: 'Isto é uma estimativa',
  ressalva:
    'As regras de bônus variam de uma seguradora para outra, e algumas avaliam também o histórico do condutor e do veículo. A classe definitiva é a que a seguradora emissora atribuir na apólice — este número serve para você chegar à negociação sabendo o que esperar.',

  /* LGPD */
  privacidade:
    'O cálculo acontece inteiramente no seu navegador. Nenhuma das datas ou informações digitadas aqui é enviada para a FIXSEG ou para qualquer outro lugar.',

  /* CTAs */
  ctaCotacao: 'Cotar seguro auto',
  ctaWhatsapp: 'Falar com um especialista',
  ctaLegenda: 'Quer conferir esse número com quem faz isso todo dia?',

  /* faixa de desconto */
  faixaAviso: 'Faixas típicas de mercado. Variam por seguradora.',
} as const;

/** Mensagem do WhatsApp com a classe já calculada. */
export function mensagemWhatsapp(resultado: ResultadoBonus): string {
  return (
    `Olá! Usei a calculadora de bônus do site e o resultado foi a classe ${resultado.novaClasse} ` +
    `(eu estou na classe ${resultado.classeAtual}). Gostaria de uma cotação de seguro auto.`
  );
}

/* -------------------------------------------------------------------------- */
/* Conteúdo explicativo da página                                             */
/* -------------------------------------------------------------------------- */

export const EXPLICACAO = {
  oQueE: {
    titulo: 'O que é a classe de bônus',
    paragrafos: [
      'A classe de bônus é o registro do seu histórico como segurado de automóvel. Ela vai de 0 a 10 e acompanha a pessoa, não o carro: quem troca de veículo leva a classe junto, e quem troca de seguradora normalmente também — a nova seguradora consulta o histórico antes de emitir a apólice.',
      'Quem contrata seguro auto pela primeira vez entra na classe 0. Ao completar o período de vigência sem sinistro e renovar em dia, sobe para a classe 1, e assim sucessivamente até o teto da escala.',
    ],
  },
  comoGanha: {
    titulo: 'Como se ganha classe',
    itens: [
      'Completando o período de vigência da apólice — na prática, algo em torno de 335 dias ou mais.',
      'Sem sinistro indenizado pela seguradora no período.',
      'Renovando dentro de 30 dias corridos contados do vencimento da apólice anterior.',
      'Cada renovação nessas condições vale exatamente uma classe. Não existe atalho: a escala sobe de um em um.',
    ],
  },
  comoPerde: {
    titulo: 'Como se perde classe',
    itens: [
      'Sinistro indenizado: o primeiro custa 2 classes, o segundo 3, o terceiro 4, o quarto 5. Sinistro sem indenização, em regra, não conta.',
      'Atraso na renovação: cada bloco de 30 dias corridos além dos 30 primeiros derruba uma classe.',
      'Passar de 330 dias sem renovar zera o bônus, mesmo sem nenhum sinistro.',
      'Encerrar a apólice antes do fim da vigência: com menos de 335 dias não há avanço, e com menos de 60 dias o bônus não se transfere.',
    ],
  },
  tabela: {
    titulo: 'Faixas de desconto por classe',
    intro:
      'A classe de bônus é apenas um dos fatores do preço. Perfil do condutor, modelo e ano do veículo, cidade onde o carro dorme, uso e coberturas escolhidas pesam tanto quanto ela. Os percentuais abaixo são a ordem de grandeza praticada no mercado brasileiro, e não uma tabela oficial.',
  },
} as const;

/** FAQ da página — alimenta o acordeão e o JSON-LD `FAQPage`. */
export const FAQ_BONUS: { q: string; a: string }[] = [
  {
    q: 'O bônus é do carro ou da pessoa?',
    a: 'Da pessoa. A classe de bônus fica vinculada ao segurado e ao condutor principal declarado, não ao veículo. Ao trocar de carro, o histórico acompanha você; ao trocar de seguradora, a nova consulta esse histórico antes de emitir a apólice.',
  },
  {
    q: 'Se eu acionar o seguro, perco o bônus sempre?',
    a: 'Perde quando há indenização paga pela seguradora — colisão, roubo, furto, perda total. Serviços de assistência 24 horas, como reboque, chaveiro e troca de pneu, em regra não contam como sinistro e não mexem na classe. Na dúvida, confirme com a seguradora antes de acionar.',
  },
  {
    q: 'Quantos dias eu tenho para renovar sem perder classe?',
    a: 'Trinta dias corridos contados do vencimento da apólice anterior. A partir do 31º dia começa a contar o primeiro bloco de atraso, que derruba uma classe; cada novo bloco de 30 dias derruba mais uma, até zerar acima de 330 dias.',
  },
  {
    q: 'Mudar de seguradora faz perder o bônus?',
    a: 'Não. A classe é transferida entre seguradoras mediante a apresentação da apólice anterior ou da consulta ao histórico. O que faz perder é o intervalo sem cobertura entre uma apólice e outra, não a troca em si.',
  },
  {
    q: 'O resultado da calculadora vale como proposta?',
    a: 'Não. É uma estimativa baseada na regra mais usada no mercado brasileiro. Cada seguradora tem sua própria política de bônus e de aceitação, e a classe definitiva é a que constar na apólice emitida. Nenhum desconto é prometido aqui.',
  },
];
