import Image from 'next/image'
import Link from 'next/link'

// Used by both the static header and the sticky nav — was duplicated
// verbatim in both places before. Renders the single pre-composed logo
// asset (icon + wordmark + badge outline baked into one SVG) rather than
// separately laying out an icon and a text pill. Always links back to the
// landing page, regardless of which page it's rendered from.
//
// `tabIndex` mirrors the same prop on NavLinks/GetEarlyAccessButton: the
// sticky nav passes -1 while it's hidden (translated off-screen but still
// in the DOM), so this link — now that it's a real, focusable <Link> —
// can't trap keyboard focus on an invisible element.
function Logo({ tabIndex }: { tabIndex?: number }) {
  return (
    <Link
      href="/open-hr"
      tabIndex={tabIndex}
      aria-label="OpenHR home"
      className="inline-flex rounded-sm-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
    >
      <Image src="/open-hr/logo.svg" alt="" width={90} height={24} />
    </Link>
  )
}

export { Logo }
