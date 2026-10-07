import type { Job, JobStatus } from './types'

/**
 * Rules for acting on jobs, lifted from the designer's frames and dev notes so
 * the list, the board, the menus and the toolbar all agree.
 */

/** Group and column order, per the dev note on the job table. */
const JOB_STATUS_ORDER: JobStatus[] = ['open', 'paused', 'draft', 'closed', 'archived', 'expired']

/**
 * Which statuses a job in a given status can move to. Not simply "every other
 * status": closed and draft jobs cannot be paused, and archived jobs cannot go
 * straight to paused either. Figma: the "muselection state" frame
 * (7964:212845).
 */
const STATUS_TARGETS: Record<JobStatus, JobStatus[]> = {
  open: ['paused', 'closed', 'draft', 'archived', 'expired'],
  paused: ['open', 'closed', 'draft', 'archived', 'expired'],
  closed: ['open', 'draft', 'archived', 'expired'],
  draft: ['open', 'closed', 'archived', 'expired'],
  archived: ['open', 'closed', 'draft', 'expired'],
  expired: ['open', 'paused', 'closed', 'draft', 'archived'],
}

/** Menu order for status lists, which differs from the table's group order. */
const STATUS_MENU_ORDER: JobStatus[] = ['open', 'paused', 'closed', 'draft', 'archived', 'expired']

/**
 * The statuses offered for a selection. A selection within one status gets
 * that status's targets; a selection spanning several gets every status.
 */
function statusTargets(jobs: Pick<Job, 'status'>[]): JobStatus[] {
  const statuses = new Set(jobs.map((job) => job.status))
  if (statuses.size !== 1) return STATUS_MENU_ORDER
  const [only] = statuses
  return only ? STATUS_TARGETS[only] : STATUS_MENU_ORDER
}

const SINGLE_TOAST: Record<JobStatus, string> = {
  open: 'Job reopened',
  paused: 'Job paused',
  closed: 'Job closed',
  draft: 'Moved to draft',
  archived: 'Archived',
  expired: 'Move to expired',
}

const MULTI_TOAST: Record<JobStatus, string> = {
  open: 'reopened',
  paused: 'paused',
  closed: 'closed',
  draft: 'moved to draft',
  archived: 'archived',
  expired: 'moved to expired',
}

/** Toast copy after a status change, e.g. "Job reopened" or "3 jobs paused". */
function statusChangeMessage(status: JobStatus, count: number): string {
  return count === 1 ? SINGLE_TOAST[status] : `${count} jobs ${MULTI_TOAST[status]}`
}

/**
 * Search matches a job's title or department. Title matches rank above
 * department-only matches, per the dev note on the search field.
 */
function searchJobs(jobs: Job[], query: string): Job[] {
  const term = query.trim().toLowerCase()
  if (!term) return jobs
  const inTitle = jobs.filter((job) => job.title.toLowerCase().includes(term))
  const inDepartment = jobs.filter(
    (job) => !job.title.toLowerCase().includes(term) && job.department.toLowerCase().includes(term),
  )
  return [...inTitle, ...inDepartment]
}

interface JobExportRow {
  title: string
  department: string
  status: JobStatus
  managedBy: string
  postedAt: string
  closingDate: string
  totalApplicants: number
  newApplicants: number
}

function toExportRow(job: Job): JobExportRow {
  return {
    title: job.title,
    department: job.department,
    status: job.status,
    managedBy: job.managers.map((manager) => manager.name).join('; '),
    postedAt: job.postedAt,
    closingDate: job.closingDate ?? '',
    totalApplicants: job.totalApplicants,
    newApplicants: job.newApplicants,
  }
}

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** Serialises jobs for the Export modal: titles, departments, status, managers, dates, applicant counts. */
function exportJobs(jobs: Job[], format: 'csv' | 'json'): string {
  const rows = jobs.map(toExportRow)
  if (format === 'json') return JSON.stringify(rows, null, 2)
  const header = [
    'Title',
    'Department',
    'Status',
    'Managed by',
    'Date posted',
    'Closing date',
    'Total applicants',
    'New applicants',
  ]
  const lines = rows.map((row) => Object.values(row).map(csvCell).join(','))
  return [header.join(','), ...lines].join('\n')
}

/**
 * A date as yyyy-mm-dd in the user's own timezone. `toISOString` would report
 * the UTC day, which is yesterday for anyone east of Greenwich after midnight.
 */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** A valid calendar date that is not in the past, as yyyy-mm-dd; otherwise null. */
function parseFutureDate(day: string, month: string, year: string, today: Date): string | null {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return null
  const d = Number(day)
  const m = Number(month)
  const y = Number(year)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null
  }
  const startOfToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  if (date.getTime() < startOfToday) return null
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const US_LOCATIONS = new Set(['usa', 'us', 'united states'])

/**
 * Whether deleting these jobs would delete United States hiring records, which
 * is when the delete confirmation shows the EEOC retention notice. Until
 * applicants carry their own country, a job based in the US stands for it.
 */
function needsRetentionNotice(jobs: Pick<Job, 'location' | 'totalApplicants'>[]): boolean {
  return jobs.some(
    (job) => job.totalApplicants > 0 && US_LOCATIONS.has(job.location.trim().toLowerCase()),
  )
}

export {
  JOB_STATUS_ORDER,
  STATUS_TARGETS,
  exportJobs,
  needsRetentionNotice,
  parseFutureDate,
  searchJobs,
  statusChangeMessage,
  statusTargets,
  toIsoDate,
}
