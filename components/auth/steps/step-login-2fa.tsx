'use client'

import { useState } from 'react'

import { ArrowRightIcon, CheckCircleFillIcon } from '@/components/auth/icons'
import { FlowButton, OTPInput, TextButton, type OTPInputState } from '@/components/ui'

const OTP_LENGTH = 6

interface StepLogin2faProps {
  /** Submit a code. Resolves to a message to show, or undefined when accepted. */
  onVerify: (code: string) => Promise<string | undefined>
  onBack: () => void
}

function StepLogin2fa({ onVerify, onBack }: StepLogin2faProps) {
  const [code, setCode] = useState('')
  const [otpState, setOtpState] = useState<OTPInputState>('rest')
  const [errorText, setErrorText] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [success, setSuccess] = useState(false)

  async function verify(value: string) {
    if (verifying) return
    if (value.length !== OTP_LENGTH) {
      setOtpState('error')
      setErrorText('Please enter the full authentication code.')
      return
    }

    setVerifying(true)
    setErrorText(undefined)
    const message = await onVerify(value)

    if (message) {
      setVerifying(false)
      setSuccess(false)
      setOtpState('error')
      setErrorText(message)
      return
    }

    // Left in the verifying state on success: the parent is navigating away.
    setOtpState('success')
    setSuccess(true)
  }

  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Two-factor authentication
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          Open your two-factor authenticator (TOTP) app to view your authentication code.
        </p>
      </header>

      <form
        className="flex w-full flex-col gap-[24px]"
        onSubmit={(event) => {
          event.preventDefault()
          void verify(code)
        }}
      >
        <div className="flex items-start gap-[8px]">
          <div className="min-w-0 flex-1">
            <OTPInput
              length={OTP_LENGTH}
              label="Authentication code"
              value={code}
              state={otpState}
              errorText={errorText}
              autoSubmit={false}
              onChange={(next) => {
                setCode(next)
                setSuccess(false)
                setVerifying(false)
                if (otpState !== 'rest' || errorText) {
                  setOtpState('rest')
                  setErrorText(undefined)
                }
              }}
            />
          </div>
          {success ? (
            <span className="mt-[28px] inline-flex h-[16px] w-[16px] shrink-0 text-green-7">
              <CheckCircleFillIcon />
            </span>
          ) : null}
        </div>

        <p className="flex flex-wrap items-center gap-[2px] text-body-s font-medium leading-19_5 text-text-secondary">
          <span>No access to one of these?</span>
          <TextButton
            href="/login/help"
            size="md"
            bold
            className="text-text-primary hover:text-text-primary"
          >
            Get help →
          </TextButton>
        </p>

        <div className="flex flex-col gap-[8px]">
          <FlowButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            loading={verifying}
            iconSuffix={verifying ? undefined : <ArrowRightIcon />}
          >
            {verifying ? 'Verifying' : 'Verify'}
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

export { StepLogin2fa }
