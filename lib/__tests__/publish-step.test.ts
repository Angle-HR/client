import { describe, expect, it } from 'vitest'

import { accessSentence, canPublish, complianceView, headerTeam } from '../jobs/publish-step'

describe('publish compliance view', () => {
  it('is null until the check has loaded', () => {
    expect(complianceView(undefined)).toBeNull()
    expect(canPublish(null)).toBe(false)
  })

  it('reads an empty check as compliant', () => {
    const view = complianceView({ blocking: [], warnings: [], gates: [] })
    expect(view).toEqual({ state: 'compliant', bullets: ['No issues found.'] })
    expect(canPublish(view)).toBe(true)
  })

  it('shows an unverified company as its own state, with the drawn copy', () => {
    const view = complianceView({
      blocking: [
        { code: 'dpa_not_accepted', message: 'Accept the DPA.' },
        { code: 'company_not_verified', message: 'Verify your company before publishing.' },
      ],
    })
    expect(view).toEqual({
      state: 'unverified',
      bullets: ['Unverified account can’t post job'],
    })
    expect(canPublish(view)).toBe(false)
  })

  it('lists every blocking issue and warning as not compliant', () => {
    const view = complianceView({
      blocking: [{ code: 'lawful_basis_missing', message: 'Add a lawful basis.' }],
      warnings: [{ code: 'salary_missing', message: 'Salary range missing.' }],
    })
    expect(view).toEqual({
      state: 'not-compliant',
      bullets: ['Add a lawful basis.', 'Salary range missing.'],
    })
    expect(canPublish(view)).toBe(true)
  })

  it('falls back to the code when an issue has no message', () => {
    const view = complianceView({ warnings: [{ code: 'form_dob' }] })
    expect(view?.bullets).toEqual(['form_dob'])
  })

  it('treats a warning-only check as publishable', () => {
    const view = complianceView({ warnings: [{ message: 'Check the description.' }] })
    expect(view?.state).toBe('not-compliant')
    expect(canPublish(view)).toBe(true)
  })
})

describe('publish header team', () => {
  it('lists the creator first with manage access, then the team', () => {
    const team = headerTeam({ id: 'u1', name: 'Mira', colour: 'green' }, [
      { userId: 'u2', name: 'Daryl', email: '', role: 'interviewer' },
      { userId: 'u3', name: 'Karri', email: '', role: 'viewer' },
    ])
    expect(team).toEqual([
      { id: 'u1', name: 'Mira', level: 'manage' },
      { id: 'u2', name: 'Daryl', level: 'review' },
      { id: 'u3', name: 'Karri', level: 'view' },
    ])
  })

  it('is empty when nobody is known yet', () => {
    expect(headerTeam(null, [])).toEqual([])
  })

  it('words the access as the tooltip does', () => {
    expect(accessSentence('manage')).toBe('Can manage this job')
    expect(accessSentence('view')).toBe('Can view this job')
  })
})
