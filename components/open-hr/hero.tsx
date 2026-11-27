import Image from 'next/image'

import { appUrl } from '@/lib/app-url'

import { GetStartedButton } from './get-started-button'

function Hero() {
  return (
    <section className="relative overflow-hidden px-[20px] md:px-[32px]">
      <Image
        src="/open-hr/hero-bg-mobile.svg"
        alt=""
        width={375}
        height={621}
        aria-hidden
        priority
        className="pointer-events-none absolute inset-x-0 top-[4px] mx-auto w-full max-w-[1116px] opacity-40 md:hidden"
      />
      <Image
        src="/open-hr/hero-bg-desktop.svg"
        alt=""
        width={1116}
        height={621}
        aria-hidden
        priority
        className="pointer-events-none absolute inset-x-0 top-[12px] mx-auto hidden w-full max-w-[1116px] opacity-40 md:block"
      />

      <div className="relative z-10 flex flex-col items-center pt-[97px] pb-[64px] md:pt-[156px] md:pb-[164px]">
        <div className="flex w-full max-w-[461px] flex-col items-center gap-[32px] text-center md:gap-[44px]">
          <div className="flex flex-col items-center gap-[20px] md:gap-[32px]">
            <h1 className="text-[2.5rem] leading-[1.15] font-medium tracking-[-0.4px] text-[color:var(--oh-text-primary)] md:text-[3.375rem] md:leading-[1.2] md:tracking-[-0.55px]">
              Open source HR
              <br />
              Your way
            </h1>
            <p className="text-[0.875rem] leading-[21px] text-[color:var(--oh-text-secondary)] md:text-[0.99375rem] md:leading-[24px]">
              Hire, manage, and grow your team without expensive contracts or lock-in. Built for
              startups and small businesses.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-[12px] md:flex-row md:justify-center">
            <GetStartedButton size="md" />
            <a
              href={appUrl('/login')}
              className="rounded-sm-6 px-[10px] py-[10px] text-[0.8625rem] leading-[21px] text-[color:var(--oh-text-primary)] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
