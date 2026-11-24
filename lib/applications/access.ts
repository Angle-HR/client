/** A row of `GET /jobs/{id}/members`, as the members endpoint sends it. */
interface JobMemberRow {
  user_id?: string
  role?: string
}

interface DecisionAccess {
  /** The signed-in person (`/hiring/me`). Unknown until it loads. */
  meUserId: string | undefined
  /** The job's creator (`created_by`). The creator is not in the members list. */
  creatorId: string | undefined
  members: ReadonlyArray<JobMemberRow>
  /** The permissions `/hiring/me` lists for this person. */
  permissions: ReadonlyArray<string> | undefined
}

/** Team roles the server lets change an application's status. */
const DECIDING_ROLES: ReadonlyArray<string> = ['hiring_manager', 'recruiter']

/** A permission that lets its holder change any job's applications. */
const MANAGE_ANY_PERMISSION = 'job.manage_any'

/**
 * Whether the signed-in person may move or disqualify this job's applications.
 * The server allows the job's creator, a hiring manager or recruiter on the
 * team, and anyone with job.manage_any. Everyone else can view and download,
 * so their Move to and Disqualify controls are disabled (01 permissions matrix).
 */
function canDecideApplications(access: DecisionAccess): boolean {
  const { meUserId, creatorId, members, permissions } = access
  if (!meUserId) return false
  if (creatorId === meUserId) return true
  if (permissions?.includes(MANAGE_ANY_PERMISSION)) return true
  return members.some(
    (member) => member.user_id === meUserId && DECIDING_ROLES.includes(member.role ?? ''),
  )
}

export { canDecideApplications }
export type { DecisionAccess, JobMemberRow }
