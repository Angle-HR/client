const queryKeys = {
  countries: ['countries'] as const,
  companyRoles: ['onboarding', 'company-roles'] as const,
  businessTypes: ['onboarding', 'business-types'] as const,
  onboardingIndustries: ['onboarding', 'industries'] as const,
  onboardingStatus: ['onboarding', 'status'] as const,
  me: ['auth', 'me'] as const,
  /** Every cached list of jobs, whatever its query: the key to invalidate after a change. */
  jobs: ['jobs', 'list'] as const,
  jobList: (query: object) => ['jobs', 'list', query] as const,
  /** Under the list's key, so whatever reloads the lists reloads the counts. */
  jobCounts: ['jobs', 'list', 'counts'] as const,
  job: (id: string) => ['jobs', 'one', id] as const,
  applicationForm: (id: string) => ['jobs', 'one', id, 'application-form'] as const,
  /** Every cached page of a job's applications: the key to invalidate after a change. */
  applications: (jobId: string) => ['jobs', 'one', jobId, 'applications'] as const,
  applicationList: (jobId: string, query: object) =>
    ['jobs', 'one', jobId, 'applications', 'list', query] as const,
  application: (jobId: string, appId: string) =>
    ['jobs', 'one', jobId, 'applications', 'one', appId] as const,
  compliance: (id: string) => ['jobs', 'one', id, 'compliance'] as const,
  screeningRules: (id: string) => ['jobs', 'one', id, 'screening-rules'] as const,
  shareKit: (id: string) => ['jobs', 'one', id, 'share-kit'] as const,
  companySetup: ['organization', 'setup'] as const,
  kyb: ['organization', 'verification'] as const,
  hiringSettings: ['hiring', 'settings'] as const,
  applicantSettings: ['hiring', 'applicant-settings'] as const,
  jobMembers: (id: string) => ['jobs', 'one', id, 'members'] as const,
  publishCheck: (id: string) => ['jobs', 'one', id, 'publish-check'] as const,
  people: ['hiring', 'people'] as const,
  hiringCatalog: ['hiring', 'catalog'] as const,
  departments: ['hiring', 'departments'] as const,
  timezones: ['hiring', 'timezones'] as const,
  skills: ['hiring', 'skills'] as const,
  jobTemplates: ['jobs', 'templates'] as const,
  hiringMe: ['hiring', 'me'] as const,
  invite: (token: string) => ['auth', 'invite', token] as const,
  /** The public careers page of one company, by slug. */
  careersPage: (slug: string) => ['careers', slug] as const,
  publicJob: (slug: string, jobId: string) => ['careers', slug, 'jobs', jobId] as const,
  identificationRequirements: (countryId: string) =>
    ['onboarding', 'identification-requirements', countryId] as const,
}

export { queryKeys }
