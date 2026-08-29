import type { Metadata } from 'next';
import { site } from '@/config/site';
import LegalPage, { type LegalSection } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a FIXSEG Corretora de Seguros coleta, usa, compartilha e protege dados pessoais, e como exercer seus direitos previstos na LGPD.',
  alternates: { canonical: '/politica-de-privacidade' },
  robots: { index: true, follow: true },
};

const controller = site.cnpj
  ? `${site.corporateName}, inscrita no CNPJ sob o nº ${site.cnpj}`
  : `${site.corporateName} (CNPJ a ser informado)`;

const dpoContact =
  site.lgpd.dpoEmail || site.contact.email || 'o canal de contato indicado no site';

const sections: LegalSection[] = [
  {
    title: 'Quem trata os seus dados',
    blocks: [
      `O controlador dos dados pessoais coletados neste site é ${controller}, atuando como corretora de seguros.`,
      `Para qualquer questão relacionada a dados pessoais — inclusive o exercício dos direitos descritos nesta política — o titular pode entrar em contato com o encarregado pelo tratamento de dados${
        site.lgpd.dpoName ? `, ${site.lgpd.dpoName},` : ''
      } por meio de ${dpoContact}.`,
    ],
  },
  {
    title: 'Quais dados coletamos',
    blocks: [
      'Coletamos apenas os dados necessários para atender à finalidade informada em cada momento da navegação:',
      [
        'Dados de identificação e contato: nome, e-mail, telefone e preferência de contato, informados por você nos formulários de cotação e de contato.',
        'Dados necessários à análise do risco: informações sobre o bem, a atividade ou a pessoa a ser segurada — por exemplo, modelo e ano de veículo, CEP do imóvel, CNPJ e atividade da empresa, valores a segurar, histórico de sinistros. A relação exata varia conforme o produto solicitado.',
        'Conteúdo das mensagens que você nos envia espontaneamente.',
        'Dados de origem da visita, quando presentes na URL (parâmetros de campanha, como utm_source e utm_campaign).',
        'Dados técnicos de navegação, quando ferramentas de medição estiverem ativas: endereço IP, tipo de dispositivo, navegador e páginas visitadas.',
      ],
      'Não solicitamos dados sensíveis por este site. Se, no curso da contratação de um seguro, a seguradora exigir informações de saúde ou outros dados sensíveis, isso será feito por canal próprio, com consentimento específico e destacado.',
      'Este site não é destinado a menores de 18 anos e não coletamos intencionalmente dados de crianças e adolescentes.',
    ],
  },
  {
    title: 'Para que usamos os dados e com qual base legal',
    blocks: [
      'Cada tratamento tem finalidade determinada e base legal própria, nos termos do art. 7º da Lei nº 13.709/2018 (LGPD):',
      [
        'Elaborar e enviar cotações de seguro e responder aos seus contatos — com base no consentimento manifestado no formulário e, quando aplicável, nos procedimentos preliminares relacionados a contrato do qual você é parte (art. 7º, I e V).',
        'Intermediar a contratação, a renovação, o endosso e o acompanhamento de sinistros das apólices — com base na execução de contrato e no exercício regular de direitos (art. 7º, V e VI).',
        'Cumprir obrigações legais e regulatórias aplicáveis à atividade de corretagem de seguros, inclusive perante a SUSEP (art. 7º, II).',
        'Enviar conteúdos informativos, avisos de vencimento e comunicações de marketing — exclusivamente com base em consentimento específico, que pode ser retirado a qualquer momento.',
        'Medir o uso do site e melhorar a experiência de navegação — com base no legítimo interesse, de forma agregada e minimizada (art. 7º, IX).',
      ],
      'Os dados não são utilizados para decisões automatizadas que produzam efeitos jurídicos sobre você. A análise de risco é feita pelas seguradoras, com participação humana da corretora na intermediação.',
    ],
  },
  {
    title: 'Com quem os dados são compartilhados',
    blocks: [
      'Para cumprir a finalidade de intermediação, compartilhamos dados estritamente necessários com:',
      [
        'Seguradoras e resseguradoras consultadas para elaborar a cotação e emitir a apólice.',
        'Prestadores de tecnologia que operam nossa infraestrutura (hospedagem, e-mail, sistema de gestão de clientes), na qualidade de operadores, vinculados contratualmente ao mesmo nível de proteção.',
        'Autoridades públicas e órgãos reguladores, quando houver requisição legal ou determinação judicial.',
      ],
      'Não vendemos dados pessoais e não os cedemos a terceiros para finalidades próprias desses terceiros.',
      'Eventuais transferências internacionais ocorrem apenas quando o prestador de tecnologia estiver sediado no exterior, observadas as salvaguardas do art. 33 da LGPD.',
    ],
  },
  {
    title: 'Por quanto tempo guardamos',
    blocks: [
      'Os dados são mantidos pelo tempo necessário à finalidade que motivou a coleta:',
      [
        'Cotações não convertidas em contratação: mantidas enquanto houver interesse legítimo no acompanhamento comercial e, no máximo, pelo prazo compatível com essa finalidade, salvo se você solicitar a exclusão antes.',
        'Dados relacionados a apólices contratadas: mantidos durante a vigência e pelos prazos prescricionais e de guarda documental aplicáveis à atividade.',
        'Dados de consentimento para marketing: mantidos até a retirada do consentimento.',
      ],
      'Encerrado o prazo e a finalidade, os dados são eliminados ou anonimizados, exceto nas hipóteses de guarda obrigatória previstas no art. 16 da LGPD.',
    ],
  },
  {
    title: 'Como protegemos as informações',
    blocks: [
      'Adotamos medidas técnicas e administrativas proporcionais ao risco, entre elas:',
      [
        'Tráfego criptografado (HTTPS) em todo o site.',
        'Envio dos formulários processado em ambiente de servidor: credenciais de sistemas e integrações não são expostas no navegador.',
        'Validação e sanitização dos dados recebidos, com limitação de requisições por origem para conter uso abusivo.',
        'Acesso às informações restrito às pessoas que precisam delas para o atendimento.',
        'Cabeçalhos de segurança configurados para reduzir risco de injeção de conteúdo e de uso indevido do site em outros domínios.',
      ],
      'Nenhum sistema é infalível. Caso ocorra incidente de segurança com risco relevante aos titulares, comunicaremos os afetados e a Autoridade Nacional de Proteção de Dados na forma do art. 48 da LGPD.',
    ],
  },
  {
    title: 'Cookies e tecnologias de medição',
    blocks: [
      'O site funciona sem cookies de rastreamento por padrão. Ferramentas de medição e de publicidade (como Google Analytics, Google Tag Manager e Meta Pixel) só são carregadas se estiverem expressamente habilitadas pela corretora.',
      'Quando habilitadas, essas ferramentas podem usar cookies e identificadores para medir audiência e desempenho de campanhas. Você pode bloquear ou apagar cookies nas configurações do seu navegador, sem prejuízo do acesso ao conteúdo do site.',
    ],
  },
  {
    title: 'Seus direitos como titular',
    blocks: [
      'A LGPD garante a você, a qualquer momento e sem custo, os seguintes direitos (art. 18):',
      [
        'Confirmação da existência de tratamento e acesso aos seus dados.',
        'Correção de dados incompletos, inexatos ou desatualizados.',
        'Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.',
        'Portabilidade a outro fornecedor, mediante requisição expressa.',
        'Eliminação dos dados tratados com base no consentimento, ressalvadas as hipóteses de guarda legal.',
        'Informação sobre as entidades com as quais compartilhamos dados.',
        'Informação sobre a possibilidade de não fornecer consentimento e as consequências dessa negativa.',
        'Revogação do consentimento a qualquer momento.',
        'Oposição a tratamento realizado com fundamento em uma das hipóteses de dispensa de consentimento, em caso de descumprimento da lei.',
      ],
      `Para exercer qualquer desses direitos, escreva para ${dpoContact}. Responderemos no menor prazo possível, podendo solicitar informações que confirmem a sua identidade — medida necessária para proteger os seus próprios dados.`,
      'Você também pode apresentar reclamação diretamente à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    title: 'Alterações desta política',
    blocks: [
      'Esta política pode ser atualizada para refletir mudanças na legislação, nas ferramentas utilizadas ou nas nossas práticas. A data da última atualização é sempre indicada no início do documento.',
      'Alterações relevantes serão comunicadas de forma destacada no site e, quando o tratamento depender de consentimento, um novo consentimento será solicitado.',
    ],
  },
];

export default function PoliticaPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      breadcrumbLabel="Política de Privacidade"
      updatedAt="a definir na publicação"
      intro={`Esta política explica de forma direta quais dados pessoais a ${site.shortName} coleta neste site, por que os coleta, com quem os compartilha, por quanto tempo os guarda e como você pode exercer os direitos assegurados pela Lei Geral de Proteção de Dados.`}
      sections={sections}
    />
  );
}
