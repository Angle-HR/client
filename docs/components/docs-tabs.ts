/**
 * Compact Tabs for a card header in the docs: 28px tabs in a 36px row, so the
 * hover fill stays 8px off the card's top edge, with the same 8px inset from
 * the left corner. Shared by every tabbed card so they line up.
 */
const DOCS_CARD_TABS =
  'h-[36px]! pl-[1px] [&>div]:h-[28px]! [&_[role=tab]]:h-[28px]! [&_[role=tab]]:px-[10px]!'

export { DOCS_CARD_TABS }
