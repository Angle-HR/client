type ProgressBarState = 'neutral' | 'success' | 'error'

interface ProgressBarProps {
  progress: number
  state?: ProgressBarState
  className?: string
}

const fillClasses: Record<ProgressBarState, string> = {
  neutral: 'bg-bg-progress-bar-info',
  success: 'bg-bg-progress-bar-success',
  error: 'bg-bg-progress-bar-error',
}

function ProgressBar({ progress, state = 'neutral', className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div
      aria-hidden="true"
      // A border here would eat into the 2px box entirely, leaving 0px for
      // the fill's h-full — outline sits outside the box model instead.
      className={`h-[2px] w-full overflow-hidden rounded-full bg-bg-transparent-light outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-lighter ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-200 ease-linear ${fillClasses[state]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { ProgressBar }
export type { ProgressBarProps, ProgressBarState }
