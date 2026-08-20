import { WaitlistLogo } from '@/components/waitlist/waitlist-logo'

function DashboardPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-bg-secondary px-[24px] pb-[24px] pt-[32px]">
      <header className="flex shrink-0 justify-center">
        <WaitlistLogo />
      </header>
      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-heading-3 font-semibold tracking-wide text-text-primary">DASHBOARD</h1>
      </main>
    </div>
  )
}

export default DashboardPage
