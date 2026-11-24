import { FlowButton } from '@/components/ui/button'

export default function FlowButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <FlowButton variant="primary">Continue</FlowButton>
      <FlowButton variant="secondary">Save draft</FlowButton>
      <FlowButton variant="tertiary">Skip this step</FlowButton>
    </div>
  )
}
