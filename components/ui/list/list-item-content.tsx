import type { ReactNode } from 'react'

type SubTextAlignment = 'none' | 'left' | 'right'

interface ListItemContentProps {
  mainText: string
  subText?: string
  subText2?: string
  subText3?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  /** Destructive styling: main text + icon render in text/Error. */
  danger?: boolean
  className?: string
}

function ListItemContent({
  mainText,
  subText,
  subText2,
  subText3,
  subTextAlignment = 'none',
  withIcon = true,
  iconContainer = false,
  icon,
  danger = false,
  className = '',
}: ListItemContentProps) {
  return (
    <span
      className={`inline-flex items-center gap-[4px] min-w-0 ${danger ? 'text-text-error' : ''} ${className}`}
    >
      {withIcon && icon && (
        <span
          className={`inline-flex shrink-0 items-center justify-center ${danger ? 'text-text-error' : ''} ${iconContainer ? 'h-[24px] w-[24px] rounded-sm-6 bg-bg-transparent-light' : 'h-[14px] w-[14px]'}`}
        >
          {icon}
        </span>
      )}
      <span className="inline-flex items-center gap-[4px] min-w-0 truncate">
        <span
          className={`text-body-s font-medium truncate ${danger ? 'text-text-error' : 'text-text-primary'}`}
        >
          {mainText}
        </span>
        {subTextAlignment === 'none' && subText && (
          <span className="text-body-xs text-text-secondary truncate">{subText}</span>
        )}
        {subTextAlignment === 'left' && (
          <>
            {subText && (
              <span className="text-body-xs text-text-secondary truncate">{subText}</span>
            )}
            {subText2 && (
              <>
                <span className="text-body-xs text-text-tertiary">·</span>
                <span className="text-body-xs text-text-secondary truncate">{subText2}</span>
              </>
            )}
            {subText3 && (
              <>
                <span className="text-body-xs text-text-tertiary">·</span>
                <span className="text-body-xs text-text-secondary truncate">{subText3}</span>
              </>
            )}
          </>
        )}
        {subTextAlignment === 'right' && (
          <>
            <span className="flex-1" />
            {subText && (
              <span className="text-body-xs text-text-secondary truncate">{subText}</span>
            )}
            {subText2 && (
              <span className="text-body-xs text-text-secondary truncate">{subText2}</span>
            )}
          </>
        )}
      </span>
    </span>
  )
}

export { ListItemContent }
export type { ListItemContentProps, SubTextAlignment }
