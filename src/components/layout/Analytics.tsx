'use client';

import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics';

/**
 * Scripts de medição.
 *
 * Nada é carregado enquanto as variáveis de ambiente não estiverem
 * preenchidas — o site não faz requisição alguma a terceiros por padrão,
 * o que mantém a performance alta e evita rastreamento sem necessidade.
 *
 * Estratégia `afterInteractive`: os scripts entram depois que a página já
 * está utilizável, sem competir com o conteúdo pelo carregamento inicial.
 *
 * Observação sobre LGPD: se a corretora optar por exigir consentimento
 * prévio para cookies de marketing, condicione a renderização deste
 * componente à aceitação do banner (o gancho está preparado: basta
 * envolver o retorno em uma verificação de estado do consentimento).
 */
export function Analytics() {
  const { ga, gtm, metaPixel } = analyticsConfig;

  if (!ga && !gtm && !metaPixel) return null;

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}

export default Analytics;
