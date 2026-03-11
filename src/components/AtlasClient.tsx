'use client'

import { useState } from 'react'
import type { WineRegion, WineCountry, Appellation, CompareItem, AppView } from '@/types'
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
  const [selectedApp, setSelectedApp] = useState<Appellation | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null)

  const handleSelectApp = (app: Appellation, region: WineRegion) => {
    setSelectedApp(app)
    setSelectedRegion(region)
  }

  return (
    <div className={styles.root}>
      <Header view={view} onViewChange={setView} />

      {view === 'map' && (
        <main className={styles.main}>
          <div className={styles.mapLayout}>
            <div className={styles.mapArea}>
              <WorldMap
                regions={regions}
                countries={countries}
                selectedAppellation={selectedApp}
                onSelectAppellation={handleSelectApp}
              />
            </div>
            <div className={styles.panelArea}>
              {selectedApp && selectedRegion ? (
                <AppellationPanel
                  appellation={selectedApp}
                  region={selectedRegion}
                  onClose={() => { setSelectedApp(null); setSelectedRegion(null) }}
                />
              ) : (
                <div className={styles.emptyPanel}>
                  <div className={styles.emptySteps}>
                    <div className={styles.step}><span className={styles.stepNum}>1</span><span className={styles.stepText}>Click a <strong>country</strong> on the map</span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>2</span><span className={styles.stepText}>Select a <strong>wine region</strong></span></div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.step}><span className={styles.stepNum}>3</span><span className={styles.stepText}>Click an <strong>appellation</strong> for full tasting profile</span></div>
                  </div>
                  <div className={styles.emptyDivider} />
                  <span className={styles.emptyCount}>{allAppellations.length} appellations charted</span>
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
