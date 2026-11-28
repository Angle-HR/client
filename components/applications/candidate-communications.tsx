'use client'

import { useState, type ReactElement } from 'react'

import { formatDateTime } from '@/components/applications/candidate-overview'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Checkbox, TextButton } from '@/components/ui'
import {
  formatFileSize,
  isLiveOffer,
  messageState,
  offerEventLabel,
  type Interview,
  type Message,
  type Offer,
} from '@/lib/applications/communications'
import { formatInterviewTime } from '@/lib/applications/time'
import { useCancelApplicationEmail, useInterviewActions, useOfferActions } from '@/lib/mutations'
import {
  useApplicationEmails,
  useApplicationInterviews,
  useApplicationOffers,
  useOfferAudit,
} from '@/lib/queries'
import { requests } from '@/lib/requests'

type CommsTab = 'emails' | 'events' | 'offers'

const SUB_TABS: ReadonlyArray<{ key: CommsTab; label: string }> = [
  { key: 'emails', label: 'Emails' },
  { key: 'events', label: 'Events' },
  { key: 'offers', label: 'Offers' },
]

interface CandidateCommunicationsProps {
  jobId: string
  appId: string
  /** Whether the person may write, schedule and make offers (the same access as deciding). */
  canAct: boolean
  /** The application is still open, so an offer can be made. */
  canOffer: boolean
  initialTab?: CommsTab
  onCompose: () => void
  onSchedule: (interview?: Interview) => void
  onOffer: (draft?: Offer) => void
  onNotify: (message: string) => void
  onError: (cause: unknown) => void
}

const TONE_CLASS = {
  ok: 'text-text-success',
  wait: 'text-text-secondary',
  bad: 'text-text-error',
  off: 'text-text-tertiary',
} as const

/** What was sent to the candidate, what is planned with them, and the offers made to them. */
function CandidateCommunications(props: CandidateCommunicationsProps): ReactElement {
  const [tab, setTab] = useState<CommsTab>(props.initialTab ?? 'emails')
  const emails = useApplicationEmails(props.jobId, props.appId)
  const interviews = useApplicationInterviews(props.jobId, props.appId)
  const offers = useApplicationOffers(props.jobId, props.appId)
  const counts: Record<CommsTab, number> = {
    emails: emails.data?.length ?? 0,
    events: (interviews.data ?? []).filter((item) => item.status === 'scheduled').length,
    offers: (offers.data ?? []).filter(isLiveOffer).length,
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div
        role="tablist"
        aria-label="Communications"
        className="flex w-fit gap-[2px] rounded-sm-7 bg-bg-transparent-light p-[2px]"
      >
        {SUB_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-sm-6 px-[10px] py-[3px] text-body-s leading-19_5 transition-colors ${tab === item.key ? 'bg-bg-primary font-medium text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {item.label}
            {counts[item.key] > 0 ? (
              <span className="ml-[4px] text-text-secondary">{counts[item.key]}</span>
            ) : null}
          </button>
        ))}
      </div>
      {tab === 'emails' ? (
        <EmailsPane {...props} messages={emails.data} failed={emails.isError} />
      ) : tab === 'events' ? (
        <EventsPane {...props} items={interviews.data} failed={interviews.isError} />
      ) : (
        <OffersPane {...props} items={offers.data} failed={offers.isError} />
      )}
    </div>
  )
}

function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: string
  title: string
  text: string
  action?: ReactElement
}): ReactElement {
  return (
    <div className="flex flex-col items-center gap-[6px] py-[48px] text-center">
      <span className="text-text-secondary">
        <DashboardIcon name={icon} size={22} />
      </span>
      <p className="text-body-s font-medium text-text-secondary">{title}</p>
      <p className="text-body-xs text-text-secondary">{text}</p>
      {action}
    </div>
  )
}

function Failed({ what }: { what: string }): ReactElement {
  return (
    <p role="alert" className="text-body-s text-text-secondary">
      We couldn&apos;t load {what}.
    </p>
  )
}

function EmailsPane({
  jobId,
  appId,
  canAct,
  onCompose,
  onNotify,
  onError,
  messages,
  failed,
}: CandidateCommunicationsProps & {
  messages: Message[] | undefined
  failed: boolean
}): ReactElement {
  const cancel = useCancelApplicationEmail(jobId, appId)
  const [openId, setOpenId] = useState<string | null>(null)

  if (failed) return <Failed what="the emails" />
  if (!messages) return <p className="text-body-s text-text-secondary">Loading…</p>
  if (messages.length === 0) {
    return (
      <Empty
        icon="envelope-solid"
        title="No emails yet"
        text="Emails you send to this candidate show here."
        action={
          canAct ? (
            <Button variant="secondary" size="sm" onClick={onCompose}>
              Send email
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {canAct ? (
        <Button variant="secondary" size="sm" className="w-fit" onClick={onCompose}>
          New email
        </Button>
      ) : null}
      <ul className="flex flex-col divide-y divide-border-transparent-light rounded-lg-10 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
        {messages.map((message) => {
          const state = messageState(message)
          const open = openId === message.id
          return (
            <li key={message.id} className="flex flex-col gap-[8px] p-[12px]">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : message.id)}
                className="flex items-center justify-between gap-[12px] text-left"
              >
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="truncate text-body-s font-medium text-text-primary">
                    {message.subject}
                  </span>
                  <span className="text-caption-m text-text-secondary">
                    You ·{' '}
                    {message.status === 'scheduled'
                      ? `goes ${formatDateTime(message.scheduledAt)}`
                      : formatDateTime(message.sentAt || message.createdAt)}
                  </span>
                </span>
                <span className={`shrink-0 text-body-xs ${TONE_CLASS[state.tone]}`}>
                  {state.label}
                </span>
              </button>
              {open ? (
                <div className="flex flex-col gap-[10px]">
                  <p className="text-body-s leading-19_5 whitespace-pre-wrap text-text-primary">
                    {message.body}
                  </p>
                  {message.attachments.length > 0 ? (
                    <ul className="flex flex-wrap gap-[6px]">
                      {message.attachments.map((file) => (
                        <li
                          key={file.id}
                          className="inline-flex items-center gap-[4px] rounded-sm-7 bg-bg-transparent-light px-[8px] py-[3px] text-body-xs text-text-primary"
                        >
                          <DashboardIcon name="paper-clip-solid" size={10} />
                          {file.filename}
                          <span className="text-text-secondary">
                            {formatFileSize(file.sizeBytes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {message.error ? (
                    <p className="text-body-xs text-text-error">{message.error}</p>
                  ) : null}
                  {message.status === 'scheduled' && canAct ? (
                    <TextButton
                      size="sm"
                      disabled={cancel.isPending}
                      onClick={() =>
                        cancel.mutate(message.id, {
                          onSuccess: () => onNotify('Scheduled email cancelled'),
                          onError: onError,
                        })
                      }
                    >
                      Cancel this email
                    </TextButton>
                  ) : null}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EventsPane({
  jobId,
  appId,
  canAct,
  onSchedule,
  onNotify,
  onError,
  items,
  failed,
}: CandidateCommunicationsProps & {
  items: Interview[] | undefined
  failed: boolean
}): ReactElement {
  const { close } = useInterviewActions(jobId, appId)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)

  if (failed) return <Failed what="the interviews" />
  if (!items) return <p className="text-body-s text-text-secondary">Loading…</p>
  if (items.length === 0) {
    return (
      <Empty
        icon="calendar-solid"
        title="No events yet"
        text="Interviews you schedule with this candidate show here."
        action={
          canAct ? (
            <Button variant="secondary" size="sm" onClick={() => onSchedule()}>
              Schedule interview
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {canAct ? (
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => onSchedule()}>
          Schedule interview
        </Button>
      ) : null}
      <ul className="flex flex-col gap-[10px]">
        {items.map((item) => {
          const open = item.status === 'scheduled'
          return (
            <li
              key={item.id}
              className="flex flex-col gap-[8px] rounded-lg-10 p-[12px] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
            >
              <div className="flex items-center justify-between gap-[12px]">
                <p className="text-body-s font-medium text-text-primary">
                  {formatInterviewTime(item.startsAt, item.durationMinutes, item.timezone)}
                </p>
                <span
                  className={`text-body-xs capitalize ${item.status === 'completed' ? 'text-text-success' : item.status === 'cancelled' ? 'text-text-tertiary' : 'text-text-secondary'}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="flex items-center gap-[4px] text-body-xs text-text-secondary">
                <DashboardIcon
                  name={
                    item.kind === 'video'
                      ? 'video-camera-solid'
                      : item.kind === 'phone'
                        ? 'phone-solid'
                        : 'map-pin-solid'
                  }
                  size={11}
                />
                {item.kind === 'video' && item.location.startsWith('https://') ? (
                  <a
                    href={item.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Join the call
                  </a>
                ) : (
                  <span>{item.location || (item.kind === 'phone' ? 'Phone call' : '')}</span>
                )}
                <span>· {item.timezone.replace(/_/g, ' ')}</span>
              </p>
              {item.notes ? (
                <p className="text-body-xs whitespace-pre-wrap text-text-secondary">{item.notes}</p>
              ) : null}
              {open && canAct ? (
                cancelling === item.id ? (
                  <div className="flex flex-wrap items-center gap-[12px]">
                    <Checkbox
                      label="Tell the candidate"
                      checked={notify}
                      onChange={(event) => setNotify(event.target.checked)}
                    />
                    <Button
                      variant="primary"
                      accent="red"
                      size="sm"
                      loading={close.isPending}
                      onClick={() =>
                        close.mutate(
                          { id: item.id, action: 'cancel', body: { notify } },
                          {
                            onSuccess: () => {
                              setCancelling(null)
                              onNotify('Interview cancelled')
                            },
                            onError: onError,
                          },
                        )
                      }
                    >
                      Cancel interview
                    </Button>
                    <TextButton size="sm" onClick={() => setCancelling(null)}>
                      Keep it
                    </TextButton>
                  </div>
                ) : (
                  <div className="flex gap-[12px]">
                    <TextButton size="sm" onClick={() => onSchedule(item)}>
                      Reschedule
                    </TextButton>
                    <TextButton
                      size="sm"
                      disabled={close.isPending}
                      onClick={() =>
                        close.mutate(
                          { id: item.id, action: 'complete' },
                          {
                            onSuccess: () => onNotify('Interview marked as held'),
                            onError: onError,
                          },
                        )
                      }
                    >
                      Mark as held
                    </TextButton>
                    <TextButton size="sm" onClick={() => setCancelling(item.id)}>
                      Cancel
                    </TextButton>
                  </div>
                )
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OffersPane({
  jobId,
  appId,
  canAct,
  canOffer,
  onOffer,
  onNotify,
  onError,
  items,
  failed,
}: CandidateCommunicationsProps & { items: Offer[] | undefined; failed: boolean }): ReactElement {
  const { send, withdraw } = useOfferActions(jobId, appId)
  const [auditId, setAuditId] = useState<string | null>(null)
  const audit = useOfferAudit(jobId, appId, auditId)

  async function openSigned(offerId: string): Promise<void> {
    try {
      const link = await requests.getOfferDocumentLink(jobId, appId, offerId)
      if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (cause) {
      onError(cause)
    }
  }

  if (failed) return <Failed what="the offers" />
  if (!items) return <p className="text-body-s text-text-secondary">Loading…</p>
  const hasLive = items.some(isLiveOffer)
  const newOffer =
    canAct && canOffer && !hasLive ? (
      <Button variant="secondary" size="sm" className="w-fit" onClick={() => onOffer()}>
        Make an offer
      </Button>
    ) : null

  if (items.length === 0) {
    return (
      <Empty
        icon="briefcase-solid"
        title="No offers yet"
        text={
          canOffer
            ? 'Send an offer letter to sign online.'
            : 'An offer can be made while the application is open.'
        }
        action={newOffer ?? undefined}
      />
    )
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {newOffer}
      <ul className="flex flex-col gap-[10px]">
        {items.map((offer) => (
          <li
            key={offer.id}
            className="flex flex-col gap-[8px] rounded-lg-10 p-[12px] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
          >
            <div className="flex items-center justify-between gap-[12px]">
              <p className="min-w-0 truncate text-body-s font-medium text-text-primary">
                {offer.title}
              </p>
              <span className="shrink-0 text-body-xs text-text-secondary capitalize">
                {offer.status}
              </span>
            </div>
            <p className="text-caption-m text-text-secondary">
              {[
                offer.compensation,
                offer.startDate ? `starts ${offer.startDate.slice(0, 10)}` : '',
                offer.signedAt
                  ? `signed ${formatDateTime(offer.signedAt)} by ${offer.signedName}`
                  : offer.declinedAt
                    ? `declined ${formatDateTime(offer.declinedAt)}`
                    : offer.viewedAt
                      ? `opened ${formatDateTime(offer.viewedAt)}`
                      : offer.sentAt
                        ? `sent ${formatDateTime(offer.sentAt)}`
                        : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {offer.declineReason ? (
              <p className="text-body-xs text-text-secondary">“{offer.declineReason}”</p>
            ) : null}
            <div className="flex flex-wrap gap-[12px]">
              {canAct && offer.status === 'draft' ? (
                <>
                  <TextButton size="sm" onClick={() => onOffer(offer)}>
                    Edit
                  </TextButton>
                  <TextButton
                    size="sm"
                    disabled={send.isPending}
                    onClick={() =>
                      send.mutate(
                        { id: offer.id },
                        { onSuccess: () => onNotify('Offer sent'), onError: onError },
                      )
                    }
                  >
                    Send
                  </TextButton>
                </>
              ) : null}
              {canAct && (offer.status === 'sent' || offer.status === 'viewed') ? (
                <TextButton
                  size="sm"
                  disabled={send.isPending}
                  onClick={() =>
                    send.mutate(
                      { id: offer.id },
                      { onSuccess: () => onNotify('Offer sent again'), onError: onError },
                    )
                  }
                >
                  Resend
                </TextButton>
              ) : null}
              {canAct && isLiveOffer(offer) ? (
                <TextButton
                  size="sm"
                  disabled={withdraw.isPending}
                  onClick={() =>
                    withdraw.mutate(offer.id, {
                      onSuccess: () => onNotify('Offer withdrawn'),
                      onError: onError,
                    })
                  }
                >
                  Withdraw
                </TextButton>
              ) : null}
              {offer.status === 'signed' && offer.hasDocument ? (
                <TextButton size="sm" onClick={() => void openSigned(offer.id)}>
                  Signed copy
                </TextButton>
              ) : null}
              {offer.status !== 'draft' ? (
                <TextButton
                  size="sm"
                  onClick={() => setAuditId(auditId === offer.id ? null : offer.id)}
                >
                  {auditId === offer.id ? 'Hide history' : 'History'}
                </TextButton>
              ) : null}
            </div>
            {auditId === offer.id ? (
              <ol className="flex flex-col gap-[6px] border-t border-border-transparent-light pt-[8px]">
                {(audit.data ?? []).map((event) => (
                  <li key={event.id} className="text-caption-m text-text-secondary">
                    {offerEventLabel(event)} · {formatDateTime(event.at)}
                    {event.ip ? ` · ${event.ip}` : ''}
                  </li>
                ))}
                {audit.isError ? (
                  <li className="text-caption-m">We couldn&apos;t load the history.</li>
                ) : null}
              </ol>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { CandidateCommunications }
export type { CandidateCommunicationsProps, CommsTab }
