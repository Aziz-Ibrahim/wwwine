'use client'

import { useState, useMemo } from 'react'
import type { CompareItem } from '@/types'
import { intent } from '@/lib/intent'
import styles from './FoodPairing.module.css'

// Flavour profile tags that broaden matching beyond exact string match
const FLAVOUR_MAP: Record<string, string[]> = {
  lamb:       ['lamb','roast lamb','grilled lamb','lamb chops','rack of lamb','lamb barbacoa','lechazo','borrego'],
  beef:       ['beef','steak','wagyu','prime rib','roast beef','bistecca','short rib','asado','braised beef'],
  chicken:    ['chicken','roast chicken','poulet','poultry','coronation chicken'],
  duck:       ['duck','duck breast','duck confit','magret','canard'],
  pork:       ['pork','ham','chorizo','prosciutto','jamón','presunto','charcuterie','rillettes','saucisson','suckling pig'],
  fish:       ['fish','salmon','trout','sole','sea bass','grilled fish','grilled sole','pike','zander','congrio','ayu'],
  shellfish:  ['shellfish','oysters','scallops','mussels','clams','crab','langoustines','prawns','shrimp','percebes','amêijoas'],
  seafood:    ['seafood','sashimi','sushi','octopus','calamari','squid','grilled octopus','pulpo'],
  cheese:     ['cheese','manchego','comté','époisses','brie','roquefort','cheddar','pecorino','parmigiano','gruyère','goat','goat\'s cheese','manchego','telemea','aged cheese'],
  mushroom:   ['mushroom','truffle','chanterelle','porcini','wild mushroom','matsutake'],
  chocolate:  ['chocolate','dark chocolate','cocoa'],
  pasta:      ['pasta','risotto','spaghetti','tagliatelle','ravioli','gnocchi','tajarin'],
  game:       ['game','venison','wild boar','grouse','pheasant','partridge','hare','rabbit','cinghiale'],
  vegetables: ['asparagus','artichoke','aubergine','eggplant','tomato','salad','vegetable'],
  spicy:      ['spicy','curry','thai','asian','chilli','szechuan','indian'],
  dessert:    ['dessert','cake','tart','crème brûlée','ice cream','chocolate cake','fruit tart','pastry'],
  sushi:      ['sushi','sashimi','japanese','miso','tofu','tempura','ramen'],
}

function normTokens(s: string): string[] {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function scoreMatch(query: string, appellation: CompareItem): number {
  const qTokens = normTokens(query)
  let score = 0

  for (const food of appellation.foodPairings) {
    const fLower = food.toLowerCase()
    for (const qt of qTokens) {
      // direct substring match in food pairing string
      if (fLower.includes(qt)) score += 10
      // check flavour map
      for (const [, synonyms] of Object.entries(FLAVOUR_MAP)) {
        if (synonyms.some(s => s.includes(qt) || qt.includes(s.split(' ')[0]))) {
          if (synonyms.some(s => fLower.includes(s))) score += 6
        }
      }
    }
  }
  return score
}

interface Props { appellations: CompareItem[] }

export default function FoodPairing({ appellations }: Props) {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const results = useMemo(() => {
    if (!submitted.trim()) return []
    return appellations
      .map(a => ({ ...a, score: scoreMatch(submitted, a) }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [submitted, appellations])

  const suggestions = ['Lamb', 'Oysters', 'Truffle', 'Dark chocolate', 'Salmon', 'Beef', 'Goat\'s cheese', 'Duck', 'Asparagus', 'Mushroom', 'Scallops', 'Venison']

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🍽️</div>
        <h1 className={styles.heroTitle}>Food & Wine Pairing</h1>
        <p className={styles.heroSub}>Type an ingredient or dish — we'll find the wines that belong at your table</p>

        <div className={styles.searchWrap}>
          <input
            className={styles.input}
            placeholder="e.g. lamb, scallops, dark chocolate, truffle…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) setSubmitted(query.trim()) }}
          />
          <button
            className={styles.searchBtn}
            onClick={() => { if (query.trim()) {
          setSubmitted(query.trim())
          intent.foodSearch(query.trim())
        } }}
          >
            Find Wines
          </button>
        </div>

        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} className={styles.chip}
              onClick={() => { setQuery(s); setSubmitted(s); intent.foodSearch(s) }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {submitted && (
        <div className={styles.results}>
          {results.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyTitle}>No direct matches for <em>"{submitted}"</em></p>
              <p className={styles.emptySub}>Try a simpler term — "lamb", "fish", "cheese" — or one of the suggestions above</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>{results.length} wines pair well with <em>{submitted}</em></span>
              </div>
              <div className={styles.grid}>
                {results.map(r => (
                  <div key={r.id} className={styles.card} style={{ borderTop: `3px solid ${r.color}` }}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardName}>{r.label.replace(` (${r.type})`, '')}</span>
                      <span className={styles.cardType}>{r.type}</span>
                    </div>
                    <div className={styles.cardMeta}>{r.regionName} · {r.country}</div>
                    <p className={styles.cardStyle}>{r.tastingProfile.style}</p>

                    <div className={styles.cardPairings}>
                      {r.foodPairings.map(fp => (
                        <span key={fp} className={`${styles.tag} ${
                          normTokens(submitted).some(q => fp.toLowerCase().includes(q)) ? styles.tagMatch : ''
                        }`}>{fp}</span>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardTemp}>🌡️ {r.servingTemp}</span>
                      <span className={styles.cardAge}>⏳ {r.agingPotential}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!submitted && (
        <div className={styles.intro}>
          <div className={styles.introGrid}>
            {[
              { icon: '🥩', label: 'Red Meat', hint: 'Try: Beef, Lamb, Venison' },
              { icon: '🐟', label: 'Seafood', hint: 'Try: Oysters, Salmon, Scallops' },
              { icon: '🧀', label: 'Cheese', hint: 'Try: Roquefort, Comté, Goat\'s' },
              { icon: '🍄', label: 'Earthy', hint: 'Try: Truffle, Mushroom' },
              { icon: '🍫', label: 'Sweet', hint: 'Try: Dark chocolate, Dessert' },
              { icon: '🌿', label: 'Vegetable', hint: 'Try: Asparagus, Artichoke' },
            ].map(c => (
              <button key={c.label} className={styles.introCard}
                onClick={() => { setQuery(c.label); setSubmitted(c.label) }}>
                <span className={styles.introIcon}>{c.icon}</span>
                <span className={styles.introLabel}>{c.label}</span>
                <span className={styles.introHint}>{c.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
