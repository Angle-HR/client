'use client'

import { useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  Button,
  InputSelection,
  Modal,
  ModalActions,
  RadioButton,
  TextInput,
  Textarea,
} from '@/components/ui'
import { reasonNeedsNote, type DisqualifyReason } from '@/lib/applications/pipeline'
import { disqualifyNote } from '@/lib/applications/stages'

import type { SelectOption } from '@/components/ui'
import type { MessageBody } from '@/lib/applications/communications'

/** The reasons as the select lists them: the server's list, by code. */
function reasonOptions(reasons: ReadonlyArray<DisqualifyReason>): SelectOption[] {
  return reasons.map((reason) => ({ value: reason.code, label: reason.label }))
}

interface ReasonFieldProps {
  /** The reason's code. */
  value: string
  reasons: ReadonlyArray<DisqualifyReason>
  onChange: (reason: string) => void
  /** Helper copy under the picker, as the dialog's design draws it. */
  helperText?: string
}

/** The reason picker: a list with a search box at its top. */
function ReasonField({ value, reasons, onChange, helperText }: ReasonFieldProps): ReactElement {
  return (
    <InputSelection
      label="Disqualify candidate"
      placeholder="Select a reason"
      listSearchPlaceholder="Search a reason"
      helperText={helperText}
      options={reasonOptions(reasons)}
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

type Notify = 'standard' | 'own'

/**
 * "Notify candidate": the company's standard email goes unless it turned status
 * emails off (a setting, so shown read-only), or the person writes their own,
 * which goes instead of it.
 */
function NotifyChoice({
  sendEmails,
  value,
  onChange,
}: {
  sendEmails: boolean | undefined
  value: Notify
  onChange: (value: Notify) => void
}): ReactElement {
  return (
    <div className="flex flex-col gap-[10px]">
      <p className="text-body-s leading-19_5 font-medium text-text-secondary">Notify candidate:</p>
      <RadioButton
        name="notify-candidate"
        label={sendEmails === false ? 'Standard email (turned off in settings)' : 'Standard email'}
        checked={value === 'standard'}
        disabled={sendEmails === false}
        onChange={() => onChange('standard')}
      />
      <RadioButton
        name="notify-candidate"
        label="Write my own email"
        checked={value === 'own'}
        onChange={() => onChange('own')}
      />
    </div>
  )
}

interface DisqualifyDialogProps {
  name: string
  reasons: ReadonlyArray<DisqualifyReason>
  sendEmails: boolean | undefined
  pending: boolean
  onCancel: () => void
  /** Called with the reason's code and the optional note. */
  onConfirm: (decision: { reason: string; note: string; message?: MessageBody }) => void
}

/**
 * Disqualify from the row menu or the Move to menu. The primary button is the
 * "Disqualify" variant: the composer behind "Review email" cannot be built.
 */
function DisqualifyDialog({
  name,
  reasons,
  sendEmails,
  pending,
  onCancel,
  onConfirm,
}: DisqualifyDialogProps): ReactElement {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState<Notify>('standard')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const needsNote = reasonNeedsNote(reason)
  const own = notify === 'own'
  const blocked =
    !reason || (needsNote && !note.trim()) || (own && (!subject.trim() || !message.trim()))

  return (
    <Modal
      open
      title={`Disqualify ${name}`}
      icon={<DashboardIcon name="minus-circle-solid" size={14} />}
      onClose={onCancel}
      width={500}
    >
      <ReasonField value={reason} reasons={reasons} onChange={setReason} />
      <NoteField value={note} onChange={setNote} required={needsNote} />
      <NotifyChoice sendEmails={sendEmails} value={notify} onChange={setNotify} />
      {own ? (
        <>
          <TextInput
            label="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <Textarea
            label="Message"
            helperText="Variables: {{candidate_name}} {{job_title}} {{company}} {{sender_name}}"
            showToolbar={false}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </>
      ) : null}
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
          onClick={() =>
            onConfirm({
              reason,
              note: disqualifyNote(note),
              message: own ? { subject: subject.trim(), body: message.trim() } : undefined,
            })
          }
        >
          Disqualify
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { DisqualifyDialog, NoteField, ReasonField }
export type { DisqualifyDialogProps }
