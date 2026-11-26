import { Avatar } from '@/components/ui/avatar'
import { AVATAR_SIZES } from '@/components/ui/avatar/avatar.figma'

export default function AvatarSizes() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end gap-12">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} size={size} text="VA" colour="aqua" />
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-12">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} size={size} text="VA" colour="aqua" circular={false} />
        ))}
      </div>
    </div>
  )
}
