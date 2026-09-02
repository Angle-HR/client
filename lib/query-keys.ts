const queryKeys = {
  countries: ['countries'] as const,
  industries: ['industries'] as const,
  hiringTools: ['hiring-tools'] as const,
  hiringFrustrations: ['hiring-frustrations'] as const,
  roles: ['roles'] as const,
  teamSizes: ['team-sizes'] as const,
  companyRoles: ['onboarding', 'company-roles'] as const,
  businessTypes: ['onboarding', 'business-types'] as const,
  onboardingIndustries: ['onboarding', 'industries'] as const,
  onboardingStatus: ['onboarding', 'status'] as const,
  me: ['auth', 'me'] as const,
  invite: (token: string) => ['auth', 'invite', token] as const,
  identificationRequirements: (countryId: string) =>
    ['onboarding', 'identification-requirements', countryId] as const,
}

export { queryKeys }
