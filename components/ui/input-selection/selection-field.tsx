'use client'

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'

import { MaskIcon } from '../icons/mask-icon'

type SelectionFieldSize = 'sm' | 'md' | 'lg'
type SelectionFieldState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'disabled' | 'error'

interface SelectionFieldProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'prefix'
> {
  size?: SelectionFieldSize
  state?: SelectionFieldState
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  /** Leading visual (e.g. the selected country's flag) shown before the value. */
  leadingVisual?: ReactNode
  withSelection?: boolean
  tags?: ReactNode[]
  placeholder?: string
  value?: string
  /**
   * Turns the value area into a text box, for fields whose options are
   * filtered — or added to — by typing.
   */
  search?: SelectionFieldSearch
  /**
   * Inside a group input: Figma's ⛔ Position. Only the outer corners are
   * round, hover eases out, and an empty tag field's text is a darker grey
   * (Figma: .Subcomponents/Group-selection, group-selection.figma.ts).
   */
  groupPosition?: 'left' | 'center' | 'right'
}

interface SelectionFieldSearch {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onFocus?: () => void
  placeholder?: string
  'aria-label'?: string
}

// All values from selection-field.figma.ts (Figma node 915:21577). Class
// strings are spelled out so Tailwind can see them. Padding is Figma's minus
// the 1px border, which Figma draws inside its padding.
const sizeConfig: Record<
  SelectionFieldSize,
  {
    height: string
    padding: string
    radius: string
    icon: string
    iconPx: number
    text: string
    search: string
  }
> = {
  sm: {
    height: 'h-[25px]',
    padding: 'px-[7px]',
    radius: 'rounded-sm-7',
    icon: 'size-[12px]',
    iconPx: 12,
    text: 'text-body-s',
    search: 'md:text-body-s',
  },
  md: {
    height: 'h-[32px]',
    padding: 'px-[7px]',
    radius: 'rounded-sm-8',
    icon: 'size-[14px]',
    iconPx: 14,
    text: 'text-body-m',
    search: 'md:text-body-m',
  },
  lg: {
    height: 'h-[40px]',
    padding: 'px-[11px]',
    radius: 'rounded-lg-10',
    icon: 'size-[14px]',
    iconPx: 14,
    text: 'text-body-l',
    search: 'md:text-body-l',
  },
}

// Placeholder and Filled react to the pointer and keyboard themselves; the
// other states are set from outside (open list = focus) or pinned in docs.
// Figma only hovers an empty field.
const FOCUS =
  'focus-visible:bg-bg-input-focus! focus-visible:border-border-input-focus! focus-within:bg-bg-input-focus! focus-within:border-border-input-focus! focus-within:ease-figma-out!'
const FIELD_STATES: Record<SelectionFieldState, string> = {
  placeholder: `cursor-pointer bg-bg-input-placeholder border-border-input-placeholder hover:bg-bg-input-hover hover:border-border-input-hover hover:ease-figma-in ${FOCUS}`,
  filled: `cursor-pointer bg-bg-input-filled border-border-input-filled ${FOCUS}`,
  hover: 'cursor-pointer bg-bg-input-hover border-border-input-hover',
  focus: 'cursor-pointer bg-bg-input-focus border-border-input-focus',
  disabled: 'pointer-events-none bg-bg-input-disabled border-border-input-disabled',
  error: 'cursor-pointer bg-bg-input-error border-border-input-error',
}

const PREFIX_STATES: Record<SelectionFieldState, string> = {
  placeholder:
    'text-text-input-placeholder group-hover/selection:text-text-input-hover group-focus-visible/selection:text-text-input-focus group-focus-within/selection:text-text-input-focus',
  filled:
    'text-text-input-filled group-focus-visible/selection:text-text-input-focus group-focus-within/selection:text-text-input-focus',
  hover: 'text-text-input-hover',
  focus: 'text-text-input-focus',
  disabled: 'text-text-input-disabled',
  error: 'text-text-input-error',
}

const CHEVRON_STATES: Record<SelectionFieldState, string> = {
  placeholder: 'text-text-input-icon-suffix',
  filled: 'text-text-input-icon-suffix',
  hover: 'text-text-input-icon-suffix',
  focus: 'text-text-input-icon-suffix',
  disabled: 'text-text-input-icon-suffix',
  error: 'text-text-input-icon-suffix-error',
}

/** Text colour for the chosen value, and for the placeholder when empty. */
const VALUE_TEXT: Record<SelectionFieldState, string> = {
  placeholder: 'text-text-input-filled',
  filled: 'text-text-input-filled',
  hover: 'text-text-input-filled',
  focus: 'text-text-input-focus',
  disabled: 'text-text-input-disabled',
  error: 'text-text-input-error',
}
const PLACEHOLDER_TEXT: Record<SelectionFieldState, string> = {
  placeholder: 'text-text-input-placeholder group-hover/selection:text-text-input-hover',
  filled: 'text-text-input-placeholder',
  hover: 'text-text-input-hover',
  focus: 'text-text-input-placeholder',
  disabled: 'text-text-input-disabled',
  error: 'text-text-input-placeholder',
}

// Group selection corners: right = the field ends the group, left = starts it.
// 40px uses 7px here (Figma), not the 10px of the plain field.
const GROUP_RADIUS: Record<'left' | 'center' | 'right', Record<SelectionFieldSize, string>> = {
  right: { sm: 'rounded-r-sm-7', md: 'rounded-r-sm-8', lg: 'rounded-r-sm-7' },
  center: { sm: 'rounded-none', md: 'rounded-none', lg: 'rounded-none' },
  left: { sm: 'rounded-l-sm-7', md: 'rounded-l-sm-8', lg: 'rounded-l-sm-7' },
}

const SelectionField = forwardRef<HTMLButtonElement, SelectionFieldProps>(function SelectionField(
  {
    size = 'md',
    state,
    showPrefixIcon = false,
    prefixIcon,
    leadingVisual,
    withSelection = false,
    tags,
    placeholder,
    value,
    search,
    groupPosition,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  const config = sizeConfig[size]
  const hasValue = !!value || (withSelection && !!tags?.length)
  // disabled and error win; an open list pins focus; otherwise the field
  // works out Placeholder vs Filled from its value.
  const resolved: SelectionFieldState = disabled
    ? 'disabled'
    : state === 'error' || state === 'focus' || state === 'hover'
      ? state
      : hasValue || state === 'filled'
        ? 'filled'
        : 'placeholder'

  const classes = [
    'group/selection inline-flex items-center gap-[4px] w-full border text-left outline-none transition-colors duration-100 ease-figma-out',
    config.height,
    config.padding,
    groupPosition ? GROUP_RADIUS[groupPosition][size] : config.radius,
    // The group's field hovers with ease out (Figma), the plain one with ease in.
    groupPosition
      ? FIELD_STATES[resolved].replace('hover:ease-figma-in', 'hover:ease-figma-out')
      : FIELD_STATES[resolved],
    className,
  ].join(' ')
  const prefixClasses = `inline-flex ${config.icon} items-center justify-center shrink-0 transition-colors duration-100 ease-figma-out ${PREFIX_STATES[resolved]}`
  const chevronClasses = `inline-flex ${config.icon} shrink-0 ${CHEVRON_STATES[resolved]}`
  const valueClasses = `flex-1 truncate ${config.text} ${hasValue ? VALUE_TEXT[resolved] : PLACEHOLDER_TEXT[resolved]}`
  const groupTagsPlaceholder = groupPosition && resolved !== 'disabled'
  const emptyTagsClasses = `${config.text} truncate ${groupTagsPlaceholder ? 'text-text-input-with-tags-placeholder' : PLACEHOLDER_TEXT[resolved]}`

  // Boolean() rather than a comparison: TypeScript would narrow `tags` through
  // a compared alias, and both branches below render the same children.
  const tagMode = Boolean(tags) || Boolean(search)

  const searchBox = search ? (
    <input
      value={search.value}
      onChange={(event) => search.onChange(event.target.value)}
      onKeyDown={search.onKeyDown}
      onFocus={search.onFocus}
      // The field toggles its list on click; a click in the text box only opens it.
      onClick={(event) => event.stopPropagation()}
      placeholder={search.placeholder}
      aria-label={search['aria-label']}
      disabled={disabled}
      autoComplete="off"
      // 16px below md so iOS Safari doesn't zoom on focus, as in Input.
      className={`min-w-[40px] flex-1 bg-transparent text-[1rem] ${config.search} ${VALUE_TEXT[resolved]} outline-none ${groupTagsPlaceholder && withSelection ? 'placeholder:text-text-input-with-tags-placeholder' : 'placeholder:text-text-input-placeholder'} disabled:placeholder:text-text-input-disabled`}
    />
  ) : null

  return (
    // With removable tags inside, the trigger cannot be a <button>: the tags'
    // own remove buttons would be nested in it, which is invalid HTML. It
    // becomes a focusable combobox div that answers Enter and Space instead.
    // The same goes for a field with a text box in it.
    tagMode ? (
      <div
        ref={ref as unknown as Ref<HTMLDivElement>}
        tabIndex={disabled || search ? -1 : 0}
        aria-disabled={disabled || undefined}
        className={classes}
        {...(props as unknown as HTMLAttributes<HTMLDivElement>)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.currentTarget.click()
          }
        }}
      >
        {showPrefixIcon && prefixIcon && (
          <span className={prefixClasses} aria-hidden="true">
            {prefixIcon}
          </span>
        )}
        {withSelection ? (
          <span className="flex-1 inline-flex items-center gap-[2px] min-w-0 overflow-hidden">
            {tags?.length || searchBox ? (
              <>
                {tags}
                {searchBox}
              </>
            ) : (
              <span className={emptyTagsClasses}>{placeholder}</span>
            )}
          </span>
        ) : (
          <span className="flex flex-1 items-center gap-[8px] min-w-0">
            {value && leadingVisual && (
              <span className="inline-flex shrink-0 items-center">{leadingVisual}</span>
            )}
            {searchBox ?? <span className={valueClasses}>{value || placeholder}</span>}
          </span>
        )}
        <span className={chevronClasses} aria-hidden="true">
          {/* The icon file keeps Figma's 16px frame, so the arrow lands at
              80%: 9.9 × 5.5px in the 14px box, 8.5 × 4.75px in the 12px one. */}
          <MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={config.iconPx} />
        </span>
      </div>
    ) : (
      <button ref={ref} type="button" disabled={disabled} className={classes} {...props}>
        {showPrefixIcon && prefixIcon && (
          <span className={prefixClasses} aria-hidden="true">
            {prefixIcon}
          </span>
        )}
        {withSelection ? (
          <span className="flex-1 inline-flex items-center gap-[2px] min-w-0 overflow-hidden">
            {tags?.length ? tags : <span className={emptyTagsClasses}>{placeholder}</span>}
          </span>
        ) : (
          <span className="flex flex-1 items-center gap-[8px] min-w-0">
            {value && leadingVisual && (
              <span className="inline-flex shrink-0 items-center">{leadingVisual}</span>
            )}
            <span className={valueClasses}>{value || placeholder}</span>
          </span>
        )}
        <span className={chevronClasses} aria-hidden="true">
          {/* The icon file keeps Figma's 16px frame, so the arrow lands at
              80%: 9.9 × 5.5px in the 14px box, 8.5 × 4.75px in the 12px one. */}
          <MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={config.iconPx} />
        </span>
      </button>
    )
  )
})

export { SelectionField }
export type { SelectionFieldProps, SelectionFieldSearch, SelectionFieldSize, SelectionFieldState }
