import Image from 'next/image'

import { GetEarlyAccessButton } from './get-early-access-button'

function FooterCta() {
  return (
    <section className="relative flex justify-center overflow-hidden px-[20px] pt-[100px] md:px-[78px] md:pt-[200px]">
      <Image
        src="/open-hr/footer-bg-mobile.svg"
        alt=""
        width={375}
        height={411}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[100px] mx-auto w-full max-w-[1116px] opacity-40 md:hidden"
      />
      <Image
        src="/open-hr/footer-bg-desktop.svg"
        alt=""
        width={1121}
        height={411}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[200px] mx-auto hidden w-full max-w-[1121px] opacity-40 md:block"
      />
      <div className="relative z-10 flex min-h-[411px] w-full max-w-[416px] flex-col items-center justify-center gap-[40px]">
        <Image src="/open-hr/footer-icon.svg" alt="" width={40} height={40} />
        <div className="flex flex-col items-center gap-[16px]">
          <h2 className="text-center text-[1.625rem] font-medium tracking-[-0.4px] text-[color:var(--oh-text-primary)] md:text-[2rem] md:tracking-[-0.55px]">
            Built for Founders, Startups &amp; Small Businesses
          </h2>
          <GetEarlyAccessButton size="md" />
        </div>
      </div>
    </section>
  )
}

export { FooterCta }
