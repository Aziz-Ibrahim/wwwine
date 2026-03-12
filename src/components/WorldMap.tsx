'use client'

import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import type { WineRegion, WineCountry } from '@/types'
import styles from './WorldMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const COUNTRY_ZOOM: Record<string, { zoom: number; center: [number, number] }> = {
  FR: { zoom: 6,  center: [2.0,   46.5]  },
  IT: { zoom: 6,  center: [12.0,  42.8]  },
  ES: { zoom: 6,  center: [-3.5,  40.2]  },
  DE: { zoom: 7,  center: [10.5,  51.0]  },
  PT: { zoom: 7,  center: [-8.0,  39.5]  },
  AT: { zoom: 8,  center: [14.5,  47.5]  },
  GR: { zoom: 7,  center: [22.5,  38.5]  },
  HU: { zoom: 8,  center: [19.5,  47.2]  },
  LB: { zoom: 9,  center: [35.9,  33.8]  },
  GE: { zoom: 8,  center: [44.5,  42.0]  },
  AR: { zoom: 5,  center: [-68.5,-33.5]  },
  CL: { zoom: 6,  center: [-71.0,-35.0]  },
  ZA: { zoom: 6,  center: [19.5, -33.5]  },
  AU: { zoom: 4,  center: [138.5,-34.0]  },
  NZ: { zoom: 6,  center: [172.5,-41.5]  },
  US: { zoom: 5,  center: [-118.0, 37.5] },
}

interface Props {
  regions: WineRegion[]
  countries: WineCountry[]
  selectedRegionId: string | null
  onSelectRegion: (region: WineRegion) => void
}

export default function WorldMap({ regions, countries, selectedRegionId, onSelectRegion }: Props) {
  const [level, setLevel]                   = useState<'world' | 'country'>('world')
  const [activeCountry, setActiveCountry]   = useState<WineCountry | null>(null)
  const [zoom, setZoom]                     = useState(1)
  const [center, setCenter]                 = useState<[number, number]>([10, 15])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion]   = useState<string | null>(null)

  const countryRegions = activeCountry
    ? regions.filter(r => r.countryCode === activeCountry.code)
    : []

  const goToCountry = useCallback((country: WineCountry) => {
    setActiveCountry(country)
    setLevel('country')
    const cfg = COUNTRY_ZOOM[country.code] ?? {
      zoom: 5,
      center: [country.coordinates.lng, country.coordinates.lat] as [number, number]
    }
    setCenter(cfg.center)
    setZoom(cfg.zoom)
  }, [])

  const goBack = useCallback(() => {
    setLevel('world')
    setActiveCountry(null)
    setZoom(1)
    setCenter([10, 15])
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.atmosphere} />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        {level === 'world' ? (
          <span className={styles.crumbInactive}>World Atlas</span>
        ) : (
          <>
            <button className={styles.backBtn} onClick={goBack}>← World</button>
            <span className={styles.crumbSep}>›</span>
            <span className={styles.crumbActive}>{activeCountry?.name}</span>
          </>
        )}
      </div>

      <div className={styles.hint}>
        {level === 'world'   ? 'Click a country to explore its wine regions' : 'Click a region — its appellations appear in the panel →'}
      </div>

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160, center: [0, 0] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={16}
          onMoveEnd={({ zoom: z, coordinates }) => {
            setZoom(z)
            setCenter(coordinates as [number, number])
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#161209"
                  stroke="#2A1F10"
                  strokeWidth={0.3}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#1E1810' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>

          {/* WORLD LEVEL — country pins */}
          {level === 'world' && countries.map(c => {
            const h = hoveredCountry === c.code
            return (
              <Marker
                key={c.code}
                coordinates={[c.coordinates.lng, c.coordinates.lat]}
                onClick={() => goToCountry(c)}
                onMouseEnter={() => setHoveredCountry(c.code)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <circle r={h ? 11 : 8} fill="transparent" stroke={c.color} strokeWidth={0.8} opacity={0.25} />
                <circle
                  r={h ? 6 : 4.5}
                  fill={c.color}
                  stroke="#F5E6C8"
                  strokeWidth={h ? 1.5 : 0.8}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', filter: h ? `drop-shadow(0 0 7px ${c.color}cc)` : 'none' }}
                />
                <text textAnchor="middle" y={1} style={{ fontFamily: 'Cinzel,serif', fontSize: '3px', fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>
                  {c.regionCount}
                </text>
                {h && (
                  <>
                    <rect x={-34} y={-21} width={68} height={13} fill="rgba(8,5,2,0.96)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.5} rx={1} />
                    <text textAnchor="middle" y={-12} style={{ fontFamily: 'Cinzel,serif', fontSize: '4.5px', fill: '#F5E6C8', pointerEvents: 'none', letterSpacing: '0.3px' }}>
                      {c.name}
                    </text>
                  </>
                )}
              </Marker>
            )
          })}

          {/* COUNTRY LEVEL — region pins */}
          {level === 'country' && countryRegions.map(r => {
            const h = hoveredRegion === r.id
            const sel = selectedRegionId === r.id
            return (
              <Marker
                key={r.id}
                coordinates={[r.coordinates.lng, r.coordinates.lat]}
                onClick={() => onSelectRegion(r)}
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {!sel && <circle r={h ? 9 : 7} fill="transparent" stroke={r.color} strokeWidth={0.8} opacity={0.28} />}
                {sel && <circle r={11} fill="transparent" stroke={r.color} strokeWidth={1.5} opacity={0.5} />}
                <circle
                  r={sel ? 6 : h ? 5 : 4}
                  fill={r.color}
                  stroke="#F5E6C8"
                  strokeWidth={sel ? 2 : h ? 1.2 : 0.7}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', filter: (h || sel) ? `drop-shadow(0 0 6px ${r.color}cc)` : 'none' }}
                />
                <text
                  textAnchor="middle"
                  y={h || sel ? -14 : 13}
                  style={{ fontFamily: 'Cinzel,serif', fontSize: '3.2px', fill: sel ? '#F5E6C8' : 'rgba(245,230,200,0.6)', pointerEvents: 'none', letterSpacing: '0.2px' }}
                >
                  {r.region}
                </text>
                {(h || sel) && (
                  <>
                    <rect x={-38} y={-22} width={76} height={13} fill="rgba(8,5,2,0.96)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.4} rx={1} />
                    <text textAnchor="middle" y={-13} style={{ fontFamily: 'Cinzel,serif', fontSize: '4px', fill: '#F5E6C8', pointerEvents: 'none', letterSpacing: '0.3px' }}>
                      {r.region} · {r.appellations.length} appellations
                    </text>
                  </>
                )}
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.footer}>
        {level === 'world' && `${countries.length} countries · ${regions.reduce((a, r) => a + r.appellations.length, 0)} appellations`}
        {level === 'country' && activeCountry && `${countryRegions.length} regions in ${activeCountry.name} · click a region to explore`}
      </div>

      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.min(z * 1.5, 16))}>+</button>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.max(z / 1.5, 1))}>−</button>
      </div>
    </div>
  )
}
