import { describe, expect, it } from 'vitest'

import { marketName, toCountryCode, toMarketCode } from '../markets'

describe('market codes', () => {
  it('maps the UK between the catalog code and ISO', () => {
    expect(toCountryCode('UK')).toBe('GB')
    expect(toMarketCode('GB')).toBe('UK')
  })

  it('leaves codes that already match ISO alone', () => {
    expect(toCountryCode('US')).toBe('US')
    expect(toMarketCode('NG')).toBe('NG')
  })

  it('names a market', () => {
    expect(marketName('UK')).toBe('United Kingdom')
    expect(marketName('US')).toBe('United States')
  })
})
