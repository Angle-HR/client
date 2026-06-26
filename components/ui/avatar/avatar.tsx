'use client'

import { useState, type ReactNode } from 'react'

import { NotificationBadge, type BadgeSize } from './notification-badge'

type AvatarSize = 12 | 14 | 16 | 18 | 20 | 24 | 32 | 44
type AvatarType = 'initials' | 'image' | 'image-border' | 'icon' | 'country'
type AvatarColour =
  | 'green'
  | 'purple'
  | 'aqua'
  | 'orange'
  | 'yellow'
  | 'blue'
  | 'fuchsia'
  | 'red'
  | 'grey'
  | 'teal'

interface AvatarProps {
  size?: AvatarSize
  type?: AvatarType
  circular?: boolean
  /** Literal initials (1–2 chars) for type="initials". Use getInitials() to derive from a name. */
  text?: string
  colour?: AvatarColour
  src?: string
  alt?: string
  onError?: () => void
  icon?: ReactNode
  countryCode?: string
  showNotification?: boolean
  notificationCount?: number
  'aria-label'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  12: 'h-[12px] w-[12px]',
  14: 'h-[14px] w-[14px]',
  16: 'h-[16px] w-[16px]',
  18: 'h-[18px] w-[18px]',
  20: 'h-[20px] w-[20px]',
  24: 'h-[24px] w-[24px]',
  32: 'h-[32px] w-[32px]',
  44: 'h-[44px] w-[44px]',
}

const textSizeClasses: Record<AvatarSize, string> = {
  12: 'text-[6px]',
  14: 'text-[7px]',
  16: 'text-[8px]',
  18: 'text-[9px]',
  20: 'text-[9px]',
  24: 'text-[10px]',
  32: 'text-body-xs',
  44: 'text-body-s',
}

const bgColorMap: Record<AvatarColour, string> = {
  green: 'bg-bg-avatar-green',
  purple: 'bg-bg-avatar-purple',
  aqua: 'bg-bg-avatar-aqua',
  orange: 'bg-bg-avatar-orange',
  yellow: 'bg-bg-avatar-yellow',
  blue: 'bg-bg-avatar-blue',
  fuchsia: 'bg-bg-avatar-fuchsia',
  red: 'bg-bg-avatar-red',
  grey: 'bg-bg-avatar-grey',
  teal: 'bg-bg-avatar-teal',
}

const textColorMap: Record<AvatarColour, string> = {
  green: 'text-text-avatar-green',
  purple: 'text-text-avatar-purple',
  aqua: 'text-text-avatar-aqua',
  orange: 'text-text-avatar-orange',
  yellow: 'text-text-avatar-yellow',
  blue: 'text-text-avatar-blue',
  fuchsia: 'text-text-avatar-fuchsia',
  red: 'text-text-avatar-red',
  grey: 'text-text-avatar-grey',
  teal: 'text-text-avatar-teal',
}

// Badge sizes from Figma bounding boxes: 18/20 → 5px (md), 24/32 → 8px (lg),
// 44 → 11px (xl). 12/14/16 unresolved in Figma — kept at the smallest dot.
const notificationBadgeSizeMap: Record<AvatarSize, BadgeSize> = {
  12: 'sm',
  14: 'sm',
  16: 'sm',
  18: 'md',
  20: 'md',
  24: 'lg',
  32: 'lg',
  44: 'xl',
}

/** Derive 1–2 character initials from a display name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return (parts[0] ?? '').charAt(0).toUpperCase()
  return ((parts[0] ?? '').charAt(0) + (parts[parts.length - 1] ?? '').charAt(0)).toUpperCase()
}

function Avatar({
  size = 12,
  type = 'initials',
  circular = true,
  text = '',
  colour = 'green',
  src,
  alt = '',
  onError,
  icon,
  countryCode,
  showNotification = false,
  notificationCount,
  className = '',
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const resolvedType =
    (type === 'image' || type === 'image-border') && (imgError || !src)
      ? text
        ? 'initials'
        : 'icon'
      : type

  const shapeClass = circular ? 'rounded-full' : 'rounded-xs-4'
  const containerClasses = [
    sizeClasses[size],
    'relative inline-flex items-center justify-center shrink-0',
    shapeClass,
    className,
  ].join(' ')

  const badgeSize = notificationBadgeSizeMap[size]

  return (
    <span
      className={containerClasses}
      aria-label={props['aria-label']}
      aria-hidden={props['aria-hidden']}
    >
      {resolvedType === 'initials' && (
        <span
          className={`${sizeClasses[size]} ${shapeClass} ${bgColorMap[colour]} ${textColorMap[colour]} ${textSizeClasses[size]} font-medium flex items-center justify-center`}
        >
          {text}
        </span>
      )}

      {(resolvedType === 'image' || resolvedType === 'image-border') && (
        // Framework-agnostic design-system primitive: a plain <img> keeps Avatar
        // usable outside Next and avoids next/image's layout/runtime constraints.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} ${shapeClass} object-cover overflow-hidden ${resolvedType === 'image-border' ? 'border border-border-avatar-image' : ''}`}
          onError={() => {
            setImgError(true)
            onError?.()
          }}
        />
      )}

      {resolvedType === 'icon' && (
        <span
          className={`${sizeClasses[size]} ${shapeClass} bg-bg-avatar-grey text-text-avatar-grey flex items-center justify-center`}
        >
          {icon || (
            <svg className="w-[60%] h-[60%]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM1.5 14.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" />
            </svg>
          )}
        </span>
      )}

      {resolvedType === 'country' && countryCode && (
        <span
          className={`${sizeClasses[size]} ${shapeClass} flex items-center justify-center overflow-hidden bg-bg-avatar-grey`}
        >
          <span className="text-[calc(100%*0.7)]" role="img" aria-label={countryCode}>
            {String.fromCodePoint(
              ...countryCode
                .toUpperCase()
                .split('')
                .map((c) => 127397 + c.charCodeAt(0)),
            )}
          </span>
        </span>
      )}

      {showNotification && (
        <span className="absolute top-0 right-0 translate-x-[15%] -translate-y-[15%]">
          <NotificationBadge
            size={badgeSize}
            count={notificationCount}
            showNumber={badgeSize === 'xl' && notificationCount !== undefined}
          />
        </span>
      )}
    </span>
  )
}

export { Avatar, getInitials }
export type { AvatarProps, AvatarSize, AvatarType, AvatarColour }
