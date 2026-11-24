import { Button } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function ButtonWithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Button
        variant="primary"
        accent="blue"
        iconPrefix={<MaskIcon src="/dashboard/icons/plus-outline.svg" size={14} />}
      >
        Invite member
      </Button>
      <Button
        variant="secondary"
        iconSuffix={<MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={14} />}
      >
        Export
      </Button>
    </div>
  )
}
