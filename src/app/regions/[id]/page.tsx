import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import AppellationGuide from '@/components/AppellationGuide'
import { wineRegister, getRegisteredRegionGuides, consolidatedRegions } from '@/lib/wine-register'
import styles from '@/app/appellations/appellations.module.css'
import regionOverviews from '@/data/region-overviews.json'

export function generateStaticParams() {
  return wineRegister.map(region => ({ id: region.id }))
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const region = wineRegister.find(r => r.id === params.id)
  if (!region) return {}
  const title = `${region.name} — ${region.country} Wine Region | wwwine`
  const description = `Explore the wines of ${region.name}, ${region.country}, including grapes, wine styles and available tasting guides.`
  return { title, description, alternates: { canonical: `/regions/${region.id}` }, openGraph: { title, description, url: `/regions/${region.id}`, type: 'website', images: [{ url: '/wwwine-logo.png' }] } }
}

export default function RegionPage({ params }: { params: { id: string } }) {
  const region = wineRegister.find(r => r.id === params.id)
  if (consolidatedRegions[params.id]) permanentRedirect(`/regions/${consolidatedRegions[params.id]}`)
  if (!region) notFound()
  const guides = getRegisteredRegionGuides(region)
  if (!guides.length) notFound()
  const overview = regionOverviews[region.id as keyof typeof regionOverviews]
  return <main className={styles.page}>
    <LegalHeader />
    <section className={styles.wrap} aria-label={`${region.name} region overview`}>
      <h1 className={styles.title}>{region.name} Wine Region</h1>
      <p className={styles.intro}>{region.country} · {region.designation}{region.area ? ` · ${region.area}` : ''}</p>
      {overview && <p className={styles.intro}>{overview.description}</p>}
    </section>
    <AppellationGuide app={guides[0]} related={guides.slice(1)} headingLevel={2} backLabel={`Back to ${region.country} appellations`} backHref={`/appellations?country=${region.countryCode}`} regionWines={{ name: region.name, wines: guides }} />
    <Footer />
  </main>
}
