const ENDPOINTS = {
  waitlist: {
    join: () => '/waitlist',
    onboarding: () => '/waitlist/onboarding',
  },
  countries: () => '/countries',
  industries: () => '/industries',
  hiringTools: () => '/hiring-tools',
  hiringFrustrations: () => '/hiring-frustrations',
  roles: () => '/roles',
  teamSizes: () => '/team-sizes',
  auth: {
    signup: () => '/auth/signup',
    login: () => '/auth/login',
    refresh: () => '/auth/refresh',
    verifyEmail: () => '/auth/verify-email',
    resendVerification: () => '/auth/resend-verification',
  },
  onboarding: {
    profile: () => '/onboarding/profile',
    address: () => '/onboarding/address',
    addressVerify: () => '/onboarding/address/verify',
    business: () => '/onboarding/business',
    complete: () => '/onboarding/complete',
    status: () => '/onboarding/status',
    businessTypes: () => '/onboarding/business-types',
    companyRoles: () => '/onboarding/company-roles',
    industries: () => '/onboarding/industries',
  },
}

export { ENDPOINTS }
