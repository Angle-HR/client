import { describe, expect, it } from 'vitest'

import { fromShortId, idFromAddress, toShortId } from '../short-id'

const ID = '286ddb94-e27e-49ab-9558-c577f540e3b8'

describe('short ids', () => {
  it('shortens a UUID to 22 URL-safe characters and back', () => {
    const short = toShortId(ID)
    expect(short).toHaveLength(22)
    expect(short).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(fromShortId(short)).toBe(ID)
  })

  it('round-trips ids that need the URL-safe alphabet', () => {
    for (const id of [
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'fbff3ef8-fbef-4bef-bfbf-fffeffbfbfef',
    ]) {
      expect(fromShortId(toShortId(id))).toBe(id)
    }
  })

  it('leaves an old UUID link and anything else as it is', () => {
    expect(fromShortId(ID)).toBe(ID)
    expect(fromShortId('JB-1')).toBe('JB-1')
    expect(toShortId('JB-1')).toBe('JB-1')
  })

  it('reads an address parameter that may be missing', () => {
    expect(idFromAddress(null)).toBeNull()
    expect(idFromAddress('')).toBeNull()
    expect(idFromAddress(toShortId(ID))).toBe(ID)
  })
})
