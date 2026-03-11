import { NextResponse } from 'next/server'
import { allCompareWines } from '@/lib/data'

export async function GET() {
  return NextResponse.json({
    count: allCompareWines.length,
    wines: allCompareWines,
  })
}
