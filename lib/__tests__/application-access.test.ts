import { describe, expect, it } from 'vitest'

import { canDecideApplications } from '../applications/access'

import type { DecisionAccess } from '../applications/access'

const base: DecisionAccess = {
  meUserId: 'me',
  creatorId: 'owner',
  members: [],
  permissions: [],
}

describe('canDecideApplications', () => {
  it('allows the job creator', () => {
    expect(canDecideApplications({ ...base, creatorId: 'me' })).toBe(true)
  })

  it('allows a hiring manager or recruiter on the team', () => {
    const members = [
      { user_id: 'me', role: 'hiring_manager' },
      { user_id: 'other', role: 'viewer' },
    ]
    expect(canDecideApplications({ ...base, members })).toBe(true)
    expect(
      canDecideApplications({ ...base, members: [{ user_id: 'me', role: 'recruiter' }] }),
    ).toBe(true)
  })

  it('refuses an interviewer or viewer on the team', () => {
    expect(
      canDecideApplications({ ...base, members: [{ user_id: 'me', role: 'interviewer' }] }),
    ).toBe(false)
    expect(canDecideApplications({ ...base, members: [{ user_id: 'me', role: 'viewer' }] })).toBe(
      false,
    )
  })

  it('allows anyone with job.manage_any', () => {
    expect(canDecideApplications({ ...base, permissions: ['job.manage_any'] })).toBe(true)
  })

  it('refuses other permissions', () => {
    expect(canDecideApplications({ ...base, permissions: ['job.view'] })).toBe(false)
    expect(canDecideApplications({ ...base, permissions: undefined })).toBe(false)
  })

  it('refuses when the signed-in person is not known', () => {
    expect(
      canDecideApplications({
        meUserId: undefined,
        creatorId: undefined,
        members: [{ user_id: undefined, role: 'hiring_manager' }],
        permissions: ['job.manage_any'],
      }),
    ).toBe(false)
  })

  it('refuses a person who is not on the team and did not create the job', () => {
    expect(canDecideApplications({ ...base, members: [{ user_id: 'x', role: 'recruiter' }] })).toBe(
      false,
    )
  })
})
