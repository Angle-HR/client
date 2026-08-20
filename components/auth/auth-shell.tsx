import { WaitlistLogo } from '@/components/waitlist/waitlist-logo'

import type { ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
  footer?: ReactNode
  /** Full-bleed centered loading state (no split panel). */
  variant?: 'split' | 'centered'
}

// Auth chrome from Figma desktop frames (1440):
// - Left form column ≈ 726/1440 (50.42%)
// - Right panel column ≈ 714/1440 (49.58%), with 14px inset on top/right/bottom
// Both columns scale with the viewport — no max-width cap.
function AuthShell({ children, footer, variant = 'split' }: AuthShellProps) {
  if (variant === 'centered') {
    return (
      <div className="flex min-h-dvh flex-col bg-bg-secondary px-[24px] pb-[24px] pt-[32px]">
        <header className="flex shrink-0 justify-center">
          <WaitlistLogo />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh w-full bg-bg-secondary">
      <div className="flex min-h-dvh min-w-0 w-full flex-col px-[24px] pb-[24px] pt-[32px] md:px-[64px] lg:w-[calc(726/1440*100%)]">
        <header className="shrink-0">
          <WaitlistLogo />
        </header>

        <main className="flex flex-1 flex-col justify-center py-[48px] lg:justify-start lg:pt-[168px] lg:pb-[80px]">
          <div className="w-full max-w-[408px]">{children}</div>
        </main>

        {footer ? (
          <footer className="mt-auto w-full max-w-[408px] shrink-0 pb-[8px] pt-[24px] lg:pb-[40px]">
            {footer}
          </footer>
        ) : null}
      </div>

      <div className="hidden min-h-dvh lg:block lg:w-[calc(714/1440*100%)] lg:shrink-0 lg:p-[14px] lg:pl-0">
        <aside aria-hidden="true" className="h-full w-full rounded-lg-12 bg-bg-primary" />
      </div>
    </div>
  )
}

export { AuthShell }
