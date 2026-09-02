'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { ArrowRightIcon, EyeIcon, EyeOffIcon } from '@/components/auth/icons'
import { BannerSmall, FlowButton, IconButton, TextButton, TextInput } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { getVerificationSessionId, setVerificationSession } from '@/lib/auth-session'
import { useSignup, useUpdateSignupEmail } from '@/lib/mutations'

import type { AuthSignupData } from '@/lib/types'

const PASSWORD_HINT = 'Password must be at least 8 characters and include both letters and numbers.'

const passwordRule = z
  .string()
  .min(1, PASSWORD_HINT)
  .refine((value) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: PASSWORD_HINT,
  })

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter a valid email address.')
    .email('Please enter a valid email address.'),
  password: passwordRule,
})

type SignupFormValues = z.infer<typeof signupSchema>

interface StepCredentialsProps {
  defaultEmail?: string
  onContinue: (result: AuthSignupData, values: SignupFormValues) => void
}

function StepCredentials({ defaultEmail = '', onContinue }: StepCredentialsProps) {
  const signup = useSignup()
  const updateSignupEmail = useUpdateSignupEmail()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [fallbackError, setFallbackError] = useState<string>()

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: defaultEmail, password: '' },
  })

  const passwordValue = useWatch({ control, name: 'password' })
  const passwordLooksValid =
    passwordValue.length >= 8 && /[A-Za-z]/.test(passwordValue) && /\d/.test(passwordValue)
  const showPasswordHint =
    !errors.password && (passwordFocused || passwordValue.length > 0) && !passwordLooksValid
  const showPasswordSuccess = !errors.password && passwordLooksValid

  const { onBlur: onPasswordBlur, ...passwordField } = register('password')
  const pending = signup.isPending || updateSignupEmail.isPending

  async function onFormSubmit(values: SignupFormValues) {
    setFallbackError(undefined)
    try {
      const existingSession = getVerificationSessionId()
      const result = existingSession
        ? await updateSignupEmail.mutateAsync({
            email: values.email,
            verification_session_id: existingSession,
          })
        : await signup.mutateAsync({
            email: values.email,
            password: values.password,
          })

      setVerificationSession(result)
      onContinue(result, values)
    } catch (err) {
      setFallbackError(
        applyApiError(err, setError, { CONFLICT: 'email', VALIDATION_ERROR: 'email' }),
      )
    }
  }

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Welcome to Open HR
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          Create jobs, track applications, and manage your team for FREE.
        </p>
      </header>

      {fallbackError ? (
        <BannerSmall
          state="error"
          outline={false}
          showCloseButton
          onClose={() => setFallbackError(undefined)}
        >
          {fallbackError}
        </BannerSmall>
      ) : null}

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex w-full flex-col gap-[24px]">
        <div className="flex flex-col gap-[12px]">
          <TextInput
            label="Email address"
            type="email"
            size="md"
            autoComplete="email"
            errorText={errors.email?.message}
            {...register('email')}
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

        <div className="flex flex-col gap-[24px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            loading={pending}
            iconSuffix={<ArrowRightIcon />}
          >
            Continue
          </FlowButton>

          <p className="flex flex-wrap items-center justify-center gap-[2px] text-body-s font-medium leading-19_5 text-text-secondary">
            <span>Already have an account?</span>
            <TextButton
              href="/login"
              size="md"
              bold
              className="text-text-primary hover:text-text-primary"
            >
              Login →
            </TextButton>
          </p>
        </div>
      </form>
    </div>
  )
}

function CredentialsFooter() {
  return (
    <div className="flex flex-col gap-[10px] text-body-xs leading-19_2 text-text-secondary">
      <p className="flex flex-wrap items-center gap-[2px]">
        <span>By signing up, you agree to our</span>
        <Link href="/privacy-policy" className="text-text-primary hover:underline">
          privacy policy.
        </Link>
      </p>
      <p className="flex flex-wrap items-center gap-[2px]">
        <span>and</span>
        <Link href="/terms" className="text-text-primary hover:underline">
          data processing agreement.
        </Link>
      </p>
    </div>
  )
}

export { StepCredentials, CredentialsFooter }
export type { SignupFormValues }
