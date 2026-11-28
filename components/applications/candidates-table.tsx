'use client'

import { type ReactElement } from 'react'

import { CandidateRowMenu } from '@/components/applications/candidate-row-menu'
import { StageChip } from '@/components/applications/stage-chip'
import { TagPill } from '@/components/applications/tag-pill'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Checkbox } from '@/components/ui'
import { findStage } from '@/lib/applications/stages'
import { marketName } from '@/lib/markets'

import type { Applicant } from '@/lib/applications/api'
import type { PipelineStage, Tag } from '@/lib/applications/pipeline'

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : DATE.format(date)
}

const cellText = 'text-body-xs leading-19_2 font-medium text-text-secondary'

/**
 * Column widths from the design (ATS/Candidate table). Experience, Company and
 * Link have no data in the list (rows carry no answers), so their cells stay empty.
 */
const COLUMNS = [
  { label: 'Candidate', className: 'min-w-[261px] flex-1' },
  { label: 'Stage', className: 'w-[124px]' },
  { label: 'Applied on', className: 'w-[110px]' },
  { label: 'Location', className: 'w-[130px]' },
  { label: 'Experience', className: 'w-[140px]' },
  { label: 'Company', className: 'w-[100px]' },
  { label: 'Link', className: 'w-[120px]' },
] as const

interface CandidatesTableProps {
  rows: Applicant[]
  stages: ReadonlyArray<PipelineStage>
  tags: ReadonlyArray<Tag>
  selectedId: string | null
  /** The rows ticked for a bulk move. */
  checked: ReadonlySet<string>
  onCheck: (id: string, checked: boolean) => void
  onCheckAll: (checked: boolean) => void
  onOpen: (id: string, tab?: 'communications' | 'notes', action?: 'compose' | 'schedule') => void
  /** A stage picked from a row's menu. */
  onPick: (row: Applicant, stage: PipelineStage) => void
  onToggleFollow: (row: Applicant) => void
  onDownloadCv: (row: Applicant) => void
  /** Whether the signed-in person may move or disqualify this job's applications. */
  canDecide: boolean
}

/** The applicants of the job: one row each, and a click on a row opens its overview. */
function CandidatesTable({
  rows,
  stages,
  tags,
  selectedId,
  checked,
  onCheck,
  onCheckAll,
  onOpen,
  onPick,
  onToggleFollow,
  onDownloadCv,
  canDecide,
}: CandidatesTableProps): ReactElement {
  return (
    <div role="table" aria-label="Candidates" className="flex min-w-[1055px] flex-col">
      <div
        role="row"
        className="flex h-[32px] items-center gap-[2px] border-y border-border-transparent-light bg-bg-transparent-lighter px-[12px]"
      >
        <span
          role="columnheader"
          className={`${COLUMNS[0].className} flex shrink-0 items-center gap-[8px] pl-[2px] ${cellText}`}
        >
          <span className="flex shrink-0 items-center px-[3px]">
            <Checkbox
              size="sm"
              aria-label="Select every candidate"
              checked={rows.length > 0 && rows.every((row) => checked.has(row.id))}
              onChange={(event) => onCheckAll(event.target.checked)}
            />
          </span>
          {COLUMNS[0].label}
        </span>
        {COLUMNS.slice(1).map((column) => (
          <span
            key={column.label}
            role="columnheader"
            className={`${column.className} shrink-0 px-[12px] ${cellText}`}
          >
            {column.label}
          </span>
        ))}
        <span role="columnheader" className="flex w-[32px] shrink-0 justify-center">
          <DashboardIcon name="ellipsis-horizontal-solid" size={11} />
        </span>
      </div>
      {rows.map((row) => {
        const stage = findStage(stages, row.stageId)
        const isChecked = checked.has(row.id)
        const rowTags = tags.filter((tag) => row.tagIds.includes(tag.id))
        const selected = row.id === selectedId
        const name = row.name || row.email
        return (
          <div
            key={row.id}
            role="row"
            aria-selected={selected}
            onClick={(event) => {
              // Controls inside the row keep their own clicks.
              if ((event.target as HTMLElement).closest('button, a, input, label')) return
              onOpen(row.id)
            }}
            className={`group flex h-[40px] shrink-0 cursor-pointer items-center gap-[2px] px-[12px] transition-colors ${selected ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-light'}`}
          >
            <div role="cell" className="flex min-w-[261px] flex-1 items-center gap-[4px]">
              {/* The checkbox shows on the hovered or open row, and on every row once one is ticked. */}
              <span
                className={`flex shrink-0 items-center px-[3px] ${selected || isChecked || checked.size > 0 ? 'visible' : 'invisible group-hover:visible'}`}
              >
                <Checkbox
                  size="sm"
                  aria-label={`Select ${name}`}
                  checked={isChecked}
                  onChange={(event) => onCheck(row.id, event.target.checked)}
                />
              </span>
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="min-w-0 truncate text-left text-body-s leading-19_5 font-medium text-text-primary"
              >
                {name}
              </button>
              {row.isNew ? (
                <span className="shrink-0 rounded-xs-4 bg-bg-avatar-blue px-[4px] text-caption-m leading-17_6 text-text-avatar-blue">
                  New
                </span>
              ) : null}
              {row.followed ? (
                <span className="inline-flex shrink-0 text-text-secondary" title="Following">
                  <DashboardIcon name="star-solid" size={10} />
                </span>
              ) : null}
              {rowTags.slice(0, 2).map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
              {rowTags.length > 2 ? (
                <span className="shrink-0 text-caption-m text-text-secondary">
                  +{rowTags.length - 2}
                </span>
              ) : null}
            </div>
            <div role="cell" className="flex w-[124px] shrink-0 items-center px-[10px]">
              {stage ? <StageChip kind={stage.kind} name={stage.name} /> : null}
            </div>
            <div role="cell" className={`w-[110px] shrink-0 px-[12px] ${cellText}`}>
              {formatDate(row.submittedAt)}
            </div>
            <div role="cell" className={`w-[130px] shrink-0 truncate px-[12px] ${cellText}`}>
              {row.country ? marketName(row.country) : null}
            </div>
            <div role="cell" className={`w-[140px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className={`w-[100px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className={`w-[120px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className="flex w-[32px] shrink-0 items-center justify-center">
              <CandidateRowMenu
                row={row}
                stages={stages}
                onView={() => onOpen(row.id)}
                onPick={(stage) => onPick(row, stage)}
                onAddNote={() => onOpen(row.id, 'notes')}
                onCompose={() => onOpen(row.id, 'communications', 'compose')}
                onSchedule={() => onOpen(row.id, 'communications', 'schedule')}
                onToggleFollow={() => onToggleFollow(row)}
                onDownloadCv={() => onDownloadCv(row)}
                canDecide={canDecide}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { CandidatesTable, formatDate }
export type { CandidatesTableProps }
