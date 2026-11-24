'use client'

import { useState } from 'react'

import { LabelButton } from '@/components/ui/button'

const filters = ['Remote', 'Hybrid', 'On-site'] as const

export default function LabelButtonOverview() {
  const [selected, setSelected] = useState<string[]>(['Remote'])

  function toggle(filter: string) {
    setSelected((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    )
  }

  return (
    <div role="group" aria-label="Work location" className="flex flex-wrap gap-6">
      {filters.map((filter) => (
        <LabelButton
          key={filter}
          selected={selected.includes(filter)}
          onClick={() => toggle(filter)}
        >
          {filter}
        </LabelButton>
      ))}
    </div>
  )
}
