'use client'

import { useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { IconButton, Modal, TextButton, TextInput } from '@/components/ui'
import { apiMessage } from '@/lib/jobs/api'
import { useDeleteStage, useRenameStage, useReorderStages } from '@/lib/mutations'

import type { PipelineStage } from '@/lib/applications/pipeline'

interface ManageStagesDialogProps {
  jobId: string
  stages: ReadonlyArray<PipelineStage>
  onClose: () => void
}

/**
 * Renames, reorders and removes a job's stages. Hired and Disqualified end an
 * application, so they stay last and cannot be removed; a stage can be removed
 * only when it is a custom one with nobody in it (the server checks).
 */
function ManageStagesDialog({ jobId, stages, onClose }: ManageStagesDialogProps): ReactElement {
  const rename = useRenameStage(jobId)
  const remove = useDeleteStage(jobId)
  const reorder = useReorderStages(jobId)
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState('')

  const open = stages.filter((stage) => !stage.final)
  const final = stages.filter((stage) => stage.final)
  const fail = (cause: unknown): void =>
    setError(apiMessage(cause, 'That did not go through. Try again.'))

  function move(index: number, by: -1 | 1): void {
    const ids = open.map((stage) => stage.id)
    const target = index + by
    if (target < 0 || target >= ids.length) return
    const moved = ids[index] as string
    ids[index] = ids[target] as string
    ids[target] = moved
    setError('')
    reorder.mutate(ids, { onError: fail })
  }

  function save(): void {
    if (!editing || !editing.name.trim()) return
    setError('')
    rename.mutate(
      { stageId: editing.id, name: editing.name.trim() },
      { onSuccess: () => setEditing(null), onError: fail },
    )
  }

  const busy = rename.isPending || remove.isPending || reorder.isPending

  return (
    <Modal
      open
      title="Manage stages"
      icon={<DashboardIcon name="adjustments-horizontal-solid" size={14} />}
      onClose={onClose}
      width={500}
    >
      <ul className="flex flex-col gap-[4px]">
        {open.map((stage, index) => (
          <li key={stage.id} className="flex items-center gap-[8px]">
            {editing?.id === stage.id ? (
              <div className="flex min-w-0 flex-1 items-center gap-[8px]">
                <div className="min-w-0 flex-1">
                  <TextInput
                    aria-label="Stage name"
                    value={editing.name}
                    onChange={(event) => setEditing({ id: stage.id, name: event.target.value })}
                  />
                </div>
                <TextButton size="sm" disabled={busy} onClick={save}>
                  Save
                </TextButton>
                <TextButton size="sm" onClick={() => setEditing(null)}>
                  Cancel
                </TextButton>
              </div>
            ) : (
              <>
                <span className="min-w-0 flex-1 truncate text-body-s text-text-primary">
                  {stage.name}
                  <span className="ml-[6px] text-caption-m text-text-secondary">{stage.count}</span>
                </span>
                <IconButton
                  variant="tertiary"
                  size="sm"
                  aria-label={`Move ${stage.name} up`}
                  disabled={index === 0 || busy}
                  onClick={() => move(index, -1)}
                  icon={<DashboardIcon name="arrow-up-solid" size={12} />}
                />
                <IconButton
                  variant="tertiary"
                  size="sm"
                  aria-label={`Move ${stage.name} down`}
                  disabled={index === open.length - 1 || busy}
                  onClick={() => move(index, 1)}
                  icon={<DashboardIcon name="arrow-down-solid" size={12} />}
                />
                <TextButton
                  size="sm"
                  onClick={() => setEditing({ id: stage.id, name: stage.name })}
                >
                  Rename
                </TextButton>
                {stage.kind === 'custom' ? (
                  <TextButton
                    size="sm"
                    disabled={busy || stage.count > 0}
                    onClick={() => {
                      setError('')
                      remove.mutate(stage.id, { onError: fail })
                    }}
                  >
                    Remove
                  </TextButton>
                ) : null}
              </>
            )}
          </li>
        ))}
        {final.map((stage) => (
          <li
            key={stage.id}
            className="flex items-center gap-[8px] text-body-s text-text-secondary"
          >
            <span className="min-w-0 flex-1 truncate">
              {stage.name}
              <span className="ml-[6px] text-caption-m">{stage.count} · ends the application</span>
            </span>
          </li>
        ))}
      </ul>
      {error ? (
        <p role="alert" className="text-body-s text-text-error">
          {error}
        </p>
      ) : null}
    </Modal>
  )
}

export { ManageStagesDialog }
export type { ManageStagesDialogProps }
