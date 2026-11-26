'use client'

import { OTPInput } from '@/components/ui/otp-input'

export default function OTPInputOverview() {
  return (
    <OTPInput
      label="Verification Code"
      helperText="Enter the 6-digit code we emailed you"
      name="code"
    />
  )
}
