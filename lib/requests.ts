import { axiosInstance } from '@/config/axios'

import { ENDPOINTS } from './endpoints'

import type {
  ApiResponse,
  AuthLoginPayload,
  AuthRefreshData,
  AuthRefreshPayload,
  AuthResendVerificationPayload,
  AuthSignupData,
  AuthSignupPatchPayload,
  AuthSignupPayload,
  AuthTokenData,
  AuthVerifyEmailPayload,
  BusinessType,
  CompanyRole,
  Country,
  HiringFrustration,
  HiringTool,
  Industry,
  OnboardingIndustry,
  OnboardingPayload,
  OnboardingResponse,
  ProductAddressData,
  ProductAddressPayload,
  ProductBusinessData,
  ProductBusinessPayload,
  ProductOnboardingCompleteData,
  ProductOnboardingStatusData,
  ProductProfileData,
  ProductProfilePayload,
  Role,
  TeamSize,
  WaitlistPayload,
  WaitlistResponse,
} from './types'

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

  login: async (payload: AuthLoginPayload): Promise<AuthTokenData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthTokenData>>(
      ENDPOINTS.auth.login(),
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
