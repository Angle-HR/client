import { FlowButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function FlowButtonOverview() {
  return (
    <div className="flex items-center gap-8">
      <FlowButton iconPrefix={<MaskIcon src="/dashboard/icons/arrow-left-outline.svg" size={14} />}>
        Back
      </FlowButton>
      <FlowButton
        variant="primary"
        iconSuffix={<MaskIcon src="/dashboard/icons/arrow-right-outline.svg" size={15} />}
      >
        Continue to screening
      </FlowButton>
    </div>
  )
}
