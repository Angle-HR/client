'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'

import { NoteField, ReasonField } from '@/components/applications/disqualify-dialog'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Checkbox, TextButton } from '@/components/ui'
import { disqualifyNote, reasonNeedsNote } from '@/lib/applications/stages'

interface DisqualifyPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  sendEmails: boolean | undefined
  pending: boolean
  onConfirm: (note: string) => void
}

/**
 * The panel's Disqualify menu (15-17): the reason, the email choice (read-only),
 * an optional note behind "+ Add note", and the blue Disqualify. Its fields
 * reset each time it opens, because they are only mounted while it is open.
 */
function DisqualifyPopover({
  open,
  onOpenChange,
  disabled,
  sendEmails,
  pending,
  onConfirm,
}: DisqualifyPopoverProps): ReactElement {
  const wrapper = useRef<HTMLDivElement>(null)

  // A press outside the popover closes it.
  useEffect(() => {
    if (!open) return
    function handlePress(event: MouseEvent): void {
      if (!wrapper.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', handlePress)
    return () => document.removeEventListener('mousedown', handlePress)
  }, [open, onOpenChange])

  return (
    <div ref={wrapper} className="relative">
      <Button
        variant="secondary"
        accent="red"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        iconSuffix={<DashboardIcon name="chev-down-solid" size={10} />}
        onClick={() => onOpenChange(!open)}
      >
        Disqualify
      </Button>
      {open ? (
        <DisqualifyForm sendEmails={sendEmails} pending={pending} onConfirm={onConfirm} />
      ) : null}
    </div>
  )
}

interface DisqualifyFormProps {
  sendEmails: boolean | undefined
  pending: boolean
  onConfirm: (note: string) => void
}

/** The popover's contents, mounted only while it is open. */
function DisqualifyForm({ sendEmails, pending, onConfirm }: DisqualifyFormProps): ReactElement {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const needsNote = reasonNeedsNote(reason)
  const blocked = !reason || (needsNote && !note.trim())

  return (
    <div className="absolute top-full right-0 z-10 mt-[4px] flex w-[300px] flex-col gap-[12px] rounded-lg-10 bg-bg-primary p-[12px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      {reason ? (
        <div className="flex items-start justify-between gap-[8px]">
          <p className="min-w-0 text-body-xs leading-19_2 text-text-primary">
            <span className="text-text-tertiary">Reason </span>
            {reason}
          </p>
          <TextButton size="sm" onClick={() => setReason('')}>
            Change
          </TextButton>
        </div>
      ) : (
        <ReasonField value={reason} onChange={setReason} />
      )}

      {/* Drawn with the company's setting only: no template, schedule or preview. */}
      <Checkbox
        label="Send email"
        checked={sendEmails === true}
        disabled
        onChange={() => undefined}
      />

      {noteOpen || needsNote ? (
        <NoteField value={note} onChange={setNote} required={needsNote} />
      ) : (
        <TextButton size="sm" onClick={() => setNoteOpen(true)}>
          + Add note
        </TextButton>
      )}

      <Button
        variant="primary"
        accent="blue"
        size="sm"
        disabled={blocked || pending}
        loading={pending}
        onClick={() => onConfirm(disqualifyNote(reason, note))}
      >
        Disqualify
      </Button>
    </div>
  )
}

export { DisqualifyPopover }
export type { DisqualifyPopoverProps }
