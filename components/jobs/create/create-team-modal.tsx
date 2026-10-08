'use client'

import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, Modal, ModalActions, TextInput } from '@/components/ui'
import { validateTeamName } from '@/lib/jobs/draft'
import { useMe } from '@/lib/queries'

interface CreateTeamModalProps {
  /** Names already taken, so a duplicate can be refused. */
  existing: string[]
  onCreate: (name: string) => void
  onClose: () => void
}

/**
 * Creating a team without leaving the job form. Figma: "Create new team or
 * department" (8973:608898, filled at 8973:609062).
 */
function CreateTeamModal({ existing, onCreate, onClose }: CreateTeamModalProps) {
  const me = useMe()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const organization = me.data?.legal_full_name || me.data?.first_name || 'Your workspace'

  function submit() {
    const problem = validateTeamName(name, existing)
    if (problem) {
      setError(problem)
      return
    }
    onCreate(name.trim())
  }

  return (
    <Modal
      open
      width={500}
      title="Create new team or department"
      icon={<DashboardIcon name="user-group-solid" size={14} />}
      onClose={onClose}
    >
      <p className="-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary">
        Create a new team to organize employees by department or function.
      </p>
      <form
        className="flex flex-col gap-[28px]"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <TextInput label="Organization" value={organization} disabled readOnly />
        <TextInput
          label="Team/Department"
          placeholder="Enter team name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          showHelper
          helperText="No special characters"
          errorText={error ?? undefined}
        />
      </form>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={submit}>
          Create Team
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { CreateTeamModal }
export type { CreateTeamModalProps }
