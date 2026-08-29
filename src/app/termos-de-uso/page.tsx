import type { Metadata } from 'next';
import { site } from '@/config/site';
import LegalPage, { type LegalSection } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Condições de uso do site da FIXSEG Corretora de Seguros: natureza das informações publicadas, responsabilidades, propriedade intelectual e canais de contato.',
  alternates: { canonical: '/termos-de-uso' },
};

const identification = site.cnpj
  ? `${site.corporateName}, CNPJ nº ${site.cnpj}`
  : `${site.corporateName} (CNPJ a ser informado)`;

const sections: LegalSection[] = [
  {
    title: 'Objeto e aceitação',
    blocks: [
      `Este documento estabelece as condições de uso do site institucional de ${identification}, corretora de seguros. Ao navegar, preencher formulários ou utilizar qualquer funcionalidade, você declara ter lido e aceito estes termos.`,
      'Caso não concorde com alguma condição aqui prevista, recomendamos não utilizar o site e procurar atendimento pelos canais diretos da corretora.',
    ],
  },
  {
    title: 'Natureza do serviço',
    blocks: [
      'A corretora atua como intermediária entre o cliente e as seguradoras, nos termos da legislação aplicável à atividade de corretagem de seguros. Não somos seguradora e não assumimos risco: quem emite a apólice, define coberturas, aceita o risco e paga a indenização é a seguradora escolhida.',
      'As informações publicadas neste site têm caráter informativo e comercial. Elas descrevem coberturas que usualmente compõem cada tipo de seguro, mas não substituem as condições gerais, particulares e especiais da apólice.',
      'Em caso de divergência entre o que consta neste site e o que consta na apólice emitida, prevalece sempre o texto da apólice.',
    ],
  },
  {
    title: 'Cotações e propostas',
    blocks: [
      'O preenchimento do formulário de cotação constitui apenas uma solicitação de orçamento. Não gera:',
      [
        'contratação de seguro;',
        'cobertura provisória de qualquer natureza;',
        'obrigação da corretora ou de qualquer seguradora de aceitar o risco;',
        'garantia de preço, prazo ou condição.',
      ],
      'A cobertura só existe após a aceitação do risco pela seguradora e a emissão da apólice, observadas as condições de pagamento do prêmio.',
      'Os valores eventualmente apresentados em propostas são estimativas sujeitas a confirmação, análise de risco, vistoria e às regras de subscrição de cada seguradora.',
    ],
  },
  {
    title: 'Responsabilidade pelas informações fornecidas',
    blocks: [
      'As informações prestadas nos formulários são de responsabilidade de quem as fornece. Declarações inexatas, incompletas ou omissas podem, conforme a legislação e as condições contratuais, resultar em recusa da proposta, alteração do prêmio ou perda do direito à indenização.',
      'Você se compromete a informar dados verdadeiros, atuais e de sua titularidade, e a não utilizar dados de terceiros sem autorização.',
    ],
  },
  {
    title: 'Uso permitido do site',
    blocks: [
      'É vedado, entre outras condutas ilícitas ou abusivas:',
      [
        'tentar obter acesso não autorizado a sistemas, contas ou áreas restritas;',
        'utilizar mecanismos automatizados para envio massivo de formulários, extração de conteúdo ou sobrecarga da infraestrutura;',
        'inserir conteúdo ofensivo, ilícito, difamatório ou que viole direito de terceiro nos campos de texto;',
        'reproduzir, distribuir ou explorar comercialmente o conteúdo do site sem autorização escrita.',
      ],
      'A corretora poderá adotar medidas técnicas de contenção, inclusive limitação de requisições e bloqueio de origem, para preservar o funcionamento do site.',
    ],
  },
  {
    title: 'Disponibilidade e alterações',
    blocks: [
      'Buscamos manter o site disponível e atualizado, mas não garantimos funcionamento ininterrupto ou livre de falhas. Interrupções podem ocorrer por manutenção, atualização, indisponibilidade de terceiros ou eventos alheios ao nosso controle.',
      'Conteúdos, produtos exibidos e funcionalidades podem ser alterados ou descontinuados a qualquer momento, sem aviso prévio.',
    ],
  },
  {
    title: 'Propriedade intelectual',
    blocks: [
      `A marca ${site.shortName}, o logotipo, a identidade visual, os textos, ilustrações, ícones e o código-fonte deste site são protegidos pela legislação de propriedade intelectual e não podem ser utilizados sem autorização expressa.`,
      'Marcas e logotipos de seguradoras eventualmente exibidos pertencem aos seus respectivos titulares e são utilizados apenas para identificar parcerias comerciais existentes, mediante autorização.',
    ],
  },
  {
    title: 'Links para sites de terceiros',
    blocks: [
      'O site pode conter links para páginas de seguradoras, aplicativos de mensagem e redes sociais. Esses ambientes possuem políticas e termos próprios, pelos quais não respondemos.',
      'Ao clicar em um link externo, você passa a se relacionar diretamente com o terceiro responsável por aquele ambiente.',
    ],
  },
  {
    title: 'Proteção de dados',
    blocks: [
      'O tratamento de dados pessoais realizado por meio deste site é descrito na Política de Privacidade, que integra estes Termos de Uso para todos os efeitos.',
    ],
  },
  {
    title: 'Legislação e foro',
    blocks: [
      'Estes termos são regidos pela legislação brasileira, em especial o Código Civil, o Código de Defesa do Consumidor, o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
      'Fica eleito o foro do domicílio do consumidor para dirimir controvérsias decorrentes destes termos, quando aplicável a legislação consumerista; nas demais hipóteses, o foro da sede da corretora.',
    ],
  },
  {
    title: 'Contato',
    blocks: [
      site.contact.email
        ? `Dúvidas sobre estes termos podem ser enviadas para ${site.contact.email}.`
        : 'Dúvidas sobre estes termos podem ser enviadas pelos canais de contato indicados no site.',
    ],
  },
];

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      breadcrumbLabel="Termos de Uso"
      updatedAt="a definir na publicação"
      intro={`Estas são as condições que regem o uso deste site. Elas explicam o que a ${site.shortName} faz como corretora, o que uma cotação significa juridicamente e quais são as responsabilidades de cada lado.`}
      sections={sections}
    />
  );
}
