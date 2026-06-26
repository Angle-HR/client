'use client'

import { forwardRef, useState, type ButtonHTMLAttributes } from 'react'

type ToggleSize = 'sm' | 'md'

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  size?: ToggleSize
  /** Controlled on/off state. Use with `onChange`. */
  toggled?: boolean
  defaultToggled?: boolean
  onChange?: (toggled: boolean) => void
  disabled?: boolean
  'aria-busy'?: boolean
  'aria-label'?: string
  className?: string
}

const trackSize: Record<ToggleSize, string> = {
  sm: 'h-[16px] w-[24px]',
  md: 'h-[20px] w-[32px]',
}

const thumbSize: Record<ToggleSize, { size: string; travel: string }> = {
  sm: { size: 'h-[12px] w-[12px]', travel: 'translate-x-[8px]' },
  md: { size: 'h-[16px] w-[16px]', travel: 'translate-x-[12px]' },
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    size = 'md',
    toggled,
    defaultToggled = false,
    onChange,
    disabled = false,
    className = '',
    ...props
  },
  ref,
) {
  const isControlled = toggled !== undefined
  const [internalToggled, setInternalToggled] = useState<boolean>(defaultToggled)
  const isOn = isControlled ? toggled : internalToggled

  const trackClasses = [
    trackSize[size],
    'rounded-[80px] relative inline-flex items-center shrink-0 transition-colors p-[2px]',
    // Figma combines hover/focus into a track border; add a WCAG focus ring in code.
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    isOn ? 'bg-bg-selection-controls-selected' : 'bg-border-selection-controls-rest',
    disabled
      ? isOn
        ? 'opacity-40 cursor-not-allowed'
        : 'bg-border-transparent-lighter cursor-not-allowed'
      : 'cursor-pointer',
    className,
  ].join(' ')

  const thumbClasses = [
    thumbSize[size].size,
    'rounded-full bg-text-inverted shadow-sm transition-transform',
    isOn ? thumbSize[size].travel : 'translate-x-0',
  ].join(' ')

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={() => {
        const next = !isOn
        if (!isControlled) setInternalToggled(next)
        onChange?.(next)
      }}
      className={trackClasses}
      {...props}
    >
      <span className={thumbClasses} />
    </button>
  )
})

export { Toggle }
export type { ToggleProps, ToggleSize }
