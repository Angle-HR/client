'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from './query-keys'
import { requests } from './requests'

import type { ApplicationStatus } from './applications/api'
import type { ApplicationDecision } from './applications/api-types'
import type { ApplicationAnswers } from './careers/application'
import type { CareersJob } from './careers/types'
import type { ApiRulesBody } from './compliance/api-types'
import type { ApiCompanySetup, ApiKybState } from './organization/api-types'
import type { OnboardingProgressSummary, ProductOnboardingStatusData } from './types'

function useJoinWaitlist() {
  return useMutation({ mutationFn: requests.joinWaitlist })
}

function useSubmitOnboarding() {
  return useMutation({ mutationFn: requests.submitOnboarding })
}

/** Sends a candidate's application for one job. `source` is the `src` of the link they came from. */
function useSubmitApplication(job: CareersJob, source?: string) {
  return useMutation({
    mutationFn: (answers: ApplicationAnswers) => requests.submitApplication(job, answers, source),
  })
}

/** Decides a flagged application (`proceed` or `reject`), then reloads the job's applications. */
function useReviewApplication(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      appId,
      ...body
    }: {
      appId: string
      decision: ApplicationDecision
      note?: string
    }) => requests.reviewApplication(jobId, appId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
  })
}

/** Moves an application to its next status, then reloads the job's applications and counts. */
function useChangeApplicationStatus(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, ...body }: { appId: string; status: ApplicationStatus; note?: string }) =>
      requests.changeApplicationStatus(jobId, appId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
  })
}

/** Confirms or withdraws one compliance gate, then reloads the gates and the publish check. */
function useConfirmGate(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      gateId,
      confirmed,
      revision,
    }: {
      gateId: string
      confirmed: boolean
      revision?: number
    }) => requests.confirmComplianceGate(jobId, gateId, confirmed, revision),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.compliance(jobId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.publishCheck(jobId) })
    },
  })
}

/** Replaces a draft's screening rules, then reloads them and the publish check. */
function useSetScreeningRules(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ body, revision }: { body: ApiRulesBody; revision?: number }) =>
      requests.setScreeningRules(jobId, body, revision),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.screeningRules(jobId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.publishCheck(jobId) })
    },
  })
}

/** Runs a company-setup write and puts the answer straight into the cache. */
function useCompanySetupWrite<Input>(write: (input: Input) => Promise<ApiCompanySetup>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    onSuccess: (setup) => {
      queryClient.setQueryData(queryKeys.companySetup, setup)
      // What a job can publish with depends on this, so the checks are read again.
      return queryClient.invalidateQueries({ queryKey: ['jobs', 'one'] })
    },
  })
}

function useAcceptAgreements() {
  return useCompanySetupWrite(requests.acceptAgreements)
}

function useRecordDpia() {
  return useCompanySetupWrite(requests.recordDpia)
}

function useSetPrivacyContact() {
  return useCompanySetupWrite(requests.setPrivacyContact)
}

/** Runs a verification write and puts the new state straight into the cache. */
function useKybWrite<Input>(write: (input: Input) => Promise<ApiKybState>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    onSuccess: (state) => {
      queryClient.setQueryData(queryKeys.kyb, state)
      return queryClient.invalidateQueries({ queryKey: ['jobs', 'one'] })
    },
  })
}

function useSubmitKyb() {
  return useKybWrite(requests.submitKyb)
}

function useRetryKyb() {
  return useKybWrite(requests.retryKyb)
}

function useChangeKybCountry() {
  return useKybWrite(requests.changeKybCountry)
}

function useConfirmKybAddress() {
  return useKybWrite(requests.confirmKybAddress)
}

function useConfirmKybName() {
  return useKybWrite<void>(() => requests.confirmKybName())
}

function useSetAutomatedScreening() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requests.setAutomatedScreening,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.hiringSettings, settings)
      // The company's DPIA view and each job's checks depend on it.
      void queryClient.invalidateQueries({ queryKey: queryKeys.companySetup })
      return queryClient.invalidateQueries({ queryKey: ['jobs', 'one'] })
    },
  })
}

function useSetApplicantSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requests.setApplicantSettings,
    onSuccess: (settings) => queryClient.setQueryData(queryKeys.applicantSettings, settings),
  })
}

function useSignup() {
  return useMutation({ mutationFn: requests.signup })
}

function useUpdateSignupEmail() {
  return useMutation({ mutationFn: requests.updateSignupEmail })
}

function useVerifyEmail() {
  return useMutation({ mutationFn: requests.verifyEmail })
}

function useResendVerification() {
  return useMutation({ mutationFn: requests.resendVerification })
}

function useLogin() {
  return useMutation({ mutationFn: requests.login })
}

function useRequestLoginOtp() {
  return useMutation({ mutationFn: requests.requestLoginOtp })
}

function useVerifyLoginOtp() {
  return useMutation({ mutationFn: requests.verifyLoginOtp })
}

function useVerifyLoginTotp() {
  return useMutation({ mutationFn: requests.verifyLoginTotp })
}

function useForgotPassword() {
  return useMutation({ mutationFn: requests.forgotPassword })
}

function useResetPassword() {
  return useMutation({ mutationFn: requests.resetPassword })
}

function useAcceptInvite() {
  return useMutation({ mutationFn: requests.acceptInvite })
}

function useEnrollTotp() {
  return useMutation({ mutationFn: requests.enrollTotp })
}

function useConfirmTotp() {
  return useMutation({ mutationFn: requests.confirmTotp })
}

function useDisableTotp() {
  return useMutation({ mutationFn: requests.disableTotp })
}

function useInviteTeammate() {
  return useMutation({ mutationFn: requests.inviteTeammate })
}

/**
 * Saving a step returns the progress it produced. Writing that straight into the
 * cached `/onboarding/status` keeps the two in step: without it the next page
 * asks for status, is handed the pre-save answer, and sends the user back to the
 * step they just finished until the query happens to refetch.
 */
function useOnboardingStep<TPayload, TData extends { onboarding?: OnboardingProgressSummary }>(
  mutationFn: (payload: TPayload) => Promise<TData>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (!data.onboarding) {
        // Nothing authoritative came back; refetch rather than trust the cache.
        void queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus })
        return
      }
      queryClient.setQueryData<ProductOnboardingStatusData>(
        queryKeys.onboardingStatus,
        (previous) => ({ ...previous, ...data.onboarding }) as ProductOnboardingStatusData,
      )
    },
  })
}

function useUpsertProfile() {
  return useOnboardingStep(requests.upsertProfile)
}

function useUpsertAddress() {
  return useOnboardingStep(requests.upsertAddress)
}

function useUpsertBusiness() {
  return useOnboardingStep(requests.upsertBusiness)
}

/** Canonical compliance step; `useUpsertBusiness` hits the deprecated alias. */
function useUpsertCompliance() {
  return useOnboardingStep(requests.upsertCompliance)
}

function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requests.completeOnboarding,
    // Finishing changes status wholesale, so take it fresh from the server.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus })
    },
  })
}

export {
  useSetApplicantSettings,
  useSetAutomatedScreening,
  useAcceptAgreements,
  useChangeKybCountry,
  useConfirmKybAddress,
  useConfirmKybName,
  useRecordDpia,
  useRetryKyb,
  useSetPrivacyContact,
  useSubmitKyb,
  useConfirmGate,
  useSetScreeningRules,
  useChangeApplicationStatus,
  useReviewApplication,
  useAcceptInvite,
  useConfirmTotp,
  useDisableTotp,
  useEnrollTotp,
  useForgotPassword,
  useInviteTeammate,
  useRequestLoginOtp,
  useResetPassword,
  useVerifyLoginOtp,
  useVerifyLoginTotp,
  useCompleteOnboarding,
  useJoinWaitlist,
  useLogin,
  useResendVerification,
  useSignup,
  useSubmitApplication,
  useSubmitOnboarding,
  useUpdateSignupEmail,
  useUpsertAddress,
  useUpsertBusiness,
  useUpsertCompliance,
  useUpsertProfile,
  useVerifyEmail,
}
