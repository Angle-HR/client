'use client'

import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react'

type CodeFieldState =
  | 'placeholder'
  | 'hover'
  | 'focus'
  | 'selected'
  | 'filled'
  | 'error'
  | 'disabled'

interface CodeFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  state?: CodeFieldState
  language?: string
  showActionButtons?: boolean
  primaryActionButton?: ReactNode
  showSecondaryAction?: boolean
  secondaryActionButton?: ReactNode
  'aria-invalid'?: boolean | 'true' | 'false'
}

const CodeField = forwardRef<HTMLTextAreaElement, CodeFieldProps>(function CodeField(
  {
    state,
    language,
    showActionButtons = true,
    primaryActionButton,
    showSecondaryAction = false,
    secondaryActionButton,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  const isError =
    state === 'error' || props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  const containerClasses = [
    'flex flex-col gap-[12px] w-full border p-[12px] rounded-sm-7 transition-colors',
    isError
      ? 'bg-bg-input-error border-border-input-error'
      : disabled
        ? 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60'
        : 'bg-bg-input-placeholder border-border-input-placeholder hover:border-border-input-hover focus-within:border-border-input-focus focus-within:bg-bg-input-focus',
    className,
  ].join(' ')

  return (
    <div className={containerClasses} data-language={language}>
      {showActionButtons &&
        (primaryActionButton || (showSecondaryAction && secondaryActionButton)) && (
          <div className="flex items-center justify-end gap-[8px] shrink-0">
            {showSecondaryAction && secondaryActionButton}
            {primaryActionButton}
          </div>
        )}
      <textarea
        ref={ref}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-multiline="true"
        // Collapsed at 25px; expands to a tall editing height on focus.
        className="w-full min-h-[25px] focus:min-h-[232px] resize-y bg-transparent font-mono text-body-s text-text-input-json-txt-black placeholder:text-text-input-placeholder outline-none transition-[min-height] disabled:text-text-input-disabled"
        {...props}
      />
    </div>
  )
})

export { CodeField }
export type { CodeFieldProps, CodeFieldState }
