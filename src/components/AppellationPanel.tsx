'use client'

import { useState } from 'react'
import type { Appellation, WineRegion } from '@/types'
import styles from './AppellationPanel.module.css'

interface Props {
  region: WineRegion
  onClose: () => void
}

const SCALE_LABELS: Record<string, string[]> = {
  body:      ['Very Light', 'Light', 'Medium', 'Full', 'Very Full'],
  tannins:   ['Silky', 'Soft', 'Medium', 'Firm', 'Grippy'],
  acidity:   ['Low', 'Soft', 'Medium', 'Crisp', 'Electric'],
  sweetness: ['Bone Dry', 'Dry', 'Off-Dry', 'Sweet', 'Luscious'],
  alcohol:   ['Low <11%', 'Moderate', 'Medium', 'High', 'Very High'],
}

function Bar({ label, value }: { label: string; value: number }) {
  const pct = ((value - 1) / 4) * 100
  const desc = SCALE_LABELS[label.toLowerCase()]?.[value - 1] ?? ''
  return (
    <div className={styles.barWrap}>
      <div className={styles.barHead}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barDesc}>{desc}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AppDetail({ app, region, onBack }: { app: Appellation; region: WineRegion; onBack: () => void }) {
  const tp = app.tastingProfile
  const col = app.color ?? region.color
  return (
    <div className={styles.panel}>
      <div className={styles.hero} style={{ borderTop: `3px solid ${col}` }}>
        <button className={styles.backAppBtn} onClick={onBack}>← {region.region}</button>
        <h2 className={styles.appName}>{app.name}</h2>
        <span className={styles.typeBadge}>{app.type}</span>
        <p className={styles.styleTag}>{tp.style}</p>
      </div>
      <div className={styles.body}>
        <p className={styles.desc}>{app.description}</p>

        <div className={styles.stats}>
          {[{ icon: '🌡️', label: 'Serve', value: app.servingTemp }, { icon: '⏳', label: 'Age', value: app.agingPotential }, { icon: '✨', label: 'Finish', value: tp.finish }].map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.div} />
        <h3 className={styles.secTitle}>Tasting Profile</h3>
        <div className={styles.bars}>
          {(['Body', 'Tannins', 'Acidity', 'Sweetness', 'Alcohol'] as const).map(k => (
            <Bar key={k} label={k} value={tp[k.toLowerCase() as keyof typeof tp] as number} />
          ))}
        </div>

        <div className={styles.div} />
        <h3 className={styles.secTitle}>🍇 Grapes</h3>
        <div className={styles.tags}>{app.grapes.map(g => <span key={g} className={`${styles.tag} ${styles.grape}`}>{g}</span>)}</div>

        <div className={styles.div} />
        <h3 className={styles.secTitle}>🍒 Fruit Notes</h3>
        <div className={styles.tags}>{tp.fruits.map(f => <span key={f} className={`${styles.tag} ${styles.fruit}`}>{f}</span>)}</div>

        {tp.secondaryNotes.length > 0 && <>
          <div className={styles.secGap} />
          <h3 className={styles.secTitle}>🪵 Secondary</h3>
          <div className={styles.tags}>{tp.secondaryNotes.map(n => <span key={n} className={`${styles.tag} ${styles.secondary}`}>{n}</span>)}</div>
        </>}

        {tp.tertiaryNotes && tp.tertiaryNotes.length > 0 && <>
          <div className={styles.secGap} />
          <h3 className={styles.secTitle}>✨ With Age</h3>
          <div className={styles.tags}>{tp.tertiaryNotes.map(n => <span key={n} className={`${styles.tag} ${styles.tertiary}`}>{n}</span>)}</div>
        </>}

        <div className={styles.div} />
        <h3 className={styles.secTitle}>🍽️ Food Pairings</h3>
        <div className={styles.tags}>{app.foodPairings.map(f => <span key={f} className={`${styles.tag} ${styles.food}`}>{f}</span>)}</div>

        {(app.climate || (app.soilTypes && app.soilTypes.length > 0)) && <>
          <div className={styles.div} />
          <h3 className={styles.secTitle}>🌍 Terroir</h3>
          {app.climate && <div className={styles.terroirRow}><span className={styles.tLabel}>Climate</span><span className={styles.tValue}>{app.climate}</span></div>}
          {app.soilTypes && <div className={styles.terroirRow}><span className={styles.tLabel}>Soils</span><span className={styles.tValue}>{app.soilTypes.join(' · ')}</span></div>}
        </>}

        {app.bestVintages && app.bestVintages.length > 0 && <>
          <div className={styles.div} />
          <h3 className={styles.secTitle}>🏆 Great Vintages</h3>
          <div className={styles.tags}>{app.bestVintages.map(y => <span key={y} className={`${styles.tag} ${styles.vintage}`}>{y}</span>)}</div>
        </>}

        {region.mythology && region.mythology.length > 0 && <>
          <div className={styles.div} />
          <h3 className={styles.secTitle}>⚡ Ancient Patrons</h3>
          {region.mythology.map(d => (
            <div key={d.name} className={styles.deity}>
              <div className={styles.deityHead}><span className={styles.deityName}>{d.name}</span><span className={styles.deityCulture}>{d.culture}</span></div>
              <p className={styles.deityRole}>{d.role}</p>
              {d.note && <p className={styles.deityNote}>{d.note}</p>}
            </div>
          ))}
        </>}

        {app.wineries && app.wineries.length > 0 && <>
          <div className={styles.div} />
          <h3 className={styles.secTitle}>🏰 Notable Houses</h3>
          {app.wineries.map((w, i) => (
            <div key={w.name} className={styles.winery} style={{ borderBottom: i < (app.wineries?.length ?? 0) - 1 ? '1px solid rgba(245,230,200,0.07)' : 'none' }}>
              <div className={styles.wineryIcon} style={{ background: `${col}33`, borderColor: `${col}77` }}>🏰</div>
              <div>
                <div className={styles.wineryName}>{w.name}</div>
                {w.founded && <div className={styles.wineryFounded}>Est. {w.founded}</div>}
                {w.flagship && <div className={styles.wineryFlagship}>↳ {w.flagship}</div>}
              </div>
            </div>
          ))}
        </>}
      </div>
    </div>
  )
}

export default function AppellationPanel({ region, onClose }: Props) {
  const [selectedApp, setSelectedApp] = useState<Appellation | null>(null)

  if (selectedApp) {
    return <AppDetail app={selectedApp} region={region} onBack={() => setSelectedApp(null)} />
  }

  return (
    <div className={styles.panel}>
      <div className={styles.hero} style={{ borderTop: `3px solid ${region.color}` }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.regionCountry}>{region.country}</div>
        <h2 className={styles.regionTitle}>{region.region}</h2>
        <p className={styles.regionVintage}>Winemaking since {region.vintage}</p>
        <p className={styles.regionDesc}>{region.description}</p>
        {region.productionVolume && (
          <div className={styles.prodVol}>Production: {region.productionVolume}</div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.secTitle}>Select an Appellation</h3>
        <p className={styles.appHint}>Click any appellation to see full tasting profile, terroir & notable houses</p>
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
          {region.mythology.map(d => (
            <div key={d.name} className={styles.deity}>
              <div className={styles.deityHead}><span className={styles.deityName}>{d.name}</span><span className={styles.deityCulture}>{d.culture}</span></div>
              {d.note && <p className={styles.deityNote}>{d.note}</p>}
            </div>
          ))}
        </>}
      </div>
    </div>
  )
}
