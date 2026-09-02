'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { LocationPinIcon } from '@/components/auth/account-type-icons'
import { ArrowRightIcon } from '@/components/auth/icons'
import {
  BannerSmall,
  CountryFlag,
  FlowButton,
  InputSelection,
  ListItemLocation,
  TextButton,
  TextInput,
  type SelectOption,
} from '@/components/ui'
import { useCountries } from '@/lib/queries'

import type { Country } from '@/lib/types'

function flagCodeFor(country: Pick<Country, 'icon_key' | 'slug'>): string {
  return country.icon_key?.replace(/^flag-/, '') || country.slug
}

type AddressMode = 'search' | 'manual' | 'suggestions'

const searchSchema = z.object({
  countryId: z.string().min(1, 'Select a country of residence'),
  address: z.string().trim().min(1, 'Enter a valid registered Business address'),
})

const manualSchema = z.object({
  countryId: z.string().min(1, 'Select a country of residence'),
  addressLine1: z.string().trim().min(1, 'Please enter address line 1.'),
  addressLine2: z.string().optional(),
  city: z.string().trim().min(1, 'Please enter a town / city.'),
  postcode: z.string().trim().min(1, 'Please enter a postcode.'),
})

type SearchValues = z.infer<typeof searchSchema>
type ManualValues = z.infer<typeof manualSchema>

export interface WorkspaceValues {
  countryId: string
  addressMode: 'search' | 'manual'
  address: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postcode?: string
  selectedSuggestion?: 'entered' | 'suggested'
}

interface StepWorkspaceProps {
  onContinue: (values: WorkspaceValues) => void | Promise<void>
  /**
   * Ask the verifier what it makes of the address as typed. Resolves to a
   * corrected address to offer back, or undefined when there is nothing to
   * suggest — including when the verifier is unavailable, which is not an error.
   */
  onVerifyAddress: (address: string, countryId: string) => Promise<string | undefined>
  onBack: () => void
  submitting?: boolean
}

function formatManualAddress(values: ManualValues): string {
  return [values.addressLine1, values.addressLine2, values.city, values.postcode]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}

function StepWorkspace({
  onContinue,
  onVerifyAddress,
  onBack,
  submitting = false,
}: StepWorkspaceProps) {
  const [mode, setMode] = useState<AddressMode>('search')
  const [entryMode, setEntryMode] = useState<'search' | 'manual'>('search')
  const [enteredAddress, setEnteredAddress] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<'entered' | 'suggested'>('suggested')
  const [addressNotFound, setAddressNotFound] = useState(false)
  const [draftCountryId, setDraftCountryId] = useState('')
  const [manualDraft, setManualDraft] = useState<ManualValues | null>(null)
  const [suggestedAddress, setSuggestedAddress] = useState<string>()
  const [verifying, setVerifying] = useState(false)

  const { data: countries, isLoading, isError } = useCountries()

  const countryOptions: SelectOption[] = useMemo(
    () =>
      (countries ?? []).map((country) => ({
        value: country.id,
        label: country.name,
        icon: (
          <CountryFlag code={flagCodeFor(country)} name={country.name} width={24} height={16} />
        ),
      })),
    [countries],
  )

  const searchForm = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { countryId: '', address: '' },
  })

  const manualForm = useForm<ManualValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      countryId: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
    },
  })

  async function goToSuggestions(
    address: string,
    countryId: string,
    nextEntryMode: 'search' | 'manual',
    manualValues?: ManualValues,
  ) {
    setEnteredAddress(address)
    setDraftCountryId(countryId)
    setEntryMode(nextEntryMode)
    setManualDraft(manualValues ?? null)
    setAddressNotFound(false)

    setVerifying(true)
    const suggestion = await onVerifyAddress(address, countryId)
    setVerifying(false)

    setSuggestedAddress(suggestion)
    // With nothing to compare against, what they typed is the only option.
    setSelectedSuggestion(suggestion ? 'suggested' : 'entered')
    setMode('suggestions')
  }

  async function handleSearchSubmit(values: SearchValues) {
    await goToSuggestions(values.address.trim(), values.countryId, 'search')
  }

  async function handleManualSubmit(values: ManualValues) {
    await goToSuggestions(formatManualAddress(values), values.countryId, 'manual', values)
  }

  async function handleSuggestionsContinue() {
    const finalAddress =
      selectedSuggestion === 'suggested' && suggestedAddress ? suggestedAddress : enteredAddress
    await onContinue({
      countryId:
        draftCountryId || searchForm.getValues('countryId') || manualForm.getValues('countryId'),
      addressMode: entryMode,
      address: finalAddress,
      addressLine1: manualDraft?.addressLine1,
      addressLine2: manualDraft?.addressLine2,
      city: manualDraft?.city,
      postcode: manualDraft?.postcode,
      selectedSuggestion,
    })
  }

  return (
    <div className="flex w-full flex-col gap-32">
      <header className="flex w-full flex-col gap-20">
        <h1 className="text-heading-4 font-semibold leading-39.7 text-text-primary">
          Make it Yours
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          We&apos;ll use this to set up your workspace.
        </p>
      </header>

      {mode === 'search' ? (
        <form
          onSubmit={searchForm.handleSubmit(handleSearchSubmit)}
          className="flex flex-col gap-24"
        >
          <div className="flex flex-col gap-12">
            <Controller
              control={searchForm.control}
              name="countryId"
              render={({ field }) => (
                <InputSelection
                  label="Business Country of Residence"
                  placeholder="Select a Country"
                  size="md"
                  options={countryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  errorText={
                    searchForm.formState.errors.countryId?.message ??
                    (isError ? 'Failed to load countries. Please try again.' : undefined)
                  }
                />
              )}
            />
            <TextInput
              label="Business Registered Address"
              size="md"
              autoComplete="street-address"
              placeholder="Enter address"
              errorText={searchForm.formState.errors.address?.message}
              {...searchForm.register('address')}
            />
            <TextButton
              type="button"
              size="md"
              bold
              className="mt-[2px] justify-start text-text-primary hover:text-text-primary"
              iconLeft={<LocationPinIcon />}
              onClick={() => {
                setAddressNotFound(false)
                manualForm.reset({
                  countryId: searchForm.getValues('countryId'),
                  addressLine1: searchForm.getValues('address'),
                  addressLine2: '',
                  city: '',
                  postcode: '',
                })
                setMode('manual')
              }}
            >
              Enter address manually
            </TextButton>
          </div>

          <div className="flex flex-col gap-8">
            <FlowButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={isLoading || isError || verifying}
              iconSuffix={<ArrowRightIcon />}
            >
              {verifying ? 'Checking address...' : 'Continue'}
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
      ) : null}

      {mode === 'manual' ? (
        <form
          onSubmit={manualForm.handleSubmit(handleManualSubmit)}
          className="flex flex-col gap-24"
        >
          {addressNotFound ? (
            <BannerSmall state="error" showCloseButton={false} outline={false} className="w-full">
              Address couldn&apos;t be found.
            </BannerSmall>
          ) : null}

          <div className="flex flex-col gap-12">
            <Controller
              control={manualForm.control}
              name="countryId"
              render={({ field }) => (
                <InputSelection
                  label="Business Country of Residence"
                  placeholder="Select a Country"
                  size="md"
                  options={countryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  errorText={manualForm.formState.errors.countryId?.message}
                />
              )}
            />
            <TextInput
              label="Address Line 1"
              size="md"
              autoComplete="address-line1"
              errorText={manualForm.formState.errors.addressLine1?.message}
              {...manualForm.register('addressLine1')}
            />
            <TextInput
              label="Address Line 2"
              size="md"
              autoComplete="address-line2"
              {...manualForm.register('addressLine2')}
            />
            <TextInput
              label="Town / City"
              size="md"
              autoComplete="address-level2"
              errorText={manualForm.formState.errors.city?.message}
              {...manualForm.register('city')}
            />
            <TextInput
              label="Zip / Post Code"
              size="md"
              autoComplete="postal-code"
              errorText={manualForm.formState.errors.postcode?.message}
              {...manualForm.register('postcode')}
            />
            <TextButton
              type="button"
              size="md"
              bold
              className="mt-[2px] justify-start text-text-primary hover:text-text-primary"
              onClick={() => {
                setAddressNotFound(false)
                searchForm.reset({
                  countryId: manualForm.getValues('countryId'),
                  address: formatManualAddress(manualForm.getValues()),
                })
                setMode('search')
              }}
            >
              Search for address instead
            </TextButton>
          </div>

          <div className="flex flex-col gap-8">
            <FlowButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              iconSuffix={<ArrowRightIcon />}
            >
              Verify address
            </FlowButton>
            <FlowButton
              type="button"
              variant="tertiary"
              size="md"
              className="w-full"
              onClick={() => {
                setAddressNotFound(false)
                setMode('search')
              }}
            >
              Back
            </FlowButton>
          </div>
        </form>
      ) : null}

      {mode === 'suggestions' ? (
        <div className="flex flex-col gap-24">
          <div role="radiogroup" aria-label="Address suggestion" className="flex flex-col gap-4">
            <p className="pl-3 text-body-xs font-medium-550 text-text-secondary">
              Address suggestion
            </p>
            <ListItemLocation
              title="As entered"
              address={enteredAddress}
              showCheckMark={false}
              state={selectedSuggestion === 'entered' ? 'selected' : 'rest'}
              onClick={() => setSelectedSuggestion('entered')}
            />
            {/* Only offered when the verifier actually returned a correction. */}
            {suggestedAddress ? (
              <ListItemLocation
                title="Suggested address"
                address={suggestedAddress}
                showCheckMark
                state={selectedSuggestion === 'suggested' ? 'selected' : 'rest'}
                onClick={() => setSelectedSuggestion('suggested')}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-8">
            <FlowButton
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              loading={submitting}
              iconSuffix={<ArrowRightIcon />}
              onClick={() => void handleSuggestionsContinue()}
            >
              Continue
            </FlowButton>
            <FlowButton
              type="button"
              variant="tertiary"
              size="md"
              className="w-full"
              onClick={() => setMode('search')}
            >
              Back
            </FlowButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { StepWorkspace }
export type { SearchValues, ManualValues }
