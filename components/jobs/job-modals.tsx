'use client'

import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import {
  BannerInfo,
  Button,
  DateInput,
  EMPTY_DATE,
  InputSelection,
  Modal,
  ModalActions,
  RadioButton,
} from '@/components/ui'
import { parseFutureDate } from '@/lib/jobs/actions'
import { TEAM_MEMBERS } from '@/lib/jobs/people'

import type { DateParts } from '@/components/ui'
import type { JobManager, JobStatus } from '@/lib/jobs/types'

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
      {/* The notice sits a full 28px below the copy, like the actions below it. */}
      <div className="flex flex-col gap-[28px]">
        <p className={bodyText}>
          {`Are you sure you want to delete job(s) and all its ${applicantCount} applicants will be permanently. You can't undo this.`}
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
  const [date, setDate] = useState<DateParts>(EMPTY_DATE)
  const isoDate = parseFutureDate(date.day, date.month, date.year, new Date())
  const complete = date.day.length > 0 && date.month.length > 0 && date.year.length === 4

  return (
    <Modal
      open
      title="Change Job(s) closing date"
      icon={<DashboardIcon name="calendar-solid" size={14} />}
      onClose={onClose}
    >
      <p className={bodyText}>This updates the closing date on your published listing.</p>
      {/* Typed directly, as the dev note asks; past dates are rejected. */}
      <DateInput
        label="Enter a new closing date"
        value={date}
        onChange={setDate}
        errorText={complete && !isoDate ? 'Enter a valid date that is today or later.' : undefined}
        className="w-[202px]"
      />
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

interface AssignJobsModalProps {
  /** The signed-in user, offered as "Assign to me". */
  me: JobManager
  /** Who the jobs are assigned to now, pre-selected when they all agree. */
  current: JobManager[]
  onSave: (people: JobManager[]) => void
  onClose: () => void
}

function AssignJobsModal({ me, current, onSave, onClose }: AssignJobsModalProps) {
  const onlyMe = current.length === 1 && current[0]?.name === me.name
  const [mode, setMode] = useState<'me' | 'others'>(
    onlyMe || current.length === 0 ? 'me' : 'others',
  )
  const [names, setNames] = useState<string[]>(onlyMe ? [] : current.map((person) => person.name))

  // Everyone who can be picked: the team, plus anyone already assigned.
  const people = [
    ...TEAM_MEMBERS,
    ...current.filter((person) => !TEAM_MEMBERS.some((member) => member.name === person.name)),
  ]
  const chosen = mode === 'me' ? [me] : people.filter((person) => names.includes(person.name))

  return (
    <Modal
      open
      title="Assign Job to…"
      icon={<DashboardIcon name="user-circle-solid" size={14} />}
      onClose={onClose}
    >
      <div role="radiogroup" aria-label="Assign to" className="flex flex-col gap-[10px]">
        <RadioButton
          name="assign-mode"
          label="Assign to me"
          checked={mode === 'me'}
          onChange={() => setMode('me')}
        />
        <RadioButton
          name="assign-mode"
          label="Assign to others…"
          checked={mode === 'others'}
          onChange={() => setMode('others')}
        />
      </div>
      {mode === 'others' ? (
        <InputSelection
          label="Assign to"
          placeholder="Search for an option..."
          multiple
          searchable
          selectionStyle="chip"
          options={people.map((person) => ({
            value: person.name,
            label: person.name,
            icon: <PersonAvatar person={person} size={16} />,
            chipIcon: <PersonAvatar person={person} />,
          }))}
          value={names}
          onChange={(value) => setNames(Array.isArray(value) ? value : [value])}
          showPrefixIcon
          prefixIcon={
            <span className="inline-flex text-text-input-placeholder">
              <DashboardIcon name="user-plus-outline" size={14} />
            </span>
          }
        />
      ) : null}
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={chosen.length === 0}
          onClick={() => onSave(chosen)}
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
  /** Exporting one job from its own menu: there is no scope to choose. */
  single?: boolean
  onExport: (scope: ExportScope, format: ExportFormat) => void
  onClose: () => void
}

function ExportJobsModal({
  selectedCount,
  single = false,
  onExport,
  onClose,
}: ExportJobsModalProps) {
  const [scope, setScope] = useState<ExportScope>(selectedCount > 0 ? 'selected' : 'all')
  const [format, setFormat] = useState<ExportFormat>('csv')
  // Trimmed to the 9px cap height, like the design's labels.
  const groupLabel = 'flex h-[9px] items-center px-[4px] text-body-s leading-none text-text-primary'

  return (
    <Modal
      open
      title={single ? 'Export Job' : 'Export Jobs'}
      icon={<DashboardIcon name="arrow-up-tray-solid" size={14} />}
      onClose={onClose}
    >
      <p className={bodyText}>
        Includes titles, departments, status, managers, dates, and applicant counts.
      </p>
      {single ? null : (
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
      )}
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

export { AssignJobsModal, ClosingDateModal, DeleteJobsModal, ExportJobsModal, StatusConfirmModal }
export type { ConfirmableStatus, ExportFormat, ExportScope }
