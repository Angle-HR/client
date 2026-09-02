'use client'

import { useEffect, useState } from 'react'

import { ArrowRightIcon } from '@/components/auth/icons'
import { BannerSmall, FlowButton, OTPInput, TextButton, type OTPInputState } from '@/components/ui'

const OTP_LENGTH = 6

interface StepLoginVerifyProps {
  email: string
  /** Seconds left on the code that was just sent. */
  ttlSeconds: number
  /** Submit a code. Resolves to a message to show, or undefined when accepted. */
  onVerify: (code: string) => Promise<string | undefined>
  /** Ask for a fresh code. Resolves to the new code's lifetime in seconds. */
  onResend: () => Promise<number>
  onBack: () => void
}

function StepLoginVerify({ email, ttlSeconds, onVerify, onResend, onBack }: StepLoginVerifyProps) {
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(ttlSeconds)
  const [otpState, setOtpState] = useState<OTPInputState>('rest')
  const [errorText, setErrorText] = useState<string>()
  const [resendBanner, setResendBanner] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const expired = secondsLeft <= 0

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [secondsLeft])

  async function handleResend() {
    setCode('')
    setOtpState('rest')
    setErrorText(undefined)
    try {
      setSecondsLeft(await onResend())
      setResendBanner(true)
    } catch {
      setOtpState('error')
      setErrorText('Could not send a new code. Please try again.')
    }
  }

  async function verify(value: string) {
    if (submitting) return
    if (expired) {
      setOtpState('error')
      setErrorText('Verification timed out. Request a new code.')
      return
    }
    if (value.length !== OTP_LENGTH) {
      setOtpState('error')
      setErrorText('Please enter the full verification code.')
      return
    }

    setSubmitting(true)
    setErrorText(undefined)
    const message = await onVerify(value)
    setSubmitting(false)

    if (message) {
      setOtpState('error')
      setErrorText(message)
      return
    }
    setOtpState('success')
  }

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Check your email
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          We&apos;ve sent you a temporary login code. Please check your inbox at{' '}
          <span className="text-text-primary">{email}</span>
        </p>
      </header>

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
          helperText={
            errorText
              ? undefined
              : expired
                ? 'Verification timed out. Request a new code.'
                : `Expires in ${secondsLeft} Secs`
          }
          helperState={expired ? 'info' : 'neutral'}
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

        <p className="flex flex-wrap items-center gap-[2px] text-body-s font-medium leading-19_5 text-text-secondary">
          <span>Didn&apos;t receive the code?</span>
          <TextButton
            type="button"
            size="md"
            bold
            className="text-text-primary hover:text-text-primary"
            onClick={() => void handleResend()}
          >
            Request a new code →
          </TextButton>
        </p>

        <div className="flex flex-col gap-[8px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={submitting}
            iconSuffix={<ArrowRightIcon />}
          >
            {submitting ? 'Verifying...' : 'Continue with login code'}
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

export { StepLoginVerify }
