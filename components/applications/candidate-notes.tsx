'use client'

import { useState, type ReactElement } from 'react'

import { formatDateTime } from '@/components/applications/candidate-overview'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, IconButton, TextButton, Textarea } from '@/components/ui'
import { useApplicationNoteActions } from '@/lib/mutations'
import { useApplicationNotes } from '@/lib/queries'

import type { Note } from '@/lib/applications/pipeline'

interface CandidateNotesProps {
  jobId: string
  appId: string
  onError: (cause: unknown) => void
}

/** The internal notes of an application: the team sees them, the candidate never does. */
function CandidateNotes({ jobId, appId, onError }: CandidateNotesProps): ReactElement {
  const notes = useApplicationNotes(jobId, appId)
  const { add, edit, remove } = useApplicationNoteActions(jobId, appId)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null)
  // The note whose delete is waiting for a second click: a note cannot be brought back.
  const [confirming, setConfirming] = useState<string | null>(null)

  function submit(): void {
    const body = draft.trim()
    if (!body) return
    add.mutate(body, { onSuccess: () => setDraft(''), onError })
  }

  function save(): void {
    if (!editing || !editing.body.trim()) return
    edit.mutate(
      { noteId: editing.id, body: editing.body.trim() },
      { onSuccess: () => setEditing(null), onError },
    )
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[8px]">
        <Textarea
          label="Add a note"
          placeholder="Add context for your team"
          helperText="This will not be shared with the candidate"
          showToolbar={false}
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          variant="primary"
          accent="blue"
          size="sm"
          className="w-fit"
          disabled={!draft.trim() || add.isPending}
          loading={add.isPending}
          onClick={submit}
        >
          Add note
        </Button>
      </div>

      {notes.isError ? (
        <p role="alert" className="text-body-s text-text-secondary">
          We couldn&apos;t load the notes.
        </p>
      ) : notes.data && notes.data.length === 0 ? (
        <p className="text-body-s text-text-secondary">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-[16px]">
          {(notes.data ?? []).map((note: Note) => (
            <li
              key={note.id}
              className="flex flex-col gap-[6px] rounded-lg-10 bg-bg-transparent-lighter p-[12px]"
            >
              <div className="flex items-center justify-between gap-[8px]">
                <p className="text-caption-m leading-17_6 text-text-secondary">
                  {note.mine ? 'You' : 'A teammate'} · {formatDateTime(note.createdAt)}
                  {note.updatedAt && note.updatedAt !== note.createdAt ? ' · edited' : ''}
                </p>
                {note.mine ? (
                  <div className="flex items-center gap-[2px]">
                    <IconButton
                      variant="tertiary"
                      size="sm"
                      aria-label="Edit note"
                      onClick={() => setEditing({ id: note.id, body: note.body })}
                      icon={<DashboardIcon name="pencil-square-solid" size={12} />}
                    />
                    {confirming === note.id ? (
                      <>
                        <TextButton
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() =>
                            remove.mutate(note.id, {
                              onSuccess: () => setConfirming(null),
                              onError,
                            })
                          }
                        >
                          Delete note
                        </TextButton>
                        <TextButton size="sm" onClick={() => setConfirming(null)}>
                          Keep
                        </TextButton>
                      </>
                    ) : (
                      <IconButton
                        variant="tertiary"
                        size="sm"
                        aria-label="Delete note"
                        onClick={() => setConfirming(note.id)}
                        icon={<DashboardIcon name="trash-solid" size={12} />}
                      />
                    )}
                  </div>
                ) : null}
              </div>
              {editing?.id === note.id ? (
                <div className="flex flex-col gap-[8px]">
                  <Textarea
                    aria-label="Edit note"
                    showToolbar={false}
                    rows={3}
                    value={editing.body}
                    onChange={(event) => setEditing({ id: note.id, body: event.target.value })}
                  />
                  <div className="flex gap-[8px]">
                    <Button
                      variant="primary"
                      accent="blue"
                      size="sm"
                      disabled={!editing.body.trim() || edit.isPending}
                      loading={edit.isPending}
                      onClick={save}
                    >
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-body-s leading-19_5 whitespace-pre-wrap text-text-primary">
                  {note.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { CandidateNotes }
export type { CandidateNotesProps }
