'use client'

import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import type { WineRegion, WineCountry } from '@/types'
import styles from './WorldMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const COUNTRY_ZOOM: Record<string, { zoom: number; center: [number, number] }> = {
  FR: { zoom: 7,  center: [2.0,   46.5]  },
  IT: { zoom: 7,  center: [12.0,  42.8]  },
  ES: { zoom: 7,  center: [-3.5,  40.2]  },
  DE: { zoom: 8,  center: [10.5,  51.0]  },
  PT: { zoom: 7,  center: [-8.0,  39.5]  },
  AT: { zoom: 10, center: [14.5,  47.5]  },
  GR: { zoom: 8,  center: [22.5,  38.5]  },
  HU: { zoom: 10, center: [19.5,  47.2]  },
  LB: { zoom: 11, center: [35.9,  33.8]  },
  GE: { zoom: 9,  center: [44.5,  42.0]  },
  AR: { zoom: 6,  center: [-68.5,-33.5]  },
  CL: { zoom: 7,  center: [-71.0,-35.0]  },
  ZA: { zoom: 7,  center: [20.5, -33.8]  },
  AU: { zoom: 5,  center: [138.5,-34.5]  },
  NZ: { zoom: 6,  center: [171.5,-43.0]  },
  US: { zoom: 5,  center: [-108.0, 40.0] },
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

  // Pin sizes scale DOWN with zoom so they don't overlap at higher zoom
  // At zoom=1: world pins are ~4px. At zoom=7: region pins appear ~3px in screen space
  const worldPinR    = (h: boolean) => h ? 5   : 3.5
  const regionPinR   = (h: boolean, sel: boolean) => sel ? 4.5 : h ? 4 : 3
  const labelOffset  = 9   // pixels above pin for tooltip
  const nameOffset   = 11  // pixels below pin for always-visible label

  const goToCountry = useCallback((country: WineCountry) => {
    setActiveCountry(country)
    setLevel('country')
    const cfg = COUNTRY_ZOOM[country.code] ?? {
      zoom: 6,
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
        {level === 'world'
          ? 'Click a country to explore its wine regions'
          : 'Click a region — its appellations appear in the panel →'}
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
          maxZoom={20}
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

          {/* WORLD: country pins — scale=1/zoom keeps screen size constant */}
          {level === 'world' && countries.map(c => {
            const h = hoveredCountry === c.code
            const r = worldPinR(h)
            // scale transform makes pins appear same size regardless of zoom
            return (
              <Marker
                key={c.code}
                coordinates={[c.coordinates.lng, c.coordinates.lat]}
                onClick={() => goToCountry(c)}
                onMouseEnter={() => setHoveredCountry(c.code)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <g transform={`scale(${1 / zoom})`}>
                  <circle r={r * 2.2} fill="transparent" stroke={c.color} strokeWidth={0.6} opacity={0.22} />
                  <circle
                    r={r}
                    fill={c.color}
                    stroke="#F5E6C8"
                    strokeWidth={h ? 1.2 : 0.7}
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease', filter: h ? `drop-shadow(0 0 4px ${c.color}bb)` : 'none' }}
                  />
                  <text textAnchor="middle" y={r * 0.38} style={{ fontFamily: 'Cinzel,serif', fontSize: `${r * 0.85}px`, fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>
                    {c.regionCount}
                  </text>
                  {h && (
                    <>
                      <rect x={-32} y={-(labelOffset + 12)} width={64} height={13} fill="rgba(8,5,2,0.97)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.5} rx={1} />
                      <text textAnchor="middle" y={-(labelOffset + 3)} style={{ fontFamily: 'Cinzel,serif', fontSize: '6px', fill: '#F5E6C8', pointerEvents: 'none', letterSpacing: '0.5px', fontWeight: 700 }}>
                        {c.name}
                      </text>
                    </>
                  )}
                </g>
              </Marker>
            )
          })}

          {/* COUNTRY: region pins */}
          {level === 'country' && countryRegions.map(r => {
            const h = hoveredRegion === r.id
            const sel = selectedRegionId === r.id
            const pr = regionPinR(h, sel)
            return (
              <Marker
                key={r.id}
                coordinates={[r.coordinates.lng, r.coordinates.lat]}
                onClick={() => onSelectRegion(r)}
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <g transform={`scale(${1 / zoom})`}>
                  {sel && <circle r={pr * 2.8} fill="transparent" stroke={r.color} strokeWidth={1} opacity={0.4} />}
                  {!sel && <circle r={pr * 2} fill="transparent" stroke={r.color} strokeWidth={0.6} opacity={0.25} />}
                  <circle
                    r={pr}
                    fill={r.color}
                    stroke="#F5E6C8"
                    strokeWidth={sel ? 1.5 : h ? 1 : 0.6}
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease', filter: (h || sel) ? `drop-shadow(0 0 4px ${r.color}bb)` : 'none' }}
                  />
                  {/* Always-visible region name below pin */}
                  <text
                    textAnchor="middle"
                    y={pr + nameOffset}
                    style={{ fontFamily: 'Cinzel,serif', fontSize: '5px', fill: sel ? '#F5E6C8' : 'rgba(245,230,200,0.6)', pointerEvents: 'none', letterSpacing: '0.3px', fontWeight: sel ? 700 : 400 }}
                  >
                    {r.region}
                  </text>
                  {/* Hover tooltip above pin */}
                  {(h || sel) && (
                    <>
                      <rect x={-38} y={-(pr + labelOffset + 12)} width={76} height={13} fill="rgba(8,5,2,0.97)" stroke="rgba(245,230,200,0.5)" strokeWidth={0.4} rx={1} />
                      <text textAnchor="middle" y={-(pr + labelOffset + 3)} style={{ fontFamily: 'Cinzel,serif', fontSize: '6px', fill: '#F5E6C8', pointerEvents: 'none', letterSpacing: '0.4px', fontWeight: 700 }}>
                        {r.region} · {r.appellations.length} appellations
                      </text>
                    </>
                  )}
                </g>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.footer}>
        {level === 'world' && `${countries.length} countries · ${regions.reduce((a, r) => a + r.appellations.length, 0)} appellations charted`}
        {level === 'country' && activeCountry && `${countryRegions.length} regions in ${activeCountry.name}`}
      </div>

      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.min(z * 1.6, 20))}>+</button>
        <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.max(z / 1.6, 1))}>−</button>
      </div>
    </div>
  )
}
