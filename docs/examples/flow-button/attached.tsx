'use client'

import { FlowButton } from '@/components/ui/button'

export default function FlowButtonAttached() {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="flex w-full max-w-[360px]">
      <input
        type="email"
        aria-label="Work email"
        placeholder="you@company.com"
        className="h-[32px] min-w-0 flex-1 rounded-l-lg-10 border border-r-0 border-border-transparent-medium bg-bg-secondary px-[10px] text-body-s text-text-primary outline-none placeholder:text-text-tertiary"
      />
      <FlowButton type="submit" variant="primary" position="right">
        Join
      </FlowButton>
    </form>
  )
}
