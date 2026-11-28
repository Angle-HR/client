'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { disqualifyPlan } from './applications/stages'
import { queryKeys } from './query-keys'
import { requests } from './requests'

import type { ApplicationStatus } from './applications/api'
import type { ApplicationDecision } from './applications/api-types'
import type { InterviewBody, MessageBody, OfferBody } from './applications/communications'
import type { PublicOffer } from './applications/offers'
import type { ApplicationAnswers } from './careers/application'
import type { CareersJob } from './careers/types'
import type { ApiRulesBody } from './compliance/api-types'
import type { ApiCompanySetup, ApiKybState } from './organization/api-types'
import type { OnboardingProgressSummary, ProductOnboardingStatusData } from './types'

/** Sends a candidate's application for one job. `source` is the `src` of the link they came from. */
function useSubmitApplication(job: CareersJob, source?: string) {
  return useMutation({
    mutationFn: ({
      answers,
      market,
      declaration,
    }: {
      answers: ApplicationAnswers
      market?: string
      declaration?: { country?: string; privacyAcknowledged?: boolean; consent?: boolean }
    }) => requests.submitApplication(job, answers, source, market, declaration),
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

/** Signs an offer, then shows the signed state from the answer. */
function useSignOffer(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { full_name: string; consent: boolean }) =>
      requests.signPublicOffer(token, body),
    onSuccess: (offer) => queryClient.setQueryData(queryKeys.publicOffer(token), offer),
  })
}

/** Declines an offer, then reloads it to show it ended. */
function useDeclineOffer(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reason?: string) => requests.declinePublicOffer(token, reason),
    // A declined offer's link stops answering, so a refetch would say "not available" right after
    // the candidate answered. Keep what they read and mark it declined.
    onSuccess: () =>
      queryClient.setQueryData<PublicOffer>(queryKeys.publicOffer(token), (offer) =>
        offer ? { ...offer, status: 'declined', canRespond: false } : offer,
      ),
  })
}

/** Everything under one application that a send, schedule or offer changes. */
function useApplicationRefresh(jobId: string): () => Promise<unknown> {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) })
}

/** Writes to the candidate. Reloads the emails, the files waiting, and the timeline. */
function useSendApplicationEmail(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  return useMutation({
    mutationFn: (body: MessageBody) => requests.sendApplicationEmail(jobId, appId, body),
    onSuccess: refresh,
  })
}

function usePreviewApplicationEmail(jobId: string, appId: string) {
  return useMutation({
    mutationFn: (body: MessageBody) => requests.previewApplicationEmail(jobId, appId, body),
  })
}

function useCancelApplicationEmail(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  return useMutation({
    mutationFn: (messageId: string) => requests.cancelApplicationEmail(jobId, appId, messageId),
    onSuccess: refresh,
  })
}

function useUploadAttachment(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  return useMutation({
    mutationFn: (file: File) => requests.uploadApplicationAttachment(jobId, appId, file),
    onSuccess: refresh,
  })
}

function useDeleteAttachment(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  return useMutation({
    mutationFn: (attachmentId: string) =>
      requests.deleteApplicationAttachment(jobId, appId, attachmentId),
    onSuccess: refresh,
  })
}

/** Schedules, reschedules, cancels or completes interviews of one application. */
function useInterviewActions(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  const schedule = useMutation({
    mutationFn: (body: InterviewBody) => requests.scheduleInterview(jobId, appId, body),
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<InterviewBody> }) =>
      requests.updateInterview(jobId, appId, id, body),
    onSuccess: refresh,
  })
  const close = useMutation({
    mutationFn: ({
      id,
      action,
      body,
    }: {
      id: string
      action: 'cancel' | 'complete'
      body?: { note?: string; notify?: boolean }
    }) => requests.closeInterview(jobId, appId, id, action, body),
    onSuccess: refresh,
  })
  return { schedule, update, close }
}

/** Makes, edits, sends and withdraws offers of one application. */
function useOfferActions(jobId: string, appId: string) {
  const refresh = useApplicationRefresh(jobId)
  const create = useMutation({
    mutationFn: (body: OfferBody) => requests.createOffer(jobId, appId, body),
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: Partial<Pick<OfferBody, 'title' | 'body' | 'compensation' | 'start_date'>>
    }) => requests.updateOffer(jobId, appId, id, body),
    onSuccess: refresh,
  })
  const send = useMutation({
    mutationFn: ({ id, expiresInDays }: { id: string; expiresInDays?: number }) =>
      requests.sendOffer(jobId, appId, id, expiresInDays),
    onSuccess: refresh,
  })
  const withdraw = useMutation({
    mutationFn: (id: string) => requests.withdrawOffer(jobId, appId, id),
    onSuccess: refresh,
  })
  return { create, update, send, withdraw }
}

/** The company's email templates: save (new or existing) and delete. */
function useEmailTemplateActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates })
  const save = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string | null
      body: { name: string; subject: string; body: string }
    }) => requests.saveEmailTemplate(id, body),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: string) => requests.deleteEmailTemplate(id),
    onSuccess: refresh,
  })
  return { save, remove }
}

function useOfferTemplateActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.offerTemplates })
  const save = useMutation({
    mutationFn: ({ id, body }: { id: string | null; body: { name: string; body: string } }) =>
      requests.saveOfferTemplate(id, body),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: string) => requests.deleteOfferTemplate(id),
    onSuccess: refresh,
  })
  return { save, remove }
}

function useSetEmailSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (replyTo: string) => requests.setEmailSettings(replyTo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.emailSettings }),
  })
}

/** Reloads what a pipeline change touches: the lists and counts, the open application, and the stages. */
function usePipelineRefresh(jobId: string): () => Promise<unknown> {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stages(jobId) }),
    ])
}

/** Moves an application to one of its job's stages (Hired decides it). */
function useMoveApplicationStage(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: ({
      appId,
      ...body
    }: {
      appId: string
      stage_id: string
      reason?: string
      note?: string
    }) => requests.moveApplicationStage(jobId, appId, body),
    onSuccess: refresh,
  })
}

/**
 * Disqualifies an application. A flagged one is rejected through its review;
 * any other moves to the job's Disqualified stage. The reason is a code from
 * the server's list.
 */
function useDisqualifyApplication(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: async ({
      appId,
      status,
      canDecide,
      stageId,
      reason,
      note,
      message,
    }: {
      appId: string
      status: ApplicationStatus
      canDecide: boolean
      /** The job's Disqualified stage. */
      stageId: string
      reason: string
      note?: string
      /** Written to the candidate instead of the standard email. */
      message?: MessageBody
    }): Promise<void> => {
      const plan = disqualifyPlan(status, canDecide)
      if (!plan) throw new Error('This application cannot be disqualified.')
      if (plan.kind === 'review') {
        await requests.reviewApplication(jobId, appId, {
          decision: 'reject',
          reason,
          note,
          message,
        })
        return
      }
      await requests.moveApplicationStage(jobId, appId, {
        stage_id: stageId,
        reason,
        note,
        message,
      })
    },
    onSettled: refresh,
  })
}

/** Moves several applications to one stage. The result says which of them were refused. */
function useBulkMoveStage(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: (body: {
      application_ids: string[]
      stage_id: string
      reason?: string
      note?: string
      message?: MessageBody
    }) => requests.bulkMoveStage(jobId, body),
    onSettled: refresh,
  })
}

/** Adds a custom stage, renames or removes one, or sets the order of the open ones. */
function useCreateStage(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: (name: string) => requests.createStage(jobId, name),
    onSuccess: refresh,
  })
}

function useRenameStage(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: ({ stageId, name }: { stageId: string; name: string }) =>
      requests.renameStage(jobId, stageId, name),
    onSuccess: refresh,
  })
}

function useDeleteStage(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: (stageId: string) => requests.deleteStage(jobId, stageId),
    onSuccess: refresh,
  })
}

function useReorderStages(jobId: string) {
  const refresh = usePipelineRefresh(jobId)
  return useMutation({
    mutationFn: (stageIds: string[]) => requests.reorderStages(jobId, stageIds),
    onSuccess: refresh,
  })
}

/** Notes: each change reloads the notes, the timeline and the note count in the list. */
function useApplicationNoteActions(jobId: string, appId: string) {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) })
  const add = useMutation({
    mutationFn: (body: string) => requests.addApplicationNote(jobId, appId, body),
    onSuccess: refresh,
  })
  const edit = useMutation({
    mutationFn: ({ noteId, body }: { noteId: string; body: string }) =>
      requests.editApplicationNote(jobId, appId, noteId, body),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (noteId: string) => requests.deleteApplicationNote(jobId, appId, noteId),
    onSuccess: refresh,
  })
  return { add, edit, remove }
}

/** Replaces an application's tags. */
function useSetApplicationTags(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, tagIds }: { appId: string; tagIds: string[] }) =>
      requests.setApplicationTags(jobId, appId, tagIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
  })
}

/** Follows or unfollows an application. */
function useFollowApplication(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, follow }: { appId: string; follow: boolean }) =>
      requests.followApplication(jobId, appId, follow),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
  })
}

/** A new company tag. */
function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; color: string }) => requests.createTag(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
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
      // Every gate write bumps the job's revision, and the next write needs the new one.
      await queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) })
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) })
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

function useRequestKybReview() {
  return useKybWrite<void>(() => requests.requestKybReview())
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
  useRequestKybReview,
  useSubmitKyb,
  useConfirmGate,
  useSetScreeningRules,
  useBulkMoveStage,
  useCreateStage,
  useCreateTag,
  useDeleteStage,
  useDisqualifyApplication,
  useFollowApplication,
  useMoveApplicationStage,
  useApplicationNoteActions,
  useRenameStage,
  useReorderStages,
  useSetApplicationTags,
  useSendApplicationEmail,
  usePreviewApplicationEmail,
  useCancelApplicationEmail,
  useUploadAttachment,
  useDeleteAttachment,
  useInterviewActions,
  useOfferActions,
  useEmailTemplateActions,
  useOfferTemplateActions,
  useSetEmailSettings,
  useSignOffer,
  useDeclineOffer,
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
  useLogin,
  useResendVerification,
  useSignup,
  useSubmitApplication,
  useUpdateSignupEmail,
  useUpsertAddress,
  useUpsertBusiness,
  useUpsertCompliance,
  useUpsertProfile,
  useVerifyEmail,
}
