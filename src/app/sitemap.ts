import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { insurances } from '@/config/insurances';
import { posts } from '@/config/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/cotacao`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/seguros`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/sobre`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    {
      url: `${site.url}/duvidas-frequentes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${site.url}/calculadora-bonus`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${site.url}/politica-de-privacidade`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    { url: `${site.url}/termos-de-uso`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const insuranceRoutes: MetadataRoute.Sitemap = insurances.map((i) => ({
    url: `${site.url}/seguros/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  /* posts só entram no sitemap quando publicados de fato */
  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => p.date && !p.url)
    .map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.date as string),
      changeFrequency: 'yearly',
      priority: 0.6,
    }));

  return [...staticRoutes, ...insuranceRoutes, ...postRoutes];
}
