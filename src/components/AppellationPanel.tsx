'use client'

import type { Appellation, WineRegion } from '@/types'
import styles from './AppellationPanel.module.css'

interface Props {
  appellation: Appellation
  region: WineRegion
  onClose: () => void
}

const SCALE_LABELS: Record<string, string[]> = {
  body:      ['Very Light','Light','Medium','Full','Very Full'],
  tannins:   ['Silky','Soft','Medium','Firm','Grippy'],
  acidity:   ['Low','Soft','Medium','Crisp','Electric'],
  sweetness: ['Bone Dry','Dry','Off-Dry','Sweet','Luscious'],
  alcohol:   ['Low <11%','Moderate','Medium','High','Very High'],
}

function Bar({ label, value }: { label: string; value: number }) {
  const pct = ((value-1)/4)*100
  const desc = SCALE_LABELS[label.toLowerCase()]?.[value-1] ?? ''
  return (
    <div className={styles.barWrap}>
      <div className={styles.barHead}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barDesc}>{desc}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width:`${pct}%` }} />
        {[0,1,2,3,4].map(i => (
          <div key={i} className={styles.tick} style={{ left:`${i*25}%`, opacity: i < value ? 1 : 0.18 }} />
        ))}
      </div>
    </div>
  )
}

export default function AppellationPanel({ appellation: app, region, onClose }: Props) {
  const tp = app.tastingProfile
  const col = app.color ?? region.color
  return (
    <div className={styles.panel}>
      {/* Hero */}
      <div className={styles.hero} style={{ borderTop: `3px solid ${col}` }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.breadcrumb}>
          <span className={styles.country}>{region.country}</span>
          <span className={styles.sep}>›</span>
          <span className={styles.regionName}>{region.region}</span>
        </div>
        <h2 className={styles.appName}>{app.name}</h2>
        <div className={styles.typeBadge}>{app.type}</div>
        <p className={styles.styleTag}>{tp.style}</p>
      </div>

      <div className={styles.body}>
        <p className={styles.desc}>{app.description}</p>

        {/* Quick stats */}
        <div className={styles.stats}>
          {[
            { icon:'🌡️', label:'Serve', value: app.servingTemp },
            { icon:'⏳', label:'Age',   value: app.agingPotential },
            { icon:'✨', label:'Finish', value: tp.finish },
          ].map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.div} />

        {/* Tasting profile */}
        <section>
          <h3 className={styles.secTitle}>Tasting Profile</h3>
          <div className={styles.bars}>
            <Bar label="Body"      value={tp.body} />
            <Bar label="Tannins"   value={tp.tannins} />
            <Bar label="Acidity"   value={tp.acidity} />
            <Bar label="Sweetness" value={tp.sweetness} />
            <Bar label="Alcohol"   value={tp.alcohol} />
          </div>
        </section>

        <div className={styles.div} />

        {/* Notes */}
        <section>
          <h3 className={styles.secTitle}>🍇 Fruit Notes</h3>
          <div className={styles.tags}>
            {tp.fruits.map(f => <span key={f} className={`${styles.tag} ${styles.fruit}`}>{f}</span>)}
          </div>
        </section>
        <section className={styles.secGap}>
          <h3 className={styles.secTitle}>🪵 Secondary Notes</h3>
          <div className={styles.tags}>
            {tp.secondaryNotes.map(n => <span key={n} className={`${styles.tag} ${styles.secondary}`}>{n}</span>)}
          </div>
        </section>
        {tp.tertiaryNotes && tp.tertiaryNotes.length > 0 && (
          <section className={styles.secGap}>
            <h3 className={styles.secTitle}>✨ Tertiary (with age)</h3>
            <div className={styles.tags}>
              {tp.tertiaryNotes.map(n => <span key={n} className={`${styles.tag} ${styles.tertiary}`}>{n}</span>)}
            </div>
          </section>
        )}

        <div className={styles.div} />

        {/* Grapes */}
        <section>
          <h3 className={styles.secTitle}>🍇 Varieties</h3>
          <div className={styles.tags}>
            {app.grapes.map(g => <span key={g} className={`${styles.tag} ${styles.grape}`}>{g}</span>)}
          </div>
        </section>

        <div className={styles.div} />

        {/* Food */}
        <section>
          <h3 className={styles.secTitle}>🍽️ Food Pairings</h3>
          <div className={styles.tags}>
            {app.foodPairings.map(f => <span key={f} className={`${styles.tag} ${styles.food}`}>{f}</span>)}
          </div>
        </section>

        {/* Terroir */}
        {(app.climate || (app.soilTypes && app.soilTypes.length > 0)) && (<>
          <div className={styles.div} />
          <section>
            <h3 className={styles.secTitle}>🌍 Terroir</h3>
            {app.climate && <div className={styles.terroirRow}><span className={styles.tLabel}>Climate</span><span className={styles.tValue}>{app.climate}</span></div>}
            {app.soilTypes && <div className={styles.terroirRow}><span className={styles.tLabel}>Soils</span><span className={styles.tValue}>{app.soilTypes.join(' · ')}</span></div>}
          </section>
        </>)}

        {/* Vintages */}
        {app.bestVintages && app.bestVintages.length > 0 && (<>
          <div className={styles.div} />
          <section>
            <h3 className={styles.secTitle}>🏆 Great Vintages</h3>
            <div className={styles.tags}>
              {app.bestVintages.map(y => <span key={y} className={`${styles.tag} ${styles.vintage}`}>{y}</span>)}
            </div>
          </section>
        </>)}

        {/* Mythology */}
        {region.mythology && region.mythology.length > 0 && (<>
          <div className={styles.div} />
          <section>
            <h3 className={styles.secTitle}>⚡ Ancient Patrons</h3>
            {region.mythology.map(d => (
              <div key={d.name} className={styles.deity}>
                <div className={styles.deityHead}>
                  <span className={styles.deityName}>{d.name}</span>
                  <span className={styles.deityCulture}>{d.culture}</span>
                </div>
                <p className={styles.deityRole}>{d.role}</p>
                {d.note && <p className={styles.deityNote}>{d.note}</p>}
              </div>
            ))}
          </section>
        </>)}

        {/* Wineries */}
        {app.wineries && app.wineries.length > 0 && (<>
          <div className={styles.div} />
          <section>
            <h3 className={styles.secTitle}>🏰 Notable Houses</h3>
            {app.wineries.map((w,i) => (
              <div key={w.name} className={styles.winery} style={{ borderBottom: i < (app.wineries?.length??0)-1 ? '1px solid rgba(245,230,200,0.07)' : 'none' }}>
                <div className={styles.wineryIcon} style={{ background:`${col}33`, borderColor:`${col}77` }}>🏰</div>
                <div>
                  <div className={styles.wineryName}>{w.name}</div>
                  {w.founded && <div className={styles.wineryFounded}>Est. {w.founded}</div>}
                  {w.flagship && <div className={styles.wineryFlagship}>↳ {w.flagship}</div>}
                </div>
              </div>
            ))}
          </section>
        </>)}
      </div>
    </div>
  )
}
