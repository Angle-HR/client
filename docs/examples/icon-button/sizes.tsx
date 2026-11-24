import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function IconButtonSizes() {
  return (
    <div className="flex items-center gap-8">
      <IconButton
        size="xs"
        variant="secondary"
        aria-label="Delete row"
        icon={<MaskIcon src="/dashboard/icons/trash-outline.svg" size={10} />}
      />
      <IconButton
        size="sm"
        variant="secondary"
        aria-label="Delete row"
        icon={<MaskIcon src="/dashboard/icons/trash-outline.svg" size={14} />}
      />
      <IconButton
        size="md"
        variant="secondary"
        aria-label="Delete row"
        icon={<MaskIcon src="/dashboard/icons/trash-outline.svg" size={14} />}
      />
    </div>
  )
}
