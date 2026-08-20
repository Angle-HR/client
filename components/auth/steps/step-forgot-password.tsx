'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon } from '@/components/auth/icons'
import { FlowButton, TextInput } from '@/components/ui'

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter a valid email address.')
    .email('Please enter a valid email address.'),
})

type ForgotPasswordValues = z.infer<typeof forgotSchema>

interface StepForgotPasswordProps {
  defaultEmail?: string
  onContinue: (values: ForgotPasswordValues) => void
  onBack: () => void
}

function StepForgotPassword({ defaultEmail = '', onContinue, onBack }: StepForgotPasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: defaultEmail },
  })

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Reset your password
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          Enter your account email address to receive instructions
        </p>
      </header>

      <form onSubmit={handleSubmit(onContinue)} className="flex w-full flex-col gap-[24px]">
        <TextInput
          label="Email address"
          type="email"
          size="md"
          autoComplete="email"
          errorText={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-[8px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            iconSuffix={<ArrowRightIcon />}
          >
            Send reset link
          </FlowButton>
          <FlowButton
            type="button"
            variant="tertiary"
            size="md"
            className="w-full"
            onClick={onBack}
          >
            Back to sign in
          </FlowButton>
        </div>
      </form>
    </div>
  )
}

export { StepForgotPassword }
export type { ForgotPasswordValues }
