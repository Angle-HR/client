/**
 * Renders an exported Figma vector through a CSS mask so it takes its colour
 * from `currentColor`.
 *
 * The exports carry baked-in fills and strokes (#141414, #999999 …) which
 * vanish against a dark background, and an `<img>` can't be recoloured. Masking
 * keeps the designer's exact vector — nothing is redrawn — while letting the
 * theme decide the colour. Every asset in this set is single-colour, so no
 * detail is lost.
 */

interface MaskIconProps {
  /** Path under /public, e.g. `/dashboard/icons/inbox.svg`. */
  src: string
  /** Width in px, and the height too unless `height` says otherwise. */
  size: number
  /** Only for the non-square vectors, e.g. the empty-state crop marks. */
  height?: number
  className?: string
}

function MaskIcon({ src, size, height, className = '' }: MaskIconProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: height ?? size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      className={`inline-block shrink-0 bg-current ${className}`}
    />
  )
}

export { MaskIcon }
