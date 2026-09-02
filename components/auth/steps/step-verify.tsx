'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { ArrowRightIcon, PencilIcon } from '@/components/auth/icons'
import {
  BannerSmall,
  FlowButton,
  IconButton,
  OTPInput,
  TextButton,
  type OTPInputState,
} from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import {
  clearVerificationSession,
  getCodeExpiresAt,
  getResendAvailableAt,
  getVerificationSessionId,
  setAuthTokens,
  setVerificationSession,
} from '@/lib/auth-session'
import { useResendVerification, useVerifyEmail } from '@/lib/mutations'

import type { AuthTokenData } from '@/lib/types'

const OTP_LENGTH = 6
const DEFAULT_TTL_SECONDS = 300

interface StepVerifyProps {
  email: string
  onEditEmail: () => void
  onVerified: (tokens: AuthTokenData) => void
}

function secondsUntil(timestamp: number | null, fallbackSeconds: number) {
  if (!timestamp) return fallbackSeconds
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000))
}

function StepVerify({ email, onEditEmail, onVerified }: StepVerifyProps) {
  const verifyEmail = useVerifyEmail()
  const resendVerification = useResendVerification()

  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(() =>
    secondsUntil(getCodeExpiresAt(), DEFAULT_TTL_SECONDS),
  )
  const [resendCooldown, setResendCooldown] = useState(() =>
    secondsUntil(getResendAvailableAt(), 0),
  )
  const [otpState, setOtpState] = useState<OTPInputState>('rest')
  const [errorText, setErrorText] = useState<string>()
  const [fallbackError, setFallbackError] = useState<string>()
  const [resendBanner, setResendBanner] = useState(false)

  const expired = secondsLeft <= 0
  const canResend = resendCooldown <= 0 && !resendVerification.isPending

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [secondsLeft])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = window.setTimeout(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [resendCooldown])

  const sessionId = useMemo(() => getVerificationSessionId(), [])

  function resetCode() {
    setCode('')
    setOtpState('rest')
    setErrorText(undefined)
  }

  async function handleResend() {
    if (!sessionId || !canResend) return
    setFallbackError(undefined)
    try {
      const result = await resendVerification.mutateAsync({
        verification_session_id: sessionId,
      })
      setVerificationSession(result)
      resetCode()
      setSecondsLeft(result.code_expires_in_seconds)
      setResendCooldown(result.resend_available_in_seconds)
      setResendBanner(true)
    } catch (err) {
      setFallbackError(applyApiError(err))
    }
  }

  async function verify(value: string) {
    setFallbackError(undefined)

    if (!sessionId) {
      setOtpState('error')
      setErrorText('Verification session expired. Please sign up again.')
      return
    }

    if (expired) {
      setOtpState('error')
      setErrorText('Verification timed out. Request a new code.')
      return
    }

    if (value.length !== OTP_LENGTH) {
      setErrorText('Please enter the full verification code.')
      setOtpState('error')
      return
    }

    try {
      const tokens = await verifyEmail.mutateAsync({
        code: value,
        verification_session_id: sessionId,
      })
      setAuthTokens(tokens)
      clearVerificationSession()
      setOtpState('success')
      setErrorText(undefined)
      onVerified(tokens)
    } catch (err) {
      setOtpState('error')
      setErrorText(
        applyApiError(err, undefined, {}, 'Invalid verification code. Please try again.'),
      )
    }
  }

  const helperText = expired
    ? 'Verification timed out. Request a new code.'
    : `Expires in ${secondsLeft} Secs`

  const helperState = expired ? 'info' : 'neutral'
  const resendLabel =
    expired || secondsLeft < DEFAULT_TTL_SECONDS * 0.6 ? 'Request a new code →' : 'Resend email →'

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="relative flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Verify your email
        </h1>
        <div className="text-body-l font-medium leading-21 text-text-secondary">
          <p>We sent a verification code to</p>
          <p className="inline-flex max-w-full items-center gap-[2px]">
            <span className="truncate">{email}</span>
            <IconButton
              type="button"
              variant="tertiary"
              size="sm"
              aria-label="Edit email"
              icon={<PencilIcon />}
              onClick={onEditEmail}
            />
          </p>
        </div>
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

      <form
        className="flex w-full flex-col gap-[24px]"
        onSubmit={(event) => {
          event.preventDefault()
          void verify(code)
        }}
      >
        <OTPInput
          length={OTP_LENGTH}
          label="Verification Code"
          value={code}
          state={otpState}
          helperText={errorText ? undefined : helperText}
          helperState={helperState}
          errorText={errorText}
          autoSubmit={false}
          onChange={(next) => {
            setCode(next)
            if (otpState !== 'rest' || errorText) {
              setOtpState('rest')
              setErrorText(undefined)
            }
          }}
        />

        <div className="flex flex-col gap-[24px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            loading={verifyEmail.isPending}
            iconSuffix={<ArrowRightIcon />}
          >
            Continue
          </FlowButton>

          <p className="flex flex-wrap items-center justify-center gap-[2px] text-body-s font-medium leading-19_5 text-text-secondary">
            <span>Didn&apos;t receive the code?</span>
            <TextButton
              type="button"
              size="md"
              bold
              className="text-text-primary hover:text-text-primary"
              disabled={!canResend}
              onClick={() => void handleResend()}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resendLabel}
            </TextButton>
          </p>
        </div>

        {resendBanner ? (
          <BannerSmall
            state="success"
            outline={false}
            showCloseButton
            onClose={() => setResendBanner(false)}
            className="w-fit max-w-full"
          >
            We&apos;ve sent a new verification code.
          </BannerSmall>
        ) : null}
      </form>
    </div>
  )
}

function VerifyFooter() {
  return (
    <p className="text-body-xs leading-19_2 text-text-secondary">
      By verifying your email you agree to receive communications from Open HR about our products
      and services. You can unsubscribe at any time using the link in our emails. Learn more about
      how we handle your data in our{' '}
      <Link href="/privacy-policy" className="text-text-primary hover:underline">
        privacy policy.
      </Link>
    </p>
  )
}

export { StepVerify, VerifyFooter }
