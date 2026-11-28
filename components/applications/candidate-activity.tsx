'use client'

import { type ReactElement } from 'react'

import { formatDateTime } from '@/components/applications/candidate-overview'
import { Button } from '@/components/ui'
import { describeActivity, visibleActivity } from '@/lib/applications/pipeline'
import { useApplicationActivity } from '@/lib/queries'

interface CandidateActivityProps {
  jobId: string
  appId: string
}

function sentence(actor: string, text: string): string {
  if (actor) return `${actor} ${text}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** The timeline of an application, newest first. */
function CandidateActivity({ jobId, appId }: CandidateActivityProps): ReactElement {
  const activity = useApplicationActivity(jobId, appId)
  const items = visibleActivity((activity.data?.pages ?? []).flatMap((page) => page.items))

  if (activity.isError) {
    return (
      <p role="alert" className="text-body-s text-text-secondary">
        We couldn&apos;t load the activity.
      </p>
    )
  }
  if (activity.data && items.length === 0) {
    return <p className="text-body-s text-text-secondary">Nothing has happened yet.</p>
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <ol className="flex flex-col gap-[14px]">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-[10px]">
            <span
              aria-hidden="true"
              className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-border-transparent-medium"
            />
            <div className="flex min-w-0 flex-col gap-[2px]">
              <p className="text-body-s leading-19_5 text-text-primary">
                {sentence(item.actorName, describeActivity(item))}
              </p>
              <p className="text-caption-m leading-17_6 text-text-secondary">
                {formatDateTime(item.at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {activity.hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          loading={activity.isFetchingNextPage}
          onClick={() => void activity.fetchNextPage()}
        >
          Load more
        </Button>
      ) : null}
    </div>
  )
}

export { CandidateActivity }
export type { CandidateActivityProps }
