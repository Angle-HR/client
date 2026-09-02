import { NextResponse } from 'next/server'
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ data: { country_id: 'uk-uuid', country_slug: 'united-kingdom', fields: [{ key: 'registration_number', label: 'Company Registration Number (CRN)', format_hint: '8 digits', placeholder: '12345678', pattern: '^\\d{8}$', required: true }] }, meta: { request_id: 's' } })
}
