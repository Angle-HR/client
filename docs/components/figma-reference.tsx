interface FigmaReferenceProps {
  /** Image in public/docs/figma, e.g. "/docs/figma/button.png". */
  src: string
  /** Link to the component's node in Figma. */
  href: string
  /** Date the snapshot was taken, e.g. "23 Nov 2026". */
  taken: string
  alt: string
  /** Display width in px, for small snapshots that would blur if stretched. */
  width?: number
}

/**
 * A snapshot of the Figma component, shown next to the live examples so
 * design and code can be compared at a glance. Retake it when Figma changes.
 */
function FigmaReference({ src, href, taken, alt, width }: FigmaReferenceProps) {
  return (
    <figure className="not-prose my-[20px] overflow-hidden rounded-lg-10 bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      {/* The snapshot is light mode only, so it sits on a white panel in both themes. */}
      <div className="bg-[#ffffff] p-[16px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static snapshot, no optimisation needed */}
        <img
          src={src}
          alt={alt}
          className="mx-auto h-auto w-full max-w-[720px]"
          style={width ? { maxWidth: width } : undefined}
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-[8px] border-t-[0.5px] border-border-transparent-medium px-[16px] py-[10px] body-l-regular text-text-secondary">
        <span>Figma snapshot, taken {taken}. Light mode.</span>
        <a href={href} className="docs-link underline underline-offset-2">
          Open in Figma
        </a>
      </figcaption>
    </figure>
  )
}

export { FigmaReference }
