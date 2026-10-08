import { describe, expect, it } from 'vitest'

import { flagCodeFor } from '../jobs/areas'

describe('flagCodeFor', () => {
  it('reads the country a place ends with', () => {
    expect(flagCodeFor('Lagos, Nigeria')).toBe('ng')
    expect(flagCodeFor('Germany')).toBe('de')
    expect(flagCodeFor('Paris, Île-de-France, France')).toBe('fr')
  })

  it('knows the names Google and people use', () => {
    expect(flagCodeFor('London, UK')).toBe('gb')
    expect(flagCodeFor('London, United Kingdom')).toBe('gb')
    expect(flagCodeFor('New York, NY, USA')).toBe('us')
    expect(flagCodeFor('European Union')).toBe('eu')
  })

  it('gives nothing for a place it cannot name a country for', () => {
    expect(flagCodeFor('Atlantis')).toBeUndefined()
    expect(flagCodeFor('')).toBeUndefined()
  })
})
