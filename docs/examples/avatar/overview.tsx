import { Avatar } from '@/components/ui/avatar'

export default function AvatarOverview() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Avatar size={32} text="VA" colour="green" />
      <Avatar size={32} text="TB" colour="blue" circular={false} />
      <Avatar size={32} type="image-border" src="/dashboard/avatars/alice.png" alt="Alice" />
      <Avatar size={32} type="icon" colour="grey" />
      <Avatar size={20} type="country" countryCode="NG" />
      <Avatar size={32} text="A" colour="purple" showNotification />
    </div>
  )
}
