type FileDropzoneTextState = 'rest' | 'error'

interface FileDropzoneTextProps {
  state?: FileDropzoneTextState
  /** Marketing-website context: recolours the "Attach" action word. */
  live?: boolean
  formats?: string[]
  maxSizeMb?: number
  className?: string
}

function FileDropzoneText({
  state = 'rest',
  live = false,
  formats,
  maxSizeMb,
  className = '',
}: FileDropzoneTextProps) {
  const hint = [formats?.join(', '), maxSizeMb !== undefined ? `Max ${maxSizeMb} MB` : undefined]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`flex flex-col items-center gap-[2px] text-center ${className}`}>
      <p className="text-[12px] leading-[16px]">
        <span
          className={`font-medium text-[13px] ${live ? 'text-btn-blue-secondary' : 'text-btn-blue-tertiary'}`}
        >
          Attach
        </span>{' '}
        <span className={state === 'error' ? 'text-text-error' : 'text-text-secondary'}>
          {state === 'error' ? 'Upload failed. Try again.' : 'or drag and drop here'}
        </span>
      </p>
      {hint && <p className="text-[10px] leading-[14px] text-text-tertiary">{hint}</p>}
    </div>
  )
}

export { FileDropzoneText }
export type { FileDropzoneTextProps, FileDropzoneTextState }
