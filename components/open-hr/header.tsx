import Link from 'next/link'

import { Logo } from './logo'

function Header() {
  return (
    <header className="oh-header-scrim relative z-20 flex items-center justify-center px-[20px] py-[24px] md:px-[32px]">
      <div className="flex w-full max-w-[1116px] items-center justify-between">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-[10px]">
          <Link
            href="/login"
            className="rounded-sm-6 px-[10px] py-[10px] text-[0.8625rem] leading-[21px] text-[color:var(--oh-text-primary)] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  )
}

export { Header }
