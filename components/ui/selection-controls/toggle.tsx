'use client'

import { forwardRef, useState, type ButtonHTMLAttributes } from 'react'

import { TOGGLE_FOCUS_RING } from './focus'

/** Figma's "size": `sm` is the 16px toggle (22×14), `md` the 20px one (32×20). */
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

// All values from toggle.figma.ts (Figma node 1270:41378).
const trackSize: Record<ToggleSize, string> = {
  sm: 'h-[14px] w-[22px]',
  md: 'h-[20px] w-[32px]',
}

const thumbSize: Record<ToggleSize, { size: string; travel: string }> = {
  sm: { size: 'size-[10px]', travel: 'translate-x-[8px]' },
  md: { size: 'size-[16px]', travel: 'translate-x-[12px]' },
}

// Figma's Hover and Focus states: a 0.5px inside stroke (an inset shadow, so it
// isn't rounded to a whole pixel). Off uses a different token per size.
const hoverFocusStroke = {
  off: {
    sm: 'enabled:hover:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-light)] focus-visible:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-light)]',
    md: 'enabled:hover:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-lighter)] focus-visible:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-lighter)]',
  },
  on: 'enabled:hover:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-medium)] focus-visible:shadow-[inset_0_0_0_0.5px_var(--color-border-transparent-medium)]',
} as const

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

  let state: string
  if (isOn) {
    state = disabled
      ? 'bg-bg-selection-controls-selected opacity-40'
      : `bg-bg-selection-controls-selected ${hoverFocusStroke.on}`
  } else {
    state = disabled
      ? 'bg-bg-transparent-light shadow-[inset_0_0_0_1px_var(--color-border-transparent-lighter)]'
      : `bg-bg-transparent-strong ${hoverFocusStroke.off[size]}`
  }

  const trackClasses = [
    trackSize[size],
    // Figma: toggling is 50ms ease out; the hover stroke has no transition.
    'rounded-[80px] relative inline-flex items-center shrink-0 p-[2px] transition-[background-color] duration-[50ms] ease-figma-out',
    state,
    // Figma State=Focus: the hover stroke plus a blue ring 2px outside (see focus.ts).
    TOGGLE_FOCUS_RING,
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  ].join(' ')

  const thumbClasses = [
    thumbSize[size].size,
    'rounded-full transition-transform duration-[50ms] ease-figma-out',
    !isOn && disabled ? 'bg-bg-transparent-medium' : 'bg-bg-primary',
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
