'use client'

import Link from 'next/link'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button } from '@/components/ui'

/**
 * The top bar of the job creation flow: the step trail on the left, Save as
 * draft and Preview on the right. Figma: main-top-container in 8973:613907.
 *
 * Only "Job details" is designed so far, so the later steps show as upcoming.
 */

const STEPS = ['Job details', 'Application form', 'Permissions', 'Publish'] as const

type JobFlowStep = (typeof STEPS)[number]

interface JobFlowHeaderProps {
  current: JobFlowStep
  onSaveDraft: () => void
}

const stepText = 'text-body-xs leading-19_2'

function JobFlowHeader({ current, onSaveDraft }: JobFlowHeaderProps) {
  const currentIndex = STEPS.indexOf(current)

  return (
    <header className="flex h-[44px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium">
      <nav aria-label="Job creation steps" className="flex items-center pl-[18px]">
        <ol className="flex items-center">
          <li className="flex items-center">
            <Link
              href="/dashboard/jobs"
              className={`${stepText} text-text-primary hover:underline`}
            >
              Jobs
            </Link>
          </li>
          {STEPS.map((step, index) => {
            const reached = index <= currentIndex
            return (
              <li
                key={step}
                aria-current={step === current ? 'step' : undefined}
                className={`flex items-center ${stepText} ${reached ? 'text-text-primary' : 'text-text-tertiary'}`}
              >
                {/* The separator belongs to the step it leads into: a 21px
                    slot, then the step's own 10px lead-in. */}
                <span
                  aria-hidden="true"
                  className={`flex w-[21px] justify-center ${index <= currentIndex ? 'text-text-secondary' : 'text-text-tertiary'}`}
                >
                  ›
                </span>
                <span className="pl-[10px]">{step}</span>
              </li>
            )
          })}
        </ol>
      </nav>
      <div className="flex items-center gap-[10px] p-[10px]">
        <Button variant="primary" accent="default" size="sm" onClick={onSaveDraft}>
          Save as draft
        </Button>
        {/* The preview screen is not designed yet. */}
        <Button
          variant="primary"
          accent="default"
          size="sm"
          disabled
          iconSuffix={<DashboardIcon name="play-circle-semi" size={14} />}
        >
          Preview
        </Button>
      </div>
    </header>
  )
}

export { JobFlowHeader }
export type { JobFlowStep }
