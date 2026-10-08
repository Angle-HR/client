/**
 * What the signed-in person may do with jobs.
 *
 * Figma: "Bulk actions and Multi-selection" (7964:212811), whose note says a
 * user with limited permission gets the selection toolbar without "Change
 * closing date" — and that this will grow once role-based access is flexible.
 * That is the only difference the design draws, so it is the only flag here.
 *
 * There is no permissions endpoint yet: `requests.getJobPermissions` resolves
 * with FULL_PERMISSIONS, and swapping in the API means changing that function.
 */
interface JobPermissions {
  /** Whether the selection toolbar offers "Change closing date". */
  canChangeClosingDate: boolean
}

const FULL_PERMISSIONS: JobPermissions = { canChangeClosingDate: true }

const LIMITED_PERMISSIONS: JobPermissions = { canChangeClosingDate: false }

/**
 * Lets the limited state be reached before the API exists: `?permissions=limited`
 * on the jobs page. Anything else leaves what the server (or fixture) said.
 */
function withPermissionsOverride(
  permissions: JobPermissions,
  override: string | null,
): JobPermissions {
  if (override === 'limited') return LIMITED_PERMISSIONS
  if (override === 'full') return FULL_PERMISSIONS
  return permissions
}

/** Whether the toolbar shows "Change closing date" for this selection. */
function canChangeClosingDate(
  permissions: JobPermissions,
  selection: { status: string }[],
): boolean {
  // Only an open job has a closing date to change.
  return permissions.canChangeClosingDate && selection.some((job) => job.status === 'open')
}

export { FULL_PERMISSIONS, LIMITED_PERMISSIONS, canChangeClosingDate, withPermissionsOverride }
export type { JobPermissions }
