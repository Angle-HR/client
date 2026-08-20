'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AccountTypePicker } from '@/components/auth/account-type-picker'
import { ArrowRightIcon } from '@/components/auth/icons'
import {
  CountryFlag,
  FlowButton,
  InputSelection,
  TextInput,
  type SelectOption,
} from '@/components/ui'
import { useCountries, useCompanyRoles } from '@/lib/queries'

import type { AccountType } from '@/components/auth/onboarding-options'
import type { Country } from '@/lib/types'

function flagCodeFor(country: Pick<Country, 'icon_key' | 'slug'>): string {
  return country.icon_key?.replace(/^flag-/, '') || country.slug
}

const individualSchema = z.object({
  firstName: z.string().trim().min(1, 'Please enter your first name.'),
  lastName: z.string().trim().min(1, 'Please enter your last name.'),
  countryId: z.string().min(1, 'Please select your country.'),
})

const businessSchema = z.object({
  businessName: z.string().trim().min(1, 'Please enter your legal business name.'),
  legalFullName: z.string().trim().min(1, 'Please enter your legal full name.'),
  roleId: z.string().min(1, 'Please select your role.'),
})

type IndividualValues = z.infer<typeof individualSchema>
type BusinessValues = z.infer<typeof businessSchema>

interface StepAccountTypeProps {
  accountType?: AccountType
  submitting?: boolean
  onAccountTypeChange: (type: AccountType) => void
  onIndividualContinue: (values: IndividualValues) => void | Promise<void>
  onBusinessContinue: (values: BusinessValues) => void | Promise<void>
}

function StepAccountType({
  accountType,
  submitting = false,
  onAccountTypeChange,
  onIndividualContinue,
  onBusinessContinue,
}: StepAccountTypeProps) {
  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          How will you use Open HR?
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          This helps us set up your account correctly for hiring and team management.
        </p>
      </header>

      <div className="flex flex-col gap-[24px] pt-[16px]">
        <AccountTypePicker value={accountType} onChange={onAccountTypeChange} />

        {accountType === 'individual' ? (
          <IndividualProfileForm submitting={submitting} onContinue={onIndividualContinue} />
        ) : null}
        {accountType === 'business' ? (
          <BusinessProfileForm submitting={submitting} onContinue={onBusinessContinue} />
        ) : null}
      </div>
    </div>
  )
}

function IndividualProfileForm({
  onContinue,
  submitting,
}: {
  onContinue: (values: IndividualValues) => void | Promise<void>
  submitting?: boolean
}) {
  const { data: countries, isLoading, isError } = useCountries()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IndividualValues>({
    resolver: zodResolver(individualSchema),
    defaultValues: { firstName: '', lastName: '', countryId: '' },
  })

  const countryOptions: SelectOption[] = (countries ?? []).map((country) => ({
    value: country.id,
    label: country.name,
    icon: <CountryFlag code={flagCodeFor(country)} name={country.name} width={24} height={16} />,
  }))

  const pending = submitting || isSubmitting

  return (
    <form onSubmit={handleSubmit(onContinue)} className="flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[12px]">
        <TextInput
          label="First Name"
          size="md"
          autoComplete="given-name"
          errorText={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextInput
          label="Last Name"
          size="md"
          autoComplete="family-name"
          errorText={errors.lastName?.message}
          {...register('lastName')}
        />
        <Controller
          control={control}
          name="countryId"
          render={({ field }) => (
            <InputSelection
              label="Country of Residence"
              placeholder="Search for an option..."
              size="md"
              options={countryOptions}
              value={field.value}
              onChange={field.onChange}
              errorText={
                errors.countryId?.message ??
                (isError ? 'Failed to load countries. Please try again.' : undefined)
              }
            />
          )}
        />
      </div>
      <FlowButton
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        loading={pending}
        disabled={isLoading || isError}
        iconSuffix={<ArrowRightIcon />}
      >
        Continue
      </FlowButton>
    </form>
  )
}

function BusinessProfileForm({
  onContinue,
  submitting,
}: {
  onContinue: (values: BusinessValues) => void | Promise<void>
  submitting?: boolean
}) {
  const { data: roles, isLoading, isError } = useCompanyRoles()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: { businessName: '', legalFullName: '', roleId: '' },
  })

  const roleOptions: SelectOption[] = (roles ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  }))

  const pending = submitting || isSubmitting

  return (
    <form onSubmit={handleSubmit(onContinue)} className="flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[12px]">
        <TextInput
          label="Legal Business Name"
          size="md"
          autoComplete="organization"
          errorText={errors.businessName?.message}
          {...register('businessName')}
        />
        <TextInput
          label="Legal Full Name"
          size="md"
          autoComplete="name"
          errorText={errors.legalFullName?.message}
          {...register('legalFullName')}
        />
        <Controller
          control={control}
          name="roleId"
          render={({ field }) => (
            <InputSelection
              label="Role at the company"
              placeholder="Select a Role"
              size="md"
              options={roleOptions}
              value={field.value}
              onChange={field.onChange}
              errorText={
                errors.roleId?.message ??
                (isError ? 'Failed to load roles. Please try again.' : undefined)
              }
            />
          )}
        />
      </div>
      <FlowButton
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        loading={pending}
        disabled={isLoading || isError}
        iconSuffix={<ArrowRightIcon />}
      >
        Continue
      </FlowButton>
    </form>
  )
}

export { StepAccountType }
export type { IndividualValues, BusinessValues }
