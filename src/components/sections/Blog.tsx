import Image from 'next/image';
import Link from 'next/link';
import { type Post } from '@/config/content';
import { fetchPosts } from '@/services/content';
import { formatDatePtBr } from '@/lib/utils';
import Icon from '@/components/icons';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal, { RevealItem } from '@/components/ui/Reveal';

/**
 * =============================================================================
 * ARTIGOS DA FIXSEG
 * =============================================================================
 * Server Component. Mostra os artigos PRÓPRIOS da corretora (`posts` em
 * src/config/content.ts, lidos por src/services/content.ts). Com a lista vazia
 * — que é o estado de uma publicação nova — a seção NÃO É RENDERIZADA: nada de
 * "em breve" nem de grade com três retângulos vazios.
 *
 * -----------------------------------------------------------------------------
 * O QUE SAIU DAQUI
 * -----------------------------------------------------------------------------
 * Esta seção também exibia NOTÍCIAS lidas do feed de um portal de seguros
 * (CQCS), com resumo, foto e link para o texto original. Foi removida a pedido
 * do cliente, por três motivos que vale registrar antes que alguém pense em
 * reintroduzir:
 *
 *  1. cada cartão era um link de SAÍDA do site;
 *  2. o conteúdo dependia de um servidor de terceiro, que podia mudar de
 *     estrutura, sair do ar ou recusar as requisições — e recusava;
 *  3. a seleção do assunto era feita por filtro de palavras, o que sempre deixa
 *     passar (ou barra) alguma coisa.
 *
 * O lugar daquela seção na home é hoje da `Curiosities`, com conteúdo escrito
 * pela corretora e sem link externo. `src/config/news.ts` e
 * `src/services/news.ts` foram apagados; o histórico do git guarda o
 * adaptador, o parser de RSS e o filtro, caso um dia façam falta.
 * =============================================================================
 */

/** Classes do cartão. */
const CARTAO =
  'group/post surface relative flex h-full flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-500 ease-brand ' +
  'hover:-translate-y-1.5 hover:border-brand-2/35 hover:shadow-glow focus-visible:-translate-y-1.5 focus-visible:border-brand-2/35 ' +
  'active:translate-y-0 active:scale-[.99] active:duration-[90ms]';

/**
 * A capa do artigo. Sem imagem entra um bloco tipográfico com a malha técnica
 * da marca — é estado normal, não estado de falta.
 */
function Capa({ src, tipografico }: { src?: string | null; tipografico: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-panel-2">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-brand group-hover/post:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-tech-grid px-6">
          <span
            aria-hidden="true"
            className="glow-a pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full opacity-70 blur-[54px]"
          />
          <span aria-hidden="true" className="relative flex flex-col items-center gap-2.5 text-center">
            <span className="h-px w-8 bg-brand-gradient opacity-70" />
            <span className="font-display text-[.8125rem] font-semibold uppercase leading-tight tracking-[0.22em] text-fg-2">
              {tipografico}
            </span>
          </span>
        </div>
      )}
      <span aria-hidden="true" className="sheen-layer z-[2] group-hover/post:animate-sheen-pass" />
    </div>
  );
}

function CartaoDePost({ post }: { post: Post }) {
  const href = post.url ?? `/blog/${post.slug}`;
  const externo = !!post.url;
  const Wrapper = externo ? 'a' : Link;

  return (
    <Wrapper
      href={href}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={CARTAO}
    >
      <Capa src={post.cover} tipografico={post.category} />

      <div className="flex flex-1 flex-col p-6">
        <span className="text-[.8125rem] font-semibold uppercase tracking-[0.16em] text-accent-ink/80">
          {post.category}
        </span>
        <h3 className="mt-3 font-display text-[1.125rem] font-semibold leading-snug text-fg">
          {post.title}
        </h3>
        <p className="mt-2.5 flex-1 text-[.96875rem] leading-relaxed text-fg-3">{post.excerpt}</p>
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
            className="ml-auto shrink-0 text-fg-4 transition-all duration-300 ease-brand group-hover/post:translate-x-1.5 group-hover/post:text-accent-ink group-active/post:translate-x-2.5"
          />
        </div>
      </div>
    </Wrapper>
  );
}

export async function Blog() {
  const posts = await fetchPosts(3);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative scroll-mt-24 py-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Conteúdo"
          title="Escrito pela FIXSEG."
          highlight="pela FIXSEG."
          subtitle="Materiais curtos sobre risco, cobertura e prevenção — escritos para quem não trabalha com seguros."
          className="md:max-w-[38rem]"
        />

        <Reveal stagger={0.08} className="mt-14 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <RevealItem key={post.slug} anim="rise">
              <CartaoDePost post={post} />
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Blog;
