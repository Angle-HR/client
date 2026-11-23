import { Avatar } from '@/components/ui/avatar'
import { TextButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function TextButtonIconsAvatar() {
  return (
    <div className="flex flex-col items-start gap-12">
      <TextButton
        href="https://www.gov.uk/employment-contracts-and-conditions"
        target="_blank"
        rel="noopener noreferrer"
        iconRight={
          <MaskIcon src="/dashboard/icons/arrow-top-right-on-square-outline.svg" size={10} />
        }
      >
        Employment contract rules
        <span className="sr-only"> (opens in new tab)</span>
      </TextButton>
      <span className="flex items-center gap-4 text-body-s text-text-secondary">
        Reviewed by
        <TextButton avatar={<Avatar size={12} circular={false} text="A" colour="green" />}>
          Ada Obi
        </TextButton>
      </span>
    </div>
  )
}
