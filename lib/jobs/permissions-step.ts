import type { ApiJobMember } from './api-types'
import type { JobManager } from './types'
import type { JobMemberRole } from '../requests'

/**
 * Pure logic for the Permissions step of job creation: who is on a job's hiring
 * team, the access levels the design offers, and the menu each person gets.
 * Figma: "Permissions" 9270:376943, its invite modal 9270:377053, and the
 * per-status menus in the dev-note sheet 9270:378362.
 */

type AccessLevel = 'manage' | 'review' | 'view'

/** Levels in the order the invite modal lists them. */
const ACCESS_LEVELS: readonly AccessLevel[] = ['manage', 'review', 'view']

/** Design level -> API role. The design's own descriptions say who each is for. */
const LEVEL_ROLE: Record<AccessLevel, JobMemberRole> = {
  manage: 'hiring_manager',
  review: 'interviewer',
  view: 'viewer',
}

/** The short label on a level in the invite modal and on a member's button. */
const LEVEL_LABEL: Record<AccessLevel, string> = {
  manage: 'Manage',
  review: 'Review',
  view: 'View',
}

/** Menu rows read "Can view", "Can Review", "Can manage" (the design's capitals). */
const LEVEL_MENU_LABEL: Record<AccessLevel, string> = {
  view: 'Can view',
  review: 'Can Review',
  manage: 'Can manage',
}

/**
 * Every role a member can hold. An external recruiter has no level in the
 * modal; the dev-note sheet names it "Submit candidates", so it reads that way.
 */
const ROLE_LABEL: Record<JobMemberRole, string> = {
  hiring_manager: 'Manage',
  interviewer: 'Review',
  viewer: 'View',
  recruiter: 'Submit candidates',
}

/** The level a role stands for, or null for a role the modal cannot choose. */
function levelOfRole(role: JobMemberRole): AccessLevel | null {
  if (role === 'hiring_manager') return 'manage'
  if (role === 'interviewer') return 'review'
  if (role === 'viewer') return 'view'
  return null
}

interface AccessMember {
  userId: string
  name: string
  email: string
  role: JobMemberRole
}

/**
 * The API's team rows as members. The creator always has access and is not
 * listed by the API, so any row for them is dropped. Rows with an unknown
 * role are kept: the team is saved whole, so dropping one would revoke them.
 */
function toAccessMembers(rows: ApiJobMember[], creatorId: string | undefined): AccessMember[] {
  const seen = new Set<string>()
  const members: AccessMember[] = []
  for (const row of rows) {
    const userId = row.user_id ?? ''
    if (!userId || userId === creatorId || seen.has(userId)) continue
    seen.add(userId)
    members.push({
      userId,
      name: row.name?.trim() || row.email || 'Unknown',
      email: row.email ?? '',
      // The API documents four roles; the cast only narrows the string it sends.
      role: row.role as JobMemberRole,
    })
  }
  return members
}

/** The team with `person` on it at `role`: added if new, changed if already there. */
function withMember(
  members: AccessMember[],
  person: Pick<AccessMember, 'userId' | 'name' | 'email'>,
  role: JobMemberRole,
): AccessMember[] {
  if (!members.some((member) => member.userId === person.userId)) {
    return [...members, { ...person, role }]
  }
  return members.map((member) => (member.userId === person.userId ? { ...member, role } : member))
}

/** The team without `userId`. */
function withoutMember(members: AccessMember[], userId: string): AccessMember[] {
  return members.filter((member) => member.userId !== userId)
}

interface EmailTag {
  email: string
  valid: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

/** Turns what was typed (split on commas, semicolons or spaces) into tags, skipping repeats. */
function addEmailTags(tags: EmailTag[], typed: string): EmailTag[] {
  const next = [...tags]
  for (const piece of typed.split(/[\s,;]+/)) {
    const email = piece.trim()
    if (!email) continue
    if (next.some((tag) => tag.email.toLowerCase() === email.toLowerCase())) continue
    next.push({ email, valid: isValidEmail(email) })
  }
  return next
}

/** The addresses a send acts on: valid tags only. Invalid tags stay red and are skipped. */
function sendableEmails(tags: EmailTag[]): string[] {
  return tags.filter((tag) => tag.valid).map((tag) => tag.email)
}

interface InviteSplit {
  /** Company people to add to the job at the chosen level. */
  people: JobManager[]
  /** Addresses that are not company people: a company invite each, not attached to the job. */
  emails: string[]
}

/**
 * Sorts the sendable emails. An address that is a company person joins the job
 * as them. The creator already has access, so their address is dropped. The
 * rest are company invites.
 */
function splitInvites(
  emails: string[],
  directory: JobManager[],
  creatorId: string | undefined,
): InviteSplit {
  const people: JobManager[] = []
  const invites: string[] = []
  for (const email of emails) {
    const match = directory.find(
      (person) => person.email !== undefined && person.email.toLowerCase() === email.toLowerCase(),
    )
    if (!match?.id) {
      invites.push(email)
    } else if (match.id !== creatorId && !people.some((person) => person.id === match.id)) {
      people.push(match)
    }
  }
  return { people, emails: invites }
}

/** Company people with no access yet, in directory order: the design shows up to three. */
const SUGGESTED_LIMIT = 3

function suggestedPeople(directory: JobManager[], withAccess: Set<string>): JobManager[] {
  return directory
    .filter((person) => Boolean(person.id) && !withAccess.has(person.id ?? ''))
    .slice(0, SUGGESTED_LIMIT)
}

/** Rows shown before "See more people": the design shows the creator and two more. */
const COLLAPSED_ROWS = 3

function visibleRows<T>(rows: T[], expanded: boolean): T[] {
  return expanded ? rows : rows.slice(0, COLLAPSED_ROWS)
}

type MemberState = 'active' | 'invited' | 'declined'

type MemberAction = 'change-email' | 'resend-invite' | 'revoke-invite' | 'revoke-access'

interface MemberMenu {
  /** Whether the access levels are offered for this state. */
  levels: boolean
  /** Heading above the actions, when the design has one. */
  heading?: string
  actions: { action: MemberAction; label: string; danger: boolean }[]
}

/** Which menu each member state gets. Figma: dev-note sheet 9270:378362. */
const MEMBER_MENUS: Record<MemberState, MemberMenu> = {
  active: {
    levels: true,
    actions: [{ action: 'revoke-access', label: 'Revoke access', danger: true }],
  },
  invited: {
    levels: true,
    heading: 'Actions',
    actions: [
      { action: 'change-email', label: 'Change email', danger: false },
      { action: 'resend-invite', label: 'Resend invite', danger: false },
      { action: 'revoke-invite', label: 'Revoke invite...', danger: true },
    ],
  },
  declined: {
    levels: false,
    actions: [
      { action: 'resend-invite', label: 'Resend invite', danger: false },
      { action: 'revoke-access', label: 'Revoke access', danger: true },
    ],
  },
}

/** What a member's button reads: the level, or "Options" once the invite was declined. */
function memberButtonLabel(state: MemberState, role: JobMemberRole): string {
  return state === 'declined' ? 'Options' : ROLE_LABEL[role]
}

/** The confirm copy for a level change. The caller puts the person's name or email before it. */
const LEVEL_CONFIRM: Record<AccessLevel, { title: string; body: string }> = {
  view: {
    title: 'Change access to View?',
    body: 'will only be able to see this job and its pipeline.',
  },
  review: {
    title: 'Change access to Review?',
    body: 'will be able to see, leave notes & scores, move stages for this job',
  },
  manage: {
    title: 'Change access to Manage?',
    body: 'will have full control of this job, including publishing, exporting and inviting others.',
  },
}

export {
  ACCESS_LEVELS,
  COLLAPSED_ROWS,
  LEVEL_CONFIRM,
  LEVEL_LABEL,
  LEVEL_MENU_LABEL,
  LEVEL_ROLE,
  MEMBER_MENUS,
  ROLE_LABEL,
  addEmailTags,
  isValidEmail,
  levelOfRole,
  memberButtonLabel,
  sendableEmails,
  splitInvites,
  suggestedPeople,
  toAccessMembers,
  visibleRows,
  withMember,
  withoutMember,
}
export type {
  AccessLevel,
  AccessMember,
  EmailTag,
  InviteSplit,
  MemberAction,
  MemberMenu,
  MemberState,
}
