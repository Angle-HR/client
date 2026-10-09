'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { queryKeys } from './query-keys'
import { requests } from './requests'

import type { JobListQuery } from './jobs/api-types'

function useCountries() {
  return useQuery({ queryKey: queryKeys.countries, queryFn: requests.getCountries })
}

function useIndustries() {
  return useQuery({ queryKey: queryKeys.industries, queryFn: requests.getIndustries })
}

function useHiringTools() {
  return useQuery({ queryKey: queryKeys.hiringTools, queryFn: requests.getHiringTools })
}

function useHiringFrustrations() {
  return useQuery({
    queryKey: queryKeys.hiringFrustrations,
    queryFn: requests.getHiringFrustrations,
  })
}

function useRoles() {
  return useQuery({ queryKey: queryKeys.roles, queryFn: requests.getRoles })
}

function useTeamSizes() {
  return useQuery({ queryKey: queryKeys.teamSizes, queryFn: requests.getTeamSizes })
}

function useCompanyRoles() {
  return useQuery({ queryKey: queryKeys.companyRoles, queryFn: requests.getCompanyRoles })
}

function useBusinessTypes() {
  return useQuery({ queryKey: queryKeys.businessTypes, queryFn: requests.getBusinessTypes })
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
  return useQuery({ queryKey: queryKeys.jobPermissions, queryFn: requests.getJobPermissions })
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

/** The skills catalogue, for the form's suggestions. */
function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: () => requests.searchSkills('', 100),
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

// Combines the five survey option lists into the single loading/error surface
// app/survey/page.tsx renders around, mirroring the old `Promise.all` call.
function useSurveyOptions() {
  const industries = useIndustries()
  const hiringTools = useHiringTools()
  const hiringFrustrations = useHiringFrustrations()
  const roles = useRoles()
  const teamSizes = useTeamSizes()

  const queries = [industries, hiringTools, hiringFrustrations, roles, teamSizes]

  return {
    industries,
    hiringTools,
    hiringFrustrations,
    roles,
    teamSizes,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    refetch: () => queries.forEach((q) => q.refetch()),
  }
}

export {
  useIdentificationRequirements,
  useInvite,
  useMe,
  useDepartments,
  useHiringCatalog,
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
  useHiringFrustrations,
  useHiringTools,
  useIndustries,
  useOnboardingIndustries,
  useOnboardingStatus,
  useRoles,
  useSurveyOptions,
  useTeamSizes,
}
