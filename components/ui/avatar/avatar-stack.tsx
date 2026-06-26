import type { AvatarSize } from './avatar'
import type { ReactNode } from 'react'

type StackDensity = 'standard' | 'tight'

interface AvatarStackProps {
  children: ReactNode[]
  size?: AvatarSize
  density?: StackDensity
  maxVisible?: number
  showOverflow?: boolean
  className?: string
}

// Overlap (negative left margin) per size — exact Figma values from the doc's
// Sizes table (standard density). 12 isn't in the table; extrapolated to -4.
const negativeGapStandard: Record<AvatarSize, string> = {
  12: '-ml-[4px]',
  14: '-ml-[4px]',
  16: '-ml-[4px]',
  18: '-ml-[4px]',
  20: '-ml-[6px]',
  24: '-ml-[8px]',
  32: '-ml-[14px]',
  44: '-ml-[16px]',
}

// Tight density: a few px more overlap than standard (no exact Figma spec).
const negativeGapTight: Record<AvatarSize, string> = {
  12: '-ml-[6px]',
  14: '-ml-[6px]',
  16: '-ml-[6px]',
  18: '-ml-[6px]',
  20: '-ml-[8px]',
  24: '-ml-[10px]',
  32: '-ml-[16px]',
  44: '-ml-[18px]',
}

const chipSizeMap: Record<AvatarSize, string> = {
  12: 'h-[12px] w-[12px] text-[7px]',
  14: 'h-[14px] w-[14px] text-[8px]',
  16: 'h-[16px] w-[16px] text-[8px]',
  18: 'h-[18px] w-[18px] text-[9px]',
  20: 'h-[20px] w-[20px] text-[9px]',
  24: 'h-[24px] w-[24px] text-[10px]',
  32: 'h-[32px] w-[32px] text-body-xs',
  44: 'h-[44px] w-[44px] text-body-s',
}

function AvatarStack({
  children,
  size = 24,
  density = 'standard',
  maxVisible = 4,
  showOverflow = true,
  className = '',
}: AvatarStackProps) {
  const items = Array.isArray(children) ? children : [children]
  const visible = items.slice(0, maxVisible)
  const overflowCount = items.length - maxVisible
  const gap = density === 'tight' ? negativeGapTight[size] : negativeGapStandard[size]

  return (
    <span className={`inline-flex items-center ${className}`}>
      {visible.map((child, i) => (
        <span
          key={i}
          className={`relative inline-flex ring-2 ring-bg-secondary rounded-full ${i > 0 ? gap : ''}`}
          style={{ zIndex: visible.length - i }}
        >
          {child}
        </span>
      ))}
      {showOverflow && overflowCount > 0 && (
        <span
          className={`${gap} relative inline-flex items-center justify-center rounded-full bg-bg-transparent-light ${chipSizeMap[size]} font-medium text-text-secondary ring-2 ring-bg-secondary`}
          style={{ zIndex: 0 }}
        >
          +{overflowCount}
        </span>
      )}
    </span>
  )
}

export { AvatarStack }
export type { AvatarStackProps, StackDensity }
