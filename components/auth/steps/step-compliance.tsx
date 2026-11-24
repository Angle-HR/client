'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon } from '@/components/auth/icons'
import { FlowButton, InputSelection, TextInput, type SelectOption } from '@/components/ui'
import { useBusinessTypes, useOnboardingIndustries } from '@/lib/queries'

const businessSchema = z.object({
  businessDescriptor: z.string().min(1, 'Please select an option.'),
  industryId: z.string().min(1, 'Please select your industry.'),
  employeeCount: z.string().trim().min(1, 'Please enter how many employees will use Open HR.'),
})

// An individual is asked one question: the field they mostly hire in. The business
// fields are not rendered and not validated; they stay empty.
const individualSchema = z.object({
  businessDescriptor: z.string(),
  industryId: z.string().min(1, 'Please select the field you mostly hire in.'),
  employeeCount: z.string(),
})

type ComplianceValues = z.infer<typeof businessSchema>

interface StepComplianceProps {
  /** Defaults to a business, which is asked all three questions. */
  accountType?: 'individual' | 'business'
  onContinue: (values: ComplianceValues) => void | Promise<void>
  onBack: () => void
  submitting?: boolean
}

function StepCompliance({
  accountType = 'business',
  onContinue,
  onBack,
  submitting = false,
}: StepComplianceProps) {
  const individual = accountType === 'individual'
  const {
    data: businessTypes,
    isLoading: typesLoading,
    isError: typesError,
  } = useBusinessTypes(!individual)
  const {
    data: industries,
    isLoading: industriesLoading,
    isError: industriesError,
  } = useOnboardingIndustries()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComplianceValues>({
    resolver: zodResolver(individual ? individualSchema : businessSchema),
    defaultValues: { businessDescriptor: '', industryId: '', employeeCount: '' },
  })

  const descriptorOptions: SelectOption[] = (businessTypes ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }))

  const industryOptions: SelectOption[] = (industries ?? []).map((industry) => ({
    value: industry.id,
    label: industry.name,
  }))

  const isLoading = (!individual && typesLoading) || industriesLoading
  const isError = (!individual && typesError) || industriesError
  const pending = submitting || isSubmitting

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          One Last step
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          {individual
            ? 'This helps us tailor Open HR to the hiring you do'
            : 'This is to ensure you&apos;re compliant'}
        </p>
      </header>

      <form onSubmit={handleSubmit(onContinue)} className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[12px]">
          {individual ? null : (
            <Controller
              control={control}
              name="businessDescriptor"
              render={({ field }) => (
                <InputSelection
                  label="What best describes your business?"
                  placeholder="Select an option..."
                  size="md"
                  options={descriptorOptions}
                  value={field.value}
                  onChange={field.onChange}
                  errorText={
                    errors.businessDescriptor?.message ??
                    (typesError ? 'Failed to load business types. Please try again.' : undefined)
                  }
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="industryId"
            render={({ field }) => (
              <InputSelection
                label={individual ? 'What field do you mostly hire in?' : 'Select your industry'}
                placeholder="Select an industry..."
                size="md"
                options={industryOptions}
                value={field.value}
                onChange={field.onChange}
                errorText={
                  errors.industryId?.message ??
                  (industriesError ? 'Failed to load industries. Please try again.' : undefined)
                }
              />
            )}
          />
          {individual ? null : (
            <TextInput
              label="How many of your employees will use Open HR?"
              size="md"
              errorText={errors.employeeCount?.message}
              {...register('employeeCount')}
            />
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
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
    </div>
  )
}

export { StepCompliance }
export type { ComplianceValues }
