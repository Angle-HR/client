type DividerWidth = 'hairline' | 'thin' | 'medium'

interface DividerProps {
  width?: DividerWidth
  /** Only meaningful with width="medium" in Figma. */
  double?: boolean
  dashed?: boolean
  padded?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const widthPx: Record<DividerWidth, string> = {
  hairline: '0.5px',
  thin: '1px',
  medium: '1.5px',
}

// Bound to border/notification in Figma — a naming coincidence with the
// Notification badge, not a semantic link. It's just the standard neutral
// divider colour.
function Divider({
  width = 'thin',
  double = false,
  dashed = false,
  padded = false,
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  const isVertical = orientation === 'vertical'
  const lineStyle = {
    borderStyle: dashed ? 'dashed' : 'solid',
    [isVertical ? 'borderLeftWidth' : 'borderTopWidth']: widthPx[width],
  }

  const line = (
    <div
      className={`border-border-notification ${isVertical ? 'h-full' : 'w-full'}`}
      style={lineStyle}
    />
  )

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 ${isVertical ? 'w-fit flex-row gap-[3px]' : 'h-fit flex-col gap-[3px]'} ${padded ? (isVertical ? 'py-[8px]' : 'px-[8px]') : ''} ${className}`}
    >
      {line}
      {double && width === 'medium' && line}
    </div>
  )
}

export { Divider }
export type { DividerProps, DividerWidth }
