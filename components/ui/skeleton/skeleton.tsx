interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse rounded-sm-7 bg-bg-tertiary ${className}`}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
