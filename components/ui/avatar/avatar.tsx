'use client'

import { useState, type ReactNode } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import {
  AVATAR_COUNTRY,
  AVATAR_ICON,
  AVATAR_NOTIFICATION,
  type AvatarColour,
  type AvatarSize,
} from './avatar.figma'
import { CountryFlag } from './country-flag'
import { NotificationBadge } from './notification-badge'

type AvatarType = 'initials' | 'image' | 'image-border' | 'icon' | 'country'

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
  /** Replaces the icon avatar's glyph (Figma's default is an ellipsis). */
  icon?: ReactNode
  countryCode?: string
  showNotification?: boolean
  notificationCount?: number
  'aria-label'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  className?: string
}

// All values from avatar.figma.ts (Figma node 674:46801). Class strings are
// spelled out so Tailwind can see them.
const sizeClasses: Record<AvatarSize, string> = {
  12: 'size-[12px]',
  14: 'size-[14px]',
  16: 'size-[16px]',
  18: 'size-[18px]',
  20: 'size-[20px]',
  24: 'size-[24px]',
  32: 'size-[32px]',
  44: 'size-[44px]',
}

// Square corners per size (AVATAR_RADIUS).
const squareRadius: Record<AvatarSize, string> = {
  12: 'rounded-[3px]',
  14: 'rounded-[4px]',
  16: 'rounded-[4px]',
  18: 'rounded-[4px]',
  20: 'rounded-[4px]',
  24: 'rounded-[5px]',
  32: 'rounded-[7px]',
  44: 'rounded-[8px]',
}

// Square image corners (AVATAR_IMAGE_RADIUS). Figma oddity: the 14px image is
// square-cornered with a border and 3px without.
const imageSquareRadius: Record<AvatarSize, { border: string; borderless: string }> = {
  12: { border: 'rounded-[3px]', borderless: 'rounded-[3px]' },
  14: { border: 'rounded-none', borderless: 'rounded-[3px]' },
  16: { border: 'rounded-[4px]', borderless: 'rounded-[4px]' },
  18: { border: 'rounded-[4px]', borderless: 'rounded-[4px]' },
  20: { border: 'rounded-[4px]', borderless: 'rounded-[4px]' },
  24: { border: 'rounded-[5px]', borderless: 'rounded-[5px]' },
  32: { border: 'rounded-[7px]', borderless: 'rounded-[7px]' },
  44: { border: 'rounded-[8px]', borderless: 'rounded-[8px]' },
}

// Initials: Medium, trimmed to cap height (AVATAR_TEXT).
const textClasses: Record<AvatarSize, string> = {
  12: 'text-label',
  14: 'text-caption-s',
  16: 'text-caption-m',
  18: 'text-caption-m',
  20: 'text-caption-m',
  24: 'text-body-s',
  32: 'text-body-m',
  44: 'text-body-xl',
}

// Country (12–20px): a 3:2 flag when square (AVATAR_COUNTRY).
const countrySquare: Partial<Record<AvatarSize, string>> = {
  12: 'w-[18px] h-[12px] rounded-[2px]',
  14: 'w-[21px] h-[14px] rounded-[2px]',
  16: 'w-[24px] h-[16px] rounded-[3px]',
  18: 'w-[27px] h-[18px] rounded-[3px]',
  20: 'w-[30px] h-[20px] rounded-[3px]',
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

// Figma's 0.5px inside strokes, as inset shadows so they aren't rounded to a
// whole pixel. Images and flags would cover an inset shadow, so those draw it
// on an overlay instead.
const TEXT_STROKE = 'shadow-[inset_0_0_0_0.5px_var(--color-border-avatar-text)]'
const IMAGE_STROKE = 'shadow-[inset_0_0_0_0.5px_var(--color-border-avatar-image)]'

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

  // Not in Figma: an image that fails falls back to the initials, or the icon.
  const resolvedType =
    (type === 'image' || type === 'image-border') && (imgError || !src)
      ? text
        ? 'initials'
        : 'icon'
      : type

  const shape = circular ? 'rounded-full' : squareRadius[size]
  const squareFlag = resolvedType === 'country' && !circular ? countrySquare[size] : undefined
  const box = squareFlag ?? `${sizeClasses[size]} ${shape}`
  const flagShape = squareFlag ?? shape

  const withBorder = resolvedType === 'image-border'
  const imageShape = circular
    ? 'rounded-full'
    : imageSquareRadius[size][withBorder ? 'border' : 'borderless']

  const notification = AVATAR_NOTIFICATION[size]

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${box} ${className}`}
      aria-label={props['aria-label']}
      aria-hidden={props['aria-hidden']}
    >
      {resolvedType === 'initials' && (
        <span
          className={`flex size-full items-center justify-center ${shape} ${bgColorMap[colour]} ${textColorMap[colour]} ${TEXT_STROKE}`}
        >
          <span className={`${textClasses[size]} text-trim-cap font-medium`}>{text}</span>
        </span>
      )}

      {resolvedType === 'icon' && (
        <span
          className={`flex size-full items-center justify-center ${shape} ${bgColorMap[colour]} ${textColorMap[colour]} ${TEXT_STROKE}`}
        >
          {icon ? (
            <span
              className="inline-flex items-center justify-center"
              style={{ width: AVATAR_ICON[size], height: AVATAR_ICON[size] }}
            >
              {icon}
            </span>
          ) : (
            <MaskIcon
              src="/dashboard/icons/ellipsis-horizontal-solid.svg"
              size={AVATAR_ICON[size]}
            />
          )}
        </span>
      )}

      {(resolvedType === 'image' || resolvedType === 'image-border') && (
        <>
          {/* Framework-agnostic design-system primitive: a plain <img> keeps
              Avatar usable outside Next and avoids next/image's constraints. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`size-full object-cover ${imageShape}`}
            onError={() => {
              setImgError(true)
              onError?.()
            }}
          />
          {withBorder && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 ${imageShape} ${IMAGE_STROKE}`}
            />
          )}
        </>
      )}

      {resolvedType === 'country' && countryCode && (
        <>
          {/* Circular crops the 3:2 flag to a circle, centred. */}
          <span
            className={`flex size-full items-center justify-center overflow-hidden ${flagShape}`}
          >
            <CountryFlag
              code={countryCode}
              name={countryCode}
              width={AVATAR_COUNTRY[size]?.width ?? size}
              height={size}
            />
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ${flagShape} ${TEXT_STROKE}`}
          />
        </>
      )}

      {showNotification && (
        // Figma: the dot sits at the top-left corner, 1px outside.
        <span className="absolute -top-[1px] -left-[1px] flex">
          <NotificationBadge
            size={notification.size}
            count={notificationCount}
            showNumber={notification.size === 'xl' && notificationCount !== undefined}
          />
        </span>
      )}
    </span>
  )
}

export { Avatar, getInitials }
export type { AvatarProps, AvatarSize, AvatarType, AvatarColour }
