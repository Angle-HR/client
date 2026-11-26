'use client'

import { InputSelection } from '@/components/ui/input-selection'

const CITIES = [
  { value: 'lagos', label: 'Lagos' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'johannesburg', label: 'Johannesburg' },
  { value: 'london', label: 'London' },
]

export default function SelectionOverview() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <InputSelection
        label="Office"
        placeholder="Choose an office"
        options={CITIES}
        helperText="Where they'll be based"
      />
    </div>
  )
}
