import type { Metadata, Viewport } from 'next';

/* Tipografia auto-hospedada (Fontsource).
   Sora nos títulos — geométrica, alinhada ao desenho da logo.
   Inter no texto — excelente legibilidade em telas pequenas.

   Por que auto-hospedar em vez de usar o Google Fonts:
     · nenhuma requisição a domínio de terceiro (melhor para LGPD);
     · os arquivos woff2 vêm do mesmo domínio, com cache imutável;
     · o build não depende de rede externa;
     · elimina a variação de layout causada pelo carregamento remoto.
   São fontes variáveis: um único arquivo cobre todos os pesos. */
import '@fontsource-variable/sora';
import '@fontsource-variable/inter';

import './globals.css';

import { site } from '@/config/site';
import { baseMetadata, organizationSchema, JsonLd } from '@/lib/seo';
import { THEME_DEFAULT, THEME_BAR_COLOR } from '@/config/theme';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VerseBand from '@/components/layout/VerseBand';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import PageLoader from '@/components/layout/PageLoader';
import SmoothScroll from '@/components/layout/SmoothScroll';
import Analytics from '@/components/layout/Analytics';
import AnchorScroll from '@/components/layout/AnchorScroll';

export const metadata: Metadata = baseMetadata();

export const viewport: Viewport = {
  /* A barra do navegador acompanha o tema aplicado. */
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_BAR_COLOR.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_BAR_COLOR.dark },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // nunca bloquear o zoom (acessibilidade)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* `suppressHydrationWarning` é necessário aqui: o script abaixo adiciona a
       classe `js-anim` ao <html> ANTES da hidratação (é o que evita o flash de
       conteúdo). O React então encontra um atributo que o servidor não gerou e
       avisaria "hydration mismatch" — o aviso é esperado e restrito a este
       elemento, não aos filhos. */
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Script que roda ANTES da primeira pintura. Faz três coisas:

            1. marca a página como "JS ativo" (`js-anim`) — é isso que permite
               esconder os elementos animados sem flash de conteúdo e sem deixar
               nada invisível para quem navega sem JavaScript;

            2. resolve a PREFERÊNCIA DE MOVIMENTO e grava em `data-motion`,
               considerando primeiro a escolha do visitante
               (`?motion=full|reduced|auto`) e depois a configuração do sistema;

            3. resolve o TEMA e grava em `data-theme`, considerando a escolha
               salva do visitante, depois `?tema=claro|escuro|auto`, e por fim o
               padrão do projeto (claro).

            Resolver as três coisas aqui, e não em efeitos do React, é o que
            evita o flash de tema errado no carregamento e garante que cada
            animação seja construída uma única vez com o valor correto. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{d.classList.add('js-anim');var q=null;try{q=new URLSearchParams(location.search)}catch(e){}
/* movimento */var mk='fixseg:motion',mq=q&&q.get('motion');if(mq==='full'||mq==='reduced'){try{localStorage.setItem(mk,mq)}catch(e){}}else if(mq==='auto'){try{localStorage.removeItem(mk)}catch(e){}}var mo=null;try{mo=localStorage.getItem(mk)}catch(e){}d.setAttribute('data-motion',(mo==='full'||mo==='reduced')?mo:(window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'));
/* tema */var tk='fixseg:theme',tq=q&&q.get('tema');if(tq==='claro'){try{localStorage.setItem(tk,'light')}catch(e){}}else if(tq==='escuro'){try{localStorage.setItem(tk,'dark')}catch(e){}}else if(tq==='auto'){try{localStorage.removeItem(tk)}catch(e){}}var ts=null;try{ts=localStorage.getItem(tk)}catch(e){}var dflt='${THEME_DEFAULT}';var th=(ts==='light'||ts==='dark')?ts:(dflt==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):dflt);d.setAttribute('data-theme',th)}catch(e){d.setAttribute('data-motion','full');d.setAttribute('data-theme','light')}})()`,
          }}
        />
        <link rel="icon" href="/brand/fixseg-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/apple-icon.png" />
      </head>

      <body className="antialiased">
        <JsonLd data={organizationSchema()} />

        <PageLoader />
        <Header />

        <SmoothScroll>
          <main id="conteudo">{children}</main>
          {/* Faixa de versículos: entre o fim do conteúdo e o rodapé, em todas
              as páginas. Ver src/config/verses.ts para ligar/desligar, mudar o
              intervalo ou trocar os textos. */}
          <VerseBand />
          <Footer />
        </SmoothScroll>

        <WhatsAppFloat />
        <AnchorScroll />
        <Analytics />

        {/* Aviso acessível para leitores de tela sobre o nome da corretora */}
        <span className="sr-only">{site.legalName}</span>
      </body>
    </html>
  );
}
