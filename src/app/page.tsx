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
import Blog from '@/components/sections/Blog';
import Contact from '@/components/sections/Contact';

/**
 * A home é um Server Component: é aqui que as avaliações do Google são
 * buscadas (com a chave que nunca chega ao navegador) e entregues por props ao
 * carrossel, que é de cliente. Sem as variáveis de ambiente configuradas, a
 * busca nem acontece: o resultado vem vazio e a seção não é renderizada.
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
      <Blog />
      <Contact />
    </>
  );
}
