// Used by both the static header and the sticky nav. `tabIndex` lets the
// sticky nav remove these from the tab order while it's hidden (translated
// off-screen but still in the DOM for the enter/exit transition).
const linkClassName =
  'rounded-sm-6 px-[10px] py-[10px] text-[0.8625rem] leading-[21px] text-[color:var(--oh-text-primary)] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected'

interface NavLinksProps {
  tabIndex?: number
  // Set to "/" when rendered from a route other than the landing page
  // itself (e.g. the success page), so the anchors navigate back to the
  // landing page's sections instead of looking for #story/#faq here.
  basePath?: string
}

function NavLinks({ tabIndex, basePath = '' }: NavLinksProps) {
  return (
    <>
      <a href={`${basePath}#story`} tabIndex={tabIndex} className={linkClassName}>
        About
      </a>
      <a href={`${basePath}#faq`} tabIndex={tabIndex} className={linkClassName}>
        FAQS
      </a>
    </>
  )
}

export { NavLinks }
