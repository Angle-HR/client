'use client'

import { InputSelection } from '@/components/ui/input-selection'

const OPTIONS = [
  { value: 'full', label: 'Full time' },
  { value: 'part', label: 'Part time' },
]

export default function SelectionLabels() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <InputSelection label="Contract type" placeholder="Choose" options={OPTIONS} required />
      <InputSelection label="Team" placeholder="Choose" options={OPTIONS} helperText="Optional" />
    </div>
  )
}
