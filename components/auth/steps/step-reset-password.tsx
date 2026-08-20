'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon, EyeIcon, EyeOffIcon } from '@/components/auth/icons'
import { FlowButton, IconButton, TextInput } from '@/components/ui'

const PASSWORD_HINT = 'Password must be at least 8 characters and include both letters and numbers.'

const passwordRule = z
  .string()
  .min(1, PASSWORD_HINT)
  .refine((value) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: PASSWORD_HINT,
  })

const resetSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetSchema>

interface StepResetPasswordProps {
  onContinue: (values: ResetPasswordValues) => void
  onBack: () => void
}

function StepResetPassword({ onContinue, onBack }: StepResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Reset your password
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          Choose a new password for your account
        </p>
      </header>

      <form onSubmit={handleSubmit(onContinue)} className="flex w-full flex-col gap-[24px]">
        <div className="flex flex-col gap-[12px]">
          <TextInput
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            size="md"
            autoComplete="new-password"
            errorText={errors.password?.message}
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
          <TextInput
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            size="md"
            autoComplete="new-password"
            errorText={errors.confirmPassword?.message}
            suffix="button"
            suffixButton={
              <IconButton
                type="button"
                variant="tertiary"
                size="sm"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                icon={showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                onClick={() => setShowConfirm((prev) => !prev)}
              />
            }
            {...register('confirmPassword')}
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
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
            Back to sign in
          </FlowButton>
        </div>
      </form>
    </div>
  )
}

export { StepResetPassword }
export type { ResetPasswordValues }
