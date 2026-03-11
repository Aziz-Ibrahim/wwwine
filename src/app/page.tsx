import { allRegions, buildCountries, getAllAppellations } from '@/lib/data'
import AtlasClient from '@/components/AtlasClient'

export default function Home() {
  return (
    <AtlasClient
      regions={allRegions}
      countries={buildCountries()}
      allAppellations={getAllAppellations()}
    />
  )
}
