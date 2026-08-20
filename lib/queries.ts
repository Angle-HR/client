'use client'

import { useQuery } from '@tanstack/react-query'

import { queryKeys } from './query-keys'
import { requests } from './requests'

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
