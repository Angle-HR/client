'use client'

import { Fragment, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Modal } from '@/components/ui'

/** Keys pressed together, e.g. ['Alt/⌥', 'J']. An `icon:` key is drawn with that design-system icon. */
type Chord = string[]

interface ShortcutRow {
  label: string
  /** Alternatives ("or") for the key column; null when the design shows a dash. */
  notTyping: Chord[] | null
  whileTyping: Chord[] | null
}

interface ShortcutSection {
  title: string
  rows: ShortcutRow[]
}

/** The rows of the Keyboard shortcuts dialog (03). Rows the app cannot do yet are kept as drawn. */
const SECTIONS: ReadonlyArray<ShortcutSection> = [
  {
    title: 'Navigating',
    rows: [
      {
        label: 'Next candidate',
        notTyping: [['J'], ['icon:arrow-right-solid']],
        whileTyping: [['Alt/⌥', 'J']],
      },
      {
        label: 'Previous candidate',
        notTyping: [['K'], ['icon:arrow-left-solid']],
        whileTyping: [['Alt/⌥', 'K']],
      },
    ],
  },
  {
    title: 'Actions',
    rows: [
      {
        label: 'Shortlist/Advance',
        notTyping: [['A']],
        whileTyping: [['Alt/⌥', 'A']],
      },
      {
        label: 'Disqualify',
        notTyping: [['D']],
        whileTyping: [['Esc', 'D']],
      },
      {
        label: 'Focus notes',
        notTyping: [['N']],
        whileTyping: null,
      },
      {
        label: 'Save notes',
        notTyping: null,
        whileTyping: [['Ctrl / ⌘', 'Enter']],
      },
      {
        label: 'Show shortcuts',
        notTyping: [['Ctrl / ⌘', '/']],
        whileTyping: [['Ctrl / ⌘', '/']],
      },
    ],
  },
]

/** One key as a small chip, as the design draws them. */
function KeyChip({ label }: { label: string }): ReactElement {
  return (
    <kbd className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-xs-4 border-[0.5px] border-border-transparent-medium bg-bg-transparent-light px-[5px] font-sans text-caption-m font-medium text-text-secondary">
      {label.startsWith('icon:') ? <DashboardIcon name={label.slice(5)} size={10} /> : label}
    </kbd>
  )
}

/** A cell's chords, joined by "or" and with "+" between the keys of a chord. */
function ChordList({ chords }: { chords: Chord[] | null }): ReactElement {
  if (!chords) return <span className="text-body-xs text-text-tertiary">-</span>
  return (
    <span className="flex flex-wrap items-center gap-[6px]">
      {chords.map((chord, chordIndex) => (
        <Fragment key={chord.join('+')}>
          {chordIndex > 0 ? <span className="text-caption-m text-text-tertiary">or</span> : null}
          <span className="flex items-center gap-[4px]">
            {chord.map((key, keyIndex) => (
              <Fragment key={key}>
                {keyIndex > 0 ? <span className="text-caption-m text-text-tertiary">+</span> : null}
                <KeyChip label={key} />
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

interface ShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * The Keyboard shortcuts dialog (03), opened by the panel's Shortcuts button
 * and by Ctrl/⌘ + /. The "Learn more" link has no destination designed yet, so it is drawn inert.
 */
function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps): ReactElement {
  return (
    <Modal
      open={open}
      title="Keyboard shortcuts"
      onClose={onClose}
      icon={<DashboardIcon name="cmd-solid" size={14} />}
    >
      <div className="flex flex-col gap-[20px]">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-[8px]">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-[24px] text-caption-m text-text-tertiary">
              <span className="font-semibold text-text-primary">{section.title}</span>
              <span className="w-[120px]">Not typing</span>
              <span className="w-[120px]">While typing</span>
            </div>
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-[24px] py-[2px]"
              >
                <span className="text-body-xs leading-19_2 text-text-primary">{row.label}</span>
                <span className="w-[120px]">
                  <ChordList chords={row.notTyping} />
                </span>
                <span className="w-[120px]">
                  <ChordList chords={row.whileTyping} />
                </span>
              </div>
            ))}
          </div>
        ))}
        <p>
          <span className="inline-flex items-center gap-[4px] text-caption-m font-medium text-text-blue-accent">
            Learn more about shortcuts
            <DashboardIcon name="arrow-top-right-on-square-solid" size={10} />
          </span>
        </p>
      </div>
    </Modal>
  )
}

export { ShortcutsDialog }
export type { ShortcutsDialogProps }
