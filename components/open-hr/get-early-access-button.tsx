'use client'

import Image from 'next/image'

import { FlowButton, type FlowButtonProps } from '@/components/ui/button/flow-button'

import { scrollToHeroForm } from './scroll-to-hero-form'

interface GetEarlyAccessButtonProps {
  size: FlowButtonProps['size']
  tabIndex?: number
  className?: string
}

// The sticky nav (mobile + desktop) and the footer CTA all point back at the
// same hero email field — this was the same FlowButton + icon + onClick
// repeated three times. The hero's own submit button stays separate since
// it's structurally different (type="submit", no onClick, joined-pill
// corner rounding).
function GetEarlyAccessButton({ size, tabIndex, className }: GetEarlyAccessButtonProps) {
  return (
    <FlowButton
      variant="primary"
      size={size}
      tabIndex={tabIndex}
      onClick={scrollToHeroForm}
      className={className}
      iconSuffix={<Image src="/open-hr/icon-arrow-right.svg" alt="" width={11} height={9} />}
    >
      Get early access
    </FlowButton>
  )
}

export { GetEarlyAccessButton }
