import { Avatar } from './avatar'
import { AVATAR_STACK_MORE, type StackDensity } from './avatar-stack.figma'

import type { AvatarSize } from './avatar'
import type { ReactNode } from 'react'

interface AvatarStackProps {
  /** Avatars at the stack's size, usually circular <Avatar>s. */
  children: ReactNode[]
  size?: AvatarSize
  density?: StackDensity
  /** How many faces to show before the "more" tile. */
  maxVisible?: number
  showOverflow?: boolean
  className?: string
}

// Overlap per size and density, from AVATAR_STACK_OVERLAP (Figma 709:48349).
// Spelled out so Tailwind can see the classes.
const overlap: Record<StackDensity, Record<AvatarSize, string>> = {
  standard: {
    12: '-ml-[4px]',
    14: '-ml-[4px]',
    16: '-ml-[4px]',
    18: '-ml-[4px]',
    20: '-ml-[6px]',
    24: '-ml-[8px]',
    32: '-ml-[14px]',
    44: '-ml-[16px]',
  },
  tight: {
    12: '-ml-[6px]',
    14: '-ml-[6px]',
    16: '-ml-[8px]',
    18: '-ml-[8px]',
    20: '-ml-[10px]',
    24: '-ml-[12px]',
    32: '-ml-[16px]',
    44: '-ml-[24px]',
  },
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
  const hidden = items.length - visible.length
  const withMore = showOverflow && hidden > 0
  const gap = overlap[density][size]

  return (
    <span className={`inline-flex items-center ${className}`}>
      {visible.map((child, i) => (
        <span
          key={i}
          className={`relative inline-flex ${i > 0 ? gap : ''}`}
          // Figma: with the "more" tile each later face sits on top; without
          // it, the first face is on top.
          style={{ zIndex: withMore ? i + 1 : visible.length - i }}
        >
          {child}
        </span>
      ))}
      {withMore && (
        <span
          role="img"
          aria-label={`${hidden} more`}
          data-avatar-stack-more=""
          className={`relative inline-flex ${visible.length > 0 ? gap : ''}`}
          style={{ zIndex: visible.length + 1 }}
        >
          <Avatar
            size={size}
            type={AVATAR_STACK_MORE.type}
            colour={AVATAR_STACK_MORE.colour}
            circular={AVATAR_STACK_MORE.circular}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  )
}

export { AvatarStack }
export type { AvatarStackProps, StackDensity }
