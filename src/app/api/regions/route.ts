import { NextRequest, NextResponse } from 'next/server'
import { searchRegions, allRegions } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const continent = searchParams.get('continent')

  let results = query ? searchRegions(query) : allRegions

  if (continent) {
    results = results.filter((r) => r.continent.toLowerCase() === continent.toLowerCase())
  }

  return NextResponse.json({
    count: results.length,
    regions: results,
  })
}
