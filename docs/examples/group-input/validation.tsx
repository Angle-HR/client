'use client'

import { useState } from 'react'

import { GroupInput, GroupInputField, GroupInputLeftFlag } from '@/components/ui/group-input'

export default function GroupInputValidation() {
  const [value, setValue] = useState('80')
  const short = value.replace(/\D/g, '').length < 10
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-16">
      <GroupInput
        label="Phone number"
        required
        helperText="10 digits, without the leading 0"
        errorText={short ? 'Enter all 10 digits' : undefined}
      >
        <GroupInputLeftFlag countryCode="NG" countryName="Nigeria" />
        <GroupInputField type="tel" value={value} onChange={(e) => setValue(e.target.value)} />
      </GroupInput>
      <GroupInput label="Phone number" disabled helperText="Set by your admin">
        <GroupInputLeftFlag countryCode="NG" countryName="Nigeria" />
        <GroupInputField type="tel" defaultValue="801 234 5678" />
      </GroupInput>
    </div>
  )
}
