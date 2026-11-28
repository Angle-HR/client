'use client'

import { useState, type ReactElement, type ReactNode } from 'react'

import { TemplatesSettings } from '@/components/settings/templates-settings'
import { Tabs, Toggle, type TabOption } from '@/components/ui'
import { getApiError } from '@/lib/api-error'
import { useSetApplicantSettings, useSetAutomatedScreening } from '@/lib/mutations'
import { useApplicantSettings, useHiringSettings } from '@/lib/queries'

type SettingsTab = 'hiring' | 'candidates' | 'templates'

const TABS: TabOption<SettingsTab>[] = [
  { key: 'hiring', label: 'Hiring' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'templates', label: 'Email & offers' },
]

/** The months a reapply block runs for when it is on. The API takes 0 or 6. */
const REAPPLY_BLOCK_MONTHS = 6

interface RowProps {
  title: string
  text: string
  note?: string
  control: ReactNode
}

function Row({ title, text, note, control }: RowProps): ReactElement {
  return (
    <div className="flex items-start justify-between gap-[24px] border-b border-border-transparent-light py-[16px]">
      <div className="flex min-w-0 flex-col gap-[4px]">
        <span className="text-body-s leading-19_5 font-semibold text-text-primary">{title}</span>
        <span className="text-body-xs leading-19_2 text-text-tertiary">{text}</span>
        {note ? (
          <span className="text-body-xs leading-19_2 text-text-secondary">{note}</span>
        ) : null}
      </div>
      {control}
    </div>
  )
}

function messageOf(error: unknown): string {
  const body = getApiError(error)
  // Both switches are permission-gated, and the API says so with a 403.
  return body?.message ?? 'That did not save. Try again.'
}

/** Company-level switches: automated screening, and what candidates are told and allowed. */
function HiringSettingsView(): ReactElement {
  const [tab, setTab] = useState<SettingsTab>('hiring')
  const hiring = useHiringSettings()
  const applicant = useApplicantSettings()
  const screening = useSetAutomatedScreening()
  const candidates = useSetApplicantSettings()

  const failure = [screening, candidates].find((item) => item.isError)

  return (
    <div className="flex w-[640px] max-w-full flex-col gap-[24px] p-[24px]">
      <h1 className="text-body-xl leading-24 font-semibold text-text-primary">Hiring settings</h1>
      <Tabs tabs={TABS} value={tab} onValueChange={setTab} aria-label="Settings" />

      {tab === 'templates' ? (
        <TemplatesSettings />
      ) : tab === 'hiring' ? (
        hiring.data ? (
          <Row
            title="Automated screening"
            text="Lets jobs use knockout questions. A rule only flags a candidate for a person to review; it never rejects anyone."
            note="Only your company's legal contact can turn this on. It also needs a DPIA on file."
            control={
              <Toggle
                size="sm"
                toggled={hiring.data.automated_screening_enabled ?? false}
                aria-busy={screening.isPending}
                disabled={screening.isPending}
                aria-label="Automated screening"
                onChange={(enabled) => screening.mutate(enabled)}
              />
            }
          />
        ) : (
          <div aria-busy>
            {hiring.isError ? <p role="alert">Couldn&apos;t load the settings.</p> : null}
          </div>
        )
      ) : applicant.data ? (
        <>
          <Row
            title="Email candidates when they are rejected or hired"
            text="They are told once, when the decision is made."
            control={
              <Toggle
                size="sm"
                toggled={applicant.data.send_status_emails ?? false}
                disabled={candidates.isPending}
                aria-label="Email candidates about decisions"
                onChange={(on) => candidates.mutate({ send_status_emails: on })}
              />
            }
          />
          <Row
            title="Block rejected candidates from reapplying"
            text={`A rejected candidate cannot apply again for ${REAPPLY_BLOCK_MONTHS} months.`}
            note={
              applicant.data.reapply_block_available === false
                ? 'Not available yet on your account.'
                : undefined
            }
            control={
              <Toggle
                size="sm"
                toggled={(applicant.data.reapply_block_months ?? 0) > 0}
                disabled={candidates.isPending || applicant.data.reapply_block_available === false}
                aria-label="Block reapplications"
                onChange={(on) =>
                  candidates.mutate({ reapply_block_months: on ? REAPPLY_BLOCK_MONTHS : 0 })
                }
              />
            }
          />
        </>
      ) : (
        <div aria-busy>
          {applicant.isError ? <p role="alert">Couldn&apos;t load the settings.</p> : null}
        </div>
      )}

      {failure ? (
        <p role="alert" className="text-body-xs leading-19_2 text-text-secondary">
          {messageOf(failure.error)}
        </p>
      ) : null}
    </div>
  )
}

export { HiringSettingsView }
