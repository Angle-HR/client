'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { IconButton } from '../button/icon-button'
import { MaskIcon } from '../icons/mask-icon'
import { Overlay } from '../sidebar/overlay'

interface ModalProps {
  open: boolean
  title: string
  /** 14px glyph shown before the title. */
  icon?: ReactNode
  onClose: () => void
  children: ReactNode
}

/**
 * A centred dialog: a 400px tinted shell with a 42px title bar, and the content
 * in a white card inset 3px from the shell. Figma: the confirmation and form
 * modals across the job flow (e.g. 7964:213223).
 *
 * Escape and the scrim both close it, focus moves into the dialog on open and
 * returns to whatever opened it on close.
 */
function Modal({ open, title, icon, onClose, children }: ModalProps): ReactNode {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // An open dropdown inside the dialog gets the first Escape.
        if (panelRef.current?.querySelector('[aria-expanded="true"]')) return
        // Stop other Escape handlers (e.g. clearing a selection) from also
        // firing for the same key press.
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <Overlay onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-50 flex w-[400px] max-w-full flex-col rounded-lg-12 bg-bg-primary pb-[3px] outline-none"
      >
        <div className="flex h-[42px] shrink-0 items-center justify-between">
          <h2
            id={titleId}
            className="flex items-center gap-[2px] px-[20px] text-body-s leading-19_5 font-medium text-text-primary"
          >
            {icon}
            {title}
          </h2>
          <span className="flex h-full items-center px-[10px]">
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Close"
              onClick={onClose}
              icon={<MaskIcon src="/dashboard/icons/x-mark-solid.svg" size={14} />}
            />
          </span>
        </div>
        <div className="mx-[3px] flex flex-col gap-[28px] rounded-lg-10 bg-bg-secondary p-[18px]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** The paired Cancel / confirm row every modal ends with. */
function ModalActions({ children }: { children: ReactNode }): ReactNode {
  return <div className="flex items-center gap-[10px] pt-[6px] *:flex-1">{children}</div>
}

export { Modal, ModalActions }
export type { ModalProps }
