import { DashboardIcon } from '@/components/dashboard/nav-config'

import type { ComplianceState } from '@/lib/jobs/publish-step'
import type { ReactNode } from 'react'

/**
 * The compliance result on the Publish step: a status row with its bullets.
 * Figma: the Status component 9253:302366, in the three states of 9270:394633.
 */

interface StatusStyle {
  icon: string
  iconClass: string
  textClass: string
  label: string
}

const STATUS: Record<ComplianceState, StatusStyle> = {
  compliant: {
    icon: 'check-badge-solid',
    iconClass: 'text-green-5',
    textClass: 'text-green-4',
    label: 'Compliant',
  },
  'not-compliant': {
    icon: 'exclamation-triangle-solid',
    iconClass: 'text-yellow-5',
    textClass: 'text-yellow-4',
    label: 'Not Compliant',
  },
  unverified: {
    icon: 'exclamation-triangle-solid',
    iconClass: 'text-red-7',
    textClass: 'text-red-7',
    label: 'Company account is still unverified',
  },
}

interface ComplianceStatusProps {
  state: ComplianceState
  bullets: string[]
}

function ComplianceStatus({ state, bullets }: ComplianceStatusProps): ReactNode {
  const style = STATUS[state]
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center gap-[3px]">
        <span className={`inline-flex ${style.iconClass}`}>
          <DashboardIcon name={style.icon} size={14} />
        </span>
        <span className={`text-body-xs leading-19_2 font-medium ${style.textClass}`}>
          {style.label}
        </span>
      </div>
      <ul className="flex list-disc flex-col pl-[14px] text-body-xs leading-19_2 text-text-secondary">
        {bullets.map((bullet, index) => (
          <li key={`${index}-${bullet}`}>{bullet}</li>
        ))}
      </ul>
    </div>
  )
}

export { ComplianceStatus }
