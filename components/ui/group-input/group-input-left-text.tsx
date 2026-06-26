type GroupInputLeftTextSize = 'sm' | 'md' | 'lg'

interface GroupInputLeftTextProps {
  text: string
  height?: GroupInputLeftTextSize
  className?: string
}

const sizeConfig: Record<GroupInputLeftTextSize, { panel: string; padding: string }> = {
  sm: { panel: 'h-[25px]', padding: 'pl-[8px] pr-[4px]' },
  md: { panel: 'h-[32px]', padding: 'pl-[8px] pr-[4px]' },
  lg: { panel: 'h-[40px]', padding: 'pl-[12px] pr-[6px]' },
}

function GroupInputLeftText({ text, height = 'md', className = '' }: GroupInputLeftTextProps) {
  const config = sizeConfig[height]

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center gap-[3px] ${config.panel} ${config.padding} bg-bg-input-placeholder border border-border-input-placeholder rounded-l-sm-7 rounded-r-none text-body-s text-text-secondary ${className}`}
    >
      <span className="h-[24px] flex items-center">{text}</span>
    </div>
  )
}

export { GroupInputLeftText }
export type { GroupInputLeftTextProps, GroupInputLeftTextSize }
