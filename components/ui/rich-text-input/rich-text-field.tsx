'use client'

import { forwardRef, useRef, useState, type ReactNode } from 'react'

type RichTextFieldState =
  | 'placeholder'
  | 'hover'
  | 'focus'
  | 'selected'
  | 'filled'
  | 'error'
  | 'disabled'

interface RichTextFieldProps {
  state?: RichTextFieldState
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (html: string) => void
  onBlur?: React.FocusEventHandler<HTMLDivElement>
  showToolbar?: boolean
  showActionButton?: boolean
  actionButton?: ReactNode
  disabled?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  className?: string
}

type Command = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'createLink'

const buttons: { command: Command; label: string; icon: ReactNode }[] = [
  {
    command: 'bold',
    label: 'Bold',
    icon: <span className="text-[11px] font-bold">B</span>,
  },
  {
    command: 'italic',
    label: 'Italic',
    icon: <span className="text-[11px] italic font-serif">I</span>,
  },
  {
    command: 'underline',
    label: 'Underline',
    icon: <span className="text-[11px] underline">U</span>,
  },
  {
    command: 'insertUnorderedList',
    label: 'Bulleted list',
    icon: <span className="text-[11px]">•</span>,
  },
  {
    command: 'createLink',
    label: 'Insert link',
    icon: <span className="text-[11px]">🔗</span>,
  },
]

const RichTextField = forwardRef<HTMLDivElement, RichTextFieldProps>(function RichTextField(
  {
    state,
    value,
    defaultValue = '',
    placeholder,
    onChange,
    onBlur,
    showToolbar = true,
    showActionButton = false,
    actionButton,
    disabled,
    id,
    className = '',
    ...props
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [isEmpty, setIsEmpty] = useState(!(value || defaultValue))
  const isError =
    state === 'error' || props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  function exec(command: Command) {
    if (command === 'createLink') {
      const url = window.prompt('Enter URL')
      if (url) document.execCommand(command, false, url)
    } else {
      document.execCommand(command, false)
    }
    editorRef.current?.focus()
    handleInput()
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? ''
    setIsEmpty(!editorRef.current?.textContent?.trim())
    onChange?.(html)
  }

  const containerClasses = [
    'flex flex-col gap-[12px] w-full border p-[12px] rounded-sm-7 transition-colors',
    isError
      ? 'bg-bg-input-error border-border-input-error'
      : disabled
        ? 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60'
        : 'bg-bg-input-placeholder border-border-input-placeholder hover:border-border-input-hover focus-within:border-border-input-focus focus-within:bg-bg-input-focus',
    className,
  ].join(' ')

  const setRefs = (el: HTMLDivElement | null) => {
    editorRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
  }

  return (
    <div className={containerClasses}>
      {(showToolbar || showActionButton) && (
        <div className="flex items-center justify-between h-[20px]">
          {showToolbar ? (
            <div className="inline-flex items-center gap-[2px]">
              {buttons.map((b) => (
                <button
                  key={b.command}
                  type="button"
                  aria-label={b.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec(b.command)}
                  className="inline-flex h-[20px] w-[20px] items-center justify-center p-[4px] rounded-xs-4 text-text-secondary hover:bg-bg-transparent-light transition-colors"
                >
                  {b.icon}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {showActionButton && (
            <span className="inline-flex items-center gap-[4px] shrink-0">{actionButton}</span>
          )}
        </div>
      )}
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute inset-0 text-body-s text-text-input-placeholder">
            {placeholder}
          </span>
        )}
        <div
          ref={setRefs}
          id={id}
          role="textbox"
          aria-multiline="true"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={onBlur}
          dangerouslySetInnerHTML={{ __html: value ?? defaultValue }}
          className="w-full min-h-[25px] focus:min-h-[269px] bg-transparent text-body-s text-text-input-filled outline-none transition-[min-height]"
          {...props}
        />
      </div>
    </div>
  )
})

export { RichTextField }
export type { RichTextFieldProps, RichTextFieldState }
