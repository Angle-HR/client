'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import {
  ChangeAccessModal,
  InviteModal,
  RevokeAccessModal,
} from '@/components/jobs/create/permission-modals'
import { PermissionsStep } from '@/components/jobs/create/permissions-step'
import { JobToast } from '@/components/jobs/job-toast'
import { apiMessage } from '@/lib/jobs/api'
import {
  LEVEL_ROLE,
  splitInvites,
  suggestedPeople,
  toAccessMembers,
  withMember,
  withoutMember,
} from '@/lib/jobs/permissions-step'
import { useJob, useJobMembers, usePeople } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { GeneralAccess, InvitedPerson } from '@/components/jobs/create/permissions-step'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { ApiJobMember } from '@/lib/jobs/api-types'
import type { AccessLevel, AccessMember } from '@/lib/jobs/permissions-step'
import type { JobManager } from '@/lib/jobs/types'

/**
 * The "Permissions" step of job creation. Figma: "Job Creation/Permissions"
 * 9270:393565, the default page 9270:376943 and its modals.
 *
 * `?job=<id>` is the job being set up. Every change applies straight away: the
 * whole hiring team is read, changed, and saved back, as the API replaces it.
 */

const NO_PEOPLE: JobManager[] = []
const NO_MEMBERS: ApiJobMember[] = []

/** The open modal, with what it acts on. */
type PermissionModal =
  | { kind: 'invite'; person: JobManager | null }
  | { kind: 'level'; member: AccessMember; level: AccessLevel }
  | { kind: 'revoke'; member: AccessMember }

/** Company people carry an id; the team is keyed on it. */
function memberFromPerson(person: JobManager): Pick<AccessMember, 'userId' | 'name' | 'email'> {
  return { userId: person.id ?? '', name: person.name, email: person.email ?? '' }
}

function PermissionsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const jobId = params.get('job')
  const backHref = jobId
    ? `/dashboard/jobs/new/application?job=${encodeURIComponent(jobId)}`
    : '/dashboard/jobs/new/application'

  const job = useJob(jobId).data
  const people = usePeople().data ?? NO_PEOPLE
  const teamRows = useJobMembers(jobId).data ?? NO_MEMBERS
  const creatorId = job?.created_by

  const creator = creatorId ? (people.find((person) => person.id === creatorId) ?? null) : null
  const members = useMemo(() => toAccessMembers(teamRows, creatorId), [teamRows, creatorId])
  const suggested = useMemo(() => {
    const withAccess = new Set(
      [creatorId, ...members.map((member) => member.userId)].filter((id): id is string =>
        Boolean(id),
      ),
    )
    return suggestedPeople(people, withAccess)
  }, [people, members, creatorId])

  // Emails sent this session: company invites, not attached to the job.
  const [invited, setInvited] = useState<InvitedPerson[]>([])
  const [generalAccess, setGeneralAccess] = useState<GeneralAccess>('restricted')
  const [modal, setModal] = useState<PermissionModal | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<JobToastState | null>(null)

  function fail(error: unknown) {
    setToast({ id: Date.now(), kind: 'error', message: apiMessage(error) })
  }

  /**
   * Reads the team and the job's revision, applies `change`, and saves the whole
   * team back. The read is fresh so a change made elsewhere is not overwritten.
   */
  async function writeTeam(change: (current: AccessMember[]) => AccessMember[]): Promise<void> {
    if (!jobId) return
    const [rows, fresh] = await Promise.all([requests.getJobMembers(jobId), requests.getJob(jobId)])
    const next = change(toAccessMembers(rows, fresh.created_by))
    await requests.setJobMembers(jobId, next, fresh.revision)
    await queryClient.invalidateQueries({ queryKey: queryKeys.jobMembers(jobId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
  }

  async function sendInvite(typed: string[], level: AccessLevel) {
    if (!jobId || busy) return
    // A suggested person is added directly; typed emails are sorted into people and invites.
    const person = modal?.kind === 'invite' ? modal.person : null
    const split = person
      ? { people: [person], emails: [] as string[] }
      : splitInvites(typed, people, creatorId)
    setBusy(true)
    try {
      if (split.people.length > 0) {
        await writeTeam((current) =>
          split.people.reduce(
            (team, added) => withMember(team, memberFromPerson(added), LEVEL_ROLE[level]),
            current,
          ),
        )
      }
      // Not company people: a company invite each. The API cannot attach it to this job.
      await Promise.all(split.emails.map((email) => requests.inviteTeammate({ email })))
      const added = split.emails
        .filter((email) => !invited.some((known) => known.email === email))
        .map((email) => ({ email, level }))
      setInvited((current) => [...current, ...added])
      setModal(null)
      setToast({ id: Date.now(), kind: 'done', message: 'Invite sent' })
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  async function changeLevel(member: AccessMember, level: AccessLevel) {
    if (busy) return
    setBusy(true)
    try {
      await writeTeam((current) => withMember(current, member, LEVEL_ROLE[level]))
      setModal(null)
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  async function revoke(member: AccessMember) {
    if (busy) return
    setBusy(true)
    try {
      await writeTeam((current) => withoutMember(current, member.userId))
      setModal(null)
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Save as draft leaves the flow for the job list, as Save & continue does. */}
      <JobFlowHeader
        current="Permissions"
        mode="create"
        onSave={() => router.push('/dashboard/jobs?saved=draft')}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* A 560px column inside 40px padding, as 9270:376943 lays it out. */}
        <div className="w-[640px] max-w-full p-[40px]">
          <PermissionsStep
            backHref={backHref}
            creator={creator}
            members={members}
            invited={invited}
            suggested={suggested}
            generalAccess={generalAccess}
            canEdit={Boolean(jobId)}
            onGeneralAccessChange={setGeneralAccess}
            onInvite={(person) => setModal({ kind: 'invite', person })}
            onChangeLevel={(member, level) => setModal({ kind: 'level', member, level })}
            onRevoke={(member) => setModal({ kind: 'revoke', member })}
            onBack={() => router.push(backHref)}
            // TODO(publish): the Publish step is not built yet, so this goes to the job list.
            onContinue={() => router.push('/dashboard/jobs?saved=draft')}
          />
        </div>
      </div>

      {modal?.kind === 'invite' ? (
        <InviteModal
          person={modal.person}
          sending={busy}
          onSend={(typed, level) => void sendInvite(typed, level)}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal?.kind === 'level' ? (
        <ChangeAccessModal
          member={modal.member}
          level={modal.level}
          busy={busy}
          onConfirm={() => void changeLevel(modal.member, modal.level)}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal?.kind === 'revoke' ? (
        <RevokeAccessModal
          member={modal.member}
          busy={busy}
          onConfirm={() => void revoke(modal.member)}
          onClose={() => setModal(null)}
        />
      ) : null}

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  )
}

/** `useSearchParams` needs a Suspense boundary to keep the route statically renderable. */
function PermissionsRoute() {
  return (
    <Suspense fallback={null}>
      <PermissionsPage />
    </Suspense>
  )
}

export default PermissionsRoute
