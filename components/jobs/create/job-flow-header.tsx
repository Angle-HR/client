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
  /**
   * `create` is a new job; `edit-job` is an existing one, where the draft
   * button becomes "Save Changes"; `edit-template` drops the later steps and
   * starts the trail at Job Templates.
   */
  mode: 'create' | 'edit-job' | 'edit-template'
  onSave: () => void
}

const stepText = 'text-body-xs leading-19_2'

function JobFlowHeader({ current, mode, onSave }: JobFlowHeaderProps) {
  const steps = mode === 'edit-template' ? STEPS.slice(0, 1) : STEPS
  const currentIndex = steps.indexOf(current)
  const root =
    mode === 'edit-template'
      ? { label: 'Job Templates', href: '/dashboard/jobs?tab=templates' }
      : { label: 'Jobs', href: '/dashboard/jobs' }

  return (
    <header className="flex h-[44px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium">
      <nav aria-label="Job creation steps" className="flex items-center pl-[18px]">
        <ol className="flex items-center">
          <li className="flex items-center">
            <Link href={root.href} className={`${stepText} text-text-primary hover:underline`}>
              {root.label}
            </Link>
          </li>
          {steps.map((step, index) => {
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
                  className={`flex w-[21px] justify-center ${reached ? 'text-text-secondary' : 'text-text-tertiary'}`}
                >
                  ›
                </span>
                <span className="pl-[10px]">{step}</span>
              </li>
            )
          })}
          {/* The template trail ends on a separator in the design, with no
              step after it. */}
          {mode === 'edit-template' ? (
            <li aria-hidden="true" className={`flex items-center ${stepText} text-text-secondary`}>
              <span className="flex w-[21px] justify-center">›</span>
            </li>
          ) : null}
        </ol>
      </nav>
      <div className="flex items-center gap-[10px] p-[10px]">
        <Button variant="primary" accent="default" size="sm" onClick={onSave}>
          {mode === 'create' ? 'Save as draft' : 'Save Changes'}
        </Button>
        {/* Drawn at rest in the design, with no preview screen behind it yet:
            the button is here and leads nowhere until that screen exists. */}
        <Button
          variant="primary"
          accent="default"
          size="sm"
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
