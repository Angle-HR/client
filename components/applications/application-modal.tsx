'use client'

import { useState, type ReactElement } from 'react'

import { Button, Modal } from '@/components/ui'
import { getApiError } from '@/lib/api-error'
import { STATUS_TARGETS, type ApplicationStatus } from '@/lib/applications/api'
import { useChangeApplicationStatus, useReviewApplication } from '@/lib/mutations'
import { useApplication } from '@/lib/queries'
import { requests } from '@/lib/requests'

interface ApplicationModalProps {
  jobId: string
  /** The application to show; the dialog is closed while null. */
  appId: string | null
  onClose: () => void
}

const STATUS_ACTION_LABELS: Record<ApplicationStatus, string> = {
  received: 'Received',
  in_review: 'Move to in review',
  flagged: 'Flagged',
  rejected: 'Reject',
  hired: 'Hire',
  withdrawn: 'Withdraw',
}

/**
 * One application: the answers, the files, and what can be done next. A
 * flagged application is decided (proceed or reject) rather than moved, and
 * only by the person who opened it last.
 */
function ApplicationModal({ jobId, appId, onClose }: ApplicationModalProps): ReactElement | null {
  const application = useApplication(jobId, appId)
  const review = useReviewApplication(jobId)
  const change = useChangeApplicationStatus(jobId)
  const [error, setError] = useState('')

  if (!appId) return null
  const detail = application.data

  function fail(cause: unknown): void {
    setError(getApiError(cause)?.message ?? 'That did not go through. Try again.')
  }

  function decide(decision: 'proceed' | 'reject'): void {
    setError('')
    review.mutate({ appId: appId ?? '', decision }, { onSuccess: onClose, onError: fail })
  }

  function move(status: ApplicationStatus): void {
    setError('')
    change.mutate({ appId: appId ?? '', status }, { onSuccess: onClose, onError: fail })
  }

  async function download(fileId: string): Promise<void> {
    try {
      const link = await requests.getApplicationFileLink(jobId, appId ?? '', fileId)
      if (link.url) window.open(link.url, '_blank', 'noopener')
    } catch (cause) {
      fail(cause)
    }
  }

  const busy = review.isPending || change.isPending

  return (
    <Modal open title={detail?.name || 'Application'} onClose={onClose} width={700}>
      {application.isError ? (
        <p role="alert" className="text-body-s text-text-secondary">
          We couldn&apos;t open this application.
        </p>
      ) : !detail ? null : (
        <div className="flex flex-col gap-[16px]">
          <p className="text-body-s text-text-secondary">
            {detail.email} · {detail.country} · {detail.source}
          </p>
          {detail.statusNote ? (
            <p className="text-body-s text-text-secondary">{detail.statusNote}</p>
          ) : null}

          <dl className="flex flex-col gap-[12px]">
            {detail.answers.map((answer) => (
              <div key={answer.questionId} className="flex flex-col gap-[2px]">
                <dt className="text-caption-m font-medium text-text-tertiary">{answer.label}</dt>
                <dd className="text-body-s text-text-primary">
                  {answer.fileId ? (
                    <button
                      type="button"
                      className="text-text-link underline"
                      onClick={() => void download(answer.fileId ?? '')}
                    >
                      Download
                    </button>
                  ) : (
                    answer.text || '—'
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {error ? (
            <p role="alert" className="text-body-s text-text-secondary">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-[8px]">
            {detail.status === 'flagged' && detail.canDecide ? (
              <>
                <Button
                  type="button"
                  variant="primary"
                  accent="blue"
                  size="md"
                  disabled={busy}
                  onClick={() => decide('proceed')}
                >
                  Proceed to review
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  accent="red"
                  size="md"
                  disabled={busy}
                  onClick={() => decide('reject')}
                >
                  Reject
                </Button>
              </>
            ) : (
              STATUS_TARGETS[detail.status].map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={
                    status === 'rejected' || status === 'withdrawn' ? 'secondary' : 'primary'
                  }
                  accent={status === 'rejected' ? 'red' : 'blue'}
                  size="md"
                  disabled={busy}
                  onClick={() => move(status)}
                >
                  {STATUS_ACTION_LABELS[status]}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

export { ApplicationModal }
export type { ApplicationModalProps }
