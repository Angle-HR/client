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

export default function ChipFills() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center gap-8">
        <Chip label="Default" icon={icon} />
        <Chip label="Accent" fill="accent" icon={icon} />
        <Chip label="Green" fill="green" icon={icon} />
        <Chip label="Transparent" fill="transparent" icon={icon} />
      </div>
      <div className="flex flex-wrap items-center gap-8">
        <Chip label="Default" icon={icon} boldText />
        <Chip label="Accent" fill="accent" icon={icon} boldText />
        <Chip label="Green" fill="green" icon={icon} boldText />
        <Chip label="Transparent" fill="transparent" icon={icon} boldText />
      </div>
    </div>
  )
}
