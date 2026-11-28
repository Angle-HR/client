'use client'

import { useRef, useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Modal, ModalActions, TextButton, TextInput, Textarea } from '@/components/ui'
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
  PLACEHOLDERS,
  formatFileSize,
  type MessageBody,
} from '@/lib/applications/communications'
import { apiMessage } from '@/lib/jobs/api'
import {
  useDeleteAttachment,
  usePreviewApplicationEmail,
  useSendApplicationEmail,
  useUploadAttachment,
} from '@/lib/mutations'
import { useApplicationAttachments, useEmailSettings, useEmailTemplates } from '@/lib/queries'

interface ComposeDialogProps {
  jobId: string
  appId: string
  candidateName: string
  candidateEmail: string
  /** A subject and body to start from, e.g. an interview invitation. */
  initial?: { subject: string; body: string }
  onClose: () => void
  onSent: (message: string) => void
}

/** The datetime-local value of a Date, in the person's own time zone. */
function localInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Writes to the candidate (Figma: Email compose window). The recipient is always
 * the application's candidate: the server reads it, so it is shown and never sent.
 * Templates fill the subject and body; `{{placeholders}}` are filled in when it is sent.
 */
function ComposeDialog({
  jobId,
  appId,
  candidateName,
  candidateEmail,
  initial,
  onClose,
  onSent,
}: ComposeDialogProps): ReactElement {
  const templates = useEmailTemplates()
  const settings = useEmailSettings()
  const waiting = useApplicationAttachments(jobId, appId)
  const send = useSendApplicationEmail(jobId, appId)
  const preview = usePreviewApplicationEmail(jobId, appId)
  const upload = useUploadAttachment(jobId, appId)
  const removeFile = useDeleteAttachment(jobId, appId)
  const fileInput = useRef<HTMLInputElement>(null)

  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [templateId, setTemplateId] = useState<string | undefined>()
  const [picked, setPicked] = useState<string[]>([])
  const [scheduling, setScheduling] = useState(false)
  const [when, setWhen] = useState(() => localInput(new Date(Date.now() + 60 * 60 * 1000)))
  const [shown, setShown] = useState<{ subject: string; body: string } | null>(null)
  const [error, setError] = useState('')

  const files = waiting.data ?? []
  // Files uploaded and not removed are sent with this message, up to the limit.
  const attached = files.filter((file) => picked.includes(file.id))
  const pending = send.isPending || upload.isPending
  const blocked = !subject.trim() || !body.trim()

  function messageBody(): MessageBody {
    return {
      subject: subject.trim(),
      body: body.trim(),
      template_id: templateId,
      attachment_ids: attached.length ? attached.map((file) => file.id) : undefined,
      schedule_at: scheduling ? new Date(when).toISOString() : undefined,
    }
  }

  function fail(cause: unknown): void {
    setError(apiMessage(cause, 'That did not go through. Try again.'))
  }

  function pickTemplate(id: string): void {
    const template = templates.data?.find((item) => item.id === id)
    if (!template) return
    setTemplateId(template.id)
    setSubject(template.subject)
    setBody(template.body)
    setShown(null)
  }

  function insert(key: string): void {
    setBody((current) => `${current}${current && !current.endsWith(' ') ? ' ' : ''}{{${key}}}`)
    setShown(null)
  }

  function chooseFile(file: File | undefined): void {
    if (!file) return
    setError('')
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setError(`${file.name} is over ${formatFileSize(ATTACHMENT_MAX_BYTES)}.`)
      return
    }
    if (picked.length >= MAX_ATTACHMENTS_PER_MESSAGE) {
      setError(`Attach at most ${MAX_ATTACHMENTS_PER_MESSAGE} files to one email.`)
      return
    }
    upload.mutate(file, {
      onSuccess: (attachment) => setPicked((current) => [...current, attachment.id]),
      onError: fail,
    })
  }

  function drop(id: string): void {
    setPicked((current) => current.filter((item) => item !== id))
    removeFile.mutate(id, { onError: fail })
  }

  function showPreview(): void {
    setError('')
    preview.mutate(messageBody(), { onSuccess: setShown, onError: fail })
  }

  function submit(): void {
    setError('')
    send.mutate(messageBody(), {
      onSuccess: () => {
        onSent(
          scheduling
            ? `Email to ${candidateName} scheduled`
            : `Email to ${candidateName} is on its way`,
        )
        onClose()
      },
      onError: fail,
    })
  }

  return (
    <Modal
      open
      title={`Send mail to ${candidateName}`}
      icon={<DashboardIcon name="envelope-solid" size={14} />}
      onClose={onClose}
      width={700}
    >
      <div className="flex flex-col gap-[12px]">
        <dl className="grid grid-cols-[48px_1fr] gap-y-[6px] text-body-s leading-19_5">
          <dt className="text-text-secondary">From</dt>
          <dd className="text-text-primary">
            You
            {settings.data?.replyTo ? (
              <span className="text-text-secondary"> · replies go to {settings.data.replyTo}</span>
            ) : (
              <span className="text-text-secondary"> · no reply-to address is set yet</span>
            )}
          </dd>
          <dt className="text-text-secondary">To</dt>
          <dd className="text-text-primary">
            {candidateName}
            {candidateEmail ? (
              <span className="text-text-secondary"> · {candidateEmail}</span>
            ) : null}
          </dd>
        </dl>

        <TextInput
          label="Subject"
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value)
            setShown(null)
          }}
        />
        <Textarea
          label="Message"
          placeholder="Write a message. Use the {} menu for variables."
          showToolbar={false}
          rows={8}
          value={body}
          onChange={(event) => {
            setBody(event.target.value)
            setShown(null)
          }}
        />

        {templates.data && templates.data.length > 0 ? (
          <div className="flex flex-wrap items-center gap-[6px]" aria-label="Templates">
            {templates.data.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => pickTemplate(template.id)}
                className="inline-flex items-center gap-[4px] rounded-sm-7 bg-bg-transparent-light px-[6px] py-[2px] text-body-s leading-19_5 text-text-secondary transition-colors hover:text-text-primary"
              >
                <DashboardIcon name="document-text-solid" size={11} />
                {template.name}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-[6px]">
          <span className="text-caption-m text-text-secondary">Insert</span>
          {PLACEHOLDERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => insert(item.key)}
              className="rounded-sm-7 px-[6px] py-[2px] text-caption-m text-text-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium transition-colors hover:text-text-primary"
            >
              {item.label}
            </button>
          ))}
        </div>

        {attached.length > 0 ? (
          <ul className="flex flex-wrap gap-[6px]" aria-label="Attachments">
            {attached.map((file) => (
              <li
                key={file.id}
                className="inline-flex items-center gap-[6px] rounded-sm-7 bg-bg-transparent-light px-[8px] py-[3px] text-body-s text-text-primary"
              >
                <DashboardIcon name="paper-clip-solid" size={11} />
                {file.filename}
                <span className="text-caption-m text-text-secondary">
                  {formatFileSize(file.sizeBytes)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.filename}`}
                  onClick={() => drop(file.id)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <DashboardIcon name="x-mark-solid" size={11} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {shown ? (
          <div className="flex flex-col gap-[4px] rounded-lg-10 bg-bg-transparent-lighter p-[12px]">
            <p className="text-caption-m text-text-secondary">Preview as {candidateName} sees it</p>
            <p className="text-body-s font-medium text-text-primary">{shown.subject}</p>
            <p className="text-body-s leading-19_5 whitespace-pre-wrap text-text-primary">
              {shown.body}
            </p>
          </div>
        ) : null}

        {scheduling ? (
          <TextInput
            label="Send at"
            type="datetime-local"
            value={when}
            helperText="A minute to 90 days from now, in your time zone."
            onChange={(event) => setWhen(event.target.value)}
          />
        ) : null}

        {error ? (
          <p role="alert" className="text-body-s text-text-error">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={fileInput}
        type="file"
        hidden
        accept={ATTACHMENT_ACCEPT}
        onChange={(event) => {
          chooseFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <ModalActions>
        <TextButton
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? 'Uploading…' : 'Attach file'}
        </TextButton>
        <TextButton size="sm" onClick={showPreview} disabled={blocked || preview.isPending}>
          Preview
        </TextButton>
        <TextButton size="sm" onClick={() => setScheduling((value) => !value)}>
          {scheduling ? 'Send now instead' : 'Schedule'}
        </TextButton>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={blocked || pending}
          loading={send.isPending}
          onClick={submit}
        >
          {scheduling ? 'Schedule email' : 'Send'}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { ComposeDialog, localInput }
export type { ComposeDialogProps }
