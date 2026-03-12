'use client'

import { useState, useMemo } from 'react'
import type { CompareItem } from '@/types'
import { getSommelierNote } from '@/lib/data'
import styles from './CompareEngine.module.css'

interface Props { wines: CompareItem[] }

const SCALE_LABELS: Record<string, string[]> = {
  body:      ['Very Light','Light','Medium','Full','Very Full'],
  tannins:   ['Silky','Soft','Medium','Firm','Grippy'],
  acidity:   ['Low','Soft','Medium','Crisp','Electric'],
  sweetness: ['Bone Dry','Dry','Off-Dry','Sweet','Luscious'],
  alcohol:   ['Low <11%','Moderate','Medium','High','Very High'],
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = ((value-1)/4)*100
  const desc = SCALE_LABELS[label.toLowerCase()]?.[value-1] ?? ''
  return (
    <div className={styles.barWrap}>
      <div className={styles.barHead}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barDesc}>{desc}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}88,${color})` }} />
      </div>
    </div>
  )
}

function groupByCountry(wines: CompareItem[]) {
  const map = new Map<string, CompareItem[]>()
  for (const w of wines) {
    if (!map.has(w.country)) map.set(w.country, [])
    map.get(w.country)!.push(w)
  }
  return map
}

export default function CompareEngine({ wines }: Props) {
  const [wineA, setWineA] = useState<CompareItem>(wines[0])
  const [wineB, setWineB] = useState<CompareItem>(wines[Math.min(3, wines.length-1)])

  const grouped = useMemo(() => groupByCountry(wines), [wines])
  const note = wineA.id !== wineB.id ? getSommelierNote(wineA, wineB) : null

  const Selector = ({ label, value, onChange }: { label: string; value: CompareItem; onChange: (w: CompareItem) => void }) => (
    <div className={styles.selectorWrap}>
      <div className={styles.selectorLabel}>{label}</div>
      <select className={styles.select} value={value.id} onChange={e => { const found = wines.find(w=>w.id===e.target.value); if(found) onChange(found) }}>
        {Array.from(grouped.entries()).map(([country, items]) => (
          <optgroup key={country} label={`── ${country} ──`}>
            {items.map(w => (
              <option key={w.id} value={w.id}>{w.label} — {w.regionName}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Comparison Engine</h1>
          <p className={styles.pageSubtitle}>Lay appellations side by side. Understand the world in a glass.</p>
          <div className={styles.goldLine} />
        </div>

        <div className={styles.selectors}>
          <Selector label="Appellation A" value={wineA} onChange={setWineA} />
          <div className={styles.vs}>vs</div>
          <Selector label="Appellation B" value={wineB} onChange={setWineB} />
        </div>

        <div className={styles.cards}>
          <WineCard wine={wineA} />
          <WineCard wine={wineB} />
        </div>

        {note && (
          <div className={styles.sommelierBlock}>
            <div className={styles.sommelierTitle}>✦ Sommelier's Note</div>
            <p className={styles.sommelierText}>{note}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function WineCard({ wine }: { wine: CompareItem }) {
  const tp = wine.tastingProfile
  return (
    <div className={styles.card} style={{ borderTop:`3px solid ${wine.color}` }}>
      <div className={styles.cardDot} style={{ background:wine.color }} />
      <div className={styles.cardLabel}>{wine.label}</div>
      <div className={styles.cardMeta}>{wine.regionName} · {wine.country}</div>
      <div className={styles.cardGrapes}>{wine.grapes.join(', ')}</div>
      <div className={styles.styleQuote}>{tp.style}</div>

      <div className={styles.div} />

      <div className={styles.bars}>
        <Bar label="Body"      value={tp.body}      color={wine.color} />
        <Bar label="Tannins"   value={tp.tannins}   color={wine.color} />
        <Bar label="Acidity"   value={tp.acidity}   color={wine.color} />
        <Bar label="Sweetness" value={tp.sweetness} color={wine.color} />
        <Bar label="Alcohol"   value={tp.alcohol}   color={wine.color} />
      </div>

      <div className={styles.div} />

      <div className={styles.notesSection}>
        <div className={styles.notesTitle}>Fruit Notes</div>
        <div className={styles.noteTags}>
          {tp.fruits.map(f => <span key={f} className={`${styles.noteTag} ${styles.fruitTag}`}>{f}</span>)}
        </div>
      </div>
      <div className={styles.notesSection}>
        <div className={styles.notesTitle}>Secondary Notes</div>
        <div className={styles.noteTags}>
          {tp.secondaryNotes.map(n => <span key={n} className={`${styles.noteTag} ${styles.secTag}`}>{n}</span>)}
        </div>
      </div>
      {tp.tertiaryNotes && tp.tertiaryNotes.length > 0 && (
        <div className={styles.notesSection}>
          <div className={styles.notesTitle}>Tertiary (age)</div>
          <div className={styles.noteTags}>
            {tp.tertiaryNotes.map(n => <span key={n} className={`${styles.noteTag} ${styles.tertTag}`}>{n}</span>)}
          </div>
        </div>
      )}

      <div className={styles.div} />

      {[
        { label:'Serve at',    v: wine.servingTemp },
        { label:'Ageing',      v: wine.agingPotential },
        { label:'Finish',      v: tp.finish },
      ].map(r => (
        <div key={r.label} className={styles.attrRow}>
          <span className={styles.attrLabel}>{r.label}</span>
          <span className={styles.attrValue}>{r.v}</span>
        </div>
      ))}

      <div className={styles.div} />

      <div className={styles.notesTitle}>Food Pairings</div>
      <div className={styles.noteTags} style={{marginTop:8}}>
        {wine.foodPairings.map(f => <span key={f} className={`${styles.noteTag} ${styles.foodTag}`}>{f}</span>)}
      </div>
    </div>
  )
}
