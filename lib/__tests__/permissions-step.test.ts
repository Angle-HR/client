import { describe, expect, it } from 'vitest'

import {
  COLLAPSED_ROWS,
  LEVEL_ROLE,
  MEMBER_MENUS,
  addEmailTags,
  levelOfRole,
  memberButtonLabel,
  sendableEmails,
  splitInvites,
  suggestedPeople,
  toAccessMembers,
  visibleRows,
  withMember,
  withoutMember,
} from '../jobs/permissions-step'

import type { AccessMember } from '../jobs/permissions-step'
import type { JobManager } from '../jobs/types'

const alice: AccessMember = {
  userId: 'u-alice',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'hiring_manager',
}

describe('access levels and roles', () => {
  it('maps each design level to its API role and back', () => {
    expect(LEVEL_ROLE).toEqual({
      manage: 'hiring_manager',
      review: 'interviewer',
      view: 'viewer',
    })
    expect(levelOfRole('interviewer')).toBe('review')
    expect(levelOfRole('viewer')).toBe('view')
    expect(levelOfRole('hiring_manager')).toBe('manage')
  })

  it('has no level for an external recruiter', () => {
    expect(levelOfRole('recruiter')).toBeNull()
  })
})

describe('email tags', () => {
  it('splits typed text on commas, semicolons and spaces', () => {
    const tags = addEmailTags([], 'a@x.com, b@y.co;c@z.org  ')
    expect(tags.map((tag) => tag.email)).toEqual(['a@x.com', 'b@y.co', 'c@z.org'])
  })

  it('marks an address without a domain as invalid, as a red tag', () => {
    const tags = addEmailTags([], 'jerry@gmail.com, segun3.com')
    expect(tags).toEqual([
      { email: 'jerry@gmail.com', valid: true },
      { email: 'segun3.com', valid: false },
    ])
  })

  it('skips repeats, ignoring case, and empty pieces', () => {
    const tags = addEmailTags(addEmailTags([], 'A@x.com'), 'a@x.com,, ,')
    expect(tags).toHaveLength(1)
  })

  it('sends only the valid tags', () => {
    const tags = addEmailTags([], 'ok@x.com, nope')
    expect(sendableEmails(tags)).toEqual(['ok@x.com'])
  })
})

describe('team membership', () => {
  it('drops the creator and repeats from the API rows', () => {
    const members = toAccessMembers(
      [
        { user_id: 'creator', name: 'Justus', email: 'j@x.com', role: 'hiring_manager' },
        { user_id: 'u-alice', name: 'Alice', email: 'alice@example.com', role: 'viewer' },
        { user_id: 'u-alice', name: 'Alice', email: 'alice@example.com', role: 'viewer' },
      ],
      'creator',
    )
    expect(members).toEqual([
      { userId: 'u-alice', name: 'Alice', email: 'alice@example.com', role: 'viewer' },
    ])
  })

  it('keeps a row whose role the design cannot show, so saving does not revoke it', () => {
    const members = toAccessMembers(
      [{ user_id: 'u-rec', name: 'Rec', email: 'r@x.com', role: 'recruiter' }],
      undefined,
    )
    expect(members.map((member) => member.userId)).toEqual(['u-rec'])
  })

  it('adds a new person, or changes a role already on the team', () => {
    const added = withMember([alice], { userId: 'u-bob', name: 'Bob', email: 'b@x.com' }, 'viewer')
    expect(added.map((member) => [member.userId, member.role])).toEqual([
      ['u-alice', 'hiring_manager'],
      ['u-bob', 'viewer'],
    ])
    const changed = withMember([alice], alice, 'interviewer')
    expect(changed).toEqual([{ ...alice, role: 'interviewer' }])
  })

  it('removes one person and keeps the rest', () => {
    expect(withoutMember([alice], 'u-alice')).toEqual([])
    expect(withoutMember([alice], 'u-other')).toEqual([alice])
  })
})

describe('splitting invites', () => {
  const directory: JobManager[] = [
    { id: 'creator', name: 'Justus', colour: 'grey', email: 'justus@openhr.com' },
    { id: 'u-mira', name: 'Mira', colour: 'red', email: 'mira@openhr.com' },
  ]

  it('adds company people, sends company invites for the rest, and drops the creator', () => {
    const split = splitInvites(
      ['MIRA@openhr.com', 'new@example.com', 'justus@openhr.com'],
      directory,
      'creator',
    )
    expect(split.people.map((person) => person.id)).toEqual(['u-mira'])
    expect(split.emails).toEqual(['new@example.com'])
  })
})

describe('suggestions and collapsing', () => {
  const directory: JobManager[] = [
    { id: 'a', name: 'A', colour: 'grey' },
    { id: 'b', name: 'B', colour: 'grey' },
    { id: 'c', name: 'C', colour: 'grey' },
    { id: 'd', name: 'D', colour: 'grey' },
    { id: 'e', name: 'E', colour: 'grey' },
  ]

  it('suggests people without access, up to three', () => {
    expect(suggestedPeople(directory, new Set(['b'])).map((p) => p.id)).toEqual(['a', 'c', 'd'])
  })

  it('shows the collapsed rows until expanded', () => {
    const rows = [1, 2, 3, 4, 5]
    expect(visibleRows(rows, false)).toHaveLength(COLLAPSED_ROWS)
    expect(visibleRows(rows, true)).toEqual(rows)
  })
})

describe('member menus', () => {
  it('offers levels and Revoke access to an active member', () => {
    expect(MEMBER_MENUS.active.levels).toBe(true)
    expect(MEMBER_MENUS.active.actions.map((item) => item.label)).toEqual(['Revoke access'])
  })

  it('offers levels and the invite actions to an invited member', () => {
    expect(MEMBER_MENUS.invited.levels).toBe(true)
    expect(MEMBER_MENUS.invited.actions.map((item) => item.label)).toEqual([
      'Change email',
      'Resend invite',
      'Revoke invite...',
    ])
  })

  it('offers no levels to a declined invite, which reads Options', () => {
    expect(MEMBER_MENUS.declined.levels).toBe(false)
    expect(MEMBER_MENUS.declined.actions.map((item) => item.label)).toEqual([
      'Resend invite',
      'Revoke access',
    ])
    expect(memberButtonLabel('declined', 'viewer')).toBe('Options')
    expect(memberButtonLabel('active', 'interviewer')).toBe('Review')
  })
})
