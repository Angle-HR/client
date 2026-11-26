import { Tag } from '@/components/ui/tags'

export default function TagOverview() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Tag label="Full-time" />
      <Tag label="Hired" color="green" />
      <Tag label="Interview" color="blue" />
      <Tag label="On hold" color="yellow" />
      <Tag label="Rejected" color="red" />
      <Tag label="Coming soon" color="orange" weight="medium" />
    </div>
  )
}
