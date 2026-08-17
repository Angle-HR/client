'use client'

import { sendGAEvent } from '@next/third-parties/google'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'

import { FlowButton } from '@/components/ui/button/flow-button'
import { Input } from '@/components/ui/input/input'
import { applyApiError } from '@/lib/api-error'
import { useJoinWaitlist } from '@/lib/mutations'

import { SCROLL_FLAG, scrollToHeroForm } from './scroll-to-hero-form'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_EMAIL_MESSAGE = 'Enter a valid email address.'

function Hero() {
  const router = useRouter()
  const joinWaitlist = useJoinWaitlist()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  // Latched once the join succeeds, and never cleared — keeps the form disabled
  // through the route transition so it can't be submitted twice.
  const [joined, setJoined] = useState(false)

  const pending = joinWaitlist.isPending || joined

  // Set by useGoToHeroForm() when "Get early access" is clicked from a page
  // that doesn't have this form (Privacy Policy, Terms & Conditions) — it
  // navigates here first, then this finishes the scroll+focus once mounted.
  useEffect(() => {
    if (!sessionStorage.getItem(SCROLL_FLAG)) return
    sessionStorage.removeItem(SCROLL_FLAG)
    scrollToHeroForm()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setError(INVALID_EMAIL_MESSAGE)
      return
    }

    setError(undefined)
    try {
      await joinWaitlist.mutateAsync({ email: value })
      // No token comes back from the join — the survey link in the confirmation
      // email carries it as `?token=`, and that's the only way into /survey.
      sendGAEvent('event', 'waitlist_signup', { method: 'landing_hero' })
      setJoined(true)
      router.push('/success')
    } catch (err) {
      // A known API code (e.g. CONFLICT for an email already on the list) comes
      // back as the server's own message; anything else uses the fallback.
      setError(applyApiError(err))
    }
  }

  // The email field is the only (and therefore last) control in this form,
  // so Enter submits immediately rather than waiting on native implicit
  // submission — keeps behavior identical across desktop and the mobile
  // keyboard's "Go" key, and skips IME composition keystrokes.
  function handleEnterSubmit(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

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

          <div className="flex w-full flex-col gap-[8px]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex w-full flex-col gap-[8px] md:flex-row md:gap-0"
            >
              <label className="flex-1 cursor-pointer">
                <Input
                  id="hero-email"
                  type="email"
                  size="lg"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError(undefined)
                  }}
                  onKeyDown={handleEnterSubmit}
                  autoFocus
                  disabled={pending}
                  aria-label="Email address"
                  aria-invalid={Boolean(error)}
                  prefixIcon={<Image src="/open-hr/icon-mail.svg" alt="" width={13} height={10} />}
                  className="md:rounded-tr-none! md:rounded-br-none! md:border-r-0"
                />
              </label>
              <FlowButton
                type="submit"
                variant="primary"
                size="md"
                disabled={pending}
                className="w-full md:w-auto md:rounded-tl-none! md:rounded-bl-none!"
                iconSuffix={
                  <Image src="/open-hr/icon-arrow-right.svg" alt="" width={11} height={9} />
                }
              >
                {joinWaitlist.isPending ? 'Joining...' : 'Get early access'}
              </FlowButton>
            </form>
            {/* Always rendered (space reserved via leading-[19.2px]) so
                showing/hiding the message never shifts the product preview
                below. Holds the last error — client-side validation or the
                API's own message — and is hidden, not emptied, when there
                is none. */}
            <p
              className={`text-[0.8125rem] leading-[19.2px] text-[#e5484d] ${error ? 'visible' : 'invisible'}`}
              aria-live="polite"
            >
              {error ?? INVALID_EMAIL_MESSAGE}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
