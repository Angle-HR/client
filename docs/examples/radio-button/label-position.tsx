'use client'

import { useState } from 'react'

import { RadioButton } from '@/components/ui/selection-controls'

export default function RadioButtonLabelPosition() {
  const [value, setValue] = useState('right')
  return (
    <div
      role="radiogroup"
      aria-label="Label position"
      className="flex flex-wrap items-center gap-12"
    >
      <RadioButton
        name="radio-label"
        label="Label right"
        checked={value === 'right'}
        onChange={() => setValue('right')}
      />
      <RadioButton
        name="radio-label"
        label="Label left"
        textPosition="left"
        checked={value === 'left'}
        onChange={() => setValue('left')}
      />
      <RadioButton
        name="radio-label"
        textPosition="none"
        aria-label="No label"
        checked={value === 'none'}
        onChange={() => setValue('none')}
      />
    </div>
  )
}
