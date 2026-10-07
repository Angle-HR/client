import { Avatar } from '../avatar/avatar'
import { ChevronDown } from '../icons'

interface CompanySelectorItemProps {
  name: string
  avatarUrl?: string
  /** Rail mode: avatar only, since the name has nowhere to go at 52px. */
  hideName?: boolean
  className?: string
}

function CompanySelectorItem({
  name,
  avatarUrl,
  hideName = false,
  className = '',
}: CompanySelectorItemProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-[8px] ${className}`}>
      <Avatar
        size={14}
        type={avatarUrl ? 'image-border' : 'initials'}
        src={avatarUrl}
        text={name[0]}
        aria-hidden
      />
      {!hideName && (
        <span className="inline-flex min-w-0 items-center gap-[2px]">
          <span className="max-w-[108px] truncate text-[13px] leading-[19.5px] font-semibold text-text-primary">
            {name}
          </span>
          <ChevronDown className="size-[10px] shrink-0 text-text-primary" />
        </span>
      )}
    </span>
  )
}

export { CompanySelectorItem }
export type { CompanySelectorItemProps }
