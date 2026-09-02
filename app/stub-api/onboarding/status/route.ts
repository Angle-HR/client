import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ data: { status: 'in_progress', next_step: 'identification_address', profile: { account_type: 'business', country_id: 'uk-uuid' } }, meta: { request_id: 's' } })
}
