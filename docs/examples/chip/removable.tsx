'use client'

import { useState } from 'react'

import { Avatar } from '@/components/ui/avatar'
import { Chip } from '@/components/ui/tags'

// Figma's chip avatar: the 14px square photo avatar, with a border.
const people = [
  { name: 'Alice Johnson', photo: '/dashboard/avatars/alice.png' },
  { name: 'Dylan Brooks', photo: '/dashboard/avatars/dylan.png' },
  { name: 'Samantha Lee', photo: '/dashboard/avatars/samantha.png' },
]

export default function ChipRemovable() {
  const [chips, setChips] = useState(people)
  return (
    <div className="flex flex-wrap items-center gap-8">
      {chips.map(({ name, photo }) => (
        <Chip
          key={name}
          label={name}
          icon={<Avatar size={14} type="image-border" circular={false} src={photo} alt="" />}
          removable
          onRemove={() => setChips((c) => c.filter((p) => p.name !== name))}
        />
      ))}
      <Chip label="Design" fill="accent" withIcon={false} removable onRemove={() => {}} />
      {chips.length < people.length && (
        <button
          type="button"
          className="text-body-s text-text-secondary underline"
          onClick={() => setChips(people)}
        >
          Reset
        </button>
      )}
    </div>
  )
}
