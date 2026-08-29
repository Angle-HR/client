type StatusTextState = 'neutral' | 'error' | 'success'

interface StatusTextProps {
  state?: StatusTextState
  progress?: number
  onRetry?: () => void
  /** Passed by the parent row so the retry button names the specific file
   * ("Retry upload of Resume.pdf") rather than a bare "Try again". */
  retryLabel?: string
  className?: string
}

const labelText: Record<StatusTextState, string> = {
  neutral: 'Uploading',
  success: 'Uploaded',
  error: 'Upload failed',
}

const labelClasses: Record<StatusTextState, string> = {
  neutral: 'text-text-secondary',
  success: 'text-text-secondary',
  error: 'text-text-error',
}

function StatusText({
  state = 'neutral',
  progress = 0,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}: StatusTextProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))

  return (
    <span className={`inline-flex items-center gap-[2px] text-[10px] leading-[16px] ${className}`}>
      <span aria-hidden="true" className={labelClasses[state]}>
        {labelText[state]}
      </span>
      <span aria-hidden="true" className={labelClasses[state]}>
        ·
      </span>
      {state === 'error' ? (
        <button
          type="button"
          onClick={onRetry}
          aria-label={retryLabel}
          className="cursor-pointer text-text-primary underline"
        >
          Try again
        </button>
      ) : (
        <span aria-hidden="true" className="text-text-primary">
          {clamped}%
        </span>
      )}
    </span>
  )
}

export { StatusText }
export type { StatusTextProps, StatusTextState }
