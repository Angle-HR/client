'use client'

import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { BannerInfo, Button, Modal, ModalActions, RadioButton } from '@/components/ui'
import { parseFutureDate } from '@/lib/jobs/actions'

import type { JobStatus } from '@/lib/jobs/types'

/**
 * The confirmation and form modals for acting on jobs. Figma: "Changing Job
 * status for Open jobs" (7964:213181) and "Bulk actions and Multi-selection"
 * (7964:212811). Copy is the designer's, word for word.
 */

// Figma trims text boxes to the cap height, so a paragraph's box is about 5px
// shorter at each end than its CSS line box; the negative margin gives the same
// spacing to its neighbours.
const bodyText = '-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary'

type ConfirmableStatus = Exclude<JobStatus, 'open'>

const STATUS_CONFIRM: Record<ConfirmableStatus, { title: string; body: string; action: string }> = {
  paused: {
    title: 'Pause Job(s)',
    body: 'The job listing will be paused, removed from job boards, and closed to applications until reopened.',
    action: 'Pause',
  },
  closed: {
    title: 'Close Job(s)',
    body: 'The job listing will be closed, removed from job boards, and unavailable for applications until reopened.',
    action: 'Close',
  },
  draft: {
    title: 'Move to draft',
    body: 'The job listing will be unpublished from job boards and moved to draft immediately.',
    action: 'Draft',
  },
  archived: {
    title: 'Archive jobs',
    body: 'The job listing will be archived and removed from job boards.',
    action: 'Archive',
  },
  expired: {
    title: 'Move to expired',
    body: 'The job listing will be marked as expired and removed from job boards.',
    action: 'Mark as expired',
  },
}

interface StatusConfirmModalProps {
  /** Reopening a job needs no confirmation, so `open` is never passed. */
  status: ConfirmableStatus
  onConfirm: () => void
  onClose: () => void
}

function StatusConfirmModal({ status, onConfirm, onClose }: StatusConfirmModalProps) {
  const copy = STATUS_CONFIRM[status]
  return (
    <Modal
      open
      title={copy.title}
      icon={<DashboardIcon name="viewfinder-circle-solid" size={14} />}
      onClose={onClose}
    >
      <p className={bodyText}>{copy.body}</p>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={onConfirm}>
          {copy.action}
        </Button>
      </ModalActions>
    </Modal>
  )
}

interface DeleteJobsModalProps {
  applicantCount: number
  /** Companies with United States applicants see the EEOC retention notice. */
  showRetentionNotice?: boolean
  onConfirm: () => void
  onClose: () => void
}

function DeleteJobsModal({
  applicantCount,
  showRetentionNotice = false,
  onConfirm,
  onClose,
}: DeleteJobsModalProps) {
  return (
    <Modal
      open
      title="Delete selection"
      icon={<DashboardIcon name="trash-solid" size={14} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-[16px]">
        <p className={bodyText}>
          Are you sure you want to delete job(s) and all its {applicantCount} applicants will be
          permanently. You can&apos;t undo this.
        </p>
        {showRetentionNotice ? (
          <BannerInfo
            title="US federal rules (EEOC recordkeeping)"
            body="generally require employers with 15+ employees to keep applications and hiring records for at least 1 year after the hiring decision."
          />
        ) : null}
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="red" size="md" onClick={onConfirm}>
          Delete
        </Button>
      </ModalActions>
    </Modal>
  )
}

interface ClosingDateModalProps {
  onSave: (isoDate: string) => void
  onClose: () => void
}

function ClosingDateModal({ onSave, onClose }: ClosingDateModalProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const isoDate = parseFutureDate(day, month, year, new Date())
  const complete = day.length > 0 && month.length > 0 && year.length === 4

  const segment = (
    value: string,
    onChange: (next: string) => void,
    placeholder: string,
    maxLength: number,
    label: string,
    widthClass: string,
  ) => (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, maxLength))}
      inputMode="numeric"
      placeholder={placeholder}
      aria-label={label}
      className={`${widthClass} bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-input-placeholder`}
    />
  )

  return (
    <Modal
      open
      title="Change Job(s) closing date"
      icon={<DashboardIcon name="calendar-solid" size={14} />}
      onClose={onClose}
    >
      <p className={bodyText}>This updates the closing date on your published listing.</p>
      <div className="flex w-[202px] flex-col gap-[6px]">
        <span
          id="closing-date-label"
          className="pl-[3px] text-body-xs leading-none font-medium-550 text-text-tertiary"
        >
          Enter a new closing date
        </span>
        {/* Typed directly, as the dev note asks; past dates are rejected. */}
        <div
          role="group"
          aria-labelledby="closing-date-label"
          className={`flex h-[32px] items-center gap-[4px] rounded-sm-8 border bg-bg-input-placeholder pl-[8px] transition-colors focus-within:border-border-input-focus ${complete && !isoDate ? 'border-border-input-error' : 'border-border-input-placeholder'}`}
        >
          {segment(day, setDay, 'DD', 2, 'Day', 'w-[22px]')}
          <span aria-hidden="true" className="text-body-m leading-21 text-text-input-placeholder">
            ·
          </span>
          {segment(month, setMonth, 'MM', 2, 'Month', 'w-[24px]')}
          <span aria-hidden="true" className="text-body-m leading-21 text-text-input-placeholder">
            ·
          </span>
          {segment(year, setYear, 'YYYY', 4, 'Year', 'w-[40px]')}
          <span className="ml-auto flex size-[32px] items-center justify-center text-text-input-placeholder">
            <DashboardIcon name="calendar-date-range-outline" size={14} />
          </span>
        </div>
        {complete && !isoDate ? (
          <span role="alert" className="pl-[3px] text-body-xs leading-19_2 text-text-error">
            Enter a valid date that is today or later.
          </span>
        ) : null}
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={!isoDate}
          onClick={() => isoDate && onSave(isoDate)}
        >
          Save changes
        </Button>
      </ModalActions>
    </Modal>
  )
}

type ExportScope = 'all' | 'selected'
type ExportFormat = 'csv' | 'json'

interface ExportJobsModalProps {
  /** How many jobs are selected; the "Selected" option is hidden at zero. */
  selectedCount: number
  onExport: (scope: ExportScope, format: ExportFormat) => void
  onClose: () => void
}

function ExportJobsModal({ selectedCount, onExport, onClose }: ExportJobsModalProps) {
  const [scope, setScope] = useState<ExportScope>(selectedCount > 0 ? 'selected' : 'all')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const groupLabel = 'px-[4px] text-body-s leading-none text-text-primary'

  return (
    <Modal
      open
      title="Export Jobs"
      icon={<DashboardIcon name="arrow-up-tray-solid" size={14} />}
      onClose={onClose}
    >
      <p className={bodyText}>
        Includes titles, departments, status, managers, dates, and applicant counts.
      </p>
      <fieldset className="flex flex-col gap-[10px]">
        <legend className={`${groupLabel} mb-[10px]`}>Selection:</legend>
        <RadioButton
          name="export-scope"
          label="All jobs"
          checked={scope === 'all'}
          onChange={() => setScope('all')}
        />
        {selectedCount > 0 ? (
          <RadioButton
            name="export-scope"
            label={`Selected (${selectedCount})`}
            checked={scope === 'selected'}
            onChange={() => setScope('selected')}
          />
        ) : null}
      </fieldset>
      <fieldset className="flex flex-col gap-[10px]">
        <legend className={`${groupLabel} mb-[10px]`}>As:</legend>
        <RadioButton
          name="export-format"
          label="CSV for Excel, Numbers, or spreadsheets"
          checked={format === 'csv'}
          onChange={() => setFormat('csv')}
        />
        <RadioButton
          name="export-format"
          label="JSON"
          checked={format === 'json'}
          onChange={() => setFormat('json')}
        />
      </fieldset>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={() => onExport(scope, format)}>
          Export
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { ClosingDateModal, DeleteJobsModal, ExportJobsModal, StatusConfirmModal }
export type { ConfirmableStatus, ExportFormat, ExportScope }
