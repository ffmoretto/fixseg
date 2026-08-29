import type { Metadata } from 'next';
import DiagnosticoClient from './DiagnosticoClient';

export const metadata: Metadata = {
  title: 'Diagnóstico de animações',
  description: 'Página interna de verificação do ambiente de animação.',
  robots: { index: false, follow: false },
};

/**
 * Página interna de diagnóstico — não aparece em nenhum menu e não é indexada.
 *
 * Serve para responder, em segundos, à pergunta "por que as animações não estão
 * funcionando aqui?". Ela mostra o que o navegador está reportando de fato:
 * preferência de movimento, largura da janela, se a rolagem suavizada assumiu,
 * quantos gatilhos de scroll estão registrados e quais plugins do GSAP
 * carregaram.
 *
 * Acesse em /diagnostico.
 */
export default function DiagnosticoPage() {
  return <DiagnosticoClient />;
}
