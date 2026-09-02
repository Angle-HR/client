'use client'

import Link from 'next/link'

import { ArrowRightIcon } from '@/components/auth/icons'
import { FlowButton, TextInput } from '@/components/ui'

interface StepInviteAcceptProps {
  companyName: string
  email: string
  onContinue: () => void
}

function StepInviteAccept({ companyName, email, onContinue }: StepInviteAcceptProps) {
  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
          Join {companyName}
        </h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          You&apos;re joining an existing workspace, just create your account and you&apos;re in.
        </p>
      </header>

      <form
        className="flex w-full flex-col gap-[24px]"
        onSubmit={(event) => {
          event.preventDefault()
          onContinue()
        }}
      >
        <TextInput
          label="Email address"
          type="email"
          size="md"
          value={email}
          readOnly
          disabled
          autoComplete="email"
        />

        <FlowButton
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          iconSuffix={<ArrowRightIcon />}
        >
          Accept invite and continue
        </FlowButton>
      </form>
    </div>
  )
}

function InviteAcceptFooter({
  companyName,
  showGdprDisclaimer = false,
}: {
  companyName: string
  showGdprDisclaimer?: boolean
}) {
  return (
    <div className="flex flex-col gap-[16px] text-body-xs leading-19_2 text-text-secondary">
      {showGdprDisclaimer ? (
        <p>
          {companyName} uses Open HR, as data controller. You can access, correct, or request
          deletion of your personal data at any time, and lodge a complaint with your local
          regulator.
        </p>
      ) : null}
      <div className="flex flex-col gap-[10px]">
        <p className="flex flex-wrap items-center gap-[2px]">
          <span>By clicking Accept invite, you agree to our</span>
          <Link href="/privacy-policy" className="text-text-primary hover:underline">
            privacy policy
          </Link>
        </p>
        <p className="flex flex-wrap items-center gap-[2px]">
          <span>and</span>
          <Link href="/terms" className="text-text-primary hover:underline">
            data processing agreement.
          </Link>
        </p>
      </div>
    </div>
  )
}

export { StepInviteAccept, InviteAcceptFooter }
