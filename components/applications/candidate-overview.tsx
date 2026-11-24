'use client'

import { type ReactElement, type ReactNode } from 'react'

import {
  Attachments,
  Resume,
  SectionTitle,
  findResume,
  openApplicationFile,
} from '@/components/applications/candidate-files'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { TextButton } from '@/components/ui'
import { contactFromAnswers, type CandidateLink } from '@/lib/applications/contact'
import { marketName } from '@/lib/markets'

import type { ApplicantDetail } from '@/lib/applications/api'

const DATE_PART = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const TIME_PART = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

/** "Oct 16, 2026 9:34 AM", as the panel's header and the submission line show it. */
function formatDateTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `${DATE_PART.format(date)} ${TIME_PART.format(date)}`
}

/** The glyph of each link kind. The design has no X glyph for a website, so the globe stands for it. */
const LINK_ICON: Record<CandidateLink['kind'], string> = {
  website: 'globe-alt-solid',
  linkedin: 'linkedln',
  github: 'github',
}

/** A labelled group in the right-hand column, titled as the design's 11px captions. */
function Block({ title, children }: { title: string; children?: ReactNode }): ReactElement {
  return (
    <section className="flex flex-col gap-[8px]">
      <h3 className="text-caption-m leading-17_6 text-text-secondary">{title}</h3>
      {children}
    </section>
  )
}

function ContactRow({ icon, children }: { icon: string; children: ReactNode }): ReactElement {
  return (
    <p className="flex min-w-0 items-center gap-[8px] text-body-s leading-19_5 text-text-secondary">
      <span className="inline-flex shrink-0">
        <DashboardIcon name={icon} size={14} />
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </p>
  )
}

interface CandidateOverviewProps {
  jobId: string
  detail: ApplicantDetail
  onError: (cause: unknown) => void
}

/**
 * The Overview tab: the screening answers and the resume on the left, and the
 * contact details, location and work authorisation on the right. Next up,
 * Assigned and "Add more info" are drawn with no data behind them yet.
 */
function CandidateOverview({ jobId, detail, onError }: CandidateOverviewProps): ReactElement {
  const screening = detail.answers.filter((answer) => answer.section === 'screening')
  const resume = findResume(detail.files)
  const attachments = detail.files.filter((file) => file !== resume)
  const contact = contactFromAnswers(detail.answers)

  return (
    <div className="flex gap-[72px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[24px]">
        {screening.length > 0 ? (
          <section className="flex flex-col gap-[28px]">
            <SectionTitle icon="question-mark-circle-solid">Screening questions</SectionTitle>
            {screening.map((answer) => (
              <div key={answer.questionId} className="flex flex-col gap-[24px]">
                <p className="text-body-xs leading-19_2 font-medium text-text-secondary">
                  {answer.label}
                </p>
                {answer.fileId ? (
                  <TextButton
                    size="sm"
                    onClick={() =>
                      void openApplicationFile(jobId, detail.id, answer.fileId ?? '').catch(
                        (cause: unknown) => onError(cause),
                      )
                    }
                  >
                    Download
                  </TextButton>
                ) : (
                  <p className="text-body-l leading-21 font-medium whitespace-pre-line text-text-primary">
                    {answer.text || '—'}
                  </p>
                )}
              </div>
            ))}
            {detail.submittedAt ? (
              <p className="flex items-center gap-[4px] text-caption-m leading-17_6 text-text-tertiary">
                <DashboardIcon name="clock-outline" size={10} />
                Submitted {formatDateTime(detail.submittedAt)}
              </p>
            ) : null}
          </section>
        ) : null}
        {resume ? <Resume jobId={jobId} appId={detail.id} file={resume} onError={onError} /> : null}
        <Attachments jobId={jobId} appId={detail.id} files={attachments} onError={onError} />
      </div>

      <aside className="flex w-[265px] shrink-0 flex-col gap-[24px]">
        <Block title="Next up" />
        <Block title="Contact details">
          <div className="flex flex-col gap-[8px]">
            {detail.email ? <ContactRow icon="envelope-solid">{detail.email}</ContactRow> : null}
            {contact.phone ? <ContactRow icon="phone-solid">{contact.phone}</ContactRow> : null}
            {contact.links
              .filter((link) => link.kind === 'website')
              .map((link) => (
                <ContactRow key={link.url} icon={LINK_ICON[link.kind]}>
                  <a
                    href={/^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {link.url}
                  </a>
                </ContactRow>
              ))}
            {contact.links.some((link) => link.kind !== 'website') ? (
              <div className="flex items-center gap-[2px]">
                {contact.links
                  .filter((link) => link.kind !== 'website')
                  .map((link) => (
                    <a
                      key={link.url}
                      href={/^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.kind}
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-sm-7 text-text-tertiary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
                    >
                      <DashboardIcon name={LINK_ICON[link.kind]} size={14} />
                    </a>
                  ))}
              </div>
            ) : null}
            <button
              type="button"
              className="flex w-fit items-center gap-[2px] px-[6px] py-[6px] text-body-s leading-19_5 text-text-secondary"
            >
              Add more info
              <DashboardIcon name="plus-solid" size={11} />
            </button>
          </div>
        </Block>
        {detail.country ? (
          <Block title="Location">
            <ContactRow icon="location-pin-solid">{marketName(detail.country)}</ContactRow>
          </Block>
        ) : null}
        {contact.authorizedToWork ? (
          <p className="flex items-center gap-[6px] text-body-xs leading-19_2 font-medium text-green-4">
            <DashboardIcon name="check-badge-solid" size={14} />
            Authorized to work
          </p>
        ) : null}
        <Block title="Assigned" />
      </aside>
    </div>
  )
}

export { CandidateOverview, formatDateTime }
export type { CandidateOverviewProps }
