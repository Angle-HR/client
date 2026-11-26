'use client'

import { InputSelection } from '@/components/ui/input-selection'

const SKILLS = [
  { value: 'figma', label: 'Figma' },
  { value: 'research', label: 'Research' },
  { value: 'prototyping', label: 'Prototyping' },
  { value: 'writing', label: 'Writing' },
]

export default function SelectionMultiple() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <InputSelection
        label="Skills"
        placeholder="Add skills"
        options={SKILLS}
        multiple
        withSelection
        defaultValue={['figma', 'research']}
      />
    </div>
  )
}
