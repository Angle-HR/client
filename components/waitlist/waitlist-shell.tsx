import { WaitlistStep } from '@/lib/types'

import { WaitlistFooter } from './waitlist-footer'
import { WaitlistLogo } from './waitlist-logo'

import type { ReactNode } from 'react'

interface WaitlistShellProps {
  children: ReactNode
  step: WaitlistStep
}

// Page frame from Figma. Background bg/primary (#f7f7f7), padding sm-18 / 20.
// Mobile: logo top-left, body below (52px gap), footer at the bottom.
// Desktop: logo top-centre, body vertically + horizontally centred in a
// max-w-448 column, footer bottom-centre.
function WaitlistShell({ children, step }: WaitlistShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-tertiary px-[20px] py-[18px]">
      <header className="flex shrink-0 md:justify-center">
        <WaitlistLogo />
      </header>
      <main
        className={`mt-[52px] flex flex-1 flex-col gap-8  md:mt-0 ${step === 'success' || step === 'thanks' ? 'justify-center' : 'md:justify-center'}`}
      >
        {children}
      </main>
      <div className="shrink-0">
        <WaitlistFooter step={step} />
      </div>
    </div>
  )
}

export { WaitlistShell }
