'use client'

import { useMemo, useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  Button,
  Checkbox,
  InputSelection,
  Modal,
  ModalActions,
  TextInput,
  Textarea,
} from '@/components/ui'
import {
  INTERVIEW_KINDS,
  type Interview,
  type InterviewBody,
  type InterviewKind,
} from '@/lib/applications/communications'
import { browserZone, isoToZoned, timeZones, zonedToIso } from '@/lib/applications/time'
import { apiMessage } from '@/lib/jobs/api'
import { useInterviewActions } from '@/lib/mutations'
import { useEmailSettings, useJobMembers } from '@/lib/queries'

const DURATIONS = [15, 30, 45, 60, 90, 120, 180]

interface ScheduleInterviewDialogProps {
  jobId: string
  appId: string
  candidateName: string
  /** Set to reschedule or edit this interview. */
  interview?: Interview
  onClose: () => void
  onDone: (message: string) => void
}

/** Schedules an interview, or reschedules one. The candidate can be sent a calendar invite. */
function ScheduleInterviewDialog({
  jobId,
  appId,
  candidateName,
  interview,
  onClose,
  onDone,
}: ScheduleInterviewDialogProps): ReactElement {
  const members = useJobMembers(jobId)
  const settings = useEmailSettings()
  const { schedule, update } = useInterviewActions(jobId, appId)
  const zones = useMemo(() => timeZones(), [])

  const [zone, setZone] = useState(interview?.timezone || browserZone())
  const initialLocal = interview ? isoToZoned(interview.startsAt, zone) : ''
  const [date, setDate] = useState(initialLocal.slice(0, 10))
  const [time, setTime] = useState(initialLocal.slice(11, 16))
  const [duration, setDuration] = useState(interview?.durationMinutes ?? 45)
  const [kind, setKind] = useState<InterviewKind>(interview?.kind ?? 'video')
  const [location, setLocation] = useState(interview?.location ?? '')
  const [notes, setNotes] = useState(interview?.notes ?? '')
  const [interviewers, setInterviewers] = useState<string[]>(interview?.interviewerIds ?? [])
  const [invite, setInvite] = useState(!interview)
  const [inviteNote, setInviteNote] = useState('')
  const [error, setError] = useState('')

  const startsAt = date && time ? zonedToIso(`${date}T${time}`, zone) : ''
  const needsPlace = kind !== 'phone'
  const noReplyTo = settings.data !== undefined && !settings.data.replyTo
  const pending = schedule.isPending || update.isPending
  const blocked = !startsAt || (needsPlace && !location.trim())
  const kindInfo = INTERVIEW_KINDS.find((item) => item.key === kind)

  function submit(): void {
    setError('')
    const body: InterviewBody = {
      starts_at: startsAt,
      timezone: zone,
      duration_minutes: duration,
      kind,
      location: needsPlace ? location.trim() : '',
      notes: notes.trim(),
      interviewer_ids: interviewers,
      invite,
      invite_note: invite ? inviteNote.trim() : undefined,
    }
    const fail = (cause: unknown): void =>
      setError(apiMessage(cause, 'That did not go through. Try again.'))
    if (interview) {
      update.mutate(
        { id: interview.id, body },
        {
          onSuccess: () => {
            onDone(`Interview with ${candidateName} rescheduled`)
            onClose()
          },
          onError: fail,
        },
      )
      return
    }
    schedule.mutate(body, {
      onSuccess: () => {
        onDone(`Interview with ${candidateName} scheduled`)
        onClose()
      },
      onError: fail,
    })
  }

  return (
    <Modal
      open
      title={interview ? 'Reschedule interview' : `Schedule interview with ${candidateName}`}
      icon={<DashboardIcon name="calendar-solid" size={14} />}
      onClose={onClose}
      width={500}
    >
      <div className="flex flex-col gap-[12px]">
        <div className="grid grid-cols-2 gap-[12px]">
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <TextInput
            label="Time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </div>
        <InputSelection
          label="Time zone"
          searchable
          options={zones.map((item) => ({ value: item, label: item.replace(/_/g, ' ') }))}
          value={zone}
          onChange={(next) => typeof next === 'string' && next && setZone(next)}
        />
        <div className="grid grid-cols-2 gap-[12px]">
          <InputSelection
            label="Length"
            options={DURATIONS.map((item) => ({ value: String(item), label: `${item} minutes` }))}
            value={String(duration)}
            onChange={(next) => typeof next === 'string' && next && setDuration(Number(next))}
          />
          <InputSelection
            label="Kind"
            options={INTERVIEW_KINDS.map((item) => ({ value: item.key, label: item.label }))}
            value={kind}
            onChange={(next) => typeof next === 'string' && next && setKind(next as InterviewKind)}
          />
        </div>
        {needsPlace ? (
          <TextInput
            label={kind === 'video' ? 'Meeting link' : 'Address'}
            placeholder={kindInfo?.hint}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        ) : null}
        <InputSelection
          label="Interviewers"
          multiple
          placeholder="Choose from the job's team"
          helperText={
            members.data && members.data.length === 0
              ? "No one is on this job's team yet. Add people to the job to pick interviewers."
              : undefined
          }
          options={(members.data ?? [])
            .filter((member) => member.user_id)
            .map((member) => ({
              value: member.user_id ?? '',
              label: member.name || member.email || 'Team member',
            }))}
          value={interviewers}
          onChange={(next) => setInterviewers(Array.isArray(next) ? next : [])}
        />
        <Textarea
          label="Notes for the team (optional)"
          helperText="The candidate does not see these."
          showToolbar={false}
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Checkbox
          label={
            interview ? 'Send the candidate the new time' : 'Email the candidate a calendar invite'
          }
          checked={invite}
          onChange={(event) => setInvite(event.target.checked)}
        />
        {invite ? (
          <Textarea
            label="A note for the candidate (optional)"
            showToolbar={false}
            rows={2}
            value={inviteNote}
            onChange={(event) => setInviteNote(event.target.value)}
          />
        ) : null}
        {invite && noReplyTo ? (
          <p className="text-body-s text-text-secondary">
            An invite needs a reply-to address. Set one in Settings → Hiring → Email first.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-body-s text-text-error">
            {error}
          </p>
        ) : null}
      </div>
      <ModalActions>
        <Button variant="primary" accent="default" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          accent="blue"
          size="md"
          disabled={blocked || pending}
          loading={pending}
          onClick={submit}
        >
          {interview ? 'Save' : 'Schedule'}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export { ScheduleInterviewDialog }
export type { ScheduleInterviewDialogProps }
