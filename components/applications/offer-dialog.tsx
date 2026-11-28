'use client'

import { useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, InputSelection, Modal, ModalActions, TextInput, Textarea } from '@/components/ui'
import { OFFER_PLACEHOLDERS, type Offer } from '@/lib/applications/communications'
import { apiMessage } from '@/lib/jobs/api'
import { useOfferActions } from '@/lib/mutations'
import { useOfferTemplates } from '@/lib/queries'

const EXPIRY_DAYS = [3, 7, 14, 21, 30]

interface OfferDialogProps {
  jobId: string
  appId: string
  candidateName: string
  /** The job's title, for a new offer's heading. */
  jobTitle: string
  /** A draft to finish. */
  draft?: Offer
  onClose: () => void
  onDone: (message: string) => void
}

/**
 * Writes an offer letter (draft or send). The letter is fixed when it is saved:
 * `{{placeholders}}` are filled in then, and what the candidate signs is what was sent.
 */
function OfferDialog({
  jobId,
  appId,
  candidateName,
  jobTitle,
  draft,
  onClose,
  onDone,
}: OfferDialogProps): ReactElement {
  const templates = useOfferTemplates()
  const { create, update, send } = useOfferActions(jobId, appId)
  const [templateId, setTemplateId] = useState<string | undefined>()
  const [title, setTitle] = useState(draft?.title ?? (jobTitle ? `Offer: ${jobTitle}` : 'Offer'))
  const [body, setBody] = useState(draft?.body ?? '')
  const [compensation, setCompensation] = useState(draft?.compensation ?? '')
  const [startDate, setStartDate] = useState(draft?.startDate?.slice(0, 10) ?? '')
  const [days, setDays] = useState(7)
  const [error, setError] = useState('')

  const pending = create.isPending || update.isPending || send.isPending
  const blocked = !title.trim() || !body.trim()

  function fail(cause: unknown): void {
    setError(apiMessage(cause, 'That did not go through. Try again.'))
  }

  function pickTemplate(id: string): void {
    const template = templates.data?.find((item) => item.id === id)
    setTemplateId(template?.id)
    if (template) setBody(template.body)
  }

  function finish(message: string): void {
    onDone(message)
    onClose()
  }

  function save(sendNow: boolean): void {
    setError('')
    const fields = {
      title: title.trim(),
      body: body.trim(),
      compensation: compensation.trim() || undefined,
      start_date: startDate || undefined,
    }
    if (draft) {
      update.mutate(
        { id: draft.id, body: fields },
        {
          onSuccess: () => {
            if (!sendNow) return finish('Offer draft saved')
            send.mutate(
              { id: draft.id, expiresInDays: days },
              { onSuccess: () => finish(`Offer sent to ${candidateName}`), onError: fail },
            )
          },
          onError: fail,
        },
      )
      return
    }
    create.mutate(
      { ...fields, template_id: templateId, expires_in_days: days, send: sendNow },
      {
        onSuccess: () => finish(sendNow ? `Offer sent to ${candidateName}` : 'Offer draft saved'),
        onError: fail,
      },
    )
  }

  return (
    <Modal
      open
      title={draft ? 'Finish offer' : `Offer for ${candidateName}`}
      icon={<DashboardIcon name="briefcase-solid" size={14} />}
      onClose={onClose}
      width={700}
    >
      <div className="flex flex-col gap-[12px]">
        {templates.data && templates.data.length > 0 && !draft ? (
          <InputSelection
            label="Start from a template"
            placeholder="Choose a template"
            options={templates.data.map((item) => ({ value: item.id, label: item.name }))}
            value={templateId ?? ''}
            onChange={(next) => typeof next === 'string' && next && pickTemplate(next)}
          />
        ) : null}
        <TextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className="grid grid-cols-2 gap-[12px]">
          <TextInput
            label="Compensation"
            placeholder="e.g. £55,000 a year"
            value={compensation}
            onChange={(event) => setCompensation(event.target.value)}
          />
          <TextInput
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <Textarea
          label="Letter"
          showToolbar={false}
          rows={10}
          value={body}
          helperText={`Variables: ${OFFER_PLACEHOLDERS.map((item) => `{{${item.key}}}`).join(' ')}`}
          onChange={(event) => setBody(event.target.value)}
        />
        <InputSelection
          label="The link works for"
          options={EXPIRY_DAYS.map((item) => ({ value: String(item), label: `${item} days` }))}
          value={String(days)}
          onChange={(next) => typeof next === 'string' && next && setDays(Number(next))}
        />
        {error ? (
          <p role="alert" className="text-body-s text-text-error">
            {error}
          </p>
        ) : null}
      </div>
      <ModalActions>
        <Button
          variant="secondary"
          size="md"
          disabled={blocked || pending}
          onClick={() => save(false)}
        >
          Save draft
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={blocked || pending}
          loading={pending}
          onClick={() => save(true)}
        >
          Send offer
        </Button>
      </ModalActions>
    </Modal>
  )
}

/** Shown when a candidate is moved to Offer: send the letter now, or only move them. */
function OfferPromptDialog({
  name,
  pending,
  onSend,
  onMoveOnly,
  onClose,
}: {
  name: string
  pending: boolean
  onSend: () => void
  onMoveOnly: () => void
  onClose: () => void
}): ReactElement {
  return (
    <Modal
      open
      title={`Move ${name} to Offer`}
      icon={<DashboardIcon name="briefcase-solid" size={14} />}
      onClose={onClose}
      width={400}
    >
      <p className="text-body-m leading-24 text-text-secondary">
        Send {name} the offer now, or move {name} to Offer and send it later from the profile.
      </p>
      <ModalActions>
        <Button variant="secondary" size="md" disabled={pending} onClick={onMoveOnly}>
          Move without sending
        </Button>
        <Button variant="primary" accent="blue" size="md" disabled={pending} onClick={onSend}>
          Send offer letter
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { OfferDialog, OfferPromptDialog }
export type { OfferDialogProps }
