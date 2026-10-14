import { DashboardIcon } from '@/components/dashboard/nav-config'
import { ComplianceStatus } from '@/components/jobs/create/compliance-status'
import { Button, Divider, TextButton, Toggle } from '@/components/ui'

import type { ComplianceView } from '@/lib/jobs/publish-step'
import type { ReactNode } from 'react'

/**
 * The body of the Publish step: the compliance check, the publishing settings
 * and the two publish buttons. Figma: "Publish Job" 9270:377288.
 *
 * The page owns the data, the publish call and the modal; this draws the
 * sections and reports what was chosen.
 */

interface PublishStepProps {
  backHref: string
  /** Null until the check has loaded. */
  view: ComplianceView | null
  /** Both publish buttons are off while a publish is in flight or can't publish yet. */
  publishDisabled: boolean
  indexing: boolean
  onIndexingChange: (indexing: boolean) => void
  autoPublish: boolean
  onAutoPublishChange: (autoPublish: boolean) => void
  /** Both buttons publish; the API has one publish call. */
  onPublish: () => void
}

const sectionLabel = 'text-caption-s leading-none font-semibold text-text-secondary'
const sectionText = 'text-body-xs leading-19_2 text-text-tertiary'
const rowText = 'min-w-0 truncate text-body-s leading-19_5 text-text-secondary'

function PublishStep({
  backHref,
  view,
  publishDisabled,
  indexing,
  onIndexingChange,
  autoPublish,
  onAutoPublishChange,
  onPublish,
}: PublishStepProps): ReactNode {
  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex h-[24px] items-center">
        <TextButton
          size="md"
          className="text-text-primary!"
          iconLeft={<DashboardIcon name="chevron-left-solid" size={11} />}
          href={backHref}
        >
          Back
        </TextButton>
      </div>

      <div className="flex flex-col gap-[16px]">
        <h1 className="-my-[9px] text-[21.1px] leading-[33.1px] font-semibold text-text-primary">
          Publish Job
        </h1>
        <p className="-my-[5px] text-body-xs leading-19_2 font-medium text-text-secondary">
          Review settings, then make this job live.
        </p>
      </div>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <section className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[10px]">
          <h2 className={sectionLabel}>COMPLIANCE CHECK</h2>
          <p className={sectionText}>
            Automated check for common hiring issues. It can miss things, so give the job a final
            read.
          </p>
        </div>
        {view ? <ComplianceStatus state={view.state} bullets={view.bullets} /> : null}
      </section>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <section className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[10px]">
          <h2 className={sectionLabel}>PUBLISHING SETTINGS</h2>
          <p className={sectionText}>Choose where applicants can find this job.</p>
        </div>
        <div className="flex flex-col gap-[2px]">
          {/* Local choices only: the API has no field for either setting yet. */}
          <div className="flex h-[32px] items-center justify-between gap-[10px]">
            <div className="flex min-w-0 items-center gap-[10px]">
              <span className="inline-flex shrink-0 text-text-tertiary">
                {/* The design's "search, index" glyph; no library file of that name, so this is the nearest. */}
                <DashboardIcon name="magnifying-glass-outline" size={14} />
              </span>
              <span className={rowText}>Allow indexing by search engines</span>
            </div>
            <Toggle
              size="sm"
              toggled={indexing}
              onChange={onIndexingChange}
              aria-label="Allow indexing by search engines"
            />
          </div>
          <div className="flex h-[32px] items-center justify-between gap-[10px]">
            <div className="flex min-w-0 items-center gap-[10px]">
              <span className="inline-flex shrink-0 text-text-tertiary">
                <DashboardIcon name="megaphone-outline" size={14} />
              </span>
              <span className={rowText}>Auto publish to Indeed and other integrated platforms</span>
            </div>
            <Toggle
              size="sm"
              toggled={autoPublish}
              onChange={onAutoPublishChange}
              aria-label="Auto publish to Indeed and other integrated platforms"
            />
          </div>
        </div>
      </section>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <div className="flex items-center gap-[12px]">
        <Button
          variant="secondary"
          accent="blue"
          size="md"
          disabled={publishDisabled}
          // 9270:377457 draws both disabled buttons at 24% opacity.
          className="disabled:opacity-[0.24]!"
          onClick={onPublish}
        >
          Publish (Careers page only)
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={publishDisabled}
          // 9270:377457 draws both disabled buttons at 24% opacity.
          className="disabled:opacity-[0.24]!"
          onClick={onPublish}
        >
          Publish job
        </Button>
      </div>
    </div>
  )
}

export { PublishStep }
