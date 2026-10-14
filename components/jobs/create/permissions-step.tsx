'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  AccessMenu,
  AccessMenuHeading,
  AccessMenuItem,
  AccessMenuSeparator,
} from '@/components/jobs/create/access-menu'
import { toAnchor } from '@/components/jobs/floating'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import { Button, Divider, Tag, TextButton } from '@/components/ui'
import { colourFor } from '@/lib/jobs/api'
import {
  COLLAPSED_ROWS,
  LEVEL_LABEL,
  LEVEL_MENU_LABEL,
  MEMBER_MENUS,
  levelOfRole,
  memberButtonLabel,
  visibleRows,
} from '@/lib/jobs/permissions-step'

import type { AnchorRect } from '@/components/jobs/floating'
import type { AccessLevel, AccessMember, MemberState } from '@/lib/jobs/permissions-step'
import type { JobManager } from '@/lib/jobs/types'

/**
 * The body of the Permissions step of job creation. Figma: "Permissions"
 * 9270:376943, with the expanded and menu states in 9270:377592 and 9270:377732.
 *
 * The page owns the data and the modals; this draws the sections and the
 * menus, and reports what the person chose.
 */

type GeneralAccess = 'restricted' | AccessLevel

/** An email sent this session: a company invite, not yet on the job. */
interface InvitedPerson {
  email: string
  level: AccessLevel
}

/** The order the menus list the levels in: "Can view" first, as drawn. */
const MENU_LEVELS: AccessLevel[] = ['view', 'review', 'manage']

const GENERAL_ACCESS_LABEL: Record<GeneralAccess, string> = {
  restricted: 'is Restricted',
  view: LEVEL_MENU_LABEL.view,
  review: LEVEL_MENU_LABEL.review,
  manage: LEVEL_MENU_LABEL.manage,
}

/** One row of "People with access". The creator always has access and is shown without a menu. */
type AccessRow =
  | { kind: 'creator'; id: 'creator'; person: JobManager }
  | { kind: 'member'; id: string; member: AccessMember }
  | { kind: 'invite'; id: string; invite: InvitedPerson }

interface PermissionsStepProps {
  backHref: string
  creator: JobManager | null
  members: AccessMember[]
  invited: InvitedPerson[]
  suggested: JobManager[]
  generalAccess: GeneralAccess
  /** False until there is a job to share; the actions then wait. */
  canEdit: boolean
  onGeneralAccessChange: (access: GeneralAccess) => void
  /** `person` is the suggested person clicked, or null for the email invite. */
  onInvite: (person: JobManager | null) => void
  onChangeLevel: (member: AccessMember, level: AccessLevel) => void
  onRevoke: (member: AccessMember) => void
  onBack: () => void
  /** Save & continue. The Publish step is not built yet, so this goes to the job list. */
  onContinue: () => void
}

const sectionLabel = 'text-body-xs font-medium text-text-tertiary'
const rowText = 'truncate text-body-s text-text-secondary'

function PermissionsStep({
  backHref,
  creator,
  members,
  invited,
  suggested,
  generalAccess,
  canEdit,
  onGeneralAccessChange,
  onInvite,
  onChangeLevel,
  onRevoke,
  onBack,
  onContinue,
}: PermissionsStepProps) {
  const [expanded, setExpanded] = useState(false)
  // The open menu: a row's id, or 'general' for the general access row.
  const [menu, setMenu] = useState<{ id: string; anchor: AnchorRect } | null>(null)

  const rows: AccessRow[] = [
    ...(creator ? [{ kind: 'creator' as const, id: 'creator' as const, person: creator }] : []),
    ...members.map((member) => ({
      kind: 'member' as const,
      id: `member:${member.userId}`,
      member,
    })),
    ...invited.map((invite) => ({
      kind: 'invite' as const,
      id: `invite:${invite.email}`,
      invite,
    })),
  ]
  const shown = visibleRows(rows, expanded)
  // The faces on "See more people" are the rows still hidden, up to two.
  const hiddenFaces = rows.slice(COLLAPSED_ROWS, COLLAPSED_ROWS + 2)

  function toggleMenu(id: string, event: MouseEvent<HTMLButtonElement>) {
    setMenu((current) =>
      current?.id === id
        ? null
        : { id, anchor: toAnchor(event.currentTarget.getBoundingClientRect()) },
    )
  }

  function closeMenu() {
    setMenu(null)
  }

  /** The level and action items for a member row. Invited rows' items do nothing yet. */
  function memberMenu(row: AccessRow & { kind: 'member' | 'invite' }): ReactNode {
    const state: MemberState = row.kind === 'member' ? 'active' : 'invited'
    const spec = MEMBER_MENUS[state]
    const currentLevel = row.kind === 'member' ? levelOfRole(row.member.role) : row.invite.level
    return (
      <>
        {spec.levels
          ? MENU_LEVELS.map((level) => (
              <AccessMenuItem
                key={level}
                label={LEVEL_MENU_LABEL[level]}
                checked={currentLevel === level}
                onSelect={() => {
                  closeMenu()
                  if (row.kind === 'member' && currentLevel !== level)
                    onChangeLevel(row.member, level)
                }}
              />
            ))
          : null}
        {spec.levels && spec.actions.length > 0 ? <AccessMenuSeparator /> : null}
        {spec.heading ? <AccessMenuHeading label={spec.heading} /> : null}
        {spec.actions.map((item) => (
          <AccessMenuItem
            key={item.action}
            label={item.label}
            danger={item.danger}
            onSelect={() => {
              closeMenu()
              if (row.kind === 'member' && item.action === 'revoke-access') onRevoke(row.member)
            }}
          />
        ))}
      </>
    )
  }

  function openMenuFor(): ReactNode {
    if (!menu) return null
    const anchor = menu.anchor
    if (menu.id === 'general') {
      return (
        <AccessMenu label="General access" anchor={anchor} onClose={closeMenu}>
          {(['restricted', ...MENU_LEVELS] as GeneralAccess[]).map((option) => (
            <AccessMenuItem
              key={option}
              label={GENERAL_ACCESS_LABEL[option]}
              checked={generalAccess === option}
              onSelect={() => {
                closeMenu()
                onGeneralAccessChange(option)
              }}
            />
          ))}
        </AccessMenu>
      )
    }
    const row = rows.find((item) => item.id === menu.id)
    if (!row || row.kind === 'creator') return null
    return (
      <AccessMenu
        label={row.kind === 'member' ? row.member.name : row.invite.email}
        anchor={anchor}
        onClose={closeMenu}
      >
        {memberMenu(row)}
      </AccessMenu>
    )
  }

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex h-[24px] items-center">
        <TextButton
          size="md"
          className="text-text-primary!"
          iconLeft={<DashboardIcon name="chevron-left-solid" size={11} />}
          href={backHref}
        >
          Back
        </TextButton>
      </div>

      <div className="flex flex-col gap-[16px]">
        <h1 className="-my-[9px] text-[21.1px] leading-[33.1px] font-semibold text-text-primary">
          Permissions
        </h1>
        <p className="-my-[5px] text-body-xs leading-19_2 font-medium text-text-secondary">
          Choose who can see and manage this job.
        </p>
      </div>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      {/* Suggested: company people without access. Figma: 9270:376943. People have
          no department in the API, so the design's sub-line is left out. */}
      {suggested.length > 0 ? (
        <section className="flex flex-col gap-[12px]">
          <h2 className={sectionLabel}>Suggested</h2>
          <ul className="flex flex-wrap gap-[24px]">
            {suggested.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => onInvite(person)}
                  className="flex items-center gap-[8px] rounded-sm-8 p-[4px] text-left hover:bg-bg-transparent-light disabled:cursor-not-allowed"
                >
                  <PersonAvatar person={person} size={24} />
                  <span className="text-body-s font-medium text-text-primary">{person.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <section className="flex flex-col gap-[12px]">
        <h2 className="text-caption-s leading-none font-semibold text-text-secondary">
          INVITE COLLABORATORS
        </h2>
        <p className="-my-[5px] text-body-xs leading-19_2 text-text-tertiary">
          You can invite and add other team members or recruiter to collaborate on this job.
        </p>
        <div>
          <Button
            variant="secondary"
            accent="blue"
            size="sm"
            disabled={!canEdit}
            onClick={() => onInvite(null)}
          >
            Send invite
          </Button>
        </div>
      </section>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <section className="flex flex-col gap-[4px]">
        <h2 className={`${sectionLabel} pb-[8px]`}>People with access</h2>

        <div className="flex h-[32px] items-center justify-between gap-[8px]">
          <div className="flex min-w-0 items-center gap-[8px]">
            <span className="inline-flex text-text-tertiary">
              <DashboardIcon name="globe-alt-solid" size={20} />
            </span>
            <span className="text-body-s font-semibold text-text-primary">Anyone</span>
            <span className={rowText}>Every team member</span>
          </div>
          <Button
            variant="tertiary"
            accent="default"
            size="sm"
            aria-haspopup="menu"
            aria-expanded={menu?.id === 'general'}
            disabled={!canEdit}
            iconSuffix={<DashboardIcon name="chevron-down-solid" size={14} />}
            onClick={(event) => toggleMenu('general', event)}
          >
            {generalAccess === 'restricted' ? 'Restricted' : LEVEL_MENU_LABEL[generalAccess]}
          </Button>
        </div>

        {shown.map((row) => (
          <AccessRowView
            key={row.id}
            row={row}
            canEdit={canEdit}
            menuOpen={menu?.id === row.id}
            onToggle={(event) => toggleMenu(row.id, event)}
          />
        ))}

        {rows.length > COLLAPSED_ROWS ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            className="mt-[4px] flex h-[32px] items-center gap-[8px] text-body-s font-medium text-text-blue-accent"
          >
            <span className="flex items-center -space-x-[4px]">
              {expanded
                ? null
                : hiddenFaces.map((row) =>
                    row.kind === 'invite' ? (
                      <span
                        key={row.id}
                        className="inline-flex rounded-full bg-bg-secondary text-text-tertiary"
                      >
                        <DashboardIcon name="user-circle-solid" size={16} />
                      </span>
                    ) : (
                      <PersonAvatar
                        key={row.id}
                        size={16}
                        person={
                          row.kind === 'creator'
                            ? row.person
                            : { name: row.member.name, colour: 'grey' }
                        }
                      />
                    ),
                  )}
            </span>
            <span>{expanded ? 'See less' : 'See more people'}</span>
            <DashboardIcon name={expanded ? 'chevron-up-solid' : 'chevron-down-solid'} size={12} />
          </button>
        ) : null}
      </section>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <div className="flex items-center gap-[12px]">
        <Button
          variant="secondary"
          accent="blue"
          size="md"
          iconPrefix={<DashboardIcon name="arrow-left-solid" size={14} />}
          onClick={onBack}
        >
          Back
        </Button>
        {/* TODO(publish): this moves on to the job list until the Publish step is built. */}
        <Button
          variant="primary"
          accent="blue"
          size="md"
          iconSuffix={<DashboardIcon name="check-circle-solid" size={14} />}
          onClick={onContinue}
        >
          Save &amp; continue
        </Button>
      </div>

      {openMenuFor()}
    </div>
  )
}

interface AccessRowViewProps {
  row: AccessRow
  canEdit: boolean
  menuOpen: boolean
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
}

/** One person on the job. Figma: "List Item/Permission" 9126:476057. */
function AccessRowView({ row, canEdit, menuOpen, onToggle }: AccessRowViewProps) {
  if (row.kind === 'invite') {
    return (
      <div className="flex h-[32px] items-center justify-between gap-[8px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <span className="inline-flex text-text-tertiary">
            <DashboardIcon name="user-circle-solid" size={20} />
          </span>
          <span className={rowText}>{row.invite.email}</span>
          <Tag label="Invited" color="teal" weight="medium" />
        </div>
        <Button
          variant="tertiary"
          accent="default"
          size="sm"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={!canEdit}
          iconSuffix={<DashboardIcon name="chevron-down-solid" size={14} />}
          onClick={onToggle}
        >
          {LEVEL_LABEL[row.invite.level]}
        </Button>
      </div>
    )
  }

  const name = row.kind === 'creator' ? row.person.name : row.member.name
  const email = row.kind === 'creator' ? (row.person.email ?? '') : row.member.email
  const role = row.kind === 'creator' ? 'hiring_manager' : row.member.role
  const avatar =
    row.kind === 'creator' ? row.person : { name, colour: colourFor(row.member.userId) }
  const label = memberButtonLabel('active', role)

  return (
    <div className="flex h-[32px] items-center justify-between gap-[8px]">
      <div className="flex min-w-0 items-center gap-[8px]">
        <PersonAvatar person={avatar} size={20} />
        <span className="truncate text-body-s font-medium text-text-primary">{name}</span>
        <span className={rowText}>{email}</span>
      </div>
      {/* The creator's level cannot be changed through the API, so their button is drawn without a menu. */}
      <Button
        variant="tertiary"
        accent="default"
        size="sm"
        aria-haspopup={row.kind === 'creator' ? undefined : 'menu'}
        aria-expanded={row.kind === 'creator' ? undefined : menuOpen}
        disabled={row.kind === 'creator' || !canEdit}
        iconSuffix={<DashboardIcon name="chevron-down-solid" size={14} />}
        onClick={row.kind === 'creator' ? undefined : onToggle}
      >
        {label}
      </Button>
    </div>
  )
}

export { PermissionsStep }
export type { GeneralAccess, InvitedPerson, PermissionsStepProps }
