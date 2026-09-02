'use client'

import { MailIcon } from '@/components/auth/icons'
import { FlowButton } from '@/components/ui'

interface StepLoginHelpProps {
  onBack: () => void
}

function StepLoginHelp({ onBack }: StepLoginHelpProps) {
  return (
    <div className="flex w-full flex-col gap-[32px]">
      <header className="flex w-full max-w-[360px] flex-col gap-[20px]">
        <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">Get help</h1>
        <p className="text-body-l font-medium leading-21 text-text-secondary">
          If you have trouble accessing your account, email us and we will work with you to restore
          access as soon as possible.
        </p>
      </header>

      <div className="flex flex-col gap-[8px]">
        <FlowButton
          type="button"
          variant="primary"
          size="md"
          className="w-full"
          iconPrefix={
            <span className="inline-flex h-[14px] w-[14px]">
              <MailIcon />
            </span>
          }
          onClick={() => {
            window.location.href = 'mailto:support@openhr.dev'
          }}
        >
          Email Support
        </FlowButton>
        <FlowButton type="button" variant="tertiary" size="md" className="w-full" onClick={onBack}>
          Back to login
        </FlowButton>
      </div>
    </div>
  )
}

export { StepLoginHelp }
