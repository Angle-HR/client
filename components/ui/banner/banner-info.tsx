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
    <div role="note" className={`flex flex-col gap-[4px] ${className}`}>
      <p className="text-[13px] leading-[19.5px] font-medium text-text-blue-accent">{title}</p>
      <p className="text-[12px] leading-[16px] text-text-secondary">{body}</p>
    </div>
  )
}

export { BannerInfo }
export type { BannerInfoProps }
