'use client'

import { useRef, useState, type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { GroupLabel, JOB_STATUS_META, formatPostedDate, dotted } from '@/components/jobs/job-status'
import { ManagersChip } from '@/components/jobs/managers-chip'
import { Checkbox, Chip } from '@/components/ui'

import type { GroupMeta } from '@/components/jobs/job-status'
import type { Job, JobStatus } from '@/lib/jobs/types'

/**
 * The list view of the jobs page: one collapsible group per status, with the
 * column labels riding on the first group's header. Figma: Table/Job-Title
 * (6970:149719) for the headers, Table/Jobs-Item (6970:150550) for the rows.
 *
 * Every column right of the department chip has a fixed width in the design,
 * which is what keeps the header labels and the row cells aligned without a
 * real <table> grid.
 */

interface JobGroup {
  status: JobStatus
  jobs: Job[]
}

/** `range` is true when Shift was held, to extend from the last selection. */
type SelectJob = (jobId: string, options: { range: boolean }) => void

/** Opens the row's action menu, anchored to the button that was pressed. */
type OpenJobMenu = (jobId: string, anchor: DOMRect) => void

interface JobsTableProps {
  groups: JobGroup[]
  selectedIds: ReadonlySet<string>
  /** The job whose menu is open, so its trigger can show as pressed. */
  menuJobId: string | null
  onSelect: SelectJob
  onOpenMenu: OpenJobMenu
}

const cellText = 'text-body-xs leading-19_2 font-medium text-text-secondary'

// A selected row keeps its blue wash on hover and takes the neutral hover wash
// on top of it, exactly as the design stacks the two fills.
const rowRest = 'hover:bg-bg-transparent-light'
const rowSelected =
  'bg-blue-alpha-5 hover:bg-[image:linear-gradient(var(--bg-transparent-light),var(--bg-transparent-light))]'

function ColumnLabels() {
  return (
    <div className="flex h-full shrink-0 items-center gap-[2px]">
      <span role="columnheader" className={`w-[100px] px-[12px] ${cellText}`}>
        Managed by
      </span>
      <span role="columnheader" className={`w-[130px] px-[12px] ${cellText}`}>
        Location
      </span>
      <span role="columnheader" className={`w-[111px] px-[12px] ${cellText}`}>
        Total Applicant
      </span>
      <span role="columnheader" className={`w-[60px] px-[12px] ${cellText}`}>
        New
      </span>
      <span role="columnheader" className={`w-[100px] px-[12px] ${cellText}`}>
        Date posted
      </span>
      <span className="w-[32px]" />
    </div>
  )
}

interface GroupHeaderProps {
  meta: GroupMeta
  count: number
  collapsed: boolean
  /** Column labels, shown on the first group's header only. */
  columnLabels?: ReactNode
  onToggle: () => void
}

function GroupHeader({ meta, count, collapsed, columnLabels, onToggle }: GroupHeaderProps) {
  // Open groups rest on a neutral wash and take the group's tint on hover;
  // collapsed groups wear the tint all the time. Both gain a hairline on hover,
  // drawn as an inset shadow so it does not shift the label.
  const surface = collapsed
    ? `${meta.tintClass} hover:shadow-[inset_0_-1px_0_var(--border-transparent-light)]`
    : `bg-bg-transparent-lighter ${meta.hoverTintClass} hover:shadow-[inset_0_-1px_0_var(--border-transparent-lighter)]`

  return (
    // Sticks to the top of the scroll area while its group is in view. The
    // opaque backing keeps rows from showing through the translucent wash.
    <div role="row" className="sticky top-0 z-[1] shrink-0 bg-bg-secondary">
      <div
        className={`flex h-[32px] items-center gap-[2px] px-[16px] transition-colors ${surface}`}
      >
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
          className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-[8px] px-[2px] text-left"
        >
          <span className="inline-flex shrink-0 text-text-secondary">
            <DashboardIcon name={collapsed ? 'chev-right-solid' : 'chev-down-solid'} size={10} />
          </span>
          <span className="inline-flex items-center gap-[3px]">
            <GroupLabel meta={meta} gapClass="gap-[2px]" />
            {collapsed ? (
              <span className="relative top-px inline-flex items-center gap-[3px] text-caption-m leading-17_6 text-text-tertiary">
                <span aria-hidden="true">·</span>
                {count}
              </span>
            ) : null}
          </span>
        </button>
        {columnLabels}
      </div>
    </div>
  )
}

interface JobRowProps {
  job: Job
  selected: boolean
  menuOpen: boolean
  onSelect: SelectJob
  onOpenMenu: OpenJobMenu
}

function JobRow({ job, selected, menuOpen, onSelect, onOpenMenu }: JobRowProps) {
  // The checkbox's change event does not carry modifier keys, so the click
  // that precedes it records whether Shift was down.
  const shiftHeld = useRef(false)

  return (
    <div
      role="row"
      aria-selected={selected}
      className={`group flex h-[40px] shrink-0 items-center gap-[2px] px-[16px] transition-colors ${selected ? rowSelected : rowRest}`}
    >
      <div role="cell" className="flex h-full min-w-0 flex-1 items-center gap-[4px]">
        {/* The checkbox only shows on hover or once the row is selected. */}
        <span
          className="inline-flex"
          onClickCapture={(event) => {
            shiftHeld.current = event.shiftKey
          }}
        >
          <Checkbox
            size="sm"
            checked={selected}
            onChange={() => onSelect(job.id, { range: shiftHeld.current })}
            aria-label={`Select ${job.title}`}
            className={
              selected
                ? ''
                : 'opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'
            }
          />
        </span>
        <span className="min-w-0 flex-1 truncate py-[4px] text-body-s leading-19_5 font-medium text-text-primary">
          {job.title}
        </span>
      </div>
      <div role="cell" className="flex h-full shrink-0 items-center px-[12px]">
        <Chip
          tone="secondary"
          label={dotted(job.department, job.employmentType)}
          icon={
            <span className="inline-flex text-text-tertiary">
              <DashboardIcon name="user-group-solid" size={12} />
            </span>
          }
        />
      </div>
      <div role="cell" className="flex h-full w-[100px] shrink-0 items-center px-[12px]">
        <ManagersChip managers={job.managers} />
      </div>
      <div role="cell" className={`w-[130px] shrink-0 truncate px-[12px] ${cellText}`}>
        {dotted(job.location, job.workplace)}
      </div>
      <div role="cell" className={`w-[111px] shrink-0 px-[12px] ${cellText}`}>
        {job.totalApplicants}
      </div>
      <div role="cell" className={`w-[60px] shrink-0 px-[12px] ${cellText}`}>
        {job.newApplicants}
      </div>
      <div role="cell" className={`w-[100px] shrink-0 px-[12px] ${cellText}`}>
        {formatPostedDate(job.postedAt)}
      </div>
      <div role="cell" className="flex h-full w-[32px] shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label={`More actions for ${job.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) => onOpenMenu(job.id, event.currentTarget.getBoundingClientRect())}
          className={`inline-flex cursor-pointer items-center justify-center rounded-xs-4 p-[6px] transition-colors hover:bg-bg-transparent-light hover:text-text-primary ${menuOpen ? 'bg-bg-transparent-light text-text-primary' : 'text-text-secondary'}`}
        >
          <DashboardIcon name="ellipsis-horizontal-solid" size={11} />
        </button>
      </div>
    </div>
  )
}

function JobsTable({ groups, selectedIds, menuJobId, onSelect, onOpenMenu }: JobsTableProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<JobStatus>>(new Set())

  function toggleGroup(status: JobStatus) {
    setCollapsed((previous) => {
      const next = new Set(previous)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  return (
    <div role="table" aria-label="Jobs" className="flex min-w-[900px] flex-col">
      {groups.map((group, index) => {
        const isCollapsed = collapsed.has(group.status)
        return (
          <div key={group.status} role="rowgroup" className="flex flex-col">
            <GroupHeader
              meta={JOB_STATUS_META[group.status]}
              count={group.jobs.length}
              collapsed={isCollapsed}
              columnLabels={index === 0 ? <ColumnLabels /> : null}
              onToggle={() => toggleGroup(group.status)}
            />
            {isCollapsed
              ? null
              : group.jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    selected={selectedIds.has(job.id)}
                    menuOpen={menuJobId === job.id}
                    onSelect={onSelect}
                    onOpenMenu={onOpenMenu}
                  />
                ))}
          </div>
        )
      })}
    </div>
  )
}

export { GroupHeader, JobsTable, cellText, rowRest, rowSelected }
export type { JobGroup, JobsTableProps, OpenJobMenu, SelectJob }
