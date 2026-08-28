'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon, EyeIcon, EyeOffIcon } from '@/components/auth/icons'
import { BannerSmall, FlowButton, IconButton, TextInput } from '@/components/ui'

const PASSWORD_HINT = 'Password must be at least 8 characters and include both letters and numbers.'

const inviteJoinSchema = z.object({
  firstName: z.string().trim().min(1, 'Please enter your first name.'),
  lastName: z.string().trim().min(1, 'Please enter your last name.'),
  password: z
    .string()
    .min(1, PASSWORD_HINT)
    .refine((value) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value), {
      message: PASSWORD_HINT,
    }),
})

type InviteJoinValues = z.infer<typeof inviteJoinSchema>

interface StepInviteJoinProps {
  submitting?: boolean
  /** Server-side failure, shown above the button. */
  formError?: string
  onContinue: (values: InviteJoinValues) => void
  onBack: () => void
}

function StepInviteJoin({
  submitting = false,
  formError,
  onContinue,
  onBack,
}: StepInviteJoinProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteJoinValues>({
    resolver: zodResolver(inviteJoinSchema),
    defaultValues: { firstName: '', lastName: '', password: '' },
  })

  const passwordValue = useWatch({ control, name: 'password' })
  const passwordLooksValid =
    passwordValue.length >= 8 && /[A-Za-z]/.test(passwordValue) && /\d/.test(passwordValue)
  const showPasswordHint =
    !errors.password && (passwordFocused || passwordValue.length > 0) && !passwordLooksValid
  const showPasswordSuccess = !errors.password && passwordLooksValid

  const { onBlur: onPasswordBlur, ...passwordField } = register('password')

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          One Last step
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          This helps us set up your account correctly
        </p>
      </header>

      <form onSubmit={handleSubmit(onContinue)} className="flex w-full flex-col gap-[24px]">
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
          <TextInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            size="md"
            autoComplete="new-password"
            errorText={errors.password?.message}
            helperText={showPasswordSuccess || showPasswordHint ? PASSWORD_HINT : undefined}
            helperState="neutral"
            showHelper={showPasswordHint || showPasswordSuccess || !!errors.password}
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
            {...passwordField}
            onFocus={() => setPasswordFocused(true)}
            onBlur={(event) => {
              setPasswordFocused(false)
              onPasswordBlur(event)
            }}
          />
        </div>

        {formError ? (
          <BannerSmall state="error" outline={false} showCloseButton={false}>
            {formError}
          </BannerSmall>
        ) : null}

        <div className="flex flex-col gap-[8px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            iconSuffix={<ArrowRightIcon />}
          >
            {submitting ? 'Joining...' : 'Join workspace'}
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

export { StepInviteJoin }
export type { InviteJoinValues }
