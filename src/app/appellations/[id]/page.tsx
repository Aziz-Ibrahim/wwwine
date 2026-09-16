import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import { getAllAppellationDetails, getAppellationById } from '@/lib/data'
import styles from '../appellations.module.css'

type Props = { params: { id: string } }

const scaleLabels = {
  body: 'Body', tannins: 'Tannins', acidity: 'Acidity',
  sweetness: 'Sweetness', alcohol: 'Alcohol',
} as const

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
    openGraph: { title, description, type: 'article', images: [{ url: '/wwwine-logo.png' }] },
  }
}

function jsonLdFor(app: NonNullable<ReturnType<typeof getAppellationById>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${app.name} ${app.type} Wine Guide`,
    description: app.description,
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

  return (
    <main className={styles.page}>
      <LegalHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(app)) }} />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/appellations">All appellations</Link>
        <p className={styles.eyebrow}>{app.regionName} | {app.country}</p>
        <h1 className={styles.title}>{app.name} {app.type} Wine Guide</h1>
        <p className={styles.intro}>{app.tastingProfile.style}</p>
        <div className={styles.meta}>
          <span className={styles.pill}>{app.grapes.slice(0, 3).join(', ')}</span>
          <span className={styles.pill}>Serve {app.servingTemp}</span>
          <span className={styles.pill}>Age {app.agingPotential}</span>
        </div>

        <div className={styles.contentGrid}>
          <article>
            <section className={styles.section}>
              <h2>Overview</h2>
              <p className={styles.description}>{app.description}</p>
            </section>

            <section className={styles.section}>
              <h2>Tasting Profile</h2>
              <div className={styles.scaleGrid}>
                {Object.entries(scaleLabels).map(([key, label]) => {
                  const value = app.tastingProfile[key as keyof typeof scaleLabels]
                  return (
                    <div key={key} className={styles.scale}>
                      <div className={styles.scaleHead}><span>{label}</span><span>{value}/5</span></div>
                      <div className={styles.track}><div className={styles.fill} style={{ width: `${((value - 1) / 4) * 100}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Grapes</h2>
              <div className={styles.tagList}>{app.grapes.map(item => <span key={item} className={styles.tag}>{item}</span>)}</div>
            </section>

            <section className={styles.section}>
              <h2>Aromas And Notes</h2>
              <div className={styles.tagList}>
                {[...app.tastingProfile.fruits, ...app.tastingProfile.secondaryNotes, ...(app.tastingProfile.tertiaryNotes ?? [])].map(item => (
                  <span key={item} className={styles.tag}>{item}</span>
                ))}
              </div>
            </section>

            {(app.climate || app.soilTypes?.length) && (
              <section className={styles.section}>
                <h2>Terroir</h2>
                {app.climate && <p>{app.climate}</p>}
                {app.soilTypes && <div className={styles.tagList}>{app.soilTypes.map(item => <span key={item} className={styles.tag}>{item}</span>)}</div>}
              </section>
            )}

            <section className={styles.section}>
              <h2>Food Pairings</h2>
              <div className={styles.tagList}>{app.foodPairings.map(item => <span key={item} className={styles.tag}>{item}</span>)}</div>
            </section>

            {app.wineries && app.wineries.length > 0 && (
              <section className={styles.section}>
                <h2>Notable Producers</h2>
                <ul>
                  {app.wineries.map(winery => (
                    <li key={winery.name}>
                      {winery.name}{winery.founded ? `, founded ${winery.founded}` : ''}{winery.flagship ? ` — ${winery.flagship}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className={styles.side} style={{ borderTopColor: app.color ?? app.regionColor }}>
            <h2 className={styles.sideTitle}>At a Glance</h2>
            <p className={styles.sideText}>{app.regionDescription}</p>
            <div className={styles.statGrid}>
              <div className={styles.stat}><span className={styles.statLabel}>Region</span><span className={styles.statValue}>{app.regionName}</span></div>
              <div className={styles.stat}><span className={styles.statLabel}>Country</span><span className={styles.statValue}>{app.country}</span></div>
              <div className={styles.stat}><span className={styles.statLabel}>Finish</span><span className={styles.statValue}>{app.tastingProfile.finish}</span></div>
              <div className={styles.stat}><span className={styles.statLabel}>History</span><span className={styles.statValue}>{app.regionVintage}</span></div>
            </div>

            {app.bestVintages && app.bestVintages.length > 0 && (
              <section className={styles.section}>
                <h2>Great Vintages</h2>
                <div className={styles.tagList}>{app.bestVintages.map(year => <span key={year} className={styles.tag}>{year}</span>)}</div>
              </section>
            )}

            {related.length > 0 && (
              <section className={styles.section}>
                <h2>More From {app.regionName}</h2>
                <div className={styles.linkList}>
                  {related.map(item => (
                    <Link key={item.id} className={styles.appLink} href={`/appellations/${item.id}`}>
                      <span>{item.name}</span><span>{item.type}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  )
}
