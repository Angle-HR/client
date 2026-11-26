import { Avatar } from '@/components/ui/avatar'
import { Chip } from '@/components/ui/tags'

export default function ChipOverview() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Chip
        label="Alice Johnson"
        icon={
          <Avatar
            size={14}
            type="image-border"
            circular={false}
            src="/dashboard/avatars/alice.png"
            alt=""
          />
        }
      />
      <Chip label="Design" fill="accent" withIcon={false} />
      <Chip label="Approved" fill="green" withIcon={false} />
      <Chip label="London" fill="transparent" withIcon={false} />
    </div>
  )
}
