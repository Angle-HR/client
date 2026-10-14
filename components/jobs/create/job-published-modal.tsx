import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Divider, Modal, ModalActions } from '@/components/ui'

import type { ReactNode } from 'react'

/**
 * "Job published": the job is live, with its link to copy and a LinkedIn post
 * to copy. Figma: 9270:377331 (after publishing), 9270:377394 (after copying).
 */

interface JobPublishedModalProps {
  open: boolean
  jobTitle: string
  /** The job's public link, or null where the app has no address to build it from. */
  url: string | null
  /** Whether the link has been copied; the Copy button then reads "Copied". */
  copied: boolean
  onCopy: () => void
  onDone: () => void
  onViewJob: () => void
  onClose: () => void
}

const rowText = 'min-w-0 flex-1 truncate text-body-s leading-19_5 text-text-secondary'

function JobPublishedModal({
  open,
  jobTitle,
  url,
  copied,
  onCopy,
  onDone,
  onViewJob,
  onClose,
}: JobPublishedModalProps): ReactNode {
  return (
    <Modal open={open} title="Job published" width={500} onClose={onClose}>
      <div className="flex flex-col items-center gap-[12px] pt-[20px] text-center">
        {/* The green check badge, 63px, as drawn in 9270:377376. */}
        <span className="inline-flex size-[63px] items-center justify-center rounded-full bg-[#448039] text-text-inverted">
          <DashboardIcon name="check-solid" size={26} />
        </span>
        <h3 className="pt-[12px] text-body-s leading-[21px] font-semibold text-text-primary">
          {jobTitle}
        </h3>
        <p className="text-body-xs leading-19_2 font-medium text-text-secondary">
          Now on your careers page. Share it or post on LinkedIn.
        </p>
      </div>

      <div className="flex flex-col gap-[6px] rounded-lg-10 bg-bg-transparent-light p-[6px]">
        <div className="flex h-[32px] items-center gap-[8px] pl-[6px]">
          <span className="inline-flex shrink-0 text-text-secondary">
            <DashboardIcon name="link-solid" size={14} />
          </span>
          <span className={rowText}>{url ?? ''}</span>
          <Button
            variant="primary"
            accent="default"
            size="sm"
            disabled={!url}
            iconPrefix={
              <DashboardIcon name={copied ? 'check-solid' : 'clipboard-document-solid'} size={14} />
            }
            onClick={onCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex h-[4px] shrink-0 items-center">
          <Divider />
        </div>
        <div className="flex h-[32px] items-center gap-[8px] pl-[6px]">
          <span className="inline-flex shrink-0 text-text-secondary">
            <DashboardIcon name="linkedln" size={14} />
          </span>
          <span className={rowText}>Formatted job post, ready for LinkedIn</span>
          {/* Inert: the app has no LinkedIn post text to copy yet. */}
          <Button variant="primary" accent="default" size="sm">
            Copy for LinkedIn
          </Button>
        </div>
      </div>

      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onDone}>
          Done
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={onViewJob}>
          View job
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { JobPublishedModal }
