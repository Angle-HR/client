import { axiosInstance } from '@/config/axios'

import { ENDPOINTS } from './endpoints'

import type {
  ApiResponse,
  Country,
  HiringFrustration,
  HiringTool,
  Industry,
  OnboardingPayload,
  OnboardingResponse,
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
}

export { requests }
