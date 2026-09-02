type LogoSize = 'sm' | 'lg' | 'favicon'

interface LogoProps {
  size?: LogoSize
  className?: string
}

// Figma: logo icon mark · node 5165:104242 (canonical set — see the
// duplication note below). Same path at every size, scaled via className.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23.357 23.357" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3921 17.8314L11.4652 17.8293C15.0013 18.0764 18.2291 17.0485 19.8211 15.2906C20.5662 14.4679 20.4173 13.257 19.9169 12.2662L17.7516 7.97942L17.6611 7.80016C16.7506 6.16004 13.8972 5.16687 10.6515 5.5017C7.26625 5.85093 4.59371 7.52726 4.1984 9.41509L2.9913 13.2507C2.78328 13.9117 2.85812 14.6496 3.34095 15.1467C4.97846 16.8325 7.98392 17.9181 11.3921 17.8314ZM10.727 6.2338C13.8238 5.91434 16.4813 7.08157 16.6628 8.8409C16.8443 10.6002 14.481 12.2854 11.3843 12.6049C8.28758 12.9243 5.63007 11.7571 5.44857 9.99777C5.26708 8.23845 7.63033 6.55326 10.727 6.2338Z"
        fill="currentColor"
      />
      <path
        d="M10.4144 9.78334C12.4835 9.24685 14.4443 9.49864 15.475 10.3156C14.6244 11.1784 13.1207 11.8426 11.3578 12.0245C9.75567 12.1898 8.28173 11.9211 7.26892 11.3673C8.03896 10.69 9.13549 10.115 10.4144 9.78334Z"
        fill="currentColor"
      />
    </svg>
  )
}

const markSizeClasses: Record<LogoSize, string> = {
  sm: 'size-[23px]',
  lg: 'size-[40px]',
  favicon: 'size-[32px]',
}

const wordmarkClasses: Record<'sm' | 'lg', string> = {
  sm: 'ml-[4px] gap-[4px] rounded-sm-6 border-[0.5px] px-[4px] py-[4.4px] text-[13px]',
  lg: 'ml-[6.86px] gap-[6.86px] rounded-[10.29px] border-[0.858px] px-[6.86px] py-[7.55px] text-[22.3px]',
}

/**
 * The fixed brand lockup — icon mark + "OPEN HR" wordmark.
 *
 * Figma note: two near-identical `logo` component sets exist in the file
 * (node 2672:38472 and node 5165:104242); the second is a superset (it adds
 * the `favicon` size) and is treated as canonical here, per the Outline doc.
 * Flagging the duplicate for design cleanup rather than building against both.
 */
function Logo({ size = 'sm', className = '' }: LogoProps) {
  if (size === 'favicon') {
    return (
      <div className={`inline-flex items-center justify-center bg-bg-primary ${className}`}>
        <LogoMark className={`text-text-primary ${markSizeClasses.favicon}`} />
      </div>
    )
  }

  const isLg = size === 'lg'

  return (
    <div className={`inline-flex items-center ${isLg ? 'h-[40px]' : 'h-[24px]'} ${className}`}>
      <LogoMark className={`shrink-0 text-text-primary ${markSizeClasses[size]}`} />
      <div
        className={`inline-flex items-center border-border-transparent-strong font-semibold whitespace-nowrap text-text-primary ${wordmarkClasses[size]}`}
      >
        <span>OPEN</span>
        <span>HR</span>
      </div>
    </div>
  )
}

export { Logo }
export type { LogoProps, LogoSize }
