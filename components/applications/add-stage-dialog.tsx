'use client'

import { useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Modal, ModalActions, TextInput } from '@/components/ui'

interface AddStageDialogProps {
  pending: boolean
  onCancel: () => void
  onConfirm: (name: string) => void
}

/** Names a new stage. It is added before Hired. */
function AddStageDialog({ pending, onCancel, onConfirm }: AddStageDialogProps): ReactElement {
  const [name, setName] = useState('')
  const blocked = !name.trim()
  return (
    <Modal
      open
      title="Add new stage"
      icon={<DashboardIcon name="plus-solid" size={14} />}
      onClose={onCancel}
      width={400}
    >
      <TextInput
        label="Stage name"
        placeholder="e.g. Technical test"
        helperText="The stage is added before Hired."
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={blocked || pending}
          loading={pending}
          onClick={() => onConfirm(name.trim())}
        >
          Add stage
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { AddStageDialog }
export type { AddStageDialogProps }
