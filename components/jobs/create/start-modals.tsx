'use client'

import { useMemo, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, clampLeft, toAnchor } from '@/components/jobs/floating'
import { StartThumbnail } from '@/components/jobs/job-art'
import { DOT } from '@/components/jobs/job-status'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import { Button, Chip, Modal, ModalActions, Tag, TextInput } from '@/components/ui'
import { TEMPLATE_SORTS, searchTemplates, sortTemplates } from '@/lib/jobs/templates'

import type { AnchorRect } from '@/components/jobs/floating'
import type { JobTemplate, TemplateSort } from '@/lib/jobs/templates'

/**
 * The two modals that start a job for someone who already has jobs. Figma:
 * "Existing User creating Job/Job detail" (9008:506870) — "How do you want to
 * start?" (8975:208763) and "Choose a template" (9000:459262).
 */

type StartChoice = 'manual' | 'template' | 'ai'

const START_OPTIONS: {
  value: StartChoice
  title: string
  description: string
  comingSoon?: boolean
}[] = [
  {
    value: 'manual',
    title: 'Create manually',
    description: 'Write the job details yourself.',
  },
  {
    value: 'template',
    title: 'Use a template',
    description: "Start from a template you've saved before.",
  },
  {
    value: 'ai',
    title: 'Create with AI',
    description: 'Describe the role and AI drafts it for you.',
    comingSoon: true,
  },
]

interface StartJobModalProps {
  onContinue: (choice: Exclude<StartChoice, 'ai'>) => void
  onClose: () => void
}

function StartJobModal({ onContinue, onClose }: StartJobModalProps) {
  const [choice, setChoice] = useState<Exclude<StartChoice, 'ai'>>('manual')

  return (
    <Modal
      open
      width={500}
      title="Create a new Job"
      icon={<DashboardIcon name="plus-solid" size={14} />}
      onClose={onClose}
    >
      <p className="-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary">
        How do you want to start?
      </p>
      <div
        role="radiogroup"
        aria-label="How do you want to start?"
        className="flex flex-col gap-[7px]"
      >
        {START_OPTIONS.map((option) => {
          const selected = option.value === choice
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={option.comingSoon}
              onClick={() => option.value !== 'ai' && setChoice(option.value)}
              className={`flex h-[70px] w-full items-center gap-[14px] rounded-[16px] p-[16px] text-left outline-1 -outline-offset-1 transition-colors disabled:cursor-not-allowed ${selected ? 'bg-blue-alpha-5 outline-border-input-focus' : 'cursor-pointer bg-bg-transparent-lighter outline-transparent hover:bg-bg-transparent-light disabled:hover:bg-bg-transparent-lighter'}`}
            >
              <StartThumbnail kind={option.value} />
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="flex items-center gap-[10px]">
                  <span className="text-body-l leading-21 font-semibold text-text-primary">
                    {option.title}
                  </span>
                  {option.comingSoon ? (
                    <Tag label="Coming soon" color="orange" weight="medium" />
                  ) : null}
                </span>
                <span className="truncate text-body-s leading-19_5 text-text-secondary">
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={() => onContinue(choice)}>
          Continue
        </Button>
      </ModalActions>
    </Modal>
  )
}

interface ChooseTemplateModalProps {
  templates: JobTemplate[]
  /** The template already in use, pre-selected when swapping. */
  currentId?: string
  onContinue: (templateId: string) => void
  onBack: () => void
  /** Leaves the picker for the Templates tab. */
  onOpenTemplates: () => void
  onClose: () => void
}

function ChooseTemplateModal({
  templates,
  currentId,
  onContinue,
  onBack,
  onOpenTemplates,
  onClose,
}: ChooseTemplateModalProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<TemplateSort>('mostUsed')
  const [sortAnchor, setSortAnchor] = useState<AnchorRect | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(currentId ?? null)

  const shown = useMemo(
    () => sortTemplates(searchTemplates(templates, query), sort),
    [templates, query, sort],
  )
  const sortLabel = TEMPLATE_SORTS.find((item) => item.value === sort)?.label ?? ''

  return (
    <Modal
      open
      width={700}
      title="Choose a template"
      icon={<DashboardIcon name="rectangle-group-solid" size={14} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-end justify-between">
          <div className="w-[240px]">
            <TextInput
              size="md"
              showLabel={false}
              aria-label="Search templates"
              placeholder="Search templates"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              showPrefixIcon
              prefixIcon={
                <span className="inline-flex text-text-input-placeholder">
                  <DashboardIcon name="magnifying-glass-outline" size={14} />
                </span>
              }
            />
          </div>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={sortAnchor !== null}
            onClick={(event) =>
              setSortAnchor(toAnchor(event.currentTarget.getBoundingClientRect()))
            }
            className="flex h-[22px] cursor-pointer items-center gap-[2px] rounded-sm-6 px-[6px] text-body-xs leading-none text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
          >
            <DashboardIcon name="bars-arrow-up-solid" size={10} />
            {sortLabel}
            <DashboardIcon name="chevron-down-solid" size={10} />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Templates"
          className="flex h-[261px] flex-col overflow-y-auto"
        >
          {templates.length === 0 ? (
            <p className="m-auto max-w-[280px] text-center text-body-s leading-19_5 text-text-tertiary">
              There is no template at the moment. Create a job and save it as a template.
            </p>
          ) : shown.length === 0 ? (
            <p className="m-auto text-body-s leading-19_5 text-text-tertiary">
              No results found for &quot;{query.trim()}&quot;
            </p>
          ) : (
            shown.map((template) => {
              const selected = template.id === selectedId
              return (
                <button
                  key={template.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedId(template.id)}
                  onDoubleClick={() => onContinue(template.id)}
                  className={`flex h-[40px] w-full shrink-0 cursor-pointer items-center gap-[2px] rounded-lg-10 px-[10px] text-left transition-colors ${selected ? 'bg-blue-alpha-5 hover:bg-[image:linear-gradient(var(--bg-transparent-light),var(--bg-transparent-light))]' : 'hover:bg-bg-transparent-light'}`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[4px]">
                    <span className="flex size-[22px] shrink-0 items-center justify-center">
                      <span
                        className={`flex size-[15px] items-center justify-center rounded-full border transition-colors ${selected ? 'border-bg-selection-controls-selected bg-bg-selection-controls-selected' : 'border-border-selection-controls-rest'}`}
                      >
                        {selected ? (
                          <span className="size-[7px] rounded-full bg-text-inverted" />
                        ) : null}
                      </span>
                    </span>
                    <span className="truncate py-[4px] text-body-s leading-19_5 font-medium text-text-primary">
                      {template.title}
                    </span>
                    <Chip
                      fill="transparent"
                      tone="secondary"
                      withIcon={false}
                      label={`${template.department} ${DOT} ${template.employmentType}`}
                    />
                  </span>
                  <span className="flex w-[130px] shrink-0 items-center px-[12px]">
                    <Chip
                      fill="transparent"
                      tone="secondary"
                      label={template.createdBy.name}
                      icon={<PersonAvatar person={template.createdBy} />}
                      className="max-w-full min-w-0"
                    />
                  </span>
                  <span className="flex w-[130px] shrink-0 items-center px-[12px]">
                    <Chip
                      fill="transparent"
                      label={template.visibility}
                      icon={
                        <span className="inline-flex text-text-tertiary">
                          <DashboardIcon
                            name={
                              template.visibility === 'Everyone'
                                ? 'globe-alt-solid'
                                : 'lock-closed-solid'
                            }
                            size={12}
                          />
                        </span>
                      }
                    />
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* A way out to the full templates list, right-aligned under the picker. */}
      <div className="flex h-[23px] justify-end">
        <button
          type="button"
          onClick={onOpenTemplates}
          className="flex h-[23px] cursor-pointer items-center gap-[2px] rounded-sm-6 px-[6px] text-body-s leading-none text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
        >
          <DashboardIcon name="table-cells-solid" size={11} />
          Templates table
        </button>
      </div>

      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={!selectedId}
          onClick={() => selectedId && onContinue(selectedId)}
        >
          Continue
        </Button>
      </ModalActions>

      {sortAnchor ? (
        <Floating
          anchor={sortAnchor}
          onClose={() => setSortAnchor(null)}
          place={({ width }) => ({
            top: sortAnchor.bottom + 3,
            left: clampLeft(sortAnchor.right - width, width),
          })}
          className="w-[146px] rounded-t-lg-10 rounded-b-lg-12 p-[5px] shadow-md"
        >
          <ul role="menu" aria-label="Sort templates" className="flex flex-col gap-[2px]">
            {TEMPLATE_SORTS.map((item) => (
              <li key={item.value} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.value === sort}
                  onClick={() => {
                    setSort(item.value)
                    setSortAnchor(null)
                  }}
                  className="group flex h-[32px] w-full cursor-pointer items-center justify-between rounded-sm-8 px-[6px] text-left transition-colors hover:bg-bg-transparent-light focus-visible:bg-bg-transparent-light focus-visible:outline-none"
                >
                  <span className="text-body-s leading-19_5 text-text-secondary group-hover:text-text-primary">
                    {item.label}
                  </span>
                  {item.value === sort ? (
                    <span className="inline-flex text-text-secondary">
                      <DashboardIcon name="check-outline" size={14} />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </Floating>
      ) : null}
    </Modal>
  )
}

export { ChooseTemplateModal, StartJobModal }
