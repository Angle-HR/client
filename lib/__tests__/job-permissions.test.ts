import { describe, expect, it } from 'vitest'

import {
  FULL_PERMISSIONS,
  LIMITED_PERMISSIONS,
  canChangeClosingDate,
  withPermissionsOverride,
} from '../jobs/permissions'

describe('job permissions', () => {
  const open = [{ status: 'open' }, { status: 'paused' }]

  it('offers the closing date to a full user with an open job selected', () => {
    expect(canChangeClosingDate(FULL_PERMISSIONS, open)).toBe(true)
    expect(canChangeClosingDate(FULL_PERMISSIONS, [{ status: 'paused' }])).toBe(false)
  })

  it('never offers it to a user with limited permission', () => {
    expect(canChangeClosingDate(LIMITED_PERMISSIONS, open)).toBe(false)
  })

  it('can be overridden from the URL until the API serves it', () => {
    expect(withPermissionsOverride(FULL_PERMISSIONS, 'limited')).toEqual(LIMITED_PERMISSIONS)
    expect(withPermissionsOverride(LIMITED_PERMISSIONS, 'full')).toEqual(FULL_PERMISSIONS)
    expect(withPermissionsOverride(LIMITED_PERMISSIONS, null)).toEqual(LIMITED_PERMISSIONS)
    expect(withPermissionsOverride(FULL_PERMISSIONS, 'nonsense')).toEqual(FULL_PERMISSIONS)
  })
})
