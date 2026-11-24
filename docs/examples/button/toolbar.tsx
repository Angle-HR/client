import { Button } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function ButtonToolbar() {
  return (
    <div className="flex gap-8">
      <Button
        variant="tertiary"
        size="sm"
        iconPrefix={<MaskIcon src="/dashboard/icons/funnel-outline.svg" size={14} />}
      >
        Filter
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        iconSuffix={<MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={14} />}
      >
        Sort
      </Button>
    </div>
  )
}
