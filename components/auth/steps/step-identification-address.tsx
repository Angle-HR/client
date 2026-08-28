'use client'

import { useState } from 'react'

import { LocationPinIcon } from '@/components/auth/account-type-icons'
import { AddressSearchField } from '@/components/auth/address-search-field'
import {
  AddressVerificationModal,
  type AddressChoice,
} from '@/components/auth/address-verification-modal'
import { ArrowRightIcon } from '@/components/auth/icons'
import { BannerSmall, FlowButton, TextButton, TextInput } from '@/components/ui'

import type {
  IdentificationField,
  ProductAddressSuggestion,
  ProductIdentification,
} from '@/lib/types'

/** Address parts, however they were arrived at. */
interface AddressParts {
  line_1?: string
  line_2?: string
  city?: string
  state_or_county?: string
  post_code?: string
  formatted_address?: string
  place_id?: string
}

interface IdentificationAddressValues {
  identification: ProductIdentification
  entryMode: 'search' | 'manual'
  address: AddressParts
}

interface StepIdentificationAddressProps {
  /** Identification inputs for the country picked on the profile step. */
  fields: IdentificationField[]
  fieldsLoading?: boolean
  submitting?: boolean
  formError?: string
  onSearchAddress: (query: string) => Promise<ProductAddressSuggestion[]>
  /**
   * Verify an address. Resolves to the verified address when it differs from
   * what was entered (so it can be offered back), `null` when it matched, or
   * throws nothing — a verifier that cannot judge resolves to 'not_verifiable'.
   */
  onVerifyAddress: (
    parts: AddressParts,
    entryMode: 'search' | 'manual',
  ) => Promise<{ status: 'verified'; suggested?: string } | { status: 'not_verifiable' }>
  onContinue: (values: IdentificationAddressValues) => void | Promise<void>
  onBack: () => void
}

/** Always built from the individual fields — used when the person typed them. */
function composeAddress(parts: AddressParts): string {
  return [parts.line_1, parts.line_2, parts.state_or_county, parts.city, parts.post_code]
    .filter(Boolean)
    .join(', ')
}

/** Prefers an address the API already formatted, e.g. a picked suggestion. */
function joinAddress(parts: AddressParts): string {
  return parts.formatted_address || composeAddress(parts)
}

function StepIdentificationAddress({
  fields,
  fieldsLoading = false,
  submitting = false,
  formError,
  onSearchAddress,
  onVerifyAddress,
  onContinue,
  onBack,
}: StepIdentificationAddressProps) {
  const [identification, setIdentification] = useState<ProductIdentification>({})
  const [identificationErrors, setIdentificationErrors] = useState<Record<string, string>>({})

  const [manual, setManual] = useState(false)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<AddressParts | null>(null)
  const [addressError, setAddressError] = useState<string>()

  const [manualParts, setManualParts] = useState<AddressParts>({})
  const [verifying, setVerifying] = useState(false)

  /** Set once verification returns something different from what was entered. */
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    entered: AddressParts
    suggested: string
  } | null>(null)

  /**
   * Validates against the pattern the API supplied for this country. Nothing
   * about a format is known here, which is the point: a new market ships without
   * touching this file.
   */
  function validateIdentification(): boolean {
    const next: Record<string, string> = {}
    for (const field of fields) {
      const raw = identification[field.key] ?? ''
      const value = raw.replace(/\s/g, '')

      if (field.required && !value) {
        next[field.key] = `Enter a valid ${field.label}`
        continue
      }
      if (value && field.pattern && !new RegExp(field.pattern).test(value)) {
        next[field.key] = field.format_hint
          ? `Enter a valid ${field.label} — ${field.format_hint}`
          : `Enter a valid ${field.label}`
      }
    }
    setIdentificationErrors(next)
    return Object.keys(next).length === 0
  }

  async function verifyThenContinue(parts: AddressParts, entryMode: 'search' | 'manual') {
    setVerifying(true)
    const result = await onVerifyAddress(parts, entryMode)
    setVerifying(false)

    if (result.status === 'not_verifiable') {
      // The verifier could not judge it, so hand over to manual entry.
      setAddressError("We couldn't verify your address. Please enter it manually.")
      setManual(true)
      // Carry the parts across but drop the formatted/place values: they belong
      // to the rejected attempt, and keeping them would be re-sent verbatim
      // instead of what the person is about to type.
      setManualParts((previous) => ({
        ...previous,
        line_1: parts.line_1 ?? previous.line_1,
        line_2: parts.line_2 ?? previous.line_2,
        city: parts.city ?? previous.city,
        state_or_county: parts.state_or_county ?? previous.state_or_county,
        post_code: parts.post_code ?? previous.post_code,
      }))
      return
    }

    if (result.suggested && result.suggested !== joinAddress(parts)) {
      setPendingSuggestion({ entered: parts, suggested: result.suggested })
      return
    }

    await onContinue({ identification, entryMode, address: parts })
  }

  async function handleSubmit() {
    setAddressError(undefined)
    if (!validateIdentification()) return

    if (manual) {
      if (!manualParts.line_1?.trim()) {
        setAddressError('Enter a valid registered Business address')
        return
      }
      await verifyThenContinue(
        { ...manualParts, place_id: undefined, formatted_address: composeAddress(manualParts) },
        'manual',
      )
      return
    }

    // Typing an address without picking a suggestion is allowed: it still gets
    // verified, which is what surfaces "we couldn't verify this" for free text.
    const typed = query.trim()
    if (!picked && !typed) {
      setAddressError('Enter a valid registered Business address')
      return
    }
    await verifyThenContinue(picked ?? { line_1: typed, formatted_address: typed }, 'search')
  }

  const busy = submitting || verifying

  return (
    <div className="flex w-full flex-col gap-32">
      <header className="flex w-full flex-col gap-20">
        <h1 className="text-heading-4 leading-39.7 font-semibold text-text-primary">
          Make it Yours
        </h1>
        <p className="text-body-l leading-21 font-medium text-text-secondary">
          We&apos;ll use this to set up your workspace.
        </p>
      </header>

      <form
        className="flex w-full flex-col gap-24"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <div className="flex flex-col gap-12">
          {fields.map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              size="md"
              autoComplete="off"
              placeholder={field.placeholder}
              helperText={identificationErrors[field.key] ? undefined : field.format_hint}
              errorText={identificationErrors[field.key]}
              value={identification[field.key] ?? ''}
              disabled={fieldsLoading}
              onChange={(event) => {
                setIdentification((previous) => ({
                  ...previous,
                  [field.key]: event.target.value,
                }))
                setIdentificationErrors((previous) => {
                  if (!previous[field.key]) return previous
                  const next = { ...previous }
                  delete next[field.key]
                  return next
                })
              }}
            />
          ))}

          {manual ? (
            <>
              <TextInput
                label="Address line 1"
                size="md"
                value={manualParts.line_1 ?? ''}
                errorText={addressError}
                onChange={(event) =>
                  setManualParts((previous) => ({ ...previous, line_1: event.target.value }))
                }
              />
              <TextInput
                label="Address line 2"
                size="md"
                value={manualParts.line_2 ?? ''}
                onChange={(event) =>
                  setManualParts((previous) => ({ ...previous, line_2: event.target.value }))
                }
              />
              <TextInput
                label="State/ County"
                size="md"
                value={manualParts.state_or_county ?? ''}
                onChange={(event) =>
                  setManualParts((previous) => ({
                    ...previous,
                    state_or_county: event.target.value,
                  }))
                }
              />
              <div className="flex gap-12">
                <div className="flex-1">
                  <TextInput
                    label="City"
                    size="md"
                    value={manualParts.city ?? ''}
                    onChange={(event) =>
                      setManualParts((previous) => ({ ...previous, city: event.target.value }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label="Post/Zip Code"
                    size="md"
                    value={manualParts.post_code ?? ''}
                    onChange={(event) =>
                      setManualParts((previous) => ({ ...previous, post_code: event.target.value }))
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <AddressSearchField
                label="Business Registered Address"
                value={query}
                errorText={addressError}
                onChange={(next) => {
                  setQuery(next)
                  setPicked(null)
                  setAddressError(undefined)
                }}
                onSearch={onSearchAddress}
                onSelect={(suggestion) => {
                  setQuery(suggestion.description || suggestion.formatted_address || '')
                  setPicked({
                    place_id: suggestion.place_id,
                    line_1: suggestion.line_1,
                    line_2: suggestion.line_2,
                    city: suggestion.city,
                    state_or_county: suggestion.state_or_county,
                    post_code: suggestion.post_code,
                    formatted_address: suggestion.formatted_address || suggestion.description,
                  })
                }}
              />
              <TextButton
                type="button"
                size="md"
                className="w-fit"
                onClick={() => {
                  setManual(true)
                  setAddressError(undefined)
                }}
              >
                <span className="flex items-center gap-4">
                  <LocationPinIcon />
                  Enter address manually
                </span>
              </TextButton>
            </>
          )}
        </div>

        {formError ? (
          <BannerSmall state="error" outline={false} showCloseButton={false}>
            {formError}
          </BannerSmall>
        ) : null}

        <div className="flex flex-col gap-8">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={busy || fieldsLoading}
            iconSuffix={<ArrowRightIcon />}
          >
            {verifying ? 'Checking address...' : manual ? 'Confirm address' : 'Continue'}
          </FlowButton>
          <FlowButton
            type="button"
            variant="tertiary"
            size="md"
            className="w-full"
            onClick={onBack}
          >
            Back
          </FlowButton>
        </div>
      </form>

      {pendingSuggestion ? (
        <SuggestionGate
          entered={joinAddress(pendingSuggestion.entered)}
          suggested={pendingSuggestion.suggested}
          saving={submitting}
          onDismiss={() => setPendingSuggestion(null)}
          onSave={async (choice) => {
            const parts =
              choice === 'suggested'
                ? { ...pendingSuggestion.entered, formatted_address: pendingSuggestion.suggested }
                : pendingSuggestion.entered
            setPendingSuggestion(null)
            await onContinue({
              identification,
              entryMode: manual ? 'manual' : 'search',
              address: parts,
            })
          }}
        />
      ) : null}
    </div>
  )
}

/** Holds the modal's radio choice so the step itself stays free of it. */
function SuggestionGate({
  entered,
  suggested,
  saving,
  onDismiss,
  onSave,
}: {
  entered: string
  suggested: string
  saving?: boolean
  onDismiss: () => void
  onSave: (choice: AddressChoice) => void | Promise<void>
}) {
  const [choice, setChoice] = useState<AddressChoice>('suggested')

  return (
    <AddressVerificationModal
      entered={entered}
      suggested={suggested}
      choice={choice}
      saving={saving}
      onChoiceChange={setChoice}
      onSave={() => void onSave(choice)}
      onClose={onDismiss}
    />
  )
}

export { StepIdentificationAddress }
export type { AddressParts, IdentificationAddressValues }
