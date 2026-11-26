import { Avatar } from '@/components/ui/avatar'

export default function AvatarFallback() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Avatar size={32} type="image" src="/missing-photo.png" text="VA" colour="orange" />
      <Avatar size={32} type="image" src="/missing-photo.png" colour="grey" />
    </div>
  )
}
