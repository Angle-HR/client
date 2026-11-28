'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'

import { TagPill } from '@/components/applications/tag-pill'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Checkbox, TextButton, TextInput } from '@/components/ui'
import { TAG_COLORS, type Tag } from '@/lib/applications/pipeline'
import { useCreateTag, useSetApplicationTags } from '@/lib/mutations'
import { useTags } from '@/lib/queries'

interface CandidateTagsProps {
  jobId: string
  appId: string
  /** The tags the application has now. */
  applied: ReadonlyArray<Tag>
  /** Whether the person may change tags (the same access as deciding). */
  canEdit: boolean
  /** Whether the person may create company tags (job.manage_any). */
  canCreate: boolean
  onError: (cause: unknown) => void
}

/** The tags of an application as pills, and a menu to add, remove or create one. */
function CandidateTags({
  jobId,
  appId,
  applied,
  canEdit,
  canCreate,
  onError,
}: CandidateTagsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const wrapper = useRef<HTMLDivElement>(null)
  const tags = useTags()
  const setTags = useSetApplicationTags(jobId)
  const createTag = useCreateTag()
  const appliedIds = applied.map((tag) => tag.id)

  // A press outside the menu closes it.
  useEffect(() => {
    if (!open) return
    function handlePress(event: MouseEvent): void {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePress)
    return () => document.removeEventListener('mousedown', handlePress)
  }, [open])

  function toggle(tagId: string, on: boolean): void {
    const next = on ? [...appliedIds, tagId] : appliedIds.filter((id) => id !== tagId)
    setTags.mutate({ appId, tagIds: next }, { onError })
  }

  function create(): void {
    const label = name.trim()
    if (!label) return
    // Colours are taken in turn, so neighbouring tags differ.
    const color = TAG_COLORS[(tags.data?.length ?? 0) % TAG_COLORS.length] ?? 'gray'
    createTag.mutate(
      { name: label, color },
      {
        onSuccess: (tag) => {
          setName('')
          setTags.mutate({ appId, tagIds: [...appliedIds, tag.id] }, { onError })
        },
        onError,
      },
    )
  }

  return (
    <div ref={wrapper} className="relative flex flex-wrap items-center gap-[6px]">
      {applied.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          size="sm"
          onRemove={canEdit ? () => toggle(tag.id, false) : undefined}
        />
      ))}
      {canEdit ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-[2px] rounded-sm-7 px-[6px] py-[2px] text-body-s leading-19_5 text-text-secondary transition-colors hover:bg-bg-transparent-light"
        >
          <DashboardIcon name="tag-solid" size={11} />
          {applied.length === 0 ? 'Add tag' : 'Edit'}
        </button>
      ) : null}
      {open ? (
        <div className="absolute top-full left-0 z-10 mt-[4px] flex w-[260px] flex-col gap-[8px] rounded-lg-10 bg-bg-primary p-[10px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
          <ul className="flex max-h-[180px] flex-col gap-[6px] overflow-y-auto">
            {(tags.data ?? []).map((tag) => (
              <li key={tag.id} className="flex items-center gap-[8px]">
                <Checkbox
                  size="sm"
                  aria-label={tag.name}
                  checked={appliedIds.includes(tag.id)}
                  disabled={setTags.isPending}
                  onChange={(event) => toggle(tag.id, event.target.checked)}
                />
                <TagPill tag={tag} size="sm" />
              </li>
            ))}
            {tags.data && tags.data.length === 0 ? (
              <li className="text-body-s text-text-secondary">No tags yet. Create the first.</li>
            ) : null}
          </ul>
          {canCreate ? (
            <TextInput
              placeholder="New tag"
              aria-label="New tag"
              value={name}
              onChange={(event) => setName(event.target.value)}
              suffix="button"
              suffixButton={
                <TextButton
                  size="sm"
                  disabled={!name.trim() || createTag.isPending}
                  onClick={create}
                >
                  Create
                </TextButton>
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { CandidateTags }
export type { CandidateTagsProps }
