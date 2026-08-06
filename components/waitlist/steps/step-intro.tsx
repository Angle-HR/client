'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  BannerSmall,
  CountryFlag,
  FlowButton,
  InputSelection,
  TextInput,
  type SelectOption,
} from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { useJoinWaitlist } from '@/lib/mutations'
import { useCountries } from '@/lib/queries'

import { ArrowRightIcon } from '../icons'
import { CountrySelectSkeleton } from '../skeletons/country-select-skeleton'

import type { Country, WaitlistResponse } from '@/lib/types'

interface StepIntroProps {
  onSubmit?: (result: WaitlistResponse) => void
}

// The API's `icon_key` is `flag-<code>`, where `<code>` is an ISO 3166-1
// alpha-2 country code (`flag-ng`) or a region code (`flag-eu` — the European
// Union is the only region supported today). CountryFlag resolves both, so
// new countries need no change here. Falls back to the country `slug` for
// rows that arrive without an `icon_key`.
function flagCodeFor(country: Pick<Country, 'icon_key' | 'slug'>): string {
  return country.icon_key?.replace(/^flag-/, '') || country.slug
}

const waitlistSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.'),
  email: z.string().trim().min(1, 'Please enter your email.').email('Enter a valid email address.'),
  countryId: z.string().min(1, 'Please select your region.'),
})

type WaitlistFormValues = z.infer<typeof waitlistSchema>

function StepIntro({ onSubmit }: StepIntroProps) {
  const { data: countries, isLoading: countriesLoading, isError: countriesError } = useCountries()
  const joinWaitlist = useJoinWaitlist()
  const [fallbackError, setFallbackError] = useState<string>()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { fullName: '', email: '', countryId: '' },
  })

  const regionOptions: SelectOption[] = (countries ?? []).map((country) => ({
    value: country.id,
    label: country.name,
    icon: <CountryFlag code={flagCodeFor(country)} name={country.name} width={24} height={16} />,
  }))

  async function onFormSubmit(values: WaitlistFormValues) {
    setFallbackError(undefined)
    try {
      const result = await joinWaitlist.mutateAsync({
        full_name: values.fullName,
        email: values.email,
        country_id: values.countryId,
      })
      sessionStorage.setItem('waitlistToken', result.token)
      onSubmit?.(result)
    } catch (err) {
      setFallbackError(applyApiError(err, setError, { CONFLICT: 'email' }))
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
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-[40px]">
        {/* Inputs — Frame 104 (gap 18) */}
        <div className="flex flex-col gap-[18px]">
          {/* Name + email — Frame 1400001788 (gap 18) */}
          <div className="flex flex-col gap-[18px]">
            <TextInput
              label="Full name"
              placeholder="Title"
              size="md"
              autoComplete="name"
              errorText={errors.fullName?.message}
              {...register('fullName')}
            />
            <TextInput
              label="Email address"
              placeholder="Title"
              type="email"
              size="md"
              autoComplete="email"
              errorText={errors.email?.message}
              {...register('email')}
            />
          </div>
          {/* Region — Frame 1400001789 */}
          {countriesLoading ? (
            <CountrySelectSkeleton />
          ) : (
            <Controller
              control={control}
              name="countryId"
              render={({ field }) => (
                <InputSelection
                  label="Region/Country"
                  placeholder="Search for an option..."
                  size="md"
                  options={regionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  errorText={
                    errors.countryId?.message ??
                    (countriesError ? 'Failed to load countries. Please try again.' : undefined)
                  }
                />
              )}
            />
          )}
        </div>

        {/* Button + consent — Frame 1400001799 (gap 10) */}
        <div className="flex flex-col gap-[10px]">
          {fallbackError && (
            <BannerSmall state="error" showCloseButton={false}>
              {fallbackError}
            </BannerSmall>
          )}
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={countriesLoading || countriesError || joinWaitlist.isPending}
            iconSuffix={<ArrowRightIcon />}
          >
            {joinWaitlist.isPending ? 'Joining...' : 'Join the waitlist'}
          </FlowButton>
          <p className="text-center text-body-xs leading-19_2 text-text-secondary">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export { StepIntro }
