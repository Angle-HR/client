'use client'

import { useState } from 'react'

import { Toggle } from '@/components/ui/selection-controls'

export default function ToggleOverview() {
  const [on, setOn] = useState(true)
  return (
    <label className="flex items-center gap-8 text-body-s text-text-primary">
      <Toggle toggled={on} onChange={setOn} aria-label="Email me new applicants" />
      Email me new applicants
    </label>
  )
}
