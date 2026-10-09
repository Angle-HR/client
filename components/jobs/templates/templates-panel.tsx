'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, clampLeft, toAnchor } from '@/components/jobs/floating'
import { MenuRow } from '@/components/jobs/job-menus'
import { GroupLabel, formatPostedDate, dotted } from '@/components/jobs/job-status'
import { JobToast } from '@/components/jobs/job-toast'
import { CARD_SURFACE, ChipGlyph } from '@/components/jobs/jobs-board'
import { GroupHeader, cellText, rowRest, rowSelected } from '@/components/jobs/jobs-table'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import { toolbarControl, toolbarSurface } from '@/components/jobs/selection-toolbar'
import {
  Button,
  Checkbox,
  Chip,
  Modal,
  ModalActions,
  RadioButton,
  TextInput,
} from '@/components/ui'
import {
  duplicateTemplates,
  exportTemplates,
  groupTemplates,
  partitionDeletable,
  searchTemplates,
} from '@/lib/jobs/templates'
import { useJobTemplates, useMe } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'

import type { AnchorRect } from '@/components/jobs/floating'
import type { GroupMeta } from '@/components/jobs/job-status'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { JobTemplate, TemplateGroupKey } from '@/lib/jobs/templates'

/**
 * The Templates tab of the jobs page: list and grid of job templates with
 * their single and bulk actions. Figma: "Job Template and secondary action"
 * (8928:518336).
 */

interface TemplatesPanelProps {
  view: 'list' | 'board'
  search: string
}

const TEMPLATE_GROUP_META: Record<TemplateGroupKey, GroupMeta> = {
  pinned: {
    label: 'Pinned',
    icon: 'pin-solid',
    iconClass: 'text-fuchsia-4',
    tintClass: 'bg-fuchsia-4/10',
    hoverTintClass: 'hover:bg-fuchsia-4/10',
  },
  others: {
    label: 'Others',
    icon: 'ellipsis-horizontal-solid',
    iconClass: 'text-text-secondary',
    tintClass: 'bg-bg-transparent-lighter',
    hoverTintClass: 'hover:bg-bg-transparent-lighter',
  },
}

type TemplateDialog =
  | { type: 'delete'; ids: string[] }
  | { type: 'rename'; id: string }
  | { type: 'export'; ids: string[] }

const bodyText = '-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary'

function download(filename: string, contents: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function CreatorChip({ template }: { template: JobTemplate }) {
  return (
    <Chip
      fill="transparent"
      tone="secondary"
      label={template.createdBy.name}
      icon={<PersonAvatar person={template.createdBy} />}
      className="max-w-full min-w-0"
    />
  )
}

function ColumnLabels() {
  return (
    <div className="flex h-full shrink-0 items-center gap-[2px]">
      <span role="columnheader" className={`w-[130px] px-[12px] ${cellText}`}>
        Created by
      </span>
      <span role="columnheader" className={`w-[130px] px-[12px] ${cellText}`}>
        Visibility
      </span>
      <span role="columnheader" className={`w-[91px] px-[12px] ${cellText}`}>
        Times used
      </span>
      <span role="columnheader" className={`w-[100px] px-[12px] ${cellText}`}>
        Last used
      </span>
      <span className="w-[32px]" />
    </div>
  )
}

function RenameModal({
  template,
  onSave,
  onClose,
}: {
  template: JobTemplate
  onSave: (title: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(template.title)
  const trimmed = title.trim()
  return (
    <Modal
      open
      title="Rename Template"
      icon={<DashboardIcon name="pencil-square-solid" size={14} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-[28px]">
        <TextInput label="Old Name" value={template.title} readOnly disabled />
        <TextInput
          label="Enter new name"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={!trimmed || trimmed === template.title}
          onClick={() => onSave(trimmed)}
        >
          Save changes
        </Button>
      </ModalActions>
    </Modal>
  )
}

function ExportTemplatesModal({
  selectedCount,
  onExport,
  onClose,
}: {
  selectedCount: number
  onExport: (scope: 'all' | 'selected', format: 'csv' | 'json') => void
  onClose: () => void
}) {
  const [scope, setScope] = useState<'all' | 'selected'>(selectedCount > 0 ? 'selected' : 'all')
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  // Trimmed to the 9px cap height, like the design's labels.
  const groupLabel =
    'mb-[10px] flex h-[9px] items-center px-[4px] text-body-s leading-none text-text-primary'
  return (
    <Modal
      open
      title="Export Template"
      icon={<DashboardIcon name="arrow-up-tray-solid" size={14} />}
      onClose={onClose}
    >
      <fieldset className="flex flex-col gap-[10px]">
        <legend className={groupLabel}>Selection:</legend>
        <RadioButton
          name="template-export-scope"
          label="All templates"
          checked={scope === 'all'}
          onChange={() => setScope('all')}
        />
        {selectedCount > 0 ? (
          <RadioButton
            name="template-export-scope"
            label={`Selected (${selectedCount})`}
            checked={scope === 'selected'}
            onChange={() => setScope('selected')}
          />
        ) : null}
      </fieldset>
      <fieldset className="flex flex-col gap-[10px]">
        <legend className={groupLabel}>As:</legend>
        <RadioButton
          name="template-export-format"
          label="CSV for Excel, Numbers, or spreadsheets"
          checked={format === 'csv'}
          onChange={() => setFormat('csv')}
        />
        <RadioButton
          name="template-export-format"
          label="JSON"
          checked={format === 'json'}
          onChange={() => setFormat('json')}
        />
      </fieldset>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={() => onExport(scope, format)}>
          Export
        </Button>
      </ModalActions>
    </Modal>
  )
}

function TemplatesPanel({ view, search }: TemplatesPanelProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const templatesQuery = useJobTemplates()
  const me = useMe()
  const templates = useMemo(() => templatesQuery.data ?? [], [templatesQuery.data])

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [collapsed, setCollapsed] = useState<ReadonlySet<TemplateGroupKey>>(new Set())
  const [menu, setMenu] = useState<{ id: string; anchor: AnchorRect } | null>(null)
  const [dialog, setDialog] = useState<TemplateDialog | null>(null)
  const [toast, setToast] = useState<(JobToastState & { detail?: string }) | null>(null)
  const toastId = useRef(0)
  const lastSelectedId = useRef<string | null>(null)

  const groups = useMemo(
    () => groupTemplates(searchTemplates(templates, search)),
    [templates, search],
  )
  const visibleIds = useMemo(() => groups.flatMap((g) => g.templates.map((t) => t.id)), [groups])
  const selected = templates.filter((template) => selectedIds.has(template.id))
  const selectedList = selected.map((template) => template.id)

  const notify = useCallback((message: string, kind: JobToastState['kind'] = 'done') => {
    toastId.current += 1
    setToast({ id: toastId.current, message, kind })
  }, [])

  const edit = useCallback(
    (update: (current: JobTemplate[]) => JobTemplate[]) => {
      const before = queryClient.getQueryData<JobTemplate[]>(queryKeys.jobTemplates) ?? []
      queryClient.setQueryData<JobTemplate[]>(queryKeys.jobTemplates, update(before))
    },
    [queryClient],
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    lastSelectedId.current = null
  }, [])

  // Escape drops the selection, as it does for jobs.
  useEffect(() => {
    if (selectedIds.size === 0) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') clearSelection()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds.size, clearSelection])

  function select(id: string, range: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      const from = lastSelectedId.current ? visibleIds.indexOf(lastSelectedId.current) : -1
      const to = visibleIds.indexOf(id)
      if (range && from !== -1 && to !== -1) {
        for (const each of visibleIds.slice(Math.min(from, to), Math.max(from, to) + 1))
          next.add(each)
      } else if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    lastSelectedId.current = id
  }

  function setPinned(ids: string[], pinned: boolean) {
    edit((current) => current.map((t) => (ids.includes(t.id) ? { ...t, pinned } : t)))
    const plural = ids.length > 1
    notify(
      pinned
        ? plural
          ? 'Templates pinned'
          : 'Template Pinned'
        : plural
          ? 'Templates Unpinned'
          : 'Template Unpinned',
    )
  }

  function duplicate(ids: string[]) {
    const name = me.data?.first_name || me.data?.legal_full_name || 'You'
    edit((current) => [
      ...current,
      ...duplicateTemplates(current, ids, { name, colour: 'blue' }, Date.now()),
    ])
    notify(ids.length > 1 ? 'Templates duplicated' : 'Template Duplicated')
  }

  function confirmDelete(ids: string[]) {
    // Only the creator may delete; anything else is reported, not removed.
    const { deletable, blocked } = partitionDeletable(templates, ids)
    edit((current) => current.filter((t) => !deletable.includes(t.id)))
    setSelectedIds((previous) => new Set([...previous].filter((id) => !deletable.includes(id))))
    setDialog(null)
    toastId.current += 1
    if (blocked > 0) {
      setToast({
        id: toastId.current,
        kind: 'error',
        message: `${blocked} ${blocked === 1 ? 'template' : 'templates'} can't be deleted`,
        detail: 'You can only delete templates you created.',
      })
    } else {
      setToast({
        id: toastId.current,
        kind: 'done',
        message: deletable.length > 1 ? 'Templates deleted' : 'Template deleted',
      })
    }
  }

  if (templatesQuery.isPending) return null

  if (groups.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-body-s leading-19_5 font-medium text-text-tertiary">
          {search.trim() ? 'No template matching your search' : 'No templates yet'}
        </p>
      </div>
    )
  }

  const menuTemplate = menu ? templates.find((t) => t.id === menu.id) : undefined
  const renameTemplate =
    dialog?.type === 'rename' ? templates.find((t) => t.id === dialog.id) : undefined
  const allSelectedPinned = selected.length > 0 && selected.every((t) => t.pinned)

  const moreButton = (template: JobTemplate) => (
    <button
      type="button"
      aria-label={`More actions for ${template.title}`}
      aria-haspopup="menu"
      aria-expanded={menu?.id === template.id}
      onClick={(event) => {
        event.stopPropagation()
        setMenu({ id: template.id, anchor: toAnchor(event.currentTarget.getBoundingClientRect()) })
      }}
      className={`inline-flex cursor-pointer items-center justify-center rounded-xs-4 p-[6px] transition-colors hover:bg-bg-transparent-light hover:text-text-primary ${menu?.id === template.id ? 'bg-bg-transparent-light text-text-primary' : 'text-text-secondary'}`}
    >
      <DashboardIcon name="ellipsis-horizontal-solid" size={11} />
    </button>
  )

  return (
    <>
      {view === 'list' ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <div role="table" aria-label="Job templates" className="flex min-w-[900px] flex-col">
            {groups.map((group, index) => {
              const isCollapsed = collapsed.has(group.key)
              return (
                <div key={group.key} role="rowgroup" className="flex flex-col">
                  <GroupHeader
                    meta={TEMPLATE_GROUP_META[group.key]}
                    count={group.templates.length}
                    collapsed={isCollapsed}
                    columnLabels={index === 0 ? <ColumnLabels /> : null}
                    onToggle={() =>
                      setCollapsed((previous) => {
                        const next = new Set(previous)
                        if (next.has(group.key)) next.delete(group.key)
                        else next.add(group.key)
                        return next
                      })
                    }
                  />
                  {isCollapsed
                    ? null
                    : group.templates.map((template) => {
                        const isSelected = selectedIds.has(template.id)
                        return (
                          <div
                            key={template.id}
                            role="row"
                            aria-selected={isSelected}
                            className={`group flex h-[40px] shrink-0 items-center gap-[2px] px-[16px] transition-colors ${isSelected ? rowSelected : rowRest}`}
                          >
                            <div
                              role="cell"
                              className="flex h-full min-w-0 flex-1 items-center gap-[4px]"
                            >
                              <Checkbox
                                size="sm"
                                checked={isSelected}
                                onChange={() => select(template.id, false)}
                                aria-label={`Select ${template.title}`}
                                className={
                                  isSelected
                                    ? ''
                                    : 'opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'
                                }
                              />
                              <span className="min-w-0 flex-1 truncate py-[4px] text-body-s leading-19_5 font-medium text-text-primary">
                                {template.title}
                              </span>
                            </div>
                            <div
                              role="cell"
                              className="flex h-full shrink-0 items-center px-[12px]"
                            >
                              <Chip
                                tone="secondary"
                                label={dotted(template.department, template.employmentType)}
                                icon={<ChipGlyph name="user-group-solid" />}
                              />
                            </div>
                            <div
                              role="cell"
                              className="flex h-full w-[130px] shrink-0 items-center px-[12px]"
                            >
                              <CreatorChip template={template} />
                            </div>
                            <div
                              role="cell"
                              className="flex h-full w-[130px] shrink-0 items-center px-[12px]"
                            >
                              <Chip
                                fill="transparent"
                                label={template.visibility}
                                icon={<ChipGlyph name="globe-alt-solid" />}
                              />
                            </div>
                            <div role="cell" className={`w-[91px] shrink-0 px-[12px] ${cellText}`}>
                              {template.timesUsed}
                            </div>
                            <div role="cell" className={`w-[100px] shrink-0 px-[12px] ${cellText}`}>
                              {formatPostedDate(template.lastUsedAt)}
                            </div>
                            <div
                              role="cell"
                              className="flex h-full w-[32px] shrink-0 items-center justify-center"
                            >
                              {moreButton(template)}
                            </div>
                          </div>
                        )
                      })}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Scroller and row of columns are separate, as on the jobs board, so a
        // long column's background reaches its last card.
        <div className="min-h-0 flex-1 overflow-auto px-[8px] pb-[8px]">
          <div className="flex min-h-full w-max items-stretch gap-[8px]">
            {groups.map((group) => (
              <section
                key={group.key}
                aria-label={TEMPLATE_GROUP_META[group.key].label}
                className="flex w-[334px] shrink-0 flex-col gap-[10px] rounded-xs-4 bg-bg-transparent-lighter p-[8px]"
              >
                <header
                  className={`flex h-[32px] shrink-0 items-center gap-[3px] pr-[2px] pl-[10px] transition-colors ${TEMPLATE_GROUP_META[group.key].hoverTintClass}`}
                >
                  <GroupLabel meta={TEMPLATE_GROUP_META[group.key]} gapClass="gap-[6px]" />
                  <span className="relative top-px inline-flex items-center gap-[3px] text-caption-s leading-16 text-text-tertiary">
                    <span aria-hidden="true">·</span>
                    {group.templates.length}
                  </span>
                </header>
                <div className="flex flex-col gap-[10px]">
                  {group.templates.map((template) => {
                    const isSelected = selectedIds.has(template.id)
                    return (
                      <article
                        key={template.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={(event) => select(template.id, event.shiftKey)}
                        onKeyDown={(event) => {
                          if (event.key === ' ' || event.key === 'Enter') {
                            event.preventDefault()
                            select(template.id, event.shiftKey)
                          }
                        }}
                        className={`flex w-full shrink-0 cursor-pointer rounded-lg-10 bg-bg-secondary p-[4px] shadow-slots-xsmall outline-[0.5px] -outline-offset-[0.5px] transition-colors ${isSelected ? CARD_SURFACE.selected : CARD_SURFACE.rest}`}
                      >
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-[4px] p-[6px]">
                          <div className="flex h-[19px] w-full items-center justify-between px-[2px] pb-[2px]">
                            <h3 className="truncate text-body-s leading-19_5 font-medium text-text-primary">
                              {template.title}
                            </h3>
                            {moreButton(template)}
                          </div>
                          <CreatorChip template={template} />
                          <Chip
                            tone="secondary"
                            label={template.visibility}
                            icon={<ChipGlyph name="user-group-solid" />}
                          />
                          <Chip
                            fill="transparent"
                            label={String(template.timesUsed)}
                            aria-label={`Used ${template.timesUsed} times`}
                            icon={<ChipGlyph name="clock-solid" />}
                          />
                          <Chip
                            fill="transparent"
                            label={formatPostedDate(template.lastUsedAt)}
                            icon={<ChipGlyph name="clock-solid" />}
                          />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 ? (
        <div
          role="toolbar"
          aria-label="Selected templates"
          className={`absolute bottom-[24px] left-1/2 z-20 flex h-[35px] -translate-x-1/2 items-center gap-[6px] px-[7px] ${toolbarSurface}`}
        >
          <span
            aria-live="polite"
            className="flex h-[16px] items-center border-r border-white/6 px-[10px] text-caption-m leading-17_6 font-medium whitespace-nowrap text-light-grey-7"
          >
            {selected.length} selected
          </span>
          <button
            type="button"
            onClick={() => setPinned(selectedList, !allSelectedPinned)}
            className={`${toolbarControl} gap-[4px] px-[8px]`}
          >
            <DashboardIcon name={allSelectedPinned ? 'unpin-solid' : 'pin-solid'} size={14} />
            <span className="text-body-s leading-19_5 font-medium">
              {allSelectedPinned ? 'Unpin' : 'Pin'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => duplicate(selectedList)}
            className={`${toolbarControl} gap-[4px] px-[8px]`}
          >
            <DashboardIcon name="document-duplicate-solid" size={14} />
            <span className="text-body-s leading-19_5 font-medium">Duplicate</span>
          </button>
          <button
            type="button"
            aria-label="Delete selected templates"
            onClick={() => setDialog({ type: 'delete', ids: selectedList })}
            className={`${toolbarControl} w-[24px] text-red-7! hover:text-red-7!`}
          >
            <DashboardIcon name="trash-solid" size={14} />
          </button>
          <button
            type="button"
            aria-label="Clear selection"
            onClick={clearSelection}
            className={`${toolbarControl} w-[24px]`}
          >
            <DashboardIcon name="x-mark-solid" size={14} />
          </button>
        </div>
      ) : null}

      {menu && menuTemplate ? (
        <Floating
          anchor={menu.anchor}
          onClose={() => setMenu(null)}
          place={({ width, height }) => ({
            left: clampLeft(menu.anchor.left - width - 3, width),
            top: Math.max(8, Math.min(menu.anchor.top, window.innerHeight - height - 6)),
          })}
          className="w-[190px] rounded-t-lg-10 rounded-b-lg-12 p-[5px] shadow-md"
        >
          <ul
            role="menu"
            aria-label={`Actions for ${menuTemplate.title}`}
            className="flex flex-col gap-[2px]"
          >
            <MenuRow
              icon="rectangle-group-solid"
              label="Use"
              onClick={() => {
                setMenu(null)
                router.push(`/dashboard/jobs/new?template=${menuTemplate.id}`)
              }}
            />
            <MenuRow
              icon="pencil-square-solid"
              label="Edit"
              onClick={() => {
                setMenu(null)
                router.push(`/dashboard/jobs/new?template=${menuTemplate.id}&mode=edit`)
              }}
            />
            {/* Renaming, like deleting, is for the template's creator. */}
            {menuTemplate.ownedByMe ? (
              <MenuRow
                icon="pencil-solid"
                label="Rename"
                onClick={() => {
                  setMenu(null)
                  setDialog({ type: 'rename', id: menuTemplate.id })
                }}
              />
            ) : null}
            <MenuRow
              icon="document-duplicate-solid"
              label="Duplicate"
              onClick={() => {
                setMenu(null)
                duplicate([menuTemplate.id])
              }}
            />
            <MenuRow
              icon={menuTemplate.pinned ? 'unpin-solid' : 'pin-solid'}
              label={menuTemplate.pinned ? 'Unpin' : 'Pin'}
              onClick={() => {
                setMenu(null)
                setPinned([menuTemplate.id], !menuTemplate.pinned)
              }}
            />
            <MenuRow
              icon="arrow-up-tray-solid"
              label="Export"
              onClick={() => {
                setMenu(null)
                setDialog({ type: 'export', ids: [menuTemplate.id] })
              }}
            />
            <li role="presentation" className="h-px" />
            <MenuRow
              icon="trash-solid"
              iconSize={14}
              label="Delete"
              danger
              onClick={() => {
                setMenu(null)
                setDialog({ type: 'delete', ids: [menuTemplate.id] })
              }}
            />
          </ul>
        </Floating>
      ) : null}

      {dialog?.type === 'delete' ? (
        <Modal
          open
          title="Delete selection"
          icon={<DashboardIcon name="trash-solid" size={14} />}
          onClose={() => setDialog(null)}
        >
          <p className={bodyText}>Are you sure you want to delete this template?</p>
          <ModalActions>
            <Button variant="primary" accent="default" size="md" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              accent="red"
              size="md"
              onClick={() => confirmDelete(dialog.ids)}
            >
              Delete
            </Button>
          </ModalActions>
        </Modal>
      ) : null}

      {renameTemplate ? (
        <RenameModal
          template={renameTemplate}
          onClose={() => setDialog(null)}
          onSave={(title) => {
            edit((current) =>
              current.map((t) => (t.id === renameTemplate.id ? { ...t, title } : t)),
            )
            setDialog(null)
            notify('Changes saved')
          }}
        />
      ) : null}

      {dialog?.type === 'export' ? (
        <ExportTemplatesModal
          selectedCount={dialog.ids.length}
          onClose={() => setDialog(null)}
          onExport={(scope, format) => {
            const chosen =
              scope === 'all' ? templates : templates.filter((t) => dialog.ids.includes(t.id))
            setDialog(null)
            download(
              `job-templates.${format}`,
              exportTemplates(chosen, format),
              format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
            )
            notify('Selection exported')
          }}
        />
      ) : null}

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </>
  )
}

export { TemplatesPanel }
