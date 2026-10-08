'use client'

import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  Button,
  Checkbox,
  LabelWrapper,
  Modal,
  ModalActions,
  TextInput,
  Textarea,
} from '@/components/ui'
import { validateTemplateDetails } from '@/lib/jobs/templates'

import type { TemplateDetailErrors, TemplateDetails } from '@/lib/jobs/templates'

interface SaveTemplateModalProps {
  /** Suggested name, from the job's title. */
  defaultName: string
  /** Names already taken, so a duplicate can be refused. */
  existingNames: string[]
  onSave: (details: TemplateDetails) => void
  onClose: () => void
}

/** "Save job details as template". Figma: 8973:613610. */
function SaveTemplateModal({
  defaultName,
  existingNames,
  onSave,
  onClose,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState('')
  const [shared, setShared] = useState(true)
  const [errors, setErrors] = useState<TemplateDetailErrors>({})

  function submit() {
    const found = validateTemplateDetails({ name, description }, existingNames)
    setErrors(found)
    if (Object.keys(found).length === 0) onSave({ name, description, shared })
  }

  return (
    <Modal
      open
      width={500}
      title="Save job details as template"
      icon={<DashboardIcon name="rectangle-group-solid" size={14} />}
      onClose={onClose}
    >
      <p className="-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary">
        Save these job details as a template. You can reuse or edit it anytime from the Templates
        tab.
      </p>
      <TextInput
        label="Name"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setErrors((current) => ({ ...current, name: undefined }))
        }}
        errorText={errors.name}
      />
      <Textarea
        label="Description (Optional)"
        value={description}
        onChange={(event) => {
          setDescription(event.target.value)
          setErrors((current) => ({ ...current, description: undefined }))
        }}
        showToolbar={false}
        // 80px tall in the design, edge to edge.
        className="[&_textarea]:h-[54px] [&_textarea]:resize-none"
        showHelper
        helperText="No special characters, 30 words max."
        errorText={errors.description}
      />
      <div role="group" aria-label="Access" className="flex flex-col items-start gap-[12px]">
        <LabelWrapper label="Access" />
        <Checkbox
          size="sm"
          label="Allow others in your organisation to use this template"
          checked={shared}
          onChange={(event) => setShared(event.target.checked)}
        />
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={submit}>
          Save template
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { SaveTemplateModal }
export type { SaveTemplateModalProps }
