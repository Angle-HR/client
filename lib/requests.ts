import { axiosInstance } from '@/config/axios'

import { ENDPOINTS } from './endpoints'

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
