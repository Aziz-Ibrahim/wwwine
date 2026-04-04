'use client'

import { useState, useMemo } from 'react'
import type { CompareItem } from '@/types'
import styles from './WineMatch.module.css'

interface Question {
  id: string
  text: string
  emoji: string
  options: { label: string; value: string; hint?: string }[]
  // maps to tasting profile adjustments
  weights: Record<string, Partial<Record<'body'|'tannins'|'acidity'|'sweetness'|'alcohol'|'style', number>>>
}

const QUESTIONS: Question[] = [
  {
    id: 'coffee', emoji: '☕', text: 'How do you take your coffee or tea?',
    options: [
      { label: 'Black, no sugar',       value: 'black',   hint: 'Bitter & bold' },
      { label: 'Milk, no sugar',        value: 'milk',    hint: 'Smooth & rounded' },
      { label: 'Sweet — a couple of sugars', value: 'sweet', hint: 'Touch of sweetness' },
      { label: 'Very sweet & milky',    value: 'vsweeet', hint: 'Rich & indulgent' },
      { label: 'I prefer neither',      value: 'neither', hint: 'Herbal or neutral' },
    ],
    weights: {
      black:   { tannins: 2, acidity: 1, sweetness: -1 },
      milk:    { body: 1, tannins: 1 },
      sweet:   { sweetness: 1, acidity: -1 },
      vsweeet: { sweetness: 2, body: 1, acidity: -2 },
      neither: { acidity: 1, body: -1 },
    }
  },
  {
    id: 'snack', emoji: '🍫', text: 'What\'s your favourite sweet treat?',
    options: [
      { label: 'Dark chocolate',        value: 'dark',    hint: 'Intense & bitter' },
      { label: 'Milk chocolate',        value: 'milk',    hint: 'Creamy & sweet' },
      { label: 'Salted caramel',        value: 'caramel', hint: 'Sweet-savoury balance' },
      { label: 'Fresh fruit',           value: 'fruit',   hint: 'Clean & bright' },
      { label: 'Pastry / croissant',    value: 'pastry',  hint: 'Buttery & rich' },
    ],
    weights: {
      dark:    { tannins: 2, sweetness: -1, alcohol: 1 },
      milk:    { sweetness: 1, body: 1, tannins: -1 },
      caramel: { sweetness: 1, body: 1, acidity: 1 },
      fruit:   { acidity: 2, sweetness: -1, body: -1 },
      pastry:  { body: 2, acidity: -1, sweetness: 1 },
    }
  },
  {
    id: 'texture', emoji: '🍽️', text: 'You\'re at a dinner — which dish excites you most?',
    options: [
      { label: 'Grilled steak or lamb', value: 'meat',    hint: 'Bold & savoury' },
      { label: 'Grilled fish or seafood', value: 'fish',  hint: 'Delicate & fresh' },
      { label: 'Mushroom risotto',       value: 'earthy', hint: 'Earthy & umami' },
      { label: 'Cheese board',          value: 'cheese',  hint: 'Rich & varied' },
      { label: 'Spiced vegetable dish', value: 'spiced',  hint: 'Aromatic & complex' },
    ],
    weights: {
      meat:   { body: 2, tannins: 2, acidity: -1 },
      fish:   { body: -2, acidity: 2, tannins: -2 },
      earthy: { body: 1, tannins: 1, acidity: 1 },
      cheese: { body: 2, sweetness: 1, acidity: 1 },
      spiced: { acidity: 1, sweetness: 1, alcohol: 1 },
    }
  },
  {
    id: 'season', emoji: '🌤️', text: 'Pick a moment you love:',
    options: [
      { label: 'Winter evening by the fire', value: 'cosy',    hint: 'Warm & comforting' },
      { label: 'Summer terrace at sunset',   value: 'summer',  hint: 'Fresh & celebratory' },
      { label: 'Autumn walk in the woods',   value: 'autumn',  hint: 'Earthy & complex' },
      { label: 'Spring lunch in the garden', value: 'spring',  hint: 'Light & floral' },
      { label: 'Late night jazz bar',        value: 'night',   hint: 'Smoky & contemplative' },
    ],
    weights: {
      cosy:   { body: 2, tannins: 1, sweetness: 1, acidity: -1 },
      summer: { acidity: 2, body: -1, sweetness: -1 },
      autumn: { tannins: 1, body: 1, acidity: 1 },
      spring: { acidity: 1, body: -1, sweetness: -1 },
      night:  { body: 2, tannins: 2, acidity: -1 },
    }
  },
  {
    id: 'fruit', emoji: '🍒', text: 'Pick the fruit you\'d grab first from a bowl:',
    options: [
      { label: 'Blackberries or blackcurrant', value: 'dark',   hint: 'Intense & deep' },
      { label: 'Raspberries or strawberries',  value: 'red',    hint: 'Bright & fragrant' },
      { label: 'Peach or apricot',            value: 'stone',  hint: 'Rich & honeyed' },
      { label: 'Lemon or grapefruit',         value: 'citrus', hint: 'Sharp & zesty' },
      { label: 'Green apple or pear',         value: 'green',  hint: 'Crisp & refreshing' },
    ],
    weights: {
      dark:   { body: 2, tannins: 1, sweetness: -1 },
      red:    { acidity: 1, tannins: -1, body: -1 },
      stone:  { sweetness: 1, body: 1, acidity: -1 },
      citrus: { acidity: 2, sweetness: -2, body: -1 },
      green:  { acidity: 2, sweetness: -1, body: -1 },
    }
  },
  {
    id: 'complexity', emoji: '🎭', text: 'What kind of experience are you after tonight?',
    options: [
      { label: 'Relaxed, easy, uncomplicated', value: 'easy',    hint: 'Nothing to overthink' },
      { label: 'Interesting, something to talk about', value: 'curious', hint: 'Conversation starter' },
      { label: 'A special occasion wine',      value: 'special', hint: 'Pull out the stops' },
      { label: 'Something unusual & different', value: 'unusual', hint: 'Surprise me' },
      { label: 'Pure hedonism — rich & bold',  value: 'hedonism', hint: 'Turn it up' },
    ],
    weights: {
      easy:    { body: -1, tannins: -1, acidity: -1 },
      curious: { acidity: 1, tannins: 1 },
      special: { body: 1, tannins: 1, acidity: 1, alcohol: 1 },
      unusual: { acidity: 1, sweetness: 1 },
      hedonism:{ body: 2, alcohol: 2, sweetness: 1 },
    }
  },
]

type Answers = Record<string, string>

function computeScores(answers: Answers): Record<string, number> {
  const scores: Record<string, number> = { body:0, tannins:0, acidity:0, sweetness:0, alcohol:0 }
  for (const q of QUESTIONS) {
    const ans = answers[q.id]
    if (!ans) continue
    const w = q.weights[ans] ?? {}
    for (const [k, v] of Object.entries(w)) {
      if (k in scores) scores[k] += v as number
    }
  }
  return scores
}

function matchWines(scores: Record<string, number>, appellations: CompareItem[]): CompareItem[] {
  // Normalise scores to 1–5 scale (they start at 0)
  // Base is 3 (medium everything), biased by answers
  const target = {
    body:      Math.max(1, Math.min(5, 3 + scores.body)),
    tannins:   Math.max(1, Math.min(5, 3 + scores.tannins)),
    acidity:   Math.max(1, Math.min(5, 3 + scores.acidity)),
    sweetness: Math.max(1, Math.min(5, 2 + scores.sweetness)),
    alcohol:   Math.max(1, Math.min(5, 3 + scores.alcohol)),
  }
  return appellations
    .map(a => {
      const tp = a.tastingProfile
      const dist = Math.sqrt(
        Math.pow(tp.body      - target.body, 2) * 2 +
        Math.pow(tp.tannins   - target.tannins, 2) * 1.5 +
        Math.pow(tp.acidity   - target.acidity, 2) * 1.5 +
        Math.pow(tp.sweetness - target.sweetness, 2) * 2 +
        Math.pow(tp.alcohol   - target.alcohol, 2) * 1
      )
      return { ...a, dist }
    })
    .sort((a: any, b: any) => a.dist - b.dist)
    .slice(0, 8)
}

interface Props { appellations: CompareItem[] }

export default function WineMatch({ appellations }: Props) {
  const [step,    setStep]    = useState<'quiz'|'results'>('quiz')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const scores  = useMemo(() => computeScores(answers), [answers])
  const matches = useMemo(() => step === 'results' ? matchWines(scores, appellations) : [], [scores, appellations, step])

  const q = QUESTIONS[current]
  const progress = Math.round((current / QUESTIONS.length) * 100)

  function pick(value: string) {
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
    } else {
      setStep('results')
    }
  }

  function restart() {
    setAnswers({})
    setCurrent(0)
    setStep('quiz')
  }

  if (step === 'results') {
    return (
      <div className={styles.page}>
        <div className={styles.resultsHero}>
          <div className={styles.resultsEmoji}>🍷</div>
          <h1 className={styles.resultsTitle}>Your Wine Profile</h1>
          <p className={styles.resultsSub}>Based on your answers, here are the wines that match your taste</p>
          <button className={styles.restartBtn} onClick={restart}>↺ Retake Quiz</button>
        </div>

        {/* Taste radar summary */}
        <div className={styles.profileBar}>
          {Object.entries(scores).map(([k, v]) => {
            const norm = Math.max(1, Math.min(5, (k === 'sweetness' ? 2 : 3) + v))
            const labels: Record<string, [string,string]> = {
              body:     ['Light','Full'],     tannins:  ['Silky','Grippy'],
              acidity:  ['Soft','Electric'],  sweetness:['Dry','Sweet'],
              alcohol:  ['Low','High'],
            }
            const [lo, hi] = labels[k] ?? [k,'']
            return (
              <div key={k} className={styles.profileItem}>
                <div className={styles.profileKey}>{k}</div>
                <div className={styles.profileTrack}>
                  <div className={styles.profileFill} style={{ width:`${((norm-1)/4)*100}%` }} />
                </div>
                <div className={styles.profileScale}><span>{lo}</span><span>{hi}</span></div>
              </div>
            )
          })}
        </div>

        <div className={styles.matchGrid}>
          {matches.map((w, i) => (
            <div key={w.id} className={styles.matchCard} style={{ borderTop:`3px solid ${w.color}` }}>
              {i === 0 && <div className={styles.topMatch}>★ Best Match</div>}
              <div className={styles.matchName}>{w.label.replace(` (${w.type})`, '')}</div>
              <div className={styles.matchMeta}>{w.type} · {w.regionName}, {w.country}</div>
              <p className={styles.matchStyle}>{w.tastingProfile.style}</p>
              <div className={styles.matchGrapes}>
                {w.grapes.slice(0,3).map(g => <span key={g} className={styles.grape}>{g}</span>)}
              </div>
              <div className={styles.matchFooter}>
                <span>🌡️ {w.servingTemp}</span>
                <span>⏳ {w.agingPotential}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.quizWrap}>
        {/* Progress */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width:`${progress}%` }} />
          </div>
          <div className={styles.progressLabel}>{current + 1} of {QUESTIONS.length}</div>
        </div>

        {/* Question */}
        <div className={styles.qCard}>
          <div className={styles.qEmoji}>{q.emoji}</div>
          <h2 className={styles.qText}>{q.text}</h2>
          <div className={styles.options}>
            {q.options.map(opt => (
              <button
                key={opt.value}
                className={`${styles.option} ${answers[q.id] === opt.value ? styles.optionSelected : ''}`}
                onClick={() => pick(opt.value)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                {opt.hint && <span className={styles.optionHint}>{opt.hint}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Back button */}
        {current > 0 && (
          <button className={styles.backBtn} onClick={() => setCurrent(c => c - 1)}>← Back</button>
        )}
      </div>
    </div>
  )
}
