// Class strings shared by the four side panels. All values from
// group-input.figma.ts; spelled out so Tailwind sees them. The panel's border
// skips the side that touches the field, so the left padding of a left panel
// (and the right padding of the right one) is Figma's minus the 1px border.

import type { GroupInputSize } from './group-input.figma'

const PANEL_BASE =
  'inline-flex shrink-0 items-center gap-[3px] border font-medium whitespace-nowrap ' +
  'bg-bg-input-placeholder border-border-input-placeholder text-text-input-sec-items ' +
  'hover:bg-bg-input-hover-group-items hover:border-border-input-hover-group-items ' +
  'transition-colors duration-100 ease-figma-out'

const LEFT_PANEL: Record<GroupInputSize, string> = {
  sm: 'h-[25px] border-r-0 pl-[7px] pr-[4px] rounded-l-sm-7',
  md: 'h-[32px] border-r-0 pl-[7px] pr-[4px] rounded-l-sm-8',
  lg: 'h-[40px] border-r-0 pl-[11px] pr-[6px] rounded-l-lg-10',
}

const RIGHT_PANEL: Record<GroupInputSize, string> = {
  sm: 'h-[25px] border-l-0 pl-[8px] pr-[7px] rounded-r-sm-7',
  md: 'h-[32px] border-l-0 pl-[8px] pr-[7px] rounded-r-sm-8',
  lg: 'h-[40px] border-l-0 pl-[8px] pr-[7px] rounded-r-lg-10',
}

const CURRENCY_TEXT: Record<GroupInputSize, string> = {
  sm: 'text-body-xs',
  md: 'text-body-xs',
  lg: 'text-body-s',
}

const HELPER_TEXT: Record<GroupInputSize, string> = {
  sm: 'text-body-s',
  md: 'text-body-s',
  lg: 'text-body-m',
}

/** Keyboard focus on the Currency and Flag buttons (not in Figma): the selection controls' ring. */
const PANEL_FOCUS =
  'outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-bg-selection-controls-selected'

export { CURRENCY_TEXT, HELPER_TEXT, LEFT_PANEL, PANEL_BASE, PANEL_FOCUS, RIGHT_PANEL }
