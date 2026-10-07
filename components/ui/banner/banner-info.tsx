interface BannerInfoProps {
  title: string
  body: string
  className?: string
}

/**
 * A static two-line informational block for longer-form notices (legal,
 * compliance, policy context) — not a dismissible status message, see
 * BannerSmall for that. No variants are defined in Figma.
 */
function BannerInfo({ title, body, className = '' }: BannerInfoProps) {
  return (
    // Figma: a 1px accent rule down the left, 10px side padding, and 12px
    // between the cap-height text boxes (2px between CSS line boxes).
    <div
      role="note"
      className={`flex flex-col gap-[2px] border-l border-border-banner-info px-[10px] ${className}`}
    >
      <p className="-mt-[1.5px] text-body-s leading-19_5 font-medium text-text-blue-accent">
        {title}
      </p>
      <p className="-mb-[1.5px] text-body-xs leading-19_2 text-text-secondary">{body}</p>
    </div>
  )
}

export { BannerInfo }
export type { BannerInfoProps }
