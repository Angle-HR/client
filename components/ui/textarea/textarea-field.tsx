'use client'

import { forwardRef, useState, type ReactNode, type TextareaHTMLAttributes } from 'react'

type TextareaFieldState =
  | 'placeholder'
  | 'hover'
  | 'focus'
  | 'selected'
  | 'filled'
  | 'error'
  | 'disabled'

interface TextareaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  state?: TextareaFieldState
  showToolbar?: boolean
  showActionButton?: boolean
  actionButton?: ReactNode
  'aria-invalid'?: boolean | 'true' | 'false'
}

type Format = 'bold' | 'italic' | 'underline'

const formatIcons: Record<Format, ReactNode> = {
  bold: (
    <svg className="h-[12px] w-[12px]" viewBox="0 0 12 12" fill="none">
      <path
        d="M3.5 2h3a2 2 0 010 4h-3V2zM3.5 6h3.5a2 2 0 010 4H3.5V6z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  ),
  italic: (
    <svg className="h-[12px] w-[12px]" viewBox="0 0 12 12" fill="none">
      <path
        d="M5 2h4M3 10h4M7.5 2L4.5 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  ),
  underline: (
    <svg className="h-[12px] w-[12px]" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 2v3.5a3 3 0 006 0V2M2.5 10.5h7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  ),
}

function ToolbarButton({
  format,
  active,
  onToggle,
}: {
  format: Format
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={format.charAt(0).toUpperCase() + format.slice(1)}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      className={`inline-flex h-[20px] w-[20px] items-center justify-center p-[4px] rounded-xs-4 transition-colors ${active ? 'bg-bg-transparent-medium text-text-primary' : 'text-text-secondary hover:bg-bg-transparent-light'}`}
    >
      {formatIcons[format]}
    </button>
  )
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  {
    state,
    showToolbar = true,
    showActionButton = false,
    actionButton,
    disabled,
    rows = 4,
    className = '',
    ...props
  },
  ref,
) {
  const [activeFormats, setActiveFormats] = useState<Record<Format, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  })
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

  const toggle = (f: Format) => setActiveFormats((p) => ({ ...p, [f]: !p[f] }))

  return (
    <div className={containerClasses}>
      {(showToolbar || showActionButton) && (
        <div className="flex items-center justify-between h-[20px]">
          {showToolbar ? (
            <div className="inline-flex items-center gap-[2px]">
              <ToolbarButton
                format="bold"
                active={activeFormats.bold}
                onToggle={() => toggle('bold')}
              />
              <ToolbarButton
                format="italic"
                active={activeFormats.italic}
                onToggle={() => toggle('italic')}
              />
              <ToolbarButton
                format="underline"
                active={activeFormats.underline}
                onToggle={() => toggle('underline')}
              />
            </div>
          ) : (
            <span />
          )}
          {showActionButton && (
            <span className="inline-flex items-center gap-[4px] shrink-0">{actionButton}</span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-multiline="true"
        className="w-full min-h-[25px] resize-y bg-transparent text-body-s text-text-input-filled placeholder:text-text-input-placeholder outline-none disabled:text-text-input-disabled"
        {...props}
      />
    </div>
  )
})

export { TextareaField }
export type { TextareaFieldProps, TextareaFieldState }
