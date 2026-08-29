'use client'

import { IconButton } from '../button/icon-button'
import { XMark } from '../icons'

import { type FileFormat, FileTypeItem } from './file-type-item'
import { ProgressBar, type ProgressBarState } from './progress-bar'
import { StatusText, type StatusTextState } from './status-text'

type FileUploadedItemState = 'loading' | 'success' | 'error' | 'completed'

interface FileUploadedItemProps {
  fileName: string
  fileType: FileFormat
  state?: FileUploadedItemState
  progress?: number
  wrapped?: boolean
  onRemove?: () => void
  onRetry?: () => void
  className?: string
}

const statusStateFor: Record<Exclude<FileUploadedItemState, 'completed'>, StatusTextState> = {
  loading: 'neutral',
  success: 'success',
  error: 'error',
}

const progressStateFor: Record<Exclude<FileUploadedItemState, 'completed'>, ProgressBarState> = {
  loading: 'neutral',
  success: 'success',
  error: 'error',
}

function FileUploadedItem({
  fileName,
  fileType,
  state = 'loading',
  progress = 0,
  wrapped = false,
  onRemove,
  onRetry,
  className = '',
}: FileUploadedItemProps) {
  const showProgress = state !== 'completed'
  const displayProgress = state === 'success' ? 100 : progress
  // Same conflict class as Slots' position bug: Tailwind's cascade order (not
  // class-attribute order) decides the winner when both `w-full` and a
  // caller-supplied width utility are present, so the default must be
  // omitted rather than relying on override-by-appending.
  const needsOwnWidth = !/\bw-/.test(className)

  return (
    <div
      role="listitem"
      aria-label={fileName}
      className={`flex ${needsOwnWidth ? 'w-full ' : ''}flex-col gap-[6px] rounded-lg-12 ${
        wrapped && showProgress
          ? 'border-[0.5px] border-border-transparent-medium bg-bg-secondary p-[12px]'
          : ''
      } ${className}`}
    >
      <div className="flex w-full items-center gap-[8px]">
        {/* Figma's actual row icon is a bare glyph on a neutral square, not
            the full File Type Item card the Outline doc says is reused here
            — approximated with the shared tile asset at a smaller footprint
            rather than re-exporting six bare-glyph variants for this
            decorative row icon. Flagging the Figma/Outline mismatch. */}
        <FileTypeItem type={fileType} className="h-[32px] w-[23px] shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p
            className={`text-[13px] leading-[19.5px] font-medium text-text-secondary ${
              wrapped ? 'break-words' : 'truncate'
            }`}
          >
            {fileName}
          </p>
          {showProgress && (
            <StatusText
              state={statusStateFor[state]}
              progress={displayProgress}
              onRetry={onRetry}
              retryLabel={`Retry upload of ${fileName}`}
            />
          )}
        </div>
        <IconButton
          variant="tertiary"
          size="sm"
          icon={<XMark />}
          aria-label={`Remove ${fileName}`}
          onClick={onRemove}
        />
      </div>
      {showProgress && (
        <div
          role="progressbar"
          aria-label={`${fileName} upload progress`}
          aria-valuenow={Math.round(displayProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className={wrapped ? '' : 'pr-[30px]'}
        >
          <ProgressBar progress={displayProgress} state={progressStateFor[state]} />
        </div>
      )}
    </div>
  )
}

export { FileUploadedItem }
export type { FileUploadedItemProps, FileUploadedItemState }
