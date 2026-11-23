import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

const variants = [
  { variant: 'primary', label: 'Edit job', icon: 'pencil-square' },
  { variant: 'secondary', label: 'Edit job', icon: 'pencil-square' },
  { variant: 'tertiary', label: 'Edit job', icon: 'pencil-square' },
  { variant: 'light', label: 'Edit job', icon: 'pencil-square' },
  { variant: 'light-w-hover', label: 'Edit job', icon: 'pencil-square' },
  { variant: 'error', label: 'Delete job', icon: 'trash' },
] as const

export default function IconButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-16">
      {variants.map(({ variant, label, icon }) => (
        <div key={variant} className="flex flex-col items-center gap-6">
          <IconButton
            variant={variant}
            aria-label={label}
            icon={<MaskIcon src={`/dashboard/icons/${icon}-outline.svg`} size={14} />}
          />
          <span className="text-body-xs text-text-secondary">{variant}</span> {/* docs-hide */}
        </div>
      ))}
    </div>
  )
}
