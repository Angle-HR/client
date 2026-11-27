'use client'

import Image from 'next/image'

import { FlowButton, type FlowButtonProps } from '@/components/ui/button/flow-button'
import { appUrl } from '@/lib/app-url'

interface GetStartedButtonProps {
  size: FlowButtonProps['size']
  tabIndex?: number
  className?: string
}

/** Sends the visitor to the app's sign-up page. The landing site makes no API calls of its own. */
function GetStartedButton({ size, tabIndex, className }: GetStartedButtonProps) {
  return (
    <FlowButton
      variant="primary"
      size={size}
      tabIndex={tabIndex}
      onClick={() => window.location.assign(appUrl('/signup'))}
      className={className}
      iconSuffix={<Image src="/open-hr/icon-arrow-right.svg" alt="" width={11} height={9} />}
    >
      Get started
    </FlowButton>
  )
}

export { GetStartedButton }
