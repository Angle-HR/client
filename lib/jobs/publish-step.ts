import { LEVEL_LABEL, levelOfRole } from './permissions-step'

import type { ApiPublishCheck, ApiPublishIssue } from './api-types'
import type { AccessLevel, AccessMember } from './permissions-step'
import type { JobManager } from './types'

/**
 * Turns the API's compliance check into what the Publish step draws, and the
 * team into the header's avatars. Figma: "Publish Job" 9270:377288, the status
 * states in 9270:394633 (9270:377457 unverified, 9270:377499 not compliant).
 */

/** The three states the status row can show. */
type ComplianceState = 'compliant' | 'unverified' | 'not-compliant'

interface ComplianceView {
  state: ComplianceState
  /** One line per problem, or the single "No issues found." when there are none. */
  bullets: string[]
}

/** The code the API gives an account that has not been verified yet. */
const UNVERIFIED_CODE = 'company_not_verified'

// Copy as drawn: the status rows' sub-text. The API's own wording is not shown.
const UNVERIFIED_BULLET = 'Unverified account can’t post job'
const COMPLIANT_BULLET = 'No issues found.'

function issueText(issue: ApiPublishIssue): string {
  return issue.message?.trim() || issue.code || 'Issue'
}

/**
 * The status row for a check. Null while the check has not loaded. An
 * unverified company shows only that reason, as drawn; any other blocking
 * issue or warning shows as one bullet each.
 */
function complianceView(check: ApiPublishCheck | undefined): ComplianceView | null {
  if (!check) return null
  const blocking = check.blocking ?? []
  const warnings = check.warnings ?? []

  if (blocking.some((issue) => issue.code === UNVERIFIED_CODE)) {
    return { state: 'unverified', bullets: [UNVERIFIED_BULLET] }
  }
  if (blocking.length > 0 || warnings.length > 0) {
    return {
      state: 'not-compliant',
      bullets: [...blocking, ...warnings].map(issueText),
    }
  }
  return { state: 'compliant', bullets: [COMPLIANT_BULLET] }
}

/** Whether a publish button can be pressed: the check has loaded and the company is verified. */
function canPublish(view: ComplianceView | null): boolean {
  return view !== null && view.state !== 'unverified'
}

/** One person in the header's avatar stack, with the access they hold on the job. */
interface HeaderMember {
  id: string
  name: string
  level: AccessLevel
}

/** The creator first, as the one who always has access, then the team as the API lists it. */
function headerTeam(creator: JobManager | null, members: AccessMember[]): HeaderMember[] {
  const creatorRow: HeaderMember[] = creator
    ? [{ id: creator.id ?? creator.name, name: creator.name, level: 'manage' }]
    : []
  const memberRows = members.map((member) => ({
    id: member.userId,
    name: member.name,
    level: levelOfRole(member.role) ?? 'view',
  }))
  return [...creatorRow, ...memberRows]
}

/** The header tooltip's second line, e.g. "Can manage this job". */
function accessSentence(level: AccessLevel): string {
  return `Can ${LEVEL_LABEL[level].toLowerCase()} this job`
}

export { UNVERIFIED_CODE, accessSentence, canPublish, complianceView, headerTeam }
export type { ComplianceState, ComplianceView, HeaderMember }
