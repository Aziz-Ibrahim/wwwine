'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'
import type { AppellationWithRegion } from '@/lib/data'
import styles from '@/app/appellations/appellations.module.css'

interface Props {
  app: AppellationWithRegion
  related: AppellationWithRegion[]
  backLabel: string
  backHref?: Route
  onBack?: () => void
  onSelectRelated?: (app: AppellationWithRegion) => void
  embedded?: boolean
}

const scaleLabels = {
  body: 'Body', tannins: 'Tannins', acidity: 'Acidity',
  sweetness: 'Sweetness', alcohol: 'Alcohol',
} as const

const scaleDescriptors = {
  body: ['Very Light', 'Light', 'Medium', 'Full', 'Very Full'],
  tannins: ['Silky', 'Soft', 'Medium', 'Firm', 'Grippy'],
  acidity: ['Low', 'Soft', 'Medium', 'Crisp', 'Electric'],
  sweetness: ['Bone Dry', 'Dry', 'Off-Dry', 'Sweet', 'Luscious'],
  alcohol: ['Low <11%', 'Moderate', 'Medium', 'High', 'Very High'],
} as const

const appearanceByImage: Record<string, string> = {
  'lemon-green.png': 'Pale lemon-green',
  'lemon.png': 'Medium lemon',
  'gold.png': 'Deep gold',
  'amber.png': 'Deep amber',
  'copper-orange.png': 'Medium copper-orange',
  'pale-pink.png': 'Pale pink',
  'salmon.png': 'Medium salmon',
  'deep-pink.png': 'Deep pink',
  'purple.png': 'Deep purple',
  'ruby.png': 'Medium ruby',
  'garnet.png': 'Medium garnet',
  'tawny.png': 'Deep tawny',
  'sparkling-lemon-green.png': 'Pale lemon-green with fine bubbles',
  'sparkling-lemon.png': 'Medium lemon with fine bubbles',
  'sparkling-gold.png': 'Deep gold with fine bubbles',
  'sparkling-pale-pink.png': 'Pale pink with fine bubbles',
}

function getAppearance(image: string) {
  return appearanceByImage[image.split('/').pop() ?? ''] ?? 'Typical wine colour'
}

function listNotes(notes: string[]) {
  if (notes.length < 2) return notes[0] ?? ''
  return `${notes.slice(0, -1).join(', ')} and ${notes.at(-1)}`
}

export default function AppellationGuide({
  app, related, backLabel, backHref, onBack, onSelectRelated, embedded = false,
}: Props) {
  const appearance = getAppearance(app.image)
  const noseNotes = [...app.tastingProfile.fruits.slice(0, 3), ...app.tastingProfile.secondaryNotes.slice(0, 2)]
  const palate = [
    `${scaleDescriptors.body[app.tastingProfile.body - 1].toLowerCase()}-bodied`,
    `${scaleDescriptors.acidity[app.tastingProfile.acidity - 1].toLowerCase()} acidity`,
    app.tastingProfile.tannins > 1 ? `${scaleDescriptors.tannins[app.tastingProfile.tannins - 1].toLowerCase()} tannins` : null,
    app.tastingProfile.sweetness > 2 ? scaleDescriptors.sweetness[app.tastingProfile.sweetness - 1].toLowerCase() : 'dry',
    `with a ${app.tastingProfile.finish} finish`,
  ].filter(Boolean).join(', ')

  const back = onBack ? (
    <button type="button" className={`${styles.back} ${styles.backButton}`} onClick={onBack}>{backLabel}</button>
  ) : (
    <Link className={styles.back} href={backHref ?? '/appellations'}>{backLabel}</Link>
  )

  return (
    <div className={`${styles.wrap} ${embedded ? styles.embedded : ''}`}>
      {back}
      <div className={styles.guideHero}>
        <div className={styles.guideHeroCopy}>
          <p className={styles.eyebrow}>{app.regionName} | {app.country}</p>
          <h1 className={styles.title}>{app.name} {app.type} Wine Guide</h1>
          <p className={styles.intro}>{app.tastingProfile.style}</p>
          <div className={styles.meta}>
            <span className={styles.pill}>{app.grapes.slice(0, 3).join(', ')}</span>
            <span className={styles.pill}>Serve {app.servingTemp}</span>
            <span className={styles.pill}>Age {app.agingPotential}</span>
          </div>
        </div>
        <figure className={styles.wineImageWrap}>
          <div className={styles.wineImageCanvas}>
            <Image
              className={styles.wineImage}
              src={app.image}
              alt={`${app.name} wine colour in the glass`}
              fill
              sizes={embedded ? '(max-width: 640px) 100vw, 240px' : '(max-width: 640px) 100vw, 320px'}
              priority={!embedded}
            />
          </div>
          <figcaption className={styles.wineImageCaption}>
            <span>Typical colour</span>
            <strong>{appearance}</strong>
          </figcaption>
        </figure>
      </div>

      <aside className={`${styles.affiliateSlot} ${styles.affiliateSlotWide}`} aria-label="Affiliate banner">
        <span className={styles.affiliateLabel}>Affiliate banner</span>
        <div className={styles.affiliateCanvas} data-affiliate-slot="appellation-detail-top" />
      </aside>

      <div className={styles.contentGrid}>
        <article>
          <section className={styles.section}>
            <h2>Overview</h2>
            <p className={styles.description}>{app.description}</p>
          </section>

          <section className={styles.section}>
            <h2>In The Glass</h2>
            <dl className={styles.sensoryNotes}>
              <div className={styles.sensoryNote}>
                <dt>Colour</dt>
                <dd>{appearance}</dd>
              </div>
              <div className={styles.sensoryNote}>
                <dt>Nose</dt>
                <dd>{listNotes(noseNotes)}.</dd>
              </div>
              <div className={styles.sensoryNote}>
                <dt>Palate</dt>
                <dd>{app.tastingProfile.style}. Generally {palate}.</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section}>
            <h2>Tasting Profile</h2>
            <div className={styles.scaleGrid}>
              {Object.entries(scaleLabels).map(([key, label]) => {
                const value = app.tastingProfile[key as keyof typeof scaleLabels]
                return (
                  <div key={key} className={styles.scale}>
                    <div className={styles.scaleHead}>
                      <span>{label} <span className={styles.scaleDescriptor}>{scaleDescriptors[key as keyof typeof scaleDescriptors][value - 1]}</span></span>
                      <span>{value}/5</span>
                    </div>
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
              <ul>{app.wineries.map(winery => (
                <li key={winery.name}>{winery.name}{winery.founded ? `, founded ${winery.founded}` : ''}{winery.flagship ? ` - ${winery.flagship}` : ''}</li>
              ))}</ul>
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

          <aside className={styles.affiliateSlot} aria-label="Affiliate banner">
            <span className={styles.affiliateLabel}>Affiliate banner</span>
            <div className={styles.affiliateCanvas} data-affiliate-slot="appellation-detail-sidebar" />
          </aside>

          {app.bestVintages && app.bestVintages.length > 0 && (
            <section className={styles.section}>
              <h2>Great Vintages</h2>
              <div className={styles.tagList}>{app.bestVintages.map(year => <span key={year} className={styles.tag}>{year}</span>)}</div>
            </section>
          )}

          {app.regionMythology.length > 0 && (
            <section className={styles.section}>
              <h2>Ancient Patrons</h2>
              <div className={styles.patronList}>
                {app.regionMythology.map(deity => (
                  <div key={`${deity.culture}-${deity.name}`} className={styles.patron}>
                    <div className={styles.patronHead}><span>{deity.name}</span><span>{deity.culture}</span></div>
                    <p className={styles.patronRole}>{deity.role}</p>
                    {deity.note && <p className={styles.patronNote}>{deity.note}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className={styles.section}>
              <h2>More From {app.regionName}</h2>
              <div className={styles.linkList}>
                {related.map(item => onSelectRelated ? (
                  <button key={item.id} type="button" className={`${styles.appLink} ${styles.appLinkButton}`} onClick={() => onSelectRelated(item)}>
                    <span>{item.name}</span><span>{item.type}</span>
                  </button>
                ) : (
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
  )
}
