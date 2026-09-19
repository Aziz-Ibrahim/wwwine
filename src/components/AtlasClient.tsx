'use client'

import { useState, useCallback } from 'react'
import type { WineRegion, WineCountry, CompareItem, AppView } from '@/types'
import type { SearchResult } from '@/lib/search'
import { resolveRegions } from '@/lib/search'
import WorldMap from '@/components/WorldMap'
import AppellationPanel from '@/components/AppellationPanel'
import SearchResultPanel from '@/components/SearchResultPanel'
import CompareEngine from '@/components/CompareEngine'
import FoodPairing from '@/components/FoodPairing'
import WineMatch from '@/components/WineMatch'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { intent } from '@/lib/intent'
import styles from './AtlasClient.module.css'

type PanelState =
  | { kind: 'empty' }
  | { kind: 'region';       region: WineRegion }
  | { kind: 'searchResult'; result: SearchResult; regions: WineRegion[] }

interface Props {
  regions: WineRegion[]
  countries: WineCountry[]
  allAppellations: CompareItem[]
  initialView?: AppView
}

export default function AtlasClient({ regions, countries, allAppellations, initialView = 'map' }: Props) {
  const [view,  setView]  = useState<AppView>(initialView)
  const [panel, setPanel] = useState<PanelState>({ kind: 'empty' })

  const panelOpen = panel.kind !== 'empty'
  const selectedRegionId = panel.kind === 'region' ? panel.region.id : null

  const handleSearchResult = useCallback((result: SearchResult) => {
    setView('map')
    const resolved = resolveRegions(result)
    intent.search(result.label, result.type, resolved.length > 0)
    if (resolved.length === 1 && result.type !== 'country') {
      setPanel({ kind: 'region', region: resolved[0] })
    } else {
      setPanel({ kind: 'searchResult', result, regions: resolved })
    }
  }, [])

  const closePanel = useCallback(() => setPanel({ kind: 'empty' }), [])

  return (
    <div className={styles.root}>
      <Header
        view={view}
        onViewChange={v => setView(v)}
        onSearchResult={handleSearchResult}
      />

      {view === 'map' && (
        <main className={styles.main}>
          <div className={`${styles.mapLayout} ${panelOpen ? styles.panelOpen : styles.emptyState}`}>

            {/* MAP — hidden when panel open */}
            <div className={styles.mapArea}>
              <WorldMap
                regions={regions}
                countries={countries}
                selectedRegionId={selectedRegionId}
                onSelectRegion={r => { setPanel({ kind: 'region', region: r }); intent.viewRegion(r.country, r.region) }}
              />
            </div>

            {/* PANEL */}
            <div className={styles.panelArea}>
              {panel.kind === 'region' && (
                <AppellationPanel region={panel.region} onClose={closePanel} />
              )}
              {panel.kind === 'searchResult' && (
                <SearchResultPanel
                  result={panel.result}
                  regions={panel.regions}
                  onSelectRegion={r => { setPanel({ kind: 'region', region: r }); intent.viewRegion(r.country, r.region) }}
                  onClose={closePanel}
                />
              )}
              {panel.kind === 'empty' && (
                <div className={styles.emptyPanel}>
                  <div className={styles.emptySteps}>
                    <div className={styles.step}><span className={styles.stepNum}>1</span><span className={styles.stepText}>Click a <strong>country</strong> on the map</span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>2</span><span className={styles.stepText}>Click a <strong>wine region</strong> pin</span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>3</span><span className={styles.stepText}>Select an <strong>appellation</strong> from the list</span></div>
                  </div>
                  <div className={styles.emptyDivider} />
                  <span className={styles.emptyCount}>{allAppellations.length} appellations · {countries.length} countries</span>
                  <span className={styles.emptySearchHint}>Or use the 🔍 search in the top bar</span>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === 'compare'  && <main className={styles.mainCompare}><CompareEngine wines={allAppellations} /></main>}
      {view === 'food'     && <main className={styles.mainCompare}><FoodPairing appellations={allAppellations} /></main>}
      {view === 'match'    && <main className={styles.mainCompare}><WineMatch appellations={allAppellations} /></main>}

      <Footer />
    </div>
  )
}
