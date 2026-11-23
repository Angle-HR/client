import { LabelButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

export default function LabelButtonWithIcons() {
  return (
    <div className="flex flex-wrap gap-6">
      <LabelButton iconLeft={<MaskIcon src="/dashboard/icons/map-pin-outline.svg" size={14} />}>
        Lagos
      </LabelButton>
      <LabelButton
        selected
        iconLeft={<MaskIcon src="/dashboard/icons/briefcase-outline.svg" size={14} />}
      >
        Full-time
      </LabelButton>
      <LabelButton
        disabled
        iconLeft={<MaskIcon src="/dashboard/icons/clock-outline.svg" size={14} />}
      >
        Part-time
      </LabelButton>
    </div>
  )
}
