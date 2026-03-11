import { NextRequest, NextResponse } from 'next/server'
import { getRegionById } from '@/lib/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const region = getRegionById(params.id)

  if (!region) {
    return NextResponse.json({ error: 'Region not found' }, { status: 404 })
  }

  return NextResponse.json(region)
}
