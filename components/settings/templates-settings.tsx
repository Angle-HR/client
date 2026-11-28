'use client'

import { useState, type ReactElement } from 'react'

import { Button, TextButton, TextInput, Textarea } from '@/components/ui'
import { OFFER_PLACEHOLDERS, PLACEHOLDERS } from '@/lib/applications/communications'
import { apiMessage } from '@/lib/jobs/api'
import {
  useEmailTemplateActions,
  useOfferTemplateActions,
  useSetEmailSettings,
} from '@/lib/mutations'
import { useEmailSettings, useEmailTemplates, useOfferTemplates } from '@/lib/queries'

function Section({
  title,
  text,
  children,
}: {
  title: string
  text: string
  children: React.ReactNode
}): ReactElement {
  return (
    <section className="flex flex-col gap-[12px] border-b border-border-transparent-light py-[16px]">
      <div className="flex flex-col gap-[4px]">
        <h2 className="text-body-s leading-19_5 font-semibold text-text-primary">{title}</h2>
        <p className="text-body-xs leading-19_2 text-text-tertiary">{text}</p>
      </div>
      {children}
    </section>
  )
}

/** Where candidates' replies go. Calendar invites need it, because it is their organizer. */
function ReplyTo(): ReactElement {
  const settings = useEmailSettings()
  const save = useSetEmailSettings()
  const [value, setValue] = useState<string | null>(null)
  const shown = value ?? settings.data?.replyTo ?? ''
  const dirty = value !== null && value !== (settings.data?.replyTo ?? '')

  return (
    <Section
      title="Reply-to address"
      text="Candidates' replies to your emails go here. Interview invites need one."
    >
      <div className="flex items-end gap-[8px]">
        <div className="w-[320px] max-w-full">
          <TextInput
            label="Reply-to email"
            type="email"
            value={shown}
            onChange={(event) => setValue(event.target.value)}
            errorText={save.isError ? apiMessage(save.error, 'That did not save.') : undefined}
          />
        </div>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={!dirty || save.isPending}
          loading={save.isPending}
          onClick={() => save.mutate(shown.trim(), { onSuccess: () => setValue(null) })}
        >
          Save
        </Button>
      </div>
    </Section>
  )
}

interface DraftTemplate {
  id: string | null
  name: string
  subject: string
  body: string
}

const EMPTY: DraftTemplate = { id: null, name: '', subject: '', body: '' }

/** Email templates: a name, a subject and a body that may use `{{variables}}`. */
function EmailTemplates(): ReactElement {
  const templates = useEmailTemplates()
  const { save, remove } = useEmailTemplateActions()
  const [draft, setDraft] = useState<DraftTemplate | null>(null)
  const error = save.error ?? remove.error

  return (
    <Section
      title="Email templates"
      text={`Write once, use when emailing a candidate. Variables: ${PLACEHOLDERS.map((item) => `{{${item.key}}}`).join(' ')}`}
    >
      <ul className="flex flex-col divide-y divide-border-transparent-light">
        {(templates.data ?? []).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-[12px] py-[8px]">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body-s font-medium text-text-primary">
                {item.name}
              </span>
              <span className="truncate text-body-xs text-text-secondary">{item.subject}</span>
            </div>
            <div className="flex shrink-0 gap-[12px]">
              <TextButton size="sm" onClick={() => setDraft({ ...item })}>
                Edit
              </TextButton>
              <TextButton
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id)}
              >
                Delete
              </TextButton>
            </div>
          </li>
        ))}
        {templates.data?.length === 0 ? (
          <li className="py-[8px] text-body-s text-text-secondary">No templates yet.</li>
        ) : null}
      </ul>
      {draft ? (
        <div className="flex flex-col gap-[10px] rounded-lg-10 bg-bg-transparent-lighter p-[12px]">
          <TextInput
            label="Name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <TextInput
            label="Subject"
            value={draft.subject}
            onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
          />
          <Textarea
            label="Body"
            showToolbar={false}
            rows={6}
            value={draft.body}
            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
          />
          <div className="flex gap-[8px]">
            <Button
              variant="primary"
              accent="blue"
              size="sm"
              disabled={
                !draft.name.trim() || !draft.subject.trim() || !draft.body.trim() || save.isPending
              }
              loading={save.isPending}
              onClick={() =>
                save.mutate(
                  {
                    id: draft.id,
                    body: {
                      name: draft.name.trim(),
                      subject: draft.subject.trim(),
                      body: draft.body.trim(),
                    },
                  },
                  { onSuccess: () => setDraft(null) },
                )
              }
            >
              Save template
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => setDraft(EMPTY)}>
          New template
        </Button>
      )}
      {error ? (
        <p role="alert" className="text-body-xs text-text-error">
          {apiMessage(error, 'That did not save. Try again.')}
        </p>
      ) : null}
    </Section>
  )
}

/** Offer templates: the letter's wording, with `{{variables}}` filled in when an offer is made. */
function OfferTemplates(): ReactElement {
  const templates = useOfferTemplates()
  const { save, remove } = useOfferTemplateActions()
  const [draft, setDraft] = useState<{ id: string | null; name: string; body: string } | null>(null)
  const error = save.error ?? remove.error

  return (
    <Section
      title="Offer letter templates"
      text={`Used when you make an offer. Variables: ${OFFER_PLACEHOLDERS.map((item) => `{{${item.key}}}`).join(' ')}`}
    >
      <ul className="flex flex-col divide-y divide-border-transparent-light">
        {(templates.data ?? []).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-[12px] py-[8px]">
            <span className="truncate text-body-s font-medium text-text-primary">{item.name}</span>
            <div className="flex shrink-0 gap-[12px]">
              <TextButton
                size="sm"
                onClick={() => setDraft({ id: item.id, name: item.name, body: item.body })}
              >
                Edit
              </TextButton>
              <TextButton
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id)}
              >
                Delete
              </TextButton>
            </div>
          </li>
        ))}
        {templates.data?.length === 0 ? (
          <li className="py-[8px] text-body-s text-text-secondary">No templates yet.</li>
        ) : null}
      </ul>
      {draft ? (
        <div className="flex flex-col gap-[10px] rounded-lg-10 bg-bg-transparent-lighter p-[12px]">
          <TextInput
            label="Name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <Textarea
            label="Letter"
            showToolbar={false}
            rows={10}
            value={draft.body}
            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
          />
          <div className="flex gap-[8px]">
            <Button
              variant="primary"
              accent="blue"
              size="sm"
              disabled={!draft.name.trim() || !draft.body.trim() || save.isPending}
              loading={save.isPending}
              onClick={() =>
                save.mutate(
                  { id: draft.id, body: { name: draft.name.trim(), body: draft.body.trim() } },
                  { onSuccess: () => setDraft(null) },
                )
              }
            >
              Save template
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => setDraft({ id: null, name: '', body: '' })}
        >
          New template
        </Button>
      )}
      {error ? (
        <p role="alert" className="text-body-xs text-text-error">
          {apiMessage(error, 'That did not save. Try again.')}
        </p>
      ) : null}
    </Section>
  )
}

/** Emails and offers: the reply-to address and the company's templates. */
function TemplatesSettings(): ReactElement {
  return (
    <>
      <ReplyTo />
      <EmailTemplates />
      <OfferTemplates />
    </>
  )
}

export { TemplatesSettings }
