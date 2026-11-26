'use client'

import { useState } from 'react'

import { Checkbox } from '@/components/ui/selection-controls'

const stages = ['Applied', 'Screening', 'Interview', 'Offer'] as const

export default function CheckboxOverview() {
  const [picked, setPicked] = useState<string[]>(['Screening'])
  const all = picked.length === stages.length ? true : picked.length ? 'indeterminate' : false

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">Stages to show</legend>
      <Checkbox
        label="All stages"
        checked={all}
        onChange={() => setPicked(all === true ? [] : [...stages])}
      />
      <div className="flex flex-col gap-4 pl-[20px]">
        {stages.map((stage) => (
          <Checkbox
            key={stage}
            label={stage}
            checked={picked.includes(stage)}
            onChange={() =>
              setPicked((current) =>
                current.includes(stage) ? current.filter((s) => s !== stage) : [...current, stage],
              )
            }
          />
        ))}
      </div>
    </fieldset>
  )
}
