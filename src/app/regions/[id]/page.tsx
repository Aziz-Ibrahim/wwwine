import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import AppellationGuide from '@/components/AppellationGuide'
import { wineRegister, getRegisteredRegionGuides, consolidatedRegions } from '@/lib/wine-register'
import styles from '@/app/appellations/appellations.module.css'

export function generateStaticParams() {
  return [...wineRegister.map(region => ({ id: region.id })), ...Object.keys(consolidatedRegions).map(id => ({ id }))]
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const region = wineRegister.find(r => r.id === params.id)
  if (!region) return {}
  return { title: `${region.name} — ${region.country} Wine Region | wwwine`, description: `Explore the wines of ${region.name}, ${region.country}, including grapes, wine styles and available tasting guides.`, alternates: { canonical: `/regions/${region.id}` } }
}

export default function RegionPage({ params }: { params: { id: string } }) {
  const region = wineRegister.find(r => r.id === params.id)
  if (consolidatedRegions[params.id]) permanentRedirect(`/regions/${consolidatedRegions[params.id]}`)
  if (!region) notFound()
  const guides = getRegisteredRegionGuides(region)
  if (!guides.length) notFound()
  return <main className={styles.page}>
    <LegalHeader />
    <AppellationGuide app={guides[0]} related={guides.slice(1)} backLabel={`Back to ${region.country} appellations`} backHref={`/appellations?country=${region.countryCode}`} regionWines={{ name: region.name, wines: guides }} />
    <Footer />
  </main>
}
