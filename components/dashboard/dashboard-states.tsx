'use client'

import { AuthShell } from '@/components/auth/auth-shell'
import { ErrorScreenArt, WelcomeWatermark } from '@/components/dashboard/empty-state-art'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, TextButton } from '@/components/ui'

/**
 * The states the dashboard shows before it has anything to list.
 *
 * Copy, type and spacing are taken from the Figma frames — the welcome state
 * (7725:262577) and the failure states (4122:17041) do not share a type ramp,
 * so they are written out separately rather than folded into one layout.
 */

/** Whether the workspace's KYB check has cleared. */
type VerificationState = 'pending' | 'verified'

interface WelcomeEmptyStateProps {
  verification: VerificationState
  onCreateJob: () => void
}

function WelcomeEmptyState({ verification, onCreateJob }: WelcomeEmptyStateProps) {
  return (
    <div className="relative flex-1">
      <WelcomeWatermark />

      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[32px] overflow-hidden rounded-lg-12 p-[12px]">
        <div className="flex w-[381px] flex-col items-center justify-center gap-[16px]">
          {/* <WelcomeBadge icon="shield-check" /> */}
          <p className="text-body-xl leading-24 font-semibold whitespace-nowrap text-text-primary">
            Welcome to Open HR
          </p>
          <p className="w-full text-center text-body-s leading-19_5 text-text-secondary">
            {verification === 'pending' ? (
              <>
                We’re reviewing your account and will follow up shortly.
                <br />
                In the meantime, you can create and manage Jobs.
              </>
            ) : (
              <>
                Your HR workspace is ready. You can start
                <br />
                by creating your first Job.
              </>
            )}
          </p>
        </div>

        <Button
          variant="primary"
          accent="blue"
          size="sm"
          iconSuffix={<DashboardIcon name="menu-plus" size={14} />}
          onClick={onCreateJob}
        >
          Create my first job
        </Button>
      </div>
    </div>
  )
}

/**
 * `connection` is the offline case; `unknown` is a dashboard that failed to load
 * for any other reason and is the only one that offers support.
 */
type DashboardErrorKind = 'connection' | 'unknown'

interface DashboardErrorStateProps {
  kind: DashboardErrorKind
  onContactSupport?: () => void
}

function DashboardErrorState({ kind, onContactSupport }: DashboardErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[32px]">
      <ErrorScreenArt />

      <div className="flex w-[212px] flex-col items-start gap-[16px] text-center">
        <p className="w-full text-body-m leading-21 font-semibold text-text-primary">
          {kind === 'connection' ? 'Connection issue' : 'Something went wrong'}
        </p>
        <p className="w-full text-body-xs leading-19_2 text-text-secondary">
          {kind === 'connection'
            ? 'Can’t load your dashboard. Check your connection and refresh.'
            : 'We’re having trouble loading your dashboard. Refresh to try again.'}
        </p>
        {kind === 'unknown' ? (
          <TextButton
            type="button"
            size="sm"
            bold
            // The design sets this in primary text, not the default link blue.
            className="w-full justify-center text-text-primary!"
            onClick={onContactSupport}
          >
            Contact support.
          </TextButton>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Shown full-screen, before the shell exists, while the account loads. Same
 * track and type as the onboarding setup step, but indeterminate — there is no
 * progress to report.
 */
function DashboardSettingUpState() {
  return (
    <AuthShell variant="centered">
      <div className="flex flex-col items-center gap-[32px] text-center">
        <span
          role="progressbar"
          aria-label="Setting up your account and workspace"
          className="relative h-[4px] w-[114px] overflow-clip rounded-all border-[0.5px] border-border-light bg-bg-primary"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 animate-pulse bg-gradient-to-r from-blue-8 to-blue-9" />
        </span>
        <p className="text-subtitle-s leading-23 font-medium text-text-primary">
          We’re setting up your account and workspace
        </p>
      </div>
    </AuthShell>
  )
}

export { DashboardErrorState, DashboardSettingUpState, WelcomeEmptyState }
export type { DashboardErrorKind, VerificationState }
