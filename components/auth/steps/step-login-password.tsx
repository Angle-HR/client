'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon, EyeIcon, EyeOffIcon, MailIcon } from '@/components/auth/icons'
import { FlowButton, IconButton, TextButton, TextInput } from '@/components/ui'

const passwordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter a valid email address.')
    .email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type LoginPasswordValues = z.infer<typeof passwordSchema>

interface StepLoginPasswordProps {
  defaultEmail?: string
  onSignIn: (values: LoginPasswordValues) => void | Promise<void>
  onEmailCode: () => void
  onBack: () => void
  /** Server/mock form-level error (e.g. incorrect password). */
  formError?: string
  submitting?: boolean
}

function StepLoginPassword({
  defaultEmail = '',
  onSignIn,
  onEmailCode,
  onBack,
  formError,
  submitting = false,
}: StepLoginPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: defaultEmail, password: '' },
  })

  const passwordError = errors.password?.message || formError
  const pending = submitting || isSubmitting

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

      <div className="flex w-full flex-col gap-[32px]">
        <FlowButton
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          iconPrefix={
            <span className="inline-flex h-[14px] w-[14px]">
              <MailIcon />
            </span>
          }
          onClick={onEmailCode}
        >
          Email sign-in code
        </FlowButton>

        <div className="h-px w-full bg-border-light" aria-hidden="true" />

        <form onSubmit={handleSubmit(onSignIn)} className="flex w-full flex-col gap-[24px]">
          <div className="flex flex-col gap-[12px]">
            <TextInput
              label="Email address"
              type="email"
              size="md"
              autoComplete="email"
              errorText={errors.email?.message}
              {...register('email')}
            />
            <div className="flex flex-col gap-[8px]">
              <TextInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                size="md"
                autoComplete="current-password"
                errorText={passwordError}
                suffix="button"
                suffixButton={
                  <IconButton
                    type="button"
                    variant="tertiary"
                    size="sm"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                }
                {...register('password')}
              />
              <div className="flex justify-end">
                <TextButton href="/forgot-password" size="sm" className="text-text-secondary">
                  Forgot Password?
                </TextButton>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <FlowButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={pending}
              iconSuffix={<ArrowRightIcon />}
            >
              Sign in
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
    </div>
  )
}

export { StepLoginPassword }
export type { LoginPasswordValues }
