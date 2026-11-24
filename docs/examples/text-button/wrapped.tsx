import { TextButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

const sizes = [
  { size: 'xs', icon: 10 },
  { size: 'sm', icon: 10 },
  { size: 'md', icon: 11 },
  { size: 'lg', icon: 12 },
] as const

export default function TextButtonWrapped() {
  return (
    <div className="flex flex-wrap items-end gap-24">
      {sizes.map(({ size, icon }) => (
        <div key={size} className="flex flex-col items-center gap-6">
          <TextButton
            size={size}
            wrapped
            underline="never"
            iconLeft={<MaskIcon src="/dashboard/icons/magnifying-glass-outline.svg" size={icon} />}
          >
            Search
          </TextButton>
          <span className="text-body-xs text-text-secondary">{size}</span> {/* docs-hide */}
        </div>
      ))}
    </div>
  )
}
