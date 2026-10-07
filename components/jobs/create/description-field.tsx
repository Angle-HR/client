'use client'

import { useEffect, useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, toAnchor } from '@/components/jobs/floating'
import { PanelHeader, panel, rowBase, rowText } from '@/components/jobs/job-filters'
import { Button, Modal, ModalActions, RichTextInput } from '@/components/ui'
import {
  CONNECT_ERRORS,
  GENERATE_STEPS,
  IMPROVEMENTS,
  describeChange,
  draftDescription,
  editSteps,
  improveDescription,
  lengthenDescription,
  mcpEndpoint,
  shortenDescription,
} from '@/lib/jobs/ai-description'

import type { AnchorRect } from '@/components/jobs/floating'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { AiAccess, ConnectError } from '@/lib/jobs/ai-description'

/**
 * The job description editor and its AI drafting. Figma: "Adding description
 * with AI" (8973:610003 – 8973:612039) and "without AI" (8973:610142).
 *
 * "Generate" does what the person's access allows: explains that AI is not
 * available or needs an admin, offers the MCP connection, or drafts. Once a
 * draft exists the button becomes "Edit with AI" and opens the edits.
 */

interface DescriptionFieldProps {
  value: string
  onChange: (value: string) => void
  /** What the draft is written about. */
  title: string
  team: string
  workspace: string
  access: AiAccess
  onAccessChange: (access: AiAccess) => void
  /** Makes connecting fail in this way, so the error states can be reached. */
  connectError?: ConnectError
  onToast: (toast: Omit<JobToastState, 'id'>) => void
}

// How long each progress line takes. A real model would report these itself.
const STEP_MS = 900

type Menu =
  | { type: 'edits'; anchor: AnchorRect }
  | { type: 'improve'; anchor: AnchorRect }
  | { type: 'describe'; anchor: AnchorRect; improving: boolean }

interface Run {
  steps: string[]
  /** Index of the line being worked on. */
  current: number
  result: string
}

/** Under the trigger, right edges aligned, as the design hangs the AI menus. */
const underRight = (anchor: AnchorRect) => (size: { width: number }) => ({
  top: anchor.bottom + 1,
  left: Math.max(8, anchor.right - size.width),
})

const separator = 'mx-[-4px] h-px bg-border-transparent-light'

function ProgressList({ run }: { run: Run }) {
  return (
    <div
      role="status"
      aria-label="Writing the description"
      className="absolute inset-x-px top-[16px] bottom-[16px] z-10 flex items-center justify-center rounded-sm-7 bg-bg-secondary"
    >
      <ul className="flex w-[317px] flex-col gap-[2px]">
        {run.steps.map((step, index) => {
          const done = index < run.current
          const active = index === run.current
          return (
            <li
              key={step}
              className="flex h-[29px] items-center gap-[4px] border-b border-border-transparent-light px-[8px]"
            >
              <span
                className={`inline-flex ${done ? 'text-green-5' : active ? 'animate-spin text-text-secondary' : 'text-text-tertiary'}`}
              >
                <DashboardIcon
                  name={
                    done
                      ? 'check-circle-solid'
                      : active
                        ? 'spinner-dual-solid'
                        : 'circle-empty-outline'
                  }
                  size={13}
                />
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-body-xs leading-none ${done ? 'text-green-5' : active ? 'text-text-primary' : 'text-text-tertiary'}`}
              >
                {step}
              </span>
              <span className="text-caption-s leading-none text-text-tertiary">
                {done ? '100%' : active ? '50%' : '0%'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface McpModalProps {
  endpoint: string
  onDone: () => void
  onClose: () => void
  onCopied: () => void
}

/** "Connect to the Open HR MCP server". Figma: 8973:610701. */
function McpModal({ endpoint, onDone, onClose, onCopied }: McpModalProps) {
  return (
    <Modal
      open
      width={500}
      title="Connect to the Open HR MCP server"
      icon={<DashboardIcon name="sparkles-solid" size={14} />}
      onClose={onClose}
    >
      <p className="-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary">
        Connect Claude, Codex, Kimi or any other MCP-compatible app. Copy the endpoint below and
        paste it into your AI app&apos;s MCP settings.
      </p>
      <div className="flex flex-col items-start gap-[16px]">
        <div className="flex h-[32px] w-full">
          <input
            readOnly
            value={endpoint}
            aria-label="MCP endpoint"
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 truncate rounded-l-sm-8 border border-border-input-disabled bg-bg-input-disabled px-[8px] text-body-m text-text-input-disabled outline-none"
          />
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(endpoint).then(onCopied, () => {})
            }}
            className="flex shrink-0 cursor-pointer items-center gap-[8px] rounded-r-sm-8 border border-l-0 border-border-flow-btn-sec-rest bg-bg-flow-btn-sec-rest px-[10px] text-body-l font-medium text-text-flow-btn-secondary transition-colors hover:bg-bg-flow-btn-sec-hover"
          >
            Copy
            <DashboardIcon name="clipboard-document-outline" size={15} />
          </button>
        </div>
        <a
          href="/dashboard/help"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[22px] items-center gap-[2px] rounded-sm-6 px-[6px] text-body-xs leading-none text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
        >
          Learn how to connect your AI
          <DashboardIcon name="arrow-top-right-on-square-outline" size={10} />
        </a>
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" accent="blue" size="md" onClick={onDone}>
          Done
        </Button>
      </ModalActions>
    </Modal>
  )
}

function DescriptionField({
  value,
  onChange,
  title,
  team,
  workspace,
  access,
  onAccessChange,
  connectError,
  onToast,
}: DescriptionFieldProps) {
  // True once AI has written what is in the editor, which is when edits apply.
  const [drafted, setDrafted] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [instruction, setInstruction] = useState('')
  const [run, setRun] = useState<Run | null>(null)
  const latest = useRef({ onChange })
  useEffect(() => {
    latest.current = { onChange }
  })

  // Walk the progress list a line at a time, then hand over the result.
  useEffect(() => {
    if (!run) return
    const timer = window.setTimeout(() => {
      if (run.current + 1 < run.steps.length) {
        setRun({ ...run, current: run.current + 1 })
        return
      }
      latest.current.onChange(run.result)
      setDrafted(true)
      setRun(null)
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [run])

  const hasDraft = drafted && value.replace(/<[^>]*>/g, '').trim().length > 0

  function start(steps: string[], result: string) {
    setMenu(null)
    setRun({ steps, current: 0, result })
  }

  function generate() {
    if (access === 'unavailable') {
      onToast({
        kind: 'info',
        message: 'AI integration coming soon',
        detail:
          "We're building a way to connect your own AI to Open HR. We'll let you know when it's ready",
      })
    } else if (access === 'restricted') {
      onToast({
        kind: 'info',
        message: 'Admin access needed',
        detail: 'Ask your workspace admin to connect AI tools or give you permission.',
        action: {
          label: 'Request access',
          onClick: () => onToast({ kind: 'done', message: 'Request sent' }),
        },
      })
    } else if (access === 'disconnected') {
      setConnecting(true)
    } else {
      start(GENERATE_STEPS, draftDescription({ title, team, context: value }))
    }
  }

  function connect() {
    setConnecting(false)
    if (connectError) {
      const copy = CONNECT_ERRORS[connectError]
      onToast({
        kind: 'error',
        message: copy.message,
        detail: copy.detail,
        // Creating a key has no screen yet, so every follow-up reopens the
        // connection dialog.
        action: { label: copy.action, onClick: () => setConnecting(true) },
      })
      return
    }
    onAccessChange('connected')
    onToast({
      kind: 'done',
      message: 'MCP connected.',
      detail: 'You can disconnect it anytime in Account settings then MCPs',
    })
  }

  function applyInstruction(improving: boolean) {
    const note = instruction.trim()
    if (!note) return
    setInstruction('')
    start(
      editSteps(improving ? 'Improving the content' : 'Making your change'),
      describeChange(value, note),
    )
  }

  const trigger = (
    <button
      type="button"
      aria-haspopup={hasDraft ? 'menu' : undefined}
      aria-expanded={hasDraft ? menu !== null : undefined}
      disabled={run !== null}
      onClick={(event) => {
        if (!hasDraft) {
          generate()
          return
        }
        setMenu(
          menu
            ? null
            : { type: 'edits', anchor: toAnchor(event.currentTarget.getBoundingClientRect()) },
        )
      }}
      // Sits 2px into the editor's padding, so its right edge is 10px from the border.
      className={`-mr-[2px] flex h-[24px] shrink-0 cursor-pointer items-center gap-[4px] rounded-sm-7 px-[8px] text-body-s leading-none font-medium text-text-btn-blue-tertiary transition-colors hover:bg-bg-transparent-light disabled:cursor-default disabled:opacity-60 ${menu ? 'bg-bg-transparent-light' : ''}`}
    >
      <DashboardIcon name="sparkles-solid" size={14} />
      {hasDraft ? 'Edit with AI' : 'Generate'}
      {hasDraft ? <DashboardIcon name="chevron-down-solid" size={14} /> : null}
    </button>
  )

  return (
    <div className="relative">
      <RichTextInput
        label="Full Job Description"
        placeholder={
          access === 'connected'
            ? 'Add some context so AI can write a better draft'
            : 'Write or paste the full job description'
        }
        value={value}
        onChange={onChange}
        showToolbar
        toolbarAction={trigger}
        showHelper
        helperText="Clear and specific wins"
        // Height limits are the designer's: 237px minimum, 500px maximum.
        className="[&_[contenteditable]]:max-h-[444px] [&_[contenteditable]]:min-h-[181px] [&_[contenteditable]]:overflow-y-auto"
      />
      {run ? <ProgressList run={run} /> : null}

      {connecting ? (
        <McpModal
          endpoint={mcpEndpoint(workspace)}
          onDone={connect}
          onClose={() => setConnecting(false)}
          onCopied={() => onToast({ kind: 'done', message: 'Endpoint copied to your clipboard' })}
        />
      ) : null}

      {menu?.type === 'edits' ? (
        <Floating
          anchor={menu.anchor}
          place={underRight(menu.anchor)}
          className={panel}
          onClose={() => setMenu(null)}
        >
          <ul role="menu" aria-label="Edit with AI" className="flex flex-col px-[4px] pt-[4px]">
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  start(GENERATE_STEPS, draftDescription({ title, team, context: '' }))
                }
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="sparkles-solid" size={14} />
                </span>
                <span className={rowText}>Regenerate from scratch</span>
              </button>
            </li>
            <li role="separator" className={`my-[2px] ${separator}`} />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => start(editSteps('Making it shorter'), shortenDescription(value))}
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="scissors-solid" size={14} />
                </span>
                <span className={rowText}>Make it shorter</span>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => start(editSteps('Making it longer'), lengthenDescription(value))}
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="bars-3-bottom-left-solid" size={14} />
                </span>
                <span className={rowText}>Make it Longer</span>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                onClick={() => setMenu({ type: 'improve', anchor: menu.anchor })}
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="arrow-trending-up-solid" size={14} />
                </span>
                <span className={rowText}>Improve the content</span>
                <span className="inline-flex text-text-light">
                  <DashboardIcon name="chevron-right-outline" size={14} />
                </span>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenu({ type: 'describe', anchor: menu.anchor, improving: false })}
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="pencil-square-solid" size={14} />
                </span>
                <span className={rowText}>Describe a change</span>
              </button>
            </li>
            <li role="separator" className={`my-[2px] ${separator}`} />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  setDrafted(false)
                  onChange('')
                }}
                className={`${rowBase} text-text-error`}
              >
                <span className="inline-flex">
                  <DashboardIcon name="trash-solid" size={14} />
                </span>
                <span className="min-w-0 flex-1 truncate text-body-s leading-19_5">
                  Clear description
                </span>
              </button>
            </li>
          </ul>
        </Floating>
      ) : null}

      {menu?.type === 'improve' ? (
        <Floating
          anchor={menu.anchor}
          place={underRight(menu.anchor)}
          className={panel}
          onClose={() => setMenu(null)}
        >
          <PanelHeader
            title="Improve the content"
            icon="chevron-left-outline"
            iconLabel="Back"
            onIconClick={() => setMenu({ type: 'edits', anchor: menu.anchor })}
          />
          <ul
            role="menu"
            aria-label="Improve the content"
            className="flex flex-col gap-[2px] px-[4px] pt-[4px]"
          >
            {IMPROVEMENTS.map((improvement) => (
              <li key={improvement.value} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    start(editSteps(improvement.step), improveDescription(value, improvement.value))
                  }
                  className={rowBase}
                >
                  <span className="inline-flex text-text-tertiary">
                    <DashboardIcon name="circle-empty-outline" size={14} />
                  </span>
                  <span className={rowText}>{improvement.label}</span>
                </button>
              </li>
            ))}
            <li role="separator" className={`-mt-[2px] mb-[2px] ${separator}`} />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenu({ type: 'describe', anchor: menu.anchor, improving: true })}
                className={rowBase}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="pencil-square-solid" size={14} />
                </span>
                <span className={rowText}>Describe what to improve</span>
              </button>
            </li>
          </ul>
        </Floating>
      ) : null}

      {menu?.type === 'describe' ? (
        <Floating
          anchor={menu.anchor}
          place={underRight(menu.anchor)}
          className={panel}
          onClose={() => setMenu(null)}
          focusFirstItem={false}
        >
          <PanelHeader
            title="Edit with AI"
            icon="chevron-left-outline"
            iconLabel="Back"
            onIconClick={() =>
              setMenu({ type: menu.improving ? 'improve' : 'edits', anchor: menu.anchor })
            }
          />
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              applyInstruction(menu.improving)
            }}
          >
            <div className="flex h-[36px] shrink-0 items-center border-b border-border-transparent-light px-[10px]">
              <input
                autoFocus
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder={menu.improving ? 'Describe what to improve' : 'Describe a change'}
                aria-label={menu.improving ? 'Describe what to improve' : 'Describe a change'}
                className="w-full bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </div>
            <div className="px-[4px] pt-[4px]">
              <button
                type="submit"
                disabled={!instruction.trim()}
                className={`${rowBase} disabled:cursor-default disabled:opacity-50`}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name="sparkles-solid" size={14} />
                </span>
                <span className={rowText}>Apply change</span>
              </button>
            </div>
          </form>
        </Floating>
      ) : null}
    </div>
  )
}

export { DescriptionField }
export type { DescriptionFieldProps }
