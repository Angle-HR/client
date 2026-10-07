import type { Job, JobStatus } from './types'
import type { AvatarColour } from '@/components/ui'

/**
 * Filtering and sorting for the jobs list. Figma: "Search, Filtering and
 * Sorting" (8440:566101).
 *
 * Every filter is "field is / is not any of these values". Fields without a
 * natural list of values (dates, counts) are offered as ranges.
 */

type FilterField =
  | 'status'
  | 'assignee'
  | 'location'
  | 'team'
  | 'employmentType'
  | 'createdBy'
  | 'createdOn'
  | 'managedBy'
  | 'applicants'

/** `is` matches any chosen value, `isNot` none of them, `and` every one of them. */
type FilterOperator = 'is' | 'isNot' | 'and'

interface JobFilter {
  field: FilterField
  operator: FilterOperator
  values: string[]
}

interface FilterOption {
  value: string
  label: string
  /** People options show an initials avatar. */
  avatarColour?: AvatarColour
  avatarUrl?: string
  /** Status options show the status glyph. */
  status?: JobStatus
}

interface FilterFieldConfig {
  /** Row label in the filter menu. */
  label: string
  /** Shorter label on the chip, e.g. "Created" for "Created by". */
  chipLabel: string
  /** Word between the field and its value on the chip. */
  operatorLabel: string
  icon: string
  /** Fields with long lists get a search box in their picker. */
  searchable: boolean
  /** Short fixed lists open as a flyout beside the menu instead of replacing it. */
  flyout?: boolean
}

/** Menu order, with the labels and icons from the design. */
const FILTER_FIELDS: Record<FilterField, FilterFieldConfig> = {
  status: {
    label: 'Status',
    chipLabel: 'Status',
    operatorLabel: 'by',
    icon: 'tag-solid',
    searchable: false,
    flyout: true,
  },
  assignee: {
    label: 'Assigned to…',
    chipLabel: 'Assigned',
    operatorLabel: 'to',
    icon: 'user-circle-solid',
    searchable: true,
  },
  location: {
    label: 'Location',
    chipLabel: 'Location',
    operatorLabel: 'is',
    icon: 'location-pin-solid',
    searchable: true,
  },
  team: {
    label: 'Team',
    chipLabel: 'Team',
    operatorLabel: 'is',
    icon: 'user-group-solid',
    searchable: true,
  },
  employmentType: {
    label: 'Employment type',
    chipLabel: 'Employment type',
    operatorLabel: 'is',
    icon: 'briefcase-solid',
    searchable: false,
    flyout: true,
  },
  createdBy: {
    label: 'Created by',
    chipLabel: 'Created',
    operatorLabel: 'by',
    icon: 'plus-circle-solid',
    searchable: true,
  },
  createdOn: {
    label: 'Created on',
    chipLabel: 'Created',
    operatorLabel: 'on',
    icon: 'calendar-solid',
    searchable: false,
  },
  managedBy: {
    label: 'Managed by',
    chipLabel: 'Managed',
    operatorLabel: 'by',
    icon: 'users-solid',
    searchable: true,
  },
  applicants: {
    label: 'Number of applicant',
    chipLabel: 'Applicants',
    operatorLabel: 'is',
    icon: 'hashtag-solid',
    searchable: false,
  },
}

const FILTER_FIELD_ORDER = Object.keys(FILTER_FIELDS) as FilterField[]

const STATUS_LABELS: Record<JobStatus, string> = {
  open: 'Open jobs',
  paused: 'Paused jobs',
  draft: 'Draft',
  closed: 'Closed',
  archived: 'Archived',
  expired: 'Expired',
}

const STATUS_OPTION_ORDER: JobStatus[] = [
  'open',
  'paused',
  'draft',
  'closed',
  'archived',
  'expired',
]

const DAY_MS = 24 * 60 * 60 * 1000

/** Created-on ranges, newest first. Each job falls in exactly one. */
const DATE_RANGES: { value: string; label: string; maxAgeDays: number }[] = [
  { value: '7d', label: 'Last 7 days', maxAgeDays: 7 },
  { value: '30d', label: 'Last 30 days', maxAgeDays: 30 },
  { value: '12m', label: 'Last 12 months', maxAgeDays: 365 },
  { value: 'older', label: 'Older than 12 months', maxAgeDays: Infinity },
]

/** Applicant-count ranges. Each job falls in exactly one. */
const APPLICANT_RANGES: { value: string; label: string; max: number }[] = [
  { value: '0', label: 'No applicants', max: 0 },
  { value: '1-10', label: '1–10', max: 10 },
  { value: '11-25', label: '11–25', max: 25 },
  { value: '26+', label: '26 or more', max: Infinity },
]

function dateRange(isoDate: string, today: Date): string {
  // Jobs dated in the future (scheduled postings) count as the newest range.
  const ageDays = (today.getTime() - new Date(`${isoDate}T00:00:00Z`).getTime()) / DAY_MS
  return (DATE_RANGES.find((range) => ageDays <= range.maxAgeDays) ?? DATE_RANGES[0]!).value
}

function applicantRange(count: number): string {
  return (APPLICANT_RANGES.find((range) => count <= range.max) ?? APPLICANT_RANGES[0]!).value
}

/**
 * The values a job has for a field, as the strings a filter compares against.
 * Most fields have exactly one; a job with several managers has one per manager.
 */
function fieldValues(job: Job, field: FilterField, today: Date): string[] {
  switch (field) {
    case 'status':
      return [job.status]
    case 'assignee':
    case 'managedBy':
      return job.managers.map((manager) => manager.name)
    case 'createdBy':
      return [job.createdBy.name]
    case 'location':
      return [job.location]
    case 'team':
      return [job.department]
    case 'employmentType':
      return [job.employmentType]
    case 'createdOn':
      return [dateRange(job.postedAt, today)]
    case 'applicants':
      return [applicantRange(job.totalApplicants)]
  }
}

/** The values a field can be filtered by, drawn from the jobs themselves. */
function filterOptions(jobs: Job[], field: FilterField): FilterOption[] {
  if (field === 'status') {
    return STATUS_OPTION_ORDER.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      status,
    }))
  }
  if (field === 'createdOn') return DATE_RANGES.map(({ value, label }) => ({ value, label }))
  if (field === 'applicants') return APPLICANT_RANGES.map(({ value, label }) => ({ value, label }))

  const seen = new Map<string, FilterOption>()
  for (const job of jobs) {
    const people =
      field === 'createdBy'
        ? [job.createdBy]
        : field === 'assignee' || field === 'managedBy'
          ? job.managers
          : null
    if (people) {
      for (const person of people) {
        if (!seen.has(person.name)) {
          seen.set(person.name, {
            value: person.name,
            label: person.name,
            avatarColour: person.colour,
            avatarUrl: person.avatarUrl,
          })
        }
      }
      continue
    }
    for (const value of fieldValues(job, field, new Date())) {
      if (!seen.has(value)) seen.set(value, { value, label: value })
    }
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label))
}

/** Jobs that pass every filter. A filter with no values chosen lets everything through. */
function applyFilters(jobs: Job[], filters: JobFilter[], today: Date = new Date()): Job[] {
  const active = filters.filter((filter) => filter.values.length > 0)
  if (active.length === 0) return jobs
  return jobs.filter((job) =>
    active.every((filter) => {
      const jobValues = fieldValues(job, filter.field, today)
      // "And" only differs from "is" for fields a job can have several of.
      if (filter.operator === 'and')
        return filter.values.every((value) => jobValues.includes(value))
      const matches = jobValues.some((value) => filter.values.includes(value))
      return filter.operator === 'is' ? matches : !matches
    }),
  )
}

/** Chip text for a filter's values: "Alice", or "Alice and 2 others". */
function summariseValues(options: FilterOption[], values: string[]): string {
  const labels = values.map(
    (value) => options.find((option) => option.value === value)?.label ?? value,
  )
  const [first, ...rest] = labels
  if (!first) return 'Select…'
  if (rest.length === 0) return first
  return `${first} and ${rest.length} ${rest.length === 1 ? 'other' : 'others'}`
}

type SortField =
  | 'createdBy'
  | 'managedBy'
  | 'totalApplicants'
  | 'newApplicants'
  | 'dateCreated'
  | 'datePosted'
  | 'closingDate'
  | 'lastViewed'
  | 'lastModified'

type SortDirection = 'asc' | 'desc'

interface JobSort {
  field: SortField
  direction: SortDirection
}

const SORT_FIELDS: Record<SortField, { label: string; icon: string }> = {
  createdBy: { label: 'Created by (A-Z)', icon: 'user-circle-solid' },
  managedBy: { label: 'Managed by (A-Z)', icon: 'user-circle-solid' },
  totalApplicants: { label: 'Total Applicant', icon: 'hashtag-solid' },
  newApplicants: { label: 'New Applicant', icon: 'hashtag-solid' },
  dateCreated: { label: 'Date Created', icon: 'calendar-solid' },
  datePosted: { label: 'Date posted', icon: 'calendar-solid' },
  closingDate: { label: 'Closing date', icon: 'calendar-solid' },
  lastViewed: { label: 'Last viewed', icon: 'clock-outline' },
  lastModified: { label: 'Last modified', icon: 'clock-outline' },
}

const SORT_FIELD_ORDER = Object.keys(SORT_FIELDS) as SortField[]

function sortKey(job: Job, field: SortField): string | number {
  switch (field) {
    case 'createdBy':
      return job.createdBy.name.toLowerCase()
    case 'managedBy':
      return (job.managers[0]?.name ?? '').toLowerCase()
    case 'totalApplicants':
      return job.totalApplicants
    case 'newApplicants':
      return job.newApplicants
    case 'dateCreated':
      return job.createdAt
    case 'datePosted':
      return job.postedAt
    case 'lastViewed':
      return job.lastViewedAt
    case 'lastModified':
      return job.lastModifiedAt
    case 'closingDate':
      return job.closingDate ?? ''
  }
}

/** A sorted copy. Ties keep their original order, so sorting is stable within groups. */
function applySort(jobs: Job[], sort: JobSort | null): Job[] {
  if (!sort) return jobs
  const sign = sort.direction === 'asc' ? 1 : -1
  return [...jobs].sort((a, b) => {
    const left = sortKey(a, sort.field)
    const right = sortKey(b, sort.field)
    // Jobs with no closing date go last whichever way the list is sorted.
    if (left === '' && right !== '') return 1
    if (right === '' && left !== '') return -1
    return left < right ? -sign : left > right ? sign : 0
  })
}

export {
  FILTER_FIELDS,
  FILTER_FIELD_ORDER,
  SORT_FIELDS,
  SORT_FIELD_ORDER,
  applyFilters,
  applySort,
  filterOptions,
  summariseValues,
}
export type {
  FilterField,
  FilterOperator,
  FilterOption,
  JobFilter,
  JobSort,
  SortDirection,
  SortField,
}
