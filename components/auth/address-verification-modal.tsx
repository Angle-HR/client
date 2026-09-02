'use client'

import { useEffect, useRef } from 'react'

import { LocationPinIcon } from '@/components/auth/account-type-icons'
import { Button, ListItemLocation } from '@/components/ui'

/** Which of the two addresses the person wants to save. */
type AddressChoice = 'entered' | 'suggested'

interface AddressVerificationModalProps {
  /** The address exactly as they typed it. */
  entered: string
  /** The corrected address the verifier returned. */
  suggested: string
  choice: AddressChoice
  saving?: boolean
  onChoiceChange: (choice: AddressChoice) => void
  onSave: () => void
  onClose: () => void
}

/**
 * Shown when the verifier returns an address that differs from what was typed.
 * Deliberately not a design-system component: the system has no modal, and
 * adding one is a call for the design team, not something to settle inside a
 * single onboarding step.
 */
function AddressVerificationModal({
  entered,
  suggested,
  choice,
  saving = false,
  onChoiceChange,
  onSave,
  onClose,
}: AddressVerificationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape closes, and focus starts inside the dialog rather than behind it.
  useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      {/* The scrim also dismisses, matching the close button. */}
      <div
        className="absolute inset-0 bg-bg-transparent-strong"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-verification-title"
        tabIndex={-1}
        className="relative flex w-full max-w-[480px] flex-col gap-[20px] rounded-lg-12 bg-bg-secondary p-[20px] shadow-md outline-none"
      >
        <header className="flex items-start justify-between gap-[12px]">
          <h2
            id="address-verification-title"
            className="flex items-center gap-[6px] text-body-l leading-21 font-medium text-text-primary"
          >
            <LocationPinIcon />
            Address verification
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </header>

        <p className="text-body-s leading-19_5 text-text-secondary">
          We suggest updating address to a verified address. Please confirm it or continue with the
          original one.
        </p>

        <div role="radiogroup" aria-label="Address to save" className="flex flex-col gap-[8px]">
          <ListItemLocation
            title="You entered:"
            address={entered}
            showCheckMark={false}
            state={choice === 'entered' ? 'selected' : 'rest'}
            onClick={() => onChoiceChange('entered')}
          />
          <ListItemLocation
            title="Suggested address:"
            address={suggested}
            showCheckMark
            state={choice === 'suggested' ? 'selected' : 'rest'}
            onClick={() => onChoiceChange('suggested')}
          />
        </div>

        <footer className="flex items-center justify-end gap-[8px]">
          <Button variant="secondary" accent="default" size="md" onClick={onClose}>
            Back
          </Button>
          <Button variant="primary" accent="blue" size="md" disabled={saving} onClick={onSave}>
            {saving ? 'Saving...' : 'Save and continue'}
          </Button>
        </footer>
      </div>
    </div>
  )
}

export { AddressVerificationModal }
export type { AddressChoice }
