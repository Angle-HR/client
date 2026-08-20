'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon } from '@/components/auth/icons'
import { FlowButton, InputSelection, TextInput, type SelectOption } from '@/components/ui'
import { useBusinessTypes, useOnboardingIndustries } from '@/lib/queries'

const complianceSchema = z.object({
  businessDescriptor: z.string().min(1, 'Please select an option.'),
  industryId: z.string().min(1, 'Please select your industry.'),
  employeeCount: z.string().trim().min(1, 'Please enter how many employees will use Open HR.'),
})

type ComplianceValues = z.infer<typeof complianceSchema>

interface StepComplianceProps {
  onContinue: (values: ComplianceValues) => void | Promise<void>
  onBack: () => void
  submitting?: boolean
}

function StepCompliance({ onContinue, onBack, submitting = false }: StepComplianceProps) {
  const { data: businessTypes, isLoading: typesLoading, isError: typesError } = useBusinessTypes()
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
    resolver: zodResolver(complianceSchema),
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

  const isLoading = typesLoading || industriesLoading
  const isError = typesError || industriesError
  const pending = submitting || isSubmitting

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          One Last step
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          This is to ensure you&apos;re compliant
        </p>
      </header>

      <form onSubmit={handleSubmit(onContinue)} className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[12px]">
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
          <Controller
            control={control}
            name="industryId"
            render={({ field }) => (
              <InputSelection
                label="Select your industry"
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
          <TextInput
            label="How many of your employees will use Open HR?"
            size="md"
            errorText={errors.employeeCount?.message}
            {...register('employeeCount')}
          />
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
