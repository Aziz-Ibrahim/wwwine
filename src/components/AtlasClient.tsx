'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import type { WineRegion, WineCountry, CompareItem, AppView } from '@/types'
import type { SearchResult } from '@/lib/search'
import { resolveRegions } from '@/lib/search'
import { wineRegister, wineRegisterCountryCount } from '@/lib/wine-register'
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
  const router = useRouter()
  const [view,  setView]  = useState<AppView>(initialView)
  const [panel, setPanel] = useState<PanelState>({ kind: 'empty' })
  const [introVisible, setIntroVisible] = useState(initialView === 'map')
  const [introClosing, setIntroClosing] = useState(false)
  const mapLayoutRef = useRef<HTMLDivElement>(null)

  const panelOpen = panel.kind !== 'empty'
  const selectedRegionId = panel.kind === 'region' ? panel.region.id : null

  useEffect(() => {
    const mapLayout = mapLayoutRef.current
    if (!mapLayout) return

    if (introVisible) mapLayout.setAttribute('inert', '')
    else mapLayout.removeAttribute('inert')

    return () => mapLayout.removeAttribute('inert')
  }, [introVisible])

  const handleSearchResult = useCallback((result: SearchResult) => {
    if (result.href) {
      router.push(result.href as Route)
      return
    }
    setIntroVisible(false)
    setView('map')
    const resolved = resolveRegions(result)
    intent.search(result.label, result.type, resolved.length > 0)
    if (resolved.length === 1 && result.type !== 'country') {
      setPanel({ kind: 'region', region: resolved[0] })
    } else {
      setPanel({ kind: 'searchResult', result, regions: resolved })
    }
  }, [router])

  const closePanel = useCallback(() => setPanel({ kind: 'empty' }), [])

  const handleViewChange = useCallback((nextView: AppView) => {
    if (nextView !== 'map') setIntroVisible(false)
    setView(nextView)
  }, [])

  const dismissIntro = useCallback(() => setIntroClosing(true), [])

  return (
    <div className={styles.root}>
      <Header
        view={view}
        onViewChange={handleViewChange}
        onSearchResult={handleSearchResult}
      />

      {view === 'map' && (
        <main className={styles.main}>
          <div
            ref={mapLayoutRef}
            className={`${styles.mapLayout} ${panelOpen ? styles.panelOpen : styles.emptyState} ${introVisible && !introClosing ? styles.introCovered : ''}`}
            aria-hidden={introVisible}
          >

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
                  <span className={styles.emptyCount}>{wineRegister.length.toLocaleString('en')} registered designations · {wineRegisterCountryCount} countries</span>
                  <span className={styles.emptySearchHint}>Or use the 🔍 search in the top bar</span>
                </div>
              )}
            </div>
          </div>

          {introVisible && (
            <section
              className={`${styles.intro} ${introClosing ? styles.introClosing : ''}`}
              aria-labelledby="intro-title"
              onTransitionEnd={event => {
                if (introClosing && event.propertyName === 'opacity') setIntroVisible(false)
              }}
            >
              <div className={styles.introContent}>
                <span className={styles.introEyebrow}>An atlas for the curious palate</span>
                <h1 id="intro-title" className={styles.introTitle}>World Wide Wine</h1>
                <p className={styles.introCopy}>
                  Follow the map from storied wine countries to their regions,
                  appellations, grapes, and notable houses.
                </p>
                <button className={styles.introButton} type="button" onClick={dismissIntro}>
                  <span>Explore atlas</span>
                  <span className={styles.introButtonIcon} aria-hidden="true">&rarr;</span>
                </button>
                <span className={styles.introMeta}>
                  {wineRegister.length.toLocaleString('en')} registered designations / {wineRegisterCountryCount} countries
                </span>
              </div>
            </section>
          )}
        </main>
      )}

      {view === 'compare'  && <main className={styles.mainCompare}><CompareEngine wines={allAppellations} /></main>}
      {view === 'food'     && <main className={styles.mainCompare}><FoodPairing appellations={allAppellations} /></main>}
      {view === 'match'    && <main className={styles.mainCompare}><WineMatch appellations={allAppellations} /></main>}

      <Footer />
    </div>
  )
}
