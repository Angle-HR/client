import { TagRemoveButton } from './tag-remove-button'

import type { TagColor, TagSize } from './tag.figma'

type TagWeight = 'regular' | 'medium'

interface TagProps {
  label: string
  color?: TagColor
  /** Figma's "Size": `lg` Large (default), `sm` Small, `xs` xSmall. */
  size?: TagSize
  /** Adds a remove button. Figma has no removable xSmall, so it's ignored at `xs`. */
  removable?: boolean
  weight?: TagWeight
  onRemove?: () => void
  'aria-label'?: string
  className?: string
}

// All values from tag.figma.ts (Figma node 912:21312).
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

// `pad` is the label's padding alone; `padRemovable` when a remove button follows.
const sizeClasses: Record<
  TagSize,
  { root: string; font: string; pad: string; padRemovable: string }
> = {
  lg: {
    root: 'h-[20px] rounded-sm-7',
    font: 'text-body-s',
    pad: 'px-[8px]',
    padRemovable: 'pl-[8px]',
  },
  sm: {
    root: 'h-[20px] rounded-sm-7',
    font: 'text-body-xs',
    pad: 'px-[6px]',
    padRemovable: 'pl-[6px]',
  },
  xs: { root: 'rounded-xs-4', font: 'text-caption-m', pad: 'px-[4px] py-[3px]', padRemovable: '' },
}

// Figma: Empty has a 1px dashed stroke (2px dash, 2px gap) centred on the
// edge. CSS dashed borders can't set dash lengths and sit inside the box, so
// it's an SVG rect on the tag's edge: an SVG stroke is centred like Figma's.
function EmptyStroke({ radius }: { radius: number }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-visible text-border-tags-empty"
    >
      <rect
        width="100%"
        height="100%"
        rx={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
    </svg>
  )
}

const RADIUS: Record<TagSize, number> = { lg: 7, sm: 7, xs: 4 }

function Tag({
  label,
  color = 'empty',
  size = 'lg',
  removable = false,
  weight = 'regular',
  onRemove,
  className = '',
  ...props
}: TagProps) {
  const withRemove = removable && size !== 'xs'
  const s = sizeClasses[size]

  const containerClasses = [
    'relative inline-flex shrink-0 items-center',
    s.root,
    bgColorMap[color],
    textColorMap[color],
    withRemove && 'gap-[2px]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const labelClasses = [
    'text-trim-cap whitespace-nowrap',
    withRemove ? s.padRemovable : s.pad,
    s.font,
    weight === 'medium' ? 'font-medium' : 'font-regular',
  ].join(' ')

  return (
    <span className={containerClasses} {...props}>
      {color === 'empty' && <EmptyStroke radius={RADIUS[size]} />}
      <span className={labelClasses}>{label}</span>
      {withRemove && (
        <TagRemoveButton color={color} aria-label={`Remove ${label}`} onClick={onRemove} />
      )}
    </span>
  )
}

export { Tag }
export type { TagProps, TagColor, TagSize, TagWeight }
