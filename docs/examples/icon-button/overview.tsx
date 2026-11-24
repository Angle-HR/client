import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function IconButtonOverview() {
  return (
    <div className="flex items-center gap-8">
      <IconButton
        variant="secondary"
        size="sm"
        aria-label="Search candidates"
        icon={<MaskIcon src="/dashboard/icons/magnifying-glass-outline.svg" size={14} />}
      />
      <IconButton
        variant="secondary"
        size="sm"
        aria-label="Filter candidates"
        icon={<MaskIcon src="/dashboard/icons/funnel-outline.svg" size={14} />}
      />
      <IconButton
        variant="tertiary"
        size="sm"
        aria-label="More actions"
        icon={<MaskIcon src="/dashboard/icons/ellipsis-horizontal-outline.svg" size={14} />}
      />
    </div>
  )
}
