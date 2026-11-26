import { Tag } from '@/components/ui/tags'

export default function TagSizes() {
  return (
    <div className="flex items-center gap-8">
      <Tag label="Large" color="blue" />
      <Tag label="Small" color="blue" size="sm" />
      <Tag label="xSmall" color="blue" size="xs" />
    </div>
  )
}
