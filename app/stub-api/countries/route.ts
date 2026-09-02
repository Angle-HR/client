import { NextResponse } from 'next/server'
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ data: [{ id: 'uk-uuid', name: 'United Kingdom', slug: 'united-kingdom', region: 'uk', icon_key: 'flag-gb' }], meta: { request_id: 's' } })
}
