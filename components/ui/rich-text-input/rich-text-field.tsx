'use client'

import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'

import { MaskIcon } from '../icons/mask-icon'

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

type Command = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList'

// Figma's Text-Editor-Toolbar: five 20px buttons with 12px glyphs, edge to edge.
const buttons: { command: Command; label: string; icon: string }[] = [
  { command: 'bold', label: 'Bold', icon: 'bold-solid' },
  { command: 'italic', label: 'Italic', icon: 'italic-solid' },
  { command: 'underline', label: 'Underline', icon: 'underline-solid' },
  { command: 'insertUnorderedList', label: 'Bulleted list', icon: 'list-bullet-solid' },
  { command: 'insertOrderedList', label: 'Numbered list', icon: 'numbered-list-solid' },
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
  // The markup the editor mounts with, as one object that never changes. React
  // rewrites the editor's HTML whenever this prop is a new object — even with
  // the same markup — which would lose the caret on every keystroke.
  const [initialHtml] = useState(() => ({ __html: value ?? defaultValue }))
  const [typedEmpty, setTypedEmpty] = useState(!(value || defaultValue))
  // A controlled editor is empty when its value has no text, whoever set it.
  const isEmpty = value === undefined ? typedEmpty : !value.replace(/<[^>]*>|&nbsp;/g, '').trim()

  // A value set from outside (a template, an AI draft, a reset) is written
  // into the editor; one that merely echoes what was typed is already there.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || value === undefined || value === editor.innerHTML) return
    editor.innerHTML = value
  }, [value])
  const isError =
    state === 'error' || props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  function exec(command: Command) {
    document.execCommand(command, false)
    editorRef.current?.focus()
    handleInput()
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? ''
    setTypedEmpty(!editorRef.current?.textContent?.trim())
    onChange?.(html)
  }

  const containerClasses = [
    // Figma's 12px inset is measured from the edge, so 11px inside the 1px border.
    'flex flex-col gap-[12px] w-full border p-[11px] rounded-sm-7 transition-colors',
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
            <div className="inline-flex items-center">
              {buttons.map((b) => (
                <button
                  key={b.command}
                  type="button"
                  aria-label={b.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec(b.command)}
                  className="inline-flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-xs-4 p-[4px] text-text-primary transition-colors hover:bg-bg-transparent-light"
                >
                  <MaskIcon src={`/dashboard/icons/${b.icon}.svg`} size={12} />
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
          dangerouslySetInnerHTML={initialHtml}
          // Preflight strips list markers, so the editor puts them back.
          className="w-full min-h-[25px] focus:min-h-[269px] bg-transparent text-body-s leading-19_5 text-text-input-filled outline-none transition-[min-height] [&_ol]:list-decimal [&_ol]:pl-[20px] [&_ul]:list-disc [&_ul]:pl-[20px]"
          {...props}
        />
      </div>
    </div>
  )
})

export { RichTextField }
export type { RichTextFieldProps, RichTextFieldState }
