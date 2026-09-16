import type { MetadataRoute } from 'next'
import { getAllAppellationDetails } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wwwine.co.uk'

  const appellationRoutes = getAllAppellationDetails().map(app => ({
    url: `${baseUrl}/appellations/${app.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl,                         lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${baseUrl}/appellations`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/privacy`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,              lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    ...appellationRoutes,
  ]
}
