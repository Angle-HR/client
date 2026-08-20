import Link from 'next/link'

import { ChatBubbleLeftRightIcon } from '@/components/auth/icons'
import { WaitlistLogo } from '@/components/waitlist/waitlist-logo'

import type { ReactNode } from 'react'

interface LoginShellProps {
  children: ReactNode
  footer?: ReactNode
  /** Hide contact FAB (e.g. dashboard). */
  hideContact?: boolean
}

function LoginShell({ children, footer, hideContact = false }: LoginShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-bg-secondary px-[24px] pb-[24px] pt-[32px] md:px-[64px]">
      <header className="shrink-0">
        <WaitlistLogo />
      </header>

      {/* Figma Login: form container top = 200px (header 32 + content offset 168). */}
      <main className="flex flex-1 flex-col items-center justify-center py-[48px] md:justify-start md:pt-[168px] md:pb-[80px]">
        <div className="w-full max-w-[408px]">{children}</div>
      </main>

      {footer ? (
        <footer className="mx-auto w-full max-w-[408px] shrink-0 pb-[8px] pt-[16px] text-center">
          {footer}
        </footer>
      ) : null}

      {!hideContact ? <ContactFab /> : null}
    </div>
  )
}

function ContactFab() {
  return (
    <Link
      href="/login/help"
      aria-label="Contact us"
      className="fixed bottom-40 right-40 flex size-[48px] items-center justify-center rounded-full bg-bg-secondary p-[12px] text-text-secondary shadow-sm transition-colors hover:bg-bg-primary hover:text-text-primary"
    >
      <span className="inline-flex size-24">
        <ChatBubbleLeftRightIcon />
      </span>
    </Link>
  )
}

function LoginLegalFooter() {
  return (
    <div className="flex flex-col items-center gap-[10px] text-body-xs leading-19_2 text-text-secondary">
      <p className="flex flex-wrap items-center justify-center gap-[2px]">
        <span>By signing in, you agree to our</span>
        <Link href="/privacy-policy" className="text-text-primary hover:underline">
          privacy policy.
        </Link>
      </p>
      <p className="flex flex-wrap items-center justify-center gap-[2px]">
        <span>and</span>
        <Link href="/terms" className="text-text-primary hover:underline">
          data processing agreement.
        </Link>
      </p>
    </div>
  )
}

export { LoginShell, LoginLegalFooter, ContactFab }
