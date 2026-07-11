'use client'

import { useState } from 'react'

import { Button, ListItemMultiSelect } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

interface StepEarlyAccessProps {
  onSubmit?: (answers: { earlyAccess: boolean; userTesting: boolean }) => void
}

// Final pre-thanks screen: two independent opt-in checkboxes + Submit. The
// "user testing" answer decides which thank-you variant shows next.
function StepEarlyAccess({ onSubmit }: StepEarlyAccessProps) {
  const [earlyAccess, setEarlyAccess] = useState(false)
  const [userTesting, setUserTesting] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[472px]">
      {/* Outer ring: black @2% (bg/transparent/lighter) over the page; inner panel is white. */}
      <div className="sm:rounded-lg-12 sm:bg-bg-transparent-lighter sm:p-6 sm:pt-12">
        <div className="flex flex-col items-center gap-28 rounded-sm-7 sm:bg-bg-tertiary sm:px-24 sm:py-32">
          {/* Header */}
          <div className="flex w-full flex-col gap-12">
            <h1 className="text-heading-5 font-semibold leading-33.1 text-text-primary">
              One last thing.
            </h1>
          </div>

          {/* Options */}
          <ul className="flex w-full flex-col">
            <ListItemMultiSelect
              mainText="Will you like to get early access ?"
              withIcon={false}
              selected={earlyAccess}
              onChange={() => setEarlyAccess((v) => !v)}
            />
            <ListItemMultiSelect
              mainText="Can we reach out to you for user testing?"
              withIcon={false}
              selected={userTesting}
              onChange={() => setUserTesting((v) => !v)}
            />
          </ul>

          {/* Action */}
          <Button
            accent="blue"
            variant="secondary"
            size="md"
            iconSuffix={<ArrowRightIcon />}
            onClick={() => onSubmit?.({ earlyAccess, userTesting })}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export { StepEarlyAccess }
