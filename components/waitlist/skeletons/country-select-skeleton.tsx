import { Skeleton } from '@/components/ui'

function CountrySelectSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[6px]">
      <Skeleton className="h-[9px] w-[100px]" />
      <Skeleton className="h-[32px] w-full" />
    </div>
  )
}

export { CountrySelectSkeleton }
