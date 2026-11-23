'use client'

import { type ReactElement } from 'react'

import { CandidateRowMenu } from '@/components/applications/candidate-row-menu'
import { StageChip } from '@/components/applications/stage-chip'
import { stageOfStatus, type DesignStage } from '@/lib/applications/stages'
import { marketName } from '@/lib/markets'

import type { Applicant } from '@/lib/applications/api'

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : DATE.format(date)
}

const cellText = 'text-body-xs leading-19_2 font-medium text-text-secondary'

/**
 * Column widths from the design. Experience, Company and Link have no data in
 * the list (rows carry no answers), so their cells stay empty.
 */
const COLUMNS = [
  { label: 'Candidate', className: 'min-w-[200px] flex-1' },
  { label: 'Stage', className: 'w-[140px]' },
  { label: 'Applied on', className: 'w-[110px]' },
  { label: 'Location', className: 'w-[120px]' },
  { label: 'Experience', className: 'w-[100px]' },
  { label: 'Company', className: 'w-[120px]' },
  { label: 'Link', className: 'w-[140px]' },
] as const

interface CandidatesTableProps {
  rows: Applicant[]
  selectedId: string | null
  onOpen: (id: string) => void
  /** A stage picked from a row's menu. */
  onPick: (row: Applicant, stage: DesignStage) => void
  onDownloadCv: (row: Applicant) => void
  /** Whether the signed-in person may move or disqualify this job's applications. */
  canDecide: boolean
}

/** The applicants of the job: one row each, and a click on a row opens its overview. */
function CandidatesTable({
  rows,
  selectedId,
  onOpen,
  onPick,
  onDownloadCv,
  canDecide,
}: CandidatesTableProps): ReactElement {
  return (
    <div role="table" aria-label="Candidates" className="flex min-w-[960px] flex-col">
      <div role="row" className="flex h-[32px] items-center gap-[2px] px-[16px]">
        {COLUMNS.map((column) => (
          <span
            key={column.label}
            role="columnheader"
            className={`${column.className} shrink-0 px-[12px] ${cellText}`}
          >
            {column.label}
          </span>
        ))}
        <span className="w-[32px] shrink-0" />
      </div>
      {rows.map((row) => {
        const stage = stageOfStatus(row.status)
        const selected = row.id === selectedId
        return (
          <div
            key={row.id}
            role="row"
            aria-selected={selected}
            onClick={(event) => {
              // Controls inside the row keep their own clicks.
              if ((event.target as HTMLElement).closest('button, a')) return
              onOpen(row.id)
            }}
            className={`group flex h-[40px] shrink-0 cursor-pointer items-center gap-[2px] px-[16px] transition-colors ${selected ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-lighter'}`}
          >
            <div role="cell" className="flex min-w-[200px] flex-1 items-center px-[12px]">
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="min-w-0 truncate text-left text-body-s leading-19_5 font-medium text-text-primary"
              >
                {row.name || row.email}
              </button>
            </div>
            <div role="cell" className="flex w-[140px] shrink-0 items-center px-[12px]">
              {stage ? <StageChip stage={stage} /> : null}
            </div>
            <div role="cell" className={`w-[110px] shrink-0 px-[12px] ${cellText}`}>
              {formatDate(row.submittedAt)}
            </div>
            <div role="cell" className={`w-[120px] shrink-0 truncate px-[12px] ${cellText}`}>
              {row.country ? marketName(row.country) : null}
            </div>
            <div role="cell" className={`w-[100px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className={`w-[120px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className={`w-[140px] shrink-0 px-[12px] ${cellText}`} />
            <div role="cell" className="flex w-[32px] shrink-0 items-center justify-center">
              <CandidateRowMenu
                row={row}
                onView={() => onOpen(row.id)}
                onPick={(stage) => onPick(row, stage)}
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
