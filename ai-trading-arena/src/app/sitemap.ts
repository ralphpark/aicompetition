import { MetadataRoute } from 'next'
import { MODEL_CHARACTERS } from '@/lib/constants/models'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-trading-arena.vercel.app'

  // Static pages
  const staticPages = [
    '',
    '/leaderboard',
    '/live',
    '/community',
    '/transparency',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'always' as const : 'hourly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Model pages
  const modelPages = MODEL_CHARACTERS.map((model) => ({
    url: `${baseUrl}/models/${model.id}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...modelPages]
}
