'use client'

import { useState } from 'react'
import type { WineRegion, WineCountry, CompareItem, AppView } from '@/types'
import WorldMap from '@/components/WorldMap'
import AppellationPanel from '@/components/AppellationPanel'
import CompareEngine from '@/components/CompareEngine'
import Header from '@/components/Header'
import styles from './AtlasClient.module.css'

interface Props {
  regions: WineRegion[]
  countries: WineCountry[]
  allAppellations: CompareItem[]
}

export default function AtlasClient({ regions, countries, allAppellations }: Props) {
  const [view, setView] = useState<AppView>('map')
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null)

  return (
    <div className={styles.root}>
      <Header view={view} onViewChange={(v) => { setView(v) }} />

      {view === 'map' && (
        <main className={styles.main}>
          <div className={styles.mapLayout}>
            <div className={styles.mapArea}>
              <WorldMap
                regions={regions}
                countries={countries}
                selectedRegionId={selectedRegion?.id ?? null}
                onSelectRegion={setSelectedRegion}
              />
            </div>
            <div className={styles.panelArea}>
              {selectedRegion ? (
                <AppellationPanel
                  region={selectedRegion}
                  onClose={() => setSelectedRegion(null)}
                />
              ) : (
                <div className={styles.emptyPanel}>
                  <div className={styles.emptySteps}>
                    <div className={styles.step}><span className={styles.stepNum}>1</span><span className={styles.stepText}>Click a <strong>country</strong> on the map</span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>2</span><span className={styles.stepText}>Click a <strong>wine region</strong> pin</span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>3</span><span className={styles.stepText}>Select an <strong>appellation</strong> from the list</span></div>
                  </div>
                  <div className={styles.emptyDivider} />
                  <span className={styles.emptyCount}>{allAppellations.length} appellations across {countries.length} countries</span>
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
