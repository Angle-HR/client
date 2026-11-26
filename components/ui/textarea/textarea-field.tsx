'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type CSSProperties,
  type FocusEventHandler,
  type PointerEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

import { MaskIcon } from '../icons/mask-icon'
import { HIDE_NATIVE, Scrollbar } from '../list/scrollbar'

import { TEXTAREA_LAYOUT, TEXTAREA_TOOLBAR, type TextareaState } from './textarea.figma'

type TextareaFieldState = TextareaState
type TextFormat = (typeof TEXTAREA_TOOLBAR.items)[number]['format']

interface TextareaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Pins a Figma state (for docs and tests). Normally the field follows hover, focus and its text. */
  state?: TextareaFieldState
  /**
   * Figma's 📝 Show tool bar: Bold, Italic, Underline, Bulleted and Numbered
   * list. With it on, the field is a rich-text editor and its value is HTML.
   */
  showToolbar?: boolean
  /** The text as it changes: plain text, or HTML when the toolbar is on. */
  onValueChange?: (value: string) => void
  /** Figma's ✨ show-sec_actions: a button pinned to the top right (Tertiary, Blue, 24px). */
  action?: ReactNode
  'aria-invalid'?: boolean | 'true' | 'false'
}

// All values from textarea.figma.ts (Figma 946:25327).
// Empty fields hover (ease in); focus turns the field blue (ease out). Error
// and disabled are fixed.
const FOCUS =
  'has-[:focus]:bg-bg-input-focus! has-[:focus]:border-border-input-focus! has-[:focus]:ease-figma-out!'
const FIELD_STATES = {
  empty: `bg-bg-input-placeholder border-border-input-placeholder hover:bg-bg-input-hover hover:border-border-input-hover hover:ease-figma-in ${FOCUS}`,
  filled: `bg-bg-input-filled border-border-input-filled ${FOCUS}`,
  error: 'bg-bg-input-error border-border-input-error',
  disabled: 'pointer-events-none bg-bg-input-disabled border-border-input-disabled',
  // Pinned looks, for the docs' state grid.
  hover: 'bg-bg-input-hover border-border-input-hover',
  focus: 'bg-bg-input-focus border-border-input-focus',
} as const

const TEXT_STATES = {
  empty: 'text-text-input-filled focus:text-text-input-focus',
  filled: 'text-text-input-filled focus:text-text-input-focus',
  error: 'text-text-input-error',
  disabled: 'text-text-input-disabled',
  hover: 'text-text-input-filled',
  focus: 'text-text-input-focus',
} as const

// The same, for the plain text area's own placeholder.
const TEXTAREA_PLACEHOLDER = {
  empty:
    'placeholder:text-text-input-placeholder group-hover/textarea:placeholder:text-text-input-hover focus:placeholder:text-text-input-placeholder',
  filled: 'placeholder:text-text-input-placeholder',
  error: 'placeholder:text-text-input-placeholder',
  disabled: 'placeholder:text-text-input-disabled',
  hover: 'placeholder:text-text-input-hover',
  focus: 'placeholder:text-text-input-placeholder',
} as const

const PLACEHOLDER_STATES = {
  empty:
    'text-text-input-placeholder group-hover/textarea:text-text-input-hover group-has-[:focus]/textarea:text-text-input-placeholder',
  filled: 'text-text-input-placeholder',
  error: 'text-text-input-placeholder',
  disabled: 'text-text-input-disabled',
  hover: 'text-text-input-hover',
  focus: 'text-text-input-placeholder',
} as const

// Figma's Text box: 4px above the text's cap height and 12px below it (25px
// for one line). A 19.5px line puts the cap 5px below its top, so -1px above
// and 6.5px below make the same 25px.
const TEXT_BOX =
  '-mt-[1px] pb-[6.5px] text-[1rem] leading-[19.5px] md:text-body-s md:leading-[19.5px]'

// Not in Figma: keyboard focus draws the selection controls' 1px blue ring.
const TOOLBAR_FOCUS =
  'outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-bg-selection-controls-selected'

const COMMANDS: Record<TextFormat, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  bulletList: 'insertUnorderedList',
  numberedList: 'insertOrderedList',
}

/** Which formats apply where the cursor is. */
function activeFormats(): Partial<Record<TextFormat, boolean>> {
  return Object.fromEntries(
    TEXTAREA_TOOLBAR.items.map(({ format }) => [
      format,
      document.queryCommandState(COMMANDS[format]),
    ]),
  )
}

/** The text an editor shows, ignoring tags and the stray <br> an emptied editor keeps. */
const isBlank = (html: string) =>
  !/<(li|img)\b/i.test(html) && !html.replace(/<[^>]*>|&nbsp;/g, '').trim()

/**
 * The text area field. Figma: .Subcomponents/Input/Text-area.
 *
 * It grows with its text from 80px to 500px, then scrolls with Figma's
 * scrollbar; the corner handle drags it taller or shorter. With the toolbar
 * on it's a rich-text editor (the toolbar and ⌘B, ⌘I, ⌘U format the text).
 */
const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  {
    state,
    showToolbar = true,
    onValueChange,
    action,
    disabled,
    readOnly,
    rows = 2,
    className = '',
    value,
    defaultValue,
    onChange,
    onBlur,
    placeholder,
    id,
    ...props
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)
  const rich = showToolbar
  // Uncontrolled fields track their own text, so only an empty field hovers.
  const [ownText, setOwnText] = useState(String(defaultValue ?? ''))
  const text = value !== undefined ? String(value) : ownText
  const empty = rich ? isBlank(text) : text === ''
  const [formats, setFormats] = useState<Partial<Record<TextFormat, boolean>>>({})
  // Set by dragging the corner handle; null while the field hugs its text.
  const [height, setHeight] = useState<number | null>(null)
  const drag = useRef({ startY: 0, startHeight: 0 })
  const isError =
    state === 'error' || props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const locked = disabled || readOnly

  // The editor's HTML is written once on mount; React never re-renders it, or
  // the cursor would jump. A value set from outside (a reset, a template) is
  // written in here; one that only echoes what was typed is already there.
  const [initialHtml] = useState(() => ({ __html: String(value ?? defaultValue ?? '') }))
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || value === undefined || String(value) === editor.innerHTML) return
    editor.innerHTML = String(value)
  }, [value])

  // The toolbar shows the formats at the cursor, as the cursor moves.
  useEffect(() => {
    if (!rich) return
    function update() {
      const editor = editorRef.current
      const anchor = document.getSelection()?.anchorNode
      if (editor && anchor && editor.contains(anchor)) setFormats(activeFormats())
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [rich])

  function changed(next: string) {
    if (value === undefined) setOwnText(next)
    onValueChange?.(next)
  }

  function format(name: TextFormat) {
    const editor = editorRef.current
    if (!editor || locked) return
    if (!editor.contains(document.activeElement)) editor.focus()
    document.execCommand(COMMANDS[name], false)
    setFormats(activeFormats())
    changed(editor.innerHTML)
  }

  // Pasted text comes in plain, so styles and markup from elsewhere don't.
  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'))
  }

  function onHandleDown(event: PointerEvent<HTMLSpanElement>) {
    const field = fieldRef.current
    if (!field) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { startY: event.clientY, startHeight: field.getBoundingClientRect().height }
  }

  function onHandleMove(event: PointerEvent<HTMLSpanElement>) {
    if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) return
    const next = drag.current.startHeight + event.clientY - drag.current.startY
    setHeight(Math.max(TEXTAREA_LAYOUT.minHeight, Math.round(next)))
  }

  const look =
    disabled || state === 'disabled'
      ? 'disabled'
      : isError
        ? 'error'
        : state === 'hover'
          ? 'hover'
          : state === 'focus' || state === 'selected'
            ? 'focus'
            : state === 'filled' || (!state && !empty)
              ? 'filled'
              : 'empty'
  // Selected: Figma's Text box takes the highlight; real selections do too.
  const textBox = `${TEXT_BOX} ${state === 'selected' ? 'bg-bg-input-highlighted' : 'bg-transparent'} selection:bg-bg-input-highlighted ${TEXT_STATES[look]}`
  // A dragged height replaces the 500px cap; double-clicking the handle undoes it.
  const sized: CSSProperties | undefined = height ? { height, maxHeight: 'none' } : undefined

  return (
    <div
      ref={fieldRef}
      style={sized}
      className={`group/textarea relative flex max-h-[500px] min-h-[80px] w-full flex-col gap-[12px] rounded-sm-8 border p-[11px] transition-colors duration-100 ease-figma-out ${FIELD_STATES[look]} ${className}`}
    >
      {rich ? (
        <div role="group" aria-label="Formatting" className="flex h-[20px] items-center">
          {TEXTAREA_TOOLBAR.items.map(({ format: name, label, icon }) => {
            const pressed = !!formats[name]
            return (
              <button
                key={name}
                type="button"
                aria-label={label}
                aria-pressed={pressed}
                // Figma keeps the icons at rest in a disabled field, so the
                // buttons aren't `disabled` (that greys them); they leave the tab order.
                aria-disabled={locked || undefined}
                tabIndex={locked ? -1 : undefined}
                // Keeps the cursor and selection in the text.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => format(name)}
                className={`inline-flex size-[20px] cursor-pointer items-center justify-center p-[4px] ${pressed ? 'text-text-input-icon-hover' : 'text-text-input-icon-rest hover:text-text-input-icon-hover'} ${TOOLBAR_FOCUS}`}
              >
                <MaskIcon src={`/dashboard/icons/${icon}.svg`} size={12} />
              </button>
            )
          })}
        </div>
      ) : null}
      {action ? (
        // Figma: 10px from the top and right (the 1px border is inside that),
        // over the text. With the toolbar it shares the toolbar's row; without
        // it, it gets a row of its own so the text starts below it (not in Figma).
        <span
          data-textarea-action
          className={
            rich
              ? 'absolute top-[9px] right-[9px] inline-flex'
              : // -mb pulls the text up into the 12px column gap: 8px from the button to the capitals.
                '-mx-[2px] -mt-[2px] -mb-[8px] flex justify-end'
          }
        >
          {action}
        </span>
      ) : null}
      {rich ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          {empty && placeholder ? (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 ${TEXT_BOX} ${PLACEHOLDER_STATES[look]}`}
            >
              {placeholder}
            </span>
          ) : null}
          <div
            ref={editorRef}
            id={id}
            role="textbox"
            aria-multiline="true"
            aria-placeholder={placeholder}
            aria-label={props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
            aria-describedby={props['aria-describedby']}
            aria-invalid={props['aria-invalid']}
            aria-required={props['aria-required']}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            contentEditable={!locked}
            suppressContentEditableWarning
            tabIndex={disabled ? -1 : 0}
            onInput={(event) => changed(event.currentTarget.innerHTML)}
            onBlur={onBlur as unknown as FocusEventHandler<HTMLDivElement>}
            onPaste={onPaste}
            dangerouslySetInnerHTML={initialHtml}
            // Preflight strips list markers, so the editor puts them back.
            className={`min-h-0 w-full flex-1 overflow-y-auto break-words whitespace-pre-wrap outline-none [&_ol]:list-decimal [&_ol]:pl-[20px] [&_ul]:list-disc [&_ul]:pl-[20px] ${HIDE_NATIVE} ${textBox}`}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            changed(event.target.value)
            onChange?.(event)
          }}
          // It grows with its text (field-sizing) and fills the field.
          className={`min-h-0 w-full flex-1 resize-none overflow-y-auto outline-none [field-sizing:content] ${HIDE_NATIVE} ${textBox} ${TEXTAREA_PLACEHOLDER[look]}`}
          {...props}
        />
      )}
      {rich ? <Scrollbar target={editorRef} /> : <Scrollbar target={textareaRef} />}
      {locked ? null : (
        // Not in Figma: drag the corner to make the field taller or shorter.
        <span
          aria-hidden="true"
          data-resize-handle=""
          title="Drag to resize"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onDoubleClick={() => setHeight(null)}
          className="absolute right-0 bottom-0 z-20 flex size-[14px] cursor-ns-resize touch-none items-end justify-end p-[3px] text-text-light hover:text-text-secondary"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M7 1 1 7M7 4.5 4.5 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </div>
  )
})

export { TextareaField }
export type { TextareaFieldProps, TextareaFieldState, TextFormat }
