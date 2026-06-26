import type { ReactNode } from 'react'

type AvatarIconSize = 'xs' | 'sm' | 'md' | 'lg'
type AvatarIconType = 'icon' | 'avatar'

interface AvatarIconProps {
  size?: AvatarIconSize
  type?: AvatarIconType
  wrapped?: boolean
  children: ReactNode
  className?: string
}

const containerSizeMap: Record<AvatarIconSize, string> = {
  xs: 'h-[14px] w-[14px]',
  sm: 'h-[24px] w-[24px]',
  md: 'h-[32px] w-[32px]',
  lg: 'h-[40px] w-[40px]',
}

// Wrapped container radius is size-aware: xs=5px, sm/md/lg=7px.
const radiusMap: Record<AvatarIconSize, string> = {
  xs: 'rounded-sm-5',
  sm: 'rounded-sm-7',
  md: 'rounded-sm-7',
  lg: 'rounded-sm-7',
}

// Inner content size differs between an icon and an avatar at `sm` (16 vs 14).
const iconSizeMap: Record<AvatarIconSize, string> = {
  xs: 'h-[12px] w-[12px]',
  sm: 'h-[14px] w-[14px]',
  md: 'h-[20px] w-[20px]',
  lg: 'h-[24px] w-[24px]',
}

const avatarSizeMap: Record<AvatarIconSize, string> = {
  xs: 'h-[12px] w-[12px]',
  sm: 'h-[16px] w-[16px]',
  md: 'h-[20px] w-[20px]',
  lg: 'h-[24px] w-[24px]',
}

function AvatarIcon({
  size = 'sm',
  type = 'icon',
  wrapped = false,
  children,
  className = '',
}: AvatarIconProps) {
  const innerSize = type === 'avatar' ? avatarSizeMap[size] : iconSizeMap[size]

  if (!wrapped) {
    return (
      <span className={`inline-flex items-center justify-center ${innerSize} ${className}`}>
        {children}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${radiusMap[size]} bg-bg-transparent-light ${containerSizeMap[size]} ${className}`}
    >
      <span className={`inline-flex items-center justify-center ${innerSize}`}>{children}</span>
    </span>
  )
}

export { AvatarIcon }
export type { AvatarIconProps, AvatarIconSize, AvatarIconType }
