'use client'

import { useEffect } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { BannerSmall, IconButton } from '@/components/ui'

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
  /** `progress` shows a spinner and stays until it is replaced. */
  kind: 'undoable' | 'done' | 'progress'
  onUndo?: () => void
}

const AUTO_DISMISS_MS = 6000

function JobToast({ toast, onDismiss }: { toast: JobToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.kind === 'progress') return
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
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
      className="absolute right-[10px] bottom-[10px] z-30 flex w-[300px] items-start rounded-lg-10 bg-bg-secondary p-[8px] shadow-[0_4px_8px_#0000000f,0_0_4px_#0000000a] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
    >
      <span className="flex min-w-0 flex-1 items-center gap-[7px] py-[5px] pr-[5px] pl-[3px]">
        {toast.kind === 'progress' ? (
          <span className="inline-flex animate-spin text-text-secondary">
            <DashboardIcon name="spinner-dual-solid" size={15} />
          </span>
        ) : (
          <span className="inline-flex text-green-5">
            <DashboardIcon name="check-circle-solid" size={15} />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate pl-[3px] text-body-s leading-none font-semibold text-text-primary">
          {toast.message}
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
  )
}

export { JobToast }
export type { JobToastState }
