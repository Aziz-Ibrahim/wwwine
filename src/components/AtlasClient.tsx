'use client'

import { useState, useCallback } from 'react'
import type { WineRegion, WineCountry, CompareItem, AppView } from '@/types'
import type { SearchResult } from '@/lib/search'
import { resolveRegions } from '@/lib/search'
import WorldMap from '@/components/WorldMap'
import AppellationPanel from '@/components/AppellationPanel'
import SearchResultPanel from '@/components/SearchResultPanel'
import CompareEngine from '@/components/CompareEngine'
import Header from '@/components/Header'
import styles from './AtlasClient.module.css'

// What the side panel is currently showing
type PanelState =
  | { kind: 'empty' }
  | { kind: 'region';        region: WineRegion }
  | { kind: 'searchResult';  result: SearchResult; regions: WineRegion[] }

interface Props {
  regions: WineRegion[]
  countries: WineCountry[]
  allAppellations: CompareItem[]
}

export default function AtlasClient({ regions, countries, allAppellations }: Props) {
  const [view,  setView]  = useState<AppView>('map')
  const [panel, setPanel] = useState<PanelState>({ kind: 'empty' })

  const selectedRegionId =
    panel.kind === 'region' ? panel.region.id : null

  const handleSearchResult = useCallback((result: SearchResult) => {
    // Switch to map view if we're in compare
    setView('map')
    const resolved = resolveRegions(result)
    // If the result points to exactly one region, open it directly
    if (resolved.length === 1 && result.type !== 'country') {
      setPanel({ kind: 'region', region: resolved[0] })
    } else {
      setPanel({ kind: 'searchResult', result, regions: resolved })
    }
  }, [])

  const handleSelectRegion = useCallback((region: WineRegion) => {
    setPanel({ kind: 'region', region })
  }, [])

  const closePanel = useCallback(() => {
    setPanel({ kind: 'empty' })
  }, [])

  return (
    <div className={styles.root}>
      <Header
        view={view}
        onViewChange={v => { setView(v) }}
        onSearchResult={handleSearchResult}
      />

      {view === 'map' && (
        <main className={styles.main}>
          <div className={styles.mapLayout}>
            <div className={styles.mapArea}>
              <WorldMap
                regions={regions}
                countries={countries}
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
              />
            </div>

            <div className={styles.panelArea}>
              {panel.kind === 'region' && (
                <AppellationPanel
                  region={panel.region}
                  onClose={closePanel}
                />
              )}

              {panel.kind === 'searchResult' && (
                <SearchResultPanel
                  result={panel.result}
                  regions={panel.regions}
                  onSelectRegion={r => setPanel({ kind: 'region', region: r })}
                  onClose={closePanel}
                />
              )}

              {panel.kind === 'empty' && (
                <div className={styles.emptyPanel}>
                  <div className={styles.emptySteps}>
                    <div className={styles.step}>
                      <span className={styles.stepNum}>1</span>
                      <span className={styles.stepText}>Click a <strong>country</strong> on the map</span>
                    </div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}>
                      <span className={styles.stepNum}>2</span>
                      <span className={styles.stepText}>Click a <strong>wine region</strong> pin</span>
                    </div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}>
                      <span className={styles.stepNum}>3</span>
                      <span className={styles.stepText}>Select an <strong>appellation</strong> from the list</span>
                    </div>
                  </div>
                  <div className={styles.emptyDivider} />
                  <span className={styles.emptyCount}>
                    {allAppellations.length} appellations · {countries.length} countries
                  </span>
                  <span className={styles.emptySearchHint}>
                    Or use the 🔍 search in the top bar
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === 'compare' && (
        <main className={styles.mainCompare}>
          <CompareEngine wines={allAppellations} />
        </main>
      )}
    </div>
  )
}
