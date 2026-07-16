'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { getCountries, joinWaitlist } from '@/api/waitlist'
import {
  CountryFlag,
  FlowButton,
  InputSelection,
  TextInput,
  type CountryFlagProps,
  type SelectOption,
} from '@/components/ui'

import { ArrowRightIcon } from '../icons'

import type { WaitlistResponse } from '@/api/waitlist'

interface StepIntroProps {
  onSubmit?: (result: WaitlistResponse) => void
}

type FlagCountry = CountryFlagProps['country']

// API `icon_key` → the CountryFlag component's country name.
const iconKeyToFlagCountry: Record<string, FlagCountry> = {
  'flag-uk': 'United Kingdom',
  'flag-eu': 'EU',
  'flag-us': 'United States',
  'flag-ng': 'Nigeria',
  'flag-ke': 'Kenya',
  'flag-za': 'South Africa',
}

function StepIntro({ onSubmit }: StepIntroProps) {
  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [countriesError, setCountriesError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  useEffect(() => {
    let cancelled = false

    getCountries()
      .then((countries) => {
        if (cancelled) return
        setRegionOptions(
          countries.map((country) => ({
            value: country.id,
            label: country.name,
            icon: (
              <CountryFlag
                country={iconKeyToFlagCountry[country.icon_key] ?? 'Africa'}
                width={24}
                height={16}
              />
            ),
          })),
        )
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load countries', err)
        setCountriesError(true)
      })
      .finally(() => {
        if (!cancelled) setCountriesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const countryId = String(formData.get('countryId') ?? '')

    if (!fullName || !email || !countryId) {
      setSubmitError('Please fill in your name, email, and region.')
      return
    }

    setSubmitError(undefined)
    setSubmitting(true)

    try {
      const result = await joinWaitlist({ full_name: fullName, email, country_id: countryId })
      onSubmit?.(result)
    } catch (err) {
      console.error('Failed to join waitlist', err)
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[448px] flex-col gap-[32px] md:gap-[44px]">
      {/* Hero — left-aligned on mobile, centred on desktop (Frame 1, gap 28) */}
      <header className="flex flex-col gap-[28px] md:items-center md:text-center">
        <div className="flex flex-col gap-[20px] md:items-center">
          <span className="text-body-s font-semibold leading-21 text-text-primary">
            INTRODUCING OPEN HR
          </span>
          <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary md:text-heading-2 md:leading-49_7">
            Built for Startups &amp; Small Businesses
          </h1>
        </div>
        <p className="text-body-l font-medium leading-21 text-text-secondary md:text-body-xl md:leading-24">
          Open HR lets you create jobs, track applications, and manage your team. Built so any
          founder or small team can start hiring in minutes, with zero delay.
        </p>
      </header>

      {/* Form + actions — Frame 103 (gap 40) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[40px]">
        {/* Inputs — Frame 104 (gap 18) */}
        <div className="flex flex-col gap-[18px]">
          {/* Name + email — Frame 1400001788 (gap 18) */}
          <div className="flex flex-col gap-[18px]">
            <TextInput
              label="Full name"
              placeholder="Title"
              size="md"
              name="fullName"
              autoComplete="name"
            />
            <TextInput
              label="Email address"
              placeholder="Title"
              type="email"
              size="md"
              name="email"
              autoComplete="email"
            />
          </div>
          {/* Region — Frame 1400001789 */}
          <InputSelection
            label="Region/Country"
            placeholder="Search for an option..."
            size="md"
            name="countryId"
            options={regionOptions}
            disabled={countriesLoading}
            errorText={countriesError ? 'Failed to load countries. Please try again.' : undefined}
          />
        </div>

        {/* Button + consent — Frame 1400001799 (gap 10) */}
        <div className="flex flex-col gap-[10px]">
          {submitError && (
            <span className="text-body-xs text-text-error" role="alert">
              {submitError}
            </span>
          )}
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={countriesLoading || countriesError || submitting}
            iconSuffix={<ArrowRightIcon />}
          >
            {submitting ? 'Joining...' : 'Join the waitlist'}
          </FlowButton>
          <p className="text-center text-body-xs leading-19_2 text-text-secondary">
            By continuing, you agree to our{' '}
            <a href="#" className="underline underline-offset-2">
              Terms &amp; Conditions
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

export { StepIntro }
