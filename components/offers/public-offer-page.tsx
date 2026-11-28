'use client'

import { useState, type ReactElement } from 'react'

import { BannerSmall, Button, Checkbox, TextInput, Textarea } from '@/components/ui'
import { getApiError, getFieldErrors } from '@/lib/api-error'
import { useDeclineOffer, useSignOffer } from '@/lib/mutations'
import { usePublicOffer } from '@/lib/queries'
import { requests } from '@/lib/requests'

import type { PublicOffer } from '@/lib/applications/offers'

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : DATE.format(date)
}

/** The offer a candidate was sent: the letter, then signing or declining it. */
function PublicOfferPage({ token }: { token: string }): ReactElement {
  const offer = usePublicOffer(token)

  if (offer.isPending) return <p role="status">Loading your offer…</p>
  if (offer.isError || !offer.data) {
    // Unknown, ended and withdrawn links all answer the same, so one message covers them.
    return (
      <div role="alert" className="flex flex-col gap-[8px] text-text-primary">
        <h1 className="text-[25px] leading-[1.3] font-medium">This link is not available</h1>
        <p className="text-text-secondary">
          It may have ended, been replaced by a newer offer, or been withdrawn. If you were
          expecting an offer, reply to the email you received and the team will help.
        </p>
      </div>
    )
  }
  return <OfferView token={token} offer={offer.data} />
}

function OfferView({ token, offer }: { token: string; offer: PublicOffer }): ReactElement {
  const outcome = outcomeOf(offer)
  return (
    <article className="flex flex-col gap-[24px] text-text-primary">
      <header className="flex flex-col gap-[4px]">
        <p className="text-body-s text-text-secondary">{offer.company}</p>
        <h1 className="text-[25px] leading-[1.3] font-medium">{offer.title || offer.jobTitle}</h1>
        {offer.candidateName ? (
          <p className="text-body-s text-text-secondary">For {offer.candidateName}</p>
        ) : null}
      </header>

      {outcome ? <BannerSmall state={outcome.state}>{outcome.message}</BannerSmall> : null}

      {offer.startDate || offer.compensation || (offer.canRespond && offer.expiresAt) ? (
        <dl className="grid grid-cols-1 gap-[12px] rounded-lg-10 bg-bg-transparent-lighter p-[16px] sm:grid-cols-3">
          {offer.compensation ? <Fact label="Compensation" value={offer.compensation} /> : null}
          {offer.startDate ? <Fact label="Start date" value={formatDate(offer.startDate)} /> : null}
          {offer.canRespond && offer.expiresAt ? (
            <Fact label="Respond by" value={formatDate(offer.expiresAt)} />
          ) : null}
        </dl>
      ) : null}

      <section aria-label="Offer letter">
        <p className="text-body-m leading-24 whitespace-pre-wrap">{offer.body}</p>
      </section>

      {offer.canRespond ? <RespondForm token={token} offer={offer} /> : null}
      {offer.status === 'signed' && offer.hasDocument ? <SignedDownload token={token} /> : null}
    </article>
  )
}

function Fact({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex flex-col gap-[2px]">
      <dt className="text-caption-m text-text-secondary">{label}</dt>
      <dd className="text-body-s font-medium">{value}</dd>
    </div>
  )
}

/** What to say above the letter when the offer cannot be answered any more. */
function outcomeOf(
  offer: PublicOffer,
): { state: 'success' | 'info' | 'error'; message: string } | null {
  if (offer.status === 'signed') {
    return {
      state: 'success',
      message: `You signed this offer${offer.signedName ? ` as ${offer.signedName}` : ''}${offer.signedAt ? ` on ${formatDate(offer.signedAt)}` : ''}. A confirmation was sent to your email.`,
    }
  }
  if (offer.status === 'declined') return { state: 'info', message: 'You declined this offer.' }
  if (offer.status === 'expired') {
    return {
      state: 'error',
      message: 'This offer has expired. Contact the team if you still want it.',
    }
  }
  return null
}

function RespondForm({ token, offer }: { token: string; offer: PublicOffer }): ReactElement {
  const sign = useSignOffer(token)
  const decline = useDeclineOffer(token)
  const [fullName, setFullName] = useState('')
  const [consent, setConsent] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const busy = sign.isPending || decline.isPending
  const canSign = fullName.trim().length > 1 && consent

  function failed(cause: unknown): void {
    const problem = getFieldErrors(cause)[0]?.message
    const message = problem || getApiError(cause)?.message || 'That did not go through. Try again.'
    setError(message.charAt(0).toUpperCase() + message.slice(1))
  }

  function submitSign(): void {
    setError('')
    sign.mutate({ full_name: fullName.trim(), consent }, { onError: failed })
  }

  function submitDecline(): void {
    setError('')
    decline.mutate(reason.trim() || undefined, { onError: failed })
  }

  return (
    <section
      aria-label="Respond to the offer"
      className="flex flex-col gap-[16px] rounded-lg-10 p-[16px] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
    >
      {declining ? (
        <>
          <h2 className="text-body-l font-medium">Decline this offer</h2>
          <Textarea
            label="Tell the team why (optional)"
            showToolbar={false}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex gap-[8px]">
            <Button
              variant="primary"
              accent="red"
              size="md"
              disabled={busy}
              loading={decline.isPending}
              onClick={submitDecline}
            >
              Decline offer
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={busy}
              onClick={() => setDeclining(false)}
            >
              Back
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-body-l font-medium">Sign this offer</h2>
          <TextInput
            label="Type your full name to sign"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <Checkbox
            label={
              offer.consentText ||
              'I have read this offer and agree to sign it electronically. My typed name is my signature.'
            }
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <p className="text-caption-m text-text-secondary">
            We record your name, the time, and your device&apos;s address with the signed offer. The
            date is set by us when you sign.
          </p>
          <div className="flex flex-wrap gap-[8px]">
            <Button
              variant="primary"
              accent="blue"
              size="md"
              disabled={!canSign || busy}
              loading={sign.isPending}
              onClick={submitSign}
            >
              Sign offer
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={busy}
              onClick={() => setDeclining(true)}
            >
              Decline
            </Button>
          </div>
        </>
      )}
      {error ? (
        <p role="alert" className="text-body-s text-text-error">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function SignedDownload({ token }: { token: string }): ReactElement {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function open(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      const link = await requests.getPublicOfferDocument(token)
      if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch {
      // The PDF is made after signing and can take a moment.
      setError('The signed copy is not ready yet. Try again in a minute.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <Button
        variant="secondary"
        size="md"
        className="w-fit"
        loading={loading}
        onClick={() => void open()}
      >
        Download the signed copy
      </Button>
      {error ? (
        <p role="alert" className="text-body-s text-text-secondary">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { PublicOfferPage }
