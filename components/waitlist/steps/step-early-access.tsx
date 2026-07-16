'use client'

import { useState } from 'react'

import { Button, RadioButton } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

interface StepEarlyAccessProps {
  defaultEarlyAccess?: boolean
  defaultUserTesting?: boolean
  submitting?: boolean
  errorText?: string
  onSubmit?: (answers: { earlyAccess: boolean; userTesting: boolean }) => void
}

interface YesNoQuestionProps {
  name: string
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

// One row: question text on the left, mutually-exclusive Yes/No radios on the
// right. `name` must be unique per question so each pair toggles independently.
function YesNoQuestion({ name, label, value, onChange }: YesNoQuestionProps) {
  return (
    <li className="flex flex-col w-full gap-28 justify-between px-[6px]">
      <label className="text-subtitle-m font-semibold text-text-primary leading-33.1">
        {label}
      </label>
      <div className="flex  gap-10 flex-col">
        <RadioButton name={name} label="Yes" checked={value} onChange={() => onChange(true)} />
        <RadioButton name={name} label="No" checked={!value} onChange={() => onChange(false)} />
      </div>
    </li>
  )
}

// Final pre-thanks screen: two independent Yes/No questions + Submit. The
// "user testing" answer decides which thank-you variant shows next.
function StepEarlyAccess({
  defaultEarlyAccess = false,
  defaultUserTesting = false,
  submitting = false,
  errorText,
  onSubmit,
}: StepEarlyAccessProps) {
  const [earlyAccess, setEarlyAccess] = useState(defaultEarlyAccess)
  const [userTesting, setUserTesting] = useState(defaultUserTesting)

  return (
    <div className="mx-auto w-fit ">
      {/* Outer ring: black @2% (bg/transparent/lighter) over the page; inner panel is white. */}
      <div className="sm:rounded-lg-12 sm:bg-bg-transparent-lighter sm:p-6 sm:pt-12">
        <div className="flex flex-col items-center gap-12 rounded-sm-7 sm:bg-bg-tertiary sm:px-24 sm:py-32">
          {/* Header */}
          <div className="flex w-full flex-col">
            <h1 className="text-body-l font-medium leading-0 text-text-secondary">
              One last thing.
            </h1>
          </div>

          {/* Options */}
          <ul className="flex w-full flex-col  gap-32">
            <YesNoQuestion
              name="earlyAccess"
              label="Will you like to get early access ?"
              value={earlyAccess}
              onChange={setEarlyAccess}
            />
            <hr className="h-2 opacity-6 bg-black-13" />
            <YesNoQuestion
              name="userTesting"
              label="Can we reach out to you for user testing?"
              value={userTesting}
              onChange={setUserTesting}
            />
          </ul>

          {errorText && (
            <span className="text-body-xs text-text-error" role="alert">
              {errorText}
            </span>
          )}

          {/* Action */}
          <Button
            accent="blue"
            variant="secondary"
            size="md"
            disabled={submitting}
            iconSuffix={<ArrowRightIcon />}
            onClick={() => onSubmit?.({ earlyAccess, userTesting })}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { StepEarlyAccess }
