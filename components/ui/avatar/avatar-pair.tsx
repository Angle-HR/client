import type { ReactNode } from 'react'

interface AvatarPairProps {
  primary: ReactNode
  secondary: ReactNode
  className?: string
}

function AvatarPair({ primary, secondary, className = '' }: AvatarPairProps) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span className="h-[44px] w-[44px]">{primary}</span>
      <span className="absolute -bottom-[2px] -right-[2px] inline-flex rounded-full ring-2 ring-bg-secondary">
        {secondary}
      </span>
    </span>
  )
}

export { AvatarPair }
export type { AvatarPairProps }
