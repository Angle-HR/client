import { FlowButton } from '@/components/ui/button'

export default function FlowButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <FlowButton variant="primary" size="xs">
        xs · 25px
      </FlowButton>
      <FlowButton variant="primary" size="sm">
        sm · 32px
      </FlowButton>
      <FlowButton variant="primary" size="md">
        md · 40px
      </FlowButton>
    </div>
  )
}
