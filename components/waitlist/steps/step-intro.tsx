'use client'

import { type FormEvent } from 'react'

import { CountryFlag, FlowButton, InputSelection, TextInput } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

interface StepIntroProps {
  onSubmit?: () => void
}

// Region options from the design's dropdown, each with its CountryFlag.
const regionOptions = [
  { value: 'united-kingdom', label: 'United Kingdom', country: 'United Kingdom' as const },
  { value: 'european-union', label: 'European Union', country: 'EU' as const },
  { value: 'united-states', label: 'United States', country: 'United States' as const },
  { value: 'nigeria', label: 'Nigeria', country: 'Nigeria' as const },
  { value: 'kenya', label: 'Kenya', country: 'Kenya' as const },
  { value: 'south-africa', label: 'South Africa', country: 'South Africa' as const },
  { value: 'other-africa', label: 'Other places in Africa', country: 'Africa' as const },
].map((o) => ({
  value: o.value,
  label: o.label,
  icon: <CountryFlag country={o.country} width={24} height={16} />,
}))

function StepIntro({ onSubmit }: StepIntroProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit?.()
  }

  return (
    <div className="mx-auto flex w-full max-w-[448px] flex-col gap-32 md:gap-44">
      {/* Hero — left-aligned on mobile, centred on desktop (Frame 1, gap 28) */}
      <header className="flex flex-col gap-28 md:items-center md:text-center">
        <div className="flex flex-col gap-20 md:items-center">
          <span className="text-body-s font-semibold tracking-[3px] leading-21 text-text-primary">
            INTRODUCING OPEN HR
          </span>
          <h1 className="text-heading-4 font-semibold leading-39.7 text-text-primary md:text-heading-2 md:leading-49.7">
            Built for Startups &amp; Small Businesses
          </h1>
        </div>
        <p className="text-body-l font-medium leading-21 text-text-secondary md:text-body-xl md:leading-24">
          Open HR lets you create jobs, track applications, and manage your team. Built so any
          founder or small team can start hiring in minutes, with zero delay.
        </p>
      </header>

      {/* Form + actions — Frame 103 (gap 40) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-40">
        {/* Inputs — Frame 104 (gap 18) */}
        <div className="flex flex-col gap-18">
          {/* Name + email — Frame 1400001788 (gap 18) */}
          <div className="flex flex-col gap-18">
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
            options={regionOptions}
          />
        </div>

        {/* Button + consent — Frame 1400001799 (gap 10) */}
        <div className="flex flex-col gap-10">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            iconSuffix={<ArrowRightIcon />}
          >
            Join the waitlist
          </FlowButton>
          <p className="text-center text-body-xs leading-19.2 text-text-secondary">
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
