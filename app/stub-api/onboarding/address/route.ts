import { NextResponse } from 'next/server'
export async function PUT(request: Request): Promise<NextResponse> {
  const body = await request.json()
  return NextResponse.json({ data: { ...body, onboarding: { status: 'in_progress', next_step: 'compliance' } }, meta: { request_id: 's', received: body } })
}
