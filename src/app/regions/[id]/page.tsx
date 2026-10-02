import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import { wineRegister, registerSources, getRegisteredRegionGuides } from '@/lib/wine-register'
import styles from '@/app/appellations/appellations.module.css'
import overviews from '@/data/region-overviews.json'

export function generateStaticParams() {
  return wineRegister.map(region => ({ id: region.id }))
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const region = wineRegister.find(r => r.id === params.id)
  if (!region) return {}
  return { title: `${region.name} — ${region.country} Wine Region | wwwine`, description: `Explore ${region.name}, ${region.designation} in ${region.country}, with its official registration source.`, alternates: { canonical: `/regions/${region.id}` } }
}

export default function RegionPage({ params }: { params: { id: string } }) {
  const region = wineRegister.find(r => r.id === params.id)
  if (!region) notFound()
  const source = registerSources.find(s => s.id === region.sourceId)!
  const guides = getRegisteredRegionGuides(region)
  const overview = (overviews as Record<string, { description: string; grapes: string[]; source: string }>)[region.id]
  return <main className={styles.page}>
    <LegalHeader />
    <div className={styles.wrap}>
      <Link className={styles.back} href={`/appellations?country=${region.countryCode}`}>Browse {region.country}</Link>
      <p className={styles.eyebrow}>{region.country} · {region.level}</p>
      <h1 className={styles.title}>{region.name}</h1>
      <p className={styles.intro}>{overview?.description || `${region.name} is listed as a wine ${region.designation} by ${source.name}.`}</p>
      {overview && <section className={styles.coverage} aria-label="Regional varieties">
        <h2>Key grapes</h2>
        <div className={styles.tagList}>{overview.grapes.map(grape => <span key={grape} className={styles.tag}>{grape}</span>)}</div>
        <p><a href={overview.source} target="_blank" rel="noopener noreferrer">Read more about the region ↗</a></p>
      </section>}
      <div className={styles.meta}><span className={styles.pill}>{region.designation}</span>{region.area && <span className={styles.pill}>{region.area}</span>}</div>
      <section className={styles.coverage} aria-labelledby="official-record">
        <h2 id="official-record">Official registration</h2>
        {region.aliases.length > 0 && <p>Also registered or transcribed as: {region.aliases.join('; ')}.</p>}
        {region.registeredYear && <p>GI registration year: {region.registeredYear}. This is the designation’s registration date, not the start of winemaking.</p>}
        <p><a href={region.sourceUrl} target="_blank" rel="noopener noreferrer">View the official record ↗</a></p>
        <p>Source checked {source.checkedAt}. {source.scope}</p>
      </section>
      {guides.length > 0 ? <section className={styles.coverage} aria-labelledby="wine-guides">
        <h2 id="wine-guides">Explore the wines</h2>
        {guides.map(guide => <Link key={guide.id} className={styles.appLink} href={`/appellations/${guide.id}`}>{guide.name} — tasting guide</Link>)}
      </section> : <p className={styles.intro}>A detailed tasting guide is not available yet. The official record provides information about this designation and its geographical area.</p>}
      <Link className={styles.back} href="/appellations">Browse all regions & appellations</Link>
    </div>
    <Footer />
  </main>
}
