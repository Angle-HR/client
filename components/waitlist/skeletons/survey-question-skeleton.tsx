import { Skeleton } from '@/components/ui'

// Mirrors StepQuestionnaire's layout (header + option rows) so the loading
// state doesn't jump when the real question swaps in.
function SurveyQuestionSkeleton(): React.ReactElement {
  return (
    <div className="mx-auto w-full max-w-[472px]">
      <div className="sm:rounded-lg-12 sm:bg-bg-transparent-lighter sm:p-6 sm:pt-12">
        <div className="flex flex-col items-center gap-28 rounded-sm-7 sm:bg-bg-tertiary sm:px-24 sm:py-32">
          <div className="flex w-full flex-col gap-12">
            <Skeleton className="h-[16px] w-[160px]" />
            <Skeleton className="h-[26px] w-[280px]" />
          </div>
          <div className="flex w-full flex-col gap-[8px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[32px] w-full" />
            ))}
          </div>
          <Skeleton className="h-[32px] w-[120px]" />
        </div>
      </div>
    </div>
  )
}

export { SurveyQuestionSkeleton }
