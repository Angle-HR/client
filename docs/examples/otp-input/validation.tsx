'use client'

import { useState } from 'react'

import { OTPInput, type OTPInputState } from '@/components/ui/otp-input'

// Try 123456 for the right code; any other six digits are wrong.
export default function OTPInputValidation() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<OTPInputState>('rest')

  return (
    <OTPInput
      label="Verification Code"
      value={code}
      state={state}
      helperText={state === 'success' ? 'Code accepted' : 'Try 123456'}
      errorText={state === 'error' ? "That code didn't work. Check it and try again." : undefined}
      onChange={(next) => {
        setCode(next)
        if (state !== 'rest') setState('rest')
      }}
      onComplete={(full) => setState(full === '123456' ? 'success' : 'error')}
    />
  )
}
