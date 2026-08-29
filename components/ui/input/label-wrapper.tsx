interface LabelWrapperProps {
  label: string
  required?: boolean
  subtext?: string
  htmlFor?: string
  className?: string
}

/**
 * The shared field-label primitive used above nearly every input in the
 * system (Text Input, File Upload, OTP Input, ...). Each of those composites
 * had been hand-rolling this markup inline; this centralises it.
 */
function LabelWrapper({ label, required = false, subtext, htmlFor, className = '' }: LabelWrapperProps) {
  return (
    <div className={`flex flex-col gap-[2px] ${className}`}>
      <label htmlFor={htmlFor} className="text-[12px] leading-none font-semibold text-text-tertiary">
        {label}
        {required && (
          <span className="text-[9px] text-text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {subtext && <span className="text-[12px] leading-[16px] text-text-secondary">{subtext}</span>}
    </div>
  )
}

export { LabelWrapper }
export type { LabelWrapperProps }
