'use client'

import { useState, type FormEvent, type ReactElement } from 'react'

import { Button, Checkbox, TextInput } from '@/components/ui'
import { getApiError } from '@/lib/api-error'
import { useAcceptAgreements, useRecordDpia, useSetPrivacyContact } from '@/lib/mutations'
import { useCompanySetup, useKyb, useMe } from '@/lib/queries'

const sectionTitle = 'text-body-s leading-19_5 font-semibold text-text-primary'
const sectionText = 'text-body-xs leading-19_2 text-text-tertiary'

function messageOf(error: unknown): string {
  return getApiError(error)?.message ?? 'That did not save. Try again.'
}

/**
 * What the company needs on file before its jobs can publish: the data
 * processing agreement, the privacy contact and, for automated screening,
 * the DPIA. Each part saves on its own.
 */
function CompanySetupView(): ReactElement {
  const setup = useCompanySetup()
  const accept = useAcceptAgreements()
  const dpia = useRecordDpia()
  const contact = useSetPrivacyContact()
  // A person hiring as themselves is the data controller. Their account email is a sensible default for the
  // privacy contact, but it is a legal statement, so it is only prefilled: nothing is saved until they save.
  const individual = useKyb().data?.kind === 'individual'
  const accountEmail = useMe().data?.email ?? ''

  const data = setup.data
  const [agreed, setAgreed] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [dpo, setDpo] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const [summary, setSummary] = useState('')

  if (setup.isError) {
    return (
      <p role="alert" className="p-[24px] text-body-s text-text-secondary">
        We couldn&apos;t load your hiring settings. Try again in a moment.
      </p>
    )
  }
  if (!data) return <div className="p-[24px]" aria-busy />

  const privacyEmail = email ?? (data.privacy_contact_email || (individual ? accountEmail : ''))
  const dpoContact = dpo ?? data.dpo_contact ?? ''
  const dpiaRecorded = (data.dpia_version ?? 0) > 0

  function saveContact(event: FormEvent): void {
    event.preventDefault()
    contact.mutate({ privacy_contact_email: privacyEmail.trim(), dpo_contact: dpoContact.trim() })
  }

  function saveDpia(event: FormEvent): void {
    event.preventDefault()
    dpia.mutate({ reference: reference.trim(), summary: summary.trim() })
  }

  return (
    <div className="flex w-[640px] max-w-full flex-col gap-[40px] p-[24px]">
      <h1 className="text-body-xl leading-24 font-semibold text-text-primary">
        {individual ? 'Hiring settings' : 'Company settings'}
      </h1>

      <section className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[6px]">
          <h2 className={sectionTitle}>Data processing agreement</h2>
          <p className={sectionText}>
            Required before a job can publish. Version {data.dpa_version ?? '—'}.
          </p>
        </div>
        {data.dpa_accepted ? (
          <p className="text-body-s text-text-secondary">Accepted.</p>
        ) : (
          <>
            <Checkbox
              size="md"
              label="I accept the terms and the data processing agreement"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <Button
              type="button"
              variant="primary"
              accent="blue"
              size="md"
              className="w-fit"
              disabled={!agreed || !data.dpa_version}
              loading={accept.isPending}
              onClick={() => accept.mutate(data.dpa_version ?? '')}
            >
              Accept
            </Button>
            {accept.isError ? (
              <p role="alert" className={sectionText}>
                {messageOf(accept.error)}
              </p>
            ) : null}
          </>
        )}
      </section>

      <form onSubmit={saveContact} className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[6px]">
          <h2 className={sectionTitle}>Privacy contact</h2>
          <p className={sectionText}>
            Candidates are shown this address for questions about their data.
            {individual ? ' You are the data controller for the applications you receive.' : ''}
          </p>
        </div>
        <TextInput
          label="Privacy contact email"
          type="email"
          value={privacyEmail}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Data protection officer (optional)"
          value={dpoContact}
          onChange={(event) => setDpo(event.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          accent="blue"
          size="md"
          className="w-fit"
          disabled={!privacyEmail.trim()}
          loading={contact.isPending}
        >
          Save contact
        </Button>
        {contact.isError ? (
          <p role="alert" className={sectionText}>
            {messageOf(contact.error)}
          </p>
        ) : null}
      </form>

      <form onSubmit={saveDpia} className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[6px]">
          <h2 className={sectionTitle}>Data protection impact assessment</h2>
          <p className={sectionText}>
            Needed to publish a job with automated screening.{' '}
            {dpiaRecorded ? `Version ${data.dpia_version} on file.` : 'None on file.'}
            {data.automated_screening_enabled
              ? ''
              : individual
                ? ' Screening is not available for personal accounts.'
                : ' Screening is not enabled for your company.'}
          </p>
        </div>
        <TextInput
          label="Where the full assessment lives"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
        <TextInput
          label="What automated screening it covers"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          accent="blue"
          size="md"
          className="w-fit"
          disabled={!reference.trim() || !summary.trim()}
          loading={dpia.isPending}
        >
          {dpiaRecorded ? 'Record a new version' : 'Record DPIA'}
        </Button>
        {dpia.isError ? (
          <p role="alert" className={sectionText}>
            {messageOf(dpia.error)}
          </p>
        ) : null}
      </form>
    </div>
  )
}

export { CompanySetupView }
