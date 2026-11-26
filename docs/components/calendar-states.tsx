'use client'

// Calendar variants and day states, drawn from calendar.figma.ts. Each cell
// is the real component, on 17 June 2026 like Figma's example.
import { Calendar } from '@/components/ui/input/calendar'

import { StateTable } from './state-table'

const TODAY = new Date(2026, 5, 17)
const noop = () => {}

function CalendarStates() {
  const row = (label: string, props: { value?: string; wrapped?: boolean }) => ({
    label,
    cells: (['loose', 'tight'] as const).map((spacing) => (
      <Calendar key={spacing} today={TODAY} onSelect={noop} spacing={spacing} {...props} />
    )),
  })
  return (
    <StateTable
      columns={['Loose (8px)', 'Tight (2px)']}
      rows={[
        row('rest', {}),
        row('selected', { value: '2026-06-10' }),
        row('not wrapped', { value: '2026-06-10', wrapped: false }),
      ]}
      caption="Figma's Rest, Selected and Wrapped = no, at both spacings. 17 June is today (blue, with a dot); 10 June is selected. Click the year or month above to see their lists."
    />
  )
}

export { CalendarStates }
