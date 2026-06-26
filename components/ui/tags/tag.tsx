import { TagRemoveButton, type TagColor } from './tag-remove-button'

type TagWeight = 'regular' | 'medium'

interface TagProps {
  label: string
  color?: TagColor
  removable?: boolean
  weight?: TagWeight
  onRemove?: () => void
  'aria-label'?: string
  className?: string
}

const bgColorMap: Record<TagColor, string> = {
  empty: 'bg-bg-tags-empty',
  red: 'bg-bg-tags-red',
  green: 'bg-bg-tags-green',
  teal: 'bg-bg-tags-teal',
  aqua: 'bg-bg-tags-aqua',
  blue: 'bg-bg-tags-blue',
  purple: 'bg-bg-tags-purple',
  grey: 'bg-bg-tags-grey',
  yellow: 'bg-bg-tags-yellow',
  fuchsia: 'bg-bg-tags-fuchsia',
  orange: 'bg-bg-tags-orange',
}

const textColorMap: Record<TagColor, string> = {
  empty: 'text-text-tags-empty',
  red: 'text-text-tags-red',
  green: 'text-text-tags-green',
  teal: 'text-text-tags-teal',
  aqua: 'text-text-tags-aqua',
  blue: 'text-text-tags-blue',
  purple: 'text-text-tags-purple',
  grey: 'text-text-tags-grey',
  yellow: 'text-text-tags-yellow',
  fuchsia: 'text-text-tags-fuchsia',
  orange: 'text-text-tags-orange',
}

function Tag({
  label,
  color = 'empty',
  removable = false,
  weight = 'regular',
  onRemove,
  className = '',
  ...props
}: TagProps) {
  const containerClasses = [
    'inline-flex items-center h-[20px] rounded-sm-7',
    bgColorMap[color],
    textColorMap[color],
    color === 'empty' ? 'border border-border-tags-empty' : '',
    removable ? 'pl-[8px] pr-0 gap-[2px]' : 'px-[8px]',
    className,
  ].join(' ')

  return (
    <span className={containerClasses} {...props}>
      <span className={`text-body-xs leading-none ${weight === 'medium' ? 'font-medium' : ''}`}>
        {label}
      </span>
      {removable && (
        <TagRemoveButton color={color} aria-label={`Remove ${label}`} onClick={onRemove} />
      )}
    </span>
  )
}

export { Tag }
export type { TagProps, TagColor, TagWeight }
