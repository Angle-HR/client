'use client'

import { useState } from 'react'

import { RadioButton } from '@/components/ui/selection-controls'

const options = ['Remote', 'Hybrid', 'On-site'] as const

export default function RadioButtonOverview() {
  const [value, setValue] = useState<string>('Hybrid')
  return (
    <div role="radiogroup" aria-label="Work location" className="flex flex-col gap-4">
      {options.map((option) => (
        <RadioButton
          key={option}
          name="radio-overview"
          label={option}
          checked={value === option}
          onChange={() => setValue(option)}
        />
      ))}
    </div>
  )
}
