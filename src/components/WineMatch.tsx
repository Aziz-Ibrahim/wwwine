'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import type { CompareItem } from '@/types'
import { intent } from '@/lib/intent'
import styles from './WineMatch.module.css'

type Dimension = 'body' | 'tannins' | 'acidity' | 'sweetness' | 'alcohol'
type WineFamily = 'red' | 'white' | 'rose' | 'sparkling' | 'orange'
type Answers = Record<string, string>
type Target = Record<Dimension, number>
type ScoredWine = CompareItem & { distance: number; family: WineFamily }

interface Option {
  label: string
  value: string
  hint: string
  profile?: Partial<Record<Dimension, number>>
  family?: WineFamily | 'any'
  aromas?: string[]
}

interface Question { id: string; eyebrow: string; text: string; options: Option[] }

const QUESTIONS: Question[] = [
  { id: 'family', eyebrow: 'Start with the glass', text: 'What are you in the mood for?', options: [
    { label: 'Red', value: 'red', hint: 'From silky Pinot to powerful Cabernet', family: 'red' },
    { label: 'White', value: 'white', hint: 'Fresh, aromatic or richly textured', family: 'white' },
    { label: 'Rose', value: 'rose', hint: 'Pale and delicate to deep and savoury', family: 'rose' },
    { label: 'Sparkling', value: 'sparkling', hint: 'Bright bubbles or mature complexity', family: 'sparkling' },
    { label: 'Orange', value: 'orange', hint: 'Textural, savoury and skin-contact', family: 'orange' },
    { label: 'Surprise me', value: 'any', hint: 'Keep every style in play', family: 'any' },
  ] },
  { id: 'sweetness', eyebrow: 'Balance', text: 'How dry should it feel?', options: [
    { label: 'Bone dry', value: 'bone-dry', hint: 'No perceptible sweetness', profile: { sweetness: 1 } },
    { label: 'Mostly dry', value: 'dry', hint: 'Rounded, but still clearly dry', profile: { sweetness: 2 } },
    { label: 'Off-dry', value: 'off-dry', hint: 'A gentle touch of sweetness', profile: { sweetness: 3 } },
    { label: 'Sweet', value: 'sweet', hint: 'Rich fruit and obvious sweetness', profile: { sweetness: 4.5 } },
    { label: 'No preference', value: 'any', hint: 'Let the other answers decide' },
  ] },
  { id: 'body', eyebrow: 'Weight', text: 'What kind of weight do you enjoy?', options: [
    { label: 'Light and delicate', value: 'light', hint: 'Lifted, subtle and easy', profile: { body: 1.5, alcohol: 2 } },
    { label: 'Medium and balanced', value: 'medium', hint: 'Neither light nor heavy', profile: { body: 3, alcohol: 3 } },
    { label: 'Rich and full', value: 'full', hint: 'Generous, broad and powerful', profile: { body: 4.5, alcohol: 4 } },
    { label: 'No preference', value: 'any', hint: 'Show me the best overall fit' },
  ] },
  { id: 'acidity', eyebrow: 'Freshness', text: 'How much freshness do you like?', options: [
    { label: 'Soft and rounded', value: 'soft', hint: 'Gentle rather than sharp', profile: { acidity: 2 } },
    { label: 'Fresh and balanced', value: 'fresh', hint: 'Enough lift for the table', profile: { acidity: 3.5 } },
    { label: 'Crisp and mouth-watering', value: 'crisp', hint: 'Bright, zesty and energetic', profile: { acidity: 5 } },
    { label: 'No preference', value: 'any', hint: 'I am open to either' },
  ] },
  { id: 'texture', eyebrow: 'Texture', text: 'Which texture sounds most appealing?', options: [
    { label: 'Silky and smooth', value: 'silky', hint: 'Very little grip', profile: { tannins: 1.5 } },
    { label: 'Creamy and rounded', value: 'creamy', hint: 'Broad and softly textured', profile: { tannins: 1, body: 3.5 }, aromas: ['cream', 'butter', 'lees'] },
    { label: 'Mineral and precise', value: 'mineral', hint: 'Taut, clean and focused', profile: { tannins: 1, acidity: 4.5 }, aromas: ['mineral', 'flint', 'chalk', 'saline'] },
    { label: 'Gently grippy', value: 'grippy', hint: 'Noticeable structure', profile: { tannins: 3.5 } },
    { label: 'Firm and tannic', value: 'firm', hint: 'Powerful, structured and age-worthy', profile: { tannins: 5, body: 4 } },
  ] },
  { id: 'aroma', eyebrow: 'Aromas', text: 'Which aromas draw you in?', options: [
    { label: 'Citrus and green fruit', value: 'citrus', hint: 'Lemon, lime, apple and pear', aromas: ['lemon', 'lime', 'citrus', 'apple', 'pear', 'grapefruit'] },
    { label: 'Flowers and stone fruit', value: 'floral', hint: 'Peach, apricot and blossom', aromas: ['peach', 'apricot', 'flower', 'blossom', 'rose', 'violet'] },
    { label: 'Red berries', value: 'red-fruit', hint: 'Strawberry, cherry and raspberry', aromas: ['strawberry', 'cherry', 'raspberry', 'redcurrant'] },
    { label: 'Dark fruit and spice', value: 'dark-fruit', hint: 'Blackberry, cassis, plum and pepper', aromas: ['blackberry', 'blackcurrant', 'cassis', 'plum', 'pepper', 'spice'] },
    { label: 'Earthy and savoury', value: 'savoury', hint: 'Herbs, tobacco, mushroom and leather', aromas: ['earth', 'herb', 'tobacco', 'mushroom', 'leather', 'cedar'] },
    { label: 'Surprise me', value: 'any', hint: 'Do not favour one aroma family' },
  ] },
  { id: 'occasion', eyebrow: 'The moment', text: 'What kind of bottle are you looking for?', options: [
    { label: 'Easy-going', value: 'easy', hint: 'Relaxed and immediately enjoyable', profile: { body: 2.5, tannins: 2, alcohol: 2.5 } },
    { label: 'Food-friendly', value: 'food', hint: 'Freshness and balance at the table', profile: { acidity: 4, body: 3 } },
    { label: 'Celebratory', value: 'celebration', hint: 'Bright, polished and occasion-ready', profile: { acidity: 4, alcohol: 3 } },
    { label: 'Contemplative', value: 'contemplative', hint: 'Complex, structured and slowly revealing', profile: { body: 4, tannins: 4, alcohol: 4 } },
    { label: 'Adventurous', value: 'adventurous', hint: 'Distinctive and outside the familiar' },
  ] },
]

const DEFAULT_TARGET: Target = { body: 3, tannins: 2.5, acidity: 3.5, sweetness: 1.5, alcohol: 3 }
const DIMENSION_WEIGHT: Target = { body: 1.7, tannins: 1.3, acidity: 1.6, sweetness: 2.2, alcohol: 0.7 }

function selectedOptions(answers: Answers) {
  return QUESTIONS.flatMap(question => {
    const option = question.options.find(item => item.value === answers[question.id])
    return option ? [option] : []
  })
}

function buildTarget(answers: Answers): Target {
  const totals = { ...DEFAULT_TARGET }
  const counts: Target = { body: 1, tannins: 1, acidity: 1, sweetness: 1, alcohol: 1 }
  for (const option of selectedOptions(answers)) {
    for (const [key, value] of Object.entries(option.profile ?? {})) {
      const dimension = key as Dimension
      totals[dimension] += value
      counts[dimension] += 1
    }
  }
  return Object.fromEntries(Object.keys(totals).map(key => {
    const dimension = key as Dimension
    return [dimension, totals[dimension] / counts[dimension]]
  })) as Target
}

function wineFamily(wine: CompareItem): WineFamily {
  const image = wine.image.toLowerCase()
  if (image.includes('sparkling')) return 'sparkling'
  if (image.includes('pale-pink') || image.includes('salmon') || image.includes('deep-pink')) return 'rose'
  if (image.includes('copper-orange')) return 'orange'
  if (image.includes('purple') || image.includes('ruby') || image.includes('garnet') || image.includes('tawny')) return 'red'
  return 'white'
}

function searchableNotes(wine: CompareItem) {
  const profile = wine.tastingProfile
  return [...profile.fruits, ...profile.secondaryNotes, ...(profile.tertiaryNotes ?? []), profile.style].join(' ').toLowerCase()
}

function rankWines(answers: Answers, appellations: CompareItem[]): ScoredWine[] {
  const target = buildTarget(answers)
  const options = selectedOptions(answers)
  const chosenFamilies = options.map(option => option.family).filter(Boolean)
  const preferredFamily = chosenFamilies.at(-1)
  const aromaTerms = options.flatMap(option => option.aromas ?? [])
  return appellations.map(wine => {
    const family = wineFamily(wine)
    let squaredDistance = 0
    for (const dimension of Object.keys(target) as Dimension[]) {
      squaredDistance += Math.pow(wine.tastingProfile[dimension] - target[dimension], 2) * DIMENSION_WEIGHT[dimension]
    }
    let distance = Math.sqrt(squaredDistance)
    if (preferredFamily && preferredFamily !== 'any' && family !== preferredFamily) distance += 8
    if (aromaTerms.length) {
      const notes = searchableNotes(wine)
      distance -= Math.min(1.8, aromaTerms.filter(term => notes.includes(term)).length * 0.45)
    }
    return { ...wine, family, distance }
  }).sort((a, b) => a.distance - b.distance)
}

function diverseMatches(ranked: ScoredWine[]) {
  const selected: ScoredWine[] = []
  for (const wine of ranked) {
    if (selected.some(item => item.regionId === wine.regionId)) continue
    selected.push(wine)
    if (selected.length === 4) break
  }
  if (selected.length < 4) {
    for (const wine of ranked) {
      if (!selected.some(item => item.id === wine.id)) selected.push(wine)
      if (selected.length === 4) break
    }
  }
  return selected
}

function matchReasons(wine: ScoredWine, target: Target, answers: Answers) {
  const names: Record<Dimension, string> = { body: 'body', tannins: 'texture', acidity: 'freshness', sweetness: 'dryness', alcohol: 'weight' }
  const reasons = (['sweetness', 'body', 'acidity', 'tannins'] as Dimension[]).map(dimension => ({
    difference: Math.abs(wine.tastingProfile[dimension] - target[dimension]),
    text: `Close to your preferred ${names[dimension]}`,
  }))
  const aromaTerms = selectedOptions(answers).flatMap(option => option.aromas ?? [])
  const aromaMatches = aromaTerms.filter(term => searchableNotes(wine).includes(term))
  if (aromaMatches.length) reasons.push({ difference: -1, text: `Shows ${aromaMatches.slice(0, 2).join(' and ')} notes` })
  return reasons.sort((a, b) => a.difference - b.difference).slice(0, 2).map(reason => reason.text)
}

function profileSummary(target: Target, family?: WineFamily | 'any') {
  const familyText = family && family !== 'any' ? `${family} wines` : 'wines'
  const body = target.body < 2.5 ? 'lighter' : target.body > 3.6 ? 'fuller-bodied' : 'medium-bodied'
  const freshness = target.acidity > 4 ? 'vivid freshness' : target.acidity < 2.7 ? 'a softer shape' : 'balanced freshness'
  const sweetness = target.sweetness > 3 ? 'noticeable sweetness' : target.sweetness > 2 ? 'a gentle softness' : 'a dry finish'
  return `You lean toward ${body} ${familyText} with ${freshness} and ${sweetness}.`
}

interface Props { appellations: CompareItem[] }

export default function WineMatch({ appellations }: Props) {
  const [step, setStep] = useState<'quiz' | 'results'>('quiz')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const target = useMemo(() => buildTarget(answers), [answers])
  const ranked = useMemo(() => rankWines(answers, appellations), [answers, appellations])
  const matches = useMemo(() => step === 'results' ? diverseMatches(ranked) : [], [ranked, step])
  const question = QUESTIONS[current]
  const progress = Math.round(((current + 1) / QUESTIONS.length) * 100)
  const preferredFamily = selectedOptions(answers).map(option => option.family).filter(Boolean).at(-1)

  function pick(value: string) {
    const next = { ...answers, [question.id]: value }
    setAnswers(next)
    if (current < QUESTIONS.length - 1) return setCurrent(index => index + 1)
    const topMatch = diverseMatches(rankWines(next, appellations))[0]
    setStep('results')
    if (topMatch) intent.quizComplete(topMatch.label, topMatch.country, topMatch.regionName, topMatch.tastingProfile.style)
  }

  function restart() { setAnswers({}); setCurrent(0); setStep('quiz') }

  if (step === 'results') {
    const rankLabels = ['Best match', 'Excellent alternative', 'Something different', 'Wildcard']
    const scaleLabels: Record<Dimension, [string, string]> = {
      body: ['Light', 'Full'], tannins: ['Silky', 'Grippy'], acidity: ['Soft', 'Electric'],
      sweetness: ['Dry', 'Sweet'], alcohol: ['Low', 'High'],
    }
    return <div className={styles.page}>
      <header className={styles.resultsHero}>
        <p className={styles.eyebrow}>Your wine profile</p>
        <h1 className={styles.resultsTitle}>Four Wines To Discover</h1>
        <p className={styles.resultsSub}>{profileSummary(target, preferredFamily)}</p>
        <button className={styles.restartBtn} onClick={restart}>Retake quiz</button>
      </header>
      <div className={styles.profileBar}>
        {(Object.entries(target) as [Dimension, number][]).map(([key, value]) => <div key={key} className={styles.profileItem}>
          <div className={styles.profileKey}>{key}</div>
          <div className={styles.profileTrack}><div className={styles.profileFill} style={{ width: `${((value - 1) / 4) * 100}%` }} /></div>
          <div className={styles.profileScale}><span>{scaleLabels[key][0]}</span><span>{scaleLabels[key][1]}</span></div>
        </div>)}
      </div>
      <div className={styles.matchGrid}>
        {matches.map((wine, index) => <article key={wine.id} className={styles.matchCard}>
          <div className={styles.matchImageWrap}>
            <Image className={styles.matchImage} src={wine.image} alt="" fill sizes="(max-width: 600px) 100vw, 280px" />
            <span className={styles.matchRank}>{rankLabels[index]}</span>
          </div>
          <div className={styles.matchContent}>
            <h2 className={styles.matchName}>{wine.label.replace(` (${wine.type})`, '')}</h2>
            <div className={styles.matchMeta}>{wine.type} | {wine.regionName}, {wine.country}</div>
            <p className={styles.matchStyle}>{wine.tastingProfile.style}</p>
            <ul className={styles.reasonList}>{matchReasons(wine, target, answers).map(reason => <li key={reason}>{reason}</li>)}</ul>
            <div className={styles.matchGrapes}>{wine.grapes.slice(0, 3).map(grape => <span key={grape} className={styles.grape}>{grape}</span>)}</div>
            <Link className={styles.guideLink} href={`/appellations/${wine.id}` as Route}>Explore wine guide</Link>
          </div>
        </article>)}
      </div>
    </div>
  }

  return <div className={styles.page}>
    <div className={styles.quizWrap}>
      <header className={styles.quizHeader}><p className={styles.eyebrow}>Discover</p><h1 className={styles.quizTitle}>Find Your Wine</h1></header>
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
        <div className={styles.progressLabel}>{current + 1} of {QUESTIONS.length}</div>
      </div>
      <div className={styles.qCard}>
        <p className={styles.questionEyebrow}>{question.eyebrow}</p>
        <h2 className={styles.qText}>{question.text}</h2>
        <div className={styles.options}>{question.options.map(option => <button
          key={option.value}
          className={`${styles.option} ${answers[question.id] === option.value ? styles.optionSelected : ''}`}
          onClick={() => pick(option.value)}
        ><span className={styles.optionLabel}>{option.label}</span><span className={styles.optionHint}>{option.hint}</span></button>)}</div>
      </div>
      {current > 0 && <button className={styles.backBtn} onClick={() => setCurrent(index => index - 1)}>Back</button>}
    </div>
  </div>
}
