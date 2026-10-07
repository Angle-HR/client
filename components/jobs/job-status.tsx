import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JOB_STATUS_ORDER } from '@/lib/jobs/actions'

import type { JobStatus } from '@/lib/jobs/types'

/**
 * How each job status reads across the list and the board. Figma:
 * Table/Job-Title (6970:149719).
 *
 * Statuses have no semantic tokens in the file — the design binds them to the
 * teal/yellow/green/aqua primitives directly, so they are used directly here.
 * `tintClass` is the wash a collapsed group, a hovered header or an active
 * board column takes.
 */
interface JobStatusMeta {
  label: string
  /** Short form used in status menus: "Open", not "Open jobs". */
  shortLabel: string
  icon: string
  iconClass: string
  tintClass: string
  hoverTintClass: string
}

const JOB_STATUS_META: Record<JobStatus, JobStatusMeta> = {
  open: {
    label: 'Open jobs',
    shortLabel: 'Open',
    icon: 'play-circle-solid',
    iconClass: 'text-teal-4',
    tintClass: 'bg-[var(--color-teal-alpha-1)]',
    hoverTintClass: 'hover:bg-[var(--color-teal-alpha-1)]',
  },
  paused: {
    label: 'Paused jobs',
    shortLabel: 'Paused',
    icon: 'pause-circle-solid',
    iconClass: 'text-yellow-4',
    tintClass: 'bg-[var(--color-yellow-alpha-1)]',
    hoverTintClass: 'hover:bg-[var(--color-yellow-alpha-1)]',
  },
  draft: {
    label: 'Draft',
    shortLabel: 'Draft',
    icon: 'minus-circle-solid',
    iconClass: 'text-aqua-4',
    tintClass: 'bg-[var(--color-aqua-alpha-1)]',
    hoverTintClass: 'hover:bg-[var(--color-aqua-alpha-1)]',
  },
  closed: {
    label: 'Closed',
    shortLabel: 'Closed',
    icon: 'check-circle-solid',
    iconClass: 'text-green-4',
    tintClass: 'bg-[var(--color-green-alpha-2)]',
    hoverTintClass: 'hover:bg-[var(--color-green-alpha-2)]',
  },
  archived: {
    label: 'Archived',
    shortLabel: 'Archived',
    icon: 'stop-solid',
    iconClass: 'text-text-secondary',
    tintClass: 'bg-bg-transparent-lighter',
    hoverTintClass: 'hover:bg-bg-transparent-lighter',
  },
  expired: {
    label: 'Expired',
    shortLabel: 'Expired',
    icon: 'stop-end-solid',
    iconClass: 'text-text-secondary',
    tintClass: 'bg-bg-transparent-lighter',
    hoverTintClass: 'hover:bg-bg-transparent-lighter',
  },
}

/** The 14px status glyph plus its label, as used in group and column headers. */
function JobStatusLabel({ status, gapClass }: { status: JobStatus; gapClass: string }) {
  const meta = JOB_STATUS_META[status]
  return (
    <span className={`inline-flex items-center ${gapClass}`}>
      <span className={`inline-flex ${meta.iconClass}`}>
        <DashboardIcon name={meta.icon} size={14} />
      </span>
      <span className="text-body-xs leading-19_2 font-medium text-text-secondary">
        {meta.label}
      </span>
    </span>
  )
}

/**
 * Separator for "Design · Full-time" style labels. U+00B7 rather than the
 * design's U+22C5, which is outside the Latin subset Inter is loaded with and
 * would fall back to a wider system glyph.
 */
const DOT = '·'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * "2026-11-01" → "01 Nov 2026". Built by hand because `Intl` abbreviates
 * September as "Sept" in en-GB, and the design uses three-letter months.
 */
function formatPostedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

export { DOT, JOB_STATUS_META, JOB_STATUS_ORDER, JobStatusLabel, formatPostedDate }
export type { JobStatusMeta }
