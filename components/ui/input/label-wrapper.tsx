// All values from label-wrapper.figma.ts (Figma node 5117:122194).

interface LabelWrapperProps {
  label: string
  /** Figma's Required: a red asterisk after the label. Screen readers get `required` from the field. */
  required?: boolean
  /** A line under the label. Figma has it on the Prod label. */
  subtext?: string
  /** Figma's Prod: a dark label, for questions in forms people fill in. */
  prod?: boolean
  htmlFor?: string
  id?: string
  className?: string
}

/**
 * The field label used above every input (text input, selection, date, …).
 * The line is 12px text trimmed to its 9px cap height and inset 3px; the
 * required asterisk sits 2px after it.
 */
function LabelWrapper({
  label,
  required = false,
  subtext,
  prod = false,
  htmlFor,
  id,
  className = '',
}: LabelWrapperProps) {
  const title = (
    <label
      id={id}
      htmlFor={htmlFor}
      className={`flex h-[9px] items-center gap-[2px] text-body-xs leading-none font-medium-550 ${prod ? 'text-text-primary' : 'pl-[3px] text-text-tertiary'}`}
    >
      {label}
      {required && (
        <span
          className="text-label leading-none font-medium-550 text-text-error"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  )
  if (!prod && !subtext) return <div className={className}>{title}</div>
  return (
    <div
      className={`flex flex-col gap-[8px] ${prod ? `pl-[3px] ${subtext ? 'pb-[6px]' : 'pb-[4px]'}` : ''} ${className}`}
    >
      {title}
      {subtext && (
        <span className="flex h-[9px] items-center text-body-xs leading-none text-text-secondary">
          {subtext}
        </span>
      )}
    </div>
  )
}

export { LabelWrapper }
export type { LabelWrapperProps }
