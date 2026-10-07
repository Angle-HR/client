import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DescriptionField } from '../create/description-field'

import type { AiAccess } from '@/lib/jobs/ai-description'

function Field({
  access,
  connectError,
  onToast = () => {},
}: {
  access: AiAccess
  connectError?: 'general' | 'key' | 'server'
  onToast?: Parameters<typeof DescriptionField>[0]['onToast']
}) {
  const [value, setValue] = useState('')
  const [current, setCurrent] = useState(access)
  return (
    <DescriptionField
      value={value}
      onChange={setValue}
      title="Product Designer"
      team="Design"
      workspace="Acme"
      access={current}
      onAccessChange={setCurrent}
      connectError={connectError}
      onToast={onToast}
    />
  )
}

// Each progress line schedules the next once it has rendered, so the clock is
// moved on a line at a time.
function finishRun(): void {
  for (let step = 0; step < 5; step += 1) {
    act(() => {
      vi.advanceTimersByTime(900)
    })
  }
}

describe('DescriptionField', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('explains that AI is not available yet', () => {
    const onToast = vi.fn()
    render(<Field access="unavailable" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(onToast).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'info', message: 'AI integration coming soon' }),
    )
  })

  it('lets someone without permission ask for access', () => {
    const onToast = vi.fn()
    render(<Field access="restricted" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const toast = onToast.mock.calls[0]?.[0]
    expect(toast).toMatchObject({ message: 'Admin access needed' })
    toast.action.onClick()
    expect(onToast).toHaveBeenLastCalledWith({ kind: 'done', message: 'Request sent' })
  })

  it('offers the MCP endpoint, then drafts once connected', () => {
    const onToast = vi.fn()
    render(<Field access="disconnected" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.getByLabelText('MCP endpoint')).toHaveValue('https://tryopenhr.com/mcp/acme')
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'MCP connected.' }))

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByRole('status', { name: 'Writing the description' })).toBeInTheDocument()
    finishRun()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox').textContent).toContain(
      'We are looking for a Product Designer in our Design team.',
    )
    expect(screen.getByRole('button', { name: 'Edit with AI' })).toBeInTheDocument()
  })

  it('reports a connection that fails and offers another try', () => {
    const onToast = vi.fn()
    render(<Field access="disconnected" connectError="general" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    const toast = onToast.mock.calls[0]?.[0]
    expect(toast).toMatchObject({ kind: 'error', message: "MCP couldn't connect." })
    expect(screen.queryByLabelText('MCP endpoint')).not.toBeInTheDocument()
    act(() => toast.action.onClick())
    expect(screen.getByLabelText('MCP endpoint')).toBeInTheDocument()
  })

  it('says when the key is wrong or the service is down', () => {
    const onToast = vi.fn()
    const { unmount } = render(<Field access="disconnected" connectError="key" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onToast.mock.calls[0]?.[0]).toMatchObject({
      message: 'Key not valid',
      action: { label: 'Create a new key' },
    })
    unmount()

    render(<Field access="disconnected" connectError="server" onToast={onToast} />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onToast.mock.calls[1]?.[0]).toMatchObject({ message: "Open HR isn't responding" })
  })

  it('edits and clears a draft from the Edit with AI menu', () => {
    render(<Field access="connected" />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    finishRun()

    fireEvent.click(screen.getByRole('button', { name: 'Edit with AI' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Improve the content' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add growth path' }))
    expect(screen.getByText('Adding growth path')).toBeInTheDocument()
    finishRun()
    expect(screen.getByRole('textbox').textContent).toContain('Where this role can go')

    fireEvent.click(screen.getByRole('button', { name: 'Edit with AI' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Clear description' }))
    expect(screen.getByRole('textbox').textContent).toBe('')
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
  })
})
