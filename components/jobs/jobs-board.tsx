'use client'

import { useState, type DragEvent, type MouseEvent } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  DOT,
  JOB_STATUS_META,
  JobStatusLabel,
  formatPostedDate,
} from '@/components/jobs/job-status'
import { Avatar, Chip } from '@/components/ui'

import type { JobGroup, SelectJob } from '@/components/jobs/jobs-table'
import type { Job, JobStatus } from '@/lib/jobs/types'

/**
 * The board (grid) view of the jobs page: a Kanban with one column per status.
 * Figma: Table/Grid-coloums (7122:158182) for the column, the Grid layout of
 * Table/Job-Title for its header and of Table/Jobs-Item for the card; the drag
 * states are the "On drag between grids" frame (7964:212736).
 *
 * Dragging a card to another column changes the job's status. Columns are
 * always ordered by date, so a drop lands wherever the date puts it rather
 * than where the pointer was — which is what the overlay label says.
 */

interface JobsBoardProps {
  groups: JobGroup[]
  selectedIds: ReadonlySet<string>
  /** The column whose menu is open, so its trigger can show as pressed. */
  menuStatus: JobStatus | null
  onSelect: SelectJob
  onMoveJob: (jobId: string, status: JobStatus) => void
  onOpenColumnMenu: (status: JobStatus, anchor: DOMRect) => void
}

// Card surfaces. Each state stacks a wash over the card's own background the
// way the design stacks fills, so they stay correct in dark mode. The classes
// are spelled out in full because Tailwind only sees literal class names.
const CARD_SURFACE = {
  rest: 'outline-border-light hover:bg-[image:linear-gradient(var(--bg-transparent-lighter),var(--bg-transparent-lighter))]',
  selected:
    'outline-transparent bg-[image:linear-gradient(var(--color-blue-alpha-5),var(--color-blue-alpha-5))] hover:bg-[image:linear-gradient(var(--bg-transparent-light),var(--bg-transparent-light)),linear-gradient(var(--color-blue-alpha-5),var(--color-blue-alpha-5))]',
  // What a card leaves behind in its column while it is being dragged.
  placeholder:
    'outline-border-light bg-[image:linear-gradient(var(--bg-transparent-medium),var(--bg-transparent-medium))]',
}

interface JobCardProps {
  job: Job
  selected: boolean
  dragging: boolean
  onSelect: SelectJob
  onDragStart: (jobId: string) => void
  onDragEnd: () => void
}

function JobCard({ job, selected, dragging, onSelect, onDragStart, onDragEnd }: JobCardProps) {
  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData('text/plain', job.id)
    event.dataTransfer.effectAllowed = 'move'
    // Deferred so the browser snapshots the full card as the drag image before
    // the card in the column turns into its placeholder.
    window.setTimeout(() => onDragStart(job.id), 0)
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    onSelect(job.id, { range: event.shiftKey })
  }

  const surface = dragging
    ? CARD_SURFACE.placeholder
    : selected
      ? CARD_SURFACE.selected
      : CARD_SURFACE.rest

  return (
    // The hairline is an inset outline so it takes no layout space, like the
    // Figma stroke it stands for.
    <article
      draggable
      aria-pressed={selected}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          onSelect(job.id, { range: event.shiftKey })
        }
      }}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`flex w-full shrink-0 cursor-grab rounded-lg-10 bg-bg-secondary p-[4px] shadow-slots-xsmall outline-[0.5px] -outline-offset-[0.5px] transition-colors active:cursor-grabbing ${surface}`}
    >
      <div
        className={`flex min-w-0 flex-1 flex-col items-start gap-[4px] p-[6px] ${dragging ? 'invisible' : ''}`}
      >
        {/* Figma trims the title to its cap height: a 19px box with the text
            sitting 1px above centre. */}
        <h3 className="flex h-[19px] w-full items-center px-[2px] pb-[2px]">
          <span className="truncate text-body-s leading-19_5 font-medium text-text-primary">
            {job.title}
          </span>
        </h3>
        <Chip
          tone="secondary"
          label={`${job.department} ${DOT} ${job.employmentType}`}
          icon={<DashboardIcon name="user-group-solid" size={12} />}
        />
        <Chip
          fill="transparent"
          label={`${job.location} ${DOT} ${job.workplace}`}
          icon={<DashboardIcon name="location-pin-solid" size={12} />}
        />
        <Chip
          fill="transparent"
          label={`${job.totalApplicants} (${job.newApplicants})`}
          aria-label={`${job.totalApplicants} applicants, ${job.newApplicants} new`}
          icon={<DashboardIcon name="users-solid" size={12} />}
        />
        <Chip
          fill="transparent"
          tone="secondary"
          label={job.manager.name}
          icon={
            <Avatar
              size={14}
              type="initials"
              text={job.manager.name.charAt(0)}
              colour={job.manager.colour}
            />
          }
        />
        <Chip
          fill="transparent"
          label={formatPostedDate(job.postedAt)}
          icon={<DashboardIcon name="clock-solid" size={12} />}
        />
      </div>
    </article>
  )
}

interface BoardColumnProps {
  group: JobGroup
  selectedIds: ReadonlySet<string>
  draggingId: string | null
  /** True while a card from another column is held over this one. */
  dropTarget: boolean
  menuOpen: boolean
  onOpenMenu: (status: JobStatus, anchor: DOMRect) => void
  onSelect: SelectJob
  onDragStart: (jobId: string) => void
  onDragEnd: () => void
  onDragOver: (status: JobStatus) => void
  onDragLeave: (status: JobStatus) => void
  onDrop: (status: JobStatus, jobId: string) => void
}

function BoardColumn({
  group,
  selectedIds,
  draggingId,
  dropTarget,
  menuOpen,
  onOpenMenu,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: BoardColumnProps) {
  const meta = JOB_STATUS_META[group.status]

  return (
    <section
      aria-label={meta.label}
      onDragOver={(event) => {
        if (!draggingId) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        onDragOver(group.status)
      }}
      onDragLeave={(event) => {
        // Moving between a column's own children fires leave events too.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDragLeave(group.status)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop(group.status, event.dataTransfer.getData('text/plain'))
      }}
      className={`flex w-[334px] shrink-0 flex-col gap-[10px] rounded-xs-4 p-[8px] transition-colors ${dropTarget ? meta.tintClass : 'bg-bg-transparent-lighter'}`}
    >
      <header
        className={`flex h-[32px] shrink-0 items-center justify-between gap-[4px] pr-[2px] pl-[10px] transition-colors ${dropTarget ? '' : meta.hoverTintClass}`}
      >
        <span className="inline-flex items-center gap-[3px]">
          <JobStatusLabel status={group.status} gapClass="gap-[6px]" />
          {/* Baseline-aligned to the label in the design, which lands the
              smaller counter 1px below the label's centre line. */}
          <span className="relative top-px inline-flex items-center gap-[3px] text-caption-s leading-16 text-text-tertiary">
            <span aria-hidden="true">·</span>
            {group.jobs.length}
          </span>
        </span>
        <button
          type="button"
          aria-label={`${meta.label} column actions`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) => onOpenMenu(group.status, event.currentTarget.getBoundingClientRect())}
          className={`inline-flex cursor-pointer items-center justify-center rounded-xs-4 p-[6px] transition-colors hover:bg-bg-transparent-light hover:text-text-primary ${menuOpen ? 'bg-bg-transparent-light text-text-primary' : 'text-text-secondary'}`}
        >
          <DashboardIcon name="ellipsis-horizontal-solid" size={10} />
        </button>
      </header>

      <div className="relative flex min-h-[159px] flex-1 flex-col gap-[10px]">
        {group.jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            selected={selectedIds.has(job.id)}
            dragging={draggingId === job.id}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {dropTarget ? (
          // Veils the column's cards and says where the dropped card will go.
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-lg-10 border border-dashed border-border-transparent-medium bg-bg-secondary/70 pb-[24px]">
            <span className="sticky bottom-[24px] inline-flex items-center gap-[2px] rounded-sm-5 bg-bg-secondary p-[6px] text-body-xs leading-none font-medium-550 text-text-primary">
              <DashboardIcon name="arrows-up-down-solid" size={12} />
              Board ordered by date created
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function JobsBoard({
  groups,
  selectedIds,
  menuStatus,
  onSelect,
  onMoveJob,
  onOpenColumnMenu,
}: JobsBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStatus, setOverStatus] = useState<JobStatus | null>(null)

  const draggingFrom = groups.find((group) => group.jobs.some((job) => job.id === draggingId))

  function endDrag() {
    setDraggingId(null)
    setOverStatus(null)
  }

  return (
    <div className="flex min-h-0 flex-1 items-stretch gap-[8px] overflow-auto px-[8px] pb-[8px]">
      {groups.map((group) => (
        <BoardColumn
          key={group.status}
          group={group}
          selectedIds={selectedIds}
          draggingId={draggingId}
          dropTarget={
            draggingId !== null &&
            overStatus === group.status &&
            draggingFrom?.status !== group.status
          }
          menuOpen={menuStatus === group.status}
          onOpenMenu={onOpenColumnMenu}
          onSelect={onSelect}
          onDragStart={setDraggingId}
          onDragEnd={endDrag}
          onDragOver={setOverStatus}
          onDragLeave={(status) =>
            setOverStatus((current) => (current === status ? null : current))
          }
          onDrop={(status, jobId) => {
            if (jobId && draggingFrom?.status !== status) onMoveJob(jobId, status)
            endDrag()
          }}
        />
      ))}
    </div>
  )
}

export { JobsBoard }
export type { JobsBoardProps }
