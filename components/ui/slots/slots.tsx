'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type SlotsBackground = 'neutral' | 'light'
type SlotsShadow = 'xsmall' | 'small' | 'medium'
type SlotsPadding = 'default' | 'tight'

interface SlotsProps {
  children: ReactNode
  background?: SlotsBackground
  shadow?: SlotsShadow
  padding?: SlotsPadding
  /** Shows top/bottom fade hints when the slot's content overflows and is scrolled. */
  scrollable?: boolean
  className?: string
}

const bgClasses: Record<SlotsBackground, string> = {
  neutral: 'bg-bg-secondary',
  light: 'bg-bg-light',
}

const fadeFromClasses: Record<SlotsBackground, string> = {
  neutral: 'from-bg-secondary',
  light: 'from-bg-light',
}

const shadowClasses: Record<SlotsShadow, string> = {
  xsmall: 'shadow-slots-xsmall',
  small: 'shadow-slots-small',
  medium: 'shadow-md',
}

const paddingClasses: Record<SlotsPadding, string> = {
  default: 'px-[8px] py-[4px]',
  tight: 'p-[4px]',
}

function Slots({
  children,
  background = 'neutral',
  shadow = 'medium',
  padding = 'default',
  scrollable = false,
  className = '',
}: SlotsProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(true)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    if (!scrollable) return
    const el = contentRef.current
    if (!el) return

    function update() {
      if (!el) return
      setOverflowing(el.scrollHeight > el.clientHeight + 1)
      setAtTop(el.scrollTop <= 0)
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
    }

    update()
    el.addEventListener('scroll', update)
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [scrollable])

  // Figma pairs a lighter hairline border with Light + tight padding only;
  // every other combination (including all of neutral) uses border/light.
  const border =
    background === 'light' && padding === 'tight'
      ? 'border-border-transparent-medium'
      : 'border-border-light'

  // Only one position utility may ever be present at once. Tailwind's
  // cascade order (not class-attribute order) decides which wins when two
  // conflicting utilities are both present, so naively appending a
  // caller-supplied `absolute` after this component's own `relative` does
  // NOT override it — both end up in the stylesheet and `relative` wins
  // regardless of where it appears in the string. Any non-static position
  // still gives the fade-hint children a containing block, so this is safe.
  const needsOwnPositioning = !/\b(absolute|fixed|sticky|static)\b/.test(className)

  return (
    <div
      className={`${needsOwnPositioning ? 'relative ' : ''}flex overflow-clip rounded-lg-10 border-[0.5px] ${border} ${bgClasses[background]} ${shadowClasses[shadow]} ${className}`}
    >
      <div
        ref={contentRef}
        className={`min-w-0 flex-1 ${paddingClasses[padding]} ${scrollable ? 'overflow-y-auto' : 'flex flex-col'}`}
      >
        {children}
      </div>
      {scrollable && overflowing && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[16px] bg-gradient-to-b transition-opacity duration-120 ease-out ${fadeFromClasses[background]} to-transparent ${atTop ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      {scrollable && overflowing && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[16px] bg-gradient-to-t transition-opacity duration-120 ease-out ${fadeFromClasses[background]} to-transparent ${atBottom ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  )
}

export { Slots }
export type { SlotsProps, SlotsBackground, SlotsShadow, SlotsPadding }
