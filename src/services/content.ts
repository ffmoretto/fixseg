/**
 * =============================================================================
 * FONTE DE CONTEÚDO DO BLOG — pronta para CMS / Supabase
 * =============================================================================
 * Hoje o conteúdo vem de src/config/content.ts (arquivo estático).
 * Para trocar por Supabase ou um CMS, implemente `fetchPosts` abaixo e
 * mantenha a mesma assinatura: nenhum componente precisará mudar.
 *
 * Esquema sugerido no Supabase:
 *   create table public.posts (
 *     slug text primary key,
 *     title text not null,
 *     excerpt text,
 *     category text,
 *     cover text,
 *     reading_time text,
 *     body text,
 *     published_at timestamptz
 *   );
 *   alter table public.posts enable row level security;
 *   create policy "posts públicos" on public.posts
 *     for select using (published_at is not null);
 * =============================================================================
 */

import { posts as staticPosts, type Post } from '@/config/content';

export async function fetchPosts(limit?: number): Promise<Post[]> {
  // --- Integração futura (descomente ao configurar o Supabase) --------------
  // const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // if (url && key) {
  //   const res = await fetch(
  //     `${url}/rest/v1/posts?select=*&published_at=not.is.null&order=published_at.desc`,
  //     { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } },
  //   );
  //   if (res.ok) return (await res.json()) as Post[];
  // }

  const list = [...staticPosts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}
