'use client'

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { toJobPermissions } from './jobs/permissions'
import { queryKeys } from './query-keys'
import { requests } from './requests'

import type { ApplicationListQuery } from './applications/api-types'
import type { JobListQuery } from './jobs/api-types'

/** The public careers page of one company. Skipped until there is a slug. */
function useCareersPage(slug: string) {
  return useQuery({
    queryKey: queryKeys.careersPage(slug),
    queryFn: () => requests.getCareersPage(slug),
    enabled: Boolean(slug),
  })
}

/** One public job, by its public id. The company slug is only part of the careers URL. */
function usePublicJob(slug: string, jobId: string) {
  return useQuery({
    queryKey: queryKeys.publicJob(slug, jobId),
    queryFn: () => requests.getPublicJob(slug, jobId),
    enabled: Boolean(jobId),
  })
}

function useCountries() {
  return useQuery({ queryKey: queryKeys.countries, queryFn: requests.getCountries })
}

function useCompanyRoles() {
  return useQuery({ queryKey: queryKeys.companyRoles, queryFn: requests.getCompanyRoles })
}

function useBusinessTypes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.businessTypes,
    queryFn: requests.getBusinessTypes,
    enabled,
  })
}

function useOnboardingIndustries() {
  return useQuery({
    queryKey: queryKeys.onboardingIndustries,
    queryFn: requests.getOnboardingIndustries,
  })
}

function useMe(enabled = true) {
  return useQuery({ queryKey: queryKeys.me, queryFn: requests.getMe, enabled })
}

function useJobPermissions() {
  return useQuery({
    queryKey: queryKeys.hiringMe,
    queryFn: requests.getHiringMe,
    select: (me) => toJobPermissions(me.permissions),
  })
}

/** The signed-in person in the hiring workspace, with their company's address. */
function useHiringMe() {
  return useQuery({ queryKey: queryKeys.hiringMe, queryFn: requests.getHiringMe })
}

/** Jobs per status, for the tabs. */
function useJobCounts() {
  return useQuery({ queryKey: queryKeys.jobCounts, queryFn: requests.getJobCounts })
}

/**
 * The jobs matching a query — every job when there is none. Filters the API
 * can apply go in the query; the rest are applied to the result on the page.
 */
function useJobs(query: JobListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.jobList(query),
    queryFn: () => requests.getJobs(query),
    // Typing in the search or adding a filter keeps the last list on screen
    // until the new one arrives, instead of blanking the page.
    placeholderData: keepPreviousData,
  })
}

function usePeople() {
  return useQuery({ queryKey: queryKeys.people, queryFn: () => requests.listPeople() })
}

/** One job in full, for editing. Skipped until there is an id. */
function useJob(id: string | null) {
  return useQuery({
    queryKey: queryKeys.job(id ?? ''),
    queryFn: () => requests.getJob(id ?? ''),
    enabled: Boolean(id),
    // The form is filled from this once; a refetch must not overwrite typing.
    staleTime: Infinity,
    gcTime: 0,
  })
}

/** The hiring team of one job. Skipped until there is an id. */
function useJobMembers(id: string | null) {
  return useQuery({
    queryKey: queryKeys.jobMembers(id ?? ''),
    queryFn: () => requests.getJobMembers(id ?? ''),
    enabled: Boolean(id),
  })
}

/** The compliance check of one job. Skipped until there is an id; refetched after a publish attempt. */
function usePublishCheck(id: string | null) {
  return useQuery({
    queryKey: queryKeys.publishCheck(id ?? ''),
    queryFn: () => requests.getPublishCheck(id ?? ''),
    enabled: Boolean(id),
  })
}

/**
 * A job's applications, a page at a time. Fetch the next page while `hasNextPage`.
 * `enabled` is false for a stage the server has no status for, so nothing is asked.
 */
function useApplications(jobId: string, query: ApplicationListQuery = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.applicationList(jobId, query),
    queryFn: ({ pageParam }) => requests.getApplications(jobId, query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor,
    enabled: Boolean(jobId) && enabled,
    placeholderData: keepPreviousData,
  })
}

/** An offer by its link token. A 404 means the link is unknown or has ended, so it is not retried. */
function usePublicOffer(token: string) {
  return useQuery({
    queryKey: queryKeys.publicOffer(token),
    queryFn: () => requests.getPublicOffer(token),
    enabled: Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** The emails written to a candidate. */
function useApplicationEmails(jobId: string, appId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.emails(jobId, appId ?? ''),
    queryFn: () => requests.getApplicationEmails(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

/** Files uploaded for the next email and not yet sent. */
function useApplicationAttachments(jobId: string, appId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.attachments(jobId, appId ?? ''),
    queryFn: () => requests.getApplicationAttachments(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

function useApplicationInterviews(jobId: string, appId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviews(jobId, appId ?? ''),
    queryFn: () => requests.getApplicationInterviews(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

function useApplicationOffers(jobId: string, appId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.offers(jobId, appId ?? ''),
    queryFn: () => requests.getApplicationOffers(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

function useOfferAudit(jobId: string, appId: string, offerId: string | null) {
  return useQuery({
    queryKey: queryKeys.offerAudit(jobId, appId, offerId ?? ''),
    queryFn: () => requests.getOfferAudit(jobId, appId, offerId ?? ''),
    enabled: Boolean(offerId),
  })
}

function useEmailTemplates() {
  return useQuery({ queryKey: queryKeys.emailTemplates, queryFn: requests.getEmailTemplates })
}

function useEmailSettings() {
  return useQuery({ queryKey: queryKeys.emailSettings, queryFn: requests.getEmailSettings })
}

function useOfferTemplates() {
  return useQuery({ queryKey: queryKeys.offerTemplates, queryFn: requests.getOfferTemplates })
}

/** A job's pipeline stages, in order, with how many applications each holds. */
function useStages(jobId: string) {
  return useQuery({
    queryKey: queryKeys.stages(jobId),
    queryFn: () => requests.getStages(jobId),
    enabled: Boolean(jobId),
  })
}

/** An application's notes. Skipped until one is picked or the tab is open. */
function useApplicationNotes(jobId: string, appId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notes(jobId, appId ?? ''),
    queryFn: () => requests.getApplicationNotes(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

/** An application's timeline, a page at a time, newest first. */
function useApplicationActivity(jobId: string, appId: string | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity(jobId, appId ?? ''),
    queryFn: ({ pageParam }) => requests.getApplicationActivity(jobId, appId ?? '', pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor,
    enabled: Boolean(jobId) && Boolean(appId) && enabled,
  })
}

/** The company's tags. */
function useTags() {
  return useQuery({ queryKey: queryKeys.tags, queryFn: requests.getTags })
}

/** The reasons a candidate can be disqualified for. They rarely change. */
function useDisqualificationReasons() {
  return useQuery({
    queryKey: queryKeys.disqualificationReasons,
    queryFn: requests.getDisqualificationReasons,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * The link to one application file, for showing it inline. Links work for five
 * minutes, so the link is asked for again after four.
 */
function useApplicationFileLink(jobId: string, appId: string, fileId: string | null) {
  return useQuery({
    queryKey: queryKeys.applicationFile(jobId, appId, fileId ?? ''),
    queryFn: () => requests.getApplicationFileLink(jobId, appId, fileId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId) && Boolean(fileId),
    staleTime: 4 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/** One application. Skipped until one is picked. Opening it is recorded, so it is never refetched on focus. */
function useApplication(jobId: string, appId: string | null) {
  return useQuery({
    queryKey: queryKeys.application(jobId, appId ?? ''),
    queryFn: () => requests.getApplication(jobId, appId ?? ''),
    enabled: Boolean(jobId) && Boolean(appId),
    refetchOnWindowFocus: false,
  })
}

/** The compliance gates of one job. Skipped until there is an id. */
function useComplianceGates(id: string | null) {
  return useQuery({
    queryKey: queryKeys.compliance(id ?? ''),
    queryFn: () => requests.getComplianceGates(id ?? ''),
    enabled: Boolean(id),
  })
}

/** The job's screening rules. Skipped until there is an id. */
function useScreeningRules(id: string | null) {
  return useQuery({
    queryKey: queryKeys.screeningRules(id ?? ''),
    queryFn: () => requests.getScreeningRules(id ?? ''),
    enabled: Boolean(id),
  })
}

/** The share links of a published job. Pass null until it has been published: the API refuses before then. */
function useShareKit(id: string | null) {
  return useQuery({
    queryKey: queryKeys.shareKit(id ?? ''),
    queryFn: () => requests.getShareKit(id ?? ''),
    enabled: Boolean(id),
  })
}

/** What the company has on file to publish: agreement, DPIA, privacy contact. */
function useCompanySetup() {
  return useQuery({ queryKey: queryKeys.companySetup, queryFn: requests.getCompanySetup })
}

/** The company's verification (KYB) state. Not retried: a 404 means none was started. */
function useKyb() {
  return useQuery({ queryKey: queryKeys.kyb, queryFn: requests.getKyb })
}

/** The company's hiring switches. */
function useHiringSettings() {
  return useQuery({ queryKey: queryKeys.hiringSettings, queryFn: requests.getHiringSettings })
}

/** The company's candidate settings: reapply block and status emails. */
function useApplicantSettings() {
  return useQuery({ queryKey: queryKeys.applicantSettings, queryFn: requests.getApplicantSettings })
}

/** The application form of one job. Skipped until there is an id. */
function useApplicationForm(id: string | null) {
  return useQuery({
    queryKey: queryKeys.applicationForm(id ?? ''),
    queryFn: () => requests.getApplicationForm(id ?? ''),
    enabled: Boolean(id),
    // Edits live on the page; a refetch must not overwrite them.
    staleTime: Infinity,
    gcTime: 0,
  })
}

/** The job form's fixed pick lists. They change with releases, not sessions. */
function useHiringCatalog() {
  return useQuery({
    queryKey: queryKeys.hiringCatalog,
    queryFn: requests.getHiringCatalog,
    staleTime: Infinity,
  })
}

function useDepartments() {
  return useQuery({ queryKey: queryKeys.departments, queryFn: requests.listDepartments })
}

function useTimezones() {
  return useQuery({
    queryKey: queryKeys.timezones,
    queryFn: requests.listTimezones,
    staleTime: Infinity,
  })
}

// More than the catalogue holds, so one request brings all of it.
const SKILLS_LIMIT = 200

/** The skills catalogue, for the form's suggestions. */
function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: () => requests.searchSkills('', SKILLS_LIMIT),
    staleTime: Infinity,
  })
}

function useJobTemplates() {
  return useQuery({ queryKey: queryKeys.jobTemplates, queryFn: requests.getJobTemplates })
}

/** Invite lookup is keyed by token so a different link refetches. */
function useInvite(token: string) {
  return useQuery({
    queryKey: queryKeys.invite(token),
    queryFn: () => requests.getInvite(token),
    enabled: Boolean(token),
    retry: false,
  })
}

/** Identification inputs for a country. Skipped until a country is chosen. */
function useIdentificationRequirements(countryId?: string) {
  return useQuery({
    queryKey: queryKeys.identificationRequirements(countryId ?? ''),
    queryFn: () => requests.getIdentificationRequirements(countryId as string),
    enabled: Boolean(countryId),
  })
}

function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: queryKeys.onboardingStatus,
    queryFn: requests.getOnboardingStatus,
    enabled,
  })
}

export {
  useCareersPage,
  usePublicJob,
  useApplicationForm,
  useApplicantSettings,
  useHiringSettings,
  useCompanySetup,
  useKyb,
  useComplianceGates,
  useScreeningRules,
  useShareKit,
  useApplications,
  useApplication,
  useApplicationFileLink,
  useStages,
  useApplicationEmails,
  useApplicationAttachments,
  useApplicationInterviews,
  useApplicationOffers,
  useOfferAudit,
  useEmailTemplates,
  useEmailSettings,
  useOfferTemplates,
  usePublicOffer,
  useApplicationNotes,
  useApplicationActivity,
  useTags,
  useDisqualificationReasons,
  usePublishCheck,
  useJobMembers,
  useIdentificationRequirements,
  useInvite,
  useMe,
  useDepartments,
  useHiringCatalog,
  useHiringMe,
  useJobCounts,
  useJob,
  useJobPermissions,
  useJobs,
  useSkills,
  useTimezones,
  usePeople,
  useJobTemplates,
  useBusinessTypes,
  useCompanyRoles,
  useCountries,
  useOnboardingIndustries,
  useOnboardingStatus,
}
