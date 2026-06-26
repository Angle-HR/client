type GroupInputRightTextSize = 'sm' | 'md' | 'lg'

interface GroupInputRightTextProps {
  text: string
  height?: GroupInputRightTextSize
  className?: string
}

const sizeConfig: Record<GroupInputRightTextSize, { panel: string }> = {
  sm: { panel: 'h-[25px]' },
  md: { panel: 'h-[32px]' },
  lg: { panel: 'h-[40px]' },
}

function GroupInputRightText({ text, height = 'md', className = '' }: GroupInputRightTextProps) {
  const config = sizeConfig[height]

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center gap-[3px] ${config.panel} px-[8px] bg-bg-input-placeholder border border-border-input-placeholder rounded-r-sm-7 rounded-l-none text-body-s text-text-secondary ${className}`}
    >
      <span className="h-[24px] flex items-center">{text}</span>
    </div>
  )
}

export { GroupInputRightText }
export type { GroupInputRightTextProps, GroupInputRightTextSize }
