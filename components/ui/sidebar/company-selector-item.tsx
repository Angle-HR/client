import { Avatar } from '../avatar/avatar'

interface CompanySelectorItemProps {
  name: string
  avatarUrl?: string
  className?: string
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2.5 3.75L5 6.25L7.5 3.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompanySelectorItem({ name, avatarUrl, className = '' }: CompanySelectorItemProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-[8px] ${className}`}>
      <Avatar
        size={14}
        type={avatarUrl ? 'image-border' : 'initials'}
        src={avatarUrl}
        text={name[0]}
        aria-hidden
      />
      <span className="inline-flex min-w-0 items-center gap-[2px]">
        <span className="max-w-[108px] truncate text-[13px] leading-[19.5px] font-semibold text-text-primary">
          {name}
        </span>
        <ChevronDownIcon className="size-[10px] shrink-0 text-text-primary" />
      </span>
    </span>
  )
}

export { CompanySelectorItem }
export type { CompanySelectorItemProps }
