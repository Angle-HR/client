'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'

import { NoteField, ReasonField } from '@/components/applications/disqualify-dialog'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Checkbox, TextButton } from '@/components/ui'
import { reasonNeedsNote, type DisqualifyReason } from '@/lib/applications/pipeline'
import { disqualifyNote } from '@/lib/applications/stages'

interface DisqualifyPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  reasons: ReadonlyArray<DisqualifyReason>
  sendEmails: boolean | undefined
  pending: boolean
  onConfirm: (decision: { reason: string; note: string }) => void
}

/**
 * The panel's Disqualify menu: the reason, the email choice (read-only), an
 * optional note behind "Add note", and the blue Disqualify. Its fields reset
 * each time it opens, because they are only mounted while it is open.
 */
function DisqualifyPopover({
  open,
  onOpenChange,
  disabled,
  reasons,
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
        iconSuffix={<DashboardIcon name="chev-down-solid" size={14} />}
        onClick={() => onOpenChange(!open)}
      >
        Disqualify
      </Button>
      {open ? (
        <DisqualifyForm
          reasons={reasons}
          sendEmails={sendEmails}
          pending={pending}
          onConfirm={onConfirm}
        />
      ) : null}
    </div>
  )
}

interface DisqualifyFormProps {
  reasons: ReadonlyArray<DisqualifyReason>
  sendEmails: boolean | undefined
  pending: boolean
  onConfirm: (decision: { reason: string; note: string }) => void
}

/** The popover's contents, mounted only while it is open. */
function DisqualifyForm({
  reasons,
  sendEmails,
  pending,
  onConfirm,
}: DisqualifyFormProps): ReactElement {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const needsNote = reasonNeedsNote(reason)
  const blocked = !reason || (needsNote && !note.trim())
  const showNote = noteOpen || needsNote

  return (
    <div className="absolute top-full right-0 z-10 mt-[4px] flex w-[330px] flex-col gap-[24px] rounded-lg-10 bg-bg-primary p-[10px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      <div className="flex flex-col gap-[20px]">
        {reason ? (
          <div className="flex items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-col gap-[2px]">
              <p className="text-body-xs leading-19_2 text-text-secondary">Reason</p>
              <p className="text-body-s leading-19_5 font-medium text-text-primary">
                {reasons.find((item) => item.code === reason)?.label ?? reason}
              </p>
            </div>
            <TextButton size="sm" onClick={() => setReason('')}>
              Change
            </TextButton>
          </div>
        ) : (
          <ReasonField value={reason} reasons={reasons} onChange={setReason} />
        )}

        {/* Drawn with the company's setting only: no template, schedule or preview. */}
        <Checkbox
          label="Send email"
          checked={sendEmails === true}
          disabled
          onChange={() => undefined}
        />
      </div>

      {showNote ? <NoteField value={note} onChange={setNote} required={needsNote} /> : null}

      <div className="flex items-center justify-between gap-[8px]">
        {showNote ? null : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="inline-flex items-center gap-[2px] rounded-sm-7 px-[6px] py-[6px] text-body-s leading-19_5 text-text-secondary transition-colors hover:bg-bg-transparent-light"
          >
            <DashboardIcon name="plus-solid" size={11} />
            Add note
          </button>
        )}
        <Button
          variant="primary"
          accent="blue"
          size="sm"
          disabled={blocked || pending}
          loading={pending}
          onClick={() => onConfirm({ reason, note: disqualifyNote(note) })}
        >
          Disqualify
        </Button>
      </div>
    </div>
  )
}

export { DisqualifyPopover }
export type { DisqualifyPopoverProps }
