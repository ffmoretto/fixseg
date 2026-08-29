import Image from 'next/image';
import Link from 'next/link';
import { postCategories, type Post } from '@/config/content';
import { fetchPosts } from '@/services/content';
import { formatDatePtBr } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal, { RevealItem } from '@/components/ui/Reveal';

/**
 * "Informação também é proteção."
 *
 * Server Component: o conteúdo vem de src/services/content.ts, que hoje lê o
 * arquivo de configuração e amanhã pode ler o Supabase ou um CMS sem que este
 * componente mude. Enquanto não houver artigos publicados, mostramos os temas
 * previstos em vez de artigos fictícios.
 */
export async function Blog() {
  const posts = await fetchPosts(3);
  const hasPosts = posts.length > 0;

  return (
    <section id="blog" className="relative scroll-mt-24 py-section">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Conteúdo"
            title="Informação também é proteção."
            highlight="também é proteção."
            subtitle="Materiais curtos sobre risco, cobertura e prevenção — escritos para quem não trabalha com seguros."
            className="md:max-w-[38rem]"
          />
        </div>

        {hasPosts ? (
          <Reveal stagger={0.08} className="mt-14 grid gap-5 md:grid-cols-3">
            {posts.map((post: Post) => {
              const href = post.url ?? `/blog/${post.slug}`;
              const external = !!post.url;
              const Wrapper = external ? 'a' : Link;

              return (
                <RevealItem key={post.slug} anim="rise">
                  <Wrapper
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group/post surface flex h-full flex-col overflow-hidden transition-[transform,border-color] duration-500 ease-brand hover:-translate-y-1.5 hover:border-brand-2/35"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-panel-2">
                      {post.cover ? (
                        <Image
                          src={post.cover}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 380px"
                          loading="lazy"
                          className="object-cover transition-transform duration-700 ease-brand group-hover/post:scale-[1.06]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-tech-grid opacity-60">
                          <Icon name="spark" size={26} className="text-accent-ink/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-accent-ink/80">
                        {post.category}
                      </span>
                      <h3 className="mt-3 font-display text-[1.125rem] font-semibold leading-snug text-fg">
                        {post.title}
                      </h3>
                      <p className="mt-2.5 flex-1 text-[.96875rem] leading-relaxed text-fg-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-5 flex items-center gap-3 text-[.875rem] text-fg-4">
                        {post.date && <time dateTime={post.date}>{formatDatePtBr(post.date)}</time>}
                        {post.readingTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{post.readingTime}</span>
                          </>
                        )}
                        <Icon
                          name="arrow-right"
                          size={15}
                          className="ml-auto text-fg-4 transition-all duration-300 ease-brand group-hover/post:translate-x-1 group-hover/post:text-accent-ink"
                        />
                      </div>
                    </div>
                  </Wrapper>
                </RevealItem>
              );
            })}
          </Reveal>
        ) : (
          /* estado honesto: os temas que serão publicados, sem artigos fictícios */
          <Reveal anim="up" className="mt-14">
            <div className="surface flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-11">
              <div className="max-w-[46ch]">
                <span className="eyebrow">
                  <Icon name="clock" size={13} />
                  Em preparação
                </span>
                <h3 className="mt-4 font-display text-display-sm font-semibold text-fg">
                  Nossos primeiros conteúdos estão sendo produzidos.
                </h3>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-3">
                  A estrutura do blog já está pronta e integrada — assim que os artigos forem
                  publicados, eles aparecem aqui automaticamente. Estes são os temas previstos:
                </p>
              </div>

              <ul className="flex flex-wrap gap-2 md:max-w-[22rem]">
                {postCategories.map((cat) => (
                  <li
                    key={cat}
                    className="rounded-full border border-hair bg-tint/[.035] px-3.5 py-2 text-[.9375rem] text-fg-3"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default Blog;
