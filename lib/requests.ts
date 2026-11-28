import axios from 'axios'

import { axiosInstance } from '@/config/axios'

import { applicationListParams, toApplicant, toApplicantDetail } from './applications/api'
import {
  toAttachment,
  toEmailTemplate,
  toInterview,
  toMessage,
  toOffer,
  toOfferEvent,
  toOfferTemplate,
} from './applications/communications'
import { toPublicOffer } from './applications/offers'
import { toActivity, toNote, toReason, toStage, toTag } from './applications/pipeline'
import { toApplicationBody, toCareersJobPage, toUploadBody } from './careers/api'
import { CAREERS_FIXTURES } from './careers/fixtures'
import { ENDPOINTS } from './endpoints'
import { countsByStatus, jobListParams, toJob, toManager, toTemplate } from './jobs/api'

import type { Applicant, ApplicantDetail, ApplicationStatus } from './applications/api'
import type {
  ApiApplicationDetail,
  ApiApplicationPage,
  ApiApplicationResult,
  ApiFileLink,
  ApplicationDecision,
  ApplicationListQuery,
} from './applications/api-types'
import type {
  ApiAttachment,
  ApiInterview,
  ApiMessage,
  ApiOffer,
  ApiOfferEvent,
  ApiOfferTemplate,
  ApiEmailTemplate,
  Attachment,
  EmailTemplate,
  Interview,
  InterviewBody,
  Message,
  MessageBody,
  Offer,
  OfferBody,
  OfferEvent,
  OfferTemplate,
} from './applications/communications'
import type { ApiPublicOffer, PublicOffer } from './applications/offers'
import type {
  ActivityItem,
  ApiActivityPage,
  ApiNote,
  ApiReason,
  ApiStage,
  ApiTag,
  DisqualifyReason,
  Note,
  PipelineStage,
  Tag,
} from './applications/pipeline'
import type { ApiApplicationReceipt, ApiPublicJobData, ApiUploadTarget } from './careers/api-types'
import type { ApplicationAnswers } from './careers/application'
import type { CareersJob, CareersJobPage, CareersPage } from './careers/types'
import type {
  ApiGate,
  ApiMarketsBody,
  ApiRulesBody,
  ApiRulesView,
  ApiShareKit,
} from './compliance/api-types'
import type {
  ApiApplicationForm,
  ApiApplicationFormBody,
  ApiBulkResult,
  ApiCatalog,
  ApiCatalogItem,
  ApiDepartment,
  ApiHiringMe,
  ApiJobCounts,
  ApiJobBody,
  ApiJobView,
  ApiJobListItem,
  ApiJobMember,
  ApiPerson,
  ApiPublishCheck,
  ApiPublishResult,
  ApiTemplate,
  ApiTemplateExport,
  ApiTimezone,
  JobListQuery,
} from './jobs/api-types'
import type { JobTemplate } from './jobs/templates'
import type { Job, JobManager, JobStatus } from './jobs/types'
import type {
  ApiCompanySetup,
  ApiDpiaBody,
  ApiKybRetryBody,
  ApiKybState,
  ApiKybSubmitBody,
  ApiPrivacyContactBody,
} from './organization/api-types'
import type {
  ApiApplicantSettings,
  ApiApplicantSettingsBody,
  ApiHiringSettings,
} from './settings/api-types'
import type {
  ApiResponse,
  AuthAcceptInvitePayload,
  AuthForgotPasswordData,
  AuthForgotPasswordPayload,
  AuthInviteData,
  AuthLoginOtpRequestPayload,
  AuthLoginOtpVerifyPayload,
  AuthLoginPayload,
  AuthLoginResult,
  AuthMeData,
  AuthResendVerificationPayload,
  AuthResetPasswordData,
  AuthResetPasswordPayload,
  AuthSignupData,
  AuthSignupPatchPayload,
  AuthSignupPayload,
  AuthSessionData,
  AuthTotpConfirmPayload,
  AuthTotpDisablePayload,
  AuthTotpEnrollData,
  AuthTotpLoginPayload,
  AuthVerifyEmailPayload,
  BusinessType,
  CompanyRole,
  Country,
  IdentificationRequirementsData,
  OnboardingIndustry,
  OrganizationInviteData,
  OrganizationInvitePayload,
  ProductAddressData,
  ProductAddressPayload,
  ProductAddressSearchData,
  ProductAddressSearchPayload,
  ProductAddressVerifyData,
  ProductAddressVerifyPayload,
  ProductBusinessData,
  ProductBusinessPayload,
  ProductComplianceData,
  ProductCompliancePayload,
  ProductOnboardingCompleteData,
  ProductOnboardingStatusData,
  ProductProfileData,
  ProductProfilePayload,
} from './types'

/** The roles a person can hold on one job's hiring team. */
export type JobMemberRole = 'hiring_manager' | 'recruiter' | 'interviewer' | 'viewer'

// The most the list endpoint returns at once, and a stop so a bad cursor
// cannot loop for ever.
const JOBS_PAGE_SIZE = 100
const MAX_JOB_PAGES = 50

async function allJobRows(query: JobListQuery): Promise<ApiJobListItem[]> {
  const rows: ApiJobListItem[] = []
  let cursor: string | undefined
  for (let page = 0; page < MAX_JOB_PAGES; page += 1) {
    const { data } = await axiosInstance.get<ApiResponse<ApiJobListItem[]> & CursorMeta>(
      ENDPOINTS.jobs.list(),
      { params: jobListParams({ ...query, limit: JOBS_PAGE_SIZE, cursor }) },
    )
    rows.push(...(data.data ?? []))
    if (!data.meta?.has_more || !data.meta.next_cursor) break
    cursor = data.meta.next_cursor
  }
  return rows
}

/**
 * user id → name, for the ids a job or template carries. The names are only
 * labels: `GET /hiring/people` needs the permission to add people to jobs,
 * which a person who may view jobs (a line manager, say) does not have, and
 * that 403 must not take the jobs list down with it. Without the lookup,
 * creators show as "Unknown".
 */
async function peopleById(): Promise<Map<string, string>> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ApiPerson[]>>(ENDPOINTS.hiring.people())
    return new Map((data.data ?? []).map((person) => [person.user_id ?? '', person.name ?? '']))
  } catch {
    return new Map()
  }
}

/** The list endpoints page with a cursor carried in the envelope's meta. */
interface CursorMeta {
  meta?: { has_more?: boolean; next_cursor?: string }
}

/** The revision the client loaded, so the API can refuse to overwrite a newer one. */
/**
 * The header every job write carries. A caller that never loaded the job, such as an undo, has no
 * revision, so the job's current one is read; the write is then not checked against anything older.
 */
const ifMatch = async (jobId: string, revision?: number): Promise<Record<string, string>> => {
  const current =
    revision ??
    (await axiosInstance.get<ApiResponse<{ revision?: number }>>(ENDPOINTS.jobs.one(jobId))).data
      .data.revision
  return { 'If-Match': String(current ?? 0) }
}

const requests = {
  getCountries: async (): Promise<Country[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Country[]>>(ENDPOINTS.countries())
    return data.data
  },

  // ── Product auth ──────────────────────────────────────────────────────────

  signup: async (payload: AuthSignupPayload): Promise<AuthSignupData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSignupData>>(
      ENDPOINTS.auth.signup(),
      payload,
    )
    return data.data
  },

  updateSignupEmail: async (payload: AuthSignupPatchPayload): Promise<AuthSignupData> => {
    const { data } = await axiosInstance.patch<ApiResponse<AuthSignupData>>(
      ENDPOINTS.auth.signup(),
      payload,
    )
    return data.data
  },

  verifyEmail: async (payload: AuthVerifyEmailPayload): Promise<AuthSessionData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSessionData>>(
      ENDPOINTS.auth.verifyEmail(),
      payload,
    )
    return data.data
  },

  resendVerification: async (payload: AuthResendVerificationPayload): Promise<AuthSignupData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSignupData>>(
      ENDPOINTS.auth.resendVerification(),
      payload,
    )
    return data.data
  },

  login: async (payload: AuthLoginPayload): Promise<AuthLoginResult> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthLoginResult>>(
      ENDPOINTS.auth.login(),
      payload,
    )
    return data.data
  },

  requestLoginOtp: async (payload: AuthLoginOtpRequestPayload): Promise<AuthSignupData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSignupData>>(
      ENDPOINTS.auth.loginOtpRequest(),
      payload,
    )
    return data.data
  },

  verifyLoginOtp: async (payload: AuthLoginOtpVerifyPayload): Promise<AuthLoginResult> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthLoginResult>>(
      ENDPOINTS.auth.loginOtpVerify(),
      payload,
    )
    return data.data
  },

  verifyLoginTotp: async (payload: AuthTotpLoginPayload): Promise<AuthSessionData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSessionData>>(
      ENDPOINTS.auth.loginTotp(),
      payload,
    )
    return data.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.auth.logout())
  },

  forgotPassword: async (payload: AuthForgotPasswordPayload): Promise<AuthForgotPasswordData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthForgotPasswordData>>(
      ENDPOINTS.auth.forgotPassword(),
      payload,
    )
    return data.data
  },

  resetPassword: async (payload: AuthResetPasswordPayload): Promise<AuthResetPasswordData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthResetPasswordData>>(
      ENDPOINTS.auth.resetPassword(),
      payload,
    )
    return data.data
  },

  // No public careers endpoint yet: fixtures until the API serves this.
  /** The company and its open roles, or null when no company has that slug. */
  getCareersPage: (companySlug: string): Promise<CareersPage | null> =>
    Promise.resolve(CAREERS_FIXTURES[companySlug] ?? null),

  /**
   * One public job, by its `public_id` (the careers URL's job segment). Null
   * when there is no such job or it is gone. The slug stays in the URL only;
   * the endpoint needs the id alone.
   */
  getPublicJob: async (_companySlug: string, jobId: string): Promise<CareersJobPage | null> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<ApiPublicJobData>>(
        ENDPOINTS.public.job(jobId),
      )
      return toCareersJobPage(data.data, jobId)
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 410)
      ) {
        return null
      }
      throw error
    }
  },

  /**
   * Sends a candidate's answers. Each picked file is sent to its own one-time
   * URL first, and its token stands in for the file in the application. The
   * idempotency key keeps a retry from filing the application twice.
   */
  submitApplication: async (
    job: CareersJob,
    answers: ApplicationAnswers,
    source?: string,
    market?: string,
    declaration?: { country?: string; privacyAcknowledged?: boolean; consent?: boolean },
  ): Promise<void> => {
    const uploads: Record<string, string[]> = {}
    for (const question of job.questions) {
      const files = answers[question.key]
      if (!Array.isArray(files) || !files.every((item): item is File => item instanceof File))
        continue
      const tokens: string[] = []
      uploads[question.key] = tokens
      for (const file of files) {
        const { data } = await axiosInstance.post<ApiResponse<ApiUploadTarget>>(
          ENDPOINTS.public.uploads(job.id),
          toUploadBody(question, file),
        )
        const target = data.data
        // The target is a pre-signed URL: it takes exactly the returned headers and no sign-in.
        await axios.request({
          url: target.url,
          method: target.method ?? 'PUT',
          headers: target.headers,
          data: file,
        })
        if (target.token) tokens.push(target.token)
      }
    }
    await axiosInstance.post<ApiResponse<ApiApplicationReceipt>>(
      ENDPOINTS.public.applications(job.id),
      toApplicationBody({
        questions: job.questions,
        answers,
        uploads,
        markets: job.markets ?? [],
        market,
        consentRequired: job.consentRequired ?? false,
        source,
        ...declaration,
      }),
      { headers: { 'Idempotency-Key': crypto.randomUUID() } },
    )
  },

  /** One page of a job's applications, newest first, with the job's counts per status. */
  getApplications: async (
    jobId: string,
    query: ApplicationListQuery = {},
    cursor?: string,
  ): Promise<{
    items: Applicant[]
    counts: Record<string, number>
    stageCounts: Record<string, number>
    nextCursor?: string
  }> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiApplicationPage>>(
      ENDPOINTS.jobs.applications(jobId),
      { params: applicationListParams(query, cursor) },
    )
    return {
      items: (data.data.items ?? []).map(toApplicant),
      counts: data.data.counts ?? {},
      stageCounts: data.data.stage_counts ?? {},
      nextCursor: data.data.next_cursor || undefined,
    }
  },

  /** One application with its answers. Reading it records that this person opened it. */
  getApplication: async (jobId: string, appId: string): Promise<ApplicantDetail> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiApplicationDetail>>(
      ENDPOINTS.jobs.application(jobId, appId),
    )
    return toApplicantDetail(data.data)
  },

  /** A link to one of an application's files. It works for five minutes. */
  getApplicationFileLink: async (
    jobId: string,
    appId: string,
    fileId: string,
  ): Promise<ApiFileLink> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiFileLink>>(
      ENDPOINTS.jobs.applicationFile(jobId, appId, fileId),
    )
    return data.data
  },

  /** Decides a flagged application. The person deciding must have been the last to open it. */
  reviewApplication: async (
    jobId: string,
    appId: string,
    body: {
      decision: ApplicationDecision
      reason?: string
      note?: string
      message?: MessageBody
    },
  ): Promise<ApiApplicationResult> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiApplicationResult>>(
      ENDPOINTS.jobs.applicationReview(jobId, appId),
      body,
    )
    return data.data
  },

  /** Moves an application along: see `STATUS_TARGETS` for what each status allows. */
  changeApplicationStatus: async (
    jobId: string,
    appId: string,
    body: { status: ApplicationStatus; note?: string },
  ): Promise<ApiApplicationResult> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiApplicationResult>>(
      ENDPOINTS.jobs.applicationStatus(jobId, appId),
      body,
    )
    return data.data
  },

  /** The emails written to an application's candidate, newest first. */
  getApplicationEmails: async (jobId: string, appId: string): Promise<Message[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiMessage[]>>(
      ENDPOINTS.jobs.applicationEmails(jobId, appId),
    )
    return (data.data ?? []).map(toMessage)
  },

  /** Writes to the candidate now or later. The recipient is the application's candidate. */
  sendApplicationEmail: async (
    jobId: string,
    appId: string,
    body: MessageBody,
  ): Promise<Message> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiMessage>>(
      ENDPOINTS.jobs.applicationEmails(jobId, appId),
      body,
    )
    return toMessage(data.data)
  },

  /** The message as the candidate would get it, placeholders filled in. */
  previewApplicationEmail: async (
    jobId: string,
    appId: string,
    body: MessageBody,
  ): Promise<{ subject: string; body: string }> => {
    const { data } = await axiosInstance.post<ApiResponse<{ subject?: string; body?: string }>>(
      ENDPOINTS.jobs.applicationEmailPreview(jobId, appId),
      body,
    )
    return { subject: data.data.subject ?? '', body: data.data.body ?? '' }
  },

  cancelApplicationEmail: async (
    jobId: string,
    appId: string,
    messageId: string,
  ): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.applicationEmail(jobId, appId, messageId))
  },

  /** Files uploaded to the application and not yet sent. */
  getApplicationAttachments: async (jobId: string, appId: string): Promise<Attachment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiAttachment[]>>(
      ENDPOINTS.jobs.applicationAttachments(jobId, appId),
    )
    return (data.data ?? []).map(toAttachment)
  },

  /** Uploads one file (the server checks its type, size and content). */
  uploadApplicationAttachment: async (
    jobId: string,
    appId: string,
    file: File,
  ): Promise<Attachment> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await axiosInstance.post<ApiResponse<ApiAttachment>>(
      ENDPOINTS.jobs.applicationAttachments(jobId, appId),
      form,
    )
    return toAttachment(data.data)
  },

  deleteApplicationAttachment: async (
    jobId: string,
    appId: string,
    attachmentId: string,
  ): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.applicationAttachment(jobId, appId, attachmentId))
  },

  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiEmailTemplate[]>>(
      ENDPOINTS.hiring.emailTemplates(),
    )
    return (data.data ?? []).map(toEmailTemplate)
  },

  saveEmailTemplate: async (
    id: string | null,
    body: { name: string; subject: string; body: string },
  ): Promise<EmailTemplate> => {
    const { data } = id
      ? await axiosInstance.put<ApiResponse<ApiEmailTemplate>>(
          ENDPOINTS.hiring.emailTemplate(id),
          body,
        )
      : await axiosInstance.post<ApiResponse<ApiEmailTemplate>>(
          ENDPOINTS.hiring.emailTemplates(),
          body,
        )
    return toEmailTemplate(data.data)
  },

  deleteEmailTemplate: async (id: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.hiring.emailTemplate(id))
  },

  getEmailSettings: async (): Promise<{ replyTo: string }> => {
    const { data } = await axiosInstance.get<ApiResponse<{ reply_to?: string }>>(
      ENDPOINTS.hiring.emailSettings(),
    )
    return { replyTo: data.data.reply_to ?? '' }
  },

  setEmailSettings: async (replyTo: string): Promise<{ replyTo: string }> => {
    const { data } = await axiosInstance.put<ApiResponse<{ reply_to?: string }>>(
      ENDPOINTS.hiring.emailSettings(),
      { reply_to: replyTo },
    )
    return { replyTo: data.data.reply_to ?? '' }
  },

  getApplicationInterviews: async (jobId: string, appId: string): Promise<Interview[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiInterview[]>>(
      ENDPOINTS.jobs.applicationInterviews(jobId, appId),
    )
    return (data.data ?? []).map(toInterview)
  },

  scheduleInterview: async (
    jobId: string,
    appId: string,
    body: InterviewBody,
  ): Promise<Interview> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiInterview>>(
      ENDPOINTS.jobs.applicationInterviews(jobId, appId),
      body,
    )
    return toInterview(data.data)
  },

  /** Reschedules or edits an interview. Only what is sent changes. */
  updateInterview: async (
    jobId: string,
    appId: string,
    interviewId: string,
    body: Partial<InterviewBody>,
  ): Promise<Interview> => {
    const { data } = await axiosInstance.patch<ApiResponse<ApiInterview>>(
      ENDPOINTS.jobs.applicationInterview(jobId, appId, interviewId),
      body,
    )
    return toInterview(data.data)
  },

  /** Cancels or completes: `notify` also emails the candidate a cancellation. */
  closeInterview: async (
    jobId: string,
    appId: string,
    interviewId: string,
    action: 'cancel' | 'complete',
    body?: { note?: string; notify?: boolean },
  ): Promise<Interview> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiInterview>>(
      `${ENDPOINTS.jobs.applicationInterview(jobId, appId, interviewId)}/${action}`,
      body ?? {},
    )
    return toInterview(data.data)
  },

  getApplicationOffers: async (jobId: string, appId: string): Promise<Offer[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiOffer[]>>(
      ENDPOINTS.jobs.applicationOffers(jobId, appId),
    )
    return (data.data ?? []).map(toOffer)
  },

  createOffer: async (jobId: string, appId: string, body: OfferBody): Promise<Offer> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiOffer>>(
      ENDPOINTS.jobs.applicationOffers(jobId, appId),
      body,
    )
    return toOffer(data.data)
  },

  updateOffer: async (
    jobId: string,
    appId: string,
    offerId: string,
    body: Partial<Pick<OfferBody, 'title' | 'body' | 'compensation' | 'start_date'>>,
  ): Promise<Offer> => {
    const { data } = await axiosInstance.patch<ApiResponse<ApiOffer>>(
      ENDPOINTS.jobs.applicationOffer(jobId, appId, offerId),
      body,
    )
    return toOffer(data.data)
  },

  /** Sends a draft, or sends a sent offer again with a new expiry. */
  sendOffer: async (
    jobId: string,
    appId: string,
    offerId: string,
    expiresInDays?: number,
  ): Promise<Offer> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiOffer>>(
      `${ENDPOINTS.jobs.applicationOffer(jobId, appId, offerId)}/send`,
      { expires_in_days: expiresInDays },
    )
    return toOffer(data.data)
  },

  withdrawOffer: async (jobId: string, appId: string, offerId: string): Promise<void> => {
    await axiosInstance.post(`${ENDPOINTS.jobs.applicationOffer(jobId, appId, offerId)}/withdraw`)
  },

  getOfferAudit: async (jobId: string, appId: string, offerId: string): Promise<OfferEvent[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiOfferEvent[]>>(
      `${ENDPOINTS.jobs.applicationOffer(jobId, appId, offerId)}/audit`,
    )
    return (data.data ?? []).map(toOfferEvent)
  },

  /** A link to the signed PDF of an offer. It works for five minutes. */
  getOfferDocumentLink: async (
    jobId: string,
    appId: string,
    offerId: string,
  ): Promise<ApiFileLink> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiFileLink>>(
      `${ENDPOINTS.jobs.applicationOffer(jobId, appId, offerId)}/document`,
    )
    return data.data
  },

  getOfferTemplates: async (): Promise<OfferTemplate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiOfferTemplate[]>>(
      ENDPOINTS.hiring.offerTemplates(),
    )
    return (data.data ?? []).map(toOfferTemplate)
  },

  saveOfferTemplate: async (
    id: string | null,
    body: { name: string; body: string },
  ): Promise<OfferTemplate> => {
    const { data } = id
      ? await axiosInstance.put<ApiResponse<ApiOfferTemplate>>(
          ENDPOINTS.hiring.offerTemplate(id),
          body,
        )
      : await axiosInstance.post<ApiResponse<ApiOfferTemplate>>(
          ENDPOINTS.hiring.offerTemplates(),
          body,
        )
    return toOfferTemplate(data.data)
  },

  deleteOfferTemplate: async (id: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.hiring.offerTemplate(id))
  },

  /** An offer by the token in its link. Opening it is recorded as a view. */
  getPublicOffer: async (token: string): Promise<PublicOffer> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiPublicOffer>>(
      ENDPOINTS.public.offer(token),
    )
    return toPublicOffer(data.data)
  },

  /** Signs with a typed full name and the consent. The date is the server's. */
  signPublicOffer: async (
    token: string,
    body: { full_name: string; consent: boolean },
  ): Promise<PublicOffer> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiPublicOffer>>(
      ENDPOINTS.public.offerSign(token),
      body,
    )
    return toPublicOffer(data.data)
  },

  declinePublicOffer: async (token: string, reason?: string): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.public.offerDecline(token), { reason })
  },

  /** A link to the signed PDF. It works for five minutes. */
  getPublicOfferDocument: async (token: string): Promise<ApiFileLink> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiFileLink>>(
      ENDPOINTS.public.offerDocument(token),
    )
    return data.data
  },

  /** The job's pipeline: its stages in order, each with how many applications it holds. */
  getStages: async (jobId: string): Promise<PipelineStage[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiStage[]>>(ENDPOINTS.jobs.stages(jobId))
    return (data.data ?? []).map(toStage)
  },

  /** Adds a custom stage before Hired. Returns the new stage. */
  createStage: async (jobId: string, name: string): Promise<PipelineStage> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiStage>>(ENDPOINTS.jobs.stages(jobId), {
      name,
    })
    return toStage(data.data)
  },

  renameStage: async (jobId: string, stageId: string, name: string): Promise<PipelineStage[]> => {
    const { data } = await axiosInstance.patch<ApiResponse<ApiStage[]>>(
      ENDPOINTS.jobs.stage(jobId, stageId),
      { name },
    )
    return (data.data ?? []).map(toStage)
  },

  /** Removes a custom stage. The server refuses while applications are in it. */
  deleteStage: async (jobId: string, stageId: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.stage(jobId, stageId))
  },

  /** Puts the open stages in this order. */
  reorderStages: async (jobId: string, stageIds: string[]): Promise<PipelineStage[]> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiStage[]>>(
      ENDPOINTS.jobs.stagesOrder(jobId),
      { stage_ids: stageIds },
    )
    return (data.data ?? []).map(toStage)
  },

  /**
   * Moves an application to a stage. Hired and Disqualified decide it, and
   * Disqualified needs a reason code.
   */
  moveApplicationStage: async (
    jobId: string,
    appId: string,
    body: { stage_id: string; reason?: string; note?: string; message?: MessageBody },
  ): Promise<ApiApplicationResult & { stage_id?: string }> => {
    const { data } = await axiosInstance.post<
      ApiResponse<ApiApplicationResult & { stage_id?: string }>
    >(ENDPOINTS.jobs.applicationStage(jobId, appId), body)
    return data.data
  },

  /** Moves several applications at once. Each answers on its own: some may be refused. */
  bulkMoveStage: async (
    jobId: string,
    body: {
      application_ids: string[]
      stage_id: string
      reason?: string
      note?: string
      message?: MessageBody
    },
  ): Promise<Array<{ applicationId: string; ok: boolean; reason: string }>> => {
    const { data } = await axiosInstance.post<
      ApiResponse<Array<{ application_id?: string; ok?: boolean; reason?: string }>>
    >(ENDPOINTS.jobs.bulkStage(jobId), body)
    return (data.data ?? []).map((item) => ({
      applicationId: item.application_id ?? '',
      ok: item.ok ?? false,
      reason: item.reason ?? '',
    }))
  },

  getApplicationNotes: async (jobId: string, appId: string): Promise<Note[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiNote[]>>(
      ENDPOINTS.jobs.applicationNotes(jobId, appId),
    )
    return (data.data ?? []).map(toNote)
  },

  addApplicationNote: async (jobId: string, appId: string, body: string): Promise<Note> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiNote>>(
      ENDPOINTS.jobs.applicationNotes(jobId, appId),
      { body },
    )
    return toNote(data.data)
  },

  editApplicationNote: async (
    jobId: string,
    appId: string,
    noteId: string,
    body: string,
  ): Promise<Note> => {
    const { data } = await axiosInstance.patch<ApiResponse<ApiNote>>(
      ENDPOINTS.jobs.applicationNote(jobId, appId, noteId),
      { body },
    )
    return toNote(data.data)
  },

  deleteApplicationNote: async (jobId: string, appId: string, noteId: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.applicationNote(jobId, appId, noteId))
  },

  /** The company's tags. */
  getTags: async (): Promise<Tag[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiTag[]>>(ENDPOINTS.hiring.tags())
    return (data.data ?? []).map(toTag)
  },

  createTag: async (body: { name: string; color: string }): Promise<Tag> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiTag>>(ENDPOINTS.hiring.tags(), body)
    return toTag(data.data)
  },

  deleteTag: async (tagId: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.hiring.tag(tagId))
  },

  /** Replaces an application's tags with these. Returns the tags it now has. */
  setApplicationTags: async (jobId: string, appId: string, tagIds: string[]): Promise<Tag[]> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiTag[]>>(
      ENDPOINTS.jobs.applicationTags(jobId, appId),
      { tag_ids: tagIds },
    )
    return (data.data ?? []).map(toTag)
  },

  followApplication: async (jobId: string, appId: string, follow: boolean): Promise<void> => {
    const url = ENDPOINTS.jobs.applicationFollow(jobId, appId)
    if (follow) await axiosInstance.put(url)
    else await axiosInstance.delete(url)
  },

  /** One page of an application's timeline, newest first. */
  getApplicationActivity: async (
    jobId: string,
    appId: string,
    cursor?: string,
  ): Promise<{ items: ActivityItem[]; nextCursor?: string }> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiActivityPage>>(
      ENDPOINTS.jobs.applicationActivity(jobId, appId),
      { params: cursor ? { cursor } : undefined },
    )
    return {
      items: (data.data.items ?? []).map(toActivity),
      nextCursor: data.data.next_cursor || undefined,
    }
  },

  getDisqualificationReasons: async (): Promise<DisqualifyReason[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiReason[]>>(
      ENDPOINTS.hiring.disqualificationReasons(),
    )
    return (data.data ?? []).map(toReason)
  },

  /** The gates that apply to the job, with where each stands. */
  getComplianceGates: async (jobId: string): Promise<ApiGate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiGate[]>>(
      ENDPOINTS.jobs.compliance(jobId),
    )
    return data.data ?? []
  },

  /** Confirms or withdraws a gate. The company's confirmation is logged against the caller. */
  confirmComplianceGate: async (
    jobId: string,
    gateId: string,
    confirmed: boolean,
    revision?: number,
  ): Promise<ApiGate[]> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiGate[]>>(
      ENDPOINTS.jobs.complianceGate(jobId, gateId),
      { confirmed },
      { headers: await ifMatch(jobId, revision) },
    )
    return data.data ?? []
  },

  /** The job's screening rules. A rule flags a candidate for a person to review; it never rejects. */
  getScreeningRules: async (jobId: string): Promise<ApiRulesView> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiRulesView>>(
      ENDPOINTS.jobs.disqualificationRules(jobId),
    )
    return data.data
  },

  /** Replaces a draft's screening rules. */
  setScreeningRules: async (
    jobId: string,
    body: ApiRulesBody,
    revision?: number,
  ): Promise<ApiRulesView> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiRulesView>>(
      ENDPOINTS.jobs.disqualificationRules(jobId),
      body,
      { headers: await ifMatch(jobId, revision) },
    )
    return data.data
  },

  /** Replaces the places the job is open to. Returns the job, carrying the market warnings. */
  setJobMarkets: async (
    jobId: string,
    body: ApiMarketsBody,
    revision?: number,
  ): Promise<ApiJobView> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiJobView>>(
      ENDPOINTS.jobs.markets(jobId),
      body,
      { headers: await ifMatch(jobId, revision) },
    )
    return data.data
  },

  /** The public link and the share links of a published job. */
  getShareKit: async (jobId: string): Promise<ApiShareKit> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiShareKit>>(
      ENDPOINTS.jobs.shareKit(jobId),
    )
    return data.data
  },

  /** Records that the user saw the duplicate-job warning and kept going. */
  dismissDuplicateWarning: async (jobId: string): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.jobs.dismissDuplicates(jobId))
  },

  /** What the company must have on file before it can publish. */
  getCompanySetup: async (): Promise<ApiCompanySetup> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiCompanySetup>>(
      ENDPOINTS.organization.agreements(),
    )
    return data.data
  },

  /** Accepts the data processing agreement. `version` is the one `getCompanySetup` asked for. */
  acceptAgreements: async (version: string): Promise<ApiCompanySetup> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiCompanySetup>>(
      ENDPOINTS.organization.agreements(),
      { version },
    )
    return data.data
  },

  recordDpia: async (body: ApiDpiaBody): Promise<ApiCompanySetup> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiCompanySetup>>(
      ENDPOINTS.organization.dpia(),
      body,
    )
    return data.data
  },

  setPrivacyContact: async (body: ApiPrivacyContactBody): Promise<ApiCompanySetup> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiCompanySetup>>(
      ENDPOINTS.organization.privacyContact(),
      body,
    )
    return data.data
  },

  /** Where the company's verification (KYB) stands. */
  getKyb: async (): Promise<ApiKybState> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verification(),
    )
    return data.data
  },

  /** First submission, or a full resubmission after a failure. */
  submitKyb: async (body: ApiKybSubmitBody): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verification(),
      body,
    )
    return data.data
  },

  /** Individuals: asks for a new manual review after a rejection (an empty body). */
  requestKybReview: async (): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verification(),
      {},
    )
    return data.data
  },

  /** Light retry after number_not_found or name_mismatch; country and address are reused. */
  retryKyb: async (body: ApiKybRetryBody): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verificationRetry(),
      body,
    )
    return data.data
  },

  /** Clears the registration number and identifiers; name and address stay. Back to not_started. */
  changeKybCountry: async (countryCode: string): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verificationChangeCountry(),
      { country_code: countryCode },
    )
    return data.data
  },

  /** Accepts an address_mismatch warning, saying whether the address is registered or trading. */
  confirmKybAddress: async (addressType: 'registered' | 'trading'): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verificationConfirmAddress(),
      { address_type: addressType },
    )
    return data.data
  },

  /** One-click fix for a name_mismatch: the registry's legal name replaces what was typed. */
  confirmKybName: async (): Promise<ApiKybState> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiKybState>>(
      ENDPOINTS.organization.verificationConfirmName(),
    )
    return data.data
  },

  /** Company-level switches. Automated screening is off until the legal contact turns it on. */
  getHiringSettings: async (): Promise<ApiHiringSettings> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiHiringSettings>>(
      ENDPOINTS.hiring.settings(),
    )
    return data.data
  },

  setAutomatedScreening: async (enabled: boolean): Promise<ApiHiringSettings> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiHiringSettings>>(
      ENDPOINTS.hiring.settings(),
      { automated_screening_enabled: enabled },
    )
    return data.data
  },

  /** Whether rejected candidates are blocked from reapplying, and whether they are emailed. */
  getApplicantSettings: async (): Promise<ApiApplicantSettings> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiApplicantSettings>>(
      ENDPOINTS.hiring.applicantSettings(),
    )
    return data.data
  },

  setApplicantSettings: async (body: ApiApplicantSettingsBody): Promise<ApiApplicantSettings> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiApplicantSettings>>(
      ENDPOINTS.hiring.applicantSettings(),
      body,
    )
    return data.data
  },

  // No jobs endpoints yet — resolves with local fixtures so the query layer and
  // screens are already shaped for the real call.
  /**
   * Every job the caller may see that matches the query, as the screens show
   * them. The list endpoint pages by cursor; the pages are followed to the end
   * because the tab counts and the local filters need the whole set.
   */
  getJobs: async (query: JobListQuery = {}): Promise<Job[]> => {
    const [rows, people] = await Promise.all([allJobRows(query), peopleById()])
    return rows.map((row) => toJob(row, { people }))
  },

  /** Company job-details templates, pinned first. */
  getJobTemplates: async (): Promise<JobTemplate[]> => {
    const [templates, people, departments, me] = await Promise.all([
      axiosInstance.get<ApiResponse<ApiTemplate[]>>(ENDPOINTS.hiring.templates(), {
        params: { kind: 'job_details' },
      }),
      peopleById(),
      requests.listDepartments(),
      requests.getHiringMe(),
    ])
    const lookups = {
      people,
      departments: new Map(departments.map((item) => [item.id ?? '', item.name ?? ''])),
      me: me.user_id,
    }
    return (
      (templates.data.data ?? [])
        // The caller's personal default is not a company template: it cannot
        // be renamed, pinned, duplicated or exported.
        .filter((row) => !row.is_default)
        .map((row) => toTemplate(row, lookups))
    )
  },
  /** The signed-in person in the hiring workspace: their permissions and their company. */
  getHiringMe: async (): Promise<ApiHiringMe> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiHiringMe>>(ENDPOINTS.hiring.me())
    return data.data ?? {}
  },

  /** How many jobs there are in each status, for the tabs. */
  getJobCounts: async (): Promise<Record<JobStatus, number>> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiJobCounts>>(ENDPOINTS.jobs.counts())
    return countsByStatus(data.data ?? {})
  },

  /** A single-job status change: pause, resume, close, reopen, archive, to-draft or publish. */
  transitionJob: async (id: string, action: string, revision?: number): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.jobs.transition(id, action), undefined, {
      headers: await ifMatch(id, revision),
    })
  },

  /** Pause, resume, close, reopen, archive or move to draft for up to 100 jobs; not all-or-nothing. */
  bulkJobs: async (action: string, ids: string[]): Promise<ApiBulkResult> => {
    const { data } = await axiosInstance.post<{ data: ApiBulkResult }>(ENDPOINTS.jobs.bulk(), {
      action,
      ids,
    })
    return data.data
  },

  /** Copies a job into a new draft owned by the caller, and returns the copy's id. */
  duplicateJob: async (id: string): Promise<string> => {
    const { data } = await axiosInstance.post<ApiResponse<{ id?: string }>>(
      ENDPOINTS.jobs.duplicate(id),
    )
    return data.data?.id ?? ''
  },

  /** The job's hiring team. The creator always has access and is not listed. */
  getJobMembers: async (id: string): Promise<ApiJobMember[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiJobMember[]>>(
      ENDPOINTS.jobs.members(id),
    )
    return data.data ?? []
  },

  /**
   * Replaces a job's hiring team. The creator already has access and must not
   * be listed; the API refuses them.
   */
  setJobMembers: async (
    id: string,
    members: { userId: string; role: JobMemberRole }[],
    revision?: number,
  ): Promise<void> => {
    await axiosInstance.put(
      ENDPOINTS.jobs.members(id),
      { members: members.map((member) => ({ user_id: member.userId, role: member.role })) },
      { headers: await ifMatch(id, revision) },
    )
  },

  /** Only drafts can be deleted; the API answers 409 for anything else. */
  deleteJob: async (id: string, revision?: number): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.one(id), { headers: await ifMatch(id, revision) })
  },

  /** The compliance check for a job: what would stop it publishing, and what to look at. Writes nothing. */
  getPublishCheck: async (id: string): Promise<ApiPublishCheck> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiPublishCheck>>(
      ENDPOINTS.jobs.publishCheck(id),
    )
    return data.data ?? {}
  },

  /** Publishes the job. The API refuses a blocked job with 422 and every issue in the error. */
  publishJob: async (id: string, revision?: number): Promise<ApiPublishResult> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiPublishResult>>(
      ENDPOINTS.jobs.publish(id),
      undefined,
      { headers: await ifMatch(id, revision) },
    )
    return data.data ?? {}
  },

  getJob: async (id: string): Promise<ApiJobView> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiJobView>>(ENDPOINTS.jobs.one(id))
    return data.data
  },

  /** A new draft. Every field is optional; `template_id` counts as a use of that template. */
  createJob: async (body: ApiJobBody): Promise<ApiJobView> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiJobView>>(ENDPOINTS.jobs.list(), body)
    return data.data
  },

  /** Saves whichever fields are sent; nothing is required of a draft. */
  updateJob: async (id: string, body: ApiJobBody, revision?: number): Promise<ApiJobView> => {
    const { data } = await axiosInstance.patch<ApiResponse<ApiJobView>>(
      ENDPOINTS.jobs.one(id),
      body,
      { headers: await ifMatch(id, revision) },
    )
    return data.data
  },

  /** Saves the details step as finished, which is when the API checks it is complete. */
  completeJobDetails: async (
    id: string,
    body: ApiJobBody,
    revision?: number,
  ): Promise<ApiJobView> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiJobView>>(
      ENDPOINTS.jobs.details(id),
      body,
      { headers: await ifMatch(id, revision) },
    )
    return data.data
  },

  /** An empty date clears it; a past date is refused. */
  setJobClosingDate: async (id: string, closingDate: string, revision?: number): Promise<void> => {
    await axiosInstance.patch(
      ENDPOINTS.jobs.one(id),
      { closing_date: closingDate },
      { headers: await ifMatch(id, revision) },
    )
  },

  /** CSV by default; `json` returns the same rows as the jobs list. */
  exportJobs: async (options: {
    ids?: string[]
    status?: string[]
    format?: 'csv' | 'json'
  }): Promise<string> => {
    const { data } = await axiosInstance.get<string>(ENDPOINTS.jobs.export(), {
      params: {
        ...(options.ids?.length ? { ids: options.ids.join(',') } : {}),
        ...(options.status?.length ? { status: options.status.join(',') } : {}),
        ...(options.format === 'json' ? { format: 'json' } : {}),
      },
      // The body is a file, not an envelope: keep it as the text it is.
      responseType: 'text',
      transformResponse: (body: string) => body,
    })
    return data
  },

  /** Rename or pin a company template. A name already taken answers 400. */
  updateTemplate: async (
    id: string,
    change: { name?: string; pinned?: boolean },
  ): Promise<void> => {
    await axiosInstance.patch(ENDPOINTS.hiring.template(id), change)
  },

  /** Without a name the copy is called "<name> (copy)". */
  duplicateTemplate: async (id: string, name?: string): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.hiring.templateDuplicate(id), name ? { name } : {})
  },

  exportTemplate: async (id: string): Promise<ApiTemplateExport> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiTemplateExport>>(
      ENDPOINTS.hiring.templateExport(id),
    )
    return data.data
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.hiring.template(id))
  },

  /** The job's application form: its questions and special categories. */
  getApplicationForm: async (id: string): Promise<ApiApplicationForm> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiApplicationForm>>(
      ENDPOINTS.jobs.applicationForm(id),
    )
    return data.data
  },

  /** Replaces the whole form, so every question is sent. Returns the saved form. */
  saveApplicationForm: async (
    id: string,
    body: ApiApplicationFormBody,
    revision?: number,
  ): Promise<ApiApplicationForm> => {
    const { data } = await axiosInstance.put<ApiResponse<ApiApplicationForm>>(
      ENDPOINTS.jobs.applicationForm(id),
      body,
      { headers: await ifMatch(id, revision) },
    )
    return data.data
  },

  /** A company template made from an existing job. */
  saveJobAsTemplate: async (jobId: string, name: string): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.hiring.templates(), {
      kind: 'job_details',
      from_job_id: jobId,
      name,
    })
  },

  /** The workspace's members, for assigning and for the people filters. */
  listPeople: async (search?: string): Promise<JobManager[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiPerson[]>>(ENDPOINTS.hiring.people(), {
      params: search?.trim() ? { q: search.trim() } : undefined,
    })
    return (data.data ?? []).map(toManager)
  },

  getHiringCatalog: async (): Promise<ApiCatalog> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiCatalog>>(ENDPOINTS.hiring.catalog())
    return data.data
  },

  listDepartments: async (): Promise<ApiDepartment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiDepartment[]>>(
      ENDPOINTS.hiring.departments(),
    )
    return data.data ?? []
  },

  /** Names are unique ignoring case; an existing name returns the existing department. */
  createDepartment: async (name: string): Promise<ApiDepartment> => {
    const { data } = await axiosInstance.post<ApiResponse<ApiDepartment>>(
      ENDPOINTS.hiring.departments(),
      { name },
    )
    return data.data
  },

  listTimezones: async (): Promise<ApiTimezone[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiTimezone[]>>(
      ENDPOINTS.hiring.timezones(),
    )
    return data.data ?? []
  },

  searchSkills: async (search: string, limit = 20): Promise<ApiCatalogItem[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ApiCatalogItem[]>>(
      ENDPOINTS.hiring.skills(),
      { params: { q: search, limit } },
    )
    return data.data ?? []
  },

  getMe: async (): Promise<AuthMeData> => {
    const { data } = await axiosInstance.get<ApiResponse<AuthMeData>>(ENDPOINTS.auth.me())
    return data.data
  },

  getInvite: async (token: string): Promise<AuthInviteData> => {
    const { data } = await axiosInstance.get<ApiResponse<AuthInviteData>>(
      ENDPOINTS.auth.invite(token),
    )
    return data.data
  },

  acceptInvite: async (payload: AuthAcceptInvitePayload): Promise<AuthSessionData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthSessionData>>(
      ENDPOINTS.auth.acceptInvite(),
      payload,
    )
    return data.data
  },

  enrollTotp: async (): Promise<AuthTotpEnrollData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthTotpEnrollData>>(
      ENDPOINTS.auth.totpEnroll(),
    )
    return data.data
  },

  confirmTotp: async (payload: AuthTotpConfirmPayload): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.auth.totpConfirm(), payload)
  },

  disableTotp: async (payload: AuthTotpDisablePayload): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.auth.totpDisable(), payload)
  },

  inviteTeammate: async (payload: OrganizationInvitePayload): Promise<OrganizationInviteData> => {
    const { data } = await axiosInstance.post<ApiResponse<OrganizationInviteData>>(
      ENDPOINTS.organizations.invites(),
      payload,
    )
    return data.data
  },

  // ── Product onboarding reference ──────────────────────────────────────────

  getCompanyRoles: async (): Promise<CompanyRole[]> => {
    const { data } = await axiosInstance.get<ApiResponse<CompanyRole[]>>(
      ENDPOINTS.onboarding.companyRoles(),
    )
    return data.data
  },

  getBusinessTypes: async (): Promise<BusinessType[]> => {
    const { data } = await axiosInstance.get<ApiResponse<BusinessType[]>>(
      ENDPOINTS.onboarding.businessTypes(),
    )
    return data.data
  },

  getOnboardingIndustries: async (): Promise<OnboardingIndustry[]> => {
    const { data } = await axiosInstance.get<ApiResponse<OnboardingIndustry[]>>(
      ENDPOINTS.onboarding.industries(),
    )
    return data.data
  },

  // ── Product onboarding steps ──────────────────────────────────────────────

  upsertProfile: async (payload: ProductProfilePayload): Promise<ProductProfileData> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductProfileData>>(
      ENDPOINTS.onboarding.profile(),
      payload,
    )
    return data.data
  },

  upsertAddress: async (payload: ProductAddressPayload): Promise<ProductAddressData> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductAddressData>>(
      ENDPOINTS.onboarding.address(),
      payload,
    )
    return data.data
  },

  searchAddress: async (
    payload: ProductAddressSearchPayload,
  ): Promise<ProductAddressSearchData> => {
    const { data } = await axiosInstance.post<ApiResponse<ProductAddressSearchData>>(
      ENDPOINTS.onboarding.addressSearch(),
      payload,
    )
    return data.data
  },

  getIdentificationRequirements: async (
    countryId: string,
  ): Promise<IdentificationRequirementsData> => {
    const { data } = await axiosInstance.get<ApiResponse<IdentificationRequirementsData>>(
      ENDPOINTS.onboarding.identificationRequirements(),
      { params: { country_id: countryId } },
    )
    return data.data
  },

  upsertCompliance: async (payload: ProductCompliancePayload): Promise<ProductComplianceData> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductComplianceData>>(
      ENDPOINTS.onboarding.compliance(),
      payload,
    )
    return data.data
  },

  verifyAddress: async (
    payload: ProductAddressVerifyPayload,
  ): Promise<ProductAddressVerifyData> => {
    const { data } = await axiosInstance.post<ApiResponse<ProductAddressVerifyData>>(
      ENDPOINTS.onboarding.addressVerify(),
      payload,
    )
    return data.data
  },

  upsertBusiness: async (payload: ProductBusinessPayload): Promise<ProductBusinessData> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductBusinessData>>(
      ENDPOINTS.onboarding.business(),
      payload,
    )
    return data.data
  },

  getOnboardingStatus: async (): Promise<ProductOnboardingStatusData> => {
    const { data } = await axiosInstance.get<ApiResponse<ProductOnboardingStatusData>>(
      ENDPOINTS.onboarding.status(),
    )
    return data.data
  },

  completeOnboarding: async (): Promise<ProductOnboardingCompleteData> => {
    const { data } = await axiosInstance.post<ApiResponse<ProductOnboardingCompleteData>>(
      ENDPOINTS.onboarding.complete(),
    )
    return data.data
  },
}

export { requests }
