import { insurances } from '@/config/insurances';
import { JsonLd, faqSchema, servicesSchema } from '@/lib/seo';

import Hero from '@/components/sections/Hero';
import StoryScroll from '@/components/story/StoryScroll';
import Insurances from '@/components/sections/Insurances';
import Differentials from '@/components/sections/Differentials';
import HowItWorks from '@/components/sections/HowItWorks';
import QuoteSection from '@/components/sections/QuoteSection';
import About from '@/components/sections/About';
import Insurers from '@/components/sections/Insurers';
import Testimonials from '@/components/sections/Testimonials';
import Faq from '@/components/sections/Faq';
import Blog from '@/components/sections/Blog';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          servicesSchema(
            insurances.map((i) => ({ name: i.name, description: i.description, slug: i.slug })),
          ),
          faqSchema(),
        ]}
      />

      <Hero />
      <StoryScroll />
      <Insurances />
      <Differentials />
      <HowItWorks />
      <QuoteSection />
      <About />
      <Insurers />
      <Testimonials />
      <Faq />
      <Blog />
      <Contact />
    </>
  );
}
