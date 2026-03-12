import { NextResponse } from 'next/server'
import { allRegions } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() ?? ''
  const results = q
    ? allRegions.filter(r =>
        r.region.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.appellations.some(a => a.name.toLowerCase().includes(q))
      )
    : allRegions
  return NextResponse.json(results)
}
