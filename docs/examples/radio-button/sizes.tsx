'use client'

import { useState } from 'react'

import { RadioButton } from '@/components/ui/selection-controls'

export default function RadioButtonSizes() {
  const [size, setSize] = useState<'sm' | 'md'>('sm')
  return (
    <div role="radiogroup" aria-label="Size" className="flex flex-wrap items-center gap-12">
      <RadioButton
        name="radio-sizes"
        size="sm"
        label="sm · 13px"
        checked={size === 'sm'}
        onChange={() => setSize('sm')}
      />
      <RadioButton
        name="radio-sizes"
        size="md"
        label="md · 13.8px"
        checked={size === 'md'}
        onChange={() => setSize('md')}
      />
    </div>
  )
}
