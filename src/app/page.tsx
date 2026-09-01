import { insurances } from '@/config/insurances';
import { JsonLd, faqSchema, servicesSchema, reviewsSchema } from '@/lib/seo';
import { fetchGoogleReviews } from '@/services/googleReviews';

import Hero from '@/components/sections/Hero';
import StoryScroll from '@/components/story/StoryScroll';
import Insurances from '@/components/sections/Insurances';
import Differentials from '@/components/sections/Differentials';
import HowItWorks from '@/components/sections/HowItWorks';
import QuoteSection from '@/components/sections/QuoteSection';
import About from '@/components/sections/About';
import Partners from '@/components/sections/Partners';
import Testimonials from '@/components/sections/Testimonials';
import Faq from '@/components/sections/Faq';
import Curiosities from '@/components/sections/Curiosities';
import Blog from '@/components/sections/Blog';
import Contact from '@/components/sections/Contact';

/**
 * A home é um Server Component: é aqui que as integrações externas acontecem,
 * com as chaves e as requisições que nunca chegam ao navegador, e o resultado
 * já normalizado é entregue por props às seções.
 *
 *  - avaliações do Google → <Testimonials> (carrossel de cliente).
 *
 * Sobrou UMA integração externa. A seção de notícias de um portal de seguros
 * (CQCS) foi retirada: o conteúdo dela dependia de um site de terceiro, exigia
 * link de saída em cada cartão e nunca pôde ser validado ao vivo (o portal
 * recusava as requisições). No lugar entrou <Curiosities>, com conteúdo próprio
 * e nenhuma requisição em tempo de execução.
 *
 * A busca das avaliações não pode derrubar a página: sem configuração, sem rede
 * ou com a fonte fora do ar, devolve lista vazia e a seção não é renderizada.
 */
export default async function HomePage() {
  const avaliacoes = await fetchGoogleReviews();
  const rating = reviewsSchema(avaliacoes);

  return (
    <>
      <JsonLd
        data={[
          servicesSchema(
            insurances.map((i) => ({ name: i.name, description: i.description, slug: i.slug })),
          ),
          faqSchema(),
          /* aggregateRating só entra com avaliação real vinda do Google */
          ...(rating ? [rating] : []),
        ]}
      />

      <Hero />
      <StoryScroll />
      <Insurances />
      <Differentials />
      <HowItWorks />
      <QuoteSection />
      <About />
      <Partners />
      <Testimonials
        avaliacoes={avaliacoes.avaliacoes}
        notaMedia={avaliacoes.notaMedia}
        totalAvaliacoes={avaliacoes.totalAvaliacoes}
        googleMapsUri={avaliacoes.googleMapsUri}
      />
      <Faq />
      <Curiosities />
      {/* Artigos próprios da FIXSEG. Sem post publicado, não é renderizada. */}
      <Blog />
      <Contact />
    </>
  );
}
