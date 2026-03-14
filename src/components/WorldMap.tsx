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
  const [hoveredCountry, setHoveredCountry] = useState<WineCountry | null>(null)
  const [hoveredRegion, setHoveredRegion]   = useState<WineRegion | null>(null)

  const countryRegions = activeCountry
    ? regions.filter(r => r.countryCode === activeCountry.code)
    : []

  const worldPinR  = 5
  const regionPinR = (sel: boolean) => sel ? 6 : 4.5

  const goToCountry = useCallback((country: WineCountry) => {
    setActiveCountry(country)
    setLevel('country')
    const cfg = COUNTRY_ZOOM[country.code] ?? {
      zoom: 6,
      center: [country.coordinates.lng, country.coordinates.lat] as [number, number],
    }
    setCenter(cfg.center)
    setZoom(cfg.zoom)
  }, [])

  const goBack = useCallback(() => {
    setLevel('world')
    setActiveCountry(null)
    setZoom(1)
    setCenter([10, 15])
    setHoveredCountry(null)
    setHoveredRegion(null)
  }, [])

  // Decide what to show in the HTML tooltip bar
  const tooltipCountry = hoveredCountry
  const tooltipRegion  = hoveredRegion

  return (
    <div className={styles.wrapper}>
      <div className={styles.atmosphere} />

      {/* ── TOP BAR: breadcrumb + hint in one row ── */}
      <div className={styles.topBar}>
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
            ? 'Tap a country pin to explore'
            : 'Tap a region — appellations appear in the panel'}
        </div>
      </div>

      {/* ── HTML TOOLTIP — shown on hover/tap, never in SVG ── */}
      {(tooltipCountry || tooltipRegion) && (
        <div className={styles.tooltip}>
          {tooltipCountry && (
            <>
              <span className={styles.tooltipName}>{tooltipCountry.name}</span>
              <span className={styles.tooltipMeta}>
                {tooltipCountry.regionCount} region{tooltipCountry.regionCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
          {tooltipRegion && (
            <>
              <span className={styles.tooltipName}>{tooltipRegion.region}</span>
              <span className={styles.tooltipMeta}>
                {tooltipRegion.appellations.length} appellation{tooltipRegion.appellations.length !== 1 ? 's' : ''} · tap to explore
              </span>
            </>
          )}
        </div>
      )}

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
          onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
            setZoom(z)
            setCenter(coordinates as [number, number])
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#161209"
                  stroke="#2A1F10"
                  strokeWidth={0.3}
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none', fill: '#1E1810' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* WORLD: country pins */}
          {level === 'world' && countries.map(c => {
            const h = hoveredCountry?.code === c.code
            const r = worldPinR
            return (
              <Marker
                key={c.code}
                coordinates={[c.coordinates.lng, c.coordinates.lat]}
                onClick={() => goToCountry(c)}
                onMouseEnter={() => setHoveredCountry(c)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <g transform={`scale(${1 / zoom})`} style={{ cursor: 'pointer' }}>
                  {/* outer glow ring */}
                  <circle r={r * 2.4} fill="transparent" stroke={c.color} strokeWidth={0.8} opacity={h ? 0.4 : 0.18} />
                  {/* main dot */}
                  <circle
                    r={h ? r * 1.35 : r}
                    fill={c.color}
                    stroke="#F5E6C8"
                    strokeWidth={h ? 1.4 : 0.8}
                    style={{ transition: 'r 0.15s ease', filter: h ? `drop-shadow(0 0 5px ${c.color}cc)` : 'none' }}
                  />
                  {/* region count number */}
                  <text
                    textAnchor="middle"
                    y={r * 0.4}
                    style={{ fontFamily: 'Cinzel,serif', fontSize: `${r * 0.9}px`, fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}
                  >
                    {c.regionCount}
                  </text>
                </g>
              </Marker>
            )
          })}

          {/* COUNTRY: region pins */}
          {level === 'country' && countryRegions.map(reg => {
            const h   = hoveredRegion?.id === reg.id
            const sel = selectedRegionId === reg.id
            const pr  = regionPinR(sel)
            return (
              <Marker
                key={reg.id}
                coordinates={[reg.coordinates.lng, reg.coordinates.lat]}
                onClick={() => { onSelectRegion(reg); setHoveredRegion(null) }}
                onMouseEnter={() => setHoveredRegion(reg)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <g transform={`scale(${1 / zoom})`} style={{ cursor: 'pointer' }}>
                  {/* pulse ring */}
                  <circle r={pr * (sel ? 3 : 2.2)} fill="transparent" stroke={reg.color} strokeWidth={sel ? 1.2 : 0.7} opacity={sel ? 0.45 : h ? 0.3 : 0.2} />
                  {/* dot */}
                  <circle
                    r={h ? pr * 1.3 : pr}
                    fill={reg.color}
                    stroke="#F5E6C8"
                    strokeWidth={sel ? 1.8 : h ? 1.2 : 0.7}
                    style={{ transition: 'r 0.15s ease', filter: (h || sel) ? `drop-shadow(0 0 5px ${reg.color}cc)` : 'none' }}
                  />
                  {/* region name label — always visible below pin */}
                  <text
                    textAnchor="middle"
                    y={pr + 10}
                    style={{
                      fontFamily: 'Cinzel,serif',
                      fontSize: '5.5px',
                      fill: sel ? '#F5E6C8' : h ? 'rgba(245,230,200,0.9)' : 'rgba(245,230,200,0.5)',
                      fontWeight: (sel || h) ? 700 : 400,
                      pointerEvents: 'none',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {reg.region}
                  </text>
                </g>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* ── FOOTER ── */}
      <div className={styles.footer}>
        {level === 'world' && `${countries.length} countries · ${regions.reduce((a, r) => a + r.appellations.length, 0)} appellations`}
        {level === 'country' && activeCountry && `${countryRegions.length} regions in ${activeCountry.name}`}
      </div>

      {/* ── ZOOM CONTROLS ── */}
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => setZoom((z: number) => Math.min(z * 1.6, 20))}>+</button>
        <button className={styles.zoomBtn} onClick={() => setZoom((z: number) => Math.max(z / 1.6, 1))}>−</button>
      </div>
    </div>
  )
}
