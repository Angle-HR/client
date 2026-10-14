'use client'

import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { EmailTagsInput } from '@/components/jobs/create/email-tags-input'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import { Button, Modal, ModalActions, RadioButton } from '@/components/ui'
import {
  ACCESS_LEVELS,
  LEVEL_CONFIRM,
  LEVEL_LABEL,
  addEmailTags,
  sendableEmails,
} from '@/lib/jobs/permissions-step'

import type { AccessLevel, AccessMember, EmailTag } from '@/lib/jobs/permissions-step'
import type { JobManager } from '@/lib/jobs/types'

/**
 * The modals of the Permissions step: invite people to the job, and confirm a
 * change of access or a removal. Figma: "Invite Team members to this job"
 * 9270:377053, 9270:376989 (opened from a suggested person), and the confirm
 * pop-ups in the dev-note sheet 9270:378362. Copy is the designer's.
 */

// The same body text the other job modals use.
const bodyText = '-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary'

// Level descriptions as the invite modal draws them.
const LEVEL_DESCRIPTION: Record<AccessLevel, string> = {
  manage:
    'Edit, publish and close the job, invite others, move and reject applicants, export, ideal for hiring managers.',
  review:
    'See applicants, leave notes & scores, move stages, ideal for interviewers and team leads.',
  view: 'See the job and hiring pipeline without making changes, for stakeholders.',
}

interface InviteModalProps {
  /** Set when opened from a suggested person: they are invited and no email is typed. */
  person: JobManager | null
  sending: boolean
  onSend: (emails: string[], level: AccessLevel) => void
  onClose: () => void
}

function InviteModal({ person, sending, onSend, onClose }: InviteModalProps) {
  const [tags, setTags] = useState<EmailTag[]>([])
  const [draft, setDraft] = useState('')
  // A suggested person opens on Review, as drawn. An email starts with no level.
  const [level, setLevel] = useState<AccessLevel | null>(person ? 'review' : null)

  const invalid = tags.some((tag) => !tag.valid)
  // What is typed but not yet a tag still counts when sending.
  const emails = sendableEmails(addEmailTags(tags, draft))
  const canSend = !sending && level !== null && (person !== null || emails.length > 0)

  function send() {
    if (!canSend || level === null) return
    onSend(person ? [] : emails, level)
  }

  return (
    <Modal
      open
      title="Invite Team members to this job"
      icon={<DashboardIcon name="user-plus-solid" size={14} />}
      onClose={onClose}
      width={500}
    >
      <div className="flex flex-col gap-[24px]">
        {person ? (
          <div className="flex items-center gap-[8px]">
            <PersonAvatar person={person} size={24} />
            <span className="text-body-s font-medium text-text-primary">{person.name}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-[6px]">
            <EmailTagsInput
              tags={tags}
              draft={draft}
              invalid={invalid}
              onTagsChange={setTags}
              onDraftChange={setDraft}
            />
            {invalid ? (
              <p className="text-body-xs text-text-error">Please provide a valid email address</p>
            ) : null}
          </div>
        )}

        <fieldset className="flex flex-col gap-[4px]">
          <legend className="mb-[6px] text-body-xs font-medium text-text-secondary">
            Access level
          </legend>
          {ACCESS_LEVELS.map((option) => (
            <div
              key={option}
              className={`flex flex-col gap-[4px] rounded-sm-8 p-[8px] ${level === option ? 'bg-bg-transparent-light' : ''}`}
            >
              <RadioButton
                name="invite-access-level"
                value={option}
                checked={level === option}
                onChange={() => setLevel(option)}
                label={LEVEL_LABEL[option]}
              />
              <p className="pl-[25px] text-body-xs leading-19_2 text-text-secondary">
                {LEVEL_DESCRIPTION[option]}
              </p>
            </div>
          ))}
        </fieldset>
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" disabled={!canSend} onClick={send}>
          Send Invite
        </Button>
      </ModalActions>
    </Modal>
  )
}

/** The person as the confirm copy names them: their name, or their email when they have none. */
function who(member: AccessMember): string {
  return member.name || member.email
}

interface ChangeAccessModalProps {
  member: AccessMember
  level: AccessLevel
  busy: boolean
  onConfirm: () => void
  onClose: () => void
}

function ChangeAccessModal({ member, level, busy, onConfirm, onClose }: ChangeAccessModalProps) {
  const copy = LEVEL_CONFIRM[level]
  return (
    <Modal open title={copy.title} onClose={onClose}>
      <p className={bodyText}>{`${who(member)} ${copy.body}`}</p>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" disabled={busy} onClick={onConfirm}>
          Change
        </Button>
      </ModalActions>
    </Modal>
  )
}

interface RevokeAccessModalProps {
  member: AccessMember
  busy: boolean
  onConfirm: () => void
  onClose: () => void
}

function RevokeAccessModal({ member, busy, onConfirm, onClose }: RevokeAccessModalProps) {
  return (
    <Modal open title="Revoke access?" onClose={onClose}>
      <p className={bodyText}>
        {`${who(member)} will lose access to this job straight away. Their notes and scores will stay.`}
      </p>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="red" size="md" disabled={busy} onClick={onConfirm}>
          Remove
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { ChangeAccessModal, InviteModal, RevokeAccessModal }
