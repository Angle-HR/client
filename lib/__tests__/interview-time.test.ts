import { describe, expect, it } from 'vitest'

import { formatInterviewTime, isoToZoned, zonedToIso } from '../applications/time'

describe('zonedToIso', () => {
  it('reads a wall-clock time in a zone as the instant it is', () => {
    // London is UTC+0 in winter and UTC+1 in summer.
    expect(zonedToIso('2026-12-01T14:30', 'Europe/London')).toBe('2026-12-01T14:30:00.000Z')
    expect(zonedToIso('2026-07-01T14:30', 'Europe/London')).toBe('2026-07-01T13:30:00.000Z')
    expect(zonedToIso('2026-12-01T09:00', 'America/New_York')).toBe('2026-12-01T14:00:00.000Z')
    expect(zonedToIso('2026-12-01T20:00', 'Asia/Tokyo')).toBe('2026-12-01T11:00:00.000Z')
  })

  it('returns nothing for text that is not a time', () => {
    expect(zonedToIso('', 'UTC')).toBe('')
    expect(zonedToIso('tomorrow', 'UTC')).toBe('')
  })
})

describe('isoToZoned', () => {
  it('is the inverse of zonedToIso', () => {
    const iso = zonedToIso('2026-07-01T14:30', 'Europe/Paris')
    expect(isoToZoned(iso, 'Europe/Paris')).toBe('2026-07-01T14:30')
  })
})

describe('formatInterviewTime', () => {
  it('shows the day and the span on the zone it was planned in', () => {
    expect(formatInterviewTime('2026-12-01T14:00:00Z', 45, 'Europe/London')).toBe(
      'Tue 1 Dec, 14:00 – 14:45',
    )
  })
})
