import type { Metadata, Route } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import AppellationGuide from '@/components/AppellationGuide'
import { getAllAppellationDetails, getAppellationById } from '@/lib/data'
import { wineRegister, getRegisteredRegionGuides } from '@/lib/wine-register'
import styles from '../appellations.module.css'

type Props = { params: { id: string } }

export const dynamicParams = false

export function generateStaticParams() {
  return getAllAppellationDetails().map(app => ({ id: app.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const app = getAppellationById(params.id)
  if (!app) return { title: 'Appellation Not Found | wwwine' }

  const title = `${app.name} ${app.type} Wine Guide | ${app.regionName}, ${app.country} | wwwine`
  const description = `${app.name} ${app.type} in ${app.regionName}, ${app.country}: grapes, terroir, tasting profile, food pairings, serving temperature, ageing potential, vintages, and producers.`

  return {
    title, description,
    keywords: [app.name, app.type, app.regionName, app.country, ...app.grapes, 'wine appellation', 'wine guide'],
    alternates: { canonical: `/appellations/${app.id}` },
    openGraph: { title, description, type: 'article', images: [{ url: app.image }] },
  }
}

function jsonLdFor(app: NonNullable<ReturnType<typeof getAppellationById>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${app.name} ${app.type} Wine Guide`,
    description: app.description,
    image: app.image,
    about: [
      { '@type': 'Place', name: `${app.name}, ${app.regionName}, ${app.country}`,
        geo: { '@type': 'GeoCoordinates', latitude: app.coordinates.lat, longitude: app.coordinates.lng } },
      ...app.grapes.map(grape => ({ '@type': 'Thing', name: grape })),
    ],
    isPartOf: { '@type': 'WebSite', name: 'wwwine' },
  }
}

export default function AppellationPage({ params }: Props) {
  const app = getAppellationById(params.id)
  if (!app) notFound()

  const related = getAllAppellationDetails()
    .filter(item => item.regionId === app.regionId && item.id !== app.id)
    .slice(0, 5)
  const catalogueRegion = wineRegister.find(region => app.registeredRegionIds?.includes(region.id))
    || wineRegister.find(region => getRegisteredRegionGuides(region).some(wine => wine.id === app.id))

  return (
    <main className={styles.page}>
      <LegalHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(app)) }} />
      <AppellationGuide app={app} related={related} backLabel={catalogueRegion ? `Back to ${catalogueRegion.name}` : `Back to ${app.country} appellations`} backHref={(catalogueRegion ? `/regions/${catalogueRegion.id}` : `/appellations?country=${app.countryCode}`) as Route} regionWines={catalogueRegion ? { name: catalogueRegion.name, wines: getRegisteredRegionGuides(catalogueRegion) } : undefined} />
      <Footer />
    </main>
  )
}
