'use client'

import { useState } from 'react'
import AppellationGuide from '@/components/AppellationGuide'
import { withAppellationRegion } from '@/lib/data'
import type { Appellation, WineRegion } from '@/types'
import styles from './AppellationPanel.module.css'

interface Props {
  region: WineRegion
  initialAppellationId?: string
  onClose: () => void
}

function AppDetail({ app, region, onBack, onSelect }: {
  app: Appellation
  region: WineRegion
  onBack: () => void
  onSelect: (app: Appellation) => void
}) {
  const detail = withAppellationRegion(app, region)
  const related = region.appellations
    .filter(item => item.id !== app.id)
    .slice(0, 5)
    .map(item => withAppellationRegion(item, region))

  return (
    <AppellationGuide
      app={detail}
      related={related}
      backLabel={`Back to ${region.region}`}
      onBack={onBack}
      onSelectRelated={onSelect}
      embedded
    />
  )
}

export default function AppellationPanel({ region, initialAppellationId, onClose }: Props) {
  const [selectedApp, setSelectedApp] = useState<Appellation | null>(() => region.appellations.find(app => app.id === initialAppellationId) ?? null)
  if (selectedApp) {
    return <AppDetail app={selectedApp} region={region} onBack={() => setSelectedApp(null)} onSelect={setSelectedApp} />
  }

  return (
    <div className={styles.panel}>
      <div className={styles.hero} style={{ borderTop: `3px solid ${region.color}` }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.regionCountry}>{region.country}</div>
        <h2 className={styles.regionTitle}>{region.region}</h2>
        {region.vintage && <p className={styles.regionVintage}>{region.vintage}</p>}
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
