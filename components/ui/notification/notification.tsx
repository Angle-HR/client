type NotificationSize = 'small' | 'medium' | 'large' | 'xlarge'

interface NotificationProps {
  /** Renders a numbered pill instead of a bare dot. Figma only defines this at size="xlarge". */
  withText?: boolean
  /** Only applies when withText — drops the chip background for low-emphasis contexts. */
  plainText?: boolean
  size?: NotificationSize
  count?: number
  /** Counts above this render as "${max}+". Figma doesn't define a ceiling. */
  max?: number
  className?: string
}

const dotSizeClasses: Record<NotificationSize, string> = {
  small: 'size-[4px]',
  medium: 'size-[5px]',
  large: 'size-[8px]',
  xlarge: 'size-[11px]',
}

function Notification({
  withText = false,
  plainText = false,
  size = 'medium',
  count,
  max = 99,
  className = '',
}: NotificationProps) {
  // The badge is visual-only — the count/unread state belongs on the host
  // element's aria-label, never announced independently here.
  if (withText) {
    const displayCount = count !== undefined && count > max ? `${max}+` : count
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm-7 font-mono leading-none ${
          plainText
            ? 'text-[11px] text-text-secondary'
            : 'border-[0.5px] border-border-notification bg-bg-notification px-[4px] text-[9px] font-medium text-text-inverted'
        } ${className}`}
      >
        {displayCount}
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-sm-7 border-[0.5px] border-border-notification bg-bg-notification ${dotSizeClasses[size]} ${className}`}
    />
  )
}

export { Notification }
export type { NotificationProps, NotificationSize }
