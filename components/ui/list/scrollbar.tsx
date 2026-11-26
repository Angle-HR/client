'use client'

import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'

import { SCROLLBAR_LAYOUT } from './scrollbar.figma'

// All values from scrollbar.figma.ts (Figma 3478:17263).

/** The browser's own bar is hidden; scrolling itself stays native. */
const HIDE_NATIVE = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

const MIN_THUMB = 24

interface ScrollbarProps {
  /** The element that scrolls. The scrollbar sits over its parent's right edge, so the parent must be positioned. */
  target: RefObject<HTMLElement | null>
}

/**
 * Figma's scrollbar: a 12px track on the right edge, full height, with a
 * 2px thumb that grows to 4px (and the track fills) on hover or drag.
 */
function Scrollbar({ target }: ScrollbarProps): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false })
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ startY: 0, startScroll: 0 })

  useEffect(() => {
    const el = target.current
    if (!el) return
    function update() {
      const track = trackRef.current
      if (!el || !track) return
      const { scrollTop, scrollHeight, clientHeight } = el
      // The track spans the parent's full height.
      const inner = (track.parentElement?.clientHeight ?? 0) - SCROLLBAR_LAYOUT.paddingY * 2
      if (scrollHeight <= clientHeight + 1 || inner <= 0) {
        setThumb((t) => (t.visible ? { ...t, visible: false } : t))
        return
      }
      const height = Math.max(MIN_THUMB, (inner * clientHeight) / scrollHeight)
      const top =
        SCROLLBAR_LAYOUT.paddingY + ((inner - height) * scrollTop) / (scrollHeight - clientHeight)
      setThumb({ top, height, visible: true })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [target])

  function scrollRatio() {
    const el = target.current
    const track = trackRef.current
    if (!el || !track) return 0
    const travel = track.clientHeight - SCROLLBAR_LAYOUT.paddingY * 2 - thumb.height
    return travel > 0 ? (el.scrollHeight - el.clientHeight) / travel : 0
  }

  function onThumbDown(event: PointerEvent<HTMLDivElement>) {
    const el = target.current
    if (!el) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { startY: event.clientY, startScroll: el.scrollTop }
    setDragging(true)
  }

  function onThumbMove(event: PointerEvent<HTMLDivElement>) {
    const el = target.current
    if (!dragging || !el) return
    el.scrollTo({
      top: drag.current.startScroll + (event.clientY - drag.current.startY) * scrollRatio(),
    })
  }

  function onTrackDown(event: PointerEvent<HTMLDivElement>) {
    const el = target.current
    const track = trackRef.current
    if (!el || !track) return
    const y = event.clientY - track.getBoundingClientRect().top
    el.scrollTo({ top: (y - SCROLLBAR_LAYOUT.paddingY - thumb.height / 2) * scrollRatio() })
  }

  // Hover (or a drag): the track fills and the thumb widens, 100ms ease in;
  // back over 50ms ease in. The thumb keeps its right edge 4px in.
  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      data-scrollbar=""
      data-dragging={dragging || undefined}
      onPointerDown={onTrackDown}
      className={`group/scrollbar absolute inset-y-0 right-0 z-10 w-[12px] transition-colors duration-[50ms] ease-figma-in hover:bg-bg-transparent-light hover:duration-100 data-dragging:bg-bg-transparent-light data-dragging:duration-100 ${thumb.visible ? '' : 'hidden'}`}
    >
      <div
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        style={{ top: thumb.top, height: thumb.height }}
        className="absolute right-[4px] w-[2px] rounded-full bg-text-input-hover transition-[width,background-color] duration-[50ms] ease-figma-in group-hover/scrollbar:w-[4px] group-hover/scrollbar:bg-text-light group-hover/scrollbar:duration-100 group-data-dragging/scrollbar:w-[4px] group-data-dragging/scrollbar:bg-text-light group-data-dragging/scrollbar:duration-100"
      />
    </div>
  )
}

interface ScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

/** A scrolling area with Figma's scrollbar over its right edge. `className` sizes the scrolling area. */
function ScrollContainer({ children, className = '', ...props }: ScrollContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="relative flex min-h-0">
      <div
        ref={ref}
        className={`min-w-0 flex-1 overflow-y-auto ${HIDE_NATIVE} ${className}`}
        {...props}
      >
        {children}
      </div>
      <Scrollbar target={ref} />
    </div>
  )
}

export { HIDE_NATIVE, Scrollbar, ScrollContainer }
export type { ScrollbarProps, ScrollContainerProps }
