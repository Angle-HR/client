import type { HTMLAttributes } from 'react'

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl'

interface NotificationBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BadgeSize
  count?: number
  showNumber?: boolean
  className?: string
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'h-[4px] w-[4px]',
  md: 'h-[5px] w-[5px]',
  lg: 'h-[8px] w-[8px]',
  xl: 'min-h-[11px] min-w-[11px]',
}

function NotificationBadge({
  size = 'md',
  count,
  showNumber = false,
  className = '',
  ...props
}: NotificationBadgeProps) {
  const shouldShowNumber = size === 'xl' && showNumber && count !== undefined
  const displayCount = count !== undefined && count > 99 ? '99+' : count

  const classes = [
    'inline-flex items-center justify-center rounded-full bg-bg-notification',
    shouldShowNumber ? 'min-h-[12px] min-w-[16px] px-[3px]' : sizeClasses[size],
    className,
  ].join(' ')

  return (
    <span className={classes} {...props}>
      {shouldShowNumber && (
        <span className="text-[9px] font-medium leading-none text-text-inverted">
          {displayCount}
        </span>
      )}
    </span>
  )
}

export { NotificationBadge }
export type { NotificationBadgeProps, BadgeSize }
