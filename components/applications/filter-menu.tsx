'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'

import { TagPill } from '@/components/applications/tag-pill'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Checkbox, TextButton } from '@/components/ui'

import type { Tag } from '@/lib/applications/pipeline'

interface CandidateFilters {
  /** A tag id, or '' for any. */
  tag: string
  followed: boolean
}

interface FilterMenuProps {
  tags: ReadonlyArray<Tag>
  value: CandidateFilters
  onChange: (value: CandidateFilters) => void
  className?: string
}

const NO_FILTERS: CandidateFilters = { tag: '', followed: false }

/** The toolbar's Filter: candidates you follow, or ones with a tag. */
function FilterMenu({ tags, value, onChange, className }: FilterMenuProps): ReactElement {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const active = (value.tag ? 1 : 0) + (value.followed ? 1 : 0)

  useEffect(() => {
    if (!open) return
    function handlePress(event: MouseEvent): void {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePress)
    return () => document.removeEventListener('mousedown', handlePress)
  }, [open])

  return (
    <div ref={wrapper} className="relative">
      <TextButton
        size="sm"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-[2px] leading-none">
          <DashboardIcon name="funnel-outline" size={11} />
          Filter{active > 0 ? ` · ${active}` : ''}
        </span>
      </TextButton>
      {open ? (
        <div className="absolute top-full right-0 z-10 mt-[4px] flex w-[240px] flex-col gap-[10px] rounded-lg-10 bg-bg-primary p-[10px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
          <Checkbox
            label="Following"
            checked={value.followed}
            onChange={(event) => onChange({ ...value, followed: event.target.checked })}
          />
          <p className="text-caption-m text-text-secondary">Tag</p>
          <ul className="flex max-h-[160px] flex-col gap-[6px] overflow-y-auto">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center gap-[8px]">
                <Checkbox
                  size="sm"
                  aria-label={tag.name}
                  checked={value.tag === tag.id}
                  onChange={(event) =>
                    onChange({ ...value, tag: event.target.checked ? tag.id : '' })
                  }
                />
                <TagPill tag={tag} size="sm" />
              </li>
            ))}
            {tags.length === 0 ? (
              <li className="text-body-s text-text-secondary">No tags yet.</li>
            ) : null}
          </ul>
          {active > 0 ? (
            <TextButton size="sm" onClick={() => onChange(NO_FILTERS)}>
              Clear filters
            </TextButton>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { FilterMenu, NO_FILTERS }
export type { CandidateFilters, FilterMenuProps }
