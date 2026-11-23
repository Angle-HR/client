import { TextButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function TextButtonWrapped() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <TextButton
        wrapped
        underline="never"
        iconLeft={<MaskIcon src="/dashboard/icons/magnifying-glass-outline.svg" size={11} />}
      >
        Search
      </TextButton>
      <TextButton wrapped underline="never">
        Clear filters
      </TextButton>
    </div>
  )
}
