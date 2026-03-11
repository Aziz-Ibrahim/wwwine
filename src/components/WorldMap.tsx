'use client'

import { useState, useCallback, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import type { WineRegion, WineCountry, Appellation } from '@/types'
import styles from './WorldMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const COUNTRY_ZOOM: Record<string, { zoom: number; center: [number, number] }> = {
  FR: { zoom: 5,  center: [2.5,   46.5]  },
  IT: { zoom: 5,  center: [12.5,  42.5]  },
  ES: { zoom: 5,  center: [-3.5,  40.2]  },
  DE: { zoom: 6,  center: [10.5,  51.0]  },
  PT: { zoom: 6,  center: [-8.0,  39.5]  },
  AT: { zoom: 7,  center: [14.5,  47.5]  },
  GR: { zoom: 6,  center: [22.0,  38.5]  },
  HU: { zoom: 7,  center: [19.5,  47.2]  },
  LB: { zoom: 8,  center: [35.9,  33.8]  },
  GE: { zoom: 7,  center: [44.0,  42.0]  },
  AR: { zoom: 4,  center: [-65.0,-34.0]  },
  CL: { zoom: 4,  center: [-71.0,-34.5]  },
  ZA: { zoom: 5,  center: [25.0, -30.0]  },
  AU: { zoom: 4,  center: [136.0,-30.0]  },
  NZ: { zoom: 5,  center: [172.0,-42.0]  },
  US: { zoom: 5,  center: [-119.0, 37.0] },
}

const REGION_ZOOM: Record<string, { zoom: number; center: [number, number] }> = {
  loire:        { zoom: 7,  center: [0.7,   47.4]  },
  bordeaux:     { zoom: 8,  center: [-0.58, 44.85] },
  burgundy:     { zoom: 8,  center: [4.85,  47.05] },
  napa:         { zoom: 9,  center: [-122.3, 38.5] },
  mendoza:      { zoom: 7,  center: [-68.83,-32.89]},
  stellenbosch: { zoom: 9,  center: [18.86, -33.93]},
  bekaa:        { zoom: 9,  center: [35.9,   33.85] },
}

type Level = 'world' | 'country' | 'region'

interface Props {
  regions: WineRegion[]
  countries: WineCountry[]
  selectedAppellation: Appellation | null
  onSelectAppellation: (app: Appellation, region: WineRegion) => void
}

export default function WorldMap({ regions, countries, selectedAppellation, onSelectAppellation }: Props) {
  const [level, setLevel]                   = useState<Level>('world')
  const [activeCountry, setActiveCountry]   = useState<WineCountry | null>(null)
  const [activeRegion, setActiveRegion]     = useState<WineRegion | null>(null)
  const [zoom, setZoom]                     = useState(1)
  const [center, setCenter]                 = useState<[number, number]>([10, 15])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion]   = useState<string | null>(null)
  const [hoveredApp, setHoveredApp]         = useState<string | null>(null)

  const countryRegions = useMemo(
    () => activeCountry ? regions.filter(r => r.countryCode === activeCountry.code) : [],
    [regions, activeCountry]
  )

  const goToCountry = useCallback((country: WineCountry) => {
    setActiveCountry(country)
    setActiveRegion(null)
    setLevel('country')
    const cfg = COUNTRY_ZOOM[country.code] ?? { zoom: 5, center: [country.coordinates.lng, country.coordinates.lat] as [number,number] }
    setCenter(cfg.center); setZoom(cfg.zoom)
  }, [])

  const goToRegion = useCallback((region: WineRegion) => {
    setActiveRegion(region)
    setLevel('region')
    const cfg = REGION_ZOOM[region.id] ?? { zoom: 8, center: [region.coordinates.lng, region.coordinates.lat] as [number,number] }
    setCenter(cfg.center); setZoom(cfg.zoom)
  }, [])

  const goBack = useCallback(() => {
    if (level === 'region') {
      setLevel('country')
      setActiveRegion(null)
      if (activeCountry) {
        const cfg = COUNTRY_ZOOM[activeCountry.code] ?? { zoom: 5, center: [activeCountry.coordinates.lng, activeCountry.coordinates.lat] as [number,number] }
        setCenter(cfg.center); setZoom(cfg.zoom)
      }
    } else {
      setLevel('world'); setActiveCountry(null); setActiveRegion(null)
      setZoom(1); setCenter([10, 15])
    }
  }, [level, activeCountry])

  return (
    <div className={styles.wrapper}>
      <div className={styles.atmosphere} />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        {level !== 'world' && (
          <button className={styles.backBtn} onClick={goBack}>← Back</button>
        )}
        {level === 'world' && <span className={styles.crumbInactive}>World Atlas</span>}
        {level !== 'world' && activeCountry && (
          <><span className={styles.crumbSep}>›</span>
          <button className={styles.crumbBtn} onClick={() => { setLevel('country'); setActiveRegion(null); if(activeCountry){const c=COUNTRY_ZOOM[activeCountry.code]??{zoom:5,center:[activeCountry.coordinates.lng,activeCountry.coordinates.lat] as [number,number]};setCenter(c.center);setZoom(c.zoom)} }}>
            {activeCountry.name}
          </button></>
        )}
        {level === 'region' && activeRegion && (
          <><span className={styles.crumbSep}>›</span>
          <span className={styles.crumbActive}>{activeRegion.region}</span></>
        )}
      </div>

      {/* Hint */}
      {level === 'world'   && <div className={styles.hint}>Click a country to explore its wine regions</div>}
      {level === 'country' && <div className={styles.hint}>Click a region to see its appellations</div>}
      {level === 'region'  && <div className={styles.hint}>Click an appellation to view full tasting profile</div>}

      <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 160, center: [0, 0] }} style={{ width: '100%', height: '100%' }}>
        <ZoomableGroup zoom={zoom} center={center} minZoom={1} maxZoom={16}
          onMoveEnd={({ zoom: z, coordinates }) => { setZoom(z); setCenter(coordinates as [number,number]) }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) => geographies.map(geo => (
              <Geography key={geo.rsmKey} geography={geo} fill="#161209" stroke="#2C2415" strokeWidth={0.3}
                style={{ default:{outline:'none'}, hover:{outline:'none',fill:'#1E1810'}, pressed:{outline:'none'} }} />
            ))}
          </Geographies>

          {/* WORLD: country pins */}
          {level === 'world' && countries.map(c => {
            const h = hoveredCountry === c.code
            return (
              <Marker key={c.code} coordinates={[c.coordinates.lng, c.coordinates.lat]}
                onClick={() => goToCountry(c)}
                onMouseEnter={() => setHoveredCountry(c.code)}
                onMouseLeave={() => setHoveredCountry(null)}>
                <circle r={h?13:10} fill="transparent" stroke={c.color} strokeWidth={0.8} opacity={0.3} />
                <circle r={h?7:5.5} fill={c.color} stroke="#F5E6C8" strokeWidth={h?1.5:0.8}
                  style={{ cursor:'pointer', transition:'all 0.2s ease', filter: h?`drop-shadow(0 0 6px ${c.color}cc)`:'none' }} />
                {c.regionCount > 1 && (
                  <text textAnchor="middle" y={1} style={{ fontFamily:'Cinzel,serif', fontSize:'3.5px', fill:'#fff', fontWeight:700, pointerEvents:'none' }}>
                    {c.regionCount}
                  </text>
                )}
                {h && <>
                  <rect x={-32} y={-20} width={64} height={13} fill="rgba(8,5,2,0.95)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.5} rx={1} />
                  <text textAnchor="middle" y={-11} style={{ fontFamily:'Cinzel,serif', fontSize:'4.5px', fill:'#F5E6C8', pointerEvents:'none', letterSpacing:'0.3px' }}>
                    {c.name}
                  </text>
                </>}
              </Marker>
            )
          })}

          {/* COUNTRY: region pins */}
          {level === 'country' && countryRegions.map(r => {
            const h = hoveredRegion === r.id
            return (
              <Marker key={r.id} coordinates={[r.coordinates.lng, r.coordinates.lat]}
                onClick={() => goToRegion(r)}
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}>
                <circle r={h?10:8} fill="transparent" stroke={r.color} strokeWidth={0.8} opacity={0.35} />
                <circle r={h?6:4.5} fill={r.color} stroke="#F5E6C8" strokeWidth={h?1.2:0.7}
                  style={{ cursor:'pointer', transition:'all 0.2s ease', filter:h?`drop-shadow(0 0 5px ${r.color}bb)`:'none' }} />
                {h && <>
                  <rect x={-36} y={-20} width={72} height={13} fill="rgba(8,5,2,0.95)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.4} rx={1} />
                  <text textAnchor="middle" y={-11} style={{ fontFamily:'Cinzel,serif', fontSize:'4px', fill:'#F5E6C8', pointerEvents:'none', letterSpacing:'0.2px' }}>
                    {r.region}
                  </text>
                </>}
                <text textAnchor="middle" y={h?-22:12} style={{ fontFamily:'Cinzel,serif', fontSize:'3px', fill:'rgba(245,230,200,0.6)', pointerEvents:'none' }}>
                  {h ? '' : r.region}
                </text>
              </Marker>
            )
          })}

          {/* REGION: appellation pins */}
          {level === 'region' && activeRegion && activeRegion.appellations.map(app => {
            const h = hoveredApp === app.id
            const sel = selectedAppellation?.id === app.id
            const col = app.color ?? activeRegion.color
            return (
              <Marker key={app.id} coordinates={[app.coordinates.lng, app.coordinates.lat]}
                onClick={() => onSelectAppellation(app, activeRegion)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}>
                {!sel && <circle r={h?9:7} fill="transparent" stroke={col} strokeWidth={0.8} opacity={0.3} />}
                <circle r={sel?7:h?5.5:4} fill={col} stroke="#F5E6C8" strokeWidth={sel?2:h?1.2:0.7}
                  style={{ cursor:'pointer', transition:'all 0.2s ease', filter:(h||sel)?`drop-shadow(0 0 6px ${col}cc)`:'none' }} />
                {(h || sel) && <>
                  <rect x={-40} y={-21} width={80} height={13} fill="rgba(8,5,2,0.96)" stroke="rgba(245,230,200,0.6)" strokeWidth={0.5} rx={1} />
                  <text textAnchor="middle" y={-12} style={{ fontFamily:'Cinzel,serif', fontSize:'4px', fill:'#F5E6C8', pointerEvents:'none', letterSpacing:'0.3px' }}>
                    {app.name} · {app.type}
                  </text>
                </>}
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Footer */}
      <div className={styles.footer}>
        {level === 'world' && `${countries.length} countries · ${regions.reduce((a,r)=>a+r.appellations.length,0)} appellations`}
        {level === 'country' && activeCountry && `${countryRegions.length} regions in ${activeCountry.name}`}
        {level === 'region' && activeRegion && `${activeRegion.appellations.length} appellations in ${activeRegion.region}`}
      </div>

      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.min(z*1.5,16))}>+</button>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.max(z/1.5,1))}>−</button>
      </div>
    </div>
  )
}
