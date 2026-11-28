'use client'

import { type ReactElement } from 'react'

import { FilterMenu, type CandidateFilters } from '@/components/applications/filter-menu'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Tabs, TextButton, TextInput } from '@/components/ui'


import type { Tag } from '@/lib/applications/pipeline'
import type { StageTab, StageTabItem } from '@/lib/applications/stages'

// The bar actions from the jobs page: grey until hovered, and never bold.
const barAction =
  'rounded-sm-6 p-[6px] text-text-secondary! hover:bg-bg-transparent-light hover:text-text-primary! disabled:hover:bg-transparent'

interface CandidatesToolbarProps {
  tab: StageTab
  onTabChange: (tab: StageTab) => void
  tabs: StageTabItem[]
  /** Opens the add-a-stage form; omitted when the person cannot manage stages. */
  onAddStage?: () => void
  /** Opens the stage manager; omitted when the person cannot manage stages. */
  onManageStages?: () => void
  tags: ReadonlyArray<Tag>
  filters: CandidateFilters
  onFiltersChange: (value: CandidateFilters) => void
  search: string
  onSearchChange: (value: string) => void
  onToggleSort: () => void
}

/**
 * The stage tabs with their counts, Stages, Filter and Sort, and the search box.
 */
function CandidatesToolbar({
  tab,
  onTabChange,
  tabs,
  onAddStage,
  onManageStages,
  tags,
  filters,
  onFiltersChange,
  search,
  onSearchChange,
  onToggleSort,
}: CandidatesToolbarProps): ReactElement {
  return (
    <div className="flex flex-col gap-[12px]">
      <Tabs
        tabs={tabs}
        value={tab}
        onValueChange={onTabChange}
        aria-label="Candidate stage"
        trailing={
          <div className="flex items-center gap-[2px]">
            {onAddStage ? (
              <button
                type="button"
                aria-label="Add new stage"
                onClick={onAddStage}
                className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-sm-6 text-text-secondary hover:bg-bg-transparent-light hover:text-text-primary"
              >
                <DashboardIcon name="plus-solid" size={14} />
              </button>
            ) : null}
            {onManageStages ? (
              <TextButton size="sm" className={barAction} onClick={onManageStages}>
                <span className="flex items-center gap-[2px] leading-none">
                  <DashboardIcon name="adjustments-horizontal-solid" size={11} />
                  Stages
                </span>
              </TextButton>
            ) : null}
            <FilterMenu
              tags={tags}
              value={filters}
              onChange={onFiltersChange}
              className={barAction}
            />
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
