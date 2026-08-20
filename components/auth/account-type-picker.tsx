'use client'

import { BusinessIcon, IndividualIcon } from '@/components/auth/account-type-icons'
import { ListItemPicker } from '@/components/ui'

import type { AccountType } from '@/components/auth/onboarding-options'

interface AccountTypePickerProps {
  value?: AccountType
  onChange: (type: AccountType) => void
}

function AccountTypePicker({ value, onChange }: AccountTypePickerProps) {
  return (
    <div role="radiogroup" aria-label="Account type" className="flex gap-[12px]">
      <ListItemPicker
        layout="vertical"
        title="Individual"
        subText="Using Open HR for yourself only"
        selected={value === 'individual'}
        icon={<IndividualIcon />}
        aria-label="Individual"
        onClick={() => onChange('individual')}
      />
      <ListItemPicker
        layout="vertical"
        title="Business/Team"
        subText="Managing employees/ hiring for a company"
        selected={value === 'business'}
        icon={<BusinessIcon />}
        aria-label="Business or Team"
        onClick={() => onChange('business')}
      />
    </div>
  )
}

export { AccountTypePicker }
