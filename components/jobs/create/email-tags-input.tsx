'use client'

import { type KeyboardEvent } from 'react'

import { Tag } from '@/components/ui'
import { addEmailTags } from '@/lib/jobs/permissions-step'

import type { EmailTag } from '@/lib/jobs/permissions-step'

/**
 * The "Email address" field of the invite modal: each address becomes a tag,
 * valid ones teal and invalid ones red. Figma: the expanded field in 9270:377117.
 * Enter, a comma, or leaving the field turns what was typed into tags.
 */

interface EmailTagsInputProps {
  tags: EmailTag[]
  draft: string
  /** Draws the red border; the caller shows the message under the field. */
  invalid: boolean
  onTagsChange: (tags: EmailTag[]) => void
  onDraftChange: (draft: string) => void
}

function EmailTagsInput({
  tags,
  draft,
  invalid,
  onTagsChange,
  onDraftChange,
}: EmailTagsInputProps) {
  function commit() {
    if (!draft.trim()) return
    onTagsChange(addEmailTags(tags, draft))
    onDraftChange('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
      return
    }
    // Backspace in an empty field takes the last tag away, as in the design's tag field.
    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1))
    }
  }

  return (
    <div
      className={`flex min-h-[40px] flex-wrap items-center gap-[6px] rounded-sm-8 border bg-bg-input-placeholder px-[8px] py-[6px] ${invalid ? 'border-border-input-error' : 'border-border-input-placeholder focus-within:border-border-input-focus focus-within:bg-bg-input-focus'}`}
    >
      {tags.map((tag, index) => (
        <Tag
          key={`${tag.email}-${index}`}
          label={tag.email}
          color={tag.valid ? 'teal' : 'red'}
          removable
          aria-label={`Remove ${tag.email}`}
          onRemove={() => onTagsChange(tags.filter((_, position) => position !== index))}
        />
      ))}
      <input
        type="text"
        aria-label="Email address"
        aria-invalid={invalid}
        value={draft}
        placeholder={tags.length === 0 ? 'Add emails, comma separated' : ''}
        onChange={(event) => {
          const value = event.target.value
          // Pasted or typed commas turn what is before them into tags straight away.
          const cut = value.lastIndexOf(',')
          if (cut === -1) {
            onDraftChange(value)
            return
          }
          onTagsChange(addEmailTags(tags, value.slice(0, cut)))
          onDraftChange(value.slice(cut + 1).trimStart())
        }}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        className="min-w-[160px] flex-1 bg-transparent text-body-s text-text-primary outline-none placeholder:text-text-input-placeholder"
      />
    </div>
  )
}

export { EmailTagsInput }
export type { EmailTagsInputProps }
