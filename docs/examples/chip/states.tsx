'use client'

import { Avatar } from '@/components/ui/avatar'
import { Chip } from '@/components/ui/tags'

const icon = (
  <Avatar
    size={14}
    type="image-border"
    circular={false}
    src="/dashboard/avatars/alice.png"
    alt=""
  />
)

export default function ChipStatesExample() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Chip label="Select a person" icon={icon} state="placeholder" />
      <Chip label="Alice Johnson" icon={icon} disabled />
      <Chip label="Loading" state="loading" />
      <Chip label="Clickable" icon={icon} onClick={() => {}} />
      <Chip
        label="Clickable, removable"
        icon={icon}
        onClick={() => {}}
        removable
        onRemove={() => {}}
      />
    </div>
  )
}
