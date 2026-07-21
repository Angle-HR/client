import { WaitlistFooter } from '@/components/waitlist/waitlist-footer'
import { WaitlistLogo } from '@/components/waitlist/waitlist-logo'

import type { ReactNode } from 'react'

const MAIL = 'hello@tryopenhr.com'

function MailLink() {
  return (
    <a href={`mailto:${MAIL}`} className="underline underline-offset-2">
      {MAIL}
    </a>
  )
}

function PageHeading({ children }: { children: ReactNode }) {
  return (
    <h1 className="sm:text-heading-2 text-heading-4 font-semibold leading-49.7 tracking-tight text-text-primary">
      {children}
    </h1>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-subtitle-s font-semibold leading-23 text-text-primary">{children}</h2>
}
function Article({ children }: { children: ReactNode }) {
  return <article className="flex flex-col gap-44">{children}</article>
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-body-xl font-semibold leading-24 text-text-primary">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-body-m leading-21 text-text-secondary">{children}</p>
}

function Lead({ children }: { children: ReactNode }) {
  return <span className="font-bold text-body-m text-text-secondary">{children}</span>
}

function BulletList({
  items,
  heading,
  footer,
}: {
  items: ReactNode[]
  heading?: ReactNode
  footer?: ReactNode
}) {
  return (
    <section>
      {heading && <P>{heading}</P>}
      <ul className="flex flex-col list-disc pl-20 text-body-m leading-21 text-text-secondary">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {footer && <P>{footer}</P>}
    </section>
  )
}

function LineGroup({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-8">
      {lines.map((line, i) => (
        <P key={i}>{line}</P>
      ))}
    </div>
  )
}

function NoGapLineGroup({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="flex flex-col">
      {lines.map((line, i) => (
        <P key={i}>{line}</P>
      ))}
    </div>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: number | string
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-16">
      <SectionTitle>
        {number ? `${number}. ` : ''}
        {title}
      </SectionTitle>
      <div className="flex flex-col gap-16">{children}</div>
    </section>
  )
}

function SubSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col">
      <SubTitle>
        {number} {title}
      </SubTitle>
      <div className="flex flex-col gap-20">{children}</div>
    </div>
  )
}

function LegalPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-tertiary px-20 py-18">
      <header className="flex shrink-0 md:justify-center">
        <WaitlistLogo />
      </header>

      <main className="md:mt-[112px] mt-[64px] flex flex-1 justify-center">
        <div className="flex w-full max-w-174.5 flex-col gap-28">{children}</div>
      </main>

      <div className="mt-13 shrink-0">
        <WaitlistFooter />
      </div>
    </div>
  )
}

export {
  BulletList,
  LegalPageShell,
  Lead,
  LineGroup,
  MailLink,
  NoGapLineGroup,
  P,
  PageHeading,
  Section,
  SectionTitle,
  SubSection,
  SubTitle,
  Article,
}
