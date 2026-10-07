'use client'

import { forwardRef, type ComponentPropsWithRef } from 'react'

interface TabItemProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  label: string
  /**
   * Shown after the label as "· 12". Omit to hide the counter. The separator is
   * U+00B7: the design's U+22C5 is outside the Latin subset Inter is loaded
   * with, so it would fall back to a wider system glyph.
   */
  count?: number
  selected?: boolean
}

/**
 * One tab in a `Tabs` bar. Figma: Tab/.Subcomponents/Tab-item (6774:120348).
 *
 * The selected tab is marked by a 1px underline that sits on top of the bar's
 * own hairline, which is why the item is as tall as the bar's inner row.
 */
const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(function TabItem(
  { label, count, selected = false, className = '', ...props },
  ref,
) {
  const classes = [
    'group inline-flex h-[37px] shrink-0 items-center justify-center gap-[6px] px-[12px]',
    // The underline is drawn over the item, not as a border, so it does not
    // push the label off the row's centre line.
    'relative rounded-t-lg-10 transition-colors hover:rounded-t-sm-8 hover:bg-bg-transparent-lighter',
    'after:absolute after:inset-x-0 after:bottom-0 after:h-px',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    selected ? 'after:bg-text-secondary' : 'after:bg-transparent',
    className,
  ].join(' ')

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={classes}
      {...props}
    >
      <span className="inline-flex items-end gap-[3px]">
        <span
          className={`text-body-xs leading-19_2 font-medium group-hover:text-text-primary ${selected ? 'text-text-primary' : 'text-text-secondary'}`}
        >
          {label}
        </span>
        {count !== undefined ? (
          <span className="inline-flex items-center gap-[3px] text-caption-m leading-17_6 text-text-tertiary">
            <span aria-hidden="true">·</span>
            <span className={selected ? 'text-text-secondary' : ''}>{count}</span>
          </span>
        ) : null}
      </span>
    </button>
  )
})

export { TabItem }
export type { TabItemProps }
