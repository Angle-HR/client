import { axiosInstance } from '@/config/axios'

import { ENDPOINTS } from './endpoints'
import { jobListParams, toJob, toManager, toTemplate } from './jobs/api'
import { toJobPermissions } from './jobs/permissions'

import type {
  ApiBulkResult,
  ApiCatalog,
  ApiCatalogItem,
  ApiDepartment,
  ApiJobBody,
  ApiJobView,
  ApiJobListItem,
  ApiPerson,
  ApiTemplate,
  ApiTemplateExport,
  ApiTimezone,
  JobListQuery,
} from './jobs/api-types'
import type { JobPermissions } from './jobs/permissions'
import type { JobTemplate } from './jobs/templates'
import type { Job, JobManager } from './jobs/types'
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
  AuthLogoutPayload,
  AuthMeData,
  AuthRefreshData,
  AuthRefreshPayload,
  AuthResendVerificationPayload,
  AuthResetPasswordData,
  AuthResetPasswordPayload,
  AuthSignupData,
  AuthSignupPatchPayload,
  AuthSignupPayload,
  AuthTokenData,
  AuthTotpConfirmPayload,
  AuthTotpDisablePayload,
  AuthTotpEnrollData,
  AuthTotpLoginPayload,
  AuthVerifyEmailPayload,
  BusinessType,
  CompanyRole,
  Country,
  HiringFrustration,
  HiringTool,
  IdentificationRequirementsData,
  Industry,
  OnboardingIndustry,
  OnboardingPayload,
  OnboardingResponse,
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
  Role,
  TeamSize,
  WaitlistPayload,
  WaitlistResponse,
} from './types'

/** The roles a person can hold on one job's hiring team. */
type JobMemberRole = 'hiring_manager' | 'recruiter' | 'interviewer' | 'viewer'

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

/** user id → name, for the ids a job or template carries. */
async function peopleById(): Promise<Map<string, string>> {
  const { data } = await axiosInstance.get<ApiResponse<ApiPerson[]>>(ENDPOINTS.hiring.people())
  return new Map((data.data ?? []).map((person) => [person.user_id ?? '', person.name ?? '']))
}

/** The list endpoints page with a cursor carried in the envelope's meta. */
interface CursorMeta {
  meta?: { has_more?: boolean; next_cursor?: string }
}

/** The revision the client loaded, so the API can refuse to overwrite a newer one. */
const ifMatch = (revision: number | undefined): Record<string, string> =>
  revision === undefined ? {} : { 'If-Match': String(revision) }

const requests = {
  joinWaitlist: async (payload: WaitlistPayload): Promise<WaitlistResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<WaitlistResponse>>(
      ENDPOINTS.waitlist.join(),
      payload,
    )
    return data.data
  },

  submitOnboarding: async (payload: OnboardingPayload): Promise<OnboardingResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<OnboardingResponse>>(
      ENDPOINTS.waitlist.onboarding(),
      payload,
    )
    return data.data
  },

  getCountries: async (): Promise<Country[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Country[]>>(ENDPOINTS.countries())
    return data.data
  },

  getIndustries: async (): Promise<Industry[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Industry[]>>(ENDPOINTS.industries())
    return data.data
  },

  getHiringTools: async (): Promise<HiringTool[]> => {
    const { data } = await axiosInstance.get<ApiResponse<HiringTool[]>>(ENDPOINTS.hiringTools())
    return data.data
  },

  getHiringFrustrations: async (): Promise<HiringFrustration[]> => {
    const { data } = await axiosInstance.get<ApiResponse<HiringFrustration[]>>(
      ENDPOINTS.hiringFrustrations(),
    )
    return data.data
  },

  getRoles: async (): Promise<Role[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Role[]>>(ENDPOINTS.roles())
    return data.data
  },

  getTeamSizes: async (): Promise<TeamSize[]> => {
    const { data } = await axiosInstance.get<ApiResponse<TeamSize[]>>(ENDPOINTS.teamSizes())
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

  verifyEmail: async (payload: AuthVerifyEmailPayload): Promise<AuthTokenData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthTokenData>>(
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

  verifyLoginTotp: async (payload: AuthTotpLoginPayload): Promise<AuthTokenData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthTokenData>>(
      ENDPOINTS.auth.loginTotp(),
      payload,
    )
    return data.data
  },

  logout: async (payload: AuthLogoutPayload): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.auth.logout(), payload)
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
      axiosInstance.get<ApiResponse<{ user_id?: string }>>(ENDPOINTS.hiring.me()),
    ])
    const lookups = {
      people,
      departments: new Map(departments.map((item) => [item.id ?? '', item.name ?? ''])),
      me: me.data.data?.user_id,
    }
    return (
      (templates.data.data ?? [])
        // The caller's personal default is not a company template: it cannot
        // be renamed, pinned, duplicated or exported.
        .filter((row) => !row.is_default)
        .map((row) => toTemplate(row, lookups))
    )
  },
  /** What this person may do with jobs, from the permissions the API lists for them. */
  getJobPermissions: async (): Promise<JobPermissions> => {
    const { data } = await axiosInstance.get<ApiResponse<{ permissions?: string[] }>>(
      ENDPOINTS.hiring.me(),
    )
    return toJobPermissions(data.data?.permissions)
  },

  /** A single-job status change: pause, resume, close, reopen, archive, to-draft or publish. */
  transitionJob: async (id: string, action: string, revision?: number): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.jobs.transition(id, action), undefined, {
      headers: ifMatch(revision),
    })
  },

  /** Pause, close, archive or move to draft for up to 100 jobs; not all-or-nothing. */
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
      { headers: ifMatch(revision) },
    )
  },

  /** Only drafts can be deleted; the API answers 409 for anything else. */
  deleteJob: async (id: string, revision?: number): Promise<void> => {
    await axiosInstance.delete(ENDPOINTS.jobs.one(id), { headers: ifMatch(revision) })
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
      { headers: ifMatch(revision) },
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
      { headers: ifMatch(revision) },
    )
    return data.data
  },

  /** An empty date clears it; a past date is refused. */
  setJobClosingDate: async (id: string, closingDate: string, revision?: number): Promise<void> => {
    await axiosInstance.patch(
      ENDPOINTS.jobs.one(id),
      { closing_date: closingDate },
      { headers: ifMatch(revision) },
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

  acceptInvite: async (payload: AuthAcceptInvitePayload): Promise<AuthTokenData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthTokenData>>(
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

  refreshToken: async (payload: AuthRefreshPayload): Promise<AuthRefreshData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthRefreshData>>(
      ENDPOINTS.auth.refresh(),
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
