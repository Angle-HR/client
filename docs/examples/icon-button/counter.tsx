import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function IconButtonCounter() {
  const unread = 4

  return (
    <IconButton
      variant="secondary"
      aria-label={`Notifications, ${unread} unread`}
      icon={<MaskIcon src="/dashboard/icons/bell-outline.svg" size={14} />}
      showCounter
      counter={unread}
    />
  )
}
