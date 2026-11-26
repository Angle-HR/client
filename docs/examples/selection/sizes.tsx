'use client'

import { InputSelection } from '@/components/ui/input-selection'

const OPTIONS = [
  { value: 'full', label: 'Full time' },
  { value: 'part', label: 'Part time' },
]

export default function SelectionSizes() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <InputSelection label="Medium (32px)" size="md" placeholder="Choose" options={OPTIONS} />
      <InputSelection label="Small (25px)" size="sm" placeholder="Choose" options={OPTIONS} />
      <InputSelection
        label="With an error"
        placeholder="Choose"
        options={OPTIONS}
        errorText="Pick a contract type"
      />
      <InputSelection label="Disabled" placeholder="Choose" options={OPTIONS} disabled />
    </div>
  )
}
