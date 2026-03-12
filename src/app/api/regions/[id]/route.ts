import { NextResponse } from 'next/server'
import { allRegions } from '@/lib/data'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const region = allRegions.find(r => r.id === params.id)
  if (!region) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(region)
}
