import React from 'react'

import type { SearchResult } from '@/lib/search'
import type { WineRegion } from '@/types'
import styles from './SearchResultPanel.module.css'

interface Props {
  result: SearchResult
  regions: WineRegion[]
  onSelectRegion: (r: WineRegion) => void
  onClose: () => void
}

export default function SearchResultPanel({ result, regions, onSelectRegion, onClose }: Props) {

  if (regions.length > 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.hero}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div className={styles.searchTag}>Search result</div>
          <h2 className={styles.title}>
            {result.type === 'country'     && result.label}
            {result.type === 'region'      && result.label}
            {result.type === 'appellation' && result.label}
            {result.type === 'grape'       && `"${result.label}"`}
          </h2>
          <p className={styles.sub}>
            {result.type === 'country'     && `${regions.length} wine region${regions.length > 1 ? 's' : ''} in our atlas`}
            {result.type === 'region'      && regions[0]?.country}
            {result.type === 'appellation' && `Appellation found in ${regions[0]?.region}, ${regions[0]?.country}`}
            {result.type === 'grape'       && `Grape variety — found in ${regions.length} region${regions.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className={styles.body}>
          <p className={styles.instruction}>Select a region to explore its appellations:</p>
          <div className={styles.list}>
            {regions.map(r => (
              <button
                key={r.id}
                className={styles.row}
                onClick={() => { onSelectRegion(r); onClose() }}
                style={{ '--accent': r.color } as React.CSSProperties}
              >
                <span className={styles.dot} style={{ background: r.color }} />
                <span className={styles.rowContent}>
                  <span className={styles.rowName}>{r.region}</span>
                  <span className={styles.rowMeta}>
                    {r.country} · {r.appellations.length} appellation{r.appellations.length !== 1 ? 's' : ''}
                  </span>
                  {result.type === 'grape' && (
                    <span className={styles.rowGrapes}>
                      {r.appellations
                        .filter(a => a.grapes.some(g => g.toLowerCase().includes(result.query.toLowerCase())))
                        .map(a => a.name)
                        .join(', ')}
                    </span>
                  )}
                </span>
                <span className={styles.arrow}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (result.type === 'country') {
    return (
      <div className={styles.panel}>
        <div className={styles.hero}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div className={styles.searchTag}>Search result</div>
          <h2 className={styles.title}>{result.label}</h2>
        </div>
        <div className={styles.body}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🗺️</span>
            <h3 className={styles.emptyTitle}>No regions charted yet</h3>
            <p className={styles.emptyText}>
              We don't currently have wine region data for <strong>{result.label}</strong> in our atlas.
            </p>
            <p className={styles.emptyNote}>
              Our atlas is growing every day. If you'd like to see{' '}
              <strong>{result.label}</strong> added, we'd love to hear from you.
            </p>
            <div className={styles.expandingBadge}>🌱 Expanding daily</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.hero}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.searchTag}>Search result</div>
        <h2 className={styles.title}>
          {result.type === 'grape' ? `"${result.label}"` : result.label}
        </h2>
        <p className={styles.sub}>
          {result.type === 'grape' && 'Grape variety'}
          {result.type === 'appellation' && 'Appellation'}
          {result.type === 'region' && 'Wine region'}
        </p>
      </div>
      <div className={styles.body}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🍷</span>
          <h3 className={styles.emptyTitle}>Not in our atlas yet</h3>
          <p className={styles.emptyText}>
            We're expanding our data every day, but at the moment we don't have
            information about <strong>
              {result.type === 'grape' ? `${result.label} wines` : result.label}
            </strong> in our atlas.
          </p>
          {result.type === 'grape' && (
            <p className={styles.emptyHint}>
              Try searching for the region instead — for example,{' '}
              <em>Dão</em> wines are produced in the <em>Dão</em> region of Portugal.
            </p>
          )}
          <p className={styles.emptyNote}>
            Our team is continuously researching and adding wine regions, appellations
            and grape varieties from around the world. Check back soon.
          </p>
          <div className={styles.expandingBadge}>🌱 Expanding daily</div>
        </div>
      </div>
    </div>
  )
}
