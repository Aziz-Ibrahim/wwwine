import { allRegions, buildCountries, getAllAppellations } from '@/lib/data'
import AtlasClient from '@/components/AtlasClient'
import type { AppView } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const views: AppView[] = ['map', 'compare', 'food', 'match']

export default function Home({ searchParams }: { searchParams: { view?: string } }) {
  const initialView = views.includes(searchParams.view as AppView)
    ? searchParams.view as AppView
    : 'map'

  return (
    <AtlasClient
      regions={allRegions}
      countries={buildCountries()}
      allAppellations={getAllAppellations()}
      initialView={initialView}
    />
  )
}
