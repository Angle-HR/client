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
        <ChatBubbleLeftRight className="size-[24px]" />
      </button>
    )
  },
)

export { ContactUsButton }
export type { ContactUsButtonProps }
