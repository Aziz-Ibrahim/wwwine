'use client'

import { useEffect, useRef, useState } from 'react'
import AppellationGuide from '@/components/AppellationGuide'
import { intent } from '@/lib/intent'
import type { AppellationWithRegion } from '@/lib/data'
import type { Appellation, WineRegion } from '@/types'
import styles from './AppellationPanel.module.css'

interface Props {
  region: WineRegion
  onClose: () => void
}

function withRegion(app: Appellation, region: WineRegion): AppellationWithRegion {
  return {
    ...app,
    regionId: region.id,
    regionName: region.region,
    country: region.country,
    countryCode: region.countryCode,
    continent: region.continent,
    regionColor: region.color,
    regionDescription: region.description,
    regionVintage: region.vintage,
    regionMythology: region.mythology ?? [],
  }
}

function AppDetail({ app, region, onBack, onSelect }: {
  app: Appellation
  region: WineRegion
  onBack: () => void
  onSelect: (app: Appellation) => void
}) {
  const openedAt = useRef(Date.now())

  useEffect(() => {
    openedAt.current = Date.now()
    intent.viewAppellation(region.country, region.region, app.name, app.tastingProfile.style)
    return () => {
      const seconds = (Date.now() - openedAt.current) / 1000
      intent.dwellAppellation(app.name, region.country, seconds)
    }
  }, [app, region.country, region.region])

  const detail = withRegion(app, region)
  const related = region.appellations
    .filter(item => item.id !== app.id)
    .slice(0, 5)
    .map(item => withRegion(item, region))

  return (
    <AppellationGuide
      app={detail}
      related={related}
      backLabel={`Back to ${region.region}`}
      onBack={onBack}
      onSelectRelated={item => onSelect(item)}
      embedded
    />
  )
}

export default function AppellationPanel({ region, onClose }: Props) {
  const [selectedApp, setSelectedApp] = useState<Appellation | null>(null)

  useEffect(() => setSelectedApp(null), [region.id])

  if (selectedApp) {
    return <AppDetail app={selectedApp} region={region} onBack={() => setSelectedApp(null)} onSelect={setSelectedApp} />
  }

  return (
    <div className={styles.panel}>
      <div className={styles.hero} style={{ borderTop: `3px solid ${region.color}` }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.regionCountry}>{region.country}</div>
        <h2 className={styles.regionTitle}>{region.region}</h2>
        <p className={styles.regionVintage}>Winemaking since {region.vintage}</p>
        <p className={styles.regionDesc}>{region.description}</p>
        {region.productionVolume && <div className={styles.prodVol}>Production: {region.productionVolume}</div>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.secTitle}>Select an Appellation</h3>
        <p className={styles.appHint}>Click any appellation to see its full wine guide</p>
        <div className={styles.appList}>
          {region.appellations.map(app => (
            <button
              key={app.id}
              className={styles.appRow}
              onClick={() => setSelectedApp(app)}
              style={{ '--accent': app.color ?? region.color } as React.CSSProperties}
            >
              <div className={styles.appDot} style={{ background: app.color ?? region.color }} />
              <div className={styles.appRowContent}>
                <div className={styles.appRowName}>{app.name}</div>
                <div className={styles.appRowMeta}>
                  <span className={styles.appRowType}>{app.type}</span>
                  <span className={styles.appRowGrapes}>{app.grapes.slice(0, 2).join(', ')}{app.grapes.length > 2 ? '…' : ''}</span>
                </div>
                <div className={styles.appRowStyle}>{app.tastingProfile.style}</div>
              </div>
              <span className={styles.appRowArrow}>›</span>
            </button>
          ))}
        </div>

        {region.mythology && region.mythology.length > 0 && <>
          <div className={styles.div} />
          <h3 className={styles.secTitle}>⚡ Ancient Patrons of {region.region}</h3>
          {region.mythology.map(deity => (
            <div key={deity.name} className={styles.deity}>
              <div className={styles.deityHead}><span className={styles.deityName}>{deity.name}</span><span className={styles.deityCulture}>{deity.culture}</span></div>
              {deity.note && <p className={styles.deityNote}>{deity.note}</p>}
            </div>
          ))}
        </>}
      </div>
    </div>
  )
}
