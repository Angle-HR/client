'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { ChatBubbleLeftRight } from '../icons'

interface ContactUsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const ContactUsButton = forwardRef<HTMLButtonElement, ContactUsButtonProps>(
  function ContactUsButton(
    { className = '', type = 'button', 'aria-label': ariaLabel = 'Contact support', ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        className={`inline-flex size-[48px] shrink-0 items-center justify-center rounded-full bg-bg-secondary p-[12px] text-text-tertiary shadow-slots-small transition-colors hover:text-text-secondary ${className}`}
        {...props}
      >
        {/* Figma: the glyph is 21.6 × 19.2px, centred in the 24px icon frame. */}
        <ChatBubbleLeftRight className="h-[19.2px] w-[21.6px]" />
      </button>
    )
  },
)

export { ContactUsButton }
export type { ContactUsButtonProps }
