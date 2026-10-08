'use client'

import { useEffect } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { BannerSmall, FlowButton, IconButton } from '@/components/ui'

/**
 * Feedback after an action on jobs. Figma: Banner/small at the top centre for
 * reversible changes ("Job reopened · Undo", 7964:213415), Banner/Large at the
 * bottom right for outcomes that can't be undone ("Jobs permanently deleted",
 * 8941:580588).
 */

interface JobToastState {
  /** Changes on every toast so a repeated message still restarts the timer. */
  id: number
  message: string
  /**
   * `progress` shows a spinner and stays until it is replaced; `error` reports
   * something that was refused; `info` explains why something is not possible yet.
   */
  kind: 'undoable' | 'done' | 'progress' | 'error' | 'info'
  onUndo?: () => void
  /** A second line under the message, for outcomes that need explaining. */
  detail?: string
  /** A follow-up offered under the message, e.g. "Try again". */
  action?: { label: string; onClick: () => void }
}

const AUTO_DISMISS_MS = 6000
// Long enough to read the message and reach for its button.
const ACTION_DISMISS_MS = 12000

function JobToast({ toast, onDismiss }: { toast: JobToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.kind === 'progress') return
    const timer = window.setTimeout(onDismiss, toast.action ? ACTION_DISMISS_MS : AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart per toast, not per render
  }, [toast.id, toast.kind, onDismiss])

  if (toast.kind === 'undoable') {
    return (
      <div role="status" className="absolute top-[9px] left-1/2 z-30 -translate-x-1/2">
        <BannerSmall
          state="info"
          showCloseButton={false}
          withButton={Boolean(toast.onUndo)}
          onUndo={() => {
            toast.onUndo?.()
            onDismiss()
          }}
        >
          {toast.message}
        </BannerSmall>
      </div>
    )
  }

  return (
    <div
      role="status"
      className="absolute right-[10px] bottom-[10px] z-30 flex w-[300px] flex-col rounded-lg-10 bg-bg-secondary p-[8px] shadow-[0_4px_8px_#0000000f,0_0_4px_#0000000a] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
    >
      <div className="flex items-start">
        <span className="flex min-w-0 flex-1 items-start gap-[7px] py-[5px] pr-[5px] pl-[3px]">
          {toast.kind === 'progress' ? (
            <span className="inline-flex animate-spin text-text-secondary">
              <DashboardIcon name="spinner-dual-solid" size={15} />
            </span>
          ) : toast.kind === 'info' ? (
            <span className="inline-flex text-text-banner-info">
              <DashboardIcon name="info-solid" size={15} />
            </span>
          ) : toast.kind === 'error' ? (
            <span className="inline-flex text-red-5">
              <DashboardIcon name="exclamation-triangle-solid" size={15} />
            </span>
          ) : (
            <span className="inline-flex text-green-5">
              <DashboardIcon name="check-circle-solid" size={15} />
            </span>
          )}
          {/* Figma measures these from the text's cap height: a 9px title, 14px
            to the detail, and 6px under it. */}
          <span className="flex min-w-0 flex-1 flex-col gap-[14px] py-[3px] pl-[3px]">
            {/* The 9px box must not clip: `truncate` on it would cut the
                descenders off ("g", "y"), so the clipping sits on an inner
                span with a full line height. */}
            <span className="flex h-[9px] min-w-0 items-center text-body-s font-semibold text-text-primary">
              <span className="truncate leading-19_5">{toast.message}</span>
            </span>
            {toast.detail ? (
              // 240px in the design, which runs it on under the close button.
              <span className="-my-[5px] w-[240px] shrink-0 pb-[6px] text-body-s leading-19_5 text-text-secondary">
                {toast.detail}
              </span>
            ) : null}
          </span>
        </span>
        <IconButton
          variant="tertiary"
          size="sm"
          aria-label="Dismiss"
          onClick={onDismiss}
          icon={
            <span className="inline-flex text-text-tertiary">
              <DashboardIcon name="x-mark-solid" size={14} />
            </span>
          }
        />
      </div>
      {toast.action ? (
        <div className="flex justify-end pr-[8px] pb-[8px]">
          <FlowButton
            variant="secondary"
            size="xs"
            className="h-[24px]! rounded-sm-7!"
            onClick={() => {
              toast.action?.onClick()
            }}
          >
            {toast.action.label}
          </FlowButton>
        </div>
      ) : null}
    </div>
  )
}

export { JobToast }
export type { JobToastState }
