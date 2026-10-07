'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * A popover fixed to the viewport and portalled to the body. The jobs page's
 * triggers sit inside scroll containers that would clip an absolutely
 * positioned popover, so every menu and picker on the page goes through this.
 *
 * It closes on Escape, on a press outside, and on resize; arrow keys move
 * between any `[role="menuitem"]` or `[role="option"]` inside it.
 */

interface AnchorRect {
  top: number
  left: number
  right: number
  bottom: number
}

interface FloatingProps {
  anchor: AnchorRect
  /** Given the popover's measured size, where its top-left corner goes. */
  place: (size: { width: number; height: number }) => { top: number; left: number }
  className: string
  onClose: () => void
  children: ReactNode
  /** Focus the first item on open. Off for popovers that own a text field. */
  focusFirstItem?: boolean
}

const ITEMS = '[role="menuitem"], [role="option"], [role="menuitemcheckbox"]'

function toAnchor(rect: DOMRect): AnchorRect {
  return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom }
}

/** Keeps a popover's left edge inside the window with an 8px margin. */
function clampLeft(left: number, width: number): number {
  return Math.max(8, Math.min(left, window.innerWidth - width - 8))
}

function Floating({
  anchor,
  place,
  className,
  onClose,
  children,
  focusFirstItem = true,
}: FloatingProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  // Measured before paint so the popover never flashes in the wrong place.
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setPosition(place({ width: element.offsetWidth, height: element.offsetHeight }))
    if (focusFirstItem) element.querySelector<HTMLElement>(ITEMS)?.focus({ preventScroll: true })
    // `place` is recreated every render; the anchor is what actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor.top, anchor.left, anchor.right, anchor.bottom])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const items = [...(ref.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])]
      if (items.length === 0) return
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = event.key === 'ArrowDown' ? index + 1 : index - 1
      event.preventDefault()
      items[(next + items.length) % items.length]?.focus()
    }
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={ref}
      style={position ?? { top: 0, left: 0, visibility: 'hidden' }}
      className={`fixed z-50 flex flex-col bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium ${className}`}
    >
      {children}
    </div>,
    document.body,
  )
}

export { Floating, clampLeft, toAnchor }
export type { AnchorRect, FloatingProps }
