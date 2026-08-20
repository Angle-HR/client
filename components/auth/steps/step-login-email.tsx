'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon } from '@/components/auth/icons'
import { FlowButton, TextButton, TextInput } from '@/components/ui'

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter a valid email address.')
    .email('Please enter a valid email address.'),
})

type LoginEmailValues = z.infer<typeof emailSchema>

interface StepLoginEmailProps {
  defaultEmail?: string
  onContinue: (values: LoginEmailValues) => void
}

function StepLoginEmail({ defaultEmail = '', onContinue }: StepLoginEmailProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginEmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
  })

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Welcome to Open HR
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          Open-Source HR solution for Startups and Small Businesses
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

        <div className="flex flex-col gap-[24px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            iconSuffix={<ArrowRightIcon />}
          >
            Sign in
          </FlowButton>

          <p className="flex flex-wrap items-center justify-center gap-[2px] text-body-s font-medium leading-19_5 text-text-secondary">
            <span>Don&apos;t have an account?</span>
            <TextButton
              href="/signup"
              size="md"
              bold
              className="text-text-primary hover:text-text-primary"
            >
              Signup →
            </TextButton>
          </p>
        </div>
      </form>
    </div>
  )
}

export { StepLoginEmail }
export type { LoginEmailValues }
