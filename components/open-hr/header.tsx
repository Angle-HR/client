import { Logo } from './logo'
import { NavLinks } from './nav-links'

interface HeaderProps {
  basePath?: string
}

function Header({ basePath }: HeaderProps = {}) {
  return (
    <header className="oh-header-scrim relative z-20 flex items-center justify-center px-[20px] py-[24px] md:px-[32px]">
      <div className="flex w-full max-w-[1116px] items-center justify-between">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-[10px] md:flex">
          <NavLinks basePath={basePath} />
        </nav>
      </div>
    </header>
  )
}

export { Header }
