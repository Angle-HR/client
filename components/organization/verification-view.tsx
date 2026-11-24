'use client'

import { useState, type FormEvent, type ReactElement } from 'react'

import { Button, TextInput } from '@/components/ui'
import { getApiError } from '@/lib/api-error'
import { toCountryCode, toMarketCode } from '@/lib/markets'
import {
  useConfirmKybAddress,
  useConfirmKybName,
  useRequestKybReview,
  useRetryKyb,
  useSubmitKyb,
} from '@/lib/mutations'
import { useHiringCatalog, useKyb } from '@/lib/queries'

import type { ApiKybDisplay } from '@/lib/organization/api-types'

const HEADLINE: Record<ApiKybDisplay, string> = {
  verified: 'Your company is verified',
  pending_review: 'Verification is being reviewed',
  action_required: 'We need you to check something',
  failed: 'Verification did not pass',
  not_started: 'Verify your company',
}

/** What an individual sees: there is no registry to check, so a person reviews their identity. */
const INDIVIDUAL_HEADLINE: Record<string, string> = {
  verified: 'Your account is verified',
  pending: 'Your identity is being reviewed',
  failed: 'Your identity review did not pass',
}

const sectionText = 'text-body-xs leading-19_2 text-text-tertiary'

/**
 * The company's verification (KYB). A new company submits its details; one
 * with a mismatch can fix the name or address in a click, or retry with the
 * name and number again. Tier 1 countries are checked at once, the rest wait
 * for manual review.
 */
function VerificationView(): ReactElement {
  const kyb = useKyb()
  // The select lists the hiring catalog's markets, which spell the UK `UK`; the verification takes ISO codes.
  const catalog = useHiringCatalog()
  const submit = useSubmitKyb()
  const retry = useRetryKyb()
  const confirmName = useConfirmKybName()
  const confirmAddress = useConfirmKybAddress()
  const requestReview = useRequestKybReview()

  const state = kyb.data
  const [country, setCountry] = useState('')
  const [legalName, setLegalName] = useState('')
  const [number, setNumber] = useState('')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [postCode, setPostCode] = useState('')

  if (kyb.isPending) return <div className="p-[24px]" aria-busy />
  if (kyb.isError || !state) {
    return (
      <p role="alert" className="p-[24px] text-body-s text-text-secondary">
        We couldn&apos;t load your verification. Try again in a moment.
      </p>
    )
  }

  if (state.kind === 'individual') {
    const status = state.status ?? 'pending'
    return (
      <div className="flex w-[640px] max-w-full flex-col gap-[24px] p-[24px]">
        <h1 className="text-body-xl leading-24 font-semibold text-text-primary">
          {INDIVIDUAL_HEADLINE[status] ?? INDIVIDUAL_HEADLINE.pending}
        </h1>
        {status === 'pending' ? (
          <p className={sectionText}>
            A member of our team reviews every personal account by hand. We&apos;ll email you when
            it&apos;s done. You can keep drafting jobs in the meantime; publishing opens once
            you&apos;re verified.
          </p>
        ) : null}
        {status === 'verified' ? <p className={sectionText}>You can publish jobs.</p> : null}
        {status === 'failed' ? (
          <>
            {state.failure_reason ? <p className={sectionText}>{state.failure_reason}</p> : null}
            <Button
              type="button"
              variant="primary"
              accent="blue"
              size="md"
              className="w-fit"
              loading={requestReview.isPending}
              onClick={() => requestReview.mutate()}
            >
              Request a new review
            </Button>
          </>
        ) : null}
        {requestReview.isError ? (
          <p role="alert" className={sectionText}>
            {getApiError(requestReview.error)?.message ?? 'That did not go through. Try again.'}
          </p>
        ) : null}
      </div>
    )
  }

  const display = state.display ?? 'not_started'
  const editing = display === 'not_started' || (display === 'failed' && !state.light_retry)
  const market = country || toMarketCode(state.country_code ?? '')
  const countryCode = market ? toCountryCode(market) : ''
  const busy =
    submit.isPending || retry.isPending || confirmName.isPending || confirmAddress.isPending
  const failure = [submit, retry, confirmName, confirmAddress].find((item) => item.isError)

  function send(event: FormEvent): void {
    event.preventDefault()
    submit.mutate({
      country_code: countryCode,
      legal_name: legalName.trim(),
      registration_number: number.trim() || undefined,
      address: {
        line1: line1.trim(),
        city: city.trim(),
        post_code: postCode.trim(),
        country: countryCode,
      },
    })
  }

  return (
    <div className="flex w-[640px] max-w-full flex-col gap-[24px] p-[24px]">
      <h1 className="text-body-xl leading-24 font-semibold text-text-primary">
        {HEADLINE[display]}
      </h1>

      {state.failure_reason ? <p className={sectionText}>{state.failure_reason}</p> : null}
      {display === 'pending_review' ? (
        <p className={sectionText}>
          We&apos;ll email you when it&apos;s done. You can keep creating jobs in the meantime.
        </p>
      ) : null}

      {state.name_confirmable ? (
        <div className="flex flex-col gap-[8px]">
          <p className="text-body-s text-text-secondary">
            The registry has this company as <strong>{state.registry_name}</strong>.
          </p>
          <Button
            type="button"
            variant="primary"
            accent="blue"
            size="md"
            className="w-fit"
            disabled={busy}
            onClick={() => confirmName.mutate()}
          >
            Use the registered name
          </Button>
        </div>
      ) : null}

      {state.address_confirmable ? (
        <div className="flex flex-col gap-[8px]">
          <p className="text-body-s text-text-secondary">
            Your address differs from the registered one
            {state.registered_address ? ` (${state.registered_address})` : ''}. Is the address you
            gave:
          </p>
          <div className="flex gap-[8px]">
            {(['registered', 'trading'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant="secondary"
                size="md"
                disabled={busy}
                onClick={() => confirmAddress.mutate(type)}
              >
                {type === 'registered' ? 'Our registered address' : 'Where we trade'}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {state.can_retry && state.light_retry ? (
        <form
          className="flex flex-col gap-[16px]"
          onSubmit={(event) => {
            event.preventDefault()
            retry.mutate({
              legal_name: legalName.trim() || undefined,
              registration_number: number.trim() || undefined,
            })
          }}
        >
          <TextInput
            label="Legal name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
          <TextInput
            label="Registration number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            accent="blue"
            size="md"
            className="w-fit"
            loading={retry.isPending}
          >
            Try again
          </Button>
        </form>
      ) : null}

      {editing ? (
        <form onSubmit={send} className="flex flex-col gap-[16px]">
          <label className="flex flex-col gap-[4px] text-body-xs font-medium text-text-secondary">
            Country
            <select
              className="h-[32px] rounded-lg-10 border border-border-transparent-light bg-transparent px-[8px] text-body-s text-text-primary"
              value={market}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="">Select a country</option>
              {(catalog.data?.markets ?? []).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <TextInput
            label="Legal name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
          <TextInput
            label="Registration number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <TextInput
            label="Address line 1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
          />
          <TextInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <TextInput
            label="Post code"
            value={postCode}
            onChange={(e) => setPostCode(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            accent="blue"
            size="md"
            className="w-fit"
            disabled={!market || !legalName.trim()}
            loading={submit.isPending}
          >
            Submit for verification
          </Button>
        </form>
      ) : null}

      {failure ? (
        <p role="alert" className={sectionText}>
          {getApiError(failure.error)?.message ?? 'That did not go through. Try again.'}
        </p>
      ) : null}
    </div>
  )
}

export { VerificationView }
