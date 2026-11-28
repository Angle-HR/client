import { describe, expect, it } from 'vitest'

import { toPublicOffer } from '../applications/offers'

describe('toPublicOffer', () => {
  it('reads an open offer', () => {
    expect(
      toPublicOffer({
        title: 'Offer: Designer',
        body: 'Welcome',
        compensation: '£50,000',
        start_date: '2026-12-01',
        expires_at: '2026-12-08T00:00:00Z',
        status: 'sent',
        can_respond: true,
        company: 'Acme',
        consent_text: 'I agree',
      }),
    ).toMatchObject({
      title: 'Offer: Designer',
      compensation: '£50,000',
      startDate: '2026-12-01',
      canRespond: true,
      company: 'Acme',
      consentText: 'I agree',
      hasDocument: false,
    })
  })

  it('cannot be answered when nothing says it can', () => {
    expect(toPublicOffer({ status: 'signed', signed_name: 'Ada Lovelace' })).toMatchObject({
      canRespond: false,
      signedName: 'Ada Lovelace',
    })
  })
})
