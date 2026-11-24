'use client'

import { useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, InputSelection, ModalActions, Modal, RadioButton, Textarea } from '@/components/ui'
import { DISQUALIFY_REASONS, disqualifyNote, reasonNeedsNote } from '@/lib/applications/stages'

import type { SelectOption } from '@/components/ui'

/** The reasons as the select lists them, grouped as the design draws them (05). */
const REASON_OPTIONS: SelectOption[] = DISQUALIFY_REASONS.map((reason) => ({
  value: reason.label,
  label: reason.label,
  group: reason.group,
}))

interface ReasonFieldProps {
  value: string
  onChange: (reason: string) => void
  /** Helper copy under the picker, as the dialog's design draws it. */
  helperText?: string
}

/** The reason picker: a list with a search box at its top. */
function ReasonField({ value, onChange, helperText }: ReasonFieldProps): ReactElement {
  return (
    <InputSelection
      label="Disqualify candidate"
      placeholder="Select a reason"
      listSearchPlaceholder="Search a reason"
      helperText={helperText}
      options={REASON_OPTIONS}
      value={value}
      onChange={(next) => onChange(typeof next === 'string' ? next : '')}
    />
  )
}

interface NoteFieldProps {
  value: string
  onChange: (note: string) => void
  /** "Other (requires a note)" makes the note required (12, 13). */
  required: boolean
}

/** The private note, with its helper copy and the error when a required note is empty. */
function NoteField({ value, onChange, required }: NoteFieldProps): ReactElement {
  const missing = required && !value.trim()
  return (
    <Textarea
      label={required ? 'Add a note' : 'Add a note (optional)'}
      placeholder="Add context for your team"
      helperText="This will not be shared with the candidate"
      errorText={missing ? 'Enter a note' : undefined}
      showToolbar={false}
      rows={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

/**
 * "Notify candidate" as the design draws it, but read-only: the server emails a
 * candidate on a rejection only when the company's send_status_emails is on.
 */
function NotifyChoice({ sendEmails }: { sendEmails: boolean | undefined }): ReactElement {
  return (
    <div className="flex flex-col gap-[10px]">
      <p className="text-body-s leading-19_5 font-medium text-text-secondary">Notify candidate:</p>
      <RadioButton
        name="notify-candidate"
        label="Send email"
        checked={sendEmails === true}
        disabled
        onChange={() => undefined}
      />
      <RadioButton
        name="notify-candidate"
        label="Don’t notify"
        checked={sendEmails === false}
        disabled
        onChange={() => undefined}
      />
    </div>
  )
}

interface DisqualifyDialogProps {
  name: string
  sendEmails: boolean | undefined
  pending: boolean
  onCancel: () => void
  /** Called with the note the server keeps: the reason, then the optional note. */
  onConfirm: (note: string) => void
}

/**
 * Disqualify from the row menu or the Move to menu. The primary button is the
 * "Disqualify" variant: the composer behind "Review email" cannot be built.
 */
function DisqualifyDialog({
  name,
  sendEmails,
  pending,
  onCancel,
  onConfirm,
}: DisqualifyDialogProps): ReactElement {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const needsNote = reasonNeedsNote(reason)
  const blocked = !reason || (needsNote && !note.trim())

  return (
    <Modal
      open
      title={`Disqualify ${name}`}
      icon={<DashboardIcon name="minus-circle-solid" size={14} />}
      onClose={onCancel}
      width={500}
    >
      <ReasonField
        value={reason}
        onChange={setReason}
        helperText="Select stages where this template can be used"
      />
      <NoteField value={note} onChange={setNote} required={needsNote} />
      <NotifyChoice sendEmails={sendEmails} />
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={blocked || pending}
          loading={pending}
          onClick={() => onConfirm(disqualifyNote(reason, note))}
        >
          Disqualify
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { DisqualifyDialog, NoteField, ReasonField }
export type { DisqualifyDialogProps }
