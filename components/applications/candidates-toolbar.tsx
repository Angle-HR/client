'use client'

import { type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Tabs, TextButton, TextInput } from '@/components/ui'
import { STAGE_TABS, tabCount, type StageTab } from '@/lib/applications/stages'

// The bar actions from the jobs page: grey until hovered, and never bold.
const barAction =
  'rounded-sm-6 p-[6px] text-text-secondary! hover:bg-bg-transparent-light hover:text-text-primary! disabled:hover:bg-transparent'

interface CandidatesToolbarProps {
  tab: StageTab
  onTabChange: (tab: StageTab) => void
  counts: Record<string, number>
  search: string
  onSearchChange: (value: string) => void
  onToggleSort: () => void
}

/**
 * The stage tabs with their counts, Filter and Sort, and the search box. Filter
 * has no flow in the design yet, so it is drawn and inert.
 */
function CandidatesToolbar({
  tab,
  onTabChange,
  counts,
  search,
  onSearchChange,
  onToggleSort,
}: CandidatesToolbarProps): ReactElement {
  const tabs = STAGE_TABS.map((option) => ({
    key: option.key,
    label: option.label,
    count: tabCount(option.key, counts),
  }))

  return (
    <div className="flex flex-col gap-[12px]">
      <Tabs
        tabs={tabs}
        value={tab}
        onValueChange={onTabChange}
        aria-label="Candidate stage"
        trailing={
          <div className="flex items-center gap-[2px]">
            {/* The add-tab control is drawn after the tabs; it has no flow yet. */}
            <button
              type="button"
              aria-label="Add new stage"
              className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-sm-6 text-text-secondary hover:bg-bg-transparent-light hover:text-text-primary"
            >
              <DashboardIcon name="plus-solid" size={14} />
            </button>
            <TextButton size="sm" className={barAction}>
              <span className="flex items-center gap-[2px] leading-none">
                <DashboardIcon name="funnel-outline" size={11} />
                Filter
              </span>
            </TextButton>
            <TextButton size="sm" className={barAction} onClick={onToggleSort}>
              <span className="flex items-center gap-[2px] leading-none">
                <DashboardIcon name="bars-arrow-up-solid" size={10} />
                Sort
              </span>
            </TextButton>
          </div>
        }
      />
      <div className="w-[240px]">
        <TextInput
          placeholder="Search"
          showPrefixIcon
          prefixIcon={<DashboardIcon name="magnifying-glass-outline" size={14} />}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  )
}

export { CandidatesToolbar }
export type { CandidatesToolbarProps }
